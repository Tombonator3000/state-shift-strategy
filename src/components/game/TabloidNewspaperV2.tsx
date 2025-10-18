import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Card as UICard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CardImage from '@/components/game/CardImage';
import { ExtraStamp } from '@/components/newspaper/ExtraStamp';
import TurnEdition from '@/components/newspaper/TurnEdition';
import { loadNewspaperData, pick, shuffle, type NewspaperData } from '@/lib/newspaperData';
import type { TabloidNewspaperProps } from './TabloidNewspaperLegacy';
import type { HotspotExtraArticle } from '@/systems/paranormalHotspots';
import type { PlayedCardMeta } from '@/engine/news/mainStory';
import { formatComboReward, getLastComboSummary } from '@/game/comboEngine';
import { buildRoundContext, formatTruthDelta } from './tabloidRoundUtils';
import { composeHeroFallback } from './heroFallback';
import { useAudioContext } from '@/contexts/AudioContext';
import type { ParanormalSighting } from '@/types/paranormal';
import type { AgendaMoment } from '@/hooks/usePressArchive';
import { EVENT_DATABASE } from '@/data/eventDatabase';
import type { ArcProgressSummary } from '@/types/campaign';
import { cn } from '@/lib/utils';
import {
  NEWSPAPER_BADGE_CLASS,
  NEWSPAPER_BODY_CLASS,
  NEWSPAPER_CARD_CLASS,
  NEWSPAPER_HEADER_CLASS,
  NewspaperSection,
} from './newspaperLayout';
import { useTabloidWeather, getFallbackTabloidWeather } from '@/system/weather/useTabloidWeather';
import type { CompositeStory, ExtraExtraCompositeEntry, ExtraExtraFeedEntry } from '@/types/news';

const PRIMARY_MASTHEAD = 'PARANOID TIMES';
const GLITCH_OPTIONS = ['PAGE NOT FOUND', '░░░ERROR░░░', '▓▓▓SIGNAL LOST▓▓▓', '404 TRUTH NOT FOUND'];
const FALLBACK_DATA: NewspaperData = {
  mastheads: ['THE PARANOID TIMES'],
  ads: ['All advertising temporarily redacted.'],
  subheads: { generic: ['Officials refuse to comment.'] },
  bylines: ['By: Anonymous Insider'],
  sources: ['Source: Redacted Dossier'],
  conspiracyCorner: ['Rumors withheld pending clearance.'],
  weather: ['Today: Classified Cloud Cover'],
  attackVerbs: ['EXPOSED'],
  mediaVerbs: ['GOES VIRAL'],
  zoneVerbs: ['SURGE'],
  stamps: { breaking: ['BREAKING'], classified: ['CLASSIFIED'] },
};

const SIGHTING_LABELS: Record<ParanormalSighting['category'], string> = {
  synergy: 'Synergy Spike',
  'truth-meltdown': 'Broadcast Hijack',
  cryptid: 'Cryptid Alert',
  hotspot: 'Hotspot Alert'
};

const SIGHTING_ICONS: Record<ParanormalSighting['category'], string> = {
  synergy: '🛰️',
  'truth-meltdown': '📡',
  cryptid: '🦶',
  hotspot: '👻'
};

const SIGHTING_BADGE_VARIANTS: Record<ParanormalSighting['category'], string> = {
  synergy: 'border-indigo-500 text-indigo-500',
  'truth-meltdown': 'border-rose-500 text-rose-500',
  cryptid: 'border-emerald-500 text-emerald-500',
  hotspot: 'border-purple-500 text-purple-500'
};

const isCompositeStory = (entry: unknown): entry is CompositeStory => {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const candidate = entry as CompositeStory & {
    tone?: unknown;
    headline?: unknown;
    subhead?: unknown;
    body?: unknown;
    tags?: unknown;
    sources?: unknown;
  };

  if (candidate.tone !== 'truth' && candidate.tone !== 'government') {
    return false;
  }

  if (typeof candidate.headline !== 'string' || typeof candidate.subhead !== 'string') {
    return false;
  }

  if (!Array.isArray(candidate.body) || !Array.isArray(candidate.tags) || !Array.isArray(candidate.sources)) {
    return false;
  }

  return true;
};

const isCompositeFeedEntry = (entry: unknown): entry is ExtraExtraCompositeEntry => {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const candidate = entry as { kind?: unknown; data?: unknown };
  if (candidate.kind !== 'composite') {
    return false;
  }

  return isCompositeStory(candidate.data);
};

const extractCompositeStory = (entry: unknown): CompositeStory | null => {
  if (isCompositeStory(entry)) {
    return entry;
  }

  if (isCompositeFeedEntry(entry)) {
    return entry.data;
  }

  return null;
};

const sanitizeMastheadPool = (pool?: string[]): string[] => {
  if (!pool?.length) {
    return [];
  }

  const seen = new Set<string>();
  const sanitized: string[] = [];

  pool.forEach(name => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const upper = trimmed.toUpperCase();
    if (upper === PRIMARY_MASTHEAD) {
      return;
    }
    if (seen.has(upper)) {
      return;
    }
    seen.add(upper);
    sanitized.push(upper);
  });

  return sanitized;
};

const formatSightingTime = (timestamp: number) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  } catch {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
};

const computeEventTruthDelta = (events: TabloidNewspaperProps['events']): number => {
  return events.reduce((sum, event) => {
    const delta = (event.effects?.truth ?? 0) + (event.effects?.truthChange ?? 0);
    return sum + delta;
  }, 0);
};

const formatChance = (chance?: number | null): string | null => {
  if (typeof chance !== 'number' || !Number.isFinite(chance) || chance <= 0) {
    return null;
  }

  const percent = chance * 100;
  let precision = 2;

  if (percent >= 10) {
    precision = 0;
  } else if (percent >= 1) {
    precision = 1;
  } else if (percent >= 0.1) {
    precision = 2;
  } else {
    precision = 3;
  }

  const formatted = percent.toFixed(precision)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');

  return `${formatted}%`;
};

