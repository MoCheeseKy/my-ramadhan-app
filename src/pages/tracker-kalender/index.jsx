'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

dayjs.locale('id');

// Gunakan tahun sekarang agar tidak hardcode 2025
const CURRENT_YEAR = dayjs().year();
const RAMADHAN_START = dayjs(`${CURRENT_YEAR}-02-19`);
const RAMADHAN_END = dayjs(`${CURRENT_YEAR}-03-21`);
const RAMADHAN_DAYS = 30;

const TRACKER_KEYS = [
  'is_puasa',
  'subuh',
  'dzuhur',
  'ashar',
  'maghrib',
  'isya',
  'tarawih',
  'quran',
  'sedekah',
];

const TRACKER_LABELS = {
  is_puasa: 'Puasa',
  subuh: 'Subuh',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
  tarawih: 'Tarawih',
  quran: "Qur'an",
  sedekah: 'Sedekah',
};

// All 30 Ramadhan dates
const RAMADHAN_DATES = Array.from({ length: RAMADHAN_DAYS }, (_, i) =>
  RAMADHAN_START.add(i, 'day'),
);

const getProgressColor = (percent) => {
  if (percent === 0) return 'bg-slate-100 text-slate-400';
  if (percent < 40) return 'bg-rose-100 text-rose-600';
  if (percent < 70) return 'bg-amber-100 text-amber-700';
  if (percent < 100) return 'bg-blue-100 text-blue-700';
  return 'bg-emerald-100 text-emerald-700';
};

const getBarColor = (percent) => {
  if (percent === 0) return 'bg-slate-200';
  if (percent < 40) return 'bg-rose-400';
  if (percent < 70) return 'bg-amber-400';
  if (percent < 100) return 'bg-blue-400';
  return 'bg-emerald-500';
};

