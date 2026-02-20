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

// --- TAMBAHAN: Import Hook dan StorageService ---
import useUser from '@/hook/useUser';
import useAppMode from '@/hook/useAppMode';
import { StorageService } from '@/lib/storageService';

dayjs.locale('id');

const CURRENT_YEAR = dayjs().year();
const RAMADHAN_START = dayjs(`${CURRENT_YEAR}-02-19`);

const items = [
  {
    key: 'is_puasa',
    label: 'Puasa Ramadhan',
    icon: Flame,
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
  },
  {
    key: 'subuh',
    label: 'Sholat Subuh',
    icon: Sun,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    key: 'dzuhur',
    label: 'Sholat Dzuhur',
    icon: Sun,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
  },
  {
    key: 'ashar',
    label: 'Sholat Ashar',
    icon: Sun,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
  },
  {
    key: 'maghrib',
    label: 'Sholat Maghrib',
    icon: Moon,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  {
    key: 'isya',
    label: 'Sholat Isya',
    icon: Moon,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
  },
  {
    key: 'tarawih',
    label: 'Sholat Tarawih',
    icon: Star,
    color: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  {
    key: 'quran',
    label: "Tilawah Qur'an",
    icon: BookOpen,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  {
    key: 'sedekah',
    label: 'Sedekah Harian',
    icon: Heart,
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/40',
  },
];

export default function TrackerDrawer({ isOpen, onClose, onUpdate }) {
  const router = useRouter();

  // --- TAMBAHAN: Gunakan hooks ---
  const { user } = useUser();
  const { isPWA } = useAppMode();

  const [trackerData, setTrackerData] = useState({});
  const [customHabits, setCustomHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PERUBAHAN: Mengambil data lewat StorageService ---
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Ambil custom habits dari profil user
      const userData = await StorageService.getProfile(
        user.personal_code,
        isPWA,
      );
      setCustomHabits(userData?.custom_habits || []);

      // Ambil data tracker hari ini
      const today = dayjs().format('YYYY-MM-DD');
      let data = await StorageService.getDailyTracker(
        user.personal_code,
        today,
        isPWA,
      );

      // Jika belum ada data tracker hari ini, buat baru
      if (!data) {
        data = await StorageService.saveDailyTracker(
          user.personal_code,
          today,
          { custom_progress: {} },
          isPWA,
        );
      }

      setTrackerData(data || {});
    } catch (error) {
      console.error('Gagal memuat tracker drawer:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isPWA]);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, fetchData]);

  // --- PERUBAHAN: Menyimpan data lewat StorageService ---
  const toggleItem = async (key, isCustom = false) => {
    if (!user) return;
    const today = dayjs().format('YYYY-MM-DD');
    let updatedTrackerData = {};

    if (isCustom) {
      const currentCustomProgress = trackerData.custom_progress || {};
      const updatedCustomProgress = {
        ...currentCustomProgress,
        [key]: !currentCustomProgress[key],
      };

      updatedTrackerData = { custom_progress: updatedCustomProgress };

      // Update state lokal dulu biar UI cepat merespon
      setTrackerData((prev) => ({
        ...prev,
        custom_progress: updatedCustomProgress,
      }));
    } else {
      const newValue = !trackerData[key];
      updatedTrackerData = { [key]: newValue };

      // Update state lokal dulu biar UI cepat merespon
      setTrackerData((prev) => ({ ...prev, [key]: newValue }));
    }

    try {
      // Simpan ke DB/Lokal sesuai mode
      await StorageService.saveDailyTracker(
        user.personal_code,
        today,
        updatedTrackerData,
        isPWA,
      );
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Gagal memperbarui tracker:', error);
    }
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
            className='fixed bottom-0 left-0 right-0 bg-[#F6F9FC] dark:bg-slate-950 rounded-t-[2.5rem] z-50 max-h-[70vh] flex flex-col shadow-2xl transition-colors duration-300'
          >
            {/* Drag handle */}
            <div
              className='w-full flex justify-center pt-4 pb-2 bg-white/50 dark:bg-slate-900/50 rounded-t-[2.5rem] backdrop-blur-sm'
              onClick={onClose}
            >
              <div className='w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer' />
            </div>

            {/* Header */}
            <div className='px-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm'>
              <div>
                <h2 className='font-bold text-xl text-slate-800 dark:text-slate-100'>
                  Target Harianmu
                </h2>
                <p className='text-xs text-slate-400 dark:text-slate-500 capitalize'>
                  {(() => {
                    const today = dayjs();
                    const ramadhanDay = today.diff(RAMADHAN_START, 'day') + 1;
                    if (ramadhanDay > 0 && ramadhanDay <= 30)
                      return `${ramadhanDay} Ramadhan, ${today.format('DD-MM-YYYY')}`;
                    return today.format('dddd, DD MM YYYY');
                  })()}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={handleOpenCalendar}
                  className='flex items-center gap-1.5 px-3 py-2 bg-[#1e3a8a]/10 dark:bg-blue-900/30 hover:bg-[#1e3a8a]/20 dark:hover:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-400 rounded-xl transition-colors text-xs font-semibold'
                >
                  <CalendarDays size={15} />
                  Detail 30 Hari
                </button>
                <button
                  type='button'
                  onClick={onClose}
                  className='p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                >
                  <X size={20} className='text-slate-500 dark:text-slate-400' />
                </button>
              </div>
            </div>

            {/* Scrollable list */}
            <div className='flex-1 overflow-y-auto p-6 space-y-3 pb-12 custom-scrollbar'>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className='h-16 bg-white dark:bg-slate-800 rounded-2xl animate-pulse'
                  />
                ))
              ) : (
                <>
                  {/* Target Utama */}
                  {items.map((item) => {
                    const isActive = trackerData[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() => toggleItem(item.key, false)}
                        className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group overflow-hidden ${isActive ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                      >
                        <div
                          className={`absolute inset-0 bg-emerald-50 dark:bg-emerald-950/40 transition-transform duration-500 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                        />
                        <div className='relative z-10 flex items-center gap-4'>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : `${item.bg} ${item.color}`}`}
                          >
                            <item.icon size={20} />
                          </div>
                          <span
                            className={`font-bold text-sm transition-colors ${isActive ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <div
                          className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-700 group-hover:border-emerald-300'}`}
                        >
                          <Check
                            size={14}
                            className={`text-white transition-transform ${isActive ? 'scale-100' : 'scale-0'}`}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Target Tambahan */}
                  {customHabits.length > 0 && (
                    <div className='pt-4 pb-1 flex items-center gap-3'>
                      <div className='flex-1 h-px bg-slate-200 dark:bg-slate-700' />
                      <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest'>
                        Target Tambahan
                      </p>
                      <div className='flex-1 h-px bg-slate-200 dark:bg-slate-700' />
                    </div>
                  )}

                  {customHabits.map((habit) => {
                    const isActive =
                      trackerData.custom_progress?.[habit.id] ?? false;
                    return (
                      <div
                        key={habit.id}
                        onClick={() => toggleItem(habit.id, true)}
                        className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group overflow-hidden ${isActive ? 'bg-white dark:bg-slate-900 border-pink-200 dark:border-pink-800 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                      >
                        <div
                          className={`absolute inset-0 bg-pink-50 dark:bg-pink-950/40 transition-transform duration-500 origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                        />
                        <div className='relative z-10 flex items-center gap-4'>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}
                          >
                            <Target size={20} />
                          </div>
                          <span
                            className={`font-bold text-sm transition-colors ${isActive ? 'text-pink-900 dark:text-pink-300' : 'text-slate-700 dark:text-slate-200'}`}
                          >
                            {habit.label}
                          </span>
                        </div>
                        <div
                          className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'bg-pink-500 border-pink-500' : 'border-slate-200 dark:border-slate-700 group-hover:border-pink-300'}`}
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
