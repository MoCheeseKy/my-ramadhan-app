'use client';

import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Search,
  BookmarkCheck,
  Bookmark,
  Trash2,
  BookOpen,
  Sun,
  Moon,
  Users,
  Heart,
  Sunrise,
  Sunset,
  Star,
  Copy,
  Check,
  RefreshCw,
  Plus,
  X,
  Settings2,
  Eye,
  EyeOff,
  Type,
  Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import useUser from '@/hook/useUser';
import { doaCollections } from '@/data/doa';

const ICONS = { Sun, Moon, BookOpen, Users, Heart, Sunrise, Sunset, Star };

const ARAB_SIZES = [
  { key: 'sm', label: 'S', size: '22px', leading: '2.1' },
  { key: 'md', label: 'M', size: '26px', leading: '2.4' },
  { key: 'lg', label: 'L', size: '30px', leading: '2.5' },
  { key: 'xl', label: 'XL', size: '36px', leading: '2.6' },
];

// ─── AsmaulHusnaItem ──────────────────────────────────────────────────────────
function AsmaulHusnaItem({
  doa,
  index,
  isBookmarked,
  settings,
  hafalanMode,
  onBookmark,
}) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => setRevealed(false), [hafalanMode]);
  const arabSizeConfig =
    ARAB_SIZES.find((s) => s.key === settings.arabSize) || ARAB_SIZES[1];

  return (
    <div
      id={`doa-${doa.id}`}
      className='bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-700 shadow-sm rounded-3xl p-4 flex flex-col items-center text-center relative transition-all duration-300 h-full'
    >
      <div className='absolute top-3 right-3'>
        <button
          onClick={() => onBookmark(doa)}
          className={`p-1.5 rounded-full transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>
      </div>
      <div className='absolute top-3 left-3'>
        <span className='w-6 h-6 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 text-[10px] font-black text-slate-400 dark:text-slate-400'>
          {doa.index || index}
        </span>
      </div>

      <div
        className={`w-full mt-6 flex-1 flex flex-col justify-center ${hafalanMode && !revealed ? 'cursor-pointer' : ''}`}
        onClick={() => hafalanMode && !revealed && setRevealed(true)}
      >
        {hafalanMode && !revealed ? (
          <div className='relative py-4'>
            <div className='blur-[6px] select-none pointer-events-none opacity-40'>
              <p className='font-amiri text-2xl text-slate-800 dark:text-slate-200 mb-1'>
                {doa.arab || 'اللَّهُ'}
              </p>
              <p className='text-rose-600 font-bold text-xs'>{doa.title}</p>
            </div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <Eye size={20} className='text-slate-400 dark:text-slate-500' />
            </div>
          </div>
        ) : (
          <>
            {settings.arab && doa.arab && (
              <p
                className='font-amiri text-slate-800 dark:text-slate-100 mb-2 leading-loose'
                dir='rtl'
                style={{ fontSize: arabSizeConfig.size }}
              >
                {doa.arab}
              </p>
            )}
            {settings.latin && (
              <h3 className='font-bold text-rose-600 dark:text-rose-400 text-sm mb-1'>
                {doa.title || doa.latin}
              </h3>
            )}
            {settings.terjemahan && doa.arti && (
              <p className='text-slate-500 dark:text-slate-400 text-[11px] leading-snug'>
                "{doa.arti}"
              </p>
            )}
            {hafalanMode && revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                }}
                className='mt-3 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 mx-auto hover:text-slate-600 dark:hover:text-slate-300'
              >
                <EyeOff size={10} /> Sembunyikan
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── DoaItem ─────────────────────────────────────────────────────────────────
function DoaItem({
  doa,
  isBookmarked,
  copiedId,
  settings,
  hafalanMode,
  isCustom,
  onBookmark,
  onDelete,
  onCopy,
}) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    setRevealed(false);
  }, [hafalanMode]);

  const arabSizeConfig =
    ARAB_SIZES.find((s) => s.key === settings.arabSize) || ARAB_SIZES[1];
  const isBilal = doa.role === 'bilal';
  const isJamaah = doa.role === 'jamaah';
  const arabText = doa.arab || '';
  const latinText = doa.latin || '';
  const artiText = doa.arti || '';

  return (
    <div
      id={`doa-${doa.id}`}
      className={`rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col h-full ${
        isJamaah
          ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 shadow-sm'
          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-rose-100 dark:hover:border-rose-800 shadow-sm'
      }`}
    >
      {/* HEADER */}
      <div className='flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-700/50 shrink-0'>
        <div className='flex-1 pr-4'>
          <h3 className='font-bold text-slate-800 dark:text-slate-100 text-[15px] leading-snug'>
            {doa.title || 'Judul Doa'}
          </h3>
          <div className='flex flex-wrap gap-1 mt-1.5'>
            {doa.group && (
              <span className='inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400'>
                {doa.group}
              </span>
            )}
            {doa.tags &&
              doa.tags.map((tag, i) => (
                <span
                  key={`tag-${i}`}
                  className='inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400'
                >
                  {tag}
                </span>
              ))}
            {doa.source && (
              <span className='inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'>
                Sumber: {doa.source}
              </span>
            )}
            {doa.role && (
              <span
                className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${isBilal ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'}`}
              >
                {isBilal ? 'Bilal' : 'Jamaah'}
              </span>
            )}
          </div>
        </div>
        <div className='flex items-center gap-1 shrink-0'>
          <button
            onClick={() => onCopy(doa)}
            className='p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
          >
            {copiedId === doa.id ? (
              <Check size={15} className='text-emerald-500' />
            ) : (
              <Copy size={15} />
            )}
          </button>
          {isCustom ? (
            <button
              onClick={() => onDelete(doa.id)}
              className='p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full'
            >
              <Trash2 size={15} />
            </button>
          ) : (
            <button
              onClick={() => onBookmark(doa)}
              className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              {isBookmarked ? (
                <BookmarkCheck size={15} />
              ) : (
                <Bookmark size={15} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      <div
        className={`px-5 py-4 flex-1 flex flex-col ${hafalanMode && !revealed ? 'cursor-pointer justify-center' : ''}`}
        onClick={() => hafalanMode && !revealed && setRevealed(true)}
      >
        {hafalanMode && !revealed ? (
          <div className='relative'>
            <div className='blur-[6px] select-none pointer-events-none opacity-50'>
              {settings.arab && arabText && (
                <p
                  className='font-amiri text-slate-800 dark:text-slate-200 text-right leading-[2.4] mb-3'
                  dir='rtl'
                  style={{ fontSize: arabSizeConfig.size }}
                >
                  {arabText}
                </p>
              )}
              {settings.latin && latinText && (
                <p className='text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed italic mt-2'>
                  {latinText}
                </p>
              )}
              {settings.terjemahan && artiText && (
                <p className='text-slate-700 dark:text-slate-300 text-sm leading-relaxed mt-3'>
                  "{artiText}"
                </p>
              )}
            </div>
            <button className='absolute inset-0 flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm'>
              <Eye size={18} /> Intip Doa
            </button>
          </div>
        ) : (
          <>
            {settings.arab && arabText && (
              <div className='mb-3'>
                <p
                  className='font-amiri text-slate-800 dark:text-slate-100 text-right leading-[2.4]'
                  dir='rtl'
                  style={{ fontSize: arabSizeConfig.size }}
                >
                  {arabText}
                </p>
              </div>
            )}
            {settings.latin && latinText && (
              <p className='text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed italic mt-1 mb-2'>
                {latinText}
              </p>
            )}
            {settings.terjemahan && artiText && (
              <p className='text-slate-700 dark:text-slate-300 text-sm leading-relaxed mt-2 pb-1 flex-1'>
                "{artiText}"
              </p>
            )}
            {hafalanMode && revealed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                }}
                className='mt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center w-full gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors'
              >
                <EyeOff size={12} /> Sembunyikan lagi
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── FilterPanel ──────────────────────────────────────────────────────────────
function FilterPanel({
  open,
  onClose,
  availableGroups,
  availableTags,
  activeGroup,
  setActiveGroup,
  activeTag,
  setActiveTag,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm'>
      <div
        ref={panelRef}
        className='bg-white dark:bg-slate-800 w-full max-w-md md:max-w-xl rounded-t-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-200'
      >
        <div className='w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-5' />
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2'>
            <Filter size={18} className='text-rose-500' /> Filter Doa
          </h2>
          <button
            onClick={onClose}
            className='p-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          >
            <X size={15} />
          </button>
        </div>

        <div className='max-h-[60vh] overflow-y-auto pr-2 pb-4'>
          {availableGroups.length > 1 && (
            <div className='mb-6'>
              <p className='text-xs font-bold text-slate-700 dark:text-slate-300 mb-3'>
                Berdasarkan Grup
              </p>
              <div className='flex flex-wrap gap-2'>
                {availableGroups.map((g) => (
                  <button
                    key={`grp-${g}`}
                    onClick={() => setActiveGroup(g)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border ${
                      activeGroup === g
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {g === 'Semua' ? 'Semua Grup' : g}
                  </button>
                ))}
              </div>
            </div>
          )}
          {availableTags.length > 1 && (
            <div>
              <p className='text-xs font-bold text-slate-700 dark:text-slate-300 mb-3'>
                Berdasarkan Tag / Label
              </p>
              <div className='flex flex-wrap gap-2'>
                {availableTags.map((tag) => (
                  <button
                    key={`tag-${tag}`}
                    onClick={() => setActiveTag(tag)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border ${
                      activeTag === tag
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-rose-300'
                    }`}
                  >
                    {tag === 'Semua' ? 'Semua Tag' : tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          {availableGroups.length <= 1 && availableTags.length <= 1 && (
            <div className='text-center py-8 text-slate-400 dark:text-slate-500 text-sm'>
              Tidak ada opsi filter untuk kategori ini.
            </div>
          )}
        </div>

        <div className='flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700'>
          <button
            onClick={() => {
              setActiveGroup('Semua');
              setActiveTag('Semua');
            }}
            className='flex-1 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors'
          >
            Reset Filter
          </button>
          <button
            onClick={onClose}
            className='flex-1 py-3.5 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-md'
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HALAMAN UTAMA ────────────────────────────────────────────────────────────
export default function DoaPage() {
  const router = useRouter();
  const { user } = useUser();

  const [view, setView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [activeDoasList, setActiveDoasList] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDoaQuery, setSearchDoaQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('Semua');
  const [activeTag, setActiveTag] = useState('Semua');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const [settings, setSettings] = useState({
    arab: true,
    latin: true,
    terjemahan: true,
    arabSize: 'md',
  });
  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [customDoas, setCustomDoas] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDoa, setNewDoa] = useState({
    title: '',
    arab: '',
    latin: '',
    arti: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('doa_bookmarks, doa_custom, doa_settings')
          .eq('personal_code', user.personal_code)
          .single();
        if (data) {
          if (data.doa_bookmarks) setBookmarks(data.doa_bookmarks);
          if (data.doa_custom) setCustomDoas(data.doa_custom);
          if (data.doa_settings) setSettings(data.doa_settings);
        }
      } else {
        const localBookmarks =
          JSON.parse(localStorage.getItem('myRamadhan_doa_bookmarks')) || [];
        const localCustom =
          JSON.parse(localStorage.getItem('myRamadhan_doa_custom')) || [];
        const localSettings = JSON.parse(
          localStorage.getItem('myRamadhan_doa_settings'),
        );
        setBookmarks(localBookmarks);
        setCustomDoas(localCustom);
        if (localSettings) setSettings(localSettings);
      }
    };
    loadUserData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('myRamadhan_doa_settings', JSON.stringify(settings));
    if (user)
      supabase
        .from('users')
        .update({ doa_settings: settings })
        .eq('personal_code', user.personal_code);
  }, [settings, user]);

  const filteredCollections = doaCollections.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const fetchApiData = async (url) => {
    const res = await fetch(url);
    const json = await res.json();
    const dataArray = Array.isArray(json) ? json : json.data || [];
    const mapper =
      selectedCategory?.mapData ||
      doaCollections.find((c) => c.api === url)?.mapData;
    if (mapper) return mapper(dataArray);
    return dataArray;
  };

  const handleOpenCategory = async (cat, targetSubTab = null) => {
    setSelectedCategory(cat);
    setSearchDoaQuery('');
    setActiveGroup('Semua');
    setActiveTag('Semua');
    window.location.hash = '';

    if (cat.hasTabs) {
      const tabToOpen = targetSubTab || cat.tabs[0].id;
      setActiveSubTab(tabToOpen);
      const tabData = cat.tabs.find((t) => t.id === tabToOpen);
      setActiveDoasList(tabData ? tabData.doas : []);
      setView('category');
      return;
    }

    if (cat.isApi) {
      setLoading(true);
      try {
        const parsedData = await fetchApiData(cat.api);
        setActiveDoasList(parsedData);
      } catch (err) {
        console.error('Gagal API:', err);
        setActiveDoasList(cat.fallbackDoas || []);
      } finally {
        setLoading(false);
      }
    } else if (cat.isCustom) {
      setActiveDoasList(customDoas);
    } else {
      setActiveDoasList(cat.doas || []);
    }

    setView('category');
  };

  const handleSwitchTab = (tabId) => {
    setActiveSubTab(tabId);
    const tabData = selectedCategory.tabs.find((t) => t.id === tabId);
    setActiveDoasList(tabData ? tabData.doas : []);
    setSearchDoaQuery('');
    setActiveGroup('Semua');
    setActiveTag('Semua');
  };

  const handleAddCustomDoa = async (e) => {
    e.preventDefault();
    if (!newDoa.title.trim()) return alert('Judul Doa wajib diisi!');
    const doaToAdd = { id: `custom-${Date.now()}`, ...newDoa };
    const updated = [...customDoas, doaToAdd];
    setCustomDoas(updated);
    setActiveDoasList(updated);
    localStorage.setItem('myRamadhan_doa_custom', JSON.stringify(updated));
    if (user)
      await supabase
        .from('users')
        .update({ doa_custom: updated })
        .eq('personal_code', user.personal_code);
    setNewDoa({ title: '', arab: '', latin: '', arti: '' });
    setIsAddModalOpen(false);
  };

  const handleDeleteCustomDoa = async (id) => {
    const updated = customDoas.filter((d) => d.id !== id);
    setCustomDoas(updated);
    setActiveDoasList(updated);
    localStorage.setItem('myRamadhan_doa_custom', JSON.stringify(updated));
    if (user)
      await supabase
        .from('users')
        .update({ doa_custom: updated })
        .eq('personal_code', user.personal_code);
  };

  const toggleBookmark = async (
    doa,
    categoryTitle,
    categoryId,
    subTabId = null,
  ) => {
    const isBookmarked = bookmarks.some((b) => b.id === doa.id);
    let newBookmarks = isBookmarked
      ? bookmarks.filter((b) => b.id !== doa.id)
      : [...bookmarks, { ...doa, categoryId, categoryTitle, subTabId }];
    setBookmarks(newBookmarks);
    localStorage.setItem(
      'myRamadhan_doa_bookmarks',
      JSON.stringify(newBookmarks),
    );
    if (user)
      await supabase
        .from('users')
        .update({ doa_bookmarks: newBookmarks })
        .eq('personal_code', user.personal_code);
  };

  const handleCopy = (doa) => {
    const text = `${doa.title}\n\n${doa.arab || ''}\n\n${doa.latin || ''}\n\n"${doa.arti || ''}"\n\n(Sumber: Aplikasi MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(doa.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const availableGroups = [
    'Semua',
    ...new Set(activeDoasList.map((d) => d.group).filter(Boolean)),
  ];
  const availableTags = [
    'Semua',
    ...new Set(activeDoasList.flatMap((d) => d.tags || []).filter(Boolean)),
  ];

  const filteredDoasList = activeDoasList.filter((doa) => {
    const matchSearch =
      !searchDoaQuery ||
      (doa.title || '').toLowerCase().includes(searchDoaQuery.toLowerCase()) ||
      (doa.arti || '').toLowerCase().includes(searchDoaQuery.toLowerCase()) ||
      (doa.latin || '').toLowerCase().includes(searchDoaQuery.toLowerCase());
    const matchGroup = activeGroup === 'Semua' || doa.group === activeGroup;
    const matchTag =
      activeTag === 'Semua' || (doa.tags && doa.tags.includes(activeTag));
    return matchSearch && matchGroup && matchTag;
  });

  const hasActiveFilter = activeGroup !== 'Semua' || activeTag !== 'Semua';

  // ── HOME ──────────────────────────────────────────────────────────────────────
  if (view === 'home') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20 selection:bg-rose-200 dark:selection:bg-rose-900'>
        <Head>
          <title>Kumpulan Doa - MyRamadhan</title>
        </Head>

        {/* CONTAINER ADAPTIF */}
        <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
          <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto'>
            <div className='flex items-center justify-between mb-5'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={() => router.push('/')}
                  className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                >
                  <ArrowLeft
                    size={20}
                    className='text-slate-600 dark:text-slate-400'
                  />
                </button>
                <h1 className='font-bold text-xl flex items-center gap-2 text-rose-600 dark:text-rose-400'>
                  <Heart size={24} /> Kumpulan Doa
                </h1>
              </div>
              <button
                onClick={() => setView('bookmarks')}
                className='p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors'
              >
                <Bookmark size={20} />
              </button>
            </div>

            <div className='relative'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                size={18}
              />
              <input
                type='text'
                placeholder='Cari kategori...'
                className='w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 outline-none text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
            </div>
          </div>
        </header>

        <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5'>
            {filteredCollections.map((cat) => {
              const IconComponent = ICONS[cat.icon] || BookOpen;
              const isThisLoading = loading && selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => !loading && handleOpenCategory(cat)}
                  className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[120px] md:min-h-[140px] group ${
                    isThisLoading
                      ? 'border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/20 opacity-70'
                      : 'border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700'
                  }`}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                      cat.isCustom
                        ? 'bg-rose-500 text-white shadow-md group-hover:bg-rose-600'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white'
                    }`}
                  >
                    {isThisLoading ? (
                      <RefreshCw size={20} className='animate-spin' />
                    ) : (
                      <IconComponent size={20} className='md:w-6 md:h-6' />
                    )}
                  </div>
                  <div>
                    <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base group-hover:text-rose-600 dark:group-hover:text-rose-400 leading-tight mb-1'>
                      {cat.title}
                    </h3>
                    <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500 line-clamp-1'>
                      {cat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ── KATEGORI ──────────────────────────────────────────────────────────────────
  if (view === 'category' && selectedCategory) {
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-24 selection:bg-rose-200 dark:selection:bg-rose-900'>
        <Head>
          <title>{selectedCategory.title} - MyRamadhan</title>
        </Head>

        <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-5 py-3 shadow-sm'>
          <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => {
                    setView('home');
                    setSelectedCategory(null);
                    setActiveDoasList([]);
                    setActiveSubTab(null);
                    setSearchDoaQuery('');
                    setActiveTag('Semua');
                    setActiveGroup('Semua');
                    window.location.hash = '';
                  }}
                  className='p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                >
                  <ArrowLeft
                    size={20}
                    className='text-slate-600 dark:text-slate-400'
                  />
                </button>
                <div>
                  <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-100 leading-tight'>
                    {selectedCategory.title}
                  </h1>
                  <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500'>
                    {filteredDoasList.length} Data Tersedia
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-1 md:gap-2'>
                <button
                  onClick={() => setHafalanMode(!hafalanMode)}
                  className={`px-3 py-1.5 md:py-2 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1 ${
                    hafalanMode
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-700'
                  }`}
                >
                  {hafalanMode ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span className='hidden sm:inline'>Hafalan</span>
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 md:p-2.5 rounded-full transition-colors ${showSettings ? 'bg-rose-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  <Settings2 size={18} />
                </button>
                {selectedCategory.isCustom && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className='p-2 md:p-2.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-md transition-all ml-1 md:ml-2'
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* SETTINGS PANEL */}
            {showSettings && (
              <div className='mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 md:flex md:items-center md:justify-center md:gap-6'>
                <div className='grid grid-cols-3 md:flex gap-2 mb-3 md:mb-0'>
                  {[
                    { key: 'arab', label: 'Arab' },
                    { key: 'latin', label: 'Latin' },
                    { key: 'terjemahan', label: 'Terjemah' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() =>
                        setSettings((s) => ({ ...s, [key]: !s[key] }))
                      }
                      className={`py-2 md:px-6 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${
                        settings[key]
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className='md:flex md:items-center md:gap-3'>
                  <div className='mt-4 mb-2 md:my-0'>
                    <p className='text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5'>
                      <Type size={11} className='md:w-3 md:h-3' /> Ukuran Arab
                    </p>
                  </div>
                  <div className='grid grid-cols-4 md:flex gap-2 pb-2 md:pb-0'>
                    {ARAB_SIZES.map((s) => (
                      <button
                        key={s.key}
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, arabSize: s.key }))
                        }
                        className={`flex flex-col md:flex-row md:gap-2 items-center justify-center py-2 md:px-3 md:py-1.5 rounded-xl border-2 transition-all ${
                          settings.arabSize === s.key
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            : 'border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                        }`}
                      >
                        <span
                          className='font-arabic leading-none mb-1 md:mb-0'
                          style={{ fontSize: s.size }}
                        >
                          ع
                        </span>
                        <span className='text-[10px] md:text-xs font-bold'>
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TABS */}
            {selectedCategory.hasTabs && (
              <div className='flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mt-3 md:max-w-xl md:mx-auto'>
                {selectedCategory.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleSwitchTab(tab.id)}
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

            {/* SEARCH BAR */}
            {!loading &&
              activeDoasList.length > 0 &&
              selectedCategory.id !== 'asmaul-husna' && (
                <div className='pt-4 flex gap-2 md:max-w-2xl md:mx-auto'>
                  <div className='relative flex-1'>
                    <Search
                      className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                      size={16}
                    />
                    <input
                      type='text'
                      placeholder='Cari doa di sini...'
                      className='w-full pl-10 pr-4 py-3 bg-slate-100/80 dark:bg-slate-700 rounded-2xl border-none focus:ring-2 focus:ring-rose-500 outline-none text-[13px] md:text-sm transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                      value={searchDoaQuery}
                      onChange={(e) => setSearchDoaQuery(e.target.value)}
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
                      <Filter size={20} className='md:w-5 md:h-5' />
                      <span className='hidden md:inline text-sm font-bold'>
                        Filter
                      </span>
                      {hasActiveFilter && (
                        <span className='absolute -top-1 -right-1 md:top-2 md:right-2 w-3 h-3 bg-indigo-400 border-2 border-white dark:border-slate-800 rounded-full'></span>
                      )}
                    </button>
                  )}
                </div>
              )}
          </div>
        </header>

        <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-4 pt-4 md:py-8'>
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

          {loading ? (
            <div className='flex flex-col items-center justify-center py-20 gap-3'>
              <RefreshCw size={32} className='animate-spin text-rose-500' />
              <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                Memuat doa dari server...
              </p>
            </div>
          ) : filteredDoasList.length === 0 ? (
            <div className='text-center py-20 border border-dashed border-slate-300 dark:border-slate-600 rounded-3xl bg-slate-50 dark:bg-slate-800/50 md:max-w-xl md:mx-auto'>
              <BookOpen
                size={40}
                className='mx-auto mb-3 text-slate-300 dark:text-slate-600'
              />
              <p className='text-slate-500 dark:text-slate-400 text-sm px-6 leading-relaxed'>
                {searchDoaQuery || hasActiveFilter
                  ? 'Tidak ada doa yang sesuai pencarian atau filter.'
                  : selectedCategory.isCustom
                    ? 'Belum ada doa pribadi. Klik tombol + di atas.'
                    : 'Data doa belum tersedia.'}
              </p>
            </div>
          ) : (
            <div
              className={
                selectedCategory.id === 'asmaul-husna'
                  ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4'
                  : 'grid grid-cols-1 md:grid-cols-2  gap-4 md:gap-5'
              }
            >
              {filteredDoasList.map((doa, index) => {
                if (selectedCategory.id === 'asmaul-husna') {
                  return (
                    <AsmaulHusnaItem
                      key={doa.id}
                      doa={doa}
                      index={index + 1}
                      isBookmarked={bookmarks.some((b) => b.id === doa.id)}
                      settings={settings}
                      hafalanMode={hafalanMode}
                      onBookmark={(d) =>
                        toggleBookmark(
                          d,
                          selectedCategory.title,
                          selectedCategory.id,
                          activeSubTab,
                        )
                      }
                    />
                  );
                }
                return (
                  <DoaItem
                    key={doa.id}
                    doa={doa}
                    isBookmarked={bookmarks.some((b) => b.id === doa.id)}
                    copiedId={copiedId}
                    settings={settings}
                    hafalanMode={hafalanMode}
                    isCustom={selectedCategory.isCustom}
                    onBookmark={(d) =>
                      toggleBookmark(
                        d,
                        selectedCategory.title,
                        selectedCategory.id,
                        activeSubTab,
                      )
                    }
                    onDelete={handleDeleteCustomDoa}
                    onCopy={handleCopy}
                  />
                );
              })}
            </div>
          )}
        </main>

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

        {/* MODAL TAMBAH DOA */}
        {isAddModalOpen && (
          <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4'>
            <div className='bg-white dark:bg-slate-800 w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-10'>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className='absolute top-5 right-5 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              >
                <X size={16} />
              </button>
              <h2 className='text-xl font-bold text-slate-800 dark:text-slate-100 mb-1'>
                Tambah Doa Pribadi
              </h2>
              <form onSubmit={handleAddCustomDoa} className='space-y-4 mt-5'>
                <div>
                  <label className='text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5'>
                    Judul Doa *
                  </label>
                  <input
                    type='text'
                    required
                    value={newDoa.title}
                    onChange={(e) =>
                      setNewDoa({ ...newDoa, title: e.target.value })
                    }
                    className='w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                    placeholder='Misal: Doa Lulus Ujian'
                  />
                </div>
                <div>
                  <label className='text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5'>
                    Teks Arab (Opsional)
                  </label>
                  <textarea
                    value={newDoa.arab}
                    onChange={(e) =>
                      setNewDoa({ ...newDoa, arab: e.target.value })
                    }
                    className='w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none font-arabic text-right h-20 text-slate-800 dark:text-slate-100'
                    placeholder='Teks Arab...'
                    dir='rtl'
                  />
                </div>
                <div>
                  <label className='text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5'>
                    Teks Latin (Opsional)
                  </label>
                  <input
                    type='text'
                    value={newDoa.latin}
                    onChange={(e) =>
                      setNewDoa({ ...newDoa, latin: e.target.value })
                    }
                    className='w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                    placeholder='Teks terjemahan latin...'
                  />
                </div>
                <div>
                  <label className='text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5'>
                    Arti / Makna (Opsional)
                  </label>
                  <textarea
                    value={newDoa.arti}
                    onChange={(e) =>
                      setNewDoa({ ...newDoa, arti: e.target.value })
                    }
                    className='w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none h-20 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                    placeholder='Artinya...'
                  />
                </div>
                <button
                  type='submit'
                  className='w-full py-3.5 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition-colors mt-2'
                >
                  Simpan Doa Saya
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── BOOKMARKS ─────────────────────────────────────────────────────────────────
  if (view === 'bookmarks') {
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20'>
        <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 px-6 py-4'>
          <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center gap-3'>
            <button
              onClick={() => setView('home')}
              className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
            >
              <ArrowLeft
                size={20}
                className='text-slate-600 dark:text-slate-400'
              />
            </button>
            <h1 className='font-bold text-xl flex items-center gap-2 text-rose-600 dark:text-rose-400'>
              <Bookmark size={22} /> Disimpan
            </h1>
          </div>
        </header>

        <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 space-y-4 md:space-y-0'>
          {bookmarks.length === 0 ? (
            <div className='text-center py-20 opacity-50'>
              <Bookmark
                size={48}
                className='mx-auto mb-4 text-slate-300 dark:text-slate-600'
              />
              <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                Belum ada doa yang disimpan.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
              {bookmarks.map((b) => (
                <DoaItem
                  key={b.id}
                  doa={b}
                  isBookmarked={true}
                  copiedId={copiedId}
                  settings={settings}
                  hafalanMode={false}
                  isCustom={false}
                  onBookmark={(d) =>
                    toggleBookmark(d, b.categoryTitle, b.categoryId, b.subTabId)
                  }
                  onDelete={() => {}}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return null;
}
