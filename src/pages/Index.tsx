import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import EnhancedUSAMap from '@/components/game/EnhancedUSAMap';
import EnhancedGameHand from '@/components/game/EnhancedGameHand';
import PlayedCardsDock from '@/components/game/PlayedCardsDock';
import CardDetailOverlay from '@/components/game/CardDetailOverlay';
import TabloidNewspaper from '@/components/game/TabloidNewspaper';
import GameMenu from '@/components/game/GameMenu';
import SecretAgenda from '@/components/game/SecretAgenda';
import AIStatus from '@/components/game/AIStatus';
import EnhancedBalancingDashboard from '@/components/game/EnhancedBalancingDashboard';
import EventViewer from '@/components/game/EventViewer';
import TutorialOverlay from '@/components/game/TutorialOverlay';
import AchievementPanel from '@/components/game/AchievementPanel';
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
import CardCollection from '@/components/game/CardCollection';
import NewCardsPresentation from '@/components/game/NewCardsPresentation';
import { Maximize, Menu, Minimize } from 'lucide-react';
import { getRandomAgenda } from '@/data/agendaDatabase';
import { useCardCollection } from '@/hooks/useCardCollection';
import { useSynergyDetection } from '@/hooks/useSynergyDetection';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';
import ExtraEditionNewspaper from '@/components/game/ExtraEditionNewspaper';
import InGameOptions from '@/components/game/InGameOptions';
import EnhancedNewspaper from '@/components/game/EnhancedNewspaper';
import MinimizedHand from '@/components/game/MinimizedHand';
import { VictoryConditions } from '@/components/game/VictoryConditions';
import toast, { Toaster } from 'react-hot-toast';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import type { ParanormalSighting } from '@/types/paranormal';
import { areParanormalEffectsEnabled, areUiNotificationsEnabled } from '@/state/settings';
import type { GameCard } from '@/rules/mvp';

type ContextualEffectType = Parameters<typeof VisualEffectsCoordinator.triggerContextualEffect>[0];

type ImpactType = 'capture' | 'truth' | 'ip' | 'damage' | 'support';

interface MVPReport {
  cardId: string;
  cardName: string;
  player: 'human' | 'ai';
  faction: 'truth' | 'government';
  truthDelta: number;
  ipDelta: number;
  aiIpDelta: number;
  capturedStates: string[];
  damageDealt: number;
  round: number;
  turn: number;
  impactType: ImpactType;
  impactValue: number;
  impactLabel: string;
  highlight: string;
}

interface GameOverReport {
  winner: 'government' | 'truth' | 'draw';
  rounds: number;
  finalTruth: number;
  ipPlayer: number;
  ipAI: number;
  statesGov: number;
  statesTruth: number;
  agenda?: {
    side: 'truth' | 'government';
    name: string;
    success: boolean;
  };
  mvp?: MVPReport | null;
  legendaryUsed: string[];
}

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

