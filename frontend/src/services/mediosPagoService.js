import axios from 'axios';

const API_URL = 'http://localhost:5000/api/medios-pago';

// @abner: obtener la lista de medios de pago
export const getMediosPago = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: crear un medio de pago nuevo
export const createMedioPago = async (data) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(API_URL, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: actualizar un medio de pago
export const updateMedioPago = async (id, data) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: eliminar un medio de pago
export const deleteMedioPago = async (id) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: registrar pagos en una factura
export const registrarPagosFactura = async (data) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/pagos`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: obtener los pagos de una factura
export const getPagosFactura = async (idFactura) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/pagos/${idFactura}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: obtener factura completa para imprimirla
export const getFacturaImpresion = async (idFactura) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/factura/${idFactura}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: obtener el listado de facturas
export const getFacturas = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/facturas/listado`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// @abner: crear la factura junto con sus pagos
export const crearFacturaCompleta = async (data) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/facturas/crear`, data, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};
