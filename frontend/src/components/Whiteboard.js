import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';

const COLORS = ['#2c3e50', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

const Whiteboard = ({ initialDrawing, onSave, onCancel }) => {
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen'); // 'pen' o 'eraser'
  const [color, setColor] = useState(COLORS[0]);
  const isDrawing = useRef(false);
  const stageRef = useRef(null);

  // Cargar el dibujo inicial si existe
  useEffect(() => {
    if (initialDrawing && stageRef.current) {
      const image = new window.Image();
      image.src = initialDrawing;
      image.onload = () => {
        const layer = stageRef.current.getLayers()[0];
        // Limpiamos el canvas antes de cargar la imagen
        layer.destroyChildren();
        const konvaImage = new KonvaImage({ image, width: image.width, height: image.height });
        layer.add(konvaImage);
        layer.batchDraw();
      };
    }
  }, [initialDrawing]);

  const handlePointerDown = (e) => {
    // Ignorar los dedos, solo permitir lápiz (pen) o ratón (mouse)
    if (e.evt.pointerType === 'touch') {
      return;
    }
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], color }]);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || e.evt.pointerType === 'touch') return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines, ...[]]); // Forzar re-render
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };
  
  const handleSave = () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
    onSave(dataURL);
  };

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
          <button onClick={handleSave} className="save-btn">Guardar Dibujo</button>
        </div>
      </div>
      <div className="whiteboard-canvas-container" id="whiteboard">
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight - 80} // Ajustar al tamaño de la ventana menos la barra de herramientas
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          draggable
        >
          <Layer>
            {/* Dibujo inicial como imagen de fondo */}
            {initialDrawing && <KonvaImage image={(() => { const i = new window.Image(); i.src = initialDrawing; return i; })()} />}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.tool === 'eraser' ? 15 : 3}
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
    </div>
  );
};

export default Whiteboard;