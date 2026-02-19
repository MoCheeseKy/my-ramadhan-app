export const journalPrompts = {
  daily: {
    title: 'Refleksi Harian',
    description: 'Cek ombak perasaan hari ini.',
    prompts: [
      'Apa satu hal kecil yang bikin kamu tersenyum hari ini?',
      'Siapa orang yang paling ingin kamu doakan hari ini, dan kenapa?',
      'Ada kejadian apa hari ini yang bikin kamu belajar sabar?',
      'Ibadah apa yang rasanya paling nikmat dan khusyuk hari ini?',
      'Kalau hari ini adalah sebuah bab di buku, apa judulnya?',
    ],
  },
  syukur: {
    title: 'Catatan Syukur',
    description: 'Fokus pada hal baik, sekecil apapun itu.',
    prompts: [
      'Sebutkan 3 nikmat Allah hari ini yang sering kamu anggap remeh!',
      'Siapa orang yang kehadirannya sangat kamu syukuri hari ini?',
      'Makanan atau minuman apa yang paling terasa nikmat hari ini?',
      'Momen apa hari ini yang membuat hatimu merasa hangat dan tenang?',
    ],
  },
  ikhlaskan: {
    title: 'Ruang Ikhlas',
    description: 'Tulis, akui, lalu lepaskan. Biar hati makin lapang.',
    prompts: [
      'Adakah amarah yang masih kamu pendam hari ini? Yuk, luapkan di sini lalu ikhlaskan.',
      'Apa satu hal di luar kendalimu yang bikin kamu cemas hari ini?',
      'Kebiasaan buruk apa yang rasanya masih susah banget dilepas?',
      'Siapa yang perlu kamu maafkan hari ini (termasuk memaafkan diri sendiri)?',
    ],
  },
  pre_ramadhan: {
    title: 'Persiapan Batin',
    description: 'Sebelum start, ayo luruskan niat dan bersihkan hati.',
    prompts: [
      'Apa hal yang paling kamu sesali dari Ramadhan tahun lalu?',
      'Apa satu target spiritual terbesar kamu tahun ini?',
      'Apa ketakutan terbesarmu menghadapi bulan Ramadhan kali ini?',
    ],
  },
  // --- KATEGORI BARU ---
  bebas: {
    title: 'Catatan Bebas',
    description: 'Ruang kosong untuk cerita pribadimu hari ini.',
    prompts: [
      'Tuliskan apa saja yang melintas di pikiranmu saat ini...',
      'Ada cerita atau kejadian apa hari ini yang ingin kamu abadikan?',
      'Silakan tumpahkan segala rasamu di sini tanpa batasan.',
    ],
  },
};

export const moods = [
  { id: 'happy', icon: '😄', label: 'Senang' },
  { id: 'calm', icon: '😌', label: 'Tenang' },
  { id: 'grateful', icon: '🥰', label: 'Bersyukur' },
  { id: 'sad', icon: '😔', label: 'Sedih' },
  { id: 'tired', icon: '😫', label: 'Lelah' },
  { id: 'angry', icon: '😠', label: 'Kesal' },
];
