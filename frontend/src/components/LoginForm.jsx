import React from 'react';
import './estilos/LoginForm.css';

// Solo diseño: las props y el handleSubmit los sigue manejando LoginPage,
// acá no se hace ninguna peticion ni nada
export const LoginForm = ({ usuario, password, setUsuario, setPassword, handleSubmit, errorMsg }) => {
  return (
    <div className="login-container">
      {/* Cinta superior con texto corriendo, como el encabezado de un diario  como la pagina de splatoon q me guie de Nintendo */}
      <div className="login-cinta" aria-hidden="true">
        <div className="login-cinta-pista">
          {[0, 1].map((i) => (
            <span className="login-cinta-texto" key={i}>
              PINTURAS Y FERRETERÍA · OMNI-SAZO · PINTURAS Y FERRETERÍA · OMNI-SAZO ·
              PINTURAS Y FERRETERÍA · OMNI-SAZO ·
            </span>
          ))}
        </div>
      </div>

      <div className="login-panel">
        {/* Lado izquierdo: el logo */}
        <section className="login-marca">
          <span className="login-sello">Acceso al sistema</span>

          <h1 className="login-titulo">
            OMNI
            <span className="login-titulo-2">SAZO</span>
          </h1>

          <p className="login-lema">
            Inventario, caja y usuarios en un solo lugar.
          </p>

          <figure className="login-foto">
            <img src="/SAZOIDE.jpg" alt="OMNI-SAZO" />
          </figure>
        </section>

        {/* Lado derecho: el formulario */}
        <section className="login-card">
          <h2 className="login-card-titulo">Entrá a tu cuenta</h2>

          {errorMsg && <div className="error-banner">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-usuario">Usuario</label>
              <input
                id="login-usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="form-input"
                placeholder="Tu nombre de usuario"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn-submit">
              Ingresar
            </button>
          </form>

          <p className="login-nota">
            ¿No tenés acceso? Pedile una cuenta al encargado.
          </p>
        </section>
      </div>
    </div>
  );
};
