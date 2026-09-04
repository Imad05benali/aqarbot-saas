import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string | null;
  agency_name: string | null;
  agency_logo: string | null;
  agency_id: string | null;
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
      // 1. Own row in public.users (strict rebuilt schema:
      //    id, agency_id, full_name, email, role)
      const { data: userRow, error } = await supabase
        .from('users')
        .select('id, agency_id, full_name, email, role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Supabase Profile Sync Error:', error);
        setProfile(null);
        return;
      }

      // 2. Profile does not exist yet — create it lazily from Auth metadata
      if (!userRow) {
        const meta = user.user_metadata || {};
        const email = user.email || `${user.id}@auth.local`;
        const fallback: UserProfile = {
          id: user.id,
          full_name: meta.full_name || user.email || 'Utilisateur AqarBot',
          email,
          agency_name: null,
          agency_logo: null,
          agency_id: null,
          role: meta.role || 'Owner',
        };

        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            full_name: fallback.full_name,
            email,
            role: fallback.role,
          }, { onConflict: 'id' });

        if (upsertError) {
          console.error('Supabase Profile Sync Error (insert):', upsertError);
        }
        setProfile(fallback);
        return;
      }

      // 3. Existing user — enrich with agency branding when linked
      const base: UserProfile = {
        id: userRow.id,
        full_name: userRow.full_name || user.email || 'Utilisateur AqarBot',
        email: userRow.email,
        agency_name: null,
        agency_logo: null,
        agency_id: userRow.agency_id || null,
        role: userRow.role || 'Agent',
      };

      if (userRow.agency_id) {
        const { data: agency, error: agencyError } = await supabase
          .from('agencies')
          .select('id, agency_name, agency_logo')
          .eq('id', userRow.agency_id)
          .maybeSingle();

        if (agencyError) {
          console.error('Supabase Agency Sync Error:', agencyError);
        } else if (agency) {
          base.agency_name = agency.agency_name || null;
          base.agency_logo = agency.agency_logo || null;
        }
      }

      setProfile(base);
    } catch (err) {
      console.error('Supabase Profile Sync Error:', err);
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchProfile();
    } else {
      setProfile(null);
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
    // agency_logo lives on the agencies row, not users
    const agencyId = profile?.agency_id;
    if (!agencyId) return;

    const { error } = await supabase
      .from('agencies')
      .update({ agency_logo: url })
      .eq('id', agencyId);
    if (error) {
      console.error('Agency logo update failed:', error);
      return;
    }
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
