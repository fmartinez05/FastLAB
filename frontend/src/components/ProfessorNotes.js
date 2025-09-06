import React, { useState, useRef, useLayoutEffect } from 'react';
import { Stage, Layer, Path } from 'react-konva';
import getStroke from 'perfect-freehand';

// --- Funciones de Utilidad y Configuración ---

// **CAMBIO IMPORTANTE**: Eliminamos 'thinning' de las opciones base para asegurar un grosor visible.
const options = {
  size: 8,
  smoothing: 0.5,
  streamline: 0.5,
};

function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(`M ${x0} ${y0} Q ${x0} ${y0} ${x1} ${y1}`);
      return acc;
    },
    ['M', ...stroke[0], 'Q', ...stroke[0]]
  );
  return d.join(' ');
}

function isPointNearLine(point, line) {
  const threshold = 15;
  for (const linePoint of line.points) {
    const distance = Math.sqrt(Math.pow(linePoint.x - point.x, 2) + Math.pow(linePoint.y - point.y, 2));
    if (distance < threshold) {
      return true;
    }
  }
  return false;
}

const toolButtonStyle = {
  padding: '8px 12px', marginRight: '8px', fontSize: '0.9rem',
  cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px'
};

// --- Componente Principal ---

const ProfessorNotes = ({ notes, setNotes }) => {
  const [penStrokes, setPenStrokes] = useState(notes.drawing?.vectors?.penStrokes || []);
  const [highlighterStrokes, setHighlighterStrokes] = useState(notes.drawing?.vectors?.highlighterStrokes || []);
  const [currentPoints, setCurrentPoints] = useState([]);
  
  const [tool, setTool] = useState('pen');
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 400 });

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
  
  const saveChanges = () => {
    if (!stageRef.current) return;
    const image = stageRef.current.toDataURL();
    const vectors = { penStrokes, highlighterStrokes };
    setNotes(prevNotes => ({ ...prevNotes, drawing: { vectors, image } }));
  };

  const handlePointerDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    
    if (tool === 'eraser') {
      for (let i = penStrokes.length - 1; i >= 0; i--) {
        if (isPointNearLine(pos, penStrokes[i])) {
          setPenStrokes(s => s.filter((_, idx) => i !== idx));
          return;
        }
      }
      for (let i = highlighterStrokes.length - 1; i >= 0; i--) {
        if (isPointNearLine(pos, highlighterStrokes[i])) {
          setHighlighterStrokes(s => s.filter((_, idx) => i !== idx));
          return;
        }
      }
      return;
    }
    setCurrentPoints([{ x: pos.x, y: pos.y, pressure: 0.5 }]); // Usamos presión constante
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || tool === 'eraser') return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentPoints(points => [...points, { x: pos.x, y: pos.y, pressure: 0.5 }]); // Usamos presión constante
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
    if (currentPoints.length > 1) {
      const newStroke = { points: currentPoints };
      if (tool === 'pen') {
        setPenStrokes(strokes => [...strokes, newStroke]);
      } else if (tool === 'highlighter') {
        setHighlighterStrokes(strokes => [...strokes, newStroke]);
      }
    }
    setCurrentPoints([]);
    setTimeout(saveChanges, 10);
  };
  
  const handleUndo = () => {
    if (penStrokes.length > 0) {
      setPenStrokes(penStrokes.slice(0, -1));
    } else if (highlighterStrokes.length > 0) {
      setHighlighterStrokes(highlighterStrokes.slice(0, -1));
    }
    setTimeout(saveChanges, 10);
  };

  // --- Lógica de Renderizado de Trazos (Simplificada) ---
  const penPaths = penStrokes.map((stroke, i) => <Path key={`p-${i}`} data={getSvgPathFromStroke(getStroke(stroke.points, options))} fill="black" />);
  const highlighterPaths = highlighterStrokes.map((stroke, i) => <Path key={`h-${i}`} data={getSvgPathFromStroke(getStroke(stroke.points, {...options, size: 20}))} fill="#FFD700" opacity={0.5} globalCompositeOperation="multiply" />);
  
  const currentPathOptions = tool === 'highlighter' ? {...options, size: 20} : options;
  const currentPath = currentPoints.length > 0
    ? <Path data={getSvgPathFromStroke(getStroke(currentPoints, currentPathOptions))} fill={tool === 'pen' ? 'black' : '#FFD700'} opacity={tool === 'highlighter' ? 0.5 : 1} globalCompositeOperation={tool === 'highlighter' ? 'multiply' : 'source-over'} />
    : null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>📝 Explicaciones del Profesor</h3>
      <h4>Apuntes a Mano (Apple Pencil / Ratón)</h4>
      
      <div style={{ margin: '10px 0' }}>
        <button style={{...toolButtonStyle, backgroundColor: tool === 'pen' ? '#3182CE' : '#f0f0f0', color: tool === 'pen' ? 'white' : 'black'}} onClick={() => setTool('pen')}>✍️ Lápiz</button>
        <button style={{...toolButtonStyle, backgroundColor: tool === 'highlighter' ? '#3182CE' : '#f0f0f0', color: tool === 'highlighter' ? 'white' : 'black'}} onClick={() => setTool('highlighter')}>🎨 Resaltador</button>
        <button style={{...toolButtonStyle, backgroundColor: tool === 'eraser' ? '#3182CE' : '#f0f0f0', color: tool === 'eraser' ? 'white' : 'black'}} onClick={() => setTool('eraser')}>🧼 Borrador</button>
        <button style={toolButtonStyle} onClick={handleUndo}>↩️ Deshacer</button>
      </div>

      <div ref={containerRef} className="drawing-canvas-container">
        <Stage ref={stageRef} width={size.width} height={size.height} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
          <Layer>{highlighterPaths}</Layer>
          <Layer>{penPaths}{currentPath}</Layer>
        </Stage>
      </div>
      <p style={{fontSize: '0.8rem', color: '#666', textAlign: 'right', marginTop: '5px'}}>
          Los cambios se guardan automáticamente al terminar cada trazo.
      </p>
    </div>
  );
};

export default ProfessorNotes;