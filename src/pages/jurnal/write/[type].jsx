import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { journalPrompts, moods } from '@/data/journalPrompts';

export default function WriteJournal() {
  const router = useRouter();
  const { type } = router.query; // 'pre_ramadhan', 'letting_go', dll

  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Load Prompt Otomatis
  useEffect(() => {
    if (type && journalPrompts[type]) {
      randomizePrompt();
    }
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    setUser(localUser);
  }, [type]);

  const randomizePrompt = () => {
    const list = journalPrompts[type].prompts;
    const random = list[Math.floor(Math.random() * list.length)];
    setPrompt(random);
  };

  const handleSave = async () => {
    if (!content.trim() || !user) return;
    setIsSubmitting(true);

    // 1. Get User ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', user.personal_code)
      .single();

    // 2. Insert Journal
    const { error } = await supabase.from('journal_entries').insert({
      user_id: userData.id,
      category: type,
      title: prompt, // Kita simpan pertanyaan sebagai judul
      content: content,
      mood: selectedMood,
    });

    if (!error) {
      router.push('/jurnal');
    } else {
      alert('Gagal menyimpan jurnal');
      setIsSubmitting(false);
    }
  };

  if (!type) return null;

  return (
    <div className='min-h-screen bg-white pb-20'>
      <Head>
        <title>Menulis - MyRamadhan</title>
      </Head>

      {/* Header Minimalis */}
      <header className='sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-50 px-6 py-4 flex justify-between items-center z-10'>
        <button
          onClick={() => router.back()}
          className='p-2 -ml-2 hover:bg-slate-50 rounded-full'
        >
          <ArrowLeft size={20} className='text-slate-400' />
        </button>
        <span className='text-xs font-bold uppercase tracking-widest text-slate-300'>
          {journalPrompts[type].title}
        </span>
        <div className='w-8' />
      </header>

      <main className='max-w-md mx-auto px-6 py-8'>
        {/* --- MOOD SELECTOR --- */}
        <div className='mb-8 overflow-x-auto pb-2 scrollbar-hide'>
          <p className='text-sm text-slate-400 font-medium mb-3 text-center'>
            Apa mood kamu saat ini?
          </p>
          <div className='flex justify-center gap-3 min-w-max px-2'>
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${selectedMood === m.id ? 'bg-indigo-50 border-indigo-200 scale-110 shadow-sm' : 'hover:bg-slate-50 border border-transparent grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
              >
                <span className='text-2xl'>{m.icon}</span>
                <span
                  className={`text-[10px] font-bold ${selectedMood === m.id ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* --- PROMPT CARD --- */}
        <div className='bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[2rem] mb-6 relative group border border-indigo-100/50'>
          <button
            onClick={randomizePrompt}
            className='absolute top-4 right-4 p-2 bg-white/50 rounded-full text-indigo-400 hover:bg-white hover:text-indigo-600 transition-all shadow-sm'
            title='Ganti Pertanyaan'
          >
            <RefreshCw size={14} />
          </button>

          <p className='text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2'>
            Refleksi Hari Ini
          </p>
          <h2 className='text-xl font-bold text-slate-800 leading-relaxed'>
            "{prompt}"
          </h2>
        </div>

        {/* --- WRITING AREA --- */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Tulis apa yang kamu rasakan... Tidak ada yang akan menghakimimu di sini.'
          className='w-full h-64 p-0 text-lg leading-relaxed text-slate-700 placeholder:text-slate-300 border-none focus:ring-0 resize-none font-medium bg-transparent p-6 outline-[#1e3a8a] focus:outline-2 focus:outline-offset-2 rounded-[2rem] mb-6'
          autoFocus
        />

        {/* --- FLOATING ACTION BUTTON --- */}
        <div className='fixed bottom-8 left-0 right-0 px-6 flex justify-center'>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !content}
            className={`
               flex items-center gap-2 px-8 py-4 rounded-full font-bold shadow-xl shadow-indigo-200 transition-all
               ${isSubmitting || !content ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:scale-105 active:scale-95'}
             `}
          >
            <Save size={18} />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Jurnal'}
          </button>
        </div>
      </main>
    </div>
  );
}
