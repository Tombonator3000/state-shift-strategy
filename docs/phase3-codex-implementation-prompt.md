# Phase 3 Newspaper System - Complete Implementation Prompt

## Context

This is a card-based strategy game called "The Paranoid Times" where players use Truth and Government faction cards to control states. The newspaper system generates humorous, conspiracy-themed articles after each turn based on cards played.

**Current State:**
- 10 of 440 card-specific articles have been written (TRUTH-001 to TRUTH-010)
- Basic article database structure exists in `src/data/cardArticles/truthArticles.ts`
- Recurring character tracking exists in `src/game/recurringCharacters.ts` but isn't integrated
- Article generation system exists in `src/engine/newspaper/IssueGenerator.ts`
- No dynamic variable substitution
- No article tone variety system
- No character arc progression in articles

## Your Task

Complete Phase 3 of the newspaper system by implementing:
1. **430 remaining card articles** (TRUTH-011 through TRUTH-200, GOV-001 through GOV-200, expansion cards)
2. **Dynamic variable substitution** (Phase 3.B)
3. **Recurring character story arcs** (Phase 3.C)
4. **Article tone variety** (Phase 3.D)
5. **Integration with existing systems**

---

## Part 1: Complete Article Database (430 Articles)

### Files to Create/Update:
- `src/data/cardArticles/truthArticles.ts` (add TRUTH-011 through TRUTH-200)
- `src/data/cardArticles/governmentArticles.ts` (create with GOV-001 through GOV-200)
- `src/data/cardArticles/expansionArticles.ts` (create with expansion cards)
- `src/data/cardArticles/articleDatabase.ts` (update to consolidate all)

### Article Writing Guidelines:

**Tone:**
- Truth articles: Conspiracy-minded, breathless, ALL CAPS headlines, exclamation points
- Government articles: Bureaucratic, dismissive, heavy redactions, plausible deniability
- Mix humor with semi-plausible scenarios
- Reference real US geography, pop culture, urban legends

**Required Fields for Each Article:**
```typescript
{
  cardId: string;           // e.g., "TRUTH-011"
  faction: 'truth' | 'government';
  headline: string;         // 50-80 chars, punchy, memorable
  subhead?: string;         // Optional, adds context
  byline: string;           // "By [Name], [Role]" or "Anonymous Insider"
  body: string;             // 2-4 paragraphs, 150-300 words
  imagePrompt?: string;     // Visual description for future image generation
  tags: string[];           // ['conspiracy', 'ufo', 'government-coverup', etc.]
  statesMentioned?: string[]; // States relevant to the story
  recurringCharacter?: string; // Name of character from recurringCharacters.ts
  followUpHooks?: string[]; // Teaser lines for future stories
}
```

**Recurring Characters to Use:**
From `src/game/recurringCharacters.ts`:
- Pastor Rex (doomsday preacher whose predictions come true)
- Agent Smitherson (Man in Black who denies existence)
- Florida Man (legendary exploits)
- Bat Boy (cryptid sightings)
- Maria Chen (tinfoil hat vendor)
- Coach Terry Hammond (lost football game to UFO)

**Article Distribution Strategy:**
- 60% standalone articles (no recurring character)
- 30% articles featuring recurring characters
- 10% articles that reference multiple characters or previous events
- Ensure geographic diversity: mention all 50 states across the 440 articles
- Include variety: UFOs, cryptids, government conspiracies, bizarre local news, supernatural events

**Example Format (Truth Article):**
```typescript
{
  cardId: 'TRUTH-011',
  faction: 'truth',
  headline: 'BIGFOOT CENSUS WORKER REFUSES TO BE COUNTED',
  subhead: 'Pacific Northwest Population Numbers "Significantly Understated," Says Bureau',
  byline: 'By Jake Morrison, Cryptid Demographics Correspondent',
  body: `A census worker in Washington state has filed an official complaint after encountering what she describes as "a seven-foot-tall bipedal entity who told me to get off his property." The Bureau has flagged the incident as a "non-response household" despite the worker's insistence that someone—or something—definitely lives there.

