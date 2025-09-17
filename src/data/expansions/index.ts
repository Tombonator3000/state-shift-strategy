import type { GameCard } from '@/rules/mvp';
import { validateMvpCard } from '@/utils/validate-mvp';

export type ExpansionPack = { id: string; title: string; files: string[] };

export const EXPANSION_MANIFEST: ExpansionPack[] = [
  { id: 'cryptids', title: 'Cryptids', files: ['./cryptids_MVP.ts'] },
  { id: 'halloween', title: 'Halloween Spooktacular', files: ['./halloween_MVP.ts'] },
];

export async function loadEnabledExpansions(enabledIds: string[]): Promise<GameCard[]> {
  const files: string[] = [];

  for (const pack of EXPANSION_MANIFEST) {
    if (!enabledIds.includes(pack.id)) continue;
    files.push(...pack.files);
  }

  if (files.length === 0) {
    console.info('[EXPANSIONS]', { enabled: enabledIds, total: 0 });
    return [];
  }

  const mods = await Promise.all(files.map(file => import(/* @vite-ignore */ file)));
  const seen = new Set<string>();
  const out: GameCard[] = [];

  for (const mod of mods) {
    const arr = (mod as any).default ?? Object.values(mod)[0];
    if (!Array.isArray(arr)) continue;

    for (const card of arr) {
      if (!card?.id || seen.has(card.id)) continue;
      seen.add(card.id);

      const validation = validateMvpCard(card);
      if (validation.ok) {
        out.push(card as GameCard);
      } else {
        console.warn('[EXPANSION INVALID]', card?.id, validation.issues);
      }
    }
  }

  console.info('[EXPANSIONS]', { enabled: enabledIds, total: out.length });
  return out;
}
