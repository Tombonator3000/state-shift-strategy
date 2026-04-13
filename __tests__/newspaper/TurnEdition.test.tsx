// NOTE: happy-dom is installed on globalThis BEFORE any test module evaluates
// via the bun:test preload (see __tests__/__setup__/preload.ts referenced from
// bunfig.toml). That ordering matters because @testing-library/react reads
// document/window at module init time.
import { afterEach, describe, expect, it } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import type { CompositeStory } from '@/types/news';

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
