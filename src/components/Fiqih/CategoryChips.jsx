import { CATEGORIES } from './Contants/categories';
import { COLOR_MAP } from './Contants/colorMap';

/**
 * Strip horizontal chip kategori yang muncul saat bukan di home view.
 * Memudahkan navigasi antar kategori tanpa kembali ke home.
 */
export default function CategoryChips({
  activeCategory,
  isSearchMode,
  categoryCounts,
  onSelectCategory,
  onClearCategory,
}) {
  return (
    <div className='flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1'>
      <button
        onClick={onClearCategory}
        className='shrink-0 text-[11px] md:text-xs font-bold px-3 py-1.5 md:py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
      >
        Semua Kategori
      </button>

      {CATEGORIES.filter((c) => categoryCounts[c.key] > 0).map((cat) => {
        const c = COLOR_MAP[cat.color];
        const isActive = activeCategory === cat.key && !isSearchMode;

        return (
          <button
            key={cat.key}
            onClick={() => onSelectCategory(cat.key)}
            className={`shrink-0 text-[11px] md:text-xs font-bold px-3 py-1.5 md:py-2 rounded-xl border transition-colors ${
              isActive
                ? `${c.bg} ${c.text} ${c.border}`
                : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        );
      })}
    </div>
  );
}
