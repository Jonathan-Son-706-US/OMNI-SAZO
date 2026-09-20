import React, { useState } from 'react';
// Los estilos ya estan puestos por TablasCrud.css, no hace falta un css aparte

// @Abner dejando la estructura del form, puro diseño, sin meter peticiones
// para no saturar (eso lo hace ClientesPage con el service)
const ClienteForm = ({ onSubmit }) => {
    // Estado pa guardar lo que se escriba en los inputs
    const [formData, setFormData] = useState({
        Nombre: '',
        NIT: '',
        EsEmpresa: false
    });

    // Funcion pa agarrar lo que se va tecleando
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Cuando le den a guardar
    const handleSubmit = (e) => {
        e.preventDefault();
        // Mandamos la info a la page (ahi se hace el axios), aca puro frontend va
        onSubmit(formData);
        // Limpiamos el form para que quede en blanco otra vez
        setFormData({ Nombre: '', NIT: '', EsEmpresa: false });
    };

    return (
        <div className="form-container">
            <h3>Registrar Nuevo Cliente</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre o Razón Social:</label>
                    <input type="text" name="Nombre" value={formData.Nombre} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>NIT:</label>
                    {/* @Javi: si mandan "CF" (consumidor final) revisa que tu backend lo acepte igual */}
                    <input type="text" name="NIT" value={formData.NIT} onChange={handleChange} placeholder="Ej. 1234567-8 o CF" required />
                </div>
                <div className="form-group">
                    <label>
                        <input type="checkbox" name="EsEmpresa" checked={formData.EsEmpresa} onChange={handleChange} />
                        {' '}Es empresa (no persona individual)
                    </label>
                </div>
                <button type="submit" className="btn-submit">Guardar Cliente</button>
            </form>
        </div>
    );
};

export default ClienteForm;
