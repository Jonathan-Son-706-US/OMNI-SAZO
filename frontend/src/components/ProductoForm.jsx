import React, { useState, useEffect } from 'react';
import { getMarcas, getCategorias, getPresentaciones } from '../services/catalogosService';

const ProductoForm = ({ onSubmit, productoAEditar = null, onCancelar }) => {
    // Listas para los dropdowns
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [presentaciones, setPresentaciones] = useState([]);

    // Estado del formulario
    const [formData, setFormData] = useState({
        nombreProducto: '',
        precioVentaBase: '',
        manejaLote: false,
        idMarca: '',
        idPresentacion: '',
        idCategoria: ''
    });

    // Cargar los catálogos al cargar el componente
    useEffect(() => {
        const cargarCatalogos = async () => {
            try {
                const [marcasData, categoriasData, presentacionesData] = await Promise.all([
                    getMarcas(),
                    getCategorias(),
                    getPresentaciones()
                ]);
                setMarcas(marcasData);
                setCategorias(categoriasData);
                setPresentaciones(presentacionesData);
            } catch (error) {
                console.error("Error al cargar los catálogos:", error);
            }
        };

        cargarCatalogos();
    }, []);

    // Detectar si venimos a EDITAR o a CREAR un producto
    useEffect(() => {
        if (productoAEditar) {
            setFormData({
                nombreProducto: productoAEditar.NombreProducto || '',
                precioVentaBase: productoAEditar.PrecioVentaBase || '',
                manejaLote: productoAEditar.ManejaLote !== undefined ? Boolean(productoAEditar.ManejaLote) : false,
                idMarca: productoAEditar.IdMarca || '',
                idPresentacion: productoAEditar.IdPresentacion || '',
                idCategoria: productoAEditar.IdCategoria || ''
            });
        } else {
            setFormData({
                nombreProducto: '',
                precioVentaBase: '',
                manejaLote: false,
                idMarca: '',
                idPresentacion: '',
                idCategoria: ''
            });
        }
    }, [productoAEditar]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (!formData.idMarca || !formData.idPresentacion || !formData.idCategoria) {
            alert('Por favor selecciona una Marca, Presentación y Categoría.');
            return;
        }

        const payload = {
            nombreProducto: formData.nombreProducto.trim(),
            precioVentaBase: parseFloat(formData.precioVentaBase),
            manejaLote: formData.manejaLote,
            idMarca: parseInt(formData.idMarca),
            idPresentacion: parseInt(formData.idPresentacion),
            idCategoria: parseInt(formData.idCategoria)
        };

        // Llama a la función del padre pasando el payload y el ID si se está editando
        await onSubmit(payload, productoAEditar ? productoAEditar.IdProducto : null);

        // Limpiar el formulario
        setFormData({
            nombreProducto: '',
            precioVentaBase: '',
            manejaLote: false,
            idMarca: '',
            idPresentacion: '',
            idCategoria: ''
        });
    };

    return (
        <div className="form-container">
            <h3>{productoAEditar ? 'EDITAR PRODUCTO' : 'REGISTRAR NUEVO PRODUCTO'}</h3>
            <form onSubmit={handleGuardar}>
                <div className="form-group">
                    <label>NOMBRE DEL PRODUCTO:</label>
                    <input 
                        type="text" 
                        name="nombreProducto"
                        value={formData.nombreProducto}
                        onChange={handleChange}
                        placeholder="Ej. Pintura Azul Galón" 
                        required 
                    />
                </div>
                
                <div className="form-group">
                    <label>PRECIO DE VENTA BASE (Q):</label>
                    <input 
                        type="number" 
                        step="0.01" 
                        name="precioVentaBase"
                        value={formData.precioVentaBase}
                        onChange={handleChange}
                        placeholder="0.00" 
                        required 
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        ¿MANEJA LOTE Y CADUCIDAD?
                        <input 
                            type="checkbox" 
                            name="manejaLote"
                            checked={formData.manejaLote}
                            onChange={handleChange}
                        /> Sí
                    </label>
                </div>

                <div className="form-group">
                    <label>MARCA:</label>
                    <select 
                        name="idMarca" 
                        value={formData.idMarca} 
                        onChange={handleChange} 
                        required
                    >
                        <option value="">Seleccione Marca...</option>
                        {marcas.map(m => (
                            <option key={m.IdMarca} value={m.IdMarca}>
                                {m.NombreMarca}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>PRESENTACIÓN:</label>
                    <select 
                        name="idPresentacion" 
                        value={formData.idPresentacion} 
                        onChange={handleChange} 
                        required
                    >
                        <option value="">Seleccione Presentación...</option>
                        {presentaciones.map(p => (
                            <option key={p.IdPresentacion} value={p.IdPresentacion}>
                                {p.NombrePresentacion}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>CATEGORÍA:</label>
                    <select 
                        name="idCategoria" 
                        value={formData.idCategoria} 
                        onChange={handleChange} 
                        required
                    >
                        <option value="">Seleccione Categoría...</option>
                        {categorias.map(c => (
                            <option key={c.IdCategoria} value={c.IdCategoria}>
                                {c.NombreCategoria}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-submit">
                        {productoAEditar ? 'ACTUALIZAR PRODUCTO' : 'GUARDAR PRODUCTO'}
                    </button>
                    {productoAEditar && (
                        <button type="button" onClick={onCancelar} className="btn-cancel">
                            CANCELAR
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProductoForm;