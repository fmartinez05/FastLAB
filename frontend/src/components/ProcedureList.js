import React, { useState } from 'react';
import AnnotationModal from './AnnotationModal';

// Estilos (sin cambios)
const listItemStyle = { display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px', borderRadius: '5px', transition: 'background-color 0.3s', border: '1px solid #eee' };
const completedStyle = { ...listItemStyle, backgroundColor: '#eafaf1', textDecoration: 'line-through', color: '#555' };

const ProcedureList = ({ steps, annotations, dispatch }) => {
  const [modalStep, setModalStep] = useState(null);

  const handleToggleStep = (index) => {
    // Acción específica: solo indica qué paso cambiar.
    dispatch({ type: 'TOGGLE_PROCEDURE_STEP', index: index, step: steps[index] });
  };

  const handleSaveAnnotation = (annotationData) => {
    // Acción específica: envía el índice y los nuevos datos de la anotación.
    dispatch({
      type: 'UPDATE_PROCEDURE_ANNOTATION',
      index: modalStep.index,
      payload: annotationData,
      step: steps[modalStep.index]
    });
    setModalStep(null);
  };

  const handleOpenModal = (step, index) => setModalStep({ text: step, index: index });

  return (
    <div>
      {Array.isArray(steps) && steps.map((step, index) => (
        <div key={index} style={annotations[index]?.completed ? completedStyle : listItemStyle}>
          <input
            type="checkbox"
            checked={annotations[index]?.completed || false}
            onChange={() => handleToggleStep(index)}
            style={{ marginRight: '15px', transform: 'scale(1.5)' }}
          />
          <span style={{ flexGrow: 1 }}>{step}</span>
          <button onClick={() => handleOpenModal(step, index)} style={{ fontSize: '0.8rem', padding: '5px 10px', background: '#ecf0f1', color: '#333' }}>
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