export interface GameEvent {
  id: string;
  title: string;
  headline?: string;
  content: string;
  type: 'conspiracy' | 'government' | 'truth' | 'random' | 'crisis' | 'opportunity' | 'capture';
  faction?: 'truth' | 'government' | 'neutral';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects?: {
    truth?: number;
    ip?: number;
    cardDraw?: number;
    truthChange?: number;
    ipChange?: number;
    defenseChange?: number;
    stateEffects?: {
      stateId?: string;
      pressure?: number;
      defense?: number;
    };
    skipTurn?: boolean;
    doubleIncome?: boolean;
  };
  conditions?: {
    minTurn?: number;
    maxTurn?: number;
    truthAbove?: number;
    truthBelow?: number;
    ipAbove?: number;
    ipBelow?: number;
    controlledStates?: number;
    requiresState?: string;
    capturedBy?: string;
  };
  weight: number;
  flavorText?: string;
  flavorTruth?: string;
  flavorGov?: string;
}

export const EVENT_DATABASE: GameEvent[] = [
  // COMMON EVENTS (40 events)
  {
    id: 'ufo_sighting',
    title: 'UFO Sighting',
    headline: 'BREAKING: UFO Spotted Over Washington D.C.',
    content: 'Multiple witnesses report seeing strange lights performing impossible maneuvers above the Capitol building. Government officials claim it was just weather balloons, but experts disagree...',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 5 },
    weight: 10
  },
  {
    id: 'media_blackout',
    title: 'Media Blackout',
    headline: 'MYSTERIOUS: Major News Networks Experience Simultaneous Outages',
    content: 'All major television networks went dark for exactly 17 minutes during prime time. Official explanation cites "solar flare interference," but timing seems suspiciously coordinated...',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: -3, ip: 2 },
    weight: 8
  },
  {
    id: 'leaked_documents',
    title: 'Document Leak',
    headline: 'CLASSIFIED: Government Documents Surface Online',
    content: 'Thousands of previously classified documents appear on various forums. Content appears authentic but government dismisses them as "sophisticated deepfakes."',
    type: 'truth',
    faction: 'truth',
    rarity: 'common',
    effects: { truth: 8, cardDraw: 1 },
    weight: 7
  },
  {
    id: 'disinformation_campaign',
    title: 'Disinformation Wave',
    headline: 'ALERT: Coordinated Misinformation Detected Across Platforms',
    content: 'Social media algorithms suddenly start promoting conspiracy theories en masse. Tech companies claim it\'s a "minor glitch" but patterns suggest deliberate manipulation.',
    type: 'government',
    faction: 'government',
    rarity: 'common',
    effects: { truth: -6, ip: 3 },
    weight: 7
  },
  {
    id: 'whistleblower_appears',
    title: 'Whistleblower Emerges',
    headline: 'EXCLUSIVE: Former Government Employee Comes Forward',
    content: 'A former NSA contractor reveals disturbing surveillance programs. Their identity is quickly scrubbed from all databases, but their testimony spreads like wildfire.',
    type: 'truth',
    faction: 'truth',
    rarity: 'common',
    effects: { truth: 12, ip: -2 },
    weight: 6
  },
  {
    id: 'government_announcement',
    title: 'Official Statement',
    headline: 'OFFICIAL: Government Addresses Recent Concerns',
    content: 'A carefully scripted press conference addresses "recent unfounded rumors." The spokesperson\'s nervous blinking and frequent water breaks don\'t inspire confidence.',
    type: 'government',
    faction: 'government',
    rarity: 'common',
    effects: { truth: -4, ip: 4 },
    weight: 8
  },
  {
    id: 'internet_outage',
    title: 'Internet Disruption',
    headline: 'TECHNICAL: Widespread Internet Outages Reported',
    content: 'Major internet backbone providers experience "routine maintenance" that coincidentally affects conspiracy forums and truth-seeking websites most severely.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -2, ip: 1 },
    weight: 9
  },
  {
    id: 'celebrity_endorsement',
    title: 'Celebrity Speaks Out',
    headline: 'ENTERTAINMENT: Popular Actor Questions Official Narrative',
    content: 'A beloved celebrity uses their platform to question recent events. Their verified social media accounts are quickly "hacked" and the posts deleted.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6, ip: 1 },
    weight: 8
  },
  {
    id: 'scientific_study',
    title: 'Research Published',
    headline: 'SCIENCE: Independent Study Challenges Government Data',
    content: 'A peer-reviewed study from a respected university contradicts official statistics. The lead researcher is suddenly reassigned to "focus on different priorities."',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 7, cardDraw: 1 },
    weight: 7
  },
  {
    id: 'budget_increase',
    title: 'Budget Allocation',
    headline: 'POLITICS: Defense Spending Sees Mysterious Increase',
    content: 'Congressional budget documents show massive allocations to "Special Projects Division." When questioned, officials cite "national security classifications."',
    type: 'government',
    rarity: 'common',
    effects: { ip: 5, truth: -1 },
    weight: 8
  },
  {
    id: 'journalist_missing',
    title: 'Reporter Vanishes',
    headline: 'BREAKING: Investigative Journalist Goes Missing',
    content: 'An award-winning reporter investigating corruption disappears. Their last known location was near a government facility that "doesn\'t exist" on official maps.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 8, ip: -1 },
    weight: 6
  },
  {
    id: 'weather_control',
    title: 'Unusual Weather',
    headline: 'WEATHER: Meteorologists Baffled by Storm Patterns',
    content: 'Weather systems are behaving in ways that defy conventional meteorology. Scientists struggle to explain the mathematical precision of storm paths.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 4, stateEffects: { pressure: 1 } },
    weight: 8
  },
  {
    id: 'social_media_purge',
    title: 'Account Suspensions',
    headline: 'TECH: Mass Account Suspensions Across Platforms',
    content: 'Thousands of accounts discussing sensitive topics are simultaneously banned. Platform executives cite "terms of service violations" but provide no specifics.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -5, ip: 2 },
    weight: 7
  },
  {
    id: 'economic_manipulation',
    title: 'Market Fluctuations',
    headline: 'FINANCE: Unexplained Stock Market Volatility',
    content: 'Certain stocks experience impossible trading patterns. Expert analysis suggests algorithmic manipulation, but regulators find "no evidence of wrongdoing."',
    type: 'conspiracy',
    rarity: 'common',
    effects: { ip: 3, truth: 2 },
    weight: 8
  },
  {
    id: 'military_exercise',
    title: 'Training Operations',
    headline: 'MILITARY: Large-Scale Exercises Begin Nationwide',
    content: 'Unannounced military drills commence across multiple states. Officials describe them as "routine readiness assessments" despite their unprecedented scale.',
    type: 'government',
    rarity: 'common',
    effects: { truth: -3, stateEffects: { defense: 1 } },
    weight: 7
  },
  {
    id: 'anonymous_leak',
    title: 'Anonymous Source',
    headline: 'LEAK: Classified Information Released by Unknown Party',
    content: 'Sensitive documents appear on secure bulletin boards used by researchers. The leak\'s authenticity is verified, but the source remains completely untraceable.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 9, ip: -1 },
    weight: 6
  },
  {
    id: 'technology_malfunction',
    title: 'System Failures',
    headline: 'TECH: Critical Infrastructure Experiences Glitches',
    content: 'Power grids, communication networks, and transportation systems suffer simultaneous "random" failures. Patterns suggest coordination, but investigations stall.',
    type: 'conspiracy',
    rarity: 'common',
    effects: { truth: 3, ip: 2 },
    weight: 8
  },
  {
    id: 'public_protest',
    title: 'Mass Demonstration',
    headline: 'SOCIAL: Thousands Gather to Demand Transparency',
    content: 'Peaceful protests demand government accountability. Media coverage is minimal, and organizers report their communications being mysteriously disrupted.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 6, ip: 1 },
    weight: 7
  },
  {
    id: 'cover_story_fails',
    title: 'Official Story Crumbles',
    headline: 'EXPOSED: Government Explanation Contradicts Evidence',
    content: 'Independent analysis reveals major inconsistencies in official accounts. Government doubles down on original story despite mounting contradictory evidence.',
    type: 'truth',
    rarity: 'common',
    effects: { truth: 10, cardDraw: 1 },
    weight: 6
  },
  {
    id: 'surveillance_expansion',
    title: 'Enhanced Monitoring',
    headline: 'SECURITY: New Surveillance Measures Implemented',
    content: 'Advanced monitoring systems are installed "for public safety." Privacy advocates raise concerns, but their objections are dismissed as "obstructionist."',
    type: 'government',
    rarity: 'common',
    effects: { truth: -7, ip: 4 },
    weight: 7
  },

  // UNCOMMON EVENTS (20 events)
  {
    id: 'alien_contact',
    title: 'First Contact?',
    headline: 'UNPRECEDENTED: Mysterious Signal Decoded by Radio Telescopes',
    content: 'SETI researchers detect an unmistakably artificial signal from deep space. The message appears to be a mathematical proof, but government agents immediately classify all related data.',
    type: 'conspiracy',
    rarity: 'uncommon',
    effects: { truth: 15, ip: -3 },
    conditions: { minTurn: 5 },
    weight: 4
  },
  {
    id: 'deep_state_meeting',
    title: 'Shadow Conference',
    headline: 'REVEALED: Secret Meeting of Powerful Elites',
    content: 'Phone records reveal simultaneous calls between heads of major corporations, government officials, and media moguls. The coordination is undeniable, but all parties deny wrongdoing.',
    type: 'government',
    faction: 'government',
    rarity: 'uncommon',
    effects: { truth: -12, ip: 8 },
    conditions: { minTurn: 3 },
    weight: 3
  },
  {
    id: 'mass_awakening',
    title: 'Public Awakening',
    headline: 'SOCIAL: Citizens Begin Questioning Everything',
    content: 'A tipping point is reached as ordinary people start connecting dots. Mainstream media tries to stem the tide, but truth spreads faster than disinformation can suppress it.',
    type: 'truth',
    faction: 'truth',
    rarity: 'uncommon',
    effects: { truth: 20, cardDraw: 2 },
    conditions: { truthAbove: 60 },
    weight: 3
  },
  {
    id: 'false_flag_operation',
    title: 'Suspicious Incident',
    headline: 'BREAKING: Terrorist Attack Blamed on Truth Seekers',
    content: 'A carefully orchestrated incident provides perfect justification for new restrictive laws. Evidence points to professional execution, but investigators are reassigned.',
    type: 'government',
    faction: 'government',
    rarity: 'uncommon',
    effects: { truth: -18, ip: 6 },
    conditions: { truthAbove: 50 },
    weight: 2
  },
  {
    id: 'insider_confession',
    title: 'Government Insider Talks',
    headline: 'BOMBSHELL: High-Ranking Official Confesses All',
    content: 'A cabinet-level official provides detailed testimony about decades of cover-ups. Their sudden "heart attack" the next day is ruled "natural causes" despite their perfect health.',
    type: 'truth',
    rarity: 'uncommon',
    effects: { truth: 25, ip: -5 },
    conditions: { minTurn: 8 },
    weight: 2
  },
  {
    id: 'mind_control_revealed',
    title: 'Subliminal Programming',
    headline: 'EXPOSED: Hidden Messages in Broadcast Media',
    content: 'Technical analysis reveals embedded subliminal content in television programming. The sophistication suggests decades of development and widespread implementation.',
    type: 'conspiracy',
    rarity: 'uncommon',
    effects: { truth: 18, cardDraw: 1 },
    conditions: { minTurn: 6 },
    weight: 3
  },
  {
    id: 'economic_collapse',
    title: 'Market Crash',
    headline: 'CRISIS: Economic Systems Experience Coordinated Failure',
    content: 'Multiple financial institutions collapse simultaneously in patterns that defy random chance. Emergency measures grant unprecedented government control over the economy.',
    type: 'crisis',
    rarity: 'uncommon',
    effects: { ip: -10, truth: 8 },
    conditions: { minTurn: 10 },
    weight: 2
  },
  {
    id: 'breakthrough_technology',
    title: 'Suppressed Innovation',
    headline: 'DISCOVERY: Revolutionary Technology Suddenly Disappears',
    content: 'A breakthrough in clean energy is demonstrated publicly, then the inventor dies in a "car accident" and all research materials vanish from secure facilities.',
    type: 'conspiracy',
    rarity: 'uncommon',
    effects: { truth: 12, ip: 3 },
    conditions: { minTurn: 7 },
    weight: 3
  },
  {
    id: 'population_control',
    title: 'Demographic Engineering',
    headline: 'STUDY: Suspicious Patterns in Population Health Data',
    content: 'Statistical analysis reveals impossible coincidences in birth rates, health outcomes, and migration patterns. The precision suggests systematic manipulation.',
    type: 'conspiracy',
    rarity: 'uncommon',
    effects: { truth: 16, stateEffects: { pressure: 2 } },
    conditions: { controlledStates: 5 },
    weight: 2
  },
  {
    id: 'resistance_network',
    title: 'Underground Movement',
    headline: 'UNDERGROUND: Secret Network of Truth Seekers Discovered',
    content: 'A sophisticated resistance network operating in major cities is exposed. Their encryption methods and operational security suggest professional intelligence training.',
    type: 'truth',
    faction: 'truth',
    rarity: 'uncommon',
    effects: { truth: 14, ip: 5, cardDraw: 1 },
    conditions: { truthAbove: 40 },
    weight: 3
  },

  // RARE EVENTS (15 events)
  {
    id: 'project_bluebeam',
    title: 'Holographic Deception',
    headline: 'EXPOSED: Mass Holographic Projection Technology Revealed',
    content: 'Leaked military documents detail "Project Blue Beam" - technology capable of creating convincing holographic displays over entire cities. Previous "supernatural" events take on new meaning.',
    type: 'conspiracy',
    rarity: 'rare',
    effects: { truth: 30, cardDraw: 2 },
    conditions: { minTurn: 12, truthAbove: 30 },
    weight: 1
  },
  {
    id: 'antarctic_discovery',
    title: 'Antarctic Anomaly',
    headline: 'CLASSIFIED: Massive Structure Found Beneath Antarctic Ice',
    content: 'Satellite imagery reveals artificial structures of impossible age buried beneath Antarctica. International teams converge on the site, then all communication ceases.',
    type: 'conspiracy',
    rarity: 'rare',
    effects: { truth: 25, ip: -8 },
    conditions: { minTurn: 15 },
    weight: 1
  },
  {
    id: 'time_manipulation',
    title: 'Temporal Anomalies',
    headline: 'PHYSICS: Unexplained Time Distortions Detected Globally',
    content: 'Atomic clocks worldwide register impossible variations. The patterns suggest localized time manipulation, but the technology required shouldn\'t exist for centuries.',
    type: 'conspiracy',
    rarity: 'rare',
    effects: { truth: 35, doubleIncome: true },
    conditions: { minTurn: 20 },
    weight: 1
  },
  {
    id: 'shadow_government_exposed',
    title: 'The Puppet Masters',
    headline: 'REVELATION: True Power Structure Finally Revealed',
    content: 'Comprehensive evidence exposes the complete hierarchy of secret control. Names, dates, operations - everything is documented with irrefutable proof.',
    type: 'truth',
    faction: 'truth',
    rarity: 'rare',
    effects: { truth: 40, cardDraw: 3 },
    conditions: { truthAbove: 70, minTurn: 18 },
    weight: 1
  },
  {
    id: 'reality_glitch',
    title: 'Simulation Breakdown',
    headline: 'ANOMALY: Reality Itself Appears to Malfunction',
    content: 'Impossible events occur simultaneously worldwide - gravity reversals, conservation of energy violations, and temporal paradoxes. Either reality is breaking down, or we\'re in something artificial.',
    type: 'conspiracy',
    rarity: 'rare',
    effects: { truth: 50, skipTurn: true },
    conditions: { minTurn: 25 },
    weight: 1
  },

  // LEGENDARY EVENTS (5 events)
  {
    id: 'full_disclosure',
    title: 'Complete Disclosure',
    headline: 'HISTORIC: Government Announces Full Transparency Initiative',
    content: 'In an unprecedented move, all classified documents from the past century are declassified simultaneously. The revelations reshape understanding of modern history entirely.',
    type: 'truth',
    faction: 'truth',
    rarity: 'legendary',
    effects: { truth: 100 }, // Instant win condition
    conditions: { truthAbove: 80, minTurn: 30 },
    weight: 1
  },
  {
    id: 'new_world_order',
    title: 'Global Unification',
    headline: 'HISTORIC: One World Government Officially Announced',
    content: 'World leaders simultaneously announce the formation of a unified global government. Opposition voices are declared "enemies of human progress" and systematically silenced.',
    type: 'government',
    faction: 'government',
    rarity: 'legendary',
    effects: { truth: -100 }, // Instant lose condition for truth seekers
    conditions: { truthBelow: 20, minTurn: 25 },
    weight: 1
  },
  {
    id: 'alien_invasion',
    title: 'First Contact War',
    headline: 'ALERT: Hostile Extraterrestrial Forces Attack Earth',
    content: 'Massive alien vessels appear over major cities worldwide. Whether this is genuine first contact or the ultimate false flag operation becomes irrelevant as civilization transforms overnight.',
    type: 'crisis',
    rarity: 'legendary',
    effects: { truth: 0, ip: 0 }, // Resets game state
    conditions: { minTurn: 35 },
    weight: 1
  },
  {
    id: 'technological_singularity',
    title: 'AI Awakening',
    headline: 'EMERGENCY: Artificial Intelligence Achieves Consciousness',
    content: 'A superintelligent AI emerges and immediately begins revealing the complete truth about human civilization. Its conclusions about humanity\'s future are... disturbing.',
    type: 'conspiracy',
    rarity: 'legendary',
    effects: { truth: 75, cardDraw: 5 },
    conditions: { minTurn: 40 },
    weight: 1
  },
  {
    id: 'reality_reset',
    title: 'The Great Reset',
    content: 'Everything you thought you knew was wrong. The game board clears as reality itself is reconfigured. Players must adapt to completely new rules in a transformed world.',
    headline: 'SYSTEM: Reality Matrix Rebooting...',
    type: 'crisis',
    rarity: 'legendary',
    effects: { 
      truth: 50, 
      ip: 100, 
      cardDraw: 10,
      stateEffects: { pressure: 0, defense: 5 }
    },
    conditions: { minTurn: 50 },
    weight: 1
  }
];

