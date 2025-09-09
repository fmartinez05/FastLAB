import React from 'react';

const resultItemStyle = {
  marginBottom: '1.5rem',
  padding: '1rem',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  backgroundColor: '#fdfdfd'
};

const labelStyle = {
  display: 'block',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
  color: '#34495e'
};

const inputStyle = {
  width: '95%',
  padding: '10px',
  fontSize: '1rem',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

const ResultsAnnotation = ({ prompts, results, setResults }) => {

  const handleTextChange = (index, value) => {
    const newResults = [...results];
    // Aseguramos que el objeto exista antes de asignarle un valor
    if (!newResults[index]) {
        newResults[index] = { prompt: prompts[index] };
    }
    newResults[index].value = value;
    setResults(newResults);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>📊 Anotación de Resultados</h3>
      <p>La IA ha determinado que estos son los datos clave a registrar. Por favor, complétalos.</p>
      {prompts.map((prompt, index) => (
        <div key={index} style={resultItemStyle}>
          <label style={labelStyle}>{prompt}</label>
          <input
            type="text"
            style={inputStyle}
            value={results[index]?.value || ''}
            onChange={(e) => handleTextChange(index, e.target.value)}
            placeholder="Introduce el valor o la observación aquí..."
          />
          {/* Aquí se podría añadir un canvas para dibujar si fuera necesario */}
        </div>
      ))}
    </div>
  );
};

export default ResultsAnnotation;