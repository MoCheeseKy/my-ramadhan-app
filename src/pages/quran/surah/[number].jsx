'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, EyeOff } from 'lucide-react';

import useUser from '@/hooks/useUser';
import useReaderSettings from '@/store/useReaderSettings';
import useQuranStorage from '@/hooks/useQuranStorage';
import useReaderActions from '@/store/useReaderActions';

import SurahHeader from '@/components/Quran/SurahHeader';
import SurahHeroBanner from '@/components/Quran/SurahHeroBanner';
import AyatCard from '@/components/Quran/AyatCard';
import AudioPlayer from '@/components/Quran/AudioPlayer';

export default function SurahReader() {
  const router = useRouter();
  const { number } = router.query;
  const { user } = useUser();

  // ─── Data ─────────────────────────────────────────────────────────────────
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [jumpNumber, setJumpNumber] = useState('');

  // ─── Hooks ────────────────────────────────────────────────────────────────
  const { settings, toggleSetting, setArabSize } = useReaderSettings(user);
  const storage = useQuranStorage(user);

  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);

  const {
    copiedId,
    audioInfo,
    showPlayer,
    handleBookmark,
    handleLastRead,
    handleCopy,
    handlePlayAudio,
    closePlayer,
  } = useReaderActions({
    user,
    bookmarks,
    setBookmarks,
    setLastRead,
    surahIdContext: number ? Number(number) : null,
    surahContext: surah,
    isJuzMode: false,
  });

  // ─── Fetch & load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!number) return;

    const fetchSurah = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${number}`);
        const json = await res.json();
        setSurah(json.data);
      } catch (err) {
        console.error('Gagal fetch surah:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      const data = await storage.loadQuranData();
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.lastRead) setLastRead(data.lastRead);
    };

    fetchSurah();
    loadData();
  }, [number, user]);

  // Auto-scroll ke anchor hash setelah data selesai dimuat
  useEffect(() => {
    if (!loading && surah && window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loading, surah]);

  // ─── Jump to ayat ──────────────────────────────────────────────────────────
  const handleJumpToNumber = (e) => {
    e.preventDefault();
    const num = parseInt(jumpNumber, 10);
    if (!num || isNaN(num) || num < 1 || num > surah?.jumlahAyat) {
      alert(`Masukkan nomor ayat yang valid antara 1 - ${surah?.jumlahAyat}`);
      return;
    }
    const el = document.getElementById(`ayat-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#1e3a8a]');
      setTimeout(() => el.classList.remove('ring-4', 'ring-[#1e3a8a]'), 2000);
    }
    setJumpNumber('');
  };

  // ─── Audio navigation ──────────────────────────────────────────────────────
  const handleAudioNext = () => {
    if (!surah || !audioInfo) return;
    const idx = surah.ayat.findIndex(
      (a) => a.nomorAyat === audioInfo.ayat.nomorAyat,
    );
    if (idx < surah.ayat.length - 1) {
      handlePlayAudio(surah.ayat[idx + 1]);
    }
  };

  const handleAudioPrev = () => {
    if (!surah || !audioInfo) return;
    const idx = surah.ayat.findIndex(
      (a) => a.nomorAyat === audioInfo.ayat.nomorAyat,
    );
    if (idx > 0) handlePlayAudio(surah.ayat[idx - 1]);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-blue-200 dark:selection:bg-blue-800 transition-colors duration-300'
      style={{ paddingBottom: showPlayer ? '160px' : '100px' }}
    >
      <Head>
        <title>{surah?.namaLatin || 'Membaca'} - MyRamadhan</title>
      </Head>

      {/* Header sticky */}
      <SurahHeader
        surah={surah}
        loading={loading}
        hafalanMode={hafalanMode}
        onToggleHafalan={() => setHafalanMode((v) => !v)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((v) => !v)}
        settings={settings}
        onSettingChange={toggleSetting}
        onSizeChange={setArabSize}
        jumpNumber={jumpNumber}
        setJumpNumber={setJumpNumber}
        onJumpSubmit={handleJumpToNumber}
      />

      <main className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-5 md:py-8 space-y-4 md:space-y-6 pt-6'>
        {/* Hero banner surah */}
        {!loading && <SurahHeroBanner surah={surah} />}

        {/* Banner mode hafalan */}
        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 flex items-center gap-3'>
            <EyeOff
              size={20}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-300 text-xs md:text-sm font-bold'>
              Mode Hafalan aktif — klik "Intip Ayat" untuk melihat tiap ayat
            </p>
          </div>
        )}

        {/* Skeleton loading */}
        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-48 md:h-56 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl'
            />
          ))}

        {/* List ayat */}
        {!loading &&
          surah?.ayat?.map((ayat) => (
            <AyatCard
              key={ayat.nomorAyat}
              ayat={ayat}
              surahName={surah.namaLatin}
              surahId={Number(number)}
              settings={settings}
              hafalanMode={hafalanMode}
              isBookmarked={bookmarks.some(
                (b) =>
                  b.surahId === Number(number) &&
                  b.ayahNumber === ayat.nomorAyat,
              )}
              isLastRead={
                lastRead?.surahId === Number(number) &&
                lastRead?.ayahNumber === ayat.nomorAyat
              }
              isPlaying={
                audioInfo?.ayat.nomorAyat === ayat.nomorAyat && showPlayer
              }
              isJuzMode={false}
              copiedId={copiedId}
              onBookmark={(a) => handleBookmark(a)}
              onLastRead={(a) => handleLastRead(a)}
              onCopy={(a, name) => handleCopy(a, name)}
              onPlayAudio={(a) => handlePlayAudio(a)}
            />
          ))}

        {/* Navigasi surah sebelum/sesudah */}
        {!loading && surah && (
          <div className='flex gap-3 md:gap-5 pt-6 md:pt-8'>
            {surah.suratSebelumnya && (
              <button
                onClick={() =>
                  router.push(`/quran/surah/${surah.suratSebelumnya.nomor}`)
                }
                className='flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm md:text-base font-bold text-slate-600 dark:text-slate-400 hover:border-[#1e3a8a] dark:hover:border-blue-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2'
              >
                <ArrowLeft size={18} />
                <span className='truncate'>
                  {surah.suratSebelumnya.namaLatin}
                </span>
              </button>
            )}
            {surah.suratSelanjutnya && (
              <button
                onClick={() =>
                  router.push(`/quran/surah/${surah.suratSelanjutnya.nomor}`)
                }
                className='flex-1 py-4 rounded-2xl bg-[#1e3a8a] dark:bg-blue-600 text-white text-sm md:text-base font-bold hover:bg-[#162d6e] dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2'
              >
                <span className='truncate'>
                  {surah.suratSelanjutnya.namaLatin}
                </span>
                <ArrowLeft size={18} className='rotate-180' />
              </button>
            )}
          </div>
        )}
      </main>

      {/* Audio player */}
      {showPlayer && audioInfo && (
        <AudioPlayer
          currentAyat={audioInfo.ayat}
          label={`${surah?.namaLatin} — Ayat ${audioInfo.ayat.nomorAyat}`}
          onPrev={handleAudioPrev}
          onNext={handleAudioNext}
          onClose={closePlayer}
        />
      )}
    </div>
  );
}
