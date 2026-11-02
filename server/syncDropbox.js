const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Always load from car-garage-final/.env
const rootEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(rootEnvPath)) {
  require('dotenv').config({ path: rootEnvPath });
}
require('dotenv').config();

const Car = require('./models/Car');

function getDropboxToken() {
  if (process.env.VITE_DROPBOX_ACCESS_TOKEN) {
    return process.env.VITE_DROPBOX_ACCESS_TOKEN.trim();
  }
  if (fs.existsSync(rootEnvPath)) {
    const content = fs.readFileSync(rootEnvPath, 'utf8');
    const match = content.match(/VITE_DROPBOX_ACCESS_TOKEN=(.+)/);
    if (match) return match[1].trim();
  }
  return null;
}

function toDirectUrl(url) {
  return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
}

async function getSharedLink(token, filePath) {
  try {
    const res = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: filePath }),
    });

    if (res.ok) {
      const data = await res.json();
      return toDirectUrl(data.url);
    }

    const listRes = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: filePath, direct_only: true }),
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.links && listData.links.length > 0) {
        return toDirectUrl(listData.links[0].url);
      }
    }
  } catch (err) {
    console.error(`Error getting shared link for ${filePath}:`, err.message);
  }
  return null;
}

function parseCarFromPath(filePath) {
  const clean = filePath.replace(/^\/+/, '');
  const parts = clean.split('/');
  const filename = parts[parts.length - 1];

  let rawName = filename.replace(/\.[^/.]+$/, '').replace(/^\d+[-_]/, '');
  rawName = rawName.replace(/[-_]+/g, ' ').trim();

  let garageId = 'default_garage';
  let ownerId = 'default_owner';
  if (parts[0] === 'garages' && parts.length >= 4) {
    garageId = parts[1];
    ownerId = parts[1];
  }

  const words = rawName.split(/\s+/);
  let make = 'Vehicle';
  let model = 'Custom';

  if (/^bmw/i.test(rawName)) {
    make = 'BMW';
    model = rawName.replace(/^bmw\s*/i, '').toUpperCase() || 'M3 GTR';
  } else if (/nissan/i.test(rawName) || /skyline/i.test(rawName)) {
    make = 'Nissan';
    model = 'Skyline R34 GT-R';
  } else if (/bolide/i.test(rawName)) {
    make = 'Bugatti';
    model = 'Bolide';
  } else if (/rb20/i.test(rawName)) {
    make = 'Red Bull Racing';
    model = 'RB20';
  } else {
    make = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase() : 'Vehicle';
    model = words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'Standard';
  }

  return { make, model, garageId, ownerId };
}

async function sync() {
  const token = getDropboxToken();
  if (!token) {
    console.error('❌ Error: VITE_DROPBOX_ACCESS_TOKEN not found in .env');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI not found in server/.env');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB Atlas');

  console.log('🔍 Scanning Dropbox files...');
  const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: '', recursive: true }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ Dropbox API error (${res.status}): ${errorText}`);
    process.exit(1);
  }

  const data = await res.json();
  const imageFiles = (data.entries || []).filter(
    (e) => e['.tag'] === 'file' && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(e.name)
  );

  console.log(`📦 Found ${imageFiles.length} image file(s) in Dropbox`);

  let addedCount = 0;
  for (const file of imageFiles) {
    const existing = await Car.findOne({ imagePath: file.path_lower });
    if (existing) {
      console.log(`ℹ️ Already in database: ${existing.make} ${existing.model}`);
      continue;
    }

    const imageUrl = await getSharedLink(token, file.path_lower);
    if (!imageUrl) {
      console.warn(`⚠️ Could not generate shared link for: ${file.path_display}`);
      continue;
    }

    const { make, model, garageId, ownerId } = parseCarFromPath(file.path_display);
    const newCar = await Car.create({
      make,
      model,
      imageUrl,
      imagePath: file.path_lower,
      garageId,
      ownerId,
      ownerName: 'Dropbox Sync',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Synced into MongoDB: ${newCar.make} ${newCar.model}`);
    addedCount++;
  }

  console.log(`\n🎉 Sync complete! ${addedCount} new car(s) added to MongoDB.`);
  process.exit(0);
}

sync().catch((err) => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
