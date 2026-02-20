import localforage from 'localforage';
import { supabase } from '@/lib/supabase';

// ─── KONFIGURASI DATABASE LOKAL (PWA) ───
// IndexedDB jauh lebih aman dan kapasitasnya bergiga-giga dibandingkan localStorage
localforage.config({
  name: 'MyRamadhanApp',
  storeName: 'ramadhan_data',
});

// Helper: Ambil user_id (UUID) dari Supabase berdasarkan personal_code
const getSupabaseUserId = async (personalCode) => {
  if (!personalCode) return null;
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('personal_code', personalCode)
    .single();
  return data?.id || null;
};

export const StorageService = {
  // =====================================================================
  // 1. PROFIL & PREFERENSI (Tema, Lokasi, Nama, Avatar, Custom Habits)
  // =====================================================================
  async getProfile(personalCode, isPWA) {
    if (isPWA) {
      return (await localforage.getItem('pwa_profile')) || {};
    } else {
      if (!personalCode) return null;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('personal_code', personalCode)
        .single();
      if (error && error.code !== 'PGRST116')
        console.error('DB Error (Profile):', error);
      return data || {};
    }
  },

  async saveProfile(personalCode, updateData, isPWA) {
    if (isPWA) {
      const currentProfile = (await localforage.getItem('pwa_profile')) || {};
      const newProfile = { ...currentProfile, ...updateData };
      await localforage.setItem('pwa_profile', newProfile);
      return newProfile;
    } else {
      if (!personalCode) throw new Error('Akses Web membutuhkan Personal Code');
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('personal_code', personalCode)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  // =====================================================================
  // 2. DAILY TRACKER (Ibadah Harian)
  // =====================================================================
  async getDailyTracker(personalCode, date, isPWA) {
    if (isPWA) {
      const trackers = (await localforage.getItem('pwa_trackers')) || {};
      return trackers[date] || null;
    } else {
      const userId = await getSupabaseUserId(personalCode);
      if (!userId) return null;

      const { data, error } = await supabase
        .from('daily_trackers')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();
      if (error && error.code !== 'PGRST116')
        console.error('DB Error (Tracker):', error);
      return data || null;
    }
  },

  async saveDailyTracker(personalCode, date, trackerData, isPWA) {
    if (isPWA) {
      const trackers = (await localforage.getItem('pwa_trackers')) || {};
      trackers[date] = { ...trackers[date], ...trackerData, date };
      await localforage.setItem('pwa_trackers', trackers);
      return trackers[date];
    } else {
      const userId = await getSupabaseUserId(personalCode);
      if (!userId) return null;

      // Cek apakah data hari ini sudah ada
      const { data: existing } = await supabase
        .from('daily_trackers')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('daily_trackers')
          .update(trackerData)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('daily_trackers')
          .insert([{ user_id: userId, date, ...trackerData }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }
  },

  // =====================================================================
  // 3. JURNAL REFLEKSI
  // =====================================================================
  async getJournals(personalCode, isPWA) {
    if (isPWA) {
      return (await localforage.getItem('pwa_journals')) || [];
    } else {
      const userId = await getSupabaseUserId(personalCode);
      if (!userId) return [];

      // Asumsi: Kamu membuat tabel 'journals' di Supabase
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        console.warn(
          'Tabel journals mungkin belum ada di Supabase. Fallback ke kosong.',
        );
        return [];
      }
      return data || [];
    }
  },

  async saveJournal(personalCode, journalEntry, isPWA) {
    if (isPWA) {
      const journals = (await localforage.getItem('pwa_journals')) || [];
      // Jika entry baru
      if (!journalEntry.id) {
        journalEntry.id = Date.now().toString();
        journalEntry.created_at = new Date().toISOString();
        journals.unshift(journalEntry);
      } else {
        // Update entry lama
        const index = journals.findIndex((j) => j.id === journalEntry.id);
        if (index > -1)
          journals[index] = { ...journals[index], ...journalEntry };
      }
      await localforage.setItem('pwa_journals', journals);
      return journalEntry;
    } else {
      const userId = await getSupabaseUserId(personalCode);
      if (!userId) return null;

      if (journalEntry.id) {
        const { data, error } = await supabase
          .from('journals')
          .update(journalEntry)
          .eq('id', journalEntry.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('journals')
          .insert([{ user_id: userId, ...journalEntry }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }
  },

  // =====================================================================
  // 4. HAID TRACKER
  // =====================================================================
  async getHaidData(personalCode, isPWA) {
    if (isPWA) {
      return (
        (await localforage.getItem('pwa_haid')) || { logs: [], settings: {} }
      );
    } else {
      const userId = await getSupabaseUserId(personalCode);
      if (!userId) return { logs: [], settings: {} };

      const { data, error } = await supabase
        .from('haid_logs')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) return { logs: [], settings: {} };
      return data || { logs: [], settings: {} };
    }
  },

  async saveHaidData(personalCode, haidData, isPWA) {
    if (isPWA) {
      await localforage.setItem('pwa_haid', haidData);
      return haidData;
    } else {
      const userId = await getSupabaseUserId(personalCode);
      if (!userId) return null;

      const { data: existing } = await supabase
        .from('haid_logs')
        .select('id')
        .eq('user_id', userId)
        .single();
      if (existing) {
        await supabase.from('haid_logs').update(haidData).eq('id', existing.id);
      } else {
        await supabase
          .from('haid_logs')
          .insert([{ user_id: userId, ...haidData }]);
      }
      return haidData;
    }
  },

  // =====================================================================
  // 5. BOOKMARK & PROGRESS BACAAN (Qur'an, Doa, dll)
  // Kolom key: 'quran_bookmarks', 'quran_last_read', 'doa_bookmarks', dll
  // =====================================================================
  async getUserMeta(personalCode, columnKey, isPWA) {
    if (isPWA) {
      const meta = (await localforage.getItem('pwa_user_meta')) || {};
      return meta[columnKey] || null;
    } else {
      if (!personalCode) return null;
      // Di Supabase, data ini biasanya jadi kolom di tabel 'users'
      const { data, error } = await supabase
        .from('users')
        .select(columnKey)
        .eq('personal_code', personalCode)
        .single();
      if (error) return null;
      return data ? data[columnKey] : null;
    }
  },

  async saveUserMeta(personalCode, columnKey, value, isPWA) {
    if (isPWA) {
      const meta = (await localforage.getItem('pwa_user_meta')) || {};
      meta[columnKey] = value;
      await localforage.setItem('pwa_user_meta', meta);
      return value;
    } else {
      if (!personalCode) return null;
      const { error } = await supabase
        .from('users')
        .update({ [columnKey]: value })
        .eq('personal_code', personalCode);
      if (error) throw error;
      return value;
    }
  },

  // =====================================================================
  // 6. FUNGSI RESET DATA
  // =====================================================================
  async clearAllData(personalCode, isPWA) {
    if (isPWA) {
      // Hapus hanya data PWA, biarkan preferensi default lokal
      await localforage.removeItem('pwa_trackers');
      await localforage.removeItem('pwa_journals');
      await localforage.removeItem('pwa_haid');
      await localforage.removeItem('pwa_user_meta');
      return true;
    } else {
      const userId = await getSupabaseUserId(personalCode);
      if (!userId) return false;

      // Reset data di Cloud
      await supabase.from('daily_trackers').delete().eq('user_id', userId);
      // Hapus jurnal & haid jika tabelnya ada
      try {
        await supabase.from('journals').delete().eq('user_id', userId);
      } catch (e) {}
      try {
        await supabase.from('haid_logs').delete().eq('user_id', userId);
      } catch (e) {}

      // Reset meta di tabel users
      await supabase
        .from('users')
        .update({
          quran_bookmarks: [],
          quran_last_read: null,
          doa_bookmarks: [],
          doa_last_read: null,
          doa_custom: [],
          hadits_bookmarks: [],
          hadits_last_read: null,
          fiqih_bookmarks: [],
          fiqih_last_read: null,
        })
        .eq('personal_code', personalCode);

      return true;
    }
  },
};
