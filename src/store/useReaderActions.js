import { useState } from 'react';
import useQuranStorage from '@/hooks/useQuranStorage';

/**
 * useReaderActions — mengelola semua aksi interaksi user di halaman reader:
 * toggle bookmark, tandai terakhir dibaca, salin teks, dan kontrol audio player.
 *
 * @param {object|null} user      - User dari useUser()
 * @param {Array}       bookmarks - State bookmarks dari halaman
 * @param {Function}    setBookmarks
 * @param {Function}    setLastRead
 * @param {number|null} surahIdContext - Nomor surah aktif (dipakai di mode surah tunggal)
 * @param {object|null} surahContext   - Data surah lengkap (untuk namaLatin)
 * @param {boolean}     isJuzMode      - Jika true, pakai prefix surahId pada copiedId
 *
 * @returns {object} - handlers + state { copiedId, audioInfo, showPlayer }
 */
const useReaderActions = ({
  user,
  bookmarks,
  setBookmarks,
  setLastRead,
  surahIdContext = null,
  surahContext = null,
  isJuzMode = false,
}) => {
  const { saveBookmarks, saveLastRead } = useQuranStorage(user);

  const [copiedId, setCopiedId] = useState(null);
  const [audioInfo, setAudioInfo] = useState(null); // { ayat, surahId, surahName }
  const [showPlayer, setShowPlayer] = useState(false);

  // ─── Bookmark ────────────────────────────────────────────────────────────────

  const handleBookmark = async (ayat, surahId, surahName) => {
    const sid = surahId ?? surahIdContext;
    const name = surahName ?? surahContext?.namaLatin;

    const isMarked = bookmarks.some(
      (b) => b.surahId === sid && b.ayahNumber === ayat.nomorAyat,
    );

    const newBookmarks = isMarked
      ? bookmarks.filter(
          (b) => !(b.surahId === sid && b.ayahNumber === ayat.nomorAyat),
        )
      : [
          ...bookmarks,
          {
            surahId: sid,
            surahName: name,
            ayahNumber: ayat.nomorAyat,
            arab: ayat.teksArab,
            translation: ayat.teksIndonesia,
          },
        ];

    setBookmarks(newBookmarks);
    await saveBookmarks(newBookmarks);
  };

  // ─── Terakhir Dibaca ─────────────────────────────────────────────────────────

  const handleLastRead = async (ayat, surahId, surahName, juzInfo = null) => {
    const sid = surahId ?? surahIdContext;
    const name = surahName ?? surahContext?.namaLatin;

    const data = {
      surahId: sid,
      surahName: name,
      ayahNumber: ayat.nomorAyat,
      isJuz: !!juzInfo,
      ...(juzInfo ?? {}),
    };

    setLastRead(data);
    await saveLastRead(data);
  };

  // ─── Salin Teks ──────────────────────────────────────────────────────────────

  const handleCopy = (ayat, surahName, surahId) => {
    const name = surahName ?? surahContext?.namaLatin;
    const copyKey = isJuzMode ? `${surahId}-${ayat.nomorAyat}` : ayat.nomorAyat;

    const text = `${name} Ayat ${ayat.nomorAyat}\n\n${ayat.teksArab}\n\n${ayat.teksLatin}\n\n"${ayat.teksIndonesia}"\n\n(Sumber: MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(copyKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Audio ───────────────────────────────────────────────────────────────────

  const handlePlayAudio = (ayat, surahId, surahName) => {
    const sid = surahId ?? surahIdContext;
    const name = surahName ?? surahContext?.namaLatin;

    const isSame =
      audioInfo?.ayat.nomorAyat === ayat.nomorAyat &&
      audioInfo?.surahId === sid;

    if (isSame && showPlayer) {
      setShowPlayer(false);
      setAudioInfo(null);
    } else {
      setAudioInfo({ ayat, surahId: sid, surahName: name });
      setShowPlayer(true);
    }
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setAudioInfo(null);
  };

  return {
    // State
    copiedId,
    audioInfo,
    showPlayer,
    // Handlers
    handleBookmark,
    handleLastRead,
    handleCopy,
    handlePlayAudio,
    closePlayer,
  };
};

export default useReaderActions;
