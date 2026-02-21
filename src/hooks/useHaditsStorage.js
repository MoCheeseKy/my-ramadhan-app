import { supabase } from '@/lib/supabase';

/**
 * useHaditsStorage — read/write data Hadits secara transparan:
 * Supabase jika user login, localStorage jika tidak.
 *
 * Catatan: settings berbagi kolom `doa_settings` di Supabase
 * karena strukturnya kompatibel dengan settings Doa.
 *
 * @param {object|null} user
 * @returns {{ loadHaditsData, saveBookmarks, saveLastRead, saveSettings }}
 */
const useHaditsStorage = (user) => {
  // ─── Read ─────────────────────────────────────────────────────────────────

  const loadHaditsData = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('hadits_bookmarks, hadits_last_read, doa_settings')
        .eq('personal_code', user.personal_code)
        .single();
      if (error) return {};
      return {
        bookmarks: data?.hadits_bookmarks || [],
        lastRead: data?.hadits_last_read || null,
        settings: data?.doa_settings || null,
      };
    }

    return {
      bookmarks:
        JSON.parse(localStorage.getItem('myRamadhan_hadits_bookmarks')) || [],
      lastRead:
        JSON.parse(localStorage.getItem('myRamadhan_hadits_lastread')) || null,
      settings:
        JSON.parse(localStorage.getItem('myRamadhan_doa_settings')) || null,
    };
  };

  // ─── Write bookmarks ──────────────────────────────────────────────────────

  const saveBookmarks = async (newBookmarks) => {
    localStorage.setItem(
      'myRamadhan_hadits_bookmarks',
      JSON.stringify(newBookmarks),
    );
    if (user) {
      await supabase
        .from('users')
        .update({ hadits_bookmarks: newBookmarks })
        .eq('personal_code', user.personal_code);
    }
  };

  // ─── Write lastRead ───────────────────────────────────────────────────────

  const saveLastRead = async (data) => {
    localStorage.setItem('myRamadhan_hadits_lastread', JSON.stringify(data));
    if (user) {
      await supabase
        .from('users')
        .update({ hadits_last_read: data })
        .eq('personal_code', user.personal_code);
    }
  };

  // ─── Write settings ───────────────────────────────────────────────────────

  const saveSettings = async (newSettings) => {
    localStorage.setItem(
      'myRamadhan_doa_settings',
      JSON.stringify(newSettings),
    );
    if (user) {
      await supabase
        .from('users')
        .update({ doa_settings: newSettings })
        .eq('personal_code', user.personal_code);
    }
  };

  return { loadHaditsData, saveBookmarks, saveLastRead, saveSettings };
};

export default useHaditsStorage;
