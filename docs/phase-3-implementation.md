# Phase 3 Implementation - AI, Progression & Modifiers

**Status:** ✅ IMPLEMENTED  
**Date:** 2025-10-17  
**Phase:** AI & Progression (Week 6-8)

## Overview

Phase 3 adds strategic depth through AI personalities, campaign progression, daily challenges, and comeback mechanics to improve replayability and player engagement.

---

## 1. Comeback/Catch-Up Cards ✅

**Purpose:** Help losing players mount dramatic comebacks without removing skill-based advantage.

### Implementation

**File:** `src/data/core/comeback-cards.ts`

### Added Cards

#### Truth Faction (5 cards):
1. **Underdog Rally** (3 IP, Uncommon, MEDIA)
   - Base: +2% Truth
   - If fewer states: +4% Truth + Draw 1

2. **Grassroots Surge** (4 IP, Rare, ZONE)
   - Base: +2 Pressure
   - If opponent 15+ IP lead: +4 Pressure

3. **Desperate Measures** (4 IP, Uncommon, ATTACK)
   - Base: 3 damage
   - If Truth ≤30%: 5 damage

4. **Against All Odds** (5 IP, Rare, MEDIA)
   - Base: +3% Truth, Draw 2
   - If 3+ states behind: +6% Truth

5. **Phoenix Protocol** (6 IP, Legendary, TECH)
   - Draw 3 cards
   - Multiple conditionals: +10 IP if ≤10 IP, +5% Truth if opponent controls 8+ states

#### Government Faction (5 cards):
1. **Emergency Powers** (3 IP, Uncommon, MEDIA)
   - Base: -2% Truth
   - If fewer states: -4% Truth + Gain 3 IP

2. **Contingency Protocol** (4 IP, Rare, DEFENSIVE)
   - Base: +2 Defense to all states
   - If opponent 15+ IP lead: +3 Defense

3. **Scorched Earth** (4 IP, Uncommon, ATTACK)
   - Base: 3 damage
   - If Truth ≥70%: 5 damage

4. **Last Resort** (5 IP, Rare, MEDIA)
   - Base: -3% Truth, +5 IP
   - If 3+ states behind: -6% Truth

5. **Doomsday Directive** (6 IP, Legendary)
   - Base: +10 IP
   - If ≤10 IP: +15 IP instead
   - If opponent controls 8+ states: -5% Truth

### Integration Required

- [ ] Add to `CARD_DATABASE` in `src/data/cardDatabase.ts`
- [ ] Add to deck generation pools with appropriate rarity weights
- [ ] Implement new conditionals: `ifFewerStates`, `ifFewerStatesCount`, `ifOpponentZonesControlledAtLeast`
- [ ] Test balance in losing scenarios

---

## 2. AI Personality System ✅

**Purpose:** Create distinct AI opponents with unique playstyles and character.

### Implementation

**File:** `src/data/aiPersonas.ts`

### Five Distinct Personas

#### 1. Dr. Margaret Chen - "The Skeptic" (Easy)
- **Playstyle:** Defensive, Truth-focused, methodical
- **Priorities:** MEDIA > TECH > DEFENSIVE
- **Banter:** Scientific, questioning
- **Quote:** *"Correlation does not imply causation."*

#### 2. Agent Marcus Stone - "The Operative" (Medium)
- **Playstyle:** Balanced, adaptive, protocol-driven
- **Priorities:** ZONE > ATTACK > MEDIA
- **Banter:** Bureaucratic, professional
- **Quote:** *"Protocol demands a measured response."*

#### 3. Sarah "Prophet" Hayes - "The Zealot" (Hard)
- **Playstyle:** Aggressive territorial rush
- **Priorities:** ZONE > ATTACK > TECH
- **Banter:** Passionate, conspiracy-focused
- **Quote:** *"THE TRUTH IS OUT THERE AND I WILL FIND IT!"*