export default function TrackerKalender() {
  const router = useRouter();
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [userId, setUserId] = useState(null);
  const [toggling, setToggling] = useState(null); // key yang sedang di-toggle

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) {
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', localUser.personal_code)
      .single();

    if (!userData) {
      setLoading(false);
      return;
    }

    setUserId(userData.id);

    const { data } = await supabase
      .from('daily_trackers')
      .select('*')
      .eq('user_id', userData.id)
      .gte('date', RAMADHAN_START.format('YYYY-MM-DD'))
      .lte('date', RAMADHAN_END.format('YYYY-MM-DD'));

    const mapped = {};
    (data || []).forEach((row) => {
      mapped[row.date] = row;
    });

    setAllData(mapped);
    setLoading(false);
  }, []);

  const toggleItem = useCallback(
    async (dateKey, key) => {
      if (!userId) return;
      const currentRow = allData[dateKey];
      const newValue = currentRow ? !currentRow[key] : true;

      setToggling(`${dateKey}-${key}`);

      // Optimistic update
      setAllData((prev) => ({
        ...prev,
        [dateKey]: {
          ...(prev[dateKey] || { user_id: userId, date: dateKey }),
          [key]: newValue,
        },
      }));

      if (currentRow) {
        // Update existing row
        await supabase
          .from('daily_trackers')
          .update({ [key]: newValue })
          .match({ user_id: userId, date: dateKey });
      } else {
        // Insert new row
        const { data: newRow } = await supabase
          .from('daily_trackers')
          .insert({ user_id: userId, date: dateKey, [key]: newValue })
          .select()
          .single();
        if (newRow) {
          setAllData((prev) => ({ ...prev, [dateKey]: newRow }));
        }
      }

      setToggling(null);
    },
    [allData, userId],
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const getProgress = (dateKey) => {
    const row = allData[dateKey];
    if (!row)
      return {
        completed: 0,
        total: TRACKER_KEYS.length,
        percent: 0,
        row: null,
      };
    const completed = TRACKER_KEYS.reduce(
      (acc, key) => acc + (row[key] ? 1 : 0),
      0,
    );
    return {
      completed,
      total: TRACKER_KEYS.length,
      percent: Math.round((completed / TRACKER_KEYS.length) * 100),
      row,
    };
  };

  const today = dayjs().format('YYYY-MM-DD');

  // Stats
  const totalDaysPassed = RAMADHAN_DATES.filter(
    (d) => !d.isAfter(dayjs(), 'day'),
  ).length;
  const totalCompleted = Object.values(allData).reduce(
    (acc, row) => acc + TRACKER_KEYS.reduce((a, k) => a + (row[k] ? 1 : 0), 0),
    0,
  );
  const perfectDays = Object.values(allData).filter(
    (row) =>
      TRACKER_KEYS.reduce((a, k) => a + (row[k] ? 1 : 0), 0) ===
      TRACKER_KEYS.length,
  ).length;

  // Grid: offset by first weekday of Ramadhan start (19 Feb 2025 = Wednesday = 3)
  const firstDayOfWeek = RAMADHAN_START.day();
  const gridCells = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...RAMADHAN_DATES,
  ];

  return (
    <main className='min-h-screen bg-[#F6F9FC] pb-16'>
      <div className='fixed inset-0 -z-10 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl opacity-60' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-indigo-100/50 rounded-full blur-3xl opacity-60' />
      </div>

      <div className='max-w-md mx-auto p-5'>
        {/* Header */}
        <header className='flex items-center gap-3 mb-6 mt-2'>
          <button
            type='button'
            onClick={() => router.back()}
            className='w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors'
          >
            <ArrowLeft size={18} className='text-slate-600' />
          </button>
          <div>
            <h1 className='text-xl font-extrabold text-slate-800 tracking-tight'>
              Kalender Ramadhan
            </h1>
            <p className='text-xs text-slate-400'>
              19 Februari – 21 Maret {CURRENT_YEAR} · 30 Hari
            </p>
          </div>
        </header>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-3 mb-4'>
          <StatCard
            value={totalDaysPassed}
            label='Hari Dilalui'
            color='text-[#1e3a8a]'
            bg='bg-blue-50'
          />
          <StatCard
            value={totalCompleted}
            label='Total Ibadah'
            color='text-emerald-600'
            bg='bg-emerald-50'
          />
          <StatCard
            value={perfectDays}
            label='Hari Sempurna'
            color='text-amber-600'
            bg='bg-amber-50'
          />
        </div>

        {/* Calendar Card */}
        <div className='bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 mb-4'>
          <div className='mb-4'>
            <h2 className='font-bold text-slate-800 text-base'>
              30 Hari Ramadhan 1447 H
            </h2>
            <p className='text-xs text-slate-400 mt-0.5'>
              Ketuk tanggal untuk lihat detail ibadah
            </p>
          </div>

          {/* Day Labels */}
          <div className='grid grid-cols-7 mb-2'>
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div
                key={d}
                className='text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1'
              >
                {d}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          {loading ? (
            <div className='grid grid-cols-7 gap-1.5'>
              {[...Array(35)].map((_, i) => (
                <div
                  key={i}
                  className='h-11 rounded-xl bg-slate-100 animate-pulse'
                />
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-7 gap-1.5'>
              {gridCells.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} />;

                const dateKey = date.format('YYYY-MM-DD');
                const isFuture = date.isAfter(dayjs(), 'day');
                const isToday = dateKey === today;
                const isSelected = selectedDate === dateKey;
                const ramadhanDay = date.diff(RAMADHAN_START, 'day') + 1;
                const progress = getProgress(dateKey);

                return (
                  <button
                    key={dateKey}
                    type='button'
                    onClick={() =>
                      !isFuture && setSelectedDate(isSelected ? null : dateKey)
                    }
                    className={`
                      relative flex flex-col items-center justify-center h-11 rounded-xl transition-all text-xs font-bold
                      ${isFuture ? 'opacity-25 cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'}
                      ${isSelected ? 'ring-2 ring-[#1e3a8a] ring-offset-1' : ''}
                      ${isToday ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}
                      ${!isFuture ? getProgressColor(progress.percent) : 'bg-slate-50 text-slate-300'}
                    `}
                  >
                    {/* Ramadhan day number */}
                    <span className='text-[8px] leading-none opacity-60 font-semibold'>
                      {ramadhanDay}
                    </span>
                    {/* Gregorian date */}
                    <span className='leading-none text-[11px]'>
                      {date.date()}
                    </span>
                    {/* Progress count */}
                    {!isFuture && progress.completed > 0 && (
                      <span className='text-[7px] leading-none mt-0.5 opacity-70'>
                        {progress.completed}/{progress.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className='flex items-center gap-3 mt-4 justify-center flex-wrap'>
            {[
              { color: 'bg-slate-200', label: 'Kosong' },
              { color: 'bg-rose-400', label: '<40%' },
              { color: 'bg-amber-400', label: '40–69%' },
              { color: 'bg-blue-400', label: '70–99%' },
              { color: 'bg-emerald-500', label: '100%' },
            ].map(({ color, label }) => (
              <div key={label} className='flex items-center gap-1'>
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className='text-[9px] text-slate-400'>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedDate &&
          (() => {
            const progress = getProgress(selectedDate);
            return (
              <div className='bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100'>
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <p className='text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5'>
                      Hari ke-
                      {dayjs(selectedDate).diff(RAMADHAN_START, 'day') + 1}{' '}
                      Ramadhan
                    </p>
                    <h3 className='font-bold text-slate-800 capitalize'>
                      {dayjs(selectedDate).format('dddd, DD MMMM YYYY')}
                    </h3>
                    <p className='text-xs text-slate-400 mt-0.5'>
                      {progress.completed} dari {progress.total} ibadah selesai
                    </p>
                  </div>
                  <span
                    className={`text-2xl font-black ${
                      progress.percent === 100
                        ? 'text-emerald-500'
                        : progress.percent >= 70
                          ? 'text-blue-500'
                          : progress.percent >= 40
                            ? 'text-amber-500'
                            : progress.percent > 0
                              ? 'text-rose-400'
                              : 'text-slate-300'
                    }`}
                  >
                    {progress.percent}%
                  </span>
                </div>

                {/* Overall progress bar */}
                <div className='h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4'>
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getBarColor(progress.percent)}`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>

                {/* Ibadah list — interactive toggle */}
                <div className='space-y-2'>
                  {TRACKER_KEYS.map((key) => {
                    const done = allData[selectedDate]?.[key] ?? false;
                    const isItemLoading = toggling === `${selectedDate}-${key}`;
                    return (
                      <button
                        type='button'
                        key={key}
                        onClick={() => toggleItem(selectedDate, key)}
                        disabled={isItemLoading}
                        className={`
                        w-full relative flex items-center justify-between px-4 py-3 rounded-xl border
                        transition-all duration-200 active:scale-[0.98] cursor-pointer overflow-hidden
                        ${done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}
                        ${isItemLoading ? 'opacity-60' : ''}
                      `}
                      >
                        <div
                          className={`absolute inset-0 bg-emerald-50 transition-transform duration-300 origin-left ${done ? 'scale-x-100' : 'scale-x-0'}`}
                        />
                        <span
                          className={`relative z-10 text-sm font-semibold transition-colors ${
                            done ? 'text-emerald-800' : 'text-slate-500'
                          }`}
                        >
                          {TRACKER_LABELS[key]}
                        </span>
                        <div
                          className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            done ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        >
                          <svg
                            width='10'
                            height='8'
                            viewBox='0 0 10 8'
                            fill='none'
                            className={`transition-transform duration-200 ${done ? 'scale-100' : 'scale-0'}`}
                          >
                            <path
                              d='M1 4L3.5 6.5L9 1'
                              stroke='white'
                              strokeWidth='1.5'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
      </div>
    </main>
  );
}

function StatCard({ value, label, color, bg }) {
  return (
    <div
      className={`${bg} rounded-[1.5rem] p-4 flex flex-col items-center justify-center text-center border border-white shadow-sm`}
    >
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className='text-[10px] text-slate-500 mt-1 font-semibold leading-tight'>
        {label}
      </span>
    </div>
  );
}
