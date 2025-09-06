import React, { useState } from 'react';
import AnnotationModal from './AnnotationModal';

const listItemStyle = {
  display: 'flex', alignItems: 'center', marginBottom: '10px',
  padding: '10px', borderRadius: '5px', transition: 'background-color 0.3s',
  border: '1px solid #eee'
};

const completedStyle = {
  ...listItemStyle,
  backgroundColor: '#eafaf1',
  textDecoration: 'line-through',
  color: '#555'
};

const ProcedureList = ({ steps, annotations, setAnnotations }) => {
  const [modalStep, setModalStep] = useState(null);

  // Esta función ya estaba correcta y se mantiene igual
  const handleToggleStep = (index) => {
    const newAnnotations = [...annotations]; 
    
    if (!newAnnotations[index]) {
      newAnnotations[index] = { step: steps[index], completed: false, text: '', drawing: null };
    }
    
    newAnnotations[index].completed = !newAnnotations[index].completed;
    setAnnotations(newAnnotations);
  };

  // ===== CORRECCIÓN CLAVE AQUÍ =====
  // Ahora, la función recibe 'annotationData' (que incluye texto y dibujo) y lo guarda todo.
  const handleSaveAnnotation = (annotationData) => {
    const index = modalStep.index;
    const newAnnotations = [...annotations];

    // Nos aseguramos de que el objeto de anotación exista en el índice
    if (!newAnnotations[index]) {
      newAnnotations[index] = { step: steps[index], completed: false };
    }
    
    // Fusionamos la data existente (como 'completed') con la nueva data del modal
    newAnnotations[index] = {
        ...newAnnotations[index], // Mantiene el estado 'completed' si ya existía
        text: annotationData.text,
        drawing: annotationData.drawing // ¡Ahora guardamos el dibujo!
    };
    
    setAnnotations(newAnnotations);
    setModalStep(null);
  };

  const handleOpenModal = (step, index) => {
    // Almacenamos el texto y el índice del paso que se está editando
    setModalStep({ text: step, index: index });
  };

  return (
    <div>
      {steps.map((step, index) => (
        <div key={index} style={annotations[index]?.completed ? completedStyle : listItemStyle}>
          <input
            type="checkbox"
            checked={annotations[index]?.completed || false}
            onChange={() => handleToggleStep(index)}
            style={{ marginRight: '15px', transform: 'scale(1.5)' }}
          />
          <span style={{ flexGrow: 1 }}>{step}</span>
          <button
            onClick={() => handleOpenModal(step, index)}
            style={{ fontSize: '0.8rem', padding: '5px 10px', background: '#ecf0f1', color: '#333' }}
          >
            Anotar
          </button>
        </div>
      ))}
      {modalStep && (
        <AnnotationModal
          // Pasamos la anotación existente (si la hay) al modal para que pueda mostrarla
          step={{ text: modalStep.text, annotation: annotations[modalStep.index] }}
          onSave={handleSaveAnnotation}
          onCancel={() => setModalStep(null)}
        />
      )}
    </div>
  );
};

export default ProcedureList;