'use client';

import { Sun, Moon } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerTema — pilihan tema aplikasi (terang / gelap).
 *
 * @prop {boolean}  open          - State buka/tutup
 * @prop {Function} onClose       - Tutup drawer
 * @prop {string}   theme         - Tema aktif: 'light' | 'dark'
 * @prop {Function} onToggleTheme - Callback dengan nilai tema baru
 */
const DrawerTema = ({ open, onClose, theme, onToggleTheme }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Tema Aplikasi'
    icon={Sun}
    titleColor='text-amber-500 dark:text-amber-400'
  >
    <p className='text-slate-500 dark:text-slate-400'>
      Pilih tema antarmuka aplikasi yang paling nyaman untuk mata Anda.
    </p>

    <div className='grid grid-cols-2 gap-3 mt-4'>
      <button
        onClick={() => onToggleTheme('light')}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
          theme === 'light'
            ? 'border-[#1e3a8a] dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-[#1e3a8a] dark:text-blue-400'
            : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <Sun size={28} className='mb-2' />
        <span className='font-bold text-sm'>Mode Terang</span>
      </button>

      <button
        onClick={() => onToggleTheme('dark')}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
          theme === 'dark'
            ? 'border-[#1e3a8a] dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-[#1e3a8a] dark:text-blue-400'
            : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <Moon size={28} className='mb-2' />
        <span className='font-bold text-sm'>Mode Gelap</span>
      </button>
    </div>
  </DrawerPanel>
);

export default DrawerTema;
