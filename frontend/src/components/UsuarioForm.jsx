import React, { useState } from 'react';
// Importamos los estilos desde la carpeta estilos como mandan las reglas de la mara
// import './estilos/UsuarioForm.css';

// Qué onda, acá el Ambrocio dejando la estructura del form puro diseño va, sin meter peticiones para no saturar la casaca XD
const UsuarioForm = ({ onSubmit, roles }) => {
    // Estado pa guardar lo que se escriba en los inputs
    const [formData, setFormData] = useState({
        NombreUsuario: '',
        Password: '', 
        IdRol: '',
        Estado: true
    });

    // Función pa agarrar lo que el usuario va tecleando
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Cuando le den al botón de guardar
    const handleSubmit = (e) => {
        e.preventDefault();
        // Mandamos la info a la page (ahí se hace el axios), acá puro frontend va
        onSubmit(formData); 
        // Limpiamos esta onda para que quede en blanco otra vez
        setFormData({ NombreUsuario: '', Password: '', IdRol: '', Estado: true });
    };

    return (
        <div className="form-container">
            <h3>Registrar Nuevo Usuario</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Nombre de Usuario:</label>
                    <input type="text" name="NombreUsuario" value={formData.NombreUsuario} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Contraseña:</label>
                    <input type="password" name="Password" value={formData.Password} onChange={handleChange} required />
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
                        <input type="checkbox" name="Estado" checked={formData.Estado} onChange={handleChange} /> 
                        Usuario Activo
                    </label>
                </div>
                <button type="submit" className="btn-submit">Guardar Usuario</button>
            </form>
        </div>
    );
};

export default UsuarioForm;