Local rangers report similar encounters during the count, with at least fourteen households showing signs of occupancy but refusing participation. "We've found fresh footprints, recently used fire pits, and what appears to be a sophisticated system of tree knocks," said Deputy Forest Ranger Chen. "Someone's definitely out there."

The Census Bureau maintains its population figures are accurate, though they've added a new category: "Declined to State Species." Privacy advocates are calling it a win for marginalized communities, while statisticians warn the undercount could cost the region federal funding.

Experts estimate the actual Pacific Northwest population could be 2-3% higher than official numbers suggest.`,
  imagePrompt: 'Census worker with clipboard looking nervously at large footprints in forest mud',
  tags: ['bigfoot', 'cryptid', 'census', 'washington', 'government-data'],
  statesMentioned: ['Washington', 'Oregon'],
  recurringCharacter: null,
  followUpHooks: [
    'Bureau considers "Non-Human Resident" category for 2030 census',
    'Anthropologists petition for Bigfoot cultural liaison position'
  ]
}
```

**Example Format (Government Article):**
```typescript
{
  cardId: 'GOV-011',
  faction: 'government',
  headline: 'Weather Balloon Explanation Deemed Sufficient',
  subhead: 'Pentagon Closes Investigation Into Arizona Lights',
  byline: 'By Official DoD Press Release',
  body: `The Department of Defense has concluded its investigation into the alleged "Phoenix Lights" incident, determining that the phenomenon was consistent with weather balloons and optical illusions. A spokesperson emphasized that no further investigation is warranted.

"The American public can rest assured that the skies remain secure," the statement reads. "Witnesses who reported structured craft, silent propulsion systems, and formations are encouraged to consult with optometrists regarding night vision acuity."

The fourteen-page report dedicates twelve pages to redactions, with remaining content focused on meteorological data and flight patterns of conventional aircraft. Several retired Air Force officers have requested access to unredacted materials under FOIA but have been informed such requests are "premature."

The investigation is now closed and will not be reopened under any circumstances, officials confirm.`,
  imagePrompt: 'Blurry photograph of lights in sky with large "WEATHER BALLOON" stamp overlaid',
  tags: ['coverup', 'weather-balloon', 'ufo', 'phoenix-lights', 'pentagon'],
  statesMentioned: ['Arizona'],
  recurringCharacter: 'Agent Smitherson',
  followUpHooks: [
    'Retired pilots form independent analysis group',
    'Weather balloon manufacturer reports no sales in Arizona for past decade'
  ]
}
```

### Implementation Steps:
1. Write articles in batches of 50 to maintain consistency
2. Track which states and characters have been used to ensure variety
3. Match article themes to card effects when possible (e.g., if card captures Nevada, mention Nevada)
4. Export all articles from respective files
5. Update `articleDatabase.ts` to merge all arrays:
```typescript
import { TRUTH_ARTICLES } from './truthArticles';
import { GOVERNMENT_ARTICLES } from './governmentArticles';
import { EXPANSION_ARTICLES } from './expansionArticles';

export const CARD_ARTICLE_DATABASE: CardArticle[] = [
  ...TRUTH_ARTICLES,
  ...GOVERNMENT_ARTICLES,
  ...EXPANSION_ARTICLES,
];
```

---

## Part 2: Dynamic Variable Substitution (Phase 3.B)

### Create New File: `src/engine/newspaper/articleVariables.ts`

**Purpose:** Allow articles to reference current game state dynamically.

**Supported Variables:**
- `{STATES_CONTROLLED}` → "23 states"
- `{TRUTH_PERCENTAGE}` → "67%"
- `{IP_REMAINING}` → "4 IP"
- `{TURN_NUMBER}` → "Round 8"
- `{CAPTURED_THIS_TURN}` → "Nevada, Arizona, Utah"
- `{PLAYER_FACTION}` → "Truth Network" / "Government Machine"
- `{OPPONENT_FACTION}` → same
- `{CARDS_PLAYED_COUNT}` → "3 cards"
- `{CURRENT_SCORE}` → "145 truth points"

