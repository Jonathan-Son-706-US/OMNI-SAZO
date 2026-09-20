import axios from 'axios';

// de aca en adelante soy yo @ambrocio
// jonas dejó el backend en el puerto 5000
const API_URL = 'http://localhost:5000/api/usuarios';
const ROLES_URL = 'http://localhost:5000/api/roles'; 

// Función para jalarse a todos los usuarios
export const getUsuarios = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Función para mandar el nuevo usuario al backend
// @Ambrocio: Yo solo mando la info, si explota algo es del backend XD
export const createUsuario = async (usuarioData) => {
    const response = await axios.post(API_URL, usuarioData);
    return response.data;
};

// Jalando los roles para llenar el select del form 
export const getRoles = async () => {
    const response = await axios.get(ROLES_URL);
    return response.data;
};