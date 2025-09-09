import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { debounce } from 'lodash';

// Esta es la versión definitiva y más robusta del componente de la pizarra.
const DrawingCanvas = ({ savedDrawing, onSave }) => {
  const [app, setApp] = useState(null);

  // Guardamos la instancia de la app de tldraw cuando se monta.
  const handleMount = useCallback((tldrawApp) => {
    setApp(tldrawApp);
  }, []);

  // Efecto para cargar el dibujo guardado cuando el componente aparece.
  useEffect(() => {
    if (app && savedDrawing) {
      try {
        const document = JSON.parse(savedDrawing);
        app.loadDocument(document);
      } catch (error) {
        console.error("Error al cargar el dibujo guardado:", error);
      }
    }
  }, [app, savedDrawing]);

  // --- LÓGICA DE GUARDADO CORREGIDA Y MEJORADA ---
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        // IMPORTANTE: Solo intentamos guardar si la 'app' existe.
        if (app) {
          // Obtenemos el estado MÁS RECIENTE directamente de la instancia 'app'.
          const drawingState = JSON.stringify(app.document);
          onSave(drawingState);
        }
      }, 800), // Aumentamos ligeramente el tiempo de espera para más seguridad.
    [app, onSave] // La función se recalcula si 'app' o 'onSave' cambian.
  );

  // El evento onChange ahora solo llama a la función debounced, sin pasar argumentos.
  // La función ya sabe de dónde obtener los datos (del estado 'app').
  const handleChange = () => {
    debouncedSave();
  };
  
  return (
    <div className="drawing-canvas-container" style={{ position: 'relative', height: '450px' }}>
      <Tldraw
        onMount={handleMount}
        onChange={handleChange} // Usamos nuestra nueva función de control.
        showUI={true}
        showPages={false}
        showMenu={false}
      />
    </div>
  );
};

export default DrawingCanvas;