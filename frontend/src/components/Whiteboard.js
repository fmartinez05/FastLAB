import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';

const COLORS = ['#2c3e50', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

const Whiteboard = ({ initialDrawing, onSave, onCancel }) => {
  const [lines, setLines] = useState([]);
  const [color, setColor] = useState(COLORS[0]);
  const [scale, setScale] = useState(1);
  const isDrawing = useRef(false);
  const stageRef = useRef(null);

  useEffect(() => {
    // Aquí se podría cargar un dibujo existente si se pasara como base64
  }, [initialDrawing]);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool: 'pen', points: [pos.x / scale, pos.y / scale], color }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x / scale, point.y / scale]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleZoom = (factor) => {
    setScale(prevScale => Math.max(0.2, prevScale * factor));
  };
  
  const handleSave = () => {
    if (!stageRef.current) return;
    // Exporta el canvas como una imagen base64 y la pasa a la función onSave
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    onSave(dataURL);
  };

  return (
    <div className="whiteboard-modal">
      <div className="whiteboard-toolbar">
        <div className="color-palette">
          {COLORS.map(c => (
            <button key={c} className="color-swatch" style={{ backgroundColor: c, border: color === c ? '3px solid #fff' : '3px solid transparent' }} onClick={() => setColor(c)} />
          ))}
        </div>
        <div className="zoom-controls">
          <button onClick={() => handleZoom(1.1)}>Zoom +</button>
          <button onClick={() => handleZoom(0.9)}>Zoom -</button>
        </div>
        <div className="actions">
          <button onClick={onCancel} className="cancel-btn">Cancelar</button>
          <button onClick={handleSave} className="save-btn">Guardar Dibujo</button>
        </div>
      </div>
      <div className="whiteboard-canvas-container">
        <Stage
          ref={stageRef}
          width={window.innerWidth * 0.8}
          height={window.innerHeight * 0.7}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={3 / scale}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation="source-over"
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Whiteboard;