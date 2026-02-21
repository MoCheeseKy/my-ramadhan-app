'use client';

import { ChevronRight, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/router';

/**
 * DailyKnowledge — kartu materi harian berdasarkan hari Hijriah.
 * Navigasi ke halaman /study/:day.
 */
const DailyKnowledge = ({ hijriDay, dailyTopic }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/study/${hijriDay}`)}
      className='bg-white dark:bg-slate-900 rounded-[2rem] p-5 md:p-6 lg:p-6 group shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex items-center justify-between h-full'
    >
      <div>
        <div className='flex items-center gap-2 mb-2'>
          <span className='bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 p-1.5 rounded-lg'>
            <Lightbulb size={16} />
          </span>
          <span className='text-[10px] md:text-xs lg:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
            Daily Knowledge
          </span>
        </div>
        <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base lg:text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors'>
          {dailyTopic?.title}
        </h3>
      </div>

      <div className='bg-slate-50 dark:bg-slate-800 p-3 rounded-full group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30 transition-colors shrink-0'>
        <ChevronRight
          size={20}
          className='text-slate-400 dark:text-slate-500 group-hover:text-amber-500 dark:group-hover:text-amber-400'
        />
      </div>
    </div>
  );
};

export default DailyKnowledge;
