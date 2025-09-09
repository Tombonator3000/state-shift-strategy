export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'victory' | 'mastery' | 'discovery' | 'challenge' | 'social' | 'collection';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  icon: string;
  points: number;
  hidden?: boolean;
  requirements: {
    type: 'single' | 'cumulative' | 'conditional';
    conditions: Array<{
      key: string;
      value: number | string | boolean;
      operator?: '>=' | '<=' | '==' | '>' | '<' | '!=' | 'contains';
    }>;
  };
  rewards?: {
    title?: string;
    avatar?: string;
    cardback?: string;
    unlockTutorial?: string;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // VICTORY ACHIEVEMENTS
  {
    id: 'first_victory',
    name: 'Shadow Initiate',
    description: 'Win your first game',
    category: 'victory',
    rarity: 'common',
    icon: '🏆',
    points: 10,
    requirements: {
      type: 'single',
      conditions: [{ key: 'games_won', value: 1, operator: '>=' }]
    }
  },
  {
    id: 'truth_victory',
    name: 'Truth Revealed',
    description: 'Win by achieving 90%+ Truth as Truth Seekers',
    category: 'victory',
    rarity: 'uncommon',
    icon: '💡',
    points: 25,
    requirements: {
      type: 'single',
      conditions: [
        { key: 'victory_type', value: 'truth_high' },
        { key: 'faction', value: 'truth' }
      ]
    }
  },
  {
    id: 'suppression_victory',
    name: 'Information Control',
    description: 'Win by reducing Truth to 10% or below as Government',
    category: 'victory',
    rarity: 'uncommon',
    icon: '🔒',
    points: 25,
    requirements: {
      type: 'single',
      conditions: [
        { key: 'victory_type', value: 'truth_low' },
        { key: 'faction', value: 'government' }
      ]
    }
  },
  {
    id: 'territorial_dominance',
    name: 'Continental Control',
    description: 'Win by controlling 10+ states',
    category: 'victory',
    rarity: 'uncommon',
    icon: '🗺️',
    points: 30,
    requirements: {
      type: 'single',
      conditions: [{ key: 'victory_type', value: 'territorial' }]
    }
  },
  {
    id: 'economic_supremacy',
    name: 'Resource Emperor',
    description: 'Win by accumulating 200+ IP',
    category: 'victory',
    rarity: 'uncommon',
    icon: '💰',
    points: 30,
    requirements: {
      type: 'single',
      conditions: [{ key: 'victory_type', value: 'economic' }]
    }
  },
  {
    id: 'agenda_complete',
    name: 'Mission Accomplished',
    description: 'Win by completing your Secret Agenda',
    category: 'victory',
    rarity: 'rare',
    icon: '🎯',
    points: 40,
    requirements: {
      type: 'single',
      conditions: [{ key: 'victory_type', value: 'agenda' }]
    }
  },

  // MASTERY ACHIEVEMENTS  
  {
    id: 'win_streak_5',
    name: 'Shadow Operative',
    description: 'Win 5 games in a row',
    category: 'mastery',
    rarity: 'rare',
    icon: '🔥',
    points: 50,
    requirements: {
      type: 'single',
      conditions: [{ key: 'max_win_streak', value: 5, operator: '>=' }]
    }
  },
  {
    id: 'win_streak_10',
    name: 'Shadow Master',
    description: 'Win 10 games in a row',
    category: 'mastery',
    rarity: 'legendary',
    icon: '👑',
    points: 100,
    requirements: {
      type: 'single',
      conditions: [{ key: 'max_win_streak', value: 10, operator: '>=' }]
    }
  },
  {
    id: 'perfect_game',
    name: 'Flawless Operation',
    description: 'Win without losing any IP to attacks',
    category: 'mastery',
    rarity: 'rare',
    icon: '💎',
    points: 60,
    requirements: {
      type: 'single',
      conditions: [
        { key: 'game_won', value: true },
        { key: 'ip_lost_to_attacks', value: 0 }
      ]
    }
  },
  {
    id: 'speed_victory',
    name: 'Blitz Operative',
    description: 'Win a game in under 10 turns',
    category: 'mastery',
    rarity: 'rare',
    icon: '⚡',
    points: 45,
    requirements: {
      type: 'single',
      conditions: [
        { key: 'game_won', value: true },
        { key: 'turns_to_win', value: 10, operator: '<=' }
      ]
    }
  },
  {
    id: 'legendary_difficulty',
    name: 'Shadow Director Defeated',
    description: 'Defeat the AI on Legendary difficulty',
    category: 'mastery',
    rarity: 'legendary',
    icon: '🎭',
    points: 80,
    requirements: {
      type: 'single',
      conditions: [
        { key: 'game_won', value: true },
        { key: 'ai_difficulty', value: 'legendary' }
      ]
    }
  },

  // DISCOVERY ACHIEVEMENTS
  {
    id: 'first_legendary_card',
    name: 'Classified Discovery',
    description: 'Play your first Legendary card',
    category: 'discovery',
    rarity: 'uncommon',
    icon: '🃏',
    points: 20,
    requirements: {
      type: 'single',
      conditions: [{ key: 'legendary_cards_played', value: 1, operator: '>=' }]
    }
  },
  {
    id: 'all_card_types',
    name: 'Full Spectrum',
    description: 'Play at least one card of each type in a single game',
    category: 'discovery',
    rarity: 'uncommon',
    icon: '🎪',
    points: 25,
    requirements: {
      type: 'single',
      conditions: [
        { key: 'media_cards_played_game', value: 1, operator: '>=' },
        { key: 'zone_cards_played_game', value: 1, operator: '>=' },
        { key: 'attack_cards_played_game', value: 1, operator: '>=' },
        { key: 'defensive_cards_played_game', value: 1, operator: '>=' }
      ]
    }
  },
  {
    id: 'event_collector',
    name: 'Conspiracy Theorist',
    description: 'Experience 50 different events',
    category: 'discovery',
    rarity: 'rare',
    icon: '📰',
    points: 35,
    requirements: {
      type: 'cumulative',
      conditions: [{ key: 'unique_events_seen', value: 50, operator: '>=' }]
    }
  },
  {
    id: 'state_specialist',
    name: 'Cartographer',
    description: 'Control every state at least once',
    category: 'discovery',
    rarity: 'rare',
    icon: '🗺️',
    points: 40,
    requirements: {
      type: 'cumulative',
      conditions: [{ key: 'unique_states_controlled', value: 50, operator: '>=' }]
    }
  },

  // CHALLENGE ACHIEVEMENTS
  {
    id: 'david_vs_goliath',
    name: 'David vs Goliath',
    description: 'Win while having less than 50 IP against an opponent with 150+ IP',
    category: 'challenge',
    rarity: 'rare',
    icon: '🎯',
    points: 55,
    requirements: {
      type: 'single',
      conditions: [
        { key: 'game_won', value: true },
        { key: 'player_ip_at_win', value: 50, operator: '<' },
        { key: 'opponent_ip_at_win', value: 150, operator: '>=' }
      ]
    }
  },
  {
    id: 'truth_extremist',
    name: 'Truth Extremist',
    description: 'Reach 95%+ Truth level',
    category: 'challenge',
    rarity: 'rare',
    icon: '🔆',
    points: 35,
    requirements: {
      type: 'single',
      conditions: [{ key: 'max_truth_reached', value: 95, operator: '>=' }]
    }
  },
  {
    id: 'information_blackout',
    name: 'Information Blackout',
    description: 'Reduce Truth to 5% or below',
    category: 'challenge',
    rarity: 'rare',
    icon: '🌑',
    points: 35,
    requirements: {
      type: 'single',
      conditions: [{ key: 'min_truth_reached', value: 5, operator: '<=' }]
    }
  },
  {
    id: 'resource_hoarder',
    name: 'Resource Hoarder',
    description: 'Accumulate 300+ IP in a single game',
    category: 'challenge',
    rarity: 'rare',
    icon: '💎',
    points: 40,
    requirements: {
      type: 'single',
      conditions: [{ key: 'max_ip_reached', value: 300, operator: '>=' }]
    }
  },

  // COLLECTION ACHIEVEMENTS
  {
    id: 'card_collector',
    name: 'Card Collector',
    description: 'Play 100 different cards',
    category: 'collection',
    rarity: 'uncommon',
    icon: '📚',
    points: 30,
    requirements: {
      type: 'cumulative',
      conditions: [{ key: 'unique_cards_played', value: 100, operator: '>=' }]
    }
  },
  {
    id: 'veteran_operative',
    name: 'Veteran Operative',
    description: 'Play 100 total games',
    category: 'collection',
    rarity: 'rare',
    icon: '🎖️',
    points: 50,
    requirements: {
      type: 'cumulative',
      conditions: [{ key: 'total_games_played', value: 100, operator: '>=' }]
    }
  },
  {
    id: 'master_strategist',
    name: 'Master Strategist',
    description: 'Win with both factions at least 10 times each',
    category: 'collection',
    rarity: 'legendary',
    icon: '⚖️',
    points: 75,
    requirements: {
      type: 'cumulative',
      conditions: [
        { key: 'truth_wins', value: 10, operator: '>=' },
        { key: 'government_wins', value: 10, operator: '>=' }
      ]
    }
  },

  // SOCIAL ACHIEVEMENTS (for future multiplayer)
  {
    id: 'tutorial_complete',
    name: 'Academy Graduate',
    description: 'Complete the basic tutorial',
    category: 'social',
    rarity: 'common',
    icon: '🎓',
    points: 15,
    requirements: {
      type: 'single',
      conditions: [{ key: 'tutorial_basic_complete', value: true }]
    },
    rewards: {
      unlockTutorial: 'advanced_tactics'
    }
  },
  {
    id: 'advanced_tutorial',
    name: 'Advanced Operative',
    description: 'Complete the advanced tutorial',
    category: 'social',
    rarity: 'uncommon',
    icon: '🎯',
    points: 25,
    requirements: {
      type: 'single',
      conditions: [{ key: 'tutorial_advanced_complete', value: true }]
    },
    rewards: {
      unlockTutorial: 'expert_mastery'
    }
  },

  // HIDDEN ACHIEVEMENTS
  {
    id: 'easter_egg_developer',
    name: 'Behind the Curtain',
    description: 'Discover the developer tools',
    category: 'discovery',
    rarity: 'legendary',
    icon: '🔧',
    points: 100,
    hidden: true,
    requirements: {
      type: 'single',
      conditions: [{ key: 'developer_tools_accessed', value: true }]
    },
    rewards: {
      title: 'Shadow Architect'
    }
  },
  {
    id: 'conspiracy_complete',
    name: 'The Truth Is Out There',
    description: 'Experience all legendary events',
    category: 'discovery',
    rarity: 'legendary',
    icon: '👁️',
    points: 150,
    hidden: true,
    requirements: {
      type: 'cumulative',
      conditions: [{ key: 'legendary_events_seen', value: 5, operator: '>=' }]
    },
    rewards: {
      title: 'Illuminated'
    }
  }
];

