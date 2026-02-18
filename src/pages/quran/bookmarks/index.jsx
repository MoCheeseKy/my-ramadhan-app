import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cek User Login
    const localUser = JSON.parse(localStorage.getItem('myRamadhan_user'));
    if (!localUser) {
      router.push('/login');
      return;
    }
    setUser(localUser);
    fetchBookmarks(localUser.personal_code);
  }, []);

  const fetchBookmarks = async (personalCode) => {
    try {
      setLoading(true);

      // 1. Ambil User ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('personal_code', personalCode)
        .single();

      if (!userData) return;

      // 2. Ambil Data Bookmark
      const { data: bookmarkData, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false }); // Terbaru di atas

      if (error) throw error;

      // 3. Kita butuh Nama Surat untuk setiap bookmark.
      // Karena tabel bookmark cuma simpan nomor surat, kita perlu fetch data surat dari API
      // atau mapping manual. Untuk efisiensi, kita fetch list surat sekali saja.
      const res = await fetch('https://equran.id/api/v2/surat');
      const quranData = await res.json();
      const surahMap = {};
      quranData.data.forEach((s) => {
        surahMap[s.nomor] = s;
      });

      // 4. Gabungkan Data
      const enrichedBookmarks = bookmarkData.map((b) => ({
        ...b,
        surahDetails: surahMap[b.surah_number],
      }));

      setBookmarks(enrichedBookmarks);
      setLoading(false);
    } catch (error) {
      console.error('Gagal memuat bookmark:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Mencegah klik card saat klik tombol hapus
    if (!confirm('Hapus bookmark ini?')) return;

    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);

      if (error) throw error;

      // Update UI
      setBookmarks((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert('Gagal menghapus bookmark');
    }
  };

  // Navigasi ke Ayat
  const goToAyah = (surahNum, ayahNum) => {
    // Kita arahkan ke mode baca Surah, lalu scroll ke ayat terkait
    router.push(`/quran/surah/${surahNum}#ayat-${ayahNum}`);
  };

  return (
    <div className='min-h-screen bg-[#F6F9FC] text-slate-800 pb-20 selection:bg-blue-200'>
      <Head>
        <title>Bookmarks - MyRamadhan</title>
      </Head>

      {/* Header */}
      <header className='sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center gap-4'>
        <button
          onClick={() => router.back()}
          className='p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors'
        >
          <ArrowLeft size={20} className='text-slate-600' />
        </button>
        <h1 className='font-bold text-lg'>Bookmark Saya</h1>
      </header>

      <main className='max-w-md mx-auto p-5'>
        {loading ? (
          // Loading State
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='h-24 bg-white rounded-2xl animate-pulse'
              />
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          // Empty State
          <div className='text-center py-20'>
            <div className='w-16 h-16 bg-blue-50 text-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4'>
              <Bookmark size={32} />
            </div>
            <h3 className='font-bold text-slate-700 mb-1'>Belum ada penanda</h3>
            <p className='text-sm text-slate-400'>
              Tandai ayat favoritmu saat membaca Al-Qur{"'"}an agar muncul di
              sini.
            </p>
          </div>
        ) : (
          // List Bookmarks
          <div className='space-y-3'>
            {bookmarks.map((item) => (
              <div
                key={item.id}
                onClick={() => goToAyah(item.surah_number, item.ayah_number)}
                className='bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group relative overflow-hidden'
              >
                <div className='flex justify-between items-start'>
                  <div className='flex items-start gap-4'>
                    {/* Nomor Surat Badge */}
                    <div className='w-10 h-10 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center font-bold text-sm shrink-0'>
                      {item.surah_number}
                    </div>

                    <div>
                      <h3 className='font-bold text-slate-800 text-lg'>
                        {item.surahDetails
                          ? item.surahDetails.namaLatin
                          : `Surat ${item.surah_number}`}
                      </h3>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md'>
                          Ayat {item.ayah_number}
                        </span>
                        <span className='text-[10px] text-slate-400'>
                          {new Date(item.created_at).toLocaleDateString(
                            'id-ID',
                            { day: 'numeric', month: 'short' },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className='p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
