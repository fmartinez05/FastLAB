import React, { useCallback, useEffect, useState } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

// Este componente envuelve tldraw y maneja la carga y guardado de datos.
const DrawingCanvas = ({ savedDrawing, onSave }) => {
  const [app, setApp] = useState(null);

  // Callback para guardar la instancia de la app de tldraw
  const handleMount = useCallback((tldrawApp) => {
    setApp(tldrawApp);
  }, []);

  // Efecto para cargar el dibujo guardado cuando el componente aparece
  useEffect(() => {
    // **CAMBIO IMPORTANTE:**
    // Solo actuamos si tenemos un dibujo guardado para cargar.
    // Si 'savedDrawing' no existe, no hacemos nada y dejamos que tldraw
    // muestre su lienzo vacío por defecto.
    if (app && savedDrawing) {
      try {
        const document = JSON.parse(savedDrawing);
        app.loadDocument(document);
      } catch (error) {
        console.error("Error al cargar el dibujo guardado:", error);
        // Si el dibujo guardado está corrupto, no hacemos nada y el usuario verá un lienzo en blanco.
      }
    }
    // Hemos eliminado el bloque 'else' que llamaba a la función que causaba el error.
  }, [app, savedDrawing]);

  // Se activa cada vez que hay un cambio en el lienzo
  const handleChange = (tldrawApp) => {
    const drawingState = JSON.stringify(tldrawApp.document);
    onSave(drawingState);
  };
  
  return (
    <div style={{ position: 'relative', height: '450px' }}>
      <Tldraw
        onMount={handleMount}
        onChange={handleChange}
        showUI={true}
        showPages={false}
        showMenu={false}
      />
    </div>
  );
};

export default DrawingCanvas;