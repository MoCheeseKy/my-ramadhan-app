import { useState } from 'react';
import dayjs from 'dayjs';
import { StorageService } from '@/lib/storageService';

/**
 * useTrackerSummary — mengambil ringkasan progres ibadah harian dari storage.
 * Menghitung jumlah task default + custom habit yang sudah dicentang.
 *
 * @param {object|null} user
 * @param {boolean}     isPWA
 *
 * @returns {{ taskProgress: { completed: number, total: number }, fetchTrackerSummary: Function }}
 */
const useTrackerSummary = (user, isPWA) => {
  const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 9 });

  const DEFAULT_TRACKER_KEYS = [
    'is_puasa',
    'subuh',
    'dzuhur',
    'ashar',
    'maghrib',
    'isya',
    'tarawih',
    'quran',
    'sedekah',
  ];

  const fetchTrackerSummary = async () => {
    if (!user) return;

    try {
      const today = dayjs().format('YYYY-MM-DD');
      const userData = await StorageService.getProfile(
        user.personal_code,
        isPWA,
      );
      const customHabits = userData?.custom_habits || [];
      const data = await StorageService.getDailyTracker(
        user.personal_code,
        today,
        isPWA,
      );

      let defaultCompleted = 0;
      let customCompleted = 0;

      if (data) {
        defaultCompleted = DEFAULT_TRACKER_KEYS.reduce(
          (acc, key) => acc + (data[key] ? 1 : 0),
          0,
        );

        const customProgress = data.custom_progress || {};
        customCompleted = customHabits.reduce(
          (acc, habit) => acc + (customProgress[habit.id] ? 1 : 0),
          0,
        );
      }

      setTaskProgress({
        completed: defaultCompleted + customCompleted,
        total: DEFAULT_TRACKER_KEYS.length + customHabits.length,
      });
    } catch (err) {
      console.error('Gagal memuat ringkasan tracker:', err);
    }
  };

  return { taskProgress, fetchTrackerSummary };
};

export default useTrackerSummary;
