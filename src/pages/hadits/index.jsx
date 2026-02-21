'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Search,
  Share2,
  Check,
  Sparkles,
  Book,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  BookmarkCheck,
  ScrollText,
  Settings2,
  Eye,
  EyeOff,
  Type,
  Navigation,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useUser from '@/hooks/useUser';

const API_BASE = 'https://api.hadith.gading.dev';

const ARAB_SIZES = [
  { key: 'sm', label: 'S', size: '22px' },
  { key: 'md', label: 'M', size: '28px' },
  { key: 'lg', label: 'L', size: '36px' },
];

export default function HaditsPage() {
  const router = useRouter();
  const { user } = useUser();

  const [view, setView] = useState('home'); // 'home', 'read', 'bookmarks'

  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBook, setSelectedBook] = useState(null);
  const [hadiths, setHadiths] = useState([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [copiedId, setCopiedId] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);

  // --- STATE SETTINGS & HAFALAN ---
  const [settings, setSettings] = useState({
    arab: true,
    terjemahan: true,
    arabSize: 'md',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [hafalanMode, setHafalanMode] = useState(false);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [jumpNumber, setJumpNumber] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('hadits_bookmarks, hadits_last_read, doa_settings')
          .eq('personal_code', user.personal_code)
          .single();
        if (data && !error) {
          if (data.hadits_bookmarks) setBookmarks(data.hadits_bookmarks);
          if (data.hadits_last_read) setLastRead(data.hadits_last_read);
          if (data.doa_settings) setSettings(data.doa_settings);
        }
      } else {
        setBookmarks(
          JSON.parse(localStorage.getItem('myRamadhan_hadits_bookmarks')) || [],
        );
        setLastRead(
          JSON.parse(localStorage.getItem('myRamadhan_hadits_lastread')) ||
            null,
        );
        const localSettings = JSON.parse(
          localStorage.getItem('myRamadhan_doa_settings'),
        );
        if (localSettings) setSettings(localSettings);
      }
    };
    loadUserData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('myRamadhan_doa_settings', JSON.stringify(settings));
    if (user) {
      supabase
        .from('users')
        .update({ doa_settings: settings })
        .eq('personal_code', user.personal_code);
    }
  }, [settings, user]);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_BASE}/books`);
      const json = await res.json();
      setBooks(json.data || []);
    } catch (err) {
      console.error('Failed to fetch books', err);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleSearchTopic = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/ramatalk?mode=hadits&q=${encodeURIComponent(searchQuery)}`);
  };

  const openBook = (book, startPage = 1) => {
    setSelectedBook(book);
    setPage(startPage);
    setView('read');
    setRevealedIds(new Set());
    setJumpNumber('');
    fetchHadithsList(book.id, startPage);
  };

  const fetchHadithsList = async (bookId, targetPage) => {
    setLoadingHadiths(true);
    try {
      const start = (targetPage - 1) * limit + 1;
      const end = targetPage * limit;
      const res = await fetch(
        `${API_BASE}/books/${bookId}?range=${start}-${end}`,
      );
      const json = await res.json();
      setHadiths(json.data.hadiths || []);
    } catch (err) {
      console.error('Failed to fetch hadiths', err);
    } finally {
      setLoadingHadiths(false);
    }
  };

  const changePage = (direction) => {
    const newPage = page + direction;
    if (newPage < 1) return;
    if (selectedBook && newPage > Math.ceil(selectedBook.available / limit))
      return;
    setPage(newPage);
    setRevealedIds(new Set());
    fetchHadithsList(selectedBook.id, newPage).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // --- LOGIKA LONCAT NOMOR ---
  const handleJumpToNumber = (e) => {
    e.preventDefault();
    const num = parseInt(jumpNumber, 10);
    if (!num || isNaN(num) || num < 1 || num > selectedBook.available) {
      alert(
        `Masukkan nomor hadits yang valid antara 1 - ${selectedBook.available}`,
      );
      return;
    }

    const targetPage = Math.ceil(num / limit);
    setPage(targetPage);
    setRevealedIds(new Set());

    // Fetch data lalu scroll ke elemen hadits terkait
    fetchHadithsList(selectedBook.id, targetPage).then(() => {
      setTimeout(() => {
        const element = document.getElementById(`hadith-${num}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-emerald-400');
          setTimeout(
            () => element.classList.remove('ring-4', 'ring-emerald-400'),
            2000,
          );
        }
      }, 500);
    });
    setJumpNumber(''); // Kosongkan input setelah submit
  };

  const toggleBookmark = async (hadith) => {
    const isBookmarked = bookmarks.some(
      (b) => b.bookId === selectedBook.id && b.number === hadith.number,
    );
    const newBookmarks = isBookmarked
      ? bookmarks.filter(
          (b) => !(b.bookId === selectedBook.id && b.number === hadith.number),
        )
      : [
          ...bookmarks,
          { ...hadith, bookId: selectedBook.id, bookName: selectedBook.name },
        ];
    setBookmarks(newBookmarks);
    localStorage.setItem(
      'myRamadhan_hadits_bookmarks',
      JSON.stringify(newBookmarks),
    );
    if (user)
      await supabase
        .from('users')
        .update({ hadits_bookmarks: newBookmarks })
        .eq('personal_code', user.personal_code);
  };

  const markLastRead = async (hadith) => {
    const data = {
      bookId: selectedBook.id,
      bookName: selectedBook.name,
      number: hadith.number,
      page,
    };
    setLastRead(data);
    localStorage.setItem('myRamadhan_hadits_lastread', JSON.stringify(data));
    if (user)
      await supabase
        .from('users')
        .update({ hadits_last_read: data })
        .eq('personal_code', user.personal_code);
  };

  const handleCopy = (hadith) => {
    const text = `*${selectedBook.name} No. ${hadith.number}*\n\n${hadith.arab}\n\n"${hadith.id}"\n\n(Sumber: Aplikasi MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.number);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── HOME ──────────────────────────────────────────────────────────────────────
  if (view === 'home') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20 selection:bg-emerald-200 dark:selection:bg-emerald-900'>
        <Head>
          <title>Hadits - MyRamadhan</title>
        </Head>

        <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
          <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => router.push('/')}
                  className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                >
                  <ArrowLeft
                    size={20}
                    className='text-slate-600 dark:text-slate-400'
                  />
                </button>
                <h1 className='font-bold text-xl flex items-center gap-2'>
                  <ScrollText
                    size={24}
                    className='text-emerald-600 dark:text-emerald-400'
                  />{' '}
                  Hadits
                </h1>
              </div>
              <button
                onClick={() => setView('bookmarks')}
                className='p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors'
              >
                <Bookmark size={20} />
              </button>
            </div>

            <form onSubmit={handleSearchTopic} className='relative'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                size={18}
              />
              <input
                type='text'
                placeholder='Cari topik (misal: Sabar, Puasa)...'
                className='w-full pl-12 pr-24 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
              <button
                type='submit'
                className='absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 md:py-2 md:px-4 rounded-xl flex items-center gap-1 transition-colors'
              >
                <Sparkles size={12} className='md:w-3.5 md:h-3.5' /> Tanya AI
              </button>
            </form>
          </div>
        </header>

        <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8'>
          {/* Last Read Banner */}
          {lastRead && (
            <div className='mb-6 md:mb-8 md:max-w-2xl bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-5 md:p-8 text-white shadow-lg relative overflow-hidden'>
              <ScrollText
                className='absolute -right-4 -bottom-4 opacity-20'
                size={100}
              />
              <div className='relative z-10'>
                <p className='text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1'>
                  Terakhir Dibaca
                </p>
                <h3 className='font-bold text-xl md:text-3xl mb-1 md:mb-2'>
                  {lastRead.bookName}
                </h3>
                <p className='text-sm md:text-base text-emerald-50 mb-4 md:mb-6'>
                  Hadits No. {lastRead.number}
                </p>
                <button
                  onClick={() =>
                    openBook(
                      books.find((b) => b.id === lastRead.bookId),
                      lastRead.page,
                    )
                  }
                  className='bg-white text-emerald-600 text-xs md:text-sm font-bold px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-emerald-50 transition-colors shadow-sm'
                >
                  Lanjutkan Membaca
                </button>
              </div>
            </div>
          )}

          <div className='flex items-center gap-2 mb-4 md:mb-6'>
            <Book size={18} className='text-slate-400 dark:text-slate-500' />
            <h2 className='font-bold text-slate-700 dark:text-slate-300 md:text-lg'>
              Jelajahi Kitab
            </h2>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5'>
            {loadingBooks
              ? [...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className='h-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl'
                  />
                ))
              : books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => openBook(book)}
                    className='bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-center h-full min-h-[100px] group'
                  >
                    <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 leading-tight mb-1'>
                      {book.name}
                    </h3>
                    <p className='text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500'>
                      {book.available.toLocaleString('id-ID')} Hadits
                    </p>
                  </div>
                ))}
          </div>
        </main>
      </div>
    );
  }

  // ── READ ──────────────────────────────────────────────────────────────────────
  if (view === 'read') {
    const arabSizeConfig =
      ARAB_SIZES.find((s) => s.key === settings.arabSize) || ARAB_SIZES[1];

    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-24 selection:bg-emerald-200 dark:selection:bg-emerald-900 transition-colors duration-300'>
        <Head>
          <title>{selectedBook?.name} - MyRamadhan</title>
        </Head>

        {/* HEADER ADAPTIF */}
        <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
          <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full'>
            {/* Top Bar: Title & Toggles */}
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setView('home')}
                  className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                >
                  <ArrowLeft
                    size={20}
                    className='text-slate-600 dark:text-slate-400'
                  />
                </button>
                <div>
                  <h1 className='font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100 leading-tight'>
                    {selectedBook?.name}
                  </h1>
                  <p className='text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400'>
                    Halaman {page}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-1 md:gap-2'>
                <button
                  onClick={() => setHafalanMode(!hafalanMode)}
                  className={`px-3 py-1.5 md:py-2 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1 ${
                    hafalanMode
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-emerald-200 dark:hover:border-emerald-700'
                  }`}
                >
                  {hafalanMode ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span className='hidden sm:inline'>Hafalan</span>
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 md:p-2.5 rounded-full transition-colors ${
                    showSettings
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Settings2 size={18} />
                </button>
              </div>
            </div>

            {/* Bottom Bar: Jump to Number (Search) */}
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
                  max={selectedBook?.available || 9999}
                  placeholder={`Loncat ke nomor (1 - ${selectedBook?.available})...`}
                  value={jumpNumber}
                  onChange={(e) => setJumpNumber(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 bg-slate-100/80 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-[13px] md:text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                />
              </div>
              <button
                type='submit'
                className='bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-2xl transition-colors text-[13px] md:text-sm shadow-sm flex items-center justify-center shrink-0'
              >
                Loncat
              </button>
            </form>

            {/* SETTINGS PANEL (Hanya untuk opsi teks) */}
            {showSettings && (
              <div className='mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 pb-2 md:flex md:items-center md:justify-center md:gap-8'>
                <div className='grid grid-cols-2 md:flex gap-2 mb-3 md:mb-0'>
                  {[
                    { key: 'arab', label: 'Arab' },
                    { key: 'terjemahan', label: 'Terjemah' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() =>
                        setSettings((s) => ({ ...s, [key]: !s[key] }))
                      }
                      className={`py-2 md:px-8 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${
                        settings[key]
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className='md:flex md:items-center md:gap-3'>
                  <p className='text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 md:mb-0 mt-3 md:mt-0'>
                    <Type size={11} className='md:w-3 md:h-3' /> Ukuran Arab
                  </p>
                  <div className='grid grid-cols-3 gap-2'>
                    {ARAB_SIZES.map((s) => (
                      <button
                        key={s.key}
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            arabSize: s.key,
                          }))
                        }
                        className={`flex flex-col md:flex-row md:gap-2 items-center justify-center py-2 md:px-4 md:py-1.5 rounded-xl border-2 transition-all ${
                          settings.arabSize === s.key
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                        }`}
                      >
                        <span
                          className='font-arabic leading-none mb-1 md:mb-0'
                          style={{ fontSize: '18px' }}
                        >
                          ع
                        </span>
                        <span className='text-[10px] font-bold'>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-5 space-y-4 md:space-y-6 pt-6'>
          {hafalanMode && (
            <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 flex items-center gap-2 mb-2'>
              <EyeOff
                size={16}
                className='text-amber-600 dark:text-amber-400 shrink-0'
              />
              <p className='text-amber-700 dark:text-amber-400 text-xs md:text-sm font-semibold'>
                Mode Hafalan aktif — klik "Intip Hadits" untuk melihat bacaan.
              </p>
            </div>
          )}

          {loadingHadiths
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='h-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-[2rem]'
                />
              ))
            : hadiths.map((h) => {
                const isBookmarked = bookmarks.some(
                  (b) => b.bookId === selectedBook.id && b.number === h.number,
                );
                const isLastRead =
                  lastRead &&
                  lastRead.bookId === selectedBook?.id &&
                  lastRead.number === h.number;
                const isRevealed = revealedIds.has(h.number);

                return (
                  <div
                    key={h.number}
                    id={`hadith-${h.number}`}
                    className={`p-6 md:p-8 rounded-[2.5rem] border shadow-sm relative transition-all duration-300 scroll-mt-36 md:scroll-mt-40 ${
                      isLastRead
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-400/20 dark:ring-emerald-700/20'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-100 dark:hover:border-emerald-800'
                    }`}
                  >
                    {/* Badge terakhir dibaca */}
                    {isLastRead && (
                      <div className='absolute -top-3 left-6 bg-emerald-500 text-white text-[9px] md:text-[10px] font-bold px-3 py-1 md:py-1.5 rounded-full shadow-sm flex items-center gap-1 z-10'>
                        <ScrollText size={12} /> Terakhir Dibaca
                      </div>
                    )}

                    <div className='flex justify-between items-center mb-4 md:mb-6 mt-2'>
                      <span
                        className={`text-[10px] md:text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-wider ${
                          isLastRead
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        No. {h.number}
                      </span>
                      <div className='flex gap-1 md:gap-2'>
                        <button
                          onClick={() => toggleBookmark(h)}
                          className={`p-2 rounded-full transition-colors ${
                            isBookmarked
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                              : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck
                              size={18}
                              className='md:w-5 md:h-5'
                            />
                          ) : (
                            <Bookmark size={18} className='md:w-5 md:h-5' />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(h)}
                          className='p-2 text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors'
                        >
                          {copiedId === h.number ? (
                            <Check
                              size={18}
                              className='text-emerald-500 md:w-5 md:h-5'
                            />
                          ) : (
                            <Share2 size={18} className='md:w-5 md:h-5' />
                          )}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`${hafalanMode && !isRevealed ? 'cursor-pointer' : ''}`}
                      onClick={() =>
                        hafalanMode && !isRevealed && toggleReveal(h.number)
                      }
                    >
                      {hafalanMode && !isRevealed ? (
                        <div className='relative py-2'>
                          <div className='blur-[8px] select-none pointer-events-none opacity-40'>
                            {settings.arab && (
                              <p
                                className='font-amiri text-right mb-4'
                                dir='rtl'
                                style={{ fontSize: arabSizeConfig.size }}
                              >
                                {h.arab}
                              </p>
                            )}
                            {settings.terjemahan && (
                              <p className='text-sm mt-3'>"{h.id}"</p>
                            )}
                          </div>
                          <div className='absolute inset-0 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm md:text-base'>
                            <Eye size={18} /> Intip Hadits
                          </div>
                        </div>
                      ) : (
                        <>
                          {settings.arab && (
                            <p
                              className='font-amiri leading-[2.2] md:leading-[2.4] text-slate-800 dark:text-slate-100 text-right mb-4 md:mb-6'
                              dir='rtl'
                              style={{ fontSize: arabSizeConfig.size }}
                            >
                              {h.arab}
                            </p>
                          )}
                          {settings.terjemahan && (
                            <p className='text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6 md:mb-8'>
                              "{h.id}"
                            </p>
                          )}
                          {hafalanMode && isRevealed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReveal(h.number);
                              }}
                              className='mt-2 mb-4 text-xs md:text-sm font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 hover:text-slate-600 dark:hover:text-slate-300'
                            >
                              <EyeOff size={14} /> Sembunyikan lagi
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => !isLastRead && markLastRead(h)}
                      disabled={isLastRead}
                      className={`w-full py-2.5 md:py-3.5 rounded-xl border text-xs md:text-sm font-bold transition-all ${
                        isLastRead
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md cursor-default'
                          : 'border-dashed border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                      }`}
                    >
                      {isLastRead
                        ? '✓ Ditandai Sebagai Terakhir Dibaca'
                        : 'Tandai Terakhir Dibaca'}
                    </button>
                  </div>
                );
              })}
        </main>

        {/* Pagination */}
        <div className='fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-700 p-4 pb-safe flex justify-center z-40'>
          <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full flex justify-center gap-4'>
            <button
              onClick={() => changePage(-1)}
              disabled={page === 1 || loadingHadiths}
              className='flex items-center gap-1 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <div className='flex items-center justify-center font-bold text-sm px-6 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full'>
              Page {page}
            </div>
            <button
              onClick={() => changePage(1)}
              disabled={
                loadingHadiths ||
                (selectedBook &&
                  page >= Math.ceil(selectedBook.available / limit))
              }
              className='flex items-center gap-1 px-5 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── BOOKMARKS ─────────────────────────────────────────────────────────────────
  if (view === 'bookmarks') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20'>
        <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
          <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center gap-3'>
            <button
              onClick={() => setView('home')}
              className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
            >
              <ArrowLeft
                size={20}
                className='text-slate-600 dark:text-slate-400'
              />
            </button>
            <h1 className='font-bold text-xl flex items-center gap-2'>
              <Bookmark size={22} className='text-amber-500' /> Disimpan
            </h1>
          </div>
        </header>

        <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8'>
          {bookmarks.length === 0 ? (
            <div className='text-center py-20 opacity-50'>
              <Bookmark
                size={48}
                className='mx-auto mb-4 text-slate-300 dark:text-slate-600'
              />
              <p className='text-slate-500 dark:text-slate-400'>
                Belum ada hadits yang disimpan.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
              {bookmarks.map((h, i) => (
                <div
                  key={i}
                  className='bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full'
                >
                  <div className='flex justify-between items-center mb-4'>
                    <span className='bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] md:text-xs font-black px-2.5 py-1.5 rounded-md uppercase'>
                      {h.bookName} • No. {h.number}
                    </span>
                    <button
                      onClick={async () => {
                        const newB = bookmarks.filter(
                          (b) =>
                            !(b.bookId === h.bookId && b.number === h.number),
                        );
                        setBookmarks(newB);
                        localStorage.setItem(
                          'myRamadhan_hadits_bookmarks',
                          JSON.stringify(newB),
                        );
                        if (user)
                          await supabase
                            .from('users')
                            .update({ hadits_bookmarks: newB })
                            .eq('personal_code', user.personal_code);
                      }}
                      className='text-rose-400 dark:text-rose-500 text-xs font-bold hover:underline'
                    >
                      Hapus
                    </button>
                  </div>
                  <p
                    className='font-amiri text-xl md:text-2xl leading-[2] md:leading-[2.2] text-slate-800 dark:text-slate-100 text-right mb-3 md:mb-4'
                    dir='rtl'
                  >
                    {h.arab}
                  </p>
                  <p className='text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed flex-1'>
                    "{h.id}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return null;
}
