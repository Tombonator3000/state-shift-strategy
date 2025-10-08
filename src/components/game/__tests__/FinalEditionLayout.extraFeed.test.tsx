import { describe, expect, test } from 'bun:test';
import { create } from 'react-test-renderer';

import type { GameOverReport } from '@/types/finalEdition';
import type { ArticleBlock } from '@/news/headlineEngine';

const ensureLocalStorage = () => {
  if (typeof globalThis.localStorage !== 'undefined') {
    return;
  }

  const storage = new Map<string, string>();
  globalThis.localStorage = {
    getItem: key => (storage.has(key) ? storage.get(key)! : null),
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: key => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
    key: index => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    },
  } as Storage;
};

const extractText = (node: unknown): string[] => {
  if (node == null) {
    return [];
  }

  if (typeof node === 'string') {
    return [node];
  }

  if (Array.isArray(node)) {
    return node.flatMap(extractText);
  }

  if (typeof node === 'object' && 'children' in node && Array.isArray((node as { children?: unknown[] }).children)) {
    return ((node as { children?: unknown[] }).children ?? []).flatMap(extractText);
  }

  return [];
};

const createArticle = (overrides: Partial<ArticleBlock> = {}): ArticleBlock => ({
  tone: 'truth',
  hed: 'Truth Ops Uncover Vault',
  dek: 'Operatives expose covert caches under the capitol plaza.',
  bullets: ['Field teams broadcast live intel.', 'Opposition command scrambles response units.'],
  byline: 'Operative Dispatch',
  source: 'Truth Network',
  ...overrides,
});

const createReport = (overrides: Partial<GameOverReport> = {}): GameOverReport => ({
  winner: 'truth',
  victoryType: 'truth',
  rounds: 4,
  finalTruth: 68,
  ipPlayer: 142,
  ipAI: 97,
  statesGov: 18,
  statesTruth: 32,
  playerFaction: 'truth',
  playerSecretAgenda: undefined,
  aiSecretAgenda: undefined,
  mvp: null,
  runnerUp: null,
  legendaryUsed: [],
  topEvents: [],
  comboHighlights: [],
  sightings: [],
  extraExtraFeed: [createArticle()],
  recordedAt: new Date('2025-10-05T12:00:00Z').getTime(),
  ...overrides,
});

describe('FinalEditionLayout extra extra bulletins', () => {
  test('renders bulletin articles when present', async () => {
    ensureLocalStorage();

    const { default: FinalEditionLayout } = await import('../FinalEditionLayout');
    const report = createReport({
      extraExtraFeed: [
        createArticle({
          tone: 'truth',
          hed: 'Operatives Break Radio Silence',
          dek: 'Truth Network floods the airwaves.',
          bullets: ['Broadcast uplink secured.', 'Counter narrative jammed.'],
          byline: 'Field Desk',
          source: 'Truth Relay',
        }),
        createArticle({
          tone: 'government',
          hed: 'Shadow Bureau Deploys Countermeasures',
          dek: 'Government doubles down on containment orders.',
          bullets: ['Lockdown protocols enforced.', 'Assets redeployed to coastal hubs.'],
          byline: 'Briefing Room',
          source: 'Government Wire',
        }),
      ],
    });

    const renderer = create(<FinalEditionLayout report={report} />);
    const output = extractText(renderer.toJSON()).join(' ');
    const normalized = output.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('Extra Extra Bulletins');
    expect(normalized).toContain('Truth Network Bulletin');
    expect(normalized).toContain('Operatives Break Radio Silence');
    expect(normalized).toContain('Government Wire Advisory');
    expect(normalized).toContain('Shadow Bureau Deploys Countermeasures');

    renderer.unmount();
  });

  test('omits bulletin section when no bulletins are recorded', async () => {
    ensureLocalStorage();

    const { default: FinalEditionLayout } = await import('../FinalEditionLayout');
    const report = createReport({ extraExtraFeed: [] });

    const renderer = create(<FinalEditionLayout report={report} />);
    const output = extractText(renderer.toJSON()).join(' ');
    const normalized = output.replace(/\s+/g, ' ').trim();

    expect(normalized).not.toContain('Extra Extra Bulletins');
    expect(normalized).not.toContain('No newsroom bulletins were filed during this match.');

    renderer.unmount();
  });
});
