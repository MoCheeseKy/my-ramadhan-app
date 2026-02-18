import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  ArrowLeft,
  Bookmark,
  Highlighter,
  MoreVertical,
  BookOpen,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function JuzDetail() {
  const router = useRouter();
  const { number } = router.query; // Nomor Juz

  const [juzData, setJuzData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [user, setUser] = useState(null);

  // 1. Fetch Data Juz (Arab & Indo) + User Data
  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    setUser(localUser);

    if (number) {
      fetchJuzData(number);
    }
  }, [number]);

  // 2. Fetch User Interactions (Bookmark/Highlight) setelah data Juz ada
  useEffect(() => {
    if (juzData && user) {
      fetchUserInteractions();
    }
  }, [juzData, user]);

  const fetchJuzData = async (juzNum) => {
    try {
      setLoading(true);
      // Kita fetch 2 data: Teks Arab & Terjemahan Indonesia
      const [resArab, resIndo] = await Promise.all([
        fetch(`http://api.alquran.cloud/v1/juz/${juzNum}/quran-uthmani`),
        fetch(`http://api.alquran.cloud/v1/juz/${juzNum}/id.indonesian`),
      ]);

      const dataArab = await resArab.json();
      const dataIndo = await resIndo.json();

      if (!dataArab.data || !dataIndo.data)
        throw new Error('Gagal mengambil data');

      // Gabungkan data (Merge)
      const mergedVerses = dataArab.data.ayahs.map((ayah, index) => ({
        ...ayah, // Data Arab (text, number, surah, dll)
        translation: dataIndo.data.ayahs[index].text, // Tambahkan terjemahan
      }));

      // Buat Info Start (Mulai dari surat apa)
      const firstAyah = mergedVerses[0];
      const startInfo = `${firstAyah.surah.englishName} Ayat ${firstAyah.numberInSurah}`;

      setJuzData({
        number: juzNum,
        juzStartInfo: startInfo,
        verses: mergedVerses,
      });

      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil data juz', err);
      setLoading(false);
    }
  };

  const fetchUserInteractions = async () => {
    if (!juzData || !user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', user.personal_code)
      .single();

    if (!userData) return;
    const userId = userData.id;

    // Ambil daftar unik ID Surat di Juz ini
    const uniqueSurahIds = [
      ...new Set(juzData.verses.map((v) => v.surah.number)),
    ];

    // Fetch Bookmarks
    const { data: bData } = await supabase
      .from('bookmarks')
      .select('surah_number, ayah_number')
      .eq('user_id', userId)
      .in('surah_number', uniqueSurahIds);

    // Fetch Highlights
    const { data: hData } = await supabase
      .from('highlights')
      .select('surah_number, ayah_number')
      .eq('user_id', userId)
      .in('surah_number', uniqueSurahIds);

    setBookmarks(
      bData ? bData.map((b) => `${b.surah_number}-${b.ayah_number}`) : [],
    );
    setHighlights(
      hData ? hData.map((h) => `${h.surah_number}-${h.ayah_number}`) : [],
    );
  };

  // --- HANDLERS ---
  const toggleInteraction = async (type, verse) => {
    if (!user) return;
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('personal_code', user.personal_code)
      .single();
    const userId = userData.id;

    const surahNum = verse.surah.number;
    const ayahNum = verse.numberInSurah; // Perhatikan: API ini pakai 'numberInSurah'
    const key = `${surahNum}-${ayahNum}`;

    const matchCriteria = {
      user_id: userId,
      surah_number: surahNum,
      ayah_number: ayahNum,
    };

    if (type === 'bookmark') {
      if (bookmarks.includes(key)) {
        await supabase.from('bookmarks').delete().match(matchCriteria);
        setBookmarks((prev) => prev.filter((k) => k !== key));
      } else {
        await supabase.from('bookmarks').insert(matchCriteria);
        setBookmarks((prev) => [...prev, key]);
      }
    } else if (type === 'highlight') {
      if (highlights.includes(key)) {
        await supabase.from('highlights').delete().match(matchCriteria);
        setHighlights((prev) => prev.filter((k) => k !== key));
      } else {
        await supabase
          .from('highlights')
          .insert({ ...matchCriteria, color: 'yellow' });
        setHighlights((prev) => [...prev, key]);
      }
    }
  };

  if (loading || !juzData)
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#F6F9FC]'>
        <div className='animate-pulse flex flex-col items-center'>
          <BookOpen className='text-blue-200 mb-4' size={48} />
          <p className='text-slate-400 font-medium'>
            Menyiapkan Juz {number}...
          </p>
        </div>
      </div>
    );

  let currentSurahNumber = 0;

  return (
    <div className='min-h-screen bg-white pb-20'>
      <Head>
        <title>Juz {number} - MyRamadhan</title>
      </Head>

      {/* Sticky Header */}
      <header className='sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm'>
        <button
          onClick={() => router.push('/quran')}
          className='p-2 -ml-2 rounded-full hover:bg-slate-100'
        >
          <ArrowLeft size={20} className='text-slate-600' />
        </button>
        <div className='text-center'>
          <h1 className='font-bold text-slate-800'>Juz {number}</h1>
          <p className='text-[10px] text-slate-500 font-medium tracking-widest uppercase'>
            Mulai dari {juzData.juzStartInfo}
          </p>
        </div>
        <button className='p-2 -mr-2 rounded-full hover:bg-slate-100'>
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Render Ayat */}
      <div className='max-w-2xl mx-auto'>
        {juzData.verses.map((verse, index) => {
          const surahNum = verse.surah.number;
          const ayahNum = verse.numberInSurah;
          const key = `${surahNum}-${ayahNum}`;

          const isBookmarked = bookmarks.includes(key);
          const isHighlighted = highlights.includes(key);

          const isNewSurah = surahNum !== currentSurahNumber;
          if (isNewSurah) {
            currentSurahNumber = surahNum;
          }

          return (
            <React.Fragment key={index}>
              {/* HEADER SURAH BARU */}
              {isNewSurah && (
                <div className='mt-12 mb-8 text-center px-6 animate-fadeUp'>
                  <div className='inline-block px-4 py-1 bg-blue-50 text-[#1e3a8a] rounded-full text-xs font-bold mb-3 border border-blue-100'>
                    Surat ke-{surahNum}
                  </div>
                  <h2 className='text-2xl font-bold text-slate-800 mb-1'>
                    {verse.surah.englishName}
                  </h2>
                  <p className='text-[#1e3a8a] text-sm'>
                    {verse.surah.englishNameTranslation}
                  </p>

                  {/* Bismillah (Kecuali At-Taubah/Surat 9 & Al-Fatihah/1 krn sudah ada di ayat 1) */}
                  {surahNum !== 9 &&
                    surahNum !== 1 &&
                    verse.numberInSurah === 1 && (
                      <img
                        src='https://upload.wikimedia.org/wikipedia/commons/2/27/Basmala.svg'
                        alt='Bismillah'
                        className='h-10 mx-auto mt-6 opacity-60'
                      />
                    )}
                  <div className='h-px w-24 bg-slate-200 mx-auto mt-6'></div>
                </div>
              )}

              {/* ITEM AYAT */}
              <div
                id={`ayat-${key}`}
                className={`p-6 border-b border-slate-50 transition-colors duration-500
                  ${isHighlighted ? 'bg-[#1e3a8a]' : 'bg-white'}
                `}
              >
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`${isHighlighted ? 'bg-white text-[#1e3a8a]' : 'bg-[#1e3a8a] text-white'} w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium`}
                    >
                      {ayahNum}
                    </div>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => toggleInteraction('bookmark', verse)}
                        className={`p-1.5 rounded-full transition-all ${isBookmarked ? 'bg-blue-100 text-[#1e3a8a]' : isHighlighted ? 'text-white hover:text-[#1e3a8a] hover:bg-slate-100' : 'text-black hover:text-[#1e3a8a] hover:bg-slate-100'}`}
                      >
                        <Bookmark
                          size={16}
                          fill={isBookmarked ? 'currentColor' : 'none'}
                        />
                      </button>
                      <button
                        onClick={() => toggleInteraction('highlight', verse)}
                        className={`p-1.5 rounded-full transition-all ${isHighlighted ? 'bg-blue-100 text-[#1e3a8a]' : 'text-black hover:text-[#1e3a8a] hover:bg-slate-100'}`}
                      >
                        <Highlighter size={16} />
                      </button>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold ${isHighlighted ? 'text-white' : 'text-[#1e3a8a]'}`}
                  >
                    {verse.surah.englishName}
                  </span>
                </div>

                {/* Teks Arab */}
                <div dir='rtl' className='mb-6 w-full'>
                  <p
                    className={`text-2xl md:text-3xl font-amiri ${isHighlighted ? 'text-white' : 'text-slate-800'}`}
                  >
                    {verse.text}
                  </p>
                </div>

                {/* Terjemahan */}
                <div className='text-left space-y-2'>
                  <p
                    className={`text-slate-600 text-sm leading-relaxed ${isHighlighted ? 'text-white' : 'text-slate-800'}`}
                  >
                    {verse.translation}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Navigasi Next Juz */}
        <div className='p-8 text-center'>
          <button
            onClick={() => router.push(`/quran/juz/${parseInt(number) + 1}`)}
            className='bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={parseInt(number) >= 30}
          >
            Lanjut ke Juz {parseInt(number) + 1}
          </button>
        </div>
      </div>
    </div>
  );
}
