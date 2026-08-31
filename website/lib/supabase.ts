import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseUrl = rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,  // Prevents background refresh loops when project is paused
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Quick connectivity check — pings the Supabase REST endpoint.
 * Returns true if reachable, false otherwise.
 */
export async function isSupabaseReachable(): Promise<boolean> {
  if (!supabaseUrl) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: { apikey: supabaseAnonKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok || res.status === 401 || res.status === 406;
  } catch {
    return false;
  }
}
