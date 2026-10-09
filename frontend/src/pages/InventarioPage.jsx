import React, { useState, useEffect } from 'react';
import ProductoForm from '../components/ProductoForm';
import { getProductos, createProducto, updateProducto } from '../services/productosService';
import '../components/estilos/TablasCrud.css';
import '../components/estilos/MediosPago.css';

const InventarioPage = () => {
    const [activeTab, setActiveTab] = useState('productos');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [productoAEditar, setProductoAEditar] = useState(null);

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

    useEffect(() => {
        cargarProductos();
    }, []);

    const handleGuardarProducto = async (payload, idProducto = null) => {
        try {
            if (idProducto) {
                await updateProducto(idProducto, payload);
                alert('Producto actualizado exitosamente!');
            } else {
                await createProducto(payload);
                alert('Producto guardado exitosamente en la base de datos!');
            }
            cargarProductos();
            setMostrarForm(false);
            setProductoAEditar(null);
        } catch (error) {
            console.error('Error al procesar el producto:', error);
            alert('Ocurrio un error al guardar o actualizar el producto.');
        }
    };

    const handleEditar = (producto) => {
        setProductoAEditar(producto);
        setMostrarForm(true);
    };

    const handleCancelar = () => {
        setProductoAEditar(null);
        setMostrarForm(false);
    };

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
            <h2 className="no-print">Modulo de Facturacion e Inventario</h2>
            <p style={{ color: 'var(--tinta-suave)', marginBottom: '1.5rem' }}>
              // @abner (nota para el dev): Acá se maneja PRODUCTOS, INVENTARIO_LOTES, y la emisión de FACTURAS.
            </p>

            {/* Navegacion por pestanas */}
            <div className="tabs-container no-print">
                <button 
                  className={`tab-btn ${activeTab === 'productos' ? 'tab-activa' : ''}`}
                  onClick={() => setActiveTab('productos')}
                >
                  Catalogo de Productos
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'facturacion' ? 'tab-activa' : ''}`}
                  onClick={() => setActiveTab('facturacion')}
                >
                  Generar Factura (Venta)
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'lotes' ? 'tab-activa' : ''}`}
                  onClick={() => setActiveTab('lotes')}
                >
                  Control de Lotes
                </button>
            </div>

            {/* PESTANA 1: Productos */}
            {activeTab === 'productos' && (
              <div className="tab-contenido">
                <button onClick={handleToggleForm} style={{ marginBottom: '1rem' }}>
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
                                    <th>Categoria</th>
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
            )}

            {/* PESTANA 2: Facturacion */}
            {activeTab === 'facturacion' && (
              <div className="tab-contenido seccion-modulo">
                <h3>Crear Factura Directa (Sin Cotizacion)</h3>
                <p style={{color: 'var(--tinta-suave)'}}>// @abner: Acá los de backend deben insertar en FACTURAS_ENCABEZADO y FACTURAS_DETALLE y reducir el stock.</p>
                
                <div className="info-vacia" style={{ border: '2px dashed var(--tinta-mod)', padding: '2rem', textAlign: 'left', fontStyle: 'normal' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 'bold' }}>Cliente (NIT):</label>
                      <input type="text" placeholder="CF o NIT del cliente" style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 'bold' }}>Fecha:</label>
                      <input type="date" style={{ width: '100%', padding: '0.5rem' }} defaultValue="2026-10-08" readOnly />
                    </div>
                  </div>

                  <h4 style={{ marginTop: '1rem', borderBottom: '1px solid #ccc' }}>Productos a Vender</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <select style={{ flex: 1, padding: '0.5rem' }}>
                      <option value="">Seleccione un producto del inventario</option>
                    </select>
                    <input type="number" placeholder="Cantidad" style={{ width: '100px', padding: '0.5rem' }} />
                    <button style={{ padding: '0.5rem 1rem', background: 'var(--tinta-mod)', color: '#fff', border: 'none' }}>+ Agregar</button>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--papel-2)' }}>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Producto</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Cantidad</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Precio Unit.</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="4" className="info-vacia">Agregue productos para facturar</td></tr>
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button className="btn-imprimir" style={{ padding: '0.75rem 2rem', fontWeight: 'bold' }}>GENERAR FACTURA</button>
                  </div>
                </div>
              </div>
            )}

            {/* PESTANA 3: Control de Lotes */}
            {activeTab === 'lotes' && (
              <div className="tab-contenido seccion-modulo">
                <h3>Existencias en Bodegas (Lotes)</h3>
                <p style={{color: 'var(--tinta-suave)'}}>// @abner: Vista para consultar INVENTARIO_LOTES, sus fechas de vencimiento y BODEGAS.</p>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--tinta)', color: '#fff' }}>
                      <th style={{ padding: '0.75rem' }}>Lote #</th>
                      <th style={{ padding: '0.75rem' }}>Producto</th>
                      <th style={{ padding: '0.75rem' }}>Bodega / Ubicacion</th>
                      <th style={{ padding: '0.75rem' }}>Disponible</th>
                      <th style={{ padding: '0.75rem' }}>F. Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan="5" className="info-vacia">Conectar con backend para ver lotes y existencias</td></tr>
                  </tbody>
                </table>
              </div>
            )}

        </div>
    );
};

export default InventarioPage;
