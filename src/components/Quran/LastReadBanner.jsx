'use client';

import { BookOpen, BookmarkCheck, PlayCircle } from 'lucide-react';

/**
 * LastReadBanner — menampilkan banner "Terakhir Dibaca" di halaman index Quran.
 * Tampil hanya jika ada data lastRead. Klik tombol memanggil `onContinue`.
 *
 * @prop {object}   lastRead    - { surahName, ayahNumber, isJuz, juzNumber }
 * @prop {Function} onContinue  - Navigasi ke posisi terakhir dibaca
 */
const LastReadBanner = ({ lastRead, onContinue }) => {
  if (!lastRead) return null;

  return (
    <div className='mb-6 lg:mb-8 md:max-w-2xl lg:max-w-2xl md:mx-auto bg-gradient-to-r from-[#1e3a8a] to-[#312e81] rounded-[2rem] p-6 lg:p-8 text-white shadow-lg relative overflow-hidden'>
      {/* Dekorasi ikon buku */}
      <BookOpen className='absolute -right-4 -bottom-4 opacity-10' size={120} />

      <div className='relative z-10'>
        <div className='flex items-center gap-1.5 mb-2'>
          <BookmarkCheck size={16} className='text-indigo-200' />
          <p className='text-[10px] lg:text-xs font-bold uppercase tracking-widest text-indigo-200'>
            Terakhir Dibaca
          </p>
        </div>

        <h3 className='font-bold text-2xl lg:text-3xl mb-1.5 leading-tight'>
          {lastRead.surahName}
        </h3>
        <p className='text-sm lg:text-base text-indigo-100 mb-5 lg:mb-6'>
          Ayat {lastRead.ayahNumber}
          {lastRead.isJuz && lastRead.juzNumber
            ? ` • Juz ${lastRead.juzNumber}`
            : ''}
        </p>

        <button
          onClick={onContinue}
          className='bg-white text-[#1e3a8a] text-xs lg:text-sm font-bold px-6 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2 w-fit'
        >
          <PlayCircle size={18} /> Lanjutkan Membaca
        </button>
      </div>
    </div>
  );
};

export default LastReadBanner;
