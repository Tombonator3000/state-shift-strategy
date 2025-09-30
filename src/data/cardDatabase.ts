import type { GameCard, MVPCardType, Rarity } from '@/rules/mvp';
import { expectedCost, MVP_COST_TABLE } from '@/rules/mvp';
import { repairToMVP, validateCardMVP } from '@/mvp/validator';
import { getExtensionCardsSnapshot } from './extensionSystem';

const DEV = typeof import.meta !== 'undefined' && (import.meta as any)?.env?.DEV;

const MVP_TYPES: readonly MVPCardType[] = ['ATTACK', 'MEDIA', 'ZONE'];
const MVP_RARITIES: readonly Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];

type SourceTag = 'fallback' | 'core' | 'extension';

function logNormalization(tag: SourceTag, cardId: string, changes: string[], errors: string[]) {
  if (!DEV) return;

  if (changes.length > 0) {
    console.info(`[CARD DATABASE][${tag}] ${cardId}: ${changes.join('; ')}`);
  }

  if (errors.length > 0) {
    console.warn(`[CARD DATABASE][${tag}] ${cardId}: ${errors.join('; ')}`);
  }
}

function ensureMvpCard(raw: GameCard, tag: SourceTag): GameCard {
  const { card, errors, changes } = repairToMVP(raw);
  const validation = validateCardMVP(card);

  logNormalization(tag, card.id, changes, errors);

  if (!validation.ok && DEV) {
    console.warn(`[CARD DATABASE][${tag}] ${card.id}: ${validation.errors.join('; ')}`);
  }

  return card;
}

const FALLBACK_CARDS_RAW: GameCard[] = [
  {
    id: 'truth-media-mvp',
    faction: 'truth',
    name: 'Community Broadcast',
    type: 'MEDIA',
    rarity: 'common',
    cost: expectedCost('MEDIA', 'common'),
    flavor: 'Neighbors pass along the real story.',
    effects: { truthDelta: 2 },
  },
  {
    id: 'truth-attack-mvp',
    faction: 'truth',
    name: 'Expose Scandal',
    type: 'ATTACK',
    rarity: 'uncommon',
    cost: expectedCost('ATTACK', 'uncommon'),
    flavor: 'Evidence hits the airwaves at the worst possible time.',
    effects: { ipDelta: { opponent: 1 }, discardOpponent: 1 },
  },
  {
    id: 'truth-zone-mvp',
    faction: 'truth',
    name: 'Grassroots Network',
    type: 'ZONE',
    rarity: 'rare',
    cost: expectedCost('ZONE', 'rare'),
    flavor: 'Community organizers cover every block.',
    target: { scope: 'state', count: 1 },
    effects: { pressureDelta: 2 },
  },
  {
    id: 'gov-media-mvp',
    faction: 'government',
    name: 'Official Statement',
    type: 'MEDIA',
    rarity: 'common',
    cost: expectedCost('MEDIA', 'common'),
    flavor: 'A polished briefing calms the headlines.',
    effects: { truthDelta: -2 },
  },
  {
    id: 'gov-attack-mvp',
    faction: 'government',
    name: 'Asset Freeze',
    type: 'ATTACK',
    rarity: 'uncommon',
    cost: expectedCost('ATTACK', 'uncommon'),
    flavor: 'Compliance teams lock the accounts instantly.',
    effects: { ipDelta: { opponent: 1 } },
  },
  {
    id: 'gov-zone-mvp',
    faction: 'government',
    name: 'Security Lockdown',
    type: 'ZONE',
    rarity: 'rare',
    cost: expectedCost('ZONE', 'rare'),
    flavor: 'Checkpoints appear on every road overnight.',
    target: { scope: 'state', count: 1 },
    effects: { pressureDelta: 2 },
  },
];

const FALLBACK_CARDS: GameCard[] = FALLBACK_CARDS_RAW.map(card => ensureMvpCard(card, 'fallback'));

let _coreCards: GameCard[] | null = null;
let _coreCardsPromise: Promise<GameCard[]> | null = null;

