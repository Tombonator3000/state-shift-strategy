export type BroadsheetRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

const RARITY_CLASS_MAP: Record<BroadsheetRarity | 'default', string> = {
  legendary: 'border-[#3c3a8f] bg-[#e3e0f7] text-[#25206a]',
  rare: 'border-[#1f5d82] bg-[#d3e5f2] text-[#123b53]',
  uncommon: 'border-[#2f6f3a] bg-[#d6edd9] text-[#1f4b24]',
  common: 'border-[var(--broadsheet-rule)] bg-white text-[var(--broadsheet-muted)]',
  default: 'border-[var(--broadsheet-rule)] bg-white text-[var(--broadsheet-muted)]',
};

export const getBroadsheetRarityTone = (rarity: string): string => {
  const key = rarity?.toLowerCase() as BroadsheetRarity | undefined;
  return RARITY_CLASS_MAP[key ?? 'default'] ?? RARITY_CLASS_MAP.default;
};

const globalScope = typeof globalThis === 'object' && globalThis ? (globalThis as Record<string, unknown>) : null;

if (globalScope && typeof globalScope.getBroadsheetRarityTone !== 'function') {
  globalScope.getBroadsheetRarityTone = getBroadsheetRarityTone;
}

export const broadsheetRarityClassMap = RARITY_CLASS_MAP;
