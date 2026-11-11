import axios from 'axios';

const API_URL = '/api/reportes';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getReporteKPIs = async (fechaInicio, fechaFin) => {
  const params = {};
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;

  const response = await axios.get(`${API_URL}/kpis`, { ...getHeaders(), params });
  return response.data;
};

export const getReporteMediosPago = async (fechaInicio, fechaFin) => {
  const params = {};
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;

  const response = await axios.get(`${API_URL}/medios-pago`, { ...getHeaders(), params });
  return response.data;
};

export const getReporteRotacionProductos = async (fechaInicio, fechaFin) => {
  const params = {};
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;

  const response = await axios.get(`${API_URL}/rotacion-productos`, { ...getHeaders(), params });
  return response.data;
};

export const getReporteStockCritico = async () => {
  const response = await axios.get(`${API_URL}/stock-critico`, getHeaders());
  return response.data;
};

export const getReporteVentasCajeros = async (fechaInicio, fechaFin) => {
  const params = {};
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;

  const response = await axios.get(`${API_URL}/ventas-cajeros`, { ...getHeaders(), params });
  return response.data;
};
