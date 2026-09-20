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
                    Elegí un módulo en el menú de la izquierda. Cada uno tiene su propio
                    color, así siempre sabés dónde estás parado.
                </p>

                <ul className="landing-tags">
                    <li>Usuarios</li>
                    <li>Clientes</li>
                    <li>Proveedores</li>
                    <li>Inventario</li>
                    <li>Caja</li>
                    <li>Gerencia</li>
                </ul>
            </div>

            <figure className="landing-foto">
                <img
                    src={logo}
                    alt="Logo OMNI-SAZO"
                    onError={() => setLogo('/SAZOIDE.jpg')}
                />
                <figcaption>Pinturas y ferretería</figcaption>
            </figure>
        </div>
    );
};

export default LandingPage;
