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

  const handleToggleStep = (index) => {
    // --- CORRECCIÓN: Usamos la actualización funcional para evitar estado obsoleto ---
    setAnnotations(currentAnnotations => {
      // Trabajamos con la versión más reciente del estado
      const newAnnotations = [...currentAnnotations]; 
      
      if (!newAnnotations[index]) {
        newAnnotations[index] = { step: steps[index], completed: false, text: '', drawing: null };
      }
      
      newAnnotations[index].completed = !newAnnotations[index].completed;
      return newAnnotations;
    });
  };

  const handleSaveAnnotation = (annotationData) => {
    const index = modalStep.index;

    // --- CORRECCIÓN: Usamos la actualización funcional aquí también ---
    setAnnotations(currentAnnotations => {
      const newAnnotations = [...currentAnnotations];

      if (!newAnnotations[index]) {
        newAnnotations[index] = { step: steps[index], completed: false };
      }
      
      newAnnotations[index] = {
          ...newAnnotations[index], 
          text: annotationData.text,
          drawing: annotationData.drawing
      };
      
      return newAnnotations;
    });

    setModalStep(null);
  };

  const handleOpenModal = (step, index) => {
    setModalStep({ text: step, index: index });
  };

  return (
    <div>
      {/* Nos aseguramos de que 'steps' sea un array antes de mapearlo */}
      {Array.isArray(steps) && steps.map((step, index) => (
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
          step={{ text: modalStep.text, annotation: annotations[modalStep.index] }}
          onSave={handleSaveAnnotation}
          onCancel={() => setModalStep(null)}
        />
      )}
    </div>
  );
};

export default ProcedureList;