async function loadCoreCards(): Promise<GameCard[]> {
  if (_coreCards) {
    return _coreCards;
  }

  if (_coreCardsPromise) {
    return _coreCardsPromise;
  }

  _coreCardsPromise = (async () => {
    try {
      const coreModule = await import('./core');
      const rawCards: GameCard[] = coreModule.CARD_DATABASE_CORE || [];
      const normalized = rawCards.map(card => ensureMvpCard(card, 'core'));
      _coreCards = normalized;

      if (DEV) {
        console.log(`✅ [CARD DATABASE] Loaded ${normalized.length} core cards`);
      }

      return normalized;
    } catch (error) {
      console.warn('⚠️ [CARD DATABASE] Core collector not available, using fallback MVP set');
      _coreCards = FALLBACK_CARDS;
      return FALLBACK_CARDS;
    }
  })();

  return _coreCardsPromise;
}

let CORE_CARDS: GameCard[] = [...FALLBACK_CARDS];

loadCoreCards()
  .then(coreCards => {
    CORE_CARDS = coreCards;

    if (DEV) {
      const truthCount = CORE_CARDS.filter(c => c.faction === 'truth').length;
      const governmentCount = CORE_CARDS.filter(c => c.faction === 'government').length;
      console.log('[CARD DATABASE][core] ready', {
        total: CORE_CARDS.length,
        truth: truthCount,
        government: governmentCount,
      });

      if (CORE_CARDS.length < 100) {
        console.warn(
          '⚠️ [CARD DATABASE] Core database seems incomplete. Expected ~400 cards, got',
          CORE_CARDS.length,
        );
      }
    }
  })
  .catch(error => {
    console.error('Failed to load core cards:', error);
  });

function getAllCards(): GameCard[] {
  const extensionCards = getExtensionCardsSnapshot();
  return [...CORE_CARDS, ...extensionCards];
}

export function getCoreCards(): GameCard[] {
  return [...CORE_CARDS];
}

export function getAllCardsSnapshot(): GameCard[] {
  return getAllCards();
}

export async function loadCardPool(): Promise<GameCard[]> {
  return loadCoreCards();
}

export const CARD_DATABASE: GameCard[] = new Proxy([], {
  get(_target, prop) {
    const cards = getAllCards();

    if (prop === 'length') {
      return cards.length;
    }

    if (typeof prop === 'string' && !Number.isNaN(Number(prop))) {
      return cards[Number(prop)];
    }

    if (prop === Symbol.iterator) {
      return function* iterate() {
        yield* cards;
      };
    }

    const value = Reflect.get(cards, prop);
    if (typeof value === 'function') {
      return value.bind(cards);
    }

    return value;
  },
});

export function getRandomCards(
  count: number,
  options?: { faction?: 'truth' | 'government' },
): GameCard[] {
  let pool = getAllCards();

  if (options?.faction) {
    pool = pool.filter(card => card.faction === options.faction);
  }

  const selected: GameCard[] = [];
  const poolCopy = [...pool];

  for (let i = 0; i < count && poolCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * poolCopy.length);
    selected.push(poolCopy[randomIndex]);
    poolCopy.splice(randomIndex, 1);

    if (poolCopy.length === 0) {
      break;
    }
  }

  return selected;
}

export function generateRandomDeck(
  size: number = 40,
  faction?: 'truth' | 'government',
): GameCard[] {
  let pool = getAllCards();

  if (faction) {
    pool = pool.filter(card => card.faction === faction);
  }

  if (pool.length === 0) {
    return [];
  }

  const deck: GameCard[] = [];

  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    deck.push(pool[randomIndex]);
  }

  return deck;
}

export function isMvpCard(card: GameCard): card is GameCard & {
  type: MVPCardType;
  rarity: Rarity;
} {
  return MVP_TYPES.includes(card.type as MVPCardType) && MVP_RARITIES.includes(card.rarity as Rarity);
}

export function ensureMvpCosts(card: GameCard): GameCard {
  if (!isMvpCard(card)) {
    return card;
  }

  const expected = MVP_COST_TABLE[card.type][card.rarity];
  if (card.cost === expected) {
    return card;
  }

  if (DEV) {
    console.warn(`⚠️ [CARD DATABASE] Adjusted cost for ${card.id} to MVP baseline (${expected})`);
  }

  return { ...card, cost: expected };
}
