import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // 'useNavigate' has been removed
import { loadReport, downloadReport, downloadReportCSV } from '../api';
import { useAutosave } from '../hooks/useAutosave';
import AppHeader from '../components/AppHeader';
import ResultsAnnotation from '../components/ResultsAnnotation';
import StandardCurve from '../components/StandardCurve';
import AiAssistant from '../components/AiAssistant';

const LabPage = () => {
  const { reportId } = useParams();
  // 'navigate' has been removed as it was not used
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useAutosave(reportId, reportData, setIsSaving);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await loadReport(reportId);
        setReportData({
          ...response.data,
          calculated_data: response.data.calculated_data || {},
          standard_curve_data: response.data.standard_curve_data || [],
          standard_curve_image: response.data.standard_curve_image || null
        });
      } catch (err) {
        setError('No se pudo cargar el informe. Puede que no exista o no tengas permiso.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  useEffect(() => {
    if (!reportData?.specific_results) return;

    const results = reportData.specific_results;
    const getResultValue = (promptPart) => {
        const result = results.find(r => r && r.prompt?.includes(promptPart));
        return result ? parseFloat(result.value) : NaN;
    };
    
    const radiusCm = getResultValue("Radio de la columna (cm)");
    const heightCm = getResultValue("Altura del lecho cromatográfico (cm)");
    const vo = getResultValue("Volumen de elución del azul de dextrano (mL) (Vo)");
    const veB12 = getResultValue("Volumen de elución de la vitamina B12 (mL)");
    
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
    
    if(hasChanged) {
        setReportData(prev => ({ ...prev, calculated_data: newCalculatedData }));
    }

  // --- FIX APPLIED HERE: Added missing dependency ---
  }, [reportData?.specific_results, reportData?.calculated_data]);

  const handleDownloadPDF = async () => {
    try {
      const response = await downloadReport(reportId, reportData);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `informe_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al generar el PDF.');
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
      setError('Error al descargar el CSV.');
    }
  };

  const updateField = useCallback((field, value) => {
    setReportData(prevData => ({ ...prevData, [field]: value }));
  }, []);

  if (loading) return <div className="loading-app">Cargando tu sesión de laboratorio...</div>;
  if (error) return <div className="App"><AppHeader /><p className="error">{error}</p></div>;

  return (
    <>
      <AppHeader />
      <div className="App">
        <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>{reportData.filename}</h2>
          <span style={{color: isSaving ? '#3182CE' : '#27ae60', transition: 'color 0.5s ease'}}>
            {isSaving ? 'Guardando...' : 'Progreso Guardado ✓'}
          </span>
        </header>

        <section className="summary">
          <h3>Fundamento Científico</h3>
          <p>{reportData.summary}</p>
        </section>

        <ResultsAnnotation 
          prompts={reportData.results_prompts}
          results={reportData.specific_results}
          setResults={(newResults) => updateField('specific_results', newResults)}
          calculatedData={reportData.calculated_data}
        />

        <StandardCurve
          data={reportData.standard_curve_data}
          setData={(newData) => updateField('standard_curve_data', newData)}
          onImageSave={(base64) => updateField('standard_curve_image', base64)}
        />

        <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button onClick={handleDownloadPDF} className="generate-report-button">Generar Informe PDF</button>
          <button onClick={handleDownloadCSV} style={{backgroundColor: '#f39c12'}}>Descargar Datos (CSV)</button>
        </div>
      </div>
      <AiAssistant practiceContext={reportData.full_text || ''} />
    </>
  );
};

export default LabPage;