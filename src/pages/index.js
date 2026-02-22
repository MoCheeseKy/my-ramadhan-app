'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  ShieldCheck,
  Smartphone,
  Info,
  ExternalLink,
} from 'lucide-react';

import useUser from '@/hooks/useUser';
import useAppMode from '@/hooks/useAppMode';
import { studyMaterials } from '@/data/studyMaterials';
import { quotesData } from '@/data/quotes';

// Custom hooks
import useHijriDate from '@/hooks/useHijriDate';
import usePrayerTimes from '@/hooks/usePrayerTimes';
import useHeroMode from '@/hooks/useHeroMode';
import useNotifications from '@/hooks/useNotifications';
import useTrackerSummary from '@/hooks/useTrackerSummary';

// Home components
import HomeHeader from '@/components/Home/HomeHeader';
import HeroCard from '@/components/Home/HeroCard';
import DailyGoalTracker from '@/components/Home/DailyGoalTracker';
import ToolGrid from '@/components/Home/ToolGrid';
import DailyKnowledge from '@/components/Home/DailyKnowledge';
import JurnalCard from '@/components/Home/JurnalCard';
import RamaTalkCard from '@/components/Home/RamaTalkCard';
import QuoteCard from '@/components/Home/QuoteCard';

// Drawers
import TrackerDrawer from '@/components/TrackerDrawer';
import ScheduleDrawer from '@/components/ScheduleDrawer';
import NotificationDrawer from '@/components/NotificationDrawer';

dayjs.locale('id');
dayjs.extend(relativeTime);
dayjs.extend(duration);

