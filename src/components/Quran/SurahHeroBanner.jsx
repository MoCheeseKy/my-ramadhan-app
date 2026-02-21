'use client';

/**
 * SurahHeroBanner — kartu dekoratif di bagian atas SurahReader.
 * Menampilkan nama Arab, nama Latin, arti, tempat turun, dan basmalah.
 *
 * @prop {object} surah - Data surah dari equran.id API
 */
const SurahHeroBanner = ({ surah }) => {
  if (!surah) return null;

  return (
    <div className='bg-gradient-to-br from-[#1e3a8a] to-[#312e81] dark:from-blue-800 dark:to-indigo-800 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 text-white text-center relative overflow-hidden mb-2 md:mb-4'>
      {/* Radial glow dekoratif */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_70%)]' />

      <div className='relative z-10'>
        <p className='text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-indigo-200 dark:text-indigo-300 mb-2'>
          {surah.tempatTurun} • Surah ke-{surah.nomor}
        </p>
        <h2 className='font-amiri text-5xl md:text-6xl text-white mb-2'>
          {surah.nama}
        </h2>
        <p className='text-indigo-200 dark:text-indigo-300 font-bold text-lg md:text-xl'>
          {surah.namaLatin}
        </p>
        <p className='text-indigo-300 dark:text-indigo-400 text-sm md:text-base mt-1.5'>
          {surah.arti}
        </p>
        {/* Basmalah — disembunyikan untuk surah At-Taubah (9) */}
        {surah.nomor !== 9 && (
          <div className='mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/10 w-3/4 mx-auto'>
            <p className='text-white/90 font-amiri text-2xl md:text-3xl'>
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurahHeroBanner;
