import axios from 'axios';

// The base URL points to our FastAPI backend.
// `VITE_API_URL` is set at build time in CI so deployed builds use the
// real host; during local dev it falls back to localhost.
// Normalize a scheme-less value (e.g. "aqarbot-saas-t2w5.vercel.app")
// so axios doesn't resolve it as a relative path against the dashboard
// origin — that previously produced 405 Method Not Allowed on every call.
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_URL = /^https?:\/\//i.test(rawApiUrl) ? rawApiUrl : `https://${rawApiUrl}`;

const api = axios.create({
  baseURL: API_URL,
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
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
