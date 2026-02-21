'use client';

import { useState, useEffect } from 'react';

export default function useAppMode() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Fungsi untuk mengecek apakah aplikasi berjalan sebagai PWA (Standalone)
    const checkMode = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');

      setIsPWA(isStandalone);
    };

    checkMode();

    // Dengarkan perubahan jika sewaktu-waktu user menginstal aplikasi saat web sedang terbuka
    window
      .matchMedia('(display-mode: standalone)')
      .addEventListener('change', checkMode);

    return () => {
      window
        .matchMedia('(display-mode: standalone)')
        .removeEventListener('change', checkMode);
    };
  }, []);

  return { isPWA };
}
