import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface UserProfile {
  id: string;
  full_name: string;
  agency_name: string;
  agency_logo: string | null;
  role: string;
}

interface ProfileContextValue {
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  refreshProfile: () => Promise<void>;
  updateAgencyLogo: (url: string) => Promise<void>;
}

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const fetchProfile = async () => {
    if (!user?.id) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, agency_name, agency_logo, role')
        .eq('id', user.id)
        .single();

      if (error) {
        // Strict error tracking — visible in DevTools Inspector
        console.error('Supabase Profile Sync Error:', error);

        // Profile might not exist yet – create it lazily from Auth metadata
        if (error.code === 'PGRST116' || !data) {
          const meta = user.user_metadata || {};
          const fallback: UserProfile = {
            id: user.id,
            full_name: meta.full_name || user.email || 'Utilisateur AqarBot',
            agency_name: meta.agency_name || 'Agence Immobilière',
            agency_logo: null,
            role: 'Owner',
          };

          // Lazy insert
          const { error: upsertError } = await supabase
            .from('users')
            .insert([{
              id: user.id,
              full_name: fallback.full_name,
              agency_name: fallback.agency_name,
              role: fallback.role,
            }]);
            
          if (upsertError) {
            console.error('Supabase Profile Sync Error (insert):', upsertError);
          } else {
            setProfile(fallback);
          }
        }
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      // Catch unexpected runtime / network failures
      console.error('Supabase Profile Sync Error:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchProfile();
    } else {
      setIsLoadingProfile(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);

  const refreshProfile = async () => {
    setIsLoadingProfile(true);
    await fetchProfile();
  };

  const updateAgencyLogo = async (url: string) => {
    if (!user?.id) return;
    await supabase.from('users').update({ agency_logo: url }).eq('id', user.id);
    setProfile((prev) => prev ? { ...prev, agency_logo: url } : prev);
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoadingProfile, refreshProfile, updateAgencyLogo }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
