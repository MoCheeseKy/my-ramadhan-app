'use client';

import Image from 'next/image';
import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerPengembang — profil dan tautan sosial pengembang aplikasi.
 */
const DrawerPengembang = ({ open, onClose }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Pengembang Aplikasi'
    icon={UserIcon}
    titleColor='text-indigo-500 dark:text-indigo-400'
  >
    {/* Identitas pengembang */}
    <div className='flex items-center gap-4 mb-5 mt-2'>
      <div className='w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-[#1e3a8a] shadow-inner shrink-0 relative overflow-hidden'>
        <Image
          src='/developer-profile.jpg'
          alt='Profile'
          fill
          className='object-cover'
        />
      </div>
      <div>
        <h3 className='font-bold text-base text-slate-800 dark:text-slate-100'>
          Rifky Muhammad Prayudhi
        </h3>
        <p className='text-xs text-slate-500 dark:text-slate-400'>
          Software Engineer
        </p>
      </div>
    </div>

    {/* Bio singkat */}
    <p className='text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700'>
      Dibuat secara independen di waktu luang dengan tujuan membantu ibadah umat
      Muslim, khususnya di bulan suci Ramadhan, agar menjadi lebih mudah dan
      bermakna.
    </p>

    {/* Social links */}
    <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-3'>
      Kunjungi Profil Saya
    </p>
    <div className='flex items-center justify-center gap-3'>
      {[
        {
          href: 'https://github.com/MoCheeseKy',
          icon: Github,
          hoverBg: 'hover:bg-[#1e3a8a]',
        },
        {
          href: 'https://www.linkedin.com/in/rifkymprayudhi',
          icon: Linkedin,
          hoverBg: 'hover:bg-[#0077b5]',
        },
        {
          href: 'https://www.instagram.com/mocheeseky',
          icon: Instagram,
          hoverBg: 'hover:bg-[#e1306c]',
        },
        {
          href: 'mailto:rifky.muhammadprayudhi@gmail.com',
          icon: Mail,
          hoverBg: 'hover:bg-rose-500',
        },
      ].map(({ href, icon: Icon, hoverBg }) => (
        <a
          key={href}
          href={href}
          target='_blank'
          rel='noreferrer'
          className={`p-3.5 bg-slate-100 dark:bg-slate-800 ${hoverBg} hover:text-white text-slate-600 dark:text-slate-300 rounded-2xl transition-colors`}
        >
          <Icon size={20} />
        </a>
      ))}
    </div>
  </DrawerPanel>
);

export default DrawerPengembang;
