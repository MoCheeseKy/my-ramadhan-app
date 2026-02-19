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
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Scroll,
} from 'lucide-react';

// ─── Tajwid (shared config) ───────────────────────────────────────────────────
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

function applyTajwid(arabText) {
  const rules = [
    { pattern: /([اوي](?=[^\u064B-\u065F]))/g, key: 'mad' },
    { pattern: /(نّ|مّ)/g, key: 'ghunnah' },
    { pattern: /([بجدقط]ْ)/g, key: 'qalqalah' },
    { pattern: /(نْ(?=[تثجدذزسشصضطظفقك]))/g, key: 'ikhfa' },
    { pattern: /(نْ(?=ب)|[ًٌٍ](?=\s*ب))/g, key: 'iqlab' },
  ];
  const highlights = [];
  rules.forEach(({ pattern, key }) => {
    const rule = TAJWID_RULES.find((r) => r.key === key);
    let match;
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
  return highlights;
}

// ─── Ayat Card (Juz version — shows surah name as group header) ──────────────
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
  const highlights = settings.tajwid ? applyTajwid(ayat.teksArab) : [];

  const renderArabic = () => {
    if (!settings.tajwid || !highlights.length) {
      return (
        <p
          className='font-amiri text-[2rem] leading-[2.4] text-slate-800 text-right'
          dir='rtl'
        >
          {ayat.teksArab}
        </p>
      );
    }
    const parts = [];
    let lastIdx = 0;
    [...highlights]
      .sort((a, b) => a.start - b.start)
      .forEach(({ start, end, color, bg }, i) => {
        if (start > lastIdx)
          parts.push(
            <span key={`t${i}`}>{ayat.teksArab.slice(lastIdx, start)}</span>,
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
      parts.push(<span key='tail'>{ayat.teksArab.slice(lastIdx)}</span>);
    return (
      <p
        className='font-amiri text-[2rem] leading-[2.4] text-slate-800 text-right'
        dir='rtl'
      >
        {parts}
      </p>
    );
  };

  return (
    <div
      id={`ayat-${surahNumber}-${ayat.nomorAyat}`}
      className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
        isLastRead
          ? 'bg-blue-50/60 border-[#1e3a8a] ring-2 ring-[#1e3a8a]/20'
          : 'bg-white border-slate-100 hover:border-blue-100'
      }`}
    >
      {/* Header */}
      <div className='flex items-center justify-between px-5 py-3 border-b border-slate-50'>
        <div className='flex items-center gap-2'>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
              isLastRead
                ? 'bg-[#1e3a8a] text-white'
                : 'bg-blue-50 text-[#1e3a8a]'
            }`}
          >
            {ayat.nomorAyat}
          </div>
          <span className='text-[10px] font-semibold text-slate-400'>
            {surahName}
          </span>
        </div>
        <div className='flex items-center gap-1'>
          <button
            onClick={() => onPlayAudio(ayat, surahNumber)}
            className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-[#1e3a8a] text-white' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={() => onCopy(ayat, surahName)}
            className='p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors'
          >
            {copiedId === `${surahNumber}-${ayat.nomorAyat}` ? (
              <Check size={15} className='text-emerald-500' />
            ) : (
              <Copy size={15} />
            )}
          </button>
          <button
            onClick={() => onBookmark(ayat, surahNumber, surahName)}
            className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            {isBookmarked ? (
              <BookmarkCheck size={15} />
            ) : (
              <Bookmark size={15} />
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className='px-5 py-4'>
        {hafalanMode && !revealed ? (
          <div className='relative'>
            <div className='blur-[6px] select-none pointer-events-none'>
              {settings.arab && (
                <p
                  className='font-amiri text-[2rem] leading-[2.4] text-right'
                  dir='rtl'
                >
                  {ayat.teksArab}
                </p>
              )}
              {settings.latin && (
                <p className='text-slate-500 text-[13px] italic mt-2'>
                  {ayat.teksLatin}
                </p>
              )}
              {settings.terjemahan && (
                <p className='text-slate-700 text-sm mt-3'>
                  "{ayat.teksIndonesia}"
                </p>
              )}
            </div>
            <button
              onClick={() => setRevealed(true)}
              className='absolute inset-0 flex items-center justify-center gap-2 text-[#1e3a8a] font-bold text-sm'
            >
              <Eye size={18} /> Intip Ayat
            </button>
          </div>
        ) : (
          <>
            {settings.arab && <div className='mb-3'>{renderArabic()}</div>}
            {settings.latin && (
              <p className='text-slate-500 text-[13px] italic mt-1 mb-2'>
                {ayat.teksLatin}
              </p>
            )}
            {settings.terjemahan && (
              <p className='text-slate-700 text-sm mt-2 pb-1'>
                "{ayat.teksIndonesia}"
              </p>
            )}
            {hafalanMode && revealed && (
              <button
                onClick={() => setRevealed(false)}
                className='mt-3 text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600'
              >
                <EyeOff size={12} /> Sembunyikan lagi
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className='px-5 pb-4'>
        <button
          onClick={() =>
            !isLastRead && onLastRead(ayat, surahNumber, surahName)
          }
          disabled={isLastRead}
          className={`w-full py-2.5 rounded-2xl border text-xs font-bold transition-all ${
            isLastRead
              ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] cursor-default'
              : 'border-dashed border-slate-200 text-slate-400 hover:text-[#1e3a8a] hover:border-[#1e3a8a]/40 hover:bg-blue-50/30'
          }`}
        >
          {isLastRead ? '✓ Terakhir Dibaca' : 'Tandai Terakhir Dibaca'}
        </button>
      </div>
    </div>
  );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────
function AudioPlayer({ currentAyat, surahName, onPrev, onNext, onClose }) {
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

  const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe'>
      <div className='max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl border border-slate-100 overflow-hidden'>
        <div className='h-1 bg-gradient-to-r from-[#1e3a8a] via-indigo-500 to-purple-500' />
        <div className='p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <p className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                Memutar
              </p>
              <p className='font-bold text-slate-800 text-sm'>
                {surahName} — Ayat {currentAyat?.nomorAyat}
              </p>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-full hover:bg-slate-100 transition-colors'
            >
              <X size={16} className='text-slate-500' />
            </button>
          </div>
          <div className='flex items-center gap-3 mb-3'>
            <span className='text-[10px] tabular-nums text-slate-400 w-8'>
              {fmt(currentTime)}
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
              className='flex-1 h-1.5 rounded-full accent-[#1e3a8a] cursor-pointer'
            />
            <span className='text-[10px] tabular-nums text-slate-400 w-8'>
              {fmt(duration)}
            </span>
          </div>
          <div className='flex items-center justify-center gap-4'>
            <button
              onClick={onPrev}
              className='p-2 text-slate-500 hover:text-[#1e3a8a] transition-colors'
            >
              <SkipBack size={22} />
            </button>
            <button
              onClick={togglePlay}
              className='w-12 h-12 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center hover:bg-[#162d6e] transition-colors shadow-lg'
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button
              onClick={onNext}
              className='p-2 text-slate-500 hover:text-[#1e3a8a] transition-colors'
            >
              <SkipForward size={22} />
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function JuzReader() {
  const router = useRouter();
  const { number } = router.query;
  const { user } = useUser();

  const [juzData, setJuzData] = useState(null); // { juz, juzStartSurahNumber, ... , ayat: [{surahId, surahName, ayat:[]}] }
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    arab: true,
    latin: true,
    terjemahan: true,
    tajwid: false,
  });
  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTajwidInfo, setShowTajwidInfo] = useState(false);

  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [currentAyatAudio, setCurrentAyatAudio] = useState(null); // { ayat, surahName }
  const [showPlayer, setShowPlayer] = useState(false);

  // Flatten all ayat for audio prev/next
  const allAyatFlat =
    juzData?.surat?.flatMap((s) =>
      s.ayat.map((a) => ({ ...a, surahName: s.namaLatin, surahId: s.nomor })),
    ) || [];

  useEffect(() => {
    if (!number) return;
    fetchJuz();
    loadUserData();
  }, [number, user]);

  const fetchJuz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://equran.id/api/v2/juz/${number}`);
      const json = await res.json();
      setJuzData(json.data);
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

  const saveBookmarks = async (newB) => {
    setBookmarks(newB);
    localStorage.setItem('myRamadhan_quran_bookmarks', JSON.stringify(newB));
    if (user)
      await supabase
        .from('users')
        .update({ quran_bookmarks: newB })
        .eq('personal_code', user.personal_code);
  };

  const handleBookmark = async (ayat, surahId, surahName) => {
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

  const handleCopy = (ayat, surahName) => {
    const text = `${surahName} Ayat ${ayat.nomorAyat}\n\n${ayat.teksArab}\n\n${ayat.teksLatin}\n\n"${ayat.teksIndonesia}"\n\n(Sumber: MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(`${ayat.surahId || ''}-${ayat.nomorAyat}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayAudio = (ayat, surahName) => {
    const key = `${ayat.nomorAyat}-${surahName}`;
    if (currentAyatAudio?.key === key && showPlayer) {
      setShowPlayer(false);
      setCurrentAyatAudio(null);
    } else {
      setCurrentAyatAudio({ ...ayat, surahName, key });
      setShowPlayer(true);
    }
  };

  const handleAudioNext = () => {
    if (!currentAyatAudio) return;
    const idx = allAyatFlat.findIndex(
      (a) =>
        a.nomorAyat === currentAyatAudio.nomorAyat &&
        a.surahName === currentAyatAudio.surahName,
    );
    if (idx < allAyatFlat.length - 1) {
      const next = allAyatFlat[idx + 1];
      setCurrentAyatAudio({
        ...next,
        key: `${next.nomorAyat}-${next.surahName}`,
      });
    }
  };

  const handleAudioPrev = () => {
    if (!currentAyatAudio) return;
    const idx = allAyatFlat.findIndex(
      (a) =>
        a.nomorAyat === currentAyatAudio.nomorAyat &&
        a.surahName === currentAyatAudio.surahName,
    );
    if (idx > 0) {
      const prev = allAyatFlat[idx - 1];
      setCurrentAyatAudio({
        ...prev,
        key: `${prev.nomorAyat}-${prev.surahName}`,
      });
    }
  };

  // Scroll to anchor
  useEffect(() => {
    if (!loading && juzData && window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [loading, juzData]);

  return (
    <div
      className='min-h-screen bg-[#F6F9FC] text-slate-800 selection:bg-blue-200'
      style={{ paddingBottom: showPlayer ? '140px' : '80px' }}
    >
      <Head>
        <title>Juz {number} - MyRamadhan</title>
      </Head>

      {/* ── HEADER ── */}
      <header className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-3'>
        <div className='max-w-md mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.back()}
              className='p-2 -ml-1 rounded-full hover:bg-slate-100 transition-colors'
            >
              <ArrowLeft size={20} className='text-slate-600' />
            </button>
            <div>
              <h1 className='font-bold text-base text-slate-800'>
                Juz {number}
              </h1>
              {!loading && juzData && (
                <p className='text-[10px] text-slate-400'>
                  {juzData.surat?.[0]?.namaLatin} —{' '}
                  {juzData.surat?.[juzData.surat.length - 1]?.namaLatin}
                </p>
              )}
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setHafalanMode(!hafalanMode)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border flex items-center gap-1 ${
                hafalanMode
                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                  : 'text-slate-500 border-slate-200 hover:border-[#1e3a8a]/30'
              }`}
            >
              {hafalanMode ? <Eye size={14} /> : <EyeOff size={14} />}
              <span className='hidden sm:inline'>
                {hafalanMode ? 'Hafalan' : 'Hafalan'}
              </span>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-[#1e3a8a] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className='max-w-md mx-auto mt-3 pt-3 border-t border-slate-100'>
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
                      ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {settings.tajwid && (
              <button
                onClick={() => setShowTajwidInfo(!showTajwidInfo)}
                className='flex items-center gap-1.5 text-[11px] text-[#1e3a8a] font-semibold hover:underline mb-2'
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
                      <p className='text-[10px] text-slate-400 leading-tight'>
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

      <main className='max-w-md mx-auto p-5 space-y-2'>
        {/* Juz header */}
        {!loading && juzData && (
          <div className='bg-gradient-to-br from-[#1e3a8a] to-[#312e81] rounded-3xl p-5 text-white text-center relative overflow-hidden mb-4'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_70%)]' />
            <div className='relative z-10'>
              <p className='text-[10px] uppercase tracking-[0.3em] text-indigo-200 mb-1'>
                Al-Qur'an
              </p>
              <h2 className='text-4xl font-black text-white'>Juz {number}</h2>
              <p className='text-indigo-200 text-sm mt-1'>
                {juzData.surat?.[0]?.namaLatin} —{' '}
                {juzData.surat?.[juzData.surat.length - 1]?.namaLatin}
              </p>
            </div>
          </div>
        )}

        {hafalanMode && (
          <div className='bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2 mb-2'>
            <EyeOff size={16} className='text-amber-600 shrink-0' />
            <p className='text-amber-700 text-xs font-semibold'>
              Mode Hafalan aktif — klik "Intip Ayat" untuk melihat tiap ayat
            </p>
          </div>
        )}

        {loading &&
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-48 bg-slate-200 animate-pulse rounded-3xl'
            />
          ))}

        {/* Ayat grouped by surah */}
        {!loading &&
          juzData?.surat?.map((surah) => (
            <div key={surah.nomor}>
              {/* Surah separator */}
              <div className='flex items-center gap-3 py-3 my-2'>
                <div className='flex-1 h-px bg-slate-200' />
                <div className='flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5'>
                  <span className='text-[#1e3a8a] font-amiri text-lg'>
                    {surah.nama}
                  </span>
                  <span className='text-[11px] font-bold text-[#1e3a8a]'>
                    {surah.namaLatin}
                  </span>
                </div>
                <div className='flex-1 h-px bg-slate-200' />
              </div>

              <div className='space-y-3'>
                {surah.ayat.map((ayat) => (
                  <AyatCard
                    key={`${surah.nomor}-${ayat.nomorAyat}`}
                    ayat={ayat}
                    surahName={surah.namaLatin}
                    surahNumber={surah.nomor}
                    settings={settings}
                    hafalanMode={hafalanMode}
                    isBookmarked={bookmarks.some(
                      (b) =>
                        b.surahId === surah.nomor &&
                        b.ayahNumber === ayat.nomorAyat,
                    )}
                    isLastRead={
                      lastRead?.surahId === surah.nomor &&
                      lastRead?.ayahNumber === ayat.nomorAyat
                    }
                    isPlaying={
                      currentAyatAudio?.nomorAyat === ayat.nomorAyat &&
                      currentAyatAudio?.surahName === surah.namaLatin &&
                      showPlayer
                    }
                    onBookmark={handleBookmark}
                    onLastRead={handleLastRead}
                    onCopy={handleCopy}
                    onPlayAudio={(a) => handlePlayAudio(a, surah.namaLatin)}
                    copiedId={copiedId}
                  />
                ))}
              </div>
            </div>
          ))}

        {/* Nav juz */}
        {!loading && (
          <div className='flex gap-3 pt-4'>
            {Number(number) > 1 && (
              <button
                onClick={() => router.push(`/quran/juz/${Number(number) - 1}`)}
                className='flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-[#1e3a8a] hover:text-[#1e3a8a] transition-all flex items-center justify-center gap-2'
              >
                <ArrowLeft size={16} /> Juz {Number(number) - 1}
              </button>
            )}
            {Number(number) < 30 && (
              <button
                onClick={() => router.push(`/quran/juz/${Number(number) + 1}`)}
                className='flex-1 py-3 rounded-2xl bg-[#1e3a8a] text-white text-sm font-bold hover:bg-[#162d6e] transition-all flex items-center justify-center gap-2'
              >
                Juz {Number(number) + 1}{' '}
                <ArrowLeft size={16} className='rotate-180' />
              </button>
            )}
          </div>
        )}
      </main>

      {showPlayer && currentAyatAudio && (
        <AudioPlayer
          currentAyat={currentAyatAudio}
          surahName={currentAyatAudio.surahName}
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
