import React, { useState, useEffect } from 'react';
// Importamos los estilos desde la carpeta estilos como mandan las reglas de la mara
// import './estilos/UsuarioForm.css';

const UsuarioForm = ({ onSubmit, roles = [], usuarioAEditar = null, onCancelar }) => {
    // Estado pa guardar lo que se escriba en los inputs
    const [formData, setFormData] = useState({
        NombreUsuario: '',
        Password: '', 
        IdRol: '',
        Estado: true
    });

    // Detectar si viene un usuario para EDITAR o si es para CREAR
    useEffect(() => {
        if (usuarioAEditar) {
            setFormData({
                NombreUsuario: usuarioAEditar.NombreUsuario || '',
                Password: '', // Se deja vacía para no obligar a cambiarla al editar
                IdRol: usuarioAEditar.IdRol || '',
                Estado: usuarioAEditar.Estado !== undefined ? Boolean(usuarioAEditar.Estado) : true
            });
        } else {
            setFormData({ 
                NombreUsuario: '', 
                Password: '', 
                IdRol: '', 
                Estado: true 
            });
        }
    }, [usuarioAEditar]);

    // Función pa agarrar lo que el usuario va tecleando
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Cuando le den al botón de guardar o actualizar
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mapeamos a los nombres que espera el Backend
        const payload = {
            nombreUsuario: formData.NombreUsuario.trim(),
            idRol: parseInt(formData.IdRol),
            estado: formData.Estado,
            contrasena: formData.Password
        };

        // Mandamos la info a la page (pasando el ID si estamos editando)
        await onSubmit(payload, usuarioAEditar ? usuarioAEditar.IdUsuario : null); 

        // Limpiamos esta onda para que quede en blanco otra vez
        setFormData({ NombreUsuario: '', Password: '', IdRol: '', Estado: true });
    };

    return (
        <div className="form-container">
            <h3>{usuarioAEditar ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre de Usuario:</label>
                    <input 
                        type="text" 
                        name="NombreUsuario" 
                        value={formData.NombreUsuario} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div className="form-group">
                    <label>
                        Contraseña {usuarioAEditar && '(dejar en blanco para conservar la actual)'}:
                    </label>
                    <input 
                        type="password" 
                        name="Password" 
                        value={formData.Password} 
                        onChange={handleChange} 
                        required={!usuarioAEditar} // Solo es requerida si estamos creando uno nuevo
                    />
                </div>

                <div className="form-group">
                    <label>Rol:</label>
                    <select name="IdRol" value={formData.IdRol} onChange={handleChange} required>
                        <option value="">Seleccione un rol...</option>
                        {/* Recibimos los roles de la page y los pintamos acá nítido */}
                        {roles.map(rol => (
                            <option key={rol.IdRol} value={rol.IdRol}>{rol.NombreRol}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>
                        <input 
                            type="checkbox" 
                            name="Estado" 
                            checked={formData.Estado} 
                            onChange={handleChange} 
                        /> 
                        Usuario Activo
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-submit">
                        {usuarioAEditar ? 'Actualizar Usuario' : 'Guardar Usuario'}
                    </button>
                    {usuarioAEditar && (
                        <button type="button" onClick={onCancelar} className="btn-cancel">
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UsuarioForm;