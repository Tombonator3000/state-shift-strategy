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

  return ensureArray(gameState?.controlledStates).reduce((total, stateId) => {
    const normalized = normalizeStateId(stateId, gameState?.states);
    return normalizedTargets.has(normalized) ? total + 1 : total;
  }, 0);
};

const countCapturedMatches = (gameState: any, targets?: Set<string>): number => {
  const plays = ensureArray(gameState?.factionPlayHistory);
  let total = 0;

  for (const record of plays) {
    const capturedStates = ensureArray(record?.capturedStates);
    for (const entry of capturedStates) {
      const normalized = normalizeStateId(entry, gameState?.states);
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

const countCardTypePlays = (gameState: any, type: string): number => {
  return ensureArray(gameState?.factionPlayHistory).filter(
    record => record?.card?.type === type,
  ).length;
};

const sumPositiveTruthDelta = (gameState: any): number => {
  return ensureArray(gameState?.factionPlayHistory).reduce((total, record) => {
    const delta = typeof record?.truthDelta === 'number' ? record.truthDelta : 0;
    return delta > 0 ? total + delta : total;
  }, 0);
};

const countZonePlaysOnStates = (gameState: any, targets: Set<string>): number => {
  return ensureArray(gameState?.factionPlayHistory).filter(record => {
    if (record?.card?.type !== 'ZONE') {
      return false;
    }

    const normalized = normalizeStateId(record?.targetState, gameState?.states);
    return normalized && targets.has(normalized);
  }).length;
};

const countMediaAndAttackPairs = (gameState: any): number => {
  const plays = ensureArray(gameState?.factionPlayHistory);
  const media = plays.filter(record => record?.card?.type === 'MEDIA').length;
  const attack = plays.filter(record => record?.card?.type === 'ATTACK').length;
  return Math.min(media, attack);
};

export const AGENDA_DATABASE: SecretAgenda[] = [
  // TRUTH FACTION AGENDAS
  {
    id: 'truth_bat_boy_brunch',
    faction: 'truth',
    category: 'territorial',
    title: "Bat Boy's Brunch Brigade",
    headline: 'BAT BOY BUSTS BRUNCH BAN!',
    operationName: 'Operation Bat Buffet',
    issueTheme: 'Cryptid Hospitality',
    pullQuote: '“He only eats waffles shaped like conspiracy charts.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Starburst tabloid accent',
    },
    description: 'Control three Appalachian pantry states (WV, KY, TN, or PA) to host Bat Boy\'s roaming brunch buffet.',
    target: 3,
    difficulty: 'medium',
    checkProgress: gameState => countControlledMatches(gameState, ['WV', 'KY', 'TN', 'PA']),
    flavorText: 'He only eats waffles shaped like conspiracy charts.'
  },
  {
    id: 'truth_moonbeam_marmalade',
    faction: 'truth',
    category: 'resource',
    title: 'Moonbeam Marmalade Slow-Cook',
    headline: 'MOONBEAM JAM TOASTS THE SHADOW STATE!',
    operationName: 'Operation Luncheon Eclipse',
    issueTheme: 'Lunar Supply Lines',
    pullQuote: '“Keep stirring until the spectrum sings.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Radiant moonbeam graphic',
    },
    description: 'Keep the Truth meter above 80% for three consecutive turns so the lunar marmalade can properly set.',
    target: 3,
    difficulty: 'hard',
    checkProgress: gameState => resolveStreak(gameState, 'truthAbove80Streak'),
    flavorText: 'Stir only under full moons and while humming the numbers station jingle.'
  },
  {
    id: 'truth_ufo_retrieval_log',
    faction: 'truth',
    category: 'strategic',
    title: 'UFO Retrieval Mise en Place',
    headline: 'SAUCER STOCKPILE READY FOR PRIME TIME!',
    operationName: 'Operation Crash Cart',
    issueTheme: 'Desert Disclosure',
    pullQuote: '“Every saucer ships with complimentary stardust sprinkles.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Stylized UFO burst',
    },
    description: 'Run four ZONE recipes on desert crash sites (NV, NM, AZ, UT) to stock the crash cart pantry.',
    target: 4,
    difficulty: 'medium',
    checkProgress: gameState =>
      countZonePlaysOnStates(gameState, new Set(['NV', 'NM', 'AZ', 'UT'])),
    flavorText: 'Every saucer comes with a complimentary spice rack of stardust.'
  },
  {
    id: 'truth_tabloid_taste_test',
    faction: 'truth',
    category: 'influence',
    title: 'Tabloid Taste Test Kitchen',
    headline: 'GOSSIP GAZETTE DECLARES EMERGENCY BAKE-OFF!',
    operationName: 'Operation Front Page',
    issueTheme: 'Media Blitz',
    pullQuote: '“Preheat the presses until they glow government-issue green.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Front page burst graphic',
    },
    description: 'Publish six MEDIA spreads to convince readers that every recipe doubles as emergency disclosure protocol.',
    target: 6,
    difficulty: 'easy',
    checkProgress: gameState => countCardTypePlays(gameState, 'MEDIA'),
    flavorText: 'Step one: preheat the presses until they glow government-issue green.'
  },
  {
    id: 'truth_cryptid_potluck',
    faction: 'truth',
    category: 'territorial',
    title: 'Cryptid Potluck Planning',
    headline: 'CRYPTIDS RSVP WITH SIGNATURE CASSEROLES!',
    operationName: 'Operation Creature Comfort',
    issueTheme: 'Mythic Diplomacy',
    pullQuote: '“Please label any dishes that contain tracking powder.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Cryptid claw graphic',
    },
    description: 'Secure four cryptid hotspots (WA, OR, WV, NJ, MT, or NH) so every monster brings its signature casserole.',
    target: 4,
    difficulty: 'hard',
    checkProgress: gameState => countControlledMatches(gameState, ['WA', 'OR', 'WV', 'NJ', 'MT', 'NH']),
    flavorText: 'Please label any dishes that contain silver or government tracking powder.'
  },
  {
    id: 'truth_abduction_bakeoff',
    faction: 'truth',
    category: 'strategic',
    title: 'Abduction Bake-Off',
    headline: 'LEVITATING SOUFFLÉS SWAY SWING STATES!',
    operationName: 'Operation Beam Bake',
    issueTheme: 'Statewide Spectacle',
    pullQuote: '“Judges deduct points if the probe frosting deflates before plating.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Antigravity whisk graphic',
    },
    description: 'Capture three states with any recipe card to prove your soufflé can levitate swing voters.',
    target: 3,
    difficulty: 'medium',
    checkProgress: gameState => countCapturedMatches(gameState),
    flavorText: 'Judges deduct points if the probe frosting deflates before plating.'
  },
  {
    id: 'truth_cosmic_conserve',
    faction: 'truth',
    category: 'resource',
    title: 'Cosmic Conserve Drive',
    headline: 'NEBULA JAM DRIZZLED OVER THE AIRWAVES!',
    operationName: 'Operation Cosmic Pantry',
    issueTheme: 'Truth Momentum',
    pullQuote: '“Pairs nicely with pancakes and interdimensional whistleblowing.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Jar of cosmic conserve illustration',
    },
    description: 'Accumulate +25 Truth from your card plays to bottle enough nebula jelly for the next newsletter drop.',
    target: 25,
    difficulty: 'legendary',
    checkProgress: gameState => sumPositiveTruthDelta(gameState),
    flavorText: 'Pairs nicely with pancakes and interdimensional whistleblowing.'
  },

  // GOVERNMENT FACTION AGENDAS
  {
    id: 'gov_capitol_stew',
    faction: 'government',
    category: 'territorial',
    title: 'Capitol Cafeteria Stew',
    headline: 'Case Brief: Capitol Cafeteria Stew',
    operationName: 'Casefile 17-AC: Capitol Cafeteria',
    issueTheme: 'Narrative Containment',
    pullQuote: '“Simmer for six hours or until all whistleblowers dissolve.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Classified clearance stamp',
    },
    description: 'Control any three beltway kitchen hubs (DC, VA, MD, or CO) to keep the staff soup on-message.',
    target: 3,
    difficulty: 'easy',
    checkProgress: gameState => countControlledMatches(gameState, ['DC', 'VA', 'MD', 'CO']),
    flavorText: 'Simmer for six hours or until all whistleblowers dissolve.'
  },
  {
    id: 'gov_field_ration_redactions',
    faction: 'government',
    category: 'influence',
    title: 'Field-Ration Redactions',
    headline: 'Directive 29-D: Field-Ration Redactions',
    operationName: 'Operation Placemat Silence',
    issueTheme: 'Information Discipline',
    pullQuote: '“Each serving includes a marker to black out inconvenient ingredients.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Government directive seal',
    },
    description: 'Broadcast six MEDIA briefings so every mess hall placemat matches the official talking points.',
    target: 6,
    difficulty: 'medium',
    checkProgress: gameState => countCardTypePlays(gameState, 'MEDIA'),
    flavorText: 'Each serving includes a complimentary marker to black out inconvenient ingredients.'
  },
  {
    id: 'gov_supply_chain_soup',
    faction: 'government',
    category: 'resource',
    title: 'Supply Chain Soup',
    headline: 'Logistics Bulletin 88-F: Supply Chain Soup',
    operationName: 'Operation Pantry Lockdown',
    issueTheme: 'Resource Security',
    pullQuote: '“Season liberally with bureaucracy and a dash of surveillance oregano.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Logistics control stamp',
    },
    description: 'Lock down four heartland depots (IA, NE, KS, MO, OK, or AR) to ration the mystery stock cubes.',
    target: 4,
    difficulty: 'medium',
    checkProgress: gameState => countControlledMatches(gameState, ['IA', 'NE', 'KS', 'MO', 'OK', 'AR']),
    flavorText: 'Season liberally with bureaucracy and a dash of surveillance oregano.'
  },
  {
    id: 'gov_ufo_recall_paperwork',
    faction: 'government',
    category: 'strategic',
    title: 'UFO Recall Paperwork',
    headline: 'Recall Notice 51-B: Saucer Asset Recovery',
    operationName: 'Operation Desert Ledger',
    issueTheme: 'Crash Site Compliance',
    pullQuote: '“Form 51-B must be filed in triplicate and glazed with hush-hush honey.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Recall notice stamp',
    },
    description: 'Repossess three desert crash sites through captures to ensure the saucer recall notices stay classified.',
    target: 3,
    difficulty: 'hard',
    checkProgress: gameState =>
      countCapturedMatches(gameState, new Set(['NV', 'NM', 'AZ', 'UT'])),
    flavorText: 'Form 51-B must be filed in triplicate and glazed with hush-hush honey.'
  },
  {
    id: 'gov_coverup_casserole',
    faction: 'government',
    category: 'sabotage',
    title: 'Cover-Up Casserole',
    headline: 'Continuity Memo 7-Q: Cover-Up Casserole',
    operationName: 'Operation Quiet Bake',
    issueTheme: 'Truth Suppression',
    pullQuote: '“Serve piping hot with a garnish of shredded affidavits.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Continuity memo stamp',
    },
    description: 'Keep Truth under 20% for three consecutive turns to bake the cover crust before anyone peeks.',
    target: 3,
    difficulty: 'hard',
    checkProgress: gameState => resolveStreak(gameState, 'truthBelow20Streak'),
    flavorText: 'Serve piping hot with a garnish of shredded affidavits.'
  },
  {
    id: 'gov_spice_rack_surveillance',
    faction: 'government',
    category: 'strategic',
    title: 'Spice Rack Surveillance',
    headline: 'Observation Order 3-S: Spice Rack Surveillance',
    operationName: 'Operation Pantry Sweep',
    issueTheme: 'National Monitoring',
    pullQuote: '“Every shaker hides a listening device and a mild paprika aftertaste.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Observation clearance seal',
    },
    description: 'Control NY, CA, TX, and FL to monitor the nation\'s palate from coast to coast.',
    target: 4,
    difficulty: 'hard',
    checkProgress: gameState => countControlledMatches(gameState, ['NY', 'CA', 'TX', 'FL']),
    flavorText: 'Every shaker hides a listening device and a mild paprika aftertaste.'
  },
  {
    id: 'gov_black_budget_bbq',
    faction: 'government',
    category: 'resource',
    title: 'Black-Budget Barbecue',
    headline: 'Appropriations Dossier: Black-Budget Barbecue',
    operationName: 'Operation Smoke Screen',
    issueTheme: 'Fiscal Obfuscation',
    pullQuote: '“Secret sauce recipe: equal parts smoke, mirrors, and discretionary funds.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Appropriations approval stamp',
    },
    description: 'Stockpile 220 IP to finance the annual classified cookout without triggering an audit.',
    target: 220,
    difficulty: 'legendary',
    checkProgress: gameState => (typeof gameState?.ip === 'number' ? Math.max(0, gameState.ip) : 0),
    flavorText: 'Secret sauce recipe: equal parts smoke, mirrors, and discretionary funds.'
  },

  // SHARED/NEUTRAL AGENDAS
  {
    id: 'shared_paranoid_picnic',
    faction: 'both',
    category: 'territorial',
    title: 'Paranoid Picnic Tour',
    headline: 'PARANOID PICNIC POP-UP STARTLES INTERSTATES!',
    operationName: 'Operation Roadside Potluck',
    issueTheme: 'Traveling Influence',
    pullQuote: '“Pack extra foil hats so the ants can\'t read your recipes.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Roadside marquee graphic',
    },
    description: 'Control four roadside delicacy states (WI, MN, NJ, LA, or NM) to keep the traveling potluck rolling.',
    target: 4,
    difficulty: 'medium',
    checkProgress: gameState => countControlledMatches(gameState, ['WI', 'MN', 'NJ', 'LA', 'NM']),
    flavorText: 'Pack extra foil hats so the ants can\'t read your recipes.'
  },
  {
    id: 'shared_midnight_press_run',
    faction: 'both',
    category: 'influence',
    title: 'Midnight Press Run',
    headline: 'MIDNIGHT PRESS RUN BLENDS FACT & FRENZY!',
    operationName: 'Operation Printing Press',
    issueTheme: 'Narrative Fusion',
    pullQuote: '“Alternate bites of outrage and revelation for best mouthfeel.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Printing press burst',
    },
    description: 'Serve three rounds of attack-and-media pairings to print a perfectly balanced conspiracy menu.',
    target: 3,
    difficulty: 'medium',
    checkProgress: gameState => countMediaAndAttackPairs(gameState),
    flavorText: 'Alternate bites of outrage and revelation for best mouthfeel.'
  },
  {
    id: 'shared_combo_platter',
    faction: 'both',
    category: 'strategic',
    title: 'Combo Platter Column',
    headline: 'COMBO PLATTER COLUMN KEEPS BUFFET GLOWING!',
    operationName: 'Operation Resonant Tray',
    issueTheme: 'Synergy Sustainment',
    pullQuote: '“If the tray levitates, you\'ve hit the right flavor-frequency resonance.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Levitation rings graphic',
    },
    description: 'Maintain two simultaneous state combination bonuses to keep the buffet table glowing.',
    target: 2,
    difficulty: 'legendary',
    checkProgress: gameState => ensureArray(gameState?.activeStateCombinationIds).length,
    flavorText: 'If the tray levitates, you\'ve hit the right flavor-frequency resonance.'
  }
];

export const getRandomAgenda = (faction: 'truth' | 'government'): SecretAgenda => {
  const factionAgendas = AGENDA_DATABASE.filter(agenda =>
    agenda.faction === faction || agenda.faction === 'both'
  );

  // Weight by difficulty - easier agendas more likely
  const weightedAgendas: SecretAgenda[] = [];
  factionAgendas.forEach(agenda => {
    const weight = agenda.difficulty === 'easy' ? 4 :
                   agenda.difficulty === 'medium' ? 3 :
                   agenda.difficulty === 'hard' ? 2 : 1;
    for (let i = 0; i < weight; i++) {
      weightedAgendas.push(agenda);
    }
  });

  return weightedAgendas[Math.floor(Math.random() * weightedAgendas.length)];
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
