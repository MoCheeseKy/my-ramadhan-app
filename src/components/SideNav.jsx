'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  Book,
  Heart,
  Compass,
  Activity,
  CalendarDays,
  MessageCircle,
  User,
  List,
  Pen,
  Fingerprint,
  Droplets,
  ScrollText,
  Scale,
} from 'lucide-react';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const navRef = useRef(null);

  // Menutup SideNav otomatis jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Konfigurasi Navigasi yang dikelompokkan
  const navGroups = [
    [
      {
        path: '/',
        icon: Home,
        label: 'Beranda',
        activeColor: 'text-[#1e3a8a] dark:text-blue-400',
        bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
      },
    ],
    [
      {
        path: '/tracker-kalender',
        icon: CalendarDays,
        label: 'Ramadhan Tracker',
        activeColor: 'text-orange-500 dark:text-orange-400',
        bgHover: 'hover:bg-orange-50 dark:hover:bg-orange-900/30',
      },
      {
        path: '/jurnal',
        icon: Pen,
        label: 'Jurnal Syukur',
        activeColor: 'text-teal-600 dark:text-teal-400',
        bgHover: 'hover:bg-teal-50 dark:hover:bg-teal-900/30',
      },
    ],
    [
      {
        path: '/quran',
        icon: BookOpen,
        label: "Al-Qur'an",
        activeColor: 'text-indigo-600 dark:text-indigo-400',
        bgHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30',
      },
      {
        path: '/doa',
        icon: Heart,
        label: 'Kumpulan Doa',
        activeColor: 'text-rose-600 dark:text-rose-400',
        bgHover: 'hover:bg-rose-50 dark:hover:bg-rose-900/30',
      },
      {
        path: '/hadits',
        icon: ScrollText,
        label: 'Hadits Pilihan',
        activeColor: 'text-emerald-600 dark:text-emerald-400',
        bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30',
      },
      {
        path: '/fiqih',
        icon: Scale,
        label: 'Fiqih Ramadhan',
        activeColor: 'text-amber-600 dark:text-amber-400',
        bgHover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
      },
    ],
    [
      {
        path: '/kompas',
        icon: Compass,
        label: 'Arah Kiblat',
        activeColor: 'text-amber-600 dark:text-amber-400',
        bgHover: 'hover:bg-amber-50 dark:hover:bg-amber-900/30',
      },
      {
        path: '/tasbih',
        icon: Fingerprint,
        label: 'Tasbih Digital',
        activeColor: 'text-purple-600 dark:text-purple-400',
        bgHover: 'hover:bg-purple-50 dark:hover:bg-purple-900/30',
      },
      {
        path: '/zakat',
        icon: Fingerprint,
        label: 'Zakat Digital',
        activeColor: 'text-yellow-600 dark:text-yellow-400',
        bgHover: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/30',
      },
      {
        path: '/haid-tracker',
        icon: Droplets,
        label: 'Haid Tracker',
        activeColor: 'text-pink-500 dark:text-pink-400',
        bgHover: 'hover:bg-pink-50 dark:hover:bg-pink-900/30',
      },
    ],
    [
      {
        path: '/ramatalk',
        icon: MessageCircle,
        label: 'RamaTalk AI',
        activeColor: 'text-blue-500 dark:text-blue-400',
        bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
      },
      {
        path: '/user',
        icon: User,
        label: 'Profil & Pengaturan',
        activeColor: 'text-slate-700 dark:text-slate-300',
        bgHover: 'hover:bg-slate-100 dark:hover:bg-slate-800',
      },
    ],
  ];

  return (
    <div
      ref={navRef}
      className='fixed top-1/2 right-0 -translate-y-1/2 z-[100] flex items-center'
    >
      {/* ─── TOMBOL PEMICU (Trigger Button) ─── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative z-20 flex items-center justify-center
          w-7 h-16 rounded-l-2xl border border-r-0 border-slate-200 dark:border-slate-700
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[-4px_0_15px_rgba(0,0,0,0.08)]
          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          text-slate-400 dark:text-slate-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 hover:w-8
          ${isOpen ? 'translate-x-2 opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
        `}
        title='Menu Navigasi'
      >
        <div className='absolute right-0 h-8 w-1 bg-slate-200 dark:bg-slate-700 rounded-l-full' />
        <ChevronLeft size={18} strokeWidth={2.5} className='-ml-1' />
      </button>

      {/* ─── CONTAINER UTAMA LACI (Mengatur 40vh dan Transisi Laci) ─── */}
      <div
        className={`
          absolute right-0 top-1/2 -translate-y-1/2 
          bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-r-0 border-slate-200/80 dark:border-slate-700/80
          rounded-l-[2rem] shadow-[-12px_0_30px_rgba(0,0,0,0.06)] dark:shadow-[-12px_0_30px_rgba(0,0,0,0.4)]
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen ? 'w-16 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-12 pointer-events-none'}
        `}
        style={{
          // Batas tinggi diatur di sini
          height: '40vh',
          minHeight: '250px', // Mencegah laci terlalu pendek di layar mungil
        }}
      >
        {/* ─── AREA SCROLL MENU (Terpisah agar Tooltip tidak terpotong) ─── */}
        <div className='w-full h-full overflow-y-auto overflow-x-visible custom-scrollbar flex flex-col items-center py-4 gap-1.5'>
          {/* Tombol Tutup Laci di dalam area scroll */}
          <button
            onClick={() => setIsOpen(false)}
            className='w-10 h-10 mb-2 rounded-xl flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>

          {navGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {/* Pembatas antar grup menu */}
              {groupIndex > 0 && (
                <div className='w-8 h-px bg-slate-200/60 dark:bg-slate-700/60 my-1 rounded-full shrink-0' />
              )}

              {group.map((item, itemIndex) => {
                const Icon = item.icon;
                const isActive =
                  router.pathname === item.path ||
                  (item.path !== '/' && router.pathname.startsWith(item.path));

                return (
                  <div
                    key={itemIndex}
                    className='relative group/navitem w-full flex justify-center shrink-0'
                  >
                    <button
                      onClick={() => {
                        router.push(item.path);
                        setIsOpen(false);
                      }}
                      className={`
                        relative p-3 rounded-2xl flex items-center justify-center transition-all duration-300
                        ${
                          isActive
                            ? `bg-slate-100 dark:bg-slate-800 shadow-inner scale-95 ${item.activeColor}`
                            : `text-slate-400 dark:text-slate-500 ${item.bgHover} hover:scale-110 hover:-translate-x-1`
                        }
                      `}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />

                      {/* Indikator titik aktif di samping */}
                      {isActive && (
                        <span className='absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current' />
                      )}
                    </button>

                    {/* Tooltip Keren yang muncul saat di-hover */}
                    <div
                      className='
                      absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 
                      bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl whitespace-nowrap
                      opacity-0 translate-x-4 pointer-events-none transition-all duration-300 z-50
                      group-hover/navitem:opacity-100 group-hover/navitem:translate-x-0
                      shadow-lg
                    '
                    >
                      {item.label}
                      {/* Segitiga panah kecil */}
                      <div className='absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-800 dark:bg-slate-100 rotate-45' />
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
