import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import { readFileSync } from 'node:fs';
import { ExtensionManager } from '@/data/extensionSystem';
import { discoverExpansions } from '@/lib/expansions/discover';
import { readExpansionCard } from '@/lib/expansions/cardValidation';
import { EXPANSION_MANIFEST, refreshExpansionManifest } from '@/data/expansions';
import { getStoredExpansionIds, updateEnabledExpansions } from '@/data/expansions/state';

const keys = ['sg_enabled_extensions', 'sg_extension_payloads', 'expansion_prefs_v2'];
const initialStorage = keys.map(key => window.localStorage.getItem(key));
const initialManifest = [...EXPANSION_MANIFEST];
const initialEnabledIds = getStoredExpansionIds();
const restores: (() => void)[] = [];
let discoveryChanged = false;

afterEach(async () => {
  if (discoveryChanged) {
    const noNetwork = spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('', { status: 404 }));
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    await discoverExpansions(true);
    EXPANSION_MANIFEST.splice(0, EXPANSION_MANIFEST.length, ...initialManifest);
    await updateEnabledExpansions(initialEnabledIds);
    noNetwork.mockRestore();
    warn.mockRestore();
    discoveryChanged = false;
  }
  restores.splice(0).reverse().forEach(restore => restore());
  keys.forEach((key, index) => {
    const value = initialStorage[index];
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  });
});

const serveActualFiles = () => {
  const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(async input => {
    const url = new URL(String(input), 'https://example.test');
    const name = url.pathname.split('/').pop();
    if (!name?.endsWith('.json')) return new Response('', { status: 404 });
    try {
      const contents = readFileSync(new URL(`../public/extensions/${name}`, import.meta.url), 'utf8');
      return new Response(contents, { headers: { 'Content-Type': 'application/json' } });
    } catch {
      return new Response('', { status: 404 });
    }
  });
  restores.push(() => fetchSpy.mockRestore());
};

describe('extension recovery and actual catalog', () => {
  it('ignores malformed enabled-extension records without breaking the card pool', () => {
    for (const stored of ['null', '{}', '[null, {}, 7]']) {
      window.localStorage.setItem(keys[0], stored);
      const manager = new ExtensionManager();
      expect(manager.getEnabledExtensions()).toEqual([]);
      expect(manager.getAllExtensionCards()).toEqual([]);
    }
    const valid = { id: 'cryptids', name: 'Cryptids', version: '1', source: 'cdn' };
    window.localStorage.setItem(keys[0], JSON.stringify([null, valid, { ...valid, source: 'missing' }]));
    expect(new ExtensionManager().getEnabledExtensions()).toEqual([valid]);
  });

  it('handles cancelled file and folder pickers', async () => {
    const click = spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
      this.dispatchEvent(new window.Event('cancel'));
    });
    restores.push(() => click.mockRestore());
    const manager = new ExtensionManager();
    expect(await manager.loadFromFilePicker()).toEqual([]);
    expect(await manager.loadFromFolderPicker()).toEqual([]);
  });

  it('loads all 500 supported cards without activating unsupported rule variants', async () => {
    serveActualFiles();
    const packs = await new ExtensionManager().scanCDNExtensions();
    expect(Object.fromEntries(packs.map(pack => [pack.id, pack.cards.length]))).toEqual({
      cryptids: 300,
      halloween_spooktacular: 200,
    });
    expect(packs.every(pack => pack.count === pack.cards.length)).toBe(true);
    const zones = packs.flatMap(pack => pack.cards).filter(card => card.type === 'ZONE');
    expect(zones.length).toBeGreaterThan(0);
    expect(zones.every(card => card.target?.scope === 'state' && card.target.count === 1)).toBe(true);
  });

  it('keeps unavailable packs visible with reasons and excludes them from enabled decks', async () => {
    serveActualFiles();
    discoveryChanged = true;
    const packs = await discoverExpansions(true);
    expect(packs.map(pack => pack.id).sort()).toEqual([
      'cryptids', 'cryptids-midnight-fieldguide', 'gov-new',
      'halloween-midnight-dossiers', 'halloween_spooktacular', 'truth-new',
    ]);
    const external = packs.filter(pack => !['gov-new', 'truth-new'].includes(pack.id));
    expect(external.reduce((total, pack) => total + pack.cards.length, 0)).toBe(500);
    const unavailable = external.filter(pack => pack.unavailableReason);
    expect(unavailable.map(pack => pack.id).sort()).toEqual(['cryptids-midnight-fieldguide', 'halloween-midnight-dossiers']);
    expect(unavailable.every(pack => pack.cards.length === 0 && pack.rejectedCardCount === 20
      && pack.unavailableReason?.includes('does not support yet'))).toBe(true);
    await refreshExpansionManifest();
    const enabledCards = await updateEnabledExpansions(external.map(pack => pack.id));
    expect(getStoredExpansionIds().sort()).toEqual(['cryptids', 'halloween_spooktacular']);
    expect(enabledCards).toHaveLength(500);
  });

  it('rejects unsupported effects without rewriting their meaning or mutating the source', () => {
    const pack = JSON.parse(readFileSync(new URL('../public/extensions/cryptids_midnight_fieldguide.json', import.meta.url), 'utf8'));
    const original = JSON.stringify(pack.cards[0]);
    expect(readExpansionCard(pack.cards[0])).toEqual({ card: null, unsupported: true });
    expect(JSON.stringify(pack.cards[0])).toBe(original);
  });

  it('isolates malformed card data instead of throwing away the whole pack', () => {
    for (const raw of [null, [], {}, { id: 'bad-type', type: 7 }, { id: 'bad-effects', type: 'ZONE', effects: null }]) {
      expect(readExpansionCard(raw).card).toBeNull();
    }
  });
});
