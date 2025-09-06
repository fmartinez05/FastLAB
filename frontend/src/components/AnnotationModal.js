import React, { useState, useRef, useLayoutEffect } from 'react';
import { Stage, Layer, Path } from 'react-konva';
import getStroke from 'perfect-freehand';

// --- Funciones de Utilidad (copiadas para mantener el componente autocontenido) ---

const options = {
  size: 8,
  thinning: 0.65,
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
        if (distance < threshold) return true;
    }
    return false;
}

// --- Estilos ---
const modalStyle = {
  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  backgroundColor: 'white', padding: '20px', zIndex: 1000,
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)', borderRadius: '8px', 
  width: '90%', maxWidth: '800px'
};
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
};
const toolButtonStyle = {
  padding: '8px 12px', marginRight: '8px', fontSize: '0.9rem',
  cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px'
};

// --- Componente Principal del Modal ---

const AnnotationModal = ({ step, onSave, onCancel }) => {
  const [text, setText] = useState(step.annotation?.text || '');
  const [penStrokes, setPenStrokes] = useState(step.annotation?.drawing?.vectors?.penStrokes || []);
  const [highlighterStrokes, setHighlighterStrokes] = useState(step.annotation?.drawing?.vectors?.highlighterStrokes || []);
  const [currentPoints, setCurrentPoints] = useState([]);
  
  const [tool, setTool] = useState('pen');
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 300 });

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({ width: containerRef.current.offsetWidth, height: 300 });
      }
    };
    setTimeout(updateSize, 10);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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
    setCurrentPoints([{ x: pos.x, y: pos.y, pressure: e.evt.pressure || 0.5 }]);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || tool === 'eraser') return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentPoints(points => [...points, { x: pos.x, y: pos.y, pressure: e.evt.pressure || 0.5 }]);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
    if (currentPoints.length > 1) {
        const newStroke = { points: currentPoints };
        if (tool === 'pen') setPenStrokes(s => [...s, newStroke]);
        else if (tool === 'highlighter') setHighlighterStrokes(s => [...s, newStroke]);
    }
    setCurrentPoints([]);
  };

  const handleSave = () => {
    const image = stageRef.current.toDataURL();
    const vectors = { penStrokes, highlighterStrokes };
    onSave({ text, drawing: { vectors, image } });
  };

  const penPaths = penStrokes.map((stroke, i) => <Path key={`p-${i}`} data={getSvgPathFromStroke(getStroke(stroke.points, options))} fill="black" />);
  const highlighterPaths = highlighterStrokes.map((stroke, i) => <Path key={`h-${i}`} data={getSvgPathFromStroke(getStroke(stroke.points, { ...options, size: 20, thinning: 0 }))} fill="#FFD700" opacity={0.5} globalCompositeOperation="multiply" />);
  const currentPath = currentPoints.length > 0 ? <Path data={getSvgPathFromStroke(getStroke(currentPoints, tool === 'pen' ? options : { ...options, size: 20, thinning: 0 }))} fill={tool === 'pen' ? 'black' : '#FFD700'} opacity={tool === 'highlighter' ? 0.5 : 1} globalCompositeOperation={tool === 'highlighter' ? 'multiply' : 'source-over'} /> : null;

  return (
    <>
      <div style={overlayStyle} onClick={onCancel} />
      <div style={modalStyle}>
        <h3>Anotaciones para: "{step.text}"</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="5"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px', marginBottom: '1rem' }}
          placeholder="Escribe tus resultados, observaciones, etc."
        />
        <h4>Apuntes a Mano</h4>
        <div style={{ margin: '10px 0' }}>
            <button style={{...toolButtonStyle, backgroundColor: tool === 'pen' ? '#3182CE' : '#f0f0f0', color: tool === 'pen' ? 'white' : 'black'}} onClick={() => setTool('pen')}>✍️ Lápiz</button>
            <button style={{...toolButtonStyle, backgroundColor: tool === 'highlighter' ? '#3182CE' : '#f0f0f0', color: tool === 'highlighter' ? 'white' : 'black'}} onClick={() => setTool('highlighter')}>🎨 Resaltador</button>
            <button style={{...toolButtonStyle, backgroundColor: tool === 'eraser' ? '#3182CE' : '#f0f0f0', color: tool === 'eraser' ? 'white' : 'black'}} onClick={() => setTool('eraser')}>🧼 Borrador</button>
        </div>
        <div ref={containerRef} className="drawing-canvas-container">
          <Stage
            ref={stageRef}
            width={size.width}
            height={size.height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <Layer>{highlighterPaths}</Layer>
            <Layer>{penPaths}{currentPath}</Layer>
          </Stage>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={onCancel} style={{ marginRight: '10px', backgroundColor: '#95a5a6' }}>Cancelar</button>
          <button onClick={handleSave}>Guardar Anotación</button>
        </div>
      </div>
    </>
  );
};

export default AnnotationModal;