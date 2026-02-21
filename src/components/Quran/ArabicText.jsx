'use client';

import { ARAB_SIZES } from '@/data/quranConstants';
import { applyTajwid } from '@/utils/applyTajwid';

const ArabicText = ({
  text,
  arabSize = 'md',
  tajwid = false,
  isDark = false,
}) => {
  if (!text) return null; // Fail-safe: jika text kosong, jangan render

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

  // Fail-safe handling balikan dari fungsi applyTajwid
  let highlights = [];
  try {
    const tajwidResult = applyTajwid(text);
    highlights = Array.isArray(tajwidResult)
      ? tajwidResult
      : tajwidResult?.highlights || [];
  } catch (e) {
    console.error('Tajwid parsing error:', e);
  }

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
            backgroundColor: isDark ? darkBg || bg : bg,
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
