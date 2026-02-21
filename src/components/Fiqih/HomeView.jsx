import { CATEGORIES } from './Contants/categories';
import { COLOR_MAP } from './Contants/colorMap';

/**
 * View halaman utama: hero banner + grid semua kategori fiqih.
 * Kategori yang belum memiliki data ditampilkan dengan state disabled.
 */
export default function HomeView({
  categoryCounts,
  totalItems,
  onSelectCategory,
}) {
  return (
    <div className='space-y-4 md:space-y-6'>
      {/* Hero banner */}
      <div className='bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 text-white relative overflow-hidden shadow-lg mb-2 md:mb-4'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]' />
        <div className='relative z-10'>
          <p className='text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-amber-100 mb-1 md:mb-2'>
            Ensiklopedi
          </p>
          <h2 className='text-2xl md:text-4xl font-black text-white leading-tight mb-2'>
            Fiqih Puasa Ramadhan
          </h2>
          <p className='text-amber-100 text-xs md:text-sm leading-relaxed'>
            {totalItems} materi dari{' '}
            {CATEGORIES.filter((c) => categoryCounts[c.key] > 0).length}{' '}
            kategori · Rujukan lengkap hukum puasa
          </p>
        </div>
      </div>

      {/* Grid kategori: 2 kolom mobile, 3 tablet, 4 desktop */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'>
        {CATEGORIES.map((cat) => {
          const c = COLOR_MAP[cat.color];
          const count = categoryCounts[cat.key];
          const isEmpty = count === 0;

          return (
            <button
              key={cat.key}
              onClick={() => !isEmpty && onSelectCategory(cat.key)}
              disabled={isEmpty}
              className={`text-left p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all h-full flex flex-col justify-between min-h-[140px] md:min-h-[160px] ${
                isEmpty
                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 opacity-40 cursor-not-allowed'
                  : `bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:${c.border} hover:shadow-md active:scale-95 cursor-pointer`
              }`}
            >
              <div>
                <div
                  className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl mb-3 md:mb-4 ${
                    isEmpty ? 'bg-slate-100 dark:bg-slate-700' : c.bg
                  }`}
                >
                  {cat.emoji}
                </div>
                <p className='font-bold text-slate-800 dark:text-slate-100 text-[13px] md:text-sm leading-tight mb-1 md:mb-2'>
                  {cat.label}
                </p>
                <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500 leading-snug line-clamp-2 mb-3'>
                  {cat.desc}
                </p>
              </div>
              <span
                className={`text-[10px] md:text-xs font-black px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg w-fit ${
                  isEmpty
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-600'
                    : c.badge
                }`}
              >
                {count > 0 ? `${count} materi` : 'Segera hadir'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
