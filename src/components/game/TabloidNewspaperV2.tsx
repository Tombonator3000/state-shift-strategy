import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Card as UICard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CardImage from '@/components/game/CardImage';
import { loadNewspaperData, pick, shuffle, type NewspaperData } from '@/lib/newspaperData';
import { generateIssue, type NarrativeIssue, type PlayedCardInput } from '@/engine/newspaper/IssueGenerator';
import type { TabloidNewspaperProps } from './TabloidNewspaperLegacy';
import type { Card } from '@/types';
import { formatComboReward, getLastComboSummary } from '@/game/comboEngine';
import { buildRoundContext, formatTruthDelta } from './tabloidRoundUtils';
import { useAudioContext } from '@/contexts/AudioContext';
import type { ParanormalSighting } from '@/types/paranormal';
import type { AgendaMoment } from '@/hooks/usePressArchive';

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

const TabloidNewspaperV2 = ({
  events,
  playedCards,
  faction,
  truth,
  comboTruthDelta = 0,
  onClose,
  sightings = [],
  agendaIssue,
  agendaMoments = [],
}: TabloidNewspaperProps) => {
  const [data, setData] = useState<NewspaperData | null>(null);
  const [masthead, setMasthead] = useState('THE PARANOID TIMES');
  const [glitchText, setGlitchText] = useState<string | null>(null);

  const dataset = data ?? FALLBACK_DATA;
  const [issue, setIssue] = useState<NarrativeIssue | null>(null);
  const audio = useAudioContext();
  const [highlightedSightingId, setHighlightedSightingId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeSightingIndex, setActiveSightingIndex] = useState(0);
  const highlightTimeoutRef = useRef<number | null>(null);
  const prevSightingsCountRef = useRef(0);
  const lastSightingIdRef = useRef<string | null>(null);

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
    let glitchTimer: number | null = null;
    let resetTimer: number | null = null;

    const resolveMasthead = (pool?: string[]) =>
      pick(pool && pool.length ? pool : FALLBACK_DATA.mastheads, FALLBACK_DATA.mastheads[0]).toUpperCase();

    const load = async () => {
      try {
        const loaded = await loadNewspaperData();
        if (cancelled) return;

        setData(loaded);
        const mastheadPool = loaded.mastheads ?? FALLBACK_DATA.mastheads;
        setMasthead(resolveMasthead(mastheadPool));

        if (Math.random() < 0.05) {
          glitchTimer = window.setTimeout(() => {
            if (cancelled) return;
            setGlitchText(pick(GLITCH_OPTIONS, GLITCH_OPTIONS[0]));
            resetTimer = window.setTimeout(() => {
              if (cancelled) return;
              setGlitchText(null);
              setMasthead(resolveMasthead(mastheadPool));
            }, 1200);
          }, 600);
        }
      } catch (error) {
        console.warn('Newspaper data load failed, using fallback set.', error);
        if (cancelled) return;
        setData(FALLBACK_DATA);
        setMasthead(resolveMasthead(FALLBACK_DATA.mastheads));
      }
    };

    load();

    return () => {
      cancelled = true;
      if (glitchTimer) {
        window.clearTimeout(glitchTimer);
      }
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
    };
  }, []);

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

  const narrativePlayedCards = useMemo<PlayedCardInput[]>(
    () =>
      playedCards.map(entry => ({
        card: entry.card as Card,
        player: entry.player,
        targetState: entry.targetState ?? null,
        truthDelta: entry.truthDelta,
        capturedStates: entry.capturedStates ?? [],
      })),
    [playedCards],
  );

  const playerNarrativeCards = useMemo(
    () => narrativePlayedCards.filter(entry => entry.player === 'human'),
    [narrativePlayedCards],
  );

  const opponentNarrativeCards = useMemo(
    () => narrativePlayedCards.filter(entry => entry.player === 'ai'),
    [narrativePlayedCards],
  );

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
        reward: formatComboReward(result.appliedReward).replace(/[()]/g, '').trim(),
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

  useEffect(() => {
    let cancelled = false;
    const activeDataset = dataset;

    const run = async () => {
      try {
        const generated = await generateIssue({
          dataset: activeDataset,
          playedCards: narrativePlayedCards,
          eventsTruthDelta,
          comboTruthDelta,
          comboSummary: comboSummary ?? null,
          agendaIssueId: agendaIssue?.id,
        });
        if (!cancelled) {
          setIssue(generated);
        }
      } catch (error) {
        console.warn('Failed to generate narrative issue', error);
        if (!cancelled) {
          setIssue(null);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [dataset, narrativePlayedCards, eventsTruthDelta, comboTruthDelta, comboSummary, agendaIssue?.id]);

  const narrativeContext = useMemo(
    () => buildRoundContext(playerNarrativeCards, opponentNarrativeCards, eventsTruthDelta, comboTruthDelta),
    [playerNarrativeCards, opponentNarrativeCards, eventsTruthDelta, comboTruthDelta],
  );

  const heroArticle = issue?.hero ?? null;
  const heroEvent = heroArticle ? null : (events[0] ?? null);

  const fallbackHeroHeadlineBase = useMemo(() => {
    if (heroArticle || heroEvent) {
      return null;
    }
    if (comboReport) {
      const owner = comboOwnerLabel ?? 'Operative Team';
      return `${owner} Holds Initiative`;
    }
    return faction === 'truth' ? 'Coalition Status: Stable' : 'Directorate Status: Stable';
  }, [comboOwnerLabel, comboReport, faction, heroArticle, heroEvent]);

  const fallbackHeroSubhead = useMemo(() => {
    if (heroArticle || heroEvent) {
      return null;
    }
    if (comboReport) {
      return 'Coordinated plays under review; teams cycle readiness drills.';
    }
    return faction === 'truth'
      ? 'Signal monitors report no verified threats this cycle.'
      : 'Agency briefings indicate routine operations across districts.';
  }, [comboReport, faction, heroArticle, heroEvent]);

  const fallbackHeroBody = useMemo(() => {
    if (heroArticle || heroEvent) {
      return null;
    }
    if (comboReport) {
      const highlights = comboReport.entries
        .map(entry => entry.name)
        .filter(Boolean)
        .slice(0, 3);
      const owner = comboOwnerLabel ?? 'Operative Team';
      return [
        `${owner} review coordinated plays while awaiting fresh intel.`,
        highlights.length
          ? `Recent highlights: ${highlights.join(' • ')}.`
          : 'Analysts note smooth execution with no unexpected resistance.',
      ];
    }
    if (faction === 'truth') {
      return [
        'Coalition networks report steady intel flow with no escalations requiring immediate action.',
        'Field agents rotate through rest cycles as analysts maintain quiet watch on signal integrity.',
      ];
    }
    return [
      'Directorate analysts confirm stable civic sentiment while monitoring for anomalous activity.',
      'Regional liaisons emphasize patience as security nodes continue standard diagnostics.',
    ];
  }, [comboOwnerLabel, comboReport, faction, heroArticle, heroEvent]);

  const heroHeadline = heroArticle
    ? heroArticle.headline
    : (() => {
        if (heroEvent) {
          const base = (heroEvent.headline ?? heroEvent.title ?? 'UNIDENTIFIED INCIDENT').toUpperCase();
          const effectsLabel = formatEventEffects(heroEvent.effects);
          return effectsLabel ? `${base} (${effectsLabel})` : base;
        }
        return (fallbackHeroHeadlineBase ?? 'STATUS UPDATE').toUpperCase();
      })();

  const heroSubhead = heroArticle
    ? heroArticle.deck
    : heroEvent?.content ?? fallbackHeroSubhead ?? 'Developing situation under intense scrutiny.';

  const heroBody = heroArticle?.paragraphs ?? (
    heroEvent
      ? [heroEvent.content ?? 'Witness reports remain fragmentary; authorities maintain deliberate silence.']
      : fallbackHeroBody ?? [
          'Coalition networks report steady intel flow with no escalations requiring immediate action.',
          'Field agents rotate through rest cycles as analysts maintain quiet watch on signal integrity.',
        ]
  );

  const heroIsEvent = Boolean(heroEvent);
  const heroTypeLabel = heroArticle?.typeLabel
    ?? (heroEvent ? `[${(heroEvent.type ?? 'Event').toUpperCase()}]` : comboReport ? '[PLAYER HIGHLIGHT]' : '[STATUS BRIEF]');
  const heroTarget = heroArticle?.stateLabel ?? (heroEvent ? null : comboOwnerLabel ?? null);
  const heroCaptured = heroArticle?.capturedStates ?? [];
  const heroTags = heroArticle?.tags ?? (heroEvent ? [] : comboReport ? comboReport.entries.slice(0, 3).map(entry => entry.name) : []);
  const heroTruthImpact = heroArticle?.truthDeltaLabel ?? null;
  const heroIpImpact = heroArticle?.ipDeltaLabel ?? null;
  const heroPressureImpact = heroArticle?.pressureDeltaLabel ?? null;
  const heroArtHint = heroArticle?.artHint ?? null;
  const heroTriggerChance = heroEvent?.triggerChance ?? null;
  const heroConditionalChance = heroEvent?.conditionalChance ?? null;
  const comboNarrative = issue?.comboArticle ?? null;

  const bylinePool = dataset.bylines && dataset.bylines.length ? dataset.bylines : FALLBACK_DATA.bylines;
  const sourcePool = dataset.sources && dataset.sources.length ? dataset.sources : FALLBACK_DATA.sources;
  const byline = issue?.byline ?? pick(bylinePool, FALLBACK_DATA.bylines?.[0] ?? 'By: Anonymous Insider');
  const sourceLine = issue?.sourceLine ?? pick(sourcePool, FALLBACK_DATA.sources?.[0] ?? 'Source: Redacted Dossier');
  const breakingStamp = issue?.stamps.breaking ?? null;
  const classifiedStamp = issue?.stamps.classified ?? null;

  const ads = issue?.supplements.ads ?? (() => {
    const pool = dataset.ads ?? FALLBACK_DATA.ads;
    if (!pool.length) {
      return FALLBACK_DATA.ads;
    }
    const desired = pool.length < 3 ? pool.length : 3 + (Math.random() < 0.5 ? 0 : 1);
    return shuffle(pool).slice(0, desired);
  })();

  const conspiracies = issue?.supplements.conspiracies ?? (() => {
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
  })();

  const weatherLine = issue?.supplements.weather ?? pick(dataset.weather ?? FALLBACK_DATA.weather ?? [], FALLBACK_DATA.weather?.[0] ?? 'Today: Classified Cloud Cover');

  const eventStories = useMemo(
    () =>
      events.map(event => ({
        kind: 'event' as const,
        ...createEventStory(event),
      })),
    [events],
  );

  const playerStorySummaries = useMemo(() => {
    const stories = issue?.playerArticles ?? [];
    return stories.map(story => ({
      kind: 'card' as const,
      id: story.id,
      cardId: story.cardId,
      headline: story.headline,
      subhead: story.deck,
      summary: story.paragraphs[0] ?? '',
      typeLabel: story.typeLabel,
      player: story.player,
      truthDeltaLabel: story.truthDeltaLabel,
      stateLabel: story.stateLabel,
      capturedStates: story.capturedStates,
      tags: story.tags,
      artHint: story.artHint,
      triggerChance: undefined,
      conditionalChance: undefined,
    }));
  }, [issue?.playerArticles]);

  const secondaryStories = useMemo(() => {
    if (playerStorySummaries.length >= 2) {
      return playerStorySummaries.slice(0, 2);
    }
    const needed = 2 - playerStorySummaries.length;
    return [...playerStorySummaries, ...eventStories.slice(0, needed)];
  }, [playerStorySummaries, eventStories]);

  const oppositionStories = useMemo(() => {
    const stories = issue?.oppositionArticles ?? [];
    return stories.map(story => ({
      kind: 'card' as const,
      id: story.id,
      cardId: story.cardId,
      headline: story.headline,
      subhead: story.deck,
      summary: story.paragraphs[0] ?? '',
      typeLabel: story.typeLabel,
      truthDeltaLabel: story.truthDeltaLabel,
      stateLabel: story.stateLabel,
      tags: story.tags,
      artHint: story.artHint,
      player: story.player,
      triggerChance: undefined,
      conditionalChance: undefined,
    }));
  }, [issue?.oppositionArticles]);

  const displayMasthead = glitchText ?? masthead;
  const truthProgress = Math.max(0, Math.min(100, Math.round(truth)));
  const truthDeltaLabel = formatTruthDelta(narrativeContext.truthDeltaTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <UICard className="ink-smudge relative flex h-full max-h-[90vh] w-full max-w-[min(95vw,1280px)] flex-col overflow-hidden border-4 border-newspaper-border bg-newspaper-bg text-newspaper-text shadow-2xl">
        <header className="relative border-b-4 border-double border-newspaper-border bg-newspaper-header/90 px-6 py-5">
          {breakingStamp ? (
            <div className="stamp stamp--breaking absolute left-6 top-4">{breakingStamp}</div>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close newspaper"
            className="absolute right-4 top-4 rounded-full border-2 border-newspaper-text/40 bg-newspaper-bg/40 p-1 text-newspaper-text transition hover:bg-newspaper-bg"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col gap-1 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.6em] text-newspaper-text/60">ShadowGov Press Bureau</span>
            <h1
              className={`text-3xl font-black uppercase tracking-[0.2em] text-newspaper-text sm:text-4xl ${glitchText ? 'glitch' : ''}`}
              data-text={displayMasthead}
            >
              {displayMasthead}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-newspaper-text/60">
              {faction === 'truth' ? 'Truth Coalition Dispatch' : 'Official Government Bulletin'}
            </p>
            {agendaIssue ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-newspaper-text/50">
                Issue Focus: {agendaIssue.label}
              </p>
            ) : null}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 xl:px-5 xl:py-5">
          <section className="mb-6 rounded-md border border-newspaper-border bg-white/70 px-4 py-3 text-sm text-newspaper-text shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold uppercase tracking-wide">Truth Index</span>
                <div className="w-36">
                  <Progress value={truthProgress} className="h-2" />
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
                <span>
                  Clearance: <span className="redaction align-middle">CLASSIFIED</span>
                </span>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:gap-5 lg:grid-cols-3">
            <article className="lg:col-span-2 space-y-4 rounded-md border border-newspaper-border bg-white/80 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-newspaper-text/70">
                <span className="rounded-full border border-newspaper-border px-2 py-1">{heroTypeLabel}</span>
                {heroTarget ? (
                  <span className="rounded-full border border-dashed border-newspaper-border px-2 py-1">{heroTarget}</span>
                ) : null}
              </div>
              <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
                <div className="space-y-4">
                  <h2
                    className={`text-3xl font-black leading-tight sm:text-4xl ${
                      heroIsEvent ? 'text-secret-red' : 'text-newspaper-headline'
                    }`}
                  >
                    {heroHeadline}
                  </h2>
                  <p
                    className={`text-lg font-semibold italic ${
                      heroIsEvent ? 'text-secret-red/80' : 'text-newspaper-text/80'
                    }`}
                  >
                    {heroSubhead}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/70">
                    <span>{byline}</span>
                    <span>{sourceLine}</span>
                  </div>
                  {heroIsEvent && (heroTriggerChance || heroConditionalChance) ? (
                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-secret-red/80">
                      {formatChance(heroTriggerChance) ? (
                        <span className="rounded border border-secret-red/50 px-2 py-0.5">
                          Chance This Turn: {formatChance(heroTriggerChance)}
                        </span>
                      ) : null}
                      {formatChance(heroConditionalChance) ? (
                        <span className="rounded border border-dashed border-secret-red/50 px-2 py-0.5">
                          If Triggered: {formatChance(heroConditionalChance)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <div
                    className={`space-y-4 text-sm leading-relaxed ${
                      heroIsEvent ? 'text-secret-red/90' : ''
                    }`}
                  >
                    {heroBody.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
                <div className="mt-6 space-y-4 lg:mt-0">
                  <div className="relative overflow-hidden rounded-md border border-newspaper-border bg-newspaper-header/20">
                    {heroArticle?.cardId ? (
                      <CardImage
                        cardId={heroArticle.cardId}
                        fit="contain"
                        className="w-full aspect-[63/88] max-h-80"
                      />
                    ) : (
                      <div className="flex aspect-[63/88] w-full max-h-80 items-center justify-center text-sm font-semibold uppercase tracking-wide text-newspaper-text/60">
                        Archival footage pending clearance.
                      </div>
                    )}
                    {classifiedStamp ? (
                      <div className="stamp stamp--classified absolute right-3 top-3">{classifiedStamp}</div>
                    ) : null}
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
                  {!heroIsEvent && (heroTruthImpact || heroIpImpact || heroPressureImpact) ? (
                    <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/60">
                      {heroTruthImpact ? (
                        <span className="rounded border border-newspaper-border px-2 py-0.5">{heroTruthImpact}</span>
                      ) : null}
                      {heroIpImpact ? (
                        <span className="rounded border border-newspaper-border px-2 py-0.5">{heroIpImpact}</span>
                      ) : null}
                      {heroPressureImpact ? (
                        <span className="rounded border border-newspaper-border px-2 py-0.5">{heroPressureImpact}</span>
                      ) : null}
                    </div>
                  ) : null}
                  {heroCaptured.length ? (
                    <div className="text-xs font-semibold uppercase tracking-wide text-newspaper-text/70">
                      Captured: {heroCaptured.join(', ')}
                    </div>
                  ) : null}
                  {heroArtHint ? (
                    <p className="text-[11px] italic text-newspaper-text/50">Illustration brief: {heroArtHint}</p>
                  ) : null}
                </div>
              </div>
            </article>

            <aside className="space-y-4">
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
                  <div className="mt-2 space-y-2 text-sm leading-relaxed text-newspaper-text/80">
                    {comboNarrative.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                  {comboNarrative.summary ? (
                    <div className="mt-2 rounded border border-dashed border-newspaper-border/60 bg-white/60 p-2 text-[11px] uppercase tracking-wide text-newspaper-text/60">
                      {comboNarrative.summary}
                    </div>
                  ) : null}
                  {comboReport?.entries.length ? (
                    <div className="mt-3 space-y-3 text-sm">
                      {comboReport.entries.map(entry => {
                        const rewardLabel = entry.reward;
                        return (
                          <div
                            key={entry.id}
                            className="border-b border-dashed border-newspaper-border/60 pb-2 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-newspaper-text/60">
                              <span>{entry.name}</span>
                              {rewardLabel ? <span>{rewardLabel}</span> : null}
                            </div>
                            <p className="text-xs italic text-newspaper-text/70">{entry.description}</p>
                            {entry.matchedPlays.length ? (
                              <div className="text-[11px] font-mono text-newspaper-text/60">
                                Plays: {entry.matchedPlays.join(' → ')}
                              </div>
                            ) : null}
                            {entry.fxText ? (
                              <div className="text-[10px] uppercase tracking-wide text-newspaper-text/50">
                                FX: {entry.fxText}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              ) : null}
              {formattedAgendaQuotes.length ? (
                <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                  <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-newspaper-text">
                    Agenda Signals
                  </h3>
                  <div className="space-y-3">
                    {formattedAgendaQuotes.map(entry => (
                      <div
                        key={entry.id}
                        className={`rounded-md border-l-4 pl-3 pr-2 py-2 ${
                          entry.status === 'complete'
                            ? 'border-emerald-500 bg-emerald-50/70'
                            : 'border-rose-500 bg-rose-50/70'
                        }`}
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-newspaper-text/60">
                          {entry.title}
                        </div>
                        <div className="text-sm font-semibold leading-snug text-newspaper-text">
                          {entry.headline}
                        </div>
                        <blockquote className="text-xs italic text-newspaper-text/70">
                          “{entry.description}”
                        </blockquote>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-newspaper-text/50">
                          <span>{entry.factionLabel}</span>
                          <span>Stage: {entry.stageLabel}</span>
                          <span>Progress {entry.progressLabel}</span>
                        </div>
                        <div className="text-[9px] uppercase tracking-[0.35em] text-newspaper-text/40">
                          {entry.actorLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wide">Sightings Feed</h3>
                  {activeSighting ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-newspaper-text/60">
                      {formatSightingTime(activeSighting.timestamp)}
                    </span>
                  ) : null}
                </div>
                {activeSighting ? (
                  <div
                    className={`space-y-2 rounded-md border border-dashed border-newspaper-border/60 bg-newspaper-header/10 p-3 transition ${
                      highlightedSightingId === activeSighting.id ? 'sighting-highlight' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-newspaper-text/70">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 ${SIGHTING_BADGE_VARIANTS[activeSighting.category]}`}
                      >
                        <span aria-hidden="true">{SIGHTING_ICONS[activeSighting.category]}</span>
                        {SIGHTING_LABELS[activeSighting.category]}
                      </span>
                      {activeSighting.location ? (
                        <span className="rounded border border-newspaper-border px-2 py-0.5">
                          {activeSighting.location}
                        </span>
                      ) : null}
                    </div>
                    <h4 className="text-base font-semibold leading-snug text-newspaper-text">
                      {activeSighting.headline}
                    </h4>
                    <p className="text-xs italic text-newspaper-text/70">{activeSighting.subtext}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-newspaper-text/60">
                      {activeSighting.metadata?.intensity ? (
                        <span className="rounded border border-dashed border-newspaper-border px-2 py-0.5">
                          Intensity: {activeSighting.metadata.intensity.toUpperCase()}
                        </span>
                      ) : null}
                      {typeof activeSighting.metadata?.truthValue === 'number' ? (
                        <span className="rounded border border-newspaper-border px-2 py-0.5">
                          Truth {Math.round(activeSighting.metadata.truthValue)}%
                        </span>
                      ) : null}
                      {typeof activeSighting.metadata?.bonusIP === 'number' ? (
                        <span className="rounded border border-dashed border-newspaper-border px-2 py-0.5">
                          Bonus IP +{activeSighting.metadata.bonusIP}
                        </span>
                      ) : null}
                      {activeSighting.metadata?.footageQuality ? (
                        <span className="rounded border border-newspaper-border px-2 py-0.5">
                          Footage: {activeSighting.metadata.footageQuality.toUpperCase()}
                        </span>
                      ) : null}
                    </div>
                    {activeSighting.metadata?.setList?.length ? (
                      <div className="rounded border border-dashed border-newspaper-border/60 bg-white/60 p-2 text-[10px] uppercase tracking-wide text-newspaper-text/70">
                        {activeSighting.metadata.setList.join(' • ')}
                      </div>
                    ) : null}
                    {activeSighting.category === 'hotspot' ? (
                      <div className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/70">
                        {typeof activeSighting.metadata?.defenseBoost === 'number' ? (
                          <span>DEF +{activeSighting.metadata.defenseBoost}</span>
                        ) : null}
                        {typeof activeSighting.metadata?.truthReward === 'number' ? (
                          <span>TRUTH ±{activeSighting.metadata.truthReward}%</span>
                        ) : null}
                        {activeSighting.metadata?.source ? (
                          <span>Source {activeSighting.metadata.source.toUpperCase()}</span>
                        ) : null}
                        {typeof activeSighting.metadata?.turnsRemaining === 'number' ? (
                          <span>Turns Left {Math.max(0, activeSighting.metadata.turnsRemaining)}</span>
                        ) : null}
                        {activeSighting.metadata?.outcome ? (
                          <span className="col-span-2">
                            Status {activeSighting.metadata.outcome.toUpperCase()}
                            {typeof activeSighting.metadata.truthDelta === 'number' && activeSighting.metadata.truthDelta !== 0
                              ? ` (${activeSighting.metadata.truthDelta > 0 ? '+' : ''}${activeSighting.metadata.truthDelta}% Truth)`
                              : ''}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs italic text-newspaper-text/60">No paranormal activity logged this round.</p>
                )}

                {supplementalSightings.length ? (
                  <div className="mt-3 space-y-2 text-xs text-newspaper-text/70">
                    {supplementalSightings.slice(0, 4).map(sighting => (
                      <button
                        key={sighting.id}
                        type="button"
                        onClick={() => handleSightingSelect(sighting.id)}
                        className={`w-full rounded border border-dashed border-newspaper-border/60 bg-white/40 px-3 py-2 text-left transition ${
                          activeSighting?.id === sighting.id
                            ? 'sighting-highlight'
                            : 'hover:bg-white/70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide">
                          <span className="inline-flex items-center gap-1">
                            <span aria-hidden="true">{SIGHTING_ICONS[sighting.category]}</span>
                            {SIGHTING_LABELS[sighting.category]}
                          </span>
                          <span>{formatSightingTime(sighting.timestamp)}</span>
                        </div>
                        <p className="font-semibold leading-snug text-newspaper-text">{sighting.headline}</p>
                        <p className="text-[11px] italic text-newspaper-text/60">{sighting.subtext}</p>
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>
              {oppositionStories.length ? (
                <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-wide">Opposition Moves</h3>
                  <div className="space-y-3 text-sm">
                    {oppositionStories.map(story => (
                      <div key={story.id} className="border-b border-dashed border-newspaper-border/60 pb-2 last:border-0 last:pb-0">
                        <div className="flex gap-3 items-start">
                          {story.cardId ? (
                            <CardImage
                              cardId={story.cardId}
                              className="h-16 w-16 flex-shrink-0 rounded border border-newspaper-border/60 bg-newspaper-header/20"
                            />
                          ) : (
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border border-dashed border-newspaper-border/60 bg-newspaper-header/10 text-[10px] font-semibold uppercase tracking-wide text-newspaper-text/40">
                              No Art
                            </div>
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-newspaper-text/60">
                              <span>{story.typeLabel}</span>
                              {story.truthDeltaLabel ? <span>{story.truthDeltaLabel}</span> : null}
                            </div>
                            <p className="font-semibold leading-snug">{story.headline}</p>
                            <p className="text-xs italic text-newspaper-text/70">{story.subhead}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {eventStories.length ? (
                <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-secret-red">Event Wire</h3>
                  <div className="space-y-3 text-sm text-secret-red/90">
                    {eventStories.slice(0, 3).map(story => (
                      <div key={story.id} className="border-b border-dashed border-newspaper-border/60 pb-2 last:border-0 last:pb-0">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-secret-red/80">{story.typeLabel}</div>
                        <p className="font-semibold leading-snug text-secret-red">{story.headline}</p>
                        <p className="text-xs italic text-secret-red/80">{story.subhead}</p>
                        {formatChance(story.triggerChance) || formatChance(story.conditionalChance) ? (
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-secret-red/70">
                            {formatChance(story.triggerChance) ? (
                              <span>Chance This Turn: {formatChance(story.triggerChance)}</span>
                            ) : null}
                            {formatChance(story.triggerChance) && formatChance(story.conditionalChance) ? (
                              <span> · </span>
                            ) : null}
                            {formatChance(story.conditionalChance) ? (
                              <span>If Triggered: {formatChance(story.conditionalChance)}</span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </aside>
          </div>

          {secondaryStories.length ? (
            <section className="mt-6 space-y-4 rounded-md border border-newspaper-border bg-white/70 p-6 shadow-sm">
              <h3 className="text-lg font-black uppercase tracking-wide">Secondary Reports</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {secondaryStories.map(story => {
                  const isCard = story.kind === 'card';
                  return (
                    <article key={story.id} className="space-y-2 border-b border-dashed border-newspaper-border/60 pb-3 last:border-0 last:pb-0">
                      <div
                        className={`flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide ${
                          isCard ? 'text-newspaper-text/60' : 'text-secret-red/80'
                        }`}
                      >
                        <span className={isCard ? '' : 'text-secret-red'}>{story.typeLabel}</span>
                        {isCard ? (
                          <span>{story.player === 'ai' ? 'Opposition' : 'Dispatch'}</span>
                        ) : (
                          <span className="text-secret-red">Event</span>
                        )}
                      </div>
                      <h4
                        className={`text-lg font-semibold leading-snug ${
                          isCard ? '' : 'text-secret-red'
                        }`}
                      >
                        {story.headline}
                      </h4>
                      <p
                        className={`text-xs italic ${
                          isCard ? 'text-newspaper-text/70' : 'text-secret-red/80'
                        }`}
                      >
                        {story.subhead}
                      </p>
                      <p
                        className={`text-sm leading-relaxed ${
                          isCard ? 'text-newspaper-text/80' : 'text-secret-red/90'
                        }`}
                      >
                        {story.summary}
                      </p>
                      {!isCard && (formatChance(story.triggerChance) || formatChance(story.conditionalChance)) ? (
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-secret-red/80">
                          {formatChance(story.triggerChance) ? (
                            <span>Chance This Turn: {formatChance(story.triggerChance)}</span>
                          ) : null}
                          {formatChance(story.triggerChance) && formatChance(story.conditionalChance) ? (
                            <span> · </span>
                          ) : null}
                          {formatChance(story.conditionalChance) ? (
                            <span>If Triggered: {formatChance(story.conditionalChance)}</span>
                          ) : null}
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/60">
                        {isCard && story.truthDeltaLabel ? (
                          <span className="rounded border border-newspaper-border px-2 py-0.5">{story.truthDeltaLabel}</span>
                        ) : null}
                        {isCard && story.stateLabel ? (
                          <span className="rounded border border-dashed border-newspaper-border px-2 py-0.5">{story.stateLabel}</span>
                        ) : null}
                        {isCard && story.capturedStates?.length ? (
                          <span className="rounded border border-newspaper-border px-2 py-0.5">Captured: {story.capturedStates.join(', ')}</span>
                        ) : null}
                        {isCard && story.tags?.length ? (
                          <span className="rounded border border-newspaper-border px-2 py-0.5">{story.tags.slice(0, 2).join(' • ')}</span>
                        ) : null}
                      </div>
                      {isCard && story.artHint ? (
                        <p className="text-[10px] italic text-newspaper-text/50">Art hint: {story.artHint}</p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section className="mt-6 space-y-4">
            <h3 className="text-lg font-black uppercase tracking-wide">Sponsored Messages</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ads.map((ad, index) => (
                <div
                  key={`${ad}-${index}`}
                  className="rounded border border-newspaper-border bg-white/80 px-3 py-4 text-center text-sm font-semibold uppercase tracking-wide text-newspaper-text shadow-sm"
                >
                  {ad}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-newspaper-border bg-white/75 p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-black uppercase tracking-wide">Conspiracy Corner</h3>
              <ul className="space-y-2 text-sm leading-relaxed">
                {conspiracies.map((item, index) => (
                  <li key={`${item}-${index}`} className="before:mr-2 before:text-newspaper-text before:content-['•']">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-md border border-newspaper-border bg-white/75 p-5 shadow-sm">
                <h3 className="mb-2 text-lg font-black uppercase tracking-wide">Weather Desk</h3>
                <p className="text-sm leading-relaxed">{weatherLine}</p>
              </div>
              <div className="rounded-md border border-dashed border-newspaper-border bg-white/60 p-4 text-xs font-semibold uppercase tracking-[0.3em] text-newspaper-text/70">
                <span className="redaction px-1">EYES ONLY</span> Distribution strictly need-to-know. Archive copy stored in vault.
              </div>
            </div>
          </section>
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
