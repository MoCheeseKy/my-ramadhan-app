'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  ChevronUp,
  X,
  Type,
  Info,
  Navigation,
} from 'lucide-react';

const ARAB_SIZES = [
  { key: 'sm', label: 'S', size: '22px' },
  { key: 'md', label: 'M', size: '28px' },
  { key: 'lg', label: 'L', size: '36px' },
  { key: 'xl', label: 'XL', size: '42px' },
];

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
    desc: 'Dengung 2 harakat pada nun/mim bertasydid',
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

function applyTajwidHighlight(arabText) {
  if (!arabText) return arabText;
  const rules = [
    { pattern: /([اوي](?=[^\u064B-\u065F]))/g, key: 'mad' },
    { pattern: /(نّ|مّ)/g, key: 'ghunnah' },
    { pattern: /([بجدقط]ْ)/g, key: 'qalqalah' },
    { pattern: /(نْ(?=[تثجدذزسشصضطظفقك]))/g, key: 'ikhfa' },
    { pattern: /(نْ(?=ب)|ً(?=ب)|ٍ(?=ب)|ٌ(?=ب))/g, key: 'iqlab' },
  ];

  let highlights = [];
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

  const arabSizeConfig =
    ARAB_SIZES.find((s) => s.key === settings.arabSize) || ARAB_SIZES[1];

  const renderArabic = () => {
    const fontClass =
      'font-amiri text-slate-800 dark:text-slate-200 text-right leading-[2.4] md:leading-[2.6]';

    if (!settings.tajwid || !highlights?.length) {
      return (
        <p
          className={fontClass}
          dir='rtl'
          style={{ fontSize: arabSizeConfig.size }}
        >
          {ayat.teksArab}
        </p>
      );
    }

    const parts = [];
    let lastIdx = 0;
    const sorted = [...highlights].sort((a, b) => a.start - b.start);

    sorted.forEach(({ start, end, color, bg }, i) => {
      if (start > lastIdx)
        parts.push(
          <span key={`t${i}`} className='dark:text-slate-200'>
            {ayat.teksArab.slice(lastIdx, start)}
          </span>,
        );
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
    if (lastIdx < ayat.teksArab.length)
      parts.push(
        <span key='last' className='dark:text-slate-200'>
          {ayat.teksArab.slice(lastIdx)}
        </span>,
      );

    return (
      <p
        className={fontClass}
        dir='rtl'
        style={{ fontSize: arabSizeConfig.size }}
      >
        {parts}
      </p>
    );
  };

  return (
    <div
      id={`ayat-${ayat.nomorAyat}`}
      className={`rounded-3xl border transition-all duration-300 overflow-hidden scroll-mt-36 md:scroll-mt-40 ${
        isLastRead
          ? 'bg-blue-50/60 dark:bg-blue-900/30 border-[#1e3a8a] dark:border-blue-500 ring-2 ring-[#1e3a8a]/20 dark:ring-blue-500/30'
          : isAnchor
            ? 'bg-indigo-50/40 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-800'
      }`}
    >
      <div className='flex items-center justify-between px-5 md:px-7 py-3 md:py-4 border-b border-slate-50 dark:border-slate-800'>
        <div
          className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm font-black ${
            isLastRead
              ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white'
              : 'bg-blue-50 dark:bg-blue-900/40 text-[#1e3a8a] dark:text-blue-400'
          }`}
        >
          {ayat.nomorAyat}
        </div>
        <div className='flex items-center gap-1 md:gap-2'>
          <button
            onClick={() => onPlayAudio(ayat)}
            className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => onCopy(ayat, surahName)}
            className='p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            {copiedId === ayat.nomorAyat ? (
              <Check size={16} className='text-emerald-500' />
            ) : (
              <Copy size={16} />
            )}
          </button>
          <button
            onClick={() => onBookmark(ayat)}
            className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            {isBookmarked ? (
              <BookmarkCheck size={16} />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </div>
      </div>

      <div
        className={`px-5 py-4 md:px-7 md:py-6 ${hafalanMode && !revealed ? 'cursor-pointer' : ''}`}
      >
        {hafalanMode && !revealed ? (
          <div className='relative'>
            <div className='blur-[6px] select-none pointer-events-none'>
              {settings.arab && (
                <p
                  className='font-amiri text-right text-slate-800 dark:text-slate-200 mb-3'
                  dir='rtl'
                  style={{ fontSize: arabSizeConfig.size }}
                >
                  {ayat.teksArab}
                </p>
              )}
              {settings.latin && (
                <p className='text-slate-500 dark:text-slate-400 text-[13px] md:text-sm leading-relaxed italic mt-2'>
                  {ayat.teksLatin}
                </p>
              )}
              {settings.terjemahan && (
                <p className='text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mt-3'>
                  "{ayat.teksIndonesia}"
                </p>
              )}
            </div>
            <button
              onClick={() => setRevealed(true)}
              className='absolute inset-0 flex items-center justify-center gap-2 text-[#1e3a8a] dark:text-blue-400 font-bold text-sm md:text-base'
            >
              <Eye size={18} /> Intip Ayat
            </button>
          </div>
        ) : (
          <>
            {settings.arab && (
              <div className='mb-3 md:mb-5'>{renderArabic()}</div>
            )}
            {settings.latin && (
              <p className='text-slate-500 dark:text-slate-400 text-[13px] md:text-sm leading-relaxed italic mt-1 mb-2 md:mb-3'>
                {ayat.teksLatin}
              </p>
            )}
            {settings.terjemahan && (
              <p className='text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mt-2 pb-1'>
                "{ayat.teksIndonesia}"
              </p>
            )}
            {hafalanMode && revealed && (
              <button
                onClick={() => setRevealed(false)}
                className='mt-3 md:mt-4 text-xs md:text-sm font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-300'
              >
                <EyeOff size={14} /> Sembunyikan lagi
              </button>
            )}
          </>
        )}
      </div>

      <div className='px-5 pb-4 md:px-7 md:pb-6'>
        <button
          onClick={() => !isLastRead && onLastRead(ayat)}
          disabled={isLastRead}
          className={`w-full py-2.5 md:py-3 rounded-2xl border text-xs md:text-sm font-bold transition-all ${
            isLastRead
              ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white border-[#1e3a8a] dark:border-blue-600 cursor-default'
              : 'border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 hover:border-[#1e3a8a]/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/20'
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
    <div className='fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe md:pb-6'>
      <div className='max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300'>
        <div className='h-1.5 bg-gradient-to-r from-[#1e3a8a] via-indigo-500 to-purple-500' />
        <div className='p-4 md:p-5'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <p className='text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500'>
                Memutar
              </p>
              <p className='font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base'>
                {surahName} — Ayat {currentAyat?.nomorAyat}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            >
              <X size={18} className='text-slate-500 dark:text-slate-400' />
            </button>
          </div>
          <div className='flex items-center gap-3 mb-3'>
            <span className='text-[10px] md:text-xs tabular-nums text-slate-400 dark:text-slate-500 w-8 md:w-10'>
              {fmt(currentTime)}
            </span>
            <input
              type='range'
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className='flex-1 h-1.5 md:h-2 rounded-full accent-[#1e3a8a] dark:accent-blue-500 cursor-pointer bg-slate-200 dark:bg-slate-700'
            />
            <span className='text-[10px] md:text-xs tabular-nums text-slate-400 dark:text-slate-500 w-8 md:w-10'>
              {fmt(duration)}
            </span>
          </div>
          <div className='flex items-center justify-center gap-4 md:gap-6'>
            <button
              onClick={onPrev}
              className='p-2 text-slate-500 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors'
            >
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlay}
              className='w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1e3a8a] dark:bg-blue-600 text-white flex items-center justify-center hover:bg-[#162d6e] dark:hover:bg-blue-700 transition-colors shadow-lg'
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={onNext}
              className='p-2 text-slate-500 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors'
            >
              <SkipForward size={24} />
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

  const [settings, setSettings] = useState({
    arab: true,
    latin: true,
    terjemahan: true,
    tajwid: false,
    arabSize: 'md',
  });
  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTajwidInfo, setShowTajwidInfo] = useState(false);
  const [jumpNumber, setJumpNumber] = useState('');

  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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
        .select('quran_bookmarks, quran_last_read, quran_settings')
        .eq('personal_code', user.personal_code)
        .single();
      if (data?.quran_bookmarks) setBookmarks(data.quran_bookmarks);
      if (data?.quran_last_read) setLastRead(data.quran_last_read);
      if (data?.quran_settings) setSettings(data.quran_settings);
    } else {
      setBookmarks(
        JSON.parse(localStorage.getItem('myRamadhan_quran_bookmarks')) || [],
      );
      const lr = JSON.parse(localStorage.getItem('myRamadhan_quran_lastread'));
      if (lr) setLastRead(lr);
      const ls = JSON.parse(localStorage.getItem('myRamadhan_quran_settings'));
      if (ls) setSettings(ls);
    }
  };

  useEffect(() => {
    localStorage.setItem('myRamadhan_quran_settings', JSON.stringify(settings));
    if (user)
      supabase
        .from('users')
        .update({ quran_settings: settings })
        .eq('personal_code', user.personal_code);
  }, [settings, user]);

  const handleJumpToNumber = (e) => {
    e.preventDefault();
    const num = parseInt(jumpNumber, 10);
    if (!num || isNaN(num) || num < 1 || num > surah?.jumlahAyat) {
      alert(`Masukkan nomor ayat yang valid antara 1 - ${surah?.jumlahAyat}`);
      return;
    }
    const element = document.getElementById(`ayat-${num}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-[#1e3a8a]');
      setTimeout(
        () => element.classList.remove('ring-4', 'ring-[#1e3a8a]'),
        2000,
      );
    }
    setJumpNumber('');
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
      style={{ paddingBottom: showPlayer ? '160px' : '100px' }}
    >
      <Head>
        <title>{surah?.namaLatin || 'Membaca'} - MyRamadhan</title>
      </Head>

      {/* ── HEADER ADAPTIF ── */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-3 md:py-4'>
        <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3 md:gap-4'>
              <button
                onClick={() => router.back()}
                className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
              >
                <ArrowLeft
                  size={22}
                  className='text-slate-600 dark:text-slate-400'
                />
              </button>
              {loading ? (
                <div className='h-6 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg' />
              ) : (
                <div>
                  <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-200 leading-tight'>
                    {surah?.namaLatin}
                  </h1>
                  <p className='text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500'>
                    {surah?.arti} • {surah?.jumlahAyat} Ayat
                  </p>
                </div>
              )}
            </div>

            <div className='flex items-center gap-1 md:gap-2'>
              <button
                onClick={() => setHafalanMode(!hafalanMode)}
                className={`px-4 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1.5 ${hafalanMode ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white border-[#1e3a8a] dark:border-blue-600' : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#1e3a8a]/30'}`}
              >
                {hafalanMode ? <Eye size={15} /> : <EyeOff size={15} />}
                <span className='hidden sm:block'>Hafalan</span>
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-full transition-colors ${showSettings ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Settings2 size={18} />
              </button>
            </div>
          </div>

          {/* Kolom Pencarian / Loncat Nomor (Di Luar Setting) */}
          <form
            onSubmit={handleJumpToNumber}
            className='relative w-full flex gap-2'
          >
            <div className='relative flex-1'>
              <Navigation
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                size={16}
              />
              <input
                type='number'
                min='1'
                max={surah?.jumlahAyat || 9999}
                placeholder={`Loncat ke ayat (1 - ${surah?.jumlahAyat || ''})...`}
                value={jumpNumber}
                onChange={(e) => setJumpNumber(e.target.value)}
                className='w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-100/80 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-[#1e3a8a] outline-none text-[13px] md:text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400'
              />
            </div>
            <button
              type='submit'
              className='bg-[#1e3a8a] dark:bg-blue-600 hover:bg-blue-800 text-white font-bold px-5 py-2.5 md:py-3 rounded-2xl transition-colors text-[13px] md:text-sm shadow-sm flex items-center justify-center shrink-0'
            >
              Loncat
            </button>
          </form>

          {/* ── SETTINGS PANEL (Gaya Doa) ── */}
          {showSettings && (
            <div className='mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 pb-2 md:flex md:items-center md:justify-center md:gap-8'>
              <div className='grid grid-cols-4 md:flex gap-2 mb-3 md:mb-0'>
                {[
                  { key: 'arab', label: 'Arab' },
                  { key: 'latin', label: 'Latin' },
                  { key: 'terjemahan', label: 'Terjemah' },
                  { key: 'tajwid', label: 'Tajwid' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSettings((s) => ({ ...s, [key]: !s[key] }))
                    }
                    className={`py-2 md:px-6 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${settings[key] ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white border-[#1e3a8a] dark:border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className='md:flex md:items-center md:gap-3'>
                <div className='mt-4 mb-2 md:my-0 flex items-center gap-1.5'>
                  <Type size={11} className='md:w-3 md:h-3 text-slate-400' />
                  <span className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest'>
                    Ukuran Arab
                  </span>
                </div>
                <div className='grid grid-cols-4 md:flex gap-2 pb-2 md:pb-0'>
                  {ARAB_SIZES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, arabSize: s.key }))
                      }
                      className={`flex flex-col md:flex-row md:gap-2 items-center justify-center py-2 md:px-3 md:py-1.5 rounded-xl border-2 transition-all ${
                        settings.arabSize === s.key
                          ? 'border-[#1e3a8a] bg-blue-50 dark:bg-blue-900/40 text-[#1e3a8a] dark:text-blue-400'
                          : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span
                        className='font-arabic leading-none mb-1 md:mb-0'
                        style={{ fontSize: '18px' }}
                      >
                        ع
                      </span>
                      <span className='text-[10px] md:text-xs font-bold'>
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {settings.tajwid && (
                <div className='flex flex-col items-center md:items-start w-full md:w-auto mt-2 md:mt-0 md:ml-4'>
                  <button
                    onClick={() => setShowTajwidInfo(!showTajwidInfo)}
                    className='flex items-center justify-center gap-1.5 text-[11px] md:text-xs text-[#1e3a8a] dark:text-blue-400 font-bold hover:underline mb-3 w-full md:w-auto'
                  >
                    <Info size={14} /> Keterangan tajwid
                    {showTajwidInfo ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                  {showTajwidInfo && (
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 pb-2'>
                      {TAJWID_RULES.map((r) => (
                        <div key={r.key} className='flex items-start gap-2.5'>
                          <span
                            className='w-3 h-3 md:w-3.5 md:h-3.5 rounded-full mt-0.5 shrink-0'
                            style={{ backgroundColor: r.color }}
                          />
                          <div>
                            <p
                              className='text-[11px] md:text-xs font-bold'
                              style={{ color: r.color }}
                            >
                              {r.label}
                            </p>
                            <p className='text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 leading-tight'>
                              {r.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-5 md:py-8 space-y-4 md:space-y-6 pt-6'>
        {!loading && surah && (
          <div className='bg-gradient-to-br from-[#1e3a8a] to-[#312e81] dark:from-blue-800 dark:to-indigo-800 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 text-white text-center relative overflow-hidden mb-2 md:mb-4'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_70%)]' />
            <p className='text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-indigo-200 dark:text-indigo-300 mb-2'>
              {surah.tempatTurun} • Surah ke-{surah.nomor}
            </p>
            <h2 className='font-amiri text-5xl md:text-6xl text-white mb-2'>
              {surah.nama}
            </h2>
            <p className='text-indigo-200 dark:text-indigo-300 font-bold text-lg md:text-xl'>
              {surah.namaLatin}
            </p>
            <p className='text-indigo-300 dark:text-indigo-400 text-sm md:text-base mt-1.5'>
              {surah.arti}
            </p>
            <div className='mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/10 w-3/4 mx-auto'>
              <p className='text-white/90 font-amiri text-2xl md:text-3xl'>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>
            </div>
          </div>
        )}

        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 flex items-center gap-3 mb-2'>
            <EyeOff
              size={20}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-300 text-xs md:text-sm font-bold'>
              Mode Hafalan aktif — klik "Intip Ayat" untuk melihat tiap ayat
            </p>
          </div>
        )}

        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-48 md:h-56 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl'
            />
          ))}

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

        {!loading && surah && (
          <div className='flex gap-3 md:gap-5 pt-6 md:pt-8'>
            {surah.suratSebelumnya && (
              <button
                onClick={() =>
                  router.push(`/quran/surah/${surah.suratSebelumnya.nomor}`)
                }
                className='flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm md:text-base font-bold text-slate-600 dark:text-slate-400 hover:border-[#1e3a8a] dark:hover:border-blue-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2'
              >
                <ArrowLeft size={18} />{' '}
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
                </span>{' '}
                <ArrowLeft size={18} className='rotate-180' />
              </button>
            )}
          </div>
        )}
      </main>

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
