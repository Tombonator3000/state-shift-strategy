import { completedRoundNumber } from '@/systems/news/roundEdition';
import { PressDispatchTray } from '@/components/newsroom/PressDispatchTray';
import { StateTargetPicker } from '@/components/newsroom/StateTargetPicker';
import { NewsroomSoundControl } from '@/components/newsroom/NewsroomSoundControl';
import { requiresStateTarget, validStateTarget } from '@/game/stateTargeting';
import { quoteHumanCard } from '@/systems/cardPlayQuote';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import EnhancedUSAMap from '@/components/game/EnhancedUSAMap';
import EnhancedGameHand from '@/components/game/EnhancedGameHand';
import { MobileBattleLayout } from '@/components/game/mobile/MobileBattleLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import BaseCard from '@/components/game/cards/BaseCard';
import PlayedCardsDock from '@/components/game/PlayedCardsDock';
import CardDetailOverlay from '@/components/game/CardDetailOverlay';
import TabloidNewspaper from '@/components/game/TabloidNewspaper';
import GameMenu from '@/components/game/GameMenu';
import SecretAgenda from '@/components/game/SecretAgenda';
import AIStatus from '@/components/game/AIStatus';
import { AI_EDITORS } from '@/ai/editors';
import EnhancedBalancingDashboard from '@/components/game/EnhancedBalancingDashboard';
import Options from '@/components/game/Options';
import { useGameState } from '@/hooks/useGameState';
import { TRUTH_HIGH_THRESHOLD, TRUTH_LOW_THRESHOLD } from '@/constants/truthThresholds';
import { useAudioContext } from '@/contexts/AudioContext';
import { useCardAnimation } from '@/hooks/useCardAnimation';
import CardAnimationLayer from '@/components/game/CardAnimationLayer';
import FloatingNumbers from '@/components/effects/FloatingNumbers';
import FinalEditionOverlay from '@/components/news/FinalEditionOverlay';
import FalloutOverlay from '@/expansions/tabloidRelics/RelicUI';

import { ArticlePreviewOverlay } from '@/components/newspaper/ArticlePreviewOverlay';
import ContextualHelp from '@/components/game/ContextualHelp';
import InteractiveOnboarding from '@/components/game/InteractiveOnboarding';
import MechanicsTooltip from '@/components/game/MechanicsTooltip';
import PlayerHubOverlay, { type PlayerStateIntel } from '@/components/game/PlayerHubOverlay';
import NewCardsPresentation from '@/components/game/NewCardsPresentation';
import { Maximize, Menu, Minimize, UserCircle2 } from 'lucide-react';
import { useCardCollection } from '@/hooks/useCardCollection';
import { useSynergyDetection } from '@/hooks/useSynergyDetection';
import { planDiscardOutcome } from '@/utils/discardPlanner';
import { isHumanActionWindow } from '@/hooks/playerActionWindow';
import { evaluateStandardVictory } from '@/game/victoryRules';
import {
  safeGetLocalStorageItem,
  safeRemoveLocalStorageItem,
  safeSetLocalStorageItem,
} from '@/utils/storage';
import {
  aggregateStateCombinationEffects,
  applyDefenseBonusToStates,
  createDefaultCombinationEffects,
} from '@/data/stateCombinations';
import { VisualEffectsCoordinator } from '@/utils/visualEffects';
import ExtraEditionNewspaper from '@/components/game/ExtraEditionNewspaper';
import InGameOptions from '@/components/game/InGameOptions';
import EnhancedNewspaper from '@/components/game/EnhancedNewspaper';
import { VictoryConditions } from '@/components/game/VictoryConditions';
import toast, { Toaster } from 'react-hot-toast';
import { chooseEditor, isEditorsExpansionEnabled } from '@/expansions/editors/EditorsUI';
import { describeEditorEffect, type EditorEffect, type EditorId } from '@/expansions/editors/EditorsEngine';
import { portraitUrl } from '@/game/editorImages';
import type {
  ActiveCampaignArcState,
  ActiveParanormalHotspot,
  PendingCampaignArcEvent,
} from '@/hooks/gameStateTypes';
import type { TabloidRelicRuntimeEntry } from '@/expansions/tabloidRelics/RelicTypes';
import { getStateByAbbreviation, getStateById } from '@/data/usaStates';
import type { ParanormalSighting } from '@/types/paranormal';
import { areMapVfxEnabled, areParanormalEffectsEnabled } from '@/state/settings';
import type { GameCard } from '@/rules/mvp';
import type { GameEvent } from '@/data/eventDatabase';
import { EVENT_DATABASE } from '@/data/eventDatabase';
import {
  CRYPTID_SIGHTING_TAGLINES,
  HOTSPOT_EXPIRE_TAGLINES,
  HOTSPOT_RESOLUTION_TAGLINES,
  HOTSPOT_SPAWN_TAGLINES,
} from '@/data/paranormalTaglines';
import { getLastComboSummary } from '@/game/comboEngine';
import { usePressArchive } from '@/hooks/usePressArchive';
import { useIntelArchive } from '@/hooks/useIntelArchive';
import type { IntelArchiveDraft } from '@/hooks/useIntelArchive';
import { upsertParanormalSighting } from '@/utils/paranormalSightings';
import { buildFinalEdition as buildGameOverReport } from '@/utils/finalEdition';
import type { GameOverReport } from '@/types/finalEdition';
import type { ArcProgressSummary } from '@/types/campaign';
import { buildFinalEdition as buildNewsFinalEdition, type FinalEdition } from '@/news/headlineEngine';
import type { TurnLog } from '@/news/types';
import { loadNewsPools } from '@/news/newsPools';
import { initNewsPools } from '@/engine/news/newsPools';
import { toPlayedLite } from '@/hooks/aiHelpers';
import { useCardPreview } from '@/hooks/useCardPreview';
import { BreakingNewsTicker } from '@/components/newspaper/BreakingNewsTicker';
import {
  dispatchBreakingNews,
  newsForCardPlay,
  newsForStateCapture,
  newsForTruthChange,
  newsForCombo,
  newsForTurnEnd,
} from '@/lib/newsEventHelpers';
import { useOnlineGame, serializeGameState, type LobbyState, type PlayerRole, type SerializedGameState } from '@/multiplayer';
import { OnlineLobby } from '@/components/multiplayer/OnlineLobby';
import { TurnLockOverlay } from '@/components/multiplayer/TurnLockOverlay';
import { ConnectionStatusBadge } from '@/components/multiplayer/ConnectionStatus';

type ContextualEffectType = Parameters<typeof VisualEffectsCoordinator.triggerContextualEffect>[0];

type ObjectiveSectionId = 'victory' | 'secret-agenda';

type CampaignStage = 'intro' | 'advance' | 'finale';

const fillTemplate = (template: string, tokens: Record<string, string | number>): string => {
  if (!template) {
    return '';
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = tokens[key];
    return value === undefined || value === null ? '' : String(value);
  });
};

