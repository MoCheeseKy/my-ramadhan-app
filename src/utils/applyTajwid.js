import { TAJWID_RULES } from '@/data/quranConstants';

/**
 * applyTajwid — menganalisis teks Arab dan mengembalikan array posisi highlight
 * berdasarkan pola-pola tajwid yang dikenali.
 *
 * Pola yang didukung: mad, ghunnah, qalqalah, ikhfa, iqlab.
 * (Idgham belum disertakan karena memerlukan lookahead kompleks lintas kata)
 *
 * @param {string} arabText - Teks Arab mentah
 * @returns {Array<{ start, end, color, bg, darkBg, key }>}
 */
export const applyTajwid = (arabText) => {
  if (!arabText) return [];

  const rules = [
    { pattern: /([اوي](?=[^\u064B-\u065F]))/g, key: 'mad' },
    { pattern: /(نّ|مّ)/g, key: 'ghunnah' },
    { pattern: /([بجدقط]ْ)/g, key: 'qalqalah' },
    { pattern: /(نْ(?=[تثجدذزسشصضطظفقك]))/g, key: 'ikhfa' },
    { pattern: /(نْ(?=ب))/g, key: 'iqlab' },
  ];

  const highlights = [];
  rules.forEach(({ pattern, key }) => {
    const rule = TAJWID_RULES.find((r) => r.key === key);
    if (!rule) return;
    // Buat regex baru agar lastIndex tidak bocor antar panggilan
    const p = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = p.exec(arabText)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        color: rule.color,
        bg: rule.bg,
        darkBg: rule.darkBg,
        key,
      });
    }
  });

  return highlights;
};
