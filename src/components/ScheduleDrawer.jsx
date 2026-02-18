import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function ScheduleDrawer({ isOpen, onClose }) {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayIndex, setTodayIndex] = useState(-1);
  const activeRef = useRef(null);

  // Fetch Data saat Drawer dibuka
  useEffect(() => {
    if (isOpen && scheduleData.length === 0) {
      fetchSchedule();
    }
  }, [isOpen]);

  // Auto-scroll ke hari ini setelah data siap
  useEffect(() => {
    if (isOpen && !loading && activeRef.current) {
      setTimeout(() => {
        activeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300); // Delay sedikit agar animasi drawer selesai dulu
    }
  }, [isOpen, loading, todayIndex]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setScheduleData(data.schedule);

      // Cari index hari ini
      const index = data.schedule.findIndex((item) =>
        dayjs(item.date).isSame(dayjs(), 'day'),
      );
      setTodayIndex(index);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setLoading(false);
    }
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

            {/* Header Sticky */}
            <div className='px-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm'>
              <div>
                <h2 className='font-bold text-xl text-slate-800'>
                  Jadwal Imsakiyah
                </h2>
                <div className='flex items-center gap-1 text-xs text-slate-500 mt-1'>
                  <MapPin size={12} className='text-blue-500' />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className='p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors'
              >
                <X size={20} className='text-slate-500' />
              </button>
            </div>

            {/* Content List */}
            <div className='flex-1 overflow-y-auto p-6 space-y-3 pb-12'>
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
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 border-transparent sticky top-0 z-10'
                            : 'bg-white border-slate-100 text-slate-600'
                        }`}
                      >
                        {/* Tanggal Header */}
                        <div className='flex justify-between items-start mb-4'>
                          <div>
                            <h3
                              className={`font-bold text-lg ${isToday ? 'text-white' : 'text-slate-800'}`}
                            >
                              {dayjs(day.date).format('dddd, DD MMM')}
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

                        {/* Grid Waktu */}
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
