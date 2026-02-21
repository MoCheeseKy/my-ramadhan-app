'use client';

import Head from 'next/head';
import { ArrowLeft, Bookmark } from 'lucide-react';
import DoaItem from '@/components/doa/DoaItem';

/**
 * DoaBookmarksView — menampilkan semua doa yang di-bookmark user.
 * Menggunakan DoaItem dengan hafalanMode=false (always visible).
 *
 * @prop {Array}    bookmarks
 * @prop {any}      copiedId
 * @prop {object}   settings
 * @prop {Function} onToggleBookmark  - (doa) => void
 * @prop {Function} onCopy            - (doa) => void
 * @prop {Function} onBack            - Kembali ke home
 */
const DoaBookmarksView = ({
  bookmarks,
  copiedId,
  settings,
  onToggleBookmark,
  onCopy,
  onBack,
}) => (
  <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20'>
    <Head>
      <title>Doa Disimpan - MyRamadhan</title>
    </Head>

    {/* Header */}
    <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
      <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center gap-3'>
        <button
          onClick={onBack}
          className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
        >
          <ArrowLeft size={20} className='text-slate-600 dark:text-slate-400' />
        </button>
        <h1 className='font-bold text-xl flex items-center gap-2 text-rose-600 dark:text-rose-400'>
          <Bookmark size={22} /> Disimpan
        </h1>
      </div>
    </header>

    {/* Konten */}
    <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5'>
      {bookmarks.length === 0 ? (
        <div className='text-center py-20 opacity-50'>
          <Bookmark
            size={48}
            className='mx-auto mb-4 text-slate-300 dark:text-slate-600'
          />
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
            Belum ada doa yang disimpan.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
          {bookmarks.map((b) => (
            <DoaItem
              key={b.id}
              doa={b}
              isBookmarked
              copiedId={copiedId}
              settings={settings}
              hafalanMode={false}
              isCustom={false}
              onBookmark={onToggleBookmark}
              onDelete={() => {}}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}
    </main>
  </div>
);

export default DoaBookmarksView;
