import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadPDF, getUserReports } from '../api';
import AppHeader from '../components/AppHeader'; // <-- Importamos el nuevo header

const DashboardPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            setError('');
            try {
                const response = await getUserReports();
                setReports(response.data.reports);
            } catch (err) {
                setError("No se pudieron cargar los informes.");
                console.error("Error fetching reports:", err);
            } finally {
                setIsLoading(false);
            }
        };
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
            setError("Error al analizar el PDF. Inténtalo de nuevo.");
            console.error("Error analyzing PDF:", err);
        } finally {
            setIsUploading(false);
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
                                    <div className="report-card" key={report.report_id} onClick={() => navigate(`/lab/${report.report_id}`)}>
                                        <h4>{report.filename}</h4>
                                        <p>{report.summary ? `${report.summary.substring(0, 120)}...` : 'Sin resumen.'}</p>
                                    </div>
                                )) : <p>No tienes informes guardados. ¡Sube un guion para empezar!</p>}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
};

export default DashboardPage;