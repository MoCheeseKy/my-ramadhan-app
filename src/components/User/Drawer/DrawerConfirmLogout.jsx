'use client';

import { LogOut } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerConfirmLogout — dialog konfirmasi sebelum logout.
 *
 * @prop {boolean}  open      - State buka/tutup
 * @prop {Function} onClose   - Tutup drawer
 * @prop {Function} onConfirm - Eksekusi logout
 */
const DrawerConfirmLogout = ({ open, onClose, onConfirm }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Keluar Akun'
    icon={LogOut}
    titleColor='text-rose-500 dark:text-rose-400'
    hideFooterButton
  >
    <div className='flex flex-col items-center text-center mt-2'>
      <div className='w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center rounded-full mb-4'>
        <LogOut size={32} />
      </div>
      <p className='text-sm text-slate-600 dark:text-slate-300 leading-relaxed px-2'>
        Apakah Anda yakin ingin keluar dari akun ini? Anda harus memasukkan{' '}
        <strong>Personal Code</strong> lagi untuk dapat mengakses data Anda
        nanti.
      </p>
      <div className='flex gap-3 w-full mt-6'>
        <button
          onClick={onClose}
          className='flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          className='flex-1 py-3.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-md'
        >
          Ya, Keluar
        </button>
      </div>
    </div>
  </DrawerPanel>
);

export default DrawerConfirmLogout;
