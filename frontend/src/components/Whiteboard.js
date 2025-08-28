import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';

const COLORS = ['#2c3e50', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

const Whiteboard = ({ initialDrawing, onSave, onCancel }) => {
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(COLORS[0]);
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Cargar el dibujo inicial como una imagen de fondo
  useEffect(() => {
    if (initialDrawing) {
      const image = new window.Image();
      image.src = initialDrawing;
      image.onload = () => {
        setBackgroundImage(image);
      };
    }
  }, [initialDrawing]);

  const handlePointerDown = (e) => {
    if (e.evt.pointerType === 'touch') return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines(prevLines => [
      ...prevLines,
      { tool, points: [pos.x, pos.y], color, strokeWidth: tool === 'eraser' ? 20 : 4 },
    ]);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || e.evt.pointerType === 'touch') return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    setLines(prevLines => {
      let lastLine = { ...prevLines[prevLines.length - 1] };
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      const newLines = [...prevLines];
      newLines.splice(newLines.length - 1, 1, lastLine);
      return newLines;
    });
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };
  
  const handleSave = useCallback(() => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    onSave(dataURL);
  }, [onSave]);

  return (
    <div className="whiteboard-modal">
      <div className="whiteboard-toolbar">
        <div className="tool-group">
          <button onClick={() => setTool('pen')} className={tool === 'pen' ? 'active' : ''}>Lápiz</button>
          <button onClick={() => setTool('eraser')} className={tool === 'eraser' ? 'active' : ''}>Goma</button>
        </div>
        <div className="color-palette">
          {COLORS.map(c => (
            <button key={c} className="color-swatch" style={{ backgroundColor: c, border: color === c ? '3px solid #fff' : '3px solid transparent' }} onClick={() => setColor(c)} />
          ))}
        </div>
        <div className="actions">
          <button onClick={onCancel} className="cancel-btn">Cancelar</button>
          <button onClick={handleSave} className="save-btn">Guardar Anotación</button>
        </div>
      </div>
      <div className="whiteboard-canvas-container" id="whiteboard">
        <Stage
          ref={stageRef}
          width={window.innerWidth * 0.95} // Un poco más pequeño para ver el borde
          height={window.innerHeight * 0.8}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          draggable
        >
          <Layer ref={layerRef}>
            {/* Imagen de fondo con el dibujo anterior */}
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                width={window.innerWidth * 0.95}
                height={window.innerHeight * 0.8}
              />
            )}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.5} // <-- Esto suaviza las líneas
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Whiteboard;