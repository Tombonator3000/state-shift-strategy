import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Card as UICard } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CardImage from '@/components/game/CardImage';
import { loadNewspaperData, pick, shuffle, type NewspaperData } from '@/lib/newspaperData';
import { makeBody, makeHeadline, makeSubhead, shouldStampBreaking, type RoundContext } from '@/features/newspaper/generate';
import type { TabloidNewspaperProps, TabloidPlayedCard } from './TabloidNewspaperLegacy';
import type { Card } from '@/types';
import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import { formatComboReward, getLastComboSummary } from '@/game/comboEngine';
import { buildRoundContext, formatTruthDelta } from './tabloidRoundUtils';

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

const formatTarget = (entry: TabloidPlayedCard): string | null => {
  if (entry.card.type !== 'ZONE') {
    return null;
  }

  const target = entry.targetState;
  if (!target) {
    return null;
  }

  const stateById = getStateById(target);
  const stateByAbbr = getStateByAbbreviation(target.toUpperCase());
  const name = stateById?.name ?? stateByAbbr?.name ?? target;
  return `Target: ${name}`;
};

const computeEventTruthDelta = (events: TabloidNewspaperProps['events']): number => {
  return events.reduce((sum, event) => {
    const delta = (event.effects?.truth ?? 0) + (event.effects?.truthChange ?? 0);
    return sum + delta;
  }, 0);
};

const createSecondaryStory = (
  entry: TabloidPlayedCard,
  data: NewspaperData,
): {
  id: string;
  cardId: string;
  headline: string;
  subhead: string;
  summary: string;
  typeLabel: string;
  player: 'human' | 'ai';
  truthDeltaLabel: string | null;
  targetLabel: string | null;
  capturedStates: string[];
} => {
  const headline = makeHeadline(entry.card as Card, data);
  const subhead = makeSubhead(entry.card as Card, data);
  const body = makeBody(entry.card as Card, data);
  const summary = body.split('\n\n')[0];
  const truthDeltaLabel = formatTruthDelta(entry.truthDelta);
  const targetLabel = formatTarget(entry);
  return {
    id: entry.card.id,
    cardId: entry.card.id,
    headline,
    subhead,
    summary,
    typeLabel: `[${entry.card.type}]`,
    player: entry.player,
    truthDeltaLabel,
    targetLabel,
    capturedStates: entry.capturedStates ?? [],
  };
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
} => {
  const baseHeadline = (event.headline ?? event.title).toUpperCase();
  const effectsLabel = formatEventEffects(event.effects);
  const headline = effectsLabel ? `${baseHeadline} (${effectsLabel})` : baseHeadline;
  const summary = event.content;
  const subhead = event.flavorText ?? event.flavorTruth ?? event.flavorGov ?? 'Officials decline additional comment.';
  return {
    id: event.id,
    headline,
    subhead,
    summary,
    typeLabel: `[${event.type.toUpperCase()}]`,
  };
};

type SecondaryCardStory = ReturnType<typeof createSecondaryStory>;
type SecondaryStory = SecondaryCardStory | ReturnType<typeof createEventStory>;

const isCardStory = (story: SecondaryStory): story is SecondaryCardStory => 'player' in story;

