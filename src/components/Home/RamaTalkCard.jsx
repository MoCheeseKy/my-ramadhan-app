'use client';

import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';

/**
 * RamaTalkCard — CTA card menuju fitur AI chat RamaTalk.
 */
const RamaTalkCard = () => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push('/ramatalk')}
      className='relative rounded-[2rem] p-6 md:p-7 lg:p-7 overflow-hidden text-white bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95] shadow-[0_25px_50px_-15px_rgba(79,70,229,0.5)] transition-all duration-500 hover:-translate-y-1 group cursor-pointer h-full flex flex-col justify-center'
    >
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(255,255,255,0.12),transparent_65%)]' />
      <div className='absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none' />

      <div className='relative z-10'>
        <div className='flex items-center gap-2 mb-4'>
          <Sparkles size={16} className='text-indigo-200' />
          <p className='text-[10px] md:text-xs lg:text-xs uppercase tracking-[0.3em] text-indigo-200 font-bold'>
            Ramatalk AI
          </p>
        </div>
        <h3 className='text-xl md:text-2xl lg:text-2xl font-bold bg-gradient-to-b from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-2'>
          Tanya Seputar Ibadah
        </h3>
        <p className='text-sm text-indigo-100/80 leading-relaxed'>
          Butuh penjelasan fiqih atau hukum puasa? Ramatalk siap membantu 🤍
        </p>
      </div>
    </div>
  );
};

export default RamaTalkCard;
