'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ChevronRight,
  X,
  Sparkles,
  Heart,
  Star,
  Moon,
  Sun,
  BookOpen,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';
import { DOA_CATEGORIES } from '@/data/doaData';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ICON_MAP = {
  '🌙': Moon,
  '🕌': Heart,
  '⭐': Star,
  '📿': BookOpen,
  '🌅': Sun,
  '✨': Sparkles,
  '📖': BookOpen,
};

// ─── DoaCard ─────────────────────────────────────────────────────────────────
function DoaCard({ doa, isBookmarked, onBookmark, onCopy, copiedId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className='bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:border-rose-100'>
      {/* Header — always visible, tap to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className='w-full flex items-center justify-between px-5 py-4 text-left'
      >
        <div className='flex-1 pr-3'>
          <p className='font-bold text-slate-800 text-sm leading-tight'>
            {doa.title}
          </p>
          {doa.count && (
            <span className='mt-1 inline-block bg-rose-50 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded-full'>
              {doa.count}×
            </span>
          )}
          {doa.waktu && (
            <span
              className={`mt-1 ml-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                doa.waktu === 'pagi'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {doa.waktu === 'pagi' ? '🌅 Pagi' : '🌙 Petang'}
            </span>
          )}
        </div>
        <ChevronRight
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Arabic preview (compact) */}
      {!expanded && (
        <div className='px-5 pb-4'>
          <p
            className='font-amiri text-xl text-slate-600 text-right leading-[2]'
            dir='rtl'
            style={{ opacity: 0.7 }}
          >
            {doa.arab.length > 60 ? doa.arab.slice(0, 60) + '...' : doa.arab}
          </p>
        </div>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className='px-5 pb-2 border-t border-slate-50'>
              {/* Arabic */}
              <p
                className='font-amiri text-[1.8rem] leading-[2.3] text-slate-800 text-right pt-4 pb-2'
                dir='rtl'
              >
                {doa.arab}
              </p>

              {/* Latin */}
              <p className='text-slate-500 text-[13px] italic leading-relaxed pb-3 border-b border-slate-50'>
                {doa.latin}
              </p>

              {/* Arti */}
              <p className='text-slate-700 text-sm leading-relaxed py-3'>
                "{doa.arti}"
              </p>

              {/* Source + actions */}
              <div className='flex items-center justify-between pt-1 pb-4'>
                <span className='bg-rose-50 text-rose-500 text-[10px] font-bold px-3 py-1.5 rounded-xl'>
                  {doa.source}
                </span>
                <div className='flex items-center gap-1'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(doa);
                    }}
                    className='p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors'
                  >
                    {copiedId === doa.id ? (
                      <Check size={15} className='text-emerald-500' />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookmark(doa);
                    }}
                    className={`p-2 rounded-full transition-colors ${
                      isBookmarked
                        ? 'text-rose-500 bg-rose-50'
                        : 'text-slate-400 hover:bg-slate-100'
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DoaPage() {
  const router = useRouter();
  const { user } = useUser();

  const [view, setView] = useState('home'); // 'home' | 'category' | 'bookmarks'
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('doa_bookmarks')
        .eq('personal_code', user.personal_code)
        .single();
      if (data?.doa_bookmarks) setBookmarks(data.doa_bookmarks);
    } else {
      setBookmarks(
        JSON.parse(localStorage.getItem('myRamadhan_doa_bookmarks')) || [],
      );
    }
  };

  const saveBookmarks = async (newB) => {
    setBookmarks(newB);
    localStorage.setItem('myRamadhan_doa_bookmarks', JSON.stringify(newB));
    if (user)
      await supabase
        .from('users')
        .update({ doa_bookmarks: newB })
        .eq('personal_code', user.personal_code);
  };

  const handleBookmark = (doa) => {
    const isMarked = bookmarks.some((b) => b.id === doa.id);
    const newB = isMarked
      ? bookmarks.filter((b) => b.id !== doa.id)
      : [...bookmarks, doa];
    saveBookmarks(newB);
  };

  const handleCopy = (doa) => {
    const text = `${doa.title}\n\n${doa.arab}\n\n${doa.latin}\n\n"${doa.arti}"\n\n(Sumber: ${doa.source}) — MyRamadhan`;
    navigator.clipboard.writeText(text);
    setCopiedId(doa.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Search results ─────────────────────────────────────────────────────────
  const searchResults =
    searchQuery.length > 1
      ? DOA_CATEGORIES.flatMap((cat) =>
          cat.items
            .filter(
              (d) =>
                d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.arti.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.latin.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((d) => ({ ...d, _catLabel: cat.label })),
        )
      : [];

  // ─── VIEW: HOME ─────────────────────────────────────────────────────────────
  if (view === 'home') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-rose-100'>
        <Head>
          <title>Doa & Dzikir - MyRamadhan</title>
        </Head>

        {/* Header */}
        <header className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4'>
          <div className='max-w-md mx-auto'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => router.push('/')}
                  className='p-2 -ml-1 rounded-full hover:bg-slate-100 transition-colors'
                >
                  <ArrowLeft size={20} className='text-slate-600' />
                </button>
                <h1 className='font-bold text-xl flex items-center gap-2'>
                  <Heart size={22} className='text-rose-500' />
                  <span>Doa & Dzikir</span>
                </h1>
              </div>
              <button
                onClick={() => setView('bookmarks')}
                className='p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors'
              >
                <Bookmark size={18} />
              </button>
            </div>
            <div className='relative'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
                size={16}
              />
              <input
                type='text'
                placeholder='Cari nama doa, arti...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-11 pr-10 py-3 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-rose-300 transition-all'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2'
                >
                  <X size={14} className='text-slate-400' />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className='max-w-md mx-auto p-5'>
          {/* Search results */}
          {searchQuery.length > 1 ? (
            <div className='space-y-3'>
              {searchResults.length === 0 ? (
                <div className='text-center py-16 opacity-40'>
                  <p className='text-sm'>
                    Tidak ada hasil untuk "{searchQuery}"
                  </p>
                </div>
              ) : (
                <>
                  <p className='text-xs text-slate-400 font-semibold mb-3'>
                    {searchResults.length} hasil ditemukan
                  </p>
                  {searchResults.map((doa) => (
                    <div key={doa.id}>
                      <p className='text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1 px-1'>
                        {doa._catLabel}
                      </p>
                      <DoaCard
                        doa={doa}
                        isBookmarked={bookmarks.some((b) => b.id === doa.id)}
                        onBookmark={handleBookmark}
                        onCopy={handleCopy}
                        copiedId={copiedId}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <>
              {/* Hero banner */}
              <div className='mb-6 bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg shadow-rose-200'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]' />
                <div className='absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl' />
                <div className='relative z-10'>
                  <p className='text-[10px] uppercase tracking-[0.3em] text-rose-100 mb-1'>
                    MyRamadhan
                  </p>
                  <h2 className='text-2xl font-black text-white mb-1'>
                    Doa & Dzikir
                  </h2>
                  <p className='text-rose-100 text-sm'>
                    {DOA_CATEGORIES.reduce((a, c) => a + c.items.length, 0)} doa
                    dari {DOA_CATEGORIES.length} kategori
                  </p>
                  {bookmarks.length > 0 && (
                    <button
                      onClick={() => setView('bookmarks')}
                      className='mt-3 bg-white/20 border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-white/30 transition-colors flex items-center gap-1.5 w-fit'
                    >
                      <BookmarkCheck size={13} /> {bookmarks.length} doa
                      disimpan
                    </button>
                  )}
                </div>
              </div>

              {/* Category grid */}
              <p className='text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3'>
                Kategori
              </p>
              <div className='grid grid-cols-2 gap-3'>
                {DOA_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat);
                      setView('category');
                    }}
                    className='bg-white rounded-[1.5rem] border border-slate-100 p-4 text-left hover:border-rose-200 hover:shadow-md transition-all duration-300 active:scale-[0.98] group'
                  >
                    <div className='text-2xl mb-3'>{cat.icon}</div>
                    <h3 className='font-bold text-slate-800 text-sm leading-tight group-hover:text-rose-600 transition-colors'>
                      {cat.label}
                    </h3>
                    <p className='text-[10px] text-slate-400 mt-1'>
                      {cat.items.length} doa
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // ─── VIEW: CATEGORY ──────────────────────────────────────────────────────────
  if (view === 'category' && activeCategory) {
    // Special layout for Asmaul Husna (grid of names)
    const isAsmaul = activeCategory.id === 'asmaul-husna';

    return (
      <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-rose-100'>
        <Head>
          <title>{activeCategory.label} - MyRamadhan</title>
        </Head>

        <header className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4'>
          <div className='max-w-md mx-auto flex items-center gap-3'>
            <button
              onClick={() => setView('home')}
              className='p-2 -ml-1 rounded-full hover:bg-slate-100 transition-colors'
            >
              <ArrowLeft size={20} className='text-slate-600' />
            </button>
            <div>
              <h1 className='font-bold text-base text-slate-800 flex items-center gap-2'>
                <span>{activeCategory.icon}</span>
                {activeCategory.label}
              </h1>
              <p className='text-[10px] text-slate-400'>
                {activeCategory.items.length} doa
              </p>
            </div>
          </div>
        </header>

        <main className='max-w-md mx-auto p-5'>
          {/* Category hero */}
          <div className='bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-5 text-white mb-5 relative overflow-hidden'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(255,255,255,0.15),transparent_65%)]' />
            <div className='relative z-10'>
              <p className='text-4xl mb-2'>{activeCategory.icon}</p>
              <h2 className='font-black text-xl'>{activeCategory.label}</h2>
              <p className='text-rose-100 text-xs mt-1'>
                {activeCategory.description}
              </p>
            </div>
          </div>

          {/* Asmaul Husna: special grid layout */}
          {isAsmaul ? (
            <div className='grid grid-cols-2 gap-3'>
              {activeCategory.items.map((asma, i) => (
                <div
                  key={asma.id}
                  className='bg-white rounded-2xl border border-slate-100 p-4 hover:border-rose-200 transition-all'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <span className='w-7 h-7 rounded-lg bg-rose-50 text-rose-500 text-[11px] font-black flex items-center justify-center'>
                      {i + 1}
                    </span>
                    <button
                      onClick={() => handleBookmark(asma)}
                      className={`p-1.5 rounded-full transition-colors ${bookmarks.some((b) => b.id === asma.id) ? 'text-rose-500' : 'text-slate-300'}`}
                    >
                      {bookmarks.some((b) => b.id === asma.id) ? (
                        <BookmarkCheck size={14} />
                      ) : (
                        <Bookmark size={14} />
                      )}
                    </button>
                  </div>
                  <p
                    className='font-amiri text-2xl text-slate-800 text-right mb-1'
                    dir='rtl'
                  >
                    {asma.arab}
                  </p>
                  <p className='font-bold text-rose-600 text-sm'>
                    {asma.title}
                  </p>
                  <p className='text-slate-500 text-[11px] leading-tight mt-0.5'>
                    {asma.arti}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Normal list layout */
            <div className='space-y-3'>
              {activeCategory.items.map((doa) => (
                <DoaCard
                  key={doa.id}
                  doa={doa}
                  isBookmarked={bookmarks.some((b) => b.id === doa.id)}
                  onBookmark={handleBookmark}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ─── VIEW: BOOKMARKS ─────────────────────────────────────────────────────────
  if (view === 'bookmarks') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-rose-100'>
        <Head>
          <title>Doa Disimpan - MyRamadhan</title>
        </Head>
        <header className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex items-center gap-3'>
          <div className='max-w-md mx-auto flex items-center gap-3 w-full'>
            <button
              onClick={() => setView('home')}
              className='p-2 -ml-1 rounded-full hover:bg-slate-100 transition-colors'
            >
              <ArrowLeft size={20} className='text-slate-600' />
            </button>
            <h1 className='font-bold text-xl flex items-center gap-2'>
              <BookmarkCheck size={20} className='text-rose-500' /> Disimpan
            </h1>
          </div>
        </header>

        <main className='max-w-md mx-auto p-5 space-y-3'>
          {bookmarks.length === 0 ? (
            <div className='text-center py-20 opacity-40'>
              <Bookmark size={48} className='mx-auto mb-4 text-slate-300' />
              <p className='text-sm font-medium'>
                Belum ada doa yang disimpan.
              </p>
              <p className='text-xs text-slate-400 mt-1'>
                Tap ikon bookmark pada doa untuk menyimpannya.
              </p>
            </div>
          ) : (
            <>
              <p className='text-xs text-slate-400 font-semibold'>
                {bookmarks.length} doa tersimpan
              </p>
              {bookmarks.map((doa) => (
                <DoaCard
                  key={doa.id}
                  doa={doa}
                  isBookmarked={true}
                  onBookmark={handleBookmark}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))}
            </>
          )}
        </main>
      </div>
    );
  }

  return null;
}
