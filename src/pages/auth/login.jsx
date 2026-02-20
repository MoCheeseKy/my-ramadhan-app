import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Moon, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import useAppMode from '@/hook/useAppMode';

export default function Login() {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('loading');
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const { isPWA } = useAppMode();

  // Efek penentuan halaman awal saat dibuka
  useEffect(() => {
    // Jika user punya data lokal, dia tetap bisa buka login kalau sengaja nge-klik,
    // tapi kita berikan notice jika dia pakai PWA.
    if (isPWA) {
      setStep('pwa_notice');
    } else {
      setStep('choice');
    }
  }, [isPWA]);

  const handleRegister = async () => {
    if (!username) return;
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setUserData(data);
    setStep('result');
  };

  const handleLogin = async () => {
    if (!code) return;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalCode: code.trim().toUpperCase() }),
    });
    if (!res.ok) {
      alert('Kode tidak valid');
      return;
    }
    const data = await res.json();
    setUserData(data);
    saveAndGo(data);
  };

  const saveAndGo = (dataOverride) => {
    const dataToSave = dataOverride || userData;
    localStorage.setItem('myRamadhan_user', JSON.stringify(dataToSave));
    router.push('/');
  };

  // Mencegah kedipan UI saat loading status PWA
  if (step === 'loading') {
    return (
      <div className='min-h-screen bg-[#1e3a8a] flex items-center justify-center' />
    );
  }

  return (
    <div className='min-h-screen bg-[#1e3a8a] text-white relative flex items-center justify-center px-6 overflow-y-auto custom-scrollbar py-10'>
      {/* MOON */}
      <div className='absolute top-16 right-28 w-40 h-40 bg-[#1e3a8a] rounded-full z-0' />

      {/* STARS */}
      <div className='fixed inset-0 opacity-40 pointer-events-none z-0'>
        <div className='absolute top-10 left-10 w-1 h-1 bg-white rounded-full' />
        <div className='absolute top-40 left-1/3 w-1 h-1 bg-white rounded-full' />
        <div className='absolute top-32 right-1/4 w-1 h-1 bg-white rounded-full' />
        <div className='absolute bottom-40 left-1/4 w-1 h-1 bg-white rounded-full' />
        <div className='absolute bottom-20 right-20 w-1 h-1 bg-white rounded-full' />
      </div>

      {/* CONTENT */}
      <div className='relative w-full max-w-md text-center z-10 my-auto'>
        {/* HEADER */}
        <div className='mb-10'>
          <div className='w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur'>
            <Moon size={30} />
          </div>
          <h1 className='text-3xl font-extrabold tracking-tight'>MyRamadhan</h1>
          <p className='text-blue-200 text-sm mt-2'>
            Kita usahakan Ramadhan penuh berkah itu!
          </p>
        </div>

        {/* ================= PWA NOTICE (KHUSUS MODE PWA) ================= */}
        {step === 'pwa_notice' && (
          <div className='space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-left relative overflow-hidden shadow-2xl'>
              <div className='absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none' />
              <ShieldCheck className='text-emerald-400 mb-4' size={36} />
              <h3 className='font-bold text-xl mb-2 text-white'>
                Mode Privat Aktif
              </h3>
              <p className='text-sm text-blue-100 mb-6 leading-relaxed'>
                Anda sedang menggunakan aplikasi ini dalam mode PWA (Offline).
                Data Anda 100% aman tersimpan di HP ini secara lokal.
                <br />
                <br />
                Anda <strong className='text-white'>
                  tidak perlu login
                </strong>{' '}
                untuk menggunakan aplikasi. Lanjut login hanya jika Anda ingin
                menyinkronkan data lama Anda.
              </p>

              <div className='flex gap-3 flex-col sm:flex-row'>
                <button
                  onClick={() => router.push('/')}
                  className='w-full py-3.5 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition active:scale-[0.98]'
                >
                  Gak usah, Kembali ke Beranda
                </button>
                <button
                  onClick={() => setStep('choice')}
                  className='w-full py-3.5 border border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition active:scale-[0.98]'
                >
                  Tetap Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= CHOICE ================= */}
        {step === 'choice' && (
          <div className='space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            <button
              onClick={() => setStep('register')}
              className='w-full py-4 bg-white text-blue-900 rounded-2xl font-bold hover:scale-[1.03] active:scale-[0.97] transition flex items-center justify-center gap-2 shadow-lg'
            >
              Mulai Perjalanan Baru
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setStep('login')}
              className='w-full py-4 border border-white/30 rounded-2xl font-bold text-white hover:bg-white/10 transition'
            >
              Sudah punya kode unik
            </button>
          </div>
        )}

        {/* ================= REGISTER ================= */}
        {step === 'register' && (
          <div className='space-y-4 animate-in fade-in slide-in-from-right-4'>
            <input
              type='text'
              placeholder='Siapa namamu?'
              className='w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-white outline-none'
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={handleRegister}
              className='w-full py-4 bg-white text-blue-900 rounded-2xl font-bold hover:scale-[1.03] active:scale-[0.97] transition shadow-lg'
            >
              Generate Kode Saya
            </button>
            <button
              onClick={() => setStep('choice')}
              className='text-sm text-blue-200 hover:text-white transition'
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* ================= LOGIN ================= */}
        {step === 'login' && (
          <div className='space-y-4 animate-in fade-in slide-in-from-left-4'>
            <input
              type='text'
              placeholder='Masukkan kode kamu'
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className='w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-white outline-none uppercase tracking-widest'
            />
            <button
              onClick={handleLogin}
              className='w-full py-4 bg-white text-blue-900 rounded-2xl font-bold hover:scale-[1.03] active:scale-[0.97] transition shadow-lg'
            >
              Masuk
            </button>
            <button
              onClick={() => setStep('choice')}
              className='text-sm text-blue-200 hover:text-white transition'
            >
              ← Kembali
            </button>
          </div>
        )}

        {/* ================= RESULT ================= */}
        {step === 'result' && userData && (
          <div className='space-y-6 animate-in zoom-in-95 duration-500'>
            <div className='p-4 bg-amber-400/10 rounded-2xl border border-amber-300/20 flex gap-3 text-left'>
              <ShieldAlert className='text-amber-300 shrink-0' size={20} />
              <p className='text-xs text-amber-100 leading-relaxed font-medium'>
                Simpan code ini baik-baik. Jika hilang, data tidak dapat
                dikembalikan.
              </p>
            </div>
            <div className='py-8 rounded-3xl bg-white/10 backdrop-blur border border-white/20'>
              <p className='text-[10px] uppercase tracking-widest text-blue-200 mb-2'>
                Unique Personal Code
              </p>
              <span className='text-4xl font-black tracking-[0.3em]'>
                {userData.personal_code}
              </span>
            </div>
            <button
              onClick={() => saveAndGo()}
              className='w-full py-4 bg-white text-blue-900 rounded-2xl font-bold hover:scale-[1.03] active:scale-[0.97] transition shadow-lg'
            >
              Saya Sudah Simpan, Lanjut
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
