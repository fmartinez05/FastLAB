import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { debounce } from 'lodash';

// Este componente envuelve tldraw y maneja la carga y guardado de datos
// usando la API correcta para la versión de tu proyecto.
const DrawingCanvas = ({ savedDrawing, onSave }) => {
  const [app, setApp] = useState(null);

  // Callback para guardar la instancia de la app de tldraw una vez que se monta.
  const handleMount = useCallback((tldrawApp) => {
    setApp(tldrawApp);
  }, []);

  // Efecto para cargar el dibujo guardado cuando el componente aparece y la app está lista.
  useEffect(() => {
    if (app && savedDrawing) {
      try {
        // La API antigua usa loadDocument, que espera un objeto.
        const document = JSON.parse(savedDrawing);
        app.loadDocument(document);
      } catch (error) {
        console.error("Error al cargar el dibujo guardado:", error);
      }
    }
  }, [app, savedDrawing]);

  // Usamos useMemo para crear una versión "debounced" de la función de guardado.
  // Esto asegura que no guardamos en cada movimiento del ratón, solo cuando el usuario para.
  const debouncedSave = useMemo(
    () =>
      debounce((tldrawApp) => {
        // La API antigua usa `tldrawApp.document` para obtener el estado.
        const drawingState = JSON.stringify(tldrawApp.document);
        onSave(drawingState);
      }, 500), // Espera 500ms después del último cambio para guardar
    [onSave]
  );
  
  return (
    <div className="drawing-canvas-container" style={{ position: 'relative', height: '450px' }}>
      <Tldraw
        onMount={handleMount}
        onChange={debouncedSave} // Usamos la función debounced directamente aquí.
        showUI={true}
        showPages={false}
        showMenu={false}
      />
    </div>
  );
};

export default DrawingCanvas;