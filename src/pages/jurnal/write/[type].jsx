import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Save, Feather } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { journalPrompts, moods } from '@/data/journalPrompts';

const catStyles = {
  pre_ramadhan: {
    gradient: 'from-violet-500 to-indigo-600',
    light: 'from-violet-50 to-indigo-50',
    border: 'border-violet-100',
    accent: 'text-violet-600',
    ring: 'focus:ring-violet-300',
    badge: 'bg-violet-100 text-violet-700',
    shadow: 'rgba(124,58,237,0.2)',
  },
  daily: {
    gradient: 'from-[#1e3a8a] to-indigo-700',
    light: 'from-blue-50 to-indigo-50',
    border: 'border-blue-100',
    accent: 'text-blue-700',
    ring: 'focus:ring-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    shadow: 'rgba(30,58,138,0.2)',
  },
  letting_go: {
    gradient: 'from-rose-400 to-pink-600',
    light: 'from-rose-50 to-pink-50',
    border: 'border-rose-100',
    accent: 'text-rose-600',
    ring: 'focus:ring-rose-300',
    badge: 'bg-rose-100 text-rose-700',
    shadow: 'rgba(225,29,72,0.2)',
  },
};

export default function WriteJournal() {
  const router = useRouter();
  const { type } = router.query;
  const textareaRef = useRef(null);

  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (type && journalPrompts[type]) randomizePrompt();
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    setUser(localUser);
  }, [type]);

  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
  }, [content]);

  const randomizePrompt = () => {
    const list = journalPrompts[type]?.prompts || [];
    setPrompt(list[Math.floor(Math.random() * list.length)]);
  };

  const handleSave = async () => {
    if (!content.trim() || !user || isSubmitting) return;
    setIsSubmitting(true);
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', user.personal_code)
      .single();
    const { error } = await supabase.from('journal_entries').insert({
      user_id: userData.id,
      category: type,
      title: prompt,
      content,
      mood: selectedMood,
    });
    if (!error) {
      setSaved(true);
      setTimeout(() => router.push('/jurnal'), 800);
    } else {
      setIsSubmitting(false);
    }
  };

  if (!type || !journalPrompts[type]) return null;

  const style = catStyles[type] || catStyles.daily;
  const catData = journalPrompts[type];
  const canSave = content.trim().length > 0 && !isSubmitting;

  return (
    <div className='min-h-screen bg-[#FAFAF7] flex flex-col'>
      <Head>
        <title>{catData.title} — MyRamadhan</title>
      </Head>

      {/* Ambient */}
      <div className='fixed inset-0 pointer-events-none -z-10 overflow-hidden'>
        <div
          className={`absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br ${style.light} rounded-full blur-3xl opacity-80`}
        />
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-slate-100/50 rounded-full blur-3xl' />
      </div>

      {/* ── HEADER ── */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => router.push('/jurnal')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
          >
            <ArrowLeft size={20} className='text-slate-600' />
          </button>
          <div>
            <h1 className='font-bold text-xl flex items-center gap-2 text-black'>
              Jurnal Refleksi
            </h1>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-[10px] font-bold text-black tabular-nums'>
            {wordCount} kata
          </p>
        </div>
      </header>

      <main className='flex-1 max-w-md mx-auto w-full px-5 pt-6 pb-32'>
        {/* ── MOOD SELECTOR ── */}
        <div className='mb-7'>
          <p className='text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3'>
            Mood kamu sekarang?
          </p>
          <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-hide'>
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() =>
                  setSelectedMood(m.id === selectedMood ? '' : m.id)
                }
                className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border transition-all shrink-0 ${
                  selectedMood === m.id
                    ? `bg-[#1e3a8a] border-slate-200 shadow-md scale-105`
                    : 'bg-white/50 border-slate-100 opacity-60 hover:opacity-100'
                }`}
              >
                <span className='text-xl leading-none'>{m.icon}</span>
                <span
                  className={`text-[9px] font-bold ${selectedMood === m.id ? 'text-white' : 'text-slate-400'}`}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── PROMPT CARD ── */}
        <div
          className={`relative bg-gradient-to-br ${style.light} border ${style.border} rounded-2xl p-5 mb-6`}
        >
          <div className='flex items-start justify-between gap-3'>
            <div className='flex-1'>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${style.accent} mb-2`}
              >
                Pertanyaan untukmu
              </p>
              <AnimatePresence mode='wait'>
                <motion.p
                  key={prompt}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className='text-sm font-semibold text-slate-700 leading-relaxed'
                >
                  {prompt}
                </motion.p>
              </AnimatePresence>
            </div>
            <button
              onClick={randomizePrompt}
              className='p-2 bg-white/70 rounded-xl hover:bg-white transition-colors shrink-0 mt-5'
              title='Ganti pertanyaan'
            >
              <RefreshCw size={13} className={style.accent} />
            </button>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className='flex items-center gap-3 mb-5'>
          <div className='flex-1 h-px bg-slate-100' />
          <Feather size={14} className='text-slate-300' />
          <div className='flex-1 h-px bg-slate-100' />
        </div>

        {/* ── WRITING AREA ── */}
        <div className='relative'>
          {/* Ruled lines background */}
          <div className='absolute inset-0 pointer-events-none overflow-hidden rounded-2xl'>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className='absolute w-full border-b border-slate-100'
                style={{ top: `${(i + 1) * 32}px` }}
              />
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='Tulis apa yang kamu rasakan... tidak ada yang menghakimi di sini.'
            className='relative w-full min-h-[320px] p-5 text-sm leading-8 text-slate-700 placeholder:text-slate-300 bg-white/60 border border-slate-100 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200 backdrop-blur-sm transition-all font-medium'
            autoFocus
          />
        </div>

        {/* Character encouragement */}
        <AnimatePresence>
          {content.length > 0 && content.length < 80 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='text-[11px] text-slate-400 mt-2 text-center'
            >
              Terus tulis... 🤍
            </motion.p>
          )}
          {wordCount >= 50 && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='text-[11px] text-emerald-500 font-semibold mt-2 text-center'
            >
              Kamu udah nulis {wordCount} kata. Keren banget! ✨
            </motion.p>
          )}
        </AnimatePresence>
      </main>

      {/* ── FLOATING SAVE BUTTON ── */}
      <div className='fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-[#FAFAF7] via-[#FAFAF7]/90 to-transparent'>
        <motion.button
          onClick={handleSave}
          disabled={!canSave}
          whileTap={canSave ? { scale: 0.97 } : {}}
          className={`w-full max-w-md mx-auto flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm transition-all ${
            saved
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
              : canSave
                ? `bg-gradient-to-r ${style.gradient} text-white shadow-lg`
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
          style={
            canSave && !saved
              ? { boxShadow: `0 12px 32px -8px ${style.shadow}` }
              : {}
          }
        >
          <AnimatePresence mode='wait'>
            {saved ? (
              <motion.span
                key='saved'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className='flex items-center gap-2'
              >
                ✓ Tersimpan!
              </motion.span>
            ) : (
              <motion.span
                key='save'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex items-center gap-2'
              >
                <Save size={16} />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Jurnal'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
