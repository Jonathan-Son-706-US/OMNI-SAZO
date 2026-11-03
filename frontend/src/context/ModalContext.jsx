import React, { createContext, useContext, useState, useCallback } from 'react';
import PopUpModal from '../components/PopUpModal';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    tipo: 'success',
    titulo: '',
    mensaje: '',
    detalles: null,
    imagen: null,
    etiqueta: null,
    botonTexto: 'Aceptar',
    onConfirmar: null,
    botonSecundarioTexto: null,
    onAccionSecundaria: null,
    posicionImagen: 'derecha',
    colorTema: null
  });

  const cerrarModal = useCallback(() => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const mostrarModal = useCallback((config) => {
    setModalConfig({
      isOpen: true,
      tipo: config.tipo || 'success',
      titulo: config.titulo || 'Notificacion',
      mensaje: config.mensaje || '',
      detalles: config.detalles || null,
      imagen: config.imagen || null,
      etiqueta: config.etiqueta || null,
      botonTexto: config.botonTexto || 'Aceptar',
      posicionImagen: config.posicionImagen || 'derecha',
      colorTema: config.colorTema || config.color || null,
      onConfirmar: config.onConfirmar
        ? () => {
            config.onConfirmar();
            cerrarModal();
          }
        : cerrarModal,
      botonSecundarioTexto: config.botonSecundarioTexto || null,
      onAccionSecundaria: config.onAccionSecundaria
        ? () => {
            config.onAccionSecundaria();
            cerrarModal();
          }
        : (config.botonSecundarioTexto ? cerrarModal : null)
    });
  }, [cerrarModal]);

  const mostrarExito = useCallback((configOTexto, mensajeOpcional) => {
    if (typeof configOTexto === 'string') {
      mostrarModal({
        tipo: 'success',
        titulo: configOTexto,
        mensaje: mensajeOpcional || '',
        botonTexto: 'Aceptar'
      });
    } else {
      mostrarModal({
        tipo: 'success',
        ...configOTexto
      });
    }
  }, [mostrarModal]);

  const mostrarError = useCallback((configOTexto, mensajeOpcional) => {
    if (typeof configOTexto === 'string') {
      mostrarModal({
        tipo: 'danger',
        titulo: configOTexto,
        mensaje: mensajeOpcional || '',
        botonTexto: 'Entendido'
      });
    } else {
      mostrarModal({
        tipo: 'danger',
        ...configOTexto
      });
    }
  }, [mostrarModal]);

  const mostrarConfirmacion = useCallback((config) => {
    mostrarModal({
      tipo: 'danger',
      titulo: config.titulo || 'Confirmar Accion',
      mensaje: config.mensaje || '¿Deseas continuar?',
      botonTexto: config.botonTexto || 'Confirmar',
      onConfirmar: config.onConfirmar,
      botonSecundarioTexto: config.botonSecundarioTexto || 'Cancelar',
      onAccionSecundaria: config.onCancelar || cerrarModal
    });
  }, [mostrarModal, cerrarModal]);

  return (
    <ModalContext.Provider value={{
      mostrarModal,
      mostrarExito,
      mostrarError,
      mostrarConfirmacion,
      cerrarModal
    }}>
      {children}
      <PopUpModal
        isOpen={modalConfig.isOpen}
        tipo={modalConfig.tipo}
        titulo={modalConfig.titulo}
        mensaje={modalConfig.mensaje}
        detalles={modalConfig.detalles}
        imagen={modalConfig.imagen}
        etiqueta={modalConfig.etiqueta}
        botonTexto={modalConfig.botonTexto}
        onConfirmar={modalConfig.onConfirmar}
        botonSecundarioTexto={modalConfig.botonSecundarioTexto}
        onAccionSecundaria={modalConfig.onAccionSecundaria}
        onCerrar={cerrarModal}
        posicionImagen={modalConfig.posicionImagen}
        colorTema={modalConfig.colorTema}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal debe usarse dentro de un ModalProvider');
  }
  return context;
};
