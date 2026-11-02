import axios from 'axios';

const API_BASE = (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) || 
  import.meta.env.VITE_API_BASE_URL || 
  '/api';

export const fetchCarDetails = async (carId) => {
  const res = await axios.get(`${API_BASE}/cars/${carId}/details`);
  return res.data;
};

export const createCarDetails = async (carId, detailsData) => {
  const res = await axios.post(`${API_BASE}/cars/${carId}/details`, detailsData);
  return res.data;
};

export const updateCarDetails = async (carId, detailsData) => {
  const res = await axios.put(`${API_BASE}/cars/${carId}/details`, detailsData);
  return res.data;
};

export const deleteCarDetails = async (carId) => {
  const res = await axios.delete(`${API_BASE}/cars/${carId}/details`);
  return res.data;
};


