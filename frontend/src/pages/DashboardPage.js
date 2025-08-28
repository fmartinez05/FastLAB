import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDF, getUserReports, deleteReport } from '../api'; // Importamos deleteReport
import AppHeader from '../components/AppHeader';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const fetchReports = async () => {
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
        // Pedimos confirmación al usuario
        if (window.confirm(`¿Estás seguro de que quieres borrar el informe "${filename}"? Esta acción no se puede deshacer.`)) {
            try {
                await deleteReport(reportId);
                // Actualizamos la lista de informes para reflejar el borrado
                setReports(reports.filter(r => r.report_id !== reportId));
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
                    {/* ... (sección para crear nuevo informe sin cambios) ... */}
                    <div className="saved-reports-section">
                        <h3>Mis Informes Guardados</h3>
                        {isLoading ? <p>Cargando informes...</p> : (
                            <div className="dashboard-grid">
                                {reports.length > 0 ? reports.map(report => (
                                    <div className="report-card" key={report.report_id}>
                                        <div onClick={() => navigate(`/lab/${report.report_id}`)}>
                                            <h4>{report.filename}</h4>
                                            <p>{report.summary ? `${report.summary.substring(0, 120)}...` : 'Sin resumen.'}</p>
                                        </div>
                                        {/* Botón de borrar */}
                                        <button 
                                            className="delete-button" 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evita que al pulsar se navegue al informe
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
        </>
    );
};

export default DashboardPage;