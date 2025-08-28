import React, { useState } from 'react';
import Whiteboard from './Whiteboard';

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
      
      {/* --- CAMBIO: Previsualización de la pizarra --- */}
      <div className="whiteboard-preview" onClick={() => setIsWhiteboardOpen(true)}>
        {notes?.drawing ? (
          <img src={notes.drawing} alt="Anotación del profesor" />
        ) : (
          <span className="whiteboard-preview-placeholder">Haz clic para abrir la pizarra y dibujar</span>
        )}
      </div>

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