import React, { useState } from 'react';
import { SquidMascot } from './SquidMascot';
import './estilos/LoginForm.css';

export const LoginForm = ({
  usuario,
  password,
  setUsuario,
  setPassword,
  handleSubmit,
  errorMsg,
  cargando,
  paintSplash
}) => {
  // Estado para controlar qué mira el calamar interactivo: 'none' | 'usuario' | 'password'
  const [focusField, setFocusField] = useState('none');

  // Partículas ambientales de tinta flotando sobre la ciudad
  const particles = [
    { id: 1, left: '10%', size: 8, dur: 14, delay: -2, color: '#ec4899' },
    { id: 2, left: '25%', size: 12, dur: 18, delay: -8, color: '#10b981' },
    { id: 3, left: '42%', size: 6, dur: 16, delay: -5, color: '#facc15' },
    { id: 4, left: '60%', size: 10, dur: 22, delay: -12, color: '#06b6d4' },
    { id: 5, left: '78%', size: 14, dur: 19, delay: -7, color: '#ec4899' },
    { id: 6, left: '90%', size: 8, dur: 15, delay: -15, color: '#10b981' },
  ];

  // Texto largo repetido para garantizar un bucle continuo sin huecos vacios en cualquier resolucion
  const fragmentoCinta = 'PINTURAS Y FERRETERIA · OMNI-SAZO · CONTROL DE BODEGAS · VENTAS Y COTIZACIONES · OMNI-SAZO · ';
  const textoCintaCompleto = fragmentoCinta.repeat(4);

  return (
    <div className="splatoon-login-viewport">
      {/* 1. Fondo de la Ciudad de Inkopolis con respiración / movimiento */}
      <div className="login-city-backdrop" />
      <div className="login-city-vignette" />
      <div className="login-halftone-overlay" />

      {/* Partículas de tinta flotantes */}
      <div className="login-particles-container" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="ink-particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 8px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* Cinta superior de noticias estilo periodico callejero */}
      <div className="login-cinta" aria-hidden="true">
        <div className="login-cinta-pista">
          {[0, 1].map((i) => (
            <span className="login-cinta-texto" key={i}>
              {textoCintaCompleto}
            </span>
          ))}
        </div>
      </div>

      {/* Panel principal: Izquierda Marca Graffiti, Derecha Formulario */}
      <div className="splatoon-login-panel">
        
        {/* Lado izquierdo: Identidad Splatoon 2 */}
        <section className="login-brand-section">
          <div className="brand-badge-pill">
            <span>Acceso de Personal</span>
          </div>

          <div className="splatoon-logo-group">
            <h1 className="logo-main-omni">
              OMNI
              <span className="logo-main-sazo">SAZO</span>
            </h1>
            <div className="logo-ink-splat" aria-hidden="true" />
          </div>

          <div className="brand-tape-subtitle">
            <span>DISTRIBUIDORA DE PINTURAS Y FERRETERIA</span>
          </div>

          <p className="brand-description-text">
            Gestion comercial, inventario de bodega y punto de venta centralizado.
          </p>
        </section>

        {/* Lado derecho: Tarjeta estilo papel adhesivo con cinta y doodle */}
        <section className="login-card-paper">
          {/* Cinta adhesiva tipo Scotch en la parte superior (Referencia imagen 2) */}
          <div className="tape-strip" aria-hidden="true" />

          {/* Calamar interactivo que reacciona a los campos */}
          <SquidMascot focusField={focusField} />

          <h2 className="login-card-title">
            ENTRA A TU CUENTA
          </h2>

          {errorMsg && (
            <div className="login-error-banner">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group-splatoon">
              <label className="form-label-splatoon" htmlFor="input-usuario">
                USUARIO
              </label>
              <input
                id="input-usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                onFocus={() => setFocusField('usuario')}
                onBlur={() => setFocusField('none')}
                className="form-input-splatoon"
                placeholder="Tu nombre de usuario"
                autoComplete="username"
                required
                disabled={cargando || paintSplash}
              />
            </div>

            <div className="form-group-splatoon">
              <label className="form-label-splatoon" htmlFor="input-password">
                CONTRASENA
              </label>
              <input
                id="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusField('password')}
                onBlur={() => setFocusField('none')}
                className="form-input-splatoon"
                placeholder="Tu contrasena"
                autoComplete="current-password"
                required
                disabled={cargando || paintSplash}
              />
            </div>

            {/* Boton llamativo estilo Splatoon */}
            <button
              type="submit"
              className="login-btn-splatoon"
              disabled={cargando || paintSplash}
            >
              {cargando ? 'CONECTANDO...' : 'INICIAR SESION'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LoginForm;
