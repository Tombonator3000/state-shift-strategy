import type { HotspotExtraArticle } from '@/systems/paranormalHotspots';

const HOTSPOT_IDLE_MESSAGE = 'Ingen hotspot-signaler registrert. Sensorene holder linjen åpen.';

export const formatHotspotSpawnLog = (article: HotspotExtraArticle): string => {
  const stateLabel = article.stateName ? article.stateName.toUpperCase() : 'UKJENT OMRÅDE';
  return `🛸 HOTSPOT OPPDAGET: ${stateLabel}. ${article.headline} — ${article.blurb}`;
};

export const getHotspotIdleMessage = (): string => HOTSPOT_IDLE_MESSAGE;

export const getHotspotIdleLog = (): string => `🛰️ ${HOTSPOT_IDLE_MESSAGE}`;

export const useGameLog = () => ({
  formatHotspotSpawnLog,
  getHotspotIdleMessage,
  getHotspotIdleLog,
});
