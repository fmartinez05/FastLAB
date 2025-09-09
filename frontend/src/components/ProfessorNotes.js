import React from 'react';
import DrawingCanvas from './DrawingCanvas'; // Importamos nuestro nuevo componente

const ProfessorNotes = ({ notes, setNotes }) => {

  const handleTextChange = (e) => {
    // Actualizamos solo el texto, el dibujo se maneja por separado
    const newNotes = { ...notes, text: e.target.value };
    setNotes(newNotes);
  };

  const handleDrawingSave = (drawingState) => {
    // Guardamos el estado del dibujo que nos envía DrawingCanvas
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
        savedDrawing={notes?.drawing} // Pasamos el dibujo guardado
        onSave={handleDrawingSave}     // Pasamos la función para guardar
      />
    </div>
  );
};

export default ProfessorNotes;