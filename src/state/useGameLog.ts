import type { HotspotExtraArticle } from '@/systems/paranormalHotspots';
import {
  CRYPTID_IDLE_REPORTS,
  DEFAULT_CRYPTID_IDLE_REPORT,
  type CryptidIdleReport,
} from '@/data/cryptidIdleReports';

const FALLBACK_IDLE_MESSAGE = 'Paranormal sweep continuing. Sensors report a quiet board.';

const computeSeededIndex = (seed: string, length: number): number => {
  if (!length) {
    return 0;
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index);
    hash |= 0;
  }

  const normalized = Math.abs(hash);
  return normalized % length;
};

const resolveIdleReport = (): CryptidIdleReport => {
  const pool = Array.isArray(CRYPTID_IDLE_REPORTS) ? CRYPTID_IDLE_REPORTS : [];
  if (!pool.length) {
    return DEFAULT_CRYPTID_IDLE_REPORT;
  }

  const todaySeed = new Date().toISOString().slice(0, 10);
  const reportIndex = computeSeededIndex(todaySeed, pool.length);
  return pool[reportIndex] ?? DEFAULT_CRYPTID_IDLE_REPORT;
};

export const formatHotspotSpawnLog = (article: HotspotExtraArticle): string => {
  const stateLabel = article.stateName ? article.stateName.toUpperCase() : 'UNKNOWN SECTOR';
  return `🛸 HOTSPOT DETECTED: ${stateLabel}. ${article.headline} — ${article.blurb}`;
};

export const getHotspotIdleMessage = (): string => {
  try {
    const report = resolveIdleReport();
    const stateLabel = report.state.toUpperCase();
    return `Paranormal sweep anchored on ${stateLabel}. ${report.cryptid} desk update: ${report.summary}`;
  } catch (error) {
    return FALLBACK_IDLE_MESSAGE;
  }
};

export const getHotspotIdleLog = (): string => `🛰️ ${getHotspotIdleMessage()}`;

export const useGameLog = () => ({
  formatHotspotSpawnLog,
  getHotspotIdleMessage,
  getHotspotIdleLog,
});
