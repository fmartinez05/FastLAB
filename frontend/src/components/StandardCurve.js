import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

Chart.register(...registerables);

const inputStyle = {
    padding: '8px',
    fontSize: '0.9rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    margin: '0 5px 10px 0',
    width: '180px'
};

const StandardCurve = ({ data, setData, onImageSave }) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({ datasets: [] });
  const [regressionInfo, setRegressionInfo] = useState('');

  const handleDataChange = (index, field, value) => {
    const newData = [...data];
    // Aseguramos que el objeto exista
    if (!newData[index]) newData[index] = { mw: '', ve: '' };
    newData[index][field] = value;
    setData(newData);
  };

  const addRow = () => setData([...data, { mw: '', ve: '' }]);
  const removeRow = (index) => setData(data.filter((_, i) => i !== index));

  useEffect(() => {
    const validPoints = data
        .filter(p => p.mw && p.ve && !isNaN(parseFloat(p.mw)) && !isNaN(parseFloat(p.ve)))
        .map(p => ({ mw: parseFloat(p.mw), ve: parseFloat(p.ve) }));
    
    let regressionLinePoints = [];
    if (validPoints.length >= 2) {
        const regressionData = validPoints.map(p => [Math.log10(p.mw), p.ve]);
        const regression = linearRegression(regressionData);
        const lineFunction = linearRegressionLine(regression);
        
        const minLogMw = Math.min(...regressionData.map(p => p[0]));
        const maxLogMw = Math.max(...regressionData.map(p => p[0]));

        regressionLinePoints = [
            { x: Math.pow(10, minLogMw), y: lineFunction(minLogMw) },
            { x: Math.pow(10, maxLogMw), y: lineFunction(maxLogMw) }
        ];

        setRegressionInfo(`y = ${regression.m.toFixed(3)} * log(x) + ${regression.b.toFixed(3)}  (R² = ${regression.rSquared.toFixed(4)})`);
    } else {
        setRegressionInfo('Se necesitan al menos 2 puntos válidos para la regresión.');
    }

    setChartData({
        datasets: [
            {
                label: 'Puntos de Calibrado',
                data: validPoints.map(p => ({ x: p.mw, y: p.ve })),
                backgroundColor: '#3182CE',
                type: 'scatter',
                pointRadius: 5,
            },
            {
                label: 'Línea de Regresión',
                data: regressionLinePoints,
                borderColor: '#E53E3E',
                borderWidth: 2,
                type: 'line',
                fill: false,
                pointRadius: 0,
            },
        ],
    });
  }, [data]);

  const saveChartAsImage = () => {
    if (chartRef.current) {
      const base64Image = chartRef.current.toBase64Image('image/png');
      onImageSave(base64Image);
      alert('Gráfica guardada en el informe.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
        <h3>📈 Recta de Calibrado</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {data.map((point, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <input type="number" placeholder="Peso Molecular (Da)" value={point.mw} onChange={e => handleDataChange(index, 'mw', e.target.value)} style={inputStyle}/>
                    <input type="number" placeholder="Volumen de Elución (mL)" value={point.ve} onChange={e => handleDataChange(index, 've', e.target.value)} style={inputStyle}/>
                    <button onClick={() => removeRow(index)} style={{ backgroundColor: '#E53E3E', padding: '5px 10px', fontSize: '0.8rem' }}>-</button>
                </div>
            ))}
        </div>
        <button onClick={addRow}>+ Añadir Fila</button>
        
        <div style={{ marginTop: '1rem', border: '1px solid #e0e0e0', padding: '1rem', borderRadius: '8px' }}>
            <Line ref={chartRef} data={chartData} options={{ scales: { x: { type: 'logarithmic', title: { display: true, text: 'Log(Peso Molecular)' } }, y: { title: { display: true, text: 'Volumen de Elución (mL)' } } } }} />
            <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '1rem', color: '#34495e' }}>{regressionInfo}</p>
        </div>
        <button onClick={saveChartAsImage} style={{ marginTop: '1rem', backgroundColor: '#27ae60' }}>Guardar Gráfica en Informe</button>
    </div>
  );
};

export default StandardCurve;