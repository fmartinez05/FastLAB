import React, { useState, useRef } from 'react'; // Añadimos useRef
import DrawingCanvas from './DrawingCanvas';

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

const AnnotationModal = ({ step, onSave, onCancel }) => {
  const [text, setText] = useState(step.annotation?.text || '');
  const drawingCanvasRef = useRef(null); // Creamos una ref para acceder al DrawingCanvas

  const handleSave = () => {
    // Obtenemos el estado MÁS RECIENTE del dibujo directamente del componente hijo
    const latestDrawingState = drawingCanvasRef.current?.getLatestDrawingState();
    
    // Guardamos el texto y el estado del dibujo
    onSave({ 
        text: text, 
        drawing: latestDrawingState || step.annotation?.drawing // Mantiene el dibujo anterior si no se ha cambiado
    });
  };

  // Esta función es necesaria para el 'onChange' de DrawingCanvas, aunque no la usemos directamente para el guardado final
  const handleIntermediateDrawingSave = () => {
      // No necesitamos hacer nada aquí porque el guardado final se hace con el botón
  };

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
        <DrawingCanvas 
            ref={drawingCanvasRef} // Asignamos la ref
            savedDrawing={step.annotation?.drawing}
            onSave={handleIntermediateDrawingSave}
        />
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button onClick={onCancel} style={{ marginRight: '10px', backgroundColor: '#95a5a6' }}>Cancelar</button>
          <button onClick={handleSave}>Guardar Anotación</button>
        </div>
      </div>
    </>
  );
};

export default AnnotationModal;