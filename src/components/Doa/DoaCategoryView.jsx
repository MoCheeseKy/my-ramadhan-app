'use client';

import Head from 'next/head';
import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Eye,
  EyeOff,
  Settings2,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import DoaSettingsPanel from '@/components/doa/DoaSettingsPanel';
import FilterPanel from '@/components/doa/FilterPanel';
import AsmaulHusnaItem from '@/components/doa/AsmaulHusnaItem';
import DoaItem from '@/components/doa/DoaItem';
import AddDoaModal from '@/components/doa/AddDoaModal';

/**
 * DoaCategoryView — view konten doa dalam satu kategori.
 *
 * @prop {object}   category           - Objek kategori aktif (dari doaCollections)
 * @prop {Array}    doasList           - List doa yang tampil (sudah difilter di orchestrator)
 * @prop {boolean}  loading
 * @prop {Array}    bookmarks
 * @prop {any}      copiedId
 * @prop {object}   settings
 * @prop {Function} onToggleSetting
 * @prop {Function} onSizeChange
 * @prop {string}   activeSubTab
 * @prop {Function} onSwitchTab
 * @prop {Function} onBookmark         - (doa) => void
 * @prop {Function} onDelete           - (id) => void
 * @prop {Function} onCopy             - (doa) => void
 * @prop {Function} onAddCustomDoa     - async (formData, onSuccess) => void
 * @prop {Function} onBack             - Kembali ke home
 */
