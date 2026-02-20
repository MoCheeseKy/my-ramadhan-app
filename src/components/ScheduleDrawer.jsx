import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  X,
  CheckCircle2,
  ChevronDown,
  Moon,
  Sunrise,
  Sun,
  Sunset,
  CalendarDays,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';

dayjs.locale('id');

const CITIES = [
  'Ambon',
  'Balikpapan',
  'Banda Aceh',
  'Bandar Lampung',
  'Bandung',
  'Banjarmasin',
  'Batam',
  'Bekasi',
  'Bengkulu',
  'Bogor',
  'Cirebon',
  'Denpasar',
  'Depok',
  'Gorontalo',
  'Jakarta',
  'Jambi',
  'Jayapura',
  'Kendari',
  'Kupang',
  'Madiun',
  'Magelang',
  'Makassar',
  'Malang',
  'Manado',
  'Mataram',
  'Medan',
  'Padang',
  'Palangkaraya',
  'Palembang',
  'Palu',
  'Pangkalpinang',
  'Pekanbaru',
  'Pontianak',
  'Samarinda',
  'Semarang',
  'Serang',
  'Surabaya',
  'Surakarta',
  'Tangerang',
  'Tanjungpinang',
  'Tarakan',
  'Ternate',
  'Yogyakarta',
];

const SCHEDULE_CARDS = [
  {
    id: 'Imsak',
    label: 'Imsak',
    icon: Moon,
    color: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/40',
  },
  {
    id: 'Subuh',
    label: 'Subuh',
    icon: Sunrise,
    color: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-900/40',
  },
  {
    id: 'Dzuhur',
    label: 'Dzuhur',
    icon: Sun,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/40',
  },
  {
    id: 'Ashar',
    label: 'Ashar',
    icon: Sun,
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-900/40',
  },
  {
    id: 'Maghrib',
    label: 'Maghrib',
    icon: Sunset,
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/40',
  },
  {
    id: 'Isya',
    label: 'Isya',
    icon: Moon,
    color: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/40',
  },
];

