'use client';

import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  Eye,
  EyeOff,
  ScrollText,
} from 'lucide-react';
import { HADITS_ARAB_SIZES } from './Constants';

/**
 * HadithCard — kartu satu hadits dalam reader.
 *
 * Fitur:
 * - Teks Arab dan terjemahan (kondisional via settings)
 * - Mode hafalan: blur + klik untuk ungkap per hadits
 * - Badge terakhir dibaca
 * - Tombol bookmark, salin, tandai terakhir dibaca
 *
 * @prop {object}   hadith        - Data hadits { number, arab, id (terjemahan) }
 * @prop {object}   settings      - { arab, terjemahan, arabSize }
 * @prop {boolean}  hafalanMode
 * @prop {boolean}  isBookmarked
 * @prop {boolean}  isLastRead
 * @prop {boolean}  isRevealed    - Apakah hadits ini sudah diungkap di mode hafalan
 * @prop {any}      copiedId      - number hadits yang baru disalin
 * @prop {Function} onToggleBookmark
 * @prop {Function} onCopy
 * @prop {Function} onMarkLastRead
 * @prop {Function} onToggleReveal - (number) => void
 */
const HadithCard = ({
  hadith,
  settings,
  hafalanMode,
  isBookmarked,
  isLastRead,
  isRevealed,
  copiedId,
  onToggleBookmark,
  onCopy,
  onMarkLastRead,
  onToggleReveal,
}) => {
  const arabSizeConfig =
    HADITS_ARAB_SIZES.find((s) => s.key === settings.arabSize) ||
    HADITS_ARAB_SIZES[1];

  return (
    <div
      id={`hadith-${hadith.number}`}
      className={`p-6 md:p-8 rounded-[2.5rem] border shadow-sm relative transition-all duration-300 scroll-mt-36 md:scroll-mt-40 ${
        isLastRead
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-400/20 dark:ring-emerald-700/20'
          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-100 dark:hover:border-emerald-800'
      }`}
    >
      {/* Badge terakhir dibaca */}
      {isLastRead && (
        <div className='absolute -top-3 left-6 bg-emerald-500 text-white text-[9px] md:text-[10px] font-bold px-3 py-1 md:py-1.5 rounded-full shadow-sm flex items-center gap-1 z-10'>
          <ScrollText size={12} /> Terakhir Dibaca
        </div>
      )}

      {/* Header: nomor + aksi */}
      <div className='flex justify-between items-center mb-4 md:mb-6 mt-2'>
        <span
          className={`text-[10px] md:text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-wider ${
            isLastRead
              ? 'bg-emerald-500 text-white'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          No. {hadith.number}
        </span>

        <div className='flex gap-1 md:gap-2'>
          {/* Bookmark */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck size={18} className='md:w-5 md:h-5' />
            ) : (
              <Bookmark size={18} className='md:w-5 md:h-5' />
            )}
          </button>

          {/* Salin */}
          <button
            onClick={onCopy}
            className='p-2 text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors'
          >
            {copiedId === hadith.number ? (
              <Check size={18} className='text-emerald-500 md:w-5 md:h-5' />
            ) : (
              <Share2 size={18} className='md:w-5 md:h-5' />
            )}
          </button>
        </div>
      </div>

      {/* Konten: mode hafalan vs normal */}
      <div
        className={hafalanMode && !isRevealed ? 'cursor-pointer' : ''}
        onClick={() =>
          hafalanMode && !isRevealed && onToggleReveal(hadith.number)
        }
      >
        {hafalanMode && !isRevealed ? (
          /* Blur overlay */
          <div className='relative py-2'>
            <div className='blur-[8px] select-none pointer-events-none opacity-40'>
              {settings.arab && (
                <p
                  className='font-amiri text-right mb-4'
                  dir='rtl'
                  style={{ fontSize: arabSizeConfig.size }}
                >
                  {hadith.arab}
                </p>
              )}
              {settings.terjemahan && (
                <p className='text-sm mt-3'>"{hadith.id}"</p>
              )}
            </div>
            <div className='absolute inset-0 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm md:text-base'>
              <Eye size={18} /> Intip Hadits
            </div>
          </div>
        ) : (
          <>
            {settings.arab && (
              <p
                className='font-amiri leading-[2.2] md:leading-[2.4] text-slate-800 dark:text-slate-100 text-right mb-4 md:mb-6'
                dir='rtl'
                style={{ fontSize: arabSizeConfig.size }}
              >
                {hadith.arab}
              </p>
            )}
            {settings.terjemahan && (
              <p className='text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6 md:mb-8'>
                "{hadith.id}"
              </p>
            )}
            {hafalanMode && isRevealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReveal(hadith.number);
                }}
                className='mt-2 mb-4 text-xs md:text-sm font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-300'
              >
                <EyeOff size={14} /> Sembunyikan lagi
              </button>
            )}
          </>
        )}
      </div>

      {/* Tombol tandai terakhir dibaca */}
      <button
        onClick={() => !isLastRead && onMarkLastRead()}
        disabled={isLastRead}
        className={`w-full py-2.5 md:py-3.5 rounded-xl border text-xs md:text-sm font-bold transition-all ${
          isLastRead
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-md cursor-default'
            : 'border-dashed border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
        }`}
      >
        {isLastRead
          ? '✓ Ditandai Sebagai Terakhir Dibaca'
          : 'Tandai Terakhir Dibaca'}
      </button>
    </div>
  );
};

export default HadithCard;