**Implementation:**
```typescript
export interface GameStateContext {
  statesControlled: number;
  totalStates: number;
  truthPercentage: number;
  ipRemaining: number;
  turnNumber: number;
  capturedThisTurn: string[];
  playerFaction: 'truth' | 'government';
  cardsPlayedCount: number;
  currentScore: number;
}

export function substituteArticleVariables(
  template: string,
  context: GameStateContext
): string {
  return template
    .replace(/{STATES_CONTROLLED}/g, `${context.statesControlled} states`)
    .replace(/{TOTAL_STATES}/g, `${context.totalStates}`)
    .replace(/{TRUTH_PERCENTAGE}/g, `${context.truthPercentage}%`)
    .replace(/{IP_REMAINING}/g, `${context.ipRemaining} IP`)
    .replace(/{TURN_NUMBER}/g, `Round ${context.turnNumber}`)
    .replace(/{CAPTURED_THIS_TURN}/g, context.capturedThisTurn.join(', '))
    .replace(/{PLAYER_FACTION}/g, context.playerFaction === 'truth' ? 'Truth Network' : 'Government Machine')
    .replace(/{OPPONENT_FACTION}/g, context.playerFaction === 'truth' ? 'Government Machine' : 'Truth Network')
    .replace(/{CARDS_PLAYED_COUNT}/g, `${context.cardsPlayedCount}`)
    .replace(/{CURRENT_SCORE}/g, `${context.currentScore} truth points`);
}
```

**Update Articles to Use Variables:**
Add 20-30 articles that include dynamic variables in their body text. Example:
```typescript
body: `After {TURN_NUMBER} of escalating tensions, the {PLAYER_FACTION} now controls {STATES_CONTROLLED}, with {CAPTURED_THIS_TURN} falling under their influence this week alone...`
```

**Integration Point:**
Update `src/engine/newspaper/IssueGenerator.ts` in the `buildGeneratedStoryArticle()` method:
```typescript
import { substituteArticleVariables, type GameStateContext } from './articleVariables';

// Build context from game state
const context: GameStateContext = {
  statesControlled: /* extract from game state */,
  truthPercentage: /* calculate */,
  turnNumber: /* from turn tracker */,
  // ... etc
};

// Apply substitution
article.body = substituteArticleVariables(article.body, context);
article.headline = substituteArticleVariables(article.headline, context);
```

---

## Part 3: Recurring Character Story Arcs (Phase 3.C)

### Enhance: `src/game/recurringCharacters.ts`

**Add Story Arc System:**
```typescript
export interface CharacterArc {
  stage: number;
  label: string;
  description: string;
  articleVariant: string; // Which article version to show
}

export interface RecurringCharacter {
  // ... existing fields ...
  storyArcs: CharacterArc[];
  currentStage: number;
}
```

**Example Character with Story Arcs:**
```typescript
pastor_rex: {
  id: 'pastor_rex',
  name: 'Pastor Rex',
  // ... existing fields ...
  storyArcs: [
    {
      stage: 0,
      label: 'Local Preacher',
      description: 'Rex makes his first apocalyptic prediction',
      articleVariant: 'intro'
    },
    {
      stage: 1,
      label: 'Gaining Followers',
      description: 'First prediction comes true, congregation grows',
      articleVariant: 'rising'
    },
    {
      stage: 2,
      label: 'Regional Prophet',
      description: 'Multiple predictions validated, media attention',
      articleVariant: 'climax'
    },
    {
      stage: 3,
      label: 'National Figure',
      description: 'Rex has cult following, government takes notice',
      articleVariant: 'resolution'
    }
  ],
  currentStage: 0,
}
```

**Add Article Variants:**
For each character, create 3-4 article variants showing progression. Store in articles with naming convention:
```typescript
{
  cardId: 'TRUTH-042',
  articleVariant: 'pastor_rex_stage_0', // First appearance
  recurringCharacter: 'Pastor Rex',
  // ...
},
{
  cardId: 'TRUTH-042',
  articleVariant: 'pastor_rex_stage_1', // Second appearance
  recurringCharacter: 'Pastor Rex',
  // ...
}
```

