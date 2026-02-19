'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';

const API_BASE = 'https://api.hadith.gading.dev';

export default function HaditsPage() {
  const router = useRouter();
  const { user } = useUser();

  // --- STATES ---
  const [view, setView] = useState('home'); // 'home', 'read', 'bookmarks'

  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // States for Reading View
  const [selectedBook, setSelectedBook] = useState(null);
  const [hadiths, setHadiths] = useState([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10; // 10 Hadits per halaman

  // States for Interactions
  const [copiedId, setCopiedId] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchBooks();
  }, []);

  // --- LOAD USER DATA (SUPABASE / LOCAL) ---
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Jika login, ambil data dari Supabase
        const { data, error } = await supabase
          .from('users')
          .select('hadits_bookmarks, hadits_last_read')
          .eq('personal_code', user.personal_code)
          .single();

        if (data && !error) {
          if (data.hadits_bookmarks) setBookmarks(data.hadits_bookmarks);
          if (data.hadits_last_read) setLastRead(data.hadits_last_read);
        }
      } else {
        // Jika belum login (Guest), pakai localStorage
        const savedBookmarks =
          JSON.parse(localStorage.getItem('myRamadhan_hadits_bookmarks')) || [];
        const savedLastRead =
          JSON.parse(localStorage.getItem('myRamadhan_hadits_lastread')) ||
          null;
        setBookmarks(savedBookmarks);
        setLastRead(savedLastRead);
      }
    };

    // Panggil setelah 'user' terinisialisasi
    loadUserData();
  }, [user]);

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

  // --- ACTIONS ---
  const handleSearchTopic = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/ramatalk?mode=hadits&q=${encodeURIComponent(searchQuery)}`);
  };

  const openBook = (book, startPage = 1) => {
    setSelectedBook(book);
    setPage(startPage);
    setView('read');
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
    fetchHadithsList(selectedBook.id, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBookmark = async (hadith) => {
    const isBookmarked = bookmarks.some(
      (b) => b.bookId === selectedBook.id && b.number === hadith.number,
    );
    let newBookmarks;

    if (isBookmarked) {
      newBookmarks = bookmarks.filter(
        (b) => !(b.bookId === selectedBook.id && b.number === hadith.number),
      );
    } else {
      newBookmarks = [
        ...bookmarks,
        { ...hadith, bookId: selectedBook.id, bookName: selectedBook.name },
      ];
    }

    // Update local state & localStorage
    setBookmarks(newBookmarks);
    localStorage.setItem(
      'myRamadhan_hadits_bookmarks',
      JSON.stringify(newBookmarks),
    );

    // Update to Supabase if logged in
    if (user) {
      await supabase
        .from('users')
        .update({ hadits_bookmarks: newBookmarks })
        .eq('personal_code', user.personal_code);
    }
  };

  const markLastRead = async (hadith) => {
    const data = {
      bookId: selectedBook.id,
      bookName: selectedBook.name,
      number: hadith.number,
      page: page,
    };

    // Update local state & localStorage
    setLastRead(data);
    localStorage.setItem('myRamadhan_hadits_lastread', JSON.stringify(data));

    // Update to Supabase if logged in
    if (user) {
      await supabase
        .from('users')
        .update({ hadits_last_read: data })
        .eq('personal_code', user.personal_code);
    }
  };

  const handleCopy = (hadith) => {
    const text = `*${selectedBook.name} No. ${hadith.number}*\n\n${hadith.arab}\n\n"${hadith.id}"\n\n(Sumber: Aplikasi MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.number);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ==========================================
  // VIEW: HOME (Daftar Kitab & Pencarian)
  // ==========================================
  if (view === 'home') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-emerald-200'>
        <Head>
          <title>Hadits - MyRamadhan</title>
        </Head>

        <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.push('/')}
                className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
              >
                <ArrowLeft size={20} className='text-slate-600' />
              </button>
              <h1 className='font-bold text-xl flex items-center gap-2'>
                <ScrollText size={24} className='text-emerald-600' /> Hadits
              </h1>
            </div>
            <button
              onClick={() => setView('bookmarks')}
              className='p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100'
            >
              <Bookmark size={20} />
            </button>
          </div>

          <form onSubmit={handleSearchTopic} className='relative'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
              size={18}
            />
            <input
              type='text'
              placeholder='Cari topik (misal: Sabar, Puasa)...'
              className='w-full pl-12 pr-24 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-sm transition-all'
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
            <button
              type='submit'
              className='absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-emerald-600 transition-colors'
            >
              <Sparkles size={12} /> Tanya AI
            </button>
          </form>
        </header>

        <main className='max-w-md mx-auto p-5'>
          {lastRead && (
            <div className='mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden'>
              <ScrollText
                className='absolute -right-4 -bottom-4 opacity-20'
                size={100}
              />
              <div className='relative z-10'>
                <p className='text-[10px] font-bold uppercase tracking-widest text-emerald-100 mb-1'>
                  Terakhir Dibaca
                </p>
                <h3 className='font-bold text-xl mb-1'>{lastRead.bookName}</h3>
                <p className='text-sm text-emerald-50 mb-4'>
                  Hadits No. {lastRead.number}
                </p>
                <button
                  onClick={() =>
                    openBook(
                      books.find((b) => b.id === lastRead.bookId),
                      lastRead.page,
                    )
                  }
                  className='bg-white text-emerald-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-emerald-50 transition-colors'
                >
                  Lanjutkan Membaca
                </button>
              </div>
            </div>
          )}

          <div className='flex items-center gap-2 mb-4'>
            <Book size={18} className='text-slate-400' />
            <h2 className='font-bold text-slate-700'>Jelajahi Kitab</h2>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            {loadingBooks
              ? [...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className='h-24 bg-slate-200 animate-pulse rounded-2xl'
                  />
                ))
              : books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => openBook(book)}
                    className='bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group'
                  >
                    <h3 className='font-bold text-slate-800 text-sm group-hover:text-emerald-600 leading-tight mb-1'>
                      {book.name}
                    </h3>
                    <p className='text-[10px] font-medium text-slate-400'>
                      {book.available.toLocaleString('id-ID')} Hadits
                    </p>
                  </div>
                ))}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW: READ (Membaca Daftar Hadits)
  // ==========================================
  if (view === 'read') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-24 selection:bg-emerald-200'>
        <Head>
          <title>{selectedBook?.name} - MyRamadhan</title>
        </Head>

        <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setView('home')}
              className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
            >
              <ArrowLeft size={20} className='text-slate-600' />
            </button>
            <div>
              <h1 className='font-bold text-lg text-slate-800 leading-tight'>
                {selectedBook?.name}
              </h1>
              <p className='text-[10px] font-medium text-emerald-600'>
                Hal. {page}
              </p>
            </div>
          </div>
        </header>

        <main className='max-w-md mx-auto p-5 space-y-4 pt-8'>
          {loadingHadiths
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='h-48 bg-slate-200 animate-pulse rounded-2xl'
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

                return (
                  <div
                    key={h.number}
                    className={`p-6 rounded-2xl border shadow-sm relative transition-all duration-300 ${
                      isLastRead
                        ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-400/20'
                        : 'bg-white border-slate-100 hover:border-emerald-100'
                    }`}
                  >
                    {/* BADGE TERAKHIR DIBACA */}
                    {isLastRead && (
                      <div className='absolute -top-3 left-6 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 z-10'>
                        <ScrollText size={12} />
                        Terakhir Dibaca
                      </div>
                    )}

                    <div className='flex justify-between items-center mb-4 mt-2'>
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider ${
                          isLastRead
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        No. {h.number}
                      </span>
                      <div className='flex gap-1'>
                        <button
                          onClick={() => toggleBookmark(h)}
                          className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:bg-slate-50'}`}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck size={18} />
                          ) : (
                            <Bookmark size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(h)}
                          className='p-2 text-slate-300 hover:bg-slate-50 rounded-full'
                        >
                          {copiedId === h.number ? (
                            <Check size={18} className='text-emerald-500' />
                          ) : (
                            <Share2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <p
                      className='font-amiri text-2xl leading-[2.2] text-slate-800 text-right mb-4'
                      dir='rtl'
                    >
                      {h.arab}
                    </p>
                    <p className='text-slate-600 text-sm leading-relaxed mb-6'>
                      "{h.id}"
                    </p>

                    <button
                      onClick={() => !isLastRead && markLastRead(h)}
                      disabled={isLastRead}
                      className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isLastRead
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md cursor-default'
                          : 'border-dashed border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {isLastRead
                        ? 'Ditandai Sebagai Terakhir Dibaca'
                        : 'Tandai Terakhir Dibaca'}
                    </button>
                  </div>
                );
              })}
        </main>

        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-6 flex justify-center gap-4 z-40'>
          <button
            onClick={() => changePage(-1)}
            disabled={page === 1 || loadingHadiths}
            className='flex items-center gap-1 px-4 py-2 bg-slate-100 rounded-full text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-200 transition-colors'
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className='flex items-center justify-center font-bold text-slate-800 text-sm px-4 bg-emerald-50 text-emerald-700 rounded-full'>
            Page {page}
          </div>
          <button
            onClick={() => changePage(1)}
            disabled={loadingHadiths}
            className='flex items-center gap-1 px-4 py-2 bg-slate-100 rounded-full text-sm font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-200 transition-colors'
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: BOOKMARKS
  // ==========================================
  if (view === 'bookmarks') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20'>
        <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center gap-3'>
          <button
            onClick={() => setView('home')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
          >
            <ArrowLeft size={20} className='text-slate-600' />
          </button>
          <h1 className='font-bold text-xl flex items-center gap-2'>
            <Bookmark size={22} className='text-amber-500' /> Disimpan
          </h1>
        </header>

        <main className='max-w-md mx-auto p-5 space-y-4'>
          {bookmarks.length === 0 ? (
            <div className='text-center py-20 opacity-50'>
              <Bookmark size={48} className='mx-auto mb-4' />
              <p>Belum ada hadits yang disimpan.</p>
            </div>
          ) : (
            bookmarks.map((h, i) => (
              <div
                key={i}
                className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm'
              >
                <div className='flex justify-between items-center mb-4'>
                  <span className='bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-md uppercase'>
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

                      if (user) {
                        await supabase
                          .from('users')
                          .update({ hadits_bookmarks: newB })
                          .eq('personal_code', user.personal_code);
                      }
                    }}
                    className='text-rose-400 text-xs font-bold hover:underline'
                  >
                    Hapus
                  </button>
                </div>
                <p
                  className='font-amiri text-xl leading-[2] text-slate-800 text-right mb-3'
                  dir='rtl'
                >
                  {h.arab}
                </p>
                <p className='text-slate-600 text-sm leading-relaxed'>
                  "{h.id}"
                </p>
              </div>
            ))
          )}
        </main>
      </div>
    );
  }

  return null;
}
