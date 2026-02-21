import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

/**
 * Kotak hasil kalkulasi zakat.
 * Tampil biru gelap jika wajib zakat, abu-abu jika belum.
 *
 * @param {string} label - judul hasil
 * @param {string} value - nilai zakat yang ditampilkan
 * @param {boolean} isWajib - apakah sudah mencapai nisab
 * @param {string} note - keterangan tambahan di bawah nilai
 */
export default function ResultBox({ label, value, isWajib, note }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-5 rounded-2xl p-4 ${
        isWajib
          ? 'bg-[#1e3a8a] dark:bg-blue-800'
          : 'bg-slate-100 dark:bg-slate-800'
      }`}
    >
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
              isWajib
                ? 'text-blue-200 dark:text-blue-300'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {label}
          </p>
          <p
            className={`text-xl font-black tabular-nums ${
              isWajib ? 'text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {value}
          </p>
          {note && (
            <p
              className={`text-[11px] mt-1 ${
                isWajib
                  ? 'text-blue-200 dark:text-blue-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {note}
            </p>
          )}
        </div>
        {isWajib && (
          <CheckCircle2
            size={20}
            className='text-blue-300 dark:text-blue-400 shrink-0 mt-0.5'
          />
        )}
      </div>
    </motion.div>
  );
}
