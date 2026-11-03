import React, { useState, useEffect } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/clientesService';
import ClienteForm from '../components/ClienteForm';
import { useModal } from '../context/ModalContext';
import '../components/estilos/TablasCrud.css';

// @Abner: modulo de clientes
const ClientesPage = () => {
    const { mostrarExito, mostrarError, mostrarConfirmacion } = useModal();
    const [clientes, setClientes] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [clienteAEditar, setClienteAEditar] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await getClientes();
            setClientes(data || []);
        } catch (error) {
            console.error("No se pudo conectar al backend ", error);
        }
    };

    // maneja tanto crear como actualizar
    const handleGuardarCliente = async (datosCliente, idCliente) => {
        try {
            if (idCliente) {
                await updateCliente(idCliente, datosCliente);
                mostrarExito({
                    titulo: 'Cliente Actualizado',
                    mensaje: 'Los datos del cliente se actualizaron correctamente.',
                    botonTexto: 'Aceptar'
                });
            } else {
                await createCliente(datosCliente);
                mostrarExito({
                    titulo: 'Cliente Registrado',
                    mensaje: 'El cliente fue guardado exitosamente en el sistema.',
                    botonTexto: 'Aceptar'
                });
            }
            setClienteAEditar(null);
            setMostrarForm(false);
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar/actualizar", error);
            mostrarError({
                titulo: 'Error al Guardar',
                mensaje: 'Hubo un problema al guardar la informacion del cliente.'
            });
        }
    };

    const handleEditarCliente = (cliente) => {
        setClienteAEditar(cliente);
        setMostrarForm(true);
    };

    const handleEliminarCliente = (cliente) => {
        mostrarConfirmacion({
            titulo: 'Eliminar Cliente',
            mensaje: `¿Seguro que deseas eliminar al cliente "${cliente.Nombre}"?`,
            botonTexto: 'Si, Eliminar',
            botonSecundarioTexto: 'Cancelar',
            onConfirmar: async () => {
                try {
                    await deleteCliente(cliente.IdCliente);
                    cargarDatos();
                    mostrarExito({
                        titulo: 'Cliente Eliminado',
                        mensaje: 'El cliente fue eliminado correctamente.',
                        botonTexto: 'Entendido'
                    });
                } catch (error) {
                    console.error("Error al eliminar cliente:", error);
                    mostrarError({
                        titulo: 'Error al Eliminar',
                        mensaje: 'No se pudo eliminar el cliente.'
                    });
                }
            }
        });
    };

    return (
        <div className="dashboard-content">
            <h2>Administracion de Clientes</h2>
            <button onClick={() => { setClienteAEditar(null); setMostrarForm(!mostrarForm); }}>
                {mostrarForm && !clienteAEditar ? 'Ocultar Formulario' : 'Agregar Nuevo Cliente'}
            </button>

            {mostrarForm && (
                <ClienteForm 
                    onSubmit={handleGuardarCliente} 
                    clienteAEditar={clienteAEditar}
                    onCancelar={() => {
                        setClienteAEditar(null);
                        setMostrarForm(false);
                    }}
                />
            )}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>NIT</th>
                        <th>Tipo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.length > 0 ? (
                        clientes.map(c => (
                            <tr key={c.IdCliente}>
                                <td>{c.IdCliente}</td>
                                <td>{c.Nombre}</td>
                                <td>{c.NIT || c.Nit || 'CF'}</td>
                                <td>{c.EsEmpresa ? 'Empresa' : 'Persona individual'}</td>
                                <td>
                                    <button 
                                        onClick={() => handleEditarCliente(c)}
                                        style={{ 
                                            backgroundColor: '#ffc107', 
                                            color: '#000', 
                                            border: 'none', 
                                            padding: '5px 10px', 
                                            borderRadius: '4px', 
                                            cursor: 'pointer',
                                            marginRight: '8px'
                                        }}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleEliminarCliente(c)}
                                        style={{ 
                                            backgroundColor: '#dc3545', 
                                            color: '#fff', 
                                            border: 'none', 
                                            padding: '5px 10px', 
                                            borderRadius: '4px', 
                                            cursor: 'pointer' 
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5">No hay clientes registrados</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ClientesPage;
