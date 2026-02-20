import '@/styles/globals.css';
import SideNav from '@/components/SideNav'; // Import komponen laci navigasi

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Konten Utama Aplikasi */}
      <Component {...pageProps} />

      {/* Quick Action Navigation Global */}
      <SideNav />
    </>
  );
}
