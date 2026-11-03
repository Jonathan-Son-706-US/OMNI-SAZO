import React from 'react';
import './estilos/SquidBackground.css';

export const SquidBackground = () => {
  // Calamares distribuidos con posiciones horizontales, escalas y delays negativos
  // para que al cargar la pantalla ya estén nadando a distintas alturas de la vista
  const squids = [
    { id: 1, left: '6%',  size: 75,  dur: 17, delay: -4,  opacity: 0.18 },
    { id: 2, left: '20%', size: 115, dur: 24, delay: -12, opacity: 0.22 },
    { id: 3, left: '36%', size: 65,  dur: 19, delay: -15, opacity: 0.15 },
    { id: 4, left: '52%', size: 98,  dur: 27, delay: -6,  opacity: 0.20 },
    { id: 5, left: '68%', size: 82,  dur: 21, delay: -18, opacity: 0.17 },
    { id: 6, left: '83%', size: 120, dur: 29, delay: -9,  opacity: 0.16 },
    { id: 7, left: '93%', size: 70,  dur: 18, delay: -14, opacity: 0.19 },
  ];

  return (
    <div className="squid-bg-container" aria-hidden="true">
      {squids.map((s) => (
        <div
          key={s.id}
          className="squid-swimmer"
          style={{
            left: s.left,
            width: `${s.size}px`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
            opacity: s.opacity,
          }}
        >
          <img
            src="/squid.png"
            alt=""
            className="squid-sprite"
          />
        </div>
      ))}
    </div>
  );
};

export default SquidBackground;
