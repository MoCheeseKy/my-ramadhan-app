'use client';

import { Bell, User } from 'lucide-react';
import { useRouter } from 'next/router';

/**
 * HomeHeader — bagian atas halaman Home.
 * Menampilkan salam, tanggal hijriah, ikon notifikasi, dan avatar user.
 */
const HomeHeader = ({
  user,
  hijriDate,
  hasUnreadNotif,
  onOpenNotification,
}) => {
  const router = useRouter();

  return (
    <header className='flex justify-between items-center mb-8 mt-2 md:mb-10 lg:mb-10'>
      <div>
        <span className='px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md'>
          {hijriDate}
        </span>
        <h1 className='text-2xl md:text-3xl lg:text-3xl font-extrabold tracking-tight mt-2 leading-tight'>
          {"Assalamu'alaikum"} <br />
          <span className='text-[#1e3a8a] dark:text-blue-400'>
            {user?.username || 'Sahabat!'}
          </span>{' '}
          👋
        </h1>
      </div>

      <div className='flex gap-4 md:gap-5 items-center'>
        {/* Bell notification dengan badge unread */}
        <div
          className='relative cursor-pointer hover:scale-110 transition-transform flex items-center justify-center'
          onClick={onOpenNotification}
        >
          <Bell
            size={24}
            className='text-slate-500 dark:text-slate-400 md:w-7 md:h-7'
          />
          {hasUnreadNotif && (
            <span className='absolute top-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-rose-500 rounded-full border-2 border-[#F6F9FC] dark:border-slate-950 animate-pulse' />
          )}
        </div>

        {/* Avatar / login button */}
        <div className='w-11 h-11 md:w-14 md:h-14 lg:w-14 lg:h-14 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-xl hover:scale-105 transition-transform'>
          {user ? (
            <User
              size={20}
              className='text-[#1e3a8a] dark:text-blue-400 cursor-pointer md:w-6 md:h-6 lg:w-6 lg:h-6'
              onClick={() => router.push('/user')}
            />
          ) : (
            <User
              size={20}
              className='text-emerald-500 cursor-pointer md:w-6 md:h-6 lg:w-6 lg:h-6'
              onClick={() => router.push('/auth/login')}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
