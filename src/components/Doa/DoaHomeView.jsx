'use client';

import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Search,
  Heart,
  Bookmark,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { DOA_ICONS } from './Constants';

/**
 * DoaHomeView — tampilan beranda doa: grid kategori yang bisa dicari.
 *
 * @prop {Array}    collections        - doaCollections dari data/doa
 * @prop {string}   searchQuery
 * @prop {Function} setSearchQuery
 * @prop {boolean}  loading            - true saat kategori API sedang dimuat
 * @prop {string}   loadingCategoryId  - ID kategori yang sedang loading
 * @prop {Function} onOpenCategory     - (cat) => void
 * @prop {Function} onOpenBookmarks    - () => void
 */
const DoaHomeView = ({
  collections,
  searchQuery,
  setSearchQuery,
  loading,
  loadingCategoryId,
  onOpenCategory,
  onOpenBookmarks,
}) => {
  const router = useRouter();

  const filteredCollections = collections.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20 selection:bg-rose-200 dark:selection:bg-rose-900'>
      <Head>
        <title>Kumpulan Doa - MyRamadhan</title>
      </Head>

      {/* Header sticky */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto'>
          <div className='flex items-center justify-between mb-5'>
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
              <h1 className='font-bold text-xl flex items-center gap-2 text-rose-600 dark:text-rose-400'>
                <Heart size={24} /> Kumpulan Doa
              </h1>
            </div>
            <button
              onClick={onOpenBookmarks}
              className='p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors'
            >
              <Bookmark size={20} />
            </button>
          </div>

          {/* Search kategori */}
          <div className='relative'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
              size={18}
            />
            <input
              type='text'
              placeholder='Cari kategori...'
              className='w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 outline-none text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Grid kategori */}
      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8'>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5'>
          {filteredCollections.map((cat) => {
            const IconComponent = DOA_ICONS[cat.icon] || BookOpen;
            const isThisLoading = loading && loadingCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => !loading && onOpenCategory(cat)}
                className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[120px] md:min-h-[140px] group ${
                  isThisLoading
                    ? 'border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/20 opacity-70'
                    : 'border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    cat.isCustom
                      ? 'bg-rose-500 text-white shadow-md group-hover:bg-rose-600'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white'
                  }`}
                >
                  {isThisLoading ? (
                    <RefreshCw size={20} className='animate-spin' />
                  ) : (
                    <IconComponent size={20} className='md:w-6 md:h-6' />
                  )}
                </div>

                {/* Label */}
                <div>
                  <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-rose-600 dark:group-hover:text-rose-400 leading-tight mb-1'>
                    {cat.title}
                  </h3>
                  <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500 line-clamp-1'>
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default DoaHomeView;
