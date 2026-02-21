/**
 * Format angka ke format mata uang Rupiah.
 * @param {number} num
 * @returns {string} - contoh: "Rp 1.200.000"
 */
export const formatRp = (num) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
