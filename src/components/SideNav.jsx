import React, { useState } from 'react';
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
} from 'lucide-react';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Daftar rute navigasi cepat
  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Beranda',
      activeColor: 'text-[#1e3a8a]',
      bgHover: 'hover:bg-blue-50',
    },
    {
      path: '/quran',
      icon: BookOpen,
      label: "Al-Qur'an",
      activeColor: 'text-[#1e3a8a]',
      bgHover: 'hover:bg-blue-50',
    },
    {
      path: '/hadits',
      icon: Book,
      label: 'Hadits',
      activeColor: 'text-emerald-600',
      bgHover: 'hover:bg-emerald-50',
    },
    {
      path: '/doa',
      icon: Heart,
      label: 'Doa',
      activeColor: 'text-rose-600',
      bgHover: 'hover:bg-rose-50',
    },
    {
      path: '/tasbih',
      icon: Activity,
      label: 'Tasbih',
      activeColor: 'text-purple-600',
      bgHover: 'hover:bg-purple-50',
    },
    {
      path: '/kompas',
      icon: Compass,
      label: 'Kiblat',
      activeColor: 'text-amber-600',
      bgHover: 'hover:bg-amber-50',
    },
  ];

  return (
    <div className='fixed top-1/2 right-0 -translate-y-1/2 z-[100] flex items-center'>
      {/* TOMBOL PEMICU (Setengah Lingkaran / Gunung) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='bg-white/90 backdrop-blur-md border border-r-0 border-slate-200 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] rounded-l-full py-6 pl-1.5 pr-0.5 flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-600 z-10'
        title='Menu Navigasi'
      >
        {isOpen ? (
          <ChevronRight size={18} strokeWidth={3} />
        ) : (
          <ChevronLeft size={18} strokeWidth={3} />
        )}
      </button>

      {/* LACI NAVIGASI */}
      <div
        className={`bg-white/90 backdrop-blur-md border border-r-0 border-slate-200 rounded-l-3xl shadow-[-8px_0_20px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 ease-out flex flex-col items-center gap-3 ${
          isOpen
            ? 'w-16 py-4 opacity-100 ml-1 translate-x-0'
            : 'w-0 py-0 opacity-0 ml-0 translate-x-10 border-none'
        }`}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          // Pengecekan status halaman saat ini (Active state)
          const isActive =
            router.pathname === item.path ||
            (item.path !== '/' && router.pathname.startsWith(item.path));

          return (
            <button
              key={index}
              onClick={() => {
                router.push(item.path);
                setIsOpen(false); // Tutup laci setelah diklik
              }}
              title={item.label}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? `bg-slate-100 shadow-inner scale-95 ${item.activeColor}`
                  : `text-slate-400 ${item.bgHover} hover:scale-110 hover:text-slate-600`
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
