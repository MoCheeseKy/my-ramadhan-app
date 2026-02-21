import { Bookmark, BookmarkCheck } from 'lucide-react';

/**
 * Tombol bookmark reusable dengan dua state: tersimpan / belum.
 * @param {boolean} isBookmarked
 * @param {function} onClick
 * @param {'sm'|'md'} size - ukuran ikon
 */
export default function BookmarkButton({ isBookmarked, onClick, size = 'md' }) {
  const iconSize = size === 'sm' ? 14 : 15;

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-colors ${
        isBookmarked
          ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
          : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
    >
      {isBookmarked ? (
        <BookmarkCheck size={iconSize} />
      ) : (
        <Bookmark size={iconSize} />
      )}
    </button>
  );
}
