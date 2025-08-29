import axios from 'axios';
import { auth } from './firebase-config';

const apiClient = axios.create({
  baseURL: 'https://fastlab-backend.onrender.com/api',
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
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

// --- ¡NUEVA FUNCIÓN PARA BORRAR! ---
export const deleteReport = (reportId) => {
  return apiClient.delete(`/reports/${reportId}`);
};

// --- NUEVA FUNCIÓN PARA EL ASISTENTE IA ---
export const askAssistant = (query, context) => {
  return apiClient.post('/assistant/ask', { query, context });
};