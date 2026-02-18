import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Droplets,
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  History,
} from 'lucide-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import { supabase } from '@/lib/supabase';

dayjs.locale('id');
dayjs.extend(duration);
dayjs.extend(relativeTime);

export default function HaidTrackerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null); // Data haid yang sedang berlangsung
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) return router.push('/login');
    setUser(localUser);

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', localUser.personal_code)
      .single();
    if (!userData) return;

    // Ambil semua log haid, urutkan dari yang terbaru
    const { data, error } = await supabase
      .from('haid_logs')
      .select('*')
      .eq('user_id', userData.id)
      .order('start_date', { ascending: false });

    if (!error && data) {
      setLogs(data);
      // Cek apakah ada yang end_date-nya masih NULL (Sedang berlangsung)
      const active = data.find((item) => item.end_date === null);
      setActivePeriod(active || null);
    }
    setLoading(false);
  };

  const handleStartHaid = async () => {
    if (!user) return;
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', user.personal_code)
      .single();

    // Mulai haid hari ini
    const today = dayjs().format('YYYY-MM-DD');

    const { data, error } = await supabase
      .from('haid_logs')
      .insert({
        user_id: userData.id,
        start_date: today,
        end_date: null,
      })
      .select()
      .single();

    if (!error) {
      setActivePeriod(data);
      setLogs([data, ...logs]);
    }
  };

  const handleEndHaid = async () => {
    if (!activePeriod) return;

    // Selesai haid hari ini
    const today = dayjs().format('YYYY-MM-DD');

    const { error } = await supabase
      .from('haid_logs')
      .update({ end_date: today })
      .eq('id', activePeriod.id);

    if (!error) {
      // Update state lokal
      const updatedLogs = logs.map((l) =>
        l.id === activePeriod.id ? { ...l, end_date: today } : l,
      );
      setLogs(updatedLogs);
      setActivePeriod(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus riwayat ini?')) return;
    const { error } = await supabase.from('haid_logs').delete().eq('id', id);
    if (!error) {
      setLogs(logs.filter((l) => l.id !== id));
      if (activePeriod && activePeriod.id === id) setActivePeriod(null);
    }
  };

  // Hitung Durasi (Hari ke-X)
  const getDuration = (start, end) => {
    const startDate = dayjs(start);
    const endDate = end ? dayjs(end) : dayjs();
    return endDate.diff(startDate, 'day') + 1;
  };

  // Estimasi Utang Puasa (Total hari haid)
  // Logic sederhana: Total hari dari semua log
  const totalMissedFasting = logs.reduce((acc, curr) => {
    return acc + getDuration(curr.start_date, curr.end_date);
  }, 0);

  return (
    <div className='min-h-screen bg-[#FDF2F8] text-slate-800 pb-20 selection:bg-pink-200'>
      <Head>
        <title>Haid Tracker - MyRamadhan</title>
      </Head>

      {/* Header */}
      <header className='sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-[#FDF2F8]/80 backdrop-blur-md'>
        <button
          onClick={() => router.push('/')}
          className='p-2 -ml-2 rounded-full hover:bg-pink-100 transition-colors'
        >
          <ArrowLeft size={20} className='text-slate-600' />
        </button>
        <h1 className='font-bold text-lg text-pink-700 flex items-center gap-2'>
          <Droplets size={20} className='text-pink-500 fill-pink-500' /> Haid
          Tracker
        </h1>
        <div className='w-8' />
      </header>

      <main className='max-w-md mx-auto p-5 space-y-6'>
        {/* --- STATUS CARD (BIG) --- */}
        <div
          className={`
          relative overflow-hidden rounded-[2.5rem] p-8 text-center shadow-xl shadow-pink-200 transition-all duration-500
          ${
            activePeriod
              ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white'
              : 'bg-white text-slate-800 border border-pink-100'
          }
        `}
        >
          {/* Background Decor */}
          <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />

          <div className='relative z-10'>
            <p
              className={`text-xs font-bold uppercase tracking-widest mb-2 ${activePeriod ? 'text-pink-200' : 'text-slate-400'}`}
            >
              Status Saat Ini
            </p>

            <h2 className='text-4xl font-black mb-2'>
              {activePeriod ? 'SEDANG HAID' : 'SUCI'}
            </h2>

            {activePeriod ? (
              <div className='animate-fadeUp'>
                <p className='text-pink-100 mb-6'>
                  Hari ke-
                  <span className='text-2xl font-bold text-white'>
                    {getDuration(activePeriod.start_date)}
                  </span>
                </p>
                <button
                  onClick={handleEndHaid}
                  className='bg-white text-pink-600 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto'
                >
                  <CheckCircle size={18} /> Selesai Haid
                </button>
                <p className='text-[10px] text-pink-200 mt-4 opacity-80'>
                  Dimulai:{' '}
                  {dayjs(activePeriod.start_date).format('DD MMMM YYYY')}
                </p>
              </div>
            ) : (
              <div className='animate-fadeUp'>
                <p className='text-slate-400 mb-6'>Tidak ada periode aktif.</p>
                <button
                  onClick={handleStartHaid}
                  className='bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto'
                >
                  <Plus size={18} /> Mulai Haid Baru
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- STATS SUMMARY --- */}
        <div className='grid grid-cols-2 gap-3'>
          <div className='bg-white p-5 rounded-2xl border border-pink-100 flex flex-col items-center text-center'>
            <span className='w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-2'>
              <History size={20} />
            </span>
            <h3 className='text-2xl font-bold text-slate-700'>{logs.length}</h3>
            <p className='text-[10px] text-slate-400 font-bold uppercase'>
              Total Siklus
            </p>
          </div>

          <div className='bg-white p-5 rounded-2xl border border-pink-100 flex flex-col items-center text-center'>
            <span className='w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2'>
              <Clock size={20} />
            </span>
            <h3 className='text-2xl font-bold text-slate-700'>
              {totalMissedFasting}
            </h3>
            <p className='text-[10px] text-slate-400 font-bold uppercase'>
              Hari (Utang Puasa)
            </p>
          </div>
        </div>

        {/* --- RIWAYAT (HISTORY) --- */}
        <div>
          <div className='flex items-center gap-2 mb-4 px-2'>
            <History size={16} className='text-slate-400' />
            <h3 className='font-bold text-slate-600 text-sm uppercase tracking-wide'>
              Riwayat Siklus
            </h3>
          </div>

          <div className='space-y-3'>
            {loading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className='h-20 bg-white rounded-2xl animate-pulse'
                />
              ))
            ) : logs.length === 0 ? (
              <div className='text-center py-10 opacity-50'>
                <p className='text-sm'>Belum ada data riwayat.</p>
              </div>
            ) : (
              logs.map((log) => {
                const isOngoing = log.end_date === null;
                const duration = getDuration(log.start_date, log.end_date);

                return (
                  <div
                    key={log.id}
                    className='bg-white p-5 rounded-2xl border border-pink-50 shadow-sm flex justify-between items-center group'
                  >
                    <div className='flex items-center gap-4'>
                      <div
                        className={`w-2 h-12 rounded-full ${isOngoing ? 'bg-pink-500 animate-pulse' : 'bg-slate-200'}`}
                      />
                      <div>
                        <p className='text-xs text-slate-400 font-bold mb-0.5'>
                          {dayjs(log.start_date).format('DD MMM')} -{' '}
                          {isOngoing
                            ? 'Sekarang'
                            : dayjs(log.end_date).format('DD MMM YYYY')}
                        </p>
                        <h4
                          className={`font-bold text-lg ${isOngoing ? 'text-pink-600' : 'text-slate-700'}`}
                        >
                          {duration} Hari
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(log.id)}
                      className='p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
