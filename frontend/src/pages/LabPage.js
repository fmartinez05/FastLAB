import React, { useState, useEffect, useReducer } from 'react'; // --- CORRECCIÓN 1: Se ha eliminado 'useCallback' que no se usaba.
import { useParams, useNavigate } from 'react-router-dom';
import { loadReport, downloadReport, downloadReportCSV } from '../api';
import { useAutosave } from '../hooks/useAutosave';

import AppHeader from '../components/AppHeader';
import ProfessorNotes from '../components/ProfessorNotes';
import CalculationSolver from '../components/CalculationSolver';
import ProcedureList from '../components/ProcedureList';
import ResultsAnnotation from '../components/ResultsAnnotation';
import StandardCurve from '../components/StandardCurve';
import AiAssistant from '../components/AiAssistant';
import Footer from '../components/Footer';

const reportReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        ...action.payload,
        annotations: action.payload.annotations || [],
        professor_notes: action.payload.professor_notes || { text: '', drawing: null },
        specific_results: action.payload.specific_results || [],
        materials: action.payload.materials || {},
        calculated_data: action.payload.calculated_data || {},
        standard_curve_data: action.payload.standard_curve_data || [],
        standard_curve_image: action.payload.standard_curve_image || null
      };
    case 'UPDATE_PROFESSOR_NOTES':
      return { ...state, professor_notes: action.payload };
    case 'UPDATE_ANNOTATIONS':
      return { ...state, annotations: action.payload };
    case 'UPDATE_SPECIFIC_RESULTS':
      return { ...state, specific_results: action.payload };
    case 'UPDATE_STANDARD_CURVE_DATA':
        // Renombrado para evitar conflicto con el siguiente
        const { setData, ...restOfAction } = action;
        return { ...state, standard_curve_data: restOfAction.payload };
    case 'UPDATE_STANDARD_CURVE_IMAGE':
        // Renombrado para evitar conflicto
        const { onImageSave, ...restOfActionImage } = action;
        return { ...state, standard_curve_image: restOfActionImage.payload };
    case 'SET_CALCULATED_DATA':
        return { ...state, calculated_data: action.payload };
    default:
      return state;
  }
};


const LabPage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    
    const [reportData, dispatch] = useReducer(reportReducer, null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useAutosave(reportId, reportData, setIsSaving);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const response = await loadReport(reportId);
                dispatch({ type: 'SET_INITIAL_DATA', payload: response.data });
            } catch (err) {
                setError("Error: No se pudo cargar el informe.");
                console.error("Error loading report:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [reportId]);
    
    useEffect(() => {
        if (!Array.isArray(reportData?.specific_results)) return;

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
            dispatch({ type: 'SET_CALCULATED_DATA', payload: newCalculatedData });
        }
    }, [reportData?.specific_results, reportData?.calculated_data]);
    
    // --- CORRECCIÓN 2: Se ha restaurado el contenido de las funciones de descarga ---
    const handleGeneratePdf = async () => {
        setIsLoading(true); // Puedes usar un estado de carga específico si lo prefieres
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
    
    const StandardCurveWrapper = ({ data, dispatch }) => (
        <StandardCurve
            data={data}
            setData={(newData) => dispatch({ type: 'UPDATE_STANDARD_CURVE_DATA', payload: newData })}
            onImageSave={(base64) => dispatch({ type: 'UPDATE_STANDARD_CURVE_IMAGE', payload: base64 })}
        />
    );


    return (
        <>
            <AppHeader />
            <div className="App">
                <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1>{reportData.filename}</h1>
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
                        dispatch={dispatch} 
                    />
                    <CalculationSolver />
                    
                    <h2>🔬 Procedimiento Interactivo</h2>
                    <ProcedureList 
                        steps={reportData.procedure} 
                        annotations={reportData.annotations} 
                        dispatch={dispatch} 
                    />
                    
                    <h2>Anotación de Resultados</h2>
                    <ResultsAnnotation 
                        prompts={reportData.results_prompts}
                        results={reportData.specific_results}
                        dispatch={dispatch}
                        calculatedData={reportData.calculated_data}
                    />
                    
                    <StandardCurveWrapper
                        data={reportData.standard_curve_data}
                        dispatch={dispatch}
                    />
                    
                    <hr style={{ margin: '2rem 0' }} />

                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                        <button onClick={handleGeneratePdf} disabled={isLoading} className="generate-report-button" style={{flex: 2}}>
                            {isLoading ? 'Generando PDF...' : '📄 Generar y Descargar Informe Final'}
                        </button>
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