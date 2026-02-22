import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  Sparkles,
  AlertCircle,
  BookOpen,
  Rocket,
  ShieldCheck,
  Smartphone,
  Info,
  ExternalLink,
} from 'lucide-react';

const iconMap = {
  info: <Bell size={18} className='text-blue-500' />,
  special: <Sparkles size={18} className='text-amber-500' />,
  prayer: <BookOpen size={18} className='text-emerald-500' />,
  warning: <AlertCircle size={18} className='text-rose-500' />,
  update: <Rocket size={18} className='text-[#1e3a8a] dark:text-blue-400' />, // Icon baru untuk update
};

const bgMap = {
  info: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 hover:bg-blue-100/50 dark:hover:bg-blue-900/30',
  special:
    'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800 hover:bg-amber-100/50 dark:hover:bg-amber-900/30',
  prayer:
    'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30',
  warning:
    'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800 hover:bg-rose-100/50 dark:hover:bg-rose-900/30',
  update:
    'bg-gradient-to-tr from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-800/50 hover:shadow-md cursor-pointer', // Style khusus untuk update
};

export default function NotificationDrawer({ isOpen, onClose, notifications }) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Data Notifikasi Major Update (Hardcoded)
  const majorUpdateNotification = {
    id: 'major_update_p2p',
    type: 'update',
    title: '🚀 MAJOR UPDATE: Arsitektur Baru!',
    message:
      'Aplikasi kini 100% Local-First dengan sinkronisasi P2P. Klik untuk info selengkapnya.',
    day: 999, // Angka besar agar selalu disortir paling atas
  };

  // Mengelompokkan notifikasi berdasarkan 'day'
  const { groupedNotifs, sortedDays, maxDay } = useMemo(() => {
    // Sisipkan notifikasi major update ke dalam array notifikasi yang ada
    const allNotifications = [
      majorUpdateNotification,
      ...(notifications || []),
    ];

    // Cari hari tertinggi (mengabaikan day 999 dari update) untuk dijadikan penanda "Hari Ini"
    const max = Math.max(
      ...allNotifications.filter((n) => n.day !== 999).map((n) => n.day),
    );

    // Kelompokkan data
    const groups = allNotifications.reduce((acc, notif) => {
      const d = notif.day;
      if (!acc[d]) acc[d] = [];
      acc[d].push(notif);
      return acc;
    }, {});

    // Urutkan hari dari yang terbaru ke terlama (descending)
    const sorted = Object.keys(groups).sort((a, b) => b - a);

    return { groupedNotifs: groups, sortedDays: sorted, maxDay: max };
  }, [notifications]);

  // Fungsi untuk memberi nama label pemisah tanggal
  const getDayLabel = (dayStr) => {
    const d = parseInt(dayStr);
    if (d === 999) return 'Pengumuman Penting'; // Kategori khusus untuk update
    if (d === maxDay) return 'Hari Ini';
    if (d === maxDay - 1 && d > 0) return 'Kemarin';
    if (d === 0) return 'Persiapan Ramadhan';
    return `Ramadhan Hari ke-${d}`;
  };

  const handleGoToNewWeb = () => {
    window.location.href = 'https://my-ramadhan-app-three.vercel.app/';
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className='fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm'
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='fixed bottom-0 left-0 right-0 bg-[#F6F9FC] dark:bg-slate-950 rounded-t-[2.5rem] z-[60] max-h-[85vh] flex flex-col shadow-2xl'
            >
              {/* Drag Handle */}
              <div
                className='w-full flex justify-center pt-4 pb-2 bg-white dark:bg-slate-900 rounded-t-[2.5rem]'
                onClick={onClose}
              >
                <div className='w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer' />
              </div>

              {/* Header */}
              <div className='px-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'>
                <div>
                  <h2 className='font-bold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2'>
                    <Bell
                      size={20}
                      className='text-[#1e3a8a] dark:text-blue-400'
                    />{' '}
                    Notifikasi
                  </h2>
                  <p className='text-xs text-slate-400 dark:text-slate-500 mt-1'>
                    Pesan semangat & pengingat sholat
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className='p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                >
                  <X size={20} className='text-slate-500 dark:text-slate-400' />
                </button>
              </div>

              {/* List Notifikasi Berkelompok */}
              <div className='flex-1 overflow-y-auto p-5 pb-10 custom-scrollbar'>
                <div className='space-y-6'>
                  {sortedDays.map((dayStr, dayIndex) => (
                    <div key={dayStr} className='space-y-3'>
                      {/* ========================================== */}
                      {/* PEMISAH TANGGAL (DATE DIVIDER)               */}
                      {/* ========================================== */}
                      <div className='flex items-center gap-3 mb-4 mt-2'>
                        <div className='h-px bg-slate-200 dark:bg-slate-800 flex-1'></div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            parseInt(dayStr) === 999
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-[#1e3a8a] dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {getDayLabel(dayStr)}
                        </span>
                        <div className='h-px bg-slate-200 dark:bg-slate-800 flex-1'></div>
                      </div>

                      {/* --- ITEM NOTIFIKASI --- */}
                      {groupedNotifs[dayStr].map((notif, index) => (
                        <motion.div
                          key={notif.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: dayIndex * 0.1 + index * 0.05 }}
                          onClick={() => {
                            if (notif.type === 'update') {
                              setShowUpdateModal(true);
                            }
                          }}
                          className={`p-4 rounded-2xl border flex gap-4 items-start transition-all duration-300 ${bgMap[notif.type || 'info']}`}
                        >
                          <div
                            className={`p-2 rounded-xl shadow-sm shrink-0 ${
                              notif.type === 'update'
                                ? 'bg-white dark:bg-slate-900'
                                : 'bg-white dark:bg-slate-800'
                            }`}
                          >
                            {iconMap[notif.type || 'info']}
                          </div>
                          <div className='w-full'>
                            <div className='flex justify-between items-start mb-1 gap-2'>
                              <h3
                                className={`font-bold text-sm leading-tight ${
                                  notif.type === 'update'
                                    ? 'text-[#1e3a8a] dark:text-blue-400'
                                    : 'text-slate-800 dark:text-slate-100'
                                }`}
                              >
                                {notif.title}
                              </h3>
                              {/* Label 'BARU' muncul untuk notifikasi update ATAU item paling atas di "Hari Ini" */}
                              {(notif.type === 'update' ||
                                (dayIndex === 0 && index === 0)) && (
                                <span className='text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse shrink-0'>
                                  BARU
                                </span>
                              )}
                            </div>
                            <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium'>
                              {notif.message}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* OVERLAY MAJOR UPDATE (Dibuka dari klik notifikasi) */}
      <AnimatePresence>
        {showUpdateModal && (
          <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden'
            >
              <div className='absolute -top-12 -right-12 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl' />
              <div className='absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-2xl' />

              <div className='relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-tr from-[#1e3a8a] to-indigo-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30'>
                  <Rocket size={32} />
                </div>

                <h2 className='text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 leading-tight'>
                  MAJOR UPDATE:
                  <br />
                  <span className='text-[#1e3a8a] dark:text-blue-400'>
                    Arsitektur Baru!
                  </span>
                </h2>

                <p className='text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6'>
                  Kami baru saja melakukan perpindahan sistem besar-besaran agar
                  aplikasi menjadi jauh lebih aman, cepat, dan mandiri.
                </p>

                <div className='space-y-4 mb-8'>
                  <div className='flex gap-3'>
                    <div className='mt-0.5 shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400'>
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
                        100% Local-First
                      </h4>
                      <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed'>
                        Data kamu kini disimpan langsung di perangkat, tidak
                        lagi di database kami. Jauh lebih aman secara privasi.
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <div className='mt-0.5 shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400'>
                      <Smartphone size={16} />
                    </div>
                    <div>
                      <h4 className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
                        Sistem Sinkronisasi P2P
                      </h4>
                      <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed'>
                        Sistem login <span className='italic'>Unique Code</span>{' '}
                        digantikan dengan transfer data langsung antar perangkat
                        (Peer-to-Peer).
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    <div className='mt-0.5 shrink-0 w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400'>
                      <Info size={16} />
                    </div>
                    <div>
                      <h4 className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
                        Pengembangan Dihentikan
                      </h4>
                      <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed'>
                        Versi web ini sudah{' '}
                        <span className='font-bold text-rose-500'>
                          berhenti
                        </span>{' '}
                        dikembangkan. Semua fitur baru hanya akan dirilis di
                        alamat web yang baru.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex flex-col gap-3'>
                  <button
                    onClick={handleGoToNewWeb}
                    className='w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                  >
                    Buka Website Baru <ExternalLink size={18} />
                  </button>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className='w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-[0.98]'
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
