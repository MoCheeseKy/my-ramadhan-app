'use client';

import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Search,
  ScrollText,
  Bookmark,
  Book,
  Sparkles,
} from 'lucide-react';

/**
 * HaditsHomeView — tampilan beranda Hadits.
 * Berisi banner terakhir dibaca, search AI ke RamaTalk,
 * dan grid seluruh kitab hadits.
 *
 * @prop {Array}    books
 * @prop {boolean}  loadingBooks
 * @prop {object|null} lastRead       - { bookName, number, bookId, page }
 * @prop {string}   searchQuery
 * @prop {Function} setSearchQuery
 * @prop {Function} onOpenBook        - (book) => void
 * @prop {Function} onOpenBookmarks   - () => void
 * @prop {Array}    allBooks          - Seluruh books (untuk resolve lastRead.bookId)
 */
const HaditsHomeView = ({
  books,
  loadingBooks,
  lastRead,
  searchQuery,
  setSearchQuery,
  onOpenBook,
  onOpenBookmarks,
  allBooks,
}) => {
  const router = useRouter();

  const handleSearchTopic = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/ramatalk?mode=hadits&q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20 selection:bg-emerald-200 dark:selection:bg-emerald-900'>
      <Head>
        <title>Hadits - MyRamadhan</title>
      </Head>

      {/* Header sticky */}
      <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.push('/')}
                className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
              >
                <ArrowLeft
                  size={20}
                  className='text-slate-600 dark:text-slate-400'
                />
              </button>
              <h1 className='font-bold text-xl flex items-center gap-2'>
                <ScrollText
                  size={24}
                  className='text-emerald-600 dark:text-emerald-400'
                />
                Hadits
              </h1>
            </div>
            <button
              onClick={onOpenBookmarks}
              className='p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors'
            >
              <Bookmark size={20} />
            </button>
          </div>

          {/* Search → AI RamaTalk */}
          <form onSubmit={handleSearchTopic} className='relative'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
              size={18}
            />
            <input
              type='text'
              placeholder='Cari topik (misal: Sabar, Puasa)...'
              className='w-full pl-12 pr-24 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type='submit'
              className='absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 md:py-2 md:px-4 rounded-xl flex items-center gap-1 transition-colors'
            >
              <Sparkles size={12} className='md:w-3.5 md:h-3.5' /> Tanya AI
            </button>
          </form>
        </div>
      </header>

      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8'>
        {/* Banner terakhir dibaca */}
        {lastRead && (
          <div className='mb-6 md:mb-8 md:max-w-2xl bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-5 md:p-8 text-white shadow-lg relative overflow-hidden'>
            <ScrollText
              className='absolute -right-4 -bottom-4 opacity-20'
              size={100}
            />
            <div className='relative z-10'>
              <p className='text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1'>
                Terakhir Dibaca
              </p>
              <h3 className='font-bold text-xl md:text-3xl mb-1 md:mb-2'>
                {lastRead.bookName}
              </h3>
              <p className='text-sm md:text-base text-emerald-50 mb-4 md:mb-6'>
                Hadits No. {lastRead.number}
              </p>
              <button
                onClick={() => {
                  const book = allBooks.find((b) => b.id === lastRead.bookId);
                  if (book) onOpenBook(book, lastRead.page);
                }}
                className='bg-white text-emerald-600 text-xs md:text-sm font-bold px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-emerald-50 transition-colors shadow-sm'
              >
                Lanjutkan Membaca
              </button>
            </div>
          </div>
        )}

        {/* Label section */}
        <div className='flex items-center gap-2 mb-4 md:mb-6'>
          <Book size={18} className='text-slate-400 dark:text-slate-500' />
          <h2 className='font-bold text-slate-700 dark:text-slate-300 md:text-lg'>
            Jelajahi Kitab
          </h2>
        </div>

        {/* Grid kitab */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5'>
          {loadingBooks
            ? [...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className='h-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl'
                />
              ))
            : books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onOpenBook(book)}
                  className='bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-center h-full min-h-[100px] group'
                >
                  <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 leading-tight mb-1'>
                    {book.name}
                  </h3>
                  <p className='text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500'>
                    {book.available.toLocaleString('id-ID')} Hadits
                  </p>
                </div>
              ))}
        </div>
      </main>
    </div>
  );
};

export default HaditsHomeView;
