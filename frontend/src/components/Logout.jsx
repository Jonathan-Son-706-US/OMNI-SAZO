import React from 'react';
import { usePaintTransition } from '../context/PaintSplashContext';

export const Logout = () => {
  const { triggerTransition, isTransitioning } = usePaintTransition();

  const handleLogout = () => {
    if (isTransitioning) return;

    triggerTransition('/login', () => {
      localStorage.removeItem('userSession');
      localStorage.removeItem('token');
    });
  };

  return (
    <button 
      onClick={handleLogout}
      className="btn-logout"
      disabled={isTransitioning}
    >
      {isTransitioning ? 'Cerrando...' : 'Cerrar Sesion'}
    </button>
  );
};

export default Logout;
