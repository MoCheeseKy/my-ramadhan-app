import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Wind, ChevronRight, PenLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { moods } from '@/data/journalPrompts';
import ProtectedRoute from '@/components/ProtectedRoute';

const categories = [
  {
    id: 'pre_ramadhan',
    title: 'Persiapan Batin',
    subtitle: 'Luruskan niat',
    icon: Sparkles,
    gradient: 'from-violet-500 to-indigo-600',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-100',
    accent: '#7c3aed',
  },
  {
    id: 'daily',
    title: 'Refleksi Harian',
    subtitle: 'Cek rasa hari ini',
    icon: PenLine,
    gradient: 'from-[#1e3a8a] to-indigo-700',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    accent: '#1e3a8a',
  },
  {
    id: 'letting_go',
    title: 'Letting Go',
    subtitle: 'Lepaskan bebanmu',
    icon: Wind,
    gradient: 'from-rose-400 to-pink-600',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
    accent: '#e11d48',
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

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) return router.push('/login');
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

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-[#FAFAF7] text-slate-800 pb-28'>
        <Head>
          <title>Ruang Refleksi — MyRamadhan</title>
        </Head>

        {/* Ambient texture */}
        <div className='fixed inset-0 pointer-events-none -z-10'>
          <div className='absolute top-0 right-0 w-80 h-80 bg-violet-100/40 rounded-full blur-3xl' />
          <div className='absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl' />
        </div>

        <Head>
          <title>Jurnal Refleksi - MyRamadhan</title>
        </Head>

        {/* --- Header Sticky --- */}
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
            <p className='text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1'>
              Selamat datang
            </p>
            <h2 className='text-2xl font-bold text-slate-800 leading-snug'>
              Apa yang ada
              <br />
              <span className='text-[#1e3a8a]'>di benakmu hari ini?</span>
            </h2>
          </motion.div>

          {/* ── CATEGORY CARDS ── */}
          <div className='space-y-3 mb-10'>
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => router.push(`/jurnal/write/${cat.id}`)}
                className={`w-full flex items-center gap-4 p-4 bg-white rounded-2xl border ${cat.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group`}
              >
                {/* Icon blob */}
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

          {/* ── ENTRIES ── */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]'>
                Jejak Pikiranmu
              </p>
              {entries.length > 0 && (
                <span className='text-[10px] font-bold text-slate-300 bg-slate-100 px-2 py-1 rounded-full'>
                  {entries.length} entri
                </span>
              )}
            </div>

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
                <p className='text-xs text-slate-300 mt-1'>
                  Mulai dari satu kalimat jujur
                </p>
              </motion.div>
            ) : (
              <div className='space-y-3'>
                {entries.map((entry, i) => {
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
                      {/* Top accent strip */}
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
                        </div>

                        <h3 className='font-bold text-slate-800 text-sm line-clamp-1 mb-1'>
                          {entry.title || 'Tanpa Judul'}
                        </h3>
                        <p className='text-xs text-slate-500 line-clamp-2 leading-relaxed'>
                          {entry.content}
                        </p>

                        <p className='text-[10px] text-slate-300 font-medium mt-3'>
                          {new Date(entry.created_at).toLocaleDateString(
                            'id-ID',
                            {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            },
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
