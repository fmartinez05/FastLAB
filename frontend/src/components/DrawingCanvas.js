import React, { useEffect, useMemo } from 'react'; // <-- CORRECCIÓN 1: Importamos useMemo
import { Tldraw, useEditor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { debounce } from 'lodash';

// Componente interno para manejar la lógica de la pizarra
const TldrawEditor = ({ savedDrawing, onSave }) => {
    const editor = useEditor();

    useEffect(() => {
        if (editor && savedDrawing) {
            try {
                const snapshot = JSON.parse(savedDrawing);
                editor.loadSnapshot(snapshot);
            } catch (error) {
                console.error("Error al cargar el dibujo guardado:", error);
            }
        }
    }, [editor, savedDrawing]);

    // --- CORRECCIÓN 2: Cambiamos useCallback por useMemo ---
    // useMemo es la forma correcta de memorizar un valor (como una función debounced)
    // entre renders. Esto satisface la regla de eslint y soluciona el error de build.
    const debouncedSave = useMemo(
        () => 
            debounce((newSnapshot) => {
                onSave(JSON.stringify(newSnapshot));
            }, 500),
        [onSave]
    );

    useEffect(() => {
        if (!editor) return;

        const handleChange = () => {
            const currentSnapshot = editor.getSnapshot();
            debouncedSave(currentSnapshot);
        };

        const unsubscribe = editor.store.on('change', handleChange);

        return () => {
            unsubscribe();
        };
    }, [editor, debouncedSave]);

    return null;
};

// Componente principal que exportamos
const DrawingCanvas = ({ savedDrawing, onSave }) => {
    return (
        <div className="drawing-canvas-container" style={{ position: 'relative', height: '450px' }}>
            <Tldraw
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