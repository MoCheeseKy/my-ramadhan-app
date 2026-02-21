'use client';

import { ArrowLeft, Eye, EyeOff, Settings2, Navigation } from 'lucide-react';
import { useRouter } from 'next/router';
import ReaderSettingsPanel from '@/components/quran/ReaderSettingsPanel';

/**
 * SurahHeader — sticky header halaman reader surah.
 * Berisi: tombol back, judul surah, toggle hafalan, toggle settings,
 * form loncat ke nomor ayat, dan settings panel (muncul kondisional).
 *
 * @prop {object|null} surah          - Data surah dari API
 * @prop {boolean}     loading
 * @prop {boolean}     hafalanMode
 * @prop {Function}    onToggleHafalan
 * @prop {boolean}     showSettings
 * @prop {Function}    onToggleSettings
 * @prop {object}      settings        - { arab, latin, terjemahan, tajwid, arabSize }
 * @prop {Function}    onSettingChange
 * @prop {Function}    onSizeChange
 * @prop {string}      jumpNumber
 * @prop {Function}    setJumpNumber
 * @prop {Function}    onJumpSubmit
 */
const SurahHeader = ({
  surah,
  loading,
  hafalanMode,
  onToggleHafalan,
  showSettings,
  onToggleSettings,
  settings,
  onSettingChange,
  onSizeChange,
  jumpNumber,
  setJumpNumber,
  onJumpSubmit,
}) => {
  const router = useRouter();

  return (
    <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-3 md:py-4'>
      <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full'>
        {/* Baris atas: back + judul + toggle buttons */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3 md:gap-4'>
            <button
              onClick={() => router.back()}
              className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            >
              <ArrowLeft
                size={22}
                className='text-slate-600 dark:text-slate-400'
              />
            </button>
            {loading ? (
              <div className='h-6 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg' />
            ) : (
              <div>
                <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-200 leading-tight'>
                  {surah?.namaLatin}
                </h1>
                <p className='text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500'>
                  {surah?.arti} • {surah?.jumlahAyat} Ayat
                </p>
              </div>
            )}
          </div>

          <div className='flex items-center gap-1 md:gap-2'>
            <button
              onClick={onToggleHafalan}
              className={`px-4 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1.5 ${
                hafalanMode
                  ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white border-[#1e3a8a] dark:border-blue-600'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#1e3a8a]/30'
              }`}
            >
              {hafalanMode ? <Eye size={15} /> : <EyeOff size={15} />}
              <span className='hidden sm:block'>Hafalan</span>
            </button>
            <button
              onClick={onToggleSettings}
              className={`p-2.5 rounded-full transition-colors ${
                showSettings
                  ? 'bg-[#1e3a8a] dark:bg-blue-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Form loncat ke nomor ayat */}
        <form onSubmit={onJumpSubmit} className='relative w-full flex gap-2'>
          <div className='relative flex-1'>
            <Navigation
              className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
              size={16}
            />
            <input
              type='number'
              min='1'
              max={surah?.jumlahAyat || 9999}
              placeholder={`Loncat ke ayat (1 - ${surah?.jumlahAyat || ''})...`}
              value={jumpNumber}
              onChange={(e) => setJumpNumber(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-100/80 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-[#1e3a8a] outline-none text-[13px] md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400'
            />
          </div>
          <button
            type='submit'
            className='bg-[#1e3a8a] dark:bg-blue-600 hover:bg-blue-800 text-white font-bold px-5 py-2.5 md:py-3 rounded-2xl transition-colors text-[13px] md:text-sm shadow-sm flex items-center justify-center shrink-0'
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

export default SurahHeader;