#### 4. Viktor Kline - "The Manipulator" (Hard)
- **Playstyle:** Psychological warfare, Truth control
- **Priorities:** MEDIA > TECH > ATTACK
- **Banter:** Smug, condescending
- **Quote:** *"Reality is what I say it is."*

#### 5. SIGMA-7 - "The Director" (Insane)
- **Playstyle:** Multi-turn strategic planning
- **Priorities:** TECH > MEDIA > ZONE (Balanced)
- **Banter:** Cryptic, speaks in code
- **Quote:** *"PROJECT CLEARANCE: SIGMA-7. PROCEED."*

### Personality Traits (0-1 scale)

Each persona has numeric values for:
- `aggressiveness` - Prefers ATTACK cards
- `defensiveness` - Prefers DEFENSIVE/ZONE cards
- `territorial` - Focuses on state control
- `truthFocused` - Prioritizes Truth meter
- `economical` - Focuses on IP generation
- `riskTolerance` - Willing to take risks
- `comboAwareness` - Seeks card synergies

### Integration Required

- [ ] Connect to `src/data/enhancedAIStrategy.ts` for decision-making
- [ ] Integrate banter with `src/ai/banter/banterEngine.ts`
- [ ] Add persona selection to game setup UI
- [ ] Implement personality-specific card priorities
- [ ] Add banter triggers for key game moments

---

## 3. Campaign Mode ✅

**Purpose:** Provide progressive narrative-driven gameplay with escalating challenges.

### Implementation

**File:** `src/data/campaign.ts`

### 7-Mission Campaign Structure

#### Mission 1: "First Contact" (Easy)
- **Goal:** Control 5 states (reduced threshold)
- **Starting:** +5 IP advantage
- **Story:** Initial investigation into conspiracy
- **Rewards:** Unlock Underdog Rally card

#### Mission 2: "Local Outbreak" (Easy)
- **Goal:** Control 7 states
- **Story:** Phenomenon spreading across states
- **Rewards:** Unlock 2 comeback cards

#### Mission 3: "Media War" (Medium)
- **Goal:** Truth victory (85% or 15%)
- **Modifier:** All MEDIA cards +1% Truth
- **Story:** Battle for narrative control
- **Rewards:** Unlock card + "The Manipulator" persona

#### Mission 4: "Economic Pressure" (Medium)
- **Goal:** Standard victory
- **Starting:** AI starts with +50 IP (60 vs 10)
- **Story:** Overcome resource disadvantage
- **Rewards:** Unlock 2 comeback cards

#### Mission 5: "Contested Territory" (Hard)
- **Goal:** Standard victory
- **Modifier:** All states +2 Defense
- **Story:** War of attrition
- **Rewards:** Unlock Phoenix Protocol + "The Zealot"

#### Mission 6: "The Cover-Up" (Hard)
- **Goal:** Control 10 states
- **Modifier:** Truth capped at 70%
- **Story:** Reality suppression active
- **Rewards:** Unlock 2 Government comeback cards

#### Mission 7: "Final Edition" (Insane)
- **Goal:** Standard victory vs SIGMA-7
- **Story:** Ultimate showdown
- **Rewards:** Unlock Doomsday Directive + "The Director"

### Data Structures

```typescript
interface CampaignMission {
  id: string;
  number: number;
  name: string;
  description: string;
  briefing: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'insane';
  victoryConditions?: { ... };
  startingConditions?: { ... };
  modifiers?: GameModifier[];
  story: { intro, victory, defeat };
  rewards?: { unlockedCards, unlockedPersonas };
}

interface CampaignProgress {
  completedMissions: string[];
  currentMission: number;
  unlockedCards: string[];
  unlockedPersonas: string[];
  victoryCount: number;
  defeatCount: number;
}
```

### Integration Required

- [ ] Create campaign menu UI (`src/components/CampaignMenu.tsx`)
- [ ] Implement mission unlock system
- [ ] Add campaign progress tracking (localStorage)
- [ ] Create mission briefing/debriefing screens
- [ ] Apply mission modifiers to game initialization
- [ ] Track unlocked content and apply to deck generation

