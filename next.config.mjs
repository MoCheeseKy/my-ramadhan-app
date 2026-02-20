// next.config.mjs
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
});

const nextConfig = {
  reactStrictMode: true,
  // ❌ HAPUS baris turbopack: {}
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
