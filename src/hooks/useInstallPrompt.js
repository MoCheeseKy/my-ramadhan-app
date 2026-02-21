'use client';

import { useState, useEffect } from 'react';

export default function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Deteksi jika perangkat adalah iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 2. Tangkap event dari Chrome/Android bahwa aplikasi siap diinstall
    const handleBeforeInstallPrompt = (e) => {
      // Cegah banner bawaan browser muncul seketika
      e.preventDefault();
      // Simpan event-nya agar bisa dipanggil saat tombol kita diklik
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Jika sudah berhasil terinstall, hilangkan tombolnya
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
  }, []);

  // Fungsi untuk memicu popup install saat tombol kita diklik
  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false); // Sembunyikan tombol jika user setuju
      }
      setDeferredPrompt(null);
    }
  };

  return { isInstallable, promptInstall, isIOS };
}
