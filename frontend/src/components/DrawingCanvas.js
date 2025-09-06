import React, { useCallback, useEffect, useState } from 'react';
import { Tldraw, TldrawApp, useFileSystem } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

// Este componente envuelve tldraw y maneja la carga y guardado de datos.
const DrawingCanvas = ({ savedDrawing, onSave }) => {
  const [app, setApp] = useState(null);
  const fileSystem = useFileSystem();

  // Callback para guardar la instancia de la app de tldraw
  const handleMount = useCallback((tldrawApp) => {
    setApp(tldrawApp);
  }, []);

  // Efecto para cargar el dibujo guardado cuando el componente aparece
  useEffect(() => {
    if (app && savedDrawing) {
      try {
        // tldraw guarda su estado como un "snapshot" o "documento"
        const document = JSON.parse(savedDrawing);
        app.loadDocument(document);
      } catch (error) {
        console.error("Error al cargar el dibujo:", error);
        app.newProject(); // Si hay error, crea un proyecto nuevo
      }
    } else if (app) {
      app.newProject();
    }
  }, [app, savedDrawing]);

  // Se activa cada vez que hay un cambio en el lienzo
  const handleChange = (tldrawApp) => {
    // Guardamos el estado completo del lienzo como un string JSON
    const drawingState = JSON.stringify(tldrawApp.document);
    onSave(drawingState);
  };
  
  return (
    <div style={{ position: 'relative', height: '450px' }}>
      <Tldraw
        onMount={handleMount}
        onChange={handleChange}
        showUI={true} // Muestra la barra de herramientas profesional
        showPages={false} // Ocultamos la paginación para simplificar
        showMenu={false} // Ocultamos el menú principal para simplificar
      />
    </div>
  );
};

export default DrawingCanvas;