import { weightForIssue } from './agendaIssues';

export interface AgendaStage {
  id: string;
  label: string;
  description: string;
  requirement: string;
  threshold: number;
}

export interface AgendaProgressReport {
  progress: number;
  stageId: string;
}

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
  stages: AgendaStage[];
  checkProgress: (gameState: any) => AgendaProgressReport;
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

  const result = ensureArray(gameState?.controlledStates).reduce((total: number, stateId) => {
    const normalized = normalizeStateId(stateId, gameState?.states);
    return normalizedTargets.has(normalized) ? total + 1 : total;
  }, 0 as number);
  return result as number;
};

const countCapturedMatches = (gameState: any, targets?: Set<string>): number => {
  const plays = ensureArray(gameState?.factionPlayHistory);
  let total: number = 0;

  for (const record of plays) {
    const capturedStates = ensureArray((record as any)?.capturedStates);
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
    (record: any) => record?.card?.type === type,
  ).length;
};

const sumPositiveTruthDelta = (gameState: any): number => {
  const result = ensureArray(gameState?.factionPlayHistory).reduce((total: number, record: any) => {
    const delta = typeof record?.truthDelta === 'number' ? record.truthDelta : 0;
    return delta > 0 ? total + delta : total;
  }, 0 as number);
  return result as number;
};

const sumSuppressedTruthDelta = (gameState: any): number => {
  const result = ensureArray(gameState?.factionPlayHistory).reduce((total: number, record: any) => {
    const delta = typeof record?.truthDelta === 'number' ? record.truthDelta : 0;
    return delta < 0 ? total + Math.abs(delta) : total;
  }, 0 as number);
  return result as number;
};

const countZonePlaysOnStates = (gameState: any, targets: Set<string>): number => {
  return ensureArray(gameState?.factionPlayHistory).filter((record: any) => {
    if (record?.card?.type !== 'ZONE') {
      return false;
    }

    const normalized = normalizeStateId((record as any)?.targetState, gameState?.states);
    return normalized && targets.has(normalized);
  }).length;
};

const countMediaAndAttackPairs = (gameState: any): number => {
  const plays = ensureArray(gameState?.factionPlayHistory);
  const media = plays.filter((record: any) => record?.card?.type === 'MEDIA').length;
  const attack = plays.filter((record: any) => record?.card?.type === 'ATTACK').length;
  return Math.min(media, attack);
};

const clampProgress = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, numeric);
};

export const resolveAgendaStageByProgress = (
  stages: AgendaStage[] | undefined,
  progress: number,
): AgendaStage | undefined => {
  if (!Array.isArray(stages) || stages.length === 0) {
    return undefined;
  }

  const sorted = [...stages].sort((a, b) => a.threshold - b.threshold);
  const fallback = sorted[0];
  const match = [...sorted].reverse().find(stage => progress >= stage.threshold);
  return match ?? fallback;
};

const createStageProgressEvaluator = (
  stages: AgendaStage[],
  compute: (gameState: any) => number,
): ((gameState: any) => AgendaProgressReport) => {
  return (gameState: any): AgendaProgressReport => {
    const rawProgress = compute(gameState);
    const progress = clampProgress(rawProgress);
    const stage = resolveAgendaStageByProgress(stages, progress);
    return {
      progress,
      stageId: stage?.id ?? '',
    };
  };
};

interface AgendaDefinition
  extends Omit<SecretAgenda, 'checkProgress'> {
  computeProgress: (gameState: any) => number;
}

interface StageCopy {
  label?: string;
  description: string;
  requirement?: string;
  threshold?: number;
}

const createAgendaStages = (
  idPrefix: string,
  target: number,
  copy: {
    briefing: StageCopy;
    escalation: StageCopy;
    finale: StageCopy;
  },
): AgendaStage[] => {
  const rawEscalationThreshold = copy.escalation.threshold;
  const computedEscalation = typeof rawEscalationThreshold === 'number'
    ? Math.max(0, rawEscalationThreshold)
    : target <= 2
      ? 1
      : Math.max(1, Math.ceil(target / 2));
  const escalationThreshold = Math.min(
    computedEscalation >= target ? Math.max(1, target - 1) : computedEscalation,
    Math.max(target - 1, 1),
  );

  return [
    {
      id: `${idPrefix}-briefing`,
      label: copy.briefing.label ?? 'Briefing',
      description: copy.briefing.description,
      requirement: copy.briefing.requirement ?? 'Mission dossier acknowledged.',
      threshold: 0,
    },
    {
      id: `${idPrefix}-escalation`,
      label: copy.escalation.label ?? 'Operational Push',
      description: copy.escalation.description,
      requirement:
        copy.escalation.requirement
        ?? `Reach ${escalationThreshold}/${target} progress.`,
      threshold: escalationThreshold,
    },
    {
      id: `${idPrefix}-finale`,
      label: copy.finale.label ?? 'Final Phase',
      description: copy.finale.description,
      requirement:
        copy.finale.requirement
        ?? `Reach ${target}/${target} progress.`,
      threshold: target,
    },
  ];
};