const determineMVP = (
  history: CardPlayRecord[],
  winner: 'truth' | 'government' | 'draw' | null,
  playerFaction: 'truth' | 'government',
): MVPReport | null => {
  if (!winner || winner === 'draw' || history.length === 0) {
    return null;
  }

  const enrichedPlays: EnrichedPlay[] = history.map(play => {
    const faction = inferFactionFromRecord(play, playerFaction);
    const metrics = computePlayMetrics(play, faction);
    return { play, faction, ...metrics };
  }).filter(entry => entry.faction === winner);

  if (enrichedPlays.length === 0) {
    return null;
  }

  const captureMax = Math.max(...enrichedPlays.map(entry => entry.captureCount), 0);
  if (captureMax > 0) {
    const captureCandidates = enrichedPlays.filter(entry => entry.captureCount === captureMax);
    const best = pickBestCandidate(captureCandidates, 'truthImpact', ['ipImpact', 'damageImpact']);
    if (best) {
      return buildMvpReport(best, 'capture', captureMax);
    }
  }

  const truthMax = Math.max(...enrichedPlays.map(entry => entry.truthImpact), 0);
  if (truthMax > 0) {
    const truthCandidates = enrichedPlays.filter(entry => entry.truthImpact === truthMax);
    const best = pickBestCandidate(truthCandidates, 'captureCount', ['ipImpact', 'damageImpact']);
    if (best) {
      return buildMvpReport(best, 'truth', truthMax);
    }
  }

  const ipMax = Math.max(...enrichedPlays.map(entry => entry.ipImpact), 0);
  if (ipMax > 0) {
    const ipCandidates = enrichedPlays.filter(entry => entry.ipImpact === ipMax);
    const best = pickBestCandidate(ipCandidates, 'captureCount', ['truthImpact', 'damageImpact']);
    if (best) {
      return buildMvpReport(best, 'ip', ipMax);
    }
  }

  const damageMax = Math.max(...enrichedPlays.map(entry => entry.damageImpact), 0);
  if (damageMax > 0) {
    const damageCandidates = enrichedPlays.filter(entry => entry.damageImpact === damageMax);
    const best = pickBestCandidate(damageCandidates, 'truthImpact', ['ipImpact', 'captureCount']);
    if (best) {
      return buildMvpReport(best, 'damage', damageMax);
    }
  }

  const fallback = pickBestCandidate(enrichedPlays, 'captureCount', ['truthImpact', 'ipImpact', 'damageImpact']);
  return fallback ? buildMvpReport(fallback, 'support', 0) : null;
};

