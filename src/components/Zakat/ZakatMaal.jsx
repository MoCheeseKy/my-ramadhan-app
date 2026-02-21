import InputField from './InputField';
import ResultBox from './ResultBox';
import InfoChip from './InfoChip';
import { formatRp } from '@/utils/formatRp';
import { NISAB_EMAS_GRAM } from './Constants';

/**
 * Konten form & hasil kalkulasi Zakat Maal (Harta).
 * Dirender sebagai children di dalam SectionCard.
 */
export default function ZakatMaal({ data }) {
  const {
    tabungan,
    setTabungan,
    investasi,
    setInvestasi,
    piutang,
    setPiutang,
    hargaEmasMaal,
    setHargaEmasMaal,
    result,
  } = data;

  const hasInput =
    (Number(tabungan) || Number(investasi) || Number(piutang)) > 0;

  return (
    <>
      <p className='text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed'>
        Masukkan total harta yang sudah dimiliki selama ≥ 1 tahun (haul).
      </p>

      <InputField
        label='Tabungan / Uang Tunai'
        value={tabungan}
        onChange={setTabungan}
        prefix='Rp'
      />
      <InputField
        label='Investasi (Saham, Reksa Dana, dll)'
        value={investasi}
        onChange={setInvestasi}
        prefix='Rp'
      />
      <InputField
        label='Piutang yang Bisa Dicairkan'
        value={piutang}
        onChange={setPiutang}
        prefix='Rp'
      />
      <InputField
        label='Harga Emas per Gram (untuk nisab)'
        value={hargaEmasMaal}
        onChange={setHargaEmasMaal}
        prefix='Rp'
        hint={`Nisab = ${NISAB_EMAS_GRAM}g emas = ${formatRp(NISAB_EMAS_GRAM * Number(hargaEmasMaal))}`}
      />

      {hasInput && (
        <>
          {/* Ringkasan kalkulasi */}
          <div className='mt-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2'>
            {[
              { label: 'Total Harta', value: formatRp(result.totalHarta) },
              { label: 'Nisab (85g emas)', value: formatRp(result.nisab) },
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
                className={`font-bold ${result.wajib ? 'text-[#1e3a8a] dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
              >
                {result.wajib ? '✓ Wajib Zakat' : '✗ Belum Nisab'}
              </span>
            </div>
          </div>

          <ResultBox
            label='Zakat Maal yang Harus Dibayar'
            value={result.wajib ? formatRp(result.zakat) : 'Belum Wajib'}
            isWajib={result.wajib}
            note={
              result.wajib
                ? `2,5% × ${formatRp(result.totalHarta)}`
                : `Harta belum mencapai nisab ${formatRp(result.nisab)}`
            }
          />
        </>
      )}

      <InfoChip text='Zakat maal = 2,5% dari total harta yang sudah dimiliki 1 tahun (haul) dan melebihi nisab (85 gram emas).' />
    </>
  );
}
