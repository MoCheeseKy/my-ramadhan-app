'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * AddDoaModal — modal form untuk menambah doa pribadi (custom doa).
 * Menutup saat submit berhasil atau klik tombol X.
 *
 * @prop {boolean}  open
 * @prop {Function} onClose
 * @prop {Function} onSubmit - async (doaData) => void; harus memanggil onClose sendiri setelah sukses
 */
const AddDoaModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    arab: '',
    latin: '',
    arti: '',
  });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSubmit(form, () => {
      setForm({ title: '', arab: '', latin: '', arti: '' });
      onClose();
    });
    setSaving(false);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
      <div className='bg-white dark:bg-slate-800 w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10'>
        {/* Tombol tutup */}
        <button
          onClick={onClose}
          className='absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
        >
          <X size={16} />
        </button>

        <h2 className='text-xl font-bold text-slate-800 dark:text-slate-100 mb-1'>
          Tambah Doa Pribadi
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4 mt-5'>
          {/* Judul */}
          <div>
            <label className='text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5'>
              Judul Doa <span className='text-rose-500'>*</span>
            </label>
            <input
              type='text'
              required
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder='Misal: Doa Lulus Ujian'
              className='w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
            />
          </div>

          {/* Teks Arab */}
          <div>
            <label className='text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5'>
              Teks Arab <span className='text-slate-400'>(Opsional)</span>
            </label>
            <textarea
              value={form.arab}
              onChange={(e) => handleChange('arab', e.target.value)}
              placeholder='Teks Arab...'
              dir='rtl'
              rows={3}
              className='w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none font-arabic text-right text-slate-800 dark:text-slate-100 resize-none'
            />
          </div>

          {/* Latin */}
          <div>
            <label className='text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5'>
              Teks Latin <span className='text-slate-400'>(Opsional)</span>
            </label>
            <input
              type='text'
              value={form.latin}
              onChange={(e) => handleChange('latin', e.target.value)}
              placeholder='Teks transliterasi latin...'
              className='w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
            />
          </div>

          {/* Arti */}
          <div>
            <label className='text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5'>
              Arti / Makna <span className='text-slate-400'>(Opsional)</span>
            </label>
            <textarea
              value={form.arti}
              onChange={(e) => handleChange('arti', e.target.value)}
              placeholder='Artinya...'
              rows={3}
              className='w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none'
            />
          </div>

          <button
            type='submit'
            disabled={saving || !form.title.trim()}
            className='w-full py-3.5 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2'
          >
            {saving ? 'Menyimpan...' : 'Simpan Doa Saya'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDoaModal;
