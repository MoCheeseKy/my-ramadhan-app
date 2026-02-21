import InputField from './InputField';
import ResultBox from './ResultBox';
import InfoChip from './InfoChip';
import { formatRp } from '@/utils/formatRp';
import { NISAB_EMAS_GRAM, NISAB_PERAK_GRAM } from './Constants';

/**
 * Konten form & hasil kalkulasi Zakat Emas & Perak.
 * Dibagi menjadi dua sub-section: Emas dan Perak.
 * Dirender sebagai children di dalam SectionCard.
 */
export default function ZakatEmasPerak({ data }) {
  const {
    beratEmas,
    setBeratEmas,
    hargaEmasGram,
    setHargaEmasGram,
    beratPerak,
    setBeratPerak,
    hargaPerakGram,
    setHargaPerakGram,
    result,
  } = data;

  return (
    <>
      <p className='text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed'>
        Emas/perak yang disimpan (bukan dipakai sehari-hari) dan sudah dimiliki
        ≥ 1 tahun.
      </p>

      {/* Sub-section: Emas */}
      <div className='mb-5'>
        <p className='text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3'>
          🥇 Emas
        </p>
        <InputField
          label='Berat Emas'
          value={beratEmas}
          onChange={setBeratEmas}
          suffix='gram'
          hint={`Nisab emas = ${NISAB_EMAS_GRAM} gram`}
        />
        <InputField
          label='Harga Emas per Gram'
          value={hargaEmasGram}
          onChange={setHargaEmasGram}
          prefix='Rp'
        />
        {Number(beratEmas) > 0 && (
          <ResultBox
            label='Zakat Emas'
            value={
              result.wajibEmas ? formatRp(result.zakatEmas) : 'Belum Wajib'
            }
            isWajib={result.wajibEmas}
            note={
              result.wajibEmas
                ? `2,5% × ${formatRp(result.nilaiEmas)}`
                : `Berat emas belum mencapai nisab ${NISAB_EMAS_GRAM}g`
            }
          />
        )}
      </div>

      {/* Sub-section: Perak */}
      <div className='pt-4 border-t border-slate-100 dark:border-slate-800'>
        <p className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3'>
          🥈 Perak
        </p>
        <InputField
          label='Berat Perak'
          value={beratPerak}
          onChange={setBeratPerak}
          suffix='gram'
          hint={`Nisab perak = ${NISAB_PERAK_GRAM} gram`}
        />
        <InputField
          label='Harga Perak per Gram'
          value={hargaPerakGram}
          onChange={setHargaPerakGram}
          prefix='Rp'
        />
        {Number(beratPerak) > 0 && (
          <ResultBox
            label='Zakat Perak'
            value={
              result.wajibPerak ? formatRp(result.zakatPerak) : 'Belum Wajib'
            }
            isWajib={result.wajibPerak}
            note={
              result.wajibPerak
                ? `2,5% × ${formatRp(result.nilaiPerak)}`
                : `Berat perak belum mencapai nisab ${NISAB_PERAK_GRAM}g`
            }
          />
        )}
      </div>

      <InfoChip text='Emas yang dipakai sehari-hari (perhiasan wajar) tidak wajib zakat menurut mayoritas ulama. Yang dihitung adalah emas simpanan/investasi.' />
    </>
  );
}
