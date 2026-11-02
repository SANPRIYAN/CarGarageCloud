require('dotenv').config();
const mongoose = require('mongoose');
const CarDetails = require('./models/CarDetails');

const sampleCarDetails = {
  carId: 'sample-car-id-123',
  manufacturer: 'Porsche',
  model: '911 GT3 RS',
  variant: 'Weissach Package',
  year: 2024,
  engine: '4.0L Naturally Aspirated Flat-6',
  transmission: '7-speed PDK Dual-Clutch',
  fuelType: 'Petrol',
  horsepower: 518,
  topSpeed: 296,
  mileage: 13.4,
  seating: 2,
  color: 'Ice Grey Metallic',
  awards: ['Best Driver Car 2023', 'Nürburgring Production Lap Record Holder'],
  safetyRating: '5 Star',
  achievements: {
    bestSellingYear: 2023,
    motorsport: ['GT3 Cup Champion', '24 Hours of Le Mans GT Class Winner'],
    popularFeatures: ['Active Aerodynamics', 'DRS Rear Wing', 'Carbon Ceramic Brakes'],
  },
  history: {
    launchYear: 1963,
    countryOfOrigin: 'Germany',
    famousUses: ['Motorsport racing iconic legend'],
    specialEditions: ['50th Anniversary Edition', 'Heritage Design Edition'],
    summary: 'The Porsche 911 GT3 RS represents the pinnacle of high-performance road-legal track engineering with pure atmospheric power.',
  },
  specifications: {
    dimensions: '4572mm x 1900mm x 1322mm',
    weight: 1450,
    fuelTankCapacity: 64,
    bootSpace: 132,
    groundClearance: 100,
  },
  galleryImages: [
    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1200&auto=format&fit=crop'
  ],
};

async function seedDB() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<user>')) {
      console.error('Please configure your MONGODB_URI in server/.env before running seed.');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas...');

    await CarDetails.deleteOne({ carId: sampleCarDetails.carId });
    const inserted = await CarDetails.create(sampleCarDetails);
    console.log('Successfully seeded sample CarDetails document:');
    console.log(inserted);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedDB();
