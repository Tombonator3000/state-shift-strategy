import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { Window } from 'happy-dom';
import type { CompositeStory } from '@/types/news';

const happyWindow = new Window();
const globalRecord = globalThis as typeof globalThis & Record<string, unknown>;
const propagateKeys = Object.getOwnPropertyNames(happyWindow).filter(key => !(key in globalRecord));
for (const key of propagateKeys) {
  globalRecord[key] = (happyWindow as Record<string, unknown>)[key];
}

const globalWithDom = globalThis as typeof globalThis & {
  window: Window;
  document: typeof happyWindow.document;
  navigator: typeof happyWindow.navigator;
  HTMLElement: typeof happyWindow.HTMLElement;
  Node: typeof happyWindow.Node;
};

globalWithDom.window = happyWindow;
globalWithDom.document = happyWindow.document;
globalWithDom.navigator = happyWindow.navigator;
globalWithDom.HTMLElement = happyWindow.HTMLElement;
globalWithDom.Node = happyWindow.Node;

let render: typeof import('@testing-library/react').render;
let screen: typeof import('@testing-library/react').screen;
let cleanup: typeof import('@testing-library/react').cleanup;

const createStory = (overrides: Partial<CompositeStory> = {}): CompositeStory => ({
  tone: 'truth',
  tags: ['cryptid-summit', 'whistle-network'],
  headline: 'Truthline observers uncovers cryptid summit dossier',
  subhead: 'Encrypted tipsters race to uncovers every cryptid summit whisper before it vanishes.',
  byline: 'Composite Desk',
  body: [
    'Volunteer signal-sweepers uncovers cryptid summit whispers as whistle network lookouts feed coordinates through cracked scanners.',
    'Composite Desk urges readers to log sightings at the encrypted tipline before the static resets the grid.',
  ],
  sources: [
    { id: 'source-a', headline: 'Basement analysts tag coordinates', subhead: 'Operators chart midnight transmissions.' },
    { id: 'source-b', headline: 'Neighborhood scouts file proof' },
  ],
  ...overrides,
});

beforeAll(async () => {
  const testingLibrary = await import('@testing-library/react');
  ({ render, screen, cleanup } = testingLibrary);
});

afterEach(() => {
  cleanup();
});

describe('TurnEdition', () => {
  it('renders truth-toned connectors and image prompt details', async () => {
    const story = createStory({ imagePrompt: 'Illustrate the encrypted rooftop antenna array shimmering in static.' });
    const { default: TurnEdition } = await import('@/components/newspaper/TurnEdition');

    render(<TurnEdition story={story} />);

    expect(screen.getByText('Truth Connectors:')).toBeTruthy();
    expect(screen.getByText('UNCOVERS')).toBeTruthy();
    expect(screen.getByText('Illustrate the encrypted rooftop antenna array shimmering in static.')).toBeTruthy();
  });

  it('renders government connectors and falls back when no image prompt', async () => {
    const story = createStory({
      tone: 'government',
      headline: 'Containment office suppresses anomaly memo',
      subhead: 'Press office scrambles to suppress anomaly memo chatter from the nightly brief.',
      tags: ['containment-bureau'],
    });
    const { default: TurnEdition } = await import('@/components/newspaper/TurnEdition');

    render(<TurnEdition story={story} />);

    expect(screen.getByText('Government Connectors:')).toBeTruthy();
    expect(screen.getByText('SUPPRESSES')).toBeTruthy();
    expect(screen.getByText(/Archival footage pending clearance/i)).toBeTruthy();
  });
});
