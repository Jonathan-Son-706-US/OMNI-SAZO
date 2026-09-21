import React, { useState, useEffect } from 'react';

const ProveedorForm = ({ onSubmit, proveedorAEditar = null, onCancelar }) => {
    const [formData, setFormData] = useState({
        NombreProveedor: '',
        NIT: '',
        Telefono: ''
    });

    // Cargar datos en el formulario si se recibe proveedorAEditar (modo edición)
    useEffect(() => {
        if (proveedorAEditar) {
            setFormData({
                NombreProveedor: proveedorAEditar.NombreProveedor || proveedorAEditar.Nombre || '',
                NIT: proveedorAEditar.Nit || proveedorAEditar.NIT || '',
                Telefono: proveedorAEditar.Telefono || ''
            });
        } else {
            setFormData({ NombreProveedor: '', NIT: '', Telefono: '' });
        }
    }, [proveedorAEditar]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Limpieza de espacios en blanco al inicio/final
        const datosLimpios = {
            NombreProveedor: formData.NombreProveedor.trim(),
            NIT: formData.NIT.trim(),
            Telefono: formData.Telefono.trim()
        };

        if (!datosLimpios.NombreProveedor || !datosLimpios.NIT || !datosLimpios.Telefono) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        // Mapeamos a los nombres de parámetros que espera el controlador de Express/T-SQL
        const payload = {
            nombreProveedor: datosLimpios.NombreProveedor,
            nit: datosLimpios.NIT,
            telefono: datosLimpios.Telefono
        };

        // Enviamos el payload y el ID (si estamos editando) a ProveedoresPage.jsx
        await onSubmit(payload, proveedorAEditar ? proveedorAEditar.IdProveedor : null);

        // Reset del formulario
        setFormData({ NombreProveedor: '', NIT: '', Telefono: '' });
    };

    return (
        <div className="form-container">
            <h3>{proveedorAEditar ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre del Proveedor:</label>
                    <input 
                        type="text" 
                        name="NombreProveedor" 
                        value={formData.NombreProveedor} 
                        onChange={handleChange} 
                        placeholder="Ej. Distribuidora Central"
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>NIT:</label>
                    <input 
                        type="text" 
                        name="NIT" 
                        value={formData.NIT} 
                        onChange={handleChange} 
                        placeholder="Ej. 1234567-8"
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>Teléfono:</label>
                    <input 
                        type="tel" 
                        name="Telefono" 
                        value={formData.Telefono} 
                        onChange={handleChange} 
                        placeholder="Ej. 77610000" 
                        required 
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-submit">
                        {proveedorAEditar ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
                    </button>
                    {proveedorAEditar && (
                        <button type="button" onClick={onCancelar} className="btn-cancel">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProveedorForm;