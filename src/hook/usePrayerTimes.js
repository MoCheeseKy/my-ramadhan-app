import { useState, useCallback } from 'react';

/**
 * usePrayerTimes — fetch jadwal sholat dari API berdasarkan kota user.
 * Kota diambil dari localStorage (myRamadhan_user), default Jakarta.
 *
 * @returns {{ prayerTimes: object|null, userCity: string, fetchPrayerTimes: Function }}
 */
const usePrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [userCity, setUserCity] = useState('Jakarta');

  const fetchPrayerTimes = useCallback(async () => {
    try {
      const localUserStr = localStorage.getItem('myRamadhan_user');
      const localUser = localUserStr ? JSON.parse(localUserStr) : null;
      const city = localUser?.location_city || 'Jakarta';

      setUserCity(city);

      const res = await fetch(`/api/schedule?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      const dayjs = (await import('dayjs')).default;
      const todayData = data.schedule.find((item) =>
        dayjs(item.isoDate).isSame(dayjs(), 'day'),
      );

      if (todayData) setPrayerTimes(todayData.timings);
    } catch (e) {
      console.error('Gagal fetch jadwal:', e);
    }
  }, []);

  return { prayerTimes, userCity, fetchPrayerTimes };
};

export default usePrayerTimes;
