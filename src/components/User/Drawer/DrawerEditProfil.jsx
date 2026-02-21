'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  Camera,
  Loader2,
  MapPin,
  Search,
  ChevronDown,
  CheckCircle2,
  User as UserIcon,
} from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';
import { CITIES } from '@/data/cities';

/**
 * DrawerEditProfil — form untuk mengubah username, foto profil, dan kota.
 *
 * @prop {boolean}  open            - State buka/tutup
 * @prop {Function} onClose         - Tutup drawer
 * @prop {object}   profileData     - Data profil saat ini { name, avatar }
 * @prop {string}   editName        - State controlled untuk nama
 * @prop {Function} setEditName
 * @prop {string}   editLocation    - State controlled untuk kota
 * @prop {Function} setEditLocation
 * @prop {boolean}  isUploading     - Loading saat upload foto
 * @prop {boolean}  isSaving        - Loading saat simpan profil
 * @prop {Function} onUploadPhoto   - Handler file input foto
 * @prop {Function} onSaveProfile   - Handler simpan profil
 */
const DrawerEditProfil = ({
  open,
  onClose,
  profileData,
  editName,
  setEditName,
  editLocation,
  setEditLocation,
  isUploading,
  isSaving,
  onUploadPhoto,
  onSaveProfile,
}) => {
  const fileInputRef = useRef(null);
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [searchCityTerm, setSearchCityTerm] = useState('');

  const filteredCities = CITIES.filter((city) =>
    city.toLowerCase().includes(searchCityTerm.toLowerCase()),
  );

  return (
    <DrawerPanel
      open={open}
      onClose={onClose}
      title='Edit Profil'
      icon={Edit3}
      titleColor='text-slate-800 dark:text-slate-100'
      hideFooterButton
    >
      {/* Avatar & tombol upload foto */}
      <div className='flex flex-col items-center mb-6 mt-2'>
        <div className='relative w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-md overflow-hidden mb-3'>
          {profileData.avatar ? (
            <Image
              src={profileData.avatar}
              alt='Avatar'
              fill
              className='object-cover'
            />
          ) : (
            <UserIcon
              size={40}
              className='text-slate-400 dark:text-slate-500'
            />
          )}
          {isUploading && (
            <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
              <Loader2 className='animate-spin text-white' size={24} />
            </div>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className='text-xs font-bold text-[#1e3a8a] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-4 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2'
        >
          <Camera size={14} />{' '}
          {isUploading ? 'Mengunggah...' : 'Ubah Foto Profil'}
        </button>
        <input
          type='file'
          accept='image/png, image/jpeg, image/webp'
          ref={fileInputRef}
          onChange={onUploadPhoto}
          className='hidden'
        />
      </div>

      {/* Form fields */}
      <div className='space-y-4 pb-4'>
        {/* Input username */}
        <div>
          <label className='text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block'>
            Username
          </label>
          <input
            type='text'
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className='w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
            placeholder='Masukkan nama pengguna'
          />
        </div>

        {/* City picker */}
        <div>
          <label className='text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block'>
            Lokasi Kota (Untuk Jadwal Sholat)
          </label>
          <button
            onClick={() => setIsCityPickerOpen(!isCityPickerOpen)}
            className={`w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border transition-all ${isCityPickerOpen ? 'border-[#1e3a8a] dark:border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700'}`}
          >
            <div className='flex items-center gap-3 text-left'>
              <MapPin
                size={18}
                className='text-slate-500 dark:text-slate-400'
              />
              <span className='font-semibold text-sm text-slate-800 dark:text-slate-100'>
                {editLocation || 'Pilih Kota'}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform ${isCityPickerOpen ? 'rotate-180 text-[#1e3a8a] dark:text-blue-400' : ''}`}
            />
          </button>

          {/* Dropdown kota dengan animasi */}
          <AnimatePresence>
            {isCityPickerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className='overflow-hidden'
              >
                <div className='bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm'>
                  <div className='relative mb-2'>
                    <Search
                      size={14}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                    />
                    <input
                      type='text'
                      placeholder='Cari kota...'
                      value={searchCityTerm}
                      onChange={(e) => setSearchCityTerm(e.target.value)}
                      className='w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500'
                    />
                  </div>
                  <div className='max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setEditLocation(city);
                            setIsCityPickerOpen(false);
                            setSearchCityTerm('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${editLocation === city ? 'bg-blue-50 dark:bg-blue-900/40 text-[#1e3a8a] dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          {city}
                          {editLocation === city && (
                            <CheckCircle2
                              size={16}
                              className='text-[#1e3a8a] dark:text-blue-400'
                            />
                          )}
                        </button>
                      ))
                    ) : (
                      <p className='text-center text-xs text-slate-400 py-3'>
                        Kota tidak ditemukan
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onSaveProfile}
          disabled={isSaving || !editName.trim()}
          className='w-full py-3.5 mt-4 bg-[#1e3a8a] dark:bg-blue-700 text-white font-bold rounded-xl hover:bg-[#162d6e] dark:hover:bg-blue-600 transition-colors disabled:opacity-50'
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </DrawerPanel>
  );
};

export default DrawerEditProfil;
