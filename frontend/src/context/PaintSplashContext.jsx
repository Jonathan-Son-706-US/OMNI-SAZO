import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaintSplashTransition } from '../components/PaintSplashTransition';

const PaintSplashContext = createContext({
  triggerTransition: () => {},
  isTransitioning: false,
});

export const PaintSplashProvider = ({ children }) => {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'covering' | 'covered' | 'revealing'
  const navigate = useNavigate();

  const triggerTransition = useCallback((targetUrl, onBeforeNavigate) => {
    if (phase !== 'idle') return;

    setPhase('covering');

    // A los 850ms la marea de tinta oscura cubre por completo la pantalla
    setTimeout(() => {
      setPhase('covered');

      if (typeof onBeforeNavigate === 'function') {
        onBeforeNavigate();
      }

      if (targetUrl) {
        navigate(targetUrl);
      }

      // Breve pausa para que la nueva pagina se monte detras de la tinta
      setTimeout(() => {
        setPhase('revealing');

        // Al completar el deslizado suave (550ms), regresamos a idle
        setTimeout(() => {
          setPhase('idle');
        }, 580);
      }, 120);
    }, 850);
  }, [phase, navigate]);

  return (
    <PaintSplashContext.Provider value={{ triggerTransition, isTransitioning: phase !== 'idle' }}>
      {children}
      <PaintSplashTransition phase={phase} />
    </PaintSplashContext.Provider>
  );
};

export const usePaintTransition = () => useContext(PaintSplashContext);

export default PaintSplashProvider;
