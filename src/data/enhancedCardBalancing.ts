import type { GameCard } from '@/rules/mvp';
import { getAllCardsSnapshot, getCoreCards } from './cardDatabase';
import {
  classifyMvpCost,
  computeMvpEffectScore,
  getExpectedMvpCost,
  getMvpEffectSummary,
  normalizeFaction,
  summarizeFactionCounts,
  type MvpCostStatus,
  type MvpEffectSummary,
} from './mvpAnalysisUtils';

export interface EnhancedCardAnalysis {
  cardId: string;
  name: string;
  type: GameCard['type'];
  faction: 'truth' | 'government' | 'neutral';
  rarity?: GameCard['rarity'];
  cost: number;
  expectedCost: number | null;
  costStatus: MvpCostStatus;
  costDelta: number | null;
  effects: MvpEffectSummary;
  mvpScore: number;
}

export interface EnhancedBalanceReport {
  totalCards: number;
  onCurve: number;
  undercosted: number;
  overcosted: number;
  costTableConformity: number;
  factionCounts: { truth: number; government: number; neutral: number };
  averageCost: number;
  averageScore: number;
  cardAnalysis: EnhancedCardAnalysis[];
  globalRecommendations: string[];
}

export interface SimulationReport {
  iterations: number;
  truthWinRate: number;
  governmentWinRate: number;
  drawRate: number;
  winConditionBreakdown: Array<{
    condition: 'truth' | 'ip' | 'pressure';
    weight: number;
  }>;
}

const EXPECTED_CORE_TOTAL = 400;
const EXPECTED_TRUTH_COUNT = 200;
const EXPECTED_GOVERNMENT_COUNT = 200;

type BalancerOptions = {
  includeExtensions?: boolean;
  cards?: GameCard[];
};

export class EnhancedCardBalancer {
  private cards: GameCard[];

  constructor(options: BalancerOptions = {}) {
    const { includeExtensions = false, cards } = options;

    if (cards) {
      this.cards = cards.map(card => ({ ...card }));
      return;
    }

    const pool = includeExtensions ? getAllCardsSnapshot() : getCoreCards();
    this.cards = pool.map(card => ({ ...card }));
  }

  private analyzeCard(card: GameCard): EnhancedCardAnalysis {
    const effects = getMvpEffectSummary(card);
    const expectedCost = getExpectedMvpCost(card);
    const { status: costStatus, delta: costDelta } = classifyMvpCost(card, expectedCost);
    const mvpScore = computeMvpEffectScore(effects);

    return {
      cardId: card.id,
      name: card.name,
      type: card.type,
      faction: normalizeFaction(card.faction),
      rarity: card.rarity,
      cost: card.cost,
      expectedCost,
      costStatus,
      costDelta,
      effects,
      mvpScore,
    };
  }

  public generateEnhancedReport(): EnhancedBalanceReport {
    const cardAnalysis = this.cards.map(card => this.analyzeCard(card));
    const totalCards = cardAnalysis.length;

    const onCurve = cardAnalysis.filter(card => card.costStatus === 'On Curve').length;
    const undercosted = cardAnalysis.filter(card => card.costStatus === 'Undercosted').length;
    const overcosted = cardAnalysis.filter(card => card.costStatus === 'Overcosted').length;

    const costTableConformity = totalCards > 0 ? (onCurve / totalCards) * 100 : 0;
    const factionCounts = summarizeFactionCounts(this.cards);
    const averageCost =
      totalCards > 0
        ? cardAnalysis.reduce((sum, card) => sum + card.cost, 0) / totalCards
        : 0;
    const averageScore =
      totalCards > 0
        ? cardAnalysis.reduce((sum, card) => sum + card.mvpScore, 0) / totalCards
        : 0;

    const globalRecommendations: string[] = [];
    globalRecommendations.push(
      `${onCurve} of ${totalCards} cards (${costTableConformity.toFixed(0)}%) match MVP cost tables.`
    );

    if (totalCards !== EXPECTED_CORE_TOTAL) {
      globalRecommendations.push(
        `Core set drift detected — expected ${EXPECTED_CORE_TOTAL} cards (200 truth + 200 government), found ${totalCards}.`,
      );
    }

    if (
      factionCounts.truth !== EXPECTED_TRUTH_COUNT ||
      factionCounts.government !== EXPECTED_GOVERNMENT_COUNT
    ) {
      globalRecommendations.push(
        `Faction counts off baseline: truth ${factionCounts.truth}, government ${factionCounts.government} (target 200 each).`,
      );
    }

    if (undercosted > totalCards * 0.15) {
      globalRecommendations.push('Large group of undercosted cards detected — raise costs or trim effects.');
    }

    if (overcosted > totalCards * 0.15) {
      globalRecommendations.push('Many cards read overpriced. Consider easing costs or boosting effects.');
    }

    const factionSpread = Math.abs(factionCounts.truth - factionCounts.government);
    if (factionSpread > 3) {
      const strongerFaction = factionCounts.truth > factionCounts.government ? 'Truth Seekers' : 'Government';
      globalRecommendations.push(
        `${strongerFaction} have noticeably more cards. Add rivals or rebalance supply.`
      );
    }

    if (averageScore > 15) {
      globalRecommendations.push('Average MVP impact is high. Revisit top-end effects before playtest.');
    }

    return {
      totalCards,
      onCurve,
      undercosted,
      overcosted,
      costTableConformity,
      factionCounts,
      averageCost,
      averageScore,
      cardAnalysis,
      globalRecommendations,
    };
  }

