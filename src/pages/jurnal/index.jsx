import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, Trash2, Book, Sparkles, Wind } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { moods } from '@/data/journalPrompts';

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

  const getMoodIcon = (moodId) => {
    const found = moods.find((m) => m.id === moodId);
    return found ? found.icon : '📝';
  };

  const categories = [
    {
      id: 'daily',
      title: 'Daily Journal',
      icon: Book,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'pre_ramadhan',
      title: 'Pre-Ramadhan',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'letting_go',
      title: 'Letting Go',
      icon: Wind,
      color: 'bg-rose-100 text-rose-600',
    },
  ];

  return (
    <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-24 selection:bg-purple-200'>
      <Head>
        <title>Jurnal Refleksi - MyRamadhan</title>
      </Head>

      {/* Header */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between'>
        <button
          onClick={() => router.push('/')}
          className='p-2 -ml-2 rounded-full hover:bg-slate-100'
        >
          <ArrowLeft size={20} className='text-slate-600' />
        </button>
        <h1 className='font-bold text-lg'>Ruang Refleksi</h1>
        <div className='w-8' />
      </header>

      <main className='max-w-md mx-auto p-5'>
        {/* --- MENU TULIS BARU --- */}
        <div className='mb-8'>
          <p className='text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider'>
            Mulai Menulis
          </p>
          <div className='grid grid-cols-3 gap-3'>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/jurnal/write/${cat.id}`)}
                className='flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all'
              >
                <div className={`p-3 rounded-full ${cat.color}`}>
                  <cat.icon size={20} />
                </div>
                <span className='text-[10px] font-bold text-slate-600 text-center'>
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* --- RIWAYAT TULISAN --- */}
        <div>
          <p className='text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider'>
            Jejak Pikiranmu
          </p>

          {loading ? (
            <div className='space-y-3 animate-pulse'>
              {[1, 2].map((i) => (
                <div key={i} className='h-24 bg-white rounded-2xl' />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className='text-center py-10 opacity-50'>
              <Book size={48} className='mx-auto mb-2 text-slate-300' />
              <p className='text-sm'>Belum ada tulisan. Yuk mulai curhat!</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className='bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <span className='text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase'>
                      {entry.category.replace('_', ' ')}
                    </span>
                    <span className='text-2xl' title={entry.mood}>
                      {getMoodIcon(entry.mood)}
                    </span>
                  </div>

                  <h3 className='font-bold text-slate-800 mb-1 line-clamp-1'>
                    {entry.title || 'Tanpa Judul'}
                  </h3>
                  <p className='text-sm text-slate-500 line-clamp-3 leading-relaxed'>
                    {entry.content}
                  </p>

                  <div className='mt-4 pt-3 border-t border-slate-50 flex justify-between items-center'>
                    <span className='text-[10px] text-slate-400'>
                      {new Date(entry.created_at).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                    {/* Disini nanti bisa tambah tombol baca detail */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
