import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Search, Scale, BookOpen } from 'lucide-react';
import { fiqihRamadhanData } from '@/data/fiqih';

export default function FiqihPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Logic Filter Pencarian
  const filteredData = fiqihRamadhanData.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-amber-200'>
      <Head>
        <title>Fiqih Puasa - MyRamadhan</title>
      </Head>

      {/* --- Header Sticky --- */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4'>
        <div className='flex items-center gap-4 mb-4'>
          <button
            onClick={() => router.push('/')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
          >
            <ArrowLeft size={20} className='text-slate-600' />
          </button>
          <div>
            <h1 className='font-bold text-xl flex items-center gap-2'>
              <Scale size={24} className='text-amber-500' />
              Fiqih Ramadhan
            </h1>
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
            placeholder='Cari topik fiqih (contoh: batal, niat)...'
            className='w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-amber-400 outline-none text-sm transition-all placeholder:text-slate-400'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
      </header>

      {/* --- Content List --- */}
      <main className='max-w-md mx-auto p-5 space-y-4'>
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <div
              key={index}
              className='bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group'
            >
              <div className='flex items-start justify-between gap-4 mb-2'>
                <h3 className='font-bold text-slate-800 text-lg leading-tight group-hover:text-amber-600 transition-colors'>
                  {item.title}
                </h3>
                <div className='shrink-0 bg-amber-50 text-amber-600 p-1.5 rounded-lg'>
                  <BookOpen size={16} />
                </div>
              </div>

              <p className='text-slate-600 text-sm leading-relaxed mb-4'>
                {item.content}
              </p>

              <div className='flex items-center gap-2'>
                <span className='text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wide'>
                  Dalil / Sumber
                </span>
                <span className='text-xs font-medium text-amber-600'>
                  {item.source}
                </span>
              </div>
            </div>
          ))
        ) : (
          // Empty State jika pencarian tidak ditemukan
          <div className='text-center py-20'>
            <div className='w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search size={32} />
            </div>
            <h3 className='font-bold text-slate-700'>Tidak ditemukan</h3>
            <p className='text-sm text-slate-400'>
              Coba cari dengan kata kunci lain.
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className='text-center py-8'>
          <p className='text-xs text-slate-400'>
            Menampilkan {filteredData.length} dari {fiqihRamadhanData.length}{' '}
            materi
          </p>
        </div>
      </main>
    </div>
  );
}
