'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/router';

/**
 * BookmarkCard — menampilkan satu ayat yang di-bookmark.
 * Berisi teks Arab, terjemahan, label surah/ayat, tombol hapus, dan tombol buka.
 *
 * @prop {object}   bookmark        - { surahId, surahName, ayahNumber, arab, translation }
 * @prop {Function} onRemove        - Callback hapus bookmark
 */
const BookmarkCard = ({ bookmark, onRemove }) => {
  const router = useRouter();

  return (
    <div className='bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow'>
      {/* Header: label + tombol hapus */}
      <div className='flex justify-between items-center mb-4'>
        <span className='bg-blue-50 dark:bg-blue-500/20 text-[#1e3a8a] dark:text-blue-300 text-[10px] lg:text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-wider'>
          {bookmark.surahName} • Ayat {bookmark.ayahNumber}
        </span>
        <button
          onClick={() => onRemove(bookmark)}
          className='p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-full transition-colors'
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Teks Arab */}
      <div className='flex-1'>
        <p
          className='font-arabic text-2xl lg:text-3xl leading-[2.2] text-slate-800 dark:text-slate-100 text-right mb-4'
          dir='rtl'
        >
          {bookmark.arab}
        </p>

        {/* Terjemahan */}
        <p className='text-slate-600 dark:text-slate-400 text-[13px] lg:text-sm leading-relaxed mb-6'>
          "{bookmark.translation}"
        </p>
      </div>

      {/* Tombol navigasi ke ayat */}
      <button
        onClick={() =>
          router.push(
            `/quran/surah/${bookmark.surahId}#ayat-${bookmark.ayahNumber}`,
          )
        }
        className='w-full mt-auto py-3 rounded-xl border border-[#1e3a8a] dark:border-blue-400 text-xs lg:text-sm font-bold text-[#1e3a8a] dark:text-blue-300 hover:bg-[#1e3a8a] hover:text-white dark:hover:bg-blue-400 dark:hover:text-slate-900 transition-all'
      >
        Buka Ayat Ini
      </button>
    </div>
  );
};

export default BookmarkCard;
