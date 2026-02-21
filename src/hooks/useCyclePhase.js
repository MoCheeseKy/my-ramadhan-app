import dayjs from 'dayjs';
import { CYCLE_PHASES } from '@/components/HaidTracker/Constants';

/**
 * Menentukan fase siklus menstruasi berdasarkan log terakhir.
 * Mengembalikan null jika belum ada data log.
 *
 * @param {Array} logs - daftar log haid, diurutkan terbaru dulu
 * @param {object|null} activePeriod - periode aktif saat ini
 * @returns {object|null} info fase beserta progress bar (0-100)
 */
export function useCyclePhase(logs, activePeriod) {
  if (logs.length === 0) return null;

  const lastLog = logs[0];
  const isOngoing = activePeriod !== null;
  const start = dayjs(lastLog.start_date);
  const today = dayjs();
  const dayOfCycle = today.diff(start, 'day') + 1;

  let phaseKey;
  let progress;

  if (isOngoing || dayOfCycle <= 7) {
    phaseKey = 'MENSTRUATION';
    progress = Math.min((dayOfCycle / 7) * 25, 25);
  } else if (dayOfCycle <= 13) {
    phaseKey = 'FOLLICULAR';
    progress = 25 + ((dayOfCycle - 7) / 6) * 25;
  } else if (dayOfCycle <= 15) {
    phaseKey = 'OVULATION';
    progress = 50 + ((dayOfCycle - 13) / 2) * 25;
  } else if (dayOfCycle <= 28) {
    phaseKey = 'LUTEAL';
    progress = 75 + ((dayOfCycle - 15) / 13) * 25;
  } else {
    phaseKey = 'WAITING';
    progress = 100;
  }

  return { ...CYCLE_PHASES[phaseKey], day: dayOfCycle, progress };
}
