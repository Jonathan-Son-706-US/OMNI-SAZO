import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashBoardPage'; {/* @jonas: recuerden importar su componente */}

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
          {/* @jonas: aqui importan el componente de sus cruds usen este ejemplo */}
          <Route path="ejemplo" element={<div className="text-white text-xl">Aquí se cargará la vista del equipo</div>} />

          {/* Rutas de ejemplo según roles de tu proyecto de pinturas */}
          <Route path="gerencia" element={<div className="text-white text-xl">Vista de Reportes Gerenciales (Rol 3)</div>} />
          <Route path="caja" element={<div className="text-white text-xl">Vista de Cobros y Facturación (Rol 2 y 3)</div>} />
          <Route path="digitacion" element={<div className="text-white text-xl">Vista de Inventario / Compras (Rol 1 y 3)</div>} />

        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;