import FiqihCard from './FiqihCard';

/**
 * View daftar materi dalam satu kategori yang dipilih.
 * Menampilkan empty state jika kategori belum memiliki data.
 */
export default function CategoryView({ displayItems, activeCatConfig }) {
  const color = activeCatConfig?.color || 'amber';

  if (displayItems.length === 0) {
    return (
      <div className='text-center py-20 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl md:max-w-xl md:mx-auto'>
        <div className='text-4xl mb-3'>🚧</div>
        <p className='font-bold text-slate-600 dark:text-slate-400 mb-1'>
          Materi Segera Hadir
        </p>
        <p className='text-sm text-slate-400 dark:text-slate-500'>
          Kategori ini sedang dalam penyusunan.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5'>
      {displayItems.map((item) => (
        <FiqihCard key={item.id} item={item} color={color} />
      ))}
    </div>
  );
}