export interface PlayerStats {
  // Game Statistics
  total_games_played: number;
  games_won: number;
  games_lost: number;
  current_win_streak: number;
  max_win_streak: number;
  
  // Victory Types
  truth_wins: number;
  government_wins: number;
  territorial_victories: number;
  economic_victories: number;
  truth_high_victories: number;
  truth_low_victories: number;
  agenda_victories: number;
  
  // Gameplay Metrics
  total_cards_played: number;
  unique_cards_played: number;
  legendary_cards_played: number;
  media_cards_played: number;
  zone_cards_played: number;
  attack_cards_played: number;
  defensive_cards_played: number;
  
  // Per-Game Tracking
  media_cards_played_game: number;
  zone_cards_played_game: number;
  attack_cards_played_game: number;
  defensive_cards_played_game: number;
  
  // State Control
  total_states_controlled: number;
  unique_states_controlled: number;
  max_states_controlled_single_game: number;
  
  // Resources
  total_ip_earned: number;
  max_ip_reached: number;
  max_truth_reached: number;
  min_truth_reached: number;
  ip_lost_to_attacks: number;
  
  // Events
  total_events_experienced: number;
  unique_events_seen: number;
  legendary_events_seen: number;
  
  // AI Challenges
  easy_ai_wins: number;
  medium_ai_wins: number;
  hard_ai_wins: number;
  legendary_ai_wins: number;
  
