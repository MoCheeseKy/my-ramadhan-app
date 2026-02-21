import InputField from './InputField';
import ResultBox from './ResultBox';
import InfoChip from './InfoChip';
import { formatRp } from '@/utils/formatRp';
import { NISAB_EMAS_GRAM } from './Constants';

/**
 * Konten form & hasil kalkulasi Zakat Penghasilan.
 * Dirender sebagai children di dalam SectionCard.
 */
export default function ZakatPenghasilan({ data }) {
  const {
    gaji,
    setGaji,
    penghasilanLain,
    setPenghasilanLain,
    hargaEmasPenghasilan,
    setHargaEmasPenghasilan,
    result,
  } = data;

  const hasInput = (Number(gaji) || Number(penghasilanLain)) > 0;

  return (
    <>
      <p className='text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed'>
        Dibayar bulanan jika penghasilan setahun ≥ nisab. Atau bisa dikumpulkan
        dan dibayar setahun sekali.
      </p>

      <InputField
        label='Gaji / Penghasilan Utama per Bulan'
        value={gaji}
        onChange={setGaji}
        prefix='Rp'
      />
      <InputField
        label='Penghasilan Lain per Bulan'
        value={penghasilanLain}
        onChange={setPenghasilanLain}
        prefix='Rp'
        hint='Freelance, bisnis, dll'
      />
      <InputField
        label='Harga Emas per Gram (untuk nisab)'
        value={hargaEmasPenghasilan}
        onChange={setHargaEmasPenghasilan}
        prefix='Rp'
        hint={`Nisab tahunan = ${formatRp(NISAB_EMAS_GRAM * Number(hargaEmasPenghasilan))}`}
      />

      {hasInput && (
        <>
          {/* Ringkasan kalkulasi */}
          <div className='mt-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2'>
            {[
              {
                label: 'Penghasilan / bulan',
                value: formatRp(result.totalBulan),
              },
              {
                label: 'Penghasilan / tahun',
                value: formatRp(result.totalTahun),
              },
              { label: 'Nisab tahunan', value: formatRp(result.nisab) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className='flex justify-between text-xs md:text-sm'
              >
                <span className='text-slate-400 dark:text-slate-500'>
                  {label}
                </span>
                <span className='font-bold text-slate-700 dark:text-slate-300'>
                  {value}
                </span>
              </div>
            ))}
            <div className='flex justify-between text-xs md:text-sm'>
              <span className='text-slate-400 dark:text-slate-500'>Status</span>
              <span
                className={`font-bold ${result.wajib ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                {result.wajib ? '✓ Wajib Zakat' : '✗ Belum Nisab'}
              </span>
            </div>
          </div>

          <ResultBox
            label='Zakat Penghasilan per Bulan'
            value={result.wajib ? formatRp(result.zakatBulan) : 'Belum Wajib'}
            isWajib={result.wajib}
            note={
              result.wajib
                ? `2,5% × ${formatRp(result.totalBulan)} / bulan`
                : 'Penghasilan tahunan belum mencapai nisab'
            }
          />
        </>
      )}

      <InfoChip text='Zakat penghasilan = 2,5% dari gaji/bulan jika penghasilan setahun ≥ nisab emas (85g). Dasar: fatwa MUI No. 3/2003.' />
    </>
  );
}
