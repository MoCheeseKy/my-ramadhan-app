'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';
import {
  ArrowLeft,
  Settings2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen,
  Info,
  Scroll,
} from 'lucide-react';

// ─── Tajwid color map ─────────────────────────────────────────────────────────
const TAJWID_RULES = [
  {
    key: 'mad',
    label: 'Mad (Panjang)',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.12)',
    desc: 'Bacaan dipanjangkan 2-6 harakat',
  },
  {
    key: 'ghunnah',
    label: 'Ghunnah (Dengung)',
    color: '#db2777',
    bg: 'rgba(219,39,119,0.12)',
    desc: 'Bacaan berdengung 2 harakat pada nun/mim bertasydid',
  },
  {
    key: 'idgham',
    label: 'Idgham (Masuk/Lebur)',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.12)',
    desc: 'Nun mati/tanwin lebur ke huruf berikutnya',
  },
  {
    key: 'ikhfa',
    label: 'Ikhfa (Samar)',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.12)',
    desc: 'Nun mati/tanwin dibaca samar',
  },
  {
    key: 'qalqalah',
    label: 'Qalqalah (Memantul)',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.12)',
    desc: 'Huruf qalqalah dibaca memantul',
  },
  {
    key: 'iqlab',
    label: 'Iqlab (Tukar ke Mim)',
    color: '#059669',
    bg: 'rgba(5,150,105,0.12)',
    desc: 'Nun mati/tanwin berubah menjadi mim',
  },
];

// ─── Simple tajwid highlighter (pattern-based, tidak 100% akurat) ─────────────
function applyTajwidHighlight(arabText) {
  if (!arabText) return arabText;
  // Ini simplified highlighting — untuk production pakai library khusus tajwid
  const rules = [
    // Mad (alif/waw/ya setelah harakat panjang)
    { pattern: /([اوي](?=[^\u064B-\u065F]))/g, key: 'mad' },
    // Ghunnah (nun/mim bertasydid)
    { pattern: /(نّ|مّ)/g, key: 'ghunnah' },
    // Qalqalah (ب ج د ق ط saat mati/waqaf)
    { pattern: /([بجدقط]ْ)/g, key: 'qalqalah' },
    // Ikhfa (nun mati sebelum huruf ikhfa)
    { pattern: /(نْ(?=[تثجدذزسشصضطظفقك]))/g, key: 'ikhfa' },
    // Iqlab
    { pattern: /(نْ(?=ب)|ً(?=ب)|ٍ(?=ب)|ٌ(?=ب))/g, key: 'iqlab' },
  ];

  let result = arabText;
  const highlights = [];

  rules.forEach(({ pattern, key }) => {
    let match;
    const rule = TAJWID_RULES.find((r) => r.key === key);
    while ((match = pattern.exec(arabText)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        key,
        color: rule.color,
        bg: rule.bg,
      });
    }
  });

  return { text: arabText, highlights };
}

