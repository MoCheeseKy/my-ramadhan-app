import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft, Bookmark, Highlighter, Moon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SurahDetail() {
  const router = useRouter();
  const { number } = router.query;

  const [surah, setSurah] = useState(null);
  const [bookmarks, setBookmarks] = useState([]); // List ID ayat yang dibookmark
  const [highlights, setHighlights] = useState([]); // List ID ayat yang dihighlight
  const [user, setUser] = useState(null);

  // 1. Fetch Data Surah & User Data
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    setUser(localUser);

    if (number && localUser) {
      fetchSurahData(number);
      fetchUserInteractions(localUser.personal_code, number); // Kita cari user_id by personal_code nanti di backend, atau simpan user_id di local
    }
  }, [number]);

  // Fetch API Al-Qur'an
  const fetchSurahData = async (num) => {
    try {
      const res = await fetch(`https://equran.id/api/v2/surat/${num}`);
      const data = await res.json();
      setSurah(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Bookmarks & Highlights dari Supabase
  const fetchUserInteractions = async (personalCode, surahNum) => {
    // Cari User ID dulu (Sebaiknya user_id disimpan saat login agar hemat request)
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', personalCode)
      .single();

    if (userData) {
      const userId = userData.id;

      // Get Bookmarks
      const { data: bData } = await supabase
        .from('bookmarks')
        .select('ayah_number')
        .eq('user_id', userId)
        .eq('surah_number', surahNum);
      setBookmarks(bData.map((b) => b.ayah_number));

      // Get Highlights
      const { data: hData } = await supabase
        .from('highlights')
        .select('ayah_number')
        .eq('user_id', userId)
        .eq('surah_number', surahNum);
      setHighlights(hData.map((h) => h.ayah_number));
    }
  };

  // --- HANDLERS ---
  const toggleBookmark = async (ayahNum) => {
    if (!user) return;
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', user.personal_code)
      .single();
    const userId = userData.id;

    if (bookmarks.includes(ayahNum)) {
      // Remove
      await supabase
        .from('bookmarks')
        .delete()
        .match({ user_id: userId, surah_number: number, ayah_number: ayahNum });
      setBookmarks((prev) => prev.filter((n) => n !== ayahNum));
    } else {
      // Add
      await supabase.from('bookmarks').insert({
        user_id: userId,
        surah_number: number,
        ayah_number: ayahNum,
      });
      setBookmarks((prev) => [...prev, ayahNum]);
    }
  };

  const toggleHighlight = async (ayahNum) => {
    if (!user) return;
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', user.personal_code)
      .single();
    const userId = userData.id;

    if (highlights.includes(ayahNum)) {
      // Remove
      await supabase
        .from('highlights')
        .delete()
        .match({ user_id: userId, surah_number: number, ayah_number: ayahNum });
      setHighlights((prev) => prev.filter((n) => n !== ayahNum));
    } else {
      // Add
      await supabase.from('highlights').insert({
        user_id: userId,
        surah_number: number,
        ayah_number: ayahNum,
        color: 'yellow',
      });
      setHighlights((prev) => [...prev, ayahNum]);
    }
  };

  if (!surah)
    return (
      <div className='min-h-screen bg-[#1e3a8a] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-6'>
          {/* Moon spinner */}
          <div className='relative'>
            <div className='absolute inset-0 bg-blue-400/20 blur-xl rounded-full scale-150' />
            <Moon
              size={42}
              className='text-white animate-spin [animation-duration:2.5s]'
            />
          </div>

          <p className='text-blue-200 text-sm tracking-wide'>
            Menyiapkan perjalanan Ramadhanmu...
          </p>
        </div>
      </div>
    );

  return (
    <div className='min-h-screen bg-white pb-20'>
      <Head>
        <title>{surah.namaLatin} - MyRamadhan</title>
      </Head>

      {/* Header Sticky */}
      <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm'>
        <button
          onClick={() => router.push('/quran')}
          className='p-2 -ml-2 rounded-full hover:bg-slate-100'
        >
          <ArrowLeft size={20} className='text-slate-600' />
        </button>
        <div className='text-center'>
          <h1 className='font-bold text-slate-800'>{surah.namaLatin}</h1>
          <p className='text-[10px] text-black font-medium tracking-widest uppercase'>
            {surah.tempatTurun} • {surah.jumlahAyat} Ayat
          </p>
        </div>
        <button className='p-2 -mr-2 rounded-full hover:bg-slate-100'>
          {/* <MoreVertical size={20} /> */}
        </button>
      </header>

      {/* Bismillah */}
      <div className='text-center py-8 bg-[#F6F9FC]'>
        <img
          src='https://upload.wikimedia.org/wikipedia/commons/2/27/Basmala.svg'
          alt='Bismillah'
          className='h-12 mx-auto opacity-70'
        />
      </div>

      {/* List Ayat */}
      <div className='max-w-2xl mx-auto'>
        {surah.ayat.map((ayat) => {
          const isBookmarked = bookmarks.includes(ayat.nomorAyat);
          const isHighlighted = highlights.includes(ayat.nomorAyat);

          return (
            <div
              key={ayat.nomorAyat}
              id={`ayat-${ayat.nomorAyat}`}
              className={`p-6 border-b border-slate-50 transition-colors duration-500
                ${isHighlighted ? 'bg-[#1e3a8a] text-white' : 'bg-white'}
              `}
            >
              {/* Action Bar (Nomor & Tools) */}
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <span
                    className={`${isHighlighted ? 'bg-white text-[#1e3a8a]' : 'bg-[#1e3a8a] text-white'} w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium`}
                  >
                    {ayat.nomorAyat}
                  </span>
                  {/* Tools */}
                  <div className='flex gap-1'>
                    <button
                      onClick={() => toggleBookmark(ayat.nomorAyat)}
                      className={`p-1.5 rounded-full transition-all ${isBookmarked ? 'bg-blue-100 text-[#1e3a8a]' : isHighlighted ? 'text-white hover:text-[#1e3a8a] hover:bg-slate-100' : 'text-black hover:text-[#1e3a8a] hover:bg-slate-100'}`}
                    >
                      <Bookmark
                        size={16}
                        fill={isBookmarked ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button
                      onClick={() => toggleHighlight(ayat.nomorAyat)}
                      className={`p-1.5 rounded-full transition-all ${isHighlighted ? 'bg-white text-[#1e3a8a]' : 'text-black hover:text-[#1e3a8a] hover:bg-slate-100'}`}
                    >
                      <Highlighter size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Teks Arab */}
              <div dir='rtl' className='mb-6 w-full'>
                <p
                  className={`text-2xl md:text-3xl font-amiri ${isHighlighted ? 'text-white' : 'text-slate-800'}`}
                >
                  {ayat.teksArab}
                </p>
              </div>

              {/* Terjemahan */}
              <div className='text-left space-y-2'>
                <p
                  className={`text-slate-600 text-sm leading-relaxed ${isHighlighted ? 'text-white' : 'text-slate-800'}`}
                >
                  {ayat.teksIndonesia}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