const defineAgenda = (definition: AgendaDefinition): SecretAgenda => {
  const { computeProgress, ...agenda } = definition;
  const evaluator = createStageProgressEvaluator(agenda.stages, computeProgress);
  return {
    ...agenda,
    checkProgress: evaluator,
  };
};

export const AGENDA_DATABASE: SecretAgenda[] = [
  // TRUTH FACTION AGENDAS
  defineAgenda({
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
    stages: createAgendaStages('truth_bat_boy_brunch', 3, {
      briefing: {
        label: 'Ridge Recon',
        description: 'Bat Boy scouts root cellar venues and sympathetic sheriffs.',
        requirement: 'Map out the Appalachian broadcast route.',
      },
      escalation: {
        label: 'Nighttime Canvass',
        description: 'Street teams secure footholds along the ridge towns.',
        requirement: 'Control 2 Appalachian strongholds.',
      },
      finale: {
        label: 'Moonlight Majority',
        description: 'Every holler tunes in to Bat Boy’s midnight stump speech.',
        requirement: 'Control 3 Appalachian strongholds.',
      },
    }),
    computeProgress: gameState => countControlledMatches(gameState, ['WV', 'KY', 'TN', 'PA']),
    flavorText: 'He autographs sonar maps between stump speeches.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('truth_moonbeam_marmalade', 3, {
      briefing: {
        label: 'Signal Calibration',
        description: 'Techs polish the dish and tune the cheese-coded handshake.',
        requirement: 'Truth stabilizes above 80% for the first cycle.',
        threshold: 0,
      },
      escalation: {
        label: 'Lunar Lock',
        description: 'The uplink hums as consecutive broadcasts stay unscrambled.',
        requirement: 'Maintain Truth above 80% for 1 consecutive turn.',
        threshold: 1,
      },
      finale: {
        label: 'Full Spectrum Beam',
        description: 'Moonlight relays every leak straight into the newsroom.',
        requirement: 'Sustain Truth above 80% for 3 consecutive turns.',
      },
    }),
    computeProgress: gameState => resolveStreak(gameState, 'truthAbove80Streak'),
    flavorText: 'Schedule transmissions to align with authorized cattle abduction weather reports.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('truth_ufo_retrieval_log', 4, {
      briefing: {
        label: 'Crash Map Recon',
        description: 'Scouts trace fresh impact craters before khaki squads arrive.',
        requirement: 'Chart the four-state recovery corridor.',
      },
      escalation: {
        label: 'Salvage Convoys',
        description: 'Convoys run covert ZONE drills through the desert night.',
        requirement: 'Complete 2 ZONE operations on desert crash sites.',
      },
      finale: {
        label: 'Hangar Lockdown',
        description: 'Every recovered saucer fragment is catalogued and secured.',
        requirement: 'Complete 4 ZONE operations on NV, NM, AZ, or UT.',
      },
    }),
    computeProgress: gameState =>
      countZonePlaysOnStates(gameState, new Set(['NV', 'NM', 'AZ', 'UT'])),
    flavorText: 'Every saucer comes with a complimentary anti-grav polishing cloth.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('truth_tabloid_taste_test', 6, {
      briefing: {
        label: 'Frequency Warm-Up',
        description: 'Editors align the rumor presses and warm the scanners.',
        requirement: 'Greenlight the gossip wire for launch.',
      },
      escalation: {
        label: 'Tabloid Blitz',
        description: 'Sensational spreads roll off the press in rapid bursts.',
        requirement: 'Publish 3 MEDIA spreads.',
      },
      finale: {
        label: 'Signal Jammed',
        description: 'Every channel loops Elvis clones and reptilian hearings.',
        requirement: 'Publish 6 MEDIA spreads.',
      },
    }),
    computeProgress: gameState => countCardTypePlays(gameState, 'MEDIA'),
    flavorText: 'Lead every headline with a blurry handshake between Bigfoot and a senator.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('truth_cryptid_potluck', 4, {
      briefing: {
        label: 'Summit Invitations',
        description: 'Handlers coax cryptids with RSVP-laced trail mix.',
        requirement: 'Identify which hotspots will host the conclave.',
      },
      escalation: {
        label: 'Delegate Escort',
        description: 'Field teams ferry elusive guests between safehouses.',
        requirement: 'Control 2 cryptid hotspots.',
      },
      finale: {
        label: 'Council Seated',
        description: 'Every legendary creature signs the summit accord.',
        requirement: 'Control 4 cryptid hotspots.',
      },
    }),
    computeProgress: gameState => countControlledMatches(gameState, ['WA', 'OR', 'WV', 'NJ', 'MT', 'NH']),
    flavorText: 'Nametags must accommodate claws, hooves, and ectoplasm.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('truth_abduction_bakeoff', 3, {
      briefing: {
        label: 'Tour Bus Warm-Up',
        description: 'Rig the levitation hydraulics and rehearse the patter.',
        requirement: 'Route the awareness tour through key swing states.',
      },
      escalation: {
        label: 'Demo Flights',
        description: 'Crowds witness synchronized tractor beam choreography.',
        requirement: 'Capture 2 states with any card.',
      },
      finale: {
        label: 'Encore Extraction',
        description: 'Disclosure reels go viral from every tour stop.',
        requirement: 'Capture 3 states with any card.',
      },
    }),
    computeProgress: gameState => countCapturedMatches(gameState),
    flavorText: 'Winners receive commemorative probe-shaped microphones.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('truth_cosmic_conserve', 25, {
      briefing: {
        label: 'Leak Kitchen',
        description: 'Whistleblowers stir cosmic conserve in sealed bunkers.',
        requirement: 'Secure the first trickle of Truth from card plays.',
      },
      escalation: {
        label: 'Nebula Drip',
        description: 'Daily zines fund the slow-burn disclosure budget.',
        requirement: 'Accumulate +13 Truth from card plays.',
      },
      finale: {
        label: 'Dossier Cascade',
        description: 'A flood of nebula files detonates across the presses.',
        requirement: 'Accumulate +25 Truth from card plays.',
      },
    }),
    computeProgress: gameState => sumPositiveTruthDelta(gameState),
    flavorText: 'Press releases are printed on meteorite confetti.'
  }),

  defineAgenda({
    id: 'truth_signal_flare_network',
    faction: 'truth',
    category: 'influence',
    title: 'Signal Flare Syndicate',
    headline: 'PIRATE BROADCASTS STITCH TOGETHER NIGHT SKY!',
    operationName: 'Operation Aurora Relay',
    issueTheme: 'Underground Frequencies',
    pullQuote: '“Pair every tower with a backup disco ball antenna.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Illuminated radio beacon graphic',
    },
    description:
      'Complete four synchronized MEDIA and ZONE pairings to light the clandestine signal chain across sympathetic rooftops.',
    target: 4,
    difficulty: 'hard',
    stages: createAgendaStages('truth_signal_flare_network', 4, {
      briefing: {
        label: 'Beacon Calibration',
        description: 'Engineers strap mirrored dishes to abandoned rooftops.',
        requirement: 'Assemble the first MEDIA and ZONE crew pair.',
      },
      escalation: {
        label: 'Skyline Synchrony',
        description: 'Flare teams alternate broadcasts and field deployments.',
        requirement: 'Complete 2 MEDIA and ZONE pairings.',
      },
      finale: {
        label: 'Constellation Live',
        description: 'The full relay paints the sky with encoded headlines.',
        requirement: 'Complete 4 MEDIA and ZONE pairings.',
      },
    }),
    computeProgress: gameState => {
      const media = countCardTypePlays(gameState, 'MEDIA');
      const zone = countCardTypePlays(gameState, 'ZONE');
      return Math.min(media, zone);
    },
    flavorText: 'Every synchronized flare doubles as a signal booster for Bat Boy’s fan club hotline.'
  }),

  defineAgenda({
    id: 'truth_dimensional_townhall',
    faction: 'truth',
    category: 'strategic',
    title: 'Dimensional Town Hall',
    headline: 'MULTIVERSE VOTERS DEMAND PRIME-TIME TRANSPARENCY!',
    operationName: 'Operation Portal Podium',
    issueTheme: 'Portal Outreach',
    pullQuote: '“If the mic hums in three keys, the other timelines tuned in.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Rift-lined debate stage graphic',
    },
    description:
      'Accrue 60 total positive Truth momentum to keep the multiversal town hall open for whistleblowers from parallel timelines.',
    target: 60,
    difficulty: 'legendary',
    stages: createAgendaStages('truth_dimensional_townhall', 60, {
      briefing: {
        label: 'Portal Soundcheck',
        description: 'Stagehands sync podiums across mirrored chambers.',
        requirement: 'Build the first surge of positive Truth momentum.',
      },
      escalation: {
        label: 'Cross-Reality Roll Call',
        description: 'Audience members from sister timelines take their seats.',
        requirement: 'Accrue 30 positive Truth momentum.',
      },
      finale: {
        label: 'Town Hall Broadcast',
        description: 'Multiversal delegates beam testimonies into every feed.',
        requirement: 'Accrue 60 positive Truth momentum.',
      },
    }),
    computeProgress: gameState => sumPositiveTruthDelta(gameState),
    flavorText: 'Refreshments include chronologically ambiguous coffee and infinite doughnuts.'
  }),

  defineAgenda({
    id: 'truth_mermaid_coastline_confessional',
    faction: 'truth',
    category: 'strategic',
    title: 'Mermaid Coastline Confessional',
    headline: 'MERMAID DELEGATES TURN PIER INTO PRESS ROOM!',
    operationName: 'Operation Tidal Tell-All',
    issueTheme: 'Seaside Revelations',
    pullQuote: '“Never schedule a press junket at low tide.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Foamy pier tabloid glyph',
    },
    description:
      'Capture three Atlantic piers (NC, SC, GA, FL, or VA) to host a saltwater whistleblower summit before the Coast Guard confiscates the conch microphones.',
    target: 3,
    difficulty: 'hard',
    stages: createAgendaStages('truth_mermaid_coastline_confessional', 3, {
      briefing: {
        label: 'Pier Recon',
        description: 'Divers chart which boardwalks can hide the conch podium.',
        requirement: 'Scope out the Atlantic piers for the summit.',
      },
      escalation: {
        label: 'Saltwater Broadcast',
        description: 'Merfolk spokespeople rehearse synchronized splash cues.',
        requirement: 'Capture 2 Atlantic piers.',
      },
      finale: {
        label: 'Conch Press Conference',
        description: 'Reporters tread water while leaks pour out of every tidepool.',
        requirement: 'Capture 3 Atlantic piers.',
      },
    }),
    computeProgress: gameState =>
      countCapturedMatches(gameState, new Set(['NC', 'SC', 'GA', 'FL', 'VA'])),
    flavorText: 'Media badges double as waterproof kelp lanyards.'
  }),

  defineAgenda({
    id: 'truth_crop_circle_telethon',
    faction: 'truth',
    category: 'resource',
    title: 'Crop Circle Telethon',
    headline: 'CORNFIELD SWITCHBOARD DIALS THE COSMOS!',
    operationName: 'Operation Combine Choir',
    issueTheme: 'Agri Disclosure',
    pullQuote: '“Operators are standing by in sequined bib overalls.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Irradiated crop circle motif',
    },
    description:
      'Complete four ZONE operations across prairie states (IA, KS, NE, ND, or SD) to beam donation pleas to every abductee support group.',
    target: 4,
    difficulty: 'hard',
    stages: createAgendaStages('truth_crop_circle_telethon', 4, {
      briefing: {
        label: 'Switchboard Setup',
        description: 'Hay bales hide satellite dishes between the rows.',
        requirement: 'Aim the telethon relays toward the prairie grid.',
      },
      escalation: {
        label: 'Combine Choir',
        description: 'Harvester crews stomp crop circles in perfect rhythm.',
        requirement: 'Complete 2 prairie ZONE operations.',
      },
      finale: {
        label: 'Midnight Pledge Drive',
        description: 'Every abductee hotline lights up across the heartland.',
        requirement: 'Complete 4 ZONE operations in IA, KS, NE, ND, or SD.',
      },
    }),
    computeProgress: gameState =>
      countZonePlaysOnStates(gameState, new Set(['IA', 'KS', 'NE', 'ND', 'SD'])),
    flavorText: 'Donation perks include glow-in-the-dark crop circle blueprints.'
  }),

  // GOVERNMENT FACTION AGENDAS
  defineAgenda({
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
    stages: createAgendaStages('gov_capitol_stew', 3, {
      briefing: {
        label: 'Briefing Freeze',
        description: 'Crisis desks rehearse the official silence protocol.',
        requirement: 'Audit cloakdown scripts for beltway spokespeople.',
      },
      escalation: {
        label: 'Perimeter Lock',
        description: 'Security cordons tighten around the briefing circuit.',
        requirement: 'Control 2 beltway command hubs.',
      },
      finale: {
        label: 'Cloakdown Enforced',
        description: 'Emergency briefings drown out every Bat Boy rumor.',
        requirement: 'Control 3 beltway command hubs.',
      },
    }),
    computeProgress: gameState => countControlledMatches(gameState, ['DC', 'VA', 'MD', 'CO']),
    flavorText: 'All statements vetted by the Department of Implausible Denial.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('gov_field_ration_redactions', 6, {
      briefing: {
        label: 'Directive Drafting',
        description: 'Spin doctors rewrite every field memo from scratch.',
        requirement: 'Issue sanitized talking points to the network.',
      },
      escalation: {
        label: 'Broadcast Cadence',
        description: 'Mindwipe briefings cascade through the field offices.',
        requirement: 'Broadcast 3 MEDIA briefings.',
      },
      finale: {
        label: 'Total Recall Void',
        description: 'Agents remember nothing but the approved Elvis cover story.',
        requirement: 'Broadcast 6 MEDIA briefings.',
      },
    }),
    computeProgress: gameState => countCardTypePlays(gameState, 'MEDIA'),
    flavorText: 'Side effects include humming suspiciously like Jailhouse Rock.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('gov_supply_chain_soup', 4, {
      briefing: {
        label: 'Checkpoint Paperwork',
        description: 'Plainclothes teams draft cover stories at faux markets.',
        requirement: 'Assign interception crews across the corridor map.',
      },
      escalation: {
        label: 'Perimeter Test',
        description: 'Temporary fences funnel cryptid traffic into scanners.',
        requirement: 'Control 2 heartland corridors.',
      },
      finale: {
        label: 'Containment Grid',
        description: 'The entire migration is bottled up before tabloids arrive.',
        requirement: 'Control 4 heartland corridors.',
      },
    }),
    computeProgress: gameState => countControlledMatches(gameState, ['IA', 'NE', 'KS', 'MO', 'OK', 'AR']),
    flavorText: 'Every checkpoint issues complimentary anti-Yeti booties.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('gov_ufo_recall_paperwork', 3, {
      briefing: {
        label: 'Recall Notices',
        description: 'Clerks prep triplicate forms and telepathy-proof seals.',
        requirement: 'Coordinate repossession teams for every crash site.',
      },
      escalation: {
        label: 'Collection Sweep',
        description: 'Agents descend on desert hangars with recall warrants.',
        requirement: 'Repossess 2 desert crash sites.',
      },
      finale: {
        label: 'Warehouse Sealed',
        description: 'Every saucer asset is logged back into federal storage.',
        requirement: 'Repossess 3 desert crash sites.',
      },
    }),
    computeProgress: gameState =>
      countCapturedMatches(gameState, new Set(['NV', 'NM', 'AZ', 'UT'])),
    flavorText: 'Failure triggers a mandatory Men-in-Khaki conga line.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('gov_coverup_casserole', 3, {
      briefing: {
        label: 'Playbill Draft',
        description: 'Stage managers script the distraction musical slate.',
        requirement: 'Prime the theater crew to smother any Truth spike.',
      },
      escalation: {
        label: 'Spotlight Drop',
        description: 'Fog machines and denials roll in on schedule.',
        requirement: 'Keep Truth below 20% for 1 consecutive turn.',
        threshold: 1,
      },
      finale: {
        label: 'Encore Denial',
        description: 'Every channel loops the spectacle, Truth muted entirely.',
        requirement: 'Keep Truth below 20% for 3 consecutive turns.',
      },
    }),
    computeProgress: gameState => resolveStreak(gameState, 'truthBelow20Streak'),
    flavorText: 'Encore features nine dancers dressed as non-existent aliens.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('gov_spice_rack_surveillance', 4, {
      briefing: {
        label: 'Orbital Alignment',
        description: 'Sat teams calibrate the mind net over coastal anchors.',
        requirement: 'Prep surveillance relays in NY, CA, TX, and FL.',
      },
      escalation: {
        label: 'Triangulation Sweep',
        description: 'Clone sightings collapse into a tight telemetry cone.',
        requirement: 'Control 2 of NY, CA, TX, or FL.',
      },
      finale: {
        label: 'Nationwide Sweep',
        description: 'Every celebrity double is tracked before it livestreams.',
        requirement: 'Control NY, CA, TX, and FL.',
      },
    }),
    computeProgress: gameState => countControlledMatches(gameState, ['NY', 'CA', 'TX', 'FL']),
    flavorText: 'Headquarters monitors Bigfoot, Elvis, and the Loch Ness intern simultaneously.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('gov_black_budget_bbq', 220, {
      briefing: {
        label: 'Appropriations Huddle',
        description: 'Budgeteers shuffle funds behind blackout curtains.',
        requirement: 'Secure the first covert IP reserves.',
      },
      escalation: {
        label: 'Tour Retainer',
        description: 'Decoy band signs contracts under four layers of aliases.',
        requirement: 'Stockpile 110 IP.',
      },
      finale: {
        label: 'World Tour Paid',
        description: 'Every decoy jet and jumpsuit is fully funded.',
        requirement: 'Stockpile 220 IP.',
      },
    }),
    computeProgress: gameState => (typeof gameState?.ip === 'number' ? Math.max(0, gameState.ip) : 0),
    flavorText: 'The receipts are written in glow-in-the-dark redactions.'
  }),

  defineAgenda({
    id: 'gov_data_quarantine_protocol',
    faction: 'government',
    category: 'sabotage',
    title: 'Data Quarantine Protocol',
    headline: 'Directive 8-R: SCRUB THE LEAK TRAIL CLEAN',
    operationName: 'Operation Firewall Waltz',
    issueTheme: 'Information Containment',
    pullQuote: '“Rotate codenames every chorus of the hold music.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Restricted clearance badge',
    },
    description:
      'Execute five ATTACK operations to smother the rumor cascade before it splashes into prime time.',
    target: 5,
    difficulty: 'medium',
    stages: createAgendaStages('gov_data_quarantine_protocol', 5, {
      briefing: {
        label: 'Containment Drill',
        description: 'Rapid-response teams rehearse synchronized takedowns.',
        requirement: 'Launch the first ATTACK operation against the leak.',
      },
      escalation: {
        label: 'Firewall Sweep',
        description: 'Strike squads rotate through rumor hubs without resting.',
        requirement: 'Execute 3 ATTACK operations.',
      },
      finale: {
        label: 'Silence Secured',
        description: 'Every whisper trace is quarantined behind red tape.',
        requirement: 'Execute 5 ATTACK operations.',
      },
    }),
    computeProgress: gameState => countCardTypePlays(gameState, 'ATTACK'),
    flavorText: 'All incident reports must be sung in monotone to avoid triggering the rumor detector.'
  }),

  defineAgenda({
    id: 'gov_ghost_network_buyout',
    faction: 'government',
    category: 'resource',
    title: 'Ghost Network Buyout',
    headline: 'Appropriation Memo 5-V: PURCHASE THE PSYCHIC SWITCHBOARD',
    operationName: 'Operation Silent Dividend',
    issueTheme: 'Asset Neutralization',
    pullQuote: '“Offer hazard pay in unmarked karaoke tokens.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Classified escrow seal',
    },
    description:
      'Capture three coastal relay states (MA, MD, VA, or RI) to fold the rogue psychic switchboard into the federal balance sheet.',
    target: 3,
    difficulty: 'easy',
    stages: createAgendaStages('gov_ghost_network_buyout', 3, {
      briefing: {
        label: 'Escrow Briefing',
        description: 'Auditors memorize the spectral escrow incantations.',
        requirement: 'Identify which coastal relays are up for acquisition.',
      },
      escalation: {
        label: 'Bidding War',
        description: 'Handlers outmaneuver clairvoyant venture capitalists.',
        requirement: 'Capture 2 coastal relay states.',
      },
      finale: {
        label: 'Switchboard Seized',
        description: 'The psychic network folds quietly into federal custody.',
        requirement: 'Capture 3 coastal relay states.',
      },
    }),
    computeProgress: gameState =>
      countCapturedMatches(gameState, new Set(['MA', 'MD', 'VA', 'RI'])),
    flavorText: 'Accountants must balance ledgers while wearing ectoplasm-insulated gloves.'
  }),

  defineAgenda({
    id: 'gov_aurora_damper_patrol',
    faction: 'government',
    category: 'strategic',
    title: 'Aurora Damper Patrol',
    headline: 'Security Bulletin 12-A: SWITCH OFF THE SKY VEIL',
    operationName: 'Operation Polar Umbrella',
    issueTheme: 'Geomagnetic Suppression',
    pullQuote: '“Never let the aurora karaoke reach the chorus.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Arctic interception seal',
    },
    description:
      'Conduct four ZONE operations in aurora states (AK, ND, MN, MI, or ME) to jam the northern lights before they spell out classified telegrams.',
    target: 4,
    difficulty: 'hard',
    stages: createAgendaStages('gov_aurora_damper_patrol', 4, {
      briefing: {
        label: 'Sky Veil Survey',
        description: 'Weather balloons map which auroras leak classified Morse.',
        requirement: 'Chart the aurora states targeted for dampening.',
      },
      escalation: {
        label: 'Polar Umbrella',
        description: 'Mobile towers roll in to muffle the northern light show.',
        requirement: 'Complete 2 aurora ZONE operations.',
      },
      finale: {
        label: 'Lights Out',
        description: 'The sky glows beige and the telegram stays sealed.',
        requirement: 'Complete 4 ZONE operations in AK, ND, MN, MI, or ME.',
      },
    }),
    computeProgress: gameState =>
      countZonePlaysOnStates(gameState, new Set(['AK', 'ND', 'MN', 'MI', 'ME'])),
    flavorText: 'Field manuals warn against humming the X-Files theme near the dampers.'
  }),

  defineAgenda({
    id: 'gov_memory_hole_marathon',
    faction: 'government',
    category: 'sabotage',
    title: 'Memory Hole Marathon',
    headline: 'Directive 12-Z: 24-HOUR DENIAL TELETHON',
    operationName: 'Operation Oblivion Relay',
    issueTheme: 'Narrative Erasure',
    pullQuote: '“Hydrate between denials to prevent static cling on the cue cards.”',
    artCue: {
      icon: '/assets/dossier-stamp.svg',
      texture: '/assets/dossier-fibers.svg',
      alt: 'Shredded memo emblem',
    },
    description:
      'Accumulate 18 suppressed Truth through negative deltas so the denial marathon can drone over every leak hotline.',
    target: 18,
    difficulty: 'hard',
    stages: createAgendaStages('gov_memory_hole_marathon', 18, {
      briefing: {
        label: 'Telethon Warm-Up',
        description: 'Anchors rehearse denial scripts over hold music.',
        requirement: 'Drain the first drops of Truth with a negative delta.',
      },
      escalation: {
        label: 'Cue Card Carousel',
        description: 'Operators shuffle rebuttals through rotating phone banks.',
        requirement: 'Accumulate 9 suppressed Truth.',
      },
      finale: {
        label: 'Oblivion Broadcast',
        description: 'Viewers forget the leak exists before the credits roll.',
        requirement: 'Accumulate 18 suppressed Truth.',
      },
    }),
    computeProgress: gameState => sumSuppressedTruthDelta(gameState),
    flavorText: 'Tote board numbers glow whenever a memory hole successfully swallows a rumor.'
  }),

  // SHARED/NEUTRAL AGENDAS
  defineAgenda({
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
    stages: createAgendaStages('shared_paranoid_picnic', 4, {
      briefing: {
        label: 'Route Planning',
        description: 'Caravan scouts mark overpasses with spectral flares.',
        requirement: 'Plot the interstate stages for the convoy.',
      },
      escalation: {
        label: 'Convoy Rollout',
        description: 'Psychics and cryptids seize rest stops for broadcasts.',
        requirement: 'Control 2 roadside hotspots.',
      },
      finale: {
        label: 'Motorcade in Motion',
        description: 'The full caravan blankets the heartland with omens.',
        requirement: 'Control 4 roadside hotspots.',
      },
    }),
    computeProgress: gameState => countControlledMatches(gameState, ['WI', 'MN', 'NJ', 'LA', 'NM']),
    flavorText: 'Tinfoil streamers are mandatory for all convertibles.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('shared_midnight_press_run', 3, {
      briefing: {
        label: 'Pressroom Warm-Up',
        description: 'Spectral copy editors prime the haunted linotypes.',
        requirement: 'Pair the newsroom for its first attack-media cycle.',
      },
      escalation: {
        label: 'Double Truck',
        description: 'Alternating attacks and media lock into a rhythm.',
        requirement: 'Serve 1 attack + media pairing.',
        threshold: 1,
      },
      finale: {
        label: 'Midnight Run',
        description: 'Three perfect spreads keep the ghost staff fully manifest.',
        requirement: 'Serve 3 attack + media pairings.',
      },
    }),
    computeProgress: gameState => countMediaAndAttackPairs(gameState),
    flavorText: 'Ink smells faintly of ectoplasm and burnt coffee.'
  }),
  defineAgenda({
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
    stages: createAgendaStages('shared_combo_platter', 2, {
      briefing: {
        label: 'Timeline Briefing',
        description: 'Editors choreograph articles across mirrored realities.',
        requirement: 'Prepare overlapping state combination dossiers.',
      },
      escalation: {
        label: 'Split Reality',
        description: 'One combination hums while the alternate timeline stabilizes.',
        requirement: 'Maintain 1 state combination bonus.',
        threshold: 1,
      },
      finale: {
        label: 'Parallel Harmony',
        description: 'Two combos spin in sync without collapsing causality.',
        requirement: 'Maintain 2 state combination bonuses.',
      },
    }),
    computeProgress: gameState => ensureArray(gameState?.activeStateCombinationIds).length,
    flavorText: 'Side B of the paper swears none of this ever happened.'
  }),

  defineAgenda({
    id: 'shared_resonance_roundtable',
    faction: 'both',
    category: 'resource',
    title: 'Resonance Roundtable',
    headline: 'JOINT TASKFORCE TUNES INTO SECRET AIRWAVES!',
    operationName: 'Operation Harmonic Accord',
    issueTheme: 'Covert Broadcasts',
    pullQuote: '“Pass the conch microphone clockwise to keep the spirits calm.”',
    artCue: {
      icon: '/assets/tabloid-flash.svg',
      texture: '/assets/tabloid-halftone.svg',
      alt: 'Circular broadcast glyph',
    },
    description:
      'Maintain three simultaneous MEDIA and ATTACK pairings to keep the bipartisan séance roundtable in perfect resonance.',
    target: 3,
    difficulty: 'hard',
    stages: createAgendaStages('shared_resonance_roundtable', 3, {
      briefing: {
        label: 'Roundtable Roll Call',
        description: 'Delegates align crystals and calibrate the conch mic.',
        requirement: 'Coordinate the first MEDIA and ATTACK pairing.',
      },
      escalation: {
        label: 'Dual Harmony',
        description: 'Both factions alternate headlines and crackdowns in sync.',
        requirement: 'Maintain 2 MEDIA and ATTACK pairings.',
      },
      finale: {
        label: 'Full Resonance',
        description: 'Three perfect pairings keep the séance humming.',
        requirement: 'Maintain 3 MEDIA and ATTACK pairings.',
      },
    }),
    computeProgress: gameState => Math.min(
      countCardTypePlays(gameState, 'MEDIA'),
      countCardTypePlays(gameState, 'ATTACK'),
    ),
    flavorText: 'Snacks include bipartisan fudge and spectral seltzer.'
  })
];

export interface AgendaSelectionOptions {
  issueId?: string;
  excludeIds?: string[];
  difficulty?: SecretAgenda['difficulty'];
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
  const desiredDifficulty = options?.difficulty;
  const difficultyMatchedAgendas = desiredDifficulty
    ? factionAgendas.filter(agenda => agenda.difficulty === desiredDifficulty)
    : factionAgendas;
  const eligibleAgendas = difficultyMatchedAgendas.length > 0
    ? difficultyMatchedAgendas
    : factionAgendas;

  const weightedPool = eligibleAgendas.flatMap(agenda => {
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

  if (weightedPool.length === 0) {
    return factionAgendas[Math.floor(Math.random() * factionAgendas.length)];
  }

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
