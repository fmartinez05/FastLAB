import React, { useState } from 'react';
import Whiteboard from './Whiteboard'; // Importamos la nueva pizarra

const ProfessorNotes = ({ notes, setNotes }) => {
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  const handleTextChange = (e) => {
    setNotes({ ...notes, text: e.target.value });
  };
  
  const handleSaveDrawing = (dataUrl) => {
    setNotes({ ...notes, drawing: dataUrl });
    setIsWhiteboardOpen(false);
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
        placeholder="Ej: 'Recordad que la reacción es exotérmica...'"
      />

      <h4>Apuntes a Mano (Apple Pencil / Ratón)</h4>
      {notes?.drawing && <img src={notes.drawing} alt="Anotación del profesor" className="drawing-preview" />}
      <button onClick={() => setIsWhiteboardOpen(true)}>
        {notes?.drawing ? 'Editar Dibujo' : 'Abrir Pizarra'}
      </button>

      {isWhiteboardOpen && (
        <Whiteboard 
          initialDrawing={notes?.drawing}
          onSave={handleSaveDrawing}
          onCancel={() => setIsWhiteboardOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfessorNotes;