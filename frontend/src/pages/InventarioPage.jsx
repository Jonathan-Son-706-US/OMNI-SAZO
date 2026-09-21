import React, { useState, useEffect } from 'react';
import ProductoForm from '../components/ProductoForm';
import { getProductos, createProducto, updateProducto } from '../services/productosService';
import '../components/estilos/TablasCrud.css';

const InventarioPage = () => {
    const [mostrarForm, setMostrarForm] = useState(false);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [productoAEditar, setProductoAEditar] = useState(null);

    // Función para obtener productos desde la API
    const cargarProductos = async () => {
        try {
            setCargando(true);
            const data = await getProductos();
            setProductos(data);
        } catch (error) {
            console.error('Error al cargar la lista de productos:', error);
        } finally {
            setCargando(false);
        }
    };

    // Cargar los productos al montar el componente
    useEffect(() => {
        cargarProductos();
    }, []);

    // Recibe el payload y el idProducto (si existe) desde ProductoForm
    const handleGuardarProducto = async (payload, idProducto = null) => {
        try {
            if (idProducto) {
                // Si viene un ID, actualiza el registro existente
                await updateProducto(idProducto, payload);
                alert('¡Producto actualizado exitosamente!');
            } else {
                // Si no viene un ID, crea un nuevo registro
                await createProducto(payload);
                alert('¡Producto guardado exitosamente en la base de datos!');
            }

            cargarProductos(); // Refresca la lista de productos
            setMostrarForm(false); // Oculta el formulario al finalizar
            setProductoAEditar(null); // Resetea el producto a editar
        } catch (error) {
            console.error('Error al procesar el producto:', error);
            alert('Ocurrió un error al guardar o actualizar el producto.');
        }
    };

    // Activa el modo edición al hacer clic en la tabla
    const handleEditar = (producto) => {
        setProductoAEditar(producto);
        setMostrarForm(true);
    };

    // Cancela la edición y oculta el formulario
    const handleCancelar = () => {
        setProductoAEditar(null);
        setMostrarForm(false);
    };

    // Controla la apertura del formulario para nuevo producto
    const handleToggleForm = () => {
        if (mostrarForm) {
            setMostrarForm(false);
            setProductoAEditar(null);
        } else {
            setProductoAEditar(null);
            setMostrarForm(true);
        }
    };

    return (
        <div className="page-container">
            <h2>Módulo de Ingreso de Datos (Productos)</h2>
            <button onClick={handleToggleForm}>
                {mostrarForm ? 'Ocultar Formulario' : 'Nuevo Producto'}
            </button>

            {mostrarForm && (
                <ProductoForm 
                    onSubmit={handleGuardarProducto} 
                    productoAEditar={productoAEditar}
                    onCancelar={handleCancelar}
                />
            )}

            <div className="table-container mt-4">
                {cargando ? (
                    <p>Cargando productos desde la base de datos...</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Producto</th>
                                <th>Marca</th>
                                <th>Categoría</th>
                                <th>Precio Venta</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center' }}>
                                        No hay productos registrados.
                                    </td>
                                </tr>
                            ) : (
                                productos.map(prod => (
                                    <tr key={prod.IdProducto}>
                                        <td>{prod.IdProducto}</td>
                                        <td>{prod.NombreProducto}</td>
                                        <td>{prod.Marca || prod.IdMarca}</td>
                                        <td>{prod.Categoria || prod.IdCategoria}</td>
                                        <td>Q{Number(prod.PrecioVentaBase || 0).toFixed(2)}</td>
                                        <td>
                                            <button 
                                                className="btn-editar" 
                                                onClick={() => handleEditar(prod)}
                                            >
                                                Editar
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

export default InventarioPage;