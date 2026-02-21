import { useState, useMemo } from 'react';
import {
  NISAB_EMAS_GRAM,
  NISAB_PERAK_GRAM,
  ZAKAT_RATE,
  FITRAH_BERAS_KG,
  DEFAULT_HARGA_EMAS,
  DEFAULT_HARGA_BERAS,
  DEFAULT_HARGA_PERAK,
} from '../components/Zakat/Constants';

/**
 * Mengelola seluruh state input dan hasil kalkulasi untuk 4 jenis zakat:
 * Fitrah, Maal, Penghasilan, dan Emas & Perak.
 */
export function useZakatCalc() {
  // ── Fitrah ──
  const [jiwaBayar, setJiwaBayar] = useState(1);
  const [hargaBeras, setHargaBeras] = useState(DEFAULT_HARGA_BERAS);

  // ── Maal ──
  const [tabungan, setTabungan] = useState('');
  const [investasi, setInvestasi] = useState('');
  const [piutang, setPiutang] = useState('');
  const [hargaEmasMaal, setHargaEmasMaal] = useState(DEFAULT_HARGA_EMAS);

  // ── Penghasilan ──
  const [gaji, setGaji] = useState('');
  const [penghasilanLain, setPenghasilanLain] = useState('');
  const [hargaEmasPenghasilan, setHargaEmasPenghasilan] =
    useState(DEFAULT_HARGA_EMAS);

  // ── Emas & Perak ──
  const [beratEmas, setBeratEmas] = useState('');
  const [hargaEmasGram, setHargaEmasGram] = useState(DEFAULT_HARGA_EMAS);
  const [beratPerak, setBeratPerak] = useState('');
  const [hargaPerakGram, setHargaPerakGram] = useState(DEFAULT_HARGA_PERAK);

  // ── Hasil kalkulasi ──

  const fitrahResult = useMemo(() => {
    const total = Number(jiwaBayar) * FITRAH_BERAS_KG * Number(hargaBeras);
    return { total, beras: Number(jiwaBayar) * FITRAH_BERAS_KG };
  }, [jiwaBayar, hargaBeras]);

  const maalResult = useMemo(() => {
    const totalHarta =
      (Number(tabungan) || 0) +
      (Number(investasi) || 0) +
      (Number(piutang) || 0);
    const nisab = NISAB_EMAS_GRAM * Number(hargaEmasMaal);
    const wajib = totalHarta >= nisab;
    return {
      totalHarta,
      nisab,
      wajib,
      zakat: wajib ? totalHarta * ZAKAT_RATE : 0,
    };
  }, [tabungan, investasi, piutang, hargaEmasMaal]);

  const penghasilanResult = useMemo(() => {
    const totalBulan = (Number(gaji) || 0) + (Number(penghasilanLain) || 0);
    const totalTahun = totalBulan * 12;
    const nisab = NISAB_EMAS_GRAM * Number(hargaEmasPenghasilan);
    const wajib = totalTahun >= nisab;
    return {
      totalBulan,
      totalTahun,
      nisab,
      wajib,
      zakatBulan: wajib ? totalBulan * ZAKAT_RATE : 0,
    };
  }, [gaji, penghasilanLain, hargaEmasPenghasilan]);

  const emasPerakResult = useMemo(() => {
    const nilaiEmas = (Number(beratEmas) || 0) * Number(hargaEmasGram);
    const nilaiPerak = (Number(beratPerak) || 0) * Number(hargaPerakGram);
    const wajibEmas = (Number(beratEmas) || 0) >= NISAB_EMAS_GRAM;
    const wajibPerak = (Number(beratPerak) || 0) >= NISAB_PERAK_GRAM;
    return {
      nilaiEmas,
      nilaiPerak,
      nisabEmas: NISAB_EMAS_GRAM * Number(hargaEmasGram),
      nisabPerak: NISAB_PERAK_GRAM * Number(hargaPerakGram),
      wajibEmas,
      wajibPerak,
      zakatEmas: wajibEmas ? nilaiEmas * ZAKAT_RATE : 0,
      zakatPerak: wajibPerak ? nilaiPerak * ZAKAT_RATE : 0,
    };
  }, [beratEmas, hargaEmasGram, beratPerak, hargaPerakGram]);

  return {
    // Fitrah
    fitrah: {
      jiwaBayar,
      setJiwaBayar,
      hargaBeras,
      setHargaBeras,
      result: fitrahResult,
    },
    // Maal
    maal: {
      tabungan,
      setTabungan,
      investasi,
      setInvestasi,
      piutang,
      setPiutang,
      hargaEmasMaal,
      setHargaEmasMaal,
      result: maalResult,
    },
    // Penghasilan
    penghasilan: {
      gaji,
      setGaji,
      penghasilanLain,
      setPenghasilanLain,
      hargaEmasPenghasilan,
      setHargaEmasPenghasilan,
      result: penghasilanResult,
    },
    // Emas & Perak
    emasPerak: {
      beratEmas,
      setBeratEmas,
      hargaEmasGram,
      setHargaEmasGram,
      beratPerak,
      setBeratPerak,
      hargaPerakGram,
      setHargaPerakGram,
      result: emasPerakResult,
    },
  };
}
