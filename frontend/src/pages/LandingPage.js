import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../utils/auth';
import Footer from '../components/Footer';

// === CONFIGURACIÓN DE IMÁGENES DEL CARRUSEL ===
// Asegúrate de tener estas imágenes en tu carpeta 'public'
// O cambia estos nombres por los de tus imágenes reales.
const carouselImages = [
    "/fastlab_logo.png",       // Imagen 1 (Usando tu logo como placeholder temporal)
    "/mockup_dashboard.png", // Imagen 2: Debería ser una captura de tu dashboard
    "/mockup_report.png"     // Imagen 3: Debería ser una captura de un reporte
];

const LandingPage = () => {
  const navigate = useNavigate();
  // Estado para controlar qué imagen del carrusel se muestra
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Efecto para cambiar la imagen automáticamente cada varios segundos
  useEffect(() => {
      // Configurar el intervalo (ej. 4000ms = 4 segundos)
      const intervalId = setInterval(() => {
          setCurrentImageIndex((prevIndex) => 
              // Incrementa el índice, y usa módulo (%) para volver a 0 al llegar al final
              (prevIndex + 1) % carouselImages.length
          );
      }, 4000); 

      // Limpieza: detener el intervalo cuando el componente se desmonta
      return () => clearInterval(intervalId);
  }, []); // El array vacío asegura que esto solo se configure una vez al montar

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
      {/* Barra de Navegación Superior */}
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
            <button className="login-button-nav" onClick={handleLogin}>
            Iniciar sesión
            </button>
        </div>
      </nav>

      {/* Sección Principal (Hero) Estilo Split */}
      <main>
        <div className="hero-wrapper">
            {/* Columna Izquierda: Texto y CTA */}
            <div className="hero-content-left">
                <span className="pre-headline">Tu cuaderno de laboratorio digital</span>
                <h1>Analiza tus prácticas de bioquímica con IA</h1>
                
                <ul className="hero-checklist">
                    <li>
                        <span className="check-icon">✓</span>
                        Análisis de guiones en PDF al instante
                    </li>
                    <li>
                        <span className="check-icon">✓</span>
                        Generación de informes profesionales
                    </li>
                    <li>
                        <span className="check-icon">✓</span>
                        Cálculos de estequiometría automáticos
                    </li>
                </ul>

                <div className="hero-cta-block">
                    <button className="cta-button-main" onClick={handleLogin}>
                        Comenzar gratis
                    </button>
                    <span className="cta-subtext">
                        Sin tarjeta de crédito • Acceso inmediato
                    </span>
                </div>
            </div>

            {/* Columna Derecha: CARRUSEL DE IMÁGENES */}
            <div className="hero-content-right">
                {/* Forma abstracta de fondo */}
                <div className="hero-blob-bg"></div>
                
                {/* Contenedor "marco" que recorta el contenido */}
                <div className="carousel-viewport">
                    {/* La "pista" que se mueve lateralmente usando CSS transform */}
                    <div 
                        className="carousel-track" 
                        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                        {/* Mapeamos el array de imágenes */}
                        {carouselImages.map((imgSrc, index) => (
                            <img 
                                key={index} 
                                src={imgSrc} 
                                alt={`Vista previa de LabNote pantalla ${index + 1}`} 
                                className="carousel-image-item" 
                                // Añadimos un pequeño padding si usamos el logo para que no se pegue a los bordes
                                style={imgSrc.includes('logo') ? { padding: '2rem', objectFit: 'contain' } : {}}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Sección de Ventajas (Grid) */}
        <section className="features-section">
          <h2>Potencia tu trabajo en el laboratorio</h2>
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
