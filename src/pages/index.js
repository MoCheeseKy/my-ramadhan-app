'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import useUser from '@/hook/useUser';
import { motion } from 'framer-motion';
import { studyMaterials } from '@/data/studyMaterials';

import useAppMode from '@/hook/useAppMode';
import { StorageService } from '@/lib/storageService';

import {
  BookOpen,
  ChevronRight,
  Sparkles,
  CalendarDays,
  PenLine,
  Lightbulb,
  Moon,
  Quote,
  CheckSquare,
  RefreshCw,
  HeartHandshake,
  ScrollText,
  Scale,
  Compass,
  Fingerprint,
  Droplets,
  HandCoins,
  Bell,
  User,
} from 'lucide-react';

import TrackerDrawer from '@/components/TrackerDrawer';
import ScheduleDrawer from '@/components/ScheduleDrawer';
import NotificationDrawer from '@/components/NotificationDrawer';
import { getNotificationForDay } from '@/data/notificationsData';
import { quotesData } from '@/data/quotes';

dayjs.locale('id');
dayjs.extend(relativeTime);
dayjs.extend(duration);

export default function MyRamadhanHome() {
  const { user } = useUser();
  const router = useRouter();
  const { isPWA } = useAppMode();

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());

  // --- STATE LACI (DRAWERS) ---
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // --- STATE DATA ---
  const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 9 });
  const [quoteOfTheDay, setQuoteOfTheDay] = useState(quotesData[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [userCity, setUserCity] = useState('Jakarta');

  // --- STATE NOTIFIKASI PINTAR ---
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    randomizeQuote();
    fetchPrayerTimes();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) fetchTrackerSummary();
  }, [user, isPWA]);

  const getHijriDate = () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      });
      const parts = formatter.formatToParts(yesterday);
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const month = parts.find((p) => p.type === 'month')?.value || '';
      const year = parts.find((p) => p.type === 'year')?.value || '';
      const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
      return `${day} ${monthCapitalized} ${year} H`;
    } catch {
      return 'Ramadhan 1447 H';
    }
  };

  const hijriDate = getHijriDate();
  const hijriDay = parseInt(hijriDate.split(' ')[0], 10);

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
        if (timeStr) {
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
        }
      });
    }

    const combined = [...dynamicNotifs.reverse(), ...baseNotifs];
    setNotifications(combined);
  }, [mounted, prayerTimes, currentTime.hour(), hijriDay]);

  useEffect(() => {
    const lastReadCount = parseInt(
      localStorage.getItem('myRamadhan_notifCount') || '0',
      10,
    );
    if (notifications.length > lastReadCount) {
      setHasUnreadNotif(true);
    }
  }, [notifications]);

  const handleOpenNotification = () => {
    setIsNotificationOpen(true);
    setHasUnreadNotif(false);
    localStorage.setItem(
      'myRamadhan_notifCount',
      notifications.length.toString(),
    );
  };

  const fetchPrayerTimes = useCallback(async () => {
    try {
      const localUserStr = localStorage.getItem('myRamadhan_user');
      const localUser = localUserStr ? JSON.parse(localUserStr) : null;
      const city = localUser?.location_city || 'Jakarta';
      setUserCity(city);
      const res = await fetch(`/api/schedule?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      const todayData = data.schedule.find((item) =>
        dayjs(item.isoDate).isSame(dayjs(), 'day'),
      );
      if (todayData) setPrayerTimes(todayData.timings);
    } catch (e) {
      console.error('Gagal fetch jadwal:', e);
    }
  }, []);

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

      const keysToCheck = [
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
      let defaultCompleted = 0;
      let customCompleted = 0;

      if (data) {
        defaultCompleted = keysToCheck.reduce(
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
        total: keysToCheck.length + customHabits.length,
      });
    } catch (err) {
      console.error('Gagal memuat ringkasan tracker:', err);
    }
  };

  const randomizeQuote = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setQuoteOfTheDay(
        quotesData[Math.floor(Math.random() * quotesData.length)],
      );
      setIsSpinning(false);
    }, 500);
  };

  if (!mounted) return null;

  const progressPercent =
    taskProgress.total === 0
      ? 0
      : (taskProgress.completed / taskProgress.total) * 100;
  const dailyTopic =
    studyMaterials.find((m) => m.day === hijriDay) || studyMaterials[0];

  const getHeroMode = () => {
    if (!prayerTimes) return null;

    const parseTime = (str) => {
      const [h, m] = str.split(':').map(Number);
      return dayjs().hour(h).minute(m).second(0).millisecond(0);
    };

    const subuh = parseTime(prayerTimes.Subuh);
    const maghrib = parseTime(prayerTimes.Maghrib);
    const isya = parseTime(prayerTimes.Isya);
    const isyaEnd = isya.add(10, 'minute');
    const subuhPlus5 = subuh.add(5, 'minute');
    const now = currentTime;
    const nowH = now.hour();

    const formatDur = (diff) => {
      const d = dayjs.duration(diff > 0 ? diff : 0);
      return `${String(d.hours()).padStart(2, '0')}:${String(d.minutes()).padStart(2, '0')}:${String(d.seconds()).padStart(2, '0')}`;
    };

    if (now.isAfter(maghrib) && now.isBefore(isyaEnd)) {
      return {
        mode: 'berbuka',
        label: 'Waktunya Berbuka! 🎉',
        sublabel: 'Alhamdulillah, puasamu hari ini selesai',
        gradient: 'from-orange-500 via-rose-500 to-pink-600',
        shadow: '0 25px 60px -15px rgba(244,63,94,0.5)',
        accent: 'text-rose-200',
        countdownLabel: null,
        timeLeft: null,
        progress: null,
      };
    }

    const isLateEvening = nowH >= 19 && now.isAfter(isyaEnd);
    const isMidnight = nowH === 0;
    if (isLateEvening || isMidnight) {
      return {
        mode: 'tarawih',
        label: 'Waktu Tarawih 🕌',
        sublabel: 'Semangat sholat tarawih malam ini 🤍',
        gradient: 'from-violet-600 via-purple-600 to-fuchsia-700',
        shadow: '0 25px 60px -15px rgba(147,51,234,0.5)',
        accent: 'text-purple-200',
        countdownLabel: 'Waktu Tarawih',
        timeLeft: null,
        progress: null,
      };
    }

    if (nowH >= 1 && nowH < 4) {
      return {
        mode: 'tahajud',
        label: 'Waktu Tahajud 🌙',
        sublabel: 'Sepertiga malam, waktu terbaik bermunajat',
        gradient: 'from-slate-700 via-slate-800 to-slate-900',
        shadow: '0 25px 60px -15px rgba(15,23,42,0.6)',
        accent: 'text-slate-300',
        countdownLabel: 'Waktu Tahajud',
        timeLeft: null,
        progress: null,
      };
    }

    if (nowH >= 4 && now.isBefore(subuhPlus5)) {
      return {
        mode: 'puasa-dimulai',
        label: 'Puasa Segera Dimulai 🌅',
        sublabel: `Subuh pukul ${subuh.format('HH:mm')} — niat puasa dulu!`,
        gradient: 'from-amber-500 via-orange-500 to-red-500',
        shadow: '0 25px 60px -15px rgba(249,115,22,0.5)',
        accent: 'text-amber-100',
        countdownLabel: 'Puasa dimulai dalam',
        timeLeft: now.isBefore(subuh) ? formatDur(subuh.diff(now)) : null,
        progress: null,
      };
    }

    const diff = maghrib.diff(now);
    const totalDur = maghrib.diff(subuh);
    const passed = now.diff(subuh);
    return {
      mode: 'buka',
      label: 'Menuju Berbuka',
      sublabel: `Maghrib pukul ${maghrib.format('HH:mm')}`,
      gradient: 'from-[#1e3a8a] via-[#312e81] to-[#4c1d95]',
      shadow: '0 25px 60px -15px rgba(79,70,229,0.5)',
      accent: 'text-indigo-200',
      countdownLabel: 'Menuju Berbuka',
      timeLeft: formatDur(diff),
      progress: {
        value: passed > 0 ? Math.min((passed / totalDur) * 100, 100) : 0,
        startLabel: `Subuh ${prayerTimes.Subuh}`,
        endLabel: `Maghrib ${prayerTimes.Maghrib}`,
      },
    };
  };

  const hero = getHeroMode();

  return (
    <main className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 selection:bg-blue-200 dark:selection:bg-blue-800 transition-colors duration-300'>
      <div className='fixed inset-0 -z-10 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60' />
      </div>

      {/* ADAPTIVE CONTAINER: Mobile -> Tablet -> Desktop */}
      <div className='w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8 lg:py-10 lg:px-8'>
        {/* HEADER */}
        <header className='flex justify-between items-center mb-8 mt-2 md:mb-10 lg:mb-10'>
          <div>
            <span className='px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md'>
              {hijriDate}
            </span>
            <h1 className='text-2xl md:text-3xl lg:text-3xl font-extrabold tracking-tight mt-2 leading-tight'>
              {"Assalamu'alaikum"} <br />
              <span className='text-[#1e3a8a] dark:text-blue-400'>
                {user?.username || 'Sahabat!'}
              </span>{' '}
              👋
            </h1>
          </div>

          <div className='flex gap-4 md:gap-5 items-center'>
            {/* IKON LONCENG NOTIFIKASI */}
            <div
              className='relative cursor-pointer hover:scale-110 transition-transform flex items-center justify-center'
              onClick={handleOpenNotification}
            >
              <Bell
                size={24}
                className='text-slate-500 dark:text-slate-400 md:w-7 md:h-7'
              />
              {hasUnreadNotif && (
                <span className='absolute top-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-rose-500 rounded-full border-2 border-[#F6F9FC] dark:border-slate-950 animate-pulse' />
              )}
            </div>
            <div className='w-11 h-11 md:w-14 md:h-14 lg:w-14 lg:h-14 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl hover:scale-105 transition-transform'>
              {user ? (
                <User
                  size={20}
                  className='text-[#1e3a8a] dark:text-blue-400 cursor-pointer md:w-6 md:h-6 lg:w-6 lg:h-6'
                  onClick={() => router.push('/user')}
                />
              ) : (
                <User
                  size={20}
                  className='text-emerald-500 cursor-pointer md:w-6 md:h-6 lg:w-6 lg:h-6'
                  onClick={() => router.push('/auth/login')}
                />
              )}
            </div>
          </div>
        </header>

        {/* GRID LAYOUT UTAMA */}
        <div className='flex flex-col lg:flex-row gap-5 md:gap-6 lg:gap-8 animate-fadeUp'>
          {/* ========================================= */}
          {/* KOLOM KIRI (MAIN CONTENT)                   */}
          {/* ========================================= */}
          <div className='flex-1 flex flex-col gap-5 md:gap-6 lg:gap-6'>
            {/* HERO CARD */}
            {hero ? (
              <div
                className={`relative min-h-[300px] md:min-h-[320px] lg:min-h-[340px] rounded-[2.5rem] p-7 md:p-9 lg:p-10 text-white overflow-hidden group bg-gradient-to-br ${hero.gradient} transition-all duration-500 hover:-translate-y-1`}
                style={{ boxShadow: hero.shadow }}
              >
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_60%)]' />
                <div className='absolute -top-20 -right-20 w-72 h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl animate-pulse' />
                <div className='absolute -bottom-24 -left-24 w-72 h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl' />

                <div className='relative z-10 flex justify-between items-center'>
                  <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10'>
                    <span
                      className={`text-[10px] md:text-xs lg:text-xs uppercase tracking-widest font-bold ${hero.accent}`}
                    >
                      {userCity}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsScheduleOpen(true)}
                    className='p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm'
                  >
                    <CalendarDays
                      size={18}
                      className='text-white/90 cursor-pointer md:w-5 md:h-5'
                    />
                  </button>
                </div>

                <div className='relative z-10 text-center mt-8 md:mt-10 lg:mt-12'>
                  <p
                    className={`text-[10px] md:text-xs lg:text-xs uppercase tracking-[0.3em] ${hero.accent} mb-2`}
                  >
                    {hero.countdownLabel || hero.label}
                  </p>
                  {hero.timeLeft ? (
                    <h2 className='text-[4rem] md:text-[4.5rem] lg:text-[5.5rem] font-black tracking-[-0.05em] tabular-nums bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-xl leading-none'>
                      {hero.timeLeft}
                    </h2>
                  ) : (
                    <h2 className='text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-black bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent drop-shadow-xl leading-tight mt-4'>
                      {hero.label}
                    </h2>
                  )}
                  <p
                    className={`mt-3 md:mt-4 lg:mt-4 text-sm md:text-base lg:text-base ${hero.accent} opacity-80`}
                  >
                    {hero.sublabel}
                  </p>
                </div>

                {hero.progress && (
                  <div className='relative z-10 mt-10 md:mt-12 lg:mt-14 max-w-2xl mx-auto'>
                    <div
                      className={`flex justify-between text-[9px] md:text-[10px] lg:text-[10px] uppercase tracking-widest ${hero.accent} opacity-70 mb-2`}
                    >
                      <span>{hero.progress.startLabel}</span>
                      <span>{hero.progress.endLabel}</span>
                    </div>
                    <div className='relative h-3 lg:h-4 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm'>
                      <div
                        className='h-full bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.8)] transition-all duration-1000 ease-out'
                        style={{ width: `${hero.progress.value}%` }}
                      />
                    </div>
                  </div>
                )}
                <Moon
                  size={214}
                  className='absolute -bottom-14 -right-14 text-white/10 rotate-12 pointer-events-none'
                />
              </div>
            ) : (
              <div className='min-h-[300px] rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse' />
            )}

            {/* DAILY GOAL TRACKER */}
            <div
              onClick={() =>
                !user ? router.push('/auth/login') : setIsTrackerOpen(true)
              }
              className='bg-white dark:bg-slate-900 rounded-[2rem] p-5 md:p-6 lg:p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer'
            >
              <div className='flex justify-between items-center mb-3'>
                <div className='bg-emerald-100 dark:bg-emerald-900/40 p-2 lg:p-2.5 rounded-xl w-fit text-emerald-600 dark:text-emerald-400'>
                  <CheckSquare size={20} />
                </div>
                <span className='text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg'>
                  Daily Goal
                </span>
              </div>
              <div className='flex justify-between items-end'>
                <div>
                  <h3 className='font-bold text-lg md:text-xl lg:text-xl leading-tight text-slate-800 dark:text-slate-100'>
                    Ibadah Harian
                  </h3>
                  <p className='text-xs md:text-sm lg:text-sm text-slate-500 dark:text-slate-400 mt-1'>
                    Sudah {taskProgress.completed} dari {taskProgress.total}{' '}
                    target!
                  </p>
                </div>
                <div className='w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 relative flex items-center justify-center'>
                  <svg className='w-full h-full -rotate-90' viewBox='0 0 36 36'>
                    <path
                      className='text-slate-100 dark:text-slate-700'
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='text-emerald-500 transition-all duration-1000 ease-out'
                      strokeDasharray={`${progressPercent}, 100`}
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                  </svg>
                  <span className='absolute text-[10px] lg:text-xs font-bold text-emerald-600 dark:text-emerald-400'>
                    {Math.round(progressPercent)}%
                  </span>
                </div>
              </div>
            </div>

            {/* MAIN TOOLS (4 Kolom Mobile, 8 Kolom Tablet & Desktop) */}
            <div className='grid grid-cols-4 md:grid-cols-8 lg:grid-cols-4 gap-3 mt-1'>
              <ToolCard
                icon={BookOpen}
                title="Al-Qur'an"
                colorClass='text-[#1e3a8a] dark:text-blue-400'
                bgClass='text-blue-100 dark:text-blue-900/60'
                onClick={() => router.push('/quran')}
              />
              <ToolCard
                icon={HeartHandshake}
                title='Doa'
                colorClass='text-rose-500 dark:text-rose-400'
                bgClass='text-rose-100 dark:text-rose-900/60'
                onClick={() => router.push('/doa')}
              />
              <ToolCard
                icon={ScrollText}
                title='Hadits'
                colorClass='text-emerald-600 dark:text-emerald-400'
                bgClass='text-emerald-100 dark:text-emerald-900/60'
                onClick={() => router.push('/hadits')}
              />
              <ToolCard
                icon={Scale}
                title='Fiqih'
                colorClass='text-amber-600 dark:text-amber-400'
                bgClass='text-amber-100 dark:text-amber-900/60'
                onClick={() => router.push('/fiqih')}
              />
              <ToolCard
                icon={Compass}
                title='Kiblat'
                colorClass='text-indigo-600 dark:text-indigo-400'
                bgClass='text-indigo-100 dark:text-indigo-900/60'
                onClick={() => router.push('/kompas')}
              />
              <ToolCard
                icon={Fingerprint}
                title='Tasbih'
                colorClass='text-teal-600 dark:text-teal-400'
                bgClass='text-teal-100 dark:text-teal-900/60'
                onClick={() => router.push('/tasbih')}
              />
              <ToolCard
                icon={HandCoins}
                title='Zakat'
                colorClass='text-yellow-500 dark:text-yellow-400'
                bgClass='text-yellow-100 dark:text-yellow-900/60'
                onClick={() => router.push('/zakat')}
              />
              <ToolCard
                icon={Droplets}
                title='Haid'
                colorClass='text-pink-500 dark:text-pink-400'
                bgClass='text-pink-100 dark:text-pink-900/60'
                onClick={() => router.push('/haid-tracker')}
              />
            </div>
          </div>

          {/* ========================================= */}
          {/* KOLOM KANAN / BAWAH (SIDEBAR DESKTOP & TABLET GRID) */}
          {/* ========================================= */}
          <div className='w-full lg:w-[350px] xl:w-[380px] flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-5 md:gap-6 lg:gap-6'>
            {/* DAILY KNOWLEDGE */}
            <div
              onClick={() => router.push(`/study/${hijriDay}`)}
              className='bg-white dark:bg-slate-900 rounded-[2rem] p-5 md:p-6 lg:p-6 group shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex items-center justify-between h-full'
            >
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 p-1.5 rounded-lg'>
                    <Lightbulb size={16} />
                  </span>
                  <span className='text-[10px] md:text-xs lg:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
                    Daily Knowledge
                  </span>
                </div>
                <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base lg:text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors'>
                  {dailyTopic.title}
                </h3>
              </div>
              <div className='bg-slate-50 dark:bg-slate-800 p-3 rounded-full group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30 transition-colors shrink-0'>
                <ChevronRight
                  size={20}
                  className='text-slate-400 dark:text-slate-500 group-hover:text-amber-500 dark:group-hover:text-amber-400'
                />
              </div>
            </div>

            {/* JURNAL */}
            <div
              onClick={() =>
                !user ? router.push('/auth/login') : router.push('/jurnal')
              }
              className='relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-7 lg:p-7 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden h-full flex flex-col justify-center'
            >
              <Moon
                size={120}
                className='absolute -bottom-8 -right-8 text-[#1e3a8a] dark:text-blue-700 opacity-10 pointer-events-none'
              />
              <div className='flex items-center gap-2 mb-3'>
                <PenLine
                  size={20}
                  className='text-[#1e3a8a] dark:text-blue-400'
                />
                <h3 className='font-bold text-lg text-slate-800 dark:text-slate-100'>
                  Jurnal Refleksi
                </h3>
              </div>
              <p className='text-sm text-slate-500 dark:text-slate-400 relative z-10'>
                Bagaimana perasaanmu hari ini?
              </p>
              <div className='mt-4 md:mt-5 lg:mt-5 text-xs font-semibold text-[#1e3a8a] dark:text-blue-400 flex items-center gap-1 relative z-10'>
                Mulai menulis <ChevronRight size={14} />
              </div>
            </div>

            {/* RAMATALK */}
            <div
              onClick={() => router.push('/ramatalk')}
              className='relative rounded-[2rem] p-6 md:p-7 lg:p-7 overflow-hidden text-white bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95] shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)] transition-all duration-500 hover:-translate-y-1 group cursor-pointer h-full flex flex-col justify-center'
            >
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(255,255,255,0.12),transparent_65%)]' />
              <div className='absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none' />
              <div className='relative z-10'>
                <div className='flex items-center gap-2 mb-4'>
                  <Sparkles size={16} className='text-indigo-200' />
                  <p className='text-[10px] md:text-xs lg:text-xs uppercase tracking-[0.3em] text-indigo-200 font-bold'>
                    Ramatalk AI
                  </p>
                </div>
                <h3 className='text-xl md:text-2xl lg:text-2xl font-bold bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-2'>
                  Tanya Seputar Ibadah
                </h3>
                <p className='text-sm text-indigo-100/80 leading-relaxed'>
                  Butuh penjelasan fiqih atau hukum puasa? Ramatalk siap
                  membantu 🤍
                </p>
              </div>
            </div>

            {/* QUOTE */}
            <div className='relative rounded-[2rem] p-6 md:p-7 lg:p-7 overflow-hidden text-white bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95] shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)] transition-all duration-500 hover:-translate-y-1 group h-full flex flex-col justify-center'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.15),transparent_65%)]' />
              <div className='absolute -top-16 -left-16 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl animate-pulse pointer-events-none' />
              <div className='relative z-10'>
                <div className='flex justify-between items-start mb-4'>
                  <p className='text-[10px] md:text-xs lg:text-xs uppercase tracking-[0.3em] text-indigo-200 font-bold mt-1.5'>
                    Quote of the Day
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      randomizeQuote();
                    }}
                    className={`p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-indigo-200 hover:text-white ${isSpinning ? 'animate-spin' : ''}`}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <p className='text-lg md:text-xl lg:text-xl leading-relaxed font-medium bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent min-h-[4rem]'>
                  {'"'}
                  {quoteOfTheDay.text}
                  {'"'}
                </p>
                <div className='mt-5 flex items-center justify-between'>
                  <p className='text-xs text-indigo-200/70 font-medium max-w-[70%]'>
                    {quoteOfTheDay.source}
                  </p>
                  <Quote
                    size={40}
                    className='text-white/5 opacity-50 shrink-0'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrackerDrawer
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onUpdate={fetchTrackerSummary}
      />
      <ScheduleDrawer
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onUpdate={fetchPrayerTimes}
      />
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />
    </main>
  );
}

// Sub-komponen ToolCard yang disesuaikan ukurannya untuk tablet & desktop
const ToolCard = ({
  icon: Icon,
  title,
  colorClass,
  bgClass,
  onClick,
  className,
}) => (
  <div
    onClick={onClick}
    className={`relative bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2rem] p-3 md:p-4 lg:p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden cursor-pointer h-28 md:h-32 lg:h-32 ${className}`}
  >
    <Icon
      size={80}
      className={`absolute -bottom-6 -right-6 md:-bottom-5 md:-right-5 lg:-bottom-5 lg:-right-5 ${bgClass} opacity-50 z-1 pointer-events-none`}
    />
    <Icon size={24} className={`${colorClass} md:w-7 md:h-7 lg:w-7 lg:h-7`} />
    <span className='text-[11px] md:text-xs lg:text-xs font-bold text-slate-700 dark:text-slate-200 z-2'>
      {title}
    </span>
  </div>
);
