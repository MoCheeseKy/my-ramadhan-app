'use client';

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';

/**
 * AudioPlayer — fixed bottom player untuk memutar audio tilawah per ayat.
 * Otomatis mulai putar saat `currentAyat` berubah.
 * Memanggil `onNext` saat audio selesai.
 *
 * @prop {object}   currentAyat   - Objek ayat aktif (butuh currentAyat.audio['05'])
 * @prop {string}   label         - Label yang ditampilkan (misal: "Al-Fatihah — Ayat 1")
 * @prop {Function} onPrev        - Navigasi ke ayat sebelumnya
 * @prop {Function} onNext        - Navigasi ke ayat selanjutnya
 * @prop {Function} onClose       - Tutup player
 */
const AudioPlayer = ({ currentAyat, label, onPrev, onNext, onClose }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);

  // Ganti sumber audio & auto-play saat ayat berubah
  useEffect(() => {
    if (!currentAyat?.audio?.['05']) return;
    if (audioRef.current) {
      audioRef.current.src = currentAyat.audio['05'];
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [currentAyat]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurTime(audioRef.current.currentTime);
    setProgress(
      (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0,
    );
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime =
      (e.target.value / 100) * audioRef.current.duration;
  };

  const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe md:pb-6'>
      <div className='max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden'>
        {/* Progress bar dekoratif di atas panel */}
        <div className='h-1.5 bg-gradient-to-r from-[#1e3a8a] via-indigo-500 to-purple-500' />

        <div className='p-4 md:p-5'>
          {/* Label & tombol tutup */}
          <div className='flex items-center justify-between mb-3'>
            <div>
              <p className='text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500'>
                Memutar
              </p>
              <p className='font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base'>
                {label}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            >
              <X size={18} className='text-slate-500 dark:text-slate-400' />
            </button>
          </div>

          {/* Seek bar */}
          <div className='flex items-center gap-3 mb-3'>
            <span className='text-[10px] md:text-xs tabular-nums text-slate-400 dark:text-slate-500 w-8 md:w-10'>
              {fmt(curTime)}
            </span>
            <input
              type='range'
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className='flex-1 h-1.5 md:h-2 rounded-full accent-[#1e3a8a] dark:accent-blue-500 cursor-pointer bg-slate-200 dark:bg-slate-700'
            />
            <span className='text-[10px] md:text-xs tabular-nums text-slate-400 dark:text-slate-500 w-8 md:w-10'>
              {fmt(duration)}
            </span>
          </div>

          {/* Kontrol putar */}
          <div className='flex items-center justify-center gap-4 md:gap-6'>
            <button
              onClick={onPrev}
              className='p-2 text-slate-500 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors'
            >
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlay}
              className='w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1e3a8a] dark:bg-blue-700 text-white flex items-center justify-center hover:bg-[#162d6e] dark:hover:bg-blue-800 transition-colors shadow-lg'
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={onNext}
              className='p-2 text-slate-500 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors'
            >
              <SkipForward size={24} />
            </button>
          </div>
        </div>

        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onEnded={onNext}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
