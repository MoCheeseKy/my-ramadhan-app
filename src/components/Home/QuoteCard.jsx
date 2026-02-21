'use client';

import { RefreshCw, Quote } from 'lucide-react';

/**
 * QuoteCard — menampilkan kutipan islami acak harian.
 * Tombol refresh mengacak ulang kutipan (animasi spin saat loading).
 */
const QuoteCard = ({ quote, isSpinning, onRefresh }) => (
  <div className='relative rounded-[2rem] p-6 md:p-7 lg:p-7 overflow-hidden text-white bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95] shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)] transition-all duration-500 hover:-translate-y-1 group h-full flex flex-col justify-center'>
    <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.15),transparent_65%)]' />
    <div className='absolute -top-16 -left-16 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl animate-pulse pointer-events-none' />

    <div className='relative z-10'>
      <div className='flex justify-between items-start mb-4'>
        <p className='text-[10px] md:text-xs lg:text-xs uppercase tracking-[0.3em] text-indigo-200 font-bold mt-1.5'>
          Quote of the Day
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          className={`p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-indigo-200 hover:text-white ${isSpinning ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <p className='text-lg md:text-xl lg:text-xl leading-relaxed font-medium bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent min-h-[4rem]'>
        {'"'}
        {quote.text}
        {'"'}
      </p>

      <div className='mt-5 flex items-center justify-between'>
        <p className='text-xs text-indigo-200/70 font-medium max-w-[70%]'>
          {quote.source}
        </p>
        <Quote size={40} className='text-white/5 opacity-50 shrink-0' />
      </div>
    </div>
  </div>
);

export default QuoteCard;
