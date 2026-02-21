import { Info } from 'lucide-react';

/**
 * Chip informasi tambahan berwarna amber.
 * Digunakan untuk menampilkan catatan/dasar hukum di tiap section zakat.
 */
export default function InfoChip({ text }) {
  return (
    <div className='flex items-start gap-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-2xl p-3 mt-4'>
      <Info
        size={13}
        className='text-amber-500 dark:text-amber-400 shrink-0 mt-0.5'
      />
      <p className='text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed'>
        {text}
      </p>
    </div>
  );
}
