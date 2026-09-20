import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashBoardPage'; {/* @jonas: recuerden importar su componente */}
import { LandingPage } from './pages/LandingPage';

// @Abner importando la vista de usuarios
import UsuariosPage from './pages/UsuariosPage';
// @Abner ya van 4 mantenimientos de tablas fuertes: Usuarios, Productos,
// Clientes y Proveedores. Con esto completamos el requisito del proyecto
import ClientesPage from './pages/ClientesPage';
import ProveedoresPage from './pages/ProveedoresPage';
// @Abner dejando listos los mockups/cascarones de los otros modulos pesados para Javi
import InventarioPage from './pages/InventarioPage';
import CajaPage from './pages/CajaPage';

const ProtectedRoute = ({ children }) => {
  const session = JSON.parse(localStorage.getItem('userSession'));
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          {/* ¡Acá está la magia! Esta ruta index carga tu Landing animada por defecto al entrar al dashboard */}
          <Route index element={<LandingPage />} />

          {/* @Abner: el modulo ejemplo ya cumplio su chamba, lo quito porque
              ya tenemos las 4 tablas fuertes que pide el proyecto (Usuarios,
              Productos, Clientes y Proveedores) */}

          {/* @Abner registrando el CRUD de Usuarios */}
          <Route path="usuarios" element={<UsuariosPage />} />

          {/* @Abner registrando el CRUD de Clientes (tabla fuerte 3) */}
          <Route path="clientes" element={<ClientesPage />} />

          {/* @Abner registrando el CRUD de Proveedores (tabla fuerte 4) */}
          <Route path="proveedores" element={<ProveedoresPage />} />

          {/* modulos fuertes ya renderizados @Abner */}
          <Route path="digitacion" element={<InventarioPage />} />
          <Route path="caja" element={<CajaPage />} />
          
          {/* Aca lo dejo asi @Abner porque la vd no sabemos que vamos a poner en la grafica o reporte creo */}
          <Route
            path="gerencia"
            element={
              <div className="modulo-pendiente">
                <h2>Reportes de gerencia</h2>
                <p>Vista reservada para el rol 3. Falta definir qué gráficas y reportes se van a mostrar.</p>
              </div>
            }
          />

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;