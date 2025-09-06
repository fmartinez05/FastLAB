import React, { useState } from 'react';
import DrawingCanvas from './DrawingCanvas'; // Reutilizamos nuestro componente

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
  // Estado local para manejar los cambios antes de guardar
  const [annotation, setAnnotation] = useState(step.annotation || { text: '', drawing: null });

  const handleTextChange = (e) => {
    setAnnotation({ ...annotation, text: e.target.value });
  };

  const handleDrawingSave = (drawingState) => {
    setAnnotation({ ...annotation, drawing: drawingState });
  };

  const handleSave = () => {
    onSave(annotation);
  };

  return (
    <>
      <div style={overlayStyle} onClick={onCancel} />
      <div style={modalStyle}>
        <h3>Anotaciones para: "{step.text}"</h3>
        <textarea
          value={annotation.text}
          onChange={handleTextChange}
          rows="5"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px', marginBottom: '1rem' }}
          placeholder="Escribe tus resultados, observaciones, etc."
        />
        <h4>Apuntes a Mano</h4>
        <DrawingCanvas 
            savedDrawing={annotation.drawing}
            onSave={handleDrawingSave}
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