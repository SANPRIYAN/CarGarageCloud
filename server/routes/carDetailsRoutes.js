const express = require('express');
const router = express.Router();

const {
  getAllCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  syncDropboxCars,
} = require('../controllers/carController');

const {
  getCarDetails,
  createCarDetails,
  updateCarDetails,
  deleteCarDetails,
} = require('../controllers/carDetailsController');

// Main Car Collection CRUD (MongoDB Atlas)
router.get('/', getAllCars);
router.post('/', createCar);
router.post('/sync-dropbox', syncDropboxCars);
router.get('/:id', getCarById);
router.patch('/:id', updateCar);
router.delete('/:id', deleteCar);

// Extended Car Details (MongoDB Atlas)
router.get('/:carId/details', getCarDetails);
router.post('/:carId/details', createCarDetails);
router.put('/:carId/details', updateCarDetails);
router.delete('/:carId/details', deleteCarDetails);

module.exports = router;
