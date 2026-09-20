import React, { useState, useEffect } from 'react';
// Jalamos las funciones del service que se comunican con la API
import { getClientes, createCliente } from '../services/clientesService';
// Importamos la estructura visual del form que dejamos en components
import ClienteForm from '../components/ClienteForm';
import '../components/estilos/TablasCrud.css';

// @Abner haciendo lo de clientes, mismo patron que usuarios
// Aca si se hacen peticiones
const ClientesPage = () => {
    // Estados para guardar lo que viene del backend
    const [clientes, setClientes] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);

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

    // Esta funcion la pasamos como prop al ClienteForm
    const handleGuardarCliente = async (datosCliente) => {
        try {
            await createCliente(datosCliente);
            alert("¡Cliente guardado!");
            setMostrarForm(false);
            cargarDatos(); // Refrescamos la tabla
        } catch (error) {
            console.error("Error al guardar", error);
            alert("Hubo un problemilla al guardar");
        }
    };

    return (
        <div className="dashboard-content">
            <h2>Administración de Clientes</h2>
            <button onClick={() => setMostrarForm(!mostrarForm)}>
                {mostrarForm ? 'Ocultar Formulario' : 'Agregar Nuevo Cliente'}
            </button>

            {/* Renderizamos el form y le pasamos la funcion de guardado */}
            {mostrarForm && <ClienteForm onSubmit={handleGuardarCliente} />}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>NIT</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.length > 0 ? (
                        clientes.map(c => (
                            <tr key={c.IdCliente}>
                                <td>{c.IdCliente}</td>
                                <td>{c.Nombre}</td>
                                <td>{c.NIT}</td>
                                <td>{c.EsEmpresa ? 'Empresa' : 'Persona individual'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4">No hay clientes registrados</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ClientesPage;
