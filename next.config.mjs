import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // <--- TAMBAHKAN BARIS INI UNTUK MEMBUNGKAM ERROR
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dagxzuvohwdjpfhlifqr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
