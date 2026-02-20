import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Moon,
  ShieldAlert,
  ArrowRight,
  Smartphone,
  Download,
  ShieldCheck,
} from 'lucide-react';
import useAppMode from '@/hook/useAppMode';
import useInstallPrompt from '@/hook/useInstallPrompt'; // <-- TAMBAHAN: Import Hook Install

export default function Login() {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('choice');
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const { isPWA } = useAppMode();

  // <-- TAMBAHAN: Ambil status bisa install atau tidak
  const { isInstallable, promptInstall, isIOS } = useInstallPrompt();

  useEffect(() => {
    if (isPWA) {
      router.replace('/');
      return;
    }

    const localUser = localStorage.getItem('myRamadhan_user');
    if (localUser) {
      router.replace('/');
    }
  }, [isPWA, router]);

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

  if (isPWA)
    return (
      <div className='min-h-screen bg-[#1e3a8a] flex items-center justify-center' />
    );

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

            {/* ================= BANNER INSTALL APP ================= */}
            {!isPWA && (isInstallable || isIOS) && (
              <div className='mt-8 pt-6 border-t border-white/10 text-left animate-in fade-in duration-700'>
                <div className='bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 relative overflow-hidden'>
                  <div className='absolute -right-6 -top-6 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl' />

                  <h3 className='font-bold text-lg mb-3 flex items-center gap-2'>
                    <Smartphone size={20} className='text-blue-300' />
                    Rekomendasi: Install Aplikasi
                  </h3>

                  <ul className='text-xs text-blue-100 space-y-2.5 mb-5 font-medium'>
                    <li className='flex items-start gap-2'>
                      <ShieldCheck
                        size={16}
                        className='shrink-0 text-emerald-400'
                      />
                      <span>
                        <strong className='text-white'>100% Privat:</strong>{' '}
                        Data Jurnal & Haid disimpan aman di dalam HP-mu, bukan
                        di server.
                      </span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <ShieldCheck
                        size={16}
                        className='shrink-0 text-emerald-400'
                      />
                      <span>
                        <strong className='text-white'>Tanpa Login:</strong>{' '}
                        Langsung masuk tanpa perlu menghafal Personal Code.
                      </span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <ShieldCheck
                        size={16}
                        className='shrink-0 text-emerald-400'
                      />
                      <span>
                        <strong className='text-white'>Super Cepat:</strong>{' '}
                        Menghemat kuota dan bisa diakses secara offline.
                      </span>
                    </li>
                  </ul>

                  {/* Tombol Android/Chrome vs Teks Panduan iOS */}
                  {isInstallable ? (
                    <button
                      onClick={promptInstall}
                      className='w-full py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg active:scale-[0.98]'
                    >
                      <Download size={18} /> Install ke Layar Utama
                    </button>
                  ) : isIOS ? (
                    <div className='p-3 bg-blue-950/50 rounded-xl text-[11px] text-blue-200 text-center border border-blue-400/20'>
                      <p>Untuk pengguna iPhone/iPad:</p>
                      <p className='font-bold mt-1 text-white flex items-center justify-center gap-1'>
                        Tekan ikon Share{' '}
                        <span className='text-lg align-bottom mb-1'>⍐</span>{' '}
                        lalu "Add to Home Screen"
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
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
