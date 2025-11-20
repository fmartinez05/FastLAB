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
          <img src="/fastlab_logo.png" alt="FastLAB Logo" className="landing-logo" />
          <span>LabNote</span>
        </div>
        <div className="nav-actions">
             <button className="login-text-btn" onClick={handleLogin}>Soporte</button>
             <button className="login-button-nav" onClick={handleLogin}>
              Iniciar Sesión
            </button>
        </div>
      </nav>

      {/* Sección Principal (Hero) - Estilo IONOS */}
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-subtitle">Tu asistente de laboratorio personal</p>
            <h1>Analiza tus prácticas de laboratorio en minutos</h1>
            
            <ul className="hero-benefits-list">
              <li>
                <span className="check-icon">✓</span>
                <span>Análisis de guiones con Inteligencia Artificial</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>Cálculos estequiométricos y diluciones automáticas</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>Generación de informes PDF profesionales</span>
              </li>
            </ul>

            <div className="hero-pricing">
              <span className="price-label">Empieza gratis hoy mismo</span>
            </div>

            <button className="cta-button" onClick={handleLogin}>
              Comenzar ahora
            </button>
            <p className="hero-note">* No se requiere tarjeta de crédito</p>
          </div>

          {/* Columna Derecha: Imagen o Mockup Visual */}
          <div className="hero-visual">
            <div className="visual-card-stack">
                <div className="visual-card back"></div>
                <div className="visual-card front">
                    {/* Si tienes una captura de pantalla de tu app, descomenta la línea de abajo y pon la ruta correcta */}
                    {/* <img src="/dashboard_screenshot.png" alt="App Interface" /> */}
                    <div className="mockup-placeholder">
                        <div className="mock-header"></div>
                        <div className="mock-body">
                            <div className="mock-line w-70"></div>
                            <div className="mock-line w-50"></div>
                            <div className="mock-graph"></div>
                        </div>
                        <div className="mock-badge">IA Ready</div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Sección de Ventajas (Grid) */}
        <section className="features-section">
          <h2>Potencia tu flujo de trabajo científico</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔬 Análisis Profundo</h3>
              <p>Nuestra IA identifica fundamentos, procedimientos y resultados clave al instante.</p>
            </div>
            <div className="feature-card">
              <h3>🧮 Cálculos Sin Errores</h3>
              <p>Olvídate de los errores en diluciones y análisis estequiométricos complejos.</p>
            </div>
            <div className="feature-card">
              <h3>✍️ Notas Inteligentes</h3>
              <p>Usa teclado o Apple Pencil. LabNote organiza tus anotaciones automáticamente.</p>
            </div>
            <div className="feature-card">
              <h3>📄 Informes PDF</h3>
              <p>Genera documentos listos para imprimir con estructura académica profesional.</p>
            </div>
             <div className="feature-card">
              <h3>☁️ Cloud Sync</h3>
              <p>Tus datos seguros y accesibles desde cualquier dispositivo, en cualquier lugar.</p>
            </div>
             <div className="feature-card">
              <h3>⚡ Productividad</h3>
              <p>Dedica tu tiempo a la ciencia y deja la burocracia a nuestra IA.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
