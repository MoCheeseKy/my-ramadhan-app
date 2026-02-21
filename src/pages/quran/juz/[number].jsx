'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';
import { JUZ_MAPPING } from '@/data/juzMapping';
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
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Type,
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

const TAJWID_DARK_BG = {
  mad: 'rgba(37,99,235,0.25)',
  ghunnah: 'rgba(219,39,119,0.25)',
  idgham: 'rgba(124,58,237,0.25)',
  ikhfa: 'rgba(217,119,6,0.25)',
  qalqalah: 'rgba(220,38,38,0.25)',
  iqlab: 'rgba(5,150,105,0.25)',
};

function applyTajwid(arabText) {
  const rules = [
    { pattern: /([اوي](?=[^\u064B-\u065F]))/g, key: 'mad' },
    { pattern: /(نّ|مّ)/g, key: 'ghunnah' },
    { pattern: /([بجدقط]ْ)/g, key: 'qalqalah' },
    { pattern: /(نْ(?=[تثجدذزسشصضطظفقك]))/g, key: 'ikhfa' },
    { pattern: /(نْ(?=ب))/g, key: 'iqlab' },
  ];
  const highlights = [];
  rules.forEach(({ pattern, key }) => {
    const rule = TAJWID_RULES.find((r) => r.key === key);
    let match;
    const p = new RegExp(pattern.source, pattern.flags);
    while ((match = p.exec(arabText)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        color: rule.color,
        bg: rule.bg,
        key,
      });
    }
  });
  return highlights;
}

