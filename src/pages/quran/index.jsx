import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Search, ArrowLeft, Bookmark } from 'lucide-react';

export default function QuranHome() {
  const [activeTab, setActiveTab] = useState('surah'); // 'surah' or 'juz'
  const [surahList, setSurahList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Fetch Daftar Surat
  useEffect(() => {
    async function fetchSurah() {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        setSurahList(data.data);
      } catch (error) {
        console.error('Gagal memuat daftar surat');
      }
    }
    fetchSurah();
  }, []);

  // Filter Pencarian
  const filteredSurah = surahList.filter((s) =>
    s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-blue-200'>
      <Head>
        <title>Al-Qur{"'"}an - MyRamadhan</title>
      </Head>

      {/* Header */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4'>
        <div className='flex justify-between'>
          <div className='flex items-center gap-4 mb-4'>
            <button
              onClick={() => router.push('/')}
              className='p-2 -ml-2 rounded-full hover:bg-slate-100'
            >
              <ArrowLeft size={20} className='text-slate-600' />
            </button>
            <h1 className='font-bold text-xl'>Al-Qur{"'"}an</h1>
          </div>
          <div className='flex justify-between'>
            <div className='flex items-center gap-4 mb-4'>
              <button
                onClick={() => router.push('/quran/bookmarks')}
                className='p-2 -ml-2 rounded-full hover:bg-slate-100'
              >
                <Bookmark size={20} className='text-slate-600' />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className='relative'>
          <Search
            className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
            size={18}
          />
          <input
            type='text'
            placeholder='Cari surat...'
            className='w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all'
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className='flex mt-4 bg-slate-100 p-1 rounded-xl'>
          <button
            onClick={() => setActiveTab('surah')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'surah' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-400'}`}
          >
            Surah
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'juz' ? 'bg-white shadow-sm text-[#1e3a8a]' : 'text-slate-400'}`}
          >
            Juz
          </button>
        </div>
      </header>

      <main className='p-5 max-w-md mx-auto space-y-3'>
        {activeTab === 'surah'
          ? // LIST SURAH
            filteredSurah.map((surah) => (
              <div
                key={surah.nomor}
                onClick={() => router.push(`/quran/surah/${surah.nomor}`)}
                className='bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group'
              >
                <div className='w-10 h-10 bg-blue-50 text-[#1e3a8a] rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors'>
                  {surah.nomor}
                </div>
                <div className='flex-1'>
                  <h3 className='font-bold text-slate-800'>
                    {surah.namaLatin}
                  </h3>
                  <p className='text-xs text-slate-400'>
                    {surah.arti} • {surah.jumlahAyat} Ayat
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-amiri text-lg font-bold text-slate-800'>
                    {surah.nama}
                  </p>
                </div>
              </div>
            ))
          : // LIST JUZ (Updated dengan onClick)
            [...Array(30)].map((_, i) => (
              <div
                key={i}
                onClick={() => router.push(`/quran/juz/${i + 1}`)} // <--- INI BAGIAN PENTINGNYA
                className='bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 group'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 bg-indigo-50 text-[#1e3a8a] rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors'>
                    {i + 1}
                  </div>
                  <h3 className='font-bold text-slate-800'>Juz {i + 1}</h3>
                </div>
                <button className='text-xs font-bold text-[#1e3a8a] bg-indigo-50 px-3 py-1.5 rounded-full group-hover:bg-indigo-100 transition-colors'>
                  Mulai Baca
                </button>
              </div>
            ))}
      </main>
    </div>
  );
}
