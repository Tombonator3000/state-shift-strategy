import { useEffect, useMemo, useState } from 'react';
import BaseCard from '@/components/game/cards/BaseCard';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import type { GameCard } from '@/rules/mvp';
import { FRONT_PAGE_SLOT_META } from '@/game/frontPage';
import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import { EvidenceTrackMeter } from './EvidenceTrackMeter';
import { PublicFrenzyMeter } from './PublicFrenzyMeter';
import { TickerTape } from './TickerTape';
import { StuntBadge } from './StuntBadge';
import type { EvidenceTrackState, PublicFrenzyState } from '@/hooks/gameStateTypes';
import { useAudioContext } from '@/contexts/AudioContext';

interface FrontPageLayoutProps {
  cards: CardPlayRecord[];
  onInspectCard?: (card: GameCard) => void;
  faction: 'truth' | 'government';
  evidence: EvidenceTrackState;
  publicFrenzy: PublicFrenzyState;
  truth: number;
}

const resolveHotspot = (stateId?: string | null): string | null => {
  if (!stateId) return null;
  const byId = getStateById(stateId);
  if (byId && 'hotspot' in byId && typeof (byId as any).hotspot === 'string') {
    return (byId as any).hotspot;
  }
  const byAbbr = getStateByAbbreviation(stateId.toUpperCase());
  if (byAbbr && 'hotspot' in byAbbr && typeof (byAbbr as any).hotspot === 'string') {
    return (byAbbr as any).hotspot;
  }
  return null;
};

const extractPressure = (record: CardPlayRecord): number | null => {
  if (record.card.type !== 'ZONE') {
    return null;
  }
  const effects = record.card.effects as { pressureDelta?: number } | undefined;
  return typeof effects?.pressureDelta === 'number' ? effects.pressureDelta : null;
};

