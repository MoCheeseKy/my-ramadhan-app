import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Search,
  Scale,
  BookOpen,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { fiqihRamadhanMaster } from '@/data/fiqihData';

// ─── Konfigurasi Kategori ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'niatDanSyarat',
    label: 'Niat & Syarat',
    emoji: '📋',
    color: 'amber',
    desc: 'Rukun niat dan syarat sah puasa',
  },
  {
    key: 'syaratWajibDanSah',
    label: 'Syarat Wajib & Sah',
    emoji: '📜',
    color: 'amber',
    desc: 'Syarat wajib dan sahnya ibadah puasa',
  },
  {
    key: 'pembatalPuasa',
    label: 'Pembatal Puasa',
    emoji: '⚠️',
    color: 'rose',
    desc: 'Hal-hal yang membatalkan puasa',
  },
  {
    key: 'tidakMembatalkanPuasa',
    label: 'Tidak Membatalkan',
    emoji: '✅',
    color: 'emerald',
    desc: 'Yang dibolehkan saat berpuasa',
  },
  {
    key: 'sunnahDanAdab',
    label: 'Sunnah & Adab',
    emoji: '🌙',
    color: 'indigo',
    desc: 'Amalan sunnah dan adab puasa',
  },
  {
    key: 'makruh',
    label: 'Makruh',
    emoji: '🔸',
    color: 'orange',
    desc: 'Perbuatan yang dimakruhkan',
  },
  {
    key: 'wanita',
    label: 'Fiqih Wanita',
    emoji: '🌸',
    color: 'pink',
    desc: 'Hukum khusus bagi wanita',
  },
  {
    key: 'safarDanKondisiKhusus',
    label: 'Safar & Kondisi Khusus',
    emoji: '✈️',
    color: 'sky',
    desc: 'Hukum saat perjalanan & kondisi darurat',
  },
  {
    key: 'medisKontemporer',
    label: 'Medis Kontemporer',
    emoji: '🏥',
    color: 'teal',
    desc: 'Fatwa medis modern terkait puasa',
  },
  {
    key: 'qadhaFidyahKaffarah',
    label: 'Qadha, Fidyah & Kaffarah',
    emoji: '⚖️',
    color: 'violet',
    desc: 'Penggantian dan denda puasa',
  },
  {
    key: 'khilafiyahMazhab',
    label: 'Khilafiyah Mazhab',
    emoji: '📚',
    color: 'slate',
    desc: 'Perbedaan pendapat antar mazhab',
  },
  {
    key: 'zakatFitrah',
    label: 'Zakat Fitrah',
    emoji: '🌾',
    color: 'lime',
    desc: 'Hukum dan tata cara zakat fitrah',
  },
  {
    key: 'lailatulQadarDanItikaf',
    label: "I'tikaf & Lailatul Qadar",
    emoji: '🕌',
    color: 'cyan',
    desc: "Panduan i'tikaf dan 10 malam terakhir",
  },
  {
    key: 'amalanIdulFitriDanSyawal',
    label: 'Idul Fitri & Syawal',
    emoji: '🎉',
    color: 'yellow',
    desc: 'Amalan hari raya dan puasa Syawal',
  },
  {
    key: 'penentuanHilal',
    label: 'Hilal & Penentuan Ramadhan',
    emoji: '🌙',
    color: 'yellow',
    desc: 'Metode penentuan awal Ramadhan',
  },
  {
    key: 'kasusModern',
    label: 'Kasus Modern',
    emoji: '💡',
    color: 'purple',
    desc: 'Fatwa isu-isu kontemporer',
  },
  {
    key: 'etikaSosialDanDigital',
    label: 'Etika Sosial & Digital',
    emoji: '📱',
    color: 'indigo',
    desc: 'Adab berpuasa di era digital',
  },
  {
    key: 'parentingRamadhan',
    label: 'Parenting Ramadhan',
    emoji: '👨‍👩‍👧',
    color: 'pink',
    desc: 'Mendidik anak berpuasa',
  },
  {
    key: 'tipsKesehatanRamadhan',
    label: 'Tips Kesehatan',
    emoji: '💊',
    color: 'teal',
    desc: 'Menjaga kesehatan saat berpuasa',
  },
  {
    key: 'faktaSejarahRamadhan',
    label: 'Fakta Sejarah',
    emoji: '🏛️',
    color: 'slate',
    desc: 'Peristiwa bersejarah di bulan Ramadhan',
  },
];

