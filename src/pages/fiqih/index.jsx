'use client';

import Head from 'next/head';
import { useRouter } from 'next/router';
import { Scale, Search, X } from 'lucide-react';

import { useFiqihData } from '@/hooks/useFiqihData';
import CategoryChips from '@/components/Fiqih/CategoryChips';
import HomeView from '@/components/Fiqih/HomeView';
import SearchView from '@/components/Fiqih/SearchView';
import CategoryView from '@/components/Fiqih/CategoryView';

export default function FiqihPage() {
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    activeCatConfig,
    displayItems,
    categoryCounts,
    totalItems,
    isSearchMode,
    isHomeView,
    handleSelectCategory,
    handleClearCategory,
    handleBack,
  } = useFiqihData();

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-24 selection:bg-amber-200 dark:selection:bg-amber-900'>
      <Head>
        <title>Fiqih Ramadhan - MyRamadhan</title>
      </Head>

      {/* Header */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-5 py-3'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto'>
          {/* Baris atas: back + judul + badge total */}
          <div className='flex items-center gap-3 mb-3'>
            <button
              onClick={() => handleBack(router)}
              className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
            >
              <X size={20} className='text-slate-600 dark:text-slate-400' />
            </button>

            <div className='flex-1 min-w-0'>
              {activeCategory && !isSearchMode ? (
                /* Header mode kategori */
                <div className='flex items-center gap-2'>
                  <span className='text-xl md:text-2xl'>
                    {activeCatConfig?.emoji}
                  </span>
                  <div>
                    <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-100 leading-tight truncate'>
                      {activeCatConfig?.label}
                    </h1>
                    <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500'>
                      {displayItems.length} materi tersedia
                    </p>
                  </div>
                </div>
              ) : (
                /* Header mode home / search */
                <div className='flex items-center gap-2'>
                  <Scale
                    size={20}
                    className='text-amber-500 dark:text-amber-400 shrink-0 md:w-6 md:h-6'
                  />
                  <h1 className='font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100'>
                    Fiqih Ramadhan
                  </h1>
                </div>
              )}
            </div>

            {isHomeView && (
              <span className='text-[10px] md:text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full shrink-0'>
                {totalItems} Materi
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className='relative'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
              size={16}
            />
            <input
              type='text'
              placeholder='Cari topik fiqih (contoh: batal, niat, sunnah)...'
              className='w-full pl-11 pr-10 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-amber-400 outline-none text-[13px] md:text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 transition-colors'
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Chips navigasi kategori (hanya muncul saat bukan home) */}
          {!isHomeView && (
            <CategoryChips
              activeCategory={activeCategory}
              isSearchMode={isSearchMode}
              categoryCounts={categoryCounts}
              onSelectCategory={handleSelectCategory}
              onClearCategory={handleClearCategory}
            />
          )}
        </div>
      </header>

      {/* Main content */}
      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 pt-4 pb-6 md:pt-6'>
        {isHomeView && (
          <HomeView
            categoryCounts={categoryCounts}
            totalItems={totalItems}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {isSearchMode && (
          <SearchView
            displayItems={displayItems}
            searchQuery={searchQuery}
            router={router}
          />
        )}

        {activeCategory && !isSearchMode && (
          <CategoryView
            displayItems={displayItems}
            activeCatConfig={activeCatConfig}
          />
        )}

        {/* Footer count */}
        {!isHomeView && displayItems.length > 0 && (
          <div className='text-center pt-8 md:pt-10'>
            <p className='text-xs text-slate-400 dark:text-slate-500'>
              Menampilkan {displayItems.length} materi
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
