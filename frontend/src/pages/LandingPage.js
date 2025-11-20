import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../utils/auth';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

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
          {/* Logo pequeño */}
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
                
                {/* Lista de beneficios estilo "Check" */}
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

            {/* Columna Derecha: Imagen Visual */}
            <div className="hero-content-right">
                {/* Forma abstracta de fondo */}
                <div className="hero-blob-bg"></div>
                
                {/* AQUÍ: Reemplaza esta imagen con una captura de tu app o un 'laptop mockup' para que se vea pro */}
                <img 
                    src="/fastlab_logo.png" 
                    alt="Vista previa de LabNote" 
                    className="hero-image-mockup" 
                    style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }} 
                />
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