const CardTile = ({
  record,
  highlight,
  onInspect,
}: {
  record: CardPlayRecord;
  highlight: boolean;
  onInspect?: (card: GameCard) => void;
}) => {
  const factionLabel = record.faction === 'truth' ? 'Truth' : 'Government';
  const truthDelta = record.truthDelta;
  const ipDelta = record.player === 'human' ? record.ipDelta : record.aiIpDelta;
  return (
    <button
      type="button"
      onClick={() => onInspect?.(record.card)}
      className={`group relative w-full text-left transition-transform duration-200 ${
        highlight ? 'scale-[1.03]' : 'hover:scale-[1.02]'
      }`}
    >
      <div
        className={`rounded-lg border-2 border-black bg-white p-2 shadow-[4px_4px_0_#000] ${
          highlight ? 'ring-2 ring-yellow-400' : ''
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-mono uppercase text-black/70">
          <span>{factionLabel}</span>
          <span>{record.card.type}</span>
        </div>
        <div className="mt-2">
          <BaseCard card={record.card} size="boardMini" polaroidHover={false} />
        </div>
        <div className="mt-2 text-[11px] font-mono uppercase text-black/70">
          {truthDelta !== 0 && <div>Truth {truthDelta > 0 ? '+' : ''}{truthDelta}%</div>}
          {ipDelta !== 0 && <div>IP {ipDelta > 0 ? '+' : ''}{ipDelta}</div>}
        </div>
      </div>
    </button>
  );
};

export const FrontPageLayout = ({
  cards,
  onInspectCard,
  faction,
  evidence,
  publicFrenzy,
  truth,
}: FrontPageLayoutProps) => {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const audio = useAudioContext();

  useEffect(() => {
    let timeout: number | null = null;
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ cardId?: string }>;
      if (!custom.detail?.cardId) {
        return;
      }
      setHighlightedId(custom.detail.cardId);
      audio?.playSFX?.('typewriter');
      if (timeout) {
        window.clearTimeout(timeout);
      }
      timeout = window.setTimeout(() => setHighlightedId(null), 1600);
    };

    window.addEventListener('frontPageSlotReveal', handler as EventListener);
    return () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
      window.removeEventListener('frontPageSlotReveal', handler as EventListener);
    };
  }, [audio]);

  const grouped = useMemo(() => {
    return cards.reduce<Record<'top-banner' | 'main-photo' | 'sidebar', CardPlayRecord[]>>(
      (acc, record) => {
        acc[record.frontPageSlot].push(record);
        return acc;
      },
      { 'top-banner': [], 'main-photo': [], sidebar: [] },
    );
  }, [cards]);

  const tickerMessages = useMemo(() => {
    return cards
      .slice(-5)
      .reverse()
      .map(record => `${record.faction === 'truth' ? 'Truth' : 'Gov'} ${record.card.type} — ${record.card.name}`);
  }, [cards]);

  const mainFeature = grouped['main-photo'][0];
  const secondaryFeature = grouped['main-photo'].slice(1);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <EvidenceTrackMeter truth={truth} evidence={evidence} faction={faction} />
          <div className="rounded-2xl border-4 border-black bg-[#fdf7e3] p-4 shadow-[6px_6px_0_#000]">
            <header className="mb-3 border-b-2 border-dashed border-black/40 pb-2">
              <div className="text-lg font-black uppercase tracking-[0.4em]">{FRONT_PAGE_SLOT_META['top-banner'].label}</div>
              <div className="text-[11px] font-mono uppercase text-black/60">{FRONT_PAGE_SLOT_META['top-banner'].caption}</div>
            </header>
            <div className="grid gap-3 md:grid-cols-2">
              {grouped['top-banner'].map(record => (
                <CardTile
                  key={`${record.card.id}-${record.turn}`}
                  record={record}
                  highlight={highlightedId === record.card.id}
                  onInspect={onInspectCard}
                />
              ))}
              {grouped['top-banner'].length === 0 && (
                <div className="col-span-full rounded border border-dashed border-black/20 bg-white/70 p-4 text-center text-[11px] font-mono uppercase text-black/50">
                  Awaiting fresh leaks for the banner.
                </div>
              )}
            </div>
          </div>
          <div className="rounded-2xl border-4 border-black bg-white p-4 shadow-[6px_6px_0_#000]">
            <header className="mb-3 border-b-2 border-dashed border-black/40 pb-2">
              <div className="text-lg font-black uppercase tracking-[0.4em]">{FRONT_PAGE_SLOT_META['main-photo'].label}</div>
              <div className="text-[11px] font-mono uppercase text-black/60">{FRONT_PAGE_SLOT_META['main-photo'].caption}</div>
            </header>
            {mainFeature ? (
              <div>
                <CardTile
                  record={mainFeature}
                  highlight={highlightedId === mainFeature.card.id}
                  onInspect={onInspectCard}
                />
                <StuntBadge
                  hotspot={resolveHotspot(mainFeature.targetState)}
                  pressure={extractPressure(mainFeature)}
                />
              </div>
            ) : (
              <div className="rounded border border-dashed border-black/20 bg-white/70 p-6 text-center text-[11px] font-mono uppercase text-black/50">
                No stunts captured on camera this round.
              </div>
            )}
            {secondaryFeature.length > 0 && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {secondaryFeature.map(record => (
                  <CardTile
                    key={`${record.card.id}-${record.turn}`}
                    record={record}
                    highlight={highlightedId === record.card.id}
                    onInspect={onInspectCard}
                  />
                ))}
              </div>
            )}
          </div>
          <TickerTape messages={tickerMessages} />
        </div>
        <aside className="space-y-3">
          <PublicFrenzyMeter frenzy={publicFrenzy} />
          <div className="rounded-2xl border-4 border-black bg-[#f4f9ff] p-4 shadow-[6px_6px_0_#000]">
            <header className="mb-3 border-b-2 border-dashed border-black/30 pb-2">
              <div className="text-lg font-black uppercase tracking-[0.4em]">{FRONT_PAGE_SLOT_META.sidebar.label}</div>
              <div className="text-[11px] font-mono uppercase text-black/60">{FRONT_PAGE_SLOT_META.sidebar.caption}</div>
            </header>
            <div className="space-y-3">
              {grouped.sidebar.map(record => (
                <CardTile
                  key={`${record.card.id}-${record.turn}`}
                  record={record}
                  highlight={highlightedId === record.card.id}
                  onInspect={onInspectCard}
                />
              ))}
              {grouped.sidebar.length === 0 && (
                <div className="rounded border border-dashed border-black/20 bg-white/70 p-4 text-center text-[11px] font-mono uppercase text-black/50">
                  Sidebar memos pending clearance.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FrontPageLayout;
