import React from 'react';
import DrawingCanvas from './DrawingCanvas'; 

const ProfessorNotes = ({ notes, setNotes }) => {

  const handleTextChange = (e) => {
    const newNotes = { ...notes, text: e.target.value };
    setNotes(newNotes);
  };

  // Esta función ahora se llama cuando el usuario hace clic fuera de la pizarra
  const handleDrawingSave = (drawingState) => {
    const newNotes = { ...notes, drawing: drawingState };
    setNotes(newNotes);
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
        onSave={handleDrawingSave} // onSave se activará con el "onBlur"
      />
       <p style={{fontSize: '0.8rem', color: '#666', textAlign: 'right', marginTop: '5px'}}>
          El estado de la pizarra se guarda al hacer clic fuera de ella.
      </p>
    </div>
  );
};

export default ProfessorNotes;