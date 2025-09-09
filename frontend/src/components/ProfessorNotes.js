import React from 'react';
import DrawingCanvas from './DrawingCanvas';

const ProfessorNotes = ({ notes, setNotes }) => {

  const handleTextChange = (e) => {
    const newText = e.target.value;
    // --- CORRECCIÓN: Usamos la actualización funcional para evitar estado obsoleto ---
    setNotes(currentNotes => ({
      ...currentNotes,
      text: newText
    }));
  };

  const handleDrawingSave = (drawingState) => {
    // --- CORRECCIÓN: Usamos la actualización funcional aquí también ---
    setNotes(currentNotes => ({
      ...currentNotes,
      drawing: drawingState
    }));
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3>📝 Explicaciones del Profesor</h3>
      <p>Anota aquí los puntos clave, diagramas o fórmulas importantes.</p>
      
      <h4>Notas con Teclado</h4>
      <textarea
        value={notes?.text || ''}
        onChange={handleTextChange}
        rows="6"
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '1rem' }}
        placeholder="Ej: 'Recordad que la reacción es exotérmica, controlad la temperatura.'"
      />

      <h4>Apuntes a Mano</h4>
      <DrawingCanvas
        savedDrawing={notes?.drawing}
        onSave={handleDrawingSave}
      />
    </div>
  );
};

export default ProfessorNotes;