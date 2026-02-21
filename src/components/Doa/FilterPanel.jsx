'use client';

import { useEffect, useRef } from 'react';
import { Filter, X } from 'lucide-react';

/**
 * FilterPanel — bottom sheet untuk filter doa berdasarkan grup dan tag.
 * Menutup otomatis saat klik di luar panel.
 *
 * @prop {boolean}  open              - State buka/tutup
 * @prop {Function} onClose
 * @prop {Array}    availableGroups   - ['Semua', 'Pagi', ...]
 * @prop {Array}    availableTags     - ['Semua', 'Wajib', ...]
 * @prop {string}   activeGroup
 * @prop {Function} setActiveGroup
 * @prop {string}   activeTag
 * @prop {Function} setActiveTag
 */
const FilterPanel = ({
  open,
  onClose,
  availableGroups,
  availableTags,
  activeGroup,
  setActiveGroup,
  activeTag,
  setActiveTag,
}) => {
  const panelRef = useRef(null);

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const noFilters = availableGroups.length <= 1 && availableTags.length <= 1;

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm'>
      <div
        ref={panelRef}
        className='bg-white dark:bg-slate-800 w-full max-w-md md:max-w-xl rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-200'
      >
        {/* Drag handle */}
        <div className='w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-5' />

        {/* Judul */}
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2'>
            <Filter size={18} className='text-rose-500' /> Filter Doa
          </h2>
          <button
            onClick={onClose}
            className='p-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
          >
            <X size={15} />
          </button>
        </div>

        <div className='max-h-[60vh] overflow-y-auto pr-2 pb-4'>
          {noFilters ? (
            <div className='text-center py-8 text-slate-400 dark:text-slate-500 text-sm'>
              Tidak ada opsi filter untuk kategori ini.
            </div>
          ) : (
            <>
              {/* Filter Grup */}
              {availableGroups.length > 1 && (
                <div className='mb-6'>
                  <p className='text-xs font-bold text-slate-700 dark:text-slate-300 mb-3'>
                    Berdasarkan Grup
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {availableGroups.map((g) => (
                      <button
                        key={`grp-${g}`}
                        onClick={() => setActiveGroup(g)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border ${
                          activeGroup === g
                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        {g === 'Semua' ? 'Semua Grup' : g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Tag */}
              {availableTags.length > 1 && (
                <div>
                  <p className='text-xs font-bold text-slate-700 dark:text-slate-300 mb-3'>
                    Berdasarkan Tag / Label
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {availableTags.map((tag) => (
                      <button
                        key={`tag-${tag}`}
                        onClick={() => setActiveTag(tag)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border ${
                          activeTag === tag
                            ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-rose-300'
                        }`}
                      >
                        {tag === 'Semua' ? 'Semua Tag' : tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer aksi */}
        <div className='flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700'>
          <button
            onClick={() => {
              setActiveGroup('Semua');
              setActiveTag('Semua');
            }}
            className='flex-1 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
          >
            Reset Filter
          </button>
          <button
            onClick={onClose}
            className='flex-1 py-3.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-md'
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