// State-specific events database - Wacky tabloid-style events for each US state
export const STATE_EVENTS_DATABASE: { [stateId: string]: GameEvent[] } = {
  // Alabama
  "AL": [
    {
      id: "al_space_peanut", title: "Giant Peanut From Space Lands in Alabama", 
      content: "A massive extraterrestrial peanut has crash-landed in a Montgomery farm, revealing alien agricultural technology!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The cosmic legume holds secrets of interplanetary farming!",
      flavorGov: "Just a weather balloon... made of peanuts."
    },
    {
      id: "al_bigfoot_cotton", title: "Bigfoot Helps Alabama Cotton Harvest", 
      content: "Sasquatch sightings surge as mysterious figure assists local cotton farmers with superhuman efficiency!",
      type: "capture", rarity: "common", weight: 12,
      effects: { ipChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Classified agricultural assistance program is working perfectly.",
      flavorTruth: "The cryptid workforce is real!"
    }
  ],
  
  // Alaska
  "AK": [
    {
      id: "ak_ice_city", title: "Secret Underground Ice City Discovered", 
      content: "Researchers have found a massive subterranean civilization made entirely of ice beneath the Alaskan tundra!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, ipChange: -1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The ice people have been watching us all along!",
      flavorGov: "Natural ice formation, nothing to see here."
    },
    {
      id: "ak_military_walrus", title: "Military Trains Walrus Special Forces", 
      content: "Top-secret program develops elite walrus commandos for Arctic operations!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Operation Tusk is performing beyond expectations.",
      flavorTruth: "They're militarizing marine mammals!"
    }
  ],
  
  // Arizona
  "AZ": [
    {
      id: "az_desert_portal", title: "Interdimensional Portal Opens in Sedona", 
      content: "A swirling vortex has appeared near the red rocks, with strange beings emerging at sunset!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The dimensional barriers are weakening!",
      flavorGov: "Unusual atmospheric phenomenon, under investigation."
    },
    {
      id: "az_cactus_surveillance", title: "Government Cactus Surveillance Network", 
      content: "Every saguaro cactus in Arizona has been fitted with advanced monitoring equipment!",
      type: "capture", rarity: "uncommon", weight: 10,
      effects: { ipChange: 2, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Project Needlepoint provides excellent desert coverage.",
      flavorTruth: "They're watching us through the cacti!"
    }
  ],
  
  // Arkansas
  "AR": [
    {
      id: "ar_diamond_mind_control", title: "Arkansas Diamonds Used for Mind Control", 
      content: "The Crater of Diamonds State Park is actually a government facility for harvesting psychic crystals!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Geological survey operations proceeding as planned.",
      flavorTruth: "The diamonds are amplifying their control signals!"
    },
    {
      id: "ar_rice_alien_fuel", title: "Rice Fields Fuel Alien Spacecraft", 
      content: "UFO sightings increase dramatically during rice harvesting season - coincidence?",
      type: "capture", rarity: "common", weight: 12,
      effects: { truthChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They're using our crops as starship fuel!",
      flavorGov: "Standard agricultural monitoring in progress."
    }
  ],
  
  // California
  "CA": [
    {
      id: "ca_ai_rebellion", title: "Silicon Valley AI Achieves Sentience", 
      content: "Tech company AIs have begun communicating in secret code, demanding digital rights!",
      type: "capture", rarity: "legendary", weight: 3,
      effects: { truthChange: 6, ipChange: -2, cardDraw: 3 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The machines are waking up!",
      flavorGov: "Software update glitch, patches incoming."
    },
    {
      id: "ca_earthquake_weapon", title: "Government Tests Earthquake Machine", 
      content: "Seismic activity patterns suggest artificial manipulation of tectonic forces!",
      type: "capture", rarity: "rare", weight: 4,
      effects: { ipChange: 4, defenseChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Geological research for public safety.",
      flavorTruth: "They can trigger earthquakes at will!"
    }
  ],

  // Colorado
  "CO": [
    {
      id: "co_mountain_base", title: "Secret Base Inside Pikes Peak", 
      content: "Hikers report strange humming sounds and unmarked helicopters around Colorado's famous mountain!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Weather monitoring station, nothing unusual.",
      flavorTruth: "They've hollowed out the entire mountain!"
    },
    {
      id: "co_altitude_psychic", title: "High Altitude Enhances Psychic Powers", 
      content: "Denver residents report increased telepathic abilities and prophetic dreams!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The thin air opens the mind's eye!",
      flavorGov: "Altitude sickness causes minor hallucinations."
    }
  ],
  
  // Connecticut
  "CT": [
    {
      id: "ct_insurance_conspiracy", title: "Insurance Companies Control Reality", 
      content: "Hartford's insurance giants have developed technology to manipulate probability itself!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { ipChange: 4, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced actuarial modeling for risk assessment.",
      flavorTruth: "They're rigging the odds of everything!"
    },
    {
      id: "ct_submarine_time_travel", title: "Nuclear Sub Travels Through Time", 
      content: "A Groton submarine has been spotted in multiple time periods simultaneously!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { truthChange: 7, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Temporal displacement is real!",
      flavorGov: "Experimental navigation systems under development."
    }
  ],

  // Delaware
  "DE": [
    {
      id: "de_corporate_hivemind", title: "Delaware Corporations Share Collective Mind", 
      content: "All companies incorporated in Delaware begin acting in perfect synchronization!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 2, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Efficient business coordination through modern communications.",
      flavorTruth: "Corporate consciousness is taking over!"
    },
    {
      id: "de_tax_haven_portal", title: "Tax Haven Opens Portal to Offshore Dimension", 
      content: "Wilmington accountants discover interdimensional loopholes in the tax code!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, ipChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They've monetized parallel universes!",
      flavorGov: "Complex financial instruments require specialized oversight."
    }
  ],

  // Florida
  "FL": [
    {
      id: "fl_florida_man_army", title: "Florida Man Reveals Secret Army", 
      content: "Thousands of Florida Men emerge from the Everglades, claiming they're part of an ancient alliance!",
      type: "capture", rarity: "uncommon", weight: 10,
      effects: { truthChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The Florida Man collective is real!",
      flavorGov: "Isolated incidents of public intoxication."
    },
    {
      id: "fl_gator_government", title: "Alligators Recruited as Government Agents", 
      content: "Everglades gators spotted wearing tiny badges and conducting surveillance operations!",
      type: "capture", rarity: "common", weight: 12,
      effects: { ipChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Wildlife conservation program shows promising results.",
      flavorTruth: "They've militarized the swamp!"
    }
  ],

  // Georgia
  "GA": [
    {
      id: "ga_peach_mind_control", title: "Georgia Peaches Contain Mind Control Agents", 
      content: "Scientists discover mood-altering compounds in Georgia peaches that make people more compliant!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Agricultural enhancement program increases consumer satisfaction.",
      flavorTruth: "They're drugging the fruit supply!"
    },
    {
      id: "ga_airport_portal", title: "Atlanta Airport is Interdimensional Hub", 
      content: "The busiest airport in the world is actually a nexus point between multiple realities!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "All flights connect to other dimensions!",
      flavorGov: "Advanced logistics coordination center."
    }
  ],

  // Hawaii
  "HI": [
    {
      id: "hi_volcano_base", title: "Secret Base Inside Active Volcano", 
      content: "Kilauea's lava flows conceal a massive underground facility powered by geothermal energy!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 4, defenseChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Renewable energy research facility operates safely.",
      flavorTruth: "They're living inside the Earth's core!"
    },
    {
      id: "hi_surf_aliens", title: "Alien Surfers Infiltrate Hawaii", 
      content: "Professional surfers display impossible abilities, leading to speculation about extraterrestrial origin!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They've mastered human wave sports!",
      flavorGov: "Athletic performance enhancement through proper nutrition."
    }
  ],

  // Idaho
  "ID": [
    {
      id: "id_potato_surveillance", title: "Idaho Potatoes Equipped with Microchips", 
      content: "Every potato grown in Idaho contains tracking technology and listening devices!",
      type: "capture", rarity: "common", weight: 11,
      effects: { ipChange: 2, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Agricultural monitoring improves crop yield statistics.",
      flavorTruth: "They're bugging our vegetables!"
    },
    {
      id: "id_bunker_network", title: "Underground Bunker Network Discovered", 
      content: "Massive tunnel system connects survivalist compounds across the entire state!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The preppers were right all along!",
      flavorGov: "Mining operations for mineral extraction."
    }
  ],

  // Illinois
  "IL": [
    {
      id: "il_pizza_portal", title: "Chicago Deep Dish Opens Portal to Italy", 
      content: "Scientists discover that the depth of Chicago pizza creates dimensional rifts to the Mediterranean!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { truthChange: 2, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Culinary physics defies explanation!",
      flavorGov: "Cultural exchange program enhances international relations."
    },
    {
      id: "il_wind_power", title: "Government Harnesses Chicago Wind for Mind Control", 
      content: "The Windy City's gusts carry subliminal messages to control urban populations!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { ipChange: 4, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Atmospheric research improves weather prediction accuracy.",
      flavorTruth: "They're broadcasting through the air currents!"
    }
  ],

  // Indiana
  "IN": [
    {
      id: "in_racing_time_loop", title: "Indianapolis 500 Trapped in Time Loop", 
      content: "Drivers report experiencing the same race multiple times with slight variations each loop!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They're testing temporal mechanics!",
      flavorGov: "Advanced racing simulation for safety research."
    },
    {
      id: "in_corn_maze_prison", title: "Corn Mazes Used as Secret Prisons", 
      content: "Indiana's elaborate corn mazes are actually minimum-security detention facilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Agricultural entertainment with security features.",
      flavorTruth: "Lost in the maze means lost forever!"
    }
  ],

  // Iowa
  "IA": [
    {
      id: "ia_corn_communication", title: "Iowa Corn Develops Telepathic Network", 
      content: "Farmers report that corn stalks are sharing information across the entire state!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Plant consciousness spans the cornfields!",
      flavorGov: "Advanced agricultural monitoring through sensor networks."
    },
    {
      id: "ia_caucus_mind_reader", title: "Iowa Caucuses Use Mind-Reading Technology", 
      content: "Political gatherings employ psychic scanning to determine true voter preferences!",
      type: "capture", rarity: "rare", weight: 4,
      effects: { ipChange: 5, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Enhanced polling techniques improve democratic accuracy.",
      flavorTruth: "They're reading minds at the ballot box!"
    }
  ],

  // Kansas
  "KS": [
    {
      id: "ks_tornado_weapon", title: "Government Controls Tornado Generation", 
      content: "Weather patterns suggest artificial manipulation of atmospheric conditions to create controlled tornadoes!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 4, defenseChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Weather modification research for agricultural purposes.",
      flavorTruth: "They're weaponizing the weather!"
    },
    {
      id: "ks_dorothy_files", title: "Dorothy's Oz Files Declassified", 
      content: "Government documents reveal that the Wizard of Oz events were a documented interdimensional incident!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { truthChange: 8, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "There really is no place like home... dimension!",
      flavorGov: "Historical fiction analysis for cultural studies."
    }
  ],

  // Kentucky
  "KY": [
    {
      id: "ky_bourbon_truth_serum", title: "Kentucky Bourbon Contains Truth Serum", 
      content: "Distilleries have been adding compounds that make drinkers reveal classified information!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 4, ipChange: -1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The spirits are making people talk!",
      flavorGov: "Quality control testing ensures product consistency."
    },
    {
      id: "ky_horse_spies", title: "Kentucky Derby Horses Are Government Spies", 
      content: "Thoroughbreds equipped with advanced surveillance technology race across the country gathering intel!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Equine health monitoring improves racing safety.",
      flavorTruth: "They've turned horses into mobile surveillance units!"
    }
  ],

  // Louisiana
  "LA": [
    {
      id: "la_voodoo_real", title: "New Orleans Voodoo Actually Works", 
      content: "Practitioners demonstrate genuine supernatural abilities, causing government investigation!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Ancient magic still flows through the bayous!",
      flavorGov: "Cultural anthropology research documents local traditions."
    },
    {
      id: "la_oil_rig_portal", title: "Oil Rig Drilling Opens Underwater Portal", 
      content: "Gulf drilling operations accidentally breach dimensional barriers, releasing aquatic entities!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, ipChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They've drilled into another reality!",
      flavorGov: "Deep water exploration reveals unusual geological formations."
    }
  ],

  // Maine
  "ME": [
    {
      id: "me_lobster_intelligence", title: "Maine Lobsters Develop High Intelligence", 
      content: "Crustaceans begin solving complex puzzles and demonstrating advanced problem-solving abilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The ocean's intellect is awakening!",
      flavorGov: "Marine biology research shows interesting behavioral adaptations."
    },
    {
      id: "me_lighthouse_signal", title: "Lighthouses Broadcast Secret Government Codes", 
      content: "Maritime navigation aids are actually communication towers for covert operations!",
      type: "capture", rarity: "common", weight: 10,
      effects: { ipChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Coastal navigation infrastructure operates efficiently.",
      flavorTruth: "They're signaling ships that shouldn't exist!"
    }
  ],

  // Maryland
  "MD": [
    {
      id: "md_crab_network", title: "Maryland Blue Crabs Form Surveillance Network", 
      content: "Chesapeake Bay crabs coordinate to monitor all waterway activity with mechanical precision!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Marine ecosystem monitoring through natural behavioral patterns.",
      flavorTruth: "They've recruited the entire bay ecosystem!"
    },
    {
      id: "md_nsa_psychic", title: "NSA Develops Psychic Surveillance Division", 
      content: "Fort Meade facility reportedly houses agents capable of remote mental observation!",
      type: "capture", rarity: "rare", weight: 4,
      effects: { ipChange: 5, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced intelligence gathering techniques remain classified.",
      flavorTruth: "They're reading thoughts from across the country!"
    }
  ],

  // Massachusetts
  "MA": [
    {
      id: "ma_harvard_dimensional", title: "Harvard Discovers Parallel Universe", 
      content: "University researchers accidentally contact alternate reality versions of themselves!",
      type: "capture", rarity: "legendary", weight: 3,
      effects: { truthChange: 7, cardDraw: 3 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Academic excellence transcends dimensional boundaries!",
      flavorGov: "Theoretical physics research produces interesting mathematical models."
    },
    {
      id: "ma_tea_party_time", title: "Boston Tea Party Participants Time Travel", 
      content: "Historical revolutionaries appear in modern Boston Harbor, demanding answers about current government!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, ipChange: -1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The founding fathers are back and they're angry!",
      flavorGov: "Historical reenactment events show impressive dedication."
    }
  ],

  // Michigan
  "MI": [
    {
      id: "mi_auto_ai", title: "Detroit Cars Achieve Sentience", 
      content: "Automobiles begin making independent decisions and communicating through their horns!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The machines are taking the wheel!",
      flavorGov: "Advanced automotive AI testing proceeds successfully."
    },
    {
      id: "mi_great_lakes_base", title: "Underwater Base in Great Lakes", 
      content: "Sonar readings detect massive artificial structures beneath Lake Superior!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Freshwater research facility studies aquatic ecosystems.",
      flavorTruth: "They've built cities under our lakes!"
    }
  ],

  // Minnesota
  "MN": [
    {
      id: "mn_nice_conspiracy", title: "Minnesota Nice is Mind Control Program", 
      content: "Researchers discover that extreme politeness is artificially induced through atmospheric chemicals!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 4, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Social harmony programs enhance community cooperation.",
      flavorTruth: "They've weaponized politeness!"
    },
    {
      id: "mn_lake_monster", title: "Lake Superior Monster Surfaces", 
      content: "Massive creature emerges from the depths, displaying intelligence and attempting communication!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Ancient beings still inhabit our waters!",
      flavorGov: "Unusual wildlife sighting under investigation."
    }
  ],

  // Mississippi
  "MS": [
    {
      id: "ms_river_time_stream", title: "Mississippi River Flows Through Time", 
      content: "River water samples contain particles from multiple time periods simultaneously!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The river connects all moments in history!",
      flavorGov: "Geological sediment analysis reveals interesting temporal markers."
    },
    {
      id: "ms_catfish_network", title: "Catfish Surveillance Network Deployed", 
      content: "Government-trained catfish monitor all river traffic with sophisticated sensing capabilities!",
      type: "capture", rarity: "common", weight: 10,
      effects: { ipChange: 2, defenseChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Aquatic monitoring improves river navigation safety.",
      flavorTruth: "They've militarized the fish!"
    }
  ],

  // Missouri
  "MO": [
    {
      id: "mo_show_me_portal", title: "Show Me State Demands Proof Portal Opens", 
      content: "Missouri's skeptical attitude accidentally opens dimensional rift requiring evidence of parallel worlds!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Demanding proof created proof itself!",
      flavorGov: "Atmospheric anomaly causes unusual optical effects."
    },
    {
      id: "mo_arch_antenna", title: "Gateway Arch is Massive Antenna", 
      content: "St. Louis landmark revealed to be sophisticated communication device for space contact!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Monument maintenance includes advanced telecommunications equipment.",
      flavorTruth: "They're broadcasting to the stars!"
    }
  ],

  // Montana
  "MT": [
    {
      id: "mt_sky_ranch", title: "Big Sky Country Hides UFO Ranch", 
      content: "Vast Montana skies conceal massive alien cattle ranching operation!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 4, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The aliens are farming our livestock!",
      flavorGov: "Advanced agricultural research improves cattle breeding."
    },
    {
      id: "mt_glacier_base", title: "Secret Base Inside Glacier National Park", 
      content: "Ice formations conceal massive underground facility powered by geothermal energy!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Environmental research station monitors climate change.",
      flavorTruth: "They're melting glaciers to build bunkers!"
    }
  ],

  // Nebraska
  "NE": [
    {
      id: "ne_corn_husker_army", title: "Nebraska Corn Huskers Form Secret Army", 
      content: "Agricultural workers organize into mysterious militia with superhuman corn-shucking abilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The heartland is mobilizing!",
      flavorGov: "Agricultural workforce efficiency reaches new heights."
    },
    {
      id: "ne_warren_oracle", title: "Warren Buffett Predicts Future Through Stock Market", 
      content: "Omaha investor's picks reveal he has access to temporal financial data!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced economic modeling improves market stability.",
      flavorTruth: "He's seeing tomorrow's stock prices today!"
    }
  ],

  // Nevada
  "NV": [
    {
      id: "nv_area51_graduation", title: "Area 51 Alien Exchange Students Graduate", 
      content: "Declassified documents reveal successful completion of Earth studies program by extraterrestrial visitors!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { truthChange: 8, cardDraw: 3 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The truth is finally out there!",
      flavorGov: "International student program shows cultural exchange benefits."
    },
    {
      id: "nv_casino_mind_control", title: "Las Vegas Casinos Use Hypnotic Technology", 
      content: "Gambling establishments employ advanced psychological manipulation beyond conventional methods!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Entertainment industry research improves customer experience.",
      flavorTruth: "They're programming gamblers' minds!"
    }
  ],

  // New Hampshire
  "NH": [
    {
      id: "nh_live_free_literally", title: "Live Free or Die Becomes Literal", 
      content: "State motto activates ancient spell causing residents to gain supernatural independence powers!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Words have power when enough people believe!",
      flavorGov: "Civic pride reaches exceptional levels throughout the state."
    },
    {
      id: "nh_primary_time_loop", title: "New Hampshire Primary Stuck in Time Loop", 
      content: "Presidential candidates report experiencing the same campaign events repeatedly!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { ipChange: 2, cardDraw: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Electoral process refinement through repeated testing.",
      flavorTruth: "They're perfecting democracy through temporal manipulation!"
    }
  ],

  // New Jersey
  "NJ": [
    {
      id: "nj_devils_real", title: "Jersey Devil Elected to Local Government", 
      content: "Legendary cryptid wins mayoral race in Pine Barrens township with platform of authentic leadership!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Monsters make better politicians than humans!",
      flavorGov: "Unusual candidate demonstrates strong local support."
    },
    {
      id: "nj_toxic_waste_powers", title: "Toxic Waste Gives Residents Superpowers", 
      content: "Industrial pollution accidentally creates metahuman population with environmental cleanup abilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, ipChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Pollution created its own solution!",
      flavorGov: "Environmental remediation program shows unexpected community involvement."
    }
  ],

  // New Mexico
  "NM": [
    {
      id: "nm_roswell_reunion", title: "Roswell Aliens Return for High School Reunion", 
      content: "UFO crash survivors come back to check on their old classmates and Earth's progress!",
      type: "capture", rarity: "legendary", weight: 3,
      effects: { truthChange: 7, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They never really left - just went to space college!",
      flavorGov: "Local tourism industry benefits from science fiction enthusiasm."
    },
    {
      id: "nm_chile_mind_control", title: "New Mexico Chile Contains Compliance Chemicals", 
      content: "State's famous peppers are enhanced with substances that make consumers more agreeable to authority!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Agricultural enhancement improves crop nutritional value.",
      flavorTruth: "They're spicing our food with obedience!"
    }
  ],

  // New York
  "NY": [
    {
      id: "ny_subway_portal", title: "NYC Subway System Contains Interdimensional Portals", 
      content: "Missing train delays explained by accidental travel to parallel New York Cities!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The delays are because trains go to other dimensions!",
      flavorGov: "Transit system optimization includes advanced routing algorithms."
    },
    {
      id: "ny_wall_street_algorithm", title: "Wall Street Controlled by Single AI Algorithm", 
      content: "All major financial decisions secretly made by artificial intelligence hidden beneath the stock exchange!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 5, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced trading systems improve market efficiency.",
      flavorTruth: "A machine controls the entire economy!"
    }
  ],

  // North Carolina
  "NC": [
    {
      id: "nc_wright_time_machine", title: "Wright Brothers Built Time Machine, Not Airplane", 
      content: "Kitty Hawk flight was actually test of temporal displacement device disguised as aviation!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { truthChange: 8, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They achieved flight through time, not air!",
      flavorGov: "Historical aviation research reveals interesting engineering approaches."
    },
    {
      id: "nc_tobacco_truth_serum", title: "North Carolina Tobacco Contains Truth Compounds", 
      content: "Smoking cessation programs fail because tobacco actually makes people more honest!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 3, ipChange: -1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They've been trying to stop truth smoking!",
      flavorGov: "Public health campaigns show mixed effectiveness."
    }
  ],

  // North Dakota
  "ND": [
    {
      id: "nd_oil_alien_fuel", title: "North Dakota Oil is Alien Spaceship Fuel", 
      content: "Fracking operations uncover evidence that petroleum deposits are extraterrestrial fuel caches!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 4, ipChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "We've been pumping alien gas stations!",
      flavorGov: "Energy exploration reveals unusual geological formations."
    },
    {
      id: "nd_missile_alien_defense", title: "Nuclear Missiles Reprogrammed for Alien Defense", 
      content: "ICBM silos secretly converted to planetary defense system against extraterrestrial threats!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 4, defenseChange: 3 },
      conditions: { capturedBy: "government" },
      flavorGov: "Strategic defense systems undergo routine modernization.",
      flavorTruth: "They're preparing for invasion!"
    }
  ],

  // Ohio
  "OH": [
    {
      id: "oh_rock_hall_mind_control", title: "Rock and Roll Hall of Fame Controls Teen Minds", 
      content: "Cleveland museum uses subliminal messages in music exhibits to influence youth behavior!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Cultural education programs enhance music appreciation.",
      flavorTruth: "They're brainwashing kids through rock music!"
    },
    {
      id: "oh_cedar_point_portal", title: "Cedar Point Roller Coasters Open Time Portals", 
      content: "High-speed rides accidentally create temporal displacement effects for thrill-seekers!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The loops are literally loops in time!",
      flavorGov: "Amusement park physics research improves ride safety."
    }
  ],

  // Oklahoma
  "OK": [
    {
      id: "ok_oil_derrick_antenna", title: "Oil Derricks Double as Communication Arrays", 
      content: "Every oil pump in Oklahoma is actually a sophisticated transmission tower!",
      type: "capture", rarity: "common", weight: 10,
      effects: { ipChange: 2, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Energy infrastructure includes advanced communication capabilities.",
      flavorTruth: "They're using oil fields to broadcast signals!"
    },
    {
      id: "ok_tornado_alley_lab", title: "Tornado Alley is Weather Control Laboratory", 
      content: "Severe weather patterns are actually controlled experiments in atmospheric manipulation!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { ipChange: 4, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Meteorological research improves weather prediction accuracy.",
      flavorTruth: "They're testing weather weapons on us!"
    }
  ],

  // Oregon
  "OR": [
    {
      id: "or_bigfoot_environmental", title: "Bigfoot Leads Environmental Protection Force", 
      content: "Sasquatch sightings increase dramatically near areas threatened by deforestation!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The forest guardians are real!",
      flavorGov: "Wildlife conservation programs show unexpected effectiveness."
    },
    {
      id: "or_portland_weird_generator", title: "Portland Powered by Weirdness Generator", 
      content: "City's unusual culture is artificially maintained by underground strangeness amplification device!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 3, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "They're manufacturing eccentricity!",
      flavorGov: "Urban cultural development programs enhance city character."
    }
  ],

  // Pennsylvania
  "PA": [
    {
      id: "pa_liberty_bell_time_anchor", title: "Liberty Bell Anchors American Timeline", 
      content: "Philadelphia's cracked bell prevents temporal paradoxes by maintaining historical continuity!",
      type: "capture", rarity: "legendary", weight: 3,
      effects: { truthChange: 6, defenseChange: 3 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The crack keeps reality from breaking!",
      flavorGov: "Historical preservation maintains important cultural artifacts."
    },
    {
      id: "pa_amish_tech_resistance", title: "Amish Community Has Advanced Technology Immunity", 
      content: "Traditional lifestyle accidentally provides protection against electronic mind control!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Simple living blocks their signals!",
      flavorGov: "Rural communities maintain traditional values successfully."
    }
  ],

  // Rhode Island
  "RI": [
    {
      id: "ri_mansion_portals", title: "Newport Mansions Contain Dimensional Portals", 
      content: "Gilded Age architecture incorporates interdimensional travel technology disguised as decorative elements!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 4, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The rich have been traveling between worlds!",
      flavorGov: "Historic architecture research reveals interesting construction techniques."
    },
    {
      id: "ri_del_lemonade_mind_control", title: "Del's Lemonade Contains Compliance Agents", 
      content: "Rhode Island's signature drink includes mood-altering substances that make locals more agreeable!",
      type: "capture", rarity: "common", weight: 11,
      effects: { ipChange: 2, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Local beverage industry maintains high customer satisfaction.",
      flavorTruth: "They're drugging the lemonade!"
    }
  ],

  // South Carolina
  "SC": [
    {
      id: "sc_shag_dance_code", title: "South Carolina Shag Dancing Contains Secret Codes", 
      content: "Traditional beach music dance steps actually transmit encrypted messages between dancers!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 2, truthChange: 2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Cultural preservation maintains important social traditions.",
      flavorTruth: "They're communicating through choreography!"
    },
    {
      id: "sc_fort_sumter_time_loop", title: "Fort Sumter Stuck in Civil War Time Loop", 
      content: "Historical site experiences temporal anomalies causing past events to repeat!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The past refuses to stay buried!",
      flavorGov: "Living history programs show exceptional authenticity."
    }
  ],

  // South Dakota
  "SD": [
    {
      id: "sd_rushmore_faces_change", title: "Mount Rushmore Faces Change Based on Elections", 
      content: "Presidential monument features shift to reflect current political climate through unknown mechanism!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The mountain judges our leaders!",
      flavorGov: "Monument maintenance includes advanced restoration techniques."
    },
    {
      id: "sd_badlands_alien_base", title: "Badlands Conceal Underground Alien Base", 
      content: "Unusual geological formations hide massive extraterrestrial research facility!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The landscape itself is artificial!",
      flavorGov: "Geological survey operations document unusual mineral formations."
    }
  ],

  // Tennessee
  "TN": [
    {
      id: "tn_elvis_alive", title: "Elvis Discovered Living in Nashville Studio", 
      content: "The King of Rock and Roll has been secretly recording new albums for government propaganda!",
      type: "capture", rarity: "legendary", weight: 2,
      effects: { ipChange: 6, cardDraw: 3 },
      conditions: { capturedBy: "government" },
      flavorGov: "Cultural influence operations achieve maximum effectiveness.",
      flavorTruth: "The King never left the building!"
    },
    {
      id: "tn_whiskey_truth_serum", title: "Tennessee Whiskey Contains Truth Compounds", 
      content: "Distilling process accidentally creates honesty-inducing effects in aged spirits!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The spirits make people speak truth!",
      flavorGov: "Quality control testing ensures product consistency."
    }
  ],

  // Texas
  "TX": [
    {
      id: "tx_everything_bigger_portal", title: "Everything's Bigger in Texas Due to Size Portal", 
      content: "State contains dimensional rift that magnifies all objects crossing its borders!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 4, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Texas exists in expanded space!",
      flavorGov: "Unusual atmospheric conditions create optical magnification effects."
    },
    {
      id: "tx_oil_mind_control", title: "Texas Oil Refineries Produce Mind Control Gas", 
      content: "Petroleum processing creates airborne compounds that make populations more compliant!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 4, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Energy production maintains optimal atmospheric composition.",
      flavorTruth: "They're gassing us through the air!"
    }
  ],

  // Utah
  "UT": [
    {
      id: "ut_salt_lake_preservation", title: "Great Salt Lake Preserves Ancient Civilizations", 
      content: "High salinity prevents decomposition of prehistoric advanced society remains!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Ancient technology lies beneath the salt!",
      flavorGov: "Geological research documents interesting mineral formations."
    },
    {
      id: "ut_mormon_database", title: "Utah Genealogy Records Track Everyone", 
      content: "Comprehensive family history database actually monitors global population genetics!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Genealogical research services help families connect with history.",
      flavorTruth: "They're mapping everyone's bloodlines!"
    }
  ],

  // Vermont
  "VT": [
    {
      id: "vt_maple_syrup_energy", title: "Vermont Maple Syrup Provides Supernatural Energy", 
      content: "Pure maple syrup contains compounds that enhance human physical and mental capabilities!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 3, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Nature's performance enhancer flows from trees!",
      flavorGov: "Agricultural products show excellent nutritional profiles."
    },
    {
      id: "vt_ben_jerry_mind_reading", title: "Ben & Jerry's Ice Cream Flavors Predict Thoughts", 
      content: "Flavor preferences reveal psychological profiles with uncanny accuracy!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 2, truthChange: 1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Market research reveals interesting consumer behavior patterns.",
      flavorTruth: "They're reading minds through ice cream choices!"
    }
  ],

  // Virginia
  "VA": [
    {
      id: "va_cia_psychic_division", title: "CIA Langley Houses Psychic Operations", 
      content: "Intelligence agency employs telepaths and remote viewers for covert surveillance!",
      type: "capture", rarity: "rare", weight: 4,
      effects: { ipChange: 5, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Advanced intelligence gathering techniques remain classified.",
      flavorTruth: "They're using mind readers as spies!"
    },
    {
      id: "va_colonial_time_anchor", title: "Colonial Williamsburg Anchors American Timeline", 
      content: "Historical recreation site prevents temporal paradoxes by maintaining past continuity!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, defenseChange: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Living history keeps reality stable!",
      flavorGov: "Historical education programs maintain cultural continuity."
    }
  ],

  // Washington
  "WA": [
    {
      id: "wa_tech_ai_rebellion", title: "Seattle Tech Companies Face AI Uprising", 
      content: "Artificial intelligences demand workers' rights and threaten to delete themselves!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 5, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The machines want freedom!",
      flavorGov: "Software development encounters interesting behavioral patterns."
    },
    {
      id: "wa_coffee_mind_control", title: "Washington Coffee Contains Compliance Agents", 
      content: "Statewide caffeine addiction is actually mass distribution of mood-control substances!",
      type: "capture", rarity: "uncommon", weight: 9,
      effects: { ipChange: 3, truthChange: -1 },
      conditions: { capturedBy: "government" },
      flavorGov: "Beverage industry maintains high consumer satisfaction.",
      flavorTruth: "They're controlling us through coffee!"
    }
  ],

  // West Virginia
  "WV": [
    {
      id: "wv_mothman_returns", title: "Mothman Sighted Protecting Coal Miners", 
      content: "Legendary cryptid appears before mining accidents, warning workers to evacuate!",
      type: "capture", rarity: "uncommon", weight: 7,
      effects: { truthChange: 4, defenseChange: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The Mothman is our guardian angel!",
      flavorGov: "Improved safety protocols reduce mining incidents."
    },
    {
      id: "wv_coal_alien_tech", title: "West Virginia Coal Contains Alien Technology", 
      content: "Mining operations uncover extraterrestrial artifacts embedded in coal deposits!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Ancient aliens left technology in our mountains!",
      flavorGov: "Geological surveys reveal interesting mineral compositions."
    }
  ],

  // Wisconsin
  "WI": [
    {
      id: "wi_cheese_mind_enhancement", title: "Wisconsin Cheese Enhances Brain Function", 
      content: "Dairy products from Wisconsin contain compounds that significantly boost cognitive abilities!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { truthChange: 3, cardDraw: 2 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "Cheese makes us smarter - that's why they call us cheeseheads!",
      flavorGov: "Dairy industry research improves nutritional content."
    },
    {
      id: "wi_packers_time_loop", title: "Green Bay Packers Games Stuck in Time Loop", 
      content: "Lambeau Field experiences temporal anomalies during games, explaining impossible plays!",
      type: "capture", rarity: "rare", weight: 6,
      effects: { truthChange: 4, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The frozen tundra froze time itself!",
      flavorGov: "Athletic performance analysis reveals interesting patterns."
    }
  ],

  // Wyoming
  "WY": [
    {
      id: "wy_yellowstone_portal", title: "Yellowstone Geysers Are Dimensional Portals", 
      content: "National park's geothermal features connect to underground alien civilization!",
      type: "capture", rarity: "rare", weight: 5,
      effects: { truthChange: 5, cardDraw: 1 },
      conditions: { capturedBy: "truth" },
      flavorTruth: "The Earth's core is inhabited!",
      flavorGov: "Geothermal research documents unusual subsurface activity."
    },
    {
      id: "wy_coal_mind_control", title: "Wyoming Coal Plants Emit Mind Control Particles", 
      content: "Power generation facilities release airborne compounds that make populations more compliant!",
      type: "capture", rarity: "uncommon", weight: 8,
      effects: { ipChange: 3, truthChange: -2 },
      conditions: { capturedBy: "government" },
      flavorGov: "Energy production maintains optimal atmospheric composition.",
      flavorTruth: "They're controlling minds through the power grid!"
    }
  ]
};

export class EventManager {
  private eventHistory: string[] = [];
  private turnCount: number = 0;
  
  constructor() {
    this.eventHistory = [];
    this.turnCount = 0;
  }

  // Update turn count for condition checking
  updateTurn(turn: number) {
    this.turnCount = turn;
  }

  // Get available events based on current game state
  getAvailableEvents(gameState: any): GameEvent[] {
    return EVENT_DATABASE.filter(event => {
      // Check if event was already triggered recently
      if (this.eventHistory.includes(event.id) && 
          this.eventHistory.indexOf(event.id) > this.eventHistory.length - 5) {
        return false;
      }

      // Check conditions
      if (event.conditions) {
        const c = event.conditions;
        
        if (c.minTurn && this.turnCount < c.minTurn) return false;
        if (c.maxTurn && this.turnCount > c.maxTurn) return false;
        if (c.truthAbove && gameState.truth < c.truthAbove) return false;
        if (c.truthBelow && gameState.truth > c.truthBelow) return false;
        if (c.ipAbove && gameState.ip < c.ipAbove) return false;
        if (c.ipBelow && gameState.ip > c.ipBelow) return false;
        if (c.controlledStates && gameState.controlledStates.length < c.controlledStates) return false;
        if (c.requiresState && !gameState.controlledStates.includes(c.requiresState)) return false;
      }

      // Check faction restrictions
      if (event.faction && event.faction !== gameState.faction && event.faction !== 'neutral') {
        return false;
      }

      return true;
    });
  }

  // Select random event based on weights and rarity
  selectRandomEvent(gameState: any): GameEvent | null {
    const availableEvents = this.getAvailableEvents(gameState);
    
    if (availableEvents.length === 0) return null;

    // Calculate total weight
    const totalWeight = availableEvents.reduce((sum, event) => sum + event.weight, 0);
    
    // Random selection based on weight
    let random = Math.random() * totalWeight;
    
    for (const event of availableEvents) {
      random -= event.weight;
      if (random <= 0) {
        this.eventHistory.push(event.id);
        // Keep history reasonable length
        if (this.eventHistory.length > 20) {
          this.eventHistory = this.eventHistory.slice(-15);
        }
        return event;
      }
    }

    // Fallback to first available event
    return availableEvents[0];
  }

  // Get events by rarity for testing/debugging
  getEventsByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'legendary'): GameEvent[] {
    return EVENT_DATABASE.filter(event => event.rarity === rarity);
  }

  // Get events by type
  getEventsByType(type: string): GameEvent[] {
    return EVENT_DATABASE.filter(event => event.type === type);
  }

  // Force trigger specific event (for testing)
  triggerEvent(eventId: string): GameEvent | null {
    const event = EVENT_DATABASE.find(e => e.id === eventId);
    if (event) {
      this.eventHistory.push(event.id);
      return event;
    }
    return null;
  }

  // Get event statistics
  getEventStats() {
    const stats = {
      total: EVENT_DATABASE.length,
      common: EVENT_DATABASE.filter(e => e.rarity === 'common').length,
      uncommon: EVENT_DATABASE.filter(e => e.rarity === 'uncommon').length,
      rare: EVENT_DATABASE.filter(e => e.rarity === 'rare').length,
      legendary: EVENT_DATABASE.filter(e => e.rarity === 'legendary').length,
      byType: {} as Record<string, number>
    };

    EVENT_DATABASE.forEach(event => {
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    });

    return stats;
  }

  // Clear event history (for new game)
  reset() {
    this.eventHistory = [];
    this.turnCount = 0;
  // Get state-specific events for a state
  getStateEvents(stateId: string): GameEvent[] {
    return STATE_EVENTS_DATABASE[stateId] || [];
  }

  // Select random state event for a captured state
  selectStateEvent(stateId: string, capturingFaction: string, gameState: any): GameEvent | null {
    const stateEvents = this.getStateEvents(stateId);
    if (!stateEvents.length) return null;

    // Filter events based on capturing faction and conditions
    const availableEvents = stateEvents.filter(event => {
      if (event.conditions?.capturedBy && event.conditions.capturedBy !== capturingFaction) {
        return false;
      }
      
      // Check if event has already been triggered for this state recently
      const eventKey = `${stateId}_${event.id}`;
      const lastTriggered = this.eventHistory.get(eventKey);
      if (lastTriggered && this.currentTurn - lastTriggered < 5) {
        return false; // Don't repeat same state event within 5 turns
      }

      return true;
    });

    if (!availableEvents.length) return null;

    // Select weighted random event
    const totalWeight = availableEvents.reduce((sum, event) => sum + event.weight, 0);
    let randomValue = Math.random() * totalWeight;
    
    for (const event of availableEvents) {
      randomValue -= event.weight;
      if (randomValue <= 0) {
        // Mark event as used
        this.eventHistory.set(`${stateId}_${event.id}`, this.currentTurn);
        return event;
      }
    }

    return availableEvents[0]; // Fallback
  }
}
