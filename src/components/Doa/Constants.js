import {
  Sun,
  Moon,
  BookOpen,
  Users,
  Heart,
  Sunrise,
  Sunset,
  Star,
} from 'lucide-react';

/**
 * Ukuran teks Arab yang tersedia di reader Doa.
 */
export const DOA_ARAB_SIZES = [
  { key: 'sm', label: 'S', size: '22px', leading: '2.1' },
  { key: 'md', label: 'M', size: '26px', leading: '2.4' },
  { key: 'lg', label: 'L', size: '30px', leading: '2.5' },
  { key: 'xl', label: 'XL', size: '36px', leading: '2.6' },
];

/**
 * Default settings reader Doa.
 */
export const DEFAULT_DOA_SETTINGS = {
  arab: true,
  latin: true,
  terjemahan: true,
  arabSize: 'md',
};

/**
 * Map nama icon string → komponen Lucide.
 * Digunakan untuk merender ikon kategori doa secara dinamis.
 */
export const DOA_ICONS = {
  Sun,
  Moon,
  BookOpen,
  Users,
  Heart,
  Sunrise,
  Sunset,
  Star,
};
