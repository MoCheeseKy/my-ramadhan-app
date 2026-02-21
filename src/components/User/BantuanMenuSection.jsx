'use client';

import {
  HelpCircle,
  Shield,
  Info,
  User as UserIcon,
  MessageSquare,
  Coffee,
  ChevronRight,
  Github,
} from 'lucide-react';

/**
 * BantuanMenuSection — daftar menu bantuan dan informasi aplikasi.
 *
 * @prop {Function} onOpenBantuan     - Buka drawer FAQ
 * @prop {Function} onOpenPrivasi     - Buka drawer kebijakan privasi
 * @prop {Function} onOpenTentang     - Buka drawer tentang aplikasi
 * @prop {Function} onOpenPengembang  - Buka drawer profil pengembang
 * @prop {Function} onOpenDonasi      - Buka drawer donasi
 */
const BantuanMenuSection = ({
  onOpenBantuan,
  onOpenPrivasi,
  onOpenTentang,
  onOpenPengembang,
  onOpenDonasi,
}) => (
  <div>
    <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2'>
      Bantuan & Info
    </p>
    <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col'>
      {/* Bantuan & FAQ */}
      <button
        onClick={onOpenBantuan}
        className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-500 dark:text-blue-400'>
            <HelpCircle size={18} />
          </div>
          <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm'>
            Bantuan & FAQ
          </span>
        </div>
        <ChevronRight
          size={16}
          className='text-slate-300 dark:text-slate-600'
        />
      </button>

      {/* Kebijakan Privasi */}
      <button
        onClick={onOpenPrivasi}
        className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400'>
            <Shield size={18} />
          </div>
          <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm'>
            Kebijakan Privasi
          </span>
        </div>
        <ChevronRight
          size={16}
          className='text-slate-300 dark:text-slate-600'
        />
      </button>

      {/* Tentang MyRamadhan */}
      <button
        onClick={onOpenTentang}
        className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-500 dark:text-purple-400'>
            <Info size={18} />
          </div>
          <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm'>
            Tentang MyRamadhan
          </span>
        </div>
        <ChevronRight
          size={16}
          className='text-slate-300 dark:text-slate-600'
        />
      </button>

      {/* Pengembang Aplikasi */}
      <button
        onClick={onOpenPengembang}
        className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800 group'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors'>
            <UserIcon size={18} />
          </div>
          <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400'>
            Pengembang Aplikasi
          </span>
        </div>
        <ChevronRight
          size={16}
          className='text-slate-300 dark:text-slate-600'
        />
      </button>

      {/* Kirim Feedback — link eksternal */}
      <a
        href='https://docs.google.com/forms/d/e/1FAIpQLSeB0TrSZDDrJ-xbmEjdiH5mV30Z4A28PFwSfAmTY0Y_qV265A/viewform?usp=publish-editor'
        target='_blank'
        rel='noreferrer'
        className='w-full flex items-center justify-between p-4 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors border-b border-slate-50 dark:border-slate-800 group'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors'>
            <MessageSquare size={18} />
          </div>
          <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400'>
            Kirim Feedback
          </span>
        </div>
        <ChevronRight
          size={16}
          className='text-slate-300 dark:text-slate-600'
        />
      </a>

      {/* GitHub Repo */}
      <button
        onClick={() =>
          window.open('https://github.com/MoCheeseKy/my-ramadhan-app', '_blank')
        }
        className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800 group'
      >
        <div className='flex items-center gap-3 text-left'>
          <div className='p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors'>
            <Github size={18} />
          </div>
          <div>
            <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 block'>
              Open Source (GitHub)
            </span>
            <p className='text-[10px] text-slate-400 dark:text-slate-500 mt-0.5'>
              Pelajari kodenya & jangan lupa traktir kopi{' '}
              <Coffee size={10} className='inline mb-0.5 text-orange-500' />
            </p>
          </div>
        </div>
        <ChevronRight
          size={16}
          className='text-slate-300 dark:text-slate-600 shrink-0'
        />
      </button>

      {/* Traktir Kopi */}
      <button
        onClick={onOpenDonasi}
        className='w-full flex-1 flex items-center justify-between p-4 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors group'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors'>
            <Coffee size={18} />
          </div>
          <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400'>
            Traktir Kopi
          </span>
        </div>
        <ChevronRight
          size={16}
          className='text-slate-300 dark:text-slate-600'
        />
      </button>
    </div>
  </div>
);

export default BantuanMenuSection;
