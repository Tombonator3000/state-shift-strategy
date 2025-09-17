import type { GameCard } from '@/rules/mvp';

export interface EffectSummaryOptions {
  targetStateName?: string;
}

const formatNumber = (value: number) => (value > 0 ? `+${value}` : `${value}`);

export function summarizeCardEffects(card: GameCard, options: EffectSummaryOptions = {}): string[] {
  const { targetStateName } = options;
  const effects = card.effects;
  if (!effects) {
    return [];
  }

  const lines: string[] = [];

  if (card.type === 'ATTACK') {
    if (typeof effects.ipDelta?.opponent === 'number' && effects.ipDelta.opponent !== 0) {
      const amount = effects.ipDelta.opponent;
      const symbol = amount > 0 ? '−' : '+';
      lines.push(`Opponent ${symbol}${Math.abs(amount)} IP`);
    }
    if (typeof effects.discardOpponent === 'number' && effects.discardOpponent > 0) {
      lines.push(`Opponent discards ${effects.discardOpponent}`);
    }
  }

  if (card.type === 'MEDIA' && typeof effects.truthDelta === 'number' && effects.truthDelta !== 0) {
    lines.push(`Truth ${formatNumber(effects.truthDelta)}%`);
  }

  if (card.type === 'ZONE' && typeof effects.pressureDelta === 'number' && effects.pressureDelta !== 0) {
    const label = targetStateName ? targetStateName : 'target state';
    lines.push(`${formatNumber(effects.pressureDelta)} Pressure in ${label}`);
  }

  return lines;
}
