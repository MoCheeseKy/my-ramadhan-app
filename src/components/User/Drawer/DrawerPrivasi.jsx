'use client';

import { Shield } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerPrivasi — informasi kebijakan privasi MyRamadhan.
 */
const DrawerPrivasi = ({ open, onClose }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Kebijakan Privasi'
    icon={Shield}
    titleColor='text-emerald-500 dark:text-emerald-400'
  >
    <div className='space-y-4'>
      <p>Kenyamanan dan privasi Anda adalah prioritas mutlak kami:</p>

      {[
        {
          num: 1,
          title: 'Mode Privat 100% (PWA)',
          desc: 'Saat diinstal sebagai aplikasi, semua tulisan Jurnal yang sensitif dan catatan Tracker hanya akan disimpan secara lokal di HP Anda. Kami tidak bisa melihat atau membacanya.',
        },
        {
          num: 2,
          title: 'Keamanan Data Web',
          desc: 'Jika Anda menggunakan versi Web dengan login *Personal Code*, preferensi Anda akan disimpan di database Cloud ber-enkripsi standar industri.',
        },
        {
          num: 3,
          title: 'Tanpa Jual Beli Data',
          desc: 'Aplikasi ini tidak memiliki iklan pelacak dan kami tidak akan pernah menjual data personal Anda kepada pihak ketiga mana pun.',
        },
      ].map(({ num, title, desc }) => (
        <div key={num} className='flex gap-3 items-start'>
          <div className='w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1 font-bold text-sm'>
            {num}
          </div>
          <div>
            <h4 className='font-bold text-slate-800 dark:text-slate-100'>
              {title}
            </h4>
            <p className='text-[13px] mt-0.5'>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </DrawerPanel>
);

export default DrawerPrivasi;
