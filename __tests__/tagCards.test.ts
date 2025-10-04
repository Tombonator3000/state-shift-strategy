import { processCard } from '../scripts/tagCards';

describe('tagCards processCard', () => {
  it('ensures faction and type tags are present for Truth Attack cards', () => {
    const result = processCard('core_truth_MVP_balanced.json', {
      name: 'Test Assault',
      type: 'ATTACK',
      faction: 'TRUTH',
      power: 5,
    });

    expect(result.tags).toEqual(expect.arrayContaining(['attack', 'truth']));
  });

  it('adds expansion tags for cryptid cards', () => {
    const result = processCard('cryptids.json', {
      name: 'Forest Watch',
      type: 'ZONE',
      faction: 'TRUTH',
    });

    expect(result.tags).toEqual(expect.arrayContaining(['cryptid', 'truth', 'zone']));
  });

  it('applies cryptid rally heuristics', () => {
    const result = processCard('cryptids.json', {
      name: 'Bigfoot Plaza Rally',
      type: 'ZONE',
      faction: 'TRUTH',
    });

    expect(result.tags).toEqual(
      expect.arrayContaining(['bigfoot', 'cryptid', 'location', 'protest', 'truth', 'zone'])
    );
  });

  it('tags Elvis media appropriately', () => {
    const result = processCard('core_truth_MVP_balanced.json', {
      name: 'Elvis Broadcast',
      type: 'MEDIA',
      faction: 'TRUTH',
    });

    expect(result.tags).toEqual(expect.arrayContaining(['elvis', 'media', 'truth']));
  });

  it('tags Area 51 Hangar as a location', () => {
    const result = processCard('core_government_MVP_balanced.json', {
      name: 'Area 51 Hangar',
      type: 'ZONE',
      faction: 'GOV',
    });

    expect(result.tags).toEqual(expect.arrayContaining(['area51', 'government', 'location', 'zone']));
  });

  it('tags Haunted Lighthouse as haunted location', () => {
    const result = processCard('halloween_spooktacular_with_temp_image.json', {
      name: 'Haunted Lighthouse',
      type: 'ZONE',
      faction: 'TRUTH',
    });

    expect(result.tags).toEqual(
      expect.arrayContaining(['ghost', 'haunted', 'halloween', 'location', 'truth', 'zone'])
    );
  });

  it('is idempotent when run multiple times', () => {
    const card = {
      name: 'Elvis Broadcast',
      type: 'MEDIA' as const,
      faction: 'TRUTH' as const,
    };

    const once = processCard('core_truth_MVP_balanced.json', card);
    const twice = processCard('core_truth_MVP_balanced.json', once);

    expect(twice.tags).toEqual(once.tags);
  });

  it('does not mutate unrelated fields', () => {
    const card = {
      id: 'card-123',
      name: 'Control Report',
      type: 'MEDIA' as const,
      faction: 'GOV' as const,
      flavor: 'Stay vigilant.',
    };

    const result = processCard('core_government_MVP_balanced.json', card);

    expect(result).toMatchObject({
      id: 'card-123',
      name: 'Control Report',
      flavor: 'Stay vigilant.',
    });
    expect(result.tags).toEqual(expect.arrayContaining(['bureaucracy', 'coverup', 'government', 'media']));
  });
});