  public runEnhancedSimulation(iterations: number = 1000): SimulationReport {
    const cardAnalysis = this.cards.map(card => this.analyzeCard(card));

    const truthStrength = cardAnalysis
      .filter(card => card.faction === 'truth')
      .reduce((sum, card) => sum + card.mvpScore, 0);
    const governmentStrength = cardAnalysis
      .filter(card => card.faction === 'government')
      .reduce((sum, card) => sum + card.mvpScore, 0);
    const totalStrength = truthStrength + governmentStrength;

    const truthWinRate = totalStrength > 0 ? (truthStrength / totalStrength) * 100 : 50;
    const governmentWinRate = totalStrength > 0 ? (governmentStrength / totalStrength) * 100 : 50;
    const drawRate = Math.max(0, 100 - truthWinRate - governmentWinRate);

    const truthWeight = cardAnalysis.reduce(
      (sum, card) => sum + Math.max(0, card.effects.truthDelta),
      0
    );
    const ipWeight = cardAnalysis.reduce(
      (sum, card) => sum + Math.max(0, card.effects.ipDeltaOpponent),
      0
    );
    const pressureWeight = cardAnalysis.reduce(
      (sum, card) => sum + Math.max(0, card.effects.pressureDelta),
      0
    );

    const totalWeight = truthWeight + ipWeight + pressureWeight;
    const toPercent = (value: number) => (totalWeight > 0 ? (value / totalWeight) * 100 : 0);

    return {
      iterations,
      truthWinRate,
      governmentWinRate,
      drawRate,
      winConditionBreakdown: [
        { condition: 'truth', weight: toPercent(truthWeight) },
        { condition: 'ip', weight: toPercent(ipWeight) },
        { condition: 'pressure', weight: toPercent(pressureWeight) },
      ],
    };
  }

  public exportSummary() {
    return {
      generatedAt: new Date().toISOString(),
      version: 'MVP',
      report: this.generateEnhancedReport(),
      simulation: this.runEnhancedSimulation(),
    };
  }
}

export function analyzeCardBalanceEnhanced(includeExtensions: boolean = false): EnhancedBalanceReport {
  const balancer = new EnhancedCardBalancer({ includeExtensions });
  return balancer.generateEnhancedReport();
}

export function runBalanceSimulationEnhanced(
  iterations: number = 1000,
  includeExtensions: boolean = false
): SimulationReport {
  const balancer = new EnhancedCardBalancer({ includeExtensions });
  return balancer.runEnhancedSimulation(iterations);
}

export function analyzeCardBalanceForCards(cards: GameCard[]): EnhancedBalanceReport {
  const balancer = new EnhancedCardBalancer({ cards });
  return balancer.generateEnhancedReport();
}

export function runBalanceSimulationForCards(
  cards: GameCard[],
  iterations: number = 1000,
): SimulationReport {
  const balancer = new EnhancedCardBalancer({ cards });
  return balancer.runEnhancedSimulation(iterations);
}
