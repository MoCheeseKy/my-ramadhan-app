'use client';

import { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DOA_ARAB_SIZES } from './Constants';

/**
 * DoaItem — kartu utama untuk menampilkan satu doa.
 *
 * Fitur:
 * - Teks Arab, latin, terjemah (kondisional via settings)
 * - Badge group, tags, source, dan role (bilal/jamaah)
 * - Mode hafalan: konten blur, klik untuk ungkap
 * - Bookmark untuk doa biasa, tombol hapus untuk doa kustom
 * - Tombol salin teks
 *
 * @prop {object}   doa           - Data doa
 * @prop {boolean}  isBookmarked
 * @prop {any}      copiedId      - ID doa yang baru disalin
 * @prop {object}   settings      - { arab, latin, terjemahan, arabSize }
 * @prop {boolean}  hafalanMode
 * @prop {boolean}  isCustom      - Tampilkan tombol hapus (bukan bookmark)
 * @prop {Function} onBookmark
 * @prop {Function} onDelete      - (id) => void
 * @prop {Function} onCopy        - (doa) => void
 */
const DoaItem = ({
  doa,
  isBookmarked,
  copiedId,
  settings,
  hafalanMode,
  isCustom,
  onBookmark,
  onDelete,
  onCopy,
}) => {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => setRevealed(false), [hafalanMode]);

  const arabSizeConfig =
    DOA_ARAB_SIZES.find((s) => s.key === settings.arabSize) ||
    DOA_ARAB_SIZES[1];

  const isBilal = doa.role === 'bilal';
  const isJamaah = doa.role === 'jamaah';
  const arabText = doa.arab || '';
  const latinText = doa.latin || '';
  const artiText = doa.arti || '';

  return (
    <div
      id={`doa-${doa.id}`}
      className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col h-full ${
        isJamaah
          ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 shadow-sm'
          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-rose-100 dark:hover:border-rose-800 shadow-sm'
      }`}
    >
      {/* ── Header ── */}
      <div className='flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-700/50 shrink-0'>
        <div className='flex-1 pr-4'>
          <h3 className='font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-snug'>
            {doa.title || 'Judul Doa'}
          </h3>
          <div className='flex flex-wrap gap-1 mt-1.5'>
            {doa.group && (
              <span className='inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400'>
                {doa.group}
              </span>
            )}
            {doa.tags?.map((tag, i) => (
              <span
                key={`tag-${i}`}
                className='inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400'
              >
                {tag}
              </span>
            ))}
            {doa.source && (
              <span className='inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'>
                Sumber: {doa.source}
              </span>
            )}
            {doa.role && (
              <span
                className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  isBilal
                    ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                    : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                }`}
              >
                {isBilal ? 'Bilal' : 'Jamaah'}
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          {/* Salin */}
          <button
            onClick={() => onCopy(doa)}
            className='p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
          >
            {copiedId === doa.id ? (
              <Check size={15} className='text-emerald-500' />
            ) : (
              <Copy size={15} />
            )}
          </button>

          {/* Hapus (kustom) atau Bookmark */}
          {isCustom ? (
            <button
              onClick={() => onDelete(doa.id)}
              className='p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition-colors'
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <button
              onClick={() => onBookmark(doa)}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck size={15} />
              ) : (
                <Bookmark size={15} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div
        className={`px-5 py-4 flex-1 flex flex-col ${hafalanMode && !revealed ? 'cursor-pointer justify-center' : ''}`}
        onClick={() => hafalanMode && !revealed && setRevealed(true)}
      >
        {hafalanMode && !revealed ? (
          /* Mode hafalan: blur + overlay tombol */
          <div className='relative'>
            <div className='blur-[6px] select-none pointer-events-none opacity-50'>
              {settings.arab && arabText && (
                <p
                  className='font-amiri text-slate-800 dark:text-slate-200 text-right leading-[2.4] mb-3'
                  dir='rtl'
                  style={{ fontSize: arabSizeConfig.size }}
                >
                  {arabText}
                </p>
              )}
              {settings.latin && latinText && (
                <p className='text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed italic mt-2'>
                  {latinText}
                </p>
              )}
              {settings.terjemahan && artiText && (
                <p className='text-slate-700 dark:text-slate-300 text-sm leading-relaxed mt-3'>
                  "{artiText}"
                </p>
              )}
            </div>
            <button className='absolute inset-0 flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm'>
              <Eye size={18} /> Intip Doa
            </button>
          </div>
        ) : (
          <>
            {settings.arab && arabText && (
              <div className='mb-3'>
                <p
                  className='font-amiri text-slate-800 dark:text-slate-100 text-right leading-[2.4]'
                  dir='rtl'
                  style={{ fontSize: arabSizeConfig.size }}
                >
                  {arabText}
                </p>
              </div>
            )}
            {settings.latin && latinText && (
              <p className='text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed italic mt-1 mb-2'>
                {latinText}
              </p>
            )}
            {settings.terjemahan && artiText && (
              <p className='text-slate-700 dark:text-slate-300 text-sm leading-relaxed mt-2 pb-1 flex-1'>
                "{artiText}"
              </p>
            )}
            {hafalanMode && revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                }}
                className='mt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center w-full gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors'
              >
                <EyeOff size={12} /> Sembunyikan lagi
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoaItem;
