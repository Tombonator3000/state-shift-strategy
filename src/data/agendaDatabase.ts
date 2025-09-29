import { weightForIssue } from './agendaIssues';

export interface SecretAgenda {
  id: string;
  faction: 'truth' | 'government' | 'both';
  category: 'territorial' | 'resource' | 'influence' | 'sabotage' | 'strategic';
  title: string;
  headline: string;
  operationName: string;
  issueTheme: string;
  pullQuote?: string;
  artCue?: {
    icon?: string;
    alt?: string;
    texture?: string;
  };
  description: string;
  target: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  checkProgress: (gameState: any) => number;
  flavorText: string;
}

const ensureArray = <T>(value: T[] | undefined | null): T[] => {
  return Array.isArray(value) ? value : [];
};

const resolveStreak = (
  gameState: any,
  key: 'truthAbove80Streak' | 'truthBelow20Streak',
): number => {
  const direct = gameState?.[key];
  if (typeof direct === 'number' && Number.isFinite(direct)) {
    return direct;
  }

  const counters = gameState?.timeBasedGoalCounters;
  const fallback = counters?.[key];
  if (typeof fallback === 'number' && Number.isFinite(fallback)) {
    return fallback;
  }

  return 0;
};

const normalizeStateId = (
  value: unknown,
  states?: Array<{ id?: string; abbreviation?: string; name?: string }>,
): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed.length) {
    return '';
  }

  const uppercase = trimmed.toUpperCase();
  if (!Array.isArray(states)) {
    return uppercase;
  }

  const match = states.find(candidate => {
    if (!candidate) {
      return false;
    }

    const id = String(candidate.id ?? '').toUpperCase();
    const abbreviation = String(candidate.abbreviation ?? '').toUpperCase();
    const name = String(candidate.name ?? '').toUpperCase();

    return uppercase === id || uppercase === abbreviation || uppercase === name;
  });

  if (match) {
    const abbr = String(match.abbreviation ?? '').trim();
    if (abbr) {
      return abbr.toUpperCase();
    }

    const id = String(match.id ?? '').trim();
    if (id) {
      return id.toUpperCase();
    }
  }

  return uppercase;
};

const countControlledMatches = (gameState: any, targets: string[]): number => {
  const normalizedTargets = new Set(
    targets.map(target => normalizeStateId(target, gameState?.states)).filter(Boolean),
  );

  if (normalizedTargets.size === 0) {
    return 0;
  }

  const result = ensureArray((gameState as any)?.controlledStates).reduce((total: number, stateId: any): number => {
    const normalized = normalizeStateId(stateId, (gameState as any)?.states);
    return normalizedTargets.has(normalized) ? total + 1 : total;
  }, 0) as number;
  return result;
};

const countCapturedMatches = (gameState: unknown, targets?: Set<string>): number => {
  const plays = ensureArray((gameState as any)?.factionPlayHistory);
  let total: number = 0;

  for (const record of plays) {
    const capturedStates = ensureArray((record as any)?.capturedStates);
    for (const entry of capturedStates) {
      const normalized = normalizeStateId(entry, (gameState as any)?.states);
      if (!normalized) {
        continue;
      }

      if (!targets || targets.has(normalized)) {
        total += 1;
      }
    }
  }

  return total;
};

const countCardTypePlays = (gameState: unknown, type: string): number => {
  return ensureArray((gameState as any)?.factionPlayHistory).filter(
    (record: any) => record?.card?.type === type,
  ).length;
};

const sumPositiveTruthDelta = (gameState: unknown): number => {
  const result = ensureArray((gameState as any)?.factionPlayHistory).reduce((total: number, record: any): number => {
    const delta = typeof record?.truthDelta === 'number' ? record.truthDelta : 0;
    return delta > 0 ? total + delta : total;
  }, 0) as number;
  return result;
};

const countZonePlaysOnStates = (gameState: unknown, targets: Set<string>): number => {
  return ensureArray((gameState as any)?.factionPlayHistory).filter((record: any) => {
    if (record?.card?.type !== 'ZONE') {
      return false;
    }

    const normalized = normalizeStateId(record?.targetState, (gameState as any)?.states);
    return normalized && targets.has(normalized);
  }).length;
};

