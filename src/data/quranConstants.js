/**
 * Pilihan ukuran teks Arab yang tersedia di reader.
 */
export const ARAB_SIZES = [
  { key: 'sm', label: 'S', size: '22px' },
  { key: 'md', label: 'M', size: '28px' },
  { key: 'lg', label: 'L', size: '36px' },
  { key: 'xl', label: 'XL', size: '42px' },
];

/**
 * Aturan tajwid beserta warna highlight dan deskripsi singkat.
 */
export const TAJWID_RULES = [
  {
    key: 'mad',
    label: 'Mad (Panjang)',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.12)',
    darkBg: 'rgba(37,99,235,0.25)',
    desc: 'Bacaan dipanjangkan 2-6 harakat',
  },
  {
    key: 'ghunnah',
    label: 'Ghunnah (Dengung)',
    color: '#db2777',
    bg: 'rgba(219,39,119,0.12)',
    darkBg: 'rgba(219,39,119,0.25)',
    desc: 'Dengung 2 harakat pada nun/mim bertasydid',
  },
  {
    key: 'idgham',
    label: 'Idgham (Masuk/Lebur)',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.12)',
    darkBg: 'rgba(124,58,237,0.25)',
    desc: 'Nun mati/tanwin lebur ke huruf berikutnya',
  },
  {
    key: 'ikhfa',
    label: 'Ikhfa (Samar)',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.12)',
    darkBg: 'rgba(217,119,6,0.25)',
    desc: 'Nun mati/tanwin dibaca samar',
  },
  {
    key: 'qalqalah',
    label: 'Qalqalah (Memantul)',
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.12)',
    darkBg: 'rgba(220,38,38,0.25)',
    desc: 'Huruf qalqalah dibaca memantul',
  },
  {
    key: 'iqlab',
    label: 'Iqlab (Tukar ke Mim)',
    color: '#059669',
    bg: 'rgba(5,150,105,0.12)',
    darkBg: 'rgba(5,150,105,0.25)',
    desc: 'Nun mati/tanwin berubah menjadi mim',
  },
];

/**
 * Default settings reader Al-Qur'an.
 */
export const DEFAULT_READER_SETTINGS = {
  arab: true,
  latin: true,
  terjemahan: true,
  tajwid: false,
  arabSize: 'md',
};
