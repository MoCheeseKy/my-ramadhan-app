import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * Bottom sheet modal untuk memilih tanggal mulai atau selesai siklus haid.
 * Digunakan untuk dua aksi: 'start' dan 'end'.
 *
 * @param {boolean} isOpen
 * @param {'start'|'end'} actionType
 * @param {string} inputDate - format YYYY-MM-DD
 * @param {function} setInputDate
 * @param {function} onSave
 * @param {function} onClose
 */
export default function DateInputModal({
  isOpen,
  actionType,
  inputDate,
  setInputDate,
  onSave,
  onClose,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-50'
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className='fixed bottom-0 left-0 right-0 max-w-md md:max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-t-[2rem] p-6 z-50 shadow-2xl'
          >
            <div className='flex justify-between items-center mb-6'>
              <div>
                <h3 className='font-bold text-lg text-slate-800 dark:text-slate-200'>
                  {actionType === 'start'
                    ? 'Mulai Siklus Haid'
                    : 'Selesai Siklus Haid'}
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Pilih tanggal yang sesuai
                </p>
              </div>
              <button
                onClick={onClose}
                className='p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400'
              >
                <X size={16} />
              </button>
            </div>

            <input
              type='date'
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              max={dayjs().format('YYYY-MM-DD')}
              className='w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-lg rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-900 transition-all mb-6'
            />

            <button
              onClick={onSave}
              className='w-full bg-pink-500 text-white font-bold py-4 rounded-xl hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 dark:shadow-pink-900'
            >
              Simpan Tanggal
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