**Update Article Selection Logic:**
```typescript
export function selectArticleForCharacter(
  cardId: string,
  characterId: string,
  characterState: Record<string, { appearances: number; currentStage: number }>
): CardArticle | null {
  const character = RECURRING_CHARACTERS[characterId];
  if (!character) return null;

  const state = characterState[characterId] || { appearances: 0, currentStage: 0 };
  
  // Find article matching current stage
  const variant = `${characterId}_stage_${state.currentStage}`;
  const article = CARD_ARTICLE_DATABASE.find(
    a => a.cardId === cardId && a.articleVariant === variant
  );

  return article || null;
}
```

---

## Part 4: Article Tone Variety (Phase 3.D)

### Create New File: `src/engine/newspaper/articleTones.ts`

**Define Tone Categories:**
```typescript
export type ArticleTone = 
  | 'STRAIGHT_NEWS'           // Dry, factual (Government MEDIA)
  | 'TABLOID_SENSATIONAL'     // ALL CAPS, breathless (Truth MEDIA)
  | 'LOCAL_COLOR'             // Small-town newspaper (ZONE captures)
  | 'HARD_HITTING_EXPOSE'     // Investigative (ATTACK cards)
  | 'CLASSIFIED_REDACTED';    // Heavy redaction (Government high-level)

export interface ToneTransform {
  headlineTransform: (headline: string) => string;
  bylineTransform: (byline: string) => string;
  bodyTransform: (body: string) => string;
}

export const TONE_TRANSFORMS: Record<ArticleTone, ToneTransform> = {
  STRAIGHT_NEWS: {
    headlineTransform: (h) => h.charAt(0).toUpperCase() + h.slice(1).toLowerCase(),
    bylineTransform: (b) => b,
    bodyTransform: (b) => b,
  },
  
  TABLOID_SENSATIONAL: {
    headlineTransform: (h) => h.toUpperCase() + '!!!',
    bylineTransform: (b) => b.replace('By', 'BREAKING:'),
    bodyTransform: (b) => b.replace(/\./g, '!'),
  },
  
  LOCAL_COLOR: {
    headlineTransform: (h) => h,
    bylineTransform: (b) => b.replace(/Correspondent/, 'Staff Writer'),
    bodyTransform: (b) => {
      // Add local resident quotes
      return b + '\n\nLocal residents declined to comment.';
    },
  },
  
  HARD_HITTING_EXPOSE: {
    headlineTransform: (h) => h,
    bylineTransform: (b) => 'By Anonymous Insider',
    bodyTransform: (b) => {
      return b.replace(/officials/g, 'sources familiar with the matter')
              .replace(/said/g, 'allegedly stated');
    },
  },
  
  CLASSIFIED_REDACTED: {
    headlineTransform: (h) => h.split(' ').map((w, i) => 
      i % 3 === 0 ? '█████' : w
    ).join(' '),
    bylineTransform: (b) => 'By [REDACTED]',
    bodyTransform: (b) => {
      // Add redaction bars
      const sentences = b.split('. ');
      return sentences.map((s, i) => 
        i % 2 === 0 ? s + '.' : '█████████████'
      ).join(' ');
    },
  },
};

export function applyTone(
  article: CardArticle,
  tone: ArticleTone
): CardArticle {
  const transform = TONE_TRANSFORMS[tone];
  
  return {
    ...article,
    headline: transform.headlineTransform(article.headline),
    byline: transform.bylineTransform(article.byline),
    body: transform.bodyTransform(article.body),
  };
}
```

**Add Tone Field to Articles:**
Update `CardArticle` interface in `articleDatabase.ts`:
```typescript
export interface CardArticle {
  // ... existing fields ...
  preferredTone?: ArticleTone;
}
```

