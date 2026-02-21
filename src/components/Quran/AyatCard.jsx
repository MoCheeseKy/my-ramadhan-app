'use client';

import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Play,
  Pause,
} from 'lucide-react';
import ArabicText from './ArabicText';

export default function AyatCard({
  ayat,
  surahName,
  surahId,
  settings,
  hafalanMode,
  isBookmarked,
  isLastRead,
  isPlaying,
  isJuzMode = false,
  copiedId,
  onBookmark,
  onLastRead,
  onCopy,
  onPlayAudio,
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [hafalanMode]);

  if (!ayat) return null; // Mencegah crash jika ayat null

  const isAnchor =
    typeof window !== 'undefined' &&
    window.location.hash ===
      (isJuzMode
        ? `#ayat-${surahId}-${ayat.nomorAyat}`
        : `#ayat-${ayat.nomorAyat}`);

  const copyKey = isJuzMode ? `${surahId}-${ayat.nomorAyat}` : ayat.nomorAyat;
  const domId = isJuzMode
    ? `ayat-${surahId}-${ayat.nomorAyat}`
    : `ayat-${ayat.nomorAyat}`;

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={domId}
      className={`rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-300 overflow-hidden scroll-mt-36 md:scroll-mt-40 ${
        isLastRead
          ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#1e3a8a] dark:border-blue-700 ring-2 ring-[#1e3a8a]/20 dark:ring-blue-700/20'
          : isAnchor
            ? 'bg-indigo-50/40 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600'
            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-800'
      }`}
    >
      {/* HEADER */}
      <div className='flex items-center justify-between px-5 md:px-7 py-3 md:py-4 border-b border-slate-50 dark:border-slate-700/50'>
        <div className='flex items-center gap-2 md:gap-3'>
          <div
            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm font-black ${
              isLastRead
                ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white'
                : 'bg-blue-50 dark:bg-blue-950/50 text-[#1e3a8a] dark:text-blue-400'
            }`}
          >
            {ayat.nomorAyat}
          </div>
          {isJuzMode && surahName && (
            <span className='text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500'>
              {surahName}
            </span>
          )}
        </div>

        <div className='flex items-center gap-1 md:gap-2'>
          <button
            onClick={() => onPlayAudio(ayat)}
            className={`p-2 rounded-full transition-colors ${
              isPlaying
                ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => onCopy(ayat, surahName)}
            className='p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
          >
            {copiedId === copyKey ? (
              <Check size={16} className='text-emerald-500' />
            ) : (
              <Copy size={16} />
            )}
          </button>
          <button
            onClick={() => onBookmark(ayat)}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck size={16} />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div
        className={`px-5 py-4 md:px-7 md:py-6 ${
          hafalanMode && !revealed ? 'cursor-pointer' : ''
        }`}
        onClick={() => hafalanMode && !revealed && setRevealed(true)}
      >
        {hafalanMode && !revealed ? (
          <div className='relative'>
            <div className='blur-[6px] select-none pointer-events-none opacity-50'>
              {settings.arab && (
                <ArabicText
                  text={ayat.teksArab}
                  arabSize={settings.arabSize}
                  tajwid={settings.tajwid}
                  isDark={isDark}
                />
              )}
              {settings.latin && (
                <p className='text-slate-500 dark:text-slate-400 text-[13px] md:text-sm italic mt-2'>
                  {ayat.teksLatin}
                </p>
              )}
              {settings.terjemahan && (
                <p className='text-slate-700 dark:text-slate-300 text-sm md:text-base mt-3'>
                  "{ayat.teksIndonesia}"
                </p>
              )}
            </div>
            <button className='absolute inset-0 flex items-center justify-center gap-2 text-[#1e3a8a] dark:text-blue-400 font-bold text-sm md:text-base'>
              <Eye size={18} /> Intip Ayat
            </button>
          </div>
        ) : (
          <>
            {settings.arab && (
              <div className='mb-3 md:mb-5'>
                <ArabicText
                  text={ayat.teksArab}
                  arabSize={settings.arabSize}
                  tajwid={settings.tajwid}
                  isDark={isDark}
                />
              </div>
            )}
            {settings.latin && (
              <p className='text-slate-500 dark:text-slate-400 text-[13px] md:text-sm italic mt-1 mb-2 md:mb-3'>
                {ayat.teksLatin}
              </p>
            )}
            {settings.terjemahan && (
              <p className='text-slate-700 dark:text-slate-300 text-sm md:text-base mt-2 pb-1'>
                "{ayat.teksIndonesia}"
              </p>
            )}
            {hafalanMode && revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                }}
                className='mt-3 md:mt-4 text-xs md:text-sm font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-300'
              >
                <EyeOff size={14} /> Sembunyikan lagi
              </button>
            )}
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className='px-5 pb-4 md:px-7 md:pb-6'>
        <button
          onClick={() => !isLastRead && onLastRead(ayat)}
          disabled={isLastRead}
          className={`w-full py-2.5 md:py-3 rounded-2xl border text-xs md:text-sm font-bold transition-all ${
            isLastRead
              ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white border-[#1e3a8a] dark:border-blue-700 cursor-default'
              : 'border-dashed border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 hover:border-[#1e3a8a]/40 dark:hover:border-blue-700/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
          }`}
        >
          {isLastRead ? '✓ Terakhir Dibaca' : 'Tandai Terakhir Dibaca'}
        </button>
      </div>
    </div>
  );
}
