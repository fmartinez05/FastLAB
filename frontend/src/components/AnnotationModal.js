import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';

const modalStyle = {
  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  backgroundColor: 'white', padding: '20px', zIndex: 1000,
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)', borderRadius: '8px', 
  width: '90%', maxWidth: '800px' // Modal más ancho
};
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
};

const AnnotationModal = ({ step, onSave, onCancel }) => {
  const [text, setText] = useState(step.annotation?.text || '');
  const [lines, setLines] = useState([]);
  const [image, setImage] = useState(null); // Para la imagen guardada
  const isDrawing = React.useRef(false);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 300 }); // Lienzo más alto

  // Cargar el dibujo guardado
  useEffect(() => {
    if (step.annotation?.drawing) {
      const img = new window.Image();
      img.src = step.annotation.drawing;
      img.onload = () => {
        setImage(img);
      };
    }
  }, [step.annotation]);

  // Hacer el lienzo responsivo
  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // Restamos padding/bordes para un ajuste preciso si es necesario
        setSize({ width: containerRef.current.offsetWidth, height: 300 });
      }
    };
    // Pequeño delay para asegurar que el modal se ha renderizado
    setTimeout(updateSize, 10);
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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
    if (lastLine) {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    }
  };
  
  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleSave = () => {
    // ¡LA CORRECCIÓN CLAVE! Ahora guardamos el texto Y el dibujo.
    const drawingDataURL = stageRef.current.toDataURL();
    onSave({ text, drawing: drawingDataURL });
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
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px', marginBottom: '1rem' }}
          placeholder="Escribe tus resultados, observaciones, etc."
        />
        <h4>Anotaciones a Mano (Apple Pencil / Ratón)</h4>
        {/* Usamos la nueva clase CSS aquí */}
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
              {/* Dibuja la imagen guardada como fondo */}
              {image && <KonvaImage image={image} width={size.width} height={size.height} />}
              {/* Dibuja las nuevas líneas */}
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