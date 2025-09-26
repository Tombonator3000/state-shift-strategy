import type { GameCard } from '@/rules/mvp';
import { CARD_DATABASE } from './cardDatabase';
import {
  classifyMvpCost,
  computeMvpEffectScore,
  getExpectedMvpCost,
  getMvpEffectSummary,
  summarizeFactionCounts,
  type MvpCostStatus,
  type MvpEffectSummary,
} from './mvpAnalysisUtils';

export interface CardBalance {
  cardId: string;
  name: string;
  type: GameCard['type'];
  rarity?: GameCard['rarity'];
  cost: number;
  expectedCost: number | null;
  costStatus: MvpCostStatus;
  costDelta: number | null;
  effectSummary: MvpEffectSummary;
  effectScore: number;
  recommendations: string[];
}

export interface BalanceReport {
  timestamp: string;
  totalCards: number;
  balancedCards: number;
  undercostCards: number;
  overcostCards: number;
  factionCounts: { truth: number; government: number; neutral: number };
  averageCost: number;
  cardAnalysis: CardBalance[];
  recommendations: string[];
}

export interface CardMetrics {
  id: string;
  name: string;
  type: GameCard['type'];
  rarity?: GameCard['rarity'];
  currentCost: number;
  expectedCost: number | null;
  costStatus: MvpCostStatus;
  effectScore: number;
  notes: string[];
}

export class CardBalancer {
  private cards: GameCard[];

  constructor(cards: GameCard[] = CARD_DATABASE) {
    this.cards = cards;
  }

  generateBalancingReport(): BalanceReport {
    return analyzeCardBalance(this.cards);
  }

  getCardsNeedingAttention(): CardMetrics[] {
    const report = analyzeCardBalance(this.cards);
    return report.cardAnalysis
      .filter(card => card.costStatus !== 'On Curve')
      .map(card => ({
        id: card.cardId,
        name: card.name,
        type: card.type,
        rarity: card.rarity,
        currentCost: card.cost,
        expectedCost: card.expectedCost,
        costStatus: card.costStatus,
        effectScore: card.effectScore,
        notes: card.recommendations,
      }));
  }

  exportBalancingData() {
    const report = this.generateBalancingReport();
    const cardsNeedingAttention = this.getCardsNeedingAttention();

    return {
      report,
      cardsNeedingAttention,
      timestamp: new Date().toISOString(),
      version: 'MVP',
    };
  }
}

function buildRecommendations(card: CardBalance): string[] {
  const recs: string[] = [];

  if (card.costStatus === 'Undercosted' && card.expectedCost !== null) {
    recs.push(`Raise cost to ${card.expectedCost} IP to match MVP baseline.`);
  }

  if (card.costStatus === 'Overcosted' && card.expectedCost !== null) {
    recs.push(`Lower cost toward ${card.expectedCost} IP or add pressure.`);
  }

  if (card.effectScore === 0) {
    recs.push('No MVP effect primitives detected — confirm card text.');
  }

  if (recs.length === 0) {
    recs.push('Track in playtesting; no immediate action required.');
  }

  return recs;
}

function analyzeCard(card: GameCard): CardBalance {
  const effectSummary = getMvpEffectSummary(card);
  const expectedCost = getExpectedMvpCost(card);
  const { status: costStatus, delta: costDelta } = classifyMvpCost(card, expectedCost);
  const effectScore = computeMvpEffectScore(effectSummary);

  const base: CardBalance = {
    cardId: card.id,
    name: card.name,
    type: card.type,
    rarity: card.rarity,
    cost: card.cost,
    expectedCost,
    costStatus,
    costDelta,
    effectSummary,
    effectScore,
    recommendations: [],
  };

  return { ...base, recommendations: buildRecommendations(base) };
}

export function analyzeCardBalance(cards: GameCard[]): BalanceReport {
  const analysis = cards.map(analyzeCard);
  const totalCards = analysis.length;
  const balancedCards = analysis.filter(card => card.costStatus === 'On Curve').length;
  const undercostCards = analysis.filter(card => card.costStatus === 'Undercosted').length;
  const overcostCards = analysis.filter(card => card.costStatus === 'Overcosted').length;
  const factionCounts = summarizeFactionCounts(cards);
  const averageCost =
    totalCards > 0 ? analysis.reduce((sum, card) => sum + card.cost, 0) / totalCards : 0;

  const recommendations: string[] = [];
  if (undercostCards > totalCards * 0.15) {
    recommendations.push('Several cards sit below the MVP cost curve. Revisit their IP deltas.');
  }
  if (overcostCards > totalCards * 0.15) {
    recommendations.push('Many cards appear overcosted. Ease costs or add pressure gains.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Cost alignment looks healthy against the MVP baselines.');
  }

  return {
    timestamp: new Date().toISOString(),
    totalCards,
    balancedCards,
    undercostCards,
    overcostCards,
    factionCounts,
    averageCost,
    cardAnalysis: analysis,
    recommendations,
  };
}

export function generateBalanceReport(cards: GameCard[]): string {
  const report = analyzeCardBalance(cards);
  const header = `# MVP CARD BALANCE REPORT\nGenerated: ${new Date(report.timestamp).toLocaleString()}\n\n`;

  const overview = [
    `Total Cards Analyzed: ${report.totalCards}`,
    `On MVP Curve: ${report.balancedCards}`,
    `Undercosted: ${report.undercostCards}`,
    `Overcosted: ${report.overcostCards}`,
    `Average Cost: ${report.averageCost.toFixed(2)} IP`,
  ].join('\n');

  const factionSummary = `\nFaction Counts → Truth: ${report.factionCounts.truth}, Government: ${report.factionCounts.government}, Neutral: ${report.factionCounts.neutral}\n`;

  const recSection = `\n## Recommendations\n${report.recommendations.map(r => `- ${r}`).join('\n')}\n`;

  const detail = report.cardAnalysis
    .filter(card => card.costStatus !== 'On Curve')
    .map(card => {
      const deltaText = card.costDelta !== null ? `${card.costDelta > 0 ? '+' : ''}${card.costDelta.toFixed(1)} IP` : 'n/a';
      const percentText =
        card.effectSummary.ipDeltaOpponentPercent > 0
          ? ` + ${Math.round(card.effectSummary.ipDeltaOpponentPercent * 100)}%`
          : '';
      return `\n### ${card.name} (${card.type}${card.rarity ? ` • ${card.rarity}` : ''})\n` +
        `Current Cost: ${card.cost} (expected ${card.expectedCost ?? 'n/a'}) | Delta: ${deltaText}\n` +
        `Effects → Truth ${card.effectSummary.truthDelta}, Opponent IP ${card.effectSummary.ipDeltaOpponent}${percentText} (≈${card.effectSummary.ipDeltaOpponentExpected} late-game), Pressure ${card.effectSummary.pressureDelta}\n` +
        card.recommendations.map(rec => `- ${rec}\n`).join('');
    })
    .join('');

  return `${header}${overview}${factionSummary}${recSection}${detail}`;
}
