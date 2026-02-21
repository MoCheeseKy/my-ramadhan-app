'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Droplets } from 'lucide-react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

import ProtectedRoute from '@/components/ProtectedRoute';
import useUser from '@/hooks/useUser';
import useAppMode from '@/hooks/useAppMode';

import { useHaidData } from '@/hooks/useHaidData';
import { useCyclePhase } from '@/hooks/useCyclePhase';
import StatusCard from '@/components/HaidTracker/StatusCard';
import CyclePhaseCard from '@/components/HaidTracker/CyclePhaseCard';
import AmalanCard from '@/components/HaidTracker/AmalanCard';
import StatsGrid from '@/components/HaidTracker/StatsGrid';
import HistoryList from '@/components/HaidTracker/HistoryList';
import DeleteModal from '@/components/HaidTracker/DeleteModal';
import DateInputModal from '@/components/HaidTracker/DateInputModal';
import NiatMandiModal from '@/components/HaidTracker/NiatMandiModal';

dayjs.locale('id');
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

export default function HaidTrackerPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { isPWA } = useAppMode();

  // ── Data & logika bisnis ──
  const {
    loading,
    logs,
    activePeriod,
    saveDate,
    deleteLog,
    getDuration,
    getQadhaDays,
    totalMissedFasting,
  } = useHaidData(user, isPWA);

  const currentPhase = useCyclePhase(logs, activePeriod);

  // ── UI state ──
  const [showNiatModal, setShowNiatModal] = useState(false);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null });
  const [inputDate, setInputDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Redirect ke login jika belum autentikasi
  useEffect(() => {
    if (!userLoading && !user) router.push('/auth/login');
  }, [user, userLoading]);

  // ── Handlers ──

  const handleOpenAction = (type) => {
    setInputDate(dayjs().format('YYYY-MM-DD'));
    setActionModal({ isOpen: true, type });
  };

  const handleSaveDate = async () => {
    const result = await saveDate(actionModal.type, inputDate);
    setActionModal({ isOpen: false, type: null });
    // Tampilkan niat mandi wajib setelah siklus ditandai selesai
    if (result.success && result.type === 'end') {
      setTimeout(() => setShowNiatModal(true), 500);
    }
  };

  const handleConfirmDelete = async () => {
    await deleteLog(deleteModal.id);
    setDeleteModal({ isOpen: false, id: null });
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-[#FDF2F8] dark:bg-slate-950 text-slate-800 dark:text-slate-200 pb-28 selection:bg-pink-200 dark:selection:bg-pink-900 transition-colors duration-300'>
        <Head>
          <title>Haid Tracker - MyRamadhan</title>
        </Head>

        {/* Header */}
        <header className='sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-[#FDF2F8]/80 dark:bg-slate-900/80 backdrop-blur-md'>
          <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex justify-between items-center w-full'>
            <button
              onClick={() => router.push('/')}
              className='p-2 -ml-2 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors'
            >
              <ArrowLeft
                size={20}
                className='text-slate-600 dark:text-slate-400'
              />
            </button>
            <h1 className='font-bold text-lg text-pink-700 dark:text-pink-400 flex items-center gap-2'>
              <Droplets
                size={20}
                className='text-pink-500 dark:text-pink-400 fill-pink-500 dark:fill-pink-400'
              />
              Haid Tracker
            </h1>
            <div className='w-8' />
          </div>
        </header>

        {/* Konten utama */}
        <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5'>
          <div className='flex flex-col lg:flex-row gap-6 lg:gap-8'>
            {/* Kolom kiri */}
            <div className='flex-1 space-y-6'>
              <StatusCard
                activePeriod={activePeriod}
                getDuration={getDuration}
                onStartPeriod={() => handleOpenAction('start')}
                onEndPeriod={() => handleOpenAction('end')}
              />
              <CyclePhaseCard currentPhase={currentPhase} />
              {activePeriod && <AmalanCard />}
            </div>

            {/* Kolom kanan (sidebar di desktop) */}
            <div className='w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 space-y-6'>
              <StatsGrid
                totalCycles={logs.length}
                totalMissedFasting={totalMissedFasting}
              />
              <HistoryList
                logs={logs}
                loading={loading}
                getDuration={getDuration}
                getQadhaDays={getQadhaDays}
                onDelete={(id) => setDeleteModal({ isOpen: true, id })}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
      <DateInputModal
        isOpen={actionModal.isOpen}
        actionType={actionModal.type}
        inputDate={inputDate}
        setInputDate={setInputDate}
        onSave={handleSaveDate}
        onClose={() => setActionModal({ isOpen: false, type: null })}
      />
      <NiatMandiModal
        isOpen={showNiatModal}
        onClose={() => setShowNiatModal(false)}
      />
    </ProtectedRoute>
  );
}
