import React, { useCallback, useEffect, useState } from 'react';
// La importación de 'useFileSystem' ha sido eliminada
import { Tldraw, TldrawApp } from '@tldraw/tldraw';
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
    if (app && savedDrawing) {
      try {
        const document = JSON.parse(savedDrawing);
        app.loadDocument(document);
      } catch (error) {
        console.error("Error al cargar el dibujo:", error);
        app.newProject();
      }
    } else if (app) {
      app.newProject();
    }
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

// **LA CORRECCIÓN ESTÁ AQUÍ**
export default DrawingCanvas;