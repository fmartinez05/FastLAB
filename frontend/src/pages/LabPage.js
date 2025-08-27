import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// --- CORRECCIÓN DE NOMBRES EN LA LÍNEA SIGUIENTE ---
import { loadReport, saveReport, downloadReport } from '../api';
import ProfessorNotes from '../components/ProfessorNotes';
import CalculationSolver from '../components/CalculationSolver';
import ProcedureList from '../components/ProcedureList';
import ResultsAnnotation from '../components/ResultsAnnotation';
import AppHeader from '../components/AppHeader';

const LabPage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        try {
            // --- Usamos el nombre correcto de la función ---
            const response = await loadReport(reportId);
            const data = response.data;
            setReportData({
                ...data,
                annotations: data.annotations || [],
                professor_notes: data.professor_notes || { text: '' },
                specific_results: data.specific_results || [],
            });
        } catch (err) {
            setError("Error: No se pudo cargar el informe.");
            console.error("Error loading report:", err);
        } finally {
            setIsLoading(false);
        }
    }, [reportId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateReportData = (field, value) => {
        setReportData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveReport(reportId, reportData);
            alert("¡Progreso guardado con éxito!");
        } catch (err) {
            alert("Error al guardar el informe.");
            console.error("Error saving report:", err);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleGeneratePdf = async () => {
        setIsLoading(true);
        try {
            // --- Usamos el nombre correcto de la función ---
            const response = await downloadReport(reportId, reportData);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = reportData.filename.replace('.pdf', '') || 'informe';
            link.setAttribute('download', `${filename}_fastlab.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error al generar el PDF.');
            console.error('Error generating PDF', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="loading-app">Cargando laboratorio...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!reportData) return <div>No se encontraron datos para este informe.</div>;

    return (
        <>
            <AppHeader />
            <div className="App">
                <header>
                    <h1>{reportData.filename}</h1>
                </header>
                
                <button onClick={() => navigate('/dashboard')} style={{marginBottom: '2rem'}}>← Volver al Panel</button>

                <section>
                    <h2>Fundamento y Datos Clave</h2>
                    <div className="summary">
                        <h3>Fundamento Científico</h3>
                        <p>{reportData.summary}</p>
                    </div>
                    <ProfessorNotes 
                        notes={reportData.professor_notes} 
                        setNotes={(value) => updateReportData('professor_notes', value)} 
                    />
                    <CalculationSolver />
                    
                    <h2>Procedimiento Interactivo</h2>
                    <ProcedureList 
                        steps={reportData.procedure} 
                        annotations={reportData.annotations} 
                        setAnnotations={(value) => updateReportData('annotations', value)} 
                    />
                    
                    <h2>Anotación de Resultados</h2>
                    <ResultsAnnotation 
                        prompts={reportData.results_prompts}
                        results={reportData.specific_results}
                        setResults={(value) => updateReportData('specific_results', value)}
                    />
                    
                    <hr style={{ margin: '2rem 0' }} />

                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                        <button onClick={handleSave} disabled={isSaving || isLoading} style={{flex: 1, backgroundColor: '#5c6bc0'}}>
                            {isSaving ? 'Guardando...' : '💾 Guardar Progreso'}
                        </button>
                        <button onClick={handleGeneratePdf} disabled={isLoading || isSaving} className="generate-report-button">
                            {isLoading ? 'Generando PDF...' : '📄 Generar y Descargar Informe Final'}
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
};

export default LabPage;