const formatEventEffects = (
  effects?: TabloidNewspaperProps['events'][number]['effects'],
): string | null => {
  if (!effects) {
    return null;
  }

  const parts: string[] = [];
  const formatDelta = (value: number | undefined, label: string) => {
    if (value === undefined || value === 0) {
      return;
    }
    const sign = value > 0 ? '+' : '−';
    parts.push(`${sign}${Math.abs(value)} ${label}`);
  };

  formatDelta(effects.truth, 'Truth');
  formatDelta(effects.ip, 'IP');

  if (effects.cardDraw !== undefined && effects.cardDraw !== 0) {
    const sign = effects.cardDraw > 0 ? '+' : '−';
    const value = Math.abs(effects.cardDraw);
    const cardLabel = value === 1 ? 'Card' : 'Cards';
    parts.push(`${sign}${value} ${cardLabel}`);
  }

  formatDelta(effects.truthChange, 'Truth');
  formatDelta(effects.ipChange, 'IP');
  formatDelta(effects.defenseChange, 'Defense');

  if (effects.stateEffects) {
    formatDelta(effects.stateEffects.pressure, 'State Pressure');
    formatDelta(effects.stateEffects.defense, 'State Defense');
  }

  if (effects.skipTurn) {
    parts.push('Skip Turn');
  }

  if (effects.doubleIncome) {
    parts.push('Double Income');
  }

  return parts.length > 0 ? parts.join(', ') : null;
};

const createEventStory = (
  event: TabloidNewspaperProps['events'][number],
): {
  id: string;
  headline: string;
  subhead: string;
  summary: string;
  typeLabel: string;
  triggerChance: number | null;
  conditionalChance: number | null;
} => {
  const baseHeadline = (event.headline ?? event.title).toUpperCase();
  const effectsLabel = formatEventEffects(event.effects);
  const headline = effectsLabel ? `${baseHeadline} (${effectsLabel})` : baseHeadline;
  const summary = event.content;
  const subhead = event.flavorText ?? event.flavorTruth ?? event.flavorGov ?? 'Officials decline additional comment.';
  const triggerChance = typeof event.triggerChance === 'number' ? event.triggerChance : null;
  const conditionalChance = typeof event.conditionalChance === 'number' ? event.conditionalChance : null;
  return {
    id: event.id,
    headline,
    subhead,
    summary,
    typeLabel: `[${event.type.toUpperCase()}]`,
    triggerChance,
    conditionalChance,
  };
};

type CampaignEvent = TabloidNewspaperProps['events'][number];
type CampaignResolution = NonNullable<CampaignEvent['campaign']>['resolution'];

interface ArcChapterEventEntry {
  event: CampaignEvent;
  story: ReturnType<typeof createEventStory>;
}

interface ArcChapterGroup {
  chapter: number;
  resolution?: CampaignResolution;
  events: ArcChapterEventEntry[];
}

interface CampaignArcGroup {
  arcId: string;
  arcName: string;
  totalChapters: number;
  latestChapter: number;
  progressPercent: number;
  status: 'active' | 'cliffhanger' | 'finale';
  activeTagline: string;
  chapters: ArcChapterGroup[];
}

