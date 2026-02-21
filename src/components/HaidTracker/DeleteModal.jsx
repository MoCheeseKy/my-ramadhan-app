import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

/**
 * Modal konfirmasi sebelum menghapus riwayat siklus haid.
 * Muncul di tengah layar dengan backdrop blur.
 */
export default function DeleteModal({ isOpen, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className='fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-50'
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
            animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
            exit={{ scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
            className='fixed top-1/2 left-1/2 w-[90%] max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 z-50 shadow-2xl text-center'
          >
            <div className='w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400'>
              <Trash2 size={28} />
            </div>
            <h3 className='font-bold text-lg text-slate-800 dark:text-slate-200 mb-2'>
              Hapus Riwayat?
            </h3>
            <p className='text-sm text-slate-500 dark:text-slate-400 mb-6'>
              Data siklus haid ini akan dihapus secara permanen dan tidak dapat
              dikembalikan.
            </p>

            <div className='flex gap-3'>
              <button
                onClick={onCancel}
                className='flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
              >
                Batal
              </button>
              <button
                onClick={onConfirm}
                className='flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200 dark:shadow-red-900'
              >
                Ya, Hapus
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
