import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../utils/auth';

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
        {/* MODIFICACIÓN: El logo ahora es un botón para recargar la página de inicio. */}
        <div 
          className="landing-logo-container" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
        >
          <img src="/fastlab_logo.png" alt="FastLAB Logo" className="landing-logo" />
          <span>LabNote</span>
        </div>
        <button className="login-button-nav" onClick={handleLogin}>
          Iniciar Sesión
        </button>
      </nav>

      {/* Sección Principal (Hero) */}
      <main>
        <section className="hero-section">
          <h1>Analiza tus prácticas de laboratorio sin esfuerzo con IA</h1>
          <p>
            LabNote es la herramienta definitiva para estudiantes y profesionales de bioquímica. Sube tus guiones de prácticas y deja que nuestra inteligencia artificial haga el trabajo pesado.
          </p>
          <button className="cta-button" onClick={handleLogin}>
            Comenzar ahora
          </button>
        </section>

        {/* Sección de Ventajas */}
        <section className="features-section">
          <h2>¿Qué podrás conseguir apoyándote en LabNote?</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔬 Análisis Científico Profundo</h3>
              <p>Nuestra IA comprende tus guiones a nivel experto, identificando fundamentos, procedimientos y resultados clave.</p>
            </div>
            <div className="feature-card">
              <h3>🧮 Cálculos Sin Errores</h3>
              <p>Desde complejas diluciones hasta análisis estequiométricos, la IA realiza todos los cálculos necesarios, eliminando el error humano.</p>
            </div>
            <div className="feature-card">
              <h3>✍️ Anotaciones Inteligentes</h3>
              <p>Toma notas con teclado o Apple Pencil. LabNote organiza y analiza toda tu información para generar conclusiones.</p>
            </div>
            <div className="feature-card">
              <h3>📄 Informes Profesionales Automáticos</h3>
              <p>Con un solo clic, genera informes en PDF listos para imprimir, con una estructura profesional y basados en tus datos.</p>
            </div>
             <div className="feature-card">
              <h3>☁️ Guardado en la Nube</h3>
              <p>Todos tus informes y anotaciones se guardan de forma segura en tu cuenta, accesibles desde cualquier dispositivo.</p>
            </div>
             <div className="feature-card">
              <h3>⚡ Acelera tu Productividad</h3>
              <p>Dedica tu tiempo a las tareas donde de verdad marcas la diferencia y deja que la IA se encargue del resto.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;