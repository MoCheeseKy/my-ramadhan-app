import InputField from './InputField';
import ResultBox from './ResultBox';
import InfoChip from './InfoChip';
import { formatRp } from '@/utils/formatRp';

/**
 * Konten form & hasil kalkulasi Zakat Fitrah.
 * Dirender sebagai children di dalam SectionCard.
 */
export default function ZakatFitrah({ data }) {
  const { jiwaBayar, setJiwaBayar, hargaBeras, setHargaBeras, result } = data;

  return (
    <>
      <InputField
        label='Jumlah Jiwa yang Dibayarkan'
        value={jiwaBayar}
        onChange={setJiwaBayar}
        suffix='orang'
        hint='Termasuk dirimu dan tanggungan (anak, istri, dll)'
      />
      <InputField
        label='Harga Beras per Kg'
        value={hargaBeras}
        onChange={setHargaBeras}
        prefix='Rp'
        hint='Default Rp 15.000/kg (beras medium). Sesuaikan dengan harga di daerahmu.'
      />
      <ResultBox
        label={`Zakat Fitrah — ${jiwaBayar} jiwa`}
        value={formatRp(result.total)}
        isWajib
        note={`≈ ${result.beras} kg beras atau setara uangnya`}
      />
      <InfoChip text="Zakat fitrah = 1 sha' (±2,5 kg beras) per jiwa. Dibayar sebelum sholat Idul Fitri." />
    </>
  );
}
