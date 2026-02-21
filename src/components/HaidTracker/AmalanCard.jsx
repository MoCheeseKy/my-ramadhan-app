import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { AMALAN_HAID } from './Constants';

/**
 * Menampilkan daftar amalan pengganti ibadah saat haid
 * dalam format horizontal scroll card.
 * Hanya ditampilkan ketika sedang dalam periode haid aktif.
 */
export default function AmalanCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='mb-6'
    >
      <div className='flex items-center gap-2 mb-3 px-2'>
        <Heart size={16} className='text-pink-500 dark:text-pink-400' />
        <h3 className='font-bold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide'>
          Amalan Pengganti
        </h3>
      </div>

      <div className='flex gap-3 overflow-x-auto pb-4 custom-scrollbar px-2'>
        {AMALAN_HAID.map((amalan) => (
          <div
            key={amalan.id}
            className='min-w-[140px] bg-white dark:bg-slate-900 border border-pink-100 dark:border-pink-900 rounded-2xl p-4 shadow-sm shrink-0'
          >
            <div className='w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center mb-3'>
              <amalan.icon
                size={16}
                className='text-pink-500 dark:text-pink-400'
              />
            </div>
            <h4 className='font-bold text-slate-700 dark:text-slate-200 text-xs mb-1'>
              {amalan.title}
            </h4>
            <p className='text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed'>
              {amalan.desc}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
