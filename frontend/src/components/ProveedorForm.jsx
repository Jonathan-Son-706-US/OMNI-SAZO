import React, { useState } from 'react';

// @Abner dejando la estructura del form, puro diseño, sin peticiones
const ProveedorForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        NombreProveedor: '',
        NIT: '',
        Telefono: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mandamos la info a la page (ahi se hace el axios)
        onSubmit(formData);
        setFormData({ NombreProveedor: '', NIT: '', Telefono: '' });
    };

    return (
        <div className="form-container">
            <h3>Registrar Nuevo Proveedor</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre del Proveedor:</label>
                    <input type="text" name="NombreProveedor" value={formData.NombreProveedor} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>NIT:</label>
                    <input type="text" name="NIT" value={formData.NIT} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Teléfono:</label>
                    <input type="tel" name="Telefono" value={formData.Telefono} onChange={handleChange} placeholder="Ej. 5555-5555" required />
                </div>
                <button type="submit" className="btn-submit">Guardar Proveedor</button>
            </form>
        </div>
    );
};

export default ProveedorForm;
