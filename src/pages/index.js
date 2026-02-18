'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

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
} from 'lucide-react';

dayjs.locale('id');
dayjs.extend(relativeTime);
dayjs.extend(duration);

export default function MyRamadhanHome() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  // --- Logic Waktu & Sapaan ---
  const hour = currentTime.hour();
  const greeting =
    hour < 11
      ? 'Selamat Pagi'
      : hour < 15
        ? 'Selamat Siang'
        : hour < 18
          ? 'Selamat Sore'
          : 'Selamat Malam';

  const hijriDate = '5 Ramadhan 1447 H';

  // --- Logic Countdown & Progress ---
  const maghrib = dayjs().hour(18).minute(5).second(0);
  const diff = maghrib.diff(currentTime);
  const dur = dayjs.duration(diff > 0 ? diff : 0);
  const timeLeft = `${String(dur.hours()).padStart(2, '0')}:${String(
    dur.minutes(),
  ).padStart(2, '0')}:${String(dur.seconds()).padStart(2, '0')}`;

  const subuh = dayjs().hour(4).minute(30).second(0);
  const totalDuration = maghrib.diff(subuh);
  const passed = currentTime.diff(subuh);
  const dayProgress =
    passed > 0 ? Math.min((passed / totalDuration) * 100, 100) : 0;

  // --- Data Dummy ---
  const dailyTopic = {
    day: 5,
    title: 'Keutamaan Menahan Marah saat Berpuasa',
    readTime: '3 min',
  };

  const quoteOfTheDay = {
    text: 'Maka sesungguhnya bersama kesulitan ada kemudahan.',
    source: 'QS. Al-Insyirah: 5',
  };

  const taskProgress = { completed: 3, total: 6 };
  const progressPercent = (taskProgress.completed / taskProgress.total) * 100;

  return (
    <main className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-32 selection:bg-blue-200'>
      {/* Background Decor */}
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
              <span className='text-[#1e3a8a]'>Rifky!</span> 👋
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
            className='col-span-2 relative min-h-[300px] rounded-[2.5rem] p-7 text-white overflow-hidden group
              bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95]
              shadow-[0_25px_60px_-15px_rgba(79,70,229,0.5)]
              transition-all duration-500 hover:-translate-y-1'
          >
            {/* Background Effects */}
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_60%)]' />
            <div className='absolute -top-20 -right-20 w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl animate-pulse' />
            <div className='absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl' />
            <div className='absolute inset-0 opacity-30 pointer-events-none'>
              <div className='absolute w-1 h-1 bg-white rounded-full top-[20%] left-[15%] animate-pulse' />
              <div className='absolute w-1 h-1 bg-white rounded-full top-[35%] left-[75%] animate-pulse' />
            </div>

            {/* Content */}
            <div className='relative z-10 flex justify-between items-center'>
              <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10'>
                <span className='text-[10px] uppercase tracking-widest font-bold text-blue-100'>
                  Jakarta WIB
                </span>
              </div>
              <CalendarDays size={18} className='text-white/80' />
            </div>

            <div className='relative z-10 text-center mt-8'>
              <p className='text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-2'>
                Menuju Berbuka
              </p>
              <h2
                className='text-[4.5rem] font-black tracking-[-0.05em] tabular-nums
                  bg-gradient-to-b from-white via-blue-100 to-indigo-200
                  bg-clip-text text-transparent drop-shadow-xl leading-none'
              >
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
                <div className='absolute inset-0 bg-white/10 mix-blend-overlay' />
              </div>
            </div>

            <Moon
              size={214}
              className='absolute -bottom-14 -right-14 text-white/10 rotate-12'
            />
          </div>

          {/* 2. TRACKER (Action Item) */}
          <div className='relative bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden'>
            <div className='bg-emerald-100 p-2 rounded-xl w-fit text-emerald-600'>
              <CheckSquare size={18} />
            </div>

            <h3 className='mt-4 font-bold text-lg leading-tight'>
              Ibadah Harian
            </h3>

            <div className='mt-3 flex items-center gap-2'>
              <div className='flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-emerald-500 rounded-full transition-all duration-700'
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className='text-xs text-slate-400 font-medium'>
                {taskProgress.completed}/{taskProgress.total}
              </span>
            </div>
          </div>

          {/* 3. STUDY TIME (Action Item) */}
          <div className='col-span-1 bg-white rounded-[2rem] p-5 group shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden'>
            <div className='flex justify-between items-start'>
              <div className='bg-amber-100 p-2 rounded-2xl text-amber-600'>
                <Lightbulb size={20} />
              </div>
              <span className='bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg'>
                DAY {dailyTopic.day}
              </span>
            </div>

            <p className='text-[10px] text-slate-400 uppercase font-bold mt-3'>
              Materi Hari Ini
            </p>

            <h3 className='font-bold text-slate-800 text-sm mt-1 group-hover:-translate-y-1 transition-transform'>
              {dailyTopic.title}
            </h3>

            <div className='h-[2px] w-0 bg-amber-500 group-hover:w-full transition-all duration-300 mt-2' />
          </div>

          {/* 4. RAMATALK AI (Assistant) */}
          <div
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

              <button
                className='mt-5 bg-white/15 backdrop-blur-md border border-white/20
                  px-4 py-2 rounded-full text-xs font-semibold tracking-wide
                  hover:bg-white/25 transition-all'
              >
                Mulai Bertanya →
              </button>
            </div>
          </div>

          {/* 5. TOOLS: QURAN & BADGES */}
          {/* Quran */}
          <div className='relative bg-white rounded-[2rem] p-4 border border-slate-100 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden'>
            <BookOpen
              size={80}
              className='absolute -bottom-6 -right-6 text-blue-100'
            />
            <BookOpen size={24} className='text-[#1e3a8a]' />
            <span className='text-xs font-bold'>Al-Qur{"'"}an</span>
          </div>

          {/* Badges */}
          <div className='relative bg-white rounded-[2rem] p-4 border border-slate-100 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden'>
            <Trophy
              size={80}
              className='absolute -bottom-6 -right-6 text-yellow-100'
            />
            <Trophy size={24} className='text-yellow-500' />
            <span className='text-xs font-bold'>Badges</span>
          </div>

          {/* 6. REFLECTION JOURNAL (End of Day) */}
          <div className='col-span-2 relative bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden'>
            <Moon
              size={120}
              className='absolute -bottom-8 -right-8 text-[#1e3a8a]'
            />
            <div className='flex items-center gap-2 mb-3'>
              <PenLine size={18} className='text-[#1e3a8a]' />
              <h3 className='font-bold'>Jurnal Refleksi</h3>
            </div>
            <p className='text-sm text-slate-500'>
              Bagaimana perasaanmu hari ini?
            </p>
            <div className='mt-3 text-xs font-semibold text-[#1e3a8a] flex items-center gap-1'>
              Mulai menulis <ChevronRight size={14} />
            </div>
          </div>

          {/* 7. QUOTE OF THE DAY (Inspiration/Footer) */}
          <div
            className='col-span-2 relative rounded-[2rem] p-6 overflow-hidden text-white
              bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95]
              shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)]
              transition-all duration-500 hover:-translate-y-1 group'
          >
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.15),transparent_65%)]' />
            <div className='absolute -top-16 -left-16 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl animate-pulse' />
            <div className='relative z-10'>
              <p className='text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-4'>
                Quote of the Day
              </p>
              <p className='text-lg leading-relaxed font-medium bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent'>
                {'"'}
                {quoteOfTheDay.text}
                {'"'}
              </p>
              <p className='mt-4 text-xs text-indigo-200/70'>
                {quoteOfTheDay.source}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
