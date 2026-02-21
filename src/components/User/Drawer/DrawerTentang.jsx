'use client';

import { Info, Moon } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerTentang — informasi versi dan deskripsi aplikasi MyRamadhan.
 */
const DrawerTentang = ({ open, onClose }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Tentang Aplikasi'
    icon={Info}
    titleColor='text-purple-500 dark:text-purple-400'
  >
    <div className='text-center mb-6'>
      <div className='w-20 h-20 bg-gradient-to-tr from-[#1e3a8a] to-indigo-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl'>
        <Moon size={36} strokeWidth={1.5} />
      </div>
      <h3 className='font-bold text-2xl text-slate-800 dark:text-slate-100 tracking-tight'>
        MyRamadhan
      </h3>
      <p className='text-xs text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase mt-1'>
        Version 1.1.0 (PWA Ready)
      </p>
    </div>

    <p className='mb-3 text-[13px] leading-relaxed'>
      <strong>MyRamadhan</strong> adalah inisiatif independen yang dibangun
      untuk menjadi "Asisten Ibadah Personal" Anda. Aplikasi ini dirancang
      seringan mungkin, bebas dari iklan yang mengganggu, dan mengedepankan
      pendekatan <em>Privacy-First</em> (privasi utama).
    </p>
    <p className='text-[13px] leading-relaxed'>
      Semoga aplikasi ini dapat menjadi teman yang baik dalam meraih pahala
      maksimal selama bulan suci Ramadhan maupun di bulan-bulan lainnya.
    </p>
  </DrawerPanel>
);

export default DrawerTentang;
