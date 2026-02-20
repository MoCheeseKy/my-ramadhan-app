import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Sparkles, AlertCircle, BookOpen } from 'lucide-react';

const iconMap = {
  info: <Bell size={18} className='text-blue-500' />,
  special: <Sparkles size={18} className='text-amber-500' />,
  prayer: <BookOpen size={18} className='text-emerald-500' />,
  warning: <AlertCircle size={18} className='text-rose-500' />,
};

const bgMap = {
  info: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
  special:
    'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
  prayer:
    'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800',
  warning:
    'bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800',
};

export default function NotificationDrawer({ isOpen, onClose, notifications }) {
  // Mengelompokkan notifikasi berdasarkan 'day'
  const { groupedNotifs, sortedDays, maxDay } = useMemo(() => {
    if (!notifications || notifications.length === 0) {
      return { groupedNotifs: {}, sortedDays: [], maxDay: 0 };
    }

    // Cari hari tertinggi untuk dijadikan penanda "Hari Ini"
    const max = Math.max(...notifications.map((n) => n.day));

    // Kelompokkan data
    const groups = notifications.reduce((acc, notif) => {
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
    if (d === maxDay) return 'Hari Ini';
    if (d === maxDay - 1 && d > 0) return 'Kemarin';
    if (d === 0) return 'Persiapan Ramadhan';
    return `Ramadhan Hari ke-${d}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/40 z-50 backdrop-blur-sm'
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='fixed bottom-0 left-0 right-0 bg-[#F6F9FC] dark:bg-slate-950 rounded-t-[2.5rem] z-50 max-h-[85vh] flex flex-col shadow-2xl'
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
                className='p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors'
              >
                <X size={20} className='text-slate-500' />
              </button>
            </div>

            {/* List Notifikasi Berkelompok */}
            <div className='flex-1 overflow-y-auto p-5 pb-10 custom-scrollbar'>
              {notifications.length === 0 ? (
                <div className='text-center py-10 opacity-50'>
                  <Bell size={40} className='mx-auto mb-3 text-slate-400' />
                  <p className='text-sm font-semibold text-slate-500'>
                    Belum ada notifikasi baru
                  </p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {sortedDays.map((dayStr, dayIndex) => (
                    <div key={dayStr} className='space-y-3'>
                      {/* ========================================== */}
                      {/* PEMISAH TANGGAL (DATE DIVIDER)               */}
                      {/* ========================================== */}
                      <div className='flex items-center gap-3 mb-4 mt-2'>
                        <div className='h-px bg-slate-200 dark:bg-slate-800 flex-1'></div>
                        <span className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full'>
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
                          className={`p-4 rounded-2xl border flex gap-4 items-start ${bgMap[notif.type || 'info']}`}
                        >
                          <div className='bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm shrink-0'>
                            {iconMap[notif.type || 'info']}
                          </div>
                          <div className='w-full'>
                            <div className='flex justify-between items-start mb-1 gap-2'>
                              <h3 className='font-bold text-sm text-slate-800 dark:text-slate-100 leading-tight'>
                                {notif.title}
                              </h3>
                              {/* Label 'BARU' hanya muncul untuk item paling atas di "Hari Ini" */}
                              {dayIndex === 0 && index === 0 && (
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
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
