import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UsuarioForm from '../components/UsuarioForm';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/usuariosService';
import '../components/estilos/TablasCrud.css';

const UsuariosPage = () => {
    const [mostrarForm, setMostrarForm] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [usuarioAEditar, setUsuarioAEditar] = useState(null);
    const [cargando, setCargando] = useState(true);

    // Cargar la lista de usuarios y roles
    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [usuariosData, rolesRes] = await Promise.all([
                getUsuarios(),
                axios.get('http://localhost:5000/api/roles')
            ]);
            setUsuarios(usuariosData);
            setRoles(rolesRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Manejar Guardar (POST) o Actualizar (PUT)
    const handleGuardarOActualizar = async (payload, idUsuario) => {
        try {
            if (idUsuario) {
                await updateUsuario(idUsuario, payload);
                alert('¡Usuario actualizado exitosamente!');
            } else {
                await createUsuario(payload);
                alert('¡Usuario registrado exitosamente!');
            }
            setUsuarioAEditar(null);
            setMostrarForm(false);
            cargarDatos();
        } catch (error) {
            console.error('Error al procesar el usuario:', error);
            alert('Error en la operación.');
        }
    };

    const handleEditar = (usr) => {
        setUsuarioAEditar(usr);
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await deleteUsuario(id);
                alert('Usuario eliminado correctamente.');
                cargarDatos();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                alert('No se pudo eliminar el usuario.');
            }
        }
    };

    return (
        <div className="page-container">
            <h2>Módulo de Administración de Usuarios</h2>
            <button onClick={() => { setUsuarioAEditar(null); setMostrarForm(!mostrarForm); }}>
                {mostrarForm && !usuarioAEditar ? 'Ocultar Formulario' : 'Nuevo Usuario'}
            </button>

            {mostrarForm && (
                <UsuarioForm 
                    onSubmit={handleGuardarOActualizar}
                    roles={roles}
                    usuarioAEditar={usuarioAEditar}
                    onCancelar={() => {
                        setUsuarioAEditar(null);
                        setMostrarForm(false);
                    }}
                />
            )}

            <div className="table-container mt-4">
                {cargando ? (
                    <p>Cargando usuarios desde la base de datos...</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map(usr => (
                                    <tr key={usr.IdUsuario}>
                                        <td>{usr.IdUsuario}</td>
                                        <td>{usr.NombreUsuario}</td>
                                        <td>{usr.NombreRol || usr.IdRol}</td>
                                        <td>{usr.Estado ? 'Activo' : 'Inactivo'}</td>
                                        <td>
                                            <button onClick={() => handleEditar(usr)} className="btn-edit">
                                                Editar
                                            </button>
                                            <button onClick={() => handleEliminar(usr.IdUsuario)} className="btn-delete">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UsuariosPage;