const countMediaAndAttackPairs = (gameState: unknown): number => {
  const plays = ensureArray((gameState as any)?.factionPlayHistory);
  const media = plays.filter((record: any) => record?.card?.type === 'MEDIA').length;
  const attack = plays.filter((record: any) => record?.card?.type === 'ATTACK').length;
  return Math.min(media, attack);
};

export const AGENDA_DATABASE: SecretAgenda[] = [
  // TRUTH FACTION AGENDAS
  {
    id: 'truth_bat_boy_brunch',
    faction: 'truth',
    category: 'territorial',
    title: "Bat Boy's Campaign Trail",
    headline: 'BAT BOY BARNSTORMS HEARTLAND!',
    operationName: 'Operation Echolocation',
    issueTheme: 'Cryptid Outreach',
    pullQuote: '“He only shakes hands with night-vision gloves.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Starburst tabloid accent',
    },
    description: 'Control three Appalachian strongholds (WV, KY, TN, or PA) so Bat Boy can beam midnight stump speeches into every root cellar.',
    target: 3,
    difficulty: 'medium',
    checkProgress: gameState => countControlledMatches(gameState, ['WV', 'KY', 'TN', 'PA']),
    flavorText: 'He autographs sonar maps between stump speeches.'
  },
  {
    id: 'truth_moonbeam_marmalade',
    faction: 'truth',
    category: 'resource',
    title: 'Moonbeam Signal Uplink',
    headline: 'MOONBEAM BROADCAST FRIES SURVEILLANCE SATS!',
    operationName: 'Operation Lunar Loudspeaker',
    issueTheme: 'Lunar Revelations',
    pullQuote: '“Aim the dish at the moon and whisper the password: cheese.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Radiant moonbeam graphic',
    },
    description: 'Keep the Truth meter above 80% for three consecutive turns to maintain the clandestine moon-to-newsroom broadcast uplink.',
    target: 3,
    difficulty: 'hard',
    checkProgress: gameState => resolveStreak(gameState, 'truthAbove80Streak'),
    flavorText: 'Schedule transmissions to align with authorized cattle abduction weather reports.'
  },
  {
    id: 'truth_ufo_retrieval_log',
    faction: 'truth',
    category: 'strategic',
    title: 'UFO Retrieval Watchlist',
    headline: 'SAUCER SALVAGE CREW OUTRUNS MEN IN KHAKI!',
    operationName: 'Operation Crash Cartography',
    issueTheme: 'Desert Disclosure',
    pullQuote: '“Every shard glows when you hum the X-Files theme.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Stylized UFO burst',
    },
    description: 'Run four ZONE operations on desert crash sites (NV, NM, AZ, UT) to catalogue saucer fragments before the khaki-clad clean-up crew arrives.',
    target: 4,
    difficulty: 'medium',
    checkProgress: gameState =>
      countZonePlaysOnStates(gameState, new Set(['NV', 'NM', 'AZ', 'UT'])),
    flavorText: 'Every saucer comes with a complimentary anti-grav polishing cloth.'
  },
  {
    id: 'truth_tabloid_taste_test',
    faction: 'truth',
    category: 'influence',
    title: 'Tabloid Signal Jam',
    headline: 'GOSSIP DISPATCH BEAMS THROUGH TINFOIL CLOUD!',
    operationName: 'Operation Front Page Frequency',
    issueTheme: 'Media Frenzy',
    pullQuote: '“Warm up the scanners until they smell like ozone.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Front page burst graphic',
    },
    description: 'Publish six MEDIA spreads to flood the airwaves with Elvis clone sightings, lizard congress exposés, and interdimensional gossip.',
    target: 6,
    difficulty: 'easy',
    checkProgress: gameState => countCardTypePlays(gameState, 'MEDIA'),
    flavorText: 'Lead every headline with a blurry handshake between Bigfoot and a senator.'
  },
  {
    id: 'truth_cryptid_potluck',
    faction: 'truth',
    category: 'territorial',
    title: 'Cryptid Summit Circuit',
    headline: 'CRYPTID SUMMIT VOTES TO FORM SHADOW COUNCIL!',
    operationName: 'Operation Creature Conference',
    issueTheme: 'Mythic Diplomacy',
    pullQuote: '“Remember: Bigfoot prefers aisle seats.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Cryptid claw graphic',
    },
    description: 'Secure four cryptid hotspots (WA, OR, WV, NJ, MT, or NH) so every legendary creature attends the clandestine summit on human relations.',
    target: 4,
    difficulty: 'hard',
    checkProgress: gameState => countControlledMatches(gameState, ['WA', 'OR', 'WV', 'NJ', 'MT', 'NH']),
    flavorText: 'Nametags must accommodate claws, hooves, and ectoplasm.'
  },
  {
    id: 'truth_abduction_bakeoff',
    faction: 'truth',
    category: 'strategic',
    title: 'Abduction Awareness Tour',
    headline: 'LEVITATING TOUR BUS ELECTRIFIES SWING STATES!',
    operationName: 'Operation Beam Run',
    issueTheme: 'Close Encounter Roadshow',
    pullQuote: '“Judges deduct points if the tractor beam squeaks.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Antigravity spotlight graphic',
    },
    description: 'Capture three states with any card to film synchronized abduction demonstrations that leave voters craving disclosure.',
    target: 3,
    difficulty: 'medium',
    checkProgress: gameState => countCapturedMatches(gameState),
    flavorText: 'Winners receive commemorative probe-shaped microphones.'
  },
  {
    id: 'truth_cosmic_conserve',
    faction: 'truth',
    category: 'resource',
    title: 'Cosmic Disclosure Drive',
    headline: 'NEBULA DOSSIERS DUMPED ON NEWSSTANDS!',
    operationName: 'Operation Cosmic Megaphone',
    issueTheme: 'Interstellar Whistleblowing',
    pullQuote: '“Pairs nicely with rumors of Martian labor unions.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Jar of cosmic conserve illustration',
    },
    description: 'Accumulate +25 Truth from your card plays to bankroll the next leak of classified nebula dossiers.',
    target: 25,
    difficulty: 'legendary',
    checkProgress: gameState => sumPositiveTruthDelta(gameState),
    flavorText: 'Press releases are printed on meteorite confetti.'
  },

  // GOVERNMENT FACTION AGENDAS
  {
    id: 'gov_capitol_stew',
    faction: 'government',
    category: 'territorial',
    title: 'Capitol Cloakdown Drills',
    headline: 'Case Brief: CAPITOL CLOAKDOWN CONTAINS BAT BOY',
    operationName: 'Casefile 17-AC: Cloakdown',
    issueTheme: 'Narrative Containment',
    pullQuote: '“Replace every podium mic with ultrasonic Bat Boy dampeners.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Classified clearance stamp',
    },
    description: 'Control any three beltway command hubs (DC, VA, MD, or CO) to stage emergency briefings that keep Bat Boy rumors quarantined.',
    target: 3,
    difficulty: 'easy',
    checkProgress: gameState => countControlledMatches(gameState, ['DC', 'VA', 'MD', 'CO']),
    flavorText: 'All statements vetted by the Department of Implausible Denial.'
  },
  {
    id: 'gov_field_ration_redactions',
    faction: 'government',
    category: 'influence',
    title: 'Field Memo Mindwipe',
    headline: 'Directive 29-D: FIELD AGENTS FORGET ELVIS CLONE',
    operationName: 'Operation Memory Eraser',
    issueTheme: 'Information Discipline',
    pullQuote: '“Each briefing includes optional amnesia gum.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Government directive seal',
    },
    description: 'Broadcast six MEDIA briefings to overwrite field reports about the rogue Elvis clone with sanitized bullet points.',
    target: 6,
    difficulty: 'medium',
    checkProgress: gameState => countCardTypePlays(gameState, 'MEDIA'),
    flavorText: 'Side effects include humming suspiciously like Jailhouse Rock.'
  },
  {
    id: 'gov_supply_chain_soup',
    faction: 'government',
    category: 'resource',
    title: 'Containment Grid Checkpoints',
    headline: 'Logistics Bulletin 88-F: CRYPTID QUARANTINE GRID',
    operationName: 'Operation Perimeter Lockdown',
    issueTheme: 'Containment Theatre',
    pullQuote: '“Deploy roadblocks disguised as farmers markets.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Logistics control stamp',
    },
    description: 'Lock down four heartland corridors (IA, NE, KS, MO, OK, or AR) to corral migrating cryptids before tabloids sniff the trail.',
    target: 4,
    difficulty: 'medium',
    checkProgress: gameState => countControlledMatches(gameState, ['IA', 'NE', 'KS', 'MO', 'OK', 'AR']),
    flavorText: 'Every checkpoint issues complimentary anti-Yeti booties.'
  },
  {
    id: 'gov_ufo_recall_paperwork',
    faction: 'government',
    category: 'strategic',
    title: 'UFO Recall Paperwork',
    headline: 'Recall Notice 51-B: Saucer Asset Recovery',
    operationName: 'Operation Desert Ledger',
    issueTheme: 'Crash Site Compliance',
    pullQuote: '“Form 51-B must be filed in triplicate and sealed with anti-telepathy wax.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Recall notice stamp',
    },
    description: 'Repossess three desert crash sites through captures before the tabloids broadcast unauthorized saucer recall notices.',
    target: 3,
    difficulty: 'hard',
    checkProgress: gameState =>
      countCapturedMatches(gameState, new Set(['NV', 'NM', 'AZ', 'UT'])),
    flavorText: 'Failure triggers a mandatory Men-in-Khaki conga line.'
  },
  {
    id: 'gov_coverup_casserole',
    faction: 'government',
    category: 'sabotage',
    title: 'Cover-Up Command Performance',
    headline: 'Continuity Memo 7-Q: LIGHTS OFF, TRUTH GONE',
    operationName: 'Operation Quiet Stage',
    issueTheme: 'Truth Suppression',
    pullQuote: '“Cue fog machines before releasing denial statements.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Continuity memo stamp',
    },
    description: 'Keep Truth under 20% for three consecutive turns to drown the airwaves in distraction musicals and eclipse the leak.',
    target: 3,
    difficulty: 'hard',
    checkProgress: gameState => resolveStreak(gameState, 'truthBelow20Streak'),
    flavorText: 'Encore features nine dancers dressed as non-existent aliens.'
  },
  {
    id: 'gov_spice_rack_surveillance',
    faction: 'government',
    category: 'strategic',
    title: 'Satellite Surveillance Grid',
    headline: 'Observation Order 3-S: COAST-TO-COAST MIND NET',
    operationName: 'Operation Panorama Sweep',
    issueTheme: 'National Monitoring',
    pullQuote: '“Every traffic cam doubles as an astral projector jammer.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Observation clearance seal',
    },
    description: 'Control NY, CA, TX, and FL to triangulate celebrity clone sightings before the truth movement livestreams them.',
    target: 4,
    difficulty: 'hard',
    checkProgress: gameState => countControlledMatches(gameState, ['NY', 'CA', 'TX', 'FL']),
    flavorText: 'Headquarters monitors Bigfoot, Elvis, and the Loch Ness intern simultaneously.'
  },
  {
    id: 'gov_black_budget_bbq',
    faction: 'government',
    category: 'resource',
    title: 'Black-Budget Cover Band',
    headline: 'Appropriations Dossier: PAY THE ELVIS DECOY',
    operationName: 'Operation Velvet Fog',
    issueTheme: 'Fiscal Obfuscation',
    pullQuote: '“Secret line item: rhinestone jumpsuits for classified doubles.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Appropriations approval stamp',
    },
    description: 'Stockpile 220 IP to bankroll the global Elvis decoy tour that keeps the real King in deep cover.',
    target: 220,
    difficulty: 'legendary',
    checkProgress: gameState => (typeof gameState?.ip === 'number' ? Math.max(0, gameState.ip) : 0),
    flavorText: 'The receipts are written in glow-in-the-dark redactions.'
  },

  // SHARED/NEUTRAL AGENDAS
  {
    id: 'shared_paranoid_picnic',
    faction: 'both',
    category: 'territorial',
    title: 'Paranoid Motorcade',
    headline: 'PARANOID MOTORCADE PANICS INTERSTATE!',
    operationName: 'Operation Roadside Broadcast',
    issueTheme: 'Traveling Influence',
    pullQuote: '“Wave to the ghosts stationed at every overpass.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Roadside marquee graphic',
    },
    description: 'Control four roadside hotspots (WI, MN, NJ, LA, or NM) to escort the caravan of psychics, cryptids, and clairvoyant truckers.',
    target: 4,
    difficulty: 'medium',
    checkProgress: gameState => countControlledMatches(gameState, ['WI', 'MN', 'NJ', 'LA', 'NM']),
    flavorText: 'Tinfoil streamers are mandatory for all convertibles.'
  },
  {
    id: 'shared_midnight_press_run',
    faction: 'both',
    category: 'influence',
    title: 'Midnight Press Run',
    headline: 'MIDNIGHT PRESS RUN PRINTS GHOSTLY EDITION!',
    operationName: 'Operation Spirit Printer',
    issueTheme: 'Narrative Fusion',
    pullQuote: '“Alternate headlines between aliens, Elvis, and outraged senators.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Printing press burst',
    },
    description: 'Serve three rounds of attack-and-media pairings to keep the haunted newsroom staffed with spectral copy editors.',
    target: 3,
    difficulty: 'medium',
    checkProgress: gameState => countMediaAndAttackPairs(gameState),
    flavorText: 'Ink smells faintly of ectoplasm and burnt coffee.'
  },
  {
    id: 'shared_combo_platter',
    faction: 'both',
    category: 'strategic',
    title: 'Combo Timeline Column',
    headline: 'COMBO TIMELINE SPLITS REALITY IN TWO!',
    operationName: 'Operation Parallel Tray',
    issueTheme: 'Temporal Juggling',
    pullQuote: '“If the timeline flickers, you\'re publishing in the right universe.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Levitation rings graphic',
    },
    description: 'Maintain two simultaneous state combination bonuses to balance competing realities in the news cycle.',
    target: 2,
    difficulty: 'legendary',
    checkProgress: gameState => ensureArray(gameState?.activeStateCombinationIds).length,
    flavorText: 'Side B of the paper swears none of this ever happened.'
  }
];