const DoaCategoryView = ({
  category,
  doasList,
  loading,
  bookmarks,
  copiedId,
  settings,
  onToggleSetting,
  onSizeChange,
  activeSubTab,
  onSwitchTab,
  onBookmark,
  onDelete,
  onCopy,
  onAddCustomDoa,
  onBack,
}) => {
  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchDoaQuery, setSearchDoaQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('Semua');
  const [activeTag, setActiveTag] = useState('Semua');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Opsi filter diturunkan dari doasList
  const availableGroups = useMemo(
    () => ['Semua', ...new Set(doasList.map((d) => d.group).filter(Boolean))],
    [doasList],
  );
  const availableTags = useMemo(
    () => [
      'Semua',
      ...new Set(doasList.flatMap((d) => d.tags || []).filter(Boolean)),
    ],
    [doasList],
  );

  const hasActiveFilter = activeGroup !== 'Semua' || activeTag !== 'Semua';

  // Filter lokal (search + group + tag)
  const filteredList = useMemo(
    () =>
      doasList.filter((doa) => {
        const q = searchDoaQuery.toLowerCase();
        const matchSearch =
          !q ||
          (doa.title || '').toLowerCase().includes(q) ||
          (doa.arti || '').toLowerCase().includes(q) ||
          (doa.latin || '').toLowerCase().includes(q);
        const matchGroup = activeGroup === 'Semua' || doa.group === activeGroup;
        const matchTag = activeTag === 'Semua' || doa.tags?.includes(activeTag);
        return matchSearch && matchGroup && matchTag;
      }),
    [doasList, searchDoaQuery, activeGroup, activeTag],
  );

  const handleBack = () => {
    setSearchDoaQuery('');
    setActiveGroup('Semua');
    setActiveTag('Semua');
    if (typeof window !== 'undefined') window.location.hash = '';
    onBack();
  };

  const isAsmaulHusna = category.id === 'asmaul-husna';

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-24 selection:bg-rose-200 dark:selection:bg-rose-900'>
      <Head>
        <title>{category.title} - MyRamadhan</title>
      </Head>

      {/* ── HEADER STICKY ── */}
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-5 py-3 shadow-sm'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto'>
          {/* Baris atas: back + judul + action buttons */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleBack}
                className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
              >
                <ArrowLeft
                  size={20}
                  className='text-slate-600 dark:text-slate-400'
                />
              </button>
              <div>
                <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-100 leading-tight'>
                  {category.title}
                </h1>
                <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500'>
                  {filteredList.length} Data Tersedia
                </p>
              </div>
            </div>

            <div className='flex items-center gap-1 md:gap-2'>
              {/* Mode hafalan */}
              <button
                onClick={() => setHafalanMode((v) => !v)}
                className={`px-3 py-1.5 md:py-2 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1 ${
                  hafalanMode
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-700'
                }`}
              >
                {hafalanMode ? <Eye size={14} /> : <EyeOff size={14} />}
                <span className='hidden sm:inline'>Hafalan</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettings((v) => !v)}
                className={`p-2 md:p-2.5 rounded-full transition-colors ${
                  showSettings
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Settings2 size={18} />
              </button>

              {/* Tambah doa (khusus kategori custom) */}
              {category.isCustom && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className='p-2 md:p-2.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-md transition-all ml-1 md:ml-2'
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <DoaSettingsPanel
              settings={settings}
              onToggle={onToggleSetting}
              onSizeChange={onSizeChange}
            />
          )}

          {/* Tabs (kategori yang punya sub-tab) */}
          {category.hasTabs && (
            <div className='flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mt-3 md:max-w-xl md:mx-auto'>
              {category.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onSwitchTab(tab.id)}
                  className={`flex-1 py-2 md:py-2.5 text-[13px] md:text-sm font-bold rounded-lg transition-all ${
                    activeSubTab === tab.id
                      ? 'bg-white dark:bg-slate-600 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Search + Filter bar (disembunyikan di Asmaul Husna & saat loading) */}
          {!loading && doasList.length > 0 && !isAsmaulHusna && (
            <div className='pt-4 flex gap-2 md:max-w-2xl md:mx-auto'>
              <div className='relative flex-1'>
                <Search
                  className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                  size={16}
                />
                <input
                  type='text'
                  placeholder='Cari doa di sini...'
                  value={searchDoaQuery}
                  onChange={(e) => setSearchDoaQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 bg-slate-100/80 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 outline-none text-[13px] md:text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                />
              </div>
              {(availableGroups.length > 1 || availableTags.length > 1) && (
                <button
                  onClick={() => setShowFilterPanel(true)}
                  className={`relative p-3 md:px-5 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                    hasActiveFilter
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-slate-100/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Filter size={20} />
                  <span className='hidden md:inline text-sm font-bold'>
                    Filter
                  </span>
                  {hasActiveFilter && (
                    <span className='absolute -top-1 -right-1 md:top-2 md:right-2 w-3 h-3 bg-indigo-400 border-2 border-white dark:border-slate-800 rounded-full' />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-4 pt-4 md:py-8'>
        {/* Banner hafalan */}
        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3 flex items-center gap-2 mb-4 md:max-w-xl md:mx-auto'>
            <EyeOff
              size={16}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-400 text-xs md:text-sm font-semibold'>
              Mode Hafalan aktif — klik "Intip Doa" untuk melihat bacaan
            </p>
          </div>
        )}

        {/* Loading spinner */}
        {loading ? (
          <div className='flex flex-col items-center justify-center py-20 gap-3'>
            <RefreshCw size={32} className='animate-spin text-rose-500' />
            <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
              Memuat doa dari server...
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          /* Empty state */
          <div className='text-center py-20 border border-dashed border-slate-300 dark:border-slate-600 rounded-3xl bg-slate-50 dark:bg-slate-800/50 md:max-w-xl md:mx-auto'>
            <BookOpen
              size={40}
              className='mx-auto mb-3 text-slate-300 dark:text-slate-600'
            />
            <p className='text-slate-500 dark:text-slate-400 text-sm px-6 leading-relaxed'>
              {searchDoaQuery || hasActiveFilter
                ? 'Tidak ada doa yang sesuai pencarian atau filter.'
                : category.isCustom
                  ? 'Belum ada doa pribadi. Klik tombol + di atas untuk menambahkan.'
                  : 'Data doa belum tersedia.'}
            </p>
          </div>
        ) : (
          /* Grid doa */
          <div
            className={
              isAsmaulHusna
                ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4'
                : 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5'
            }
          >
            {filteredList.map((doa, index) =>
              isAsmaulHusna ? (
                <AsmaulHusnaItem
                  key={doa.id}
                  doa={doa}
                  index={index + 1}
                  isBookmarked={bookmarks.some((b) => b.id === doa.id)}
                  settings={settings}
                  hafalanMode={hafalanMode}
                  onBookmark={onBookmark}
                />
              ) : (
                <DoaItem
                  key={doa.id}
                  doa={doa}
                  isBookmarked={bookmarks.some((b) => b.id === doa.id)}
                  copiedId={copiedId}
                  settings={settings}
                  hafalanMode={hafalanMode}
                  isCustom={category.isCustom}
                  onBookmark={onBookmark}
                  onDelete={onDelete}
                  onCopy={onCopy}
                />
              ),
            )}
          </div>
        )}
      </main>

      {/* Filter panel */}
      <FilterPanel
        open={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        availableGroups={availableGroups}
        availableTags={availableTags}
        activeGroup={activeGroup}
        setActiveGroup={setActiveGroup}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
      />

      {/* Modal tambah doa */}
      <AddDoaModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={onAddCustomDoa}
      />
    </div>
  );
};

export default DoaCategoryView;
