import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Flame,
  Sun,
  Moon,
  Star,
  BookOpen,
  Heart,
  CalendarDays,
  Target,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

dayjs.locale('id');

const CURRENT_YEAR = dayjs().year();
const RAMADHAN_START = dayjs(`${CURRENT_YEAR}-02-19`);

const items = [
  {
    key: 'is_puasa',
    label: 'Puasa Ramadhan',
    icon: Flame,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
  },
  {
    key: 'subuh',
    label: 'Sholat Subuh',
    icon: Sun,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
  },
  {
    key: 'dzuhur',
    label: 'Sholat Dzuhur',
    icon: Sun,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
  },
  {
    key: 'ashar',
    label: 'Sholat Ashar',
    icon: Sun,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    key: 'maghrib',
    label: 'Sholat Maghrib',
    icon: Moon,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    key: 'isya',
    label: 'Sholat Isya',
    icon: Moon,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    key: 'tarawih',
    label: 'Sholat Tarawih',
    icon: Star,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100',
  },
  {
    key: 'quran',
    label: "Tilawah Qur'an",
    icon: BookOpen,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    key: 'sedekah',
    label: 'Sedekah Harian',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-100',
  },
];

export default function TrackerDrawer({ isOpen, onClose, onUpdate }) {
  const router = useRouter();
  const [trackerData, setTrackerData] = useState({});
  const [customHabits, setCustomHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) return;

    const { data: userData } = await supabase
      .from('users')
      .select('id, custom_habits')
      .eq('personal_code', localUser.personal_code)
      .single();
    if (!userData) return;

    // Tarik daftar target kustom
    setCustomHabits(userData.custom_habits || []);

    const today = dayjs().format('YYYY-MM-DD');

    let { data } = await supabase
      .from('daily_trackers')
      .select('*')
      .eq('user_id', userData.id)
      .eq('date', today)
      .single();

    if (!data) {
      const { data: newData } = await supabase
        .from('daily_trackers')
        .insert({ user_id: userData.id, date: today, custom_progress: {} })
        .select()
        .single();
      data = newData;
    }

    setTrackerData(data || {});
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const toggleItem = async (key, isCustom = false) => {
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', localUser.personal_code)
      .single();
    const today = dayjs().format('YYYY-MM-DD');

    if (isCustom) {
      // Toggle Kolom JSONB untuk target tambahan
      const currentCustomProgress = trackerData.custom_progress || {};
      const newValue = !currentCustomProgress[key];
      const updatedCustomProgress = {
        ...currentCustomProgress,
        [key]: newValue,
      };

      setTrackerData((prev) => ({
        ...prev,
        custom_progress: updatedCustomProgress,
      }));
      await supabase
        .from('daily_trackers')
        .update({ custom_progress: updatedCustomProgress })
        .match({ user_id: userData.id, date: today });
    } else {
      // Toggle Kolom Biasa untuk target default
      const newValue = !trackerData[key];
      setTrackerData((prev) => ({ ...prev, [key]: newValue }));
      await supabase
        .from('daily_trackers')
        .update({ [key]: newValue })
        .match({ user_id: userData.id, date: today });
    }

    if (onUpdate) onUpdate();
  };

  const handleOpenCalendar = () => {
    onClose();
    router.push('/tracker-kalender');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/40 z-50 backdrop-blur-sm'
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='fixed bottom-0 left-0 right-0 bg-[#F6F9FC] rounded-t-[2.5rem] z-50 max-h-[70vh] flex flex-col shadow-2xl'
          >
            <div
              className='w-full flex justify-center pt-4 pb-2 bg-white/50 rounded-t-[2.5rem] backdrop-blur-sm'
              onClick={onClose}
            >
              <div className='w-12 h-1.5 bg-slate-300 rounded-full cursor-pointer' />
            </div>

            <div className='px-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm'>
              <div>
                <h2 className='font-bold text-xl text-slate-800'>
                  Target Harianmu
                </h2>
                {/* LOGIKA FORMAT TANGGAL BARU */}
                <p className='text-xs text-slate-400 capitalize'>
                  {(() => {
                    const today = dayjs();
                    const ramadhanDay = today.diff(RAMADHAN_START, 'day') + 1;

                    if (ramadhanDay > 0 && ramadhanDay <= 30) {
                      return `${ramadhanDay} Ramadhan, ${today.format('DD-MM-YYYY')}`;
                    }
                    return today.format('dddd, DD MM YYYY');
                  })()}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={handleOpenCalendar}
                  className='flex items-center gap-1.5 px-3 py-2 bg-[#1e3a8a]/10 hover:bg-[#1e3a8a]/20 text-[#1e3a8a] rounded-xl transition-colors text-xs font-semibold'
                >
                  <CalendarDays size={15} />
                  Detail 30 Hari
                </button>
                <button
                  type='button'
                  onClick={onClose}
                  className='p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors'
                >
                  <X size={20} className='text-slate-500' />
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-3 pb-12 custom-scrollbar'>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='h-16 bg-white rounded-2xl animate-pulse'
                  />
                ))
              ) : (
                <>
                  {/* --- MAPPING TARGET UTAMA (DEFAULT) --- */}
                  {items.map((item) => {
                    const isActive = trackerData[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => toggleItem(item.key, false)}
                        className={`
                            relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group overflow-hidden
                            ${isActive ? 'bg-white border-emerald-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}
                          `}
                      >
                        <div
                          className={`absolute inset-0 bg-emerald-50 transition-transform duration-500 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                        />

                        <div className='relative z-10 flex items-center gap-4'>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-100 text-emerald-600' : `${item.bg} ${item.color}`}`}
                          >
                            <item.icon size={20} />
                          </div>
                          <span
                            className={`font-bold text-sm transition-colors ${isActive ? 'text-emerald-900' : 'text-slate-700'}`}
                          >
                            {item.label}
                          </span>
                        </div>

                        <div
                          className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 group-hover:border-emerald-300'}`}
                        >
                          <Check
                            size={14}
                            className={`text-white transition-transform ${isActive ? 'scale-100' : 'scale-0'}`}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* --- MAPPING TARGET TAMBAHAN (CUSTOM) --- */}
                  {customHabits.length > 0 && (
                    <div className='pt-4 pb-1 flex items-center gap-3'>
                      <div className='flex-1 h-px bg-slate-200' />
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        Target Tambahan
                      </p>
                      <div className='flex-1 h-px bg-slate-200' />
                    </div>
                  )}

                  {customHabits.map((habit) => {
                    const isActive =
                      trackerData.custom_progress?.[habit.id] ?? false;
                    return (
                      <div
                        key={habit.id}
                        onClick={() => toggleItem(habit.id, true)}
                        className={`
                            relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group overflow-hidden
                            ${isActive ? 'bg-white border-pink-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}
                          `}
                      >
                        <div
                          className={`absolute inset-0 bg-pink-50 transition-transform duration-500 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                        />

                        <div className='relative z-10 flex items-center gap-4'>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-400'}`}
                          >
                            <Target size={20} />
                          </div>
                          <span
                            className={`font-bold text-sm transition-colors ${isActive ? 'text-pink-900' : 'text-slate-700'}`}
                          >
                            {habit.label}
                          </span>
                        </div>

                        <div
                          className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'bg-pink-500 border-pink-500' : 'border-slate-200 group-hover:border-pink-300'}`}
                        >
                          <Check
                            size={14}
                            className={`text-white transition-transform ${isActive ? 'scale-100' : 'scale-0'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
