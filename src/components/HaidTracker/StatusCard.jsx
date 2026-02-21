import { CheckCircle, Plus } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * Card status utama: menampilkan status SEDANG HAID atau SUCI
 * beserta tombol aksi mulai/selesai siklus.
 */
export default function StatusCard({
  activePeriod,
  getDuration,
  onStartPeriod,
  onEndPeriod,
}) {
  const isActive = activePeriod !== null;

  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] p-8 text-center shadow-xl transition-all duration-500 ${
        isActive
          ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-200 dark:shadow-pink-900'
          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-pink-100 dark:border-pink-900'
      }`}
    >
      {/* Decorative blur blob */}
      <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />

      <div className='relative z-10'>
        <p
          className={`text-xs font-bold uppercase tracking-widest mb-2 ${
            isActive ? 'text-pink-200' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          Status Saat Ini
        </p>

        <h2 className='text-4xl font-black mb-2'>
          {isActive ? 'SEDANG HAID' : 'SUCI'}
        </h2>

        {isActive ? (
          <div className='animate-fadeUp'>
            <p className='text-pink-100 mb-6'>
              Hari ke-{' '}
              <span className='text-2xl font-bold text-white'>
                {getDuration(activePeriod.start_date)}
              </span>
            </p>
            <button
              onClick={onEndPeriod}
              className='bg-white text-pink-600 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto'
            >
              <CheckCircle size={18} /> Tandai Selesai
            </button>
            <p className='text-[10px] text-pink-200 mt-4 opacity-80'>
              Dimulai: {dayjs(activePeriod.start_date).format('DD MMMM YYYY')}
            </p>
          </div>
        ) : (
          <div className='animate-fadeUp'>
            <p className='text-slate-400 dark:text-slate-500 mb-6 text-sm'>
              Semoga harimu menyenangkan!
            </p>
            <button
              onClick={onStartPeriod}
              className='bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-300 dark:shadow-pink-900 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto'
            >
              <Plus size={18} /> Mulai Haid Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
