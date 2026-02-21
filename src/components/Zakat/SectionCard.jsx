import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Card container dengan perilaku accordion di mobile dan selalu terbuka di desktop.
 *
 * @param {string} id - identifier unik section
 * @param {string|null} activeId - section yang sedang aktif (mobile)
 * @param {function} onToggle - toggle accordion (mobile only)
 * @param {string} icon - emoji icon
 * @param {string} title
 * @param {string} subtitle
 * @param {string} accentClass - Tailwind class warna aksen (chevron aktif)
 * @param {string} bgClass - Tailwind class background icon
 * @param {boolean} isDesktop - jika true, selalu terbuka & nonaktifkan accordion
 */
export default function SectionCard({
  id,
  activeId,
  onToggle,
  icon,
  title,
  subtitle,
  accentClass,
  bgClass,
  children,
  isDesktop,
}) {
  const isOpen = isDesktop || activeId === id;

  return (
    <motion.div
      layout={!isDesktop}
      className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-slate-900 overflow-hidden transition-colors duration-300 h-fit'
    >
      <button
        onClick={() => !isDesktop && onToggle(id)}
        className={`w-full flex items-center gap-4 p-5 text-left ${
          isDesktop ? 'cursor-default' : 'cursor-pointer'
        }`}
      >
        <div
          className={`w-11 h-11 rounded-2xl ${bgClass} dark:bg-opacity-20 flex items-center justify-center shrink-0 text-xl`}
        >
          {icon}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
            {title}
          </p>
          <p className='text-[11px] text-slate-400 dark:text-slate-500 mt-0.5'>
            {subtitle}
          </p>
        </div>

        {/* Chevron hanya tampil di mobile */}
        {!isDesktop && (
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
              isOpen
                ? accentClass + ' bg-opacity-10 dark:bg-opacity-20'
                : 'bg-slate-50 dark:bg-slate-800'
            }`}
          >
            {isOpen ? (
              <ChevronUp size={14} className={accentClass} />
            ) : (
              <ChevronDown
                size={14}
                className='text-slate-400 dark:text-slate-500'
              />
            )}
          </div>
        )}
      </button>

      {/* Desktop: render langsung tanpa animasi */}
      {isDesktop ? (
        <div className='px-5 pb-6 pt-1 border-t border-slate-50 dark:border-slate-800'>
          {children}
        </div>
      ) : (
        /* Mobile: accordion dengan animasi tinggi */
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className='px-5 pb-6 pt-1 border-t border-slate-50 dark:border-slate-800'>
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
