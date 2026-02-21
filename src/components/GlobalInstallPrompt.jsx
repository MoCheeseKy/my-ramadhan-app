import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';
import useAppMode from '@/hooks/useAppMode';
import useInstallPrompt from '@/hooks/useInstallPrompt';

export default function GlobalInstallPrompt() {
  const { isPWA } = useAppMode();
  const { isInstallable, promptInstall, isIOS } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPWA || dismissed) return null;
  if (!isInstallable && !isIOS) return null;

  return (
    <div className='fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500'>
      <div className='bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-blue-100 dark:border-slate-800 relative overflow-hidden'>
        {/* Hiasan Background */}
        <div className='absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none' />

        {/* Tombol Tutup */}
        <button
          onClick={() => setDismissed(true)}
          className='absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors'
        >
          <X size={14} />
        </button>

        <div className='flex items-start gap-3 mb-3 pr-6'>
          <div className='w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400'>
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className='font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight'>
              Pengalaman Lebih Baik
            </h3>
            <p className='text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium'>
              100% Privat, lebih cepat, dan hemat kuota.
            </p>
          </div>
        </div>

        {isInstallable ? (
          <button
            onClick={promptInstall}
            className='w-full py-2.5 bg-[#1e3a8a] hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex justify-center items-center gap-2 transition-all shadow-md active:scale-[0.98]'
          >
            <Download size={16} /> Install Aplikasi Sekarang
          </button>
        ) : isIOS ? (
          <div className='p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] text-slate-500 dark:text-slate-400 text-center border border-slate-100 dark:border-slate-700 font-medium'>
            Untuk pengguna iPhone/iPad: Tekan ikon Share{' '}
            <span className='text-sm align-bottom'>⍐</span> lalu "Add to Home
            Screen"
          </div>
        ) : null}
      </div>
    </div>
  );
}
