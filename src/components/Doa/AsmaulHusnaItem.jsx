'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Eye, EyeOff } from 'lucide-react';
import { DOA_ARAB_SIZES } from './Constants';

/**
 * AsmaulHusnaItem — kartu compact untuk menampilkan satu item Asmaul Husna.
 * Menampilkan nomor, nama Arab, nama latin (title), dan arti.
 * Mendukung mode hafalan (blur + klik untuk ungkap).
 *
 * @prop {object}   doa           - Item doa/asmaul husna
 * @prop {number}   index         - Nomor urut (fallback jika doa.index tidak ada)
 * @prop {boolean}  isBookmarked
 * @prop {object}   settings      - { arab, latin, terjemahan, arabSize }
 * @prop {boolean}  hafalanMode
 * @prop {Function} onBookmark
 */
const AsmaulHusnaItem = ({
  doa,
  index,
  isBookmarked,
  settings,
  hafalanMode,
  onBookmark,
}) => {
  const [revealed, setRevealed] = useState(false);

  // Reset saat hafalanMode berubah
  useEffect(() => setRevealed(false), [hafalanMode]);

  const arabSizeConfig =
    DOA_ARAB_SIZES.find((s) => s.key === settings.arabSize) ||
    DOA_ARAB_SIZES[1];

  return (
    <div
      id={`doa-${doa.id}`}
      className='bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-700 shadow-sm rounded-3xl p-4 flex flex-col items-center text-center relative transition-all duration-300 h-full'
    >
      {/* Nomor urut */}
      <div className='absolute top-3 left-3'>
        <span className='w-6 h-6 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-[10px] font-black text-slate-400 dark:text-slate-400'>
          {doa.index || index}
        </span>
      </div>

      {/* Tombol bookmark */}
      <div className='absolute top-3 right-3'>
        <button
          onClick={() => onBookmark(doa)}
          className={`p-1.5 rounded-full transition-colors ${
            isBookmarked
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
              : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>
      </div>

      {/* Konten */}
      <div
        className={`w-full mt-6 flex-1 flex flex-col justify-center ${hafalanMode && !revealed ? 'cursor-pointer' : ''}`}
        onClick={() => hafalanMode && !revealed && setRevealed(true)}
      >
        {hafalanMode && !revealed ? (
          /* Mode hafalan: blur + ikon eye */
          <div className='relative py-4'>
            <div className='blur-[6px] select-none pointer-events-none opacity-40'>
              <p className='font-amiri text-2xl text-slate-800 dark:text-slate-200 mb-1'>
                {doa.arab || 'اللَّهُ'}
              </p>
              <p className='text-rose-600 font-bold text-xs'>{doa.title}</p>
            </div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <Eye size={20} className='text-slate-400 dark:text-slate-500' />
            </div>
          </div>
        ) : (
          <>
            {settings.arab && doa.arab && (
              <p
                className='font-amiri text-slate-800 dark:text-slate-100 mb-2 leading-loose'
                dir='rtl'
                style={{ fontSize: arabSizeConfig.size }}
              >
                {doa.arab}
              </p>
            )}
            {settings.latin && (
              <h3 className='font-bold text-rose-600 dark:text-rose-400 text-sm mb-1'>
                {doa.title || doa.latin}
              </h3>
            )}
            {settings.terjemahan && doa.arti && (
              <p className='text-slate-500 dark:text-slate-400 text-[11px] leading-snug'>
                "{doa.arti}"
              </p>
            )}

            {/* Tombol sembunyikan di mode hafalan setelah reveal */}
            {hafalanMode && revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                }}
                className='mt-3 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 mx-auto hover:text-slate-600 dark:hover:text-slate-300'
              >
                <EyeOff size={10} /> Sembunyikan
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AsmaulHusnaItem;
