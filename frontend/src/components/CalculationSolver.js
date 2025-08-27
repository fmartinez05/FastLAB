import React, { useState } from 'react';
import { solveCalculation } from '../api';

const solverStyle = {
  padding: '1.5rem',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  backgroundColor: '#f8f9fa',
  marginTop: '2rem'
};

const inputStyle = {
  width: '95%',
  padding: '10px',
  fontSize: '1rem',
  borderRadius: '5px',
  border: '1px solid #ccc',
  marginBottom: '1rem'
};

const resultStyle = {
    backgroundColor: '#eafaf1',
    padding: '1rem',
    borderRadius: '5px',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    textAlign: 'left'
};

const CalculationSolver = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSolve = async () => {
    if (!query) return;
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      // Llamamos a la API enviando únicamente el string de la pregunta
      const response = await solveCalculation(query);
      setResult(response.data.solution);
    } catch (err) {
      setError('Error al conectar con la IA para resolver el cálculo.');
      console.error("Error solving calculation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={solverStyle}>
      <h3>🧮 Asistente de Cálculos</h3>
      <p>Escribe tu problema de cálculo (ej: "preparar 50mL de NaCl 0.5M a partir de un stock 5M").</p>
      <textarea
        style={inputStyle}
        rows="3"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Describe el cálculo que necesitas resolver..."
      />
      <button onClick={handleSolve} disabled={isLoading || !query}>
        {isLoading ? 'Calculando...' : 'Resolver'}
      </button>
      {error && <p className='error' style={{textAlign: 'left'}}>{error}</p>}
      {result && (
        <div style={{marginTop: '1rem'}}>
            <h4>Solución:</h4>
            <pre style={resultStyle}>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default CalculationSolver;