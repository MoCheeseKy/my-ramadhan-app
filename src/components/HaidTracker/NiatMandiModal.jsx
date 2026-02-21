import { motion, AnimatePresence } from 'framer-motion';
import { Droplets } from 'lucide-react';

/**
 * Modal informatif yang muncul otomatis setelah user menandai siklus haid selesai.
 * Menampilkan niat mandi wajib beserta teks Arab, latin, dan terjemahannya.
 */
export default function NiatMandiModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden'
          >
            {/* Decorative blob */}
            <div className='absolute top-0 right-0 w-32 h-32 bg-pink-50 dark:bg-pink-900/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />

            <div className='relative z-10'>
              <div className='w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Droplets
                  size={28}
                  className='text-pink-500 dark:text-pink-400'
                />
              </div>

              <h3 className='font-black text-xl text-slate-800 dark:text-slate-200 mb-2'>
                Alhamdulillah, Suci!
              </h3>
              <p className='text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed'>
                Jangan lupa untuk menyucikan diri. Berikut adalah niat mandi
                wajib setelah haid:
              </p>

              {/* Teks niat */}
              <div className='bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 mb-6 text-center'>
                <p
                  className='text-xl font-arabic text-slate-800 dark:text-slate-200 mb-3 leading-relaxed'
                  dir='rtl'
                >
                  نَوَيْتُ الْغُسْلَ لِرَفْعِ الْحَدَثِ اْلاَكْبَرِ مِنَ
                  الحَيْضِ فَرْضًا ِللهِ تَعَالَى
                </p>
                <p className='text-xs text-slate-500 dark:text-slate-400 font-medium italic mb-2'>
                  "Nawaitul ghusla liraf'il hadatsil akbari minal haidhi fardhan
                  lillahi ta'ala."
                </p>
                <p className='text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-3 pt-3 border-t border-slate-200 dark:border-slate-700'>
                  "Aku niat mandi wajib untuk mensucikan hadast besar dari haid
                  karena Allah Ta'ala."
                </p>
              </div>

              <button
                onClick={onClose}
                className='w-full bg-slate-800 dark:bg-slate-700 text-white font-bold py-3.5 rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors'
              >
                Insyaallah, Siap!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
