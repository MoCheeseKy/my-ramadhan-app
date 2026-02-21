import { useState, useEffect } from 'react';

/**
 * Mendeteksi apakah viewport saat ini adalah desktop (≥768px / breakpoint 'md' Tailwind).
 * Digunakan untuk mengontrol perilaku accordion SectionCard.
 */
export function useViewport() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isDesktop };
}
