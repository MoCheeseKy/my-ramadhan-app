import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Sparkles, ShieldAlert, ArrowRight, Key } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('choice'); // choice, register, login, result
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const handleRegister = async () => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setUserData(data);
    setStep('result');
  };

  const saveAndGo = () => {
    localStorage.setItem('myRamadhan_user', JSON.stringify(userData));
    router.push('/');
  };

  return (
    <div className='min-h-screen bg-[#F6F9FC] flex items-center justify-center p-6 selection:bg-blue-200'>
      <div className='w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 animate-fadeUp'>
        <div className='text-center mb-10'>
          <div className='w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200'>
            <Sparkles className='text-white' size={32} />
          </div>
          <h1 className='text-2xl font-extrabold text-slate-800'>MyRamadhan</h1>
          <p className='text-slate-500 text-sm mt-1 font-medium'>
            Warm, Adaptive, & Mindful
          </p>
        </div>

        {step === 'choice' && (
          <div className='grid gap-4'>
            <button
              onClick={() => setStep('register')}
              className='w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2'
            >
              Mulai Perjalanan Baru <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setStep('login')}
              className='w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all'
            >
              Sudah punya kode unik
            </button>
          </div>
        )}

        {step === 'register' && (
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Siapa namamu?'
              className='w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all'
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={handleRegister}
              className='w-full py-4 bg-blue-600 text-white rounded-2xl font-bold'
            >
              Generate Kode Saya
            </button>
          </div>
        )}

        {step === 'result' && userData && (
          <div className='space-y-6'>
            <div className='p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3'>
              <ShieldAlert className='text-amber-500 shrink-0' size={20} />
              <p className='text-xs text-amber-700 leading-relaxed font-medium'>
                Simpan code ini baik-baik. Jika hilang, data tidak dapat
                dikembalikan.
              </p>
            </div>
            <div className='text-center py-6 bg-blue-50 rounded-3xl border-2 border-dashed border-blue-200'>
              <p className='text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-2'>
                Unique Personal Code
              </p>
              <span className='text-3xl font-black text-blue-600 tracking-wider'>
                {userData.personal_code}
              </span>
            </div>
            <button
              onClick={saveAndGo}
              className='w-full py-4 bg-slate-900 text-white rounded-2xl font-bold'
            >
              Saya Sudah Simpan, Lanjut
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
