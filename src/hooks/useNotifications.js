import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getNotificationForDay } from '@/data/notificationsData';

/**
 * useNotifications — menyusun daftar notifikasi gabungan:
 *   1. Notifikasi statis berdasarkan hari Hijriah (dari notificationsData)
 *   2. Notifikasi dinamis waktu sholat (jika waktu sudah lewat)
 *
 * @param {boolean} mounted
 * @param {number}  hijriDay
 * @param {object|null} prayerTimes
 * @param {dayjs.Dayjs} currentTime
 *
 * @returns {{ notifications: array, hasUnreadNotif: boolean, markAsRead: Function }}
 */
const useNotifications = (mounted, hijriDay, prayerTimes, currentTime) => {
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    const dayNum = isNaN(hijriDay) ? 0 : hijriDay;
    const baseNotifs = getNotificationForDay(dayNum);
    let dynamicNotifs = [];

    if (prayerTimes) {
      const prayers = [
        { key: 'Subuh', label: 'Subuh' },
        { key: 'Dzuhur', label: 'Dzuhur' },
        { key: 'Ashar', label: 'Ashar' },
        { key: 'Maghrib', label: 'Maghrib' },
        { key: 'Isya', label: 'Isya' },
      ];

      prayers.forEach((p) => {
        const timeStr = prayerTimes[p.key];
        if (!timeStr) return;

        const [h, m] = timeStr.split(':').map(Number);
        const prayerMoment = dayjs().hour(h).minute(m).second(0);

        if (currentTime.isAfter(prayerMoment)) {
          dynamicNotifs.push({
            id: `prayer_${p.key}_${dayjs().format('YYYYMMDD')}`,
            day: dayNum,
            title: `Waktu ${p.label} Telah Tiba! 🕌`,
            message: `Udah masuk waktu ${p.label} nih! Jangan lupa sholat ya, dan catat di Tracker.`,
            type: 'prayer',
          });
        }
      });
    }

    setNotifications([...dynamicNotifs.reverse(), ...baseNotifs]);
  }, [mounted, prayerTimes, currentTime.hour(), hijriDay]);

  // Cek apakah ada notif baru yang belum dibaca
  useEffect(() => {
    const lastReadCount = parseInt(
      localStorage.getItem('myRamadhan_notifCount') || '0',
      10,
    );
    if (notifications.length > lastReadCount) {
      setHasUnreadNotif(true);
    }
  }, [notifications]);

  const markAsRead = () => {
    setHasUnreadNotif(false);
    localStorage.setItem(
      'myRamadhan_notifCount',
      notifications.length.toString(),
    );
  };

  return { notifications, hasUnreadNotif, markAsRead };
};

export default useNotifications;
