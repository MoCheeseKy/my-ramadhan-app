/**
 * Endpoint base API Hadits.
 */
export const HADITS_API_BASE = 'https://api.hadith.gading.dev';

/**
 * Jumlah hadits per halaman.
 */
export const HADITS_PER_PAGE = 10;

/**
 * Pilihan ukuran teks Arab di reader Hadits.
 */
export const HADITS_ARAB_SIZES = [
  { key: 'sm', label: 'S', size: '22px' },
  { key: 'md', label: 'M', size: '28px' },
  { key: 'lg', label: 'L', size: '36px' },
];

/**
 * Default settings reader Hadits.
 * Berbagi storage key dengan settings Doa (myRamadhan_doa_settings)
 * karena keduanya punya struktur yang kompatibel.
 */
export const DEFAULT_HADITS_SETTINGS = {
  arab: true,
  terjemahan: true,
  arabSize: 'md',
};
