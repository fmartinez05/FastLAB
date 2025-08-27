import React, { useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const modalStyle = {
  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  backgroundColor: 'white', padding: '20px', zIndex: 1000,
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)', borderRadius: '8px', width: '80%', maxWidth: '600px'
};
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
};

const AnnotationModal = ({ step, onSave, onCancel }) => {
  const [text, setText] = useState(step.annotation?.text || '');
  const [lines, setLines] = useState([]);
  const isDrawing = React.useRef(false);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleSave = () => {
    // Para este proyecto, solo guardamos el texto. El dibujo es visual.
    onSave({ text });
  };

  return (
    <>
      <div style={overlayStyle} onClick={onCancel} />
      <div style={modalStyle}>
        <h3>Anotaciones para: "{step.text}"</h3>
        <h4>Anotaciones con Teclado</h4>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="5"
          style={{ width: '95%', padding: '10px' }}
          placeholder="Escribe tus resultados, observaciones, etc."
        />
        <h4>Anotaciones a Mano (Apple Pencil / Ratón)</h4>
        <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
          <Stage
            width={550} height={200}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line key={i} points={line.points} stroke="black" strokeWidth={3} tension={0.5} lineCap="round" />
              ))}
            </Layer>
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