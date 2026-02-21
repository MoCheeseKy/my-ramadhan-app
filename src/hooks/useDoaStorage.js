import { supabase } from '@/lib/supabase';

/**
 * useDoaStorage — menyediakan fungsi baca/tulis data Doa secara transparan:
 * gunakan Supabase jika user login, localStorage jika tidak.
 *
 * @param {object|null} user - User dari useUser()
 * @returns {object}         - { loadDoaData, saveBookmarks, saveCustomDoas, saveSettings }
 */
const useDoaStorage = (user) => {
  // ─── Read ────────────────────────────────────────────────────────────────────

  const loadDoaData = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('doa_bookmarks, doa_custom, doa_settings')
        .eq('personal_code', user.personal_code)
        .single();
      if (error) return {};
      return {
        bookmarks: data?.doa_bookmarks || [],
        customDoas: data?.doa_custom || [],
        settings: data?.doa_settings || null,
      };
    }

    return {
      bookmarks:
        JSON.parse(localStorage.getItem('myRamadhan_doa_bookmarks')) || [],
      customDoas:
        JSON.parse(localStorage.getItem('myRamadhan_doa_custom')) || [],
      settings:
        JSON.parse(localStorage.getItem('myRamadhan_doa_settings')) || null,
    };
  };

  // ─── Write bookmarks ─────────────────────────────────────────────────────────

  const saveBookmarks = async (newBookmarks) => {
    localStorage.setItem(
      'myRamadhan_doa_bookmarks',
      JSON.stringify(newBookmarks),
    );
    if (user) {
      await supabase
        .from('users')
        .update({ doa_bookmarks: newBookmarks })
        .eq('personal_code', user.personal_code);
    }
  };

  // ─── Write custom doas ───────────────────────────────────────────────────────

  const saveCustomDoas = async (newCustomDoas) => {
    localStorage.setItem(
      'myRamadhan_doa_custom',
      JSON.stringify(newCustomDoas),
    );
    if (user) {
      await supabase
        .from('users')
        .update({ doa_custom: newCustomDoas })
        .eq('personal_code', user.personal_code);
    }
  };

  // ─── Write settings ──────────────────────────────────────────────────────────

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

  return { loadDoaData, saveBookmarks, saveCustomDoas, saveSettings };
};

export default useDoaStorage;
