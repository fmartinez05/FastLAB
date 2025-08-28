import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';

// Colores de la paleta, puedes ajustarlos si lo deseas
const COLORS = ['#2c3e50', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];

const Whiteboard = ({ initialDrawing, onSave, onCancel }) => {
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(COLORS[0]);
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  // Estado para el tamaño del escenario dinámico
  const [stageSize, setStageSize] = useState({
    width: window.innerWidth * 0.95,
    height: window.innerHeight * 0.8,
  });

  // Cargar el dibujo inicial y ajustar el tamaño del lienzo
  useEffect(() => {
    // Cargar el dibujo inicial como una imagen de fondo si existe
    if (initialDrawing) {
      const image = new window.Image();
      image.src = initialDrawing;
      image.onload = () => {
        setBackgroundImage(image);
      };
      // Si ya hay un initialDrawing, significa que hay contenido.
      // Podríamos querer cargar las líneas si la estructura lo permitiera,
      // pero para simplificar, lo tratamos como una imagen de fondo.
      // Si initialDrawing fuera una serialización de Konva, podríamos cargar las líneas directamente.
    }

    // Manejar el redimensionamiento de la ventana para la pizarra
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth * 0.95,
        height: window.innerHeight * 0.8,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initialDrawing]);


  const handlePointerDown = (e) => {
    // Si el evento es de toque y ya hay un dibujo, no iniciamos uno nuevo
    // Esto es para evitar dibujos accidentales al interactuar con el fondo en móviles
    if (e.evt.pointerType === 'touch' && lines.length > 0) return; 
    
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    setLines(prevLines => [
      ...prevLines,
      { 
        tool, 
        points: [pos.x, pos.y], 
        color, 
        strokeWidth: tool === 'eraser' ? 20 : 4 // Ancho del borrador vs lápiz
      },
    ]);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current) return;

    // Prevenir el desplazamiento de la página al dibujar en dispositivos táctiles
    if (e.evt.pointerType === 'touch') {
      e.evt.preventDefault();
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    setLines(prevLines => {
      // Si no hay líneas o la última línea no tiene puntos, esto debería prevenir errores
      if (prevLines.length === 0) return prevLines;

      let lastLine = { ...prevLines[prevLines.length - 1] };
      // Solo añadir el punto si es diferente al último para evitar puntos duplicados
      if (lastLine.points[lastLine.points.length - 2] !== point.x || lastLine.points[lastLine.points.length - 1] !== point.y) {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
      }
      
      const newLines = [...prevLines];
      newLines[newLines.length - 1] = lastLine; // Actualizar la última línea
      return newLines;
    });
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };
  
  const handleSave = useCallback(() => {
    if (!stageRef.current) return;

    // Convertir el Stage a DataURL con mayor resolución para una mejor calidad
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 }); 
    onSave(dataURL);
  }, [onSave]);

  const handleClear = () => {
    // Si hay una imagen de fondo, la mantenemos, pero borramos las líneas actuales.
    // Si la idea es borrar TODO, incluyendo la imagen de fondo (dibujo inicial),
    // entonces también habría que setBackgroundImage(null).
    if (window.confirm("¿Estás seguro de que quieres borrar todo el dibujo actual?")) {
      setLines([]);
    }
  };

  return (
    <div className="whiteboard-modal">
      <div className="whiteboard-toolbar">
        <div className="tool-group">
          <button onClick={() => setTool('pen')} className={tool === 'pen' ? 'active' : ''}>Lápiz</button>
          <button onClick={() => setTool('eraser')} className={tool === 'eraser' ? 'active' : ''}>Goma</button>
          <button onClick={handleClear}>Borrar Todo</button> {/* Nuevo botón para borrar */}
        </div>
        <div className="color-palette">
          {COLORS.map(c => (
            <button 
              key={c} 
              className="color-swatch" 
              style={{ 
                backgroundColor: c, 
                border: color === c ? '3px solid #fff' : '3px solid transparent' 
              }} 
              onClick={() => setColor(c)} 
            />
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
          width={stageSize.width}
          height={stageSize.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          // El draggable no lo necesitamos si el usuario va a dibujar en el canvas,
          // podría mover el lienzo en lugar de dibujar. Lo quito.
          // draggable 
        >
          <Layer ref={layerRef}>
            {/* Imagen de fondo con el dibujo anterior */}
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                width={stageSize.width}
                height={stageSize.height}
                // Si la imagen es más pequeña que el canvas, asegúrate de que se escale o se centre adecuadamente
                // Podrías ajustar 'fit' o 'fill' dependiendo de cómo quieras que se comporte.
                // Aquí, simplemente ajustamos al tamaño del stage.
              />
            )}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={0.8} // <-- ¡Incrementado para un mayor suavizado!
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