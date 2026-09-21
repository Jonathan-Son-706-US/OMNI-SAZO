import axios from 'axios';

// Jonas dejó el backend en el puerto 5000
const API_URL = 'http://localhost:5000/api/usuarios';
const ROLES_URL = 'http://localhost:5000/api/roles'; 

// Obtener todos los usuarios
export const getUsuarios = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Crear un nuevo usuario
export const createUsuario = async (usuarioData) => {
    const response = await axios.post(API_URL, usuarioData);
    return response.data;
};

// Obtener roles para llenar el select
export const getRoles = async () => {
    const response = await axios.get(ROLES_URL);
    return response.data;
};

// Desactivar usuario (usando API_URL correctamente)
export const deleteUsuario = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

// Actualizar usuarios
export const updateUsuario = async (id, usuarioData) => {
  const response = await axios.put(`${API_URL}/${id}`, usuarioData);
  return response.data;
};