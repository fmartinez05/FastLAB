import { useEffect, useRef, useMemo } from 'react';
import { saveReport } from '../api';
import { debounce } from 'lodash';

export const useAutosave = (reportId, data, setIsSaving, delay = 2500) => {
  // --- 1. CREAMOS UN REF PARA GUARDAR SIEMPRE LA ÚLTIMA VERSIÓN DE LOS DATOS ---
  // Este ref actuará como nuestra "caja mágica".
  const latestData = useRef(data);

  // Este efecto se asegura de que nuestro ref siempre tenga los datos más frescos en cada render.
  useEffect(() => {
    latestData.current = data;
  }, [data]);

  const firstMount = useRef(true);

  const debouncedSave = useMemo(() =>
    debounce(async (id) => {
      // --- 2. LA FUNCIÓN DE GUARDADO USA LOS DATOS DEL REF, NO UN ARGUMENTO ---
      // Justo antes de guardar, mira dentro de la "caja mágica" para obtener los datos más recientes.
      const dataToSave = latestData.current;
      if (!id || !dataToSave) return;

      setIsSaving(true);
      try {
        await saveReport(id, dataToSave);
      } catch (error) {
        console.error("Error en autoguardado:", error);
      } finally {
        setTimeout(() => setIsSaving(false), 1000);
      }
    }, delay),
    [delay, setIsSaving] // Dependencias que no cambian.
  );

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    
    if (data && reportId) {
      // --- 3. LA LLAMADA AHORA ES MÁS SIMPLE ---
      // Solo necesitamos "activar" el guardado. Ya no pasamos los datos directamente.
      debouncedSave(reportId);
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [data, reportId, debouncedSave]);
};