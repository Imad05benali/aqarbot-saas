import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number = 604800) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check with cookie parsing handshake
    const initializeAuth = async () => {
      try {
        let activeSession: Session | null = null;
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          activeSession = initialSession;
        } else {
          let accessToken = getCookie('sb-access-token');
          let refreshToken = getCookie('sb-refresh-token');
          
          // 2. Parse URL hash for Cross-Domain Handoff (Next.js -> Vite)
          if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const urlAccessToken = hashParams.get('access_token');
            const urlRefreshToken = hashParams.get('refresh_token');
            
            if (urlAccessToken && urlRefreshToken) {
              accessToken = urlAccessToken;
              refreshToken = urlRefreshToken;
              // Clean up the URL securely
              window.history.replaceState(null, '', window.location.pathname);
            }
          }

          if (accessToken && refreshToken) {
            const { data } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (data.session) {
              activeSession = data.session;
            }
          }
        }

        if (mounted && activeSession) {
          setSession(activeSession);
          localStorage.setItem('token', activeSession.access_token);
          setCookie('sb-access-token', activeSession.access_token);
          setCookie('sb-refresh-token', activeSession.refresh_token || '');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;

      // Only update if it's a meaningful change to avoid loops
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(currentSession);
        
        if (currentSession?.access_token) {
          localStorage.setItem('token', currentSession.access_token);
          setCookie('sb-access-token', currentSession.access_token);
          setCookie('sb-refresh-token', currentSession.refresh_token || '');
        } else {
          localStorage.removeItem('token');
          clearCookie('sb-access-token');
          clearCookie('sb-refresh-token');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error', e);
    }
    localStorage.removeItem('token');
    clearCookie('sb-access-token');
    clearCookie('sb-refresh-token');
    setSession(null);
  };

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setCookie('sb-access-token', token);
    // Trigger arbitrary state to remount/update or reload page
    window.location.href = '/dashboard';
  };

  const value = {
    token: session?.access_token || null,
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
