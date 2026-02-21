'use client';

import Head from 'next/head';
import { ArrowLeft, Bookmark } from 'lucide-react';

/**
 * HaditsBookmarksView — menampilkan semua hadits yang di-bookmark.
 * Setiap kartu menampilkan nama kitab, nomor, teks Arab, dan terjemahan.
 *
 * @prop {Array}    bookmarks
 * @prop {Function} onRemoveBookmark  - (bookId, number) => void
 * @prop {Function} onBack
 */
const HaditsBookmarksView = ({ bookmarks, onRemoveBookmark, onBack }) => (
  <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20'>
    <Head>
      <title>Hadits Disimpan - MyRamadhan</title>
    </Head>

    {/* Header */}
    <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
      <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center gap-3'>
        <button
          onClick={onBack}
          className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
        >
          <ArrowLeft size={20} className='text-slate-600 dark:text-slate-400' />
        </button>
        <h1 className='font-bold text-xl flex items-center gap-2'>
          <Bookmark size={22} className='text-amber-500' /> Disimpan
        </h1>
      </div>
    </header>

    {/* Konten */}
    <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8'>
      {bookmarks.length === 0 ? (
        <div className='text-center py-20 opacity-50'>
          <Bookmark
            size={48}
            className='mx-auto mb-4 text-slate-300 dark:text-slate-600'
          />
          <p className='text-slate-500 dark:text-slate-400'>
            Belum ada hadits yang disimpan.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
          {bookmarks.map((h, i) => (
            <div
              key={i}
              className='bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full'
            >
              {/* Header kartu */}
              <div className='flex justify-between items-center mb-4'>
                <span className='bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] md:text-xs font-black px-2.5 py-1.5 rounded-md uppercase'>
                  {h.bookName} • No. {h.number}
                </span>
                <button
                  onClick={() => onRemoveBookmark(h.bookId, h.number)}
                  className='text-rose-400 dark:text-rose-500 text-xs font-bold hover:underline transition-colors'
                >
                  Hapus
                </button>
              </div>

              {/* Teks Arab */}
              <p
                className='font-amiri text-xl md:text-2xl leading-[2] md:leading-[2.2] text-slate-800 dark:text-slate-100 text-right mb-3 md:mb-4'
                dir='rtl'
              >
                {h.arab}
              </p>

              {/* Terjemahan */}
              <p className='text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed flex-1'>
                "{h.id}"
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  </div>
);

export default HaditsBookmarksView;