  // Time-based
  fastest_victory_turns: number;
  total_play_time_minutes: number;
  
  // Tutorial Progress
  tutorial_basic_complete: boolean;
  tutorial_advanced_complete: boolean;
  tutorial_expert_complete: boolean;
  
  // Special Achievements
  developer_tools_accessed: boolean;
  perfect_games: number;
  
  // Last game data (for contextual achievements)
  last_game_won: boolean;
  last_game_faction: 'truth' | 'government' | null;
  last_game_victory_type: string | null;
  last_game_turns: number;
  last_game_ai_difficulty: string | null;
  last_game_final_ip: number;
  last_game_final_truth: number;
  last_game_states_controlled: number;
}

export class AchievementManager {
  private stats: PlayerStats;
  private unlockedAchievements: string[] = [];
  private newlyUnlocked: Achievement[] = [];

  constructor() {
    this.stats = this.getDefaultStats();
    this.loadProgress();
  }

  private getDefaultStats(): PlayerStats {
    return {
      total_games_played: 0,
      games_won: 0,
      games_lost: 0,
      current_win_streak: 0,
      max_win_streak: 0,
      truth_wins: 0,
      government_wins: 0,
      territorial_victories: 0,
      economic_victories: 0,
      truth_high_victories: 0,
      truth_low_victories: 0,
      agenda_victories: 0,
      total_cards_played: 0,
      unique_cards_played: 0,
      legendary_cards_played: 0,
      media_cards_played: 0,
      zone_cards_played: 0,
      attack_cards_played: 0,
      defensive_cards_played: 0,
      media_cards_played_game: 0,
      zone_cards_played_game: 0,
      attack_cards_played_game: 0,
      defensive_cards_played_game: 0,
      total_states_controlled: 0,
      unique_states_controlled: 0,
      max_states_controlled_single_game: 0,
      total_ip_earned: 0,
      max_ip_reached: 0,
      max_truth_reached: 0,
      min_truth_reached: 100,
      ip_lost_to_attacks: 0,
      total_events_experienced: 0,
      unique_events_seen: 0,
      legendary_events_seen: 0,
      easy_ai_wins: 0,
      medium_ai_wins: 0,
      hard_ai_wins: 0,
      legendary_ai_wins: 0,
      fastest_victory_turns: 999,
      total_play_time_minutes: 0,
      tutorial_basic_complete: false,
      tutorial_advanced_complete: false,
      tutorial_expert_complete: false,
      developer_tools_accessed: false,
      perfect_games: 0,
      last_game_won: false,
      last_game_faction: null,
      last_game_victory_type: null,
      last_game_turns: 0,
      last_game_ai_difficulty: null,
      last_game_final_ip: 0,
      last_game_final_truth: 0,
      last_game_states_controlled: 0
    };
  }

