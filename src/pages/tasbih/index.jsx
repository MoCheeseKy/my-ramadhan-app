import React, { useState, useEffect } from 'react';
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
  MoreHorizontal,
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
  }, // Atau 33
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

  // State Utama
  const [currentIndex, setCurrentIndex] = useState(0); // Index dzikir saat ini
  const [count, setCount] = useState(0);
  const [rotation, setRotation] = useState(0); // Sudut putaran animasi
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentDzikir = dzikirPresets[currentIndex];

  // Hitung Progress Lingkaran
  const progress = Math.min((count / currentDzikir.target) * 100, 100);
  const radius = 120; // Jari-jari lingkaran SVG
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleIncrement = () => {
    if (isCompleted) return; // Stop jika sudah target (harus reset/next)

    const newCount = count + 1;
    setCount(newCount);

    // Logic Rotasi: 360 derajat dibagi target. Misal target 33, sekali klik putar ~10 derajat
    const rotationStep =
      360 / (currentDzikir.target > 100 ? 33 : currentDzikir.target);
    setRotation((prev) => prev + rotationStep);

    // Haptic Feedback
    if (navigator.vibrate) navigator.vibrate(30);

    // Cek Target Tercapai
    if (newCount >= currentDzikir.target) {
      setIsCompleted(true);
      if (soundEnabled && navigator.vibrate) navigator.vibrate([100, 50, 100]); // Getar panjang
    }
  };

  const handleReset = () => {
    setCount(0);
    setIsCompleted(false);
    // Tidak mereset rotasi agar animasinya smooth terus berlanjut
  };

  const changeDzikir = (direction) => {
    let newIndex = currentIndex + direction;
    // Loop menu
    if (newIndex < 0) newIndex = dzikirPresets.length - 1;
    if (newIndex >= dzikirPresets.length) newIndex = 0;

    setCurrentIndex(newIndex);
    handleReset(); // Reset hitungan saat ganti dzikir
  };

  return (
    <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-10 selection:bg-teal-200 flex flex-col'>
      <Head>
        <title>Tasbih Digital - MyRamadhan</title>
      </Head>

      {/* --- HEADER --- */}
      <header className='px-6 py-4 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-40'>
        <button
          onClick={() => router.push('/')}
          className='p-2 -ml-2 rounded-full hover:bg-slate-200/50 transition-colors'
        >
          <ArrowLeft size={20} className='text-slate-600' />
        </button>
        <div className='flex flex-col items-center'>
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            {currentDzikir.id} / {dzikirPresets.length}
          </span>
          <h1 className='font-bold text-lg text-slate-700'>Tasbih Digital</h1>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 -mr-2 rounded-full transition-colors ${soundEnabled ? 'text-teal-600 bg-teal-50' : 'text-slate-400'}`}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>

      <main className='flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden'>
        {/* --- DZIKIR INFO CARD --- */}
        <div className='text-center mb-8 relative z-10 w-full max-w-xs'>
          <motion.div
            key={currentDzikir.title} // Trigger animasi saat ganti
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white/60 backdrop-blur-md border border-white p-6 rounded-3xl shadow-sm'
          >
            <h2 className='text-sm font-bold text-teal-600 uppercase tracking-wider mb-2'>
              {currentDzikir.title}
            </h2>
            <p className='font-amiri text-3xl mb-2 text-slate-800 leading-relaxed'>
              {currentDzikir.arabic}
            </p>
            <p className='text-sm text-slate-500 font-medium italic'>
              "{currentDzikir.latin}"
            </p>
          </motion.div>
        </div>

        {/* --- MAIN INTERACTIVE CIRCLE --- */}
        <div className='relative mb-10'>
          {/* Background Decor Glow */}
          <div className='absolute inset-0 bg-teal-300/20 rounded-full blur-3xl scale-110 pointer-events-none' />

          {/* SVG Progress Ring */}
          <div className='relative w-72 h-72 flex items-center justify-center'>
            {/* Base Circle (Track) */}
            <svg className='absolute w-full h-full transform -rotate-90'>
              <circle
                cx='50%'
                cy='50%'
                r={radius}
                fill='none'
                stroke='#e2e8f0' // Slate-200
                strokeWidth='12'
              />
              {/* Progress Circle */}
              <circle
                cx='50%'
                cy='50%'
                r={radius}
                fill='none'
                stroke={isCompleted ? '#10b981' : '#14b8a6'} // Emerald when done, Teal otherwise
                strokeWidth='12'
                strokeLinecap='round'
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className='transition-all duration-300 ease-out'
              />
            </svg>

            {/* ROTATING BEADS RING (Visual Only) */}
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className='absolute w-[88%] h-[88%] rounded-full border-[6px] border-dashed border-slate-300 opacity-30 pointer-events-none'
              style={{ borderSpacing: '20px' }}
            />

            {/* CLICKABLE AREA (Button) */}
            <button
              onClick={handleIncrement}
              disabled={isCompleted}
              className={`
                w-56 h-56 rounded-full bg-white shadow-[0_10px_40px_-10px_rgba(20,184,166,0.2)]
                flex flex-col items-center justify-center z-10
                transition-all active:scale-95
                ${isCompleted ? 'cursor-default' : 'cursor-pointer hover:shadow-lg'}
              `}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className='flex flex-col items-center text-emerald-500'
                >
                  <CheckCircle2 size={64} className='mb-2' />
                  <span className='text-sm font-bold'>Selesai</span>
                </motion.div>
              ) : (
                <>
                  <span className='text-6xl font-black text-slate-800 tabular-nums tracking-tighter'>
                    {count}
                  </span>
                  <span className='text-xs font-bold text-slate-400 mt-2 uppercase'>
                    Target:{' '}
                    {currentDzikir.target > 1000 ? '∞' : currentDzikir.target}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className='flex items-center gap-6 z-10'>
          {/* Prev Button */}
          <button
            onClick={() => changeDzikir(-1)}
            className='p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-teal-600 hover:scale-105 transition-all'
          >
            <ChevronLeft size={24} />
          </button>

          {/* Center Action (Reset / Next if Completed) */}
          <div className='flex gap-3'>
            {isCompleted ? (
              <button
                onClick={() => changeDzikir(1)} // Auto next dzikir
                className='px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:scale-105 transition-all flex items-center gap-2'
              >
                Lanjut <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleReset}
                className='p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-red-500 hover:scale-105 transition-all'
                title='Ulangi Hitungan'
              >
                <RotateCcw size={24} />
              </button>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={() => changeDzikir(1)}
            className='p-4 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-teal-600 hover:scale-105 transition-all'
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </main>
    </div>
  );
}
