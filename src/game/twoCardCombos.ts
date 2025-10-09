import type { ComboDefinition } from './combo.types';

/**
 * Two-Card Mini-Combos
 * Smaller, more frequent combos that trigger when specific pairs are played together.
 * These provide immediate rewards and encourage strategic card pairing.
 */

export const TWO_CARD_COMBOS: ComboDefinition[] = [
  {
    id: 'pair_elvis_alien_wedding',
    name: 'Honeymoon on Mars',
    description: 'Elvis and an alien wedding create tabloid gold.',
    category: 'hybrid',
    priority: 150,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', nameIncludesAny: ['elvis'], count: 1 },
        { kind: 'card', nameIncludesAny: ['alien', 'wedding'], count: 1 },
      ],
    },
    reward: { truth: 1, log: 'Elvis serenades the ceremony—Truth spikes!' },
    fxText: 'Honeymoon on Mars confirmed!'
  },
  {
    id: 'pair_bigfoot_mothman',
    name: 'Cryptid Summit',
    description: 'Bigfoot and Mothman meet for paranormal negotiations.',
    category: 'hybrid',
    priority: 148,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', nameIncludesAny: ['bigfoot'], count: 1 },
        { kind: 'card', nameIncludesAny: ['mothman'], count: 1 },
      ],
    },
    reward: { ip: 1, truth: 1, log: 'Cryptid alliance strengthens your position!' },
    fxText: 'Legendary creatures convene.'
  },
  {
    id: 'pair_mib_foia',
    name: 'Redaction Race',
    description: 'Men in Black scramble as FOIA requests flood in.',
    category: 'hybrid',
    priority: 145,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', nameIncludesAny: ['men in black', 'mib', 'agent'], count: 1 },
        { kind: 'card', nameIncludesAny: ['foia', 'freedom', 'documents'], count: 1 },
      ],
    },
    reward: { ip: 2, log: 'Documents leak faster than they can be redacted!' },
    fxText: 'Redaction machine overheats.'
  },
  {
    id: 'pair_ufo_weather_balloon',
    name: 'Cover Story Exposed',
    description: 'UFO and weather balloon played together reveal the lie.',
    category: 'hybrid',
    priority: 147,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', tagsAny: ['ufo'], count: 1 },
        { kind: 'card', nameIncludesAny: ['weather balloon', 'balloon'], count: 1 },
      ],
    },
    reward: { truth: 2, log: 'Official cover story crumbles!' },
    fxText: 'The balloon story pops.'
  },
  {
    id: 'pair_pastor_rex_doomsday',
    name: 'Prophecy Fulfilled',
    description: 'Pastor Rex predicted this exact event.',
    category: 'hybrid',
    priority: 142,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', nameIncludesAny: ['pastor rex', 'rex'], count: 1 },
        { kind: 'card', tagsAny: ['apocalypse', 'doomsday', 'end times'], count: 1 },
      ],
    },
    reward: { truth: 2, log: 'Rex called it—believers multiply!' },
    fxText: 'Prophecy clock strikes midnight.'
  },
  {
    id: 'pair_bat_boy_florida_man',
    name: 'Chaos Ticket',
    description: 'Bat Boy and Florida Man team up for maximum mayhem.',
    category: 'hybrid',
    priority: 141,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', nameIncludesAny: ['bat boy'], count: 1 },
        { kind: 'card', nameIncludesAny: ['florida man'], count: 1 },
      ],
    },
    reward: { ip: 2, log: 'Chaos ticket drains government resources!' },
    fxText: 'Campaign trail explodes.'
  },
  {
    id: 'pair_area51_roswell',
    name: 'Desert Disclosure',
    description: 'Area 51 and Roswell events converge.',
    category: 'hybrid',
    priority: 144,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', nameIncludesAny: ['area 51', 'area51'], count: 1 },
        { kind: 'card', nameIncludesAny: ['roswell'], count: 1 },
      ],
    },
    reward: { truth: 2, ip: 1, log: 'Desert secrets pour into daylight!' },
    fxText: 'Nevada lights up the truth meter.'
  },
  {
    id: 'pair_chupacabra_texas',
    name: 'Lone Star Mystery',
    description: 'Chupacabra sightings blanket the Texas border.',
    category: 'hybrid',
    priority: 139,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', tagsAny: ['chupacabra'], count: 1 },
        { kind: 'card', tagsAny: ['texas'], count: 1 },
      ],
    },
    reward: { ip: 1, log: 'Texas mystery deepens!' },
    fxText: 'Ranchers report missing livestock.'
  },
  {
    id: 'pair_black_helicopter_surveillance',
    name: 'Sky Watchers',
    description: 'Black helicopters and surveillance networks connect.',
    category: 'hybrid',
    priority: 143,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', nameIncludesAny: ['black helicopter', 'helicopter'], count: 1 },
        { kind: 'card', tagsAny: ['surveillance', 'monitoring'], count: 1 },
      ],
    },
    reward: { ip: 1, log: 'Surveillance grid tightens!' },
    fxText: 'Eyes in the sky multiply.'
  },
  {
    id: 'pair_zombie_outbreak',
    name: 'Undead Panic',
    description: 'Zombie reports and outbreak protocols trigger chaos.',
    category: 'hybrid',
    priority: 146,
    trigger: {
      kind: 'hybrid',
      triggers: [
        { kind: 'card', tagsAny: ['zombie'], count: 1 },
        { kind: 'card', tagsAny: ['outbreak', 'epidemic', 'pandemic'], count: 1 },
      ],
    },
    reward: { truth: 2, log: 'Undead panic spreads faster than containment!' },
    fxText: 'CDC issues emergency protocols.'
  },
];

export default TWO_CARD_COMBOS;
