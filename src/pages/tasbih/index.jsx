import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

// Data Preset Dzikir
const dzikirPresets = [
  {
    id: 1,
    title: 'Istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    latin: 'Astaghfirullah',
    target: 33,
  },
  {
    id: 2,
    title: 'Tasbih',
    arabic: 'سُبْحَانَ اللَّهِ',
    latin: 'Subhanallah',
    target: 33,
  },
  {
    id: 3,
    title: 'Tahmid',
    arabic: 'الْحَمْدُ لِلَّهِ',
    latin: 'Alhamdulillah',
    target: 33,
  },
  {
    id: 4,
    title: 'Takbir',
    arabic: 'اللّهُ أَكْبَرُ',
    latin: 'Allahuakbar',
    target: 33,
  },
  {
    id: 5,
    title: 'Tahlil',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    latin: 'La ilaha illallah',
    target: 100,
  },
  {
    id: 6,
    title: 'Bebas',
    arabic: 'ذِكْرُ الله',
    latin: 'Dzikir Harian',
    target: 999999,
  },
];

export default function TasbihPage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // State untuk efek visual Riak Air (Ripple)
  const [ripples, setRipples] = useState([]);

  const currentDzikir = dzikirPresets[currentIndex];
  const progress = Math.min((count / currentDzikir.target) * 100, 100);

  // Parameter SVG Lingkaran
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleIncrement = (e) => {
    if (isCompleted) return;

    const newCount = count + 1;
    setCount(newCount);

    // Haptic Feedback (Getaran HP)
    if (navigator.vibrate) navigator.vibrate(40);

    // Efek Ripple Visual
    const newRipple = { id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    // Bersihkan ripple setelah animasi selesai (1 detik)
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1000);

    if (newCount >= currentDzikir.target) {
      setIsCompleted(true);
      if (soundEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  };

  const handleReset = () => {
    setCount(0);
    setIsCompleted(false);
  };

  const changeDzikir = (direction) => {
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = dzikirPresets.length - 1;
    if (newIndex >= dzikirPresets.length) newIndex = 0;
    setCurrentIndex(newIndex);
    handleReset();
  };

  return (
    <div className='min-h-screen bg-[#F0F5FA] text-slate-800 pb-10 flex flex-col overflow-hidden relative selection:bg-teal-200'>
      <Head>
        <title>Tasbih Digital - MyRamadhan</title>
      </Head>

      {/* --- BACKGROUND AMBIENT (Glow Effect) --- */}
      <div className='fixed inset-0 pointer-events-none'>
        <div
          className='absolute -top-32 -left-32 w-96 h-96 bg-teal-300/30 rounded-full blur-[100px] animate-pulse'
          style={{ animationDuration: '4s' }}
        />
        <div
          className='absolute top-1/2 -right-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-[100px] animate-pulse'
          style={{ animationDuration: '6s' }}
        />
        <div className='absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-300/20 rounded-full blur-[100px]' />
      </div>

      {/* --- HEADER --- */}
      <header className='px-6 py-4 flex items-center justify-between relative z-40'>
        <button
          onClick={() => router.push('/')}
          className='w-10 h-10 bg-white/60 backdrop-blur-md border border-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-all'
        >
          <ArrowLeft size={18} className='text-slate-600' />
        </button>
        <div className='flex flex-col items-center bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50 shadow-sm'>
          <span className='text-[10px] font-black text-teal-600 uppercase tracking-widest'>
            {currentDzikir.id} OF {dzikirPresets.length}
          </span>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`w-10 h-10 backdrop-blur-md border border-white rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-105 ${soundEnabled ? 'bg-white/60 text-teal-600' : 'bg-slate-100/60 text-slate-400'}`}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </header>

      <main className='flex-1 flex flex-col items-center justify-center px-6 pt-2 pb-6 relative z-10'>
        {/* --- DZIKIR INFO CARD (Glassmorphism) --- */}
        <div className='w-full max-w-sm mb-12'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentDzikir.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.3 }}
              className='bg-white/50 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(20,184,166,0.1)] text-center relative overflow-hidden'
            >
              <div className='absolute top-0 right-0 p-4 opacity-20'></div>
              <h2 className='text-xs font-black text-teal-500 uppercase tracking-[0.2em] mb-4'>
                {currentDzikir.title}
              </h2>
              <p
                className='font-arabic text-4xl mb-3 text-slate-800 leading-snug drop-shadow-sm'
                dir='rtl'
              >
                {currentDzikir.arabic}
              </p>
              <p className='text-sm text-slate-500 font-medium tracking-wide'>
                "{currentDzikir.latin}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- MAIN INTERACTIVE CIRCLE (Neumorphism & Ripples) --- */}
        <div className='relative flex items-center justify-center mb-16'>
          {/* SVG Progress Ring */}
          <div className='absolute w-[300px] h-[300px] pointer-events-none'>
            <svg className='w-full h-full transform -rotate-90 filter drop-shadow-md'>
              {/* Background Track */}
              <circle
                cx='50%'
                cy='50%'
                r={radius}
                fill='none'
                stroke='rgba(255,255,255,0.6)'
                strokeWidth='8'
              />
              {/* Animated Progress Line */}
              <circle
                cx='50%'
                cy='50%'
                r={radius}
                fill='none'
                stroke={isCompleted ? '#10b981' : '#14b8a6'}
                strokeWidth='8'
                strokeLinecap='round'
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className='transition-all duration-500 ease-out drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]'
              />
            </svg>
          </div>

          {/* RIPPLE EFFECTS */}
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{
                width: 220,
                height: 220,
                opacity: 0.5,
                borderWidth: 4,
              }}
              animate={{ width: 400, height: 400, opacity: 0, borderWidth: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className='absolute rounded-full border-teal-400 pointer-events-none'
            />
          ))}

          {/* CLICKABLE BEAD (Neumorphism Button) */}
          <motion.button
            whileTap={
              !isCompleted
                ? {
                    scale: 0.94,
                    boxShadow:
                      'inset 10px 10px 20px rgba(0,0,0,0.05), inset -10px -10px 20px rgba(255,255,255,0.8)',
                  }
                : {}
            }
            onClick={handleIncrement}
            disabled={isCompleted}
            className={`
              relative w-56 h-56 rounded-full flex flex-col items-center justify-center z-10
              bg-[#F0F5FA]
              ${
                isCompleted
                  ? 'shadow-[10px_10px_30px_#d1d9e6,-10px_-10px_30px_#ffffff] cursor-default'
                  : 'shadow-[15px_15px_35px_#d1d9e6,-15px_-15px_35px_#ffffff] cursor-pointer active:shadow-inner'
              }
              transition-all duration-200 border-4 border-white
            `}
          >
            <AnimatePresence mode='wait'>
              {isCompleted ? (
                <motion.div
                  key='completed'
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className='flex flex-col items-center text-emerald-500'
                >
                  <CheckCircle2 size={56} className='mb-2 drop-shadow-md' />
                  <span className='text-sm font-bold tracking-widest uppercase'>
                    Selesai
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key={count} // Akan menganimasikan angka setiap kali berubah
                  initial={{ scale: 1.1, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className='flex flex-col items-center'
                >
                  <span className='text-[4.5rem] font-black text-slate-700 tabular-nums tracking-tighter leading-none drop-shadow-sm'>
                    {count}
                  </span>
                  <span className='text-[10px] font-bold text-teal-500 mt-2 uppercase tracking-[0.2em] bg-teal-50 px-3 py-1 rounded-full'>
                    Target:{' '}
                    {currentDzikir.target > 1000 ? '∞' : currentDzikir.target}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* --- BOTTOM CONTROLS (Floating Pill) --- */}
        <div className='bg-white/60 backdrop-blur-xl border border-white/60 p-2 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] flex items-center gap-2 z-10'>
          <button
            onClick={() => changeDzikir(-1)}
            className='p-3 text-slate-400 hover:text-teal-600 hover:bg-white rounded-full transition-all'
          >
            <ChevronLeft size={20} />
          </button>

          <div className='w-[1px] h-6 bg-slate-200 mx-1' />

          <AnimatePresence mode='wait'>
            {isCompleted ? (
              <motion.button
                key='next-btn'
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onClick={() => changeDzikir(1)}
                className='px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full font-bold shadow-md hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap'
              >
                Lanjut <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                key='reset-btn'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleReset}
                className='px-8 py-3 text-slate-500 font-bold hover:text-rose-500 hover:bg-white rounded-full transition-all flex items-center gap-2'
              >
                <RotateCcw size={18} /> Reset
              </motion.button>
            )}
          </AnimatePresence>

          <div className='w-[1px] h-6 bg-slate-200 mx-1' />

          <button
            onClick={() => changeDzikir(1)}
            className='p-3 text-slate-400 hover:text-teal-600 hover:bg-white rounded-full transition-all'
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}
