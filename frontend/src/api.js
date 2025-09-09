import axios from 'axios';
import { auth } from './firebase-config';

const apiClient = axios.create({
  baseURL: '[https://fastlab-backend.onrender.com/api](https://fastlab-backend.onrender.com/api)', // O tu URL de backend
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

export const deleteReport = (reportId) => {
  return apiClient.delete(`/reports/${reportId}`);
};

export const askAssistant = (query, context) => {
  return apiClient.post('/assistant/ask', { query, context });
};

// --- NUEVA FUNCIÓN PARA EXPORTAR A CSV ---
export const downloadReportCSV = (reportId, reportData) => {
  return apiClient.post(`/reports/${reportId}/csv`, reportData, {
    responseType: 'blob',
  });
};