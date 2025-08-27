import React, { useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const ProfessorNotes = ({ notes, setNotes }) => {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);

  const handleTextChange = (e) => {
    setNotes({ ...notes, text: e.target.value });
  };

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

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>📝 Explicaciones del Profesor</h3>
      <p>Anota aquí los puntos clave, diagramas o fórmulas importantes.</p>
      
      <h4>Notas con Teclado</h4>
      <textarea
        value={notes.text}
        onChange={handleTextChange}
        rows="6"
        style={{ width: '95%', padding: '10px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc' }}
        placeholder="Ej: 'Recordad que la reacción es exotérmica, controlad la temperatura.'"
      />

      <h4>Apuntes a Mano (Apple Pencil / Ratón)</h4>
      <div style={{ border: '1px solid #ccc', borderRadius: '4px', display: 'inline-block' }}>
        <Stage
          width={800} height={250}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <Layer>
            <Line points={[0,0]} stroke="black" />
            {lines.map((line, i) => (
              <Line key={i} points={line.points} stroke="#2c3e50" strokeWidth={3.5} tension={0.5} lineCap="round" />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default ProfessorNotes;