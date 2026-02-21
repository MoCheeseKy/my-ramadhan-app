import { Sun, BookOpen, Heart, Coffee } from 'lucide-react';
import dayjs from 'dayjs';

/** Rentang bulan Ramadhan untuk kalkulasi qadha */
export const RAMADHAN_START = dayjs('2026-02-19');
export const RAMADHAN_END = dayjs('2026-03-20');

/** Daftar amalan pengganti ibadah saat haid */
export const AMALAN_HAID = [
  {
    id: 1,
    title: 'Dzikir Pagi Petang',
    icon: Sun,
    desc: 'Menjaga lisan tetap basah dengan mengingat Allah.',
  },
  {
    id: 2,
    title: 'Mendengarkan Murottal',
    icon: BookOpen,
    desc: "Tetap dekat dengan Al-Qur'an meski tidak memegang mushaf.",
  },
  {
    id: 3,
    title: 'Bersedekah',
    icon: Heart,
    desc: 'Pahala berlipat ganda, sangat dianjurkan bagi wanita.',
  },
  {
    id: 4,
    title: 'Siapkan Buka Puasa',
    icon: Coffee,
    desc: 'Mendapat pahala orang yang berpuasa tanpa mengurangi pahala mereka.',
  },
];

/**
 * Definisi setiap fase siklus menstruasi.
 * Digunakan oleh getCyclePhase() untuk menentukan fase aktif.
 */
export const CYCLE_PHASES = {
  MENSTRUATION: {
    phase: 'Fase Menstruasi',
    desc: 'Tubuh sedang melepaskan dinding rahim. Perbanyak istirahat, wajar jika merasa lemas atau kram perut.',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    bar: 'bg-rose-500 dark:bg-rose-500',
  },
  FOLLICULAR: {
    phase: 'Fase Folikuler',
    desc: 'Energi dan mood sedang meningkat drastis! Waktu yang sangat tepat untuk produktif beraktivitas dan ibadah ekstra.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    bar: 'bg-blue-500 dark:bg-blue-500',
  },
  OVULATION: {
    phase: 'Fase Ovulasi',
    desc: 'Puncak masa kesuburan. Terkadang disertai nyeri ringan di satu sisi perut bawah (mittelschmerz).',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    bar: 'bg-emerald-500 dark:bg-emerald-500',
  },
  LUTEAL: {
    phase: 'Fase Luteal (PMS)',
    desc: 'Energi mulai perlahan menurun. Kamu mungkin rentan mood swing, lapar, dan sensitif. Perbanyak sabar ya!',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    bar: 'bg-amber-500 dark:bg-amber-500',
  },
  WAITING: {
    phase: 'Menunggu Siklus',
    desc: 'Siklusmu sudah melewati rata-rata 28 hari. Jangan stres agar siklusmu segera datang.',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-800',
    bar: 'bg-slate-400 dark:bg-slate-500',
  },
};
