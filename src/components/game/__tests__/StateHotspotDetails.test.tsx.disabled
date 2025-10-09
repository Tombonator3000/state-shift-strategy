import { describe, expect, test } from 'bun:test';
import { create } from 'react-test-renderer';

import { StateHotspotDetails } from '../EnhancedUSAMap';

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

  if (typeof node === 'object' && 'children' in (node as { children?: unknown[] })) {
    const children = ((node as { children?: unknown[] }).children ?? []) as unknown[];
    return children.flatMap(extractText);
  }

  return [];
};

describe('StateHotspotDetails', () => {
  test('renders resolved hotspot history entries for truth faction', () => {
    const renderer = create(
      <StateHotspotDetails
        hotspot={{
          id: 'hotspot-active',
          eventId: 'event-1',
          label: 'Desert Rift',
          description: 'A spectral fissure invites chaos.',
          icon: '👻',
          defenseBoost: 3,
          truthReward: 10,
          expiresOnTurn: 5,
          turnsRemaining: 2,
          source: 'truth',
        }}
        history={[
          {
            id: 'hotspot-archive',
            label: 'Old Rift',
            resolvedOnTurn: 4,
            faction: 'government',
            truthDelta: -4,
          },
          {
            id: 'hotspot-active',
            label: 'Desert Rift',
            resolvedOnTurn: 6,
            faction: 'truth',
            truthDelta: 8,
          },
        ]}
        playerFaction="truth"
      />,
    );

    const output = renderer.toJSON();
    const normalized = extractText(output).join(' ').replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('Resolved hotspots');
    expect(normalized).toContain('Desert Rift');
    expect(normalized).toContain('Truth +8');
    expect(normalized).toContain('Turn 6 · TRUTH');

    renderer.unmount();
  });

  test('formats truth rewards from a government perspective as losses', () => {
    const renderer = create(
      <StateHotspotDetails
        history={[
          {
            id: 'hotspot-active',
            label: 'Desert Rift',
            resolvedOnTurn: 6,
            faction: 'truth',
            truthDelta: 8,
          },
        ]}
        playerFaction="government"
      />,
    );

    const output = renderer.toJSON();
    const normalized = extractText(output).join(' ').replace(/\s+/g, ' ').trim();

    expect(normalized).toContain('Truth -8');

    renderer.unmount();
  });
});
