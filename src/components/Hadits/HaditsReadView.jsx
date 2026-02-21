'use client';

import { useState } from 'react';
import Head from 'next/head';
import { EyeOff } from 'lucide-react';
import { HADITS_PER_PAGE } from '@/components/Hadits/Constants';
import HaditsReaderHeader from '@/components/Hadits/HaditsReaderHeader';
import HadithCard from '@/components/Hadits/HadithCard';
import HaditsPagination from '@/components/Hadits/HaditsPagination';

/**
 * HaditsReadView — view membaca hadits dalam satu kitab.
 * Mengelola state lokal: hafalanMode, showSettings.
 * State reader (page, hadiths, dll) dikelola di orchestrator via useHaditsReader.
 *
 * @prop {object}   book            - Kitab aktif { name, available, id }
 * @prop {number}   page
 * @prop {Array}    hadiths         - List hadits halaman ini
 * @prop {boolean}  loadingHadiths
 * @prop {Array}    bookmarks
 * @prop {object|null} lastRead
 * @prop {any}      copiedId
 * @prop {Set}      revealedIds
 * @prop {string}   jumpNumber
 * @prop {Function} setJumpNumber
 * @prop {object}   settings        - { arab, terjemahan, arabSize }
 * @prop {Function} onToggleSetting
 * @prop {Function} onSizeChange
 * @prop {Function} onJumpSubmit
 * @prop {Function} onChangePage    - (direction: 1|-1) => void
 * @prop {Function} onToggleBookmark
 * @prop {Function} onCopy
 * @prop {Function} onMarkLastRead
 * @prop {Function} onToggleReveal
 * @prop {Function} onBack
 */
const HaditsReadView = ({
  book,
  page,
  hadiths,
  loadingHadiths,
  bookmarks,
  lastRead,
  copiedId,
  revealedIds,
  jumpNumber,
  setJumpNumber,
  settings,
  onToggleSetting,
  onSizeChange,
  onJumpSubmit,
  onChangePage,
  onToggleBookmark,
  onCopy,
  onMarkLastRead,
  onToggleReveal,
  onBack,
}) => {
  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const totalPages = book ? Math.ceil(book.available / HADITS_PER_PAGE) : 1;

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-24 selection:bg-emerald-200 dark:selection:bg-emerald-900 transition-colors duration-300'>
      <Head>
        <title>{book?.name} - MyRamadhan</title>
      </Head>

      {/* Header sticky */}
      <HaditsReaderHeader
        book={book}
        page={page}
        hafalanMode={hafalanMode}
        onToggleHafalan={() => setHafalanMode((v) => !v)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((v) => !v)}
        settings={settings}
        onToggleSetting={onToggleSetting}
        onSizeChange={onSizeChange}
        jumpNumber={jumpNumber}
        setJumpNumber={setJumpNumber}
        onJumpSubmit={onJumpSubmit}
        onBack={onBack}
      />

      <main className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-5 space-y-4 md:space-y-6 pt-6'>
        {/* Banner hafalan */}
        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 flex items-center gap-2 mb-2'>
            <EyeOff
              size={16}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-400 text-xs md:text-sm font-semibold'>
              Mode Hafalan aktif — klik "Intip Hadits" untuk melihat bacaan.
            </p>
          </div>
        )}

        {/* Skeleton loading */}
        {loadingHadiths
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className='h-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-[2rem]'
              />
            ))
          : hadiths.map((h) => (
              <HadithCard
                key={h.number}
                hadith={h}
                settings={settings}
                hafalanMode={hafalanMode}
                isBookmarked={bookmarks.some(
                  (b) => b.bookId === book?.id && b.number === h.number,
                )}
                isLastRead={
                  lastRead?.bookId === book?.id && lastRead?.number === h.number
                }
                isRevealed={revealedIds.has(h.number)}
                copiedId={copiedId}
                onToggleBookmark={() => onToggleBookmark(h)}
                onCopy={() => onCopy(h)}
                onMarkLastRead={() => onMarkLastRead(h)}
                onToggleReveal={onToggleReveal}
              />
            ))}
      </main>

      {/* Pagination fixed bottom */}
      <HaditsPagination
        page={page}
        totalPages={totalPages}
        loading={loadingHadiths}
        onPrev={() => onChangePage(-1)}
        onNext={() => onChangePage(1)}
      />
    </div>
  );
};

export default HaditsReadView;