// Map warna per kategori untuk Tailwind (harus statik agar tidak di-purge)
const COLOR_MAP = {
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    badge:
      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-400/30',
    dot: 'bg-amber-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-400/30',
    dot: 'bg-rose-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge:
      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-400/30',
    dot: 'bg-emerald-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    badge:
      'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
    ring: 'ring-indigo-400/30',
    dot: 'bg-indigo-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
    badge:
      'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    ring: 'ring-orange-400/30',
    dot: 'bg-orange-400',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
    badge: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300',
    ring: 'ring-pink-400/30',
    dot: 'bg-pink-400',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-800',
    badge: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
    ring: 'ring-sky-400/30',
    dot: 'bg-sky-400',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    badge: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
    ring: 'ring-teal-400/30',
    dot: 'bg-teal-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    badge:
      'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    ring: 'ring-violet-400/30',
    dot: 'bg-violet-400',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    ring: 'ring-slate-400/30',
    dot: 'bg-slate-400',
  },
  lime: {
    bg: 'bg-lime-50 dark:bg-lime-950/30',
    text: 'text-lime-700 dark:text-lime-400',
    border: 'border-lime-200 dark:border-lime-800',
    badge: 'bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300',
    ring: 'ring-lime-400/30',
    dot: 'bg-lime-400',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
    ring: 'ring-cyan-400/30',
    dot: 'bg-cyan-400',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge:
      'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    ring: 'ring-yellow-400/30',
    dot: 'bg-yellow-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    badge:
      'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    ring: 'ring-purple-400/30',
    dot: 'bg-purple-400',
  },
};

// ─── Komponen FiqihCard ───────────────────────────────────────────────────────
function FiqihCard({ item, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.amber;
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-opacity-60 transition-all group p-5 h-full flex flex-col`}
    >
      <div className='flex items-start justify-between gap-3 mb-2'>
        <h3
          className={`font-bold text-slate-800 dark:text-slate-100 text-[15px] md:text-base leading-snug group-hover:${c.text} transition-colors flex-1`}
        >
          {item.title}
        </h3>
        <div className={`shrink-0 p-1.5 md:p-2 rounded-xl ${c.bg}`}>
          <BookOpen size={15} className={`${c.text} md:w-5 md:h-5`} />
        </div>
      </div>
      <p className='text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3 flex-1'>
        {item.content}
      </p>
      <div className='flex items-center gap-2 flex-wrap'>
        <span className='text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
          Sumber
        </span>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${c.badge}`}
        >
          {item.source}
        </span>
      </div>
    </div>
  );
}

