import FiqihCard from './FiqihCard';
import EmptyState from './EmptyState';
import { COLOR_MAP } from './Contants/colorMap';

/**
 * View hasil pencarian global lintas kategori.
 * Setiap card dilengkapi label kategori asal sebagai konteks.
 */
export default function SearchView({ displayItems, searchQuery, router }) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between mb-2 md:mb-4'>
        <p className='text-xs md:text-sm text-slate-500 dark:text-slate-400'>
          <span className='font-bold text-slate-700 dark:text-slate-300'>
            {displayItems.length}
          </span>{' '}
          hasil untuk &quot;{searchQuery}&quot;
        </p>
      </div>

      {displayItems.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5'>
          {displayItems.map((item) => (
            <div
              key={`${item._catKey}-${item.id}`}
              className='relative h-full flex flex-col'
            >
              {/* Label kategori asal */}
              <div className='flex items-center gap-1.5 mb-1.5 ml-1 shrink-0'>
                <span
                  className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${COLOR_MAP[item._catColor]?.badge}`}
                >
                  {item._catEmoji} {item._catLabel}
                </span>
              </div>
              <div className='flex-1'>
                <FiqihCard item={item} color={item._catColor} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState query={searchQuery} router={router} />
      )}
    </div>
  );
}