  // Load progress from localStorage
  loadProgress() {
    try {
      const statsData = localStorage.getItem('shadow_government_stats');
      if (statsData) {
        this.stats = { ...this.getDefaultStats(), ...JSON.parse(statsData) };
      }

      const achievementsData = localStorage.getItem('shadow_government_achievements');
      if (achievementsData) {
        this.unlockedAchievements = JSON.parse(achievementsData);
      }
    } catch (e) {
      console.warn('Failed to load achievement progress:', e);
    }
  }

  // Save progress to localStorage
  saveProgress() {
    try {
      localStorage.setItem('shadow_government_stats', JSON.stringify(this.stats));
      localStorage.setItem('shadow_government_achievements', JSON.stringify(this.unlockedAchievements));
    } catch (e) {
      console.warn('Failed to save achievement progress:', e);
    }
  }

  // Update statistics and check achievements
  updateStats(updates: Partial<PlayerStats>) {
    // Apply updates to stats
    Object.keys(updates).forEach(key => {
      const statKey = key as keyof PlayerStats;
      const value = updates[statKey];
      if (value !== undefined) {
        if (typeof value === 'number' && typeof this.stats[statKey] === 'number') {
          (this.stats[statKey] as number) = value;
        } else {
          (this.stats[statKey] as any) = value;
        }
      }
    });

    // Check for newly unlocked achievements
    this.checkAchievements();
    this.saveProgress();
  }

