import api, { API_URL } from '../api/axios';
import { supabase } from '../lib/supabase';

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
  // Important: Let the browser automatically set the Content-Type boundary for multipart forms
  const response = await api.post('/api/properties/ingest-csv', formData);
  return response.data;
};

// AI Session Management
export const toggleAIPause = async (phone: string, paused: boolean) => {
  try {
    const response = await api.post('/api/session/takeover', { phone, paused });
    return response.data;
  } catch (err) {
    // Backend may be unreachable (e.g. VITE_API_URL unset in this build) —
    // update the lead directly through Supabase so takeover still works.
    console.warn('Backend takeover unreachable — updating lead via Supabase directly', err);
    const { error } = await supabase
      .from('leads')
      .update({ is_ai_paused: paused })
      .eq('phone_number', phone);
    if (error) throw error;
    return { status: 'success', phone, ai_paused: paused, source: 'direct' };
  }
};

export const sendManualChat = async (phone: string, message: string) => {
  try {
    const response = await api.post('/api/chat/send', { phone, message });
    return response.data;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      'Backend /api/chat/send unreachable (VITE_API_URL=' + API_URL + '). ' +
      'Hub messages cannot be sent without a live backend. Details: ' + detail
    );
  }
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
