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
      {/* MODIFICACIÓN: La navegación ahora apunta a "/" (la portada) en lugar de "/dashboard". */}
      <div 
        className="app-logo-container" 
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        <img src="/fastlab_logo.png" alt="FastLAB Logo" className="app-logo" />
        <span>LabNote</span>
      </div>
      <div className="user-controls">
        {currentUser && <span>{currentUser.displayName}</span>}
        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default AppHeader;