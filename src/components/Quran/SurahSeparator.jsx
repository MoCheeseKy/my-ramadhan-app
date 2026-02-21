'use client';

/**
 * SurahSeparator — divider dengan nama Arab + Latin surah,
 * dipakai sebagai pemisah antar-surah di dalam JuzReader.
 *
 * @prop {string} namaArab  - Nama Arab surah (font amiri)
 * @prop {string} namaLatin - Nama latin surah
 */
const SurahSeparator = ({ namaArab, namaLatin }) => (
  <div className='flex items-center gap-4 py-4 md:py-6 my-2'>
    <div className='flex-1 h-px bg-slate-200 dark:bg-slate-700' />
    <div className='flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-full px-5 py-2.5 md:py-3 shrink-0'>
      <span className='font-amiri text-xl md:text-2xl text-[#1e3a8a] dark:text-blue-400'>
        {namaArab}
      </span>
      <span className='text-xs md:text-sm font-bold text-[#1e3a8a] dark:text-blue-400'>
        {namaLatin}
      </span>
    </div>
    <div className='flex-1 h-px bg-slate-200 dark:bg-slate-700' />
  </div>
);

export default SurahSeparator;
