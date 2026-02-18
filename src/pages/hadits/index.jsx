import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Search, ScrollText, Share2, Check } from 'lucide-react';
import { haditsRamadhanData } from '@/data/hadist';

export default function HaditsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Filter Logic
  const filteredData = haditsRamadhanData.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  });

  // Share/Copy Function
  const handleShare = async (item, index) => {
    const text = `*${item.title}*\n\n"${item.content}"\n\n(${item.source})`;

    // Jika di HP dan support Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: text,
        });
      } catch (err) {
        // Fallback ke copy clipboard
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } else {
      // Fallback ke copy clipboard (Desktop)
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-emerald-200'>
      <Head>
        <title>Hadits Pilihan - MyRamadhan</title>
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
              <ScrollText size={24} className='text-emerald-600' />
              Hadits Shahih
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
            placeholder='Cari hadits (contoh: sabar, pahala)...'
            className='w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-sm transition-all placeholder:text-slate-400'
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
              className='bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden'
            >
              {/* Dekorasi Background */}
              <div className='absolute top-0 right-0 p-4 opacity-5 pointer-events-none'>
                <ScrollText size={64} className='text-emerald-600' />
              </div>

              {/* Judul & Share Button */}
              <div className='flex justify-between items-start mb-3 relative z-10'>
                <h3 className='font-bold text-slate-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors pr-8'>
                  {item.title}
                </h3>
                <button
                  onClick={() => handleShare(item, index)}
                  className='p-2 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all shrink-0'
                  title='Bagikan Hadits'
                >
                  {copiedIndex === index ? (
                    <Check size={18} className='text-emerald-500' />
                  ) : (
                    <Share2 size={18} />
                  )}
                </button>
              </div>

              {/* Isi Hadits */}
              <div className='relative z-10 pl-4 border-l-4 border-emerald-100 mb-4'>
                <p className='text-slate-700 font-medium italic text-[15px] leading-relaxed'>
                  "{item.content}"
                </p>
              </div>

              {/* Source Badge */}
              <div className='flex justify-end relative z-10'>
                <span className='text-[10px] font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full uppercase tracking-wide border border-emerald-100'>
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
            Menampilkan {filteredData.length} dari {haditsRamadhanData.length}{' '}
            hadits
          </p>
        </div>
      </main>
    </div>
  );
}
