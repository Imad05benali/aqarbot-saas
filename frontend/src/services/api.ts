import axios from 'axios';

// The base URL will point to our FastAPI backend. 
// In Vite, we can use env variables. For now, assuming localhost:8000 for local dev.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401, the token is invalid or expired.
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getDashboardData = async () => {
  const response = await api.get('/api/agency/dashboard');
  return response.data;
};

export const getForecastData = async () => {
  const response = await api.get('/api/analytics/forecast');
  return response.data;
};

export const getSettingsData = async () => {
  const response = await api.get('/api/agency/settings');
  return response.data;
};

export const updateSettingsData = async (tone: string) => {
  const response = await api.post('/api/agency/settings', { tone });
  return response.data;
};

// Properties API
export const getProperties = async () => {
  const response = await api.get('/api/properties');
  return response.data;
};

export const getLeads = async () => {
  const response = await api.get('/api/leads');
  return response.data;
};

export const createProperty = async (data: any) => {
  const response = await api.post('/api/properties/ingest', data);
  return response.data;
};

export const deleteProperty = async (id: number) => {
  const response = await api.delete(`/api/properties/${id}`);
  return response.data;
};

export const ingestCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/properties/ingest-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// AI Session Management
export const toggleAIPause = async (phone: string, paused: boolean) => {
  const response = await api.post('/api/session/takeover', { phone, paused });
  return response.data;
};

// Configuration API
export const getAIConfig = async () => {
  const response = await api.get('/api/agency/config');
  return response.data;
};

export const updateAIConfig = async (data: any) => {
  const response = await api.post('/api/agency/config', data);
  return response.data;
};

export default api;
