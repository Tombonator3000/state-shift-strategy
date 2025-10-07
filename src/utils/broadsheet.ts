export type BroadsheetRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export const getBroadsheetRarityTone = (rarity: string) => {
  switch (rarity as BroadsheetRarity) {
    case 'legendary':
      return 'border-[#3c3a8f] bg-[#e3e0f7] text-[#25206a]';
    case 'rare':
      return 'border-[#1f5d82] bg-[#d3e5f2] text-[#123b53]';
    case 'uncommon':
      return 'border-[#2f6f3a] bg-[#d6edd9] text-[#1f4b24]';
    default:
      return 'border-[var(--broadsheet-rule)] bg-white text-[var(--broadsheet-muted)]';
  }
};
