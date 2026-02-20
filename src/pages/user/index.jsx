'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
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
  Heart,
  Edit3,
  Camera,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';

// ─── KOMPONEN BOTTOM SHEET DRAWER ──────────────────────────────────────────────
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
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 sm:p-0'>
      <div
        ref={panelRef}
        className='bg-white dark:bg-slate-900 w-full max-w-md sm:rounded-t-[2rem] rounded-[2rem] sm:rounded-b-none p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-200 max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-700/50'
      >
        <div className='w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 shrink-0' />
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

  const [theme, setTheme] = useState('light');
  const [locationName, setLocationName] = useState('Memuat lokasi...');

  // State Profil Pengguna
  const [profileData, setProfileData] = useState({
    name: 'Tamu Allah',
    personalCode: 'Mode Tamu',
    avatar: null,
  });

  // State untuk form edit profil
  const [editName, setEditName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [activeDrawer, setActiveDrawer] = useState(null);

  // Fungsi menyensor Personal Code agar aman (contoh: 123456 -> 12***6)
  const maskPersonalCode = (code) => {
    if (!code || code.length < 4) return code;
    const firstTwo = code.substring(0, 2);
    const lastOne = code.substring(code.length - 1);
    const masked = '*'.repeat(code.length - 3);
    return `${firstTwo}${masked}${lastOne}`;
  };

  // Load Data User saat halaman dimuat
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('app_theme, username, avatar_url, location_city')
          .eq('personal_code', user.personal_code)
          .single();

        if (data && !error) {
          setTheme(data.app_theme || localStorage.getItem('theme') || 'light');

          const cityFromDB = data.location_city;
          const cityFromLocal = localStorage.getItem('user_city');
          setLocationName(cityFromDB || cityFromLocal || 'Lokasi belum diatur');

          const userName =
            data.username ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            'Hamba Allah';
          const userAvatar =
            data.avatar_url || user.user_metadata?.avatar_url || null;

          setProfileData({
            name: userName,
            personalCode: maskPersonalCode(user.personal_code),
            avatar: userAvatar,
          });
          setEditName(userName);
        }
      } catch (err) {
        console.error('Gagal mengambil data profil:', err);
        setLocationName(
          localStorage.getItem('user_city') || 'Lokasi belum diatur',
        );
      }
    };

    if (!loading) {
      if (user) {
        fetchUserProfile();
      } else {
        setTheme(localStorage.getItem('theme') || 'light');
        setLocationName(
          localStorage.getItem('user_city') || 'Lokasi belum diatur',
        );
      }
    }
  }, [user, loading]);

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (user) {
      await supabase
        .from('users')
        .update({ app_theme: newTheme })
        .eq('personal_code', user.personal_code);
    }

    setActiveDrawer(null);
  };

  const handleUploadPhoto = async (e) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.personal_code}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      setProfileData((prev) => ({ ...prev, avatar: publicUrl }));
      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('personal_code', user.personal_code);
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
      await supabase
        .from('users')
        .update({ username: editName })
        .eq('personal_code', user.personal_code);
      setProfileData((prev) => ({ ...prev, name: editName }));
      setActiveDrawer(null);
    } catch (error) {
      alert('Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirm = window.confirm('Apakah Anda yakin ingin keluar?');
    if (!confirm) return;
    if (user) await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    router.push('/auth/login');
  };

  const handleResetData = async () => {
    const confirm = window.confirm(
      'PERINGATAN!\n\nApakah Anda yakin ingin MENGHAPUS SEMUA DATA progres Anda?',
    );
    if (!confirm) return;

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

    if (user) {
      await supabase
        .from('users')
        .update({
          quran_bookmarks: [],
          quran_last_read: null,
          doa_bookmarks: [],
          doa_last_read: null,
          doa_custom: [],
          hadits_bookmarks: [],
          hadits_last_read: null,
          fiqih_bookmarks: [],
          fiqih_last_read: null,
        })
        .eq('personal_code', user.personal_code);
    }
    alert('Semua data progres berhasil direset.');
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

      {/* ── HEADER ── */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-4 transition-colors duration-300'>
        <button
          onClick={() => router.push('/')}
          className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
        >
          <ArrowLeft size={20} className='text-slate-600 dark:text-slate-300' />
        </button>
        <h1 className='font-bold text-xl text-[#1e3a8a] dark:text-white'>
          User Profile
        </h1>
      </header>

      <main className='max-w-md mx-auto p-5 space-y-6 mt-2'>
        {/* ── PROFILE SECTION ── */}
        <div className='bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5 relative transition-colors duration-300'>
          <button
            onClick={() =>
              user
                ? setActiveDrawer('edit_profil')
                : alert('Silakan login untuk mengubah profil.')
            }
            className='absolute top-4 right-4 p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-full transition-colors'
            title='Edit Profil'
          >
            <Edit3 size={16} />
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
            <h2 className='font-bold text-xl text-slate-800 dark:text-slate-100 truncate'>
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

        {/* ── APP SETTINGS ── */}
        <div>
          <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2'>
            Preferensi Aplikasi
          </p>
          <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300'>
            <button
              onClick={() => setActiveDrawer('tema')}
              className='w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800'
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-500 dark:text-amber-400'}`}
                >
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
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
              onClick={handleResetData}
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

        {/* ── SUPPORT & ABOUT ── */}
        <div>
          <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2'>
            Bantuan & Info
          </p>
          <div className='bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300'>
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
            <button
              onClick={() => setActiveDrawer('donasi')}
              className='w-full flex items-center justify-between p-4 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors group'
            >
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors'>
                  <Coffee size={18} />
                </div>
                <span className='font-semibold text-slate-700 dark:text-slate-200 text-sm group-hover:text-orange-600 dark:group-hover:text-orange-400'>
                  Traktir Saya Kopi
                </span>
              </div>
              <ChevronRight
                size={16}
                className='text-slate-300 dark:text-slate-600'
              />
            </button>
          </div>
        </div>

        {/* ── DEVELOPER PROFILE ── */}
        <div>
          <p className='text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-2'>
            Pengembang Aplikasi
          </p>
          <div className='bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800/80 dark:to-slate-950 rounded-3xl p-6 shadow-md text-white border border-transparent dark:border-slate-700/50'>
            <div className='flex items-center gap-4 mb-5'>
              <div className='w-14 h-14 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-[#1e3a8a] shadow-inner shrink-0 relative overflow-hidden'>
                <Image
                  src={'/developer-profile.jpg'}
                  alt='Profile'
                  fill
                  className='object-cover'
                />
              </div>
              <div>
                <h3 className='font-bold text-base'>Rifky Muhammad Prayudhi</h3>
                <p className='text-xs text-slate-400'>Software Engineer</p>
              </div>
            </div>

            <p className='text-[13px] text-slate-300 leading-relaxed mb-5'>
              Dibuat dengan sepenuh hati untuk membantu ibadah umat Muslim,
              khususnya di bulan suci Ramadhan.
            </p>

            <div className='flex items-center gap-3'>
              <a
                href='https://github.com/MoCheeseKy'
                target='_blank'
                rel='noreferrer'
                className='p-2.5 bg-slate-700 hover:bg-[#1e3a8a] rounded-xl transition-colors'
              >
                <Github size={18} />
              </a>
              <a
                href='https://www.linkedin.com/in/rifkymprayudhi'
                target='_blank'
                rel='noreferrer'
                className='p-2.5 bg-slate-700 hover:bg-[#0077b5] rounded-xl transition-colors'
              >
                <Linkedin size={18} />
              </a>
              <a
                href='https://www.instagram.com/mocheeseky'
                target='_blank'
                rel='noreferrer'
                className='p-2.5 bg-slate-700 hover:bg-[#e1306c] rounded-xl transition-colors'
              >
                <Instagram size={18} />
              </a>
              <a
                href='mailto:rifky.muhammadprayudhi@gmail.com'
                className='p-2.5 bg-slate-700 hover:bg-rose-500 rounded-xl transition-colors'
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* ── LOGOUT BUTTON ── */}
        {user && (
          <button
            onClick={handleLogout}
            className='w-full mt-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-500 dark:text-rose-400 font-bold rounded-2xl shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-800 transition-all flex items-center justify-center gap-2'
          >
            <LogOut size={18} /> Keluar Akun
          </button>
        )}

        <p className='text-center text-[10px] font-medium text-slate-400 dark:text-slate-600 mt-6 mb-2'>
          MyRamadhan App v1.0.0 &copy; {new Date().getFullYear()}
        </p>
      </main>

      {/* ========================================================= */}
      {/* KUMPULAN DRAWER / POPUP BOTTOM SHEET */}
      {/* ========================================================= */}

      {/* DRAWER: EDIT PROFIL */}
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

        <div className='space-y-4'>
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
          <button
            onClick={handleSaveProfile}
            disabled={isSaving || !editName.trim()}
            className='w-full py-3.5 bg-[#1e3a8a] dark:bg-blue-700 text-white font-bold rounded-xl hover:bg-[#162d6e] dark:hover:bg-blue-600 transition-colors disabled:opacity-50'
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </DrawerPanel>

      {/* DRAWER: TEMA APLIKASI */}
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

      {/* DRAWER: BANTUAN & FAQ */}
      <DrawerPanel
        open={activeDrawer === 'bantuan'}
        onClose={() => setActiveDrawer(null)}
        title='Bantuan & FAQ'
        icon={HelpCircle}
        titleColor='text-blue-500 dark:text-blue-400'
      >
        <div className='space-y-6'>
          <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
            <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
              <span className='text-blue-500 dark:text-blue-400 font-black'>
                Q.
              </span>{' '}
              Bagaimana cara menyimpan progres?
            </h4>
            <p className='text-[13px] mt-1.5'>
              Seluruh progres ibadah akan disimpan secara otomatis. Jika Anda
              login, data akan aman tersimpan di <i>cloud database</i>.
            </p>
          </div>
          <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
            <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
              <span className='text-blue-500 dark:text-blue-400 font-black'>
                Q.
              </span>{' '}
              Apakah aplikasi web ini bisa offline?
            </h4>
            <p className='text-[13px] mt-1.5'>
              Saat ini, website masih membutuhkan koneksi internet untuk memuat
              data Al-Qur'an dan Doa. Namun kami menyimpan progres seperti
              Tracker di <i>cache</i> perangkat agar sangat hemat kuota.
            </p>
          </div>
        </div>
      </DrawerPanel>

      {/* DRAWER: KEBIJAKAN PRIVASI */}
      <DrawerPanel
        open={activeDrawer === 'privasi'}
        onClose={() => setActiveDrawer(null)}
        title='Kebijakan Privasi'
        icon={Shield}
        titleColor='text-emerald-500 dark:text-emerald-400'
      >
        <div className='space-y-4'>
          <p>Kenyamanan dan privasi Anda adalah prioritas utama kami:</p>
          <div className='flex gap-3 items-start'>
            <div className='w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1'>
              1
            </div>
            <div>
              <h4 className='font-bold text-slate-800 dark:text-slate-100'>
                Penyimpanan Transparan
              </h4>
              <p className='text-[13px] mt-0.5'>
                Semua data pribadi berada di dalam memori penyimpanan perangkat
                Anda sendiri saat mode tamu.
              </p>
            </div>
          </div>
          <div className='flex gap-3 items-start'>
            <div className='w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1'>
              2
            </div>
            <div>
              <h4 className='font-bold text-slate-800 dark:text-slate-100'>
                Keamanan Data
              </h4>
              <p className='text-[13px] mt-0.5'>
                Saat menggunakan <i>Personal Code</i>, data preferensi ibadah
                disimpan di database ber-enkripsi tinggi agar progres tidak
                hilang.
              </p>
            </div>
          </div>
        </div>
      </DrawerPanel>

      {/* DRAWER: TENTANG APLIKASI */}
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
            Version 1.0.0
          </p>
        </div>
        <p className='mb-3'>
          <strong>MyRamadhan</strong> adalah inisiatif independen yang lahir
          dari keinginan untuk memiliki asisten ibadah digital yang bersih,
          ringan, dan modern.
        </p>
      </DrawerPanel>

      {/* DRAWER: TRAKTIR KOPI */}
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
            Kalau aplikasi ini ngebantu ibadah, hafalan, atau nemenin Ramadhan
            kamu jadi lebih bermakna, kamu bisa traktir kopi sebagai bentuk
            support kecil biar kami makin semangat ngembanginnya.
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
