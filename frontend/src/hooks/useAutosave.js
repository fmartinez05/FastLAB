import { useEffect, useRef } from 'react';
import { saveReport } from '../api';
import { debounce } from 'lodash';

// Necesitarás instalar lodash: npm install lodash
export const useAutosave = (reportId, data, setIsSaving, delay = 2500) => {
  const firstMount = useRef(true);

  // Usamos useRef para mantener la misma instancia de la función debounced entre renders
  const debouncedSave = useRef(
    debounce(async (id, reportData) => {
      if (!id || !reportData) return;
      setIsSaving(true);
      try {
        await saveReport(id, reportData);
      } catch (error) {
        console.error("Error en autoguardado:", error);
      } finally {
        setTimeout(() => setIsSaving(false), 1000); // Mantiene el estado de "Guardado" por 1s
      }
    }, delay)
  ).current;

  useEffect(() => {
    // Evitamos guardar en la primera carga del componente
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    
    // Solo llamamos a guardar si hay datos
    if (data && reportId) {
      debouncedSave(reportId, data);
    }

    // Limpieza al desmontar el componente
    return () => {
      debouncedSave.cancel();
    };
  }, [data, reportId, debouncedSave]);
};