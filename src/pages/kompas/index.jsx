import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, RefreshCw } from 'lucide-react';

// ─── Kalkulasi Arah Kiblat (Presisi Tinggi) ───────────────────────────────
function calcQibla(lat, lng) {
  const toRad = (d) => (d * Math.PI) / 180;
  // Koordinat presisi Ka'bah
  const mLat = toRad(21.422487);
  const mLng = toRad(39.826206);
  const uLat = toRad(lat);
  const uLng = toRad(lng);

  const dLng = mLng - uLng;
  const y = Math.sin(dLng);
  const x = Math.cos(uLat) * Math.tan(mLat) - Math.sin(uLat) * Math.cos(dLng);

  let angle = (180 / Math.PI) * Math.atan2(y, x);
  return Math.round((angle + 360) % 360);
}

// ─── Render Piringan Kompas ───────────────────────────
const CARDINALS = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];

function CompassDial({ headingDeg }) {
  const ticks = Array.from({ length: 72 }); // Garis setiap 5 derajat

  return (
    <div
      className='absolute inset-0 rounded-full'
      style={{
        transform: `rotate(${-headingDeg}deg)`,
        // PERBAIKAN: Transisi dibuat sangat minim (hampir 0) agar 100% Live & Real-time
        transition: 'transform 0.05s linear',
      }}
    >
      {ticks.map((_, i) => {
        const angle = i * 5;
        const isMajor = angle % 90 === 0;
        const isMinor = angle % 45 === 0 && !isMajor;

        return (
          <div
            key={i}
            className='absolute top-0 left-1/2 origin-bottom'
            style={{
              height: '50%',
              transform: `translateX(-50%) rotate(${angle}deg)`,
            }}
          >
            <div
              className='mx-auto rounded-full'
              style={{
                width: isMajor ? 2.5 : isMinor ? 1.5 : 1,
                height: isMajor ? 16 : isMinor ? 10 : 6,
                background: isMajor
                  ? angle === 0
                    ? '#ef4444'
                    : 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.3)',
              }}
            />
          </div>
        );
      })}

      {CARDINALS.map((label, i) => {
        const angle = i * 45;
        const rad = (angle - 90) * (Math.PI / 180);
        const r = 38;
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);

        return (
          <span
            key={label}
            className='absolute text-[12px] font-black tracking-widest'
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              color: label === 'U' ? '#ef4444' : 'rgba(255,255,255,0.8)',
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

// ─── Jarum Kiblat ─────────────────────────────────────────────────────────────
function QiblaNeedle({ qiblaBearing, headingDeg }) {
  const angle = qiblaBearing - headingDeg;
  return (
    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
      <div
        style={{
          position: 'absolute',
          width: 3,
          height: '40%',
          bottom: '50%',
          left: 'calc(50% - 1.5px)',
          transformOrigin: 'bottom center',
          transform: `rotate(${angle}deg)`,
          // PERBAIKAN: Transisi live mengikuti piringan utama
          transition: 'transform 0.05s linear',
        }}
      >
        <div className='absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center'>
          <div className='w-12 h-12 rounded-2xl bg-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(52,211,153,0.8)] border-2 border-emerald-200'>
            <svg width='20' height='20' viewBox='0 0 18 18' fill='none'>
              <rect x='2' y='6' width='14' height='10' rx='1' fill='black' />
              <rect x='0' y='4' width='18' height='4' rx='1' fill='#854d0e' />
              <rect
                x='6'
                y='10'
                width='6'
                height='6'
                rx='0.5'
                fill='#ca8a04'
                opacity='0.4'
              />
            </svg>
          </div>
          <div className='w-1 h-3 bg-emerald-400 rounded-b-full' />
        </div>
        <div className='w-full h-full bg-gradient-to-t from-transparent via-emerald-400 to-emerald-300 rounded-full drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' />
      </div>
    </div>
  );
}

export default function KompasPage() {
  const router = useRouter();

  const [heading, setHeading] = useState(0);
  const prevHeadingRef = useRef(0);

  const [qibla, setQibla] = useState(295);
  const [city, setCity] = useState('Mencari lokasi...');
  const [phase, setPhase] = useState('permission');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.DeviceOrientationEvent) {
      setPhase('desktop');
    }
  }, []);

  // ─── LOGIKA SENSOR ORIENTASI LIVE & AKURAT ───
  const handleOrientation = useCallback((e) => {
    let h = null;

    // 1. iOS: Gunakan data kompas spesifik Apple (Paling Akurat)
    if (typeof e.webkitCompassHeading === 'number') {
      h = e.webkitCompassHeading;
    }
    // 2. Android: HANYA izinkan data 'absolute' (Akurat terhadap kutub bumi)
    else if (e.absolute === true && e.alpha !== null) {
      h = 360 - e.alpha;
    }

    // Tolak jika bukan data absolut (mencegah kompas menunjuk arah palsu/random)
    if (h === null) return;

    // Logika Anti-Spin agar jarum tidak berputar 360 derajat saat melewati titik Utara (0/360)
    let current = prevHeadingRef.current;
    let diff = h - (current % 360);

    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;

    const newHeading = current + diff;
    prevHeadingRef.current = newHeading;

    setHeading(newHeading);
  }, []);

  const startCompass = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') {
          alert('Izin sensor ditolak. Kompas tidak bisa berjalan.');
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Android: Gunakan event absolut
    window.addEventListener(
      'deviceorientationabsolute',
      handleOrientation,
      true,
    );
    // iOS: Gunakan event standar (iOS akan memberikan webkitCompassHeading di sini)
    window.addEventListener('deviceorientation', handleOrientation, true);
    setPhase('active');
  };

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const bearing = calcQibla(pos.coords.latitude, pos.coords.longitude);
        setQibla(bearing);
        setLocating(false);
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
        )
          .then((r) => r.json())
          .then((d) =>
            setCity(
              d.address?.city ||
                d.address?.county ||
                d.address?.town ||
                'Lokasi Ditemukan',
            ),
          )
          .catch(() => setCity('Gagal memuat nama kota'));
      },
      () => {
        setLocating(false);
        alert('Gagal mendapatkan lokasi. Pastikan GPS menyala.');
        setCity('Lokasi tidak diketahui');
      },
      { enableHighAccuracy: true },
    );
  };

  const handleStart = () => {
    startCompass();
    getLocation();
  };

  useEffect(() => {
    return () => {
      window.removeEventListener(
        'deviceorientationabsolute',
        handleOrientation,
        true,
      );
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  // Cek apakah HP sejajar dengan kiblat (Toleransi ±3°)
  const normalizedHeading = ((heading % 360) + 360) % 360;
  const diffKiblat = ((normalizedHeading - qibla + 540) % 360) - 180;
  const isAligned = Math.abs(diffKiblat) <= 3;

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-white flex flex-col overflow-hidden selection:bg-emerald-500/30'>
      <Head>
        <title>Arah Kiblat — MyRamadhan</title>
      </Head>

      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-emerald-900/30 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]' />
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className='absolute w-0.5 h-0.5 bg-white rounded-full opacity-30'
            style={{
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <header className='relative z-40 px-5 pt-6 pb-4 flex items-center justify-between'>
        <button
          onClick={() => router.push('/')}
          className='w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors'
        >
          <ArrowLeft size={18} className='text-white/80' />
        </button>
        <div className='text-center'>
          <p className='text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400'>
            Arah Kiblat
          </p>
          <p className='text-xs text-white/50 mt-1 flex items-center justify-center gap-1 font-medium'>
            <MapPin size={12} className='text-emerald-500' /> {city}
          </p>
        </div>
        <div className='w-10 h-10 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 flex items-center justify-center'>
          <span className='text-[11px] font-black text-emerald-400 tabular-nums'>
            {qibla}°
          </span>
        </div>
      </header>

      <main className='flex-1 flex flex-col items-center justify-center px-6 pb-10 relative'>
        {phase === 'desktop' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-center max-w-xs'
          >
            <div className='w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6'>
              <Navigation
                size={40}
                className='text-emerald-400'
                strokeWidth={1.5}
              />
            </div>
            <h2 className='text-xl font-bold mb-3'>Buka di Smartphone</h2>
            <p className='text-sm text-white/50 leading-relaxed'>
              Fitur kompas membutuhkan sensor magnetometer. Buka aplikasi di HP
              untuk menggunakan pencari kiblat.
            </p>
          </motion.div>
        )}

        {phase === 'permission' && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-center max-w-sm w-full'
          >
            <div className='relative w-48 h-48 mx-auto mb-10'>
              <div className='absolute inset-0 rounded-full border border-white/10 bg-white/5' />
              <div className='absolute inset-4 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center'>
                <Navigation
                  size={56}
                  className='text-emerald-400'
                  strokeWidth={1.5}
                />
              </div>
              <div
                className='absolute inset-0 rounded-full border border-emerald-400/20 animate-ping'
                style={{ animationDuration: '3s' }}
              />
            </div>
            <h2 className='text-2xl font-black mb-3 text-emerald-50'>
              Temukan Arah Kiblat
            </h2>
            <p className='text-sm text-white/50 leading-relaxed mb-8'>
              Izinkan akses sensor & GPS untuk akurasi terbaik. Posisikan HP
              sejajar dengan tanah dan putar tubuhmu perlahan.
            </p>
            <button
              onClick={handleStart}
              className='w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-sm tracking-wide shadow-[0_8px_32px_rgba(52,211,153,0.4)] hover:scale-[1.02] active:scale-95 transition-all'
            >
              Mulai Kompas
            </button>
          </motion.div>
        )}

        {phase === 'active' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col items-center gap-8 w-full'
          >
            <div className='relative w-[320px] h-[320px] flex items-center justify-center'>
              <motion.div
                className='absolute inset-[-6px] rounded-full pointer-events-none'
                animate={{
                  border: isAligned
                    ? '3px solid rgba(52, 211, 153, 0.8)'
                    : '2px solid rgba(255,255,255,0.05)',
                  boxShadow: isAligned
                    ? '0 0 40px rgba(52, 211, 153, 0.6), inset 0 0 40px rgba(52, 211, 153, 0.2)'
                    : 'none',
                }}
                transition={{ duration: 0.3 }}
              />

              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl overflow-hidden'>
                <div
                  className='absolute inset-0 rounded-full'
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(52,211,153,0.08) 0%, transparent 60%)',
                  }}
                />
              </div>

              <CompassDial headingDeg={heading} />
              <QiblaNeedle qiblaBearing={qibla} headingDeg={heading} />

              <div className='absolute w-4 h-4 rounded-full bg-white shadow-[0_0_15px_white] z-30 flex items-center justify-center'>
                <div className='w-1.5 h-1.5 bg-emerald-500 rounded-full' />
              </div>
              <div className='absolute top-2 left-1/2 -translate-x-1/2 z-20'>
                <div className='w-1 h-5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]' />
              </div>
            </div>

            <div className='h-12'>
              <AnimatePresence>
                {isAligned && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className='px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center gap-3 backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                  >
                    <div className='w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse' />
                    <span className='text-sm font-black tracking-wide text-emerald-300'>
                      Menghadap Kiblat
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className='w-full grid grid-cols-3 gap-3'>
              <div className='bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm'>
                <p className='text-[9px] text-white/50 uppercase tracking-widest mb-1.5'>
                  Arah HP
                </p>
                <p className='text-2xl font-black tabular-nums text-white'>
                  {Math.round(normalizedHeading)}°
                </p>
              </div>
              <div className='bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center backdrop-blur-sm shadow-[0_0_20px_rgba(52,211,153,0.1)]'>
                <p className='text-[9px] text-emerald-400/80 uppercase tracking-widest mb-1.5'>
                  Kiblat
                </p>
                <p className='text-2xl font-black tabular-nums text-emerald-400'>
                  {qibla}°
                </p>
              </div>
              <div className='bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm'>
                <p className='text-[9px] text-white/50 uppercase tracking-widest mb-1.5'>
                  Belok
                </p>
                <p
                  className={`text-xl font-black tabular-nums mt-1 ${Math.abs(diffKiblat) <= 10 ? 'text-emerald-400' : 'text-white'}`}
                >
                  {Math.abs(Math.round(diffKiblat))}°
                </p>
                <p className='text-[9px] font-bold text-white/50 mt-1 uppercase tracking-widest'>
                  {diffKiblat > 0 ? 'Ke Kiri' : 'Ke Kanan'}
                </p>
              </div>
            </div>

            <button
              onClick={getLocation}
              disabled={locating}
              className='flex items-center gap-2 text-xs font-semibold text-emerald-400/60 hover:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full transition-colors mt-2'
            >
              <RefreshCw size={14} className={locating ? 'animate-spin' : ''} />
              {locating ? 'Mencari Lokasi...' : 'Perbarui Lokasi GPS'}
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
