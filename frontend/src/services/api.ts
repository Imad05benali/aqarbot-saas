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
/**
 * Resolve the signed-in user's agency_id (tenant scope).
 * Used by the local Supabase fallbacks below so a write can never target
 * another agency's rows when the backend is unreachable.
 */
export const resolveCurrentAgencyId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return null;
    const { data: me } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .maybeSingle();
    return (me?.agency_id as string | null) ?? null;
  } catch (err) {
    console.error('Unable to resolve current agency_id', err);
    return null;
  }
};

export const toggleAIPause = async (phone: string, paused: boolean, agencyId?: string | null) => {
  try {
    const response = await api.post('/api/session/takeover', { phone, paused });
    return response.data;
  } catch (err) {
    // Backend may be unreachable (e.g. VITE_API_URL unset in this build) —
    // update the lead directly through Supabase so takeover still works.
    console.warn('Backend takeover unreachable — updating lead via Supabase directly', err);
    const scope = agencyId ?? (await resolveCurrentAgencyId());
    if (!scope) {
      throw new Error(
        "Agence introuvable : mise à jour du lead refusée pour éviter de toucher les données d'un autre tenant."
      );
    }
    const { error } = await supabase
      .from('leads')
      .update({ is_ai_paused: paused })
      .eq('phone_number', phone)
      .eq('agency_id', scope);
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
//
// Both calls carry X-Agency-Id: the backend needs the tenant scope to load and
// persist the agency's own WhatsApp phone-number id (the value the webhook
// uses to route inbound conversations to the right agency).
const agencyHeaders = (agencyId?: string | null) =>
  agencyId ? { headers: { 'X-Agency-Id': agencyId } } : {};

export const getAIConfig = async (agencyId?: string | null) => {
  const response = await api.get('/api/agency/config', agencyHeaders(agencyId));
  return response.data;
};

export const updateAIConfig = async (data: any, agencyId?: string | null) => {
  const response = await api.post('/api/agency/config', data, agencyHeaders(agencyId));
  return response.data;
};

export default api;
