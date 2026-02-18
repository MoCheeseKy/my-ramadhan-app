import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Clock, Tag, Share2, CheckCircle } from 'lucide-react';
import { studyMaterials } from '@/data/studyMaterials'; // Import data

export default function StudyDetail() {
  const router = useRouter();
  const { day } = router.query;
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    if (day) {
      // Cari materi berdasarkan hari
      const found = studyMaterials.find((m) => m.day === parseInt(day));
      setMaterial(found);
    }
  }, [day]);

  if (!day) return null; // Loading state simple

  if (!material)
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#F6F9FC]'>
        <div className='text-center'>
          <h2 className='font-bold text-slate-800'>Materi belum tersedia 🚧</h2>
          <button
            onClick={() => router.back()}
            className='mt-4 text-blue-600 font-bold text-sm'
          >
            Kembali
          </button>
        </div>
      </div>
    );

  return (
    <div className='min-h-screen bg-white pb-20 selection:bg-amber-100'>
      <Head>
        <title>{material.title} - MyRamadhan</title>
      </Head>

      {/* --- HEADER IMAGE & NAV --- */}
      <div className='relative h-64 bg-indigo-900 rounded-b-[3rem] overflow-hidden shadow-xl shadow-indigo-100'>
        {/* Abstract Background Decoration */}
        <div className='absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95]' />
        <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2' />

        {/* Navigation */}
        <div className='absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white z-10'>
          <button
            onClick={() => router.back()}
            className='w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all'
          >
            <ArrowLeft size={20} />
          </button>
          <span className='font-bold text-xs tracking-widest uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full'>
            Day {material.day}
          </span>
          <button className='w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all'>
            <Share2 size={18} />
          </button>
        </div>

        {/* Title Content */}
        <div className='absolute bottom-0 left-0 right-0 p-8 pb-12 z-10'>
          <div className='flex items-center gap-3 mb-3'>
            <span className='flex items-center gap-1 bg-amber-400/90 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md'>
              <Tag size={10} /> {material.category}
            </span>
            <span className='flex items-center gap-1 text-indigo-100 text-[10px]'>
              <Clock size={10} /> {material.readTime} baca
            </span>
          </div>
          <h1 className='text-2xl font-bold text-white leading-tight'>
            {material.title}
          </h1>
        </div>
      </div>

      {/* --- CONTENT BODY --- */}
      <main className='max-w-md mx-auto px-6 -mt-6 relative z-20'>
        <div className='bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 min-h-[400px] text-black'>
          {/* Article Text */}
          <article className='prose prose-slate prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-800'>
            {material.content.map((paragraph, idx) => (
              <p key={idx} className='mb-4 text-[15px]'>
                {/* Parse simple markdown bolding **text** */}
                {paragraph
                  .split('**')
                  .map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
                  )}
              </p>
            ))}
          </article>

          {/* Quran/Hadith Quote Box */}
          <div className='my-8 relative bg-indigo-50 rounded-2xl p-6 border border-indigo-100'>
            <div className='absolute -top-3 left-6 bg-[#1e3a8a] text-white p-1.5 rounded-lg shadow-sm'>
              <span className='text-xl leading-none'>❝</span>
            </div>
            <p className='text-[#1e3a8a] font-medium text-lg leading-relaxed italic mb-3 pt-3'>
              {material.quran.text}
            </p>
            <p className='text-[#1e3a8a] text-xs font-bold uppercase tracking-wider text-right'>
              — {material.quran.source}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.back()}
            className='w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200'
          >
            <CheckCircle size={18} className='text-emerald-400' />
            Alhamdulillah, Selesai
          </button>
        </div>
      </main>
    </div>
  );
}
