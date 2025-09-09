import React, { useState, useEffect, useReducer } from 'react';
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

// --- REDUCER MEJORADO: Ahora maneja acciones específicas y detalladas ---
const reportReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        ...action.payload,
        annotations: action.payload.annotations || [],
        professor_notes: action.payload.professor_notes || { text: '', drawing: null },
        specific_results: action.payload.specific_results || [],
        standard_curve_data: action.payload.standard_curve_data || [],
      };

    case 'UPDATE_PROFESSOR_NOTE_TEXT':
      return { ...state, professor_notes: { ...state.professor_notes, text: action.payload } };
    
    case 'UPDATE_PROFESSOR_NOTE_DRAWING':
      return { ...state, professor_notes: { ...state.professor_notes, drawing: action.payload } };

    case 'UPDATE_SINGLE_RESULT': {
      const newResults = [...(state.specific_results || [])];
      if (!newResults[action.index]) {
        newResults[action.index] = { prompt: action.prompt };
      }
      newResults[action.index].value = action.payload;
      return { ...state, specific_results: newResults };
    }

    case 'TOGGLE_PROCEDURE_STEP': {
        const newAnnotations = [...(state.annotations || [])];
        if (!newAnnotations[action.index]) {
            newAnnotations[action.index] = { step: action.step, completed: false, text: '', drawing: null };
        }
        newAnnotations[action.index].completed = !newAnnotations[action.index].completed;
        return { ...state, annotations: newAnnotations };
    }

    case 'UPDATE_PROCEDURE_ANNOTATION': {
        const newAnnotations = [...(state.annotations || [])];
        if (!newAnnotations[action.index]) {
            newAnnotations[action.index] = { step: action.step, completed: false };
        }
        newAnnotations[action.index] = { ...newAnnotations[action.index], ...action.payload };
        return { ...state, annotations: newAnnotations };
    }

    case 'UPDATE_STANDARD_CURVE_DATA':
      return { ...state, standard_curve_data: action.payload };

    case 'UPDATE_STANDARD_CURVE_IMAGE':
      return { ...state, standard_curve_image: action.payload };

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
        const loadData = async () => { /* ...código sin cambios... */ };
        loadData();
    }, [reportId]);
    
    useEffect(() => {
        if (!Array.isArray(reportData?.specific_results)) return;
        // ... Lógica de cálculos proactivos (sin cambios) ...
    }, [reportData?.specific_results, reportData?.calculated_data]);
    
    const handleGeneratePdf = async () => { /* ...código sin cambios... */ };
    const handleDownloadCSV = async () => { /* ...código sin cambios... */ };

    if (isLoading && !reportData) return <div className="loading-app">Cargando laboratorio...</div>;
    if (error) return <div className="App"><AppHeader /><p className="error">{error}</p></div>;
    if (!reportData) return <div>No se encontraron datos para este informe.</div>;
    
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
                    <div className="summary"><h3>Fundamento Científico</h3><p>{reportData.summary}</p></div>
                    <ProfessorNotes notes={reportData.professor_notes} dispatch={dispatch} />
                    <CalculationSolver />
                    
                    <h2>🔬 Procedimiento Interactivo</h2>
                    <ProcedureList steps={reportData.procedure} annotations={reportData.annotations} dispatch={dispatch} />
                    
                    <h2>Anotación de Resultados</h2>
                    <ResultsAnnotation prompts={reportData.results_prompts} results={reportData.specific_results} dispatch={dispatch} calculatedData={reportData.calculated_data} />
                    
                    <h2>📈 Recta de Calibrado</h2>
                    <StandardCurve data={reportData.standard_curve_data} dispatch={dispatch} />
                    
                    <hr style={{ margin: '2rem 0' }} />
                    <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                        <button onClick={handleGeneratePdf} disabled={isLoading} className="generate-report-button" style={{flex: 2}}>📄 Generar y Descargar Informe Final</button>
                        <button onClick={handleDownloadCSV} disabled={isLoading} style={{flex: 1, backgroundColor: '#f39c12'}}>📊 Descargar Datos (CSV)</button>
                    </div>
                </section>
            </div>
            <AiAssistant practiceContext={reportData.full_text} />
	        <Footer />
        </>
    );
};

export default LabPage;