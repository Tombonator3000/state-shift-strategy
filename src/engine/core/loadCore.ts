import { normalizeDeck } from '../normalizeEffects';
import { CORE_BASE_URL, coreFeatures, tryImport } from './paths';

// 1) Bundled (no CORS)
async function loadBundled() {
  const lib = await tryImport<any>('/public/core/core-library.json');
  const deck = await tryImport<any>('/public/core/core-decklist-latest.json');
  if (lib && deck) return { coreLibrary: lib, decklist: deck };
  return null;
}

// 2) HTTP + integrity
async function sha256Text(text:string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

async function loadViaFetch() {
  const mf = await fetch(CORE_BASE_URL + 'manifest.json');
  if (!mf.ok) throw new Error('Core manifest missing');
  const manifest = await mf.json();

  const libRes = await fetch(CORE_BASE_URL + manifest.files.library.path);
  const libText = await libRes.text();
  if (await sha256Text(libText) !== manifest.files.library.sha256) throw new Error('Core lib integrity failed');
  const coreLibrary = JSON.parse(libText);

  const deckRes = await fetch(CORE_BASE_URL + manifest.files.decklist.path);
  const deckText = await deckRes.text();
  if (await sha256Text(deckText) !== manifest.files.decklist.sha256) throw new Error('Core deck integrity failed');
  const decklist = JSON.parse(deckText);

  return { coreLibrary, decklist };
}

// 3) TS fallback - use full core database
import { CARD_DATABASE_CORE } from '../../data/core_legacy/index';
function loadFallback() {
  const coreLibrary = normalizeDeck(CARD_DATABASE_CORE);
  const decklist = { seed:'fallback', ids: coreLibrary.map(c => c.id) };
  return { coreLibrary, decklist };
}

export async function loadCore() {
  if (coreFeatures.useBundledFirst) {
    const b = await loadBundled();
    if (b) return b;
  }
  if (coreFeatures.allowHttpFetch) {
    try { return await loadViaFetch(); } catch {}
  }
  return loadFallback();
}
