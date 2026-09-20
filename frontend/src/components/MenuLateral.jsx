import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logout } from './Logout';
import './estilos/DashBoardPage.css';
import './estilos/MenuLateral.css';

export const MenuLateral = () => {
  const location = useLocation();
  const rutaActual = location.pathname.replace(/\/+$/, '') || '/';
  const session = JSON.parse(localStorage.getItem('userSession'));
  const idRol = session?.idRol; 
  const rolNombre = session?.rol || 'Usuario';  //@jonas: esto almacena el idrol del logueo

  return (
    <aside className="dash-sidebar">
      <div>
        <div className="dash-brand">
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <img 
              src="/SAZOIDE.jpg" 
              alt="Logo OMNI-SAZO" 
              style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
            />
            <div>
              <h2 className="dash-brand-title">OMNI-SAZO</h2>
              <span className="dash-brand-role">{rolNombre}</span>
            </div>
          </Link>
        </div>

        <nav className="dash-nav">
          {/* Boton para ir al inicio o la bienvenida que no estaba antes */}
          <Link 
            to="/dashboard" 
            className={`dash-link menu-btn-inicio ${rutaActual === '/dashboard' ? 'active' : ''}`}
          >
            Inicio
          </Link>

          {/* @Abner: el modulo ejemplo ya no va, ya tenemos las 4 tablas
              fuertes reales (Usuarios, Productos, Clientes, Proveedores) */}

          {/* Administrar Usuarios (Solo Gerente) */}
          {idRol === 3 && (
            <Link 
              to="/dashboard/usuarios" 
              className={`dash-link menu-btn-usuarios ${location.pathname.includes('usuarios') ? 'active' : ''}`}
            >
              Administrar Usuarios
            </Link>
          )}

          {/* Clientes (Cajero y Gerente, porque en Caja se elige el cliente) */}
          {[2, 3].includes(idRol) && (
            <Link 
              to="/dashboard/clientes" 
              className={`dash-link menu-btn-clientes ${location.pathname.includes('clientes') ? 'active' : ''}`}
            >
              Clientes
            </Link>
          )}

          {/* Proveedores (Digitador y Gerente, porque ellos reciben mercaderia) */}
          {[1, 3].includes(idRol) && (
            <Link 
              to="/dashboard/proveedores" 
              className={`dash-link menu-btn-proveedores ${location.pathname.includes('proveedores') ? 'active' : ''}`}
            >
              Proveedores
            </Link>
          )}

          {/* Ingreso de Datos (Gerente y Digitador) */}
          {[1, 3].includes(idRol) && (
            <Link 
              to="/dashboard/digitacion" 
              className={`dash-link menu-btn-inventario ${location.pathname.includes('digitacion') ? 'active' : ''}`}
            >
              Ingreso de Datos
            </Link>
          )}

          {/* Modulo de Caja (Gerente y Cajero) */}
          {[2, 3].includes(idRol) && (
            <Link 
              to="/dashboard/caja" 
              className={`dash-link menu-btn-caja ${location.pathname.includes('caja') ? 'active' : ''}`}
            >
              Módulo de Caja
            </Link>
          )}

          {/* Reportes de Gerencia (Solo Gerente) */}
          {idRol === 3 && (
            <Link 
              to="/dashboard/gerencia" 
              className={`dash-link menu-btn-gerencia ${location.pathname.includes('gerencia') ? 'active' : ''}`}
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

export default MenuLateral;