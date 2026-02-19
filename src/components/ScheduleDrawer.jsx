import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, CalendarDays } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

// Daftar kota populer Indonesia
const POPULAR_CITIES = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Medan',
  'Semarang',
  'Makassar',
  'Palembang',
  'Tangerang',
  'Depok',
  'Bekasi',
  'Yogyakarta',
  'Malang',
  'Bogor',
  'Batam',
  'Pekanbaru',
  'Banjarmasin',
  'Padang',
  'Denpasar',
  'Balikpapan',
  'Purbalingga',
];

export default function ScheduleDrawer({ isOpen, onClose }) {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayIndex, setTodayIndex] = useState(-1);
  const [city, setCity] = useState('Jakarta');
  const [savingCity, setSavingCity] = useState(false);
  const [showBackToToday, setShowBackToToday] = useState(false);
  const activeRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const getLocalUser = () =>
    JSON.parse(localStorage.getItem('myRamadhan_user'));

  // Ambil city dari localStorage saat pertama kali
  useEffect(() => {
    const localUser = getLocalUser();
    if (localUser?.location_city) {
      setCity(localUser.location_city);
    }
  }, []);

  const fetchSchedule = useCallback(async (targetCity) => {
    try {
      setLoading(true);
      const localUser = getLocalUser();
      const cityToUse = targetCity || localUser?.location_city || 'Jakarta';

      const res = await fetch(
        `/api/schedule?city=${encodeURIComponent(cityToUse)}`,
      );
      const data = await res.json();

      setScheduleData(data.schedule);

      const index = data.schedule.findIndex((item) =>
        dayjs(item.isoDate).isSame(dayjs(), 'day'),
      );
      setTodayIndex(index);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && scheduleData.length === 0) {
      fetchSchedule(city);
    }
  }, [isOpen, city, scheduleData.length, fetchSchedule]);

  // Auto-scroll ke hari ini
  useEffect(() => {
    if (isOpen && !loading && activeRef.current) {
      setTimeout(() => {
        activeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    }
  }, [isOpen, loading, todayIndex]);

  // Deteksi apakah user sudah scroll jauh dari hari ini
  const handleScroll = useCallback(() => {
    if (!activeRef.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const todayEl = activeRef.current;
    const containerRect = container.getBoundingClientRect();
    const todayRect = todayEl.getBoundingClientRect();
    // Tampilkan tombol jika card hari ini di luar viewport container
    const isOutOfView =
      todayRect.bottom < containerRect.top ||
      todayRect.top > containerRect.bottom;
    setShowBackToToday(isOutOfView);
  }, []);

  const scrollToToday = () => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCityChange = async (newCity) => {
    setSavingCity(true);
    setCity(newCity);
    setScheduleData([]); // reset agar refetch

    try {
      const localUser = getLocalUser();
      if (localUser?.personal_code) {
        const res = await fetch('/api/user/update-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalCode: localUser.personal_code,
            city: newCity,
          }),
        });
        if (res.ok) {
          // Update localStorage juga
          const updated = { ...localUser, location_city: newCity };
          localStorage.setItem('myRamadhan_user', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error('Gagal update kota:', err);
    }

    setSavingCity(false);
    fetchSchedule(newCity);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/40 z-50 backdrop-blur-sm'
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='fixed bottom-0 left-0 right-0 bg-[#F6F9FC] rounded-t-[2.5rem] z-50 max-h-[75vh] flex flex-col shadow-2xl'
          >
            {/* Handle Bar */}
            <div
              className='w-full flex justify-center pt-4 pb-2 bg-white/50 rounded-t-[2.5rem] backdrop-blur-sm'
              onClick={onClose}
            >
              <div className='w-12 h-1.5 bg-slate-300 rounded-full cursor-pointer' />
            </div>

            {/* Header */}
            <div className='px-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm'>
              <div className='flex-1 mr-3'>
                <h2 className='font-bold text-xl text-slate-800'>
                  Jadwal Imsakiyah
                </h2>
                {/* Select kota */}
                <div className='flex items-center gap-1.5 mt-1.5'>
                  <MapPin size={12} className='text-blue-500 flex-shrink-0' />
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={savingCity}
                    className='text-xs text-slate-600 bg-transparent border-none outline-none cursor-pointer font-medium hover:text-[#1e3a8a] transition-colors pr-1 disabled:opacity-50'
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}, Indonesia
                      </option>
                    ))}
                  </select>
                  {savingCity && (
                    <span className='text-[10px] text-blue-400 font-semibold'>
                      menyimpan...
                    </span>
                  )}
                </div>
              </div>
              <button
                type='button'
                onClick={onClose}
                className='p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors'
              >
                <X size={20} className='text-slate-500' />
              </button>
            </div>

            {/* Content List */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className='flex-1 overflow-y-auto p-6 space-y-3 pb-12 relative'
            >
              {loading
                ? [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className='h-24 bg-white rounded-2xl animate-pulse'
                    />
                  ))
                : scheduleData.map((day, index) => {
                    const isToday = index === todayIndex;
                    return (
                      <div
                        key={index}
                        ref={isToday ? activeRef : null}
                        className={`relative p-5 rounded-[1.5rem] border transition-all
                          ${
                            isToday
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 border-transparent'
                              : 'bg-white border-slate-100 text-slate-600'
                          }`}
                      >
                        <div className='flex justify-between items-start mb-4'>
                          <div>
                            <h3
                              className={`font-bold text-lg ${isToday ? 'text-white' : 'text-slate-800'}`}
                            >
                              {dayjs(day.isoDate).format('dddd, DD MMM')}
                            </h3>
                            <p
                              className={`text-xs ${isToday ? 'text-blue-200' : 'text-slate-400'}`}
                            >
                              {day.hijri}
                            </p>
                          </div>
                          {isToday && (
                            <span className='bg-white/20 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded-lg text-white'>
                              HARI INI
                            </span>
                          )}
                        </div>

                        <div className='grid grid-cols-3 gap-y-3 gap-x-2'>
                          <TimeItem
                            label='Imsak'
                            time={day.timings.Imsak}
                            isToday={isToday}
                          />
                          <TimeItem
                            label='Subuh'
                            time={day.timings.Subuh}
                            isToday={isToday}
                          />
                          <TimeItem
                            label='Dzuhur'
                            time={day.timings.Dzuhur}
                            isToday={isToday}
                          />
                          <TimeItem
                            label='Ashar'
                            time={day.timings.Ashar}
                            isToday={isToday}
                          />
                          <TimeItem
                            label='Maghrib'
                            time={day.timings.Maghrib}
                            isToday={isToday}
                            bold
                          />
                          <TimeItem
                            label='Isya'
                            time={day.timings.Isya}
                            isToday={isToday}
                          />
                        </div>
                      </div>
                    );
                  })}

              {/* Floating Back to Today button */}
              <AnimatePresence>
                {showBackToToday && todayIndex !== -1 && (
                  <motion.button
                    type='button'
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={scrollToToday}
                    className='sticky bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5
                      bg-[#1e3a8a] text-white text-xs font-bold rounded-full shadow-lg
                      hover:bg-[#162d6e] active:scale-95 transition-all z-20 mx-auto'
                  >
                    <CalendarDays size={14} />
                    Kembali ke Hari Ini
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TimeItem({ label, time, isToday, bold }) {
  return (
    <div className='text-center'>
      <p
        className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isToday ? 'text-blue-200' : 'text-slate-400'}`}
      >
        {label}
      </p>
      <p
        className={`font-medium text-sm tabular-nums ${isToday ? 'text-white' : 'text-slate-700'} ${bold ? 'font-black scale-110' : ''}`}
      >
        {time}
      </p>
    </div>
  );
}
