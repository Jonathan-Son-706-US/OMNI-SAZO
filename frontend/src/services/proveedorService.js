import axios from 'axios';

const API_URL = 'http://localhost:5000/api/proveedores';

const getProveedores = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const createProveedor = async (proveedorData) => {
  const response = await axios.post(API_URL, proveedorData);
  return response.data;
};

const updateProveedor = async (id, proveedorData) => {
  const response = await axios.put(`${API_URL}/${id}`, proveedorData);
  return response.data;
};

const deleteProveedor = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Exportación explícita al final para evitar fallos de caché en Vite
export {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor
};