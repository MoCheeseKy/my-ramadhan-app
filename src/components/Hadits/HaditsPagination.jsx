'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * HaditsPagination — fixed bottom bar untuk navigasi prev/next halaman hadits.
 *
 * @prop {number}   page
 * @prop {number}   totalPages
 * @prop {boolean}  loading
 * @prop {Function} onPrev
 * @prop {Function} onNext
 */
const HaditsPagination = ({ page, totalPages, loading, onPrev, onNext }) => (
  <div className='fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-700 p-4 pb-safe flex justify-center z-40'>
    <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full flex justify-center gap-4'>
      <button
        onClick={onPrev}
        disabled={page === 1 || loading}
        className='flex items-center gap-1 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
      >
        <ChevronLeft size={16} /> Prev
      </button>

      <div className='flex items-center justify-center font-bold text-sm px-6 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full'>
        Page {page}
      </div>

      <button
        onClick={onNext}
        disabled={loading || page >= totalPages}
        className='flex items-center gap-1 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

export default HaditsPagination;
