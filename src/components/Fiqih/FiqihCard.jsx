import { BookOpen } from 'lucide-react';
import { COLOR_MAP } from './Contants/colorMap';

/**
 * Card item untuk satu materi fiqih.
 * Menampilkan judul, konten, dan badge sumber referensi.
 *
 * @param {object} item - data materi fiqih
 * @param {string} color - key warna dari COLOR_MAP
 */
export default function FiqihCard({ item, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.amber;

  return (
    <div className='bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group p-5 h-full flex flex-col'>
      <div className='flex items-start justify-between gap-3 mb-2'>
        <h3
          className={`font-bold text-slate-800 dark:text-slate-100 text-[15px] md:text-base leading-snug group-hover:${c.text} transition-colors flex-1`}
        >
          {item.title}
        </h3>
        <div className={`shrink-0 p-1.5 md:p-2 rounded-xl ${c.bg}`}>
          <BookOpen size={15} className={`${c.text} md:w-5 md:h-5`} />
        </div>
      </div>

      <p className='text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3 flex-1'>
        {item.content}
      </p>

      <div className='flex items-center gap-2 flex-wrap'>
        <span className='text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
          Sumber
        </span>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${c.badge}`}
        >
          {item.source}
        </span>
      </div>
    </div>
  );
}
