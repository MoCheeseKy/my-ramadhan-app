'use client';

import { useRouter } from 'next/router';
import {
  BookOpen,
  HeartHandshake,
  ScrollText,
  Scale,
  Compass,
  Fingerprint,
  HandCoins,
  Droplets,
} from 'lucide-react';
import ToolCard from '@/components/_shared/ToolCard';

/**
 * Definisi tool — dipisahkan dari JSX agar mudah dikembangkan
 * (tambah/kurang tool cukup edit array ini).
 */
const TOOLS = [
  {
    icon: BookOpen,
    title: "Al-Qur'an",
    colorClass: 'text-[#1e3a8a] dark:text-blue-400',
    bgClass: 'text-blue-100 dark:text-blue-900/60',
    route: '/quran',
  },
  {
    icon: HeartHandshake,
    title: 'Doa',
    colorClass: 'text-rose-500 dark:text-rose-400',
    bgClass: 'text-rose-100 dark:text-rose-900/60',
    route: '/doa',
  },
  {
    icon: ScrollText,
    title: 'Hadits',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'text-emerald-100 dark:text-emerald-900/60',
    route: '/hadits',
  },
  {
    icon: Scale,
    title: 'Fiqih',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'text-amber-100 dark:text-amber-900/60',
    route: '/fiqih',
  },
  {
    icon: Compass,
    title: 'Kiblat',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'text-indigo-100 dark:text-indigo-900/60',
    route: '/kompas',
  },
  {
    icon: Fingerprint,
    title: 'Tasbih',
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'text-teal-100 dark:text-teal-900/60',
    route: '/tasbih',
  },
  {
    icon: HandCoins,
    title: 'Zakat',
    colorClass: 'text-yellow-500 dark:text-yellow-400',
    bgClass: 'text-yellow-100 dark:text-yellow-900/60',
    route: '/zakat',
  },
  {
    icon: Droplets,
    title: 'Haid',
    colorClass: 'text-pink-500 dark:text-pink-400',
    bgClass: 'text-pink-100 dark:text-pink-900/60',
    route: '/haid-tracker',
  },
];

/**
 * ToolGrid — grid 4 kolom (mobile) / 8 kolom (tablet) / 4 kolom (desktop)
 * untuk navigasi ke fitur-fitur utama aplikasi.
 */
const ToolGrid = () => {
  const router = useRouter();

  return (
    <div className='grid grid-cols-4 md:grid-cols-8 lg:grid-cols-4 gap-3 mt-1'>
      {TOOLS.map((tool) => (
        <ToolCard
          key={tool.route}
          icon={tool.icon}
          title={tool.title}
          colorClass={tool.colorClass}
          bgClass={tool.bgClass}
          onClick={() => router.push(tool.route)}
        />
      ))}
    </div>
  );
};

export default ToolGrid;
