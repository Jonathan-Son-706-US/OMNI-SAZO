import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const loginAPI = async (usuario, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    usuario: usuario,   
    password: password  
  });
  return response.data;
};