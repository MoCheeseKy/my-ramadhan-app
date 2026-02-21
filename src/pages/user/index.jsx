'use client';

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, LogOut, LogIn } from 'lucide-react';

import useUser from '@/hooks/useUser';
import useAppMode from '@/hooks/useAppMode';
import useUserProfile from '@/hooks/useUserProfile';

// Komponen UI
import UserProfileCard from '@/components/User/UserProfileCard';
import PreferensiMenuSection from '@/components/User/PreferensiMenuSection';
import BantuanMenuSection from '@/components/User/BantuanMenuSection';

// Drawers
import DrawerConfirmReset from '@/components/User/Drawer/DrawerConfirmReset';
import DrawerConfirmLogout from '@/components/User/Drawer/DrawerConfirmLogout';
import DrawerEditProfil from '@/components/User/Drawer/DrawerEditProfil';
import DrawerDataManagement from '@/components/User/Drawer/DrawerDataManagement';
import DrawerTema from '@/components/User/Drawer/DrawerTema';
import DrawerBantuan from '@/components/User/Drawer/DrawerBantuan';
import DrawerPrivasi from '@/components/User/Drawer/DrawerPrivasi';
import DrawerTentang from '@/components/User/Drawer/DrawerTentang';
import DrawerPengembang from '@/components/User/Drawer/DrawerPengembang';
import DrawerDonasi from '@/components/User/Drawer/DrawerDonasi';

/**
 * Enum string untuk nama drawer — satu state string menggantikan 10 boolean.
 */
const DRAWERS = {
  EDIT_PROFIL: 'edit_profil',
  TEMA: 'tema',
  DATA_MANAGEMENT: 'data_management',
  CONFIRM_RESET: 'confirm_reset',
  CONFIRM_LOGOUT: 'confirm_logout',
  BANTUAN: 'bantuan',
  PRIVASI: 'privasi',
  TENTANG: 'tentang',
  PENGEMBANG: 'pengembang',
  DONASI: 'donasi',
};

export default function UserProfile() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { isPWA } = useAppMode();

  const [activeDrawer, setActiveDrawer] = useState(null);
  const closeDrawer = () => setActiveDrawer(null);

  const {
    theme,
    locationName,
    profileData,
    editName,
    setEditName,
    editLocation,
    setEditLocation,
    isUploading,
    isSaving,
    toggleTheme,
    handleUploadPhoto,
    handleSaveProfile,
    handleExportData,
    handleImportData,
    executeLogout,
    executeResetData,
  } = useUserProfile(user, isPWA);

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

      {/* Header sticky */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4'>
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

      {/* Konten utama */}
      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 space-y-6 mt-2'>
        {/* Kartu profil */}
        <UserProfileCard
          user={user}
          profileData={profileData}
          locationName={locationName}
          onEdit={() => setActiveDrawer(DRAWERS.EDIT_PROFIL)}
        />

        {/* Grid 2 kolom di desktop */}
        <div className='flex flex-col md:grid md:grid-cols-2 gap-6 items-start'>
          {/* Kolom kiri: preferensi + login/logout */}
          <div className='space-y-6 w-full order-1'>
            <PreferensiMenuSection
              theme={theme}
              onOpenTema={() => setActiveDrawer(DRAWERS.TEMA)}
              onOpenData={() => setActiveDrawer(DRAWERS.DATA_MANAGEMENT)}
              onOpenReset={() => setActiveDrawer(DRAWERS.CONFIRM_RESET)}
            />
            <div className='w-full'>
              {user ? (
                <button
                  onClick={() => setActiveDrawer(DRAWERS.CONFIRM_LOGOUT)}
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

          {/* Kolom kanan: bantuan & info */}
          <div className='w-full order-2'>
            <BantuanMenuSection
              onOpenBantuan={() => setActiveDrawer(DRAWERS.BANTUAN)}
              onOpenPrivasi={() => setActiveDrawer(DRAWERS.PRIVASI)}
              onOpenTentang={() => setActiveDrawer(DRAWERS.TENTANG)}
              onOpenPengembang={() => setActiveDrawer(DRAWERS.PENGEMBANG)}
              onOpenDonasi={() => setActiveDrawer(DRAWERS.DONASI)}
            />
          </div>
        </div>

        <p className='text-center text-[10px] font-medium text-slate-400 dark:text-slate-600 mt-6 md:mt-10 mb-2'>
          MyRamadhan App v1.1.0 &copy; {new Date().getFullYear()}
        </p>
      </main>

      {/* ── Drawers ── */}
      <DrawerConfirmReset
        open={activeDrawer === DRAWERS.CONFIRM_RESET}
        onClose={closeDrawer}
        onConfirm={() => executeResetData(router)}
      />
      <DrawerConfirmLogout
        open={activeDrawer === DRAWERS.CONFIRM_LOGOUT}
        onClose={closeDrawer}
        onConfirm={() => executeLogout(router)}
      />
      <DrawerEditProfil
        open={activeDrawer === DRAWERS.EDIT_PROFIL}
        onClose={closeDrawer}
        profileData={profileData}
        editName={editName}
        setEditName={setEditName}
        editLocation={editLocation}
        setEditLocation={setEditLocation}
        isUploading={isUploading}
        isSaving={isSaving}
        onUploadPhoto={handleUploadPhoto}
        onSaveProfile={handleSaveProfile}
      />
      <DrawerDataManagement
        open={activeDrawer === DRAWERS.DATA_MANAGEMENT}
        onClose={closeDrawer}
        onExport={handleExportData}
        onImport={handleImportData}
      />
      <DrawerTema
        open={activeDrawer === DRAWERS.TEMA}
        onClose={closeDrawer}
        theme={theme}
        onToggleTheme={(t) => {
          toggleTheme(t);
          closeDrawer();
        }}
      />
      <DrawerBantuan
        open={activeDrawer === DRAWERS.BANTUAN}
        onClose={closeDrawer}
      />
      <DrawerPrivasi
        open={activeDrawer === DRAWERS.PRIVASI}
        onClose={closeDrawer}
      />
      <DrawerTentang
        open={activeDrawer === DRAWERS.TENTANG}
        onClose={closeDrawer}
      />
      <DrawerPengembang
        open={activeDrawer === DRAWERS.PENGEMBANG}
        onClose={closeDrawer}
      />
      <DrawerDonasi
        open={activeDrawer === DRAWERS.DONASI}
        onClose={closeDrawer}
      />
    </div>
  );
}
