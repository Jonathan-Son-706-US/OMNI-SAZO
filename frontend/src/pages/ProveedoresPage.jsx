import React, { useState, useEffect } from 'react';
import ProveedorForm from '../components/ProveedorForm';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../services/proveedoresService';
import '../components/estilos/TablasCrud.css';

const ProveedoresPage = () => {
    const [mostrarForm, setMostrarForm] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [proveedorAEditar, setProveedorAEditar] = useState(null);
    const [cargando, setCargando] = useState(true);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const data = await getProveedores();
            setProveedores(data || []);
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleGuardarProveedor = async (datosProveedor, idProveedor) => {
        try {
            if (idProveedor) {
                await updateProveedor(idProveedor, datosProveedor);
                alert('¡Proveedor actualizado exitosamente!');
            } else {
                await createProveedor(datosProveedor);
                alert('¡Proveedor registrado exitosamente!');
            }
            setProveedorAEditar(null);
            setMostrarForm(false);
            cargarDatos();
        } catch (error) {
            console.error('Error al guardar/actualizar proveedor:', error);
            alert('Error al procesar la información del proveedor.');
        }
    };

    const handleEditarProveedor = (prov) => {
        setProveedorAEditar(prov);
        setMostrarForm(true);
    };

    const handleEliminarProveedor = async (idProveedor) => {
        if (window.confirm('¿Seguro que deseas eliminar este proveedor?')) {
            try {
                await deleteProveedor(idProveedor);
                cargarDatos();
            } catch (error) {
                console.error('Error al eliminar proveedor:', error);
                alert('No se pudo eliminar el proveedor.');
            }
        }
    };

    return (
        <div className="dashboard-content">
            <h2>Administración de Proveedores</h2>
            <button onClick={() => { setProveedorAEditar(null); setMostrarForm(!mostrarForm); }}>
                {mostrarForm && !proveedorAEditar ? 'Ocultar Formulario' : 'Agregar Nuevo Proveedor'}
            </button>

            {mostrarForm && (
                <ProveedorForm 
                    onSubmit={handleGuardarProveedor}
                    proveedorAEditar={proveedorAEditar}
                    onCancelar={() => {
                        setProveedorAEditar(null);
                        setMostrarForm(false);
                    }}
                />
            )}

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Proveedor</th>
                        <th>NIT</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                        <th>Correo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cargando ? (
                        <tr><td colSpan="7">Cargando proveedores desde la base de datos...</td></tr>
                    ) : proveedores.length > 0 ? (
                        proveedores.map(prov => (
                            <tr key={prov.IdProveedor}>
                                <td>{prov.IdProveedor}</td>
                                <td>{prov.NombreProveedor || prov.Nombre}</td>
                                <td>{prov.Nit || prov.NIT || 'CF'}</td>
                                <td>{prov.Telefono || '-'}</td>
                                <td>{prov.Direccion || '-'}</td>
                                <td>{prov.Correo || '-'}</td>
                                <td>
                                    <button 
                                        onClick={() => handleEditarProveedor(prov)}
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
                                        onClick={() => handleEliminarProveedor(prov.IdProveedor)}
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
                        <tr><td colSpan="7">No hay proveedores registrados.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProveedoresPage;