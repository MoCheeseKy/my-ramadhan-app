'use client';

import { ArrowLeft, Eye, EyeOff, Settings2, Navigation } from 'lucide-react';
import HaditsSettingsPanel from '@/components/Hadits/HaditsSettingsPanel';

/**
 * HaditsReaderHeader — sticky header untuk halaman baca hadits.
 * Berisi: back, judul kitab + nomor halaman, toggle hafalan,
 * toggle settings, form loncat nomor, dan settings panel kondisional.
 *
 * @prop {object}   book              - { name, available }
 * @prop {number}   page              - Halaman aktif
 * @prop {boolean}  hafalanMode
 * @prop {Function} onToggleHafalan
 * @prop {boolean}  showSettings
 * @prop {Function} onToggleSettings
 * @prop {object}   settings          - { arab, terjemahan, arabSize }
 * @prop {Function} onToggleSetting
 * @prop {Function} onSizeChange
 * @prop {string}   jumpNumber
 * @prop {Function} setJumpNumber
 * @prop {Function} onJumpSubmit
 * @prop {Function} onBack
 */
const HaditsReaderHeader = ({
  book,
  page,
  hafalanMode,
  onToggleHafalan,
  showSettings,
  onToggleSettings,
  settings,
  onToggleSetting,
  onSizeChange,
  jumpNumber,
  setJumpNumber,
  onJumpSubmit,
  onBack,
}) => (
  <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
    <div className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full'>
      {/* Baris atas: back + judul + toggle buttons */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <button
            onClick={onBack}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
          >
            <ArrowLeft
              size={20}
              className='text-slate-600 dark:text-slate-400'
            />
          </button>
          <div>
            <h1 className='font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100 leading-tight'>
              {book?.name}
            </h1>
            <p className='text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400'>
              Halaman {page}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-1 md:gap-2'>
          {/* Mode hafalan */}
          <button
            onClick={onToggleHafalan}
            className={`px-3 py-1.5 md:py-2 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1 ${
              hafalanMode
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-emerald-200 dark:hover:border-emerald-700'
            }`}
          >
            {hafalanMode ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className='hidden sm:inline'>Hafalan</span>
          </button>

          {/* Settings */}
          <button
            onClick={onToggleSettings}
            className={`p-2 md:p-2.5 rounded-full transition-colors ${
              showSettings
                ? 'bg-emerald-500 text-white'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Form loncat nomor */}
      <form onSubmit={onJumpSubmit} className='relative w-full flex gap-2'>
        <div className='relative flex-1'>
          <Navigation
            className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
            size={16}
          />
          <input
            type='number'
            min='1'
            max={book?.available || 9999}
            placeholder={`Loncat ke nomor (1 - ${book?.available || ''})...`}
            value={jumpNumber}
            onChange={(e) => setJumpNumber(e.target.value)}
            className='w-full pl-10 pr-4 py-3 bg-slate-100/80 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-emerald-400 outline-none text-[13px] md:text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
          />
        </div>
        <button
          type='submit'
          className='bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-2xl transition-colors text-[13px] md:text-sm shadow-sm flex items-center justify-center shrink-0'
        >
          Loncat
        </button>
      </form>

      {/* Settings panel */}
      {showSettings && (
        <HaditsSettingsPanel
          settings={settings}
          onToggle={onToggleSetting}
          onSizeChange={onSizeChange}
        />
      )}
    </div>
  </header>
);

export default HaditsReaderHeader;
