import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import localforage from 'localforage';
import dayjs from 'dayjs';
import {
  RAMADHAN_START,
  RAMADHAN_END,
} from '@/components/HaidTracker/Constants';

/**
 * Mengelola semua operasi data haid: fetch, tambah, update, dan delete.
 * Mendukung dua mode penyimpanan:
 * - PWA  → localforage (offline-first)
 * - Web  → Supabase
 */
export function useHaidData(user, isPWA) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user, isPWA]);

  const fetchData = async () => {
    setLoading(true);
    if (isPWA) {
      const localHaid = (await localforage.getItem('pwa_haid_logs')) || [];
      setLogs(localHaid);
      setActivePeriod(localHaid.find((item) => item.end_date === null) || null);
    } else {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('personal_code', user.personal_code)
        .single();

      if (!userData) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('haid_logs')
        .select('*')
        .eq('user_id', userData.id)
        .order('start_date', { ascending: false });

      if (!error && data) {
        setLogs(data);
        setActivePeriod(data.find((item) => item.end_date === null) || null);
      }
    }
    setLoading(false);
  };

  /** Menyimpan tanggal mulai atau selesai siklus */
  const saveDate = async (actionType, inputDate) => {
    if (!user) return { success: false };

    if (isPWA) {
      const localHaid = (await localforage.getItem('pwa_haid_logs')) || [];

      if (actionType === 'start') {
        const newLog = {
          id: Date.now().toString(),
          start_date: inputDate,
          end_date: null,
        };
        const updated = [newLog, ...localHaid];
        await localforage.setItem('pwa_haid_logs', updated);
        setActivePeriod(newLog);
        setLogs(updated);
        return { success: true, type: 'start' };
      }

      if (actionType === 'end' && activePeriod) {
        const updated = localHaid.map((l) =>
          l.id === activePeriod.id ? { ...l, end_date: inputDate } : l,
        );
        await localforage.setItem('pwa_haid_logs', updated);
        setLogs(updated);
        setActivePeriod(null);
        return { success: true, type: 'end' };
      }
    } else {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('personal_code', user.personal_code)
        .single();

      if (actionType === 'start') {
        const { data, error } = await supabase
          .from('haid_logs')
          .insert({
            user_id: userData.id,
            start_date: inputDate,
            end_date: null,
          })
          .select()
          .single();
        if (!error) {
          setActivePeriod(data);
          setLogs((prev) => [data, ...prev]);
          return { success: true, type: 'start' };
        }
      }

      if (actionType === 'end' && activePeriod) {
        const { error } = await supabase
          .from('haid_logs')
          .update({ end_date: inputDate })
          .eq('id', activePeriod.id);
        if (!error) {
          setLogs((prev) =>
            prev.map((l) =>
              l.id === activePeriod.id ? { ...l, end_date: inputDate } : l,
            ),
          );
          setActivePeriod(null);
          return { success: true, type: 'end' };
        }
      }
    }

    return { success: false };
  };

  /** Menghapus satu log berdasarkan ID */
  const deleteLog = async (targetId) => {
    if (isPWA) {
      const localHaid = (await localforage.getItem('pwa_haid_logs')) || [];
      const updated = localHaid.filter((l) => l.id !== targetId);
      await localforage.setItem('pwa_haid_logs', updated);
      setLogs(updated);
      if (activePeriod?.id === targetId) setActivePeriod(null);
    } else {
      const { error } = await supabase
        .from('haid_logs')
        .delete()
        .eq('id', targetId);
      if (error) {
        alert(`Gagal menghapus: ${error.message}`);
        return;
      }
      setLogs((prev) => prev.filter((l) => l.id !== targetId));
      if (activePeriod?.id === targetId) setActivePeriod(null);
    }
  };

  // ── Kalkulasi utilitas ──

  const getDuration = (start, end) => {
    const endDate = end ? dayjs(end) : dayjs();
    return dayjs(endDate).diff(dayjs(start), 'day') + 1;
  };

  const getQadhaDays = (start, end) => {
    const s = dayjs(start);
    const e = end ? dayjs(end) : dayjs();
    if (e.isBefore(RAMADHAN_START, 'day') || s.isAfter(RAMADHAN_END, 'day'))
      return 0;
    const overlapStart = s.isAfter(RAMADHAN_START) ? s : RAMADHAN_START;
    const overlapEnd = e.isBefore(RAMADHAN_END) ? e : RAMADHAN_END;
    return overlapEnd.diff(overlapStart, 'day') + 1;
  };

  const totalMissedFasting = logs.reduce(
    (acc, curr) => acc + getQadhaDays(curr.start_date, curr.end_date),
    0,
  );

  return {
    loading,
    logs,
    activePeriod,
    saveDate,
    deleteLog,
    getDuration,
    getQadhaDays,
    totalMissedFasting,
  };
}
