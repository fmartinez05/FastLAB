import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const AppHeader = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="app-logo-container">
        <img src="/fastlab_logo.png" alt="FastLAB Logo" className="app-logo" />
        <span>FastLAB</span>
      </div>
      <div className="user-controls">
        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default AppHeader;