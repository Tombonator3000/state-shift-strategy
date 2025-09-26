import { CARD_DATABASE } from './cardDatabase';
import type { GameCard } from '@/rules/mvp';
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

export interface NetUtilityScore {
  total: number;
  breakdown: {
    truth: number;
    ip: number;
    pressure: number;
  };
}

export interface CardAnalysisResult {
  cardId: string;
  name: string;
  type: GameCard['type'];
  rarity?: GameCard['rarity'];
  faction: 'truth' | 'government' | 'neutral';
  alignment: 'Aligned' | 'Mixed' | 'Misaligned';
  alignmentReason: string;
  effects: MvpEffectSummary;
  netUtilityScore: NetUtilityScore;
  cost: number;
  expectedCost: number | null;
  costStatus: MvpCostStatus;
  costDelta: number | null;
  severity: 'Low' | 'Medium' | 'High';
  notes: string[];
  recommendations: string[];
}

export interface BalanceReport {
  timestamp: string;
  totalCards: number;
  factionCounts: { truth: number; government: number; neutral: number };
  alignmentSummary: { aligned: number; mixed: number; misaligned: number };
  costSummary: { onCurve: number; undercosted: number; overcosted: number };
  averageUtility: number;
  cardAnalysis: CardAnalysisResult[];
  globalRecommendations: string[];
}

export interface SimulationResult {
  truthWinRate: number;
  governmentWinRate: number;
  drawRate: number;
  winDrivers: Array<{
    condition: 'truth' | 'ip' | 'pressure';
    weight: number;
  }>;
}

export class FactionBalanceAnalyzer {
  private cards: GameCard[];

  constructor(cards: GameCard[] = CARD_DATABASE) {
    this.cards = cards;
  }

  private buildNetUtility(effects: MvpEffectSummary): NetUtilityScore {
    const breakdown = {
      truth: effects.truthDelta,
      ip: effects.ipDeltaOpponentExpected,
      pressure: effects.pressureDelta * 5,
    };

    return {
      breakdown,
      total: breakdown.truth + breakdown.ip + breakdown.pressure,
    };
  }

  private evaluateAlignment(
    faction: 'truth' | 'government' | 'neutral',
    effects: MvpEffectSummary
  ): { alignment: CardAnalysisResult['alignment']; reason: string } {
    if (faction === 'neutral') {
      return { alignment: 'Aligned', reason: 'Neutral cards are baseline legal in MVP.' };
    }

    if (faction === 'truth') {
      if (effects.truthDelta < 0) {
        return {
          alignment: 'Misaligned',
          reason: 'Truth cards should not suppress public truth.',
        };
      }

      if (
        effects.truthDelta === 0 &&
        effects.ipDeltaOpponentExpected <= 0 &&
        effects.pressureDelta <= 0
      ) {
        return {
          alignment: 'Mixed',
          reason: 'Limited truth gain or disruption — verify intent.',
        };
      }

      return {
        alignment: 'Aligned',
        reason: 'Promotes truth growth or damages the opposition.',
      };
    }

    // Government faction expectations
    if (effects.truthDelta > 0) {
      return {
        alignment: 'Misaligned',
        reason: 'Government suppression tools should not raise truth.',
      };
    }

    if (
      effects.truthDelta === 0 &&
      effects.ipDeltaOpponentExpected <= 0 &&
      effects.pressureDelta <= 0
    ) {
      return {
        alignment: 'Mixed',
        reason: 'Minimal suppression or board impact — double-check purpose.',
      };
    }

    return {
      alignment: 'Aligned',
      reason: 'Applies pressure or lowers truth as expected.',
    };
  }

  private analyzeCard(card: GameCard): CardAnalysisResult {
    const faction = normalizeFaction(card.faction);
    const effects = getMvpEffectSummary(card);
    const expectedCost = getExpectedMvpCost(card);
    const { status: costStatus, delta: costDelta } = classifyMvpCost(card, expectedCost);
    const netUtilityScore = this.buildNetUtility(effects);
    const alignment = this.evaluateAlignment(faction, effects);

    const notes: string[] = [];
    const recommendations: string[] = [];
    let severity: CardAnalysisResult['severity'] = 'Low';

    if (alignment.alignment === 'Misaligned') {
      severity = 'High';
      notes.push('Faction alignment conflicts with MVP expectations.');
      recommendations.push('Flip effect polarity or move card to opposing faction.');
    }

    if (costStatus !== 'On Curve') {
      severity = severity === 'High' ? 'High' : 'Medium';
      notes.push('Cost deviates from MVP table.');
      if (costDelta !== null) {
        const direction = costDelta < 0 ? 'Increase' : 'Reduce';
        recommendations.push(`${direction} cost by ${Math.abs(costDelta).toFixed(1)} IP or adjust effect size.`);
      }
    }

    if (Math.abs(netUtilityScore.total) >= 15) {
      if (severity === 'Low') severity = 'Medium';
      notes.push('High swing effect — confirm during testing.');
    }

    if (notes.length === 0) {
      notes.push('Within MVP expectations.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Track during playtest to confirm it feels fair.');
    }

    return {
      cardId: card.id,
      name: card.name,
      type: card.type,
      rarity: card.rarity,
      faction,
      alignment: alignment.alignment,
      alignmentReason: alignment.reason,
      effects,
      netUtilityScore,
      cost: card.cost,
      expectedCost,
      costStatus,
      costDelta,
      severity,
      notes,
      recommendations,
    };
  }

