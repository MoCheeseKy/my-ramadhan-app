import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const NISAB_EMAS_GRAM = 85; // gram emas
const NISAB_PERAK_GRAM = 595; // gram perak
const HAUL_MONTHS = 12;
const ZAKAT_RATE = 0.025; // 2.5%
const FITRAH_BERAS_KG = 2.5; // kg per orang

const formatRp = (num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);

// ─── Reusable Components ──────────────────────────────────────────────────────
function SectionCard({
  id,
  activeId,
  onToggle,
  icon,
  title,
  subtitle,
  accentClass,
  bgClass,
  children,
  isDesktop,
}) {
  // Jika desktop, selalu terbuka. Jika mobile, ikut state activeId.
  const isOpen = isDesktop || activeId === id;

  return (
    <motion.div
      layout={!isDesktop} // Hanya layout animation di mobile
      className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-slate-900 overflow-hidden transition-colors duration-300 h-fit`}
    >
      <button
        onClick={() => !isDesktop && onToggle(id)} // Nonaktifkan klik di desktop
        className={`w-full flex items-center gap-4 p-5 text-left ${isDesktop ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <div
          className={`w-11 h-11 rounded-2xl ${bgClass} dark:bg-opacity-20 flex items-center justify-center shrink-0 text-xl`}
        >
          {icon}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='font-bold text-slate-800 dark:text-slate-200 text-sm'>
            {title}
          </p>
          <p className='text-[11px] text-slate-400 dark:text-slate-500 mt-0.5'>
            {subtitle}
          </p>
        </div>

        {/* Sembunyikan Chevron di Desktop karena sudah pasti terbuka */}
        {!isDesktop && (
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
              isOpen
                ? accentClass + ' bg-opacity-10 dark:bg-opacity-20'
                : 'bg-slate-50 dark:bg-slate-800'
            }`}
          >
            {isOpen ? (
              <ChevronUp size={14} className={accentClass} />
            ) : (
              <ChevronDown
                size={14}
                className='text-slate-400 dark:text-slate-500'
              />
            )}
          </div>
        )}
      </button>

      {/* Jika Desktop, tidak perlu AnimatePresence, langsung render */}
      {isDesktop ? (
        <div className='px-5 pb-6 pt-1 border-t border-slate-50 dark:border-slate-800'>
          {children}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className='px-5 pb-6 pt-1 border-t border-slate-50 dark:border-slate-800'>
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

function InputField({
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

function ResultBox({ label, value, isWajib, note }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-5 rounded-2xl p-4 ${
        isWajib
          ? 'bg-[#1e3a8a] dark:bg-blue-800'
          : 'bg-slate-100 dark:bg-slate-800'
      }`}
    >
      <div className='flex items-start justify-between gap-2'>
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
              isWajib
                ? 'text-blue-200 dark:text-blue-300'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {label}
          </p>
          <p
            className={`text-xl font-black tabular-nums ${
              isWajib ? 'text-white' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {value}
          </p>
          {note && (
            <p
              className={`text-[11px] mt-1 ${
                isWajib
                  ? 'text-blue-200 dark:text-blue-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {note}
            </p>
          )}
        </div>
        {isWajib && (
          <CheckCircle2
            size={20}
            className='text-blue-300 dark:text-blue-400 shrink-0 mt-0.5'
          />
        )}
      </div>
    </motion.div>
  );
}

function InfoChip({ text }) {
  return (
    <div className='flex items-start gap-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-2xl p-3 mt-4'>
      <Info
        size={13}
        className='text-amber-500 dark:text-amber-400 shrink-0 mt-0.5'
      />
      <p className='text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed'>
        {text}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ZakatPage() {
  const router = useRouter();

  // ── Viewport Detection ──
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768); // 768px adalah 'md' di Tailwind
    handleResize(); // Cek saat load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeSection, setActiveSection] = useState('fitrah');

  const toggleSection = (id) => {
    if (!isDesktop) setActiveSection((prev) => (prev === id ? null : id));
  };

  // ── Fitrah state ──
  const [jiwaBayar, setJiwaBayar] = useState(1);
  const [hargaBeras, setHargaBeras] = useState(15000);

  // ── Maal state ──
  const [tabungan, setTabungan] = useState('');
  const [investasi, setInvestasi] = useState('');
  const [piutang, setPiutang] = useState('');
  const [hargaEmasMaal, setHargaEmasMaal] = useState(1200000); // per gram

  // ── Penghasilan state ──
  const [gaji, setGaji] = useState('');
  const [penghasilanLain, setPenghasilanLain] = useState('');
  const [hargaEmasPenghasilan, setHargaEmasPenghasilan] = useState(1200000);

  // ── Emas & Perak state ──
  const [beratEmas, setBeratEmas] = useState('');
  const [hargaEmasGram, setHargaEmasGram] = useState(1200000);
  const [beratPerak, setBeratPerak] = useState('');
  const [hargaPerakGram, setHargaPerakGram] = useState(12000);

  // ── Calculations ──
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
    const zakat = wajib ? totalHarta * ZAKAT_RATE : 0;
    return { totalHarta, nisab, wajib, zakat };
  }, [tabungan, investasi, piutang, hargaEmasMaal]);

  const penghasilanResult = useMemo(() => {
    const totalBulan = (Number(gaji) || 0) + (Number(penghasilanLain) || 0);
    const totalTahun = totalBulan * 12;
    const nisab = NISAB_EMAS_GRAM * Number(hargaEmasPenghasilan);
    const wajib = totalTahun >= nisab;
    const zakatBulan = wajib ? totalBulan * ZAKAT_RATE : 0;
    return { totalBulan, totalTahun, nisab, wajib, zakatBulan };
  }, [gaji, penghasilanLain, hargaEmasPenghasilan]);

  const emasPerakResult = useMemo(() => {
    const nilaiEmas = (Number(beratEmas) || 0) * Number(hargaEmasGram);
    const nilaiPerak = (Number(beratPerak) || 0) * Number(hargaPerakGram);
    const nisabEmas = NISAB_EMAS_GRAM * Number(hargaEmasGram);
    const nisabPerak = NISAB_PERAK_GRAM * Number(hargaPerakGram);
    const wajibEmas = (Number(beratEmas) || 0) >= NISAB_EMAS_GRAM;
    const wajibPerak = (Number(beratPerak) || 0) >= NISAB_PERAK_GRAM;
    const zakatEmas = wajibEmas ? nilaiEmas * ZAKAT_RATE : 0;
    const zakatPerak = wajibPerak ? nilaiPerak * ZAKAT_RATE : 0;
    return {
      nilaiEmas,
      nilaiPerak,
      nisabEmas,
      nisabPerak,
      wajibEmas,
      wajibPerak,
      zakatEmas,
      zakatPerak,
    };
  }, [beratEmas, hargaEmasGram, beratPerak, hargaPerakGram]);

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-200 pb-24 transition-colors duration-300'>
      <Head>
        <title>Kalkulator Zakat — MyRamadhan</title>
      </Head>

      {/* Ambient */}
      <div className='fixed inset-0 pointer-events-none -z-10 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-blue-100/40 dark:bg-blue-900/20 rounded-full blur-3xl' />
        <div className='absolute bottom-0 -left-20 w-80 h-80 bg-indigo-100/30 dark:bg-indigo-900/20 rounded-full blur-3xl' />
      </div>

      {/* ── Header Adaptif ── */}
      <header className='sticky top-0 z-40 bg-[#F6F9FC]/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-5 py-4'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center gap-3'>
          <button
            onClick={() => router.push('/')}
            className='w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm dark:shadow-slate-900 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
          >
            <ArrowLeft
              size={17}
              className='text-slate-600 dark:text-slate-400'
            />
          </button>
          <div className='flex-1'>
            <h1 className='font-bold text-base md:text-lg text-slate-800 dark:text-slate-200 leading-tight'>
              Kalkulator Zakat
            </h1>
            <p className='text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium'>
              Hitung zakat dengan mudah & akurat
            </p>
          </div>
        </div>
      </header>

      {/* ── Konten Utama Adaptif (Grid 2 Kolom) ── */}
      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-5 pt-5 space-y-4'>
        {/* ── Hero banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8a] to-indigo-700 dark:from-blue-800 dark:via-blue-800 dark:to-indigo-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden mb-6'
        >
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_60%)]' />
          <div className='absolute -bottom-8 -right-8 w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-full' />
          <div className='relative z-10 md:max-w-xl'>
            <p className='text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-blue-200 dark:text-blue-300 mb-2'>
              Panduan Zakat
            </p>
            <h2 className='text-xl md:text-3xl font-bold leading-snug mb-3'>
              Tunaikan zakat,
              <br />
              bersihkan harta 🤍
            </h2>
            <p className='text-xs md:text-sm text-blue-200 dark:text-blue-300 leading-relaxed md:w-3/4'>
              Zakat dihitung berdasarkan nisab (batas minimum) dan haul (1 tahun
              kepemilikan). Pilih jenis zakat di bawah.
            </p>
          </div>
        </motion.div>

        {/* ── Container Grid untuk Kartu Kalkulator ── */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-start'>
          {/* 1. ZAKAT FITRAH */}
          <SectionCard
            id='fitrah'
            activeId={activeSection}
            onToggle={toggleSection}
            icon='🍚'
            title='Zakat Fitrah'
            subtitle='Wajib setiap jiwa, dibayar sebelum Idul Fitri'
            accentClass='text-emerald-600 dark:text-emerald-400'
            bgClass='bg-emerald-50 dark:bg-emerald-900'
            isDesktop={isDesktop}
          >
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
              value={formatRp(fitrahResult.total)}
              isWajib
              note={`≈ ${fitrahResult.beras} kg beras atau setara uangnya`}
            />
            <InfoChip text="Zakat fitrah = 1 sha' (±2,5 kg beras) per jiwa. Dibayar sebelum sholat Idul Fitri." />
          </SectionCard>

          {/* 2. ZAKAT MAAL */}
          <SectionCard
            id='maal'
            activeId={activeSection}
            onToggle={toggleSection}
            icon='💰'
            title='Zakat Maal (Harta)'
            subtitle='Tabungan, investasi & piutang selama 1 tahun'
            accentClass='text-[#1e3a8a] dark:text-blue-400'
            bgClass='bg-blue-50 dark:bg-blue-900'
            isDesktop={isDesktop}
          >
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

            {(Number(tabungan) || Number(investasi) || Number(piutang)) > 0 && (
              <>
                <div className='mt-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2'>
                  <div className='flex justify-between text-xs md:text-sm'>
                    <span className='text-slate-400 dark:text-slate-500'>
                      Total Harta
                    </span>
                    <span className='font-bold text-slate-700 dark:text-slate-300'>
                      {formatRp(maalResult.totalHarta)}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs md:text-sm'>
                    <span className='text-slate-400 dark:text-slate-500'>
                      Nisab (85g emas)
                    </span>
                    <span className='font-bold text-slate-700 dark:text-slate-300'>
                      {formatRp(maalResult.nisab)}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs md:text-sm'>
                    <span className='text-slate-400 dark:text-slate-500'>
                      Status
                    </span>
                    <span
                      className={`font-bold ${
                        maalResult.wajib
                          ? 'text-[#1e3a8a] dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {maalResult.wajib ? '✓ Wajib Zakat' : '✗ Belum Nisab'}
                    </span>
                  </div>
                </div>
                <ResultBox
                  label='Zakat Maal yang Harus Dibayar'
                  value={
                    maalResult.wajib
                      ? formatRp(maalResult.zakat)
                      : 'Belum Wajib'
                  }
                  isWajib={maalResult.wajib}
                  note={
                    maalResult.wajib
                      ? `2,5% × ${formatRp(maalResult.totalHarta)}`
                      : `Harta belum mencapai nisab ${formatRp(maalResult.nisab)}`
                  }
                />
              </>
            )}
            <InfoChip text='Zakat maal = 2,5% dari total harta yang sudah dimiliki 1 tahun (haul) dan melebihi nisab (85 gram emas).' />
          </SectionCard>

          {/* 3. ZAKAT PENGHASILAN */}
          <SectionCard
            id='penghasilan'
            activeId={activeSection}
            onToggle={toggleSection}
            icon='💼'
            title='Zakat Penghasilan'
            subtitle='Gaji & pendapatan bulanan'
            accentClass='text-violet-600 dark:text-violet-400'
            bgClass='bg-violet-50 dark:bg-violet-900'
            isDesktop={isDesktop}
          >
            <p className='text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed'>
              Dibayar bulanan jika penghasilan setahun ≥ nisab. Atau bisa
              dikumpulkan dan dibayar setahun sekali.
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

            {(Number(gaji) || Number(penghasilanLain)) > 0 && (
              <>
                <div className='mt-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2'>
                  <div className='flex justify-between text-xs md:text-sm'>
                    <span className='text-slate-400 dark:text-slate-500'>
                      Penghasilan / bulan
                    </span>
                    <span className='font-bold text-slate-700 dark:text-slate-300'>
                      {formatRp(penghasilanResult.totalBulan)}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs md:text-sm'>
                    <span className='text-slate-400 dark:text-slate-500'>
                      Penghasilan / tahun
                    </span>
                    <span className='font-bold text-slate-700 dark:text-slate-300'>
                      {formatRp(penghasilanResult.totalTahun)}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs md:text-sm'>
                    <span className='text-slate-400 dark:text-slate-500'>
                      Nisab tahunan
                    </span>
                    <span className='font-bold text-slate-700 dark:text-slate-300'>
                      {formatRp(penghasilanResult.nisab)}
                    </span>
                  </div>
                  <div className='flex justify-between text-xs md:text-sm'>
                    <span className='text-slate-400 dark:text-slate-500'>
                      Status
                    </span>
                    <span
                      className={`font-bold ${
                        penghasilanResult.wajib
                          ? 'text-violet-600 dark:text-violet-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {penghasilanResult.wajib
                        ? '✓ Wajib Zakat'
                        : '✗ Belum Nisab'}
                    </span>
                  </div>
                </div>
                <ResultBox
                  label='Zakat Penghasilan per Bulan'
                  value={
                    penghasilanResult.wajib
                      ? formatRp(penghasilanResult.zakatBulan)
                      : 'Belum Wajib'
                  }
                  isWajib={penghasilanResult.wajib}
                  note={
                    penghasilanResult.wajib
                      ? `2,5% × ${formatRp(penghasilanResult.totalBulan)} / bulan`
                      : `Penghasilan tahunan belum mencapai nisab`
                  }
                />
              </>
            )}
            <InfoChip text='Zakat penghasilan = 2,5% dari gaji/bulan jika penghasilan setahun ≥ nisab emas (85g). Dasar: fatwa MUI No. 3/2003.' />
          </SectionCard>

          {/* 4. ZAKAT EMAS & PERAK */}
          <SectionCard
            id='emas'
            activeId={activeSection}
            onToggle={toggleSection}
            icon='✨'
            title='Zakat Emas & Perak'
            subtitle='Perhiasan & logam mulia yang tersimpan'
            accentClass='text-amber-600 dark:text-amber-400'
            bgClass='bg-amber-50 dark:bg-amber-900'
            isDesktop={isDesktop}
          >
            <p className='text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed'>
              Emas/perak yang disimpan (bukan dipakai sehari-hari) dan sudah
              dimiliki ≥ 1 tahun.
            </p>

            {/* Emas */}
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
                    emasPerakResult.wajibEmas
                      ? formatRp(emasPerakResult.zakatEmas)
                      : 'Belum Wajib'
                  }
                  isWajib={emasPerakResult.wajibEmas}
                  note={
                    emasPerakResult.wajibEmas
                      ? `2,5% × ${formatRp(emasPerakResult.nilaiEmas)}`
                      : `Berat emas belum mencapai nisab ${NISAB_EMAS_GRAM}g`
                  }
                />
              )}
            </div>

            {/* Perak */}
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
                    emasPerakResult.wajibPerak
                      ? formatRp(emasPerakResult.zakatPerak)
                      : 'Belum Wajib'
                  }
                  isWajib={emasPerakResult.wajibPerak}
                  note={
                    emasPerakResult.wajibPerak
                      ? `2,5% × ${formatRp(emasPerakResult.nilaiPerak)}`
                      : `Berat perak belum mencapai nisab ${NISAB_PERAK_GRAM}g`
                  }
                />
              )}
            </div>
            <InfoChip text='Emas yang dipakai sehari-hari (perhiasan wajar) tidak wajib zakat menurut mayoritas ulama. Yang dihitung adalah emas simpanan/investasi.' />
          </SectionCard>
        </div>

        {/* ── Footer note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='text-center pt-6 pb-4'
        >
          <p className='text-[10px] md:text-xs text-slate-300 dark:text-slate-600 leading-relaxed'>
            Kalkulator ini sebagai panduan. Untuk keputusan zakat yang lebih
            tepat,
            <br />
            konsultasikan dengan ustadz atau lembaga zakat terpercaya.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
