import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadReport, downloadReport, downloadReportCSV } from '../api';
import { useAutosave } from '../hooks/useAutosave'; // Asumiendo que has creado este hook

// Importamos todos los componentes necesarios
import AppHeader from '../components/AppHeader';
import ProfessorNotes from '../components/ProfessorNotes';
import CalculationSolver from '../components/CalculationSolver';
import ProcedureList from '../components/ProcedureList';
import ResultsAnnotation from '../components/ResultsAnnotation';
import StandardCurve from '../components/StandardCurve'; // Componente de la gráfica
import AiAssistant from '../components/AiAssistant';
import Footer from '../components/Footer';

const LabPage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // Estado para el feedback visual
    const [error, setError] = useState('');

    // --- 1. HOOK DE AUTOGUARDADO ---
    useAutosave(reportId, reportData, setIsSaving);

    // Carga inicial de los datos del informe
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await loadReport(reportId);
            const data = response.data;
            // Aseguramos que todos los campos, incluidos los nuevos, estén inicializados
            setReportData({
                ...data,
                annotations: data.annotations || [],
                professor_notes: data.professor_notes || { text: '', drawing: null },
                specific_results: data.specific_results || [],
                materials: data.materials || {},
                calculated_data: data.calculated_data || {},
                standard_curve_data: data.standard_curve_data || [],
                standard_curve_image: data.standard_curve_image || null
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
    
    // --- 2. LÓGICA DE CÁLCULOS PROACTIVOS ---
    useEffect(() => {
        if (!reportData?.specific_results) return;

        const results = reportData.specific_results;
        const getResultValue = (promptPart) => {
            const result = results.find(r => r && r.prompt?.toLowerCase().includes(promptPart.toLowerCase()));
            return result ? parseFloat(result.value) : NaN;
        };

        const radiusCm = getResultValue("radio de la columna (cm)");
        const heightCm = getResultValue("altura del lecho cromatográfico (cm)");
        const vo = getResultValue("volumen de elución del azul de dextrano (ml) (vo)");
        const veB12 = getResultValue("volumen de elución de la vitamina b12 (ml)");
        
        const newCalculatedData = { ...reportData.calculated_data };
        let hasChanged = false;

        if (!isNaN(radiusCm) && !isNaN(heightCm)) {
            const vt = (Math.PI * Math.pow(radiusCm, 2) * heightCm).toFixed(2);
            if (newCalculatedData.Vt !== vt) {
                newCalculatedData.Vt = vt;
                hasChanged = true;
            }
        }
        
        if (!isNaN(vo) && newCalculatedData.Vt && !isNaN(veB12)) {
            const kav = ((veB12 - vo) / (parseFloat(newCalculatedData.Vt) - vo)).toFixed(3);
            if (newCalculatedData.Kav_B12 !== kav) {
                newCalculatedData.Kav_B12 = kav;
                hasChanged = true;
            }
        }
        
        if (hasChanged) {
            setReportData(prev => ({ ...prev, calculated_data: newCalculatedData }));
        }
    }, [reportData?.specific_results, reportData?.calculated_data]);


    const updateReportData = useCallback((field, value) => {
        setReportData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleGeneratePdf = async () => {
        setIsLoading(true);
        try {
            const response = await downloadReport(reportId, reportData);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = reportData.filename.replace('.pdf', '') || 'informe';
            link.setAttribute('download', `${filename}_labnote.pdf`);
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
    
    // --- 3. FUNCIÓN PARA DESCARGAR CSV ---
    const handleDownloadCSV = async () => {
        try {
          const response = await downloadReportCSV(reportId, reportData);
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `datos_informe_${reportId}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (err) {
          alert('Error al descargar el CSV.');
          console.error("Error downloading CSV", err);
        }
    };

    if (isLoading && !reportData) return <div className="loading-app">Cargando laboratorio...</div>;
    if (error) return <div className="App"><AppHeader /><p className="error">{error}</p></div>;
    if (!reportData) return <div>No se encontraron datos para este informe.</div>;

    const hasMaterials = reportData.materials && 
        Object.values(reportData.materials).some(category => Array.isArray(category) && category.length > 0);

    return (
        <>
            <AppHeader />
            <div className="App">
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1>{reportData.filename}</h1>
                    {/* --- 4. INDICADOR DE AUTOGUARDADO --- */}
                    <span style={{color: isSaving ? '#3182CE' : '#27ae60', transition: 'color 0.5s ease', fontWeight: '500'}}>
                        {isSaving ? 'Guardando...' : 'Progreso Guardado ✓'}
                    </span>
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
                    
                    {hasMaterials && (
                        <section>
                            <h2>🧪 Materiales y Reactivos</h2>
                            {Object.keys(reportData.materials).map(category => (
                                reportData.materials[category].length > 0 && (
                                    <div key={category} style={{marginBottom: '1.5rem'}}>
                                        <h3 style={{textTransform: 'capitalize', fontSize: '1.2rem', marginBottom: '0.5rem'}}>
                                            {category.replace('_', ' ')}
                                        </h3>
                                        <ul style={{marginTop: 0, paddingLeft: '20px'}}>
                                            {reportData.materials[category].map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            ))}
                        </section>
                    )}
                    
                    <h2>🔬 Procedimiento Interactivo</h2>
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
                        calculatedData={reportData.calculated_data}
                    />
                    
                    {/* --- 5. COMPONENTE DE LA GRÁFICA --- */}
                    <StandardCurve
                        data={reportData.standard_curve_data}
                        setData={(newData) => updateReportData('standard_curve_data', newData)}
                        onImageSave={(base64) => updateReportData('standard_curve_image', base64)}
                    />
                    
                    <hr style={{ margin: '2rem 0' }} />

                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                        <button onClick={handleGeneratePdf} disabled={isLoading} className="generate-report-button" style={{flex: 2}}>
                            {isLoading ? 'Generando PDF...' : '📄 Generar y Descargar Informe Final'}
                        </button>
                        {/* --- 6. BOTÓN DE EXPORTACIÓN CSV --- */}
                        <button onClick={handleDownloadCSV} disabled={isLoading} style={{flex: 1, backgroundColor: '#f39c12'}}>
                            📊 Descargar Datos (CSV)
                        </button>
                    </div>
                </section>
            </div>
            <AiAssistant practiceContext={reportData.full_text} />
	    <Footer />
        </>
    );
};

export default LabPage;