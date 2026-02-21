'use client';

import { CheckSquare } from 'lucide-react';

/**
 * DailyGoalTracker — kartu ringkasan progres ibadah harian.
 * Klik akan membuka TrackerDrawer (jika sudah login) atau redirect ke login.
 */
const DailyGoalTracker = ({ taskProgress, onClick }) => {
  const progressPercent =
    taskProgress.total === 0
      ? 0
      : (taskProgress.completed / taskProgress.total) * 100;

  return (
    <div
      onClick={onClick}
      className='bg-white dark:bg-slate-900 rounded-[2rem] p-5 md:p-6 lg:p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer'
    >
      <div className='flex justify-between items-center mb-3'>
        <div className='bg-emerald-100 dark:bg-emerald-900/40 p-2 lg:p-2.5 rounded-xl w-fit text-emerald-600 dark:text-emerald-400'>
          <CheckSquare size={20} />
        </div>
        <span className='text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg'>
          Daily Goal
        </span>
      </div>

      <div className='flex justify-between items-end'>
        <div>
          <h3 className='font-bold text-lg md:text-xl lg:text-xl leading-tight text-slate-800 dark:text-slate-100'>
            Ibadah Harian
          </h3>
          <p className='text-xs md:text-sm lg:text-sm text-slate-500 dark:text-slate-400 mt-1'>
            Sudah {taskProgress.completed} dari {taskProgress.total} target!
          </p>
        </div>

        {/* Circular progress indicator */}
        <div className='w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 relative flex items-center justify-center'>
          <svg className='w-full h-full -rotate-90' viewBox='0 0 36 36'>
            <path
              className='text-slate-100 dark:text-slate-700'
              d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              fill='none'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='text-emerald-500 transition-all duration-1000 ease-out'
              strokeDasharray={`${progressPercent}, 100`}
              d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
              fill='none'
              stroke='currentColor'
              strokeWidth='4'
            />
          </svg>
          <span className='absolute text-[10px] lg:text-xs font-bold text-emerald-600 dark:text-emerald-400'>
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyGoalTracker;
