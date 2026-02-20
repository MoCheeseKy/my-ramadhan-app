'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ArrowLeft, Target, Plus, X, Trash2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

dayjs.locale('id');

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

const RAMADHAN_DATES = Array.from({ length: RAMADHAN_DAYS }, (_, i) =>
  RAMADHAN_START.add(i, 'day'),
);

const getProgressColor = (percent) => {
  if (percent === 0)
    return 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500';
  if (percent < 40)
    return 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400';
  if (percent < 70)
    return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400';
  if (percent < 100)
    return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400';
  return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400';
};

const getBarColor = (percent) => {
  if (percent === 0) return 'bg-slate-200 dark:bg-slate-700';
  if (percent < 40) return 'bg-rose-400';
  if (percent < 70) return 'bg-amber-400';
  if (percent < 100) return 'bg-blue-400';
  return 'bg-emerald-500';
};

export default function TrackerKalender() {
  const router = useRouter();
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format('YYYY-MM-DD'),
  );
  const [userId, setUserId] = useState(null);
  const [toggling, setToggling] = useState(null);

  const [customHabits, setCustomHabits] = useState([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) {
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('id, custom_habits')
      .eq('personal_code', localUser.personal_code)
      .single();
    if (!userData) {
      setLoading(false);
      return;
    }

    setUserId(userData.id);
    setCustomHabits(userData.custom_habits || []);

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

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleAddCustomHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newHabit = { id: `custom_${Date.now()}`, label: newHabitName.trim() };
    const updatedHabits = [...customHabits, newHabit];
    setCustomHabits(updatedHabits);
    setNewHabitName('');
    setShowAddHabit(false);
    await supabase
      .from('users')
      .update({ custom_habits: updatedHabits })
      .eq('id', userId);
  };

  const handleDeleteCustomHabit = async (id) => {
    if (!window.confirm('Hapus target tambahan ini?')) return;
    const updatedHabits = customHabits.filter((h) => h.id !== id);
    setCustomHabits(updatedHabits);
    await supabase
      .from('users')
      .update({ custom_habits: updatedHabits })
      .eq('id', userId);
  };

  const toggleItem = useCallback(
    async (dateKey, key, isCustom = false) => {
      if (!userId) return;
      setToggling(`${dateKey}-${key}`);
      const currentRow = allData[dateKey] || { user_id: userId, date: dateKey };
      let updatePayload = {};

      if (isCustom) {
        const currentCustomProgress = currentRow.custom_progress || {};
        const newCustomProgress = {
          ...currentCustomProgress,
          [key]: !currentCustomProgress[key],
        };
        updatePayload = { custom_progress: newCustomProgress };
      } else {
        updatePayload = { [key]: currentRow ? !currentRow[key] : true };
      }

      setAllData((prev) => ({
        ...prev,
        [dateKey]: { ...currentRow, ...updatePayload },
      }));

      if (allData[dateKey]) {
        await supabase
          .from('daily_trackers')
          .update(updatePayload)
          .match({ user_id: userId, date: dateKey });
      } else {
        const { data: newRow } = await supabase
          .from('daily_trackers')
          .insert({ ...currentRow, ...updatePayload })
          .select()
          .single();
        if (newRow) setAllData((prev) => ({ ...prev, [dateKey]: newRow }));
      }
      setToggling(null);
    },
    [allData, userId],
  );

  const getProgress = (dateKey) => {
    const row = allData[dateKey];
    const defaultCompleted = TRACKER_KEYS.reduce(
      (acc, key) => acc + (row?.[key] ? 1 : 0),
      0,
    );
    const customProgress = row?.custom_progress || {};
    const customCompleted = customHabits.reduce(
      (acc, habit) => acc + (customProgress[habit.id] ? 1 : 0),
      0,
    );
    const total = TRACKER_KEYS.length + customHabits.length;
    const completed = defaultCompleted + customCompleted;
    return {
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      row,
    };
  };

  const today = dayjs().format('YYYY-MM-DD');
  const totalDaysPassed = RAMADHAN_DATES.filter(
    (d) => !d.isAfter(dayjs(), 'day'),
  ).length;
  const totalCompleted = Object.values(allData).reduce((acc, row) => {
    const dComp = TRACKER_KEYS.reduce((a, k) => a + (row[k] ? 1 : 0), 0);
    const cComp = customHabits.reduce(
      (a, h) => a + (row.custom_progress?.[h.id] ? 1 : 0),
      0,
    );
    return acc + dComp + cComp;
  }, 0);
  const perfectDays = RAMADHAN_DATES.filter((date) => {
    if (date.isAfter(dayjs(), 'day')) return false;
    const p = getProgress(date.format('YYYY-MM-DD'));
    return p.total > 0 && p.percent === 100;
  }).length;

  const firstDayOfWeek = RAMADHAN_START.day();
  const gridCells = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...RAMADHAN_DATES,
  ];

  return (
    <main className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 pb-16 transition-colors duration-300'>
      {/* Ambient background */}
      <div className='fixed inset-0 -z-10 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60' />
      </div>

      <div className='max-w-md mx-auto p-5'>
        {/* Header */}
        <header className='flex items-center gap-3 mb-6 mt-2'>
          <button
            type='button'
            onClick={() => router.back()}
            className='w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
          >
            <ArrowLeft
              size={18}
              className='text-slate-600 dark:text-slate-300'
            />
          </button>
          <div>
            <h1 className='text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight'>
              Kalender Ramadhan
            </h1>
            <p className='text-xs text-slate-400 dark:text-slate-500'>
              19 Februari – 21 Maret {CURRENT_YEAR} · 30 Hari
            </p>
          </div>
        </header>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-3 mb-4'>
          <StatCard
            value={totalDaysPassed}
            label='Hari Dilalui'
            color='text-[#1e3a8a] dark:text-blue-400'
            bg='bg-blue-50 dark:bg-blue-950/50'
          />
          <StatCard
            value={totalCompleted}
            label='Total Ibadah'
            color='text-emerald-600 dark:text-emerald-400'
            bg='bg-emerald-50 dark:bg-emerald-950/50'
          />
          <StatCard
            value={perfectDays}
            label='Hari Sempurna'
            color='text-amber-600 dark:text-amber-400'
            bg='bg-amber-50 dark:bg-amber-950/50'
          />
        </div>

        {/* Calendar Card */}
        <div className='bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 mb-4'>
          <div className='mb-4'>
            <h2 className='font-bold text-slate-800 dark:text-slate-100 text-base'>
              30 Hari Ramadhan 1447 H
            </h2>
            <p className='text-xs text-slate-400 dark:text-slate-500 mt-0.5'>
              Ketuk tanggal untuk lihat detail ibadah
            </p>
          </div>

          <div className='grid grid-cols-7 mb-2'>
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div
                key={d}
                className='text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1'
              >
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className='grid grid-cols-7 gap-1.5'>
              {[...Array(35)].map((_, i) => (
                <div
                  key={i}
                  className='h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse'
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
                      ${isSelected ? 'ring-2 ring-[#1e3a8a] dark:ring-blue-500 ring-offset-1 dark:ring-offset-slate-900' : ''}
                      ${isToday ? 'ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-slate-900' : ''}
                      ${!isFuture ? getProgressColor(progress.percent) : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}
                    `}
                  >
                    <span className='text-[8px] leading-none opacity-60 font-semibold'>
                      {ramadhanDay}
                    </span>
                    <span className='leading-none text-[11px]'>
                      {date.date()}
                    </span>
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
              { color: 'bg-slate-200 dark:bg-slate-700', label: 'Kosong' },
              { color: 'bg-rose-400', label: '<40%' },
              { color: 'bg-amber-400', label: '40–69%' },
              { color: 'bg-blue-400', label: '70–99%' },
              { color: 'bg-emerald-500', label: '100%' },
            ].map(({ color, label }) => (
              <div key={label} className='flex items-center gap-1'>
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className='text-[9px] text-slate-400 dark:text-slate-500'>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedDate &&
            (() => {
              const progress = getProgress(selectedDate);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className='bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div>
                      <p className='text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-0.5'>
                        Hari ke-
                        {dayjs(selectedDate).diff(RAMADHAN_START, 'day') + 1}{' '}
                        Ramadhan
                      </p>
                      <h3 className='font-bold text-slate-800 dark:text-slate-100 capitalize'>
                        {dayjs(selectedDate).format('dddd, DD MMMM YYYY')}
                      </h3>
                      <p className='text-xs text-slate-400 dark:text-slate-500 mt-0.5'>
                        {progress.completed} dari {progress.total} target
                        selesai
                      </p>
                    </div>
                    <span
                      className={`text-2xl font-black ${progress.percent === 100 ? 'text-emerald-500' : progress.percent >= 70 ? 'text-blue-500' : progress.percent >= 40 ? 'text-amber-500' : progress.percent > 0 ? 'text-rose-400' : 'text-slate-300 dark:text-slate-600'}`}
                    >
                      {progress.percent}%
                    </span>
                  </div>

                  <div className='h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5'>
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getBarColor(progress.percent)}`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>

                  {/* Target Utama */}
                  <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2'>
                    Target Utama
                  </p>
                  <div className='space-y-2 mb-6'>
                    {TRACKER_KEYS.map((key) => {
                      const done = allData[selectedDate]?.[key] ?? false;
                      const isItemLoading =
                        toggling === `${selectedDate}-${key}`;
                      return (
                        <button
                          type='button'
                          key={key}
                          onClick={() => toggleItem(selectedDate, key, false)}
                          disabled={isItemLoading}
                          className={`w-full relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 active:scale-[0.98] cursor-pointer overflow-hidden ${done ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'} ${isItemLoading ? 'opacity-60' : ''}`}
                        >
                          <div
                            className={`absolute inset-0 bg-emerald-50 dark:bg-emerald-950/40 transition-transform duration-300 origin-left ${done ? 'scale-x-100' : 'scale-x-0'}`}
                          />
                          <span
                            className={`relative z-10 text-sm font-semibold transition-colors ${done ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            {TRACKER_LABELS[key]}
                          </span>
                          <div
                            className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
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

                  {/* Target Tambahan */}
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'>
                      Target Tambahan
                    </p>
                    {!showAddHabit && (
                      <button
                        onClick={() => setShowAddHabit(true)}
                        className='text-[10px] font-bold text-pink-500 dark:text-pink-400 flex items-center gap-1 bg-pink-50 dark:bg-pink-950/40 px-2 py-1 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors'
                      >
                        <Plus size={12} /> Tambah
                      </button>
                    )}
                  </div>

                  <div className='space-y-2 mb-3'>
                    {customHabits.map((habit) => {
                      const done =
                        allData[selectedDate]?.custom_progress?.[habit.id] ??
                        false;
                      const isItemLoading =
                        toggling === `${selectedDate}-${habit.id}`;
                      return (
                        <div
                          key={habit.id}
                          className='flex items-center gap-2 group'
                        >
                          <button
                            type='button'
                            onClick={() =>
                              toggleItem(selectedDate, habit.id, true)
                            }
                            disabled={isItemLoading}
                            className={`flex-1 relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 active:scale-[0.98] cursor-pointer overflow-hidden ${done ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-100 dark:border-pink-800' : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'} ${isItemLoading ? 'opacity-60' : ''}`}
                          >
                            <div
                              className={`absolute inset-0 bg-pink-50 dark:bg-pink-950/40 transition-transform duration-300 origin-left ${done ? 'scale-x-100' : 'scale-x-0'}`}
                            />
                            <div className='relative z-10 flex items-center gap-2'>
                              <Target
                                size={16}
                                className={
                                  done
                                    ? 'text-pink-600 dark:text-pink-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                }
                              />
                              <span
                                className={`text-sm font-semibold transition-colors ${done ? 'text-pink-800 dark:text-pink-300' : 'text-slate-600 dark:text-slate-300'}`}
                              >
                                {habit.label}
                              </span>
                            </div>
                            <div
                              className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${done ? 'bg-pink-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                              <Check
                                size={14}
                                className={`text-white transition-transform ${done ? 'scale-100' : 'scale-0'}`}
                              />
                            </div>
                          </button>
                          <button
                            onClick={() => handleDeleteCustomHabit(habit.id)}
                            className='p-3 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors shrink-0'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                    {customHabits.length === 0 && !showAddHabit && (
                      <p className='text-xs text-slate-400 dark:text-slate-500 italic py-2 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700'>
                        Belum ada target tambahan.
                      </p>
                    )}
                  </div>

                  {showAddHabit && (
                    <form
                      onSubmit={handleAddCustomHabit}
                      className='flex gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner'
                    >
                      <input
                        type='text'
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        placeholder='Contoh: Hafal 1 Ayat'
                        className='flex-1 bg-transparent text-sm font-semibold px-2 outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal'
                        autoFocus
                      />
                      <button
                        type='submit'
                        disabled={!newHabitName.trim()}
                        className='p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors'
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type='button'
                        onClick={() => setShowAddHabit(false)}
                        className='p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors'
                      >
                        <X size={16} />
                      </button>
                    </form>
                  )}
                </motion.div>
              );
            })()}
        </AnimatePresence>
      </div>
    </main>
  );
}

function StatCard({ value, label, color, bg }) {
  return (
    <div
      className={`${bg} rounded-[1.5rem] p-4 flex flex-col items-center justify-center text-center border border-white/50 dark:border-slate-700/50 shadow-sm`}
    >
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className='text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-tight'>
        {label}
      </span>
    </div>
  );
}
