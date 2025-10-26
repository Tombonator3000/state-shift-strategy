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
import { NewspaperPageFlip } from '@/components/newspaper/NewspaperPageFlip';
import { ExpandableArticle } from '@/components/newspaper/ExpandableArticle';
import { MultiColumnArticle } from '@/components/newspaper/MultiColumnArticle';
import { NewspaperTexture } from '@/components/newspaper/NewspaperTexture';
import { ClassifiedAds } from '@/components/newspaper/ClassifiedAds';
import { LettersToEditor } from '@/components/newspaper/LettersToEditor';
import { ComicStrip } from '@/components/newspaper/ComicStrip';
import { NewspaperHoroscope } from '@/components/newspaper/NewspaperHoroscope';
import { newspaperSounds } from '@/lib/newspaperSounds';
import { NewspaperReturn } from './TabloidNewspaperV2Return';
import { buildNewspaperPages } from './TabloidNewspaperV2Pages';

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

  const {
    id: heroPrimaryCardId,
    name: heroPrimaryCardName,
    faction: heroPrimaryCardFaction,
  } = useMemo(() => {
    const heroCard = frontPageCards[0];

    if (!heroCard) {
      return {
        id: null as string | null,
        name: null as string | null,
        faction: null as string | null,
      };
    }

    return {
      id: heroCard.id ?? null,
      name: heroCard.name ?? null,
      faction: heroCard.faction ?? null,
    };
  }, [frontPageCards]);

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

  // Build interactive newspaper pages
  const newspaperPages = useMemo(() => {
    // Transform hotspot article to match expected format
    const transformedHotspotArticle = hotspotExtraArticle ? {
      headline: hotspotExtraArticle.headline,
      subhead: hotspotExtraArticle.badgeLabel,
      body: [hotspotExtraArticle.blurb],
      tags: [hotspotExtraArticle.kind, hotspotExtraArticle.stateName].filter(Boolean),
    } : null;

    return buildNewspaperPages({
      heroHeadline,
      heroSubhead,
      heroBody,
      heroTags,
      heroPrimaryCardId,
      heroPrimaryCardName,
      heroPrimaryCardFaction,
      byline,
      sourceLine,
      truthProgress,
      truthDeltaLabel,
      playerCards,
      opponentCards,
      narrativeContext,
      events,
      runnerDispatches,
      eventStories,
      comboNarrative,
      hotspotExtraArticle: transformedHotspotArticle,
      ads,
      conspiracies,
      weatherLine,
      formattedAgendaQuotes,
      campaignArcGroups,
    });
  }, [
    heroHeadline,
    heroSubhead,
    heroBody,
    heroTags,
    byline,
    sourceLine,
    truthProgress,
    truthDeltaLabel,
    playerCards,
    opponentCards,
    narrativeContext,
    events,
    runnerDispatches,
    eventStories,
    comboNarrative,
    hotspotExtraArticle,
    ads,
    conspiracies,
    weatherLine,
    formattedAgendaQuotes,
    campaignArcGroups,
    frontPageCards,
  ]);

  return (
    <NewspaperReturn
      onClose={onClose}
      displayMasthead={displayMasthead}
      glitchText={glitchText}
      faction={faction}
      hasExtraExtra={hasExtraExtra}
      breakingStamp={breakingStamp}
      agendaIssue={agendaIssue}
      newspaperPages={newspaperPages}
    />
  );
};

export default TabloidNewspaperV2;
