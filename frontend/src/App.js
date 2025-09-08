import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LabPage from './pages/LabPage';
import PrivateRoute from './components/PrivateRoute';

// --- CORRECCIÓN DE IMPORTACIONES ---
// Se importa el componente de la página del blog, no el contenido.
import BlogPage from './pages/BlogPage'; 
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

          {/* --- CORRECCIÓN DE RUTAS --- */}
          {/* La ruta renderiza el componente <BlogPage />, no el objeto blogContent */}
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;