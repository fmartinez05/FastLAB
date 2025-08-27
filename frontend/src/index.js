import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async'; // <-- 1. Importar

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider> {/* <-- 2. Envolver la aplicación */}
      <App />
    </HelmetProvider>
  </React.StrictMode>
);