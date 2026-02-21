'use client';

import { useRef } from 'react';
import { Database, Download, Upload } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerDataManagement — fitur backup (export) dan restore (import) data lokal.
 *
 * @prop {boolean}  open          - State buka/tutup
 * @prop {Function} onClose       - Tutup drawer
 * @prop {Function} onExport      - Handler export data ke JSON
 * @prop {Function} onImport      - Handler import data dari file JSON
 */
const DrawerDataManagement = ({ open, onClose, onExport, onImport }) => {
  const importFileRef = useRef(null);

  return (
    <DrawerPanel
      open={open}
      onClose={onClose}
      title='Manajemen Data'
      icon={Database}
      titleColor='text-indigo-600 dark:text-indigo-400'
    >
      <p className='text-slate-500 dark:text-slate-400 mb-5'>
        Pindahkan data Jurnal, Tracker, dan preferensi Anda jika ingin berpindah
        perangkat atau beralih ke Mode PWA secara offline.
      </p>

      <div className='space-y-4'>
        {/* Export */}
        <div className='bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50'>
          <h4 className='font-bold text-sm text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-2'>
            <Download size={16} /> Export (Backup) Data
          </h4>
          <p className='text-xs text-indigo-600/80 dark:text-indigo-400/80 mb-3'>
            Unduh semua progres dan data lokal Anda ke dalam file `.json`.
          </p>
          <button
            onClick={onExport}
            className='w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors'
          >
            Unduh Backup Sekarang
          </button>
        </div>

        {/* Import */}
        <div className='bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50'>
          <h4 className='font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-2'>
            <Upload size={16} /> Import (Restore) Data
          </h4>
          <p className='text-xs text-emerald-600/80 dark:text-emerald-400/80 mb-3'>
            Punya file backup? Unggah di sini untuk memulihkan semua data Anda.
          </p>
          <input
            type='file'
            accept='.json'
            ref={importFileRef}
            onChange={onImport}
            className='hidden'
          />
          <button
            onClick={() => importFileRef.current?.click()}
            className='w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors'
          >
            Pilih File Backup
          </button>
        </div>
      </div>
    </DrawerPanel>
  );
};

export default DrawerDataManagement;
