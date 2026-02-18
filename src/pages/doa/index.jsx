import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Search, HeartHandshake, Copy, Check } from 'lucide-react';
import { doaRamadhanData } from '@/data/doa';

export default function DoaPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Filter Logic
  const filteredData = doaRamadhanData.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.translation.toLowerCase().includes(query)
    );
  });

  // Copy to Clipboard Function
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); // Reset icon setelah 2 detik
  };

  return (
    <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-rose-200'>
      <Head>
        <title>Kumpulan Doa - MyRamadhan</title>
      </Head>

      {/* --- Sticky Header --- */}
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
              <HeartHandshake size={24} className='text-rose-500' />
              Doa-Doa Pilihan
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
            placeholder='Cari doa (contoh: berbuka, ampunan)...'
            className='w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-rose-400 outline-none text-sm transition-all placeholder:text-slate-400'
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
              className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative'
            >
              {/* Judul & Copy Button */}
              <div className='flex justify-between items-start mb-4'>
                <h3 className='font-bold text-slate-800 text-lg group-hover:text-rose-600 transition-colors'>
                  {item.title}
                </h3>
                <button
                  onClick={() =>
                    handleCopy(
                      `${item.title}\n\n${item.arabic}\n\n${item.translation}`,
                      index,
                    )
                  }
                  className='p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all'
                  title='Salin Doa'
                >
                  {copiedIndex === index ? (
                    <Check size={18} className='text-emerald-500' />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>

              {/* Arabic Text */}
              <div dir='rtl' className='mb-4 w-full'>
                <p className='font-amiri text-2xl leading-[2.2] text-slate-800 text-right'>
                  {item.arabic}
                </p>
              </div>

              {/* Translation */}
              <p className='text-slate-600 text-sm leading-relaxed mb-3 italic'>
                "{item.translation}"
              </p>

              {/* Source Badge */}
              <div className='flex justify-end'>
                <span className='text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-md uppercase tracking-wide'>
                  {item.source}
                </span>
              </div>
            </div>
          ))
        ) : (
          // Empty State
          <div className='text-center py-20'>
            <div className='w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search size={32} />
            </div>
            <h3 className='font-bold text-slate-700'>Tidak ditemukan</h3>
            <p className='text-sm text-slate-400'>Coba kata kunci lain.</p>
          </div>
        )}

        <div className='text-center py-8'>
          <p className='text-xs text-slate-400'>
            Menampilkan {filteredData.length} dari {doaRamadhanData.length} doa
          </p>
        </div>
      </main>
    </div>
  );
}
