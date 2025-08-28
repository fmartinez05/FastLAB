import React, { useState } from 'react';
import Whiteboard from './Whiteboard';

const AnnotationModal = ({ step, onSave, onCancel }) => {
  const [text, setText] = useState(step.annotation?.text || '');
  const [drawing, setDrawing] = useState(step.annotation?.drawing || null);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);

  const handleSave = () => {
    onSave({ text, drawing });
  };
  
  const handleSaveDrawing = (dataUrl) => {
    setDrawing(dataUrl);
    setIsWhiteboardOpen(false);
  };

  return (
    <>
      <div className="annotation-modal">
        <h3>Anotaciones para: "{step.text}"</h3>
        <h4>Anotaciones con Teclado</h4>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="5"
          placeholder="Escribe tus resultados, observaciones, etc."
        />

        <h4>Apuntes a Mano (Apple Pencil / Ratón)</h4>
        
        {/* --- CAMBIO: Previsualización de la pizarra --- */}
        <div className="whiteboard-preview" onClick={() => setIsWhiteboardOpen(true)}>
            {drawing ? (
                <img src={drawing} alt="Anotación a mano" />
            ) : (
                <span className="whiteboard-preview-placeholder">Haz clic para abrir la pizarra</span>
            )}
        </div>
        
        <div className="modal-actions">
          <button onClick={onCancel} className="cancel-btn">Cancelar</button>
          <button onClick={handleSave} className="save-btn">Guardar Anotación</button>
        </div>
      </div>

      {isWhiteboardOpen && (
        <Whiteboard
          initialDrawing={drawing}
          onSave={handleSaveDrawing}
          onCancel={() => setIsWhiteboardOpen(false)}
        />
      )}
    </>
  );
};

export default AnnotationModal;