// ─── AyatCard ─────────────────────────────────────────────────────────────────
function AyatCard({
  ayat,
  surahName,
  surahId,
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
  const highlights = settings.tajwid ? applyTajwid(ayat.teksArab) : [];
  const isAnchor =
    typeof window !== 'undefined' &&
    window.location.hash === `#ayat-${surahId}-${ayat.nomorAyat}`;

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const arabSizeConfig =
    ARAB_SIZES.find((s) => s.key === settings.arabSize) || ARAB_SIZES[1];

  const renderArabic = () => {
    const fontClass =
      'font-amiri text-slate-800 dark:text-slate-100 text-right leading-[2.4] md:leading-[2.6]';

    if (!highlights.length) {
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
    let last = 0;
    [...highlights]
      .sort((a, b) => a.start - b.start)
      .forEach(({ start, end, color, bg, key }, i) => {
        if (start > last)
          parts.push(
            <span key={`t${i}`}>{ayat.teksArab.slice(last, start)}</span>,
          );
        parts.push(
          <span
            key={`h${i}`}
            style={{
              color,
              backgroundColor: isDark ? TAJWID_DARK_BG[key] : bg,
              borderRadius: '3px',
              padding: '0 2px',
            }}
          >
            {ayat.teksArab.slice(start, end)}
          </span>,
        );
        last = end;
      });
    if (last < ayat.teksArab.length)
      parts.push(<span key='tail'>{ayat.teksArab.slice(last)}</span>);

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

  const copyKey = `${surahId}-${ayat.nomorAyat}`;

  return (
    <div
      id={`ayat-${surahId}-${ayat.nomorAyat}`}
      className={`rounded-3xl border transition-all duration-300 overflow-hidden scroll-mt-36 md:scroll-mt-40 ${
        isLastRead
          ? 'bg-blue-50/60 dark:bg-blue-950/30 border-[#1e3a8a] dark:border-blue-700 ring-2 ring-[#1e3a8a]/20 dark:ring-blue-700/20'
          : isAnchor
            ? 'bg-indigo-50/40 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600'
            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-800'
      }`}
    >
      <div className='flex items-center justify-between px-5 md:px-7 py-3 md:py-4 border-b border-slate-50 dark:border-slate-700/50'>
        <div className='flex items-center gap-2 md:gap-3'>
          <div
            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm font-black ${isLastRead ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white' : 'bg-blue-50 dark:bg-blue-950/50 text-[#1e3a8a] dark:text-blue-400'}`}
          >
            {ayat.nomorAyat}
          </div>
          <span className='text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500'>
            {surahName}
          </span>
        </div>
        <div className='flex items-center gap-1 md:gap-2'>
          <button
            onClick={() => onPlayAudio(ayat)}
            className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => onCopy(ayat, surahName)}
            className='p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
          >
            {copiedId === copyKey ? (
              <Check size={16} className='text-emerald-500' />
            ) : (
              <Copy size={16} />
            )}
          </button>
          <button
            onClick={() => onBookmark(ayat)}
            className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
          >
            {isBookmarked ? (
              <BookmarkCheck size={16} />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </div>
      </div>

      <div className='px-5 py-4 md:px-7 md:py-6'>
        {hafalanMode && !revealed ? (
          <div className='relative'>
            <div className='blur-[6px] select-none pointer-events-none'>
              {settings.arab && (
                <p
                  className='font-amiri text-right dark:text-slate-100 mb-3'
                  dir='rtl'
                  style={{ fontSize: arabSizeConfig.size }}
                >
                  {ayat.teksArab}
                </p>
              )}
              {settings.latin && (
                <p className='text-slate-500 dark:text-slate-400 text-[13px] md:text-sm italic mt-2'>
                  {ayat.teksLatin}
                </p>
              )}
              {settings.terjemahan && (
                <p className='text-slate-700 dark:text-slate-300 text-sm md:text-base mt-3'>
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
              <p className='text-slate-500 dark:text-slate-400 text-[13px] md:text-sm italic mt-1 mb-2 md:mb-3'>
                {ayat.teksLatin}
              </p>
            )}
            {settings.terjemahan && (
              <p className='text-slate-700 dark:text-slate-300 text-sm md:text-base mt-2 pb-1'>
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
              ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white border-[#1e3a8a] dark:border-blue-700 cursor-default'
              : 'border-dashed border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 hover:border-[#1e3a8a]/40 dark:hover:border-blue-700/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
          }`}
        >
          {isLastRead ? '✓ Terakhir Dibaca' : 'Tandai Terakhir Dibaca'}
        </button>
      </div>
    </div>
  );
}

// ─── AudioPlayer ──────────────────────────────────────────────────────────────
function AudioPlayer({ currentAyat, label, onPrev, onNext, onClose }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);

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

  const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 px-4 pb-6'>
      <div className='max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden'>
        <div className='h-1.5 bg-gradient-to-r from-[#1e3a8a] via-indigo-500 to-purple-500' />
        <div className='p-4 md:p-5'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <p className='text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500'>
                Memutar
              </p>
              <p className='font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base'>
                {label}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
            >
              <X size={18} className='text-slate-500 dark:text-slate-400' />
            </button>
          </div>
          <div className='flex items-center gap-3 mb-3'>
            <span className='text-[10px] md:text-xs tabular-nums text-slate-400 dark:text-slate-500 w-8 md:w-10'>
              {fmt(curTime)}
            </span>
            <input
              type='range'
              min={0}
              max={100}
              value={progress}
              onChange={(e) => {
                if (audioRef.current)
                  audioRef.current.currentTime =
                    (e.target.value / 100) * audioRef.current.duration;
              }}
              className='flex-1 h-1.5 md:h-2 rounded-full accent-[#1e3a8a] cursor-pointer'
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
              className='w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1e3a8a] dark:bg-blue-700 text-white flex items-center justify-center hover:bg-[#162d6e] dark:hover:bg-blue-800 shadow-lg transition-colors'
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
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurTime(audioRef.current.currentTime);
              setProgress(
                (audioRef.current.currentTime / audioRef.current.duration) *
                  100 || 0,
              );
            }
          }}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onEnded={onNext}
        />
      </div>
    </div>
  );
}

// ─── HALAMAN UTAMA ────────────────────────────────────────────────────────────
export default function JuzReader() {
  const router = useRouter();
  const { number } = router.query;
  const { user } = useUser();

  const [juzSurahs, setJuzSurahs] = useState([]);
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

  const [jumpSurah, setJumpSurah] = useState('');
  const [jumpAyat, setJumpAyat] = useState('');

  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [audioInfo, setAudioInfo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const allAyatFlat = juzSurahs.flatMap((s) =>
    s.ayat.map((a) => ({ ...a, surahId: s.surahId, surahName: s.namaLatin })),
  );

  useEffect(() => {
    if (!number) return;
    fetchJuz(Number(number));
    loadUserData();
  }, [number, user]);

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

  const saveBookmarks = async (newB) => {
    setBookmarks(newB);
    localStorage.setItem('myRamadhan_quran_bookmarks', JSON.stringify(newB));
    if (user)
      await supabase
        .from('users')
        .update({ quran_bookmarks: newB })
        .eq('personal_code', user.personal_code);
  };

  const handleBookmark = (ayat, surahId, surahName) => {
    const isMarked = bookmarks.some(
      (b) => b.surahId === surahId && b.ayahNumber === ayat.nomorAyat,
    );
    const newB = isMarked
      ? bookmarks.filter(
          (b) => !(b.surahId === surahId && b.ayahNumber === ayat.nomorAyat),
        )
      : [
          ...bookmarks,
          {
            surahId,
            surahName,
            ayahNumber: ayat.nomorAyat,
            arab: ayat.teksArab,
            translation: ayat.teksIndonesia,
          },
        ];
    saveBookmarks(newB);
  };

  const handleLastRead = async (ayat, surahId, surahName) => {
    const data = {
      surahId,
      surahName,
      ayahNumber: ayat.nomorAyat,
      isJuz: true,
      juzNumber: Number(number),
      page: 1,
    };
    setLastRead(data);
    localStorage.setItem('myRamadhan_quran_lastread', JSON.stringify(data));
    if (user)
      await supabase
        .from('users')
        .update({ quran_last_read: data })
        .eq('personal_code', user.personal_code);
  };

  const handleCopy = (ayat, surahName, surahId) => {
    const text = `${surahName} Ayat ${ayat.nomorAyat}\n\n${ayat.teksArab}\n\n${ayat.teksLatin}\n\n"${ayat.teksIndonesia}"\n\n(Sumber: MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(`${surahId}-${ayat.nomorAyat}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayAudio = (ayat, surahId, surahName) => {
    const isSame =
      audioInfo?.ayat.nomorAyat === ayat.nomorAyat &&
      audioInfo?.surahId === surahId;
    if (isSame && showPlayer) {
      setShowPlayer(false);
      setAudioInfo(null);
    } else {
      setAudioInfo({ ayat, surahId, surahName });
      setShowPlayer(true);
    }
  };

  const handleAudioNav = (dir) => {
    if (!audioInfo) return;
    const idx = allAyatFlat.findIndex(
      (a) =>
        a.nomorAyat === audioInfo.ayat.nomorAyat &&
        a.surahId === audioInfo.surahId,
    );
    const next = allAyatFlat[idx + dir];
    if (next)
      setAudioInfo({
        ayat: next,
        surahId: next.surahId,
        surahName: next.surahName,
      });
  };

  const handleJump = (e) => {
    e.preventDefault();
    if (!jumpSurah || !jumpAyat) {
      alert('Pilih Surah dan masukkan Ayat.');
      return;
    }
    const element = document.getElementById(`ayat-${jumpSurah}-${jumpAyat}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-4', 'ring-[#1e3a8a]');
      setTimeout(
        () => element.classList.remove('ring-4', 'ring-[#1e3a8a]'),
        2000,
      );
    } else {
      alert('Ayat tidak ditemukan di Juz ini.');
    }
  };

  useEffect(() => {
    if (juzSurahs.length > 0 && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(hashId);
        if (element)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [juzSurahs]);

  const firstSurah = juzSurahs[0];
  const lastSurah = juzSurahs[juzSurahs.length - 1];

  return (
    <div
      className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-blue-900'
      style={{ paddingBottom: showPlayer ? '160px' : '100px' }}
    >
      <Head>
        <title>Juz {number} - MyRamadhan</title>
      </Head>

      {/* HEADER ADAPTIF */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-5 py-3 md:py-4'>
        <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3 md:gap-4'>
              <button
                onClick={() => router.back()}
                className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
              >
                <ArrowLeft
                  size={22}
                  className='text-slate-600 dark:text-slate-400'
                />
              </button>
              <div>
                <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-100'>
                  Juz {number}
                </h1>
                {!loading && firstSurah && (
                  <p className='text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500'>
                    {firstSurah.namaLatin}{' '}
                    {firstSurah.surahId !== lastSurah?.surahId
                      ? ` — ${lastSurah?.namaLatin}`
                      : ''}
                  </p>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2 md:gap-3'>
              <button
                onClick={() => setHafalanMode(!hafalanMode)}
                className={`px-4 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1.5 ${hafalanMode ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white border-[#1e3a8a] dark:border-blue-700' : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-[#1e3a8a]/30'}`}
              >
                {hafalanMode ? <Eye size={15} /> : <EyeOff size={15} />}
                <span className='hidden sm:block'>Hafalan</span>
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-full transition-colors ${showSettings ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <Settings2 size={18} />
              </button>
            </div>
          </div>

          {/* Kolom Loncat Nomor Juz (Beda format dgn surah tunggal) */}
          <form onSubmit={handleJump} className='flex gap-2 w-full'>
            <div className='flex-1 flex gap-2'>
              <div className='relative w-1/2'>
                <select
                  value={jumpSurah}
                  onChange={(e) => setJumpSurah(e.target.value)}
                  className='w-full pl-3 pr-8 py-2.5 md:py-3 bg-slate-100/80 dark:bg-slate-800 rounded-2xl border-none outline-none text-[13px] md:text-sm text-slate-800 dark:text-slate-100 appearance-none'
                >
                  <option value='' disabled>
                    Pilih Surah
                  </option>
                  {juzSurahs.map((s) => (
                    <option key={s.surahId} value={s.surahId}>
                      {s.namaLatin}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
                />
              </div>
              <input
                type='number'
                min='1'
                placeholder='Ayat'
                value={jumpAyat}
                onChange={(e) => setJumpAyat(e.target.value)}
                className='w-1/2 px-4 py-2.5 md:py-3 bg-slate-100/80 dark:bg-slate-800 rounded-2xl border-none outline-none text-[13px] md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400'
              />
            </div>
            <button
              type='submit'
              className='bg-[#1e3a8a] dark:bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 md:py-3 rounded-2xl transition-colors text-[13px] md:text-sm shadow-sm shrink-0'
            >
              Loncat
            </button>
          </form>

          {/* SETTINGS PANEL ADAPTIF */}
          {showSettings && (
            <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 pb-2'>
              <div className='grid grid-cols-4 md:flex md:justify-center md:gap-4 gap-2 mb-3'>
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
                    className={`py-2.5 md:px-8 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${settings[key] ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white border-[#1e3a8a] dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className='flex flex-col md:flex-row md:items-start md:justify-center gap-5 md:gap-12 border-t border-slate-100 dark:border-slate-800 pt-4'>
                {/* Ukuran Teks Control */}
                <div className='flex flex-col items-center gap-2'>
                  <span className='text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500'>
                    Ukuran Arab
                  </span>
                  <div className='flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1'>
                    {ARAB_SIZES.map((size) => (
                      <button
                        key={size.key}
                        onClick={() =>
                          setSettings((s) => ({ ...s, arabSize: size.key }))
                        }
                        className={`w-12 h-9 flex items-center justify-center rounded-lg font-bold transition-all ${settings.arabSize === size.key ? 'bg-white dark:bg-slate-700 shadow-sm text-[#1e3a8a] dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      >
                        <span
                          className={
                            size.key === 'sm'
                              ? 'text-sm'
                              : size.key === 'md'
                                ? 'text-base'
                                : size.key === 'lg'
                                  ? 'text-lg'
                                  : 'text-xl'
                          }
                        >
                          A
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tajwid Info Control */}
                {settings.tajwid && (
                  <div className='flex flex-col items-center md:items-start'>
                    <button
                      onClick={() => setShowTajwidInfo(!showTajwidInfo)}
                      className='flex items-center justify-center gap-1.5 text-[11px] md:text-xs text-[#1e3a8a] dark:text-blue-400 font-bold hover:underline mb-3 w-full md:w-auto'
                    >
                      <Info size={14} /> Keterangan warna tajwid
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
            </div>
          )}
        </div>
      </header>

      {/* MAIN ADAPTIF */}
      <main className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-5 md:py-8 space-y-3 md:space-y-5'>
        <div className='bg-gradient-to-br from-[#1e3a8a] to-[#312e81] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white text-center relative overflow-hidden mb-4 md:mb-6'>
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_70%)]' />
          <div className='relative z-10'>
            <p className='text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-indigo-200 mb-2'>
              Al-Qur'an
            </p>
            <h2 className='text-4xl md:text-5xl font-black text-white'>
              Juz {number}
            </h2>
            {!loading && firstSurah && (
              <p className='text-indigo-200 text-sm md:text-base font-medium mt-2'>
                {firstSurah.namaLatin}{' '}
                {firstSurah.surahId !== lastSurah?.surahId
                  ? ` — ${lastSurah?.namaLatin}`
                  : ''}
              </p>
            )}
          </div>
        </div>

        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 flex items-center gap-3 mb-2'>
            <EyeOff
              size={20}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-400 text-xs md:text-sm font-bold'>
              Mode Hafalan aktif — klik "Intip Ayat" untuk melihat tiap ayat
            </p>
          </div>
        )}

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

        {!loading &&
          juzSurahs.map((surah) => (
            <div key={surah.surahId} className='md:mt-6'>
              <div className='flex items-center gap-4 py-4 md:py-6 my-2'>
                <div className='flex-1 h-px bg-slate-200 dark:bg-slate-700' />
                <div className='flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-full px-5 py-2.5 md:py-3'>
                  <span className='font-amiri text-xl md:text-2xl text-[#1e3a8a] dark:text-blue-400'>
                    {surah.nama}
                  </span>
                  <span className='text-xs md:text-sm font-bold text-[#1e3a8a] dark:text-blue-400'>
                    {surah.namaLatin}
                  </span>
                </div>
                <div className='flex-1 h-px bg-slate-200 dark:bg-slate-700' />
              </div>

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
                    onBookmark={(a) =>
                      handleBookmark(a, surah.surahId, surah.namaLatin)
                    }
                    onLastRead={(a) =>
                      handleLastRead(a, surah.surahId, surah.namaLatin)
                    }
                    onCopy={(a, name) => handleCopy(a, name, surah.surahId)}
                    onPlayAudio={(a) =>
                      handlePlayAudio(a, surah.surahId, surah.namaLatin)
                    }
                    copiedId={copiedId}
                  />
                ))}
              </div>
            </div>
          ))}

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
                Juz {Number(number) + 1}{' '}
                <ArrowLeft size={18} className='rotate-180' />
              </button>
            )}
          </div>
        )}
      </main>

      {/* AUDIO PLAYER */}
      {showPlayer && audioInfo && (
        <AudioPlayer
          currentAyat={audioInfo.ayat}
          label={`${audioInfo.surahName} — Ayat ${audioInfo.ayat.nomorAyat}`}
          onPrev={() => handleAudioNav(-1)}
          onNext={() => handleAudioNav(1)}
          onClose={() => {
            setShowPlayer(false);
            setAudioInfo(null);
          }}
        />
      )}
    </div>
  );
}
