import React, { useEffect } from 'react';
import './estilos/PopUpModal.css';

// Colores oficiales por modulo segun la guia de estilos OMNI-SAZO
const MAPA_COLORES = {
  usuarios: '#e0218a',
  clientes: '#0c7a7a',
  proveedores: '#d62839',
  inventario: '#0e9f5e',
  productos: '#0e9f5e',
  compras: '#eab308',
  cotizaciones: '#4b5563',
  facturacion: '#0284c7',
  caja: '#e06400',
  anulaciones: '#dc2626',
  gerencia: '#7b3fe4',
  inicio: '#f472b6'
};

const resolverColorModulo = (colorProp) => {
  if (colorProp) return colorProp;
  const temaBody = typeof document !== 'undefined' ? document.body?.dataset?.tema : null;
  if (temaBody && MAPA_COLORES[temaBody]) return MAPA_COLORES[temaBody];
  const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
  for (const [key, color] of Object.entries(MAPA_COLORES)) {
    if (path.includes(key)) return color;
  }
  return '#e0218a';
};

// Componente modal pop-up comic con ilustracion en la parte superior y color del modulo
const PopUpModal = ({
  isOpen,
  tipo = 'success', // 'success', 'danger', 'error'
  titulo = 'Operacion Realizada',
  mensaje = '',
  detalles = null,
  imagen = null,
  etiqueta = null,
  botonTexto = 'Aceptar',
  onConfirmar,
  botonSecundarioTexto = null,
  onAccionSecundaria = null,
  onCerrar,
  posicionImagen = 'derecha', // 'derecha' o 'izquierda' (en la parte superior)
  colorTema = null
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onCerrar) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCerrar]);

  if (!isOpen) return null;

  const esPeligro = tipo === 'danger' || tipo === 'error';
  const imgFinal = imagen || (esPeligro ? '/modal_danger.png' : '/modal_success.png');
  const etiquetaFinal = etiqueta || (esPeligro ? 'Atencion / Anulacion' : 'Operacion Exitosa');
  const colorFinal = resolverColorModulo(colorTema);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onCerrar) {
      onCerrar();
    }
  };

  const handleBotonPrincipal = () => {
    if (onConfirmar) {
      onConfirmar();
    } else if (onCerrar) {
      onCerrar();
    }
  };

  return (
    <div className="popup-modal-backdrop" onClick={handleBackdropClick}>
      <div className="popup-modal-card" style={{ '--color-tema': colorFinal }}>
        {/* Cinta adhesiva superior */}
        <div className="popup-modal-tape"></div>

        {/* Encabezado con el color del modulo */}
        <div className="popup-modal-header">
          <span className="popup-modal-badge">{etiquetaFinal}</span>
          {onCerrar && (
            <button
              type="button"
              className="popup-modal-close-btn"
              onClick={onCerrar}
              title="Cerrar"
            >
              x
            </button>
          )}
        </div>

        {/* Cuerpo */}
        <div className="popup-modal-body">
          {/* Fila superior: Texto a un lado e ilustracion al otro */}
          <div className={`popup-modal-top-section pos-${posicionImagen}`}>
            <div className="popup-modal-text-col">
              <h3 className="popup-modal-title">{titulo}</h3>
              <p className="popup-modal-message">{mensaje}</p>
              {detalles && <div className="popup-modal-details">{detalles}</div>}
            </div>

            {/* Recuadro de la ilustracion (solo la imagen, sin texto debajo) */}
            <div className="popup-modal-illustration-wrap">
              <div className="popup-modal-photo-tape"></div>
              <img
                src={imgFinal}
                alt="Ilustracion"
                className="popup-modal-img"
              />
            </div>
          </div>

          {/* Fila inferior de botones */}
          <div className="popup-modal-actions">
            {botonSecundarioTexto && (
              <button
                type="button"
                className="popup-modal-btn-secondary"
                onClick={onAccionSecundaria || onCerrar}
              >
                {botonSecundarioTexto}
              </button>
            )}
            <button
              type="button"
              className="popup-modal-btn-primary"
              onClick={handleBotonPrincipal}
            >
              {botonTexto}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopUpModal;
