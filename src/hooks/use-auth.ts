'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type UserProfile = {
  id: string;
  role: 'member' | 'board' | 'admin';
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setLoading(false);
        return;
      }

      setUser(userData.user);

      // 🔥 Rollenprüfung aus DB
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userData.user.id)
        .single();

      setProfile(profileData || null);
      setLoading(false);
    }

    load();
  }, []);

  return {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isBoard: profile?.role === 'board',
    isPrivileged: ['admin', 'board'].includes(profile?.role || ''),
  };
}