  generateBalanceReport(): BalanceReport {
    const cardAnalysis = this.cards.map(card => this.analyzeCard(card));
    const totalCards = cardAnalysis.length;
    const factionCounts = summarizeFactionCounts(this.cards);

    const alignmentSummary = {
      aligned: cardAnalysis.filter(card => card.alignment === 'Aligned').length,
      mixed: cardAnalysis.filter(card => card.alignment === 'Mixed').length,
      misaligned: cardAnalysis.filter(card => card.alignment === 'Misaligned').length,
    };

    const costSummary = {
      onCurve: cardAnalysis.filter(card => card.costStatus === 'On Curve').length,
      undercosted: cardAnalysis.filter(card => card.costStatus === 'Undercosted').length,
      overcosted: cardAnalysis.filter(card => card.costStatus === 'Overcosted').length,
    };

    const averageUtility =
      totalCards > 0
        ? cardAnalysis.reduce((sum, card) => sum + Math.abs(card.netUtilityScore.total), 0) / totalCards
        : 0;

    const globalRecommendations: string[] = [];
    if (alignmentSummary.misaligned > 0) {
      globalRecommendations.push(
        `${alignmentSummary.misaligned} cards violate faction expectations — reassign or retune effects.`
      );
    }

    if (costSummary.undercosted > totalCards * 0.15) {
      globalRecommendations.push('Undercosted cards exceed tolerance. Review IP deltas for offenders.');
    }

    if (costSummary.overcosted > totalCards * 0.15) {
      globalRecommendations.push('Several cards appear overcosted. Consider easing their costs.');
    }

    if (averageUtility > 12) {
      globalRecommendations.push('Average swing per card is high. Trim extremes before external demos.');
    }

    if (globalRecommendations.length === 0) {
      globalRecommendations.push('Faction spread and costs look healthy for MVP.');
    }

    return {
      timestamp: new Date().toISOString(),
      totalCards,
      factionCounts,
      alignmentSummary,
      costSummary,
      averageUtility,
      cardAnalysis,
      globalRecommendations,
    };
  }

  runBalanceSimulation(): SimulationResult {
    const analysis = this.cards.map(card => this.analyzeCard(card));

    const truthStrength = analysis
      .filter(card => card.faction === 'truth')
      .reduce((sum, card) => sum + computeMvpEffectScore(card.effects), 0);
    const governmentStrength = analysis
      .filter(card => card.faction === 'government')
      .reduce((sum, card) => sum + computeMvpEffectScore(card.effects), 0);
    const totalStrength = truthStrength + governmentStrength;

    const truthWinRate = totalStrength > 0 ? (truthStrength / totalStrength) * 100 : 50;
    const governmentWinRate = totalStrength > 0 ? (governmentStrength / totalStrength) * 100 : 50;
    const drawRate = Math.max(0, 100 - truthWinRate - governmentWinRate);

    const truthWeight = analysis.reduce((sum, card) => sum + Math.max(0, card.effects.truthDelta), 0);
    const ipWeight = analysis.reduce(
      (sum, card) => sum + Math.max(0, card.effects.ipDeltaOpponentExpected),
      0,
    );
    const pressureWeight = analysis.reduce((sum, card) => sum + Math.max(0, card.effects.pressureDelta), 0);
    const totalWeight = truthWeight + ipWeight + pressureWeight;

    const weightPercent = (value: number) => (totalWeight > 0 ? (value / totalWeight) * 100 : 0);

    return {
      truthWinRate,
      governmentWinRate,
      drawRate,
      winDrivers: [
        { condition: 'truth', weight: weightPercent(truthWeight) },
        { condition: 'ip', weight: weightPercent(ipWeight) },
        { condition: 'pressure', weight: weightPercent(pressureWeight) },
      ],
    };
  }

  exportBalanceData(): { report: BalanceReport; simulation: SimulationResult } {
    return {
      report: this.generateBalanceReport(),
      simulation: this.runBalanceSimulation(),
    };
  }
}

export function lintCardBalance(cards: GameCard[]): { errors: string[]; warnings: string[] } {
  const analyzer = new FactionBalanceAnalyzer(cards);
  const report = analyzer.generateBalanceReport();
  const errors: string[] = [];
  const warnings: string[] = [];

  report.cardAnalysis.forEach(card => {
    if (card.alignment === 'Misaligned') {
      errors.push(`${card.name}: ${card.alignmentReason}`);
    } else if (card.severity === 'High') {
      warnings.push(`${card.name}: ${card.notes.join(' ')}`);
    }
  });

  return { errors, warnings };
}

export default FactionBalanceAnalyzer;
