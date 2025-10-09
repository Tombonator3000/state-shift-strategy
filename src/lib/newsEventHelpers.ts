/**
 * Helper functions for dispatching news events during gameplay
 * These integrate with the BreakingNewsTicker component
 */

export type NewsEventType = 'urgent' | 'normal' | 'update';

/**
 * Dispatch a breaking news event
 */
export function dispatchBreakingNews(text: string, type: NewsEventType = 'normal') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('breaking-news', {
        detail: { text, type },
      })
    );
  }
}

/**
 * Generate news text for card plays
 */
export function newsForCardPlay(cardName: string, faction: 'truth' | 'government'): string {
  const templates = {
    truth: [
      `🔍 ${cardName} reveals shocking new evidence!`,
      `📰 Truth agents deploy ${cardName}!`,
      `🎯 ${cardName} shifts public perception!`,
      `⚡ ${cardName} breaks through media blackout!`,
    ],
    government: [
      `🔒 Government plays ${cardName} to maintain control!`,
      `🛡️ ${cardName} reinforces official narrative!`,
      `📋 ${cardName} deployed for damage control!`,
      `⚠️ ${cardName} suppresses emerging leaks!`,
    ],
  };

  const options = templates[faction];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Generate news text for state captures
 */
export function newsForStateCapture(stateName: string, captor: 'player' | 'ai'): string {
  if (captor === 'player') {
    return `🏆 ${stateName} falls to Truth movement! Public awakens!`;
  }
  return `🔐 Government secures ${stateName}. Official story holds.`;
}

/**
 * Generate news text for truth meter changes
 */
export function newsForTruthChange(delta: number, newValue: number): string {
  if (delta > 0) {
    if (delta >= 5) {
      return `🚨 URGENT: Truth meter SURGES to ${newValue}%! Narrative collapsing!`;
    }
    return `📈 Truth rises to ${newValue}%. Questions multiply.`;
  } else if (delta < 0) {
    if (delta <= -5) {
      return `⚠️ Major truth suppression! Meter drops to ${newValue}%!`;
    }
    return `📉 Truth falls to ${newValue}%. Cover story reinforced.`;
  }
  return '';
}

/**
 * Generate news text for combos
 */
export function newsForCombo(comboName: string): string {
  return `🎆 BREAKING: ${comboName}! Multiple sources confirm connection!`;
}

/**
 * Generate news for end of turn
 */
export function newsForTurnEnd(turn: number, truth: number): string {
  if (turn === 1) {
    return `📅 Day ${turn} concludes. Truth meter: ${truth}%. Investigation begins.`;
  }
  if (turn % 3 === 0) {
    return `📅 Day ${turn} complete. Truth meter: ${truth}%. Story develops.`;
  }
  return `📅 Day ${turn} ends. Truth: ${truth}%. Files updated.`;
}