// ─── AyatCard Component ───────────────────────────────────────────────────────
function AyatCard({
  ayat,
  surahName,
  surahNumber,
  settings,
  hafalanMode,
  isBookmarked,
  isLastRead,
  isPlaying,
  onBookmark,
  onLastRead,
  onCopy,
  onPlayAudio,
  copiedId,
}) {
  const [revealed, setRevealed] = useState(false);
  const { highlights } = applyTajwidHighlight(ayat.teksArab);
  const isAnchor =
    typeof window !== 'undefined' &&
    window.location.hash === `#ayat-${ayat.nomorAyat}`;

  const renderArabic = () => {
    if (!settings.tajwid || !highlights?.length) {
      return (
        <p
          className='font-amiri text-[2rem] leading-[2.4] text-slate-800 dark:text-slate-200 text-right'
          dir='rtl'
        >
          {ayat.teksArab}
        </p>
      );
    }

    const parts = [];
    let lastIdx = 0;
    const sorted = [...highlights].sort((a, b) => a.start - b.start);

    sorted.forEach(({ start, end, color, bg }, i) => {
      if (start > lastIdx) {
        parts.push(
          <span key={`t${i}`} className='dark:text-slate-200'>
            {ayat.teksArab.slice(lastIdx, start)}
          </span>,
        );
      }
      parts.push(
        <span
          key={`h${i}`}
          style={{
            color,
            backgroundColor: bg,
            borderRadius: '3px',
            padding: '0 2px',
          }}
        >
          {ayat.teksArab.slice(start, end)}
        </span>,
      );
      lastIdx = end;
    });
    if (lastIdx < ayat.teksArab.length) {
      parts.push(
        <span key='last' className='dark:text-slate-200'>
          {ayat.teksArab.slice(lastIdx)}
        </span>,
      );
    }

    return (
      <p
        className='font-amiri text-[2rem] leading-[2.4] text-slate-800 dark:text-slate-200 text-right'
        dir='rtl'
      >
        {parts}
      </p>
    );
  };

  return (
    <div
      id={`ayat-${ayat.nomorAyat}`}
      className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
        isLastRead
          ? 'bg-blue-50/60 dark:bg-blue-900/30 border-[#1e3a8a] dark:border-blue-500 ring-2 ring-[#1e3a8a]/20 dark:ring-blue-500/30'
          : isAnchor
            ? 'bg-indigo-50/40 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-800'
      }`}
    >
      {/* HEADER */}
      <div className='flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800'>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
            isLastRead
              ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white'
              : 'bg-blue-50 dark:bg-blue-900/40 text-[#1e3a8a] dark:text-blue-400'
          }`}
        >
          {ayat.nomorAyat}
        </div>
        <div className='flex items-center gap-1'>
          {/* Play audio */}
          <button
            onClick={() => onPlayAudio(ayat)}
            className={`p-2 rounded-full transition-colors ${
              isPlaying
                ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          {/* Copy */}
          <button
            onClick={() => onCopy(ayat, surahName)}
            className='p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            {copiedId === ayat.nomorAyat ? (
              <Check size={15} className='text-emerald-500' />
            ) : (
              <Copy size={15} />
            )}
          </button>
          {/* Bookmark */}
          <button
            onClick={() => onBookmark(ayat)}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck size={15} />
            ) : (
              <Bookmark size={15} />
            )}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div
        className={`px-5 py-4 ${hafalanMode && !revealed ? 'cursor-pointer' : ''}`}
      >
        {/* HAFALAN MODE */}
        {hafalanMode && !revealed ? (
          <div className='relative'>
            <div className='blur-[6px] select-none pointer-events-none'>
              {settings.arab && (
                <p
                  className='font-amiri text-[2rem] leading-[2.4] text-slate-800 dark:text-slate-200 text-right'
                  dir='rtl'
                >
                  {ayat.teksArab}
                </p>
              )}
              {settings.latin && (
                <p className='text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed italic mt-2'>
                  {ayat.teksLatin}
                </p>
              )}
              {settings.terjemahan && (
                <p className='text-slate-700 dark:text-slate-300 text-sm leading-relaxed mt-3'>
                  "{ayat.teksIndonesia}"
                </p>
              )}
            </div>
            <button
              onClick={() => setRevealed(true)}
              className='absolute inset-0 flex items-center justify-center gap-2 text-[#1e3a8a] dark:text-blue-400 font-bold text-sm'
            >
              <Eye size={18} /> Intip Ayat
            </button>
          </div>
        ) : (
          <>
            {settings.arab && (
              <div className='mb-3'>
                {settings.tajwid ? (
                  renderArabic()
                ) : (
                  <p
                    className='font-amiri text-[2rem] leading-[2.4] text-slate-800 dark:text-slate-200 text-right'
                    dir='rtl'
                  >
                    {ayat.teksArab}
                  </p>
                )}
              </div>
            )}
            {settings.latin && (
              <p className='text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed italic mt-1 mb-2'>
                {ayat.teksLatin}
              </p>
            )}
            {settings.terjemahan && (
              <p className='text-slate-700 dark:text-slate-300 text-sm leading-relaxed mt-2 pb-1'>
                "{ayat.teksIndonesia}"
              </p>
            )}
            {hafalanMode && revealed && (
              <button
                onClick={() => setRevealed(false)}
                className='mt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300'
              >
                <EyeOff size={12} /> Sembunyikan lagi
              </button>
            )}
          </>
        )}
      </div>

      {/* FOOTER: Tandai akhir baca */}
      <div className='px-5 pb-4'>
        <button
          onClick={() => !isLastRead && onLastRead(ayat)}
          disabled={isLastRead}
          className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-all ${
            isLastRead
              ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white border-[#1e3a8a] dark:border-blue-600 cursor-default'
              : 'border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 hover:border-[#1e3a8a]/40 dark:hover:border-blue-500/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/20'
          }`}
        >
          {isLastRead ? '✓ Terakhir Dibaca' : 'Tandai Terakhir Dibaca'}
        </button>
      </div>
    </div>
  );
}

