import axios from 'axios';
import { auth } from './firebase-config';

// Este código leerá la variable que configuraste en Netlify.
// Si estás en tu ordenador local, buscará un archivo .env.local.
const baseURL = process.env.REACT_APP_API_BASE_URL;

// Creamos una instancia de Axios con la configuración base.
const apiClient = axios.create({
  baseURL: baseURL,
});

// Interceptor para añadir el token de autenticación de Firebase a cada petición.
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
  }
  return config;
});

// --- FUNCIONES DE LA API ---

/**
 * Sube un archivo PDF para ser analizado por la IA.
 */
export const uploadPDF = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/analyze-pdf/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Envía una consulta de cálculo al asistente de la IA.
 */
export const solveCalculation = (query) => {
  return apiClient.post('/solve-calculation/', { query });
};

/**
 * Guarda el progreso actual de un informe.
 */
export const saveReport = (reportId, reportData) => {
  return apiClient.post(`/reports/${reportId}/save`, reportData);
};

/**
 * Obtiene la lista de todos los informes de un usuario.
 */
export const getUserReports = () => {
  return apiClient.get('/reports/');
};

/**
 * Carga los datos completos de un informe específico.
 */
export const loadReport = (reportId) => {
  return apiClient.get(`/reports/${reportId}`);
};

/**
 * Solicita la generación y descarga de un informe en formato PDF.
 */
export const downloadReport = (reportId, reportData) => {
  return apiClient.post(`/reports/${reportId}/generate-pdf`, reportData, {
    responseType: 'blob',
  });
};

/**
 * Borra un informe específico.
 */
export const deleteReport = (reportId) => {
  return apiClient.delete(`/reports/${reportId}`);
};

/**
 * Envía una pregunta al asistente de la IA con contexto.
 */
export const askAssistant = (query, context) => {
  return apiClient.post('/assistant/ask', { query, context });
};

/**
 * Solicita la descarga de los datos de un informe en formato CSV.
 */
export const downloadReportCSV = (reportId, reportData) => {
  return apiClient.post(`/reports/${reportId}/csv`, reportData, {
    responseType: 'blob',
  });
};