'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Search,
  BookOpen,
  BookmarkCheck,
  PlayCircle,
  Book,
  Bookmark,
  Trash2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';

export default function QuranIndex() {
  const router = useRouter();
  const { user } = useUser();

  // --- STATES ---
  const [view, setView] = useState('home'); // 'home' atau 'bookmarks'
  const [activeTab, setActiveTab] = useState('surah'); // 'surah' atau 'juz'

  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [lastRead, setLastRead] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  // Fetch Daftar Surah
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        if (!res.ok) throw new Error('Gagal fetch data surah');
        const json = await res.json();
        setSurahs(json.data || []);
      } catch (err) {
        console.error('Error fetching surahs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  // Fetch User Data (Last Read & Bookmarks)
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('quran_last_read, quran_bookmarks')
          .eq('personal_code', user.personal_code)
          .single();

        if (!error && data) {
          if (data.quran_last_read) setLastRead(data.quran_last_read);
          if (data.quran_bookmarks) setBookmarks(data.quran_bookmarks);
        }
      } else {
        const localRead = JSON.parse(
          localStorage.getItem('myRamadhan_quran_lastread'),
        );
        const localBookmarks =
          JSON.parse(localStorage.getItem('myRamadhan_quran_bookmarks')) || [];
        if (localRead) setLastRead(localRead);
        setBookmarks(localBookmarks);
      }
    };
    loadUserData();
  }, [user]);

  const filteredSurahs = surahs.filter(
    (s) =>
      s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arti.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const juzList = Array.from({ length: 30 }, (_, i) => i + 1);

  const removeBookmark = async (bookmarkToRemove) => {
    const newBookmarks = bookmarks.filter(
      (b) =>
        !(
          b.surahId === bookmarkToRemove.surahId &&
          b.ayahNumber === bookmarkToRemove.ayahNumber
        ),
    );

    setBookmarks(newBookmarks);
    localStorage.setItem(
      'myRamadhan_quran_bookmarks',
      JSON.stringify(newBookmarks),
    );

    if (user) {
      await supabase
        .from('users')
        .update({ quran_bookmarks: newBookmarks })
        .eq('personal_code', user.personal_code);
    }
  };

  const handleLanjutkan = () => {
    if (!lastRead) return;
    const targetUrl = lastRead.isJuz
      ? `/quran/juz/${lastRead.surahId}#ayat-${lastRead.ayahNumber}`
      : `/quran/surah/${lastRead.surahId}#ayat-${lastRead.ayahNumber}`;
    router.push(targetUrl);
  };

  // ==========================================
  // VIEW: HOME (Daftar Surah & Juz)
  // ==========================================
  if (view === 'home') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-blue-200'>
        <Head>
          <title>Al-Qur'an - MyRamadhan</title>
        </Head>

        <header className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4'>
          <div className='flex items-center justify-between mb-5'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.push('/')}
                className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
              >
                <ArrowLeft size={20} className='text-slate-600' />
              </button>
              <h1 className='font-bold text-xl flex items-center gap-2 text-[#1e3a8a]'>
                <BookOpen size={24} /> Al-Qur'an
              </h1>
            </div>
            {/* Tombol Akses Bookmark di Kanan Atas */}
            <button
              onClick={() => setView('bookmarks')}
              className='p-2 bg-blue-50 text-[#1e3a8a] rounded-full hover:bg-blue-100 transition-colors'
            >
              <Bookmark size={20} />
            </button>
          </div>

          <div className='relative mb-4'>
            <Search
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
              size={18}
            />
            <input
              type='text'
              placeholder={
                activeTab === 'surah'
                  ? 'Cari nama surah...'
                  : 'Pencarian dinonaktifkan di sini'
              }
              disabled={activeTab !== 'surah'}
              className='w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-[#1e3a8a] outline-none text-sm transition-all disabled:opacity-50'
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
          </div>

          <div className='flex p-1 bg-slate-100 rounded-xl'>
            <button
              onClick={() => setActiveTab('surah')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === 'surah' ? 'bg-white text-[#1e3a8a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Surah
            </button>
            <button
              onClick={() => setActiveTab('juz')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === 'juz' ? 'bg-white text-[#1e3a8a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Juz
            </button>
          </div>
        </header>

        <main className='max-w-md mx-auto p-5'>
          {/* LAST READ CARD */}
          {lastRead && (
            <div className='mb-6 bg-gradient-to-r from-[#1e3a8a] to-[#312e81] rounded-[2rem] p-5 text-white shadow-lg relative overflow-hidden'>
              <BookOpen
                className='absolute -right-4 -bottom-4 opacity-10'
                size={100}
              />
              <div className='relative z-10'>
                <div className='flex items-center gap-1.5 mb-1'>
                  <BookmarkCheck size={14} className='text-indigo-200' />
                  <p className='text-[10px] font-bold uppercase tracking-widest text-indigo-200'>
                    Terakhir Dibaca
                  </p>
                </div>
                <h3 className='font-bold text-2xl mb-1 leading-tight'>
                  {lastRead.surahName}
                </h3>
                <p className='text-sm text-indigo-100 mb-4'>
                  Ayat {lastRead.ayahNumber}
                </p>

                <button
                  onClick={handleLanjutkan}
                  className='bg-white text-[#1e3a8a] text-xs font-bold px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2 w-fit'
                >
                  <PlayCircle size={16} /> Lanjutkan
                </button>
              </div>
            </div>
          )}

          {/* TAB: SURAH */}
          {activeTab === 'surah' && (
            <div className='space-y-3'>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className='h-20 bg-white border border-slate-100 rounded-2xl animate-pulse'
                  />
                ))
              ) : filteredSurahs.length > 0 ? (
                filteredSurahs.map((s) => (
                  <div
                    key={s.nomor}
                    onClick={() => router.push(`/quran/surah/${s.nomor}`)}
                    className='bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#1e3a8a] transition-all cursor-pointer flex items-center justify-between group'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors'>
                        {s.nomor}
                      </div>
                      <div>
                        <h3 className='font-bold text-slate-800 text-sm group-hover:text-[#1e3a8a] transition-colors'>
                          {s.namaLatin}
                        </h3>
                        <p className='text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5'>
                          {s.tempatTurun} • {s.jumlahAyat} Ayat
                        </p>
                      </div>
                    </div>
                    <div className='text-xl font-arabic text-[#1e3a8a] opacity-80 group-hover:opacity-100 transition-opacity'>
                      {s.nama}
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-10'>
                  <p className='text-slate-500 text-sm'>
                    Surah tidak ditemukan.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: JUZ */}
          {activeTab === 'juz' && (
            <div className='grid grid-cols-2 gap-3'>
              {juzList.map((juz) => (
                <div
                  key={juz}
                  onClick={() => router.push(`/quran/juz/${juz}`)}
                  className='bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#1e3a8a] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group'
                >
                  <div className='w-12 h-12 rounded-full bg-blue-50 text-[#1e3a8a] flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <Book size={20} />
                  </div>
                  <h3 className='font-bold text-slate-800 group-hover:text-[#1e3a8a]'>
                    Juz {juz}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </main>
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
          <h1 className='font-bold text-xl flex items-center gap-2 text-[#1e3a8a]'>
            <Bookmark size={22} /> Disimpan
          </h1>
        </header>

        <main className='max-w-md mx-auto p-5 space-y-4'>
          {bookmarks.length === 0 ? (
            <div className='text-center py-20 opacity-50'>
              <Bookmark size={48} className='mx-auto mb-4 text-slate-300' />
              <p className='text-sm font-medium'>
                Belum ada ayat yang disimpan.
              </p>
            </div>
          ) : (
            bookmarks.map((b, i) => (
              <div
                key={i}
                className='bg-white p-5 rounded-2xl border border-slate-100 shadow-sm'
              >
                <div className='flex justify-between items-center mb-4'>
                  <span className='bg-blue-50 text-[#1e3a8a] text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-wider'>
                    {b.surahName} • Ayat {b.ayahNumber}
                  </span>
                  <button
                    onClick={() => removeBookmark(b)}
                    className='p-2 text-rose-400 hover:bg-rose-50 rounded-full transition-colors'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p
                  className='font-arabic text-2xl leading-[2.2] text-slate-800 text-right mb-4'
                  dir='rtl'
                >
                  {b.arab}
                </p>
                <p className='text-slate-600 text-[13px] leading-relaxed mb-4'>
                  "{b.translation}"
                </p>
                <button
                  onClick={() =>
                    router.push(
                      `/quran/surah/${b.surahId}#ayat-${b.ayahNumber}`,
                    )
                  }
                  className='w-full py-2.5 rounded-xl border border-[#1e3a8a] text-xs font-bold text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all'
                >
                  Buka Ayat Ini
                </button>
              </div>
            ))
          )}
        </main>
      </div>
    );
  }

  return null;
}