// ─── HALAMAN UTAMA ────────────────────────────────────────────────────────────
export default function FiqihPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null); // null = home

  // Gabungkan semua data untuk pencarian global
  const allItems = useMemo(() => {
    return CATEGORIES.flatMap((cat) => {
      const items = fiqihRamadhanMaster[cat.key] || [];
      return items.map((item) => ({
        ...item,
        _catKey: cat.key,
        _catLabel: cat.label,
        _catColor: cat.color,
        _catEmoji: cat.emoji,
      }));
    });
  }, []);

  // Data yang ditampilkan berdasarkan kondisi
  const displayItems = useMemo(() => {
    if (searchQuery.trim()) {
      // Mode pencarian global
      const q = searchQuery.toLowerCase();
      return allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q),
      );
    }
    if (activeCategory) {
      // Mode kategori
      return (fiqihRamadhanMaster[activeCategory] || []).map((item) => {
        const cat = CATEGORIES.find((c) => c.key === activeCategory);
        return {
          ...item,
          _catKey: activeCategory,
          _catColor: cat?.color || 'amber',
        };
      });
    }
    return [];
  }, [searchQuery, activeCategory, allItems]);

  const activeCatConfig = CATEGORIES.find((c) => c.key === activeCategory);
  const isSearchMode = searchQuery.trim().length > 0;
  const isHomeView = !isSearchMode && !activeCategory;

  // Jumlah item per kategori
  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach((cat) => {
      counts[cat.key] = (fiqihRamadhanMaster[cat.key] || []).length;
    });
    return counts;
  }, []);

  const totalItems = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-24 selection:bg-amber-200 dark:selection:bg-amber-900'>
      <Head>
        <title>Fiqih Ramadhan - MyRamadhan</title>
      </Head>

      {/* ── HEADER ADAPTIF ── */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-5 py-3'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto'>
          {/* Baris atas: back + judul + badge */}
          <div className='flex items-center gap-3 mb-3'>
            <button
              onClick={() => {
                if (activeCategory && !isSearchMode) {
                  setActiveCategory(null);
                } else {
                  router.push('/');
                }
              }}
              className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
            >
              <ArrowLeft
                size={20}
                className='text-slate-600 dark:text-slate-400'
              />
            </button>

            <div className='flex-1 min-w-0'>
              {activeCategory && !isSearchMode ? (
                <div className='flex items-center gap-2'>
                  <span className='text-xl md:text-2xl'>
                    {activeCatConfig?.emoji}
                  </span>
                  <div>
                    <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-100 leading-tight truncate'>
                      {activeCatConfig?.label}
                    </h1>
                    <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500'>
                      {displayItems.length} materi tersedia
                    </p>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Scale
                    size={20}
                    className='text-amber-500 dark:text-amber-400 shrink-0 md:w-6 md:h-6'
                  />
                  <h1 className='font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100'>
                    Fiqih Ramadhan
                  </h1>
                </div>
              )}
            </div>

            {isHomeView && (
              <span className='text-[10px] md:text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full shrink-0'>
                {totalItems} Materi
              </span>
            )}
          </div>

          {/* Search bar */}
          <div className='relative'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
              size={16}
            />
            <input
              type='text'
              placeholder='Cari topik fiqih (contoh: batal, niat, sunnah)...'
              className='w-full pl-11 pr-10 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-amber-400 outline-none text-[13px] md:text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 transition-colors'
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Chips kategori (strip horizontal) */}
          {!isHomeView && (
            <div className='flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1'>
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setSearchQuery('');
                }}
                className='shrink-0 text-[11px] md:text-xs font-bold px-3 py-1.5 md:py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
              >
                Semua Kategori
              </button>
              {CATEGORIES.filter((c) => categoryCounts[c.key] > 0).map(
                (cat) => {
                  const c = COLOR_MAP[cat.color];
                  const isActive = activeCategory === cat.key && !isSearchMode;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setActiveCategory(cat.key);
                        setSearchQuery('');
                      }}
                      className={`shrink-0 text-[11px] md:text-xs font-bold px-3 py-1.5 md:py-2 rounded-xl border transition-colors ${
                        isActive
                          ? `${c.bg} ${c.text} ${c.border}`
                          : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN ADAPTIF ── */}
      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 pt-4 pb-6 md:pt-6'>
        {/* ── HOME VIEW: Grid Kategori ── */}
        {isHomeView && (
          <div className='space-y-4 md:space-y-6'>
            {/* Hero strip */}
            <div className='bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 text-white relative overflow-hidden shadow-lg mb-2 md:mb-4'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]' />
              <div className='relative z-10'>
                <p className='text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-amber-100 mb-1 md:mb-2'>
                  Ensiklopedi
                </p>
                <h2 className='text-2xl md:text-4xl font-black text-white leading-tight mb-2'>
                  Fiqih Puasa Ramadhan
                </h2>
                <p className='text-amber-100 text-xs md:text-sm leading-relaxed'>
                  {totalItems} materi dari{' '}
                  {CATEGORIES.filter((c) => categoryCounts[c.key] > 0).length}{' '}
                  kategori · Rujukan lengkap hukum puasa
                </p>
              </div>
            </div>

            {/* Grid kategori (2 mobile, 3 tablet, 4 desktop) */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'>
              {CATEGORIES.map((cat) => {
                const c = COLOR_MAP[cat.color];
                const count = categoryCounts[cat.key];
                const isEmpty = count === 0;
                return (
                  <button
                    key={cat.key}
                    onClick={() => !isEmpty && setActiveCategory(cat.key)}
                    disabled={isEmpty}
                    className={`text-left p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all h-full flex flex-col justify-between min-h-[140px] md:min-h-[160px] ${
                      isEmpty
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 opacity-40 cursor-not-allowed'
                        : `bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:${c.border} hover:shadow-md active:scale-95 cursor-pointer`
                    }`}
                  >
                    <div>
                      <div
                        className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl mb-3 md:mb-4 ${isEmpty ? 'bg-slate-100 dark:bg-slate-700' : c.bg}`}
                      >
                        {cat.emoji}
                      </div>
                      <p className='font-bold text-slate-800 dark:text-slate-100 text-[13px] md:text-sm leading-tight mb-1 md:mb-2'>
                        {cat.label}
                      </p>
                      <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500 leading-snug line-clamp-2 mb-3'>
                        {cat.desc}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] md:text-xs font-black px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg w-fit ${isEmpty ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-600' : c.badge}`}
                    >
                      {count > 0 ? `${count} materi` : 'Segera hadir'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SEARCH RESULT VIEW ── */}
        {isSearchMode && (
          <div className='space-y-3'>
            <div className='flex items-center justify-between mb-2 md:mb-4'>
              <p className='text-xs md:text-sm text-slate-500 dark:text-slate-400'>
                <span className='font-bold text-slate-700 dark:text-slate-300'>
                  {displayItems.length}
                </span>{' '}
                hasil untuk &quot;{searchQuery}&quot;
              </p>
            </div>

            {displayItems.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5'>
                {displayItems.map((item) => (
                  <div
                    key={`${item._catKey}-${item.id}`}
                    className='relative h-full flex flex-col'
                  >
                    <div className='flex items-center gap-1.5 mb-1.5 ml-1 shrink-0'>
                      <span
                        className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${COLOR_MAP[item._catColor]?.badge}`}
                      >
                        {item._catEmoji} {item._catLabel}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <FiqihCard item={item} color={item._catColor} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState query={searchQuery} router={router} />
            )}
          </div>
        )}

        {/* ── CATEGORY VIEW ── */}
        {activeCategory && !isSearchMode && (
          <div className='space-y-3'>
            {displayItems.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5'>
                {displayItems.map((item) => (
                  <FiqihCard
                    key={item.id}
                    item={item}
                    color={activeCatConfig?.color || 'amber'}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-20 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl md:max-w-xl md:mx-auto'>
                <div className='text-4xl mb-3'>🚧</div>
                <p className='font-bold text-slate-600 dark:text-slate-400 mb-1'>
                  Materi Segera Hadir
                </p>
                <p className='text-sm text-slate-400 dark:text-slate-500'>
                  Kategori ini sedang dalam penyusunan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer count */}
        {!isHomeView && displayItems.length > 0 && (
          <div className='text-center pt-8 md:pt-10'>
            <p className='text-xs text-slate-400 dark:text-slate-500'>
              Menampilkan {displayItems.length} materi
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query, router }) {
  return (
    <div className='text-center py-16 md:py-24 px-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl md:max-w-2xl md:mx-auto shadow-sm'>
      <div className='w-16 h-16 md:w-20 md:h-20 bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4'>
        <AlertCircle size={30} className='md:w-10 md:h-10' />
      </div>
      <h3 className='font-bold text-slate-700 dark:text-slate-300 mb-2 md:text-lg'>
        Materi tidak ditemukan
      </h3>
      <p className='text-sm md:text-base text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-4 md:px-12'>
        Pertanyaan fiqihmu belum ada di database. Tanyakan langsung ke Konsultan
        AI Ramatalk!
      </p>
      <button
        onClick={() =>
          router.push(`/ramatalk?mode=fiqih&q=${encodeURIComponent(query)}`)
        }
        className='px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold text-sm md:text-base shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto'
      >
        <Sparkles size={16} className='md:w-5 md:h-5' /> Tanya Fiqih ke Ramatalk
      </button>
    </div>
  );
}
