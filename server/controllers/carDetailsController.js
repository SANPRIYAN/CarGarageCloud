const CarDetails = require('../models/CarDetails');

// GET /api/cars/:carId/details
exports.getCarDetails = async (req, res) => {
  try {
    const { carId } = req.params;
    const details = await CarDetails.findOne({ carId });

    if (!details) {
      return res.status(404).json({ message: 'No details found for this car.' });
    }
    res.status(200).json(details);
  } catch (err) {
    console.error('Error fetching car details:', err.message);
    res.status(500).json({ message: 'Server error fetching car details.' });
  }
};

// POST /api/cars/:carId/details
exports.createCarDetails = async (req, res) => {
  try {
    const { carId } = req.params;

    const existing = await CarDetails.findOne({ carId });
    if (existing) {
      return res.status(400).json({ message: 'Car details already exist for this car.' });
    }

    const newDetails = new CarDetails({
      ...req.body,
      carId,
    });

    await newDetails.save();
    res.status(201).json(newDetails);
  } catch (err) {
    console.error('Error creating car details:', err.message);
    res.status(500).json({ message: 'Server error creating car details.' });
  }
};

// PUT /api/cars/:carId/details
exports.updateCarDetails = async (req, res) => {
  try {
    const { carId } = req.params;

    const updated = await CarDetails.findOneAndUpdate(
      { carId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'No details found for this car.' });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating car details:', err.message);
    res.status(500).json({ message: 'Server error updating car details.' });
  }
};

// DELETE /api/cars/:carId/details
exports.deleteCarDetails = async (req, res) => {
  try {
    const { carId } = req.params;

    const deleted = await CarDetails.findOneAndDelete({ carId });

    if (!deleted) {
      return res.status(404).json({ message: 'No details found for this car.' });
    }

    res.status(200).json({ message: 'Car details deleted successfully.' });
  } catch (err) {
    console.error('Error deleting car details:', err.message);
    res.status(500).json({ message: 'Server error deleting car details.' });
  }
};