const formatArcName = (arcId: string): string => {
  return arcId
    .replace(/^campaign_/, '')
    .split('_')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const ARC_DEFINITION_MAP = (() => {
  const map = new Map<string, { totalChapters: number }>();
  for (const event of EVENT_DATABASE) {
    const campaign = event.campaign;
    if (!campaign) {
      continue;
    }
    const existing = map.get(campaign.arcId) ?? { totalChapters: 0 };
    if (campaign.chapter > existing.totalChapters) {
      existing.totalChapters = campaign.chapter;
    }
    map.set(campaign.arcId, existing);
  }
  return map;
})();

const getArcTotalChapters = (arcId: string, fallbackChapter: number): number => {
  const record = ARC_DEFINITION_MAP.get(arcId);
  if (!record) {
    return Math.max(1, fallbackChapter);
  }
  return Math.max(record.totalChapters, fallbackChapter, 1);
};

const buildArcStatusTagline = (
  arcName: string,
  chapter: number,
  resolution: CampaignResolution | undefined,
  event?: CampaignEvent,
): string => {
  const baseTitle = (event?.headline ?? event?.title ?? 'Classified Development').trim();
  if (!chapter) {
    return `${arcName} dossier updated.`;
  }

  if (resolution === 'finale') {
    return `${arcName.toUpperCase()} ARC COMPLETE — ${baseTitle.toUpperCase()}`;
  }

  if (resolution === 'cliffhanger') {
    return `Cliffhanger: ${arcName} Chapter ${chapter} — ${baseTitle}`;
  }

  return `${arcName} advances to chapter ${chapter} — ${baseTitle}`;
};

const TabloidNewspaperV2 = ({
  events,
  playedCards,
  faction,
  truth,
  turn,
  ip,
  controlledStates,
  totalStates,
  score,
  comboTruthDelta = 0,
  onClose,
  sightings = [],
  agendaIssue,
  agendaMoments = [],
  onArcProgress,
  hotspotDirector,
  activeHotspot,
  frontPageTriplet,
  recurringCharacters,
  headlineLog = [],
  extraExtraFeed = [],
}: TabloidNewspaperProps) => {
  const [data, setData] = useState<NewspaperData | null>(null);
  const [masthead, setMasthead] = useState(PRIMARY_MASTHEAD);
  const [glitchText, setGlitchText] = useState<string | null>(null);
  const [isMastheadReady, setIsMastheadReady] = useState(false);

  const dataset = data ?? FALLBACK_DATA;
  const audio = useAudioContext();
  const [highlightedSightingId, setHighlightedSightingId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeSightingIndex, setActiveSightingIndex] = useState(0);
  const highlightTimeoutRef = useRef<number | null>(null);
  const prevSightingsCountRef = useRef(0);
  const lastSightingIdRef = useRef<string | null>(null);
  const glitchCycleTimerRef = useRef<number | null>(null);
  const glitchResetTimerRef = useRef<number | null>(null);
  const altMastheadsRef = useRef<string[]>([]);
  const { weatherLine: tabloidWeatherLine } = useTabloidWeather();

  const compositeStories = useMemo(() => {
    const stories: CompositeStory[] = [];
    const seen = new Set<string>();
    const addStory = (story: CompositeStory | null) => {
      if (!story) {
        return;
      }
      const key = `${story.headline}::${story.subhead}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      stories.push(story);
    };

    if (Array.isArray(headlineLog)) {
      for (const entry of headlineLog as Array<CompositeStory | ExtraExtraFeedEntry>) {
        addStory(extractCompositeStory(entry));
      }
    }

    if (Array.isArray(extraExtraFeed)) {
      for (const entry of extraExtraFeed as ExtraExtraFeedEntry[]) {
        addStory(extractCompositeStory(entry));
      }
    }

    return stories;
  }, [extraExtraFeed, headlineLog]);

  const latestComposite = useMemo(() => {
    if (!compositeStories.length) {
      return null;
    }
    return compositeStories[compositeStories.length - 1] ?? null;
  }, [compositeStories]);

  const runnerDispatches = useMemo(() => {
    if (!latestComposite) {
      return [] as Array<{
        id: string;
        headline: string;
        subhead?: string;
        summary: string;
        tone: CompositeStory['tone'];
      }>;
    }

    const paragraphs = latestComposite.body.length
      ? latestComposite.body
      : [latestComposite.subhead].filter(Boolean);

    return latestComposite.sources.map((source, index) => {
      const summary = paragraphs[index % paragraphs.length] ?? paragraphs[0] ?? 'Composite desk archives the turn.';
      return {
        id: source.id,
        headline: source.headline || `Composite Source ${index + 1}`,
        subhead: source.subhead,
        summary,
        tone: latestComposite.tone,
      };
    });
  }, [latestComposite]);

  const heroSourceHeadlines = latestComposite?.sources ?? [];
  const heroStoryTags = latestComposite?.tags ?? [];

  const agendaPullQuotes = useMemo(() => {
    if (!agendaMoments?.length) {
      return [] as AgendaMoment[];
    }
    const sorted = [...agendaMoments].sort((a, b) => a.recordedAt - b.recordedAt);
    const latestComplete = [...sorted].reverse().find(moment => moment.status === 'complete');
    const latestSetback = [...sorted].reverse().find(moment => moment.status === 'setback');
    return [latestComplete, latestSetback].filter(Boolean) as AgendaMoment[];
  }, [agendaMoments]);

  const formattedAgendaQuotes = useMemo(
    () => agendaPullQuotes.map(moment => {
      const progressLabel = `${moment.progress}/${moment.target}`;
      const title = moment.status === 'complete' ? 'Agenda Final Stage' : 'Agenda Setback';
      const baseText = moment.status === 'complete'
        ? `${moment.stageLabel} unlocked. Objective reaches ${progressLabel}.`
        : `${moment.stageLabel} compromised — momentum drops to ${progressLabel}.`;
      const description = moment.stageDescription ? moment.stageDescription : baseText;
      const factionLabel = moment.faction === 'truth' ? 'Truth Coalition' : 'Government Directorate';
      const actorLabel = moment.actor === 'player' ? 'Operatives' : 'Opposition Network';
      return {
        id: moment.id,
        title,
        headline: moment.agendaTitle,
        description,
        stageLabel: moment.stageLabel,
        status: moment.status,
        progressLabel,
        factionLabel,
        actorLabel,
      };
    }),
    [agendaPullQuotes],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    setPrefersReducedMotion(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const loaded = await loadNewspaperData();
        if (cancelled) return;

        setData(loaded);
        altMastheadsRef.current = sanitizeMastheadPool(loaded.mastheads);
        setMasthead(PRIMARY_MASTHEAD);
        setIsMastheadReady(true);
      } catch (error) {
        console.warn('Newspaper data load failed, using fallback set.', error);
        if (cancelled) return;

        setData(FALLBACK_DATA);
        altMastheadsRef.current = sanitizeMastheadPool(FALLBACK_DATA.mastheads);
        setMasthead(PRIMARY_MASTHEAD);
        setIsMastheadReady(true);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const clearTimers = () => {
      if (glitchCycleTimerRef.current) {
        window.clearTimeout(glitchCycleTimerRef.current);
        glitchCycleTimerRef.current = null;
      }
      if (glitchResetTimerRef.current) {
        window.clearTimeout(glitchResetTimerRef.current);
        glitchResetTimerRef.current = null;
      }
    };

    if (!isMastheadReady) {
      return () => {
        clearTimers();
      };
    }

    if (prefersReducedMotion) {
      clearTimers();
      setGlitchText(null);
      setMasthead(PRIMARY_MASTHEAD);
      return () => {
        clearTimers();
      };
    }

    const scheduleGlitchCycle = () => {
      clearTimers();
      const delay = 5000 + Math.random() * 9000;
      glitchCycleTimerRef.current = window.setTimeout(() => {
        const availableTitles = altMastheadsRef.current.length
          ? altMastheadsRef.current
          : GLITCH_OPTIONS;
        const fallback = availableTitles[0] ?? PRIMARY_MASTHEAD;
        const nextTitle = pick(availableTitles, fallback).toUpperCase();
        setGlitchText(nextTitle);
        glitchResetTimerRef.current = window.setTimeout(() => {
          setGlitchText(null);
          setMasthead(PRIMARY_MASTHEAD);
          scheduleGlitchCycle();
        }, 1200 + Math.random() * 900);
      }, delay);
    };

    scheduleGlitchCycle();

    return () => {
      clearTimers();
    };
  }, [isMastheadReady, prefersReducedMotion]);

  useEffect(() => () => {
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
  }, []);

  const recentSightings = useMemo<ParanormalSighting[]>(() => {
    if (!sightings || sightings.length === 0) {
      return [];
    }
    const ordered = [...sightings].sort((a, b) => a.timestamp - b.timestamp);
    return ordered.slice(-8);
  }, [sightings]);

  useEffect(() => {
    if (!recentSightings.length) {
      setActiveSightingIndex(0);
      setHighlightedSightingId(null);
      lastSightingIdRef.current = null;
      prevSightingsCountRef.current = 0;
      return;
    }

    setActiveSightingIndex(prev => Math.min(prev, recentSightings.length - 1));
  }, [recentSightings.length]);

  useEffect(() => {
    if (!recentSightings.length) {
      return;
    }

    const latest = recentSightings[recentSightings.length - 1];
    const prevCount = prevSightingsCountRef.current;
    const prevLastId = lastSightingIdRef.current;

    const isNewEntry = !prevLastId || latest.id !== prevLastId || recentSightings.length > prevCount;

    prevSightingsCountRef.current = recentSightings.length;
    lastSightingIdRef.current = latest.id;

    if (isNewEntry) {
      setActiveSightingIndex(recentSightings.length - 1);
      setHighlightedSightingId(latest.id);
      audio?.playSFX?.('radio-static');

      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }

      if (!prefersReducedMotion) {
        highlightTimeoutRef.current = window.setTimeout(() => {
          setHighlightedSightingId(null);
          highlightTimeoutRef.current = null;
        }, 2600);
      }
    }
  }, [recentSightings, audio, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || recentSightings.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSightingIndex(prev => {
        if (!recentSightings.length) {
          return 0;
        }
        return (prev + 1) % recentSightings.length;
      });
    }, 7000);

    return () => window.clearInterval(interval);
  }, [recentSightings.length, prefersReducedMotion]);

  const boundedSightingIndex = recentSightings.length
    ? Math.min(activeSightingIndex, recentSightings.length - 1)
    : 0;

  const activeSighting = recentSightings.length
    ? recentSightings[boundedSightingIndex]
    : null;

  const supplementalSightings = useMemo(() => {
    if (!recentSightings.length) {
      return [];
    }
    const reversed = [...recentSightings].reverse();
    if (!activeSighting) {
      return reversed;
    }
    return reversed.filter(entry => entry.id !== activeSighting.id);
  }, [recentSightings, activeSighting]);

  const handleSightingSelect = useCallback((id: string) => {
    const targetIndex = recentSightings.findIndex(entry => entry.id === id);
    if (targetIndex === -1) {
      return;
    }

    setActiveSightingIndex(targetIndex);
    setHighlightedSightingId(id);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }

    if (!prefersReducedMotion) {
      highlightTimeoutRef.current = window.setTimeout(() => {
        setHighlightedSightingId(null);
        highlightTimeoutRef.current = null;
      }, 1800);
    }
  }, [recentSightings, prefersReducedMotion]);

  const playerCards = useMemo(
    () => playedCards.filter(entry => entry.player === 'human'),
    [playedCards],
  );
  const opponentCards = useMemo(
    () => playedCards.filter(entry => entry.player === 'ai'),
    [playedCards],
  );

  const gameStateSnapshot = useMemo(
    () => ({
      statesControlled: controlledStates?.length ?? 0,
      totalStates: totalStates ?? controlledStates?.length ?? 50,
      truth,
      truthPercentage: truth,
      ip: ip ?? 0,
      turn: turn ?? 0,
      playerFaction: faction,
      cardsPlayedCount: playedCards.length,
      currentScore: score ?? truth,
      controlledStates: controlledStates ?? [],
      recurringCharacters: recurringCharacters ?? undefined,
    }),
    [
      controlledStates,
      totalStates,
      truth,
      ip,
      turn,
      faction,
      score,
      playedCards,
      recurringCharacters,
    ],
  );

  const frontPageCards = useMemo<PlayedCardMeta[]>(() => {
    if (Array.isArray(frontPageTriplet) && frontPageTriplet.length === 3) {
      return frontPageTriplet.map(card => ({
        id: card.id,
        name: card.name,
        type: card.type,
        faction: card.faction,
      }));
    }

    return playerCards.slice(0, 3)
      .map(entry => {
        const rawType = String(entry.card.type ?? '').toUpperCase();
        if (rawType !== 'ATTACK' && rawType !== 'MEDIA' && rawType !== 'ZONE') {
          return null;
        }
        const faction = String(entry.card.faction ?? '').toUpperCase().includes('GOV') ? 'GOV' : 'TRUTH';
        return {
          id: entry.card.id,
          name: entry.card.name,
          type: rawType as PlayedCardMeta['type'],
          faction,
        } satisfies PlayedCardMeta;
      })
      .filter((meta): meta is PlayedCardMeta => Boolean(meta));
  }, [frontPageTriplet, playerCards]);

  const hasExtraExtra = useMemo(() => {
    if (!Array.isArray(frontPageTriplet) || frontPageTriplet.length !== 3) {
      return false;
    }

    const [first, ...rest] = frontPageTriplet;
    if (!first?.faction) {
      return false;
    }

    return rest.every(card => card?.faction === first.faction);
  }, [frontPageTriplet]);

  const comboSummary = useMemo(() => getLastComboSummary(), [events, playedCards]);
  const comboReport = useMemo(() => {
    if (!comboSummary || comboSummary.results.length === 0) {
      return null;
    }
    return {
      player: comboSummary.player,
      turn: comboSummary.turn,
      entries: comboSummary.results.map(result => ({
        id: result.definition.id,
        name: result.definition.name,
        description: result.definition.description,
        reward: formatComboReward(result.appliedReward, { faction: comboSummary.playerFaction })
          .replace(/[()]/g, '')
          .trim(),
        matchedPlays: result.details.matchedPlays.map(play => play.cardName).filter(Boolean),
        fxText: result.definition.fxText,
      })),
    };
  }, [comboSummary]);
  const comboOwnerLabel = useMemo(() => {
    if (!comboReport) {
      return null;
    }
    if (comboReport.player === 'P1') {
      return 'Operative Team';
    }
    if (comboReport.player === 'P2') {
      return 'Opposition Network';
    }
    return comboReport.player;
  }, [comboReport]);

  const eventsTruthDelta = useMemo(() => computeEventTruthDelta(events), [events]);

  const narrativeContext = useMemo(
    () => buildRoundContext(playerCards, opponentCards, eventsTruthDelta, comboTruthDelta),
    [playerCards, opponentCards, eventsTruthDelta, comboTruthDelta],
  );

  const heroEvent = latestComposite ? null : (events[0] ?? null);

  const heroFallback = useMemo(() => {
    if (latestComposite || heroEvent) {
      return null;
    }
    return composeHeroFallback({
      faction,
      capturedStates: narrativeContext.capturedStates,
      truthDeltaTotal: narrativeContext.truthDeltaTotal,
      comboReport: comboReport ? { entries: comboReport.entries } : null,
      comboOwnerLabel,
    });
  }, [comboOwnerLabel, comboReport, faction, heroEvent, latestComposite, narrativeContext.capturedStates, narrativeContext.truthDeltaTotal]);

  const heroHeadline = latestComposite
    ? latestComposite.headline
    : (() => {
        if (heroEvent) {
          const base = (heroEvent.headline ?? heroEvent.title ?? 'UNIDENTIFIED INCIDENT').toUpperCase();
          const effectsLabel = formatEventEffects(heroEvent.effects);
          return effectsLabel ? `${base} (${effectsLabel})` : base;
        }
        const defaultHeadline = faction === 'truth'
          ? 'COALITION OPS HOLD PATTERN'
          : 'DIRECTORATE ENVOYS MAINTAIN WATCH';
        return heroFallback?.headline ?? defaultHeadline;
      })();

  const heroSubhead = latestComposite
    ? latestComposite.subhead
    : heroEvent?.content
      ?? heroFallback?.subhead
      ?? 'Developing situation under intense scrutiny.';

  const heroBody = useMemo(() => {
    if (latestComposite) {
      if (latestComposite.body.length) {
        return latestComposite.body;
      }
      return [latestComposite.subhead];
    }
    if (heroEvent) {
      return [heroEvent.content ?? 'Witness reports remain fragmentary; authorities maintain deliberate silence.'];
    }
    return heroFallback?.body ?? [
      'Coalition networks report steady intel flow with no escalations requiring immediate action.',
      'Field agents rotate through rest cycles as analysts maintain quiet watch on signal integrity.',
    ];
  }, [heroEvent, heroFallback, latestComposite]);

  const heroIsEvent = !latestComposite && Boolean(heroEvent);
  const heroIsFilesOnTheLoose = heroEvent?.id === 'deepfile_dump_crochet_forum';
  const heroTypeLabel = latestComposite
    ? '[COMPOSITE DISPATCH]'
    : heroEvent
      ? `[${(heroEvent.type ?? 'Event').toUpperCase()}]`
      : comboReport
        ? '[PLAYER HIGHLIGHT]'
        : '[STATUS BRIEF]';
  const heroTarget = latestComposite
    ? (heroSourceHeadlines.length
      ? `Sources: ${heroSourceHeadlines.slice(0, 2).map(source => source.headline).join(' • ')}`
      : heroStoryTags.length
        ? `Tags: ${heroStoryTags.slice(0, 2).join(' • ')}`
        : null)
    : heroFallback?.tags?.length
      ? `Tags: ${heroFallback.tags.slice(0, 2).join(' • ')}`
      : heroEvent
        ? null
        : comboOwnerLabel ?? null;
  const heroTags = latestComposite
    ? heroStoryTags.slice(0, 3)
    : heroEvent
      ? []
      : heroFallback?.tags
        ?? (comboReport ? comboReport.entries.slice(0, 3).map(entry => entry.name).filter(Boolean) : []);
  const heroPrimaryCardId = null;

  const comboNarrative = useMemo(() => {
    if (!comboReport || comboReport.entries.length === 0) {
      return null;
    }
    const magnitude = comboReport.entries.length;
    const tags = comboReport.entries.map(entry => entry.name).filter(Boolean);
    const primary = comboReport.entries[0];
    const headline = primary?.fxText
      ?? primary?.description
      ?? primary?.name
      ?? 'Combo operatives execute synchronized maneuver.';
    const deck = primary?.reward
      ? `Reward: ${primary.reward}`
      : comboOwnerLabel
        ? `${comboOwnerLabel} chains anomalies together.`
        : 'Chain reaction logged by newsroom analysts.';
    return {
      magnitude,
      tags: tags.length ? tags : ['Combo Sequence'],
      headline,
      deck,
    };
  }, [comboOwnerLabel, comboReport]);
  const bylinePool = dataset.bylines && dataset.bylines.length ? dataset.bylines : FALLBACK_DATA.bylines;
  const sourcePool = dataset.sources && dataset.sources.length ? dataset.sources : FALLBACK_DATA.sources;
  const byline = latestComposite
    ? 'By: Composite Desk'
    : pick(bylinePool, FALLBACK_DATA.bylines?.[0] ?? 'By: Anonymous Insider');
  const sourceLine = latestComposite
    ? (heroSourceHeadlines.length
      ? `Sources: ${heroSourceHeadlines.map(source => source.headline).join(' • ')}`
      : 'Sources withheld pending clearance.')
    : pick(sourcePool, FALLBACK_DATA.sources?.[0] ?? 'Source: Redacted Dossier');
  const stampPool = dataset.stamps ?? FALLBACK_DATA.stamps ?? { breaking: [], classified: [] };
  const breakingStamp = latestComposite
    ? null
    : heroEvent
      ? pick(stampPool.breaking ?? [], FALLBACK_DATA.stamps?.breaking?.[0] ?? 'BREAKING')
      : null;
  const classifiedStamp = latestComposite && latestComposite.tone !== 'truth'
    ? pick(stampPool.classified ?? [], FALLBACK_DATA.stamps?.classified?.[0] ?? 'CLASSIFIED')
    : null;

  const ads = useMemo(() => {
    const pool = dataset.ads ?? FALLBACK_DATA.ads;
    if (!pool.length) {
      return FALLBACK_DATA.ads;
    }
    const desired = pool.length < 3 ? pool.length : 3 + (Math.random() < 0.5 ? 0 : 1);
    return shuffle(pool).slice(0, desired);
  }, [dataset.ads]);

  const conspiracies = useMemo(() => {
    const pool = dataset.conspiracyCorner ?? FALLBACK_DATA.conspiracyCorner ?? [];
    if (!pool.length) {
      return FALLBACK_DATA.conspiracyCorner ?? [];
    }
    const shuffled = shuffle(pool);
    if (shuffled.length <= 4) {
      return shuffled;
    }
    const max = Math.min(shuffled.length, 6);
    const min = Math.min(shuffled.length, 4);
    const desired = min === max ? max : Math.floor(Math.random() * (max - min + 1)) + min;
    return shuffled.slice(0, desired);
  }, [dataset.conspiracyCorner]);

  const datasetWeatherLine = pick(
    dataset.weather ?? FALLBACK_DATA.weather ?? [],
    FALLBACK_DATA.weather?.[0] ?? getFallbackTabloidWeather(),
  );

  const weatherLine =
    tabloidWeatherLine && tabloidWeatherLine !== getFallbackTabloidWeather()
      ? tabloidWeatherLine
      : datasetWeatherLine ?? getFallbackTabloidWeather();

  const eventStories = useMemo(
    () =>
      events.map(event => ({
        kind: 'event' as const,
        ...createEventStory(event),
      })),
    [events],
  );

  const hotspotExtraArticle = useMemo<HotspotExtraArticle | null>(() => {
    if (!hotspotDirector || !activeHotspot) {
      return null;
    }

    try {
      return hotspotDirector.buildHotspotExtraArticle(activeHotspot);
    } catch (error) {
      console.error('Failed to compose hotspot extra article:', error);
      return null;
    }
  }, [hotspotDirector, activeHotspot]);

  const campaignArcGroups = useMemo<CampaignArcGroup[]>(() => {
    if (!events.length) {
      return [];
    }

    const arcMap = new Map<
      string,
      {
        arcId: string;
        arcName: string;
        totalChapters: number;
        chapters: Map<number, ArcChapterGroup>;
      }
    >();

    for (const event of events) {
      const campaign = event.campaign;
      if (!campaign) {
        continue;
      }

      const story = createEventStory(event);
      const { arcId, chapter, resolution } = campaign;
      const totalChapters = getArcTotalChapters(arcId, chapter);

      let arcEntry = arcMap.get(arcId);
      if (!arcEntry) {
        arcEntry = {
          arcId,
          arcName: formatArcName(arcId),
          totalChapters,
          chapters: new Map<number, ArcChapterGroup>(),
        };
        arcMap.set(arcId, arcEntry);
      } else {
        arcEntry.totalChapters = Math.max(arcEntry.totalChapters, totalChapters, chapter);
      }

      let chapterEntry = arcEntry.chapters.get(chapter);
      if (!chapterEntry) {
        chapterEntry = {
          chapter,
          resolution,
          events: [],
        };
        arcEntry.chapters.set(chapter, chapterEntry);
      } else if (resolution && !chapterEntry.resolution) {
        chapterEntry.resolution = resolution;
      }

      chapterEntry.events.push({ event, story });
    }

    return Array.from(arcMap.values())
      .map(entry => {
        const chapters = Array.from(entry.chapters.values()).sort((a, b) => a.chapter - b.chapter);
        if (!chapters.length) {
          return null;
        }

        const latestChapter = chapters[chapters.length - 1]?.chapter ?? 0;
        const totalChapters = Math.max(entry.totalChapters, latestChapter || 1);
        const activeChapter = chapters.find(chapter => chapter.chapter === latestChapter);
        const resolution = activeChapter?.resolution;
        const status: CampaignArcGroup['status'] =
          resolution === 'finale'
            ? 'finale'
            : resolution === 'cliffhanger'
              ? 'cliffhanger'
              : 'active';
        const rawProgress = totalChapters > 0 ? Math.round((latestChapter / totalChapters) * 100) : 0;
        const progressPercent = Math.max(0, Math.min(100, rawProgress));
        const activeTagline = buildArcStatusTagline(
          entry.arcName,
          latestChapter,
          resolution,
          activeChapter?.events[0]?.event,
        );

        return {
          arcId: entry.arcId,
          arcName: entry.arcName,
          totalChapters,
          latestChapter,
          progressPercent,
          status,
          activeTagline,
          chapters,
        } satisfies CampaignArcGroup;
      })
      .filter((entry): entry is CampaignArcGroup => Boolean(entry))
      .sort((a, b) => a.arcName.localeCompare(b.arcName));
  }, [events]);

  const arcProgressSummaries = useMemo<ArcProgressSummary[]>(() => {
    if (!campaignArcGroups.length) {
      return [];
    }

    return campaignArcGroups.map(arc => {
      const activeChapter = arc.chapters.find(entry => entry.chapter === arc.latestChapter);
      const resolution = activeChapter?.resolution;
      const summaryEvents = activeChapter
        ? activeChapter.events.map(({ event, story }) => ({
            id: event.id,
            headline: event.headline ?? event.title,
            subhead: story.subhead,
            summary: story.summary,
            typeLabel: story.typeLabel,
          }))
        : [];
      const status: ArcProgressSummary['status'] =
        resolution === 'finale'
          ? 'finale'
          : resolution === 'cliffhanger'
            ? 'cliffhanger'
            : 'advanced';
      const fallbackTagline = buildArcStatusTagline(
        arc.arcName,
        arc.latestChapter,
        resolution,
        activeChapter?.events[0]?.event,
      );

      return {
        arcId: arc.arcId,
        arcName: arc.arcName,
        chapter: arc.latestChapter,
        totalChapters: arc.totalChapters,
        progressPercent: arc.progressPercent,
        resolution,
        status,
        tagline: arc.activeTagline || fallbackTagline,
        events: summaryEvents,
      } satisfies ArcProgressSummary;
    });
  }, [campaignArcGroups]);

  useEffect(() => {
    if (!onArcProgress || !arcProgressSummaries.length) {
      return;
    }
    onArcProgress(arcProgressSummaries);
  }, [arcProgressSummaries, onArcProgress]);

  const displayMasthead = glitchText ?? masthead;
  const truthProgress = Math.max(0, Math.min(100, Math.round(truth)));
  const truthDeltaLabel = formatTruthDelta(narrativeContext.truthDeltaTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <UICard className={NEWSPAPER_CARD_CLASS}>
        <header className={cn(NEWSPAPER_HEADER_CLASS, 'overflow-hidden')}>
          {breakingStamp ? (
            <div className="stamp stamp--breaking absolute left-6 top-4 z-10">{breakingStamp}</div>
          ) : null}
          {hasExtraExtra && (
            <ExtraStamp
              className="top-4 right-20 md:top-6 md:right-24"
              size="md"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close newspaper"
            className="absolute right-4 top-4 z-10 rounded-full border-2 border-newspaper-text/40 bg-newspaper-bg/40 p-1 text-newspaper-text transition hover:bg-newspaper-bg"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle,_rgba(15,23,42,0.12)_1px,transparent_1px)] [background-size:6px_6px] mix-blend-multiply"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/45 via-transparent to-white/10"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-newspaper-text/70">
              <span>Global Edition</span>
              <span className="hidden h-3 w-px bg-newspaper-text/30 sm:block" aria-hidden="true" />
              <span>Joint Spin Bureau</span>
              <span className="hidden h-3 w-px bg-newspaper-text/30 sm:block" aria-hidden="true" />
              <span>Est. 1947</span>
            </div>
            <div className="flex w-full flex-col items-center gap-2">
              <p
                className={`relative font-serif text-4xl font-black uppercase tracking-[0.12em] text-newspaper-text sm:text-5xl ${glitchText ? 'glitch' : ''}`}
                data-text={displayMasthead}
              >
                {displayMasthead}
              </p>
              <div className="h-px w-16 bg-newspaper-text/40 sm:w-24" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-newspaper-text/70">
              Equal-Opportunity Propaganda for Loyalists & Leaksters
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-newspaper-text/55">
              Edition courtesy of the{' '}
              {faction === 'truth' ? 'Truth Coalition Whisper Network' : 'State Narrative Directorate'}
            </p>
            {agendaIssue ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-newspaper-text/45">
                Spotlight: {agendaIssue.label}
              </p>
            ) : null}
          </div>
        </header>

        <div className={NEWSPAPER_BODY_CLASS}>
          {/* Truth Index Bar */}
          <NewspaperSection className="mb-4 bg-white/80 px-4 py-3 text-newspaper-text">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold uppercase tracking-wide">Truth Index</span>
                <div className="w-36">
                  <Progress value={truthProgress} className="h-2 bg-white/40" />
                </div>
                <span className="font-mono text-xs">{truthProgress}%</span>
                {truthDeltaLabel ? (
                  <span className="rounded border border-newspaper-border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide">
                    {truthDeltaLabel}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-wide text-newspaper-text/70">
                <span>Your Cards: {playerCards.length}</span>
                <span>Opposition: {opponentCards.length}</span>
                <span>Captured: {narrativeContext.capturedStates.length || '—'}</span>
                <span>Events: {events.length || '—'}</span>
              </div>
            </div>
          </NewspaperSection>

          {/* 3-Column Layout: Main Story + Stats/Secondary + Sidebar */}
          <div className="grid gap-4 lg:grid-cols-[2fr_1.5fr_1.5fr]">
            {/* COLUMN 1: Main Story + Image */}
            <article className="space-y-4 rounded-md border border-newspaper-border bg-white/80 p-6 shadow-sm">
              {latestComposite ? (
                <TurnEdition story={latestComposite} />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-newspaper-text/70">
                    <span className={cn(NEWSPAPER_BADGE_CLASS, 'rounded-full px-2 py-1 text-[11px] tracking-wide text-newspaper-text')}>
                      {heroTypeLabel}
                    </span>
                    {heroTarget ? (
                      <span className="rounded-full border border-dashed border-newspaper-border px-2 py-1">{heroTarget}</span>
                    ) : null}
                  </div>

                  <div className="space-y-4">
                    <h2
                      className={`text-3xl font-black leading-tight sm:text-4xl ${
                        heroIsEvent ? 'text-secret-red' : 'text-newspaper-headline'
                      } ${
                        heroIsFilesOnTheLoose ? 'animate-pulse drop-shadow-[0_0_20px_rgba(248,113,113,0.65)]' : ''
                      }`}
                    >
                      {heroHeadline}
                    </h2>
                    <p
                      className={`text-lg font-semibold italic ${
                        heroIsEvent
                          ? heroIsFilesOnTheLoose
                            ? 'text-secret-red drop-shadow-[0_0_12px_rgba(248,113,113,0.55)]'
                            : 'text-secret-red/80'
                          : 'text-newspaper-text/80'
                      } ${heroIsFilesOnTheLoose ? 'animate-pulse' : ''}`}
                    >
                      {heroSubhead}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/70">
                      <span>{byline}</span>
                      <span>{sourceLine}</span>
                    </div>

                    {/* Main Story Image */}
                    <div className="relative overflow-hidden rounded-md border border-newspaper-border bg-newspaper-header/20">
                      {heroPrimaryCardId ? (
                        <CardImage
                          cardId={heroPrimaryCardId}
                          fit="contain"
                          className="w-full aspect-[4/3] max-h-64"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full max-h-64 items-center justify-center text-sm font-semibold uppercase tracking-wide text-newspaper-text/60">
                          Archival footage pending clearance.
                        </div>
                      )}
                      {classifiedStamp ? (
                        <div className="stamp stamp--classified absolute right-3 top-3">{classifiedStamp}</div>
                      ) : null}
                    </div>

                    <div
                      className={`space-y-4 text-sm leading-relaxed ${
                        heroIsEvent ? 'text-secret-red/90' : ''
                      } ${
                        heroIsFilesOnTheLoose ? 'animate-pulse drop-shadow-[0_0_14px_rgba(248,113,113,0.4)]' : ''
                      }`}
                    >
                      {heroBody.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>

                    {heroTags.length ? (
                      <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/60">
                        {heroTags.slice(0, 3).map(tag => (
                          <span key={tag} className="rounded border border-newspaper-border px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </article>

            {/* COLUMN 2: Stats & Secondary Headlines */}
            <aside className="space-y-4">
              {/* Runner-Up Dispatches */}
              {runnerDispatches.length > 0 ? (
                <section className="rounded-md border border-newspaper-border bg-white/75 p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black uppercase tracking-wide text-newspaper-text">
                      Runner-Up Dispatches
                    </h3>
                    {latestComposite ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-newspaper-text/50">
                        Composite Story
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    {runnerDispatches.slice(0, 3).map((dispatch, index) => (
                      <article
                        key={`${dispatch.id}-${index}`}
                        className="border-b border-dashed border-newspaper-border/60 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.28em] text-newspaper-text/55">
                          <span>{`Archive Source ${index + 1}`}</span>
                          <span>{dispatch.tone.toUpperCase()}</span>
                        </div>
                        <h4 className="mt-1 text-base font-semibold leading-snug text-newspaper-text">
                          {dispatch.headline}
                        </h4>
                        {dispatch.subhead ? (
                          <p className="text-xs italic text-newspaper-text/70">{dispatch.subhead}</p>
                        ) : null}
                        <p className="mt-2 text-xs leading-relaxed text-newspaper-text/75">
                          {dispatch.summary}
                        </p>
                        <footer className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-newspaper-text/50">
                          <div>By: Composite Desk</div>
                          <div>Ref: {dispatch.id}</div>
                        </footer>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Combo Dispatch */}
              {comboNarrative ? (
                <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                  <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-newspaper-text">
                    Combo Dispatch
                  </h3>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-newspaper-text/60">
                    Chain: {comboNarrative.magnitude} · {comboNarrative.tags.join(' • ')}
                  </div>
                  <h4 className="mt-2 text-base font-semibold leading-snug text-newspaper-text">
                    {comboNarrative.headline}
                  </h4>
                  <p className="text-xs italic text-newspaper-text/70">{comboNarrative.deck}</p>
                </section>
              ) : null}

            </aside>

            {/* COLUMN 3: Event Wire + Ads + Extras */}
            <aside className="space-y-4">
              {/* Event Wire */}
              {eventStories.length ? (
                <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                  <h3 className="mb-3 border-b-2 border-secret-red pb-2 text-sm font-black uppercase tracking-wide text-secret-red">Event Wire</h3>
                  <div className="space-y-3 text-sm text-secret-red/90">
                    {eventStories.slice(0, 3).map(story => {
                      const isFilesOnTheLoose = story.id === 'deepfile_dump_crochet_forum';
                      return (
                        <div
                          key={story.id}
                          className={`border-b border-dashed border-newspaper-border/60 pb-2 last:border-0 last:pb-0 ${
                            isFilesOnTheLoose
                              ? 'rounded-md bg-white/95 px-3 py-2 shadow-[0_0_20px_rgba(248,113,113,0.35)] ring-2 ring-secret-red/60'
                              : ''
                          }`}
                        >
                          <div
                            className={`text-[11px] font-semibold uppercase tracking-wide ${
                              isFilesOnTheLoose
                                ? 'text-secret-red animate-pulse drop-shadow-[0_0_10px_rgba(248,113,113,0.65)]'
                                : 'text-secret-red/80'
                            }`}
                          >
                            {story.typeLabel}
                          </div>
                          <p
                            className={`font-semibold leading-snug text-secret-red ${
                              isFilesOnTheLoose
                                ? 'animate-pulse drop-shadow-[0_0_16px_rgba(248,113,113,0.6)]'
                                : ''
                            }`}
                          >
                            {story.headline}
                          </p>
                          <p
                            className={`text-xs italic ${
                              isFilesOnTheLoose
                                ? 'text-secret-red animate-pulse drop-shadow-[0_0_12px_rgba(248,113,113,0.5)]'
                                : 'text-secret-red/80'
                            }`}
                          >
                            {story.subhead}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {/* Sponsored Messages (Ads) */}
              <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-newspaper-text">Sponsored Messages</h3>
                <div className="space-y-2">
                  {ads.slice(0, 3).map((ad, index) => (
                    <div
                      key={`${ad}-${index}`}
                      className="rounded border border-dashed border-newspaper-border/60 bg-white/60 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-newspaper-text"
                    >
                      {ad}
                    </div>
                  ))}
                </div>
              </section>

              {/* Conspiracy Corner */}
              {conspiracies.length ? (
                <section className="rounded-md border border-newspaper-border bg-white/75 p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-newspaper-text">Conspiracy Corner</h3>
                  <ul className="space-y-2 text-xs leading-relaxed">
                    {conspiracies.slice(0, 4).map((item, index) => (
                      <li key={`${item}-${index}`} className="before:mr-2 before:text-newspaper-text before:content-['•']">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* Weather Desk */}
              <section className="rounded-md border border-newspaper-border bg-white/75 p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-newspaper-text">Weather Desk</h3>
                <p className="text-xs leading-relaxed">{weatherLine}</p>
              </section>

              {/* Agenda Moments */}
              {formattedAgendaQuotes.length ? (
                <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-newspaper-text">Agenda Moments</h3>
                  <div className="space-y-3">
                    {formattedAgendaQuotes.map(quote => (
                      <div
                        key={quote.id}
                        className="rounded border border-dashed border-newspaper-border/60 bg-white/60 p-3 text-xs"
                      >
                        <div className="font-semibold uppercase tracking-wide text-newspaper-text/70">{quote.title}</div>
                        <p className="mt-1 font-semibold leading-snug">{quote.headline}</p>
                        <p className="mt-1 text-newspaper-text/70">{quote.stageLabel}: {quote.progressLabel}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>
          </div>
        </div>

        <footer className="border-t-4 border-newspaper-border bg-newspaper-header/90 px-6 py-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-newspaper-bg/80">
              {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} · Printed on recycled leak fragments
            </p>
            <Button
              variant="secondary"
              onClick={onClose}
              className="font-black uppercase tracking-wide"
            >
              Continue the Operation
            </Button>
          </div>
        </footer>
      </UICard>
    </div>
  );
};

export default TabloidNewspaperV2;
