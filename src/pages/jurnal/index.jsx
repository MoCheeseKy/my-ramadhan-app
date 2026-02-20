import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Wind,
  ChevronRight,
  PenLine,
  Lock,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { moods } from '@/data/journalPrompts';
import ProtectedRoute from '@/components/ProtectedRoute';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

// --- TAMBAHAN IMPORT LOKAL ---
import useUser from '@/hook/useUser';
import useAppMode from '@/hook/useAppMode';
import localforage from 'localforage';

dayjs.locale('id');

const categories = [
  {
    id: 'daily',
    title: 'Refleksi Harian',
    subtitle: 'Cek perasaan hari ini',
    icon: PenLine,
    gradient: 'from-[#1e3a8a] to-indigo-700',
    bg: 'bg-blue-50 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-800',
    accent: '#1e3a8a',
  },
  {
    id: 'syukur',
    title: 'Catatan Syukur',
    subtitle: 'Hitung nikmat hari ini',
    icon: Heart,
    gradient: 'from-emerald-400 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-800',
    accent: '#059669',
  },
  {
    id: 'ikhlaskan',
    title: 'Ruang Ikhlas',
    subtitle: 'Lepaskan beban & amarah',
    icon: Wind,
    gradient: 'from-rose-400 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-900/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-800',
    accent: '#e11d48',
  },
  {
    id: 'bebas',
    title: 'Catatan Bebas',
    subtitle: 'Tulis ceritamu sendiri',
    icon: BookOpen,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-800',
    accent: '#d97706',
  },
];

const moodColors = {
  happy: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-400',
  },
  calm: {
    bg: 'bg-sky-100 dark:bg-sky-900/40',
    text: 'text-sky-700 dark:text-sky-400',
  },
  grateful: {
    bg: 'bg-pink-100 dark:bg-pink-900/40',
    text: 'text-pink-700 dark:text-pink-400',
  },
  sad: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
  },
  tired: {
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-400',
  },
  angry: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-400',
  },
};

