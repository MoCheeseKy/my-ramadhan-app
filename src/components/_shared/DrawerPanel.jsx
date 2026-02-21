'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * DrawerPanel — bottom sheet di mobile, modal centered di desktop.
 * Menutup otomatis saat klik di luar panel.
 *
 * @prop {boolean}   open               - Apakah drawer terbuka
 * @prop {Function}  onClose            - Callback saat menutup
 * @prop {string}    title              - Judul drawer
 * @prop {Component} icon               - Icon lucide untuk judul
 * @prop {ReactNode} children           - Konten drawer
 * @prop {string}    [titleColor]       - Tailwind class warna judul
 * @prop {boolean}   [hideFooterButton] - Sembunyikan tombol "Tutup" di footer
 */
const DrawerPanel = ({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  titleColor = 'text-[#1e3a8a] dark:text-blue-400',
  hideFooterButton = false,
}) => {
  const panelRef = useRef(null);

  // Tutup drawer saat klik di luar panel
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-0 md:p-4'>
      <div
        ref={panelRef}
        className='bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2rem] rounded-b-none md:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200 max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-700/50'
      >
        {/* Drag handle — hanya tampil di mobile */}
        <div className='w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 shrink-0 md:hidden' />

        {/* Header */}
        <div className='flex items-center justify-between mb-5 shrink-0'>
          <h2
            className={`font-bold text-lg flex items-center gap-2.5 ${titleColor}`}
          >
            {Icon && <Icon size={20} />} {title}
          </h2>
          <button
            onClick={onClose}
            className='p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        {/* Konten scrollable */}
        <div className='overflow-y-auto custom-scrollbar pr-2 flex-1 pb-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-4'>
          {children}
        </div>

        {!hideFooterButton && (
          <button
            onClick={onClose}
            className='w-full mt-4 py-3.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shrink-0 shadow-md'
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
};

export default DrawerPanel;
