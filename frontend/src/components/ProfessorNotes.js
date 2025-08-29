import React, { useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const ProfessorNotes = ({ notes, setNotes }) => {
  // El estado de las herramientas (lápiz, color) sigue siendo local
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#2c3e50');
  const [brushSize, setBrushSize] = useState(3.5);
  const isDrawing = useRef(false);
  
  // Las líneas del dibujo ahora vienen del objeto 'notes'
  // Si 'notes.drawing' no existe, usamos un array vacío
  const lines = notes.drawing || [];

  const handleTextChange = (e) => {
    setNotes({ ...notes, text: e.target.value });
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const newLine = {
      tool,
      points: [pos.x, pos.y],
      stroke: color,
      strokeWidth: brushSize,
      globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over',
    };
    
    // Actualizamos el estado en el componente padre (LabPage)
    setNotes({ ...notes, drawing: [...lines, newLine] });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    // Hacemos una copia de las líneas para no mutar el estado directamente
    let currentLines = [...lines];
    let lastLine = currentLines[currentLines.length - 1];
    
    if (!lastLine) return;

    lastLine.points = lastLine.points.concat([point.x, point.y]);
    currentLines.splice(currentLines.length - 1, 1, lastLine);
    
    // Actualizamos el estado en el componente padre
    setNotes({ ...notes, drawing: currentLines });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  // La función de limpiar ahora actualiza el estado del padre
  const handleClearDrawing = () => {
    setNotes({ ...notes, drawing: [] });
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>📝 Explicaciones del Profesor</h3>
      <p>Anota aquí los puntos clave, diagramas o fórmulas importantes.</p>
      
      <h4>Notas con Teclado</h4>
      <textarea
        value={notes.text || ''}
        onChange={handleTextChange}
        rows="6"
        style={{ width: '95%', padding: '10px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc' }}
        placeholder="Ej: 'Recordad que la reacción es exotérmica, controlad la temperatura.'"
      />

      <h4>Apuntes a Mano (Apple Pencil / Ratón)</h4>
      
      {/* --- Controles de Dibujo --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => setTool('pen')} style={{ backgroundColor: tool === 'pen' ? '#2980b9' : '#bdc3c7' }}>
          ✏️ Lápiz
        </button>
        <button onClick={() => setTool('eraser')} style={{ backgroundColor: tool === 'eraser' ? '#2980b9' : '#bdc3c7' }}>
           मिटाने वाला Borrador
        </button>
        
        <label htmlFor="color-picker" style={{ fontWeight: '500' }}>Color:</label>
        <input
          id="color-picker"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ cursor: 'pointer', border: 'none', background: 'none', width: '40px', height: '40px' }}
        />

        <label htmlFor="brush-size" style={{ fontWeight: '500' }}>Grosor:</label>
        <input 
          id="brush-size"
          type="range" 
          min="1" 
          max="20" 
          value={brushSize} 
          onChange={(e) => setBrushSize(parseFloat(e.target.value))}
          style={{ cursor: 'pointer' }}
        />
        <span>{brushSize}</span>
      </div>

      {/* --- Canvas Mejorado --- */}
      <div 
        style={{ 
          border: '1px solid #ccc', 
          borderRadius: '4px', 
          display: 'inline-block',
          touchAction: 'none'
        }}
      >
        <Stage
          width={800} height={300}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            <rect width={800} height={300} fill="white" />
            {lines.map((line, i) => (
              <Line 
                key={i} 
                points={line.points} 
                stroke={line.stroke} 
                strokeWidth={line.strokeWidth} 
                tension={0.5} 
                lineCap="round"
                globalCompositeOperation={line.globalCompositeOperation}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      {/* --- Botón de Limpiar (el de guardar ya no es necesario) --- */}
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleClearDrawing} style={{ backgroundColor: '#c0392b' }}>
          🗑️ Limpiar Dibujo
        </button>
      </div>
    </div>
  );
};

export default ProfessorNotes;