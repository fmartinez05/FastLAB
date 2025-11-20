import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../utils/auth';
import Footer from '../components/Footer';

// Imágenes seleccionadas de Unsplash (Laboratorio, Análisis, Tablet científica)
const carouselImages = [
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
];

const LandingPage = () => {
  const navigate = useNavigate();
  // Estado para el carrusel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Efecto para cambiar la imagen cada 4 segundos
  useEffect(() => {
      const intervalId = setInterval(() => {
          setCurrentImageIndex((prevIndex) => 
              (prevIndex + 1) % carouselImages.length
          );
      }, 4000); 
      return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async () => {
    const user = await loginWithGoogle();
    if (user) {
      navigate('/dashboard');
    } else {
      alert("Hubo un error al intentar iniciar sesión. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="landing-container">
      {/* Barra de Navegación Mejorada */}
      <nav className="landing-nav">
        <div 
          className="landing-logo-container" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
        >
          <img src="/fastlab_logo.png" alt="FastLAB Logo" className="landing-logo" />
          <span>LabNote</span>
        </div>
        
        <div className="nav-actions">
            <a href="#features" className="nav-link">Ventajas</a>
            <button className="login-button-nav" onClick={handleLogin}>
               <span>Iniciar Sesión</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            </button>
        </div>
      </nav>

      <main>
        {/* Hero Section estilo Split (IONOS) */}
        <div className="hero-wrapper">
            {/* Columna Izquierda */}
            <div className="hero-content-left">
                <span className="pre-headline">Tu página web con dominio propio</span>
                <h1>Analiza tus prácticas de laboratorio en minutos</h1>
                
                <ul className="hero-checklist">
                    <li>
                        <span className="check-icon">✓</span>
                        Plantillas profesionales de informes
                    </li>
                    <li>
                        <span className="check-icon">✓</span>
                        Modificación del diseño con IA
                    </li>
                    <li>
                        <span className="check-icon">✓</span>
                        Cálculos y gráficas automáticos
                    </li>
                </ul>

                <div className="hero-cta-block">
                    <button className="cta-button-main" onClick={handleLogin}>
                        Ver packs ahora
                    </button>
                    <span className="cta-subtext">
                        Desde 0€/mes • IVA excl.
                    </span>
                </div>
            </div>

            {/* Columna Derecha: CARRUSEL AUTOMÁTICO */}
            <div className="hero-content-right">
                <div className="hero-blob-bg"></div>
                
                <div className="carousel-viewport">
                    <div 
                        className="carousel-track" 
                        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                        {carouselImages.map((imgSrc, index) => (
                            <img 
                                key={index} 
                                src={imgSrc} 
                                alt={`LabNote vista ${index + 1}`} 
                                className="carousel-image-item" 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Sección de Ventajas */}
        <section id="features" className="features-section">
          <h2>Todo lo que necesitas para tus prácticas</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔬 Análisis Profundo</h3>
              <p>La IA comprende tus guiones a nivel experto, identificando fundamentos, procedimientos y resultados clave.</p>
            </div>
            <div className="feature-card">
              <h3>🧮 Cero Errores</h3>
              <p>Desde diluciones hasta análisis complejos, la IA valida los cálculos eliminando el error humano.</p>
            </div>
            <div className="feature-card">
              <h3>✍️ Digitalización</h3>
              <p>Convierte tus notas manuales en informes estructurados y listos para presentar.</p>
            </div>
            <div className="feature-card">
              <h3>⚡ Velocidad</h3>
              <p>Reduce horas de redacción a minutos. Enfócate en entender el experimento, no en escribirlo.</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
