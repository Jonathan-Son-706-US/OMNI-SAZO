import axios from 'axios';

const API_URL = 'http://localhost:5000/api/productos';

export const getProductos = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createProducto = async (productoData) => {
  const response = await axios.post(API_URL, productoData);
  return response.data;
};

export const updateProducto = async (id, productoData) => {
  const response = await axios.put(`${API_URL}/${id}`, productoData);
  return response.data;
};

export const deleteProducto = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};