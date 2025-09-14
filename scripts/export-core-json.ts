import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { normalizeDeck } from '../src/engine/normalizeEffects';
import { CORE_TRUTH_DECK } from '../src/data/core/CORE_TRUTH_DECK';
import { CORE_GOV_DECK }   from '../src/data/core/CORE_GOV_DECK';

const outDir = resolve(process.cwd(), 'public/core');
mkdirSync(outDir, { recursive: true });

const truth = normalizeDeck(CORE_TRUTH_DECK);
const gov   = normalizeDeck(CORE_GOV_DECK);
const coreLibrary = [...truth, ...gov];

const seed = process.env.CORE_SEED ?? new Date().toISOString().slice(0,10);
function seededShuffle<T>(arr:T[], seedStr:string): T[] {
  let s = createHash('sha256').update(seedStr).digest().readUInt32BE(0);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    s ^= (s << 13); s ^= (s >>> 17); s ^= (s << 5);
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const decklistIds = seededShuffle(coreLibrary.map(c => c.id), seed);

function sha256(x:any) {
  const data = typeof x === 'string' ? x : JSON.stringify(x);
  return createHash('sha256').update(data).digest('hex');
}

writeFileSync(resolve(outDir, 'core-library.json'), JSON.stringify(coreLibrary, null, 2));
writeFileSync(resolve(outDir, `core-decklist-${seed}.json`), JSON.stringify({ seed, ids: decklistIds }, null, 2));
// Latest alias for bundled imports
writeFileSync(resolve(outDir, 'core-decklist-latest.json'), JSON.stringify({ seed, ids: decklistIds }, null, 2));
writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  seed,
  files: {
    library:  { path:'core-library.json',           sha256: sha256(coreLibrary) },
    decklist: { path:`core-decklist-${seed}.json`,  sha256: sha256({ seed, ids: decklistIds }) }
  }
}, null, 2));
console.log('[core export] Done', { count: coreLibrary.length, seed });
