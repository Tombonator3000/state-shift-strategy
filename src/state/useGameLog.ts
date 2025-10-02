import type { HotspotExtraArticle } from '@/systems/paranormalHotspots';

const HOTSPOT_IDLE_MESSAGE = 'Paranormal sweep continuing. Sensors report a quiet board.';

export const formatHotspotSpawnLog = (article: HotspotExtraArticle): string => {
  const stateLabel = article.stateName ? article.stateName.toUpperCase() : 'UNKNOWN SECTOR';
  return `🛸 HOTSPOT DETECTED: ${stateLabel}. ${article.headline} — ${article.blurb}`;
};

export const getHotspotIdleMessage = (): string => HOTSPOT_IDLE_MESSAGE;

export const getHotspotIdleLog = (): string => `🛰️ ${HOTSPOT_IDLE_MESSAGE}`;

export const useGameLog = () => ({
  formatHotspotSpawnLog,
  getHotspotIdleMessage,
  getHotspotIdleLog,
});
