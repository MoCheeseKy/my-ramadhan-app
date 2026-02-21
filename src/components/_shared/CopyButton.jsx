import { Copy, Check } from 'lucide-react';

/**
 * Tombol copy dengan feedback visual saat berhasil disalin.
 * @param {string|number} id - ID item yang di-copy
 * @param {string|number} copiedId - ID item yang sedang dalam state "copied"
 * @param {function} onClick
 */
export default function CopyButton({ id, copiedId, onClick }) {
  const isCopied = copiedId === id;

  return (
    <button
      onClick={onClick}
      className='p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
    >
      {isCopied ? (
        <Check size={15} className='text-emerald-500' />
      ) : (
        <Copy size={15} />
      )}
    </button>
  );
}
