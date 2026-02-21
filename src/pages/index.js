'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

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
import HomeHeader from '@/components/home/HomeHeader';
import HeroCard from '@/components/home/HeroCard';
import DailyGoalTracker from '@/components/home/DailyGoalTracker';
import ToolGrid from '@/components/home/ToolGrid';
import DailyKnowledge from '@/components/home/DailyKnowledge';
import JurnalCard from '@/components/home/JurnalCard';
import RamaTalkCard from '@/components/home/RamaTalkCard';
import QuoteCard from '@/components/home/QuoteCard';

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

  // Refresh tracker saat user/mode berubah
  useEffect(() => {
    if (user) fetchTrackerSummary();
  }, [user, isPWA]);

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
    </main>
  );
}
