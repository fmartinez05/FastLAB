import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDF, getUserReports, deleteReport } from '../api';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const fetchReports = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await getUserReports();
            setReports(response.data.reports || []); // Aseguramos que sea un array
        } catch (err) {
            setError("No se pudieron cargar los informes.");
            console.error("Error fetching reports:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);
    
    const handleFileUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        setError('');
        try {
            const response = await uploadPDF(file);
            navigate(`/lab/${response.data.report_id}`);
        } catch (err) {
            setError("Error al analizar el PDF. Asegúrate de que el archivo es válido.");
            console.error("Error uploading PDF:", err);
        } finally {
            setIsUploading(false);
        }
    };
    
    // --- FUNCIÓN DE BORRADO MEJORADA ---
    const handleDelete = async (reportId, filename) => {
        if (window.confirm(`¿Estás seguro de que quieres borrar el informe "${filename}"? Esta acción no se puede deshacer.`)) {
            try {
                // Actualización optimista: removemos el informe de la UI inmediatamente
                setReports(prevReports => prevReports.filter(report => report.report_id !== reportId));
                // Hacemos la llamada a la API en segundo plano
                await deleteReport(reportId);
            } catch (err) {
                setError("Error al borrar el informe. Se restaurará la lista.");
                console.error("Error deleting report:", err);
                // Si la API falla, revertimos el cambio recargando los informes del servidor
                fetchReports();
            }
        }
    };

    return (
        <>
            <AppHeader />
            <div className="App">
                <section>
                    <div className="new-report-section">
                        <h3>Crear un nuevo informe de laboratorio</h3>
                        <p>Sube un guion de prácticas en formato PDF para empezar.</p>
                        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                        {/* --- AÑADIMOS FEEDBACK DEL ARCHIVO SELECCIONADO --- */}
                        {file && <p style={{fontWeight: '500', color: '#2d3748'}}>Archivo seleccionado: {file.name}</p>}
                        <button onClick={handleFileUpload} disabled={!file || isUploading}>
                            {isUploading ? 'Analizando...' : 'Analizar Nuevo Guion'}
                        </button>
                    </div>
                    {error && <p className="error">{error}</p>}
                    <div className="saved-reports-section">
                        <h3>Mis Informes Guardados</h3>
                        {isLoading ? <p>Cargando informes...</p> : (
                            <div className="dashboard-grid">
                                {reports.length > 0 ? reports.map(report => (
                                    <div className="report-card" key={report.report_id}>
                                        <div onClick={() => navigate(`/lab/${report.report_id}`)} style={{cursor: 'pointer', flexGrow: 1}}>
                                            <h4>{report.filename}</h4>
                                            <p>{report.summary ? `${report.summary.substring(0, 120)}...` : 'Sin resumen.'}</p>
                                        </div>
                                        <button 
                                            className="delete-button" 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evita que el click se propague a la tarjeta
                                                handleDelete(report.report_id, report.filename);
                                            }}
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                )) : <p>No tienes informes guardados.</p>}
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default DashboardPage;