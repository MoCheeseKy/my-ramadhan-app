'use client';

import { ArrowLeft, Eye, EyeOff, Settings2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import ReaderSettingsPanel from '@/components/Quran/ReaderSettingsPanel';

/**
 * JuzHeader — sticky header halaman reader juz.
 * Form loncat menggunakan select surah + input nomor ayat
 * (berbeda dengan SurahHeader yang hanya pakai input nomor ayat).
 *
 * @prop {number|string} juzNumber
 * @prop {Array}         juzSurahs       - List surah yang ada di juz ini
 * @prop {boolean}       loading
 * @prop {boolean}       hafalanMode
 * @prop {Function}      onToggleHafalan
 * @prop {boolean}       showSettings
 * @prop {Function}      onToggleSettings
 * @prop {object}        settings
 * @prop {Function}      onSettingChange
 * @prop {Function}      onSizeChange
 * @prop {string}        jumpSurah
 * @prop {Function}      setJumpSurah
 * @prop {string}        jumpAyat
 * @prop {Function}      setJumpAyat
 * @prop {Function}      onJumpSubmit
 */
const JuzHeader = ({
  juzNumber,
  juzSurahs,
  loading,
  hafalanMode,
  onToggleHafalan,
  showSettings,
  onToggleSettings,
  settings,
  onSettingChange,
  onSizeChange,
  jumpSurah,
  setJumpSurah,
  jumpAyat,
  setJumpAyat,
  onJumpSubmit,
}) => {
  const router = useRouter();
  const firstSurah = juzSurahs[0];
  const lastSurah = juzSurahs[juzSurahs.length - 1];

  return (
    <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-5 py-3 md:py-4'>
      <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full'>
        {/* Baris atas: back + judul + toggle buttons */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3 md:gap-4'>
            <button
              onClick={() => router.back()}
              className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
            >
              <ArrowLeft
                size={22}
                className='text-slate-600 dark:text-slate-400'
              />
            </button>
            <div>
              <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-100'>
                Juz {juzNumber}
              </h1>
              {!loading && firstSurah && (
                <p className='text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500'>
                  {firstSurah.namaLatin}
                  {firstSurah.surahId !== lastSurah?.surahId
                    ? ` — ${lastSurah?.namaLatin}`
                    : ''}
                </p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2 md:gap-3'>
            <button
              onClick={onToggleHafalan}
              className={`px-4 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1.5 ${
                hafalanMode
                  ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white border-[#1e3a8a] dark:border-blue-700'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-[#1e3a8a]/30'
              }`}
            >
              {hafalanMode ? <Eye size={15} /> : <EyeOff size={15} />}
              <span className='hidden sm:block'>Hafalan</span>
            </button>
            <button
              onClick={onToggleSettings}
              className={`p-2.5 rounded-full transition-colors ${
                showSettings
                  ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Form loncat: select surah + input ayat */}
        <form onSubmit={onJumpSubmit} className='flex gap-2 w-full'>
          <div className='flex-1 flex gap-2'>
            <div className='relative w-1/2'>
              <select
                value={jumpSurah}
                onChange={(e) => setJumpSurah(e.target.value)}
                className='w-full pl-3 pr-8 py-2.5 md:py-3 bg-slate-100/80 dark:bg-slate-800 rounded-2xl border-none outline-none text-[13px] md:text-sm text-slate-800 dark:text-slate-100 appearance-none'
              >
                <option value='' disabled>
                  Pilih Surah
                </option>
                {juzSurahs.map((s) => (
                  <option key={s.surahId} value={s.surahId}>
                    {s.namaLatin}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
              />
            </div>
            <input
              type='number'
              min='1'
              placeholder='Ayat'
              value={jumpAyat}
              onChange={(e) => setJumpAyat(e.target.value)}
              className='w-1/2 px-4 py-2.5 md:py-3 bg-slate-100/80 dark:bg-slate-800 rounded-2xl border-none outline-none text-[13px] md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400'
            />
          </div>
          <button
            type='submit'
            className='bg-[#1e3a8a] dark:bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2.5 md:py-3 rounded-2xl transition-colors text-[13px] md:text-sm shadow-sm shrink-0'
          >
            Loncat
          </button>
        </form>

        {/* Settings panel */}
        {showSettings && (
          <ReaderSettingsPanel
            settings={settings}
            onSettingChange={onSettingChange}
            onSizeChange={onSizeChange}
          />
        )}
      </div>
    </header>
  );
};

export default JuzHeader;
