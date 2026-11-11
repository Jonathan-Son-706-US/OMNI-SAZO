import React, { useEffect } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { MenuLateral } from '../components/MenuLateral';
import { SquidBackground } from '../components/SquidBackground';
import '../components/estilos/DashBoardPage.css';

const MODULOS = [
    { key: 'usuarios',   match: ['usuarios'],                 titulo: 'Usuarios' },
    { key: 'clientes',   match: ['clientes'],                 titulo: 'Clientes' },
    { key: 'proveedores',match: ['proveedores'],              titulo: 'Proveedores' },
    { key: 'inventario', match: ['productos', 'facturacion-inventario'], titulo: 'Productos' },
    { key: 'compras',    match: ['compras'],                  titulo: 'Compras y Bodega' },
    { key: 'cotizaciones', match: ['cotizaciones'],           titulo: 'Cotizaciones' },
    { key: 'facturacion', match: ['facturacion'],             titulo: 'Facturacion' },
    { key: 'caja',       match: ['caja'],                     titulo: 'Caja e Impresion' },
    { key: 'anulaciones', match: ['anulaciones'],             titulo: 'Anulacion de Facturas' },
    { key: 'gerencia',   match: ['gerencia'],                 titulo: 'Gerencia' },
];

// Texto que corre en la cinta de abajo, cambia segun el modulo en el que estemos
const NOTICIAS = {
    inicio:      ['Sistema en linea', 'TOCA A UN SAZO', 'Ferreteria sazograndegordo'],
    usuarios:    ['Altas y bajas de personal', 'Revisa los roles antes de guardar', 'Cada quien con su llave'],
    clientes:    ['CF tambien es un cliente', 'Revisa bien el NIT antes de guardar', 'Empresa o persona, aqui quedan'],
    proveedores: ['Quien nos surte la bodega', 'Guarda bien el telefono de contacto', 'Sin proveedor no hay inventario'],
    inventario:  ['Catalogo de productos y pinturas', 'Precios vigentes y presentaciones', 'Altas y ediciones del catalogo'],
    compras:     ['Recepcion en bodega y lotes', 'Abastecimiento de mercaderia', 'Ingreso ordenado por estante y nivel'],
    cotizaciones:['Cotizaciones formales para clientes', 'Precios vigentes y calculo de total', 'Pasa directo a facturacion'],
    facturacion: ['Ventas al por mayor y menor', 'Facturacion rapida', 'Generacion de factura'],
    caja:        ['Cobra y entrega factura', 'Consumidor final tambien cuenta', 'Cuadre de caja al cerrar'],
    anulaciones: ['Anulacion de facturas', 'El monto pasa a cero', 'Los productos regresan a bodega'],
    gerencia:    ['Numeros de la semana', 'Que se vendio y que no', 'Decisiones con datos'],
};

export const DashboardPage = () => {
    const location = useLocation();
    const ruta = location.pathname.toLowerCase();
    const currentOutlet = useOutlet();

    const moduloActivo = MODULOS.find((m) => 
        Array.isArray(m.match) ? m.match.some((item) => ruta.includes(item)) : ruta.includes(m.match)
    );
    const temaActual = moduloActivo ? moduloActivo.key : 'inicio';
    const tituloActual = moduloActivo ? moduloActivo.titulo : 'Inicio';
    const noticias = NOTICIAS[temaActual] || NOTICIAS.inicio;

    const [animKey, setAnimKey] = React.useState(0);
    const [displayOutlet, setDisplayOutlet] = React.useState(currentOutlet);

    React.useEffect(() => {
        if (animKey === 0) {
            setAnimKey(1);
            return;
        }
        
        setAnimKey(prev => prev + 1);

        const timer = setTimeout(() => {
            setDisplayOutlet(currentOutlet);
        }, 500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line
    }, [ruta]);

    useEffect(() => {
        document.body.dataset.tema = temaActual;
        return () => {
            delete document.body.dataset.tema;
        };
    }, [temaActual]);

    return (
        <div className={`dash-container theme-${temaActual}`}>
            
            {animKey > 1 && (
                <div key={animKey} className={`cortina-transicion bg-${temaActual}`}></div>
            )}

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

            {/* Manchas decorativas */}
            <div className="dash-mancha dash-mancha-1" aria-hidden="true" />
            <div className="dash-mancha dash-mancha-2" aria-hidden="true" />

            {/* Animación de calamares nadando en el fondo */}
            <SquidBackground />

            <MenuLateral />

            <div className="dash-content-wrapper">
                <header className="dash-header">
                    <h1 className="dash-header-title">Panel de control</h1>
                    <span className="dash-header-modulo">{tituloActual}</span>
                </header>

                <main className="dash-main">
                    <div className="dash-card-outlet">
                        {displayOutlet}
                    </div>
                </main>

                {/* Cinta de noticias en bucle continuo */}
                <div className="dash-ticker">
                    <div className="dash-ticker-etiqueta">Al día</div>
                    <div className="dash-ticker-pista">
                        {[0, 1].map((i) => (
                            <div className="dash-ticker-texto" key={i}>
                                {[...noticias, ...noticias, ...noticias, ...noticias].map((n, j) => (
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
