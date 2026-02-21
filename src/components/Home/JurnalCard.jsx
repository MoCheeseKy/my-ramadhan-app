'use client';

import { ChevronRight, PenLine, Moon } from 'lucide-react';
import { useRouter } from 'next/router';

/**
 * JurnalCard — kartu shortcut menuju jurnal refleksi harian.
 * Memerlukan login; jika belum login, redirect ke halaman auth.
 */
const JurnalCard = ({ user }) => {
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      router.push('/auth/login');
    } else {
      router.push('/jurnal');
    }
  };

  return (
    <div
      onClick={handleClick}
      className='relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-7 lg:p-7 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer overflow-hidden h-full flex flex-col justify-center'
    >
      {/* Decorative moon */}
      <Moon
        size={120}
        className='absolute -bottom-8 -right-8 text-[#1e3a8a] dark:text-blue-700 opacity-10 pointer-events-none'
      />

      <div className='flex items-center gap-2 mb-3'>
        <PenLine size={20} className='text-[#1e3a8a] dark:text-blue-400' />
        <h3 className='font-bold text-lg text-slate-800 dark:text-slate-100'>
          Jurnal Refleksi
        </h3>
      </div>

      <p className='text-sm text-slate-500 dark:text-slate-400 relative z-10'>
        Bagaimana perasaanmu hari ini?
      </p>

      <div className='mt-4 md:mt-5 lg:mt-5 text-xs font-semibold text-[#1e3a8a] dark:text-blue-400 flex items-center gap-1 relative z-10'>
        Mulai menulis <ChevronRight size={14} />
      </div>
    </div>
  );
};

export default JurnalCard;
