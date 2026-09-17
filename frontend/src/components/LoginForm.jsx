import React from 'react';
import './estilos/LoginForm.css'; 

export const LoginForm = ({ usuario, password, setUsuario, setPassword, handleSubmit, errorMsg }) => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">OMNI-SAZO</h2>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="form-input"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};