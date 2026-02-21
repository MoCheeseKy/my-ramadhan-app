'use client';

/**
 * ToolCard — reusable icon+label card untuk grid navigasi.
 * Digunakan di halaman Home dan potensially halaman lain.
 */
const ToolCard = ({
  icon: Icon,
  title,
  colorClass,
  bgClass,
  onClick,
  className,
}) => (
  <div
    onClick={onClick}
    className={`relative bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2rem] p-3 md:p-4 lg:p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] overflow-hidden cursor-pointer h-28 md:h-32 lg:h-32 ${className}`}
  >
    {/* Background decorative icon */}
    <Icon
      size={80}
      className={`absolute -bottom-6 -right-6 md:-bottom-5 md:-right-5 lg:-bottom-5 lg:-right-5 ${bgClass} opacity-50 z-1 pointer-events-none`}
    />
    {/* Foreground icon */}
    <Icon size={24} className={`${colorClass} md:w-7 md:h-7 lg:w-7 lg:h-7`} />
    <span className='text-[11px] md:text-xs lg:text-xs font-bold text-slate-700 dark:text-slate-200 z-2'>
      {title}
    </span>
  </div>
);

export default ToolCard;