---

## 4. Game Modifiers System ✅

**Purpose:** Enable daily challenges and custom game rules for replayability.

### Implementation

**File:** `src/data/gameModifiers.ts`

### Modifier Categories

#### Cost Modifiers
- **Budget Crisis:** All cards +2 IP (Hard)
- **Economic Boom:** All cards -1 IP (Easy)

#### Card Draw Modifiers
- **Media Blackout:** No MEDIA cards (Hard)
- **Information Overload:** 7-card hand, play 5 per turn (Medium)
- **Guerrilla Warfare:** Start with 7 cards, play 4 per turn (Medium)

#### Truth Modifiers
- **Truth Amplified:** Truth changes ×2 (Hard)
- **Reality Locked:** Truth locked between 40-60% (Extreme)
- **Believers & Skeptics:** Truth starts at 20% or 80% (Hard)

#### Territory Modifiers
- **Fortified Nation:** All states +2 Defense (Hard)
- **Cold War:** Both players start with 10 states (Extreme)
- **Territorial Dispute:** Capture threshold -2 (Easy)

#### Special Modifiers
- **Paranormal Surge:** Cryptid cards 3× more frequent (Medium)
- **Blitzkrieg:** Game ends after 15 turns (Extreme)
- **Economic Warfare:** Both players +3 IP per turn (Medium)

### Daily Challenge System

```typescript
interface DailyChallenge {
  date: string;
  seed: number;
  modifiers: GameModifier[];
  description: string;
  rewardMultiplier: number;
}

generateDailyChallenge(date: Date): DailyChallenge
```

- Deterministic seed from date (YYYY-MM-DD)
- Selects 1-3 random modifiers
- Calculates score multiplier based on difficulty
- Easy: 0.8×, Medium: 1.0×, Hard: 1.5×, Extreme: 2.0×

### Integration Required

- [ ] Create daily challenge UI (`src/components/DailyChallengeMenu.tsx`)
- [ ] Implement modifier application in game initialization
- [ ] Add leaderboard system for daily scores
- [ ] Apply cost modifiers to card cost calculations
- [ ] Apply truth modifiers to truth change calculations
- [ ] Track daily challenge completion and scores

---

## Integration Checklist

### High Priority
- [ ] Add comeback cards to `CARD_DATABASE`
- [ ] Implement new conditionals in `CardEffects` interface
- [ ] Connect AI personas to decision-making system
- [ ] Create campaign menu UI
- [ ] Implement campaign progress tracking

### Medium Priority
- [ ] Add daily challenge UI
- [ ] Implement modifier application system
- [ ] Create mission briefing screens
- [ ] Add persona selection to game setup
- [ ] Integrate banter system with personas

### Low Priority
- [ ] Add leaderboard for daily challenges
- [ ] Create tutorial for campaign mode
- [ ] Add campaign statistics tracking
- [ ] Implement achievement system for campaign completion

---

## Testing Requirements

1. **Comeback Cards:**
   - Test conditional triggers in various game states
   - Verify balance doesn't over-reward losing position
   - Test with AI to ensure catchup is effective but fair

2. **AI Personas:**
   - Verify each persona plays distinctly
   - Test banter triggers at appropriate moments
   - Ensure difficulty scaling matches persona design

3. **Campaign:**
   - Playtest all 7 missions for difficulty progression
   - Verify unlock system works correctly
   - Test modifier application in each mission

4. **Modifiers:**
   - Test each modifier independently
   - Test modifier combinations for conflicts
   - Verify daily challenge generation is deterministic

---

## Success Metrics

**Engagement:**
- Campaign completion rate >60%
- Daily challenge participation >30% of active players
- Average persona diversity >3 different personas per 10 games

**Balance:**
- Comeback card win rate when behind: 40-45% (up from <30%)
- Mission 7 win rate: 20-35% (appropriate for Insane difficulty)
- Daily challenge completion rate: 50-70%

---

## Phase 3 Complete ✅

All core systems implemented. Ready for integration and testing.