const formatArcName = (arcId: string): string => {
  return arcId
    .replace(/^campaign_/, '')
    .split('_')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const resolveEventStateName = (event: GameEvent): string | null => {
  const stateId = event.paranormalHotspot?.stateId;
  if (!stateId) return null;
  const state = getStateById(stateId) ?? getStateByAbbreviation(stateId);
  return state?.name ?? null;
};

const buildCampaignBroadcastContext = (params: {
  arc: ActiveCampaignArcState;
  event?: GameEvent;
  stage: CampaignStage;
}): { intensity: 'surge' | 'collapse'; setList: string[]; tagline: string } | null => {
  const { arc, event, stage } = params;
  if (!event) return null;
  
  const intensity = event.faction === 'truth' ? 'surge' : 'collapse';
  const setList = [`${formatArcName(arc.arcId)} Chapter ${arc.currentChapter}`];
  const tagline = stage === 'finale' 
    ? `${event.title} - FINALE` 
    : event.title;
  
  return { intensity, setList, tagline };
};

const buildCampaignHotspotTagline = (params: {
  arc: ActiveCampaignArcState;
  event?: GameEvent;
  stage: CampaignStage;
}): string | null => {
  const { arc, event, stage } = params;
  if (!event) return null;
  
  if (stage === 'finale') {
    return `${formatArcName(arc.arcId)} finale concluded`;
  }
  return `${formatArcName(arc.arcId)} Ch.${arc.currentChapter}: ${event.title}`;
};

const determineTruthBroadcastContext = (
  intensity: 'surge' | 'collapse',
  source?: 'truth' | 'government'
): ContextualEffectType => {
  if (intensity === 'surge') {
    return source === 'government' ? 'media_blast' : 'conspiracy_revealed';
  }
  return 'government_crackdown';
};

const determineStateEventContext = (eventType?: string): ContextualEffectType | null => {
  if (!eventType) return null;
  
  const lowerType = eventType.toLowerCase();
  if (lowerType.includes('capture') || lowerType.includes('control')) {
    return 'conspiracy_revealed';
  }
  if (lowerType.includes('attack') || lowerType.includes('damage')) {
    return 'government_crackdown';
  }
  if (lowerType.includes('defense') || lowerType.includes('fortify')) {
    return 'surveillance_detected';
  }
  return null;
};

const SYNERGY_SIGHTING_TAGLINES = [
  'Operations deck logs a synergy wave worth +{{BONUS}} IP.',
  'Mole-people analytics confirm a +{{BONUS}} IP synergy spike.',
  'Coordinated combo burst yields +{{BONUS}} IP for the newsroom.',
  'Command hub prints a +{{BONUS}} IP dividend from linked maneuvers.',
] as const;

const BROADCAST_SIGHTING_TAGLINES = [
  'Truth feed overridden by {{TRACK}} — intensity {{INTENSITY}}.',
  'Broadcast control scrambles as {{TRACK}} loops at {{INTENSITY}} levels.',
  'Emergency playlist replaced with {{TRACK}}; monitors flag {{INTENSITY}} surge.',
  'Signal chain jammed by {{TRACK}} while meters peg {{INTENSITY}}.',
] as const;

const resolveStateName = (stateId: string): string => {
  const state = getStateById(stateId) ?? getStateByAbbreviation(stateId);
  return state?.name ?? stateId;
};

const normalizeCardFaction = (faction: GameCard['faction']): 'truth' | 'government' => {
  const normalized = typeof faction === 'string' ? faction.toLowerCase() : '';
  return normalized.includes('government') ? 'government' : 'truth';
};

const determineCardContextualEffect = (
  card: GameCard,
): ContextualEffectType | null => {
  const faction = normalizeCardFaction(card.faction);
  const type = card.type;
  const truthDelta = typeof (card.effects as { truthDelta?: number } | undefined)?.truthDelta === 'number'
    ? (card.effects as { truthDelta?: number }).truthDelta
    : 0;
  const ipDelta = typeof (card.effects as { ipDelta?: { player?: number; opponent?: number } } | undefined)?.ipDelta === 'object'
    ? (card.effects as { ipDelta?: { player?: number; opponent?: number } }).ipDelta ?? {}
    : {};

  if (type === 'ATTACK') {
    return 'government_crackdown';
  }
  if (type === 'MEDIA' && truthDelta !== 0) {
    return faction === 'truth' ? 'conspiracy_revealed' : 'media_blast';
  }
  if (type === 'MEDIA' && (ipDelta.player ?? 0) > 0) {
    return 'evidence_leaked';
  }
  return null;
};

const detectReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;

type DragHoverState = {
  stateId: string;
  status: 'valid' | 'invalid';
  label?: string;
};

type DropEvaluation =
  | { type: 'none' }
  | { type: 'map'; status: 'valid' | 'invalid' }
  | { type: 'state'; stateId: string; status: 'valid' | 'invalid'; label?: string };

const Index = () => {
  const isCompactBattle = useIsMobile(1024);
  const [showMenu, setShowMenu] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [showOnlineLobby, setShowOnlineLobby] = useState(false);
  const [isOnlineGame, setIsOnlineGame] = useState(false);
  const [onlineRole, setOnlineRole] = useState<PlayerRole | null>(null);
  const [onlineLobbyData, setOnlineLobbyData] = useState<LobbyState | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBalancing, setShowBalancing] = useState(false);
  const [balancingInitialView, setBalancingInitialView] = useState<'analysis' | 'dev-tools'>('analysis');
  const [showPlayerHub, setShowPlayerHub] = useState(false);
  const [playerHubSource, setPlayerHubSource] = useState<'menu' | 'game'>('menu');
  const [lastSelectedFaction, setLastSelectedFaction] = useState<'truth' | 'government'>(() => {
    const stored = safeGetLocalStorageItem('shadowgov-last-faction');
    if (stored === 'truth' || stored === 'government') {
      return stored;
    }

    return 'government';
  });
  const [loadingCard, setLoadingCard] = useState<string | null>(null);
  const [pendingDiscards, setPendingDiscards] = useState<string[]>([]);
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
  const [draggedCardState, setDraggedCardState] = useState<{
    card: GameCard;
    position: { x: number; y: number };
    pointerType: string;
  } | null>(null);
  const [dragHoverState, setDragHoverState] = useState<DragHoverState | null>(null);
  const [isVictoryOverlayOpen, setIsVictoryOverlayOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showInGameOptions, setShowInGameOptions] = useState(false);
  const [finalEdition, setFinalEdition] = useState<GameOverReport | null>(null);
  const [newsFinalEdition, setNewsFinalEdition] = useState<FinalEdition | null>(null);
  const [areNewsPoolsReady, setAreNewsPoolsReady] = useState(false);
  const [readingEdition, setReadingEdition] = useState<GameOverReport | null>(null);
  const [showExtraEdition, setShowExtraEdition] = useState(false);
  const [isEndingTurn, setIsEndingTurn] = useState(false);
  const [paranormalSightings, setParanormalSightings] = useState<ParanormalSighting[]>([]);
  const [arcProgressSummaries, setArcProgressSummaries] = useState<Record<string, ArcProgressSummary>>({});
  const [inspectedPlayedCard, setInspectedPlayedCard] = useState<GameCard | null>(null);
  const [activeRelicFallout, setActiveRelicFallout] = useState<TabloidRelicRuntimeEntry | null>(null);
  const [finalMvpCard, setFinalMvpCard] = useState<GameCard | null>(null);
  const [finalRunnerUpCard, setFinalRunnerUpCard] = useState<GameCard | null>(null);
  const [finalComboSummaries, setFinalComboSummaries] = useState<Array<{ headline: string; cards: string[] }>>([]);
  const [finalStateResults, setFinalStateResults] = useState<Array<{ name: string; owner: 'player' | 'ai' | 'neutral' }>>([]);

  const prevIPCacheRef = useRef<number | null>(null);
  const lastVictoryRef = useRef<number | null>(null);
  const lastPlayHistoryLengthRef = useRef(0);
  const previousTruthRef = useRef<number | null>(null);
  const previousTurnRef = useRef<number | null>(null);
  const hasStartedMenuMusicRef = useRef(false);

  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeObjectivePanel, setActiveObjectivePanel] = useState<ObjectiveSectionId>('victory');
  
  const {
    gameState,
    initGame,
    assignSecretAgenda,
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
    hotspotDirector,
  } = useGameState();
  const onlineGame = useOnlineGame();
  const audio = useAudioContext();
  const { setMenuMusic } = audio;
  const { animatePlayCard, isAnimating } = useCardAnimation();
  const { discoverCard, playCard: recordCardPlay } = useCardCollection();
  const { checkSynergies, getActiveCombinations, getTotalBonusIP } = useSynergyDetection();
  const { previewState, openPreview, closePreview } = useCardPreview();
  const handlePreviewArticle = useCallback(
    (card: GameCard) => {
      openPreview(card.id, card.name);
    },
    [openPreview]
  );
  const discardPreview = useMemo(
    () => planDiscardOutcome(gameState.hand, gameState.discardPile ?? [], pendingDiscards, gameState.ip),
    [gameState.hand, gameState.discardPile, pendingDiscards, gameState.ip]
  );
  const queuedDiscardNames = useMemo(
    () =>
      discardPreview.discardedCards
        .map(card => card.name?.trim() || card.id)
        .filter(Boolean),
    [discardPreview.discardedCards]
  );

  const hydrateReportCards = useCallback(
    (report: GameOverReport | null) => {
      if (!report) {
        setFinalMvpCard(null);
        setFinalRunnerUpCard(null);
        setFinalComboSummaries([]);
        return;
      }

      const findCardById = (
        cardId?: string | null,
        fallbackName?: string,
        fallbackFaction?: GameCard['faction'],
      ): GameCard | null => {
        if (!cardId) {
          return null;
        }

        const match = gameState.playHistory.find(entry => entry.card.id === cardId);
        if (match) {
          return match.card;
        }

        return {
          id: cardId,
          name: fallbackName ?? cardId,
          type: 'MEDIA',
          faction: fallbackFaction ?? 'truth',
          cost: 0,
          text: '',
        } as GameCard;
      };

      setFinalMvpCard(findCardById(report.mvp?.cardId, report.mvp?.cardName, report.mvp?.faction));
      setFinalRunnerUpCard(
        findCardById(report.runnerUp?.cardId, report.runnerUp?.cardName, report.runnerUp?.faction),
      );

      const combos = report.comboHighlights.map(combo => {
        const details: string[] = [];
        if (combo.description) {
          details.push(combo.description);
        }
        if (combo.rewardLabel) {
          details.push(combo.rewardLabel);
        }

        return {
          headline: `${combo.name} • ${combo.ownerLabel}`,
          cards: details.length > 0 ? details : [combo.name],
        };
      });

      setFinalComboSummaries(combos);
    },
    [gameState.playHistory],
  );
  const findStateByIdentifier = useCallback(
    (identifier?: string | null) => {
      if (!identifier) return null;
      const normalized = identifier.trim().toLowerCase();
      if (!normalized) return null;

      return (
        gameState.states.find(state => {
          const abbreviation = typeof state.abbreviation === 'string' ? state.abbreviation.toLowerCase() : undefined;
          const id = typeof state.id === 'string' ? state.id.toLowerCase() : undefined;
          const name = typeof state.name === 'string' ? state.name.toLowerCase() : undefined;
          return abbreviation === normalized || id === normalized || name === normalized;
        }) ?? null
      );
    },
    [gameState.states]
  );

  const evaluateDropTarget = useCallback(
    (card: GameCard, position: { x: number; y: number }): DropEvaluation => {
      if (typeof document === 'undefined') {
        return { type: 'none' };
      }

      const element = document.elementFromPoint(position.x, position.y);
      if (!element) {
        return { type: 'none' };
      }

      const targetElement = element instanceof Element ? element : null;
      const stateElement = targetElement?.closest?.('[data-state-abbr], [data-state-id]') as Element | null;

      if (stateElement) {
        const identifier =
          stateElement.getAttribute('data-state-abbr') ?? stateElement.getAttribute('data-state-id') ?? undefined;
        const matched = findStateByIdentifier(identifier);
        const canonicalId = matched?.abbreviation ?? matched?.id ?? matched?.name ?? identifier ?? '';
        const owner = matched?.owner;
        const isZone = (card.type ?? '').toUpperCase() === 'ZONE';
        const status: 'valid' | 'invalid' = isZone && owner === 'player' ? 'invalid' : 'valid';

        return {
          type: 'state',
          stateId: canonicalId,
          status,
          label: matched?.name ?? canonicalId,
        } as const;
      }

      const mapElement = targetElement?.closest?.('#us-map-stage');
      if (mapElement) {
        const isZone = (card.type ?? '').toUpperCase() === 'ZONE';
        return { type: 'map', status: isZone ? 'invalid' : 'valid' } as const;
      }

      return { type: 'none' } as const;
    },
    [findStateByIdentifier]
  );

  const evaluateDragHover = useCallback(
    (card: GameCard, position: { x: number; y: number }) => {
      const evaluation = evaluateDropTarget(card, position);
      if (evaluation.type === 'state') {
        setDragHoverState({ stateId: evaluation.stateId, status: evaluation.status, label: evaluation.label });
      } else {
        setDragHoverState(null);
      }
      return evaluation;
    },
    [evaluateDropTarget]
  );

  const handleHandDragStart = useCallback(
    (card: GameCard, position: { x: number; y: number; pointerType: string }) => {
      setDraggedCardState({ card, position: { x: position.x, y: position.y }, pointerType: position.pointerType });
      evaluateDragHover(card, position);
    },
    [evaluateDragHover]
  );

  const handleHandDragMove = useCallback(
    (card: GameCard, position: { x: number; y: number; pointerType: string }) => {
      setDraggedCardState(prev =>
        prev && prev.card.id === card.id
          ? { ...prev, position: { x: position.x, y: position.y }, pointerType: position.pointerType }
          : { card, position: { x: position.x, y: position.y }, pointerType: position.pointerType }
      );
      evaluateDragHover(card, position);
    },
    [evaluateDragHover]
  );
  const finalEditionTurnLogs = useMemo<TurnLog[]>(() => {
    if (!Array.isArray(gameState.playHistory) || gameState.playHistory.length === 0) {
      return [];
    }

    const grouped = new Map<string, TurnLog>();

    for (const record of gameState.playHistory) {
      const lite = toPlayedLite(record);
      if (!lite) {
        continue;
      }
      const key = `${record.round}:${record.turn}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.plays.push(lite);
      } else {
        grouped.set(key, {
          round: record.round,
          turn: record.turn,
          plays: [lite],
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) => {
      if (a.round === b.round) {
        return a.turn - b.turn;
      }
      return a.round - b.round;
    });
  }, [gameState.playHistory]);
  const {
    issues: pressArchive,
    archiveEdition,
    removeEditionFromArchive,
    agendaMoments,
  } = usePressArchive();
  const {
    entries: intelArchiveEntries,
    archiveIntelEvents,
    removeIntelFromArchive,
    clearArchive: clearIntelArchive,
  } = useIntelArchive();

  const editorEffects = useMemo(() => {
    const editor = gameState.editorDef;
    if (!editor) {
      return null;
    }

    const describe = (effect?: EditorEffect | null): string[] =>
      describeEditorEffect(effect ?? {});

    return {
      bonuses: describe(editor.bonuses ?? {}),
      tradeoffs: describe(editor.tradeoffs ?? {}),
      modifiers: describe(editor.modifiers ?? {}),
    };
  }, [gameState.editorDef]);

  const editorFlavor = useMemo(() => {
    const editor = gameState.editorDef;
    if (!editor) {
      return null;
    }
    return editor.quote ?? (editor as { flavor?: string | null }).flavor ?? null;
  }, [gameState.editorDef]);

  const editorPortraitSrc = useMemo(() => {
    const definition = gameState.editorDef;
    if (!definition) {
      return null;
    }

    return portraitUrl(definition.id, definition.portrait);
  }, [gameState.editorDef]);

  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [hasAcknowledgedObjectives, setHasAcknowledgedObjectives] = useState(() => gameState.turn > 3);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => detectReducedMotion());
  const previousAgendaIdRef = useRef<string | null>(null);
  const relicFalloutSeenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const currentAgendaId = gameState.secretAgenda?.id ?? null;
    if (previousAgendaIdRef.current && currentAgendaId && previousAgendaIdRef.current !== currentAgendaId) {
      setHasAcknowledgedObjectives(false);
    }
    if (!previousAgendaIdRef.current && currentAgendaId) {
      setHasAcknowledgedObjectives(false);
    }
    previousAgendaIdRef.current = currentAgendaId;
  }, [gameState.secretAgenda?.id]);

  useEffect(() => {
    const runtime = gameState.tabloidRelicsRuntime ?? null;

    if (!runtime || runtime.entries.length === 0) {
      relicFalloutSeenRef.current.clear();
      if (activeRelicFallout) {
        setActiveRelicFallout(null);
      }
      return;
    }

    const currentIds = new Set(runtime.entries.map(entry => entry.uid));
    for (const seenId of Array.from(relicFalloutSeenRef.current)) {
      if (!currentIds.has(seenId)) {
        relicFalloutSeenRef.current.delete(seenId);
      }
    }

    if (activeRelicFallout) {
      return;
    }

    const nextRelic = [...runtime.entries]
      .filter(entry => entry.status === 'active')
      .sort((a, b) => {
        if (a.triggeredOnRound !== b.triggeredOnRound) {
          return b.triggeredOnRound - a.triggeredOnRound;
        }
        if (a.remaining !== b.remaining) {
          return b.remaining - a.remaining;
        }
        return a.uid.localeCompare(b.uid);
      })
      .find(entry => !relicFalloutSeenRef.current.has(entry.uid));

    if (nextRelic) {
      relicFalloutSeenRef.current.add(nextRelic.uid);
      setActiveRelicFallout(nextRelic);
    }
  }, [gameState.tabloidRelicsRuntime, activeRelicFallout]);

  useEffect(() => {
    if (gameState.turn <= 1) {
      setHasAcknowledgedObjectives(false);
    } else if (gameState.turn > 3) {
      setHasAcknowledgedObjectives(true);
    }
  }, [gameState.turn]);

  useEffect(() => {
    if (isObjectivesOpen) {
      setHasAcknowledgedObjectives(true);
    }
  }, [isObjectivesOpen]);

  const shouldPulseObjectives = !hasAcknowledgedObjectives && !isObjectivesOpen && !prefersReducedMotion;

  const persistFaction = useCallback((faction: 'truth' | 'government') => {
    setLastSelectedFaction(faction);
    safeSetLocalStorageItem('shadowgov-last-faction', faction);
  }, []);

  const persistPlayerEditor = useCallback((editorId: EditorId | null) => {
    if (editorId) {
      safeSetLocalStorageItem('shadowgov-last-player-editor', editorId);
    } else {
      safeRemoveLocalStorageItem('shadowgov-last-player-editor');
    }
  }, []);

  const persistPrevIP = useCallback((value: number | null) => {
    prevIPCacheRef.current = value;
    if (value === null) {
      safeRemoveLocalStorageItem('prevIP');
      return;
    }

    safeSetLocalStorageItem('prevIP', value.toString());
  }, []);

  const handleRelicOverlayClose = useCallback(() => {
    setActiveRelicFallout(null);
  }, []);

  const handleArcProgress = useCallback((entries: ArcProgressSummary[]) => {
    if (!entries.length) {
      return;
    }
    setArcProgressSummaries(prev => {
      const next = { ...prev };
      for (const entry of entries) {
        next[entry.arcId] = entry;
      }
      return next;
    });
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
    setParanormalSightings(prev => upsertParanormalSighting(prev, entry));
    registerParanormalSighting(entry.metadata?.source ?? undefined);
  }, [registerParanormalSighting]);

  const hotspotHistoryRef = useRef<Record<string, ActiveParanormalHotspot>>({});
  const activeHotspotByStateRef = useRef<Record<string, ActiveParanormalHotspot>>({});
  const hotspotLogCursorRef = useRef<number>(0);
  const hotspotLogInitializedRef = useRef<boolean>(false);
  const archivedIntelIdsRef = useRef<Set<string>>(new Set());
  const campaignArcSnapshotRef = useRef<Map<string, ActiveCampaignArcState>>(new Map());
  const campaignArcInitializedRef = useRef(false);
  const campaignPendingAnnouncementsRef = useRef<Set<string>>(new Set());

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

  const pendingArcDetails = useMemo(() => {
    const map = new Map<string, { entry: PendingCampaignArcEvent; event?: GameEvent }>();
    (gameState.pendingArcEvents ?? []).forEach(entry => {
      const existing = map.get(entry.arcId);
      if (!existing || entry.chapter < existing.entry.chapter) {
        map.set(entry.arcId, {
          entry,
          event: eventLookup.get(entry.eventId) ?? EVENT_DATABASE.find(evt => evt.id === entry.eventId),
        });
      }
    });
    return map;
  }, [gameState.pendingArcEvents, eventLookup]);

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
      paranormalHotspotHistory: Array.isArray(state.paranormalHotspotHistory)
        ? [...state.paranormalHotspotHistory]
        : [],
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

  useEffect(() => {
    if (!campaignArcInitializedRef.current) {
      campaignArcInitializedRef.current = true;
      campaignArcSnapshotRef.current = new Map(
        gameState.activeCampaignArcs.map(arc => [arc.arcId, { ...arc }]),
      );
      return;
    }

    const previous = campaignArcSnapshotRef.current;
    const reducedMotion = detectReducedMotion();

    gameState.activeCampaignArcs.forEach(arc => {
      const prev = previous.get(arc.arcId);
      let stage: CampaignStage | null = null;

      if (!prev) {
        stage = 'intro';
      } else if (arc.status === 'completed' && prev.status !== 'completed') {
        stage = 'finale';
      } else if (
        arc.currentChapter > prev.currentChapter
        || prev.lastEventId !== arc.lastEventId
      ) {
        stage = 'advance';
      }

      if (!stage) {
        return;
      }

      const currentEvent = eventLookup.get(arc.lastEventId)
        ?? EVENT_DATABASE.find(event =>
          event.campaign?.arcId === arc.arcId
          && event.campaign.chapter === arc.currentChapter,
        );

      const arcLabel = formatArcName(arc.arcId);
      const broadcastContext = buildCampaignBroadcastContext({ arc, event: currentEvent, stage });

      if (broadcastContext) {
        const broadcastPosition = VisualEffectsCoordinator.getRandomCenterPosition(stage === 'finale' ? 80 : 160);
        VisualEffectsCoordinator.triggerTruthMeltdownBroadcast({
          position: broadcastPosition,
          intensity: broadcastContext.intensity,
          setList: broadcastContext.setList,
          truthValue: Math.round(gameState.truth),
          reducedMotion,
          source: currentEvent?.faction === 'neutral' ? 'truth' : currentEvent?.faction,
        });
        if (stage === 'finale') {
          VisualEffectsCoordinator.triggerTruthFlash(broadcastPosition);
        }

        const timestamp = Date.now();
        pushSighting({
          id: `campaign-broadcast-${arc.arcId}-${arc.currentChapter}-${timestamp}`,
          timestamp,
          category: 'truth-meltdown',
          headline: `${arcLabel.toUpperCase()} CHAPTER ${arc.currentChapter}`,
          subtext: broadcastContext.tagline,
          location: 'National Broadcast Grid',
          metadata: {
            setList: broadcastContext.setList,
            intensity: broadcastContext.intensity,
            truthValue: Math.round(gameState.truth),
            source: currentEvent?.faction === 'neutral' ? 'truth' : currentEvent?.faction,
          },
        });

        const nextEvent = pendingArcDetails.get(arc.arcId)?.event;
        const message = stage === 'finale'
          ? `${arcLabel}: Finale resolved!`
          : `${arcLabel}: Chapter ${arc.currentChapter} ${stage === 'intro' ? 'initiated' : 'escalated'}!`;
        const followUp = nextEvent ? ` Next: ${nextEvent.title}` : '';
        toast.success(`${message}${followUp}`, {
          id: `campaign-arc-${arc.arcId}-${arc.currentChapter}`,
        });

        audio.playSFX(stage === 'finale' ? 'victory' : 'turnEnd');
      }

      const hotspotTagline = buildCampaignHotspotTagline({ arc, event: currentEvent, stage });
      if (hotspotTagline && currentEvent?.paranormalHotspot) {
        const hotspotStateName = resolveEventStateName(currentEvent) ?? 'Unknown Site';
        const rawStateId = currentEvent.paranormalHotspot.stateId;
        const normalizedStateId = rawStateId?.trim();
        const resolvedState = normalizedStateId
          ? getStateById(normalizedStateId)
            ?? getStateByAbbreviation(normalizedStateId.toUpperCase())
          : undefined;
        const hotspotStateAbbreviation = resolvedState?.abbreviation
          ?? normalizedStateId?.toUpperCase();
        const hotspotPosition =
          VisualEffectsCoordinator.getStateCenterPosition({
            stateId: currentEvent.paranormalHotspot.stateId,
            stateAbbreviation: hotspotStateAbbreviation,
          }) ?? VisualEffectsCoordinator.getScreenCenter();
        if (
          !reducedMotion
          && areMapVfxEnabled()
          && areParanormalEffectsEnabled()
        ) {
          VisualEffectsCoordinator.triggerParanormalHotspot({
            position: hotspotPosition,
            stateId: hotspotStateAbbreviation
              ?? currentEvent.paranormalHotspot.stateId
              ?? hotspotStateName,
            stateName: hotspotStateName,
            label: currentEvent.paranormalHotspot.label ?? currentEvent.title,
            icon: currentEvent.paranormalHotspot.icon ?? '👻',
            source: currentEvent.paranormalHotspot.source ?? 'neutral',
            defenseBoost: currentEvent.paranormalHotspot.defenseBoost,
            truthReward: currentEvent.paranormalHotspot.truthReward,
          });
        }

        const timestamp = Date.now();
        pushSighting({
          id: `campaign-hotspot-${arc.arcId}-${arc.currentChapter}-${timestamp}`,
          timestamp,
          category: 'hotspot',
          headline: `${currentEvent.paranormalHotspot.icon ?? '👻'} ${arcLabel.toUpperCase()} HOTSPOT`,
          subtext: hotspotTagline,
          location: hotspotStateName,
          metadata: {
            hotspotId: currentEvent.id,
            stateId: currentEvent.paranormalHotspot.stateId,
            stateName: hotspotStateName,
            defenseBoost: currentEvent.paranormalHotspot.defenseBoost,
            truthReward: currentEvent.paranormalHotspot.truthReward,
            duration: currentEvent.paranormalHotspot.duration,
            source: (currentEvent.paranormalHotspot.source === 'neutral' ? 'truth' : currentEvent.paranormalHotspot.source) ?? 'truth',
            outcome: stage === 'finale' ? 'captured' : 'active',
          },
        });
      }
    });

    campaignArcSnapshotRef.current = new Map(
      gameState.activeCampaignArcs.map(arc => [arc.arcId, { ...arc }]),
    );
  }, [
    audio,
    eventLookup,
    gameState.activeCampaignArcs,
    gameState.truth,
    pendingArcDetails,
    pushSighting,
  ]);

  useEffect(() => {
    const seen = campaignPendingAnnouncementsRef.current;
    const activeIds = new Set<string>();

    (gameState.pendingArcEvents ?? []).forEach(entry => {
      activeIds.add(entry.eventId);
      if (seen.has(entry.eventId)) {
        return;
      }

      const event = eventLookup.get(entry.eventId)
        ?? EVENT_DATABASE.find(evt => evt.id === entry.eventId);
      if (!event) {
        return;
      }

      const arcLabel = formatArcName(entry.arcId);
      toast(`${arcLabel} chapter ${entry.chapter} queued: ${event.title}`, {
        duration: 4000,
        icon: '📖',
        id: `campaign-pending-${entry.arcId}-${entry.chapter}`,
      });

      seen.add(entry.eventId);
    });

    seen.forEach(id => {
      if (!activeIds.has(id)) {
        seen.delete(id);
      }
    });
  }, [eventLookup, gameState.pendingArcEvents]);

  // Handle AI turns
  useEffect(() => {
    if (gameState.phase === 'ai_turn' && gameState.currentPlayer === 'ai' && !gameState.aiTurnInProgress) {
      executeAITurnRef.current?.();
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.aiTurnInProgress]);

  // Track IP changes for floating numbers
  useEffect(() => {
    const currentIP = gameState.ip;

    const storedPrevIP = safeGetLocalStorageItem('prevIP');
    let persistedPrevIP: number | null = null;

    if (storedPrevIP !== null) {
      const parsed = Number.parseInt(storedPrevIP, 10);
      if (!Number.isNaN(parsed)) {
        persistedPrevIP = parsed;
      } else {
        safeRemoveLocalStorageItem('prevIP');
      }
    }

    const previousTrackedIP =
      typeof persistedPrevIP === 'number' && Number.isFinite(persistedPrevIP)
        ? persistedPrevIP
        : prevIPCacheRef.current;

    if (typeof previousTrackedIP === 'number' && previousTrackedIP > 0 && currentIP !== previousTrackedIP) {
      const change = currentIP - previousTrackedIP;
      setFloatingNumbers({ value: change, type: 'ip' });
      setTimeout(() => setFloatingNumbers(null), 100);
    }

    persistPrevIP(currentIP);
  }, [gameState.ip, persistPrevIP]);

  // Track phase changes for context
  useEffect(() => {
    setPreviousPhase(gameState.phase);
  }, [gameState.phase]);

  // Check victory conditions and trigger game over
  useEffect(() => {
    if (gameState.winner || gameState.isGameOver || gameState.animating) {
      return;
    }

    const shouldEvaluate =
      gameState.phase === 'action' ||
      gameState.phase === 'newspaper' ||
      (gameState.phase === 'ai_turn' && !gameState.aiTurnInProgress);

    if (!shouldEvaluate) {
      return;
    }

    const victory = evaluateStandardVictory({
      truth: gameState.truth,
      truthHigh: gameState.truthHighThreshold,
      truthLow: gameState.truthLowThreshold,
      economicGoal: gameState.economicGoal,
      contenders: [
        { id: gameState.faction, faction: gameState.faction, ip: gameState.ip, states: gameState.states.filter(state => state.owner === 'player').length },
        { id: gameState.faction === 'truth' ? 'government' as const : 'truth' as const, faction: gameState.faction === 'truth' ? 'government' : 'truth', ip: gameState.aiIP, states: gameState.states.filter(state => state.owner === 'ai').length },
      ],
    });
    const winner = victory?.winner;
    const victoryType = victory?.victoryType;

    if (winner && victoryType) {
      const comboSummary = getLastComboSummary();
      const report = buildGameOverReport({
        state: {
          round: gameState.round,
          truth: gameState.truth,
          ip: gameState.ip,
          aiIP: gameState.aiIP,
          states: gameState.states,
          faction: gameState.faction,
          playHistory: gameState.playHistory,
          currentEvents: gameState.currentEvents ?? [],
          extraExtraFeed: gameState.extraExtraFeed,
          headlineLog: gameState.headlineLog,
          recurringCharacters: gameState.recurringCharacters,
        },
        winner,
        victoryType,
        playerSecretAgenda: gameState.secretAgenda,
        aiSecretAgenda: gameState.aiSecretAgenda,
        arcSummaries: arcProgressSummaries,
        paranormalSightings,
        comboSummary,
      });

      let composedNewsEdition: FinalEdition | null = null;
      if (!areNewsPoolsReady) {
        setNewsFinalEdition(null);
      } else if (finalEditionTurnLogs.length > 0 || gameState.playHistory.length === 0) {
        try {
          composedNewsEdition = buildNewsFinalEdition(
            `${gameState.faction}:${report.recordedAt}`,
            finalEditionTurnLogs.length > 0
              ? finalEditionTurnLogs
              : [{ round: gameState.round, turn: gameState.turn, plays: [] }],
          );
        } catch (error) {
          console.warn('Failed to compose final edition newspaper', error);
          composedNewsEdition = null;
        }
      }

      hydrateReportCards(report);
      setFinalStateResults(
        gameState.states.map(state => ({ name: state.name, owner: state.owner })),
      );

      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        winner,
        victoryType,
        finalEdition: report,
      }));

      setFinalEdition(report);
      setNewsFinalEdition(composedNewsEdition);
      setReadingEdition(report);
      setIsVictoryOverlayOpen(true);
    }
  }, [
    gameState.winner,
    gameState.isGameOver,
    gameState.animating,
    gameState.phase,
    gameState.aiTurnInProgress,
    gameState.truth,
    gameState.truthHighThreshold,
    gameState.truthLowThreshold,
    gameState.economicGoal,
    gameState.faction,
    gameState.ip,
    gameState.aiIP,
    gameState.controlledStates.length,
    gameState.states,
    gameState.round,
    gameState.playHistory,
    gameState.currentEvents,
    gameState.secretAgenda,
    gameState.aiSecretAgenda,
    finalEditionTurnLogs,
    arcProgressSummaries,
    paranormalSightings,
    setGameState,
    areNewsPoolsReady,
    hydrateReportCards,
  ]);

  useEffect(() => {
    const edition = gameState.finalEdition;
    if (!edition) {
      setNewsFinalEdition(null);
      hydrateReportCards(null);
      setFinalStateResults([]);
      return;
    }

    setFinalEdition(edition);
    hydrateReportCards(edition);
    setFinalStateResults(
      gameState.states.map(state => ({ name: state.name, owner: state.owner })),
    );
    if (!areNewsPoolsReady) {
      setNewsFinalEdition(null);
      return;
    }

    if (finalEditionTurnLogs.length > 0 || gameState.playHistory.length === 0) {
      try {
        const composed = buildNewsFinalEdition(
          `${gameState.faction}:${edition.recordedAt}`,
          finalEditionTurnLogs.length > 0
            ? finalEditionTurnLogs
            : [{ round: gameState.round, turn: gameState.turn, plays: [] }],
        );
        setNewsFinalEdition(prev => (prev?.seed === composed.seed ? prev : composed));
      } catch (error) {
        console.warn('Failed to refresh final edition newspaper', error);
        setNewsFinalEdition(null);
      }
    } else {
      setNewsFinalEdition(null);
    }
    if (!readingEdition) {
      setReadingEdition(edition);
    }
    if (gameState.winner && lastVictoryRef.current !== edition.recordedAt) {
      setIsVictoryOverlayOpen(true);
      lastVictoryRef.current = edition.recordedAt;
    }
  }, [
    gameState.finalEdition,
    gameState.winner,
    readingEdition,
    finalEditionTurnLogs,
    gameState.faction,
    gameState.round,
    gameState.turn,
    areNewsPoolsReady,
    gameState.states,
    hydrateReportCards,
  ]);

  useEffect(() => {
    let isMounted = true;

    const prepareNewsPools = async () => {
      try {
        await Promise.all([loadNewsPools(), initNewsPools()]);
        if (isMounted) {
          setAreNewsPoolsReady(true);
        }
      } catch (error) {
        console.error('Failed to load news pools', error);
        toast.error('Failed to load news archives for the final edition.');
      }
    };

    prepareNewsPools();

    return () => {
      isMounted = false;
    };
  }, []);

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

          const comboNews = newsForCombo(combo.name);
          if (comboNews) {
            dispatchBreakingNews(comboNews, 'update');
          }
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
    const previousCount = lastPlayHistoryLengthRef.current;
    const currentCount = gameState.playHistory.length;

    if (currentCount < previousCount) {
      lastPlayHistoryLengthRef.current = currentCount;
      return;
    }

    if (currentCount > previousCount) {
      const newPlays = gameState.playHistory.slice(previousCount);
      newPlays.forEach(play => {
        const faction = play.faction === 'government' ? 'government' : 'truth';
        const playNews = newsForCardPlay(play.card.name, faction);
        if (playNews) {
          dispatchBreakingNews(playNews, 'normal');
        }

        if (Array.isArray(play.capturedStates) && play.capturedStates.length > 0) {
          play.capturedStates.forEach(stateName => {
            const captor = play.player === 'human' ? 'player' : 'ai';
            const captureNews = newsForStateCapture(stateName, captor);
            if (captureNews) {
              dispatchBreakingNews(captureNews, 'urgent');
            }
          });
        }
      });
    }

    lastPlayHistoryLengthRef.current = currentCount;
  }, [gameState.playHistory]);

  useEffect(() => {
    const currentTruth = Math.round(gameState.truth);
    const previousTruth = previousTruthRef.current;

    if (previousTruth !== null) {
      const delta = currentTruth - previousTruth;
      if (delta !== 0) {
        const truthNews = newsForTruthChange(delta, currentTruth);
        if (truthNews) {
          const type: Parameters<typeof dispatchBreakingNews>[1] = Math.abs(delta) >= 5 ? 'urgent' : 'update';
          dispatchBreakingNews(truthNews, type);
        }
      }
    }

    previousTruthRef.current = currentTruth;
  }, [gameState.truth]);

  useEffect(() => {
    const previousTurn = previousTurnRef.current;
    const currentTurn = gameState.turn;

    if (previousTurn !== null) {
      if (currentTurn < previousTurn) {
        previousTurnRef.current = currentTurn;
        return;
      }

      if (currentTurn > previousTurn) {
        const turnNews = newsForTurnEnd(previousTurn, Math.round(gameState.truth));
        if (turnNews) {
          dispatchBreakingNews(turnNews, 'update');
        }
      }
    }

    previousTurnRef.current = currentTurn;
  }, [gameState.turn, gameState.truth]);

  useEffect(() => {
    const pickTemplate = (templates: readonly string[]): string => {
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

    const pickTemplate = (templates: readonly string[]): string => {
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
            source: (hotspot?.source === 'neutral' ? 'truth' : hotspot?.source) ?? 'truth',
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
            source: (historyEntry?.source === 'neutral' ? 'truth' : historyEntry?.source) ?? 'truth',
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
            source: (historyEntry?.source === 'neutral' ? 'truth' : historyEntry?.source) ?? 'truth',
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
    const onboardingComplete = safeGetLocalStorageItem('shadowgov-onboarding-complete');
    const onboardingSkipped = safeGetLocalStorageItem('shadowgov-onboarding-skipped');
    const hasSeenOnboarding = Boolean(onboardingComplete || onboardingSkipped);

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
    if (isEndingTurn || !isHumanActionWindow(gameState)) {
      return;
    }

    const plannedIds = pendingDiscards;
    const plan = discardPreview;

    setIsEndingTurn(true);
    endTurn(plannedIds);

    if (plan.discardedCount > 0) {
      const cardLabels = plan.discardedCards
        .map(card => card.name?.trim() || card.id)
        .filter(Boolean);
      const costSummary = plan.ipCost > 0 ? `−${plan.ipCost} IP` : 'free';
      const details = cardLabels.length > 0 ? ` · ${cardLabels.join(', ')}` : '';
      toast.success(`🗂️ Discarded ${plan.discardedCount} card${plan.discardedCount === 1 ? '' : 's'} (${costSummary})${details}`, {
        duration: 3500,
        style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #2563eb', fontFamily: 'monospace' }
      });
    }

    setPendingDiscards([]);
    audio.playSFX('turnEnd');
    // Play card draw sound after a short delay
    setTimeout(() => {
      audio.playSFX('cardDraw');
    }, 500);
  }, [
    audio,
    discardPreview,
    gameState,
    endTurn,
    isEndingTurn,
    pendingDiscards,
  ]);

  // Update Index.tsx to use enhanced components and add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || showMenu || showIntro || showInGameOptions || showHowToPlay) return;
      const target = e.target;
      if (target instanceof Element && target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="alertdialog"]')) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      if (!isHumanActionWindow(gameState)) return;

      // Number keys for playing cards (1-9)
      const cardNumber = parseInt(e.key);
      if (!e.ctrlKey && !e.metaKey && !e.altKey && cardNumber >= 1 && cardNumber <= 9 && gameState.hand[cardNumber - 1]) {
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
    gameState,
    audio,
    isEndingTurn,
    handleEndTurn,
  ]);

  useEffect(() => {
    if (gameState.phase === 'action' && gameState.currentPlayer === 'human' && !gameState.animating) {
      setIsEndingTurn(false);
    }
  }, [gameState.phase, gameState.currentPlayer, gameState.animating]);

  useEffect(() => {
    setPendingDiscards(prev => {
      if (prev.length === 0) {
        return prev;
      }
      const handIds = new Set(gameState.hand.map(card => card.id));
      const filtered = prev.filter(id => handIds.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [gameState.hand]);

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

  const startNewGame = async (
    faction: 'government' | 'truth',
    options?: { editorId?: EditorId | null },
  ) => {
    console.log('🎵 Index: Starting new game with faction:', faction);

    let resolvedEditorId = options?.editorId;
    if (resolvedEditorId === undefined && isEditorsExpansionEnabled()) {
      try {
        resolvedEditorId = await chooseEditor({ faction });
      } catch (error) {
        console.warn('[Editors] Failed to resolve editor during start flow', error);
        resolvedEditorId = null;
      }
    }

    persistFaction(faction);
    persistPlayerEditor(resolvedEditorId ?? null);
    setIsVictoryOverlayOpen(false);
    setFinalEdition(null);
    setNewsFinalEdition(null);
    setReadingEdition(null);
    setShowExtraEdition(false);
    setParanormalSightings([]);
    await initGame(faction, undefined, resolvedEditorId ?? null);
    setShowMenu(false);
    setShowIntro(false);
    audio.setGameplayMusic(faction);
    audio.playSFX('click');
    setArcProgressSummaries({});

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

  // -----------------------------------------------------------------------
  // Online Multiplayer: Start handler
  // -----------------------------------------------------------------------

  const handleOnlineMultiplayer = useCallback(() => {
    setShowOnlineLobby(true);
    setShowMenu(false);
    audio.playSFX('click');
  }, [audio]);

  const handleOnlineGameStart = useCallback(async (
    hostFaction: 'government' | 'truth',
    _guestFaction: 'government' | 'truth',
  ) => {
    // Host starts the game — init with host's faction
    const faction = onlineGame.role === 'host' ? hostFaction : _guestFaction;
    setIsOnlineGame(true);
    setOnlineRole(onlineGame.role);
    setOnlineLobbyData(onlineGame.lobby);

    // Init game for the host (guest will receive state via network)
    if (onlineGame.role === 'host') {
      await initGame(faction);
      // Broadcast the initial state to guests
      const serialized = serializeGameState(gameState);
      onlineGame.startGame(serialized);
    }

    setShowOnlineLobby(false);
    setShowMenu(false);
    setShowIntro(false);
    audio.setGameplayMusic(faction);
    audio.playSFX('click');
  }, [onlineGame, initGame, gameState, audio]);

  const handleOnlineLobbyBack = useCallback(() => {
    onlineGame.leaveRoom();
    setShowOnlineLobby(false);
    setShowMenu(true);
    setIsOnlineGame(false);
    setOnlineRole(null);
    setOnlineLobbyData(null);
  }, [onlineGame]);

  // Determine if it's this player's turn in online mode
  const isOnlineLocalTurn = useMemo(() => {
    if (!isOnlineGame || !onlineRole) return true; // Single player is always local
    // Host plays as 'human', guest plays as 'ai' in game engine terms
    if (onlineRole === 'host') {
      return gameState.currentPlayer === 'human';
    }
    return gameState.currentPlayer === 'ai';
  }, [isOnlineGame, onlineRole, gameState.currentPlayer]);

  const onlineTurnPlayerName = useMemo(() => {
    if (!isOnlineGame || !onlineLobbyData) return '';
    const activeSlot = gameState.currentPlayer === 'human' ? 0 : 1;
    const player = onlineLobbyData.players.find(p => p.slot === activeSlot);
    return player?.name ?? 'Unknown';
  }, [isOnlineGame, onlineLobbyData, gameState.currentPlayer]);

  const [targetPickerOpen, setTargetPickerOpen] = useState(false);

  const handleStateClick = (stateId: string) => {
    const card = gameState.hand.find(c => c.id === gameState.selectedCard);
    if (!card || !requiresStateTarget(card) || !isHumanActionWindow(gameState) || loadingCard) return;
    const target = validStateTarget(gameState.states, stateId);
    if (!target) { toast.error('Choose an unclaimed or rival state.'); return; }
    selectTargetState(target.id);
    setTargetPickerOpen(true);
    audio.playSFX('click');
  };

  const handleSelectCard = (cardId: string) => {
    if (!isHumanActionWindow(gameState) || gameState.cardsPlayedThisTurn >= 3) return;
    selectTargetState(null);
    selectCard(cardId);
    setTargetPickerOpen(true);
    audio.playSFX('hover');
  };

  const handlePlayCard = async (cardId: string, targetStateArg?: string, confirmedTarget = false) => {
    const card = gameState.hand.find(c => c.id === cardId);
    if (!card || isAnimating() || loadingCard || isEndingTurn || !isHumanActionWindow(gameState)) return;

    if (!(card.faction === 'government' && card.type === 'ZONE')) {
      VisualEffectsCoordinator.triggerGovernmentZoneTarget({ active: false, mode: 'complete' });
    }

    // Check if player can afford the card
    const quote = quoteHumanCard(gameState, card);
    if (gameState.ip < quote.cost) {
      toast.error(`💰 Insufficient IP! Need ${quote.cost}, have ${gameState.ip}`, {
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

    let resolvedTargetStateId: string | undefined;
    if (requiresStateTarget(card)) {
      const target = validStateTarget(gameState.states, targetStateArg ?? gameState.targetState);
      if (!confirmedTarget || !target) {
        selectCard(cardId);
        selectTargetState(target?.id ?? null);
        setTargetPickerOpen(true);
        return;
      }
      resolvedTargetStateId = target.id;
      setTargetPickerOpen(false);
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
      const playResult = await playCardAnimated(cardId, animatePlayCard, resolvedTargetStateId);
      if (playResult.cancelled) return;
      const wasCountered = playResult.countered;

      setPendingDiscards(prev => (prev.length ? prev.filter(id => id !== cardId) : prev));

      // Track card in collection
      recordCardPlay(cardId);

      if (!wasCountered) {
        // Enhanced visual effects for successful card play
        let effectPosition = VisualEffectsCoordinator.getScreenCenter();
        const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
        if (cardElement) {
          effectPosition = VisualEffectsCoordinator.getElementCenter(cardElement);

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
      }

      toast.success(wasCountered ? `${card.name} was countered.` : `${card.name} deployed.`, {
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

  const handleHandDragEnd = useCallback(
    async (
      card: GameCard,
      position: { x: number; y: number; pointerType: string; cancelled: boolean }
    ) => {
      const { cancelled, x, y } = position;
      const evaluation = evaluateDropTarget(card, { x, y });
      setDraggedCardState(null);
      setDragHoverState(null);

      if (cancelled) {
        return;
      }

      const isZone = (card.type ?? '').toUpperCase() === 'ZONE';

      if (!isZone) {
        if (evaluation.type === 'state' || evaluation.type === 'map') {
          await handlePlayCard(card.id);
        }
        return;
      }

      if (evaluation.type === 'state') {
        if (evaluation.status === 'invalid') {
          audio.playSFX('error');
          toast.error('🚫 Cannot target your own states with zone cards!', {
            duration: 3000,
            style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #ef4444' }
          });
          return;
        }

        await handlePlayCard(card.id, evaluation.stateId);
        return;
      }

      if (evaluation.type === 'map') {
        audio.playSFX('error');
        toast('🎯 Select a valid state target before deploying this zone card!', {
          duration: 4000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #eab308' }
        });
      }
    },
    [audio, evaluateDropTarget, handlePlayCard]
  );

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

  useEffect(() => {
    if (
      showMenu
      || showIntro
      || !gameState.secretAgendasEnabled
      || !gameState.faction
      || gameState.turn !== 1
      || gameState.round !== 1
      || gameState.secretAgenda
    ) {
      return;
    }

    assignSecretAgenda(null);
  }, [
    assignSecretAgenda,
    gameState.faction,
    gameState.round,
    gameState.secretAgenda,
    gameState.secretAgendasEnabled,
    gameState.turn,
    showIntro,
    showMenu,
  ]);

  // Start menu music after user interaction
  useEffect(() => {
    if (!hasStartedMenuMusicRef.current && !showIntro && showMenu) {
      setMenuMusic();
      hasStartedMenuMusicRef.current = true;
    }
  }, [showIntro, showMenu, setMenuMusic]);

  const isPlayerActionLocked =
    !isHumanActionWindow(gameState) || isEndingTurn;
  const handInteractionDisabled = isPlayerActionLocked || gameState.cardsPlayedThisTurn >= 3;
  const canQueueDiscards =
    !isPlayerActionLocked;
  const handleToggleDiscard = useCallback(
    (cardId: string) => {
      if (!canQueueDiscards) {
        return;
      }
      if (pendingDiscards.includes(cardId)) {
        setPendingDiscards(prev => prev.filter(id => id !== cardId));
        return;
      }
      const requested = [...pendingDiscards, cardId];
      const cost = planDiscardOutcome(gameState.hand, gameState.discardPile ?? [], requested).ipCost;
      if (cost > gameState.ip) {
        toast.error(`Discard queue needs ${cost} IP. You have ${gameState.ip} IP.`);
        return;
      }
      setPendingDiscards(requested);
    },
    [canQueueDiscards, pendingDiscards, gameState.hand, gameState.discardPile, gameState.ip]
  );

  const playerAgenda = gameState.secretAgenda;
  const aiControlledStates = gameState.states.filter(s => s.owner === 'ai').length;
  const aiAgenda = gameState.aiSecretAgenda;
  const aiObjectiveProgress = aiAgenda
    ? Math.min(100, (aiAgenda.progress / aiAgenda.target) * 100)
    : 0;
  const aiAssessment = gameState.aiStrategist?.getStrategicAssessment(gameState);
  const aiEditorProfile = gameState.aiEditor ? AI_EDITORS[gameState.aiEditor] : null;
  const aiEditorPortraitSrc = useMemo(() => {
    if (!aiEditorProfile) {
      return null;
    }
    return portraitUrl(aiEditorProfile.id, aiEditorProfile.image?.portrait);
  }, [aiEditorProfile]);
  const aiOpponentName = aiEditorProfile?.name ?? gameState.aiStrategist?.personality.name ?? null;
  const secretAgendasEnabled = gameState.secretAgendasEnabled !== false;

  const renderSecretAgendaPanel = (variant: 'overlay' | 'mobile') => {
    const placeholderClasses = clsx(
      'rounded border border-dashed border-newspaper-border/60 bg-newspaper-bg/40 p-3 text-xs font-mono text-newspaper-text/60',
      variant === 'overlay' && 'text-[11px]'
    );

    let content;
    if (!secretAgendasEnabled) {
      content = (
        <div className={placeholderClasses}>
          Secret agendas are disabled for this campaign.
        </div>
      );
    } else if (playerAgenda) {
      content = <SecretAgenda agenda={playerAgenda} isPlayer />;
    } else {
      content = (
        <div className={placeholderClasses}>
          No secret agenda assigned.
        </div>
      );
    }

    return (
      <div className="secret-agenda rounded border border-newspaper-border bg-newspaper-bg p-3 shadow-sm">
        {secretAgendasEnabled && gameState.secretAgendaDifficulty && (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.25em] text-newspaper-text/70">
            <span className="font-semibold">Synced Agenda Difficulty</span>
            <span className="font-mono text-newspaper-text">
              {gameState.secretAgendaDifficulty.toUpperCase()}
            </span>
          </div>
        )}
        {secretAgendasEnabled && gameState.secretAgendaDifficulty && aiAgenda && aiAgenda.difficulty !== gameState.secretAgendaDifficulty && (
          <div className="mb-2 text-[10px] font-mono text-newspaper-text/60">
            AI fallback difficulty: {aiAgenda.difficulty.toUpperCase()}
          </div>
        )}
        {content}
      </div>
    );
  };

  if (showIntro) {
    return (
      <div
        className="min-h-screen bg-government-dark flex items-center justify-center cursor-pointer"
        onClick={() => {
          setShowIntro(false);
          setMenuMusic();
          hasStartedMenuMusicRef.current = true;
        }}
      >
        <div className="text-center space-y-8">
          <div className="relative inline-flex transform -rotate-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-yellow-300 px-4 py-1 uppercase tracking-[0.35em] text-[0.65rem] sm:text-xs font-semibold shadow-[6px_6px_0_rgba(0,0,0,0.65)]">
              Paranoid Times Exclusive
            </div>
            <div className="bg-gradient-to-br from-victory-start via-victory-mid to-victory-end px-10 py-8 border-[6px] border-black shadow-[14px_14px_0_rgba(0,0,0,0.8)] text-victory-foreground">
              <div className="text-[0.85rem] sm:text-sm uppercase tracking-[0.4em] text-victory-foreground/80 font-semibold">
                Tonight&rsquo;s Cover Story
              </div>
              <div className="mt-3 text-4xl sm:text-5xl font-black uppercase leading-[0.9] drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
                You Won&rsquo;t Believe
              </div>
              <div className="text-4xl sm:text-5xl font-black uppercase leading-[0.9] text-victory-accent drop-shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
                What Happens Next...
              </div>
              <div className="mt-4 text-base sm:text-lg font-semibold italic tracking-wide text-victory-foreground/90">
                Shadow bureau insiders spill every last secret.
              </div>
            </div>
            <div className="absolute -bottom-5 right-0 bg-black text-white text-[0.65rem] sm:text-xs uppercase tracking-[0.3em] px-3 py-1 shadow-[5px_5px_0_rgba(0,0,0,0.65)] rotate-1">
              Hot Scoop
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
    
    const secretAgendasEnabled = gameState.secretAgendasEnabled !== false;

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
        agendasEnabled={secretAgendasEnabled}
        currentAgenda={secretAgendasEnabled ? gameState.secretAgenda : undefined}
        completedAgendaIds={gameState.completedSecretAgendaIds}
        agendaMoments={agendaMoments}
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

  if (showOnlineLobby) {
    return (
      <OnlineLobby
        onlineGame={onlineGame}
        onStartGame={handleOnlineGameStart}
        onBack={handleOnlineLobbyBack}
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
      onOnlineMultiplayer={handleOnlineMultiplayer}
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
          setMenuMusic();
        }}
        onSaveGame={() => saveGame()}
      />
    );
  }

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
            <li>• Reach 200 IP</li>
            <li>• Truth ≥{TRUTH_HIGH_THRESHOLD}% / ≤{TRUTH_LOW_THRESHOLD}%</li>
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
              <div className="text-sm font-mono text-newspaper-text">{gameState.ip}/200</div>
            </div>
          </div>
        </>
      ),
      mobileContent: (
        <VictoryConditions
          controlledStates={gameState.controlledStates.length}
          truth={gameState.truth}
          ip={gameState.ip}
          faction={gameState.faction}
          economicGoal={gameState.economicGoal}
          truthHigh={gameState.truthHighThreshold}
          truthLow={gameState.truthLowThreshold}
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
        <div className="flex items-center gap-3">
          {aiEditorPortraitSrc ? (
            <img
              src={aiEditorPortraitSrc}
              alt={`${aiOpponentName ?? 'AI editor'} portrait`}
              className="h-16 w-12 flex-shrink-0 rounded border border-newspaper-border/60 object-cover shadow-sm"
              loading="lazy"
            />
          ) : null}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-newspaper-text/60">Editor</span>
              <span className="font-mono text-newspaper-text">{aiOpponentName ?? 'Unknown'}</span>
            </div>
            {aiEditorProfile?.title ? (
              <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.2em] text-newspaper-text/60">
                {aiEditorProfile.title}
              </div>
            ) : null}
          </div>
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
            editorName={aiOpponentName ?? undefined}
            editorPortraitUrl={aiEditorPortraitSrc ?? undefined}
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


  const mastheadButtonClass = "touch-target inline-flex items-center justify-center border-2 border-newspaper-border bg-newspaper-text px-3 py-1.5 text-sm font-bold text-newspaper-bg shadow-[2px_2px_0_hsl(var(--newspaper-border))] transition-all duration-150 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_hsl(var(--newspaper-border))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_hsl(var(--newspaper-border))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-truth-red focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg";
  const statusBadgeClass = 'flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm';

  const mastheadContent = (
    <div
      className="masthead-stripe flex h-full items-center gap-4 border-b-4 border-newspaper-border px-2 sm:px-4"
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
        <div className="flex items-center justify-end gap-2"><NewsroomSoundControl />
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
          <div className="round-indicator flex items-center gap-1 whitespace-nowrap rounded border border-newspaper-border bg-newspaper-text px-2 py-1 text-newspaper-bg shadow-sm">
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
          {gameState.editorDef ? (
            // [EDITORS_HUD_BADGE]
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={clsx(
                    statusBadgeClass,
                    'text-[10px] font-bold uppercase tracking-wide transition hover:bg-newspaper-text/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newspaper-border focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg',
                  )}
                  data-editor-id={gameState.editorDef.id}
                >
                  ✒️ Editor: {gameState.editorDef.name}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="z-50 w-80 max-w-[min(20rem,calc(100vw-2rem))] border border-newspaper-border bg-newspaper-bg p-4 text-newspaper-text shadow-lg"
              >
                <div className="space-y-3" data-editor-badge="active">
                  <div className="flex gap-3">
                    {editorPortraitSrc ? (
                      <img
                        src={editorPortraitSrc}
                        alt={`${gameState.editorDef.name} portrait`}
                        className="h-20 w-16 rounded border border-newspaper-border/70 object-cover shadow-sm"
                        loading="lazy"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-newspaper-text/60">Desk Editor</p>
                      <h3 className="text-base font-semibold leading-tight">{gameState.editorDef.name}</h3>
                      {editorFlavor ? (
                        <p className="mt-1 text-xs italic text-newspaper-text/70">{editorFlavor}</p>
                      ) : null}
                    </div>
                  </div>
                  {editorEffects?.bonuses?.length ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-600">Bonuses</p>
                      <ul className="mt-1 space-y-1 text-xs text-emerald-700">
                        {editorEffects.bonuses.map((line, index) => (
                          <li key={`editor-bonus-${index}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {editorEffects?.tradeoffs?.length ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-600">Tradeoffs</p>
                      <ul className="mt-1 space-y-1 text-xs text-rose-700">
                        {editorEffects.tradeoffs.map((line, index) => (
                          <li key={`editor-penalty-${index}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {editorEffects?.modifiers?.length ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-600">Modifiers</p>
                      <ul className="mt-1 space-y-1 text-xs text-slate-700">
                        {editorEffects.modifiers.map((line, index) => (
                          <li key={`editor-modifier-${index}`}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>
          ) : null}
          <Popover open={isObjectivesOpen} onOpenChange={setIsObjectivesOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={clsx(
                  statusBadgeClass,
                  'text-[10px] font-bold uppercase tracking-wide transition hover:bg-newspaper-text/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-newspaper-border focus-visible:ring-offset-2 focus-visible:ring-offset-newspaper-bg',
                  shouldPulseObjectives && 'relative motion-safe:animate-objective-pulse'
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

  const contextualHelp = (
    <ContextualHelp
      inline={isCompactBattle}
      gamePhase={gameState.phase}
      currentPlayer={gameState.currentPlayer}
      selectedCard={gameState.selectedCard}
      playerIP={gameState.ip}
      controlledStates={gameState.controlledStates.length}
      hand={gameState.hand}
      targetStateId={gameState.targetState}
      onSuggestMove={(suggestion) => {
        toast(suggestion, {
          duration: 4000,
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #10b981' }
        });
      }}
    />
  );

  const battleMap = (
    <EnhancedUSAMap
      compact={isCompactBattle}
      states={gameState.states}
      onStateClick={handleStateClick}
      selectedZoneCard={gameState.selectedCard}
      selectedState={gameState.targetState}
      audio={audio}
      playerFaction={gameState.faction}
      currentTurn={gameState.turn}
      dragTarget={dragHoverState}
      isDraggingCard={Boolean(draggedCardState)}
    />
  );

  const battleHand = (
    <EnhancedGameHand
      compact
      cards={gameState.hand.map(card => ({ ...card, cost: quoteHumanCard(gameState, card).cost }))}
      onPlayCard={handlePlayCard}
      onSelectCard={handleSelectCard}
      selectedCard={gameState.selectedCard}
      disabled={handInteractionDisabled}
      currentIP={gameState.ip}
      loadingCard={loadingCard}
      discardQueue={pendingDiscards}
      onToggleDiscard={handleToggleDiscard}
      discardEnabled={canQueueDiscards}
      onCardDragStart={handleHandDragStart}
      onCardDragMove={handleHandDragMove}
      onCardDragEnd={handleHandDragEnd}
      draggingCardId={draggedCardState?.card.id ?? null}
      onPreviewArticle={handlePreviewArticle}
      isArticlePreviewOpen={previewState.isOpen}
    />
  );

  const leftPaneContent = (
    <div className="desktop-newsroom-board">
      <section className="desktop-map-column">
        <div id="game-map-board" className="map-scanlines">
          {gameState.hand.some(card => card.id === gameState.selectedCard && requiresStateTarget(card)) && (
            <div role="status" className="flex items-center justify-between gap-3 border-b-2 border-black bg-amber-100 p-3 text-sm text-black">
              <span>Choose an unowned or rival state for this card.</span>
              <Button variant="outline" onClick={() => { selectCard(null); selectTargetState(null); }}>Cancel</Button>
            </div>
          )}
          {battleMap}
        </div>
      </section>
      <aside className="desktop-played-column">
        <PlayedCardsDock playedCards={gameState.cardsPlayedThisRound} onInspectCard={card => setInspectedPlayedCard(card)} />
      </aside>
    </div>
  );

  const rightPaneContent = (
    <TooltipProvider delayDuration={150}>
      <aside className="newsroom-desk h-full min-h-0 min-w-0 flex flex-col rounded border-2 border-newspaper-border bg-newspaper-text text-newspaper-bg shadow-lg">
        <header className="relative flex items-center justify-between gap-2 border-b border-newspaper-border/60 bg-[image:var(--halftone-blue)] bg-[length:6px_6px] bg-repeat px-4 py-3">
          <h3 className="section-header text-xs font-black uppercase tracking-[0.5em]">NEWSROOM DESK</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="cursor-help rounded border border-current px-2 py-1 text-[0.65rem] font-mono font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newspaper-border"
                aria-label="View discard queue details"
              >
                Discards: {pendingDiscards.length}
              </button>
            </TooltipTrigger>
            <TooltipContent
              align="end"
              className="max-w-xs space-y-2 border border-newspaper-border bg-newspaper-bg px-3 py-2 text-[0.65rem] font-mono text-newspaper-text shadow-lg"
            >
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-newspaper-border">
                    {pendingDiscards.length === 0
                      ? 'Discard Queue'
                      : `Queued Discards (${pendingDiscards.length})`}
                  </div>
                  {pendingDiscards.length === 0 ? (
                    <div className="leading-relaxed text-newspaper-text/80">No cards queued for discard.</div>
                  ) : (
                    <>
                      {queuedDiscardNames.length > 0 && (
                        <div className="leading-relaxed text-newspaper-text/80">
                          {queuedDiscardNames.join(', ')}
                        </div>
                      )}
                      <div className="leading-relaxed">
                        IP impact:{' '}
                        <span
                          className={clsx(
                            'font-semibold',
                            discardPreview.ipCost > 0 ? 'text-truth-red' : 'text-emerald-500'
                          )}
                        >
                          {discardPreview.ipCost > 0 ? `-${discardPreview.ipCost} IP` : 'Free'}
                        </span>
                      </div>
                      {discardPreview.costBreakdown.length > 0 && (
                        <div className="text-newspaper-text/70">
                          Cost steps:{' '}
                          {discardPreview.costBreakdown
                            .map((cost, index) =>
                              index === 0
                                ? '1st: 0 (free)'
                                : (() => {
                                    const position = index + 1;
                                    const suffix = position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
                                    return `${position}${suffix}: ${cost}`;
                                  })()
                            )
                            .join(' · ')}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="leading-relaxed text-newspaper-text/70">
                  First discard each turn is free. Extra discards cost 10 IP, then +5 IP per card.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </header>
        <div className="newsroom-hand-scroll flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-3 py-3">
          {battleHand}
        </div>
        <footer className="border-t border-newspaper-border/60 px-3 pb-3 pt-2 sm:pt-3">
          <p role="status" className="mb-3 text-sm leading-relaxed">
            {gameState.currentPlayer === 'ai'
              ? 'The rival newsroom is preparing its response.'
              : `${gameState.cardsPlayedThisTurn}/3 cards played · ${gameState.ip} IP available`}
            {gameState.currentPlayer === 'human' && <span className="block text-white/75">{gameState.cardsPlayedThisTurn >= 3 ? 'Queue any discards, then go to press.' : 'Inspect a card to deploy it, or end your turn.'}</span>}
          </p>
          <Button
            id="end-turn-button"
            onClick={handleEndTurn}
            className="end-turn-button newspaper-btn-primary touch-target w-full border-3 border-black bg-truth-red py-3 font-black uppercase tracking-[0.4em] text-white shadow-[4px_4px_0_hsl(0_0%_10%)] transition duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_hsl(0_0%_10%)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_hsl(0_0%_10%)] disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_hsl(0_0%_10%)]"
            disabled={isPlayerActionLocked || isEndingTurn || Boolean(gameState.selectedCard)}
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
    </TooltipProvider>
  );

  return (
    <>
      {(() => {
        const card = gameState.hand.find(c => c.id === gameState.selectedCard && requiresStateTarget(c));
        if (!card) return null;
        const quote = quoteHumanCard(gameState, card);
        return <StateTargetPicker key={card.id} open={targetPickerOpen} card={card} states={gameState.states} ip={gameState.ip} cost={quote.cost} pressure={quote.pressure} targetId={gameState.targetState} locked={isPlayerActionLocked || Boolean(loadingCard)} onTarget={selectTargetState} onMap={() => setTargetPickerOpen(false)} onCancel={() => { setTargetPickerOpen(false); selectCard(null); selectTargetState(null); }} onConfirm={id => handlePlayCard(card.id, id, true)} />;
      })()}
      <PressDispatchTray key={gameState.playHistory[0]?.timestamp ?? "new"} records={gameState.playHistory} suspended={gameState.showNewspaper || gameState.isGameOver || targetPickerOpen || Boolean(loadingCard)} />
      {/* Online Multiplayer: Turn lock overlay + connection status */}
      {isOnlineGame && !isOnlineLocalTurn && (
        <TurnLockOverlay
          currentPlayerName={onlineTurnPlayerName}
          visible={!isOnlineLocalTurn}
        />
      )}
      {isOnlineGame && onlineGame.connectionStatus && onlineGame.roomCode && onlineRole && (
        <div className="fixed top-2 right-2 z-[60]">
          <ConnectionStatusBadge
            status={onlineGame.connectionStatus}
            roomCode={onlineGame.roomCode}
            role={onlineRole}
            playerCount={onlineGame.lobby?.players.length ?? 1}
          />
        </div>
      )}
      {isCompactBattle ? (
        <MobileBattleLayout
          round={gameState.round}
          faction={gameState.faction}
          ip={gameState.ip}
          rivalIP={gameState.aiIP}
          truth={gameState.truth}
          states={gameState.states}
          playsUsed={gameState.cardsPlayedThisTurn}
          handCount={gameState.hand.length}
          discardCount={pendingDiscards.length}
          discardCost={discardPreview.ipCost}
          aiTurn={gameState.currentPlayer === 'ai'}
          locked={isPlayerActionLocked}
          resolving={Boolean(loadingCard)}
          targetCard={gameState.hand.find(card => card.id === gameState.selectedCard && requiresStateTarget(card)) ?? null}
          playedCards={gameState.cardsPlayedThisRound}
          board={<div id="game-map-board">{battleMap}</div>}
          hand={battleHand}
          briefing={<>{renderSidebar()}{contextualHelp}</>}
          menu={close => <div className="mobile-menu-actions"><NewsroomSoundControl />
            <button type="button" onClick={() => { close(); queueMicrotask(() => window.dispatchEvent(new Event('open-press-archive'))); }}>Press dispatch archive</button>
            <button type="button" onClick={() => { close(); setShowInGameOptions(true); audio.playSFX('click'); }}>Game settings</button>
            <button type="button" onClick={() => { close(); setPlayerHubSource('game'); setShowPlayerHub(true); audio.playSFX('click'); }}>Player hub & archive</button>
            <button type="button" onClick={() => { close(); toggleFullscreen(); }}>{isFullscreen ? 'Exit full screen' : 'Full screen'}</button>
            <button type="button" onClick={() => { close(); setBalancingInitialView('analysis'); setShowBalancing(true); }}>Card lab</button>
          </div>}
          onStateClick={handleStateClick}
          onCancelTarget={() => { selectCard(null); selectTargetState(null); }}
          onInspectPlayed={setInspectedPlayedCard}
          onEndTurn={handleEndTurn}
        />
      ) : (
        <ResponsiveLayout
          masthead={mastheadContent}
          leftPane={leftPaneContent}
          rightPane={rightPaneContent}
        />
      )}

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

      <ArticlePreviewOverlay
        cardId={previewState.isOpen ? previewState.cardId : null}
        cardName={previewState.cardName}
        onClose={closePreview}
      />

      {draggedCardState && (
        <div
          className="pointer-events-none fixed z-[950]"
          style={{
            left: draggedCardState.position.x,
            top: draggedCardState.position.y,
            transform: 'translate(-50%, -60%) scale(0.98)',
          }}
        >
          <BaseCard
            card={draggedCardState.card}
            hideStamp
            size="handMini"
            className="pointer-events-none select-none"
            frameClassName="drop-shadow-[0_22px_40px_rgba(0,0,0,0.45)] ring-2 ring-yellow-200/60"
          />
        </div>
      )}

      <CardAnimationLayer />
      <FalloutOverlay relic={activeRelicFallout} onClose={handleRelicOverlayClose} />

      <CardDetailOverlay
        card={inspectedPlayedCard}
        canAfford={true}
        disabled
        onClose={() => setInspectedPlayedCard(null)}
        onPlayCard={() => {}}
      />

      <FinalEditionOverlay
        isVisible={isVictoryOverlayOpen && Boolean(finalEdition) && Boolean(newsFinalEdition)}
        edition={newsFinalEdition}
        report={finalEdition}
        playerFaction={gameState.faction}
        victoryType={gameState.victoryType}
        onContinue={() => {
          setIsVictoryOverlayOpen(false);
          setFinalEdition(null);
          setNewsFinalEdition(null);
          setReadingEdition(null);
          setShowMenu(true);
          setShowIntro(true);
        }}
        onRestart={() => {
          setIsVictoryOverlayOpen(false);
          setFinalEdition(null);
          setNewsFinalEdition(null);
          setReadingEdition(null);
          setShowExtraEdition(false);
          setShowMenu(true);
          setShowIntro(true);
          setGameState(prev => ({ ...prev, isGameOver: false, finalEdition: null }));
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
          mvpCard={finalMvpCard}
          runnerUpCard={finalRunnerUpCard}
          comboHighlights={finalComboSummaries}
          stateResults={finalStateResults}
          finalTruth={Math.round(readingEdition.finalTruth)}
          finalPlayerIP={readingEdition.ipPlayer}
          finalAiIP={readingEdition.ipAI}
          onClose={() => {
            setShowExtraEdition(false);
            const closingActiveVictory = finalEdition && isVictoryOverlayOpen && readingEdition.recordedAt === finalEdition.recordedAt;
            setReadingEdition(null);
            if (closingActiveVictory) {
              setIsVictoryOverlayOpen(false);
              setFinalEdition(null);
              setNewsFinalEdition(null);
              setShowMenu(true);
              setShowIntro(true);
              setGameState(prev => ({ ...prev, isGameOver: false, finalEdition: null }));
              audio.playMusic('theme');
            }
          }}
        />
      )}

      {!isCompactBattle && contextualHelp}

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
          round={completedRoundNumber(gameState.round)}
          faction={gameState.faction}
          truth={gameState.truth}
          turn={gameState.turn}
          ip={gameState.ip}
          controlledStates={gameState.controlledStates}
          totalStates={gameState.states?.length ?? 0}
          score={gameState.truth}
          comboTruthDelta={gameState.comboTruthDeltaThisRound}
          frontPageTriplet={gameState.frontPageTriplet ?? null}
          sightings={paranormalSightings}
          agendaIssue={gameState.agendaIssue}
          agendaMoments={agendaMoments}
          onClose={handleCloseNewspaper}
          onArcProgress={handleArcProgress}
          hotspotDirector={hotspotDirector}
          activeHotspot={gameState.activeHotspot}
          recurringCharacters={gameState.recurringCharacters}
          headlineLog={gameState.headlineLog}
          extraExtraFeed={gameState.extraExtraFeed}
        />
      )}
    </>
  );
};

export default Index;
