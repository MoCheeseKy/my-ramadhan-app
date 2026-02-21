import { useState } from 'react';
import {
  HADITS_API_BASE,
  HADITS_PER_PAGE,
} from '@/components/Hadits/Constants';
import useHaditsStorage from '@/hooks/useHaditsStorage';

/**
 * useHaditsReader — mengelola semua state dan logika halaman reader Hadits:
 * - Fetch list hadits per halaman
 * - Pagination
 * - Loncat ke nomor hadits
 * - Toggle bookmark
 * - Tandai terakhir dibaca
 * - Salin teks
 * - State revealedIds untuk mode hafalan
 *
 * @param {object|null} user
 * @param {Array}       bookmarks
 * @param {Function}    setBookmarks
 * @param {object|null} lastRead
 * @param {Function}    setLastRead
 *
 * @returns {object}
 */
const useHaditsReader = ({
  user,
  bookmarks,
  setBookmarks,
  lastRead,
  setLastRead,
}) => {
  const { saveBookmarks, saveLastRead } = useHaditsStorage(user);

  const [selectedBook, setSelectedBook] = useState(null);
  const [hadiths, setHadiths] = useState([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [jumpNumber, setJumpNumber] = useState('');

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchHadithsList = async (bookId, targetPage) => {
    setLoadingHadiths(true);
    try {
      const start = (targetPage - 1) * HADITS_PER_PAGE + 1;
      const end = targetPage * HADITS_PER_PAGE;
      const res = await fetch(
        `${HADITS_API_BASE}/books/${bookId}?range=${start}-${end}`,
      );
      const json = await res.json();
      setHadiths(json.data.hadiths || []);
    } catch (err) {
      console.error('Gagal fetch hadiths:', err);
      setHadiths([]);
    } finally {
      setLoadingHadiths(false);
    }
  };

  // ─── Buka kitab ───────────────────────────────────────────────────────────

  const openBook = (book, startPage = 1) => {
    setSelectedBook(book);
    setPage(startPage);
    setRevealedIds(new Set());
    setJumpNumber('');
    fetchHadithsList(book.id, startPage);
  };

  // ─── Pagination ───────────────────────────────────────────────────────────

  const changePage = (direction) => {
    if (!selectedBook) return;
    const totalPages = Math.ceil(selectedBook.available / HADITS_PER_PAGE);
    const newPage = page + direction;
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);
    setRevealedIds(new Set());
    fetchHadithsList(selectedBook.id, newPage).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // ─── Loncat ke nomor hadits ───────────────────────────────────────────────

  const handleJumpToNumber = (e) => {
    e.preventDefault();
    const num = parseInt(jumpNumber, 10);
    if (!num || isNaN(num) || num < 1 || num > selectedBook.available) {
      alert(
        `Masukkan nomor hadits yang valid antara 1 - ${selectedBook.available}`,
      );
      return;
    }
    const targetPage = Math.ceil(num / HADITS_PER_PAGE);
    setPage(targetPage);
    setRevealedIds(new Set());

    fetchHadithsList(selectedBook.id, targetPage).then(() => {
      setTimeout(() => {
        const el = document.getElementById(`hadith-${num}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-emerald-400');
          setTimeout(
            () => el.classList.remove('ring-4', 'ring-emerald-400'),
            2000,
          );
        }
      }, 500);
    });
    setJumpNumber('');
  };

  // ─── Bookmark ─────────────────────────────────────────────────────────────

  const toggleBookmark = async (hadith) => {
    const isMarked = bookmarks.some(
      (b) => b.bookId === selectedBook.id && b.number === hadith.number,
    );
    const newBookmarks = isMarked
      ? bookmarks.filter(
          (b) => !(b.bookId === selectedBook.id && b.number === hadith.number),
        )
      : [
          ...bookmarks,
          { ...hadith, bookId: selectedBook.id, bookName: selectedBook.name },
        ];
    setBookmarks(newBookmarks);
    await saveBookmarks(newBookmarks);
  };

  const removeBookmark = async (bookId, number) => {
    const newBookmarks = bookmarks.filter(
      (b) => !(b.bookId === bookId && b.number === number),
    );
    setBookmarks(newBookmarks);
    await saveBookmarks(newBookmarks);
  };

  // ─── Terakhir dibaca ──────────────────────────────────────────────────────

  const markLastRead = async (hadith) => {
    const data = {
      bookId: selectedBook.id,
      bookName: selectedBook.name,
      number: hadith.number,
      page,
    };
    setLastRead(data);
    await saveLastRead(data);
  };

  // ─── Salin teks ───────────────────────────────────────────────────────────

  const handleCopy = (hadith) => {
    const text = `*${selectedBook.name} No. ${hadith.number}*\n\n${hadith.arab}\n\n"${hadith.id}"\n\n(Sumber: Aplikasi MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.number);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Hafalan: toggle reveal per hadits ───────────────────────────────────

  const toggleReveal = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return {
    // State
    selectedBook,
    hadiths,
    loadingHadiths,
    page,
    copiedId,
    revealedIds,
    jumpNumber,
    setJumpNumber,
    // Actions
    openBook,
    changePage,
    handleJumpToNumber,
    toggleBookmark,
    removeBookmark,
    markLastRead,
    handleCopy,
    toggleReveal,
  };
};

export default useHaditsReader;