export default function JournalDashboard() {
  const router = useRouter();

  // --- INTEGRASI HOOK ---
  const { user, loading: userLoading } = useUser();
  const { isPWA } = useAppMode();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    if (!userLoading) {
      if (!user) router.push('/auth/login');
      else fetchEntries();
    }
  }, [user, userLoading, isPWA]);

  // --- PERUBAHAN LOGIKA PWA & WEB ---
  const fetchEntries = async () => {
    setLoading(true);
    if (isPWA) {
      const localJournals = (await localforage.getItem('pwa_journals')) || [];
      setEntries(localJournals);
    } else {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('personal_code', user.personal_code)
        .single();
      if (!userData) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });
      if (!error && data) setEntries(data);
    }
    setLoading(false);
  };

  const getMood = (moodId) => moods.find((m) => m.id === moodId);
  const getCat = (catId) => categories.find((c) => c.id === catId);

  const uniqueDates = Array.from(
    new Set(entries.map((e) => dayjs(e.created_at).format('YYYY-MM-DD'))),
  );

  const filteredEntries = entries.filter((entry) => {
    const matchCat =
      filterCategory === 'all' || entry.category === filterCategory;
    const matchDate =
      filterDate === 'all' ||
      dayjs(entry.created_at).format('YYYY-MM-DD') === filterDate;
    return matchCat && matchDate;
  });

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const dateStr = dayjs(entry.created_at).format('dddd, DD MMMM YYYY');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(entry);
    return acc;
  }, {});

  const handleDiscussWithRamatalk = () => {
    if (!selectedEntry) return;
    const contextData = {
      title: selectedEntry.title,
      content: selectedEntry.content,
      mood: getMood(selectedEntry.mood)?.label || 'Netral',
      category: getCat(selectedEntry.category)?.title || 'Jurnal',
    };
    sessionStorage.setItem(
      'ramatalk_journal_context',
      JSON.stringify(contextData),
    );
    router.push('/ramatalk');
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-[#FAFAF7] dark:bg-slate-950 text-slate-800 dark:text-slate-200 pb-28 transition-colors duration-300'>
        <Head>
          <title>Jurnal Refleksi - MyRamadhan</title>
        </Head>

        {/* Ambient texture - disesuaikan untuk dark mode */}
        <div className='fixed inset-0 pointer-events-none -z-10'>
          <div className='absolute top-0 right-0 w-80 h-80 bg-violet-100/40 dark:bg-violet-900/20 rounded-full blur-3xl' />
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 dark:bg-blue-900/20 rounded-full blur-3xl' />
        </div>

        <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => router.push('/')}
              className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            >
              <ArrowLeft
                size={20}
                className='text-slate-600 dark:text-slate-400'
              />
            </button>
            <div>
              <h1 className='font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-slate-100'>
                Jurnal Refleksi
              </h1>
            </div>
          </div>
        </header>

        <main className='max-w-md mx-auto px-5 pt-6'>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3'
          >
            <div className='bg-white dark:bg-slate-700 p-2 rounded-lg text-slate-500 dark:text-slate-400 shadow-sm'>
              <Lock size={16} />
            </div>
            <p className='text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed'>
              Ruang amanmu. Jurnal ini tersimpan privat dan{' '}
              <strong className='text-slate-700 dark:text-slate-300'>
                hanya bisa dibaca olehmu
              </strong>
              .
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-8'
          >
            <h2 className='text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug'>
              Apa yang ada
              <br />
              <span className='text-[#1e3a8a] dark:text-blue-400'>
                di benakmu hari ini?
              </span>
            </h2>
          </motion.div>

          <div className='space-y-3 mb-12'>
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => router.push(`/jurnal/write/${cat.id}`)}
                className={`w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border ${
                  cat.border
                } shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 shadow-lg`}
                  style={{ boxShadow: `0 8px 20px -4px ${cat.accent}40` }}
                >
                  <cat.icon size={20} className='text-white' />
                </div>
                <div className='flex-1 text-left'>
                  <p className='font-bold text-sm text-slate-800 dark:text-slate-100'>
                    {cat.title}
                  </p>
                  <p className='text-xs text-slate-400 dark:text-slate-500 mt-0.5'>
                    {cat.subtitle}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-xl ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <ChevronRight size={14} className={cat.text} />
                </div>
              </motion.button>
            ))}
          </div>

          <div>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]'>
                Jejak Pikiranmu
              </p>
              {entries.length > 0 && (
                <span className='text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full'>
                  {entries.length} entri
                </span>
              )}
            </div>

            {entries.length > 0 && (
              <div className='flex items-center gap-2 mb-6'>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className='flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-400 shadow-sm appearance-none'
                >
                  <option value='all'>Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className='flex-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-[#1e3a8a] dark:focus:border-blue-400 shadow-sm appearance-none'
                >
                  <option value='all'>Semua Waktu</option>
                  {uniqueDates.map((date) => (
                    <option key={date} value={date}>
                      {dayjs(date).format('DD MMM YYYY')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading ? (
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='h-28 bg-white dark:bg-slate-800 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-700'
                  />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='text-center py-14'
              >
                <div className='w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <PenLine
                    size={28}
                    className='text-slate-300 dark:text-slate-600'
                  />
                </div>
                <p className='text-sm font-semibold text-slate-400 dark:text-slate-500'>
                  Belum ada tulisan
                </p>
                <p className='text-xs text-slate-400 dark:text-slate-600 mt-1'>
                  Pilih salah satu kategori di atas untuk memulai
                </p>
              </motion.div>
            ) : Object.keys(groupedEntries).length === 0 ? (
              <div className='text-center py-10'>
                <p className='text-sm font-semibold text-slate-400 dark:text-slate-500'>
                  Tidak ada yang cocok
                </p>
                <p className='text-xs text-slate-400 dark:text-slate-600 mt-1'>
                  Coba ubah filter di atas.
                </p>
              </div>
            ) : (
              <div className='space-y-8'>
                {Object.entries(groupedEntries).map(
                  ([dateStr, dateEntries]) => (
                    <div key={dateStr}>
                      <div className='flex items-center gap-3 mb-4'>
                        <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'>
                          {dateStr}
                        </p>
                        <div className='flex-1 h-px bg-slate-200 dark:bg-slate-800' />
                      </div>

                      <div className='space-y-3'>
                        {dateEntries.map((entry, i) => {
                          const mood = getMood(entry.mood);
                          const cat = getCat(entry.category);
                          const moodStyle = moodColors[entry.mood] || {
                            bg: 'bg-slate-100 dark:bg-slate-800',
                            text: 'text-slate-600 dark:text-slate-400',
                          };
                          return (
                            <motion.button
                              key={entry.id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedEntry(entry)}
                              className='w-full text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all group'
                            >
                              {cat && (
                                <div
                                  className={`h-1 w-full bg-gradient-to-r ${cat.gradient}`}
                                />
                              )}
                              <div className='p-4'>
                                <div className='flex items-start justify-between mb-2 gap-2'>
                                  <div className='flex items-center gap-2 flex-wrap'>
                                    {cat && (
                                      <span
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}
                                      >
                                        {cat.title}
                                      </span>
                                    )}
                                    {mood && (
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${moodStyle.bg} ${moodStyle.text}`}
                                      >
                                        {mood.icon} {mood.label}
                                      </span>
                                    )}
                                  </div>
                                  <span className='text-[10px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1'>
                                    {dayjs(entry.created_at).format('HH:mm')}
                                    <ChevronRight
                                      size={12}
                                      className='opacity-0 group-hover:opacity-100 transition-opacity'
                                    />
                                  </span>
                                </div>

                                <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1 mb-1'>
                                  {entry.title || 'Tanpa Judul'}
                                </h3>
                                <p className='text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed'>
                                  {entry.content}
                                </p>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── DETAIL DRAWER DENGAN TOMBOL RAMATALK ── */}
      <AnimatePresence>
        {selectedEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50'
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='fixed bottom-0 left-0 right-0 max-w-md mx-auto h-[85vh] bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl z-50 flex flex-col overflow-hidden transition-colors duration-300'
            >
              <div className='px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50'>
                <div className='w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5' />
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    {getCat(selectedEntry.category) && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getCat(selectedEntry.category).bg} ${getCat(selectedEntry.category).text}`}
                      >
                        {getCat(selectedEntry.category).title}
                      </span>
                    )}
                    {getMood(selectedEntry.mood) && (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          moodColors[selectedEntry.mood]?.bg ||
                          'bg-slate-100 dark:bg-slate-800'
                        } ${
                          moodColors[selectedEntry.mood]?.text ||
                          'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {getMood(selectedEntry.mood).icon}{' '}
                        {getMood(selectedEntry.mood).label}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className='w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                  >
                    <X size={18} />
                  </button>
                </div>

                <h2 className='text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug'>
                  {selectedEntry.title || 'Tanpa Judul'}
                </h2>
                <p className='text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium'>
                  {dayjs(selectedEntry.created_at).format(
                    'dddd, DD MMMM YYYY • HH:mm',
                  )}
                </p>
              </div>

              <div className='flex-1 overflow-y-auto px-6 py-6 custom-scrollbar'>
                <p className='text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium pb-4'>
                  {selectedEntry.content}
                </p>
              </div>

              {/* UI BARU: TOMBOL OPT-IN RAMATALK */}
              <div className='px-6 pb-8 pt-4 bg-gradient-to-t from-white dark:from-slate-900 via-white dark:via-slate-900 to-transparent border-t border-slate-50 dark:border-slate-800 shrink-0'>
                <button
                  onClick={handleDiscussWithRamatalk}
                  className='w-full py-4 bg-indigo-50 dark:bg-indigo-900/40 text-[#1e3a8a] dark:text-blue-400 border border-indigo-100 dark:border-indigo-800 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all shadow-sm'
                >
                  <Sparkles
                    size={16}
                    className='text-indigo-500 dark:text-indigo-400'
                  />
                  Diskusikan perasaan ini dengan Ramatalk
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
}
