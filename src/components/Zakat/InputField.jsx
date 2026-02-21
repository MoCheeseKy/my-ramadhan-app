/**
 * Input field dengan label, prefix/suffix opsional, dan teks hint di bawahnya.
 * Digunakan di semua form kalkulator zakat.
 */
export default function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  type = 'number',
  min = '0',
}) {
  return (
    <div className='mb-4'>
      <label className='block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider'>
        {label}
      </label>
      <div className='flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 px-4 py-3 focus-within:border-[#1e3a8a]/30 dark:focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-[#1e3a8a]/10 dark:focus-within:ring-blue-500/20 transition-all'>
        {prefix && (
          <span className='text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0'>
            {prefix}
          </span>
        )}
        <input
          type={type}
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='flex-1 bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 tabular-nums'
          placeholder='0'
        />
        {suffix && (
          <span className='text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0'>
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className='text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed'>
          {hint}
        </p>
      )}
    </div>
  );
}
