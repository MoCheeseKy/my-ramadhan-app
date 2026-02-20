// src/data/doa.js

export const doaCollections = [
  {
    id: 'harian',
    title: 'Doa Harian',
    icon: 'Sun',
    description: 'Kumpulan doa aktivitas sehari-hari',
    api: 'https://api.myquran.com/v2/doa/semua',
    mapData: (res) => {
      // MyQuran API mengembalikan { status: true, data: [...] }
      const arr = Array.isArray(res) ? res : res.data || [];
      return arr.map((item, i) => ({
        id: `harian-${item.id || i}`,
        title: item.judul || 'Doa Harian',
        arab: item.arab,
        latin: item.latin,
        arti: item.indo,
      }));
    },
  },
  {
    id: 'asmaul-husna',
    title: 'Asmaul Husna',
    icon: 'Star',
    description: '99 Nama Allah beserta maknanya',
    api: 'https://api.myquran.com/v2/husna/semua',
    mapData: (res) => {
      const arr = Array.isArray(res) ? res : res.data || [];
      return arr.map((item) => ({
        id: `husna-${item.id}`,
        title: item.latin,
        arab: item.arab,
        latin: item.latin,
        arti: item.indo,
      }));
    },
  },
  {
    id: 'tahlil',
    title: 'Bacaan Tahlil',
    icon: 'BookOpen',
    description: 'Susunan dzikir & tahlil lengkap',
    api: 'https://raw.githubusercontent.com/Zhirrr/islamic-rest-api-indonesian-v2/master/data/tahlil.json',
    mapData: (res) => {
      // API ini terkadang mengembalikan langsung Array
      const arr = Array.isArray(res) ? res : res.data || res.result || [];
      return arr.map((item, i) => ({
        id: `tahlil-${item.id || i}`,
        title: item.title || `Bacaan Tahlil ${i + 1}`,
        arab: item.arabic || item.arab || '',
        latin: '',
        arti: item.translation || item.arti || '',
      }));
    },
  },
  {
    id: 'wirid',
    title: 'Wirid Shalat',
    icon: 'Users',
    description: 'Dzikir setelah shalat fardhu',
    api: 'https://raw.githubusercontent.com/Zhirrr/islamic-rest-api-indonesian-v2/master/data/wirid.json',
    mapData: (res) => {
      const arr = Array.isArray(res) ? res : res.data || res.result || [];
      return arr.map((item, i) => ({
        id: `wirid-${item.id || i}`,
        title: item.times ? `Dibaca ${item.times}x` : `Wirid ke-${i + 1}`,
        arab: item.arabic || item.arab || '',
        latin: '',
        arti: item.tnc || item.arti || '',
      }));
    },
  },
  {
    id: 'matsurat-pagi',
    title: 'Dzikir Pagi',
    icon: 'Sunrise',
    description: 'Amalan dzikir pagi hari',
    api: 'https://raw.githubusercontent.com/Zhirrr/islamic-rest-api-indonesian-v2/master/data/dzikirpagi.json',
    mapData: (res) => {
      const arr = Array.isArray(res) ? res : res.data || res.result || [];
      return arr.map((item, i) => ({
        id: `pagi-${item.id || i}`,
        title: item.title || `Dzikir Pagi ${i + 1}`,
        arab: item.arabic || item.arab || '',
        latin: item.notes || item.latin || '',
        arti: item.translation || item.arti || '',
      }));
    },
  },
  {
    id: 'matsurat-petang',
    title: 'Dzikir Petang',
    icon: 'Sunset',
    description: 'Amalan dzikir sore/petang',
    api: 'https://raw.githubusercontent.com/Zhirrr/islamic-rest-api-indonesian-v2/master/data/dzikirpetang.json',
    mapData: (res) => {
      const arr = Array.isArray(res) ? res : res.data || res.result || [];
      return arr.map((item, i) => ({
        id: `petang-${item.id || i}`,
        title: item.title || `Dzikir Petang ${i + 1}`,
        arab: item.arabic || item.arab || '',
        latin: item.notes || item.latin || '',
        arti: item.translation || item.arti || '',
      }));
    },
  },
];
