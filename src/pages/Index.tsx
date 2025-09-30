import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EnhancedUSAMap from '@/components/game/EnhancedUSAMap';
import EnhancedGameHand from '@/components/game/EnhancedGameHand';
import PlayedCardsDock from '@/components/game/PlayedCardsDock';
import CardDetailOverlay from '@/components/game/CardDetailOverlay';
import TabloidNewspaper from '@/components/game/TabloidNewspaper';
import GameMenu from '@/components/game/GameMenu';
import SecretAgenda from '@/components/game/SecretAgenda';
import AIStatus from '@/components/game/AIStatus';
import EnhancedBalancingDashboard from '@/components/game/EnhancedBalancingDashboard';
import Options from '@/components/game/Options';
import { useGameState } from '@/hooks/useGameState';
import { useAudioContext } from '@/contexts/AudioContext';
import { useCardAnimation } from '@/hooks/useCardAnimation';
import CardAnimationLayer from '@/components/game/CardAnimationLayer';
import FloatingNumbers from '@/components/effects/FloatingNumbers';
import TabloidVictoryScreen from '@/components/effects/TabloidVictoryScreen';

import CardPreviewOverlay from '@/components/game/CardPreviewOverlay';
import ContextualHelp from '@/components/game/ContextualHelp';
import InteractiveOnboarding from '@/components/game/InteractiveOnboarding';
import MechanicsTooltip from '@/components/game/MechanicsTooltip';
import PlayerHubOverlay, { type PlayerStateIntel } from '@/components/game/PlayerHubOverlay';
import NewCardsPresentation from '@/components/game/NewCardsPresentation';
import { Maximize, Menu, Minimize, UserCircle2 } from 'lucide-react';
import { useCardCollection } from '@/hooks/useCardCollection';
import { useSynergyDetection } from '@/hooks/useSynergyDetection';
import {
  aggregateStateCombinationEffects,
  applyDefenseBonusToStates,
  createDefaultCombinationEffects,
} from '@/data/stateCombinations';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';
import ExtraEditionNewspaper from '@/components/game/ExtraEditionNewspaper';
import InGameOptions from '@/components/game/InGameOptions';
import EnhancedNewspaper from '@/components/game/EnhancedNewspaper';
import MinimizedHand from '@/components/game/MinimizedHand';
import { VictoryConditions } from '@/components/game/VictoryConditions';
import toast, { Toaster } from 'react-hot-toast';
import type { ActiveParanormalHotspot, CardPlayRecord } from '@/hooks/gameStateTypes';
import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import type { ParanormalSighting } from '@/types/paranormal';
import { areParanormalEffectsEnabled } from '@/state/settings';
import type { GameCard } from '@/rules/mvp';
import type { GameEvent } from '@/data/eventDatabase';
import { EVENT_DATABASE } from '@/data/eventDatabase';
import { formatComboReward, getLastComboSummary } from '@/game/comboEngine';
import { usePressArchive } from '@/hooks/usePressArchive';
import { useIntelArchive } from '@/hooks/useIntelArchive';
import type { IntelArchiveDraft } from '@/hooks/useIntelArchive';
import type {
  AgendaSummary,
  ImpactType,
  MVPReport,
  GameOverReport,
  FinalEditionComboHighlight,
  FinalEditionEventHighlight,
} from '@/types/finalEdition';

type ContextualEffectType = Parameters<typeof VisualEffectsCoordinator.triggerContextualEffect>[0];

type ObjectiveSectionId = 'victory' | 'secret-agenda';

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

const SYNERGY_SIGHTING_TAGLINES = [
  'Operators swear sparks of +{BONUS} IP rained across the ops deck.',
  'Combo uplink redlined at +{BONUS} IP before stabilizers kicked in.',
  'Witnesses report neon corkboard materializing with +{BONUS} IP scribbles.',
  'Analytics desk logged a phantom +{BONUS} IP surge and a chorus of high-fives.',
];

const HOTSPOT_SPAWN_TAGLINES = [
  '{STATE} skies glow as defenses spike +{DEFENSE}. Command races for ±{TRUTH}% truth swing.',
  'Field agents erect ecto-barriers in {STATE}. Whoever breaches first claims ±{TRUTH}% truth.',
  'Spectral alarm: {STATE} grid hardens by +{DEFENSE}. News desk calls a hotspot scramble!',
];

const HOTSPOT_RESOLUTION_TAGLINES = [
  '{STATE} anomaly captured—truth meter jolts {TRUTH_DELTA}%.',
  'Task force secures {STATE} hotspot and rewrites the narrative {TRUTH_DELTA}% in their favor.',
  'Hotspot lockdown lifted in {STATE}; truth sensors register {TRUTH_DELTA}% swing.',
];

const HOTSPOT_EXPIRE_TAGLINES = [
  'Unstable portal in {STATE} flickers out before capture. Defenses normalize.',
  '{STATE} anomaly dissipates quietly—no faction claims the truth swing.',
  'Hotspot haze clears over {STATE}; analysts log a null capture.',
];

const BROADCAST_SIGHTING_TAGLINES = [
  'Emergency feed hijacked by "{TRACK}"—intensity now at {INTENSITY}.',
  'Viewers report tractor beams spelling out {INTENSITY} across the skyline.',
  'Studio monitors loop Elvis crooning "{TRACK}" while truth hits {INTENSITY}.',
  'Control room claims UFO spotlight synced perfectly to "{TRACK}".',
];

const CRYPTID_SIGHTING_TAGLINES = [
  'Trail cam caught a hulking blur—classified as {QUALITY} evidence.',
  'Footprint sensors lit up; agents dispatched toward {LOCATION}.',
  'Local ham radio crackled: "Bigfoot just photobombed our {QUALITY} feed."',
  'Thermal scanners near {LOCATION} pegged a 9-foot anomaly.',
];

const fillTemplate = (template: string, replacements: Record<string, string | number>): string => {
  return template.replace(/\{(\w+)\}/g, (_match, key) => {
    const replacement = replacements[key];
    return replacement !== undefined ? String(replacement) : '';
  });
};

const resolveStateName = (stateId: string): string => {
  const normalized = stateId.toUpperCase();
  const byId = getStateById(stateId);
  if (byId?.name) {
    return byId.name;
  }
  const byAbbr = getStateByAbbreviation(normalized);
  if (byAbbr?.name) {
    return byAbbr.name;
  }
  return stateId;
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

const summarizeEventForFinalEdition = (event: GameEvent): FinalEditionEventHighlight => {
  const headline = event.headline ?? event.title;
  const effects = event.effects ?? {};
  const truthDelta = (effects.truth ?? 0) + (effects.truthChange ?? 0);
  const ipDelta = (effects.ip ?? 0) + (effects.ipChange ?? 0);
  const stateName = effects.stateEffects?.stateId
    ? resolveStateName(effects.stateEffects.stateId)
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
  } satisfies FinalEditionEventHighlight;
};