const Index = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBalancing, setShowBalancing] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
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
  const [hoveredCard, setHoveredCard] = useState<any>(null);
  const [victoryState, setVictoryState] = useState<{ isVictory: boolean; type: 'states' | 'ip' | 'truth' | 'agenda' | null }>({ isVictory: false, type: null });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInGameOptions, setShowInGameOptions] = useState(false);
  const [showCardCollection, setShowCardCollection] = useState(false);
  const [gameOverReport, setGameOverReport] = useState<GameOverReport | null>(null);
  const [showExtraEdition, setShowExtraEdition] = useState(false);
  const [paranormalSightings, setParanormalSightings] = useState<ParanormalSighting[]>([]);
  const [inspectedPlayedCard, setInspectedPlayedCard] = useState<GameCard | null>(null);

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uiNotificationsEnabled, setUiNotificationsEnabled] = useState(() => areUiNotificationsEnabled());
  
  const { gameState, initGame, playCard, playCardAnimated, selectCard, selectTargetState, endTurn, closeNewspaper, executeAITurn, confirmNewCards, setGameState, saveGame, loadGame, getSaveInfo } = useGameState();
  const audio = useAudioContext();
  const { animatePlayCard, isAnimating } = useCardAnimation();
  const { discoverCard, playCard: recordCardPlay } = useCardCollection();
  const { checkSynergies, getActiveCombinations, getTotalBonusIP } = useSynergyDetection();

  const pushSighting = useCallback((entry: ParanormalSighting) => {
    setParanormalSightings(prev => {
      const merged = [...prev, entry];
      const MAX_ENTRIES = 12;
      return merged.length > MAX_ENTRIES ? merged.slice(merged.length - MAX_ENTRIES) : merged;
    });
  }, []);

  // Handle AI turns
  useEffect(() => {
    if (gameState.phase === 'ai_turn' && gameState.currentPlayer === 'ai' && !gameState.aiTurnInProgress) {
      executeAITurn();
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.aiTurnInProgress, executeAITurn]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleToggle = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
      if (detail && typeof detail.enabled === 'boolean') {
        setUiNotificationsEnabled(detail.enabled);
      } else {
        setUiNotificationsEnabled(areUiNotificationsEnabled());
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'gameSettings') {
        setUiNotificationsEnabled(areUiNotificationsEnabled());
      }
    };

    window.addEventListener('shadowgov:ui-notifications-toggled', handleToggle);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('shadowgov:ui-notifications-toggled', handleToggle);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

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

    // Priority 1: Secret Agenda (highest priority)
    if (gameState.agenda?.complete) {
      winner = gameState.agenda.faction === 'truth' ? 'truth' : 'government';
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
      const mvp = determineMVP(gameState.playHistory, winner, gameState.faction);
      const legendaryUsed = Array.from(new Set(
        gameState.playHistory
          .filter(entry => entry.card.rarity === 'legendary')
          .map(entry => entry.card.name),
      ));
      const report = {
        winner,
        rounds: gameState.round,
        finalTruth: Math.round(gameState.truth),
        ipPlayer: gameState.ip,
        ipAI: gameState.aiIP,
        statesGov: gameState.states.filter(s => s.owner === (gameState.faction === 'government' ? 'player' : 'ai')).length,
        statesTruth: gameState.states.filter(s => s.owner === (gameState.faction === 'truth' ? 'player' : 'ai')).length,
        agenda: gameState.agenda ? {
          side: (gameState.agenda.faction === 'truth' ? 'truth' : 'government') as "truth" | "government",
          name: gameState.agenda.title,
          success: gameState.agenda.complete
        } : undefined,
        mvp,
        legendaryUsed,
      };

      setGameOverReport(report);
      setVictoryState({ isVictory: true, type: victoryType });
    }
  }, [gameState.controlledStates.length, gameState.ip, gameState.aiIP, gameState.truth, gameState.agenda?.complete, gameState.states, gameState.faction, gameState.isGameOver]);

  // Enhanced synergy detection with coordinated visual effects
  useEffect(() => {
    if (gameState.controlledStates.length > 0) {
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
          if (uiNotificationsEnabled) {
            toast.success(`🔗 Synergy Activated: ${combo.name} (+${combo.bonusIP} IP)`, {
              duration: 3000,
              position: 'top-center'
            });
          }
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

      // Log active combinations for debugging
      const activeCombos = getActiveCombinations();
      if (activeCombos.length > 0) {
        console.log('🎯 Active synergies:', activeCombos.map(c => `${c.name} (+${c.bonusIP})`).join(', '));
        console.log('💰 Total bonus IP:', getTotalBonusIP());
      }
    }
  }, [gameState.controlledStates, checkSynergies, getActiveCombinations, getTotalBonusIP, audio, uiNotificationsEnabled]);

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
        if (uiNotificationsEnabled) {
          toast.error('Fullskjerm støttes ikke i denne nettleseren');
        }
        audio.playSFX('click');
        return;
      }

      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        if (uiNotificationsEnabled) {
          toast.success('Fullskjerm aktivert!');
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        if (uiNotificationsEnabled) {
          toast.success('Fullskjerm deaktivert');
        }
      }
      audio.playSFX('click');
    } catch (error) {
      console.error('Fullscreen error:', error);
      if (error.name === 'NotAllowedError') {
        if (uiNotificationsEnabled) {
          toast.error('Fullskjerm ble blokkert av nettleseren. Prøv F11 eller tillat fullskjerm i nettleserinnstillingene.');
        }
      } else {
        if (uiNotificationsEnabled) {
          toast.error('Kunne ikke bytte fullskjerm-modus');
        }
      }
      audio.playSFX('click');
    }
  }, [audio, uiNotificationsEnabled]);

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
          if (gameState.phase === 'action' && !gameState.animating) {
            handleEndTurn();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMenu, showIntro, showInGameOptions, showHowToPlay, gameState.phase, gameState.animating, gameState.hand, audio]);

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
        if (uiNotificationsEnabled) {
          toast.success('Fullskjerm aktivert!');
        }
      }
    } catch (error) {
      console.log('Fullscreen auto-entry failed:', error);
      if (uiNotificationsEnabled) {
        toast.error('Kunne ikke aktivere fullskjerm automatisk');
      }
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
          if (uiNotificationsEnabled) {
            toast.error('🚫 Cannot target your own states with zone cards!', {
              duration: 3000,
              style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
            });
          }
          audio.playSFX('error');
          return;
        }

        selectTargetState(stateId); // keep state in store for logs/UX
        audio.playSFX('click');
        if (uiNotificationsEnabled) {
          toast.success(`🎯 Targeting ${targetState?.name}! Deploying zone card...`, {
            duration: 2000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
          });
        }
        
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
      if (uiNotificationsEnabled) {
        toast.error(`💰 Insufficient IP! Need ${card.cost}, have ${gameState.ip}`, {
          duration: 3000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
        });
      }
      audio.playSFX('error');
      return;
    }

    // Check if max cards played this turn
    if (gameState.cardsPlayedThisTurn >= 3) {
      if (uiNotificationsEnabled) {
        toast.error('📋 Maximum 3 cards per turn!', {
          duration: 3000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
        });
      }
      audio.playSFX('error');
      return;
    }

    // If it's a ZONE card that requires targeting
    if (card.type === 'ZONE' && !gameState.targetState && !targetStateArg) {
      selectCard(cardId);
      audio.playSFX('hover');
      if (uiNotificationsEnabled) {
        toast('🎯 Zone card selected - click a state to target it!', {
          duration: 4000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #eab308' }
        });
      }

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
        if (uiNotificationsEnabled) {
          toast('🎯 Select a valid state target before deploying this zone card!', {
            duration: 4000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #eab308' }
          });
        }
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

      if (uiNotificationsEnabled) {
        toast.success(`✅ ${card.name} deployed successfully!`, {
          duration: 2000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
        });
      }
    } catch (error) {
      if (uiNotificationsEnabled) {
        toast.error('❌ Card deployment failed!', {
          duration: 3000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
        });
      }
      audio.playSFX('error');
    } finally {
      setLoadingCard(null);

      if (card.faction === 'government' && card.type === 'ZONE') {
        VisualEffectsCoordinator.triggerGovernmentZoneTarget({ active: false, mode: 'complete' });
      }
    }
  };

  const handleEndTurn = () => {
    endTurn();
    audio.playSFX('turnEnd');
    // Play card draw sound after a short delay
    setTimeout(() => {
      audio.playSFX('cardDraw');
    }, 500);
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

  if (showAchievements) {
    return <AchievementPanel onClose={() => setShowAchievements(false)} />;
  }

  if (showTutorial) {
    return <TutorialOverlay onClose={() => setShowTutorial(false)} />;
  }

  if (showEvents) {
    return <EventViewer onClose={() => setShowEvents(false)} />;
  }

  if (showBalancing) {
    return <EnhancedBalancingDashboard onClose={() => setShowBalancing(false)} />;
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
      onShowCardCollection={() => setShowCardCollection(true)}
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

  const renderIntelLog = (limit: number) => (
    <div className="space-y-1 text-xs text-newspaper-text/80">
      {gameState.log.slice(-limit).map((entry, index) => (
        <div key={`${entry}-${index}`} className="flex items-start gap-1">
          <span className="font-mono text-newspaper-text">▲</span>
          <span className="flex-1 leading-snug">{entry}</span>
        </div>
      ))}
      {gameState.log.length === 0 && (
        <div className="text-newspaper-text/50">No intel yet.</div>
      )}
    </div>
  );

  const renderSidebar = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-4 xl:hidden">
        <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
          <VictoryConditions
            controlledStates={gameState.controlledStates.length}
            truth={gameState.truth}
            ip={gameState.ip}
            isMobile
          />
        </div>
        <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
          <SecretAgenda agenda={gameState.secretAgenda} isPlayer />
        </div>
        <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
          <AIStatus
            difficulty={gameState.aiDifficulty}
            personalityName={gameState.aiStrategist?.personality.name}
            isThinking={gameState.phase === 'ai_turn'}
            currentPlayer={gameState.currentPlayer}
            aiControlledStates={gameState.states.filter(s => s.owner === 'ai').length}
            assessmentText={gameState.aiStrategist?.getStrategicAssessment(gameState)}
            aiHandSize={gameState.aiHand.length}
            aiObjectiveProgress={gameState.aiSecretAgenda ? (gameState.aiSecretAgenda.progress / gameState.aiSecretAgenda.target) * 100 : 0}
          />
        </div>
        <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wide text-newspaper-text">Intel Log</h3>
          <div className="mt-2">{renderIntelLog(6)}</div>
        </div>
      </div>
    </div>
  );

  const roundsCompleted = Math.max(0, gameState.round - 1);
  const currentRoundNumber = Math.max(1, gameState.round);

  const mastheadButtonClass = "touch-target inline-flex items-center justify-center rounded-md border border-newspaper-border bg-newspaper-text px-3 text-sm font-semibold text-newspaper-bg shadow-sm transition hover:bg-newspaper-text/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newspaper-border focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg";

  const mastheadContent = (
    <div className="flex h-full items-center gap-4 border-b-4 border-newspaper-border bg-newspaper-bg px-2 sm:px-4">
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-newspaper-text/60">The Paranoid Times</p>
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
            onClick={() => setShowBalancing(true)}
            className={mastheadButtonClass}
            title="Card Balancing Dashboard"
          >
            ⚖️
          </button>
          <button
            type="button"
            onClick={() => setShowEvents(true)}
            className={mastheadButtonClass}
            title="Event Database"
          >
            📰
          </button>
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className={mastheadButtonClass}
            title="Tutorial & Training"
          >
            🎓
          </button>
          <button
            type="button"
            onClick={() => setShowAchievements(true)}
            className={mastheadButtonClass}
            title="Achievements"
          >
            🏆
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCardCollection(true);
              audio.playSFX('click');
            }}
            className={mastheadButtonClass}
            title="Card Collection"
          >
            📚
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
        </div>
      </div>
    </div>
  );

  const leftPaneContent = (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
        <div className="hidden xl:flex xl:w-72 xl:flex-col xl:gap-4">
          <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
            <VictoryConditions
              controlledStates={gameState.controlledStates.length}
              truth={gameState.truth}
              ip={gameState.ip}
            />
          </div>
          <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
            <SecretAgenda agenda={gameState.secretAgenda} isPlayer />
          </div>
          <div className="rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
            <AIStatus
              difficulty={gameState.aiDifficulty}
              personalityName={gameState.aiStrategist?.personality.name}
              isThinking={gameState.phase === 'ai_turn'}
              currentPlayer={gameState.currentPlayer}
              aiControlledStates={gameState.states.filter(s => s.owner === 'ai').length}
              assessmentText={gameState.aiStrategist?.getStrategicAssessment(gameState)}
              aiHandSize={gameState.aiHand.length}
              aiObjectiveProgress={gameState.aiSecretAgenda ? (gameState.aiSecretAgenda.progress / gameState.aiSecretAgenda.target) * 100 : 0}
            />
          </div>
          <div className="flex-1 rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wide text-newspaper-text">Intel Log</h3>
            <div className="mt-2 h-full overflow-hidden">
              {renderIntelLog(12)}
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="relative flex min-h-[320px] flex-1 flex-col overflow-hidden rounded border-2 border-newspaper-border bg-white/80">
            {gameState.selectedCard && gameState.hand.find(c => c.id === gameState.selectedCard)?.type === 'ZONE' && !gameState.targetState && (
              <div className="pointer-events-none absolute top-4 right-4 z-20">
                <div className="max-w-sm animate-pulse border-2 border-newspaper-border bg-newspaper-text p-4 font-mono text-newspaper-bg shadow-2xl">
                  <div className="mb-2 flex items-center gap-2 text-lg">
                    🎯 <span className="font-bold">ZONE CARD ACTIVE</span>
                  </div>
                  <div className="mb-3 text-sm">
                    Click any <span className="font-bold text-yellow-400">NEUTRAL</span> or <span className="font-bold text-red-500">ENEMY</span> state to target
                  </div>
                  <div className="mb-2 rounded bg-black/20 p-2 text-xs">
                    Card will deploy automatically when target is selected
                  </div>
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    ⚠️ Cannot target your own states
                  </div>
                </div>
              </div>
            )}
            <div className="relative flex-1">
              <EnhancedUSAMap
                states={gameState.states}
                onStateClick={handleStateClick}
                selectedZoneCard={gameState.selectedCard}
                selectedState={gameState.targetState}
                audio={audio}
              />
            </div>
          </div>
          <div className="rounded border-2 border-newspaper-border bg-newspaper-bg shadow-sm">
            <PlayedCardsDock
              playedCards={gameState.cardsPlayedThisRound}
              onInspectCard={(card) => setInspectedPlayedCard(card)}
            />
          </div>
        </div>
      </div>
      <CardPreviewOverlay card={hoveredCard} />
    </div>
  );

  const rightPaneContent = (
    <aside className="h-full min-h-0 min-w-0 flex flex-col rounded border-2 border-newspaper-border bg-newspaper-text text-newspaper-bg shadow-lg">
      <header className="flex items-center justify-between gap-2 border-b border-newspaper-border/60 px-4 py-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.35em]">Your Hand</h3>
        <span className="text-xs font-mono">IP {gameState.ip}</span>
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
          onClick={handleEndTurn}
          className="touch-target w-full border-2 border-black bg-black py-3 font-bold uppercase tracking-wide text-white transition duration-200 hover:bg-white hover:text-black disabled:opacity-60"
          disabled={isPlayerActionLocked}
        >
          {gameState.currentPlayer === 'ai' ? (
            <span className="flex items-center justify-center gap-2 text-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
              AI Thinking...
            </span>
          ) : (
            'End Turn'
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

      {uiNotificationsEnabled && (
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
      )}

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
        isVictory={gameState.faction === (gameOverReport?.winner || 'truth')}
        victoryType={victoryState.type}
        playerFaction={gameState.faction}
        gameStats={{
          rounds: roundsCompleted,
          roundNumber: currentRoundNumber,
          finalTruth: Math.round(gameState.truth),
          playerIP: gameState.ip,
          aiIP: gameState.aiIP,
          playerStates: gameState.states.filter(s => s.owner === 'player').length,
          aiStates: gameState.states.filter(s => s.owner === 'ai').length,
          mvp: gameOverReport?.mvp ?? undefined,
          agenda: gameState.agenda ? {
            name: gameState.agenda.title,
            complete: gameState.agenda.complete || false
          } : undefined
        }}
        onClose={() => {
          setVictoryState({ isVictory: false, type: null });
          setGameOverReport(null);
          setShowMenu(true);
          setShowIntro(true);
        }}
        onMainMenu={() => {
          setVictoryState({ isVictory: false, type: null });
          setGameOverReport(null);
          setShowMenu(true);
          setShowIntro(true);
        }}
      />

      {showExtraEdition && gameOverReport && (
        <ExtraEditionNewspaper
          report={gameOverReport}
          onClose={() => {
            setShowExtraEdition(false);
            setGameOverReport(null);
            setShowMenu(true);
            setGameState(prev => ({ ...prev, isGameOver: false }));
            audio.playMusic('theme');
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
          if (uiNotificationsEnabled) {
            toast(suggestion, {
              duration: 4000,
              style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
            });
          }
        }}
      />

      <InteractiveOnboarding
        isActive={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
        gameState={gameState}
      />

      <CardCollection
        open={showCardCollection}
        onOpenChange={setShowCardCollection}
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
          onClose={handleCloseNewspaper}
        />
      )}
    </>
  );
};

export default Index;