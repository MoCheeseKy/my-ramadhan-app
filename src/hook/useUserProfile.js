import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StorageService } from '@/lib/storageService';

/**
 * useUserProfile — mengelola seluruh state dan logika halaman User Profile:
 * - Load profil dari storage
 * - Edit profil (nama, lokasi)
 * - Upload foto avatar
 * - Toggle tema
 * - Export / Import data lokal
 * - Logout & reset data
 *
 * @param {object|null} user    - Data user dari useUser()
 * @param {boolean}     isPWA   - Mode PWA atau web
 */
const useUserProfile = (user, isPWA) => {
  const [theme, setTheme] = useState('light');
  const [locationName, setLocationName] = useState('Memuat lokasi...');

  const [profileData, setProfileData] = useState({
    name: 'Tamu Allah',
    personalCode: 'Mode Tamu',
    avatar: null,
  });

  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const maskPersonalCode = (code) => {
    if (!code || code.length < 4) return code;
    return `${code.substring(0, 2)}${'*'.repeat(code.length - 3)}${code.substring(code.length - 1)}`;
  };

  // Load profil saat user atau mode berubah
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
      } catch {
        const fbCity = localStorage.getItem('user_city') || 'Jakarta';
        setLocationName(fbCity);
        setEditLocation(fbCity);
      }
    };

    if (user) fetchUserProfile();
    else {
      setTheme(localStorage.getItem('theme') || 'light');
      setLocationName(localStorage.getItem('user_city') || 'Jakarta');
    }
  }, [user, isPWA]);

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    if (user) {
      await StorageService.saveProfile(
        user.personal_code,
        { app_theme: newTheme },
        isPWA,
      );
    }
  };

  const handleUploadPhoto = async (e) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      let publicUrl = null;
      if (isPWA) {
        // PWA: simpan sebagai base64
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

  const handleSaveProfile = async (onClose) => {
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
      onClose?.();
      if (window.confirm('Profil disimpan! Halaman akan direfresh.')) {
        window.location.reload();
      }
    } catch {
      alert('Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const dataToExport = {};
    const staticKeys = [
      'ramadhan_tracker',
      'daily_journal',
      'haid_tracker',
      'user_city',
      'theme',
    ];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('myRamadhan_') || staticKeys.includes(key))) {
        dataToExport[key] = localStorage.getItem(key);
      }
    }
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dataToExport));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute(
      'download',
      `myramadhan_backup_${new Date().getTime()}.json`,
    );
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
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
      } catch {
        alert('Format file tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const executeLogout = async (router) => {
    if (!isPWA && user) await supabase.auth.signOut();
    localStorage.removeItem('myRamadhan_user');
    if (!isPWA) router.push('/auth/login');
    else window.location.reload();
  };

  const executeResetData = async (router) => {
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

  return {
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
  };
};

export default useUserProfile;