export default function MyRamadhanHome() {
  const { user } = useUser();
  const { isPWA } = useAppMode();

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Drawer state
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Quote state
  const [quoteOfTheDay, setQuoteOfTheDay] = useState(quotesData[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  // Custom hooks
  const { hijriDate, hijriDay } = useHijriDate();
  const { prayerTimes, userCity, fetchPrayerTimes } = usePrayerTimes();
  const { taskProgress, fetchTrackerSummary } = useTrackerSummary(user, isPWA);
  const { notifications, hasUnreadNotif, markAsRead } = useNotifications(
    mounted,
    hijriDay,
    prayerTimes,
    currentTime,
  );
  const hero = useHeroMode(prayerTimes, currentTime);

  // Inisialisasi awal
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    randomizeQuote();
    fetchPrayerTimes();
    return () => clearInterval(timer);
  }, []);

  // Function untuk memunculkan popup major update
  useEffect(() => {
    const hasSeenUpdate = localStorage.getItem('has_seen_major_update_p2p');
    if (!hasSeenUpdate) {
      setTimeout(() => setShowUpdateModal(true), 1200);
    }
  }, []);

  // Refresh tracker saat user/mode berubah
  useEffect(() => {
    if (user) fetchTrackerSummary();
  }, [user, isPWA]);

  // Function untuk menutup popup update
  const handleCloseUpdateModal = () => {
    localStorage.setItem('has_seen_major_update_p2p', 'true');
    setShowUpdateModal(false);
  };

  // Function untuk redirect ke web baru
  const handleGoToNewWeb = () => {
    localStorage.setItem('has_seen_major_update_p2p', 'true');
    window.location.href = 'https://my-ramadhan-app-three.vercel.app/';
  };

  const randomizeQuote = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setQuoteOfTheDay(
        quotesData[Math.floor(Math.random() * quotesData.length)],
      );
      setIsSpinning(false);
    }, 500);
  };

  const handleOpenNotification = () => {
    setIsNotificationOpen(true);
    markAsRead();
  };

  const dailyTopic =
    studyMaterials.find((m) => m.day === hijriDay) || studyMaterials[0];

  if (!mounted) return null;

  return (
    <main className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 selection:bg-blue-200 dark:selection:bg-blue-800 transition-colors duration-300'>
      {/* Background blobs dekoratif */}
      <div className='fixed inset-0 -z-10 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60' />
      </div>

      {/* Adaptive container: Mobile → Tablet → Desktop */}
      <div className='w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8 lg:py-10 lg:px-8'>
        <HomeHeader
          user={user}
          hijriDate={hijriDate}
          hasUnreadNotif={hasUnreadNotif}
          onOpenNotification={handleOpenNotification}
        />

        {/* Grid layout utama: 1 kolom (mobile) / 2 kolom (desktop) */}
        <div className='flex flex-col lg:flex-row gap-5 md:gap-6 lg:gap-8 animate-fadeUp'>
          {/* ── Kolom Kiri (main content) ── */}
          <div className='flex-1 flex flex-col gap-5 md:gap-6 lg:gap-6'>
            <HeroCard
              hero={hero}
              userCity={userCity}
              onOpenSchedule={() => setIsScheduleOpen(true)}
            />
            <DailyGoalTracker
              taskProgress={taskProgress}
              onClick={() =>
                !user ? router.push('/auth/login') : setIsTrackerOpen(true)
              }
            />
            <ToolGrid />
          </div>

          {/* ── Kolom Kanan / Bawah (sidebar desktop & tablet grid) ── */}
          <div className='w-full lg:w-[350px] xl:w-[380px] flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-5 md:gap-6 lg:gap-6'>
            <DailyKnowledge hijriDay={hijriDay} dailyTopic={dailyTopic} />
            <JurnalCard user={user} />
            <RamaTalkCard />
            <QuoteCard
              quote={quoteOfTheDay}
              isSpinning={isSpinning}
              onRefresh={randomizeQuote}
            />
          </div>
        </div>
      </div>

      {/* Drawers */}
      <TrackerDrawer
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onUpdate={fetchTrackerSummary}
      />
      <ScheduleDrawer
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onUpdate={fetchPrayerTimes}
      />
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />

      <AnimatePresence>
        {showUpdateModal && (
          <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden'
            >
              <div className='absolute -top-12 -right-12 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl' />
              <div className='absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-2xl' />

              <div className='relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-tr from-[#1e3a8a] to-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30'>
                  <Rocket size={32} />
                </div>

                <h2 className='text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 leading-tight'>
                  MAJOR UPDATE:
                  <br />
                  <span className='text-[#1e3a8a] dark:text-blue-400'>
                    Arsitektur Baru!
                  </span>
                </h2>

                <p className='text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6'>
                  Kami baru saja melakukan perpindahan sistem besar-besaran agar
                  aplikasi menjadi jauh lebih aman, cepat, dan mandiri.
                </p>

                <div className='space-y-4 mb-8'>
                  <div className='flex gap-3'>
                    <div className='mt-0.5 shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
                        100% Local-First
                      </h4>
                      <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed'>
                        Data kamu kini disimpan langsung di perangkat, tidak
                        lagi di database kami. Jauh lebih aman secara privasi.
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <div className='mt-0.5 shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400'>
                      <Smartphone size={16} />
                    </div>
                    <div>
                      <h4 className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
                        Sistem Sinkronisasi P2P
                      </h4>
                      <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed'>
                        Sistem login <span className='italic'>Unique Code</span>{' '}
                        digantikan dengan transfer data langsung antar perangkat
                        (Peer-to-Peer).
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <div className='mt-0.5 shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400'>
                      <Info size={16} />
                    </div>
                    <div>
                      <h4 className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
                        Pengembangan Dihentikan
                      </h4>
                      <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed'>
                        Versi web ini sudah{' '}
                        <span className='font-bold text-rose-500'>
                          berhenti
                        </span>{' '}
                        dikembangkan. Semua fitur baru hanya akan dirilis di
                        alamat web yang baru.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex flex-col gap-3'>
                  <button
                    onClick={handleGoToNewWeb}
                    className='w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                  >
                    Buka Website Baru <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={handleCloseUpdateModal}
                    className='w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-[0.98]'
                  >
                    Nanti Dulu
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
