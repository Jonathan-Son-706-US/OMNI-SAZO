import axios from 'axios';

const API_URL = 'http://localhost:5000/api/compras';

const authHeaders = () => ({
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

export const getOrdenesCompra = async () => {
  const response = await axios.get(`${API_URL}/ordenes`, authHeaders());
  return response.data;
};

export const getOrdenesPendientes = async () => {
  const response = await axios.get(`${API_URL}/ordenes/pendientes`, authHeaders());
  return response.data;
};

export const getOrdenCompraDetalle = async (id) => {
  const response = await axios.get(`${API_URL}/ordenes/${id}`, authHeaders());
  return response.data;
};

export const getRecepcionOrden = async (id) => {
  const response = await axios.get(`${API_URL}/ordenes/${id}/recepcion`, authHeaders());
  return response.data;
};

export const crearOrdenCompra = async (ordenData) => {
  const response = await axios.post(`${API_URL}/ordenes`, ordenData, authHeaders());
  return response.data;
};

export const actualizarOrdenCompra = async (id, ordenData) => {
  const response = await axios.put(`${API_URL}/ordenes/${id}`, ordenData, authHeaders());
  return response.data;
};

export const registrarRecepcion = async (recepcionData) => {
  const response = await axios.post(`${API_URL}/recepciones`, recepcionData, authHeaders());
  return response.data;
};
