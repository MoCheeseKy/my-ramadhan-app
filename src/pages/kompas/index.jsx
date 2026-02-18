import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, RefreshCw } from 'lucide-react';

// ─── Qibla bearing calculation ───────────────────────────────────────────────
function calcQibla(lat, lng) {
  const toRad = (d) => (d * Math.PI) / 180;
  const mLat = toRad(21.4225);
  const mLng = toRad(39.8262);
  const uLat = toRad(lat);
  const uLng = toRad(lng);
  const dLng = mLng - uLng;
  const angle =
    (180 / Math.PI) *
    Math.atan2(
      Math.sin(dLng),
      Math.cos(uLat) * Math.tan(mLat) - Math.sin(uLat) * Math.cos(dLng),
    );
  return Math.round(angle < 0 ? angle + 360 : angle);
}

// ─── Compass tick marks ───────────────────────────────────────────────────────
const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function CompassDial({ headingDeg }) {
  const ticks = Array.from({ length: 72 }); // every 5°
  return (
    <div
      className='absolute inset-0 rounded-full'
      style={{
        transform: `rotate(${-headingDeg}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {ticks.map((_, i) => {
        const angle = i * 5;
        const isMajor = angle % 90 === 0;
        const isMinor = angle % 45 === 0 && !isMajor;
        const isTen = angle % 10 === 0 && !isMajor && !isMinor;
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
                width: isMajor ? 2 : isMinor ? 1.5 : 1,
                height: isMajor ? 14 : isMinor ? 10 : 6,
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

      {/* Cardinal letters */}
      {CARDINALS.map((label, i) => {
        const angle = i * 45;
        const rad = (angle - 90) * (Math.PI / 180);
        const r = 42; // % from center
        const x = 50 + r * Math.cos(rad);
        const y = 50 + r * Math.sin(rad);
        return (
          <span
            key={label}
            className='absolute text-[10px] font-black tracking-widest'
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              color: label === 'N' ? '#ef4444' : 'rgba(255,255,255,0.75)',
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

// ─── Qibla needle (always points to qibla, fixed relative to world) ───────────
function QiblaNeedle({ qiblaBearing, headingDeg }) {
  // The needle must point (qiblaBearing - headingDeg) relative to UP on screen
  const angle = qiblaBearing - headingDeg;
  return (
    <div
      className='absolute inset-0 flex items-center justify-center'
      style={{ pointerEvents: 'none' }}
    >
      <div
        style={{
          position: 'absolute',
          width: 2,
          height: '38%',
          bottom: '50%',
          left: 'calc(50% - 1px)',
          transformOrigin: 'bottom center',
          transform: `rotate(${angle}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Kaaba icon at tip */}
        <div className='absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center'>
          <div className='w-9 h-9 rounded-xl bg-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.7)]'>
            {/* Mini kaaba silhouette */}
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none'>
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
          {/* Arrow shaft between icon and line */}
          <div className='w-0.5 h-3 bg-emerald-400' />
        </div>
        {/* Main needle line */}
        <div className='w-full h-full bg-gradient-to-t from-transparent via-emerald-400 to-emerald-300 rounded-full' />
      </div>
    </div>
  );
}

// ─── Accuracy ring ────────────────────────────────────────────────────────────
function AccuracyRing({ isAligned }) {
  return (
    <motion.div
      className='absolute inset-[-6px] rounded-full border-2 pointer-events-none'
      animate={{
        borderColor: isAligned
          ? 'rgba(52, 211, 153, 0.8)'
          : 'rgba(255,255,255,0.08)',
        boxShadow: isAligned
          ? '0 0 30px rgba(52, 211, 153, 0.4), inset 0 0 30px rgba(52, 211, 153, 0.05)'
          : 'none',
      }}
      transition={{ duration: 0.5 }}
    />
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function KompasPage() {
  const router = useRouter();

  const [heading, setHeading] = useState(0);
  const [qibla, setQibla] = useState(295); // default Jakarta
  const [city, setCity] = useState('Jakarta');
  const [phase, setPhase] = useState('permission'); // permission | active | desktop
  const [locating, setLocating] = useState(false);
  const listenerRef = useRef(null);

  // Check desktop (no sensor)
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.DeviceOrientationEvent) {
      setPhase('desktop');
    }
  }, []);

  // Orientation handler — supports both iOS (webkitCompassHeading) and Android (alpha)
  const handleOrientation = (e) => {
    let h;
    if (e.webkitCompassHeading !== undefined) {
      // iOS: webkitCompassHeading is clockwise from true north
      h = e.webkitCompassHeading;
    } else if (e.absolute && e.alpha !== null) {
      // Android absolute
      h = 360 - e.alpha;
    } else if (e.alpha !== null) {
      // Fallback
      h = (360 - e.alpha + 360) % 360;
    } else {
      return;
    }
    setHeading(Math.round(h) % 360);
  };

  const startCompass = async () => {
    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') return;
      } catch {
        return;
      }
    }
    listenerRef.current = handleOrientation;
    window.addEventListener(
      'deviceorientationabsolute',
      handleOrientation,
      true,
    );
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
        // Reverse-geocode city name (best-effort)
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
        )
          .then((r) => r.json())
          .then((d) =>
            setCity(d.address?.city || d.address?.town || 'Lokasiku'),
          )
          .catch(() => {});
      },
      () => setLocating(false),
      { enableHighAccuracy: true },
    );
  };

  // Start compass + get location together
  const handleStart = () => {
    startCompass();
    getLocation();
  };

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener(
          'deviceorientationabsolute',
          listenerRef.current,
          true,
        );
        window.removeEventListener(
          'deviceorientation',
          listenerRef.current,
          true,
        );
      }
    };
  }, []);

  // Is device roughly facing qibla? (±5°)
  const diff = ((heading - qibla + 540) % 360) - 180;
  const isAligned = Math.abs(diff) <= 5;

  // Heading label
  const getHeadingLabel = (h) => {
    const dirs = ['Utara', 'TL', 'Timur', 'TG', 'Selatan', 'BD', 'Barat', 'BL'];
    return dirs[Math.round(h / 45) % 8];
  };

  return (
    <div className='min-h-screen bg-[#0a0f1e] text-white flex flex-col overflow-hidden selection:bg-emerald-500/30'>
      <Head>
        <title>Arah Kiblat — MyRamadhan</title>
      </Head>

      {/* ── Ambient bg ── */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]' />
        {/* Star dots */}
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

      {/* ── Header ── */}
      <header className='relative z-40 px-5 pt-6 pb-4 flex items-center justify-between'>
        <button
          onClick={() => router.push('/')}
          className='w-10 h-10 rounded-2xl bg-white/8 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors'
        >
          <ArrowLeft size={18} className='text-white/80' />
        </button>

        <div className='text-center'>
          <p className='text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400'>
            Arah Kiblat
          </p>
          <p className='text-xs text-white/40 mt-0.5 flex items-center justify-center gap-1'>
            <MapPin size={10} className='text-emerald-500' />
            {city}
          </p>
        </div>

        <div className='w-10 h-10 rounded-2xl bg-white/8 backdrop-blur-md border border-white/10 flex items-center justify-center'>
          <span className='text-[11px] font-black text-emerald-400 tabular-nums'>
            {qibla}°
          </span>
        </div>
      </header>

      <main className='flex-1 flex flex-col items-center justify-center px-6 pb-10 relative'>
        {/* ── DESKTOP FALLBACK ── */}
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
              Fitur kompas butuh sensor magnetometer. Buka di HP untuk
              menggunakan kiblat finder.
            </p>
          </motion.div>
        )}

        {/* ── PERMISSION SCREEN ── */}
        {phase === 'permission' && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className='text-center max-w-sm w-full'
          >
            {/* Decorative compass preview */}
            <div className='relative w-48 h-48 mx-auto mb-10'>
              <div className='absolute inset-0 rounded-full border border-white/10 bg-white/3' />
              <div className='absolute inset-4 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center'>
                <Navigation
                  size={48}
                  className='text-emerald-400'
                  strokeWidth={1}
                />
              </div>
              <div
                className='absolute inset-0 rounded-full border border-emerald-400/10 animate-ping'
                style={{ animationDuration: '3s' }}
              />
            </div>

            <h2 className='text-2xl font-bold mb-3'>Temukan Arah Kiblat</h2>
            <p className='text-sm text-white/50 leading-relaxed mb-8'>
              Izinkan akses sensor & GPS untuk akurasi terbaik. Jauhkan dari
              perangkat elektronik dan benda logam.
            </p>

            <button
              onClick={handleStart}
              className='w-full py-4 rounded-2xl bg-emerald-500 font-bold text-sm tracking-wide shadow-[0_8px_32px_rgba(52,211,153,0.3)] hover:bg-emerald-400 active:scale-95 transition-all'
            >
              Mulai Kalibrasi
            </button>
          </motion.div>
        )}

        {/* ── ACTIVE COMPASS ── */}
        {phase === 'active' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col items-center gap-8 w-full'
          >
            {/* Compass wheel */}
            <div className='relative w-72 h-72'>
              {/* Outer ring glow */}
              <AccuracyRing isAligned={isAligned} />

              {/* Compass background */}
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl overflow-hidden'>
                {/* Subtle grid */}
                <div
                  className='absolute inset-0 rounded-full'
                  style={{
                    background:
                      'radial-gradient(circle at center, rgba(52,211,153,0.04) 0%, transparent 70%)',
                  }}
                />
              </div>

              {/* Rotating dial with ticks & cardinals */}
              <CompassDial headingDeg={heading} />

              {/* Static Qibla needle */}
              <QiblaNeedle qiblaBearing={qibla} headingDeg={heading} />

              {/* Center dot */}
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_white] z-30' />

              {/* Top fixed indicator mark */}
              <div className='absolute top-1 left-1/2 -translate-x-1/2 z-20'>
                <div className='w-1 h-4 bg-white/60 rounded-full' />
              </div>
            </div>

            {/* Aligned badge */}
            <AnimatePresence>
              {isAligned && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  className='px-5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center gap-2'
                >
                  <div className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                  <span className='text-sm font-bold text-emerald-300'>
                    Menghadap Kiblat
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Digital readout */}
            <div className='w-full grid grid-cols-3 gap-3'>
              <div className='bg-white/5 border border-white/8 rounded-2xl p-4 text-center'>
                <p className='text-[10px] text-white/40 uppercase tracking-widest mb-1'>
                  Arah HP
                </p>
                <p className='text-xl font-black tabular-nums text-white'>
                  {heading}°
                </p>
                <p className='text-[10px] text-white/40 mt-0.5'>
                  {getHeadingLabel(heading)}
                </p>
              </div>
              <div className='bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center'>
                <p className='text-[10px] text-emerald-400/70 uppercase tracking-widest mb-1'>
                  Kiblat
                </p>
                <p className='text-xl font-black tabular-nums text-emerald-300'>
                  {qibla}°
                </p>
                <p className='text-[10px] text-emerald-400/50 mt-0.5'>
                  dari Utara
                </p>
              </div>
              <div className='bg-white/5 border border-white/8 rounded-2xl p-4 text-center'>
                <p className='text-[10px] text-white/40 uppercase tracking-widest mb-1'>
                  Selisih
                </p>
                <p
                  className={`text-xl font-black tabular-nums ${Math.abs(diff) <= 10 ? 'text-emerald-400' : 'text-white'}`}
                >
                  {Math.abs(Math.round(diff))}°
                </p>
                <p className='text-[10px] text-white/40 mt-0.5'>
                  {diff > 0 ? 'ke kiri' : 'ke kanan'}
                </p>
              </div>
            </div>

            {/* Recalibrate */}
            <button
              onClick={getLocation}
              disabled={locating}
              className='flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors'
            >
              <RefreshCw size={12} className={locating ? 'animate-spin' : ''} />
              {locating ? 'Memperbarui lokasi...' : 'Perbarui lokasi GPS'}
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
