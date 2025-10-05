import { formatComboReward } from '@/game/comboEngine';
import type { ComboSummary } from '@/game/combo.types';
import type { GameEvent } from '@/data/eventDatabase';
import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import type { CardPlayRecord, GameState } from '@/hooks/gameStateTypes';
import type { GameCard } from '@/rules/mvp';
import type { ArcProgressSummary } from '@/types/campaign';
import type { ParanormalSighting } from '@/types/paranormal';
import type {
  AgendaSummary,
  FinalEditionComboHighlight,
  FinalEditionEventHighlight,
  GameOverReport,
  ImpactType,
  MVPReport,
} from '@/types/finalEdition';

export const getFactionDisplayName = (faction: 'truth' | 'government'): string => {
  return faction === 'truth' ? 'Truth Network' : 'Shadow Government';
};

export const getOppositionDisplayName = (playerFaction: 'truth' | 'government'): string => {
  return getFactionDisplayName(playerFaction === 'truth' ? 'government' : 'truth');
};

export const getVictoryConditionLabel = (
  victoryType: GameOverReport['victoryType'],
): string => {
  switch (victoryType) {
    case 'truth':
      return 'Truth Threshold';
    case 'states':
      return 'State Sweep';
    case 'ip':
      return 'IP Race';
    case 'agenda':
      return 'Secret Agenda';
    case 'draw':
    default:
      return 'Final Edition';
  }
};

export const getPlayerOutcomeLabel = (
  report: GameOverReport,
): 'Victory' | 'Defeat' | 'Stalemate' => {
  if (report.winner === 'draw') {
    return 'Stalemate';
  }

  return report.winner === report.playerFaction ? 'Victory' : 'Defeat';
};

export const getOutcomeSummary = (report: GameOverReport): string => {
  if (report.winner === 'draw') {
    return 'Stalemate';
  }

  const victorLabel = getFactionDisplayName(report.winner);
  const condition = getVictoryConditionLabel(report.victoryType);
  return `${victorLabel} · ${condition}`;
};

const resolveStateName = (stateId: string): string => {
  const state = getStateById(stateId) ?? getStateByAbbreviation(stateId);
  return state?.name ?? stateId;
};

const computeEventScore = (event: GameEvent): number => {
  const effects = event.effects ?? {};
  const truthMagnitude = Math.abs(effects.truth ?? 0) + Math.abs(effects.truthChange ?? 0);
  const ipMagnitude = Math.abs(effects.ip ?? 0) + Math.abs(effects.ipChange ?? 0);
  const defenseMagnitude = Math.abs(effects.defenseChange ?? 0) + Math.abs(effects.stateEffects?.defense ?? 0);
  const rarityBoost = event.rarity === 'legendary'
    ? 3
    : event.rarity === 'rare'
      ? 2
      : event.rarity === 'uncommon'
        ? 1
        : 0;
  return truthMagnitude * 2 + ipMagnitude * 1.5 + defenseMagnitude + rarityBoost;
};

const summarizeEventForFinalEdition = (
  event: GameEvent,
  arcSummaries?: Record<string, ArcProgressSummary>,
): FinalEditionEventHighlight => {
  const headline = event.headline ?? event.title;
  const effects = event.effects ?? {};
  const truthDelta = (effects.truth ?? 0) + (effects.truthChange ?? 0);
  const ipDelta = (effects.ip ?? 0) + (effects.ipChange ?? 0);
  const stateName = effects.stateEffects?.stateId
    ? resolveStateName(effects.stateEffects.stateId)
    : undefined;

  const arcSummary = event.campaign ? arcSummaries?.[event.campaign.arcId] : undefined;
  const matchingArcSummary = arcSummary && event.campaign && arcSummary.chapter === event.campaign.chapter
    ? arcSummary
    : undefined;

  return {
    id: event.id,
    headline,
    summary: event.content,
    faction: event.faction ?? 'neutral',
    rarity: event.rarity,
    truthDelta,
    ipDelta,
    stateName,
    kicker: event.flavorText ?? event.flavorTruth ?? event.flavorGov ?? undefined,
    arcSummary: matchingArcSummary,
  } satisfies FinalEditionEventHighlight;
};

