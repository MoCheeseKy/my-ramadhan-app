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
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    id: 'Subuh',
    label: 'Subuh',
    icon: Sunrise,
    color: 'text-sky-500',
    bg: 'bg-sky-50',
  },
  {
    id: 'Dzuhur',
    label: 'Dzuhur',
    icon: Sun,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    id: 'Ashar',
    label: 'Ashar',
    icon: Sun,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    id: 'Maghrib',
    label: 'Maghrib',
    icon: Sunset,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    id: 'Isya',
    label: 'Isya',
    icon: Moon,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
];

export default function ScheduleDrawer({ isOpen, onClose, onUpdate }) {
  const { user } = useUser();
  const [selectedCity, setSelectedCity] = useState('Jakarta');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [todaySchedule, setTodaySchedule] = useState(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]); // State baru untuk jadwal ke depan
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
      const city = localUser?.location_city || 'Jakarta';
      setSelectedCity(city);
      setIsPickerOpen(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedCity) {
      fetchSchedule(selectedCity);
    }
  }, [isOpen, selectedCity]);

  const fetchSchedule = async (city) => {
    setIsLoadingSchedule(true);
    try {
      const res = await fetch(`/api/schedule?city=${encodeURIComponent(city)}`);
      const data = await res.json();

      const now = dayjs();

      // 1. Ambil jadwal hari ini
      const todayData = data.schedule.find((item) =>
        dayjs(item.isoDate).isSame(now, 'day'),
      );
      if (todayData) setTodaySchedule(todayData.timings);

      // 2. Ambil jadwal mendatang (besok dan seterusnya, maksimal 30 hari)
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

    try {
      const localUser =
        JSON.parse(localStorage.getItem('myRamadhan_user')) || {};
      localUser.location_city = city;
      localStorage.setItem('myRamadhan_user', JSON.stringify(localUser));

      if (user) {
        await supabase
          .from('users')
          .update({ location_city: city })
          .eq('personal_code', user.personal_code);
      }

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
            className='fixed bottom-0 left-0 right-0 max-w-md mx-auto h-[90vh] bg-[#F6F9FC] rounded-t-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col'
          >
            {/* Header */}
            <div className='bg-white px-6 py-4 rounded-t-[2.5rem] border-b border-slate-100 shrink-0 relative z-10'>
              <div className='w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6' />
              <div className='flex justify-between items-center mb-2'>
                <div>
                  <h2 className='text-xl font-extrabold text-slate-800 tracking-tight'>
                    Jadwal Imsakiyah
                  </h2>
                  <p className='text-xs text-slate-500 mt-1'>
                    Sesuai dengan zona waktu lokasimu
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className='w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors'
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto px-6 py-5 relative custom-scrollbar pb-10'>
              {/* LOKASI */}
              <div className='mb-6'>
                <p className='text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2'>
                  Lokasi Saat Ini
                </p>
                <button
                  onClick={() => setIsPickerOpen(!isPickerOpen)}
                  className={`w-full flex items-center justify-between p-4 bg-white rounded-2xl border transition-all group ${isPickerOpen ? 'border-[#1e3a8a] shadow-md' : 'border-slate-200 shadow-sm hover:border-[#1e3a8a]'}`}
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center'>
                      <MapPin size={20} />
                    </div>
                    <div className='text-left'>
                      <p className='font-bold text-slate-800 text-sm'>
                        {selectedCity}
                      </p>
                      <p className='text-[10px] text-slate-500'>
                        Ketuk untuk ubah lokasi
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform ${isPickerOpen ? 'rotate-180 text-[#1e3a8a]' : ''}`}
                  />
                </button>
              </div>

              {/* PICKER KOTA */}
              <AnimatePresence>
                {isPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '-12px' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className='overflow-hidden mb-6'
                  >
                    <div className='bg-white rounded-b-2xl border border-t-0 border-slate-200 p-4 shadow-sm'>
                      <div className='relative mb-3 mt-2'>
                        <Search
                          size={16}
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        />
                        <input
                          type='text'
                          placeholder='Cari kota...'
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className='w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all'
                        />
                      </div>

                      <div className='max-h-52 overflow-y-auto space-y-1 pr-2 custom-scrollbar'>
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city) => (
                            <button
                              key={city}
                              onClick={() => handleCitySelect(city)}
                              disabled={isSaving}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedCity === city ? 'bg-blue-50 text-[#1e3a8a]' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              {city}
                              {selectedCity === city && (
                                <CheckCircle2
                                  size={16}
                                  className='text-[#1e3a8a]'
                                />
                              )}
                            </button>
                          ))
                        ) : (
                          <p className='text-center text-xs text-slate-400 py-4'>
                            Kota tidak ditemukan
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* JADWAL HARI INI */}
              <div className='mb-4 flex items-center justify-between mt-2'>
                <p className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                  Jadwal Hari Ini
                </p>
                <p className='text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-1 rounded-md'>
                  {dayjs().format('DD MMM YYYY')}
                </p>
              </div>

              {isLoadingSchedule ? (
                <div className='grid grid-cols-3 gap-3'>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className='h-24 bg-white/50 border border-slate-100 rounded-2xl animate-pulse'
                    />
                  ))}
                </div>
              ) : todaySchedule ? (
                <div className='grid grid-cols-3 gap-3'>
                  {SCHEDULE_CARDS.map((item) => {
                    const Icon = item.icon;
                    const time = todaySchedule[item.id] || '--:--';
                    return (
                      <div
                        key={item.id}
                        className='bg-white border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-center shadow-sm'
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center mb-2`}
                        >
                          <Icon size={16} />
                        </div>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
                          {item.label}
                        </p>
                        <p className='text-sm font-black text-slate-800'>
                          {time}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm'>
                  <p className='text-sm text-slate-500'>
                    Gagal memuat jadwal untuk {selectedCity}.
                  </p>
                </div>
              )}

              {/* JADWAL MENDATANG */}
              {upcomingSchedules.length > 0 && (
                <div className='mt-8'>
                  <div className='flex items-center gap-2 mb-4'>
                    <CalendarDays size={16} className='text-slate-400' />
                    <p className='text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                      Jadwal Mendatang
                    </p>
                  </div>

                  <div className='space-y-2.5'>
                    {upcomingSchedules.map((day, index) => (
                      <div
                        key={index}
                        className='bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all'
                      >
                        <div className='flex-1'>
                          <p className='text-xs font-bold text-slate-800'>
                            {dayjs(day.isoDate).format('dddd, DD MMM')}
                          </p>
                        </div>
                        <div className='flex items-center gap-4 text-xs font-bold'>
                          <div className='text-center w-10'>
                            <p className='text-[9px] text-indigo-400 uppercase tracking-wider mb-0.5'>
                              Imsak
                            </p>
                            <p className='text-slate-700'>
                              {day.timings.Imsak}
                            </p>
                          </div>
                          <div className='text-center w-10'>
                            <p className='text-[9px] text-sky-400 uppercase tracking-wider mb-0.5'>
                              Subuh
                            </p>
                            <p className='text-slate-700'>
                              {day.timings.Subuh}
                            </p>
                          </div>
                          <div className='text-center w-12'>
                            <p className='text-[9px] text-rose-400 uppercase tracking-wider mb-0.5'>
                              Berbuka
                            </p>
                            <p className='text-slate-700'>
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
