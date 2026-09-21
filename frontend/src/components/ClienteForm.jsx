import React, { useState, useEffect } from 'react';

// @Abner dejando la estructura del form, adaptado para soportar Editar / Crear
const ClienteForm = ({ onSubmit, clienteAEditar = null, onCancelar }) => {
    // Estado pa guardar lo que se escriba en los inputs
    const [formData, setFormData] = useState({
        Nombre: '',
        NIT: '',
        EsEmpresa: false
    });

    // Detectar si venimos a EDITAR o a CREAR
    useEffect(() => {
        if (clienteAEditar) {
            setFormData({
                Nombre: clienteAEditar.Nombre || '',
                NIT: clienteAEditar.Nit || clienteAEditar.NIT || '',
                EsEmpresa: clienteAEditar.EsEmpresa !== undefined ? Boolean(clienteAEditar.EsEmpresa) : false
            });
        } else {
            setFormData({ Nombre: '', NIT: '', EsEmpresa: false });
        }
    }, [clienteAEditar]);

    // Funcion pa agarrar lo que se va tecleando
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Cuando le den a guardar o actualizar
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Estructuramos el payload alineado con el Backend
        const payload = {
            nombre: formData.Nombre.trim(),
            nit: formData.NIT.trim() || 'CF',
            esEmpresa: formData.EsEmpresa
        };

        // Mandamos la info a la page (pasamos ID si es edición)
        await onSubmit(payload, clienteAEditar ? clienteAEditar.IdCliente : null);

        // Limpiamos el form para que quede en blanco otra vez
        setFormData({ Nombre: '', NIT: '', EsEmpresa: false });
    };

    return (
        <div className="form-container">
            <h3>{clienteAEditar ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre o Razón Social:</label>
                    <input 
                        type="text" 
                        name="Nombre" 
                        value={formData.Nombre} 
                        onChange={handleChange} 
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
                        placeholder="Ej. 1234567-8 o CF" 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>
                        <input 
                            type="checkbox" 
                            name="EsEmpresa" 
                            checked={formData.EsEmpresa} 
                            onChange={handleChange} 
                        />
                        {' '}Es empresa (no persona individual)
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-submit">
                        {clienteAEditar ? 'Actualizar Cliente' : 'Guardar Cliente'}
                    </button>
                    {clienteAEditar && (
                        <button type="button" onClick={onCancelar} className="btn-cancel">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ClienteForm;