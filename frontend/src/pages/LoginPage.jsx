import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { loginAPI } from '../services/authService';


export const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const data = await loginAPI(usuario, password);

      if (data.ok) {
        localStorage.setItem('userSession', JSON.stringify({
          usuario: data.usuario,
          rol: data.rol,
          idRol: data.idRol
        }));

        navigate('/dashboard');
      }
    } catch (error) {
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
    />
  );
};