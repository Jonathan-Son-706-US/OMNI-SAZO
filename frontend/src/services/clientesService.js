import axios from 'axios';

// @Abner: mismo patron que uso Ambrocio en usuariosService, cambiando
// nomas la ruta. Jonas dejo el backend en el puerto 5000.
// @Javi: la tabla CLIENTES del script solo tiene IdCliente, Nombre,
// NIT y EsEmpresa, asi que estos 2 endpoints no deberian llevar mucha ciencia.
const API_URL = 'http://localhost:5000/api/clientes';

// Trae todos los clientes para la tabla
export const getClientes = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Manda el cliente nuevo al backend
// @Abner: yo solo mando la info, si truena algo ya es cosa del back XD
export const createCliente = async (clienteData) => {
    const response = await axios.post(API_URL, clienteData);
    return response.data;
};
