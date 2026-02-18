export const journalPrompts = {
  pre_ramadhan: {
    title: 'Persiapan Batin',
    description: 'Sebelum start, ayo luruskan niat dan bersihkan hati.',
    prompts: [
      'Apa hal yang paling kamu sesali dari Ramadhan tahun lalu?',
      'Apa satu target spiritual terbesar kamu tahun ini?',
      'Siapa orang yang perlu kamu maafkan sebelum Ramadhan mulai?',
      'Apa ketakutan terbesarmu menghadapi bulan ini?',
    ],
  },
  letting_go: {
    title: 'Letting Go Bad Habits',
    description:
      'Tulis, akui, lalu lepaskan. Kamu lebih kuat dari kebiasaanmu.',
    prompts: [
      'Kebiasaan buruk apa yang paling sering menghalangimu beribadah?',
      'Kapan biasanya kebiasaan ini muncul? (Trigger-nya apa?)',
      'Apa langkah kecil pertama untuk menggantinya dengan hal baik?',
      'Bayangkan dirimu tanpa kebiasaan ini, seberapa lega rasanya?',
    ],
  },
  daily: {
    title: 'Refleksi Harian',
    description: 'Cek ombak perasaan hari ini.',
    prompts: [
      'Apa hal kecil yang bikin kamu bersyukur hari ini?',
      'Ada tantangan emosi yang bikin batal pahala nggak tadi?',
      'Ibadah apa yang rasanya paling nikmat hari ini?',
      'Apa doa khususmu hari ini?',
    ],
  },
  post_ramadhan: {
    title: 'Menjaga Semangat',
    description: 'Ramadhan pergi, tapi Rabb-nya Ramadhan tidak.',
    prompts: [
      'Apa kebiasaan baik Ramadhan yang MAU BANGET kamu pertahankan?',
      'Bagaimana perasaanmu saat Lebaran tiba? Sedih atau lega?',
      'Apa pesan untuk dirimu di Ramadhan tahun depan?',
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
