import axios from 'axios';

const API_URL = 'http://localhost:5000/api/catalogos';

export const getMarcas = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/marcas`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.data;
};

export const getCategorias = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/categorias`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.data;
};

export const getPresentaciones = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/presentaciones`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.data;
};

export const getBodegas = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/bodegas`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.data;
};

export const getUbicaciones = async (idBodega = null) => {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_URL}/ubicaciones`, {
    headers: { 'Authorization': `Bearer ${token}` },
    params: idBodega ? { idBodega } : {}
  });
  return res.data;
};