export default function ScheduleDrawer({ isOpen, onClose, onUpdate }) {
  const { user } = useUser();
  const [selectedCity, setSelectedCity] = useState('Jakarta');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
      const city = localUser?.location_city || 'Jakarta';
      setSelectedCity(city);
      fetchSchedule(city);
      setIsPickerOpen(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchSchedule = async (city) => {
    setIsLoadingSchedule(true);
    try {
      const res = await fetch(`/api/schedule?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      const now = dayjs();
      const todayData = data?.schedule?.find((item) =>
        dayjs(item.isoDate).isSame(now, 'day'),
      );
      if (todayData) setTodaySchedule(todayData.timings);
      const futureData = data.schedule
        .filter((item) => dayjs(item.isoDate).isAfter(now, 'day'))
        .slice(0, 30);
      setUpcomingSchedules(futureData);
    } catch (error) {
      console.error('Gagal memuat jadwal untuk laci:', error);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const filteredCities = CITIES.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCitySelect = async (city) => {
    setIsSaving(true);
    setSelectedCity(city);
    fetchSchedule(city);
    try {
      const localUser =
        JSON.parse(localStorage.getItem('myRamadhan_user')) || {};
      localUser.location_city = city;
      localStorage.setItem('myRamadhan_user', JSON.stringify(localUser));
      if (user)
        await supabase
          .from('users')
          .update({ location_city: city })
          .eq('personal_code', user.personal_code);
      if (onUpdate) onUpdate();
      setTimeout(() => {
        setIsPickerOpen(false);
        setIsSaving(false);
      }, 300);
    } catch (error) {
      console.error('Gagal update lokasi:', error);
      setIsSaving(false);
    }
  };

  let nextScheduleId = null;
  if (todaySchedule) {
    for (const item of SCHEDULE_CARDS) {
      const timeStr = todaySchedule[item.id];
      if (timeStr && timeStr !== '--:--') {
        const [h, m] = timeStr.split(':').map(Number);
        const targetTime = dayjs().hour(h).minute(m).second(0);
        if (currentTime.isBefore(targetTime)) {
          if (item.id === 'Imsak') {
            if (currentTime.hour() >= 1) {
              nextScheduleId = item.id;
            }
          } else {
            nextScheduleId = item.id;
          }
          break;
        }
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50'
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed bottom-0 left-0 right-0 max-w-[100%] mx-auto h-[70vh] bg-[#F6F9FC] dark:bg-slate-950 rounded-t-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col transition-colors duration-300'
          >
            {/* Header */}
            <div className='bg-white dark:bg-slate-900 px-6 py-4 rounded-t-[2.5rem] border-b border-slate-100 dark:border-slate-800 shrink-0 relative z-10'>
              <div className='w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6' />
              <div className='flex justify-between items-center mb-2'>
                <div>
                  <h2 className='text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight'>
                    Jadwal Imsakiyah
                  </h2>
                  <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
                    Sesuai dengan zona waktu lokasimu
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className='w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto px-6 py-5 relative custom-scrollbar pb-10'>
              {/* Lokasi */}
              <div className='mb-6'>
                <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2'>
                  Lokasi Saat Ini
                </p>
                <button
                  onClick={() => setIsPickerOpen(!isPickerOpen)}
                  className={`w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all group ${isPickerOpen ? 'border-[#1e3a8a] dark:border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-700 shadow-sm hover:border-[#1e3a8a] dark:hover:border-blue-500'}`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#1e3a8a] dark:text-blue-400 flex items-center justify-center'>
                      <MapPin size={20} />
                    </div>
                    <div className='text-left'>
                      <p className='font-bold text-slate-800 dark:text-slate-100 text-sm'>
                        {selectedCity}
                      </p>
                      <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                        Ketuk untuk ubah lokasi
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 dark:text-slate-500 transition-transform ${isPickerOpen ? 'rotate-180 text-[#1e3a8a] dark:text-blue-400' : ''}`}
                  />
                </button>
              </div>

              {/* Picker Kota */}
              <AnimatePresence>
                {isPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '-12px' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className='overflow-hidden mb-6'
                  >
                    <div className='bg-white dark:bg-slate-900 rounded-b-2xl border border-t-0 border-slate-200 dark:border-slate-700 p-4 shadow-sm'>
                      <div className='relative mb-3 mt-2'>
                        <Search
                          size={16}
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                        />
                        <input
                          type='text'
                          placeholder='Cari kota...'
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className='w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 transition-all'
                        />
                      </div>
                      <div className='max-h-52 overflow-y-auto space-y-1 pr-2 custom-scrollbar'>
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city) => (
                            <button
                              key={city}
                              onClick={() => handleCitySelect(city)}
                              disabled={isSaving}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedCity === city ? 'bg-blue-50 dark:bg-blue-900/40 text-[#1e3a8a] dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                            >
                              {city}
                              {selectedCity === city && (
                                <CheckCircle2
                                  size={16}
                                  className='text-[#1e3a8a] dark:text-blue-400'
                                />
                              )}
                            </button>
                          ))
                        ) : (
                          <p className='text-center text-xs text-slate-400 dark:text-slate-500 py-4'>
                            Kota tidak ditemukan
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Jadwal Hari Ini */}
              <div className='mb-4 flex items-center justify-between mt-2'>
                <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
                  Jadwal Hari Ini
                </p>
                <p className='text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-1 rounded-md'>
                  {currentTime.format('DD MMM YYYY')}
                </p>
              </div>

              {isLoadingSchedule ? (
                <div className='grid grid-cols-3 gap-3'>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className='h-28 bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl animate-pulse'
                    />
                  ))}
                </div>
              ) : todaySchedule ? (
                <div className='grid grid-cols-3 gap-3'>
                  {SCHEDULE_CARDS.map((item) => {
                    const Icon = item.icon;
                    const timeStr = todaySchedule[item.id] || '--:--';
                    const isNext = nextScheduleId === item.id;
                    let countdownText = '';
                    let isPassed = false;

                    if (timeStr !== '--:--') {
                      const [h, m] = timeStr.split(':').map(Number);
                      const targetTime = dayjs().hour(h).minute(m).second(0);
                      const diffInSeconds = targetTime.diff(
                        currentTime,
                        'second',
                      );
                      if (diffInSeconds <= 0) isPassed = true;
                      if (isNext) {
                        const hours = Math.floor(diffInSeconds / 3600);
                        const mins = Math.floor((diffInSeconds % 3600) / 60);
                        const secs = diffInSeconds % 60;
                        const pad = (n) => n.toString().padStart(2, '0');
                        if (hours > 0)
                          countdownText = `-${hours}j ${pad(mins)}m ${pad(secs)}d`;
                        else if (mins > 0)
                          countdownText = `-${mins}m ${pad(secs)}d`;
                        else countdownText = `-${secs}d`;
                      }
                    }

                    return (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-slate-900 border ${isNext ? 'border-emerald-400 shadow-md ring-1 ring-emerald-400/50' : 'border-slate-100 dark:border-slate-800 shadow-sm'} rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500`}
                      >
                        <div
                          className={`transition-all duration-300 flex flex-col items-center w-full ${isPassed ? 'opacity-40' : ''}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center mb-2`}
                          >
                            <Icon size={16} />
                          </div>
                          <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5'>
                            {item.label}
                          </p>
                          <p
                            className={`text-sm font-black ${isNext ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}`}
                          >
                            {timeStr}
                          </p>
                        </div>
                        {isNext && (
                          <div className='mt-2 text-[9px] font-black px-2 py-1 w-full text-center rounded-lg text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800'>
                            {countdownText}
                          </div>
                        )}
                        {isPassed && (
                          <div className='absolute bottom-1 text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest'>
                            Terlewat
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm'>
                  <p className='text-sm text-slate-500 dark:text-slate-400'>
                    Gagal memuat jadwal untuk {selectedCity}.
                  </p>
                </div>
              )}

              {/* Jadwal Mendatang */}
              {upcomingSchedules.length > 0 && (
                <div className='mt-8'>
                  <div className='flex items-center gap-2 mb-4'>
                    <CalendarDays
                      size={16}
                      className='text-slate-400 dark:text-slate-500'
                    />
                    <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
                      Jadwal Mendatang
                    </p>
                  </div>
                  <div className='space-y-2.5'>
                    {upcomingSchedules.map((day, index) => (
                      <div
                        key={index}
                        className='bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all'
                      >
                        <div className='flex-1'>
                          <p className='text-xs font-bold text-slate-800 dark:text-slate-100'>
                            {dayjs(day.isoDate).format('dddd, DD MMM')}
                          </p>
                        </div>
                        <div className='flex items-center gap-4 text-xs font-bold'>
                          <div className='text-center w-10'>
                            <p className='text-[9px] text-indigo-400 uppercase tracking-wider mb-0.5'>
                              Imsak
                            </p>
                            <p className='text-slate-700 dark:text-slate-200'>
                              {day.timings.Imsak}
                            </p>
                          </div>
                          <div className='text-center w-10'>
                            <p className='text-[9px] text-sky-400 uppercase tracking-wider mb-0.5'>
                              Subuh
                            </p>
                            <p className='text-slate-700 dark:text-slate-200'>
                              {day.timings.Subuh}
                            </p>
                          </div>
                          <div className='text-center w-12'>
                            <p className='text-[9px] text-rose-400 uppercase tracking-wider mb-0.5'>
                              Berbuka
                            </p>
                            <p className='text-slate-700 dark:text-slate-200'>
                              {day.timings.Maghrib}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
