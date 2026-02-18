import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  MoreHorizontal,
} from 'lucide-react';

dayjs.locale('id');

export default function JadwalPage() {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayIndex, setTodayIndex] = useState(-1);
  const activeRef = useRef(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch('/api/schedule');
        const data = await res.json();
        setScheduleData(data.schedule);

        // Cari index hari ini untuk auto-scroll/highlight
        const todayDate = dayjs().format('DD MMM YYYY');
        const index = data.schedule.findIndex((item) =>
          dayjs(item.date).isSame(dayjs(), 'day'),
        );
        setTodayIndex(index);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  // Auto scroll ke hari ini setelah data dimuat
  useEffect(() => {
    if (!loading && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [loading, todayIndex]);

  return (
    <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-24 font-sans selection:bg-blue-200'>
      <Head>
        <title>Jadwal Sholat - MyRamadhan</title>
      </Head>

      {/* --- HEADER --- */}
      <header className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between'>
        <button
          onClick={() => router.push('/')}
          className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
        >
          <ArrowLeft size={20} className='text-slate-600' />
        </button>
        <h1 className='font-bold text-lg'>Jadwal Imsakiyah</h1>
        <div className='w-8' /> {/* Spacer biar title di tengah */}
      </header>

      <main className='max-w-md mx-auto p-5'>
        {/* Info Lokasi */}
        <div className='flex items-center gap-2 mb-6 text-slate-500 text-sm font-medium bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100'>
          <MapPin size={18} className='text-blue-500' />
          <span>Jakarta, Indonesia</span>
          <span className='ml-auto text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-400'>
            WIB
          </span>
        </div>

        {/* --- LIST JADWAL --- */}
        <div className='space-y-3'>
          {loading
            ? // Skeleton Loading
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className='h-24 bg-white rounded-3xl animate-pulse'
                />
              ))
            : scheduleData.map((day, index) => {
                const isToday = index === todayIndex;

                return (
                  <div
                    key={index}
                    ref={isToday ? activeRef : null}
                    className={`relative p-5 rounded-[1.5rem] transition-all duration-300 border
                    ${
                      isToday
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200 scale-[1.02] border-transparent z-10'
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    {/* Tanggal */}
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

                    {/* Grid Waktu Sholat */}
                    <div className='grid grid-cols-3 gap-y-4 gap-x-2'>
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
      </main>

      {/* Floating Bottom Nav (Opsional, jika ingin navigasi cepat) */}
      <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-40'>
        <button
          onClick={() =>
            activeRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
          className='bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform'
        >
          <Calendar size={14} /> Kembali ke Hari Ini
        </button>
      </div>
    </div>
  );
}

// Komponen Kecil untuk Item Waktu
function TimeItem({ label, time, isToday, bold = false }) {
  return (
    <div className='text-center'>
      <p
        className={`text-[10px] uppercase font-bold tracking-wider mb-1 
        ${isToday ? 'text-blue-200' : 'text-slate-400'}`}
      >
        {label}
      </p>
      <p
        className={`font-medium text-sm tabular-nums 
        ${isToday ? 'text-white' : 'text-slate-700'} 
        ${bold ? 'font-black scale-110' : ''}`}
      >
        {time}
      </p>
    </div>
  );
}
