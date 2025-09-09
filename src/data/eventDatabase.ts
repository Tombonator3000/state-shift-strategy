export interface GameEvent {
  id: string;
  title: string;
  headline: string;
  content: string;
  type: 'conspiracy' | 'government' | 'truth' | 'random' | 'crisis' | 'opportunity';
  faction?: 'truth' | 'government' | 'neutral';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects?: {
    truth?: number;
    ip?: number;
    cardDraw?: number;
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
  };
  weight: number; // Probability weight for selection
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
  }
}
