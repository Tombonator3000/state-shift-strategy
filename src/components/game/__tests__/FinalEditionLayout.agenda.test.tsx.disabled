import { describe, expect, test } from 'bun:test';
import { create } from 'react-test-renderer';

import type { GameOverReport } from '@/types/finalEdition';

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

describe('FinalEditionLayout agenda narratives', () => {
  const baseReport: GameOverReport = {
    winner: 'truth',
    victoryType: 'agenda',
    rounds: 6,
    finalTruth: 62,
    ipPlayer: 118,
    ipAI: 84,
    statesGov: 18,
    statesTruth: 32,
    playerFaction: 'truth',
    playerSecretAgenda: {
      title: 'Project Hushwave',
      headline: 'Seal the Leaks',
      operationName: 'Silent Current',
      issueTheme: 'Whistleblower Panic',
      pullQuote: 'Keep the broadcast cycle chasing ghosts.',
      faction: 'truth',
      progress: 4,
      target: 4,
      completed: true,
      revealed: true,
    },
    aiSecretAgenda: {
      title: 'Containment Protocol',
      headline: 'Lock Down Supply Lines',
      operationName: 'Iron Gate',
      issueTheme: 'Logistics Collapse',
      faction: 'government',
      progress: 2,
      target: 5,
      completed: false,
      revealed: false,
    },
    mvp: null,
    runnerUp: null,
    legendaryUsed: [],
    topEvents: [],
    comboHighlights: [],
    sightings: [],
    recordedAt: new Date('2024-03-01T12:00:00Z').getTime(),
  };

  test('renders detailed agenda briefings for both sides', async () => {
    ensureLocalStorage();

    const { default: FinalEditionLayout } = await import('../FinalEditionLayout');

    const renderer = create(<FinalEditionLayout report={baseReport} />);
    const output = extractText(renderer.toJSON()).join(' ');
    const normalized = output.replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('Operative Agenda: Seal the Leaks — Completed (4/4)');
    expect(normalized).toContain('Opposition Agenda: Lock Down Supply Lines — In Progress (2/5)');
    expect(normalized).toContain('Operation Silent Current drove the "Seal the Leaks" agenda.');
    expect(normalized).toContain('The plan weaponized the Whistleblower Panic storyline to sway the board.');
    expect(normalized).toContain('Operatives completed the mission after securing 4/4 objectives.');
    expect(normalized).toContain('Opposition strategists left the mission unfinished at 2/5 objectives when the season closed.');
    expect(normalized).toContain('Keep the broadcast cycle chasing ghosts.');
    expect(normalized).toContain('Progress 4/4');
    expect(normalized).toContain('Progress 2/5');

    renderer.unmount();
  });
});
