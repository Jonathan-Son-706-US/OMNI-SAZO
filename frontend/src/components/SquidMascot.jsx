import React from 'react';
import './estilos/SquidMascot.css';

export const SquidMascot = ({ focusField }) => {
  // focusField: 'none' | 'usuario' | 'password'

  return (
    <div className={`squid-mascot-wrapper state-${focusField}`}>
      <div className="squid-mascot-body">
        {/* Imagen del calamar */}
        <img src="/squid.png" alt="Squid Doodle" className="squid-base-img" />

        {/* Mejillas sonrojadas cuando se tapa los ojos */}
        <div className="squid-blush blush-left" />
        <div className="squid-blush blush-right" />

        {/* Tentaculos interactivos que cubren los ojos */}
        <div className="squid-tentacles-cover">
          <svg viewBox="0 0 120 70" className="tentacles-svg">
            {/* Tentaculo izquierdo */}
            <path
              d="M 22 70 C 12 38, 22 14, 48 20 C 56 26, 48 46, 38 62 Z"
              fill="#18181b"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="28" cy="36" r="3.5" fill="#ffffff" />
            <circle cx="38" cy="27" r="3" fill="#ffffff" />

            {/* Tentaculo derecho */}
            <path
              d="M 98 70 C 108 38, 98 14, 72 20 C 64 26, 72 46, 82 62 Z"
              fill="#18181b"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="92" cy="36" r="3.5" fill="#ffffff" />
            <circle cx="82" cy="27" r="3" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Globito de dialogo */}
      {focusField === 'password' && (
        <div className="squid-bubble bubble-password">
          <span>feliz noche no voy a ver</span>
        </div>
      )}
      {focusField === 'usuario' && (
        <div className="squid-bubble bubble-usuario">
          <span>quien chota sos</span>
        </div>
      )}
    </div>
  );
};

export default SquidMascot;
