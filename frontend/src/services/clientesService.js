import axios from 'axios';

const API_URL = 'http://localhost:5000/api/clientes';

export const getClientes = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const createCliente = async (clienteData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, clienteData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const updateCliente = async (id, clienteData) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/${id}`, clienteData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const deleteCliente = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};