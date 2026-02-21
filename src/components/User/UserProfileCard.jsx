'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { MapPin, KeyRound, Edit3, LogIn, User as UserIcon } from 'lucide-react';

/**
 * UserProfileCard — menampilkan avatar, nama, personal code (masked), dan kota user.
 * Tombol edit membuka DrawerEditProfil; tombol login redirect ke /auth/login.
 *
 * @prop {object|null} user          - Data user dari useUser()
 * @prop {object}      profileData   - { name, personalCode, avatar }
 * @prop {string}      locationName  - Nama kota yang sedang aktif
 * @prop {Function}    onEdit        - Callback buka drawer edit profil
 */
const UserProfileCard = ({ user, profileData, locationName, onEdit }) => {
  const router = useRouter();

  return (
    <div className='bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 relative'>
      {/* Tombol edit / login */}
      <button
        onClick={() => (user ? onEdit() : router.push('/auth/login'))}
        className='absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-full transition-colors'
        title={user ? 'Edit Profil' : 'Login'}
      >
        {user ? <Edit3 size={16} /> : <LogIn size={16} />}
      </button>

      {/* Avatar */}
      <div className='w-20 h-20 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center text-[#1e3a8a] dark:text-blue-400 shadow-inner shrink-0 relative overflow-hidden'>
        {profileData.avatar ? (
          <Image
            src={profileData.avatar}
            alt='Profile'
            fill
            className='object-cover'
          />
        ) : (
          <UserIcon size={36} strokeWidth={1.5} />
        )}
      </div>

      {/* Info user */}
      <div className='flex-1 overflow-hidden pr-4'>
        <h2 className='font-bold text-xl md:text-2xl text-slate-800 dark:text-slate-100 truncate'>
          {profileData.name}
        </h2>
        <div className='flex items-center gap-1.5 mb-2'>
          <KeyRound size={12} className='text-slate-400 dark:text-slate-500' />
          <p className='text-sm font-medium text-slate-500 dark:text-slate-400 font-mono tracking-wider'>
            ID: {profileData.personalCode}
          </p>
        </div>
        <div className='flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 w-fit px-2.5 py-1 rounded-lg'>
          <MapPin size={12} />
          <span className='truncate max-w-[120px]'>{locationName}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
