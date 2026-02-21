import { supabase } from '@/lib/supabase';

/**
 * useQuranStorage — menyediakan fungsi baca/tulis data Quran (bookmarks, lastRead, settings)
 * secara transparan: gunakan Supabase jika user login, localStorage jika tidak.
 *
 * Hook ini TIDAK menyimpan state — semua setter state dikelola oleh halaman pemanggil.
 * Tujuannya adalah memisahkan logika persistence dari logika UI.
 *
 * @param {object|null} user    - User dari useUser()
 * @returns {object}            - { loadQuranData, saveBookmarks, saveLastRead, saveSettings }
 */
const useQuranStorage = (user) => {
  // ─── Read ────────────────────────────────────────────────────────────────────

  const loadQuranData = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('quran_last_read, quran_bookmarks, quran_settings')
        .eq('personal_code', user.personal_code)
        .single();
      if (error) return {};
      return {
        lastRead: data?.quran_last_read || null,
        bookmarks: data?.quran_bookmarks || [],
        settings: data?.quran_settings || null,
      };
    }

    return {
      lastRead:
        JSON.parse(localStorage.getItem('myRamadhan_quran_lastread')) || null,
      bookmarks:
        JSON.parse(localStorage.getItem('myRamadhan_quran_bookmarks')) || [],
      settings:
        JSON.parse(localStorage.getItem('myRamadhan_quran_settings')) || null,
    };
  };

  // ─── Write bookmarks ─────────────────────────────────────────────────────────

  const saveBookmarks = async (newBookmarks) => {
    localStorage.setItem(
      'myRamadhan_quran_bookmarks',
      JSON.stringify(newBookmarks),
    );
    if (user) {
      await supabase
        .from('users')
        .update({ quran_bookmarks: newBookmarks })
        .eq('personal_code', user.personal_code);
    }
  };

  // ─── Write lastRead ──────────────────────────────────────────────────────────

  const saveLastRead = async (data) => {
    localStorage.setItem('myRamadhan_quran_lastread', JSON.stringify(data));
    if (user) {
      await supabase
        .from('users')
        .update({ quran_last_read: data })
        .eq('personal_code', user.personal_code);
    }
  };

  // ─── Write settings ──────────────────────────────────────────────────────────

  const saveSettings = async (newSettings) => {
    localStorage.setItem(
      'myRamadhan_quran_settings',
      JSON.stringify(newSettings),
    );
    if (user) {
      await supabase
        .from('users')
        .update({ quran_settings: newSettings })
        .eq('personal_code', user.personal_code);
    }
  };

  return { loadQuranData, saveBookmarks, saveLastRead, saveSettings };
};

export default useQuranStorage;
