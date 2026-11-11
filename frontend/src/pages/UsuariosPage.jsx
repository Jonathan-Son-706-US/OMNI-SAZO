import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UsuarioForm from '../components/UsuarioForm';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/usuariosService';
import { useModal } from '../context/ModalContext';
import '../components/estilos/TablasCrud.css';

// Modulo de administracion de usuarios
const UsuariosPage = () => {
    const { mostrarExito, mostrarError, mostrarConfirmacion } = useModal();
    const [mostrarForm, setMostrarForm] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [usuarioAEditar, setUsuarioAEditar] = useState(null);
    const [cargando, setCargando] = useState(true);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');

            const [usuariosData, rolesRes] = await Promise.all([
                getUsuarios(),
                axios.get('/api/catalogos/roles', {
                    headers: { 'Authorization': `Bearer ${token}` } 
                })
            ]);
            setUsuarios(usuariosData || []);
            setRoles(rolesRes.data || []);
        } catch (error) {
            console.error('Error al cargar datos de usuarios:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleGuardarOActualizar = async (payload, idUsuario) => {
        try {
            if (idUsuario) {
                await updateUsuario(idUsuario, payload);
                mostrarExito({
                    titulo: 'Usuario Actualizado',
                    mensaje: 'Los datos del usuario se actualizaron exitosamente.',
                    botonTexto: 'Aceptar'
                });
            } else {
                await createUsuario(payload);
                mostrarExito({
                    titulo: 'Usuario Registrado',
                    mensaje: 'El usuario fue registrado exitosamente en el sistema.',
                    botonTexto: 'Aceptar'
                });
            }
            setUsuarioAEditar(null);
            setMostrarForm(false);
            cargarDatos();
        } catch (error) {
            console.error('Error al procesar el usuario:', error);
            mostrarError({
                titulo: 'Error al Guardar',
                mensaje: 'Ocurrio un problema al guardar la informacion del usuario.'
            });
        }
    };

    const handleEditar = (usr) => {
        setUsuarioAEditar(usr);
        setMostrarForm(true);
    };

    const handleEliminar = (usr) => {
        mostrarConfirmacion({
            titulo: 'Eliminar Usuario',
            mensaje: `¿Estas seguro de eliminar al usuario "${usr.NombreUsuario}"?`,
            botonTexto: 'Si, Eliminar',
            botonSecundarioTexto: 'Cancelar',
            onConfirmar: async () => {
                try {
                    await deleteUsuario(usr.IdUsuario);
                    cargarDatos();
                    mostrarExito({
                        titulo: 'Usuario Eliminado',
                        mensaje: 'El usuario fue eliminado correctamente.',
                        botonTexto: 'Entendido'
                    });
                } catch (error) {
                    console.error('Error al eliminar usuario:', error);
                    mostrarError({
                        titulo: 'Error al Eliminar',
                        mensaje: 'No se pudo eliminar el usuario.'
                    });
                }
            }
        });
    };

    return (
        <div className="page-container">
            <h2>Modulo de Administracion de Usuarios</h2>
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
                                            <button onClick={() => handleEliminar(usr)} className="btn-delete">
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
