import '@/styles/globals.css';
import { useEffect } from 'react';
import SideNav from '@/components/SideNav';
import GlobalInstallPrompt from '@/components/GlobalInstallPrompt';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <SideNav />
      <GlobalInstallPrompt />
    </>
  );
}
