import React, { useCallback, useEffect } from 'react'; // <-- CORRECCIÓN AQUÍ
import { Tldraw, useEditor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { debounce } from 'lodash';

// Componente interno para manejar la lógica de la pizarra
const TldrawEditor = ({ savedDrawing, onSave }) => {
    const editor = useEditor();

    // Efecto para cargar el dibujo guardado cuando el editor está listo
    useEffect(() => {
        if (editor && savedDrawing) {
            try {
                // tldraw espera un objeto, no un string JSON. Lo parseamos.
                const snapshot = JSON.parse(savedDrawing);
                editor.loadSnapshot(snapshot);
            } catch (error) {
                console.error("Error al cargar el dibujo guardado:", error);
            }
        }
    }, [editor, savedDrawing]);

    // --- CAMBIO CLAVE: FUNCIÓN DE GUARDADO CON DEBOUNCE ---
    // Creamos una versión de onSave que espera 500ms antes de ejecutarse.
    // useCallback asegura que esta función no se recree en cada render.
    const debouncedSave = useCallback(
        debounce((newSnapshot) => {
            // Guardamos el estado como un string JSON, como ya lo hacías.
            onSave(JSON.stringify(newSnapshot));
        }, 500), // 500ms de espera
        [onSave]
    );

    // useEffect para escuchar los cambios dentro del editor de tldraw
    useEffect(() => {
        if (!editor) return;

        // Nos suscribimos a los cambios en el estado de la pizarra
        const handleChange = () => {
            const currentSnapshot = editor.getSnapshot();
            debouncedSave(currentSnapshot);
        };

        const unsubscribe = editor.store.on('change', handleChange);

        // Limpieza: nos desuscribimos cuando el componente se desmonta
        return () => {
            unsubscribe();
        };
    }, [editor, debouncedSave]);

    return null; // Este componente no renderiza nada, solo contiene la lógica
};

// Componente principal que exportamos
const DrawingCanvas = ({ savedDrawing, onSave }) => {
    return (
        <div className="drawing-canvas-container" style={{ position: 'relative', height: '450px' }}>
            <Tldraw
                // La lógica se ha movido al componente TldrawEditor
                showUI={true}
                showPages={false}
                showMenu={false}
            >
                <TldrawEditor savedDrawing={savedDrawing} onSave={onSave} />
            </Tldraw>
        </div>
    );
};

export default DrawingCanvas;