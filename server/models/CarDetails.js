const mongoose = require('mongoose');

const carDetailsSchema = new mongoose.Schema({
  carId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, index: true }, // Optional user ownership field

  manufacturer: String,
  model: String,
  variant: String,
  year: Number,
  engine: String,
  transmission: String,
  fuelType: String,
  horsepower: Number,
  topSpeed: Number,
  mileage: Number,
  seating: Number,
  color: String,
  awards: [String],
  safetyRating: String,
  achievements: {
    bestSellingYear: Number,
    motorsport: [String],
    popularFeatures: [String],
  },
  history: {
    launchYear: Number,
    countryOfOrigin: String,
    famousUses: [String],
    specialEditions: [String],
    summary: String,
  },
  specifications: {
    make: String,
    model: String,
    year: Number,
    variant: String,
    color: String,
    fuelType: String,
    transmission: String,
    engine: String,
    mileage: Number,
    dimensions: String,      // e.g. "4500mm x 1800mm x 1450mm"
    weight: Number,          // kg
    fuelTankCapacity: Number, // litres
    bootSpace: Number,       // litres
    groundClearance: Number, // mm
  },
  galleryImages: [String],

  // Extra profile fields for full vehicle dossier compatibility
  performance: {
    horsepower: Number,
    torque: Number,
    zeroToHundred: Number,
    topSpeed: Number,
    drivetrain: String,
  },
  ownership: {
    purchaseDate: Date,
    previousOwners: Number,
    currentMileage: Number,
  },
  story: {
    description: String,
    achievements: [String],
    modifications: [String],
  },
  maintenance: {
    lastServiceDate: Date,
    nextServiceDate: Date,
    notes: String,
  },
  timeline: [{
    date: Date,
    title: String,
    description: String,
  }],
}, {
  timestamps: true,
  collection: 'vehicleProfiles',
});

module.exports = mongoose.model('CarDetails', carDetailsSchema);

