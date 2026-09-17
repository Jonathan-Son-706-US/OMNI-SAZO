import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    navigate('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="btn-logout"
    >
      Cerrar Sesión
    </button>
  );
};