import axios from 'axios';

// The base URL will point to our FastAPI backend. 
// In Vite, we can use env variables. For now, assuming localhost:8000 for local dev.
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
  const response = await api.get('/agency/dashboard');
  return response.data;
};

export const getSettingsData = async () => {
  const response = await api.get('/agency/settings');
  return response.data;
};

export const updateSettingsData = async (tone: string) => {
  const response = await api.post('/agency/settings', { tone });
  return response.data;
};

// Properties API
export const getProperties = async () => {
  const response = await api.get('/properties/list');
  return response.data;
};

export const createProperty = async (data: any) => {
  const response = await api.post('/properties/ingest', data);
  return response.data;
};

export const deleteProperty = async (id: number) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};

export default api;
