'use client';

import { Type } from 'lucide-react';
import { HADITS_ARAB_SIZES } from '@/components/Hadits/Constants';

/**
 * HaditsSettingsPanel — panel pengaturan tampilan reader Hadits.
 * Toggle Arab/Terjemah + pilihan ukuran teks Arab.
 * Menggunakan warna emerald (tema Hadits).
 *
 * @prop {object}   settings      - { arab, terjemahan, arabSize }
 * @prop {Function} onToggle      - (key) => void
 * @prop {Function} onSizeChange  - (sizeKey) => void
 */
const HaditsSettingsPanel = ({ settings, onToggle, onSizeChange }) => {
  const toggleOptions = [
    { key: 'arab', label: 'Arab' },
    { key: 'terjemahan', label: 'Terjemah' },
  ];

  return (
    <div className='mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 pb-2 md:flex md:items-center md:justify-center md:gap-8'>
      {/* Toggle tampilan */}
      <div className='grid grid-cols-2 md:flex gap-2 mb-3 md:mb-0'>
        {toggleOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={`py-2 md:px-8 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${
              settings[key]
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ukuran teks Arab */}
      <div className='md:flex md:items-center md:gap-3'>
        <p className='text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 md:mb-0 mt-3 md:mt-0'>
          <Type size={11} className='md:w-3 md:h-3' /> Ukuran Arab
        </p>
        <div className='grid grid-cols-3 gap-2'>
          {HADITS_ARAB_SIZES.map((s) => (
            <button
              key={s.key}
              onClick={() => onSizeChange(s.key)}
              className={`flex flex-col md:flex-row md:gap-2 items-center justify-center py-2 md:px-4 md:py-1.5 rounded-xl border-2 transition-all ${
                settings.arabSize === s.key
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              <span
                className='font-arabic leading-none mb-1 md:mb-0'
                style={{ fontSize: '18px' }}
              >
                ع
              </span>
              <span className='text-[10px] font-bold'>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HaditsSettingsPanel;
