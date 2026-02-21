'use client';

import { HelpCircle } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerBantuan — konten FAQ penggunaan MyRamadhan.
 */
const DrawerBantuan = ({ open, onClose }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Bantuan & FAQ'
    icon={HelpCircle}
    titleColor='text-blue-500 dark:text-blue-400'
  >
    <div className='space-y-4'>
      <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
        <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
          <span className='text-blue-500 font-black'>Q.</span> Kenapa harus
          pakai versi Aplikasi (PWA)?
        </h4>
        <p className='text-[13px] mt-1.5'>
          Versi PWA menyimpan Jurnal dan Tracker 100% secara offline di memori
          HP Anda. Ini membuatnya jauh lebih cepat, privat, dan hemat kuota
          dibanding versi Web.
        </p>
      </div>
      <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
        <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
          <span className='text-blue-500 font-black'>Q.</span> Kenapa lokasi
          sholat saya salah?
        </h4>
        <p className='text-[13px] mt-1.5'>
          Anda bisa mengubah lokasi kota secara manual melalui tombol "Edit
          Profil" yang ada di bagian atas halaman ini.
        </p>
      </div>
      <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
        <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
          <span className='text-blue-500 font-black'>Q.</span> Bagaimana cara
          pindah HP tanpa hilang data?
        </h4>
        <p className='text-[13px] mt-1.5'>
          Gunakan fitur "Manajemen Data" untuk meng-ekspor data Anda menjadi
          file Backup, lalu impor file tersebut di HP Anda yang baru.
        </p>
      </div>
    </div>
  </DrawerPanel>
);

export default DrawerBantuan;
