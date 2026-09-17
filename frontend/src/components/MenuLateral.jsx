import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logout } from './Logout';
import './estilos/DashboardPage.css';

export const Sidebar = () => {
  const location = useLocation();
  const session = JSON.parse(localStorage.getItem('userSession'));
  const idRol = session?.idRol; 
  const rolNombre = session?.rol || 'Usuario';  //@jonas: esto almacenada el idrol del logueo

  return (
    <aside className="dash-sidebar">
      <div>
        <div className="dash-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/SAZOIDE.jpg" 
              alt="Logo OMNI-SAZO" 
              style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
            />
            <div>
              <h2 className="dash-brand-title">OMNI-SAZO</h2>
              <span className="dash-brand-role">{rolNombre}</span>
            </div>
          </div>
        </div>

        <nav className="dash-nav">
          {/*modulo ejemplo quitar cuando puedan mucha */}
          <Link 
            to="/dashboard/ejemplo" 
            className={`dash-link ${location.pathname.includes('ejemplo') ? 'active' : ''}`}
          >
          Módulo Ejemplo
          </Link>

          {/* para gerente y digitador */}
          {[1, 3].includes(idRol) && (
            <Link 
              to="/dashboard/digitacion" 
              className={`dash-link ${location.pathname.includes('digitacion') ? 'active' : ''}`}
            >
            Ingreso de Datos
            </Link>
          )}

          {/*Para gerente y cajero*/}
          {[2, 3].includes(idRol) && (
            <Link 
              to="/dashboard/caja" 
              className={`dash-link ${location.pathname.includes('caja') ? 'active' : ''}`}
            >
            Módulo de Caja
            </Link>
          )}

          {/*Para el gerente*/}
          {idRol === 3 && (
            <Link 
              to="/dashboard/gerencia" 
              className={`dash-link ${location.pathname.includes('gerencia') ? 'active' : ''}`}
            >
            Reportes de Gerencia
            </Link>
          )}
        </nav>
      </div>

      <Logout />
    </aside>
  );
};