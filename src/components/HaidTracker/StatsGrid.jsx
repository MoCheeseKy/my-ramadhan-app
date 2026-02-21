import { History, Clock } from 'lucide-react';

/**
 * Menampilkan 2 kartu statistik ringkasan:
 * total siklus tercatat dan total hari utang puasa (qadha).
 */
export default function StatsGrid({ totalCycles, totalMissedFasting }) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      <div className='bg-white dark:bg-slate-900 p-5 rounded-2xl border border-pink-100 dark:border-pink-900 flex flex-col items-center text-center shadow-sm'>
        <span className='w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 flex items-center justify-center mb-2'>
          <History size={20} />
        </span>
        <h3 className='text-2xl font-bold text-slate-700 dark:text-slate-200'>
          {totalCycles}
        </h3>
        <p className='text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase'>
          Total Siklus
        </p>
      </div>

      <div className='bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-100 dark:border-rose-900 flex flex-col items-center text-center shadow-sm'>
        <span className='w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 flex items-center justify-center mb-2'>
          <Clock size={20} />
        </span>
        <h3 className='text-2xl font-bold text-slate-700 dark:text-slate-200'>
          {totalMissedFasting}
        </h3>
        <p className='text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase'>
          Utang Puasa
        </p>
      </div>
    </div>
  );
}
