'use client';

import { CalendarDays, Moon } from 'lucide-react';

/**
 * HeroCard — kartu hero utama yang menampilkan countdown berbuka,
 * mode berbuka, tarawih, tahajud, dll.
 * Menerima objek `hero` dari hook useHeroMode.
 */
const HeroCard = ({ hero, userCity, onOpenSchedule }) => {
  if (!hero) {
    return (
      <div className='min-h-[300px] rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse' />
    );
  }

  return (
    <div
      className={`relative min-h-[300px] md:min-h-[320px] lg:min-h-[340px] rounded-[2.5rem] p-7 md:p-9 lg:p-10 text-white overflow-hidden group bg-gradient-to-br ${hero.gradient} transition-all duration-500 hover:-translate-y-1`}
      style={{ boxShadow: hero.shadow }}
    >
      {/* Overlay & glow effects */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_60%)]' />
      <div className='absolute -top-20 -right-20 w-72 h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl animate-pulse' />
      <div className='absolute -bottom-24 -left-24 w-72 h-72 lg:w-96 lg:h-96 bg-white/10 rounded-full blur-3xl' />

      {/* Top bar: kota & tombol jadwal */}
      <div className='relative z-10 flex justify-between items-center'>
        <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10'>
          <span
            className={`text-[10px] md:text-xs lg:text-xs uppercase tracking-widest font-bold ${hero.accent}`}
          >
            {userCity}
          </span>
        </div>
        <button
          onClick={onOpenSchedule}
          className='p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm'
        >
          <CalendarDays
            size={18}
            className='text-white/90 cursor-pointer md:w-5 md:h-5'
          />
        </button>
      </div>

      {/* Konten tengah: label & countdown */}
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

      {/* Progress bar subuh → maghrib */}
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

      {/* Dekoratif moon icon */}
      <Moon
        size={214}
        className='absolute -bottom-14 -right-14 text-white/10 rotate-12 pointer-events-none'
      />
    </div>
  );
};

export default HeroCard;
