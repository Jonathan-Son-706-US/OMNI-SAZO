import React, { useState, useEffect } from 'react';
import { getProveedores, createProveedor } from '../services/proveedoresService';
import ProveedorForm from '../components/ProveedorForm';
import '../components/estilos/TablasCrud.css';

// @Abner haciendo lo de proveedores, mismo patron que usuarios y clientes
const ProveedoresPage = () => {
    const [proveedores, setProveedores] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const data = await getProveedores();
            setProveedores(data || []);
        } catch (error) {
            console.error("No se pudo conectar al backend ", error);
        }
    };

    const handleGuardarProveedor = async (datosProveedor) => {
        try {
            await createProveedor(datosProveedor);
            alert("¡Proveedor guardado!");
            setMostrarForm(false);
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar", error);
            alert("Hubo un problemilla al guardar");
        }
    };

    return (
        <div className="dashboard-content">
            <h2>Administración de Proveedores</h2>
            <button onClick={() => setMostrarForm(!mostrarForm)}>
                {mostrarForm ? 'Ocultar Formulario' : 'Agregar Nuevo Proveedor'}
            </button>

            {mostrarForm && <ProveedorForm onSubmit={handleGuardarProveedor} />}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Proveedor</th>
                        <th>NIT</th>
                        <th>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    {proveedores.length > 0 ? (
                        proveedores.map(p => (
                            <tr key={p.IdProveedor}>
                                <td>{p.IdProveedor}</td>
                                <td>{p.NombreProveedor}</td>
                                <td>{p.NIT}</td>
                                <td>{p.Telefono}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4">No hay proveedores registrados</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProveedoresPage;
