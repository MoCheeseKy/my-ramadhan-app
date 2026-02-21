import { AlertCircle, Sparkles } from 'lucide-react';

/**
 * Tampilan empty state saat pencarian tidak menemukan hasil.
 * Menawarkan redirect ke Ramatalk untuk pertanyaan yang lebih lanjut.
 */
export default function EmptyState({ query, router }) {
  return (
    <div className='text-center py-16 md:py-24 px-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl md:max-w-2xl md:mx-auto shadow-sm'>
      <div className='w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4'>
        <AlertCircle size={30} className='md:w-10 md:h-10' />
      </div>
      <h3 className='font-bold text-slate-700 dark:text-slate-300 mb-2 md:text-lg'>
        Materi tidak ditemukan
      </h3>
      <p className='text-sm md:text-base text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-4 md:px-12'>
        Pertanyaan fiqihmu belum ada di database. Tanyakan langsung ke Konsultan
        AI Ramatalk!
      </p>
      <button
        onClick={() =>
          router.push(`/ramatalk?mode=fiqih&q=${encodeURIComponent(query)}`)
        }
        className='px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold text-sm md:text-base shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto'
      >
        <Sparkles size={16} className='md:w-5 md:h-5' /> Tanya Fiqih ke Ramatalk
      </button>
    </div>
  );
}
