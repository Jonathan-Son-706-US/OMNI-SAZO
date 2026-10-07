import axios from 'axios';

const API_URL = 'http://localhost:5000/api/productos';

export const getProductos = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const createProducto = async (productoData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, productoData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const updateProducto = async (id, productoData) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/${id}`, productoData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const deleteProducto = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};