'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  LogOut,
  MapPin,
  Trash2,
  HelpCircle,
  Shield,
  Coffee,
  Moon,
  Sun,
  Info,
  ChevronRight,
  User as UserIcon,
  Github,
  Linkedin,
  Instagram,
  Mail,
  X,
  Edit3,
  Camera,
  Loader2,
  KeyRound,
  Database,
  Download,
  Upload,
  LogIn,
  Search,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';
import useAppMode from '@/hook/useAppMode';
import { StorageService } from '@/lib/storageService';

const CITIES = [
  'Ambon',
  'Balikpapan',
  'Banda Aceh',
  'Bandar Lampung',
  'Bandung',
  'Banjarmasin',
  'Batam',
  'Bekasi',
  'Bengkulu',
  'Bogor',
  'Cirebon',
  'Denpasar',
  'Depok',
  'Gorontalo',
  'Jakarta',
  'Jambi',
  'Jayapura',
  'Kendari',
  'Kupang',
  'Madiun',
  'Magelang',
  'Makassar',
  'Malang',
  'Manado',
  'Mataram',
  'Medan',
  'Padang',
  'Palangkaraya',
  'Palembang',
  'Palu',
  'Pangkalpinang',
  'Pekanbaru',
  'Pontianak',
  'Samarinda',
  'Semarang',
  'Serang',
  'Surabaya',
  'Surakarta',
  'Tangerang',
  'Tanjungpinang',
  'Tarakan',
  'Ternate',
  'Yogyakarta',
];

// ─── KOMPONEN BOTTOM SHEET / MODAL ───────────────────────────────────────────
function DrawerPanel({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  titleColor = 'text-[#1e3a8a] dark:text-blue-400',
  hideFooterButton = false,
}) {
  const panelRef = useRef(null);

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
    // items-end untuk HP, md:items-center untuk Tablet/Desktop agar ke tengah
    <div className='fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-0 md:p-4'>
      {/* rounded-t untuk HP, md:rounded-[2rem] penuh untuk Desktop */}
      <div
        ref={panelRef}
        className='bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2rem] rounded-b-none md:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200 max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-700/50'
      >
        {/* Garis drag handle (Hanya tampil di HP) */}
        <div className='w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 shrink-0 md:hidden' />

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
}

