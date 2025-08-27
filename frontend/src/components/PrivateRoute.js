import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser === undefined) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se verifica el usuario
  }

  return currentUser ? children : <Navigate to="/" />;
};

export default PrivateRoute;