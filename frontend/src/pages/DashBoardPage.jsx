import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/MenuLateral';
import '../components/estilos/DashBoardPage.css'; 

export const DashboardPage = () => {
  const location = useLocation();

  const getModuloNombre = () => {
    if (location.pathname.includes('ejemplo')) return 'Módulo Ejemplo';
    return 'Panel de Control';
  };

  return (
    <div className="dash-container">
      <Sidebar />

      <div className="dash-content-wrapper">
        <header className="dash-header">
          <h1 className="dash-header-title">{getModuloNombre()}</h1>
        </header>

        <main className="dash-main">
          <div className="dash-card-outlet">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};