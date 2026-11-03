import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import * as authService from '../services/authService';
import { usePaintTransition } from '../context/PaintSplashContext';

export const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);
  const { triggerTransition, isTransitioning } = usePaintTransition();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cargando || isTransitioning) return;

    setErrorMsg('');
    setCargando(true);

    try {
      const data = await authService.loginAPI(usuario, password);

      if (data.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userSession', JSON.stringify({
          usuario: data.usuario,
          rol: data.rol,
          idRol: data.idRol
        }));

        // Activamos la transicion fluida y natural de pintura oscura
        triggerTransition('/dashboard');
      } else {
        setCargando(false);
        setErrorMsg(data.mensaje || 'Credenciales incorrectas');
      }
    } catch (error) {
      setCargando(false);
      if (error.response && error.response.data) {
        setErrorMsg(error.response.data.mensaje || error.response.data.error);
      } else {
        setErrorMsg('Error al conectar con el servidor');
      }
    }
  };

  return (
    <LoginForm
      usuario={usuario}
      password={password}
      setUsuario={setUsuario}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
      errorMsg={errorMsg}
      cargando={cargando}
      paintSplash={isTransitioning}
    />
  );
};

export default LoginPage;
