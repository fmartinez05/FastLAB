import React from 'react';

// Estilos (sin cambios)
const resultItemStyle = { marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fdfdfd' };
const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#34495e' };
const inputStyle = { width: '95%', padding: '10px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc' };

const ResultsAnnotation = ({ prompts, results, dispatch, calculatedData = {} }) => {

  const handleTextChange = (index, value) => {
    // Usamos una actualización funcional para obtener los resultados más recientes
    const newResults = [...(results || [])];
    if (!newResults[index]) {
        newResults[index] = { prompt: prompts[index] };
    }
    newResults[index].value = value;
    dispatch({ type: 'UPDATE_SPECIFIC_RESULTS', payload: newResults });
  };

  const getCalculatedValue = (prompt) => {
    if (prompt.includes("(Vt)") && calculatedData.Vt) return calculatedData.Vt;
    if (prompt.includes("(Kav)") && calculatedData.Kav_B12) return calculatedData.Kav_B12;
    return null;
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>📊 Anotación de Resultados</h3>
      <p>La IA ha determinado que estos son los datos clave a registrar. Por favor, complétalos.</p>
      {Array.isArray(prompts) && prompts.map((prompt, index) => {
        const calculatedValue = getCalculatedValue(prompt);
        const isCalculated = calculatedValue !== null;

        return (
          <div key={index} style={resultItemStyle}>
            <label style={labelStyle}>{prompt}</label>
            <input
              type="text"
              style={{ ...inputStyle, backgroundColor: isCalculated ? '#e9ecef' : 'white', color: isCalculated ? '#495057' : 'inherit' }}
              value={isCalculated ? calculatedValue : (results && results[index]?.value) || ''}
              onChange={(e) => !isCalculated && handleTextChange(index, e.target.value)}
              placeholder="Introduce el valor o la observación aquí..."
              readOnly={isCalculated}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ResultsAnnotation;