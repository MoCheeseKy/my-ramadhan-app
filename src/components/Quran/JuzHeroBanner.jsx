'use client';

/**
 * JuzHeroBanner — kartu dekoratif di bagian atas JuzReader.
 * Menampilkan nomor juz dan rentang surah yang ada di dalamnya.
 *
 * @prop {number|string} juzNumber
 * @prop {Array}         juzSurahs - List objek { surahId, namaLatin }
 */
const JuzHeroBanner = ({ juzNumber, juzSurahs }) => {
  const firstSurah = juzSurahs[0];
  const lastSurah = juzSurahs[juzSurahs.length - 1];

  return (
    <div className='bg-gradient-to-br from-[#1e3a8a] to-[#312e81] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 text-white text-center relative overflow-hidden mb-4 md:mb-6'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_70%)]' />
      <div className='relative z-10'>
        <p className='text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-indigo-200 mb-2'>
          Al-Qur'an
        </p>
        <h2 className='text-4xl md:text-5xl font-black text-white'>
          Juz {juzNumber}
        </h2>
        {firstSurah && (
          <p className='text-indigo-200 text-sm md:text-base font-medium mt-2'>
            {firstSurah.namaLatin}
            {firstSurah.surahId !== lastSurah?.surahId
              ? ` — ${lastSurah?.namaLatin}`
              : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default JuzHeroBanner;