// ─── Audio Player Component ───────────────────────────────────────────────────
function AudioPlayer({
  currentAyat,
  surahName,
  allAyat,
  onPrev,
  onNext,
  onClose,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurTime] = useState(0);

  useEffect(() => {
    if (!currentAyat?.audio?.['05']) return;
    if (audioRef.current) {
      audioRef.current.src = currentAyat.audio['05'];
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [currentAyat]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurTime(audioRef.current.currentTime);
    setProgress(
      (audioRef.current.currentTime / audioRef.current.duration) * 100 || 0,
    );
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const val = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = val;
  };

  const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe'>
      <div className='max-w-md mx-auto bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300'>
        {/* Accent bar */}
        <div className='h-1 bg-gradient-to-r from-[#1e3a8a] via-indigo-500 to-purple-500' />

        <div className='p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500'>
                Memutar
              </p>
              <p className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
                {surahName} — Ayat {currentAyat?.nomorAyat}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            >
              <X size={16} className='text-slate-500 dark:text-slate-400' />
            </button>
          </div>

          {/* Progress */}
          <div className='flex items-center gap-3 mb-3'>
            <span className='text-[10px] tabular-nums text-slate-400 dark:text-slate-500 w-8'>
              {fmt(currentTime)}
            </span>
            <input
              type='range'
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className='flex-1 h-1.5 rounded-full accent-[#1e3a8a] dark:accent-blue-500 cursor-pointer bg-slate-200 dark:bg-slate-700'
            />
            <span className='text-[10px] tabular-nums text-slate-400 dark:text-slate-500 w-8'>
              {fmt(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className='flex items-center justify-center gap-4'>
            <button
              onClick={onPrev}
              className='p-2 text-slate-500 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors'
            >
              <SkipBack size={22} />
            </button>
            <button
              onClick={togglePlay}
              className='w-12 h-12 rounded-full bg-[#1e3a8a] dark:bg-blue-600 text-white flex items-center justify-center hover:bg-[#162d6e] dark:hover:bg-blue-700 transition-colors shadow-lg'
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button
              onClick={onNext}
              className='p-2 text-slate-500 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors'
            >
              <SkipForward size={22} />
            </button>
          </div>
        </div>

        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onEnded={onNext}
        />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SurahReader() {
  const router = useRouter();
  const { number } = router.query;
  const { user } = useUser();

  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);

  // Settings
  const [settings, setSettings] = useState({
    arab: true,
    latin: true,
    terjemahan: true,
    tajwid: false,
  });
  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTajwidInfo, setShowTajwidInfo] = useState(false);

  // Interactions
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Audio
  const [currentAyatAudio, setCurrentAyatAudio] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    if (!number) return;
    fetchSurah();
    loadUserData();
  }, [number, user]);

  const fetchSurah = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://equran.id/api/v2/surat/${number}`);
      const json = await res.json();
      setSurah(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('quran_bookmarks, quran_last_read')
        .eq('personal_code', user.personal_code)
        .single();
      if (data?.quran_bookmarks) setBookmarks(data.quran_bookmarks);
      if (data?.quran_last_read) setLastRead(data.quran_last_read);
    } else {
      const b =
        JSON.parse(localStorage.getItem('myRamadhan_quran_bookmarks')) || [];
      const lr = JSON.parse(localStorage.getItem('myRamadhan_quran_lastread'));
      setBookmarks(b);
      if (lr) setLastRead(lr);
    }
  };

  const saveBookmarks = async (newBookmarks) => {
    setBookmarks(newBookmarks);
    localStorage.setItem(
      'myRamadhan_quran_bookmarks',
      JSON.stringify(newBookmarks),
    );
    if (user)
      await supabase
        .from('users')
        .update({ quran_bookmarks: newBookmarks })
        .eq('personal_code', user.personal_code);
  };

  const handleBookmark = async (ayat) => {
    const isMarked = bookmarks.some(
      (b) => b.surahId === Number(number) && b.ayahNumber === ayat.nomorAyat,
    );
    const newB = isMarked
      ? bookmarks.filter(
          (b) =>
            !(b.surahId === Number(number) && b.ayahNumber === ayat.nomorAyat),
        )
      : [
          ...bookmarks,
          {
            surahId: Number(number),
            surahName: surah?.namaLatin,
            ayahNumber: ayat.nomorAyat,
            arab: ayat.teksArab,
            translation: ayat.teksIndonesia,
          },
        ];
    saveBookmarks(newB);
  };

  const handleLastRead = async (ayat) => {
    const data = {
      surahId: Number(number),
      surahName: surah?.namaLatin,
      ayahNumber: ayat.nomorAyat,
      isJuz: false,
    };
    setLastRead(data);
    localStorage.setItem('myRamadhan_quran_lastread', JSON.stringify(data));
    if (user)
      await supabase
        .from('users')
        .update({ quran_last_read: data })
        .eq('personal_code', user.personal_code);
  };

  const handleCopy = (ayat, surahName) => {
    const text = `${surahName} Ayat ${ayat.nomorAyat}\n\n${ayat.teksArab}\n\n${ayat.teksLatin}\n\n"${ayat.teksIndonesia}"\n\n(Sumber: MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(ayat.nomorAyat);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayAudio = (ayat) => {
    if (currentAyatAudio?.nomorAyat === ayat.nomorAyat && showPlayer) {
      setShowPlayer(false);
      setCurrentAyatAudio(null);
    } else {
      setCurrentAyatAudio(ayat);
      setShowPlayer(true);
    }
  };

  const handleAudioNext = () => {
    if (!surah || !currentAyatAudio) return;
    const idx = surah.ayat.findIndex(
      (a) => a.nomorAyat === currentAyatAudio.nomorAyat,
    );
    if (idx < surah.ayat.length - 1) setCurrentAyatAudio(surah.ayat[idx + 1]);
  };

  const handleAudioPrev = () => {
    if (!surah || !currentAyatAudio) return;
    const idx = surah.ayat.findIndex(
      (a) => a.nomorAyat === currentAyatAudio.nomorAyat,
    );
    if (idx > 0) setCurrentAyatAudio(surah.ayat[idx - 1]);
  };

  // Scroll to anchor
  useEffect(() => {
    if (!loading && surah && window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loading, surah]);

  return (
    <div
      className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-blue-200 dark:selection:bg-blue-800 transition-colors duration-300'
      style={{ paddingBottom: showPlayer ? '140px' : '80px' }}
    >
      <Head>
        <title>{surah?.namaLatin || 'Membaca'} - MyRamadhan</title>
      </Head>

      {/* ── HEADER ── */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-3'>
        <div className='max-w-md mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.back()}
              className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            >
              <ArrowLeft
                size={20}
                className='text-slate-600 dark:text-slate-400'
              />
            </button>
            {loading ? (
              <div className='h-6 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg' />
            ) : (
              <div>
                <h1 className='font-bold text-base text-slate-800 dark:text-slate-200 leading-tight'>
                  {surah?.namaLatin}
                </h1>
                <p className='text-[10px] text-slate-400 dark:text-slate-500'>
                  {surah?.arti} • {surah?.jumlahAyat} Ayat
                </p>
              </div>
            )}
          </div>
          <div className='flex items-center gap-1'>
            {/* Hafalan toggle */}
            <button
              onClick={() => setHafalanMode(!hafalanMode)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                hafalanMode
                  ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white border-[#1e3a8a] dark:border-blue-600'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#1e3a8a]/30 dark:hover:border-blue-500/30'
              }`}
            >
              {hafalanMode ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${
                showSettings
                  ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* ── SETTINGS PANEL ── */}
        {showSettings && (
          <div className='max-w-md mx-auto mt-3 pt-3 border-t border-slate-100 dark:border-slate-800'>
            <div className='grid grid-cols-4 gap-2 mb-3'>
              {[
                { key: 'arab', label: 'Arab' },
                { key: 'latin', label: 'Latin' },
                { key: 'terjemahan', label: 'Terjemah' },
                { key: 'tajwid', label: 'Tajwid' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                  className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                    settings[key]
                      ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white border-[#1e3a8a] dark:border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tajwid legend toggle */}
            {settings.tajwid && (
              <button
                onClick={() => setShowTajwidInfo(!showTajwidInfo)}
                className='flex items-center gap-1.5 text-[11px] text-[#1e3a8a] dark:text-blue-400 font-semibold hover:underline mb-2'
              >
                <Info size={13} /> Keterangan warna tajwid
                {showTajwidInfo ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>
            )}

            {showTajwidInfo && settings.tajwid && (
              <div className='grid grid-cols-2 gap-2 pb-2'>
                {TAJWID_RULES.map((r) => (
                  <div key={r.key} className='flex items-start gap-2'>
                    <span
                      className='w-3 h-3 rounded-full mt-0.5 shrink-0'
                      style={{ backgroundColor: r.color }}
                    />
                    <div>
                      <p
                        className='text-[11px] font-bold'
                        style={{ color: r.color }}
                      >
                        {r.label}
                      </p>
                      <p className='text-[10px] text-slate-400 dark:text-slate-500 leading-tight'>
                        {r.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      <main className='max-w-md mx-auto p-5 space-y-4'>
        {/* Surah header card */}
        {!loading && surah && (
          <div className='bg-gradient-to-br from-[#1e3a8a] to-[#312e81] dark:from-blue-800 dark:to-indigo-800 rounded-3xl p-6 text-white text-center relative overflow-hidden mb-2'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_70%)]' />
            <p className='text-[10px] uppercase tracking-[0.3em] text-indigo-200 dark:text-indigo-300 mb-1'>
              {surah.tempatTurun} • Surah ke-{surah.nomor}
            </p>
            <h2 className='font-amiri text-5xl text-white mb-1'>
              {surah.nama}
            </h2>
            <p className='text-indigo-200 dark:text-indigo-300 font-semibold text-lg'>
              {surah.namaLatin}
            </p>
            <p className='text-indigo-300 dark:text-indigo-400 text-sm mt-1'>
              {surah.arti}
            </p>
            <div className='mt-4 pt-4 border-t border-white/10'>
              <p className='text-white/80 font-amiri text-xl'>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>
            </div>
          </div>
        )}

        {/* Hafalan mode banner */}
        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 flex items-center gap-2'>
            <EyeOff
              size={16}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-300 text-xs font-semibold'>
              Mode Hafalan aktif — klik "Intip Ayat" untuk melihat tiap ayat
            </p>
          </div>
        )}

        {/* Loading */}
        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl'
            />
          ))}

        {/* Ayat list */}
        {!loading &&
          surah?.ayat?.map((ayat) => (
            <AyatCard
              key={ayat.nomorAyat}
              ayat={ayat}
              surahName={surah.namaLatin}
              surahNumber={Number(number)}
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
                currentAyatAudio?.nomorAyat === ayat.nomorAyat && showPlayer
              }
              onBookmark={handleBookmark}
              onLastRead={handleLastRead}
              onCopy={handleCopy}
              onPlayAudio={handlePlayAudio}
              copiedId={copiedId}
            />
          ))}

        {/* Nav prev/next surah */}
        {!loading && surah && (
          <div className='flex gap-3 pt-4'>
            {surah.suratSebelumnya && (
              <button
                onClick={() =>
                  router.push(`/quran/surah/${surah.suratSebelumnya.nomor}`)
                }
                className='flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-[#1e3a8a] dark:hover:border-blue-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2'
              >
                <ArrowLeft size={16} /> {surah.suratSebelumnya.namaLatin}
              </button>
            )}
            {surah.suratSelanjutnya && (
              <button
                onClick={() =>
                  router.push(`/quran/surah/${surah.suratSelanjutnya.nomor}`)
                }
                className='flex-1 py-3 rounded-2xl bg-[#1e3a8a] dark:bg-blue-600 text-white text-sm font-bold hover:bg-[#162d6e] dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2'
              >
                {surah.suratSelanjutnya.namaLatin}{' '}
                <ArrowLeft size={16} className='rotate-180' />
              </button>
            )}
          </div>
        )}
      </main>

      {/* Audio Player */}
      {showPlayer && currentAyatAudio && (
        <AudioPlayer
          currentAyat={currentAyatAudio}
          surahName={surah?.namaLatin}
          allAyat={surah?.ayat}
          onPrev={handleAudioPrev}
          onNext={handleAudioNext}
          onClose={() => {
            setShowPlayer(false);
            setCurrentAyatAudio(null);
          }}
        />
      )}
    </div>
  );
}
