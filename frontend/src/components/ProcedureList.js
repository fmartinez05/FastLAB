import React, { useState } from 'react';
import AnnotationModal from './AnnotationModal';

const procedureItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  marginBottom: '0.75rem',
  gap: '1rem',
};

const procedureTextStyle = {
  flexGrow: 1,
  lineHeight: '1.5',
};

const ProcedureList = ({ steps, annotations, setAnnotations }) => {
  const [editingStep, setEditingStep] = useState(null);

  const handleOpenModal = (step, index) => {
    // Busca si ya existe una anotación para este paso
    const existingAnnotation = annotations.find(ann => ann.step === index);
    setEditingStep({ 
      text: step, 
      index: index, 
      // Pasa la anotación existente o un objeto vacío al modal
      annotation: existingAnnotation || { text: '', drawing: null } 
    });
  };

  const handleCancel = () => {
    setEditingStep(null);
  };

  // ===== LA CORRECCIÓN CLAVE ESTÁ AQUÍ =====
  const handleSaveAnnotation = (annotationData) => {
    const stepIndex = editingStep.index;

    // Filtramos las anotaciones para quitar la versión vieja de la que estamos editando
    const otherAnnotations = annotations.filter(ann => ann.step !== stepIndex);

    // Creamos la nueva anotación actualizada, asegurando que tenga el 'step' correcto
    const newAnnotation = {
      ...annotationData, // Esto incluye el 'text' y el 'drawing' del modal
      step: stepIndex,
    };

    // Volvemos a juntar la lista y la ordenamos para mantener la consistencia
    const updatedAnnotations = [...otherAnnotations, newAnnotation].sort((a, b) => a.step - b.step);
    
    // Actualizamos el estado principal en LabPage.js
    setAnnotations(updatedAnnotations);
    setEditingStep(null); // Cerramos el modal
  };

  return (
    <div>
      {steps.map((step, index) => {
        // Buscamos si existe una anotación para este paso para darle estilo al botón
        const annotation = annotations.find(ann => ann.step === index);
        const hasAnnotation = annotation && (annotation.text || annotation.drawing);

        return (
          <div key={index} style={procedureItemStyle}>
            <span style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#3182CE'}}>
              {index + 1}
            </span>
            <p style={procedureTextStyle}>{step}</p>
            <button 
              onClick={() => handleOpenModal(step, index)}
              style={{
                backgroundColor: hasAnnotation ? '#38A169' : '#5c6bc0', // Verde si ya tiene anotación
                flexShrink: 0 
              }}
            >
              {hasAnnotation ? '📝 Editar Anotación' : '➕ Añadir Anotación'}
            </button>
          </div>
        );
      })}

      {editingStep && (
        <AnnotationModal
          step={editingStep}
          onSave={handleSaveAnnotation}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default ProcedureList;