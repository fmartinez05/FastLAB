import axios from 'axios';
import { auth } from './firebase-config';

// Este código leerá la variable que pusiste en Netlify cuando se despliegue.
// Si estás en tu ordenador local, buscará un archivo .env.local.
const baseURL = process.env.REACT_APP_API_BASE_URL;

const apiClient = axios.create({
  baseURL: baseURL,
});

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

export const uploadPDF = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/analyze-pdf/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const solveCalculation = (query) => {
  return apiClient.post('/solve-calculation/', { query });
};

export const saveReport = (reportId, reportData) => {
  return apiClient.post(`/reports/${reportId}/save`, reportData);
};

export const getUserReports = () => {
  return apiClient.get('/reports/');
};

export const loadReport = (reportId) => {
  return apiClient.get(`/reports/${reportId}`);
};

export const downloadReport = (reportId, reportData) => {
  return apiClient.post(`/reports/${reportId}/generate-pdf`, reportData, {
    responseType: 'blob',
  });
};

export const deleteReport = (reportId) => {
  return apiClient.delete(`/reports/${reportId}`);
};

export const askAssistant = (query, context) => {
  return apiClient.post('/assistant/ask', { query, context });
};

export const downloadReportCSV = (reportId, reportData) => {
  return apiClient.post(`/reports/${reportId}/csv`, reportData, {
    responseType: 'blob',
  });
};