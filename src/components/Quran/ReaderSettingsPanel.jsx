'use client';

import { useState } from 'react';
import { Type, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { ARAB_SIZES, TAJWID_RULES } from '@/data/quranConstants';

/**
 * ReaderSettingsPanel — panel pengaturan tampilan reader Al-Qur'an.
 * Menampilkan toggle teks (Arab/Latin/Terjemah/Tajwid), ukuran huruf Arab,
 * dan keterangan warna tajwid (muncul jika tajwid aktif).
 *
 * Layout responsif: grid 4-kolom di mobile, flex row di tablet/desktop.
 *
 * @prop {object}   settings        - State settings aktif
 * @prop {Function} onSettingChange - Callback: (key) => toggle settings[key]
 * @prop {Function} onSizeChange    - Callback: (sizeKey) => ubah arabSize
 */
const ReaderSettingsPanel = ({ settings, onSettingChange, onSizeChange }) => {
  const [showTajwidInfo, setShowTajwidInfo] = useState(false);

  const toggleOptions = [
    { key: 'arab', label: 'Arab' },
    { key: 'latin', label: 'Latin' },
    { key: 'terjemahan', label: 'Terjemah' },
    { key: 'tajwid', label: 'Tajwid' },
  ];

  return (
    <div className='mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 pb-2'>
      <div className='md:flex md:items-start md:justify-center md:gap-8'>
        {/* Toggle tampilan */}
        <div className='grid grid-cols-4 md:flex gap-2 mb-3 md:mb-0'>
          {toggleOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSettingChange(key)}
              className={`py-2 md:px-6 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${
                settings[key]
                  ? 'bg-[#1e3a8a] dark:bg-blue-700 text-white border-[#1e3a8a] dark:border-blue-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Ukuran teks Arab */}
        <div className='md:flex md:items-center md:gap-3'>
          <div className='mt-4 mb-2 md:my-0 flex items-center gap-1.5'>
            <Type size={11} className='text-slate-400' />
            <span className='text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest'>
              Ukuran Arab
            </span>
          </div>
          <div className='grid grid-cols-4 md:flex gap-2 pb-2 md:pb-0'>
            {ARAB_SIZES.map((s) => (
              <button
                key={s.key}
                onClick={() => onSizeChange(s.key)}
                className={`flex flex-col md:flex-row md:gap-2 items-center justify-center py-2 md:px-3 md:py-1.5 rounded-xl border-2 transition-all ${
                  settings.arabSize === s.key
                    ? 'border-[#1e3a8a] bg-blue-50 dark:bg-blue-950/40 text-[#1e3a8a] dark:text-blue-400'
                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span
                  className='font-arabic leading-none mb-1 md:mb-0'
                  style={{ fontSize: '18px' }}
                >
                  ع
                </span>
                <span className='text-[10px] md:text-xs font-bold'>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Keterangan tajwid — hanya muncul jika tajwid aktif */}
        {settings.tajwid && (
          <div className='flex flex-col items-center md:items-start w-full md:w-auto mt-2 md:mt-0 md:ml-4'>
            <button
              onClick={() => setShowTajwidInfo((v) => !v)}
              className='flex items-center justify-center gap-1.5 text-[11px] md:text-xs text-[#1e3a8a] dark:text-blue-400 font-bold hover:underline mb-3 w-full md:w-auto'
            >
              <Info size={14} /> Keterangan tajwid
              {showTajwidInfo ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {showTajwidInfo && (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 pb-2'>
                {TAJWID_RULES.map((r) => (
                  <div key={r.key} className='flex items-start gap-2.5'>
                    <span
                      className='w-3 h-3 md:w-3.5 md:h-3.5 rounded-full mt-0.5 shrink-0'
                      style={{ backgroundColor: r.color }}
                    />
                    <div>
                      <p
                        className='text-[11px] md:text-xs font-bold'
                        style={{ color: r.color }}
                      >
                        {r.label}
                      </p>
                      <p className='text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 leading-tight'>
                        {r.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderSettingsPanel;
