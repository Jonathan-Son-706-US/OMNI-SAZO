import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MenuLateral } from '../components/MenuLateral';
import '../components/estilos/DashBoardPage.css';

const MODULOS = [
    { key: 'usuarios',   match: 'usuarios',    titulo: 'Usuarios' },
    { key: 'clientes',   match: 'clientes',    titulo: 'Clientes' },
    { key: 'proveedores',match: 'proveedores', titulo: 'Proveedores' },
    { key: 'inventario', match: 'digitacion',  titulo: 'Ingreso de datos' },
    { key: 'caja',       match: 'caja',        titulo: 'Caja' },
    { key: 'gerencia',   match: 'gerencia',    titulo: 'Gerencia' },
];

// Texto que corre en la cinta de abajo, cambia segun el modulo en el que estemos, la vd me quedo tremendo XD
const NOTICIAS = {
    inicio:      ['Sistema en línea', 'Elegí un módulo en el menú', 'Ferretería OMNI-SAZO'],
    usuarios:    ['Altas y bajas de personal', 'Revisá los roles antes de guardar', 'Cada quien con su llave'],
    clientes:    ['CF también es un cliente', 'Revisá bien el NIT antes de guardar', 'Empresa o persona, aquí quedan'],
    proveedores: ['Quién nos surte la bodega', 'Guardá bien el teléfono de contacto', 'Sin proveedor no hay inventario'],
    inventario:  ['Producto nuevo, foto nueva', 'Ojo con los lotes vencidos', 'Contá lo que hay en bodega'],
    caja:        ['Cobrá y entregá factura', 'Consumidor final también cuenta', 'Cuadre de caja al cerrar'],
    gerencia:    ['Números de la semana', 'Qué se vendió y qué no', 'Decisiones con datos'],
};

export const DashboardPage = () => {
    const location = useLocation();
    const ruta = location.pathname.toLowerCase();

    const moduloActivo = MODULOS.find((m) => ruta.includes(m.match));
    const temaActual = moduloActivo ? moduloActivo.key : 'inicio';
    const tituloActual = moduloActivo ? moduloActivo.titulo : 'Inicio';
    const noticias = NOTICIAS[temaActual] || NOTICIAS.inicio;

    // El body toma el mismo color, asi la pagina completa cambia a ese color
    useEffect(() => {
        document.body.dataset.tema = temaActual;
        return () => {
            delete document.body.dataset.tema;
        };
    }, [temaActual]);

    return (
        <div className={`dash-container theme-${temaActual}`}>
            {/* Capas de color*/}
            <div className="dash-bg" aria-hidden="true">
                <div className={`dash-bg-capa bg-inicio ${temaActual === 'inicio' ? 'is-active' : ''}`} />
                {MODULOS.map((m) => (
                    <div
                        key={m.key}
                        className={`dash-bg-capa bg-${m.key} ${m.key === temaActual ? 'is-active' : ''}`}
                    />
                ))}
            </div>
            

            {/* @Abner: Aca son cosas extra que fui poniendo */}
            <div className="dash-mancha dash-mancha-1" aria-hidden="true" />
            <div className="dash-mancha dash-mancha-2" aria-hidden="true" />

            <MenuLateral />

            <div className="dash-content-wrapper">
                <header className="dash-header">
                    <h1 className="dash-header-title">Panel de control</h1>
                    <span className="dash-header-modulo">{tituloActual}</span>
                </header>

                <main className="dash-main">
                    <div className="dash-card-outlet">
                        <Outlet />
                    </div>
                </main>

                {/* @Abner: Cinta de noticias que corre abajo*/}
                <div className="dash-ticker">
                    <div className="dash-ticker-etiqueta">Al día</div>
                    <div className="dash-ticker-pista">
                        {[0, 1].map((i) => (
                            <div className="dash-ticker-texto" key={i}>
                                {noticias.map((n, j) => (
                                    <span key={j}>{n}</span>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
