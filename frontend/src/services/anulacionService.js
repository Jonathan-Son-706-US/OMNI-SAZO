import axios from 'axios';

const API_URL = 'http://localhost:5000/api/anulaciones';

export const getFacturaParaAnulacion = async (idFactura) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/${idFactura}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const anularFactura = async (idFactura, motivo) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    API_URL,
    { idFactura, motivo },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
