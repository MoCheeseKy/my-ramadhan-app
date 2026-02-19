import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Droplets,
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  History,
  BookOpen,
  Heart,
  Coffee,
  Sun,
  X,
  Activity,
} from 'lucide-react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';

dayjs.locale('id');
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

const RAMADHAN_START = dayjs('2026-02-19');
const RAMADHAN_END = dayjs('2026-03-20');

const AMALAN_HAID = [
  {
    id: 1,
    title: 'Dzikir Pagi Petang',
    icon: Sun,
    desc: 'Menjaga lisan tetap basah dengan mengingat Allah.',
  },
  {
    id: 2,
    title: 'Mendengarkan Murottal',
    icon: BookOpen,
    desc: "Tetap dekat dengan Al-Qur'an meski tidak memegang mushaf.",
  },
  {
    id: 3,
    title: 'Bersedekah',
    icon: Heart,
    desc: 'Pahala berlipat ganda, sangat dianjurkan bagi wanita.',
  },
  {
    id: 4,
    title: 'Siapkan Buka Puasa',
    icon: Coffee,
    desc: 'Mendapat pahala orang yang berpuasa tanpa mengurangi pahala mereka.',
  },
];

export default function HaidTrackerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);
  const [user, setUser] = useState(null);

  // Modal States
  const [showNiatModal, setShowNiatModal] = useState(false);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null });
  const [inputDate, setInputDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) return router.push('/auth/login');
    setUser(localUser);

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', localUser.personal_code)
      .single();
    if (!userData) return;

    const { data, error } = await supabase
      .from('haid_logs')
      .select('*')
      .eq('user_id', userData.id)
      .order('start_date', { ascending: false });

    if (!error && data) {
      setLogs(data);
      const active = data.find((item) => item.end_date === null);
      setActivePeriod(active || null);
    }
    setLoading(false);
  };

  const handleSaveDate = async () => {
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', user.personal_code)
      .single();

    if (actionModal.type === 'start') {
      const { data, error } = await supabase
        .from('haid_logs')
        .insert({ user_id: userData.id, start_date: inputDate, end_date: null })
        .select()
        .single();

      if (!error) {
        setActivePeriod(data);
        setLogs([data, ...logs]);
      }
    } else if (actionModal.type === 'end' && activePeriod) {
      const { error } = await supabase
        .from('haid_logs')
        .update({ end_date: inputDate })
        .eq('id', activePeriod.id);

      if (!error) {
        const updatedLogs = logs.map((l) =>
          l.id === activePeriod.id ? { ...l, end_date: inputDate } : l,
        );
        setLogs(updatedLogs);
        setActivePeriod(null);

        setTimeout(() => setShowNiatModal(true), 500);
      }
    }

    setActionModal({ isOpen: false, type: null });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const targetId = deleteModal.id;

    try {
      const { error } = await supabase
        .from('haid_logs')
        .delete()
        .eq('id', targetId);

      if (error) {
        console.error('Error hapus data:', error);
        alert(`Gagal menghapus: ${error.message}`);
        return;
      }

      setLogs((prevLogs) => prevLogs.filter((l) => l.id !== targetId));
      if (activePeriod && activePeriod.id === targetId) {
        setActivePeriod(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const getDuration = (start, end) => {
    const startDate = dayjs(start);
    const endDate = end ? dayjs(end) : dayjs();
    return endDate.diff(startDate, 'day') + 1;
  };

  const getQadhaDays = (start, end) => {
    const s = dayjs(start);
    const e = end ? dayjs(end) : dayjs();
    if (e.isBefore(RAMADHAN_START, 'day') || s.isAfter(RAMADHAN_END, 'day'))
      return 0;
    const overlapStart = s.isAfter(RAMADHAN_START) ? s : RAMADHAN_START;
    const overlapEnd = e.isBefore(RAMADHAN_END) ? e : RAMADHAN_END;
    return overlapEnd.diff(overlapStart, 'day') + 1;
  };

  const totalMissedFasting = logs.reduce((acc, curr) => {
    return acc + getQadhaDays(curr.start_date, curr.end_date);
  }, 0);

  // === LOGIKA BARU: MENGHITUNG FASE SIKLUS ===
  const getCyclePhase = () => {
    if (logs.length === 0) return null;

    // Ambil siklus terakhir untuk patokan
    const lastLog = logs[0];
    const isOngoing = activePeriod !== null;

    const start = dayjs(lastLog.start_date);
    const today = dayjs();
    const dayOfCycle = today.diff(start, 'day') + 1;

    // Asumsi siklus rata-rata 28 hari
    let phaseInfo = {
      phase: '',
      desc: '',
      color: '',
      bg: '',
      bar: '',
      progress: 0,
    };

    if (isOngoing || dayOfCycle <= 7) {
      phaseInfo = {
        phase: 'Fase Menstruasi',
        desc: 'Tubuh sedang melepaskan dinding rahim. Perbanyak istirahat, wajar jika merasa lemas atau kram perut.',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        bar: 'bg-rose-500',
        progress: Math.min((dayOfCycle / 7) * 25, 25),
      };
    } else if (dayOfCycle > 7 && dayOfCycle <= 13) {
      phaseInfo = {
        phase: 'Fase Folikuler',
        desc: 'Energi dan mood sedang meningkat drastis! Waktu yang sangat tepat untuk produktif beraktivitas dan ibadah ekstra.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        bar: 'bg-blue-500',
        progress: 25 + ((dayOfCycle - 7) / 6) * 25,
      };
    } else if (dayOfCycle >= 14 && dayOfCycle <= 15) {
      phaseInfo = {
        phase: 'Fase Ovulasi',
        desc: 'Puncak masa kesuburan. Terkadang disertai nyeri ringan di satu sisi perut bawah (mittelschmerz).',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        bar: 'bg-emerald-500',
        progress: 50 + ((dayOfCycle - 13) / 2) * 25,
      };
    } else if (dayOfCycle > 15 && dayOfCycle <= 28) {
      phaseInfo = {
        phase: 'Fase Luteal (PMS)',
        desc: 'Energi mulai perlahan menurun. Kamu mungkin rentan mood swing, lapar, dan sensitif. Perbanyak sabar ya!',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        bar: 'bg-amber-500',
        progress: 75 + ((dayOfCycle - 15) / 13) * 25,
      };
    } else {
      phaseInfo = {
        phase: 'Menunggu Siklus',
        desc: 'Siklusmu sudah melewati rata-rata 28 hari. Jangan stres agar siklusmu segera datang.',
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        bar: 'bg-slate-400',
        progress: 100,
      };
    }

    return { ...phaseInfo, day: dayOfCycle };
  };

  const currentPhase = getCyclePhase();

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-[#FDF2F8] text-slate-800 pb-28 selection:bg-pink-200'>
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
          {/* --- STATUS CARD --- */}
          <div
            className={`relative overflow-hidden rounded-[2.5rem] p-8 text-center shadow-xl transition-all duration-500 ${
              activePeriod
                ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-200'
                : 'bg-white text-slate-800 border border-pink-100'
            }`}
          >
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
                    Hari ke-{' '}
                    <span className='text-2xl font-bold text-white'>
                      {getDuration(activePeriod.start_date)}
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      setInputDate(dayjs().format('YYYY-MM-DD'));
                      setActionModal({ isOpen: true, type: 'end' });
                    }}
                    className='bg-white text-pink-600 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto'
                  >
                    <CheckCircle size={18} /> Tandai Selesai
                  </button>
                  <p className='text-[10px] text-pink-200 mt-4 opacity-80'>
                    Dimulai:{' '}
                    {dayjs(activePeriod.start_date).format('DD MMMM YYYY')}
                  </p>
                </div>
              ) : (
                <div className='animate-fadeUp'>
                  <p className='text-slate-400 mb-6 text-sm'>
                    Semoga harimu menyenangkan!
                  </p>
                  <button
                    onClick={() => {
                      setInputDate(dayjs().format('YYYY-MM-DD'));
                      setActionModal({ isOpen: true, type: 'start' });
                    }}
                    className='bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto'
                  >
                    <Plus size={18} /> Mulai Haid Baru
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* === UI BARU: PREDIKSI FASE TUBUH === */}
          {currentPhase && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white rounded-3xl p-6 border border-pink-100 shadow-sm'
            >
              <div className='flex justify-between items-center mb-4'>
                <div className='flex items-center gap-2'>
                  <Activity size={18} className='text-pink-500' />
                  <h3 className='font-bold text-slate-700'>
                    Prediksi Fase Tubuh
                  </h3>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentPhase.bg} ${currentPhase.color}`}
                >
                  Hari ke-{currentPhase.day}
                </div>
              </div>

              <div className='mb-4'>
                <div className='flex justify-between items-end mb-2'>
                  <span className={`font-black text-lg ${currentPhase.color}`}>
                    {currentPhase.phase}
                  </span>
                </div>

                {/* Progress Bar Siklus */}
                <div className='h-2 w-full bg-slate-100 rounded-full overflow-hidden flex'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentPhase.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${currentPhase.bar} rounded-full relative`}
                  >
                    <div className='absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse' />
                  </motion.div>
                </div>
                <div className='flex justify-between text-[9px] text-slate-400 font-bold mt-1.5 px-1 uppercase tracking-widest'>
                  <span>Haid</span>
                  <span>Folikuler</span>
                  <span>Ovulasi</span>
                  <span>Luteal</span>
                </div>
              </div>

              <p className='text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100'>
                💡 {currentPhase.desc}
              </p>
            </motion.div>
          )}

          {/* --- AMALAN SAAT HAID --- */}
          {activePeriod && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-6'
            >
              <div className='flex items-center gap-2 mb-3 px-2'>
                <Heart size={16} className='text-pink-500' />
                <h3 className='font-bold text-slate-600 text-sm uppercase tracking-wide'>
                  Amalan Pengganti
                </h3>
              </div>
              <div className='flex gap-3 overflow-x-auto pb-4 custom-scrollbar px-2'>
                {AMALAN_HAID.map((amalan) => (
                  <div
                    key={amalan.id}
                    className='min-w-[140px] bg-white border border-pink-100 rounded-2xl p-4 shadow-sm shrink-0'
                  >
                    <div className='w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center mb-3'>
                      <amalan.icon size={16} className='text-pink-500' />
                    </div>
                    <h4 className='font-bold text-slate-700 text-xs mb-1'>
                      {amalan.title}
                    </h4>
                    <p className='text-[10px] text-slate-400 leading-relaxed'>
                      {amalan.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- STATS SUMMARY --- */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-white p-5 rounded-2xl border border-pink-100 flex flex-col items-center text-center shadow-sm'>
              <span className='w-10 h-10 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-2'>
                <History size={20} />
              </span>
              <h3 className='text-2xl font-bold text-slate-700'>
                {logs.length}
              </h3>
              <p className='text-[10px] text-slate-400 font-bold uppercase'>
                Total Siklus
              </p>
            </div>

            <div className='bg-white p-5 rounded-2xl border border-rose-100 flex flex-col items-center text-center shadow-sm'>
              <span className='w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2'>
                <Clock size={20} />
              </span>
              <h3 className='text-2xl font-bold text-slate-700'>
                {totalMissedFasting}
              </h3>
              <p className='text-[10px] text-slate-400 font-bold uppercase'>
                Utang Puasa
              </p>
            </div>
          </div>

          {/* --- RIWAYAT (HISTORY) --- */}
          <div className='mt-8'>
            <div className='flex items-center gap-2 mb-4 px-2'>
              <Calendar size={16} className='text-slate-400' />
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
                <div className='text-center py-10 opacity-50 bg-white rounded-2xl border border-dashed border-pink-200'>
                  <p className='text-sm text-slate-500'>
                    Belum ada data riwayat.
                  </p>
                </div>
              ) : (
                logs.map((log) => {
                  const isOngoing = log.end_date === null;
                  const duration = getDuration(log.start_date, log.end_date);
                  const qadhaDays = getQadhaDays(log.start_date, log.end_date);

                  return (
                    <div
                      key={log.id}
                      className='bg-white p-4 rounded-2xl border border-pink-50 shadow-sm flex justify-between items-center group relative overflow-hidden'
                    >
                      <div className='flex items-center gap-4'>
                        <div
                          className={`w-1.5 h-12 rounded-full ${isOngoing ? 'bg-pink-500 animate-pulse' : 'bg-slate-200'}`}
                        />
                        <div>
                          <p className='text-[11px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider'>
                            {dayjs(log.start_date).format('DD MMM')} -{' '}
                            {isOngoing
                              ? 'Sekarang'
                              : dayjs(log.end_date).format('DD MMM')}
                          </p>
                          <div className='flex items-center gap-3'>
                            <h4
                              className={`font-black text-lg ${isOngoing ? 'text-pink-600' : 'text-slate-700'}`}
                            >
                              {duration} Hari
                            </h4>
                            {qadhaDays > 0 && (
                              <span className='bg-rose-100 text-rose-600 text-[9px] font-bold px-2 py-0.5 rounded-md'>
                                {qadhaDays} Qadha
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type='button'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteModal({ isOpen: true, id: log.id });
                        }}
                        className='p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors relative z-10'
                        aria-label='Hapus riwayat'
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

      {/* ── MODAL KONFIRMASI HAPUS (KUSTOM) ── */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
              className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50'
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
              animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
              exit={{ scale: 0.95, opacity: 0, x: '-50%', y: '-50%' }}
              className='fixed top-1/2 left-1/2 w-[90%] max-w-sm bg-white rounded-[2rem] p-6 z-50 shadow-2xl text-center'
            >
              <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500'>
                <Trash2 size={28} />
              </div>
              <h3 className='font-bold text-lg text-slate-800 mb-2'>
                Hapus Riwayat?
              </h3>
              <p className='text-sm text-slate-500 mb-6'>
                Data siklus haid ini akan dihapus secara permanen dan tidak
                dapat dikembalikan.
              </p>

              <div className='flex gap-3'>
                <button
                  onClick={() => setDeleteModal({ isOpen: false, id: null })}
                  className='flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors'
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className='flex-1 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200'
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODAL INPUT TANGGAL ── */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionModal({ isOpen: false, type: null })}
              className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50'
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className='fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 z-50 shadow-2xl'
            >
              <div className='flex justify-between items-center mb-6'>
                <div>
                  <h3 className='font-bold text-lg text-slate-800'>
                    {actionModal.type === 'start'
                      ? 'Mulai Siklus Haid'
                      : 'Selesai Siklus Haid'}
                  </h3>
                  <p className='text-xs text-slate-500'>
                    Pilih tanggal yang sesuai
                  </p>
                </div>
                <button
                  onClick={() => setActionModal({ isOpen: false, type: null })}
                  className='p-2 bg-slate-100 rounded-full text-slate-500'
                >
                  <X size={16} />
                </button>
              </div>
              <input
                type='date'
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                max={dayjs().format('YYYY-MM-DD')}
                className='w-full bg-slate-50 border border-slate-200 text-slate-800 text-lg rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all mb-6'
              />
              <button
                onClick={handleSaveDate}
                className='w-full bg-pink-500 text-white font-bold py-4 rounded-xl hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200'
              >
                Simpan Tanggal
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MODAL NIAT MANDI WAJIB ── */}
      <AnimatePresence>
        {showNiatModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden'
              >
                <div className='absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2' />
                <div className='relative z-10'>
                  <div className='w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Droplets size={28} className='text-pink-500' />
                  </div>
                  <h3 className='font-black text-xl text-slate-800 mb-2'>
                    Alhamdulillah, Suci!
                  </h3>
                  <p className='text-sm text-slate-500 mb-6 leading-relaxed'>
                    Jangan lupa untuk menyucikan diri. Berikut adalah niat mandi
                    wajib setelah haid:
                  </p>

                  <div className='bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 text-center'>
                    <p
                      className='text-xl font-arabic text-slate-800 mb-3 leading-relaxed'
                      dir='rtl'
                    >
                      نَوَيْتُ الْغُسْلَ لِرَفْعِ الْحَدَثِ اْلاَكْبَرِ مِنَ
                      الحَيْضِ فَرْضًا ِللهِ تَعَالَى
                    </p>
                    <p className='text-xs text-slate-500 font-medium italic mb-2'>
                      "Nawaitul ghusla liraf'il hadatsil akbari minal haidhi
                      fardhan lillahi ta'ala."
                    </p>
                    <p className='text-[11px] text-slate-600 font-semibold mt-3 pt-3 border-t border-slate-200'>
                      "Aku niat mandi wajib untuk mensucikan hadast besar dari
                      haid karena Allah Ta'ala."
                    </p>
                  </div>

                  <button
                    onClick={() => setShowNiatModal(false)}
                    className='w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-900 transition-colors'
                  >
                    Insyaallah, Siap!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
}
