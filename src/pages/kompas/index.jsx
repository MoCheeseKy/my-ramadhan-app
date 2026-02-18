import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Compass,
  AlertCircle,
  LocateFixed,
  MapPin,
} from 'lucide-react';

export default function KompasPage() {
  const router = useRouter();
  const [heading, setHeading] = useState(0); // Arah HP (0 = Utara)
  const [qiblaBearing, setQiblaBearing] = useState(295); // Default Jakarta (295 derajat)
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Cek apakah di Desktop (Tidak punya sensor orientasi)
    if (!window.DeviceOrientationEvent) {
      setIsDesktop(true);
    }
  }, []);

  // Fungsi Request Permission (Wajib untuk iOS 13+)
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('Izin akses sensor ditolak.');
        }
      } catch (err) {
        setError('Gagal meminta izin sensor.');
      }
    } else {
      // Android / Non-iOS 13+ biasanya langsung jalan
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  const handleOrientation = (event) => {
    let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
    setHeading(compass);
  };

  // Kalkulasi Arah Kiblat berdasarkan Lokasi GPS (Advanced)
  const calculateQibla = (latitude, longitude) => {
    const PI = Math.PI;
    const meccaLat = 21.422487;
    const meccaLong = 39.826206;

    const phiK = (meccaLat * PI) / 180.0;
    const lambdaK = (meccaLong * PI) / 180.0;
    const phi = (latitude * PI) / 180.0;
    const lambda = (longitude * PI) / 180.0;

    const psi =
      (180.0 / PI) *
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda),
      );

    setQiblaBearing(Math.round(psi < 0 ? 360 + psi : psi));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          calculateQibla(position.coords.latitude, position.coords.longitude);
        },
        () =>
          setError(
            'Gagal mendapatkan lokasi GPS. Menggunakan default Jakarta.',
          ),
      );
    }
  };

  // Style rotasi jarum
  // Jarum Kompas (Utara) berputar sesuai heading negatif
  // Jarum Kiblat berputar relatif terhadap Utara
  const compassStyle = { transform: `rotate(${-heading}deg)` };

  return (
    <div className='min-h-screen bg-slate-900 text-white pb-10 selection:bg-indigo-500 overflow-hidden'>
      <Head>
        <title>Arah Kiblat - MyRamadhan</title>
      </Head>

      {/* Header Transparan */}
      <header className='absolute top-0 z-40 w-full px-6 py-6 flex items-center justify-between'>
        <button
          onClick={() => router.push('/')}
          className='p-2 -ml-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors'
        >
          <ArrowLeft size={20} className='text-white' />
        </button>
        <div className='flex items-center gap-2 bg-indigo-600/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-500/30'>
          <MapPin size={14} className='text-indigo-300' />
          <span className='text-xs font-bold text-indigo-100'>
            Kiblat: {qiblaBearing}°
          </span>
        </div>
      </header>

      <main className='min-h-screen flex flex-col items-center justify-center relative'>
        {/* Background Grids */}
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15),transparent_70%)] pointer-events-none' />

        {isDesktop ? (
          // Tampilan Fallback Desktop
          <div className='text-center px-8 max-w-md'>
            <div className='w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse'>
              <Compass size={40} className='text-indigo-300' />
            </div>
            <h2 className='text-2xl font-bold mb-2'>Sensor Tidak Terdeteksi</h2>
            <p className='text-slate-400 text-sm leading-relaxed'>
              Fitur kompas membutuhkan sensor magnetometer yang biasanya hanya
              ada di HP/Tablet. Silakan buka aplikasi ini di smartphone Anda.
            </p>
          </div>
        ) : !permissionGranted ? (
          // Tampilan Minta Izin (Khusus iOS)
          <div className='text-center px-8 max-w-md z-10'>
            <div className='w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
              <LocateFixed size={40} className='text-indigo-300' />
            </div>
            <h2 className='text-2xl font-bold mb-3'>Kalibrasi Kompas</h2>
            <p className='text-slate-400 text-sm mb-8 leading-relaxed'>
              Untuk akurasi terbaik, izinkan akses sensor perangkat dan pastikan
              GPS aktif. Jauhkan dari benda magnetik.
            </p>
            <div className='space-y-3'>
              <button
                onClick={() => {
                  requestPermission();
                  getLocation();
                }}
                className='w-full py-4 bg-indigo-600 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition-all'
              >
                Mulai Cari Kiblat
              </button>
            </div>
          </div>
        ) : (
          // Tampilan Kompas Aktif
          <div className='relative'>
            {/* Piringan Kompas */}
            <div
              className='w-72 h-72 rounded-full border-4 border-slate-700 bg-slate-800/50 backdrop-blur-sm relative shadow-2xl transition-transform duration-100 ease-linear'
              style={compassStyle}
            >
              {/* Marka Utara (North) */}
              <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 flex flex-col items-center'>
                <div className='w-2 h-6 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)]' />
                <span className='text-red-500 font-bold text-xs mt-1'>N</span>
              </div>

              {/* Marka Timur/Barat/Selatan (Hiasan) */}
              <div className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 w-1.5 h-4 bg-slate-600 rounded-full' />
              <div className='absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 w-4 h-1.5 bg-slate-600 rounded-full' />
              <div className='absolute right-0 top-1/2 translate-x-3 -translate-y-1/2 w-4 h-1.5 bg-slate-600 rounded-full' />

              {/* Jarum Penunjuk Kiblat (Dinamis sesuai lokasi) */}
              <div
                className='absolute top-1/2 left-1/2 w-1 h-32 bg-transparent origin-bottom -translate-x-1/2 -translate-y-full z-10'
                style={{
                  transform: `translateX(-50%) translateY(-100%) rotate(${qiblaBearing}deg)`,
                }}
              >
                {/* Ikon Ka'bah/Panah di Ujung Jarum */}
                <div className='absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1'>
                  <div className='w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse'>
                    <div className='w-6 h-6 bg-black rounded-sm border border-yellow-500/50' />{' '}
                    {/* Mini Kabah */}
                  </div>
                  <div className='w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-emerald-500' />
                </div>
                {/* Garis Penunjuk */}
                <div className='w-0.5 h-full bg-emerald-500/50 mx-auto rounded-full' />
              </div>
            </div>

            {/* Titik Tengah Statis */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg z-20' />

            {/* Indikator Derajat (Digital) */}
            <div className='absolute -bottom-24 left-1/2 -translate-x-1/2 text-center w-full'>
              <p className='text-slate-400 text-xs uppercase tracking-widest mb-1'>
                Arah Perangkat
              </p>
              <h3 className='text-4xl font-black text-white'>
                {Math.round(heading)}°
              </h3>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
