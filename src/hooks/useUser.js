'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useAppMode from '@/hooks/useAppMode';
import { StorageService } from '@/lib/storageService';

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isPWA } = useAppMode(); // Menggunakan detektor PWA yang baru kita buat

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);

      // JIKA MODE PWA: Bypass Supabase, gunakan user lokal HP
      if (isPWA) {
        try {
          const localProfile = await StorageService.getProfile(
            'LOCAL_PWA',
            true,
          );
          setUser({
            id: 'local-user-id',
            personal_code: 'LOCAL_PWA',
            username: localProfile?.username || 'Hamba Allah',
            avatar_url: localProfile?.avatar_url || null,
            ...localProfile,
          });
        } catch (error) {
          console.error('Gagal meload profil lokal PWA:', error);
          setUser({ personal_code: 'LOCAL_PWA', username: 'Hamba Allah' });
        }
        setLoading(false);
        return;
      }

      // JIKA MODE WEB: Gunakan Supabase (Login dengan Personal Code)
      try {
        const localUserStr = localStorage.getItem('myRamadhan_user');
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr);
          if (localUser?.personal_code) {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('personal_code', localUser.personal_code)
              .single();

            if (data && !error) {
              setUser(data);
            } else {
              localStorage.removeItem('myRamadhan_user');
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Gagal verifikasi user web:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [isPWA]);

  return { user, loading };
}
