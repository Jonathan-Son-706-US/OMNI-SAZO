import axios from 'axios';

const API_URL = 'http://localhost:5000/api/catalogos';

export const getMarcas = async () => {
  const res = await axios.get(`${API_URL}/marcas`);
  return res.data;
};

export const getCategorias = async () => {
  const res = await axios.get(`${API_URL}/categorias`);
  return res.data;
};

export const getPresentaciones = async () => {
  const res = await axios.get(`${API_URL}/presentaciones`);
  return res.data;
};