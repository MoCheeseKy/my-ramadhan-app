import { useState, useMemo } from 'react';
import { fiqihRamadhanMaster } from '@/data/fiqihData';
import { CATEGORIES } from '@/components/Fiqih/Contants/categories';

/**
 * Mengelola state navigasi (kategori aktif, query search) dan
 * semua logika filtering/pencarian data fiqih.
 */
export function useFiqihData() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  // Flatten semua item dari semua kategori untuk pencarian global
  const allItems = useMemo(() => {
    return CATEGORIES.flatMap((cat) => {
      const items = fiqihRamadhanMaster[cat.key] || [];
      return items.map((item) => ({
        ...item,
        _catKey: cat.key,
        _catLabel: cat.label,
        _catColor: cat.color,
        _catEmoji: cat.emoji,
      }));
    });
  }, []);

  // Jumlah item per kategori (dihitung sekali)
  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORIES.forEach((cat) => {
      counts[cat.key] = (fiqihRamadhanMaster[cat.key] || []).length;
    });
    return counts;
  }, []);

  const totalItems = useMemo(
    () => Object.values(categoryCounts).reduce((a, b) => a + b, 0),
    [categoryCounts],
  );

  // Item yang ditampilkan berdasarkan mode aktif
  const displayItems = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q),
      );
    }
    if (activeCategory) {
      const cat = CATEGORIES.find((c) => c.key === activeCategory);
      return (fiqihRamadhanMaster[activeCategory] || []).map((item) => ({
        ...item,
        _catKey: activeCategory,
        _catColor: cat?.color || 'amber',
      }));
    }
    return [];
  }, [searchQuery, activeCategory, allItems]);

  const isSearchMode = searchQuery.trim().length > 0;
  const isHomeView = !isSearchMode && !activeCategory;
  const activeCatConfig = CATEGORIES.find((c) => c.key === activeCategory);

  const handleSelectCategory = (key) => {
    setActiveCategory(key);
    setSearchQuery('');
  };

  const handleClearCategory = () => {
    setActiveCategory(null);
    setSearchQuery('');
  };

  const handleBack = (router) => {
    if (activeCategory && !isSearchMode) {
      setActiveCategory(null);
    } else {
      router.push('/');
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    activeCatConfig,
    displayItems,
    categoryCounts,
    totalItems,
    isSearchMode,
    isHomeView,
    handleSelectCategory,
    handleClearCategory,
    handleBack,
  };
}
