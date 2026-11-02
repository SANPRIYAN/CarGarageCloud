/**
 * carService — MongoDB Atlas via Express REST API
 *
 * All operations hit the Express REST server (proxied via Vite at /api).
 * The response shape is kept standard so that hooks and components
 * can use it transparently without any Firebase dependencies.
 *
 * API endpoints (served by server/server.js):
 *   GET    /api/cars          → list all cars
 *   GET    /api/cars/:id      → get one car
 *   POST   /api/cars          → create a car
 *   PATCH  /api/cars/:id      → update a car
 *   DELETE /api/cars/:id      → delete a car
 */

import axios from 'axios';

const BASE = '/api/cars';

export const carService = {
  /** Fetch every car in the garage */
  async getAll() {
    try {
      const res = await axios.get(BASE);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: `Failed to fetch all cars: ${error.message}` };
    }
  },

  /** Fetch all cars belonging to a specific garage / owner */
  async getAllForGarage(garageId) {
    try {
      const res = await axios.get(BASE, { params: { garageId } });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: `Failed to fetch cars: ${error.message}` };
    }
  },

  /** Fetch a single car by its MongoDB _id */
  async getById(carId) {
    try {
      const res = await axios.get(`${BASE}/${carId}`);
      return { success: true, data: res.data };
    } catch (error) {
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }
      return { success: false, error: `Failed to fetch car: ${error.message}` };
    }
  },

  /** Create a new car document; returns the new car's _id as `data` */
  async create(carData) {
    try {
      const res = await axios.post(BASE, carData);
      // MongoDB returns the full document; expose _id as the ID
      const newId = res.data._id || res.data.id;
      return { success: true, data: newId };
    } catch (error) {
      return { success: false, error: `Failed to create car: ${error.message}` };
    }
  },

  /** Partially update a car document */
  async update(carId, updates) {
    try {
      await axios.patch(`${BASE}/${carId}`, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to update car: ${error.message}` };
    }
  },

  /** Delete a car document */
  async remove(carId) {
    try {
      await axios.delete(`${BASE}/${carId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to delete car: ${error.message}` };
    }
  },
};

export default carService;
