import { Calendar, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';

/**
 * Menampilkan riwayat siklus haid dalam bentuk list card.
 * Mendukung state: loading (skeleton), empty, dan data terisi.
 */
export default function HistoryList({
  logs,
  loading,
  getDuration,
  getQadhaDays,
  onDelete,
}) {
  return (
    <div className='mt-8'>
      <div className='flex items-center gap-2 mb-4 px-2'>
        <Calendar size={16} className='text-slate-400 dark:text-slate-500' />
        <h3 className='font-bold text-slate-600 dark:text-slate-300 text-sm uppercase tracking-wide'>
          Riwayat Siklus
        </h3>
      </div>

      <div className='space-y-3'>
        {loading ? (
          /* Skeleton loader */
          [1, 2].map((i) => (
            <div
              key={i}
              className='h-20 bg-white dark:bg-slate-800 rounded-2xl animate-pulse'
            />
          ))
        ) : logs.length === 0 ? (
          /* Empty state */
          <div className='text-center py-10 opacity-50 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-pink-200 dark:border-pink-800'>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Belum ada data riwayat.
            </p>
          </div>
        ) : (
          /* List riwayat */
          logs.map((log) => {
            const isOngoing = log.end_date === null;
            const duration = getDuration(log.start_date, log.end_date);
            const qadhaDays = getQadhaDays(log.start_date, log.end_date);

            return (
              <div
                key={log.id}
                className='bg-white dark:bg-slate-900 p-4 rounded-2xl border border-pink-50 dark:border-pink-900 shadow-sm flex justify-between items-center group relative overflow-hidden'
              >
                <div className='flex items-center gap-4'>
                  {/* Indikator status aktif/selesai */}
                  <div
                    className={`w-1.5 h-12 rounded-full ${
                      isOngoing
                        ? 'bg-pink-500 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                  <div>
                    <p className='text-[11px] text-slate-400 dark:text-slate-500 font-bold mb-0.5 uppercase tracking-wider'>
                      {dayjs(log.start_date).format('DD MMM')} —{' '}
                      {isOngoing
                        ? 'Sekarang'
                        : dayjs(log.end_date).format('DD MMM')}
                    </p>
                    <div className='flex items-center gap-3'>
                      <h4
                        className={`font-black text-lg ${
                          isOngoing
                            ? 'text-pink-600 dark:text-pink-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {duration} Hari
                      </h4>
                      {qadhaDays > 0 && (
                        <span className='bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-[9px] font-bold px-2 py-0.5 rounded-md'>
                          {qadhaDays} Qadha
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(log.id);
                  }}
                  className='p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors relative z-10'
                  aria-label='Hapus riwayat'
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
