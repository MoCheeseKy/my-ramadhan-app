'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';

// Import Icons
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
  LogIn,
  LogOut,
} from 'lucide-react';

import TrackerDrawer from '@/components/TrackerDrawer';
import ScheduleDrawer from '@/components/ScheduleDrawer';
import { quotesData } from '@/data/quotes';

dayjs.locale('id');
dayjs.extend(relativeTime);
dayjs.extend(duration);

export default function MyRamadhanHome() {
  const { user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());

  // State Drawers
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // State Data Dinamis
  const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 9 });
  const [quoteOfTheDay, setQuoteOfTheDay] = useState(quotesData[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  // State Prayer Times
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [userCity, setUserCity] = useState('Jakarta'); // <--- TAMBAHKAN INI

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);

    randomizeQuote();
    fetchTrackerSummary();
    fetchPrayerTimes();

    return () => clearInterval(timer);
  }, []);

  const fetchPrayerTimes = useCallback(async () => {
    try {
      const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
      const city = localUser?.location_city || 'Jakarta';

      setUserCity(city); // <--- TAMBAHKAN INI (simpan ke state)

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
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) return;

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', localUser.personal_code)
      .single();
    if (!userData) return;

    const today = dayjs().format('YYYY-MM-DD');

    const { data } = await supabase
      .from('daily_trackers')
      .select('*')
      .eq('user_id', userData.id)
      .eq('date', today)
      .single();

    if (data) {
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
      const completed = keysToCheck.reduce(
        (acc, key) => acc + (data[key] ? 1 : 0),
        0,
      );
      setTaskProgress({ completed, total: keysToCheck.length });
    }
  };

  const randomizeQuote = () => {
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotesData.length);
      setQuoteOfTheDay(quotesData[randomIndex]);
      setIsSpinning(false);
    }, 500);
  };

  if (!mounted) return null;

  const hour = currentTime.hour();
  const greeting =
    hour < 11
      ? 'Selamat Pagi'
      : hour < 15
        ? 'Selamat Siang'
        : hour < 18
          ? 'Selamat Sore'
          : 'Selamat Malam';
  const hijriDate = '1 Ramadhan 1447 H';

  const progressPercent = (taskProgress.completed / taskProgress.total) * 100;
  const dailyTopic = {
    day: 1,
    title: 'Niat: Fondasi Ibadah Puasa',
    readTime: '2 min',
  };

  // =============================================
  // HERO MODE LOGIC
  // =============================================
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
    const tarawihEnd = dayjs().hour(1).minute(0).second(0); // 01:00
    const tahajudEnd = dayjs().hour(4).minute(0).second(0); // 04:00
    const subuhPlus5 = subuh.add(5, 'minute');

    const now = currentTime;
    const nowH = now.hour();

    const formatDur = (diff) => {
      const dur = dayjs.duration(diff > 0 ? diff : 0);
      return `${String(dur.hours()).padStart(2, '0')}:${String(dur.minutes()).padStart(2, '0')}:${String(dur.seconds()).padStart(2, '0')}`;
    };

    // 1. Selamat Berbuka (Maghrib s/d Isya+10 menit)
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

    // 2. Waktu Tarawih (Isya+10 menit s/d 01:00)
    // Catatan: tarawihEnd (01:00) ada di hari berikutnya secara jam,
    // jadi kita pakai nowH untuk deteksi dini hari
    if (now.isAfter(isyaEnd) || (nowH >= 0 && nowH < 1)) {
      // Hanya masuk sini jika MALAM (setelah isya) ATAU dini hari sebelum jam 1
      if (now.isAfter(isyaEnd) && (nowH >= isya.hour() || nowH < 1)) {
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
    }

    // 3. Waktu Tahajud (01:00 s/d 04:00)
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

    // 4. Countdown Puasa Dimulai (04:00 s/d Subuh+5 menit)
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

    // 5. Default: Countdown ke Maghrib (Subuh+5 menit s/d Maghrib)
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

  // Helper Component untuk Card Tools Kecil

  return (
    <main className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-16 selection:bg-blue-200'>
      <div className='fixed inset-0 -z-10 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-60' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl opacity-60' />
      </div>

      <div className='max-w-md mx-auto p-5'>
        {/* --- HEADER --- */}
        <header className='flex justify-between items-center mb-8 mt-2'>
          <div>
            <span className='px-2 py-0.5 bg-blue-100 text-[#1e3a8a] text-[10px] font-bold uppercase tracking-wider rounded-md'>
              {hijriDate}
            </span>
            <h1 className='text-2xl font-extrabold tracking-tight mt-2 leading-tight'>
              {greeting}, <br />
              <span className='text-[#1e3a8a]'>
                {user?.username || 'Pendatang!'}
              </span>{' '}
              👋
            </h1>
          </div>
          <div className='w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-xl hover:scale-105 transition-transform'>
            {user ? (
              <LogOut
                size={20}
                className='text-rose-500 cursor-pointer'
                onClick={() => {
                  supabase.auth.signOut();
                  localStorage.removeItem('myRamadhan_user');
                  router.push('/auth/login');
                }}
              />
            ) : (
              <LogIn
                size={20}
                className='text-emerald-500 cursor-pointer'
                onClick={() => router.push('/auth/login')}
              />
            )}
          </div>
        </header>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className='grid grid-cols-2 gap-4 animate-fadeUp'>
          {/* 1. HERO CARD (Dynamic Mode) */}
          {hero ? (
            <div
              className={`col-span-2 relative min-h-[300px] rounded-[2.5rem] p-7 text-white overflow-hidden group bg-gradient-to-br ${hero.gradient} transition-all duration-500 hover:-translate-y-1`}
              style={{ boxShadow: hero.shadow }}
            >
              {/* Background Effects */}
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_60%)]' />
              <div className='absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse' />
              <div className='absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl' />
              <div className='absolute inset-0 opacity-30 pointer-events-none'>
                <div className='absolute w-1 h-1 bg-white rounded-full top-[20%] left-[15%] animate-pulse' />
                <div className='absolute w-1 h-1 bg-white rounded-full top-[35%] left-[75%] animate-pulse' />
              </div>

              {/* Header Row */}
              <div className='relative z-10 flex justify-between items-center'>
                <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10'>
                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold ${hero.accent}`}
                  >
                    {userCity}
                  </span>
                </div>
                <CalendarDays
                  onClick={() => setIsScheduleOpen(true)}
                  size={18}
                  className='text-white/80 cursor-pointer'
                />
              </div>

              {/* Main Content */}
              <div className='relative z-10 text-center mt-8'>
                <p
                  className={`text-[10px] uppercase tracking-[0.3em] ${hero.accent} mb-2`}
                >
                  {hero.countdownLabel || hero.label}
                </p>

                {hero.timeLeft ? (
                  <h2
                    className='text-[4rem] font-black tracking-[-0.05em] tabular-nums
                      bg-gradient-to-b from-white via-white/90 to-white/60
                      bg-clip-text text-transparent drop-shadow-xl leading-none'
                  >
                    {hero.timeLeft}
                  </h2>
                ) : (
                  <h2
                    className='text-[2.2rem] font-black
                      bg-gradient-to-b from-white via-white/90 to-white/60
                      bg-clip-text text-transparent drop-shadow-xl leading-tight mt-4'
                  >
                    {hero.label}
                  </h2>
                )}

                <p className={`mt-3 text-sm ${hero.accent} opacity-80`}>
                  {hero.sublabel}
                </p>
              </div>

              {/* Progress Bar — hanya tampil jika ada data progress */}
              {hero.progress && (
                <div className='relative z-10 mt-10'>
                  <div
                    className={`flex justify-between text-[9px] uppercase tracking-widest ${hero.accent} opacity-70 mb-2`}
                  >
                    <span>{hero.progress.startLabel}</span>
                    <span>{hero.progress.endLabel}</span>
                  </div>
                  <div className='relative h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm'>
                    <div
                      className='h-full bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.8)] transition-all duration-1000 ease-out'
                      style={{ width: `${hero.progress.value}%` }}
                    />
                    <div className='absolute inset-0 bg-white/10 mix-blend-overlay' />
                  </div>
                </div>
              )}

              <Moon
                size={214}
                className='absolute -bottom-14 -right-14 text-white/10 rotate-12'
              />
            </div>
          ) : (
            // Skeleton loading saat prayer times belum tersedia
            <div className='col-span-2 min-h-[300px] rounded-[2.5rem] bg-slate-200 animate-pulse' />
          )}

          {/* 2. TRACKER CARD */}
          <div
            onClick={() => {
              if (!user) {
                router.push('/auth/login');
              } else {
                setIsTrackerOpen(true);
              }
            }}
            className='col-span-2 bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden cursor-pointer'
          >
            <div className='flex justify-between items-center mb-3'>
              <div className='bg-emerald-100 p-2 rounded-xl w-fit text-emerald-600'>
                <CheckSquare size={18} />
              </div>
              <span className='text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg'>
                Daily Goal
              </span>
            </div>

            <div className='flex justify-between items-end'>
              <div>
                <h3 className='font-bold text-lg leading-tight text-slate-800'>
                  Ibadah Harian
                </h3>
                <p className='text-xs text-slate-500 mt-1'>
                  Sudah {taskProgress.completed} dari {taskProgress.total}{' '}
                  target!
                </p>
              </div>
              <div className='w-12 h-12 relative flex items-center justify-center'>
                <svg className='w-full h-full -rotate-90' viewBox='0 0 36 36'>
                  <path
                    className='text-slate-100'
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
                <span className='absolute text-[10px] font-bold text-emerald-600'>
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
          </div>

          {/* 3. GRID MENU (8 ITEMS) */}
          <div className='col-span-2 grid grid-cols-4 gap-3 mt-2'>
            {/* Row 1 */}
            <ToolCard
              icon={BookOpen}
              title="Al-Qur'an"
              colorClass='text-[#1e3a8a]'
              bgClass='text-blue-100'
              onClick={() => router.push('/quran')}
            />
            <ToolCard
              icon={HeartHandshake}
              title='Doa'
              colorClass='text-rose-500'
              bgClass='text-rose-100'
              onClick={() => router.push('/doa')}
            />
            <ToolCard
              icon={ScrollText}
              title='Hadits'
              colorClass='text-emerald-600'
              bgClass='text-emerald-100'
              onClick={() => router.push('/hadits')}
            />
            <ToolCard
              icon={Scale}
              title='Fiqih'
              colorClass='text-amber-600'
              bgClass='text-amber-100'
              onClick={() => router.push('/fiqih')}
            />

            {/* Row 2 */}
            <ToolCard
              icon={Compass}
              title='Kiblat'
              colorClass='text-indigo-600'
              bgClass='text-indigo-100'
              onClick={() => router.push('/kompas')}
            />
            <ToolCard
              icon={Fingerprint}
              title='Tasbih'
              colorClass='text-teal-600'
              bgClass='text-teal-100'
              onClick={() => router.push('/tasbih')}
            />
            <ToolCard
              icon={Droplets}
              title='Haid'
              colorClass='text-pink-500'
              bgClass='text-pink-100'
              className='col-span-2'
              onClick={() => router.push('/haid-tracker')}
            />
          </div>

          {/* 4. STUDY TIME */}
          <div
            onClick={() => router.push(`/study/${dailyTopic.day}`)}
            className='col-span-2 bg-white rounded-[2rem] p-5 group shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden cursor-pointer flex items-center justify-between'
          >
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <span className='bg-amber-100 text-amber-600 p-1.5 rounded-lg'>
                  <Lightbulb size={16} />
                </span>
                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
                  Daily Knowledge
                </span>
              </div>
              <h3 className='font-bold text-slate-800 text-sm group-hover:text-amber-600 transition-colors'>
                {dailyTopic.title}
              </h3>
            </div>
            <div className='bg-slate-50 p-3 rounded-full group-hover:bg-amber-50 transition-colors'>
              <ChevronRight
                size={20}
                className='text-slate-400 group-hover:text-amber-500'
              />
            </div>
          </div>

          {/* 5. REFLECTION JOURNAL */}
          <div
            onClick={() => {
              if (!user) {
                router.push('/auth/login');
              } else {
                router.push('/jurnal');
              }
            }}
            className='col-span-2 relative bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden cursor-pointer'
          >
            <Moon
              size={120}
              className='absolute -bottom-8 -right-8 text-[#1e3a8a] opacity-10'
            />
            <div className='flex items-center gap-2 mb-3'>
              <PenLine size={18} className='text-[#1e3a8a]' />
              <h3 className='font-bold text-slate-800'>Jurnal Refleksi</h3>
            </div>
            <p className='text-sm text-slate-500'>
              Bagaimana perasaanmu hari ini?
            </p>
            <div className='mt-3 text-xs font-semibold text-[#1e3a8a] flex items-center gap-1'>
              Mulai menulis <ChevronRight size={14} />
            </div>
          </div>

          {/* 6. RAMATALK AI */}
          <div
            onClick={() => router.push('/ramatalk')}
            className='col-span-2 relative rounded-[2rem] p-6 overflow-hidden text-white
              bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95]
              shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)]
              transition-all duration-500 hover:-translate-y-1 group cursor-pointer'
          >
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(255,255,255,0.12),transparent_65%)]' />
            <div className='absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl' />
            <div className='relative z-10'>
              <div className='flex items-center gap-2 mb-4'>
                <Sparkles size={16} className='text-indigo-200' />
                <p className='text-[10px] uppercase tracking-[0.3em] text-indigo-200'>
                  Ramatalk AI
                </p>
              </div>
              <h3 className='text-xl font-bold bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-2'>
                Tanya Seputar Ibadah
              </h3>
              <p className='text-sm text-indigo-100/80'>
                Butuh penjelasan fiqih? Ramatalk siap membantu 🤍
              </p>
            </div>
          </div>

          {/* 7. QUOTE OF THE DAY */}
          <div
            className='col-span-2 relative rounded-[2rem] p-6 overflow-hidden text-white
              bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95]
              shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)]
              transition-all duration-500 hover:-translate-y-1 group'
          >
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.15),transparent_65%)]' />
            <div className='absolute -top-16 -left-16 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl animate-pulse' />
            <div className='relative z-10'>
              <div className='flex justify-between items-start mb-4'>
                <p className='text-[10px] uppercase tracking-[0.3em] text-indigo-200'>
                  Quote of the Day
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    randomizeQuote();
                  }}
                  className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-indigo-200 hover:text-white ${isSpinning ? 'animate-spin' : ''}`}
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <p className='text-lg leading-relaxed font-medium bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent min-h-[3.5rem]'>
                {'"'}
                {quoteOfTheDay.text}
                {'"'}
              </p>

              <div className='mt-4 flex items-center justify-between'>
                <p className='text-xs text-indigo-200/70'>
                  {quoteOfTheDay.source}
                </p>
                <Quote size={40} className='text-white/5 opacity-50' />
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

      <p className='w-full text-center text-sm text-[#1e3a8a] pt-16'>
        By @mocheeseky for every muslim 🤍
      </p>
      <p className='w-full text-center text-sm text-[#1e3a8a] pt-1'>
        Partnership hit{' '}
        <a href='mailto:rifky.muhammadprayudhi@gmail.com' className='underline'>
          rifky.muhammadprayudhi@gmail.com
        </a>
      </p>
    </main>
  );
}

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
    className={`relative bg-white rounded-[2rem] p-4 border border-slate-100 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden cursor-pointer h-32 ${className}`}
  >
    <Icon
      size={80}
      className={`absolute -bottom-6 -right-6 ${bgClass} opacity-50 z-1`}
    />
    <Icon size={24} className={colorClass} />
    <span className='text-xs font-bold text-slate-700 z-2'>{title}</span>
  </div>
);