const pickTopEvents = (events: GameEvent[], limit = 3): FinalEditionEventHighlight[] => {
  return events
    .map(event => ({ event, score: computeEventScore(event) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => summarizeEventForFinalEdition(entry.event));
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
  summary: ReturnType<typeof getLastComboSummary>,
): FinalEditionComboHighlight[] => {
  if (!summary || !summary.results || summary.results.length === 0) {
    return [];
  }

  const ownerLabel = resolveComboOwnerLabel(summary.player);

  return summary.results.map(result => {
    const rewardLabel = formatComboReward(result.appliedReward).replace(/[()]/g, '').trim();
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

const normalizeCardFaction = (faction: GameCard['faction']): 'truth' | 'government' => {
  const normalized = typeof faction === 'string' ? faction.toLowerCase() : '';
  return normalized.includes('government') ? 'government' : 'truth';
};

const determineCardContextualEffect = (card: GameCard): ContextualEffectType | null => {
  const faction = normalizeCardFaction(card.faction);
  const type = card.type;
  const truthDelta = typeof (card.effects as { truthDelta?: number } | undefined)?.truthDelta === 'number'
    ? (card.effects as { truthDelta?: number }).truthDelta
    : null;

  if (truthDelta !== null && truthDelta !== 0) {
    return truthDelta > 0 ? 'media_blast' : 'government_crackdown';
  }

  if (type === 'MEDIA') {
    return faction === 'truth' ? 'media_blast' : 'government_crackdown';
  }

  if (type === 'ATTACK') {
    return faction === 'truth' ? 'conspiracy_revealed' : 'government_crackdown';
  }

  if (type === 'ZONE') {
    return faction === 'truth' ? 'evidence_leaked' : 'surveillance_detected';
  }

  if ((card.effects as { ipDelta?: { opponent?: number } } | undefined)?.ipDelta?.opponent) {
    return faction === 'truth' ? 'conspiracy_revealed' : 'government_crackdown';
  }

  return faction === 'truth' ? 'media_blast' : 'government_crackdown';
};

const determineStateEventContext = (eventType?: string): ContextualEffectType | null => {
  const normalized = typeof eventType === 'string' ? eventType.toLowerCase() : '';
  switch (normalized) {
    case 'truth':
    case 'opportunity':
      return 'evidence_leaked';
    case 'conspiracy':
      return 'conspiracy_revealed';
    case 'government':
    case 'crisis':
    case 'capture':
      return 'government_crackdown';
    case 'random':
      return 'media_blast';
    default:
      return null;
  }
};

const determineTruthBroadcastContext = (
  intensity: 'surge' | 'collapse',
  source?: 'truth' | 'government',
): ContextualEffectType => {
  if (intensity === 'surge') {
    return 'media_blast';
  }

  if (source === 'truth') {
    return 'surveillance_detected';
  }

  return 'government_crackdown';
};

const pickBestCandidate = (
  candidates: EnrichedPlay[],
  primary: keyof Pick<EnrichedPlay, 'captureCount' | 'truthImpact' | 'ipImpact' | 'damageImpact'>,
  fallbacks: Array<keyof Pick<EnrichedPlay, 'captureCount' | 'truthImpact' | 'ipImpact' | 'damageImpact'>>,
): EnrichedPlay | null => {
  return candidates.reduce<EnrichedPlay | null>((best, current) => {
    if (!best) {
      return current;
    }

    if (current[primary] > best[primary]) {
      return current;
    }
    if (current[primary] < best[primary]) {
      return best;
    }

    for (const metric of fallbacks) {
      if (current[metric] > best[metric]) {
        return current;
      }
      if (current[metric] < best[metric]) {
        return best;
      }
    }

    const currentTimestamp = current.play.timestamp ?? 0;
    const bestTimestamp = best.play.timestamp ?? 0;
    if (currentTimestamp !== bestTimestamp) {
      return currentTimestamp > bestTimestamp ? current : best;
    }

    const currentRound = current.play.round ?? 0;
    const bestRound = best.play.round ?? 0;
    if (currentRound !== bestRound) {
      return currentRound > bestRound ? current : best;
    }

    const currentTurn = current.play.turn ?? 0;
    const bestTurn = best.play.turn ?? 0;
    return currentTurn >= bestTurn ? current : best;
  }, null);
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

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBalancing, setShowBalancing] = useState(false);
  const [balancingInitialView, setBalancingInitialView] = useState<'analysis' | 'dev-tools'>('analysis');
  const [showPlayerHub, setShowPlayerHub] = useState(false);
  const [playerHubSource, setPlayerHubSource] = useState<'menu' | 'game'>('menu');
  const [lastSelectedFaction, setLastSelectedFaction] = useState<'truth' | 'government'>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('shadowgov-last-faction');
      if (stored === 'truth' || stored === 'government') {
        return stored;
      }
    }

    return 'government';
  });
  const [loadingCard, setLoadingCard] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState('Truth Seeker Operative');
  
  // Visual effects state
  const [floatingNumbers, setFloatingNumbers] = useState<{ 
    value: number; 
    type: 'ip' | 'truth' | 'damage' | 'synergy' | 'combo' | 'chain';
    x?: number;
    y?: number;
  } | null>(null);
  const [previousPhase, setPreviousPhase] = useState('');
  const [hoveredCard, setHoveredCard] = useState<GameCard | null>(null);
  const [victoryState, setVictoryState] = useState<{ isVictory: boolean; type: 'states' | 'ip' | 'truth' | 'agenda' | null }>({ isVictory: false, type: null });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInGameOptions, setShowInGameOptions] = useState(false);
  const [finalEdition, setFinalEdition] = useState<GameOverReport | null>(null);
  const [readingEdition, setReadingEdition] = useState<GameOverReport | null>(null);
  const [showExtraEdition, setShowExtraEdition] = useState(false);
  const [isEndingTurn, setIsEndingTurn] = useState(false);
  const [paranormalSightings, setParanormalSightings] = useState<ParanormalSighting[]>([]);
  const [inspectedPlayedCard, setInspectedPlayedCard] = useState<GameCard | null>(null);

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeObjectivePanel, setActiveObjectivePanel] = useState<ObjectiveSectionId>('victory');
  
  const {
    gameState,
    initGame,
    playCard,
    playCardAnimated,
    selectCard,
    selectTargetState,
    endTurn,
    closeNewspaper,
    executeAITurn,
    confirmNewCards,
    setGameState,
    saveGame,
    loadGame,
    getSaveInfo,
    registerParanormalSighting,
  } = useGameState();
  const audio = useAudioContext();
  const { animatePlayCard, isAnimating } = useCardAnimation();
  const { discoverCard, playCard: recordCardPlay } = useCardCollection();
  const { checkSynergies, getActiveCombinations, getTotalBonusIP } = useSynergyDetection();
  const { issues: pressArchive, archiveEdition, removeEditionFromArchive } = usePressArchive();
  const {
    entries: intelArchiveEntries,
    archiveIntelEvents,
    removeIntelFromArchive,
    clearArchive: clearIntelArchive,
  } = useIntelArchive();

  const persistFaction = useCallback((faction: 'truth' | 'government') => {
    setLastSelectedFaction(faction);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('shadowgov-last-faction', faction);
    }
  }, []);

  const executeAITurnRef = useRef(executeAITurn);
  useEffect(() => {
    executeAITurnRef.current = executeAITurn;
  }, [executeAITurn]);

  const isEditionArchived = useCallback(
    (edition: GameOverReport | null) => {
      if (!edition) {
        return false;
      }
      const id = `edition-${edition.recordedAt}`;
      return pressArchive.some(entry => entry.id === id);
    },
    [pressArchive],
  );

  const archiveEditionWithToast = useCallback(
    (edition: GameOverReport | null) => {
      if (!edition) {
        return;
      }
      if (isEditionArchived(edition)) {
        toast('Edition already in archive', {
          style: { background: '#0f172a', color: '#bbf7d0', border: '1px solid #10b981' },
        });
        return;
      }
      archiveEdition(edition);
      toast.success('Final newspaper archived to Player Hub', {
        style: { background: '#0f172a', color: '#bbf7d0', border: '1px solid #10b981' },
      });
    },
    [archiveEdition, isEditionArchived],
  );

  const pushSighting = useCallback((entry: ParanormalSighting) => {
    setParanormalSightings(prev => {
      const merged = [...prev, entry];
      const MAX_ENTRIES = 12;
      return merged.length > MAX_ENTRIES ? merged.slice(merged.length - MAX_ENTRIES) : merged;
    });
    registerParanormalSighting(entry.metadata?.source ?? undefined);
  }, [registerParanormalSighting]);

  const hotspotHistoryRef = useRef<Record<string, ActiveParanormalHotspot>>({});
  const activeHotspotByStateRef = useRef<Record<string, ActiveParanormalHotspot>>({});
  const hotspotLogCursorRef = useRef<number>(0);
  const hotspotLogInitializedRef = useRef<boolean>(false);
  const archivedIntelIdsRef = useRef<Set<string>>(new Set());

  const stateLookupByName = useMemo(() => {
    const lookup = new Map<string, (typeof gameState.states)[number]>();
    gameState.states.forEach(state => {
      lookup.set(state.name, state);
      lookup.set(state.abbreviation, state);
    });
    return lookup;
  }, [gameState.states]);

  const eventLookup = useMemo(() => {
    const lookup = new Map<string, GameEvent>();
    EVENT_DATABASE.forEach(event => {
      if (event && typeof event.id === 'string') {
        lookup.set(event.id, event);
      }
    });
    return lookup;
  }, []);

  const playerHubStateIntel = useMemo<PlayerStateIntel>(() => {
    const states = Array.isArray(gameState.states) ? gameState.states : [];
    const totals = states.reduce(
      (acc, state) => {
        if (state.owner === 'player') {
          acc.player += 1;
        } else if (state.owner === 'ai') {
          acc.ai += 1;
        } else {
          acc.neutral += 1;
        }
        if (state.contested) {
          acc.contested += 1;
        }
        return acc;
      },
      { player: 0, ai: 0, neutral: 0, contested: 0 },
    );

    const statesIntel: PlayerStateIntel['states'] = states.map(state => ({
      id: state.id,
      name: state.name,
      abbreviation: state.abbreviation,
      owner: state.owner,
      contested: state.contested,
      pressure: state.pressure ?? 0,
      defense: state.defense ?? 0,
      pressurePlayer: state.pressurePlayer ?? 0,
      pressureAi: state.pressureAi ?? 0,
      stateEventHistory: Array.isArray(state.stateEventHistory) ? [...state.stateEventHistory] : [],
    }));

    const fullEventHistory: PlayerStateIntel['eventHistory'] = statesIntel
      .flatMap(state =>
        state.stateEventHistory.map(event => ({
          stateId: state.id,
          stateName: state.name,
          abbreviation: state.abbreviation,
          owner: state.owner,
          contested: state.contested,
          pressure: state.pressure,
          defense: state.defense,
          pressurePlayer: state.pressurePlayer,
          pressureAi: state.pressureAi,
          event,
        })),
      )
      .sort((a, b) => b.event.triggeredOnTurn - a.event.triggeredOnTurn);

    const recentEvents: PlayerStateIntel['recentEvents'] = fullEventHistory.slice(0, 12);

    return {
      generatedAtTurn: gameState.turn,
      round: gameState.round,
      totals,
      states: statesIntel,
      eventHistory: fullEventHistory,
      recentEvents,
    } satisfies PlayerStateIntel;
  }, [gameState.states, gameState.turn, gameState.round]);

  useEffect(() => {
    if (!gameState.isGameOver) {
      archivedIntelIdsRef.current.clear();
      return;
    }

    const history = playerHubStateIntel.eventHistory ?? [];
    if (history.length === 0) {
      return;
    }

    const payload = history
      .map<IntelArchiveDraft | null>(eventEntry => {
        const stateKey = eventEntry.stateId ?? eventEntry.abbreviation ?? eventEntry.stateName ?? eventEntry.event.eventId;
        const uniqueId = `${stateKey}-${eventEntry.event.eventId}-${eventEntry.event.triggeredOnTurn}`;
        if (archivedIntelIdsRef.current.has(uniqueId)) {
          return null;
        }
        const eventData = eventLookup.get(eventEntry.event.eventId);
        const flavor = eventEntry.event.faction === 'truth'
          ? eventData?.flavorTruth
          : eventEntry.event.faction === 'government'
            ? eventData?.flavorGov
            : undefined;
        const loreText = flavor
          ?? eventData?.flavorText
          ?? eventData?.content
          ?? eventEntry.event.description
          ?? eventEntry.event.label;

        return {
          id: uniqueId,
          savedAt: Date.now(),
          stateId: stateKey,
          stateName: eventEntry.stateName,
          stateAbbreviation: eventEntry.abbreviation,
          stateOwner: eventEntry.owner,
          contested: eventEntry.contested,
          faction: eventEntry.event.faction,
          eventId: eventEntry.event.eventId,
          eventLabel: eventEntry.event.label,
          eventType: eventData?.type ?? 'unknown',
          triggeredOnTurn: eventEntry.event.triggeredOnTurn,
          round: playerHubStateIntel.round,
          loreText,
          effectSummary: eventEntry.event.effectSummary,
        } satisfies IntelArchiveDraft;
      })
      .filter((entry): entry is IntelArchiveDraft => entry !== null);

    if (payload.length === 0) {
      return;
    }

    archiveIntelEvents(payload);
    payload.forEach(entry => {
      archivedIntelIdsRef.current.add(entry.id);
    });
  }, [archiveIntelEvents, eventLookup, gameState.isGameOver, playerHubStateIntel.eventHistory, playerHubStateIntel.round]);

  useEffect(() => {
    const nextActive: Record<string, ActiveParanormalHotspot> = {};
    Object.entries(gameState.paranormalHotspots ?? {}).forEach(([abbr, hotspot]) => {
      nextActive[abbr] = hotspot;
      hotspotHistoryRef.current[hotspot.id] = hotspot;
    });
    activeHotspotByStateRef.current = nextActive;
  }, [gameState.paranormalHotspots]);

  // Handle AI turns
  useEffect(() => {
    if (gameState.phase === 'ai_turn' && gameState.currentPlayer === 'ai' && !gameState.aiTurnInProgress) {
      executeAITurnRef.current?.();
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.aiTurnInProgress]);

  // Track IP changes for floating numbers
  useEffect(() => {
    const currentIP = gameState.ip;
    const prevIP = parseInt(localStorage.getItem('prevIP') || '0');
    
    if (currentIP !== prevIP && prevIP > 0) {
      const change = currentIP - prevIP;
      setFloatingNumbers({ value: change, type: 'ip' });
      setTimeout(() => setFloatingNumbers(null), 100);
    }
    
    localStorage.setItem('prevIP', currentIP.toString());
  }, [gameState.ip]);

  // Track phase changes for context
  useEffect(() => {
    setPreviousPhase(gameState.phase);
  }, [gameState.phase]);

  // Check victory conditions and trigger game over
  useEffect(() => {
    // Don't check victory if game is already over or during animations
    if (gameState.isGameOver || gameState.animating) return;

    let winner: "government" | "truth" | "draw" | null = null;
    let victoryType: 'states' | 'ip' | 'truth' | 'agenda' | null = null;

    // Only evaluate victory conditions at proper timing:
    // - After card effects are fully resolved
    // - After AI turn completion
    // - After round end (newspaper phase)
    const shouldEvaluate = gameState.phase === 'action' || 
                          gameState.phase === 'newspaper' ||
                          (gameState.phase === 'ai_turn' && !gameState.aiTurnInProgress);

    if (!shouldEvaluate) return;

    const playerSecretAgenda = gameState.secretAgenda;
    const aiSecretAgenda = gameState.aiSecretAgenda;

    // Priority 1: Secret Agenda (highest priority)
    if (playerSecretAgenda?.completed) {
      winner = gameState.faction;
      victoryType = 'agenda';
    } else if (aiSecretAgenda?.completed) {
      winner = gameState.faction === 'truth' ? 'government' : 'truth';
      victoryType = 'agenda';
    }
    
    // Priority 2: Truth thresholds (Truth ≥ 95% for Truth Seekers, Truth ≤ 5% for Government)
    else if (gameState.truth >= 95 && gameState.faction === 'truth') {
      winner = 'truth';
      victoryType = 'truth';
    } else if (gameState.truth <= 5 && gameState.faction === 'government') {
      winner = 'government';
      victoryType = 'truth';
    }
    
    // Priority 3: IP victory (300 IP)
    else if (gameState.ip >= 300) {
      winner = gameState.faction;
      victoryType = 'ip';
    } else if (gameState.aiIP >= 300) {
      winner = gameState.faction === 'government' ? 'truth' : 'government';
      victoryType = 'ip';
    }
    
    // Priority 4: State control (10 states)
    else if (gameState.controlledStates.length >= 10) {
      winner = gameState.faction;
      victoryType = 'states';
    } else {
      const aiControlledStates = gameState.states.filter(s => s.owner === 'ai').length;
      if (aiControlledStates >= 10) {
        winner = gameState.faction === 'government' ? 'truth' : 'government';
        victoryType = 'states';
      }
    }

    if (winner && victoryType) {
      // Stop the game immediately
      setGameState(prev => ({ ...prev, isGameOver: true }));

      // Build game over report
      const { mvp, runnerUp } = determineTopPlays(gameState.playHistory, winner, gameState.faction);
      const legendaryUsed = Array.from(new Set(
        gameState.playHistory
          .filter(entry => entry.card.rarity === 'legendary')
          .map(entry => entry.card.name),
      ));
      const topEvents = pickTopEvents(gameState.currentEvents ?? [], 4);
      const comboSummary = getLastComboSummary();
      const comboHighlights = buildComboHighlights(comboSummary);
      const recordedAt = Date.now();
      const summarizeAgenda = (source?: typeof playerSecretAgenda) => {
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

      const report: GameOverReport = {
        winner,
        victoryType,
        rounds: gameState.round,
        finalTruth: Math.round(gameState.truth),
        ipPlayer: gameState.ip,
        ipAI: gameState.aiIP,
        statesGov: gameState.states.filter(s => s.owner === (gameState.faction === 'government' ? 'player' : 'ai')).length,
        statesTruth: gameState.states.filter(s => s.owner === (gameState.faction === 'truth' ? 'player' : 'ai')).length,
        playerFaction: gameState.faction,
        playerSecretAgenda: summarizeAgenda(playerSecretAgenda),
        aiSecretAgenda: summarizeAgenda(aiSecretAgenda),
        mvp,
        runnerUp,
        legendaryUsed,
        topEvents,
        comboHighlights,
        sightings: [...paranormalSightings],
        recordedAt,
      };

      setFinalEdition(report);
      setVictoryState({ isVictory: true, type: victoryType });
    }
  }, [
    gameState.controlledStates.length,
    gameState.ip,
    gameState.aiIP,
    gameState.truth,
    gameState.secretAgenda?.completed,
    gameState.aiSecretAgenda?.completed,
    gameState.states,
    gameState.faction,
    gameState.isGameOver,
    gameState.currentEvents,
    paranormalSightings,
  ]);

  // Enhanced synergy detection with coordinated visual effects
  useEffect(() => {
    const newCombinations = checkSynergies(
      gameState.controlledStates,
      (combo, position) => {
          // Synergy activation callback
          console.log(`🔗 New synergy activated: ${combo.name} (+${combo.bonusIP} IP)`);

          if (position) {
            VisualEffectsCoordinator.triggerSynergyActivation(
              combo.bonusIP,
              position,
              'synergy',
              combo.name
            );
          }

          // Play audio feedback
          audio?.playSFX?.('state-capture');

          // Toast notification for synergy activation
          toast.success(`🔗 Synergy Activated: ${combo.name} (+${combo.bonusIP} IP)`, {
            duration: 3000,
            position: 'top-center'
          });
      },
      (type, x, y) => {
        // Particle effect callback
        VisualEffectsCoordinator.triggerParticleEffect(type as any, { x, y });
      },
      (value, type, x, y) => {
        // Floating number callback
        if (x && y) {
          VisualEffectsCoordinator.showFloatingNumber(value, type as any, { x, y });
        }
      }
    );

    const activeCombos = getActiveCombinations();
    const totalBonusIp = getTotalBonusIP();
    const aggregatedEffects = aggregateStateCombinationEffects(activeCombos);
    const activeIds = activeCombos.map(combo => combo.id).sort();

    setGameState(prev => {
      const previousIds = [...prev.activeStateCombinationIds].sort();
      const idsChanged =
        activeIds.length !== previousIds.length ||
        activeIds.some((id, index) => id !== previousIds[index]);
      const bonusChanged = prev.stateCombinationBonusIP !== totalBonusIp;
      const effects = aggregatedEffects;
      const effectsChanged =
        prev.stateCombinationEffects.mediaCostModifier !== effects.mediaCostModifier ||
        prev.stateCombinationEffects.extraCardDraw !== effects.extraCardDraw ||
        prev.stateCombinationEffects.ipPerStateBonus !== effects.ipPerStateBonus ||
        prev.stateCombinationEffects.ipPerNeutralStateBonus !== effects.ipPerNeutralStateBonus ||
        prev.stateCombinationEffects.flatTurnIpBonus !== effects.flatTurnIpBonus ||
        prev.stateCombinationEffects.attackIpBonus !== effects.attackIpBonus ||
        prev.stateCombinationEffects.stateDefenseBonus !== effects.stateDefenseBonus ||
        prev.stateCombinationEffects.incomingPressureReduction !== effects.incomingPressureReduction ||
        prev.stateCombinationEffects.truthSwingMultiplier !== effects.truthSwingMultiplier;

      if (!idsChanged && !bonusChanged && !effectsChanged) {
        return prev;
      }

      const states =
        prev.stateCombinationEffects.stateDefenseBonus !== effects.stateDefenseBonus
          ? applyDefenseBonusToStates(prev.states, effects.stateDefenseBonus)
          : prev.states;

      return {
        ...prev,
        activeStateCombinationIds: activeIds,
        stateCombinationBonusIP: totalBonusIp,
        stateCombinationEffects: effects,
        states,
      };
    });

    if (activeCombos.length > 0) {
      console.log('🎯 Active synergies:', activeCombos.map(c => `${c.name} (+${c.bonusIP})`).join(', '));
      console.log('💰 Total bonus IP:', totalBonusIp);
    }

    if (newCombinations.length === 0 && activeCombos.length === 0) {
      setGameState(prev => {
        if (prev.activeStateCombinationIds.length === 0 && prev.stateCombinationBonusIP === 0) {
          return prev;
        }

        return {
          ...prev,
          activeStateCombinationIds: [],
          stateCombinationBonusIP: 0,
          stateCombinationEffects: createDefaultCombinationEffects(),
        };
      });
    }
  }, [
    gameState.controlledStates,
    checkSynergies,
    getActiveCombinations,
    getTotalBonusIP,
    audio,
    setGameState,
  ]);

  useEffect(() => {
    const pickTemplate = (templates: string[]): string => {
      if (!templates.length) {
        return '';
      }
      const index = Math.floor(Math.random() * templates.length);
      return templates[index];
    };

    const handleSynergyActivation = (event: Event) => {
      const detail = (event as CustomEvent<{ bonusIP: number; comboName?: string }>).detail;
      if (!detail) return;

      const timestamp = Date.now();
      const template = pickTemplate(SYNERGY_SIGHTING_TAGLINES);
      const subtext = template
        ? fillTemplate(template, { BONUS: detail.bonusIP })
        : `Operations log a sudden +${detail.bonusIP} IP spike.`;

      pushSighting({
        id: `synergy-${timestamp}`,
        timestamp,
        category: 'synergy',
        headline: detail.comboName
          ? `${detail.comboName.toUpperCase()} SYNERGY SURGE`
          : 'UNIDENTIFIED SYNERGY SURGE',
        subtext,
        location: 'Operations Deck',
        metadata: {
          bonusIP: detail.bonusIP,
          comboName: detail.comboName,
        },
      });
    };

    const handleTruthMeltdownBroadcast = (event: Event) => {
      const detail = (event as CustomEvent<{
        intensity: 'surge' | 'collapse';
        setList?: string[];
        truthValue?: number;
        source?: 'truth' | 'government';
      }>).detail;
      if (!detail) return;

      if (!areParanormalEffectsEnabled()) {
        return;
      }

      const timestamp = Date.now();
      const track = detail.setList?.[0] ?? 'Suspicious Minds?';
      const template = pickTemplate(BROADCAST_SIGHTING_TAGLINES);
      const subtext = template
        ? fillTemplate(template, {
          TRACK: track,
          INTENSITY: detail.intensity.toUpperCase(),
        })
        : `Broadcast overwhelmed by Elvis feed (${detail.intensity}).`;

      const headline = detail.intensity === 'surge'
        ? 'UFO-ELVIS BROADCAST HIJACKED'
        : 'ELVIS SIGNAL SCRAMBLES TRUTH FEED';

      pushSighting({
        id: `broadcast-${timestamp}`,
        timestamp,
        category: 'truth-meltdown',
        headline,
        subtext,
        location: 'Truth-O-Meter Control Room',
        metadata: {
          intensity: detail.intensity,
          setList: detail.setList,
          truthValue: detail.truthValue,
          source: detail.source,
        },
      });

      const meltdownContext = determineTruthBroadcastContext(detail.intensity, detail.source);
      const meltdownPosition = VisualEffectsCoordinator.getRandomCenterPosition();
      const meltdownLabel = detail.intensity === 'surge' ? 'Truth Surge' : 'Truth Collapse';
      VisualEffectsCoordinator.triggerContextualEffect(
        meltdownContext,
        meltdownLabel,
        meltdownPosition,
      );
    };

    const handleCryptidSighting = (event: Event) => {
      const detail = (event as CustomEvent<{
        stateId: string;
        stateName?: string;
        footageQuality: string;
      }>).detail;
      if (!detail) return;

      if (!areParanormalEffectsEnabled()) {
        return;
      }

      const timestamp = Date.now();
      const stateName = detail.stateName ?? resolveStateName(detail.stateId);
      const template = pickTemplate(CRYPTID_SIGHTING_TAGLINES);
      const subtext = template
        ? fillTemplate(template, {
          QUALITY: detail.footageQuality.toUpperCase(),
          LOCATION: stateName.toUpperCase(),
        })
        : `Trail cam pinged in ${stateName} (${detail.footageQuality} footage).`;

      pushSighting({
        id: `cryptid-${detail.stateId}-${timestamp}`,
        timestamp,
        category: 'cryptid',
        headline: `BIGFOOT TRAIL CAM ALERT – ${stateName.toUpperCase()}`,
        subtext,
        location: stateName,
        metadata: {
          stateId: detail.stateId,
          stateName,
          footageQuality: detail.footageQuality,
        },
      });
    };

    window.addEventListener('synergyActivation', handleSynergyActivation as EventListener);
    window.addEventListener('truthMeltdownBroadcast', handleTruthMeltdownBroadcast as EventListener);
    window.addEventListener('cryptidSighting', handleCryptidSighting as EventListener);

    return () => {
      window.removeEventListener('synergyActivation', handleSynergyActivation as EventListener);
      window.removeEventListener('truthMeltdownBroadcast', handleTruthMeltdownBroadcast as EventListener);
      window.removeEventListener('cryptidSighting', handleCryptidSighting as EventListener);
    };
  }, [pushSighting]);

  useEffect(() => {
    const handleStateEventEffect = (event: Event) => {
      const detail = (event as CustomEvent<{ eventType?: string; stateId: string; x?: number; y?: number }>).detail;
      if (!detail) {
        return;
      }

      const context = determineStateEventContext(detail.eventType);
      if (!context) {
        return;
      }

      const position = typeof detail.x === 'number' && typeof detail.y === 'number'
        ? { x: detail.x, y: detail.y }
        : VisualEffectsCoordinator.getScreenCenter();
      const stateLabel = resolveStateName(detail.stateId);
      const descriptor = detail.eventType ? detail.eventType.toUpperCase() : 'EVENT';

      VisualEffectsCoordinator.triggerContextualEffect(
        context,
        `${stateLabel} ${descriptor}`,
        position,
      );
    };

    window.addEventListener('stateEvent', handleStateEventEffect as EventListener);
    return () => {
      window.removeEventListener('stateEvent', handleStateEventEffect as EventListener);
    };
  }, []);

  useEffect(() => {
    const logLength = gameState.log.length;

    if (!areParanormalEffectsEnabled()) {
      hotspotLogCursorRef.current = logLength;
      hotspotLogInitializedRef.current = true;
      return;
    }

    if (!hotspotLogInitializedRef.current) {
      hotspotLogCursorRef.current = logLength;
      hotspotLogInitializedRef.current = true;
      return;
    }

    if (logLength <= hotspotLogCursorRef.current) {
      hotspotLogCursorRef.current = logLength;
      return;
    }

    const newEntries = gameState.log.slice(hotspotLogCursorRef.current);
    hotspotLogCursorRef.current = logLength;

    const pickTemplate = (templates: string[]): string => {
      if (!templates.length) return '';
      const index = Math.floor(Math.random() * templates.length);
      return templates[index];
    };

    newEntries.forEach(entry => {
      if (!entry.startsWith('👻') && !entry.startsWith('🕯️')) {
        return;
      }

      const timestamp = Date.now();

      if (entry.startsWith('👻 ') && entry.includes('erupts in')) {
        const spawnMatch = entry.match(/^👻 (.+?) erupts in (.+?)!/);
        if (!spawnMatch) {
          return;
        }

        const [, label, stateName] = spawnMatch;
        const stateRecord = stateLookupByName.get(stateName);
        const abbreviation = stateRecord?.abbreviation;
        const hotspot = abbreviation
          ? activeHotspotByStateRef.current[abbreviation]
          : Object.values(activeHotspotByStateRef.current).find(
              candidate => candidate.stateName === stateName,
            );

        const defenseBoost = hotspot?.defenseBoost ?? (() => {
          const match = entry.match(/Defense \+(\d+)/);
          return match ? Number.parseInt(match[1], 10) : undefined;
        })();
        const truthReward = hotspot?.truthReward ?? (() => {
          const match = entry.match(/±(\d+)%/);
          return match ? Number.parseInt(match[1], 10) : undefined;
        })();

        const template = pickTemplate(HOTSPOT_SPAWN_TAGLINES);
        const subtext = template
          ? fillTemplate(template, {
              STATE: stateName.toUpperCase(),
              DEFENSE: defenseBoost ?? 0,
              TRUTH: truthReward ?? 0,
            })
          : `Defense grid surges by +${defenseBoost ?? '?'} while ±${truthReward ?? '?'}% truth is up for grabs.`;

        pushSighting({
          id: `hotspot-${hotspot?.id ?? `${stateName}-${timestamp}`}`,
          timestamp,
          category: 'hotspot',
          headline: `${hotspot?.icon ?? '👻'} ${label.toUpperCase()} IN ${stateName.toUpperCase()}`,
          subtext,
          location: stateName,
          metadata: {
            hotspotId: hotspot?.id,
            stateId: stateRecord?.id ?? stateRecord?.abbreviation ?? stateName,
            stateName,
            source: hotspot?.source ?? 'neutral',
            defenseBoost,
            truthReward,
            duration: hotspot?.duration,
            turnsRemaining: hotspot ? Math.max(0, hotspot.expiresOnTurn - gameState.turn) : undefined,
            outcome: 'active',
          },
        });
        return;
      }

      if (entry.startsWith('👻 ') && entry.includes('resolved in')) {
        const resolveMatch = entry.match(/^👻 (.+?) resolved in (.+?)!/);
        if (!resolveMatch) {
          return;
        }

        const [, label, stateName] = resolveMatch;
        const truthMatch = entry.match(/Truth ([+-]?\d+)/);
        const truthDelta = truthMatch ? Number.parseInt(truthMatch[1], 10) : 0;
        const stateRecord = stateLookupByName.get(stateName);
        const historyEntry = Object.values(hotspotHistoryRef.current).find(
          hotspot => hotspot.label === label && hotspot.stateName === stateName,
        );

        const template = pickTemplate(HOTSPOT_RESOLUTION_TAGLINES);
        const formattedDelta = `${truthDelta >= 0 ? '+' : ''}${truthDelta}`;
        const subtext = template
          ? fillTemplate(template, {
              STATE: stateName.toUpperCase(),
              TRUTH_DELTA: formattedDelta,
            })
          : truthDelta !== 0
            ? `Truth ${formattedDelta}% swing recorded as the anomaly is secured.`
            : 'Hotspot secured without shifting the truth meter.';

        pushSighting({
          id: `hotspot-${historyEntry?.id ?? `${stateName}-resolved-${timestamp}`}`,
          timestamp,
          category: 'hotspot',
          headline: `${historyEntry?.icon ?? '👻'} ${label.toUpperCase()} CONTAINED`,
          subtext,
          location: stateName,
          metadata: {
            hotspotId: historyEntry?.id,
            stateId: historyEntry?.stateId ?? stateRecord?.id ?? stateRecord?.abbreviation ?? stateName,
            stateName,
            source: historyEntry?.source ?? 'neutral',
            defenseBoost: historyEntry?.defenseBoost,
            truthReward: historyEntry?.truthReward,
            outcome: 'captured',
            truthDelta,
          },
        });

        if (historyEntry) {
          delete hotspotHistoryRef.current[historyEntry.id];
        }

        audio?.playSFX?.('cryptid-rumble');
        return;
      }

      if (entry.startsWith('🕯️ ')) {
        const expireMatch = entry.match(/^🕯️ (.+?) in (.+?) fizzles out\./);
        if (!expireMatch) {
          return;
        }

        const [, label, stateName] = expireMatch;
        const stateRecord = stateLookupByName.get(stateName);
        const historyEntry = Object.values(hotspotHistoryRef.current).find(
          hotspot => hotspot.label === label && hotspot.stateName === stateName,
        );

        const template = pickTemplate(HOTSPOT_EXPIRE_TAGLINES);
        const subtext = template
          ? fillTemplate(template, { STATE: stateName.toUpperCase() })
          : `Hotspot dissipates over ${stateName}; defenses return to baseline.`;

        pushSighting({
          id: `hotspot-${historyEntry?.id ?? `${stateName}-expired-${timestamp}`}`,
          timestamp,
          category: 'hotspot',
          headline: `${historyEntry?.icon ?? '👻'} ${label.toUpperCase()} FADES`,
          subtext,
          location: stateName,
          metadata: {
            hotspotId: historyEntry?.id,
            stateId: historyEntry?.stateId ?? stateRecord?.id ?? stateRecord?.abbreviation ?? stateName,
            stateName,
            source: historyEntry?.source ?? 'neutral',
            defenseBoost: historyEntry?.defenseBoost,
            truthReward: historyEntry?.truthReward,
            outcome: 'expired',
          },
        });

        if (historyEntry) {
          delete hotspotHistoryRef.current[historyEntry.id];
        }

        audio?.playSFX?.('radio-static');
      }
    });
  }, [
    gameState.log,
    gameState.turn,
    stateLookupByName,
    pushSighting,
    audio,
  ]);

  // Track cards being drawn to hand for collection discovery
  useEffect(() => {
    gameState.hand.forEach(card => {
      discoverCard(card.id);
    });
  }, [gameState.hand]);

  // Check if first-time player
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('shadowgov-onboarding-complete') || localStorage.getItem('shadowgov-onboarding-skipped');
    if (!hasSeenOnboarding && !showMenu && !showIntro) {
      setShowOnboarding(true);
    }
  }, [showMenu, showIntro]);

  // Update subtitle based on faction and add glitching effect
  useEffect(() => {
    if (gameState.faction) {
      const baseSubtitle = gameState.faction === 'truth' ? 'Truth Seeker Operative' : 'Deep State Agent';
      setSubtitle(baseSubtitle);

      // Add glitching effect
      const glitchInterval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance to glitch
          const glitchTexts = [
            'CLASSIFIED AGENT',
            'REDACTED OPERATIVE', 
            'SHADOW OPERATIVE',
            '[DATA EXPUNGED]',
            'UNKNOWN ENTITY',
            'CONSPIRACY THEORIST'
          ];
          setSubtitle(glitchTexts[Math.floor(Math.random() * glitchTexts.length)]);
          setTimeout(() => setSubtitle(baseSubtitle), 600);
        }
      }, 3000);

      return () => clearInterval(glitchInterval);
    }
  }, [gameState.faction]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenEnabled) {
        toast.error('Fullskjerm støttes ikke i denne nettleseren');
        audio.playSFX('click');
        return;
      }

      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Fullskjerm aktivert!');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        toast.success('Fullskjerm deaktivert');
      }
      audio.playSFX('click');
    } catch (error) {
      console.error('Fullscreen error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Fullskjerm ble blokkert av nettleseren. Prøv F11 eller tillat fullskjerm i nettleserinnstillingene.');
      } else {
        toast.error('Kunne ikke bytte fullskjerm-modus');
      }
      audio.playSFX('click');
    }
  }, [audio]);

  const handleEndTurn = useCallback(() => {
    if (isEndingTurn) {
      return;
    }

    setIsEndingTurn(true);
    endTurn();
    audio.playSFX('turnEnd');
    // Play card draw sound after a short delay
    setTimeout(() => {
      audio.playSFX('cardDraw');
    }, 500);
  }, [audio, endTurn, isEndingTurn]);

  // Update Index.tsx to use enhanced components and add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showMenu || showIntro || showInGameOptions || showHowToPlay) return;

      // Number keys for playing cards (1-9)
      const cardNumber = parseInt(e.key);
      if (cardNumber >= 1 && cardNumber <= 9 && gameState.hand[cardNumber - 1]) {
        const card = gameState.hand[cardNumber - 1];
        handlePlayCard(card.id);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f11':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'escape':
          setShowInGameOptions(true);
          audio.playSFX('click');
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSaveGame();
          }
          break;
        case 'l':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleLoadGame();
          }
          break;
        case 'h':
          setShowHowToPlay(true);
          audio.playSFX('click');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.phase === 'action' && !gameState.animating && !isEndingTurn) {
            handleEndTurn();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    showMenu,
    showIntro,
    showInGameOptions,
    showHowToPlay,
    gameState.phase,
    gameState.animating,
    gameState.hand,
    audio,
    isEndingTurn,
    handleEndTurn,
  ]);

  useEffect(() => {
    if (gameState.phase === 'action' && gameState.currentPlayer === 'human' && !gameState.animating) {
      setIsEndingTurn(false);
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.animating]);

  const handleSaveGame = () => {
    if (saveGame) {
      const success = saveGame();
      const indicator = document.createElement('div');
      indicator.textContent = success ? '✓ GAME SAVED' : '❌ SAVE FAILED';
      indicator.className = `fixed top-4 right-4 ${success ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-2 rounded z-[70] animate-fade-in`;
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 2000);
    }
  };

  const handleLoadGame = () => {
    if (loadGame && getSaveInfo?.()) {
      const success = loadGame();
      const indicator = document.createElement('div');
      indicator.textContent = success ? '✓ GAME LOADED' : '❌ LOAD FAILED';
      indicator.className = `fixed top-4 right-4 ${success ? 'bg-green-600' : 'bg-red-600'} text-white px-4 py-2 rounded z-[70] animate-fade-in`;
      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 2000);
    }
  };

  const startNewGame = async (faction: 'government' | 'truth') => {
    console.log('🎵 Index: Starting new game with faction:', faction);
    persistFaction(faction);
    await initGame(faction);
    setShowMenu(false);
    setShowIntro(false);
    audio.setGameplayMusic(faction);
    audio.playSFX('click');
    
    // Auto-enter fullscreen when game starts
    try {
      if (document.fullscreenEnabled && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Fullskjerm aktivert!');
      }
    } catch (error) {
      console.log('Fullscreen auto-entry failed:', error);
      toast.error('Kunne ikke aktivere fullskjerm automatisk');
    }
  };

  const handleZoneCardSelect = (cardId: string) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (card?.type === 'ZONE') {
      selectCard(cardId);
      audio.playSFX('click');
    }
  };

  const handleStateClick = async (stateId: string) => {
    if (gameState.selectedCard && !isAnimating()) {
      const card = gameState.hand.find(c => c.id === gameState.selectedCard);
      if (card?.type === 'ZONE') {
        const targetState = gameState.states.find(s => s.abbreviation === stateId || s.id === stateId);
        
        // Validate target - cannot target own states with zone cards
        if (targetState?.owner === 'player') {
          toast.error('🚫 Cannot target your own states with zone cards!', {
            duration: 3000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
          });
          audio.playSFX('error');
          return;
        }
        
        selectTargetState(stateId); // keep state in store for logs/UX
        audio.playSFX('click');
        toast.success(`🎯 Targeting ${targetState?.name}! Deploying zone card...`, {
          duration: 2000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
        });
        
        // Play immediately with explicit target (no extra clicks)
        setLoadingCard(gameState.selectedCard);
        await handlePlayCard(gameState.selectedCard, stateId);
      }
    } else {
      audio.playSFX('hover');
    }
  };

  const handleSelectCard = (cardId: string) => {
    selectCard(cardId);
    audio.playSFX('hover');
  };

  const handlePlayCard = async (cardId: string, targetStateArg?: string) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || isAnimating()) return;

    if (!(card.faction === 'government' && card.type === 'ZONE')) {
      VisualEffectsCoordinator.triggerGovernmentZoneTarget({ active: false, mode: 'complete' });
    }

    // Check if player can afford the card
    if (gameState.ip < card.cost) {
      toast.error(`💰 Insufficient IP! Need ${card.cost}, have ${gameState.ip}`, {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSFX('error');
      return;
    }

    // Check if max cards played this turn
    if (gameState.cardsPlayedThisTurn >= 3) {
      toast.error('📋 Maximum 3 cards per turn!', {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSFX('error');
      return;
    }

    // If it's a ZONE card that requires targeting
    if (card.type === 'ZONE' && !gameState.targetState && !targetStateArg) {
      selectCard(cardId);
      audio.playSFX('hover');
      toast('🎯 Zone card selected - click a state to target it!', {
        duration: 4000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #eab308' }
      });

      if (card.faction === 'government') {
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        const position = cardElement
          ? VisualEffectsCoordinator.getElementCenter(cardElement)
          : VisualEffectsCoordinator.getScreenCenter();

        VisualEffectsCoordinator.triggerGovernmentZoneTarget({
          active: true,
          x: position.x,
          y: position.y,
          cardId: card.id,
          cardName: card.name,
          mode: 'select'
        });
      }
      return;
    }

    let resolvedTargetStateId: string | undefined = targetStateArg ?? gameState.targetState ?? undefined;

    if (card.type === 'ZONE') {
      const states = Array.isArray(gameState.states) ? gameState.states : [];
      const findStateMatch = (identifier?: string | null) => {
        if (!identifier) return null;
        const trimmed = identifier.trim();
        if (!trimmed) return null;
        const normalized = trimmed.toLowerCase();

        const matchedState = states.find(state => {
          const abbreviation = typeof state.abbreviation === 'string' ? state.abbreviation.toLowerCase() : undefined;
          const id = typeof state.id === 'string' ? state.id.toLowerCase() : undefined;
          const name = typeof state.name === 'string' ? state.name.toLowerCase() : undefined;
          return abbreviation === normalized || id === normalized || name === normalized;
        });

        if (!matchedState) {
          return null;
        }

        const canonicalId =
          (typeof matchedState.id === 'string' && matchedState.id) ||
          (typeof matchedState.abbreviation === 'string' && matchedState.abbreviation) ||
          (typeof matchedState.name === 'string' && matchedState.name) ||
          trimmed;

        return { canonicalId };
      };

      const resolvedMatch = findStateMatch(targetStateArg) ?? findStateMatch(gameState.targetState);

      if (!resolvedMatch) {
        selectTargetState(null);
        setLoadingCard(null);
        if (gameState.selectedCard !== cardId) {
          selectCard(cardId);
        }
        audio.playSFX('error');
        toast('🎯 Select a valid state target before deploying this zone card!', {
          duration: 4000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #eab308' }
        });
        return;
      }

      resolvedTargetStateId = resolvedMatch.canonicalId;
    }

    // Show loading state
    setLoadingCard(cardId);
    audio.playSFX('cardPlay');

    try {
      if (card.faction === 'government' && card.type === 'ZONE') {
        VisualEffectsCoordinator.triggerGovernmentZoneTarget({
          active: true,
          stateId: resolvedTargetStateId,
          cardId: card.id,
          cardName: card.name,
          mode: 'lock'
        });
      }

      // Use animated card play
      await playCardAnimated(cardId, animatePlayCard, resolvedTargetStateId);

      // Track card in collection
      recordCardPlay(cardId);
      
      // Enhanced visual effects for successful card play
      let effectPosition = VisualEffectsCoordinator.getScreenCenter();
      const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      if (cardElement) {
        effectPosition = VisualEffectsCoordinator.getElementCenter(cardElement);

        // Trigger deploy particle effect
        VisualEffectsCoordinator.triggerParticleEffect('deploy', effectPosition);

        if (card.faction === 'government' && card.type === 'ATTACK') {
          VisualEffectsCoordinator.triggerGovernmentRedaction(effectPosition);
        }

        // Show floating number for IP cost
        if (card.cost > 0) {
          VisualEffectsCoordinator.showFloatingNumber(-card.cost, 'ip', {
            x: effectPosition.x - 30,
            y: effectPosition.y - 20
          });
        }
      }

      const contextualEffect = determineCardContextualEffect(card);
      if (contextualEffect) {
        VisualEffectsCoordinator.triggerContextualEffect(contextualEffect, card.name, effectPosition);
      }

      if (card.faction === 'truth' && card.type === 'MEDIA') {
        VisualEffectsCoordinator.triggerTruthFlash(effectPosition);
        audio.playSFX('flash');
      }

      toast.success(`✅ ${card.name} deployed successfully!`, {
        duration: 2000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
      });
    } catch (error) {
      toast.error('❌ Card deployment failed!', {
        duration: 3000,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
      });
      audio.playSFX('error');
    } finally {
      setLoadingCard(null);

      if (card.faction === 'government' && card.type === 'ZONE') {
        VisualEffectsCoordinator.triggerGovernmentZoneTarget({ active: false, mode: 'complete' });
      }
    }
  };

  const handleCloseNewspaper = () => {
    closeNewspaper();
    audio.playSFX('newspaper');
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!showMenu && (gameState.faction === 'truth' || gameState.faction === 'government')) {
      persistFaction(gameState.faction);
    }
  }, [gameState.faction, showMenu, persistFaction]);

  // Start menu music after user interaction
  useEffect(() => {
    // Only start music when user clicks to dismiss intro
    if (!showIntro && showMenu) {
      audio.setMenuMusic();
    }
  }, [showIntro, showMenu, audio]);

  if (showIntro) {
    return (
      <div 
        className="min-h-screen bg-government-dark flex items-center justify-center cursor-pointer"
        onClick={() => {
          setShowIntro(false);
          audio.setMenuMusic();
        }}
      >
        <div className="text-center space-y-8">
          <div className="bg-secret-red/20 border-2 border-secret-red p-8 transform -rotate-2">
            <h1 className="text-6xl font-mono font-bold text-secret-red">
              [CLASSIFIED]
            </h1>
            <div className="mt-4 text-xl font-mono text-foreground">
              SHADOW GOVERNMENT
            </div>
            <div className="text-sm font-mono text-muted-foreground mt-2">
              TOP SECRET - EYES ONLY
            </div>
          </div>
          <p className="text-muted-foreground font-mono">
            Click to open folder...
          </p>
        </div>
      </div>
    );
  }

  if (showPlayerHub) {
    const derivedHubFaction = playerHubSource === 'menu'
      ? lastSelectedFaction
      : gameState.faction;

    return (
      <PlayerHubOverlay
        faction={derivedHubFaction}
        onClose={() => {
          setShowPlayerHub(false);
          audio.playSFX('click');
        }}
        pressIssues={pressArchive}
        onOpenEdition={(issue) => {
          setReadingEdition(issue.report);
          setShowExtraEdition(true);
          setShowPlayerHub(false);
        }}
        onDeleteEdition={(id) => removeEditionFromArchive(id)}
        stateIntel={playerHubStateIntel}
        intelArchive={intelArchiveEntries}
        onDeleteIntel={removeIntelFromArchive}
        onClearIntel={intelArchiveEntries.length > 0 ? () => clearIntelArchive() : undefined}
      />
    );
  }

  if (showBalancing) {
    return (
      <EnhancedBalancingDashboard
        onClose={() => setShowBalancing(false)}
        logEntries={gameState.log}
        initialView={balancingInitialView}
        paranormalHotspots={gameState.paranormalHotspots}
      />
    );
  }

  if (showMenu) {
    return <GameMenu 
      onStartGame={startNewGame} 
      onFactionHover={(faction) => {
        // Play light hover sound effect instead of changing music
        if (faction) {
          audio.playSFX('hover');
        }
      }}
      audio={audio}
      onShowCardCollection={() => {
        setPlayerHubSource('menu');
        setShowPlayerHub(true);
        audio.playSFX('click');
      }}
      onBackToMainMenu={() => {
        setShowMenu(true);
        // Reset any game state if needed
      }}
        onSaveGame={saveGame}
      getSaveInfo={getSaveInfo}
      onLoadGame={() => {
        const success = loadGame();
        if (success) {
          setShowMenu(false);
        }
        return success;
      }}
    />;
  }

  if (showInGameOptions) {
    return (
      <Options
        onClose={() => setShowInGameOptions(false)}
        onBackToMainMenu={() => {
          setShowInGameOptions(false);
          setShowMenu(true);
          audio.setMenuMusic();
        }}
        onSaveGame={() => saveGame()}
      />
    );
  }

  const isPlayerActionLocked = gameState.phase !== 'action' || gameState.animating || gameState.currentPlayer !== 'human';
  const handInteractionDisabled = isPlayerActionLocked || gameState.cardsPlayedThisTurn >= 3;

  const playerAgenda = gameState.secretAgenda;
  const aiControlledStates = gameState.states.filter(s => s.owner === 'ai').length;
  const aiAgenda = gameState.aiSecretAgenda;
  const aiObjectiveProgress = aiAgenda
    ? Math.min(100, (aiAgenda.progress / aiAgenda.target) * 100)
    : 0;
  const aiAssessment = gameState.aiStrategist?.getStrategicAssessment(gameState);

  const renderSecretAgendaPanel = (variant: 'overlay' | 'mobile') => {
    const content = playerAgenda ? (
      <SecretAgenda agenda={playerAgenda} isPlayer />
    ) : (
      <div
        className={clsx(
          'rounded border border-dashed border-newspaper-border/60 bg-newspaper-bg/40 p-3 text-xs font-mono text-newspaper-text/60',
          variant === 'overlay' && 'text-[11px]'
        )}
      >
        No secret agenda assigned.
      </div>
    );

    return (
      <div className="secret-agenda rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
        {content}
      </div>
    );
  };

  const objectiveSections = [
    {
      id: 'victory' as const,
      label: 'Victory Conditions',
      overlayContent: (
        <>
          <p className="font-semibold uppercase tracking-[0.25em] text-[10px] text-newspaper-text/60">
            Mission Targets
          </p>
          <ul className="space-y-1 font-mono">
            <li>• Control 10 states</li>
            <li>• Reach 300 IP</li>
            <li>• Truth ≥95% / ≤5%</li>
          </ul>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded border border-newspaper-border/40 bg-newspaper-bg/30 px-2 py-1">
              <div className="text-[9px] uppercase tracking-wide text-newspaper-text/60">States</div>
              <div className="text-sm font-mono text-newspaper-text">{gameState.controlledStates.length}/10</div>
            </div>
            <div className="rounded border border-newspaper-border/40 bg-newspaper-bg/30 px-2 py-1">
              <div className="text-[9px] uppercase tracking-wide text-newspaper-text/60">Truth</div>
              <div className="text-sm font-mono text-newspaper-text">{Math.round(gameState.truth)}%</div>
            </div>
            <div className="rounded border border-newspaper-border/40 bg-newspaper-bg/30 px-2 py-1">
              <div className="text-[9px] uppercase tracking-wide text-newspaper-text/60">IP</div>
              <div className="text-sm font-mono text-newspaper-text">{gameState.ip}/300</div>
            </div>
          </div>
        </>
      ),
      mobileContent: (
        <VictoryConditions
          controlledStates={gameState.controlledStates.length}
          truth={gameState.truth}
          ip={gameState.ip}
          isMobile
        />
      ),
    },
    {
      id: 'secret-agenda' as const,
      label: 'Secret Agenda',
      overlayContent: renderSecretAgendaPanel('overlay'),
      mobileContent: renderSecretAgendaPanel('mobile'),
    },
  ];

  const renderObjectiveMenu = (variant: 'overlay' | 'mobile') => {
    const isOverlay = variant === 'overlay';
    const activeSection =
      objectiveSections.find(section => section.id === activeObjectivePanel) ?? objectiveSections[0];

    return (
      <div className={clsx('space-y-3', isOverlay && 'text-[11px] text-newspaper-text/90')}>
        <div
          className={clsx(
            'flex gap-2',
            isOverlay && 'rounded border border-newspaper-border/60 bg-newspaper-bg/40 p-1'
          )}
        >
          {objectiveSections.map(section => {
            const isActive = activeObjectivePanel === section.id;
            const isSecret = section.id === 'secret-agenda';

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveObjectivePanel(section.id)}
                className={clsx(
                  'flex-1 rounded-md border font-semibold uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  isOverlay
                    ? 'px-2 py-1 text-[10px] tracking-[0.2em]'
                    : 'px-3 py-2 text-[11px] tracking-[0.15em]',
                  isSecret ? 'focus-visible:ring-secret-red/40' : 'focus-visible:ring-newspaper-text/40',
                  isActive
                    ? isSecret
                      ? 'border-secret-red/80 bg-secret-red text-newspaper-bg shadow-sm'
                      : 'border-newspaper-text bg-newspaper-text text-newspaper-bg shadow-sm'
                    : isSecret
                      ? 'border-secret-red/40 bg-secret-red/10 text-secret-red hover:bg-secret-red/20'
                      : 'border-newspaper-border/60 bg-newspaper-bg/40 text-newspaper-text hover:bg-newspaper-bg/60'
                )}
              >
                {section.label}
              </button>
            );
          })}
        </div>
        <div className={clsx(isOverlay && 'space-y-3')}>
          {isOverlay ? activeSection.overlayContent : activeSection.mobileContent}
        </div>
      </div>
    );
  };

  const renderAiStatusPanel = () => {
    return (
      <div className="space-y-3 text-[11px] text-newspaper-text/90">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] text-newspaper-text/60">Handler</span>
          <span className="font-mono text-newspaper-text">
            {gameState.aiStrategist?.personality.name || 'Unknown'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded border border-newspaper-border/40 bg-newspaper-bg/30 px-2 py-1">
            <div className="text-[9px] uppercase tracking-wide text-newspaper-text/60">Difficulty</div>
            <div className="font-mono text-newspaper-text">{gameState.aiDifficulty.toUpperCase()}</div>
          </div>
          <div className="rounded border border-newspaper-border/40 bg-newspaper-bg/30 px-2 py-1">
            <div className="text-[9px] uppercase tracking-wide text-newspaper-text/60">Territory</div>
            <div className="font-mono text-newspaper-text">{aiControlledStates} states</div>
          </div>
        </div>
        <div className="rounded border border-newspaper-border/40 bg-newspaper-bg/20 px-3 py-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-newspaper-text/60">
            <span>Status</span>
            <span
              className={`font-mono ${
                gameState.currentPlayer === 'ai' ? 'text-secret-red' : 'text-newspaper-text/70'
              }`}
            >
              {gameState.currentPlayer === 'ai'
                ? gameState.phase === 'ai_turn'
                  ? 'Calculating'
                  : 'Active'
                : 'Waiting'}
            </span>
          </div>
          {gameState.phase === 'ai_turn' && (
            <div className="mt-1 text-[11px] text-secret-red/80">Processing strategy...</div>
          )}
        </div>
        {aiAgenda && aiAgenda.revealed ? (
          <SecretAgenda agenda={aiAgenda} isPlayer={false} />
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] text-newspaper-text/70">
              <span>Objective</span>
              <span className="font-mono text-newspaper-text">{Math.floor(aiObjectiveProgress)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-newspaper-border/40">
              <div className="h-full bg-newspaper-text/80" style={{ width: `${aiObjectiveProgress}%` }} />
            </div>
          </div>
        )}
        {aiAssessment && (
          <p className="text-[11px] italic text-newspaper-text/60">“{aiAssessment}”</p>
        )}
      </div>
    );
  };

  const statusPanelConfigs = [
    {
      id: 'objectives',
      mobile: () => (
        <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
          {renderObjectiveMenu('mobile')}
        </div>
      ),
    },
    {
      id: 'player-secret-agenda',
      mobile: () => renderSecretAgendaPanel('mobile'),
    },
    {
      id: 'ai-status',
      mobile: () => (
        <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
          <AIStatus
            difficulty={gameState.aiDifficulty}
            personalityName={gameState.aiStrategist?.personality.name}
            isThinking={gameState.phase === 'ai_turn'}
            currentPlayer={gameState.currentPlayer}
            aiControlledStates={aiControlledStates}
            assessmentText={aiAssessment}
            aiHandSize={gameState.aiHand.length}
            aiObjectiveProgress={aiObjectiveProgress}
            secretAgenda={aiAgenda && aiAgenda.revealed ? aiAgenda : null}
          />
        </div>
      ),
    },
  ];

  const renderSidebar = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-4">
        {statusPanelConfigs.map(panel => (
          <div key={panel.id}>{panel.mobile()}</div>
        ))}
      </div>
    </div>
  );


  const mastheadButtonClass = "touch-target inline-flex items-center justify-center rounded-md border border-newspaper-border bg-newspaper-text px-3 text-sm font-semibold text-newspaper-bg shadow-sm transition hover:bg-newspaper-text/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newspaper-border focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg";
  const statusBadgeClass = 'flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm';

  const mastheadContent = (
    <div
      className="flex h-full items-center gap-4 border-b-4 border-newspaper-border px-2 sm:px-4"
      style={{ background: "var(--paper)" }}
    >
      <div className="flex items-center gap-3">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <button type="button" className={`${mastheadButtonClass} md:hidden`}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open command panel</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full p-0 sm:max-w-sm">
            <div className="app-scroll h-full p-4">
              {renderSidebar()}
            </div>
          </SheetContent>
        </Sheet>
        <div className="leading-tight">
          <h1 className="text-lg font-bold text-newspaper-text sm:text-2xl">THE PARANOID TIMES</h1>
          <p className="text-[11px] font-medium text-newspaper-text/70 sm:text-xs">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1 overflow-hidden">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className={mastheadButtonClass}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setBalancingInitialView('analysis');
              setShowBalancing(true);
            }}
            className={mastheadButtonClass}
            title="Card Balancing Dashboard"
          >
            ⚖️
          </button>
          <button
            type="button"
            onClick={() => {
              setPlayerHubSource('game');
              setShowPlayerHub(true);
              audio.playSFX('click');
            }}
            className={mastheadButtonClass}
            title="Player Hub"
          >
            <UserCircle2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInGameOptions(true);
              audio.playSFX('click');
            }}
            className={mastheadButtonClass}
            title="Options & Settings"
          >
            ⚙️
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-newspaper-text/80">
          <div className="flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm">
            <span className="font-bold uppercase tracking-wide">Round</span>
            <span>{gameState.turn}</span>
          </div>
          <MechanicsTooltip mechanic="ip">
            <div className="flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm">
              <span className="font-bold uppercase tracking-wide">Your IP</span>
              <span>{gameState.ip}</span>
            </div>
          </MechanicsTooltip>
          <MechanicsTooltip mechanic="truth">
            <div className="flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm">
              <span className="font-bold uppercase tracking-wide">Truth</span>
              <span>{gameState.truth}%</span>
            </div>
          </MechanicsTooltip>
          <MechanicsTooltip mechanic="zone">
            <div className="flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm">
              <span className="font-bold uppercase tracking-wide">Your States</span>
              <span>{gameState.controlledStates.length}</span>
            </div>
          </MechanicsTooltip>
          <div className="flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm">
            <span className="font-bold uppercase tracking-wide">AI IP</span>
            <span>{gameState.aiIP}</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm">
            <span className="font-bold uppercase tracking-wide">AI States</span>
            <span>{gameState.states.filter(s => s.owner === 'ai').length}</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={clsx(
                  statusBadgeClass,
                  'text-[10px] font-bold uppercase tracking-wide transition hover:bg-newspaper-text/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newspaper-border focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg'
                )}
              >
                Objectives
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="z-50 w-80 max-w-[min(18rem,calc(100vw-2rem))] border border-newspaper-border bg-newspaper-bg p-4 text-newspaper-text shadow-lg"
            >
              <div className="space-y-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-newspaper-text/60">
                  Objectives
                </div>
                {renderObjectiveMenu('overlay')}
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={clsx(
                  statusBadgeClass,
                  'text-[10px] font-bold uppercase tracking-wide transition hover:bg-newspaper-text/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newspaper-border focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg'
                )}
              >
                AI Opponent
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="z-50 w-80 max-w-[min(18rem,calc(100vw-2rem))] border border-newspaper-border bg-newspaper-bg p-4 text-newspaper-text shadow-lg"
            >
              <div className="space-y-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-newspaper-text/60">
                  AI Opponent
                </div>
                {renderAiStatusPanel()}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );

  const leftPaneContent = (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="space-y-4 md:hidden">
        {statusPanelConfigs.map(panel => (
          <div key={`${panel.id}-mobile`}>{panel.mobile()}</div>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex min-h-[320px] flex-1 flex-col gap-4 md:flex-row">
          <div className="relative flex min-h-[320px] flex-1 flex-col overflow-hidden rounded border-2 border-newspaper-border bg-white/80">
            <div className="relative flex-1">
              <EnhancedUSAMap
                states={gameState.states}
                onStateClick={handleStateClick}
                selectedZoneCard={gameState.selectedCard}
                selectedState={gameState.targetState}
                audio={audio}
                playerFaction={gameState.faction}
              />
            </div>
          </div>
        </div>
        <div className="rounded border-2 border-newspaper-border bg-newspaper-bg shadow-sm">
          <PlayedCardsDock
            playedCards={gameState.cardsPlayedThisRound}
            onInspectCard={(card) => setInspectedPlayedCard(card)}
          />
        </div>
      </div>
      <CardPreviewOverlay card={hoveredCard} />
    </div>
  );

  const rightPaneContent = (
    <aside className="h-full min-h-0 min-w-0 flex flex-col rounded border-2 border-newspaper-border bg-newspaper-text text-newspaper-bg shadow-lg">
      <header className="relative flex items-center justify-between gap-2 border-b border-newspaper-border/60 bg-[image:var(--halftone-blue)] bg-[length:6px_6px] bg-repeat px-4 py-3">
        <h3 className="text-xs font-black uppercase tracking-[0.5em]">NEWSROOM DESK</h3>
        <span className="rounded border border-current px-2 py-1 text-[0.65rem] font-mono font-semibold">IP {gameState.ip}</span>
      </header>
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-3 py-3">
        <EnhancedGameHand
          cards={gameState.hand}
          onPlayCard={handlePlayCard}
          onSelectCard={handleSelectCard}
          selectedCard={gameState.selectedCard}
          disabled={handInteractionDisabled}
          currentIP={gameState.ip}
          loadingCard={loadingCard}
          onCardHover={setHoveredCard}
        />
      </div>
      <footer className="border-t border-newspaper-border/60 px-3 pb-3 pt-2 sm:pt-3">
        <Button
          id="end-turn-button"
          onClick={handleEndTurn}
          className="end-turn-button touch-target w-full border-2 border-black bg-truth-red py-3 font-black uppercase tracking-[0.4em] text-white transition duration-200 hover:bg-white hover:text-truth-red disabled:opacity-60"
          disabled={isPlayerActionLocked || isEndingTurn}
        >
          {gameState.currentPlayer === 'ai' ? (
            <span className="flex items-center justify-center gap-2 text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
              AI Thinking...
            </span>
          ) : (
            'GO TO PRESS'
          )}
        </Button>
      </footer>
    </aside>
  );

  return (
    <>
      <ResponsiveLayout
        masthead={mastheadContent}
        leftPane={leftPaneContent}
        rightPane={rightPaneContent}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
            fontFamily: 'monospace'
          }
        }}
      />

      <CardAnimationLayer />

      <CardDetailOverlay
        card={inspectedPlayedCard}
        canAfford={true}
        disabled
        onClose={() => setInspectedPlayedCard(null)}
        onPlayCard={() => {}}
      />

      <TabloidVictoryScreen
        isVisible={victoryState.isVictory}
        report={finalEdition}
        playerFaction={gameState.faction}
        victoryType={victoryState.type}
        onClose={() => {
          setVictoryState({ isVictory: false, type: null });
          setFinalEdition(null);
          setReadingEdition(null);
          setShowMenu(true);
          setShowIntro(true);
        }}
        onMainMenu={() => {
          setVictoryState({ isVictory: false, type: null });
          setFinalEdition(null);
          setReadingEdition(null);
          setShowExtraEdition(false);
          setShowMenu(true);
          setShowIntro(true);
          setGameState(prev => ({ ...prev, isGameOver: false }));
          audio.playMusic('theme');
        }}
        onViewFinalEdition={() => {
          if (!finalEdition) return;
          setReadingEdition(finalEdition);
          setShowExtraEdition(true);
        }}
        onArchive={finalEdition ? () => archiveEditionWithToast(finalEdition) : undefined}
        isArchived={isEditionArchived(finalEdition)}
      />

      {showExtraEdition && readingEdition && (
        <ExtraEditionNewspaper
          report={readingEdition}
          isArchived={isEditionArchived(readingEdition)}
          onArchive={() => archiveEditionWithToast(readingEdition)}
          onClose={() => {
            setShowExtraEdition(false);
            const closingActiveVictory = finalEdition && victoryState.isVictory && readingEdition.recordedAt === finalEdition.recordedAt;
            setReadingEdition(null);
            if (closingActiveVictory) {
              setVictoryState({ isVictory: false, type: null });
              setFinalEdition(null);
              setShowMenu(true);
              setShowIntro(true);
              setGameState(prev => ({ ...prev, isGameOver: false }));
              audio.playMusic('theme');
            }
          }}
        />
      )}

      <ContextualHelp
        gamePhase={gameState.phase}
        currentPlayer={gameState.currentPlayer}
        selectedCard={gameState.selectedCard}
        playerIP={gameState.ip}
        controlledStates={gameState.controlledStates.length}
        onSuggestMove={(suggestion) => {
          toast(suggestion, {
            duration: 4000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
          });
        }}
      />

      <InteractiveOnboarding
        isActive={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
        gameState={gameState}
      />

      <NewCardsPresentation
        cards={gameState.newCards?.map(card => ({ ...card, rarity: card.rarity || 'common', text: card.text || '' })) || []}
        isVisible={gameState.showNewCardsPresentation || false}
        onConfirm={confirmNewCards}
      />

      {gameState.showNewspaper && (
        <TabloidNewspaper
          events={gameState.currentEvents}
          playedCards={gameState.cardsPlayedThisRound}
          faction={gameState.faction}
          truth={gameState.truth}
          comboTruthDelta={gameState.comboTruthDeltaThisRound}
          sightings={paranormalSightings}
          agendaIssue={gameState.agendaIssue}
          onClose={handleCloseNewspaper}
        />
      )}
    </>
  );
};

export default Index;