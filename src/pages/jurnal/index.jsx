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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { moods } from '@/data/journalPrompts';
import ProtectedRoute from '@/components/ProtectedRoute';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id'); // Pastikan format tanggal bahasa Indonesia

const categories = [
  {
    id: 'daily',
    title: 'Refleksi Harian',
    subtitle: 'Cek perasaan hari ini',
    icon: PenLine,
    gradient: 'from-[#1e3a8a] to-indigo-700',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    accent: '#1e3a8a',
  },
  {
    id: 'syukur',
    title: 'Catatan Syukur',
    subtitle: 'Hitung nikmat hari ini',
    icon: Heart,
    gradient: 'from-emerald-400 to-teal-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    accent: '#059669',
  },
  {
    id: 'ikhlaskan',
    title: 'Ruang Ikhlas',
    subtitle: 'Lepaskan beban & amarah',
    icon: Wind,
    gradient: 'from-rose-400 to-pink-600',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
    accent: '#e11d48',
  },
  {
    id: 'bebas',
    title: 'Catatan Bebas',
    subtitle: 'Tulis ceritamu sendiri',
    icon: BookOpen,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
    accent: '#d97706',
  },
];

const moodColors = {
  happy: { bg: 'bg-amber-100', text: 'text-amber-700' },
  calm: { bg: 'bg-sky-100', text: 'text-sky-700' },
  grateful: { bg: 'bg-pink-100', text: 'text-pink-700' },
  sad: { bg: 'bg-slate-100', text: 'text-slate-600' },
  tired: { bg: 'bg-orange-100', text: 'text-orange-700' },
  angry: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function JournalDashboard() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // STATE BARU: Untuk menyimpan nilai filter
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) return router.push('/auth/login');
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', localUser.personal_code)
      .single();
    if (!userData) return;
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });
    if (!error) setEntries(data);
    setLoading(false);
  };

  const getMood = (moodId) => moods.find((m) => m.id === moodId);
  const getCat = (catId) => categories.find((c) => c.id === catId);

  // LOGIKA BARU: Mengambil daftar tanggal unik untuk dropdown filter
  const uniqueDates = Array.from(
    new Set(entries.map((e) => dayjs(e.created_at).format('YYYY-MM-DD'))),
  );

  // LOGIKA BARU: Menyaring catatan berdasarkan filter yang dipilih
  const filteredEntries = entries.filter((entry) => {
    const matchCat =
      filterCategory === 'all' || entry.category === filterCategory;
    const matchDate =
      filterDate === 'all' ||
      dayjs(entry.created_at).format('YYYY-MM-DD') === filterDate;
    return matchCat && matchDate;
  });

  // LOGIKA BARU: Mengelompokkan catatan yang sudah difilter berdasarkan tanggal
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const dateStr = dayjs(entry.created_at).format('dddd, DD MMMM YYYY');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(entry);
    return acc;
  }, {});

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-[#FAFAF7] text-slate-800 pb-28'>
        <Head>
          <title>Jurnal Refleksi - MyRamadhan</title>
        </Head>

        {/* Ambient texture */}
        <div className='fixed inset-0 pointer-events-none -z-10'>
          <div className='absolute top-0 right-0 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl' />
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl' />
        </div>

        {/* --- Header --- */}
        <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => router.push('/')}
              className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
            >
              <ArrowLeft size={20} className='text-slate-600' />
            </button>
            <div>
              <h1 className='font-bold text-xl flex items-center gap-2'>
                Jurnal Refleksi
              </h1>
            </div>
          </div>
        </header>

        <main className='max-w-md mx-auto px-5 pt-6'>
          {/* ── GREETING ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-8'
          >
            <h2 className='text-2xl font-bold text-slate-800 leading-snug'>
              Apa yang ada
              <br />
              <span className='text-[#1e3a8a]'>di benakmu hari ini?</span>
            </h2>
          </motion.div>

          {/* ── CATEGORY CARDS ── */}
          <div className='space-y-3 mb-12'>
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => router.push(`/jurnal/write/${cat.id}`)}
                className={`w-full flex items-center gap-4 p-4 bg-white rounded-2xl border ${cat.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 shadow-lg`}
                  style={{ boxShadow: `0 8px 20px -4px ${cat.accent}40` }}
                >
                  <cat.icon size={20} className='text-white' />
                </div>
                <div className='flex-1 text-left'>
                  <p className='font-bold text-sm text-slate-800'>
                    {cat.title}
                  </p>
                  <p className='text-xs text-slate-400 mt-0.5'>
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

          {/* ── ENTRIES SECTION ── */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]'>
                Jejak Pikiranmu
              </p>
              {entries.length > 0 && (
                <span className='text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full'>
                  {entries.length} Catatan 🤍
                </span>
              )}
            </div>

            {/* UI BARU: FILTER DROPDOWN */}
            {entries.length > 0 && (
              <div className='flex items-center gap-2 mb-6'>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className='flex-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#1e3a8a] shadow-sm appearance-none'
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
                  className='flex-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#1e3a8a] shadow-sm appearance-none'
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

            {/* DAFTAR JURNAL GROUP BY DATE */}
            {loading ? (
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='h-28 bg-white rounded-2xl animate-pulse border border-slate-100'
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
                <div className='w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                  <PenLine size={28} className='text-slate-300' />
                </div>
                <p className='text-sm font-semibold text-slate-400'>
                  Belum ada tulisan
                </p>
                <p className='text-xs text-slate-400 mt-1'>
                  Pilih salah satu kategori di atas untuk memulai
                </p>
              </motion.div>
            ) : Object.keys(groupedEntries).length === 0 ? (
              <div className='text-center py-10'>
                <p className='text-sm font-semibold text-slate-400'>
                  Tidak ada yang cocok
                </p>
                <p className='text-xs text-slate-400 mt-1'>
                  Coba ubah filter di atas.
                </p>
              </div>
            ) : (
              <div className='space-y-8'>
                {/* LOOPING UNTUK PEMISAH TANGGAL */}
                {Object.entries(groupedEntries).map(
                  ([dateStr, dateEntries], groupIdx) => (
                    <div key={dateStr}>
                      {/* UI BARU: PEMISAH TIPIS BERDASARKAN TANGGAL */}
                      <div className='flex items-center gap-3 mb-4'>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                          {dateStr}
                        </p>
                        <div className='flex-1 h-px bg-slate-200' />
                      </div>

                      <div className='space-y-3'>
                        {dateEntries.map((entry, i) => {
                          const mood = getMood(entry.mood);
                          const cat = getCat(entry.category);
                          const moodStyle = moodColors[entry.mood] || {
                            bg: 'bg-slate-100',
                            text: 'text-slate-600',
                          };
                          return (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all'
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
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${moodStyle.bg} ${moodStyle.text} flex items-center gap-1`}
                                      >
                                        {mood.icon} {mood.label}
                                      </span>
                                    )}
                                  </div>
                                  <span className='text-[10px] text-slate-400 font-semibold'>
                                    {dayjs(entry.created_at).format('HH:mm')}
                                  </span>
                                </div>

                                <h3 className='font-bold text-slate-800 text-sm line-clamp-1 mb-1'>
                                  {entry.title || 'Tanpa Judul'}
                                </h3>
                                <p className='text-xs text-slate-500 line-clamp-2 leading-relaxed'>
                                  {entry.content}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
                {/* ── PRIVACY BANNER ── */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='mb-6 bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex items-center gap-3'
                >
                  <div className='bg-white p-2 rounded-lg text-slate-500 shadow-sm'>
                    <Lock size={16} />
                  </div>
                  <p className='text-xs text-slate-500 font-medium leading-relaxed'>
                    Ruang amanmu. Jurnal ini tersimpan privat dan{' '}
                    <strong className='text-slate-700'>
                      hanya bisa dibaca olehmu
                    </strong>
                    .
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
