import type { EditorId } from '../editors';

export interface BanterBank {
  locale: string;
  rateLimit?: { minTurnGap?: number; maxPerTurn?: number };
  triggers: Record<string, string[]>;
}

type BanterModule = { default?: BanterBank } | BanterBank;

const BANKS: Record<EditorId, () => Promise<BanterModule>> = {
  editor_muldrunk:   () => import('./editor_muldrunk.json'),
  editor_floridaman: () => import('./editor_floridaman.json'),
  editor_elvis:      () => import('./editor_elvis.json'),
  editor_hunter:     () => import('./editor_hunter.json'),
  editor_batboy:     () => import('./editor_batboy.json'),
  editor_mothwoman:  () => import('./editor_mothwoman.json'),
  editor_smitherson: () => import('./editor_smitherson.json'),
  editor_cigs:       () => import('./editor_cigs.json'),
  editor_bureau:     () => import('./editor_bureau.json'),
  editor_mkunit:     () => import('./editor_mkunit.json'),
  editor_blackbudget:() => import('./editor_blackbudget.json'),
  editor_redactor:   () => import('./editor_redactor.json'),
};

export async function getBanterBank(id: EditorId): Promise<BanterBank> {
  const mod = await BANKS[id]();
  const bank = (mod as { default?: BanterBank }).default ?? mod;
  return bank as BanterBank;
}
