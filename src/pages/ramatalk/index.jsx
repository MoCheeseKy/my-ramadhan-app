import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import {
  ArrowLeft,
  Send,
  Sparkles,
  User,
  Bot,
  MessageCircle,
  Heart,
  BookOpen,
  Scale,
  ScrollText,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

dayjs.locale('id');

// DEFINISI MODE RAMATALK
const RAMATALK_MODES = [
  { id: 'ngobrol', label: 'Ngobrol', icon: MessageCircle },
  { id: 'doa', label: 'Cari Doa', icon: Heart },
  { id: 'surah', label: 'Cari Surah', icon: BookOpen },
  { id: 'fiqih', label: 'Tanya Fiqih', icon: Scale },
  { id: 'hadits', label: 'Cari Hadits', icon: ScrollText },
];

export default function RamatalkPage() {
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('ngobrol');
  const [journalContext, setJournalContext] = useState(null);
  const messagesEndRef = useRef(null);

  // Efek 1: Cek URL Parameter (Jika dilempar dari halaman lain)
  useEffect(() => {
    if (!router.isReady) return;

    const { mode, q } = router.query;

    if (mode && RAMATALK_MODES.find((m) => m.id === mode)) {
      setActiveMode(mode);
    }

    if (q) {
      setInput(q);
      // Opsional: Langsung kirim otomatis jika ada query
      // (Untuk amannya, biarkan user yang klik tombol send, jadi cukup di-set di input saja)
    }
  }, [router.isReady, router.query]);

  // Efek 2: Cek Konteks Jurnal
  useEffect(() => {
    const savedContext = sessionStorage.getItem('ramatalk_journal_context');
    if (savedContext) {
      const parsedContext = JSON.parse(savedContext);
      setJournalContext(parsedContext);

      setMessages([
        {
          id: 1,
          role: 'ai',
          text: `Halo! 👋\nAku lihat kamu baru saja menulis catatan berjudul "${parsedContext.title}". Ada yang mau diceritakan lebih lanjut tentang perasaanmu? Aku siap dengerin. 🤍`,
        },
      ]);
      sessionStorage.removeItem('ramatalk_journal_context');
    } else {
      setMessages([
        {
          id: 1,
          role: 'ai',
          text: 'Assalamualaikum! 👋\nAku Ramatalk. Mau ngobrol santai atau cari info ibadah spesifik? Pilih mode di atas dan tanyain aja ke aku!',
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMessage = { id: Date.now(), role: 'user', text: userText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const now = dayjs();
    const currentHour = now.hour();
    const greeting =
      currentHour < 11
        ? 'Pagi'
        : currentHour < 15
          ? 'Siang'
          : currentHour < 18
            ? 'Sore'
            : 'Malam';
    const ramadhanStart = dayjs('2026-02-19');
    const dayDiff = now.diff(ramadhanStart, 'day') + 1;
    const currentDay = dayDiff > 0 ? dayDiff : 0;

    try {
      const res = await fetch('/api/ramatalk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: {
            timeString: now.format('HH:mm'),
            greeting: greeting,
            day: currentDay,
            mode: activeMode, // MENGIRIM MODE KE API
            journalContext: journalContext
              ? `User baru saja menulis Jurnal: "${journalContext.title}". Isinya: "${journalContext.content}".`
              : null,
          },
        }),
      });

      const data = await res.json();
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        text: data.reply || 'Maaf, aku bingung jawabnya. Coba tanya lain? 🤔',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error Frontend:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ai',
          text: 'Yah, koneksi terputus. Cek internetmu ya.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-[#F6F9FC] flex flex-col'>
        <Head>
          <title>Ramatalk AI</title>
        </Head>

        {/* Header Utama */}
        <header className='bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 sticky top-0 z-40 flex items-center gap-3'>
          <button
            onClick={() => router.push('/')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
          >
            <ArrowLeft size={20} className='text-slate-600' />
          </button>
          <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg'>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className='font-bold text-slate-800 leading-tight'>
              Ramatalk AI
            </h1>
            <div className='flex items-center gap-1.5'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></span>
              <p className='text-xs text-slate-500 font-medium'>Online</p>
            </div>
          </div>
        </header>

        {/* Baris Pilihan Mode (Scrollable) */}
        <div className='bg-white/80 backdrop-blur-md border-b border-slate-100 py-2.5 px-4 flex gap-2 overflow-x-auto custom-scrollbar sticky top-[64px] z-30'>
          {RAMATALK_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                activeMode === mode.id
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm'
                  : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
              }`}
            >
              <mode.icon
                size={14}
                className={
                  activeMode === mode.id ? 'text-indigo-600' : 'text-slate-400'
                }
              />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Area Chat */}
        <main className='flex-1 p-4 space-y-4 pb-28 overflow-y-auto'>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100 text-indigo-600'}`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
              </div>
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className='flex items-end gap-2'>
              <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center'>
                <Bot size={18} className='text-indigo-600' />
              </div>
              <div className='bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 text-sm text-slate-400 flex gap-1'>
                <span className='animate-bounce'>.</span>
                <span
                  className='animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                >
                  .
                </span>
                <span
                  className='animate-bounce'
                  style={{ animationDelay: '0.4s' }}
                >
                  .
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Area Input */}
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-6'>
          <form
            onSubmit={handleSend}
            className='max-w-md mx-auto relative flex items-center gap-2'
          >
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ketik untuk mode ${RAMATALK_MODES.find((m) => m.id === activeMode)?.label}...`}
              className='text-slate-800 w-full bg-slate-100 border border-transparent rounded-full py-3.5 pl-5 pr-12 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-sm'
              disabled={isLoading}
            />
            <button
              type='submit'
              disabled={isLoading || !input.trim()}
              className='absolute right-2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-md'
            >
              <Send
                size={16}
                className={
                  isLoading ? 'translate-x-1 -translate-y-1 opacity-50' : ''
                }
              />
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
