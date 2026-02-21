'use client';

import { useState, useEffect } from 'react';
import useUser from '@/hooks/useUser';
import useDoaStorage from '@/hooks/useDoaStorage';
import useDoaActions from '@/hooks/useDoaActions';
import { doaCollections } from '@/data/doa';
import { DEFAULT_DOA_SETTINGS } from '@/components/Doa/Constants';
import DoaHomeView from '@/components/doa/DoaHomeView';
import DoaCategoryView from '@/components/doa/DoaCategoryView';
import DoaBookmarksView from '@/components/Doa/DoaBookmarksView';

/**
 * DoaPage — orchestrator halaman Doa.
 *
 * Mengelola:
 * - Navigasi antar view: 'home' | 'category' | 'bookmarks'
 * - State global: bookmarks, customDoas, settings, activeDoasList
 * - Load/save data via useDoaStorage
 * - Aksi via useDoaActions
 * - Fetch data API untuk kategori yang membutuhkannya
 *
 * Semua UI detail dihandle oleh masing-masing View component.
 */
export default function DoaPage() {
  const { user } = useUser();
  const storage = useDoaStorage(user);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const [view, setView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(null);
  const [activeDoasList, setActiveDoasList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategoryId, setLoadingCategoryId] = useState(null);

  // ─── Home search ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Persisted state ──────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState([]);
  const [customDoas, setCustomDoas] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_DOA_SETTINGS);

  // ─── Load data saat mount / user berubah ──────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const data = await storage.loadDoaData();
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.customDoas) setCustomDoas(data.customDoas);
      if (data.settings) setSettings(data.settings);
    };
    load();
  }, [user]);

  // Auto-sync settings ke storage
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  // ─── Hooks aksi ───────────────────────────────────────────────────────────
  const {
    copiedId,
    toggleBookmark,
    addCustomDoa,
    deleteCustomDoa,
    handleCopy,
  } = useDoaActions({
    user,
    bookmarks,
    setBookmarks,
    customDoas,
    setCustomDoas,
    setActiveDoasList,
    isCustomCategory: selectedCategory?.isCustom ?? false,
  });

  // ─── Settings helpers ─────────────────────────────────────────────────────
  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const setSizeChange = (sizeKey) =>
    setSettings((prev) => ({ ...prev, arabSize: sizeKey }));

  // ─── Navigasi ke kategori ─────────────────────────────────────────────────
  const handleOpenCategory = async (cat, targetSubTab = null) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    if (typeof window !== 'undefined') window.location.hash = '';

    // Kategori dengan sub-tab
    if (cat.hasTabs) {
      const tabToOpen = targetSubTab || cat.tabs[0].id;
      setActiveSubTab(tabToOpen);
      const tabData = cat.tabs.find((t) => t.id === tabToOpen);
      setActiveDoasList(tabData ? tabData.doas : []);
      setView('category');
      return;
    }

    // Kategori dari API eksternal
    if (cat.isApi) {
      setLoading(true);
      setLoadingCategoryId(cat.id);
      try {
        const res = await fetch(cat.api);
        const json = await res.json();
        const dataArray = Array.isArray(json) ? json : json.data || [];
        const parsed = cat.mapData ? cat.mapData(dataArray) : dataArray;
        setActiveDoasList(parsed);
      } catch (err) {
        console.error('Gagal fetch API doa:', err);
        setActiveDoasList(cat.fallbackDoas || []);
      } finally {
        setLoading(false);
        setLoadingCategoryId(null);
      }
    } else if (cat.isCustom) {
      // Kategori doa pribadi: tampilkan customDoas
      setActiveDoasList(customDoas);
    } else {
      // Kategori statis
      setActiveDoasList(cat.doas || []);
    }

    setView('category');
  };

  // ─── Ganti sub-tab di dalam kategori ─────────────────────────────────────
  const handleSwitchTab = (tabId) => {
    setActiveSubTab(tabId);
    const tabData = selectedCategory.tabs.find((t) => t.id === tabId);
    setActiveDoasList(tabData ? tabData.doas : []);
  };

  // ─── Kembali ke home dari category ───────────────────────────────────────
  const handleBackToHome = () => {
    setView('home');
    setSelectedCategory(null);
    setActiveDoasList([]);
    setActiveSubTab(null);
  };

  // ─── Bookmark callbacks dengan konteks kategori ───────────────────────────
  const handleBookmarkInCategory = (doa) =>
    toggleBookmark(
      doa,
      selectedCategory?.title,
      selectedCategory?.id,
      activeSubTab,
    );

  const handleBookmarkInBookmarksView = (doa) =>
    toggleBookmark(doa, doa.categoryTitle, doa.categoryId, doa.subTabId);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (view === 'home') {
    return (
      <DoaHomeView
        collections={doaCollections}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        loadingCategoryId={loadingCategoryId}
        onOpenCategory={handleOpenCategory}
        onOpenBookmarks={() => setView('bookmarks')}
      />
    );
  }

  if (view === 'category' && selectedCategory) {
    return (
      <DoaCategoryView
        category={selectedCategory}
        doasList={activeDoasList}
        loading={loading}
        bookmarks={bookmarks}
        copiedId={copiedId}
        settings={settings}
        onToggleSetting={toggleSetting}
        onSizeChange={setSizeChange}
        activeSubTab={activeSubTab}
        onSwitchTab={handleSwitchTab}
        onBookmark={handleBookmarkInCategory}
        onDelete={deleteCustomDoa}
        onCopy={handleCopy}
        onAddCustomDoa={addCustomDoa}
        onBack={handleBackToHome}
      />
    );
  }

  if (view === 'bookmarks') {
    return (
      <DoaBookmarksView
        bookmarks={bookmarks}
        copiedId={copiedId}
        settings={settings}
        onToggleBookmark={handleBookmarkInBookmarksView}
        onCopy={handleCopy}
        onBack={() => setView('home')}
      />
    );
  }

  return null;
}
