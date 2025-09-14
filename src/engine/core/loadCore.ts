import { normalizeDeck } from '../normalizeEffects';
import { CORE_BASE_URL, CORE_BUNDLED, coreFeatures } from './paths';

async function loadBundled() {
  try {
    const [lib, deck] = await Promise.all([CORE_BUNDLED.library(), CORE_BUNDLED.decklist()]);
    if (lib && deck) return { coreLibrary: lib, decklist: deck };
  } catch {}
  return null;
}

async function sha256Text(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function loadViaFetch() {
  const manifestRes = await fetch(CORE_BASE_URL + 'manifest.json');
  if (!manifestRes.ok) throw new Error('Core manifest missing');
  const manifestText = await manifestRes.text();
  const manifest = JSON.parse(manifestText);

  const libRes = await fetch(CORE_BASE_URL + manifest.files.library.path);
  const libText = await libRes.text();
  if (await sha256Text(libText) !== manifest.files.library.sha256) throw new Error('Core library integrity failed');
  const coreLibrary = JSON.parse(libText);

  const deckRes = await fetch(CORE_BASE_URL + manifest.files.decklist.path);
  const deckText = await sha256Text(await deckRes.text());
  const deckRaw = await (await fetch(CORE_BASE_URL + manifest.files.decklist.path)).text();
  if (deckText !== manifest.files.decklist.sha256) throw new Error('Core decklist integrity failed');
  const decklist = JSON.parse(deckRaw);

  return { coreLibrary, decklist };
}

import { CORE_TRUTH_DECK } from '../../data/core/CORE_TRUTH_DECK';
import { CORE_GOV_DECK } from '../../data/core/CORE_GOV_DECK';

function loadFallback() {
  const coreLibrary = [...normalizeDeck(CORE_TRUTH_DECK), ...normalizeDeck(CORE_GOV_DECK)];
  const decklist = { seed: 'fallback', ids: coreLibrary.map(c => c.id) };
  return { coreLibrary, decklist };
}

export async function loadCore() {
  if (coreFeatures.useBundledFirst) {
    const b = await loadBundled();
    if (b) return b;
  }
  if (coreFeatures.allowHttpFetch) {
    try {
      return await loadViaFetch();
    } catch {}
  }
  return loadFallback();
}

