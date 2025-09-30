import type { StateData } from '@/data/usaStates';

export interface StateTag {
  id: string;
  label: string;
  description?: string;
  /**
   * States included in this tag. Accepts either abbreviations (preferred) or
   * the canonical FIPS identifiers used in {@link StateData.id}.
   */
  states: string[];
}

export interface ThemedEffect {
  id: string;
  label: string;
  headline: string;
  subhead?: string;
  summary: string;
  weight: number;
  icon?: string;
  tone?: string;
  effect: {
    truthDelta?: number;
    ipDelta?: number;
    pressureDelta?: number;
  };
}

export interface StateThemedPool {
  tag: StateTag;
  bonuses: ThemedEffect[];
  events: ThemedEffect[];
}

const createEffect = (effect: ThemedEffect): ThemedEffect => ({
  ...effect,
  weight: Math.max(1, Math.round(effect.weight)),
  effect: {
    truthDelta: effect.effect.truthDelta ?? 0,
    ipDelta: effect.effect.ipDelta ?? 0,
    pressureDelta: effect.effect.pressureDelta ?? 0,
  },
});

export const STATE_THEMED_POOLS: StateThemedPool[] = [
  {
    tag: {
      id: 'wy_plains_radar',
      label: 'Cheyenne Listening Range',
      description: 'Signals bounce off silent missile fields and wide-open skies.',
      states: ['WY', '56'],
    },
    bonuses: [
      createEffect({
        id: 'wy_bonus_black_helicopter_subsidy',
        label: 'Black Helicopter Fuel Subsidy',
        headline: 'FEDS TOP OFF UNMARKED HELICOPTERS OVER PRAIRIE',
        subhead: 'Witnesses hear midnight refuels; “contrails smell like diesel truth.”',
        summary: 'Unlogged tankers hover in at dusk, topping off the clandestine fleet and leaving behind “truth fumes.”',
        icon: '🚁',
        weight: 3,
        effect: { truthDelta: 4, ipDelta: 1 },
      }),
      createEffect({
        id: 'wy_bonus_bigfoot_cattle_congress',
        label: 'Bigfoot Cattle Congress',
        headline: 'SASQUATCH UNIONIZES WYOMING CATTLE',
        subhead: 'Hoofprints spell out “LISTEN” in Morse under a blood moon.',
        summary: 'Ranchers wake to bovine picket lines patrolled by shaggy silhouettes whispering classified coordinates.',
        icon: '🦶',
        weight: 2,
        effect: { truthDelta: 2, pressureDelta: 1 },
      }),
      createEffect({
        id: 'wy_bonus_tourist_roadside_psychics',
        label: 'Roadside Psychic Convoy',
        headline: 'FORTUNE TELLERS SET UP MIRAGE CHECKPOINTS',
        subhead: 'Drivers report tarot inspections before entering missile alley.',
        summary: 'A caravan of neon campers performs aura screenings and leaks sanitized intel to any operative brave enough to stop.',
        icon: '🔮',
        weight: 1,
        effect: { ipDelta: 2 },
      }),
    ],
    events: [
      createEffect({
        id: 'wy_event_thunder_basement',
        label: 'Thunder Basement Rumble',
        headline: 'CHEYENNE HEARS DRUMBEAT BENEATH MAIN STREET',
        subhead: 'Seismographs register “classified rhythm.”',
        summary: 'Locals swear the silo complex below town is hosting a rave for remote viewers. Everyone feels strangely patriotic.',
        icon: '🥁',
        weight: 4,
        effect: { truthDelta: 3, ipDelta: -1 },
      }),
      createEffect({
        id: 'wy_event_skygrid_blackout',
        label: 'Skygrid Blackout',
        headline: 'NORTHERN SKY BLINKS LIKE GLITCHING SPREADSHEET',
        subhead: 'Astronomers kicked out of their own observatories by men in polite suits.',
        summary: 'Constellations flicker, spelling out coordinates to anyone tuned to the right AM frequency. Some agents get there first.',
        icon: '🛰️',
        weight: 2,
        effect: { truthDelta: 1, pressureDelta: 2 },
      }),
      createEffect({
        id: 'wy_event_dusty_clone_convoy',
        label: 'Dusty Clone Convoy',
        headline: 'IDENTICAL RANCHERS DRIVE IDENTICAL TRUCKS SOUTH',
        subhead: 'License plates all read “TRUSTME.”',
        summary: 'Convoy passes midnight checkpoints and waves forged credentials. Their windows are down. They chant classified slogans.',
        icon: '🚚',
        weight: 1,
        effect: { ipDelta: 2 },
      }),
    ],
  },
  {
    tag: {
      id: 'nd_oilfield_rift',
      label: 'Bakken Riftline',
      description: 'Fracking rigs hum in harmony with buried satellite dishes.',
      states: ['ND', '38'],
    },
    bonuses: [
      createEffect({
        id: 'nd_bonus_glow_derrick',
        label: 'Glow-in-the-Dark Derrick Crews',
        headline: 'RIG WORKERS REPORT “NIGHT-SHIFT AURAS”',
        subhead: 'Company doctors prescribe sunglasses after midnight.',
        summary: 'Entire crews start emitting faint chartreuse light and hearing coded numbers in the drilling vibrations. Productivity soars.',
        icon: '🌌',
        weight: 2,
        effect: { truthDelta: 3 },
      }),
      createEffect({
        id: 'nd_bonus_fracked_memory',
        label: 'Fracked Memory Seep',
        headline: 'GROUNDWATER STARTS REMEMBERING PASSWORDS',
        subhead: 'Tap opens, secrets spill out between ice cubes.',
        summary: 'Kitchen faucets now mutter login credentials for long-deleted agency accounts. Quick listeners bank the intel.',
        icon: '💧',
        weight: 3,
        effect: { ipDelta: 2 },
      }),
      createEffect({
        id: 'nd_bonus_satellite_seed_rain',
        label: 'Satellite Seed Rain',
        headline: 'MICROCHIP “HAIL” COATS FIELDS',
        subhead: 'Farmers scoop glittering pellets into mason jars marked CLASSIFIED.',
        summary: 'Debris from a decommissioned spy satellite sprinkles firmware shards over the prairie, boosting surveillance yields.',
        icon: '🌾',
        weight: 1,
        effect: { truthDelta: 1, ipDelta: 1 },
      }),
    ],
    events: [
      createEffect({
        id: 'nd_event_pipeline_echo',
        label: 'Pipeline Echo Choir',
        headline: 'VALVES HUM “WE KNOW WHAT YOU DID”',
        subhead: 'Engineers admit pipeline is whispering agency roll call.',
        summary: 'The Bakken mainline begins singing through the night, naming every operative who ever tapped the crude supply.',
        icon: '🎶',
        weight: 3,
        effect: { truthDelta: 2 },
      }),
      createEffect({
        id: 'nd_event_frozen_drone_yard',
        label: 'Frozen Drone Yard',
        headline: 'HUNDREDS OF DRONES FREEZE MID-TAKEOFF',
        subhead: 'They hover, frostbitten, pointing toward a single warehouse.',
        summary: 'A winter microburst flash-freezes classified deliveries. Whoever thaws them first gets the manifests.',
        icon: '🧊',
        weight: 2,
        effect: { ipDelta: 2 },
      }),
      createEffect({
        id: 'nd_event_williston_time_loop',
        label: 'Williston Time Loop',
        headline: 'DINER CLOCKS RUN BACKWARDS FOR ONE SHIFT',
        subhead: 'Customers finish coffee before ordering.',
        summary: 'Analysts exploit the loop to re-run the same intel drop three times. Skeptics wake up already convinced.',
        icon: '⏱️',
        weight: 1,
        effect: { truthDelta: 1, pressureDelta: 1 },
      }),
    ],
  },
  {
    tag: {
      id: 'florida_strange_current',
      label: 'Florida Manifold',
      description: 'Humidity thick with conspiracies, oranges, and interdimensional tourists.',
      states: ['FL', '12'],
    },
    bonuses: [
      createEffect({
        id: 'fl_bonus_airboat_numbers',
        label: 'Airboat Number Stations',
        headline: 'EVERGLADES TOUR GUIDE BROADCASTS PRIME NUMBERS',
        subhead: 'Gators nod knowingly.',
        summary: 'Night rides now include coded instructions piped through static-laced loudspeakers, synced with swamp fireflies.',
        icon: '🐊',
        weight: 2,
        effect: { truthDelta: 2, ipDelta: 1 },
      }),
      createEffect({
        id: 'fl_bonus_motel_oracle',
        label: 'Motel Oracle Loyalty Card',
        headline: 'EXIT-7 MOTEL CLERK TELLS FUTURE, TAKES CASH',
        subhead: 'He stamps every card “DO NOT TRUST ROOM 213.”',
        summary: 'Check-in ritual unlocks glimpses of next week’s cover-up. Management swears he just “reads people well.”',
        icon: '🗝️',
        weight: 3,
        effect: { ipDelta: 3 },
      }),
      createEffect({
        id: 'fl_bonus_tourist_ufo_ferry',
        label: 'Tourist UFO Ferry',
        headline: 'PANHANDLE FERRY CROSSES TRIANGLE IN 12 MINUTES',
        subhead: 'Passengers disembark with matching sunburn sigils.',
        summary: 'Ferry route slices through a geometry glitch, catapulting operatives ahead of schedule and straight into soft targets.',
        icon: '🛸',
        weight: 1,
        effect: { truthDelta: 1, pressureDelta: 1 },
      }),
    ],
    events: [
      createEffect({
        id: 'fl_event_reptilian_press_conference',
        label: 'Reptilian Press Conference',
        headline: 'STATE CAPITOL MICROPHONES HISS IN REPTO-SPEAK',
        subhead: 'Officials insist it was “humid feedback.”',
        summary: 'Televised briefing devolves into forked-tongue revelations. Viewers at home rewind the stream until the feed mysteriously burns out.',
        icon: '🦎',
        weight: 3,
        effect: { truthDelta: 4, ipDelta: -1 },
      }),
      createEffect({
        id: 'fl_event_themepark_blackout',
        label: 'Theme Park Blackout',
        headline: 'MASCOTS FREEZE, EYES GLOW BLUE',
        subhead: 'Families escorted away by polite agents.',
        summary: 'Animatronics lock into perfect salute, projecting classified coordinates on the nearest rollercoaster. Queue lines cheer.',
        icon: '🎢',
        weight: 2,
        effect: { ipDelta: 2 },
      }),
      createEffect({
        id: 'fl_event_citrus_psychic_bloom',
        label: 'Citrus Psychic Bloom',
        headline: 'ORANGE GROVES BLOSSOM WITH WIFI SIGNALS',
        subhead: 'Phones auto-connect to network named “THE TRUTH”.',
        summary: 'Harvest teams record impossible, hyper-clear dreams after squeezing the crop. Rival networks scramble to jam the orchard.',
        icon: '🍊',
        weight: 1,
        effect: { truthDelta: 2, pressureDelta: 1 },
      }),
    ],
  },
  {
    tag: {
      id: 'nv_neon_occult',
      label: 'Nevada Neon Occult',
      description: 'Desert casinos, secret runways, and retro-future radio towers.',
      states: ['NV', '32'],
    },
    bonuses: [
      createEffect({
        id: 'nv_bonus_slot_machine_divination',
        label: 'Slot Machine Divination',
        headline: 'JACKPOTS SPELL OUT AGENCY CALL SIGNS',
        subhead: 'Security tapes mysteriously loop over the reveal.',
        summary: 'High rollers pull triple oracle-7s and walk away with more intel than chips. Pit bosses shrug and comp the truth drinks.',
        icon: '🎰',
        weight: 3,
        effect: { truthDelta: 2, ipDelta: 1 },
      }),
      createEffect({
        id: 'nv_bonus_desert_zeppelin_drop',
        label: 'Desert Zeppelin Drop',
        headline: 'BLIMP RAINS POLYGRAPH BALLOONS',
        subhead: 'Every balloon labeled “JUST BREATHE HONESTLY.”',
        summary: 'Night sky fills with helium truth orbs gently landing on suburban lawns. Each contains a working interrogation rig.',
        icon: '🎈',
        weight: 2,
        effect: { truthDelta: 3 },
      }),
      createEffect({
        id: 'nv_bonus_area51_clearance_sale',
        label: 'Area 51 Clearance Sale',
        headline: 'SURPLUS HANGAR HOLDS “CLASSIFIED GARAGE SALE”',
        subhead: 'Handwritten sign: “NO PHOTOS, NO REFUNDS, NO MEN-IN-BLACK.”',
        summary: 'Retired engineers dump prototypes at discount rates. Savvy operatives snag cloaking blankets and EMP-resistant clipboards.',
        icon: '🛸',
        weight: 1,
        effect: { ipDelta: 3 },
      }),
    ],
    events: [
      createEffect({
        id: 'nv_event_mirrorstorm',
        label: 'Strip Mirrorstorm',
        headline: 'CASINO MIRRORS REFLECT ALTERNATE TIMELINE',
        subhead: 'Tourists watch themselves lose at secret operations.',
        summary: 'Reflections show tomorrow’s scandals in real time. Surveillance teams scramble to photograph the future before it blinks out.',
        icon: '🪞',
        weight: 3,
        effect: { truthDelta: 3 },
      }),
      createEffect({
        id: 'nv_event_coyote_oracle',
        label: 'Coyote Oracle Broadcast',
        headline: 'PACK OF COYOTES HOWLS ENCRYPTED WEBSITES',
        subhead: 'Ham radios across the desert light up with login prompts.',
        summary: 'Animals gather at mile marker 51 and chant root passwords in perfect chorus. Agency field teams race to transcribe.',
        icon: '🐺',
        weight: 2,
        effect: { ipDelta: 2 },
      }),
      createEffect({
        id: 'nv_event_phantom_table_games',
        label: 'Phantom Table Games',
        headline: 'DEALERS SERVE INVISIBLE HIGH ROLLERS',
        subhead: 'Chips float, drinks empty, secrets leak.',
        summary: 'Roulette wheels spin themselves, landing on coordinates only insiders recognize. Winners leave dossiers in their wake.',
        icon: '🃏',
        weight: 1,
        effect: { truthDelta: 1, pressureDelta: 1 },
      }),
    ],
  },
  {
    tag: {
      id: 'nj_megacorridor',
      label: 'Jersey Megacorridor',
      description: 'Rest-stop gossip pipelines and pharmaceutical hush money.',
      states: ['NJ', '34'],
    },
    bonuses: [
      createEffect({
        id: 'nj_bonus_turnpike_cb_rally',
        label: 'Turnpike CB Rally',
        headline: 'TRUCKERS JAM CHANNEL 19 WITH REDACTED RECIPES',
        subhead: 'Every ingredient is a project codename.',
        summary: 'Rest stop parking lots hum with rigs swapping hush-hush intelligence disguised as slow-cooker gossip.',
        icon: '📻',
        weight: 3,
        effect: { truthDelta: 2, ipDelta: 1 },
      }),
      createEffect({
        id: 'nj_bonus_pharma_samples',
        label: 'Pharma Sample Overflow',
        headline: 'REPS DUMP UNLABELED CASES AT WAREHOUSE B',
        subhead: 'Everything stamped “FOR QUIET DISTRIBUTION ONLY.”',
        summary: 'Overstock shipments contain morale boosters and memory serums. Operatives requisition pallets before the audit hits.',
        icon: '💊',
        weight: 2,
        effect: { ipDelta: 3 },
      }),
      createEffect({
        id: 'nj_bonus_pine_barrens_signal',
        label: 'Pine Barrens Signal Fire',
        headline: 'BLUE FLAMES SPELL OUT ROUTING NUMBERS',
        subhead: 'Campers roast marshmallows, memorize offshore accounts.',
        summary: 'Night hikers watch will-o’-wisps render clandestine bank transfers in the treetops. Treasury teams take frantic notes.',
        icon: '🔥',
        weight: 1,
        effect: { truthDelta: 1, pressureDelta: 1 },
      }),
    ],
    events: [
      createEffect({
        id: 'nj_event_turnpike_time_fog',
        label: 'Turnpike Time Fog',
        headline: 'EXIT 12 COVERED IN CLOCK-STOPPING MIST',
        subhead: 'Commuters arrive before they leave; toll booths confused.',
        summary: 'A luminescent fog halts time for twelve precious minutes. Operatives reposition surveillance vans under the cover of reversed traffic.',
        icon: '🌫️',
        weight: 3,
        effect: { truthDelta: 2 },
      }),
      createEffect({
        id: 'nj_event_reststop_flashmob',
        label: 'Rest-Stop Flash Mob Briefing',
        headline: 'JANITORS BREAK INTO CHOREOGRAPHED LEAK',
        subhead: 'Routine mop bucket drill reveals black-budget line items.',
        summary: 'Every employee at Molly Pitcher rest stop freezes, then performs a perfect interpretive whistleblower routine. Drivers applaud, record, upload.',
        icon: '🧹',
        weight: 2,
        effect: { truthDelta: 1, ipDelta: 2 },
      }),
      createEffect({
        id: 'nj_event_gwb_lightcode',
        label: 'Bridge Lightcode Cascade',
        headline: 'GEORGE WASHINGTON BRIDGE BLINKS BINARY',
        subhead: 'Port Authority swears it was a “patriotic test pattern.”',
        summary: 'An 8-bit aurora pulses across the Hudson, uploading clearance keys to anyone stuck in traffic with a dashcam.',
        icon: '🌉',
        weight: 1,
        effect: { pressureDelta: 2 },
      }),
    ],
  },
];

export const STATE_TAG_LOOKUP: Record<string, StateThemedPool> = STATE_THEMED_POOLS.reduce(
  (acc, pool) => {
    for (const stateId of pool.tag.states) {
      const normalized = stateId.trim().toUpperCase();
      acc[normalized] = pool;
    }
    return acc;
  },
  {} as Record<string, StateThemedPool>,
);

export const resolvePoolForState = (state: Pick<StateData, 'abbreviation' | 'id'>): StateThemedPool | null => {
  const byAbbreviation = STATE_TAG_LOOKUP[state.abbreviation.toUpperCase()];
  if (byAbbreviation) {
    return byAbbreviation;
  }
  const byId = STATE_TAG_LOOKUP[String(state.id).toUpperCase()];
  return byId ?? null;
};
