import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDF, getUserReports, deleteReport } from '../api'; // Importamos deleteReport
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
            setReports(response.data.reports);
        } catch (err) {
            setError("No se pudieron cargar los informes.");
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
            setError("Error al analizar el PDF.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (reportId, filename) => {
        if (window.confirm(`¿Estás seguro de que quieres borrar el informe "${filename}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteReport(reportId);
                fetchReports(); // Volvemos a cargar la lista de informes desde el servidor
            } catch (err) {
                setError("Error al borrar el informe.");
                console.error("Error deleting report:", err);
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
                                                e.stopPropagation();
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