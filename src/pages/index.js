'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import { supabase } from '@/lib/supabase';

// Import Icons
import {
  BookOpen,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  CalendarDays,
  PenLine,
  Lightbulb,
  Moon,
  Sun,
  Quote,
  MoreHorizontal,
  CheckSquare,
  RefreshCw,
  Calendar,
  // New Icons
  HeartHandshake, // Doa
  ScrollText, // Hadits
  Scale, // Fiqih
  Compass, // Kompas
  Fingerprint, // Tasbih (Finger Counter)
  Droplets, // Haid Tracker
} from 'lucide-react';

import TrackerDrawer from '@/components/TrackerDrawer';
import ScheduleDrawer from '@/components/ScheduleDrawer';
import { quotesData } from '@/data/quotes';

dayjs.locale('id');
dayjs.extend(relativeTime);
dayjs.extend(duration);

export default function MyRamadhanHome() {
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

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);

    randomizeQuote();
    fetchTrackerSummary();

    return () => clearInterval(timer);
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

  const maghrib = dayjs().hour(18).minute(5).second(0);
  const diff = maghrib.diff(currentTime);
  const dur = dayjs.duration(diff > 0 ? diff : 0);
  const timeLeft = `${String(dur.hours()).padStart(2, '0')}:${String(dur.minutes()).padStart(2, '0')}:${String(dur.seconds()).padStart(2, '0')}`;

  const subuh = dayjs().hour(4).minute(30).second(0);
  const totalDuration = maghrib.diff(subuh);
  const passed = currentTime.diff(subuh);
  const dayProgress =
    passed > 0 ? Math.min((passed / totalDuration) * 100, 100) : 0;

  const progressPercent = (taskProgress.completed / taskProgress.total) * 100;
  const dailyTopic = {
    day: 1,
    title: 'Niat: Fondasi Ibadah Puasa',
    readTime: '2 min',
  };

  // Helper Component untuk Card Tools Kecil
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
        className={`absolute -bottom-6 -right-6 ${bgClass} opacity-50`}
      />
      <Icon size={24} className={colorClass} />
      <span className='text-xs font-bold text-slate-700'>{title}</span>
    </div>
  );

  return (
    <main className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-32 selection:bg-blue-200'>
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
              <span className='text-[#1e3a8a]'>Sahabat!</span> 👋
            </h1>
          </div>
          <div className='w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-xl hover:scale-105 transition-transform'>
            <Moon className='text-[#1e3a8a]' />
          </div>
        </header>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className='grid grid-cols-2 gap-4 animate-fadeUp'>
          {/* 1. HERO CARD (Time Context) */}
          <div
            onClick={() => setIsScheduleOpen(true)}
            className='col-span-2 relative min-h-[300px] rounded-[2.5rem] p-7 text-white overflow-hidden group cursor-pointer
              bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95]
              shadow-[0_25px_60px_-15px_rgba(79,70,229,0.5)]
              transition-all duration-500 hover:-translate-y-1'
          >
            <div className='absolute top-6 right-6 bg-white/10 backdrop-blur-md p-2 rounded-full hover:bg-white/20 transition-colors'>
              <Calendar size={18} />
            </div>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_60%)]' />
            <div className='absolute -top-20 -right-20 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl animate-pulse' />
            <div className='absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl' />

            <div className='relative z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 w-fit'>
              <span className='text-[10px] uppercase tracking-widest font-bold text-blue-100'>
                Jakarta WIB
              </span>
            </div>

            <div className='relative z-10 text-center mt-8'>
              <p className='text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-2'>
                Menuju Berbuka
              </p>
              <h2 className='text-[4.5rem] font-black tracking-[-0.05em] tabular-nums leading-none bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-xl'>
                {timeLeft}
              </h2>
              <p className='mt-3 text-sm text-indigo-100/80'>
                Maghrib pukul{' '}
                <span className='font-bold text-white'>18:05</span>
              </p>
            </div>

            <div className='relative z-10 mt-10'>
              <div className='flex justify-between text-[9px] uppercase tracking-widest text-indigo-200/70 mb-2'>
                <span>Subuh 04:30</span>
                <span>Maghrib 18:05</span>
              </div>
              <div className='relative h-3 w-full bg-white/10 rounded-full overflow-hidden backdrop-blur-sm'>
                <div
                  className='h-full bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.8)] transition-all duration-1000 ease-out'
                  style={{ width: `${dayProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* 2. TRACKER CARD */}
          <div
            onClick={() => setIsTrackerOpen(true)}
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

          {/* 3. GRID MENU (8 ITEMS: Quran, Badges + 6 New Items) */}
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
              className={'col-span-2'}
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
            onClick={() => router.push('/journal')}
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
      />
    </main>
  );
}
