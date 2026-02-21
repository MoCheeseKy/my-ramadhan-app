'use client';

import Image from 'next/image';
import { Coffee, MapPin } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerDonasi — ajakan donasi via QRIS untuk mendukung pengembangan aplikasi.
 */
const DrawerDonasi = ({ open, onClose }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    titleColor='text-rose-500 dark:text-rose-400'
  >
    {/* Header donasi */}
    <div className='text-center mb-5 mt-2'>
      <div className='w-16 h-16 bg-orange-100 dark:bg-orange-900/40 text-orange-500 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 relative'>
        <Coffee size={28} />
        <span className='absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse' />
      </div>
      <h3 className='font-bold text-xl text-slate-800 dark:text-slate-100 leading-tight'>
        Assalamu'alaikum!
      </h3>
    </div>

    {/* Pesan donasi */}
    <div className='space-y-3 mb-6'>
      <p>
        Aplikasi <strong>MyRamadhan</strong> ini saya bangun secara mandiri di
        waktu luang, dan saya berkomitmen menjaganya tetap{' '}
        <strong>gratis dan bebas dari iklan</strong>.
      </p>
      <p>
        Kalau aplikasi ini ngebantu ibadah dan nemenin Ramadhan kamu jadi lebih
        bermakna, kamu bisa traktir kopi biar saya semakin semangat ngerawatnya!
      </p>
    </div>

    {/* QRIS image */}
    <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-700'>
      <p className='text-xs font-bold text-center text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3'>
        Scan QRIS di Bawah Ini
      </p>
      <div className='aspect-square w-full bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center relative overflow-hidden'>
        <Image
          src='/qris-donasi.jpeg'
          alt='QRIS Donasi'
          fill
          className='object-contain p-4'
        />
        <div className='text-center'>
          <MapPin
            size={24}
            className='text-slate-300 dark:text-slate-600 mx-auto mb-2'
          />
          <p className='text-slate-400 dark:text-slate-500 text-xs font-medium'>
            Tempat Gambar QRIS
          </p>
        </div>
      </div>
    </div>
  </DrawerPanel>
);

export default DrawerDonasi;
