import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

/**
 * Menampilkan prediksi fase siklus tubuh saat ini
 * dengan progress bar animasi dan deskripsi fase.
 *
 * @param {object} currentPhase - hasil dari useCyclePhase()
 */
export default function CyclePhaseCard({ currentPhase }) {
  if (!currentPhase) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-pink-900 shadow-sm'
    >
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-2'>
          <Activity size={18} className='text-pink-500 dark:text-pink-400' />
          <h3 className='font-bold text-slate-700 dark:text-slate-200'>
            Prediksi Fase Tubuh
          </h3>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentPhase.bg} ${currentPhase.color}`}
        >
          Hari ke-{currentPhase.day}
        </div>
      </div>

      {/* Nama fase & progress bar */}
      <div className='mb-4'>
        <div className='flex justify-between items-end mb-2'>
          <span className={`font-black text-lg ${currentPhase.color}`}>
            {currentPhase.phase}
          </span>
        </div>

        <div className='h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentPhase.progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${currentPhase.bar} rounded-full relative`}
          >
            <div className='absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse' />
          </motion.div>
        </div>

        <div className='flex justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 px-1 uppercase tracking-widest'>
          <span>Haid</span>
          <span>Folikuler</span>
          <span>Ovulasi</span>
          <span>Luteal</span>
        </div>
      </div>

      {/* Deskripsi fase */}
      <p className='text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700'>
        💡 {currentPhase.desc}
      </p>
    </motion.div>
  );
}
