import axios from 'axios';

const API_URL = '/api/leads';

export const getAllLeads = async () => {
  const response = await axios.get(`${API_URL}/all`);
  return response.data;
};

export const getLeadById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createLead = async (leadData) => {
  const response = await axios.post(API_URL, leadData);
  return response.data;
};

export const updateLead = async (id, leadData) => {
  const response = await axios.patch(`${API_URL}/${id}`, leadData);
  return response.data;
};

export const deleteLead = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};