const TabloidNewspaperV2 = ({ events, playedCards, faction, truth, onClose }: TabloidNewspaperProps) => {
  const [data, setData] = useState<NewspaperData | null>(null);
  const [masthead, setMasthead] = useState('THE PARANOID TIMES');
  const [glitchText, setGlitchText] = useState<string | null>(null);

  const dataset = data ?? FALLBACK_DATA;

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

  const playerCards = useMemo(
    () => playedCards.filter(entry => entry.player === 'human'),
    [playedCards],
  );
  const opponentCards = useMemo(
    () => playedCards.filter(entry => entry.player === 'ai'),
    [playedCards],
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

  const heroCardEntry = useMemo(() => {
    const capture = playerCards.find(entry => (entry.capturedStates ?? []).length > 0);
    if (capture) {
      return capture;
    }
    const byTruth = [...playerCards].sort((a, b) => Math.abs((b.truthDelta ?? 0)) - Math.abs((a.truthDelta ?? 0)));
    if (byTruth.length > 0 && Math.abs(byTruth[0].truthDelta ?? 0) > 0) {
      return byTruth[0];
    }
    return playerCards[0] ?? null;
  }, [playerCards]);

  const eventsTruthDelta = useMemo(() => computeEventTruthDelta(events), [events]);
  const roundContext = useMemo(
    () => buildRoundContext(playerCards, opponentCards, eventsTruthDelta),
    [playerCards, opponentCards, eventsTruthDelta],
  );

  const heroEvent = heroCardEntry ? null : events[0];

  const heroHeadline = heroCardEntry
    ? makeHeadline(heroCardEntry.card as Card, dataset)
    : (() => {
        const base = (heroEvent?.headline ?? heroEvent?.title ?? 'UNIDENTIFIED INCIDENT').toUpperCase();
        if (!heroEvent) {
          return base;
        }
        const effectsLabel = formatEventEffects(heroEvent.effects);
        return effectsLabel ? `${base} (${effectsLabel})` : base;
      })();

  const heroSubhead = heroCardEntry
    ? makeSubhead(heroCardEntry.card as Card, dataset)
    : heroEvent?.content ?? 'Developing situation under intense scrutiny.';

  const heroBody = heroCardEntry
    ? makeBody(heroCardEntry.card as Card, dataset).split('\n\n')
    : [heroEvent?.content ?? 'Witness reports remain fragmentary; authorities maintain deliberate silence.'];

  const heroIsEvent = !heroCardEntry;
  const heroTypeLabel = heroCardEntry ? `[${heroCardEntry.card.type}]` : `[EVENT]`;
  const heroTarget = heroCardEntry ? formatTarget(heroCardEntry) : null;
  const heroCaptured = heroCardEntry?.capturedStates ?? [];

  const bylinePool = dataset.bylines && dataset.bylines.length ? dataset.bylines : FALLBACK_DATA.bylines;
  const sourcePool = dataset.sources && dataset.sources.length ? dataset.sources : FALLBACK_DATA.sources;
  const byline = pick(bylinePool, 'By: Anonymous Insider');
  const sourceLine = pick(sourcePool, 'Source: Redacted');
  const breakingStamp = shouldStampBreaking(roundContext)
    ? pick(dataset.stamps?.breaking ?? FALLBACK_DATA.stamps?.breaking ?? ['BREAKING'], 'BREAKING')
    : null;
  const classifiedStamp = useMemo(() => {
    if (Math.random() >= 0.3) {
      return null;
    }
    const pool = dataset.stamps?.classified ?? FALLBACK_DATA.stamps?.classified ?? ['CLASSIFIED'];
    return pick(pool, 'CLASSIFIED');
  }, [dataset]);

  const ads = useMemo(() => {
    const pool = dataset.ads ?? FALLBACK_DATA.ads;
    if (!pool.length) {
      return FALLBACK_DATA.ads;
    }
    const desired = pool.length < 3 ? pool.length : 3 + (Math.random() < 0.5 ? 0 : 1);
    return shuffle(pool).slice(0, desired);
  }, [dataset]);

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
  }, [dataset]);

  const weatherLine = pick(dataset.weather ?? FALLBACK_DATA.weather ?? [], 'Today: Classified Cloud Cover');

  const secondaryCardStories = useMemo(() => {
    const remaining = heroCardEntry ? playerCards.filter(entry => entry.card.id !== heroCardEntry.card.id) : playerCards;
    return remaining.map(entry => createSecondaryStory(entry, dataset));
  }, [heroCardEntry, playerCards, dataset]);

  const eventStories = useMemo(() => events.map(createEventStory), [events]);

  const secondaryStories = useMemo<SecondaryStory[]>(() => {
    if (secondaryCardStories.length >= 2) {
      return secondaryCardStories;
    }
    const needed = 2 - secondaryCardStories.length;
    return [...secondaryCardStories, ...eventStories.slice(0, needed)];
  }, [secondaryCardStories, eventStories]);

  const oppositionStories = useMemo(
    () => opponentCards.map(entry => createSecondaryStory(entry, dataset)),
    [opponentCards, dataset],
  );

  const displayMasthead = glitchText ?? masthead;
  const truthProgress = Math.max(0, Math.min(100, Math.round(truth)));
  const truthDeltaLabel = formatTruthDelta(roundContext.truthDeltaTotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <UICard className="ink-smudge relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden border-4 border-newspaper-border bg-newspaper-bg text-newspaper-text shadow-2xl">
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
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
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
                <span>Captured: {roundContext.capturedStates.length || '—'}</span>
                <span>Events: {events.length || '—'}</span>
                <span>
                  Clearance: <span className="redaction align-middle">CLASSIFIED</span>
                </span>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <article className="lg:col-span-2 space-y-4 rounded-md border border-newspaper-border bg-white/80 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-newspaper-text/70">
                <span className="rounded-full border border-newspaper-border px-2 py-1">{heroTypeLabel}</span>
                {heroTarget ? (
                  <span className="rounded-full border border-dashed border-newspaper-border px-2 py-1">{heroTarget}</span>
                ) : null}
              </div>
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
              <div className="relative overflow-hidden rounded-md border border-newspaper-border bg-newspaper-header/20">
                {heroCardEntry ? (
                  <CardImage cardId={heroCardEntry.card.id} className="h-52 w-full object-cover" />
                ) : (
                  <div className="flex h-52 items-center justify-center text-sm font-semibold uppercase tracking-wide text-newspaper-text/60">
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
                }`}
              >
                {heroBody.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              {heroCaptured.length ? (
                <div className="text-xs font-semibold uppercase tracking-wide text-newspaper-text/70">
                  Captured: {heroCaptured.join(', ')}
                </div>
              ) : null}
            </article>

            <aside className="space-y-4">
              {comboReport?.entries.length ? (
                <section className="rounded-md border border-newspaper-border bg-white/70 p-4 shadow-sm">
                  <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-newspaper-text">
                    Combo Dispatch
                  </h3>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-newspaper-text/60">
                    {comboOwnerLabel ? `${comboOwnerLabel} · ` : ''}Turn {comboReport.turn}
                  </div>
                  <div className="mt-2 space-y-3 text-sm">
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
                            <div className="text-[10px] uppercase tracking-wide text-newspaper-text/50">FX: {entry.fxText}</div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}
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
                {secondaryStories.map(story => (
                  <article key={story.id} className="space-y-2 border-b border-dashed border-newspaper-border/60 pb-3 last:border-0 last:pb-0">
                    <div
                      className={`flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide ${
                        isCardStory(story) ? 'text-newspaper-text/60' : 'text-secret-red/80'
                      }`}
                    >
                      <span className={isCardStory(story) ? '' : 'text-secret-red'}>{story.typeLabel}</span>
                      {isCardStory(story) ? (
                        <span>{story.player === 'ai' ? 'Opposition' : 'Dispatch'}</span>
                      ) : (
                        <span className="text-secret-red">Event</span>
                      )}
                    </div>
                    <h4
                      className={`text-lg font-semibold leading-snug ${
                        isCardStory(story) ? '' : 'text-secret-red'
                      }`}
                    >
                      {story.headline}
                    </h4>
                    <p
                      className={`text-xs italic ${
                        isCardStory(story) ? 'text-newspaper-text/70' : 'text-secret-red/80'
                      }`}
                    >
                      {story.subhead}
                    </p>
                    <p
                      className={`text-sm leading-relaxed ${
                        isCardStory(story) ? 'text-newspaper-text/80' : 'text-secret-red/90'
                      }`}
                    >
                      {story.summary}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-newspaper-text/60">
                      {isCardStory(story) && story.truthDeltaLabel ? (
                        <span className="rounded border border-newspaper-border px-2 py-0.5">Truth {story.truthDeltaLabel}</span>
                      ) : null}
                      {isCardStory(story) && story.targetLabel ? (
                        <span className="rounded border border-dashed border-newspaper-border px-2 py-0.5">{story.targetLabel}</span>
                      ) : null}
                      {isCardStory(story) && story.capturedStates?.length ? (
                        <span className="rounded border border-newspaper-border px-2 py-0.5">Captured: {story.capturedStates.join(', ')}</span>
                      ) : null}
                    </div>
                  </article>
                ))}
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
