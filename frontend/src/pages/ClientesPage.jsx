import React, { useState, useEffect } from 'react';
// Jalamos las funciones del service que se comunican con la API (agregamos updateCliente)
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/clientesService';
// Importamos la estructura visual del form que dejamos en components
import ClienteForm from '../components/ClienteForm';
import '../components/estilos/TablasCrud.css';

// @Abner haciendo lo de clientes, mismo patron que usuarios
// Aca si se hacen peticiones y soportamos edicion
const ClientesPage = () => {
    // Estados para guardar lo que viene del backend
    const [clientes, setClientes] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [clienteAEditar, setClienteAEditar] = useState(null);

    // Traer los datos al puerto 5000
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

    // Esta funcion maneja tanto CREAR como ACTUALIZAR
    const handleGuardarCliente = async (datosCliente, idCliente) => {
        try {
            if (idCliente) {
                await updateCliente(idCliente, datosCliente);
                alert("¡Cliente actualizado!");
            } else {
                await createCliente(datosCliente);
                alert("¡Cliente guardado!");
            }
            setClienteAEditar(null);
            setMostrarForm(false);
            cargarDatos(); // Refrescamos la tabla
        } catch (error) {
            console.error("Error al guardar/actualizar", error);
            alert("Hubo un problemilla al guardar la información");
        }
    };

    // Función para activar el modo edición
    const handleEditarCliente = (cliente) => {
        setClienteAEditar(cliente);
        setMostrarForm(true);
    };

    // Función para eliminar cliente
    const handleEliminarCliente = async (idCliente) => {
        if (window.confirm('¿Seguro que deseas eliminar este cliente?')) {
            try {
                await deleteCliente(idCliente);
                cargarDatos();
            } catch (error) {
                console.error("Error al eliminar cliente:", error);
                alert("No se pudo eliminar el cliente");
            }
        }
    };

    return (
        <div className="dashboard-content">
            <h2>Administración de Clientes</h2>
            <button onClick={() => { setClienteAEditar(null); setMostrarForm(!mostrarForm); }}>
                {mostrarForm && !clienteAEditar ? 'Ocultar Formulario' : 'Agregar Nuevo Cliente'}
            </button>

            {/* Renderizamos el form, le pasamos la funcion y el objeto a editar si aplica */}
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
                                        onClick={() => handleEliminarCliente(c.IdCliente)}
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