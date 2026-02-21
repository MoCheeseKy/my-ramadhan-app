import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_READER_SETTINGS } from '@/data/quranConstants';

/**
 * useReaderSettings — mengelola state settings reader (arab/latin/terjemah/tajwid/arabSize).
 * - Load dari localStorage / Supabase saat mount
 * - Auto-sync ke localStorage + Supabase setiap kali settings berubah
 *
 * @param {object|null} user - User dari useUser()
 * @returns {{ settings, toggleSetting, setArabSize }}
 */
const useReaderSettings = (user) => {
  const [settings, setSettings] = useState(DEFAULT_READER_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load saat mount / user berubah
  useEffect(() => {
    const loadSettings = async () => {
      let saved = null;
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('quran_settings')
          .eq('personal_code', user.personal_code)
          .single();
        saved = data?.quran_settings;
      }
      if (!saved) {
        saved = JSON.parse(localStorage.getItem('myRamadhan_quran_settings'));
      }
      if (saved) setSettings(saved);
      setLoaded(true);
    };
    loadSettings();
  }, [user]);

  // Auto-sync setiap kali settings berubah (setelah load awal)
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('myRamadhan_quran_settings', JSON.stringify(settings));
    if (user) {
      supabase
        .from('users')
        .update({ quran_settings: settings })
        .eq('personal_code', user.personal_code);
    }
  }, [settings, loaded, user]);

  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const setArabSize = (sizeKey) =>
    setSettings((prev) => ({ ...prev, arabSize: sizeKey }));

  return { settings, toggleSetting, setArabSize };
};

export default useReaderSettings;
