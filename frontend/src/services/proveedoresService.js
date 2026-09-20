import axios from 'axios';

// @Abner: mismo patron de siempre. Jonas dejo el backend en el puerto 5000.
// @Javi: la tabla PROVEEDORES tiene NombreProveedor, NIT y Telefono,
// no tiene relacion con nada mas asi que va sencillo.
const API_URL = 'http://localhost:5000/api/proveedores';

// Trae todos los proveedores para la tabla
export const getProveedores = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Manda el proveedor nuevo al backend
export const createProveedor = async (proveedorData) => {
    const response = await axios.post(API_URL, proveedorData);
    return response.data;
};
