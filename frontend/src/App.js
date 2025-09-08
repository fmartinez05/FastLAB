import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LabPage from './pages/LabPage';
import PrivateRoute from './components/PrivateRoute';

// --- 1. AÑADE LA IMPORTACIÓN DE LAS NUEVAS PÁGINAS DEL BLOG ---
import blogContent from './blog/blogContent';
import ArticlePage from './pages/ArticlePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- Tus rutas existentes no cambian --- */}
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/lab/:reportId" 
            element={
              <PrivateRoute>
                <LabPage />
              </PrivateRoute>
            } 
          />

          {/* --- 2. AÑADE LAS DOS NUEVAS RUTAS PARA EL BLOG --- */}
          <Route path="/blog" element={<blogContent />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;