// ─── HALAMAN UTAMA USER PROFILE ───────────────────────────────────────────────
export default function UserProfile() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { isPWA } = useAppMode();

  const [theme, setTheme] = useState('light');
  const [locationName, setLocationName] = useState('Memuat lokasi...');

  const [profileData, setProfileData] = useState({
    name: 'Tamu Allah',
    personalCode: 'Mode Tamu',
    avatar: null,
  });

  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [searchCityTerm, setSearchCityTerm] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const importFileRef = useRef(null);

  const [activeDrawer, setActiveDrawer] = useState(null);

  const maskPersonalCode = (code) => {
    if (!code || code.length < 4) return code;
    return `${code.substring(0, 2)}${'*'.repeat(code.length - 3)}${code.substring(code.length - 1)}`;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await StorageService.getProfile(user.personal_code, isPWA);
        if (data) {
          setTheme(data.app_theme || localStorage.getItem('theme') || 'light');
          const finalCity =
            data.location_city ||
            localStorage.getItem('user_city') ||
            'Jakarta';
          setLocationName(finalCity);
          setEditLocation(finalCity);

          const userName =
            data.username ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            'Hamba Allah';
          setProfileData({
            name: userName,
            personalCode: maskPersonalCode(user.personal_code),
            avatar: data.avatar_url || user.user_metadata?.avatar_url || null,
          });
          setEditName(userName);
        }
      } catch (err) {
        const fbCity = localStorage.getItem('user_city') || 'Jakarta';
        setLocationName(fbCity);
        setEditLocation(fbCity);
      }
    };

    if (!loading) {
      if (user) fetchUserProfile();
      else {
        setTheme(localStorage.getItem('theme') || 'light');
        setLocationName(localStorage.getItem('user_city') || 'Jakarta');
      }
    }
  }, [user, loading, isPWA]);

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    if (user)
      await StorageService.saveProfile(
        user.personal_code,
        { app_theme: newTheme },
        isPWA,
      );
    setActiveDrawer(null);
  };

  const handleUploadPhoto = async (e) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      let publicUrl = null;
      if (isPWA) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            publicUrl = reader.result;
            resolve();
          };
          reader.onerror = (err) => reject(err);
        });
      } else {
        const fileName = `${user.personal_code}-${Math.random()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        publicUrl = supabase.storage.from('avatars').getPublicUrl(fileName)
          .data.publicUrl;
      }
      setProfileData((prev) => ({ ...prev, avatar: publicUrl }));
      await StorageService.saveProfile(
        user.personal_code,
        { avatar_url: publicUrl },
        isPWA,
      );
    } catch (error) {
      alert('Gagal mengunggah foto: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return alert('Silakan login terlebih dahulu!');
    setIsSaving(true);
    try {
      await StorageService.saveProfile(
        user.personal_code,
        { username: editName, location_city: editLocation },
        isPWA,
      );
      localStorage.setItem('user_city', editLocation);
      setProfileData((prev) => ({ ...prev, name: editName }));
      setLocationName(editLocation);
      setActiveDrawer(null);
      if (window.confirm('Profil disimpan! Halaman akan direfresh.'))
        window.location.reload();
    } catch (error) {
      alert('Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCities = CITIES.filter((city) =>
    city.toLowerCase().includes(searchCityTerm.toLowerCase()),
  );

  const handleExportData = () => {
    const dataToExport = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('myRamadhan_') ||
          [
            'ramadhan_tracker',
            'daily_journal',
            'haid_tracker',
            'user_city',
            'theme',
          ].includes(key))
      ) {
        dataToExport[key] = localStorage.getItem(key);
      }
    }
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dataToExport));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute(
      'download',
      `myramadhan_backup_${new Date().getTime()}.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setActiveDrawer(null);
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        Object.keys(importedData).forEach((key) =>
          localStorage.setItem(key, importedData[key]),
        );
        alert('Data berhasil diimpor! Halaman akan dimuat ulang.');
        window.location.reload();
      } catch (err) {
        alert('Format file tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const executeLogout = async () => {
    if (!isPWA && user) await supabase.auth.signOut();
    localStorage.removeItem('myRamadhan_user');
    if (!isPWA) router.push('/auth/login');
    else window.location.reload();
  };

  const executeResetData = async () => {
    const keysToRemove = [
      'myRamadhan_quran_bookmarks',
      'myRamadhan_quran_lastread',
      'myRamadhan_doa_bookmarks',
      'myRamadhan_doa_lastread',
      'myRamadhan_doa_custom',
      'myRamadhan_doa_settings',
      'myRamadhan_hadits_bookmarks',
      'myRamadhan_hadits_lastread',
      'myRamadhan_fiqih_bookmarks',
      'myRamadhan_fiqih_lastread',
      'ramadhan_tracker',
      'daily_journal',
      'haid_tracker',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    if (user) await StorageService.clearAllData(user.personal_code, isPWA);
    router.reload();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 flex justify-center items-center'>
        <div className='w-8 h-8 border-4 border-[#1e3a8a] dark:border-blue-400 border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 transition-colors duration-300'>
      <Head>
        <title>Profil Saya - MyRamadhan</title>
      </Head>

      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-4'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center gap-3 w-full'>
          <button
            onClick={() => router.push('/')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <ArrowLeft
              size={20}
              className='text-slate-600 dark:text-slate-300'
            />
          </button>
          <h1 className='font-bold text-xl text-[#1e3a8a] dark:text-white'>
            User Profile
          </h1>
        </div>
      </header>

      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 space-y-6 mt-2'>
        <div className='bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 relative'>
          <button
            onClick={() =>
              user ? setActiveDrawer('edit_profil') : router.push('/auth/login')
            }
            className='absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-full transition-colors'
            title={user ? 'Edit Profil' : 'Login'}
          >
            {user ? <Edit3 size={16} /> : <LogIn size={16} />}
          </button>

          <div className='w-20 h-20 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center text-[#1e3a8a] dark:text-blue-400 shadow-inner shrink-0 relative overflow-hidden'>
            {profileData.avatar ? (
              <Image
                src={profileData.avatar}
                alt='Profile'
                fill
                className='object-cover'
              />
            ) : (
              <UserIcon size={36} strokeWidth={1.5} />
            )}
          </div>
          <div className='flex-1 overflow-hidden pr-4'>
            <h2 className='font-bold text-xl md:text-2xl text-slate-800 dark:text-slate-100 truncate'>
              {profileData.name}
            </h2>
            <div className='flex items-center gap-1.5 mb-2'>
              <KeyRound
                size={12}
                className='text-slate-400 dark:text-slate-500'
              />
              <p className='text-sm font-medium text-slate-500 dark:text-slate-400 font-mono tracking-wider'>
                ID: {profileData.personalCode}
              </p>
            </div>
            <div className='flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 w-fit px-2.5 py-1 rounded-lg'>
              <MapPin size={12} />
              <span className='truncate max-w-[120px]'>{locationName}</span>
            </div>
          </div>
        </div>

        {/* BUNGKUS DENGAN GRID DI DESKTOP */}
        <div className='flex flex-col md:grid md:grid-cols-2 gap-6 items-start'>
          {/* KOLOM KIRI: PREFERENSI & LOGOUT */}
          <div className='space-y-6 w-full order-1'>
            <div>
              <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2'>
                Preferensi Aplikasi
              </p>
              <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden'>
                <button
                  onClick={() => setActiveDrawer('tema')}
                  className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400'}`}
                    >
                      {theme === 'dark' ? (
                        <Moon size={18} />
                      ) : (
                        <Sun size={18} />
                      )}
                    </div>
                    <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm'>
                      Tema Aplikasi
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-slate-400 dark:text-slate-500 font-medium'>
                      {theme === 'dark' ? 'Gelap' : 'Terang'}
                    </span>
                    <ChevronRight
                      size={16}
                      className='text-slate-300 dark:text-slate-600'
                    />
                  </div>
                </button>
                <button
                  onClick={() => setActiveDrawer('data_management')}
                  className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800'
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'>
                      <Database size={18} />
                    </div>
                    <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm'>
                      Manajemen Data
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className='text-slate-300 dark:text-slate-600'
                  />
                </button>
                <button
                  onClick={() => setActiveDrawer('confirm_reset')}
                  className='w-full flex items-center justify-between p-4 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group'
                >
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors'>
                      <Trash2 size={18} />
                    </div>
                    <span className='font-semibold text-rose-600 dark:text-rose-400 text-sm'>
                      Reset Semua Data
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className='text-rose-300 dark:text-rose-700'
                  />
                </button>
              </div>
            </div>

            {/* LOGIN / LOGOUT (Gabung di Kolom Kiri Bawah agar seimbang) */}
            <div className='w-full'>
              {user ? (
                <button
                  onClick={() => setActiveDrawer('confirm_logout')}
                  className='w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-500 dark:text-rose-400 font-bold rounded-2xl shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-800 transition-all flex items-center justify-center gap-2'
                >
                  <LogOut size={18} /> Keluar Akun
                </button>
              ) : (
                <button
                  onClick={() => router.push('/auth/login')}
                  className='w-full py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-md hover:bg-blue-800 transition-all flex items-center justify-center gap-2'
                >
                  <LogIn size={18} /> Login / Daftar Sekarang
                </button>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: BANTUAN & INFO (Termasuk Pengembang) */}
          <div className='w-full order-2'>
            <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2'>
              Bantuan & Info
            </p>
            <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col'>
              <button
                onClick={() => setActiveDrawer('bantuan')}
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
              <button
                onClick={() => setActiveDrawer('privasi')}
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
              <button
                onClick={() => setActiveDrawer('tentang')}
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
              {/* TOMBOL PENGEMBANG BARU */}
              <button
                onClick={() => setActiveDrawer('pengembang')}
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
              <button
                onClick={() =>
                  window.open(
                    'https://docs.google.com/forms/d/e/1FAIpQLSeB0TrSZDDrJ-xbmEjdiH5mV30Z4A28PFwSfAmTY0Y_qV265A/viewform?usp=publish-editor',
                    '_blank',
                  )
                }
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
              </button>
              <button
                onClick={() => setActiveDrawer('donasi')}
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
        </div>

        <p className='text-center text-[10px] font-medium text-slate-400 dark:text-slate-600 mt-6 md:mt-10 mb-2'>
          MyRamadhan App v1.1.0 &copy; {new Date().getFullYear()}
        </p>
      </main>

      {/* --- DRAWERS TETAP SAMA (DENGAN TAMBAHAN items-center UNTUK DESKTOP) --- */}
      <DrawerPanel
        open={activeDrawer === 'confirm_reset'}
        onClose={() => setActiveDrawer(null)}
        title='Reset Semua Data'
        icon={AlertTriangle}
        titleColor='text-rose-600 dark:text-rose-400'
        hideFooterButton
      >
        <div className='flex flex-col items-center text-center mt-2'>
          <div className='w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-500 flex items-center justify-center rounded-full mb-4'>
            <Trash2 size={32} />
          </div>
          <p className='text-sm text-slate-600 dark:text-slate-300 leading-relaxed px-2'>
            <strong>PERINGATAN!</strong> Apakah Anda yakin ingin menghapus semua
            data progres ibadah, jurnal, dan preferensi Anda? <br />
            <br />
            <span className='text-rose-600 dark:text-rose-400 font-semibold'>
              Tindakan ini permanen dan data tidak dapat dikembalikan.
            </span>
          </p>
          <div className='flex gap-3 w-full mt-6'>
            <button
              onClick={() => setActiveDrawer(null)}
              className='flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
            >
              Batal
            </button>
            <button
              onClick={executeResetData}
              className='flex-1 py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-md'
            >
              Ya, Hapus Semua
            </button>
          </div>
        </div>
      </DrawerPanel>

      <DrawerPanel
        open={activeDrawer === 'confirm_logout'}
        onClose={() => setActiveDrawer(null)}
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
              onClick={() => setActiveDrawer(null)}
              className='flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
            >
              Batal
            </button>
            <button
              onClick={executeLogout}
              className='flex-1 py-3.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-md'
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </DrawerPanel>

      <DrawerPanel
        open={activeDrawer === 'edit_profil'}
        onClose={() => setActiveDrawer(null)}
        title='Edit Profil'
        icon={Edit3}
        titleColor='text-slate-800 dark:text-slate-100'
        hideFooterButton
      >
        <div className='flex flex-col items-center mb-6 mt-2'>
          <div className='relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-md overflow-hidden mb-3'>
            {profileData.avatar ? (
              <Image
                src={profileData.avatar}
                alt='Avatar'
                fill
                className='object-cover'
              />
            ) : (
              <UserIcon
                size={40}
                className='text-slate-400 dark:text-slate-500'
              />
            )}
            {isUploading && (
              <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                <Loader2 className='animate-spin text-white' size={24} />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className='text-xs font-bold text-[#1e3a8a] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-4 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2'
          >
            <Camera size={14} />{' '}
            {isUploading ? 'Mengunggah...' : 'Ubah Foto Profil'}
          </button>
          <input
            type='file'
            accept='image/png, image/jpeg, image/webp'
            ref={fileInputRef}
            onChange={handleUploadPhoto}
            className='hidden'
          />
        </div>
        <div className='space-y-4 pb-4'>
          <div>
            <label className='text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block'>
              Username
            </label>
            <input
              type='text'
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className='w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
              placeholder='Masukkan nama pengguna'
            />
          </div>
          <div>
            <label className='text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block'>
              Lokasi Kota (Untuk Jadwal Sholat)
            </label>
            <button
              onClick={() => setIsCityPickerOpen(!isCityPickerOpen)}
              className={`w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border transition-all ${isCityPickerOpen ? 'border-[#1e3a8a] dark:border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <div className='flex items-center gap-3 text-left'>
                <MapPin
                  size={18}
                  className='text-slate-500 dark:text-slate-400'
                />
                <span className='font-semibold text-sm text-slate-800 dark:text-slate-100'>
                  {editLocation || 'Pilih Kota'}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform ${isCityPickerOpen ? 'rotate-180 text-[#1e3a8a] dark:text-blue-400' : ''}`}
              />
            </button>
            <AnimatePresence>
              {isCityPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className='overflow-hidden'
                >
                  <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm'>
                    <div className='relative mb-2'>
                      <Search
                        size={14}
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                      />
                      <input
                        type='text'
                        placeholder='Cari kota...'
                        value={searchCityTerm}
                        onChange={(e) => setSearchCityTerm(e.target.value)}
                        className='w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500'
                      />
                    </div>
                    <div className='max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              setEditLocation(city);
                              setIsCityPickerOpen(false);
                              setSearchCityTerm('');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${editLocation === city ? 'bg-blue-50 dark:bg-blue-900/40 text-[#1e3a8a] dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                          >
                            {city}{' '}
                            {editLocation === city && (
                              <CheckCircle2
                                size={16}
                                className='text-[#1e3a8a] dark:text-blue-400'
                              />
                            )}
                          </button>
                        ))
                      ) : (
                        <p className='text-center text-xs text-slate-400 py-3'>
                          Kota tidak ditemukan
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving || !editName.trim()}
            className='w-full py-3.5 mt-4 bg-[#1e3a8a] dark:bg-blue-700 text-white font-bold rounded-xl hover:bg-[#162d6e] dark:hover:bg-blue-600 transition-colors disabled:opacity-50'
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </DrawerPanel>

      <DrawerPanel
        open={activeDrawer === 'data_management'}
        onClose={() => setActiveDrawer(null)}
        title='Manajemen Data'
        icon={Database}
        titleColor='text-indigo-600 dark:text-indigo-400'
      >
        <p className='text-slate-500 dark:text-slate-400 mb-5'>
          Pindahkan data Jurnal, Tracker, dan preferensi Anda jika ingin
          berpindah perangkat atau beralih ke Mode PWA secara offline.
        </p>
        <div className='space-y-4'>
          <div className='bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50'>
            <h4 className='font-bold text-sm text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-2'>
              <Download size={16} /> Export (Backup) Data
            </h4>
            <p className='text-xs text-indigo-600/80 dark:text-indigo-400/80 mb-3'>
              Unduh semua progres dan data lokal Anda ke dalam file `.json`.
            </p>
            <button
              onClick={handleExportData}
              className='w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors'
            >
              Unduh Backup Sekarang
            </button>
          </div>
          <div className='bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/50'>
            <h4 className='font-bold text-sm text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-2'>
              <Upload size={16} /> Import (Restore) Data
            </h4>
            <p className='text-xs text-emerald-600/80 dark:text-emerald-400/80 mb-3'>
              Punya file backup? Unggah di sini untuk memulihkan semua data
              Anda.
            </p>
            <input
              type='file'
              accept='.json'
              ref={importFileRef}
              onChange={handleImportData}
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

      <DrawerPanel
        open={activeDrawer === 'tema'}
        onClose={() => setActiveDrawer(null)}
        title='Tema Aplikasi'
        icon={Sun}
        titleColor='text-amber-500 dark:text-amber-400'
      >
        <p className='text-slate-500 dark:text-slate-400'>
          Pilih tema antarmuka aplikasi yang paling nyaman untuk mata Anda.
        </p>
        <div className='grid grid-cols-2 gap-3 mt-4'>
          <button
            onClick={() => toggleTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-[#1e3a8a] dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-[#1e3a8a] dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
          >
            <Sun size={28} className='mb-2' />
            <span className='font-bold text-sm'>Mode Terang</span>
          </button>
          <button
            onClick={() => toggleTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-[#1e3a8a] dark:border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-[#1e3a8a] dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
          >
            <Moon size={28} className='mb-2' />
            <span className='font-bold text-sm'>Mode Gelap</span>
          </button>
        </div>
      </DrawerPanel>

      <DrawerPanel
        open={activeDrawer === 'bantuan'}
        onClose={() => setActiveDrawer(null)}
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
              Versi PWA menyimpan Jurnal dan Tracker 100% secara offline di
              memori HP Anda. Ini membuatnya jauh lebih cepat, privat, dan hemat
              kuota dibanding versi Web.
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
              <span className='text-blue-500 font-black'>Q.</span> Bagaimana
              cara pindah HP tanpa hilang data?
            </h4>
            <p className='text-[13px] mt-1.5'>
              Gunakan fitur "Manajemen Data" untuk meng-ekspor data Anda menjadi
              file Backup, lalu impor file tersebut di HP Anda yang baru.
            </p>
          </div>
        </div>
      </DrawerPanel>

      <DrawerPanel
        open={activeDrawer === 'privasi'}
        onClose={() => setActiveDrawer(null)}
        title='Kebijakan Privasi'
        icon={Shield}
        titleColor='text-emerald-500 dark:text-emerald-400'
      >
        <div className='space-y-4'>
          <p>Kenyamanan dan privasi Anda adalah prioritas mutlak kami:</p>
          <div className='flex gap-3 items-start'>
            <div className='w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1'>
              1
            </div>
            <div>
              <h4 className='font-bold text-slate-800 dark:text-slate-100'>
                Mode Privat 100% (PWA)
              </h4>
              <p className='text-[13px] mt-0.5'>
                Saat diinstal sebagai aplikasi, semua tulisan Jurnal yang
                sensitif dan catatan Tracker hanya akan disimpan secara lokal di
                HP Anda. Kami tidak bisa melihat atau membacanya.
              </p>
            </div>
          </div>
          <div className='flex gap-3 items-start'>
            <div className='w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1'>
              2
            </div>
            <div>
              <h4 className='font-bold text-slate-800 dark:text-slate-100'>
                Keamanan Data Web
              </h4>
              <p className='text-[13px] mt-0.5'>
                Jika Anda menggunakan versi Web dengan login *Personal Code*,
                preferensi Anda akan disimpan di database Cloud ber-enkripsi
                standar industri.
              </p>
            </div>
          </div>
          <div className='flex gap-3 items-start'>
            <div className='w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1'>
              3
            </div>
            <div>
              <h4 className='font-bold text-slate-800 dark:text-slate-100'>
                Tanpa Jual Beli Data
              </h4>
              <p className='text-[13px] mt-0.5'>
                Aplikasi ini tidak memiliki iklan pelacak dan kami tidak akan
                pernah menjual data personal Anda kepada pihak ketiga mana pun.
              </p>
            </div>
          </div>
        </div>
      </DrawerPanel>

      <DrawerPanel
        open={activeDrawer === 'tentang'}
        onClose={() => setActiveDrawer(null)}
        title='Tentang Aplikasi'
        icon={Info}
        titleColor='text-purple-500 dark:text-purple-400'
      >
        <div className='text-center mb-6'>
          <div className='w-20 h-20 bg-gradient-to-tr from-[#1e3a8a] to-indigo-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl'>
            <Moon size={36} strokeWidth={1.5} />
          </div>
          <h3 className='font-bold text-2xl text-slate-800 dark:text-slate-100 tracking-tight'>
            MyRamadhan
          </h3>
          <p className='text-xs text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase mt-1'>
            Version 1.1.0 (PWA Ready)
          </p>
        </div>
        <p className='mb-3 text-[13px] leading-relaxed'>
          <strong>MyRamadhan</strong> adalah inisiatif independen yang dibangun
          untuk menjadi "Asisten Ibadah Personal" Anda. Aplikasi ini dirancang
          seringan mungkin, bebas dari iklan yang mengganggu, dan mengedepankan
          pendekatan *Privacy-First* (privasi utama).
        </p>
        <p className='text-[13px] leading-relaxed'>
          Semoga aplikasi ini dapat menjadi teman yang baik dalam meraih pahala
          maksimal selama bulan suci Ramadhan maupun di bulan-bulan lainnya.
        </p>
      </DrawerPanel>

      <DrawerPanel
        open={activeDrawer === 'pengembang'}
        onClose={() => setActiveDrawer(null)}
        title='Pengembang Aplikasi'
        icon={UserIcon}
        titleColor='text-indigo-500 dark:text-indigo-400'
      >
        <div className='flex items-center gap-4 mb-5 mt-2'>
          <div className='w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-[#1e3a8a] shadow-inner shrink-0 relative overflow-hidden'>
            <Image
              src={'/developer-profile.jpg'}
              alt='Profile'
              fill
              className='object-cover'
            />
          </div>
          <div>
            <h3 className='font-bold text-base text-slate-800 dark:text-slate-100'>
              Rifky Muhammad Prayudhi
            </h3>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Software Engineer
            </p>
          </div>
        </div>
        <p className='text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700'>
          Dibuat secara independen di waktu luang dengan tujuan membantu ibadah
          umat Muslim, khususnya di bulan suci Ramadhan, agar menjadi lebih
          mudah dan bermakna.
        </p>

        <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-3'>
          Kunjungi Profil Saya
        </p>
        <div className='flex items-center justify-center gap-3'>
          <a
            href='https://github.com/MoCheeseKy'
            target='_blank'
            rel='noreferrer'
            className='p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#1e3a8a] hover:text-white text-slate-600 dark:text-slate-300 rounded-2xl transition-colors'
          >
            <Github size={20} />
          </a>
          <a
            href='https://www.linkedin.com/in/rifkymprayudhi'
            target='_blank'
            rel='noreferrer'
            className='p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#0077b5] hover:text-white text-slate-600 dark:text-slate-300 rounded-2xl transition-colors'
          >
            <Linkedin size={20} />
          </a>
          <a
            href='https://www.instagram.com/mocheeseky'
            target='_blank'
            rel='noreferrer'
            className='p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-[#e1306c] hover:text-white text-slate-600 dark:text-slate-300 rounded-2xl transition-colors'
          >
            <Instagram size={20} />
          </a>
          <a
            href='mailto:rifky.muhammadprayudhi@gmail.com'
            className='p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 rounded-2xl transition-colors'
          >
            <Mail size={20} />
          </a>
        </div>
      </DrawerPanel>

      <DrawerPanel
        open={activeDrawer === 'donasi'}
        onClose={() => setActiveDrawer(null)}
        titleColor='text-rose-500 dark:text-rose-400'
      >
        <div className='text-center mb-5 mt-2'>
          <div className='w-16 h-16 bg-orange-100 dark:bg-orange-900/40 text-orange-500 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 relative'>
            <Coffee size={28} />
            <span className='absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse'></span>
          </div>
          <h3 className='font-bold text-xl text-slate-800 dark:text-slate-100 leading-tight'>
            Assalamu'alaikum!
          </h3>
        </div>
        <div className='space-y-3 mb-6'>
          <p>
            Aplikasi <strong>MyRamadhan</strong> ini saya bangun secara mandiri
            di waktu luang, dan saya berkomitmen menjaganya tetap{' '}
            <strong>gratis dan bebas dari iklan</strong>.
          </p>
          <p>
            Kalau aplikasi ini ngebantu ibadah dan nemenin Ramadhan kamu jadi
            lebih bermakna, kamu bisa traktir kopi biar saya semakin semangat
            ngerawatnya!
          </p>
        </div>
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
    </div>
  );
}
