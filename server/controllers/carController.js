const fs = require('fs');
const path = require('path');
const Car = require('../models/Car');

// GET /api/cars
exports.getAllCars = async (req, res) => {
  try {
    const { garageId } = req.query;
    const filter = garageId ? { garageId } : {};
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.status(200).json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err.message);
    res.status(500).json({ message: 'Server error fetching cars.' });
  }
};

// GET /api/cars/:id
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }
    res.status(200).json(car);
  } catch (err) {
    console.error('Error fetching car:', err.message);
    res.status(500).json({ message: 'Server error fetching car.' });
  }
};

// POST /api/cars
exports.createCar = async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    console.error('Error creating car:', err.message);
    res.status(500).json({ message: 'Server error creating car.' });
  }
};

// PATCH /api/cars/:id
exports.updateCar = async (req, res) => {
  try {
    const updated = await Car.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Car not found.' });
    }
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating car:', err.message);
    res.status(500).json({ message: 'Server error updating car.' });
  }
};

// DELETE /api/cars/:id
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found.' });
    }

    // Delete associated image from Dropbox drive
    if (car.imagePath) {
      try {
        const rootEnvPath = path.resolve(__dirname, '../../.env');
        let token = process.env.VITE_DROPBOX_ACCESS_TOKEN;
        if (fs.existsSync(rootEnvPath)) {
          const c = fs.readFileSync(rootEnvPath, 'utf8');
          const m = c.match(/VITE_DROPBOX_ACCESS_TOKEN=(.+)/);
          if (m && m[1]) token = m[1].trim();
        }

        if (token) {
          const dropPath = car.imagePath.startsWith('/') ? car.imagePath : '/' + car.imagePath;
          const dropRes = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: dropPath }),
          });

          if (dropRes.ok) {
            console.log(`✅ Deleted Dropbox image: ${dropPath}`);
          } else {
            const errTxt = await dropRes.text();
            console.warn(`⚠️ Dropbox image delete notice: ${errTxt}`);
          }
        }
      } catch (dropErr) {
        console.error('Error during Dropbox image deletion:', dropErr.message);
      }
    }

    await Car.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Car and Dropbox image deleted successfully.' });
  } catch (err) {
    console.error('Error deleting car:', err.message);
    res.status(500).json({ message: 'Server error deleting car.' });
  }
};

// POST /api/cars/sync-dropbox
exports.syncDropboxCars = async (req, res) => {
  try {
    const rootEnvPath = path.resolve(__dirname, '../../.env');
    let token = process.env.VITE_DROPBOX_ACCESS_TOKEN;

    if (fs.existsSync(rootEnvPath)) {
      const c = fs.readFileSync(rootEnvPath, 'utf8');
      const m = c.match(/VITE_DROPBOX_ACCESS_TOKEN=(.+)/);
      if (m && m[1]) token = m[1].trim();
    }

    if (!token) {
      return res.status(400).json({
        message: 'Dropbox access token missing. Please set VITE_DROPBOX_ACCESS_TOKEN in car-garage-final/.env',
      });
    }

    const dropRes = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '', recursive: true }),
    });

    if (!dropRes.ok) {
      const errTxt = await dropRes.text();
      return res.status(dropRes.status).json({
        message: 'Dropbox API token error. Please verify the token in .env.',
        details: errTxt,
      });
    }

    const dropData = await dropRes.json();
    const imageFiles = (dropData.entries || []).filter(
      (e) => e['.tag'] === 'file' && /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(e.name)
    );

    let addedCount = 0;
    for (const file of imageFiles) {
      const existing = await Car.findOne({ imagePath: file.path_lower });
      if (existing) continue;

      let imageUrl = null;
      const linkRes = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: file.path_lower }),
      });

      if (linkRes.ok) {
        const linkData = await linkRes.json();
        imageUrl = linkData.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
      } else {
        const existingLinks = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: file.path_lower, direct_only: true }),
        });
        if (existingLinks.ok) {
          const elData = await existingLinks.json();
          if (elData.links && elData.links.length > 0) {
            imageUrl = elData.links[0].url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
          }
        }
      }

      if (imageUrl) {
        const clean = file.path_display.replace(/^\/+/, '');
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

        await Car.create({
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
        addedCount++;
      }
    }

    const allCars = await Car.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: addedCount, cars: allCars });
  } catch (err) {
    console.error('Error syncing Dropbox:', err);
    return res.status(500).json({ message: 'Error syncing Dropbox: ' + err.message });
  }
};
