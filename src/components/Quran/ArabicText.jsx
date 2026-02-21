'use client';

import { ARAB_SIZES } from '@/data/quranConstants';
import { applyTajwid } from '@/utils/applyTajwid';

/**
 * ArabicText — menampilkan teks Arab dengan ukuran yang bisa dikonfigurasi.
 * Jika tajwid aktif, tiap segmen yang dikenali akan diwarnai sesuai aturan.
 *
 * @prop {string}  text       - Teks Arab
 * @prop {string}  arabSize   - Key ukuran: 'sm' | 'md' | 'lg' | 'xl'
 * @prop {boolean} tajwid     - Aktifkan highlight tajwid
 * @prop {boolean} isDark     - Gunakan warna darkBg untuk dark mode
 */
const ArabicText = ({
  text,
  arabSize = 'md',
  tajwid = false,
  isDark = false,
}) => {
  const sizeConfig =
    ARAB_SIZES.find((s) => s.key === arabSize) || ARAB_SIZES[1];
  const fontClass =
    'font-amiri text-slate-800 dark:text-slate-100 text-right leading-[2.4] md:leading-[2.6]';

  if (!tajwid) {
    return (
      <p className={fontClass} dir='rtl' style={{ fontSize: sizeConfig.size }}>
        {text}
      </p>
    );
  }

  const highlights = applyTajwid(text);
  if (!highlights.length) {
    return (
      <p className={fontClass} dir='rtl' style={{ fontSize: sizeConfig.size }}>
        {text}
      </p>
    );
  }

  // Bangun segmen teks yang tercampur biasa dan highlight
  const parts = [];
  let last = 0;
  [...highlights]
    .sort((a, b) => a.start - b.start)
    .forEach(({ start, end, color, bg, darkBg }, i) => {
      if (start > last) {
        parts.push(<span key={`t${i}`}>{text.slice(last, start)}</span>);
      }
      parts.push(
        <span
          key={`h${i}`}
          style={{
            color,
            backgroundColor: isDark ? darkBg : bg,
            borderRadius: '3px',
            padding: '0 2px',
          }}
        >
          {text.slice(start, end)}
        </span>,
      );
      last = end;
    });

  if (last < text.length) {
    parts.push(<span key='tail'>{text.slice(last)}</span>);
  }

  return (
    <p className={fontClass} dir='rtl' style={{ fontSize: sizeConfig.size }}>
      {parts}
    </p>
  );
};

export default ArabicText;