  // Increment a stat value
  incrementStat(key: keyof PlayerStats, amount: number = 1) {
    if (typeof this.stats[key] === 'number') {
      (this.stats[key] as number) += amount;
      this.checkAchievements();
      this.saveProgress();
    }
  }

  // Set maximum value for a stat
  setMaxStat(key: keyof PlayerStats, value: number) {
    if (typeof this.stats[key] === 'number') {
      (this.stats[key] as number) = Math.max(this.stats[key] as number, value);
      this.checkAchievements();
      this.saveProgress();
    }
  }

  // Set minimum value for a stat
  setMinStat(key: keyof PlayerStats, value: number) {
    if (typeof this.stats[key] === 'number') {
      (this.stats[key] as number) = Math.min(this.stats[key] as number, value);
      this.checkAchievements();
      this.saveProgress();
    }
  }

  // Check all achievements for unlocks
  private checkAchievements() {
    this.newlyUnlocked = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (this.unlockedAchievements.includes(achievement.id)) return;

      if (this.checkAchievementConditions(achievement)) {
        this.unlockedAchievements.push(achievement.id);
        this.newlyUnlocked.push(achievement);
      }
    });
  }

  // Check if achievement conditions are met
  private checkAchievementConditions(achievement: Achievement): boolean {
    const { requirements } = achievement;
    
    if (requirements.type === 'single') {
      // All conditions must be met in the current state
      return requirements.conditions.every(condition => {
        return this.checkCondition(condition);
      });
    } else if (requirements.type === 'cumulative') {
      // Conditions are checked against lifetime stats
      return requirements.conditions.every(condition => {
        return this.checkCondition(condition);
      });
    } else if (requirements.type === 'conditional') {
      // Complex conditional logic
      return requirements.conditions.every(condition => {
        return this.checkCondition(condition);
      });
    }

    return false;
  }

  // Check individual condition
  private checkCondition(condition: any): boolean {
    const { key, value, operator = '==' } = condition;
    const statValue = this.stats[key as keyof PlayerStats];

    if (statValue === undefined) return false;

    switch (operator) {
      case '>=': return (statValue as number) >= (value as number);
      case '<=': return (statValue as number) <= (value as number);
      case '>': return (statValue as number) > (value as number);
      case '<': return (statValue as number) < (value as number);
      case '==': return statValue === value;
      case '!=': return statValue !== value;
      case 'contains': return String(statValue).includes(String(value));
      default: return statValue === value;
    }
  }

  // Get newly unlocked achievements and clear the list
  getNewlyUnlocked(): Achievement[] {
    const newly = [...this.newlyUnlocked];
    this.newlyUnlocked = [];
    return newly;
  }

  // Get all unlocked achievements
  getUnlockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(achievement => 
      this.unlockedAchievements.includes(achievement.id)
    );
  }

  // Get locked achievements (excluding hidden ones)
  getLockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(achievement => 
      !this.unlockedAchievements.includes(achievement.id) && !achievement.hidden
    );
  }

  // Get achievement progress stats
  getProgress() {
    const total = ACHIEVEMENTS.filter(a => !a.hidden).length;
    const unlocked = this.unlockedAchievements.length;
    const totalPoints = this.getUnlockedAchievements().reduce((sum, a) => sum + a.points, 0);
    
    return {
      total,
      unlocked,
      locked: total - unlocked,
      completionRate: Math.round((unlocked / total) * 100),
      totalPoints,
      rank: this.calculateRank(totalPoints)
    };
  }

  // Calculate player rank based on points
  private calculateRank(points: number): string {
    if (points >= 1000) return 'Shadow Architect';
    if (points >= 750) return 'Master Operative';
    if (points >= 500) return 'Senior Agent';
    if (points >= 250) return 'Field Operative';
    if (points >= 100) return 'Junior Agent';
    if (points >= 50) return 'Trainee';
    return 'Recruit';
  }

  // Get current stats
  getStats(): PlayerStats {
    return { ...this.stats };
  }

  // Reset all progress
  resetProgress() {
    this.stats = this.getDefaultStats();
    this.unlockedAchievements = [];
    this.newlyUnlocked = [];
    this.saveProgress();
  }

  // Export achievement data
  exportData() {
    return {
      stats: this.stats,
      achievements: this.unlockedAchievements,
      timestamp: Date.now(),
      version: '1.0'
    };
  }

  // Game event handlers
  onGameStart(faction: 'truth' | 'government', difficulty: string) {
    this.updateStats({
      last_game_faction: faction,
      last_game_ai_difficulty: difficulty,
      total_games_played: this.stats.total_games_played + 1
    });
  }

  onGameEnd(won: boolean, victoryType: string, turns: number, finalIP: number, finalTruth: number, statesControlled: number) {
    const updates: Partial<PlayerStats> = {
      last_game_won: won,
      last_game_victory_type: victoryType,
      last_game_turns: turns,
      last_game_final_ip: finalIP,
      last_game_final_truth: finalTruth,
      last_game_states_controlled: statesControlled
    };

    if (won) {
      updates.games_won = this.stats.games_won + 1;
      updates.current_win_streak = this.stats.current_win_streak + 1;
      updates.max_win_streak = Math.max(this.stats.max_win_streak, this.stats.current_win_streak + 1);
      updates.fastest_victory_turns = Math.min(this.stats.fastest_victory_turns, turns);
      
      if (this.stats.last_game_faction === 'truth') {
        updates.truth_wins = this.stats.truth_wins + 1;
      } else {
        updates.government_wins = this.stats.government_wins + 1;
      }

      // Victory type tracking
      switch (victoryType) {
        case 'territorial':
          updates.territorial_victories = this.stats.territorial_victories + 1;
          break;
        case 'economic':
          updates.economic_victories = this.stats.economic_victories + 1;
          break;
        case 'truth_high':
          updates.truth_high_victories = this.stats.truth_high_victories + 1;
          break;
        case 'truth_low':
          updates.truth_low_victories = this.stats.truth_low_victories + 1;
          break;
        case 'agenda':
          updates.agenda_victories = this.stats.agenda_victories + 1;
          break;
      }
    } else {
      updates.games_lost = this.stats.games_lost + 1;
      updates.current_win_streak = 0;
    }

    this.updateStats(updates);
  }

  onCardPlayed(cardType: string, cardRarity: string) {
    this.incrementStat('total_cards_played');
    
    // Reset per-game counters at start of new game
    // (This would be called when a new game starts)
    
    switch (cardType.toLowerCase()) {
      case 'media':
        this.incrementStat('media_cards_played');
        this.incrementStat('media_cards_played_game');
        break;
      case 'zone':
        this.incrementStat('zone_cards_played');
        this.incrementStat('zone_cards_played_game');
        break;
      case 'attack':
        this.incrementStat('attack_cards_played');
        this.incrementStat('attack_cards_played_game');
        break;
      case 'defensive':
        this.incrementStat('defensive_cards_played');
        this.incrementStat('defensive_cards_played_game');
        break;
    }

    if (cardRarity === 'legendary') {
      this.incrementStat('legendary_cards_played');
    }
  }

  onNewGameStart() {
    // Reset per-game counters
    this.updateStats({
      media_cards_played_game: 0,
      zone_cards_played_game: 0,
      attack_cards_played_game: 0,
      defensive_cards_played_game: 0,
      ip_lost_to_attacks: 0
    });
  }
}