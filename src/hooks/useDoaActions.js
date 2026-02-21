import { useState } from 'react';
import useDoaStorage from '@/hooks/useDoaStorage';

/**
 * useDoaActions — mengelola semua aksi interaksi di halaman Doa:
 * toggle bookmark, tambah/hapus custom doa, salin teks, dan filter.
 *
 * @param {object|null} user
 * @param {Array}       bookmarks
 * @param {Function}    setBookmarks
 * @param {Array}       customDoas
 * @param {Function}    setCustomDoas
 * @param {Function}    setActiveDoasList - Untuk update list saat custom doa berubah
 * @param {boolean}     isCustomCategory  - Apakah kategori aktif adalah "Doa Pribadi"
 *
 * @returns {object}
 */
const useDoaActions = ({
  user,
  bookmarks,
  setBookmarks,
  customDoas,
  setCustomDoas,
  setActiveDoasList,
  isCustomCategory,
}) => {
  const { saveBookmarks, saveCustomDoas } = useDoaStorage(user);

  const [copiedId, setCopiedId] = useState(null);

  // ─── Bookmark ────────────────────────────────────────────────────────────────

  const toggleBookmark = async (
    doa,
    categoryTitle,
    categoryId,
    subTabId = null,
  ) => {
    const isMarked = bookmarks.some((b) => b.id === doa.id);
    const newBookmarks = isMarked
      ? bookmarks.filter((b) => b.id !== doa.id)
      : [...bookmarks, { ...doa, categoryId, categoryTitle, subTabId }];

    setBookmarks(newBookmarks);
    await saveBookmarks(newBookmarks);
  };

  // ─── Custom doa: tambah ──────────────────────────────────────────────────────

  const addCustomDoa = async (newDoaData, onSuccess) => {
    if (!newDoaData.title?.trim()) {
      alert('Judul Doa wajib diisi!');
      return;
    }
    const doaToAdd = { id: `custom-${Date.now()}`, ...newDoaData };
    const updated = [...customDoas, doaToAdd];
    setCustomDoas(updated);
    if (isCustomCategory) setActiveDoasList(updated);
    await saveCustomDoas(updated);
    onSuccess?.();
  };

  // ─── Custom doa: hapus ───────────────────────────────────────────────────────

  const deleteCustomDoa = async (id) => {
    const updated = customDoas.filter((d) => d.id !== id);
    setCustomDoas(updated);
    setActiveDoasList(updated);
    await saveCustomDoas(updated);
  };

  // ─── Salin teks ──────────────────────────────────────────────────────────────

  const handleCopy = (doa) => {
    const text = [
      doa.title,
      '',
      doa.arab || '',
      '',
      doa.latin || '',
      '',
      doa.arti ? `"${doa.arti}"` : '',
      '',
      '(Sumber: Aplikasi MyRamadhan)',
    ]
      .join('\n')
      .trim();
    navigator.clipboard.writeText(text);
    setCopiedId(doa.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return {
    copiedId,
    toggleBookmark,
    addCustomDoa,
    deleteCustomDoa,
    handleCopy,
  };
};

export default useDoaActions;
