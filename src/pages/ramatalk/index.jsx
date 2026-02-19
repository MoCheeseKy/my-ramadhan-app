import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ArrowLeft, Send, Sparkles, User, Bot } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

dayjs.locale('id');

export default function RamatalkPage() {
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // STATE BARU: Untuk menyimpan data jurnal dari halaman sebelah
  const [journalContext, setJournalContext] = useState(null);

  const messagesEndRef = useRef(null);

  // LOGIKA BARU: Cek sessionStorage saat halaman pertama kali dibuka
  useEffect(() => {
    const savedContext = sessionStorage.getItem('ramatalk_journal_context');

    if (savedContext) {
      const parsedContext = JSON.parse(savedContext);
      setJournalContext(parsedContext);

      // Ramatalk memulai percakapan secara empatik berdasarkan Jurnal
      setMessages([
        {
          id: 1,
          role: 'ai',
          text: `Halo! 👋\nAku lihat kamu baru saja menulis catatan berjudul "${parsedContext.title}". Ada yang mau diceritakan lebih lanjut tentang perasaanmu? Aku di sini siap dengerin. 🤍`,
        },
      ]);

      // Hapus data dari storage agar tidak muncul lagi saat di-refresh
      sessionStorage.removeItem('ramatalk_journal_context');
    } else {
      // Sapaan normal jika user langsung membuka Ramatalk
      setMessages([
        {
          id: 1,
          role: 'ai',
          text: 'Assalamualaikum! 👋\nAku Ramatalk. Ada yang mau diceritain atau ditanyain seputar Ramadhan? Aku siap dengerin. 🤍',
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
            // LOGIKA BARU: Kirim konteks jurnal ke API Groq jika ada
            journalContext: journalContext
              ? `User baru saja menulis Jurnal: "${journalContext.title}". Isinya: "${journalContext.content}". (Kategori: ${journalContext.category}, Mood: ${journalContext.mood}).`
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

        {/* Header */}
        <header className='bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 sticky top-0 z-40 flex items-center gap-3'>
          <button
            onClick={() => router.push('/')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100'
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

        {/* Chat Area */}
        <main className='flex-1 p-4 space-y-4 pb-24 overflow-y-auto'>
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
                className={`max-w-[80%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}
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
              <div className='bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 text-sm text-slate-400'>
                Sedang mengetik...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-6'>
          <form
            onSubmit={handleSend}
            className='max-w-md mx-auto relative flex items-center gap-2'
          >
            <input
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Tulis pesan...'
              className='text-black w-full bg-slate-100 border-none rounded-full py-3.5 pl-5 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none'
              disabled={isLoading}
            />
            <button
              type='submit'
              disabled={isLoading || !input.trim()}
              className='absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50'
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
