'use client';

import { Moon, Sun, Database, Trash2, ChevronRight } from 'lucide-react';

/**
 * PreferensiMenuSection — daftar menu pengaturan aplikasi:
 * tema, manajemen data, dan reset data.
 *
 * @prop {string}   theme         - Tema aktif: 'light' | 'dark'
 * @prop {Function} onOpenTema
 * @prop {Function} onOpenData
 * @prop {Function} onOpenReset
 */
const PreferensiMenuSection = ({
  theme,
  onOpenTema,
  onOpenData,
  onOpenReset,
}) => (
  <div>
    <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2'>
      Preferensi Aplikasi
    </p>
    <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden'>
      {/* Tema */}
      <button
        onClick={onOpenTema}
        className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800'
      >
        <div className='flex items-center gap-3'>
          <div
            className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400'}`}
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm'>
            Tema Aplikasi
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-slate-400 dark:text-slate-500 font-medium'>
            {theme === 'dark' ? 'Gelap' : 'Terang'}
          </span>
          <ChevronRight
            size={16}
            className='text-slate-300 dark:text-slate-600'
          />
        </div>
      </button>

      {/* Manajemen Data */}
      <button
        onClick={onOpenData}
        className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'>
            <Database size={18} />
          </div>
          <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm'>
            Manajemen Data
          </span>
        </div>
        <ChevronRight
          size={16}
          className='text-slate-300 dark:text-slate-600'
        />
      </button>

      {/* Reset Data */}
      <button
        onClick={onOpenReset}
        className='w-full flex items-center justify-between p-4 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors'>
            <Trash2 size={18} />
          </div>
          <span className='font-semibold text-rose-600 dark:text-rose-400 text-sm'>
            Reset Semua Data
          </span>
        </div>
        <ChevronRight size={16} className='text-rose-300 dark:text-rose-700' />
      </button>
    </div>
  </div>
);

export default PreferensiMenuSection;
