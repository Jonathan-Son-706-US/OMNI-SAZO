import axios from 'axios';

const API_URL = 'http://localhost:5000/api/clientes';

export const getClientes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createCliente = async (clienteData) => {
  const response = await axios.post(API_URL, clienteData);
  return response.data;
};

export const updateCliente = async (id, clienteData) => {
  const response = await axios.put(`${API_URL}/${id}`, clienteData);
  return response.data;
};

export const deleteCliente = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};