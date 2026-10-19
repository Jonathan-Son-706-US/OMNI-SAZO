import axios from 'axios';

const API_URL = 'http://localhost:5000/api/facturas';

// @Javi: procesar una factura transaccional (PEPS)
export const crearFactura = async (data) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @Javi: stock disponible por producto (para el carrito)
export const getStockDisponible = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/stock-disponible`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};
