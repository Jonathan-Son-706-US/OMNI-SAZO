import axios from 'axios';

const API_URL = 'http://localhost:5000/api/usuarios';
const ROLES_URL = 'http://localhost:5000/api/roles'; 

export const getUsuarios = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

export const createUsuario = async (usuarioData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, usuarioData, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

export const getRoles = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(ROLES_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

export const deleteUsuario = async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};

export const updateUsuario = async (id, usuarioData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${id}`, usuarioData, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};