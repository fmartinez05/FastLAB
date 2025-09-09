import { useEffect, useRef } from 'react';
import { saveReport } from '../api';

export const useAutosave = (reportId, data, setIsSaving, delay = 2500) => {
  const firstMount = useRef(true);

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }

    if (!data) {
      return;
    }

    const handler = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveReport(reportId, data);
      } catch (error) {
        console.error("Error en autoguardado:", error);
      } finally {
        setTimeout(() => setIsSaving(false), 1000);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [data, reportId, setIsSaving, delay]);
};