const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  ownerId: { type: String, index: true },
  garageId: { type: String, index: true },
  ownerName: { type: String, default: 'Driver' },
  imageUrl: { type: String, default: '' },
  imagePath: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    },
  },
});

module.exports = mongoose.model('Car', carSchema);
