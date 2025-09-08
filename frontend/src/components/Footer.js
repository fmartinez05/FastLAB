import React, { useState, useEffect } from 'react';

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Actualiza el año en el copyright (aunque solo se ejecutará una vez)
    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    // Efecto para bloquear el scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // Cleanup function para reestablecer el scroll si el componente se desmonta
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);


    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    // Componente de icono en línea para evitar la necesidad de archivos SVG separados
    const LinkedInIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
        </svg>
    );

    const CloseIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    );

    return (
        <>
            <footer className="site-footer">
                <div className="footer-content">
                    <div className="footer-grid">
                        {/* Sección Fundador */}
                        <div className="footer-section">
                            <h3>Fundador</h3>
                            <p>Francisco Martínez del Águila</p>
                            <p className="founder-description">Estudiante de Bioquímica en la Universidad de Granada</p>
                            <a href="https://www.linkedin.com/in/francisco-martinez-del-aguila-758873318/" target="_blank" rel="noopener noreferrer" className="footer-link">
                                <LinkedInIcon />
                                <span>Perfil de LinkedIn</span>
                            </a>
                        </div>

                        {/* Sección Legal */}
                        <div className="footer-section">
                            <h3>Legal</h3>
                            <button onClick={toggleModal} className="footer-link-button">
                                Políticas de Privacidad
                            </button>
                            {/* --- CORRECCIÓN: Enlace del Blog movido a su lugar correcto --- */}
                            <a href="/blog" className="footer-link-button">
                                Blog
                            </a>
                        </div>

                        {/* Sección Logo/Nombre */}
                        <div className="footer-section logo-section">
                            <h2>LabNote</h2>
                            <p>Solución inmediata para ciencias</p>
                        </div>
                    </div>
                    <div className="footer-copyright">
                        <p>&copy; {currentYear} LabNote - Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>

            {isModalOpen && (
                <div className="modal-backdrop" onClick={toggleModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Política de Privacidad</h2>
                            <button onClick={toggleModal} className="modal-close-button">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                           <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

                            <p>En LabNote, nos comprometemos a proteger y respetar su privacidad. Esta política establece las bases sobre las cuales cualquier dato personal que recopilemos de usted, o que usted nos proporcione, será procesado por nosotros.</p>

                            <h4>1. Responsable del Tratamiento</h4>
                            <p>El responsable del tratamiento de sus datos es Francisco Martínez del Águila (en adelante, "LabNote").</p>

                            <h4>2. Normativa Aplicable</h4>
                            <p>Este sitio web se adhiere estrictamente a la legislación vigente en materia de protección de datos para garantizar la seguridad, integridad y confidencialidad de los datos personales de los usuarios. La normativa de referencia incluye:</p>
                            <ul>
                                <li><strong>Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016</strong>, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos (Reglamento General de Protección de Datos o RGPD).</li>
                                <li><strong>Ley Orgánica 3/2018, de 5 de diciembre</strong>, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).</li>
                                <li><strong>Ley 34/2002, de 11 de julio</strong>, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).</li>
                            </ul>
                            <p>LabNote cumple y se compromete con el cumplimiento de esta normativa, sin perjuicio del deber de cumplimiento de otras normativas específicas o sectoriales no mencionadas.</p>
                             <h4>3. Finalidad del Tratamiento de Datos</h4>
                             <p>Los datos personales que podamos recopilar a través de formularios de contacto o correo electrónico serán utilizados exclusivamente para:</p>
                             <ul>
                                 <li>Gestionar la comunicación con los usuarios y responder a sus consultas o solicitudes de información.</li>
                                 <li>Proveer los servicios solicitados y realizar la gestión administrativa y comercial correspondiente.</li>
                             </ul>
                             <p>No se tomarán decisiones automatizadas ni se elaborarán perfiles con sus datos.</p>

                             <h4>4. Legitimación para el Tratamiento</h4>
                             <p>La base legal para el tratamiento de sus datos es su consentimiento explícito, otorgado al aceptar esta política de privacidad antes de enviar una consulta o contactar con nosotros.</p>

                             <h4>5. Conservación de los Datos</h4>
                             <p>Los datos se conservarán durante el tiempo estrictamente necesario para cumplir con la finalidad para la que fueron recabados y para determinar las posibles responsabilidades que se pudieran derivar de dicha finalidad.</p>

                             <h4>6. Derechos de los Interesados</h4>
                             <p>Usted tiene derecho a obtener confirmación sobre si en LabNote estamos tratando sus datos personales. Asimismo, tiene derecho a acceder a sus datos personales, solicitar la rectificación de los datos inexactos o, en su caso, solicitar su supresión cuando, entre otros motivos, los datos ya no sean necesarios para los fines que fueron recogidos. Podrá ejercer dichos derechos contactándonos a través de los medios indicados en este sitio web.</p>

                             <h4>7. Seguridad de los Datos</h4>
                             <p>LabNote adopta los niveles de seguridad requeridos por el RGPD adecuados a la naturaleza de los datos que son objeto de tratamiento en cada momento, garantizando la confidencialidad, integridad y disponibilidad de los mismos.</p>

                             <h4>8. Cambios en la Política de Privacidad</h4>
                             <p>Nos reservamos el derecho a modificar la presente política para adaptarla a novedades legislativas o jurisprudenciales. En dichos supuestos, se anunciarán en esta página los cambios introducidos con razonable antelación a su puesta en práctica.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;