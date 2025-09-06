import React, { useCallback, useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

// Usamos forwardRef para que el componente padre pueda acceder a funciones de este componente
const DrawingCanvas = forwardRef(({ savedDrawing, onSave }, ref) => {
  const [app, setApp] = useState(null);
  const lastState = useRef(null); // Ref para guardar el último estado sin causar re-renders

  // Exponemos una función para que el padre la pueda llamar a través de la ref
  useImperativeHandle(ref, () => ({
    getLatestDrawingState: () => {
      return lastState.current;
    }
  }));

  const handleMount = useCallback((tldrawApp) => {
    setApp(tldrawApp);
  }, []);

  // Carga el dibujo guardado al iniciar
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

  // 'onChange' ahora solo actualiza la referencia local, es muy eficiente.
  const handleChange = (tldrawApp) => {
    lastState.current = JSON.stringify(tldrawApp.document);
  };
  
  // 'onBlur' se activa cuando el usuario hace clic fuera de la pizarra.
  // En ese momento, "confirmamos" el guardado del último estado.
  const handleBlur = () => {
    if (lastState.current) {
      onSave(lastState.current);
    }
  };
  
  return (
    // Añadimos tabIndex para que el div pueda detectar el evento onBlur
    <div style={{ position: 'relative', height: '450px' }} tabIndex={-1} onBlur={handleBlur}>
      <Tldraw
        onMount={handleMount}
        onChange={handleChange}
        showUI={true}
        showPages={false}
        showMenu={false}
      />
    </div>
  );
});

export default DrawingCanvas;