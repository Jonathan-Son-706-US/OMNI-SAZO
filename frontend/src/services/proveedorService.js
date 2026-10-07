import axios from 'axios';

const API_URL = 'http://localhost:5000/api/proveedores';

export const getProveedores = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const createProveedor = async (proveedorData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, proveedorData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const updateProveedor = async (id, proveedorData) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/${id}`, proveedorData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const deleteProveedor = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};