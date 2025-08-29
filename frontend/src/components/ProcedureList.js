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

  // CORRECCIÓN: Ahora trabajamos con arrays en lugar de objetos
  const handleToggleStep = (index) => {
    // Creamos una copia del array de anotaciones
    const newAnnotations = [...annotations]; 
    
    // Si no existe una anotación para este paso, la creamos
    if (!newAnnotations[index]) {
      newAnnotations[index] = { step: steps[index], completed: false, text: '', drawing: null };
    }
    
    // Cambiamos el estado 'completed'
    newAnnotations[index].completed = !newAnnotations[index].completed;
    setAnnotations(newAnnotations);
  };

  // CORRECCIÓN: La lógica de guardado también se adapta para arrays
  const handleSaveAnnotation = (annotation) => {
    const index = modalStep.index;
    const newAnnotations = [...annotations];

    // Si no existe una anotación para este paso, la creamos
    if (!newAnnotations[index]) {
      newAnnotations[index] = { step: steps[index], completed: false, drawing: null };
    }
    
    // Actualizamos el texto de la anotación
    newAnnotations[index].text = annotation.text;
    
    setAnnotations(newAnnotations);
    setModalStep(null);
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
            onClick={() => setModalStep({ text: step, index: index })}
            style={{ fontSize: '0.8rem', padding: '5px 10px', background: '#ecf0f1', color: '#333' }}
          >
            Anotar
          </button>
        </div>
      ))}
      {modalStep && (
        <AnnotationModal
          step={{ text: modalStep.text, annotation: annotations[modalStep.index] }}
          onSave={handleSaveAnnotation}
          onCancel={() => setModalStep(null)}
        />
      )}
    </div>
  );
};

export default ProcedureList;