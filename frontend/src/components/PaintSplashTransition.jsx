import React from 'react';
import './estilos/PaintSplashTransition.css';

export const PaintSplashTransition = ({ phase = 'idle' }) => {
  if (phase === 'idle') return null;

  return (
    <div className={`paint-splash-screen phase-${phase}`} aria-hidden="true">
      {/* Mancha 1: Verde Inventario (#17b26a) en esquina inferior izquierda */}
      <div className="splat-item splat-green">
        <svg viewBox="0 0 200 200" className="splat-svg">
          <path
            d="M95 18 C115 12, 145 28, 150 55 C155 78, 185 85, 188 115 C190 142, 160 165, 140 178 C118 190, 85 192, 60 175 C35 158, 15 145, 12 118 C10 88, 32 75, 45 50 C60 25, 78 22, 95 18 Z"
            fill="#17b26a"
          />
          <circle cx="25" cy="40" r="12" fill="#4ede9b" />
          <circle cx="180" cy="45" r="9" fill="#0e9f5e" />
          <circle cx="170" cy="180" r="14" fill="#17b26a" />
          <circle cx="35" cy="175" r="10" fill="#4ede9b" />
        </svg>
      </div>

      {/* Mancha 2: Magenta Usuarios (#e0218a) en esquina superior derecha */}
      <div className="splat-item splat-pink">
        <svg viewBox="0 0 200 200" className="splat-svg">
          <path
            d="M105 15 C135 18, 168 38, 175 70 C180 98, 195 125, 178 150 C160 178, 130 188, 100 185 C70 182, 38 175, 25 145 C15 118, 20 82, 42 60 C65 38, 80 12, 105 15 Z"
            fill="#e0218a"
          />
          <circle cx="30" cy="25" r="10" fill="#fbcfe8" />
          <circle cx="185" cy="170" r="15" fill="#ff6fb5" />
          <circle cx="15" cy="130" r="12" fill="#f472b6" />
          <circle cx="140" cy="20" r="8" fill="#e0218a" />
        </svg>
      </div>

      {/* Mancha 3: Naranja Caja (#f4740b) en el centro-izquierda */}
      <div className="splat-item splat-orange">
        <svg viewBox="0 0 200 200" className="splat-svg">
          <path
            d="M100 20 C125 15, 155 35, 165 65 C175 95, 185 130, 160 155 C135 180, 95 185, 65 170 C35 155, 20 125, 25 90 C30 55, 75 25, 100 20 Z"
            fill="#f4740b"
          />
          <circle cx="20" cy="50" r="11" fill="#ffa94d" />
          <circle cx="175" cy="80" r="13" fill="#eab308" />
        </svg>
      </div>

      {/* Mancha 4: Azul Facturación (#0284c7) en sector derecho */}
      <div className="splat-item splat-blue">
        <svg viewBox="0 0 200 200" className="splat-svg">
          <path
            d="M110 22 C140 28, 170 55, 168 90 C165 125, 180 158, 150 178 C120 198, 75 188, 48 165 C20 140, 18 100, 35 70 C52 40, 80 18, 110 22 Z"
            fill="#0284c7"
          />
          <circle cx="190" cy="140" r="14" fill="#38bdf8" />
          <circle cx="25" cy="165" r="10" fill="#0c7a7a" />
        </svg>
      </div>

      {/* Mancha 5: Marea de Tinta Morada Gerencia (#7b3fe4) que inunda la pantalla */}
      <div className="splat-item splat-cover">
        <div className="splat-giant-ink" />
      </div>
    </div>
  );
};

export default PaintSplashTransition;
