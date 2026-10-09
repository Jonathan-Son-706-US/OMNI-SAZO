import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cotizaciones';

export const getCotizaciones = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const createCotizacion = async (cotizacionData) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, cotizacionData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: obtener el detalle completo de una cotizacion
export const getCotizacionDetalle = async (idCotizacion) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${idCotizacion}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: confirmar una cotizacion
export const confirmarCotizacion = async (idCotizacion) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/${idCotizacion}/confirmar`, {}, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};