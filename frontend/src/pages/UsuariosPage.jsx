import React, { useState, useEffect } from 'react';
// Jalamos las funciones del service que se comunican con la API
import { getUsuarios, createUsuario, getRoles } from '../services/usuariosService';
// Importamos la estructura visual del form que dejamos en components
import UsuarioForm from '../components/UsuarioForm';
import '../components/estilos/TablasCrud.css';

// @Ambrocio haciendo lo de usuarios 
// Aca si se hacen peticiones
const UsuariosPage = () => {
    // Estados para guardar lo que viene del backend
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);

    // Traer los datos al puerto 5000
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const users = await getUsuarios();
            const rolesData = await getRoles();
            setUsuarios(users || []);
            setRoles(rolesData || []);
        } catch (error) {
            console.error("No se pudo conectar al backend ", error);
        }
    };

    // Esta funcion la pasamos como prop al UsuarioForm
    const handleGuardarUsuario = async (datosUsuario) => {
        try {
            await createUsuario(datosUsuario);
            alert("¡Usuario creado nítido!");
            setMostrarForm(false);
            cargarDatos(); // Refrescamos la tabla 
        } catch (error) {
            console.error("Error al guardar", error);
            alert("Hubo un problemilla al guardar");
        }
    };

    return (
        <div className="dashboard-content">
            <h2>Administración de Usuarios y Roles</h2>
            <button onClick={() => setMostrarForm(!mostrarForm)}>
                {mostrarForm ? 'Ocultar Formulario' : 'Agregar Nuevo Usuario'}
            </button>

            {/* Renderizamos el form y le pasamos los datos y la guardamos */}
            {mostrarForm && <UsuarioForm onSubmit={handleGuardarUsuario} roles={roles} />}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Usuario</th>
                        <th>ID Rol</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.length > 0 ? (
                        usuarios.map(u => (
                            <tr key={u.IdUsuario}>
                                <td>{u.IdUsuario}</td>
                                <td>{u.NombreUsuario}</td>
                                <td>{u.IdRol}</td>
                                <td>{u.Estado ? 'Activo' : 'Inactivo'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4">No hay nadie registrado</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UsuariosPage;