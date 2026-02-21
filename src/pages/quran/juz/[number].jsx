'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, EyeOff } from 'lucide-react';

import useUser from '@/hooks/useUser';
import useReaderSettings from '@/store/useReaderSettings';
import useQuranStorage from '@/hooks/useQuranStorage';
import useReaderActions from '@/store/useReaderActions';
import { JUZ_MAPPING } from '@/data/juzMapping';

import JuzHeader from '@/components/Quran/JuzHeader';
import JuzHeroBanner from '@/components/Quran/JuzHeroBanner';
import SurahSeparator from '@/components/Quran/SurahSeparator';
import AyatCard from '@/components/Quran/AyatCard';
import AudioPlayer from '@/components/Quran/AudioPlayer';

export default function JuzReader() {
  const router = useRouter();
  const { number } = router.query;
  const { user } = useUser();

  // ─── Data ─────────────────────────────────────────────────────────────────
  const [juzSurahs, setJuzSurahs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [jumpSurah, setJumpSurah] = useState('');
  const [jumpAyat, setJumpAyat] = useState('');

  // ─── Hooks ────────────────────────────────────────────────────────────────
  const { settings, toggleSetting, setArabSize } = useReaderSettings(user);
  const storage = useQuranStorage(user);

  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);

  // Flatten semua ayat untuk navigasi audio lintas surah
  const allAyatFlat = juzSurahs.flatMap((s) =>
    s.ayat.map((a) => ({ ...a, surahId: s.surahId, surahName: s.namaLatin })),
  );

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
    isJuzMode: true,
  });

  // ─── Fetch juz ─────────────────────────────────────────────────────────────
  const fetchJuz = async (juzNum) => {
    setLoading(true);
    setJuzSurahs([]);

    const segments = JUZ_MAPPING[juzNum];
    if (!segments) {
      setLoading(false);
      return;
    }

    const surahIds = [...new Set(segments.map((s) => s.surahId))];
    try {
      const surahDataMap = {};
      await Promise.all(
        surahIds.map(async (id) => {
          const res = await fetch(`https://equran.id/api/v2/surat/${id}`);
          const json = await res.json();
          surahDataMap[id] = json.data;
        }),
      );

      const result = segments
        .map(({ surahId, from, to }) => {
          const data = surahDataMap[surahId];
          if (!data) return null;
          const filtered = data.ayat.filter(
            (a) => a.nomorAyat >= from && (to === null || a.nomorAyat <= to),
          );
          return {
            surahId,
            namaLatin: data.namaLatin,
            nama: data.nama,
            ayat: filtered,
          };
        })
        .filter(Boolean);

      setJuzSurahs(result);
    } catch (err) {
      console.error('Gagal fetch juz:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!number) return;

    const loadData = async () => {
      const data = await storage.loadQuranData();
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.lastRead) setLastRead(data.lastRead);
    };

    fetchJuz(Number(number));
    loadData();
  }, [number, user]);

  // Auto-scroll ke anchor hash setelah semua ayat dimuat
  useEffect(() => {
    if (juzSurahs.length > 0 && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(hashId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [juzSurahs]);

  // ─── Jump to ayat ──────────────────────────────────────────────────────────
  const handleJump = (e) => {
    e.preventDefault();
    if (!jumpSurah || !jumpAyat) {
      alert('Pilih Surah dan masukkan nomor Ayat.');
      return;
    }
    const el = document.getElementById(`ayat-${jumpSurah}-${jumpAyat}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#1e3a8a]');
      setTimeout(() => el.classList.remove('ring-4', 'ring-[#1e3a8a]'), 2000);
    } else {
      alert('Ayat tidak ditemukan di Juz ini.');
    }
    setJumpAyat('');
  };

  // ─── Audio navigation ──────────────────────────────────────────────────────
  const handleAudioNav = (dir) => {
    if (!audioInfo) return;
    const idx = allAyatFlat.findIndex(
      (a) =>
        a.nomorAyat === audioInfo.ayat.nomorAyat &&
        a.surahId === audioInfo.surahId,
    );
    const next = allAyatFlat[idx + dir];
    if (next) {
      handlePlayAudio(next, next.surahId, next.surahName);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-blue-900'
      style={{ paddingBottom: showPlayer ? '160px' : '100px' }}
    >
      <Head>
        <title>Juz {number} - MyRamadhan</title>
      </Head>

      {/* Header sticky */}
      <JuzHeader
        juzNumber={number}
        juzSurahs={juzSurahs}
        loading={loading}
        hafalanMode={hafalanMode}
        onToggleHafalan={() => setHafalanMode((v) => !v)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((v) => !v)}
        settings={settings}
        onSettingChange={toggleSetting}
        onSizeChange={setArabSize}
        jumpSurah={jumpSurah}
        setJumpSurah={setJumpSurah}
        jumpAyat={jumpAyat}
        setJumpAyat={setJumpAyat}
        onJumpSubmit={handleJump}
      />

      <main className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-5 md:py-8 space-y-3 md:space-y-5'>
        {/* Hero banner juz */}
        <JuzHeroBanner juzNumber={number} juzSurahs={juzSurahs} />

        {/* Banner mode hafalan */}
        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 flex items-center gap-3'>
            <EyeOff
              size={20}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-400 text-xs md:text-sm font-bold'>
              Mode Hafalan aktif — klik "Intip Ayat" untuk melihat tiap ayat
            </p>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && (
          <div className='space-y-4 md:space-y-6'>
            <div className='h-8 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full mx-auto mb-6' />
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='h-48 md:h-56 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-3xl'
              />
            ))}
          </div>
        )}

        {/* Konten ayat per surah */}
        {!loading &&
          juzSurahs.map((surah) => (
            <div key={surah.surahId} className='md:mt-6'>
              {/* Pemisah nama surah */}
              <SurahSeparator
                namaArab={surah.nama}
                namaLatin={surah.namaLatin}
              />

              <div className='space-y-4 md:space-y-6'>
                {surah.ayat.map((ayat) => (
                  <AyatCard
                    key={`${surah.surahId}-${ayat.nomorAyat}`}
                    ayat={ayat}
                    surahName={surah.namaLatin}
                    surahId={surah.surahId}
                    settings={settings}
                    hafalanMode={hafalanMode}
                    isBookmarked={bookmarks.some(
                      (b) =>
                        b.surahId === surah.surahId &&
                        b.ayahNumber === ayat.nomorAyat,
                    )}
                    isLastRead={
                      lastRead?.surahId === surah.surahId &&
                      lastRead?.ayahNumber === ayat.nomorAyat
                    }
                    isPlaying={
                      audioInfo?.ayat.nomorAyat === ayat.nomorAyat &&
                      audioInfo?.surahId === surah.surahId &&
                      showPlayer
                    }
                    isJuzMode={true}
                    copiedId={copiedId}
                    onBookmark={(a) =>
                      handleBookmark(a, surah.surahId, surah.namaLatin)
                    }
                    onLastRead={(a) =>
                      handleLastRead(a, surah.surahId, surah.namaLatin, {
                        juzNumber: Number(number),
                      })
                    }
                    onCopy={(a, name) => handleCopy(a, name, surah.surahId)}
                    onPlayAudio={(a) =>
                      handlePlayAudio(a, surah.surahId, surah.namaLatin)
                    }
                  />
                ))}
              </div>
            </div>
          ))}

        {/* Navigasi juz sebelum/sesudah */}
        {!loading && (
          <div className='flex gap-4 md:gap-5 pt-6 md:pt-8'>
            {Number(number) > 1 && (
              <button
                onClick={() => router.push(`/quran/juz/${Number(number) - 1}`)}
                className='flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-sm md:text-base font-bold text-slate-600 dark:text-slate-300 hover:border-[#1e3a8a] dark:hover:border-blue-600 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2'
              >
                <ArrowLeft size={18} /> Juz {Number(number) - 1}
              </button>
            )}
            {Number(number) < 30 && (
              <button
                onClick={() => router.push(`/quran/juz/${Number(number) + 1}`)}
                className='flex-1 py-4 rounded-2xl bg-[#1e3a8a] dark:bg-blue-700 text-white text-sm md:text-base font-bold hover:bg-[#162d6e] dark:hover:bg-blue-800 transition-all flex items-center justify-center gap-2'
              >
                Juz {Number(number) + 1}
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
          label={`${audioInfo.surahName} — Ayat ${audioInfo.ayat.nomorAyat}`}
          onPrev={() => handleAudioNav(-1)}
          onNext={() => handleAudioNav(1)}
          onClose={closePlayer}
        />
      )}
    </div>
  );
}
