'use client';

import { useState, useEffect } from 'react';
import useUser from '@/hooks/useUser';
import useHaditsStorage from '@/hooks/useHaditsStorage';
import useHaditsReader from '@/hooks/useHaditsReader';
import {
  HADITS_API_BASE,
  DEFAULT_HADITS_SETTINGS,
} from '@/components/Hadits/Constants';
import HaditsHomeView from '@/components/hadits/HaditsHomeView';
import HaditsReadView from '@/components/hadits/HaditsReadView';
import HaditsBookmarksView from '@/components/hadits/HaditsBookmarksView';

/**
 * HaditsPage — orchestrator halaman Hadits.
 *
 * Mengelola:
 * - Navigasi antar view: 'home' | 'read' | 'bookmarks'
 * - State global: books, bookmarks, lastRead, settings
 * - Load/save via useHaditsStorage
 * - Logika reader via useHaditsReader
 * - Settings helpers (toggle, size)
 */
export default function HaditsPage() {
  const { user } = useUser();
  const storage = useHaditsStorage(user);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const [view, setView] = useState('home');

  // ─── Books data ───────────────────────────────────────────────────────────
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Persisted state ──────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_HADITS_SETTINGS);

  // ─── Load data saat mount / user berubah ──────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const data = await storage.loadHaditsData();
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.lastRead) setLastRead(data.lastRead);
      if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
    };
    load();
  }, [user]);

  // Auto-sync settings ke storage setiap kali berubah
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  // ─── Fetch daftar kitab ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${HADITS_API_BASE}/books`);
        const json = await res.json();
        setBooks(json.data || []);
      } catch (err) {
        console.error('Gagal fetch books:', err);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, []);

  // ─── Reader hook ──────────────────────────────────────────────────────────
  const reader = useHaditsReader({
    user,
    bookmarks,
    setBookmarks,
    lastRead,
    setLastRead,
  });

  // ─── Settings helpers ─────────────────────────────────────────────────────
  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const setSizeChange = (sizeKey) =>
    setSettings((prev) => ({ ...prev, arabSize: sizeKey }));

  // ─── Navigasi open book ───────────────────────────────────────────────────
  const handleOpenBook = (book, startPage = 1) => {
    if (!book) return;
    reader.openBook(book, startPage);
    setView('read');
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (view === 'home') {
    return (
      <HaditsHomeView
        books={books}
        loadingBooks={loadingBooks}
        lastRead={lastRead}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenBook={handleOpenBook}
        onOpenBookmarks={() => setView('bookmarks')}
        allBooks={books}
      />
    );
  }

  if (view === 'read') {
    return (
      <HaditsReadView
        book={reader.selectedBook}
        page={reader.page}
        hadiths={reader.hadiths}
        loadingHadiths={reader.loadingHadiths}
        bookmarks={bookmarks}
        lastRead={lastRead}
        copiedId={reader.copiedId}
        revealedIds={reader.revealedIds}
        jumpNumber={reader.jumpNumber}
        setJumpNumber={reader.setJumpNumber}
        settings={settings}
        onToggleSetting={toggleSetting}
        onSizeChange={setSizeChange}
        onJumpSubmit={reader.handleJumpToNumber}
        onChangePage={reader.changePage}
        onToggleBookmark={reader.toggleBookmark}
        onCopy={reader.handleCopy}
        onMarkLastRead={reader.markLastRead}
        onToggleReveal={reader.toggleReveal}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'bookmarks') {
    return (
      <HaditsBookmarksView
        bookmarks={bookmarks}
        onRemoveBookmark={reader.removeBookmark}
        onBack={() => setView('home')}
      />
    );
  }

  return null;
}
