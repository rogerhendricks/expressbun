import axios from 'axios';

const API_URL = '/api/devices';

export const getAllDevices = async () => {
  const response = await axios.get(`${API_URL}/all`);
  return response.data;
};

export const getDeviceById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createDevice = async (deviceData) => {
  const response = await axios.post(API_URL, deviceData);
  return response.data;
};

export const updateDevice = async (id, deviceData) => {
  const response = await axios.patch(`${API_URL}/${id}`, deviceData);
  return response.data;
};

export const deleteDevice = async (id) => {
  // Note: Your deviceController.js deleteDevice uses req.query.id, 
  // but deviceRoutes.js defines DELETE /:id. 
  // This service assumes the route definition (/:id).
  // If your backend expects /api/devices?id=xyz, you'll need to adjust this.
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};