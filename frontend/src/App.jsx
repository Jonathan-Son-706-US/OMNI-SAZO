import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PaintSplashProvider } from './context/PaintSplashContext';
import { ModalProvider } from './context/ModalContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashBoardPage';
import { LandingPage } from './pages/LandingPage';

import UsuariosPage from './pages/UsuariosPage';
import ClientesPage from './pages/ClientesPage';
import ProveedoresPage from './pages/ProveedoresPage';
import ProductosPage from './pages/ProductosPage';
import ComprasPage from './pages/ComprasPage';
import CajaPage from './pages/CajaPage';
import CotizacionPage from './pages/CotizacionPage';
import FacturacionPage from './pages/FacturacionPage';
import AnulacionPage from './pages/AnulacionPage';
import GerenciaPage from './pages/GerenciaPage';

// Proteccion de rutas segun sesion
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
      <ModalProvider>
        <PaintSplashProvider>
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
              
              <Route index element={<LandingPage />} />

              {/* Mantenimientos */}
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="proveedores" element={<ProveedoresPage />} />
              <Route path="productos" element={<ProductosPage />} />
              <Route path="facturacion-inventario" element={<Navigate to="/dashboard/productos" replace />} />
              
              {/* Operaciones */}
              <Route path="compras" element={<ComprasPage />} />
              <Route path="cotizaciones" element={<CotizacionPage />} />          
              <Route path="facturacion" element={<FacturacionPage />} />
              <Route path="caja" element={<CajaPage />} />

              {/* Anulacion y Reportes */}
              <Route path="anulaciones" element={<AnulacionPage />} />
              <Route path="gerencia" element={<GerenciaPage />} />

            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </PaintSplashProvider>
      </ModalProvider>
    </BrowserRouter>
  );
}

export default App;
