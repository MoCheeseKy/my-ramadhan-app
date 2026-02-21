'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Book,
  Bookmark,
  Trash2,
} from 'lucide-react';
import useUser from '@/hooks/useUser';
import useQuranStorage from '@/hooks/useQuranStorage';
import LastReadBanner from '@/components/quran/LastReadBanner';
import BookmarkCard from '@/components/quran/BookmarkCard';

/**
 * Tab options untuk navigasi surah / juz.
 */
const TABS = [
  { key: 'surah', label: 'Surah' },
  { key: 'juz', label: 'Juz' },
];

const JUZ_LIST = Array.from({ length: 30 }, (_, i) => i + 1);

export default function QuranIndex() {
  const router = useRouter();
  const { user } = useUser();
  const storage = useQuranStorage(user);

  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('surah');

  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [lastRead, setLastRead] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  // Fetch daftar surah dari API
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

  // Load data user (lastRead, bookmarks)
  useEffect(() => {
    const loadData = async () => {
      const data = await storage.loadQuranData();
      if (data.lastRead) setLastRead(data.lastRead);
      if (data.bookmarks) setBookmarks(data.bookmarks);
    };
    loadData();
  }, [user]);

  const filteredSurahs = surahs.filter(
    (s) =>
      s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arti.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRemoveBookmark = async (bookmarkToRemove) => {
    const newBookmarks = bookmarks.filter(
      (b) =>
        !(
          b.surahId === bookmarkToRemove.surahId &&
          b.ayahNumber === bookmarkToRemove.ayahNumber
        ),
    );
    setBookmarks(newBookmarks);
    await storage.saveBookmarks(newBookmarks);
  };

  const handleContinue = () => {
    if (!lastRead) return;
    const url = lastRead.isJuz
      ? `/quran/juz/${lastRead.juzNumber || 1}#ayat-${lastRead.surahId}-${lastRead.ayahNumber}`
      : `/quran/surah/${lastRead.surahId}#ayat-${lastRead.ayahNumber}`;
    router.push(url);
  };

  // ─── View: Bookmarks ──────────────────────────────────────────────────────────
  if (view === 'bookmarks') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20'>
        <Head>
          <title>Ayat Disimpan - MyRamadhan</title>
        </Head>

        <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800'>
          <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 py-4 flex items-center gap-3'>
            <button
              onClick={() => setView('home')}
              className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            >
              <ArrowLeft
                size={20}
                className='text-slate-600 dark:text-slate-300'
              />
            </button>
            <h1 className='font-bold text-xl flex items-center gap-2 text-[#1e3a8a] dark:text-blue-400'>
              <Bookmark size={22} /> Ayat Disimpan
            </h1>
          </div>
        </header>

        <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-6 lg:py-8 lg:px-6'>
          {bookmarks.length === 0 ? (
            <div className='text-center py-20 opacity-50'>
              <Bookmark
                size={64}
                className='mx-auto mb-4 text-slate-300 dark:text-slate-600'
              />
              <p className='text-base font-medium'>
                Belum ada ayat yang disimpan.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5'>
              {bookmarks.map((b, i) => (
                <BookmarkCard
                  key={i}
                  bookmark={b}
                  onRemove={handleRemoveBookmark}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ─── View: Home (daftar surah/juz) ────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20 selection:bg-blue-200 dark:selection:bg-blue-800'>
      <Head>
        <title>Al-Qur'an - MyRamadhan</title>
      </Head>

      {/* Header sticky dengan search & tab */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between mb-4 lg:mb-5'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.push('/')}
                className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
              >
                <ArrowLeft
                  size={20}
                  className='text-slate-600 dark:text-slate-300'
                />
              </button>
              <h1 className='font-bold text-xl flex items-center gap-2 text-[#1e3a8a] dark:text-blue-400'>
                <BookOpen size={24} /> Al-Qur'an
              </h1>
            </div>
            <button
              onClick={() => setView('bookmarks')}
              className='p-2 bg-blue-50 dark:bg-blue-500/20 text-[#1e3a8a] dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors'
            >
              <Bookmark size={20} />
            </button>
          </div>

          {/* Search & tab switcher */}
          <div className='flex flex-col md:flex-row gap-3 lg:gap-4'>
            <div className='relative flex-1'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                size={18}
              />
              <input
                type='text'
                placeholder={
                  activeTab === 'surah'
                    ? 'Cari nama surah atau arti...'
                    : 'Pencarian dinonaktifkan di sini'
                }
                disabled={activeTab !== 'surah'}
                className='w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-400 outline-none text-sm transition-all disabled:opacity-50'
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
            </div>
            <div className='flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 md:w-64'>
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
                    activeTab === key
                      ? 'bg-white dark:bg-slate-900 text-[#1e3a8a] dark:text-blue-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-6 lg:py-8 lg:px-6'>
        {/* Banner terakhir dibaca */}
        <LastReadBanner lastRead={lastRead} onContinue={handleContinue} />

        {/* ── Tab Surah ── */}
        {activeTab === 'surah' && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4'>
            {loading ? (
              [...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className='h-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse'
                />
              ))
            ) : filteredSurahs.length > 0 ? (
              filteredSurahs.map((s) => (
                <div
                  key={s.nomor}
                  onClick={() => router.push(`/quran/surah/${s.nomor}`)}
                  className='bg-white dark:bg-slate-900 p-4 lg:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#1e3a8a] dark:hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between group'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-xs lg:text-sm font-bold text-slate-400 dark:text-slate-300 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors'>
                      {s.nomor}
                    </div>
                    <div>
                      <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm lg:text-base group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors'>
                        {s.namaLatin}
                      </h3>
                      <p className='text-[10px] lg:text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5'>
                        {s.tempatTurun} • {s.jumlahAyat} Ayat
                      </p>
                    </div>
                  </div>
                  <div className='text-xl lg:text-2xl font-arabic text-[#1e3a8a] dark:text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity'>
                    {s.nama}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-10 lg:col-span-full'>
                <p className='text-slate-500 dark:text-slate-400 text-sm'>
                  Surah tidak ditemukan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Tab Juz ── */}
        {activeTab === 'juz' && (
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4'>
            {JUZ_LIST.map((juz) => (
              <div
                key={juz}
                onClick={() => router.push(`/quran/juz/${juz}`)}
                className='bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#1e3a8a] dark:hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 lg:gap-3 group'
              >
                <div className='w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-blue-50 dark:bg-blue-500/20 text-[#1e3a8a] dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <Book size={24} />
                </div>
                <h3 className='font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 lg:text-lg'>
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