const pickTopEvents = (
  events: GameEvent[],
  limit = 3,
  arcSummaries?: Record<string, ArcProgressSummary>,
): FinalEditionEventHighlight[] => {
  return events
    .map(event => ({ event, score: computeEventScore(event) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => summarizeEventForFinalEdition(entry.event, arcSummaries));
};

const resolveComboOwnerLabel = (owner: string | undefined): string => {
  if (owner === 'P1') {
    return 'Operative Team';
  }
  if (owner === 'P2') {
    return 'Opposition Network';
  }
  return owner ?? 'Unknown Cell';
};

const buildComboHighlights = (
  summary: ComboSummary | null | undefined,
): FinalEditionComboHighlight[] => {
  if (!summary || !summary.results || summary.results.length === 0) {
    return [];
  }

  const ownerLabel = resolveComboOwnerLabel(summary.player);

  return summary.results.map(result => {
    const rewardLabel = formatComboReward(result.appliedReward, { faction: summary.playerFaction })
      .replace(/[()]/g, '')
      .trim();
    return {
      id: result.definition.id,
      name: result.definition.name ?? result.definition.id,
      rewardLabel: rewardLabel.length > 0 ? rewardLabel : 'Momentum Bonus',
      turn: summary.turn,
      ownerLabel,
      description: result.definition.description,
    } satisfies FinalEditionComboHighlight;
  });
};

const normalizeCardFaction = (faction: GameCard['faction']): 'truth' | 'government' => {
  const normalized = typeof faction === 'string' ? faction.toLowerCase() : '';
  return normalized.includes('government') ? 'government' : 'truth';
};

interface EnrichedPlay {
  play: CardPlayRecord;
  faction: 'truth' | 'government';
  captureCount: number;
  truthImpact: number;
  ipImpact: number;
  damageImpact: number;
  actorGain: number;
  opponentDrop: number;
}

const computePlayMetrics = (
  record: CardPlayRecord,
  faction: 'truth' | 'government',
): Pick<EnrichedPlay, 'captureCount' | 'truthImpact' | 'ipImpact' | 'damageImpact' | 'actorGain' | 'opponentDrop'> => {
  const captureCount = Array.isArray(record.capturedStates) ? record.capturedStates.length : 0;
  const truthDelta = typeof record.truthDelta === 'number' ? record.truthDelta : 0;
  const truthImpact = faction === 'truth'
    ? Math.max(0, truthDelta)
    : Math.max(0, -truthDelta);

  const ipDelta = typeof record.ipDelta === 'number' ? record.ipDelta : 0;
  const aiIpDelta = typeof record.aiIpDelta === 'number' ? record.aiIpDelta : 0;
  const actorGainRaw = record.player === 'human' ? ipDelta : aiIpDelta;
  const opponentDropRaw = record.player === 'human' ? -aiIpDelta : -ipDelta;
  const actorGain = actorGainRaw > 0 ? actorGainRaw : 0;
  const opponentDrop = opponentDropRaw > 0 ? opponentDropRaw : 0;
  const ipImpact = actorGain + opponentDrop;

  const damageImpact = Math.max(0, typeof record.damageDealt === 'number' ? record.damageDealt : 0);

  return { captureCount, truthImpact, ipImpact, damageImpact, actorGain, opponentDrop };
};

const inferFactionFromRecord = (
  record: CardPlayRecord,
  playerFaction: 'truth' | 'government',
): 'truth' | 'government' => {
  if (record.faction === 'truth' || record.faction === 'government') {
    return record.faction;
  }

  return record.player === 'human'
    ? playerFaction
    : playerFaction === 'truth'
      ? 'government'
      : 'truth';
};

const buildMvpHighlight = (candidate: EnrichedPlay, impactType: ImpactType, impactValue: number): string => {
  const { play, actorGain, opponentDrop, captureCount } = candidate;
  switch (impactType) {
    case 'capture': {
      if (captureCount <= 0) {
        return 'Stabilized territorial control at a critical moment.';
      }
      const capturedList = play.capturedStates?.length ? play.capturedStates.join(', ') : 'undisclosed locations';
      return `Secured ${captureCount} state${captureCount === 1 ? '' : 's'} (${capturedList}) in one sweep.`;
    }
    case 'truth': {
      const delta = Math.abs(play.truthDelta ?? 0);
      if (delta === 0) {
        return 'Neutralized a truth swing before it escalated.';
      }
      if (play.faction === 'government') {
        return play.truthDelta <= 0
          ? `Suppressed truth by ${delta}% to keep the narrative contained.`
          : `Twisted a ${delta}% truth surge into controlled propaganda.`;
      }
      return play.truthDelta >= 0
        ? `Raised national awareness by ${delta}% in a single broadcast.`
        : `Absorbed a ${delta}% misinformation hit and held the line.`;
    }
    case 'ip': {
      const fragments: string[] = [];
      if (actorGain > 0) {
        fragments.push(`Generated ${actorGain} IP`);
      }
      if (opponentDrop > 0) {
        fragments.push(`Siphoned ${opponentDrop} IP from the enemy`);
      }
      return fragments.length ? `${fragments.join(' & ')}.` : 'Shifted the resource war decisively.';
    }
    case 'damage':
      return impactValue > 0
        ? `Inflicted ${impactValue} direct damage to hostile operations.`
        : 'Shredded enemy defenses without breaking stride.';
    case 'support':
    default:
      return 'Delivered the clutch support play that sealed the deal.';
  }
};

const buildMvpReport = (candidate: EnrichedPlay, impactType: ImpactType, impactValue: number): MVPReport => {
  const { play } = candidate;
  const impactLabels: Record<ImpactType, string> = {
    capture: 'States Captured',
    truth: 'Truth Swing',
    ip: 'IP Swing',
    damage: 'Damage Dealt',
    support: 'Clutch Play',
  };

  return {
    cardId: play.card.id,
    cardName: play.card.name,
    player: play.player,
    faction: candidate.faction,
    truthDelta: play.truthDelta,
    ipDelta: play.ipDelta,
    aiIpDelta: play.aiIpDelta,
    capturedStates: play.capturedStates ?? [],
    damageDealt: play.damageDealt,
    round: play.round,
    turn: play.turn,
    impactType,
    impactValue,
    impactLabel: impactLabels[impactType],
    highlight: buildMvpHighlight(candidate, impactType, impactValue),
  };
};

const pickBestCandidate = (
  candidates: EnrichedPlay[],
  primary: keyof EnrichedPlay,
  secondary: Array<keyof EnrichedPlay>,
): EnrichedPlay | null => {
  const sorted = [...candidates].sort((a, b) => {
    const primaryDiff = (b[primary] as number) - (a[primary] as number);
    if (primaryDiff !== 0) {
      return primaryDiff;
    }
    for (const key of secondary) {
      const diff = (b[key] as number) - (a[key] as number);
      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  });
  return sorted[0] ?? null;
};

const findTopCandidate = (
  candidates: EnrichedPlay[],
): { candidate: EnrichedPlay; impactType: ImpactType; impactValue: number } | null => {
  if (candidates.length === 0) {
    return null;
  }

  const captureMax = Math.max(...candidates.map(entry => entry.captureCount), 0);
  if (captureMax > 0) {
    const captureCandidates = candidates.filter(entry => entry.captureCount === captureMax);
    const best = pickBestCandidate(captureCandidates, 'truthImpact', ['ipImpact', 'damageImpact']);
    if (best) {
      return { candidate: best, impactType: 'capture', impactValue: captureMax };
    }
  }

  const truthMax = Math.max(...candidates.map(entry => entry.truthImpact), 0);
  if (truthMax > 0) {
    const truthCandidates = candidates.filter(entry => entry.truthImpact === truthMax);
    const best = pickBestCandidate(truthCandidates, 'captureCount', ['ipImpact', 'damageImpact']);
    if (best) {
      return { candidate: best, impactType: 'truth', impactValue: truthMax };
    }
  }

  const ipMax = Math.max(...candidates.map(entry => entry.ipImpact), 0);
  if (ipMax > 0) {
    const ipCandidates = candidates.filter(entry => entry.ipImpact === ipMax);
    const best = pickBestCandidate(ipCandidates, 'captureCount', ['truthImpact', 'damageImpact']);
    if (best) {
      return { candidate: best, impactType: 'ip', impactValue: ipMax };
    }
  }

  const damageMax = Math.max(...candidates.map(entry => entry.damageImpact), 0);
  if (damageMax > 0) {
    const damageCandidates = candidates.filter(entry => entry.damageImpact === damageMax);
    const best = pickBestCandidate(damageCandidates, 'truthImpact', ['ipImpact', 'captureCount']);
    if (best) {
      return { candidate: best, impactType: 'damage', impactValue: damageMax };
    }
  }

  const fallback = pickBestCandidate(candidates, 'captureCount', ['truthImpact', 'ipImpact', 'damageImpact']);
  return fallback ? { candidate: fallback, impactType: 'support', impactValue: 0 } : null;
};

const determineTopPlays = (
  history: CardPlayRecord[],
  winner: 'truth' | 'government' | 'draw' | null,
  playerFaction: 'truth' | 'government',
): { mvp: MVPReport | null; runnerUp: MVPReport | null } => {
  if (!winner || winner === 'draw' || history.length === 0) {
    return { mvp: null, runnerUp: null };
  }

  const enrichedPlays: EnrichedPlay[] = history
    .map(play => {
      const faction = inferFactionFromRecord(play, playerFaction);
      const metrics = computePlayMetrics(play, faction);
      return { play, faction, ...metrics };
    })
    .filter(entry => entry.faction === winner);

  if (enrichedPlays.length === 0) {
    return { mvp: null, runnerUp: null };
  }

  const primary = findTopCandidate(enrichedPlays);
  if (!primary) {
    return { mvp: null, runnerUp: null };
  }

  const mvp = buildMvpReport(primary.candidate, primary.impactType, primary.impactValue);

  const remaining = enrichedPlays.filter(entry => entry !== primary.candidate);
  const secondary = findTopCandidate(remaining);
  const runnerUp = secondary
    ? buildMvpReport(secondary.candidate, secondary.impactType, secondary.impactValue)
    : null;

  return { mvp, runnerUp };
};

const summarizeAgenda = (
  source?: GameState['secretAgenda'],
): AgendaSummary | undefined => {
  if (!source) {
    return undefined;
  }

  return {
    title: source.title,
    headline: source.headline,
    operationName: source.operationName,
    issueTheme: source.issueTheme,
    pullQuote: source.pullQuote,
    artCue: source.artCue
      ? { icon: source.artCue.icon, alt: source.artCue.alt }
      : undefined,
    faction: source.faction,
    progress: source.progress,
    target: source.target,
    completed: source.completed,
    revealed: source.revealed,
  } satisfies AgendaSummary;
};

export interface BuildFinalEditionOptions {
  state: Pick<
    GameState,
    'round' | 'truth' | 'ip' | 'aiIP' | 'states' | 'faction' | 'playHistory' | 'extraExtraFeed'
  > & {
    currentEvents?: GameEvent[];
  };
  winner: 'truth' | 'government' | 'draw';
  victoryType: GameOverReport['victoryType'];
  playerSecretAgenda?: GameState['secretAgenda'];
  aiSecretAgenda?: GameState['aiSecretAgenda'];
  arcSummaries?: Record<string, ArcProgressSummary>;
  paranormalSightings?: ParanormalSighting[];
  comboSummary?: ComboSummary | null;
  recordedAt?: number;
}

export const buildFinalEdition = ({
  state,
  winner,
  victoryType,
  playerSecretAgenda,
  aiSecretAgenda,
  arcSummaries,
  paranormalSightings = [],
  comboSummary,
  recordedAt,
}: BuildFinalEditionOptions): GameOverReport => {
  const { mvp, runnerUp } = determineTopPlays(state.playHistory, winner, state.faction);
  const legendaryUsed = Array.from(new Set(
    state.playHistory
      .filter(entry => entry.card.rarity === 'legendary')
      .map(entry => entry.card.name),
  ));
  const topEvents = pickTopEvents(state.currentEvents ?? [], 4, arcSummaries);
  const comboHighlights = buildComboHighlights(comboSummary);
  const timestamp = recordedAt ?? Date.now();

  const playerStatesOwned = state.states.filter(
    s => s.owner === (state.faction === 'government' ? 'player' : 'ai'),
  ).length;
  const aiStatesOwned = state.states.filter(
    s => s.owner === (state.faction === 'truth' ? 'player' : 'ai'),
  ).length;

  return {
    winner,
    victoryType,
    rounds: state.round,
    finalTruth: Math.round(state.truth),
    ipPlayer: state.ip,
    ipAI: state.aiIP,
    statesGov: playerStatesOwned,
    statesTruth: aiStatesOwned,
    playerFaction: state.faction,
    playerSecretAgenda: summarizeAgenda(playerSecretAgenda),
    aiSecretAgenda: summarizeAgenda(aiSecretAgenda),
    mvp,
    runnerUp,
    legendaryUsed,
    topEvents,
    comboHighlights,
    sightings: [...paranormalSightings],
    extraExtraFeed: [...state.extraExtraFeed],
    recordedAt: timestamp,
  };
};