export interface AgendaSelectionOptions {
  issueId?: string;
  excludeIds?: string[];
}

export const getRandomAgenda = (
  faction: 'truth' | 'government',
  options?: AgendaSelectionOptions,
): SecretAgenda => {
  const excluded = new Set(options?.excludeIds ?? []);
  const factionAgendas = AGENDA_DATABASE.filter(agenda => {
    if (excluded.has(agenda.id)) {
      return false;
    }
    return agenda.faction === faction || agenda.faction === 'both';
  });

  if (factionAgendas.length === 0) {
    return AGENDA_DATABASE[Math.floor(Math.random() * AGENDA_DATABASE.length)];
  }

  const issueId = options?.issueId;
  const weightedPool = factionAgendas.flatMap(agenda => {
    const baseWeight = agenda.difficulty === 'easy'
      ? 4
      : agenda.difficulty === 'medium'
        ? 3
        : agenda.difficulty === 'hard'
          ? 2
          : 1;
    const multiplier = weightForIssue(issueId, agenda.issueTheme);
    const effectiveWeight = Math.max(1, Math.round(baseWeight * multiplier));
    return Array.from({ length: effectiveWeight }, () => agenda);
  });

  return weightedPool[Math.floor(Math.random() * weightedPool.length)];
};

export const getAgendaById = (id: string): SecretAgenda | undefined => {
  return AGENDA_DATABASE.find(agenda => agenda.id === id);
};

export const getAgendasByFaction = (faction: 'truth' | 'government' | 'both'): SecretAgenda[] => {
  return AGENDA_DATABASE.filter(agenda => agenda.faction === faction || agenda.faction === 'both');
};

export const getAgendasByDifficulty = (difficulty: 'easy' | 'medium' | 'hard' | 'legendary'): SecretAgenda[] => {
  return AGENDA_DATABASE.filter(agenda => agenda.difficulty === difficulty);
};