**Integration:**
Update `IssueGenerator.ts` to apply tone based on card type:
```typescript
import { applyTone, type ArticleTone } from './articleTones';

function determineTone(card: GameCard, context: GameContext): ArticleTone {
  if (card.faction === 'government' && card.type === 'MEDIA') {
    return 'STRAIGHT_NEWS';
  }
  if (card.faction === 'truth' && card.type === 'MEDIA') {
    return 'TABLOID_SENSATIONAL';
  }
  if (card.type === 'ZONE') {
    return 'LOCAL_COLOR';
  }
  if (card.type === 'ATTACK') {
    return 'HARD_HITTING_EXPOSE';
  }
  if (card.tags?.includes('classified')) {
    return 'CLASSIFIED_REDACTED';
  }
  return 'STRAIGHT_NEWS';
}

// In article generation:
let article = getArticleForCard(card.id);
const tone = article.preferredTone || determineTone(card, context);
article = applyTone(article, tone);
```

---

## Part 5: Integration & Testing

### Updates Required:

**1. Update Type Definitions:**
Ensure all interfaces are exported from `src/data/cardArticles/articleDatabase.ts`

**2. Refactor Article Loading:**
Currently loads from JSON. Update to support TypeScript modules:
```typescript
// In IssueGenerator.ts or similar
import { CARD_ARTICLE_DATABASE, getArticleForCard } from '@/data/cardArticles/articleDatabase';
```

**3. Add Fallback Logic:**
```typescript
function getArticleOrFallback(cardId: string): CardArticle {
  const article = getArticleForCard(cardId);
  
  if (article) return article;
  
  // Generate basic fallback
  return generateGenericArticle(cardId);
}
```

**4. Testing Checklist:**
- [ ] All 440 cards have articles
- [ ] Dynamic variables substitute correctly
- [ ] Recurring characters progress through story arcs
- [ ] Tone application works for all tone types
- [ ] No broken imports or type errors
- [ ] Articles display correctly in newspaper UI
- [ ] Performance is acceptable (article loading < 100ms)

### Performance Optimization:
```typescript
// Lazy load articles
const articleCache = new Map<string, CardArticle>();

export function getArticleForCard(cardId: string): CardArticle | null {
  if (articleCache.has(cardId)) {
    return articleCache.get(cardId)!;
  }
  
  const article = CARD_ARTICLE_DATABASE.find(a => a.cardId === cardId) || null;
  if (article) {
    articleCache.set(cardId, article);
  }
  
  return article;
}
```

---

## Success Criteria

✅ **All 440 cards have unique, high-quality articles**
✅ **Articles dynamically reference game state via variables**
✅ **10-15 recurring characters with 3-4 story stages each**
✅ **5 distinct article tones working correctly**
✅ **No console errors or type issues**
✅ **Newspaper generation time < 200ms**
✅ **Players laugh when reading articles**

---

## Style Guidelines

**Do:**
- Make it funny but internally consistent
- Reference real geography and pop culture
- Use tabloid/conspiracy theory tropes
- Create memorable character names
- Build narrative threads across articles

**Don't:**
- Make it mean-spirited or political
- Use real people's names (except public figures in parody context)
- Break the game's internal logic
- Create articles that don't match card effects
- Use offensive stereotypes or slurs

---

## Estimated Timeline

- **Articles (440)**: 20-25 hours
- **Variable System**: 2-3 hours
- **Character Arcs**: 3-4 hours
- **Tone System**: 2-3 hours
- **Integration**: 3-4 hours
- **Testing**: 2-3 hours

**Total**: ~32-42 hours

---

## Starting Point

Begin with completing `truthArticles.ts` (TRUTH-011 through TRUTH-200), then move to `governmentArticles.ts`. This establishes quality standards before implementing the more complex systems.

Work in this order:
1. Complete all 440 articles (Parts of implementation can be parallelized)
2. Implement variable substitution (quick win)
3. Implement tone system (builds on articles)
4. Implement character arcs (most complex)
5. Integration and polish

Good luck! This will make the newspaper system truly memorable.
