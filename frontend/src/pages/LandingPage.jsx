import React, { useState } from 'react';
import '../components/estilos/Landing.css';

export const LandingPage = () => {
  const [logo, setLogo] = useState('/milogo.gif');

  return (
    <div className="landing-container">
      <div className="landing-texto">
        <span className="landing-sello">Sistema interno</span>

        <h1 className="landing-titulo">
          Bienvenido a
          <span className="linea-color">OMNI-SAZO</span>
        </h1>

        <p className="landing-subtitulo">
          Elegi un modulo en el menu de la izquierda. Cada uno tiene su propio
          color, asi siempre sabes donde estas parado.
        </p>

        <ul className="landing-tags">
          <li>Usuarios</li>
          <li>Clientes</li>
          <li>Proveedores</li>
          <li>Productos</li>
          <li>Caja</li>
          <li>Gerencia</li>
        </ul>
      </div>

      <figure className="landing-foto">
        <img
          src={logo}
          alt="Isaac bailando OMNI-SAZO"
          onError={() => setLogo('/SAZOIDE.jpg')}
        />
        <figcaption>Pinturas y ferreteria</figcaption>
      </figure>
    </div>
  );
};

export default LandingPage;
