import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';

// Estilos para los botones de herramientas
const toolButtonStyle = {
  padding: '8px 12px',
  marginRight: '8px',
  fontSize: '0.9rem',
  cursor: 'pointer'
};

const ProfessorNotes = ({ notes, setNotes }) => {
  const [lines, setLines] = useState([]);
  const [image, setImage] = useState(null);
  const [tool, setTool] = useState('pen'); // 'pen' o 'eraser'
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 400 });

  useEffect(() => {
    if (notes.drawing) {
      const img = new window.Image();
      img.src = notes.drawing;
      img.onload = () => {
        setImage(img);
        setLines([]); 
      };
    }
  }, [notes.drawing]);

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({ width: containerRef.current.offsetWidth, height: 400 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ===== NUEVO CÓDIGO CORREGIDO =====
  // Este hook se encarga de actualizar el estado del dibujo cada vez que cambia.
  // Esto reemplaza la necesidad de la función 'saveDrawing' y soluciona el error.
  useEffect(() => {
    const updateDrawingState = () => {
      if (stageRef.current) {
        const dataURL = stageRef.current.toDataURL();
        // Usamos una función de callback para no sobrescribir el texto de las notas
        setNotes(prevNotes => ({ ...prevNotes, drawing: dataURL }));
      }
    };
    // Damos un pequeño tiempo para que el canvas se actualice antes de guardar el estado
    const timer = setTimeout(updateDrawingState, 100); 
    return () => clearTimeout(timer);
  }, [lines, setNotes]); // Se ejecuta cada vez que el array de 'lines' cambia

  const handleTextChange = (e) => {
    setNotes({ ...notes, text: e.target.value });
  };
  
  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    if (lastLine) {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };
  
  const handleUndo = () => {
      setLines(lines.slice(0, -1));
  };
  
  const handleClear = () => {
      setLines([]);
      setImage(null);
      setNotes(prevNotes => ({ ...prevNotes, drawing: null })); 
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
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc' }}
        placeholder="Ej: 'Recordad que la reacción es exotérmica, controlad la temperatura.'"
      />

      <h4>Apuntes a Mano (Apple Pencil / Ratón)</h4>
      
      <div style={{ margin: '10px 0' }}>
          <button style={{...toolButtonStyle, backgroundColor: tool === 'pen' ? '#3182CE' : '#f0f0f0', color: tool === 'pen' ? 'white' : 'black'}} onClick={() => setTool('pen')}>✍️ Lápiz</button>
          <button style={{...toolButtonStyle, backgroundColor: tool === 'eraser' ? '#3182CE' : '#f0f0f0', color: tool === 'eraser' ? 'white' : 'black'}} onClick={() => setTool('eraser')}>🧼 Borrador</button>
          <button style={toolButtonStyle} onClick={handleUndo}>↩️ Deshacer</button>
          <button style={{...toolButtonStyle, backgroundColor: '#E53E3E', color: 'white'}} onClick={handleClear}>🗑️ Limpiar todo</button>
      </div>

      <div ref={containerRef} className="drawing-canvas-container">
        <Stage
          ref={stageRef}
          width={size.width} 
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            {image && <KonvaImage image={image} width={size.width} height={size.height} />}
            {lines.map((line, i) => (
              <Line 
                key={i} 
                points={line.points} 
                stroke={line.tool === 'eraser' ? 'white' : '#2c3e50'}
                strokeWidth={line.tool === 'eraser' ? 20 : 3.5}
                tension={0.5} 
                lineCap="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <p style={{fontSize: '0.8rem', color: '#666', textAlign: 'right', marginTop: '5px'}}>
          Nota: Los cambios se guardan al pulsar "Guardar Progreso".
      </p>
    </div>
  );
};

export default ProfessorNotes;