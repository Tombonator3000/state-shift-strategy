# Integration Guide for New Features

This guide explains how to integrate the newly implemented features (Phases 2-5) into the existing game.

## Phase 2-4: Gameplay Mechanics & Content

### Two-Card Combos

**Location:** `src/game/twoCardCombos.ts`

**Integration Points:**
1. Import combo definitions in your card play handler
2. Check for matching combos after each card play
3. Apply combo rewards and display effects

```typescript
import { TWO_CARD_COMBOS } from '@/game/twoCardCombos';

// After playing a card, check for combos
function checkForTwoCardCombo(recentlyPlayedCards: GameCard[]) {
  for (const combo of TWO_CARD_COMBOS) {
    if (combo.trigger.kind !== 'hybrid') continue;
    
    // Check if combo conditions are met
    // Apply combo.reward if matched
    // Display combo.fxText as visual feedback
  }
}
```

### State-Specific Bonuses

**Location:** `src/game/stateBonuses.ts`

**Integration Points:**
1. Call `checkStateBonuses()` when targeting a state
2. Display bonus indicator on card UI
3. Apply bonus effects to card resolution

```typescript
import { checkStateBonuses } from '@/game/stateBonuses';

// When playing a card on a state
const bonus = checkStateBonuses(
  card.name,
  card.tags || [],
  card.id,
  targetStateId
);

if (bonus) {
  // Apply bonus.bonus effects
  // Show bonus.label in UI
}
```

### Recurring Characters

**Location:** `src/game/recurringCharacters.ts`

**Integration Points:**
1. Track character appearances in game state
2. Apply cumulative bonuses
3. Display character progression

```typescript
import { trackCharacterAppearance, getCharacterState } from '@/game/recurringCharacters';

// When article is displayed or card is played
const article = getArticleForCard(cardId);
if (article?.recurringCharacter) {
  trackCharacterAppearance(article.recurringCharacter);
  const state = getCharacterState(article.recurringCharacter);
  // Apply state.cumulativeBonus if applicable
}
```

### New Card Types (HYBRID/TRAP/PERSISTENT)

**Location:** `src/game/newCardTypes.ts`

**Usage:**
```typescript
import { calculateHybridCost } from '@/game/newCardTypes';

// For HYBRID cards
const { cost, appliedConditions } = calculateHybridCost(
  hybridConfig,
  {
    truth: currentTruth,
    statesControlled: playerStates,
    ip: playerIP,
    turn: currentTurn,
  }
);
```

## Phase 5: UI/UX Enhancements

### Article Preview Overlay

**Component:** `ArticlePreviewOverlay`  
**Hook:** `useCardPreview`

**Integration:**
```typescript
import { ArticlePreviewOverlay } from '@/components/newspaper/ArticlePreviewOverlay';
import { useCardPreview } from '@/hooks/useCardPreview';

function CardComponent({ card }: { card: GameCard }) {
  const { previewState, openPreview, closePreview } = useCardPreview();
  
  return (
    <>
      <div
        onMouseEnter={() => openPreview(card.id, card.name)}
        onClick={() => openPreview(card.id, card.name)}
      >
        {/* Card UI */}
      </div>
      
      <ArticlePreviewOverlay
        cardId={previewState.cardId}
        cardName={previewState.cardName}
        onClose={closePreview}
      />
    </>
  );
}
```

### Breaking News Ticker

**Component:** `BreakingNewsTicker`  
**Helpers:** `newsEventHelpers`

**Integration:**
```typescript
import { BreakingNewsTicker } from '@/components/newspaper/BreakingNewsTicker';
import { dispatchBreakingNews, newsForCardPlay } from '@/lib/newsEventHelpers';

// In your game layout
function GameLayout() {
  return (
    <>
      <BreakingNewsTicker />
      {/* Rest of game UI */}
    </>
  );
}

// When card is played
function onCardPlayed(card: GameCard, faction: 'truth' | 'government') {
  const newsText = newsForCardPlay(card.name, faction);
  dispatchBreakingNews(newsText, 'normal');
}

// When state is captured
function onStateCapture(stateName: string, captor: 'player' | 'ai') {
  const newsText = newsForStateCapture(stateName, captor);
  dispatchBreakingNews(newsText, 'urgent');
}
```

### Strategy Helper

**Component:** `StrategyHelper`

**Integration:**
```typescript
import { StrategyHelper } from '@/components/gameplay/StrategyHelper';

function GameplayArea({ hand, targetStateId }: Props) {
  return (
    <div>
      <StrategyHelper
        hand={hand}
        targetStateId={targetStateId}
        className="mb-4"
      />
      {/* Rest of gameplay UI */}
    </div>
  );
}
```

### Enhanced Final Edition

**Component:** `EnhancedFinalEdition`

**Integration:**
```typescript
import { EnhancedFinalEdition } from '@/components/newspaper/EnhancedFinalEdition';

function EndGameScreen({ gameState }: Props) {
  // Determine MVP and runner-up cards
  const mvpCard = determineMVPCard(gameState);
  const runnerUpCard = determineRunnerUpCard(gameState);
  
  // Collect Extra Extra combos from game history
  const extraExtraCombos = gameState.comboHistory.map(combo => ({
    headline: combo.headline,
    cards: combo.cardsInvolved,
  }));
  
  return (
    <EnhancedFinalEdition
      winner={gameState.winner}
      mvpCard={mvpCard}
      runnerUpCard={runnerUpCard}
      extraExtraCombos={extraExtraCombos}
      stateResults={gameState.states}
      finalTruth={gameState.truth}
      finalPlayerIP={gameState.playerIP}
      finalAiIP={gameState.aiIP}
    />
  );
}
```

## News Event Templates

The `newsEventHelpers` library provides pre-built news text generators:

```typescript
import {
  newsForCardPlay,
  newsForStateCapture,
  newsForTruthChange,
  newsForCombo,
  newsForTurnEnd,
} from '@/lib/newsEventHelpers';

// Card play
dispatchBreakingNews(newsForCardPlay('Bigfoot Photo', 'truth'));

// State capture
dispatchBreakingNews(newsForStateCapture('Nevada', 'player'), 'urgent');

// Truth change
const newsText = newsForTruthChange(5, 65);
if (newsText) dispatchBreakingNews(newsText, 'update');

// Combo
dispatchBreakingNews(newsForCombo('Honeymoon on Mars'), 'urgent');

// Turn end
dispatchBreakingNews(newsForTurnEnd(3, 58), 'normal');
```

## Styling Considerations

All new components use the design system tokens from `index.css` and `tailwind.config.ts`:

- Semantic colors (primary, secondary, destructive, muted)
- Typography variants
- Border styles
- Spacing system

Make sure to maintain consistency with existing game UI when integrating.

## Testing Checklist

- [ ] Card hover triggers article preview
- [ ] News ticker appears on card plays and state captures
- [ ] Strategy helper updates with hand changes
- [ ] Two-card combos trigger and apply rewards
- [ ] State bonuses apply correctly
- [ ] Recurring characters track across game
- [ ] Final edition renders all sections
- [ ] News events dispatch on major game moments
- [ ] All components respect design system tokens

## Performance Notes

- Article previews lazy-load content
- News ticker auto-dismisses after 15 seconds
- Strategy helper memoizes calculations
- Final edition uses virtualized scrolling for long content

## Future Enhancements

- Wire article database to remaining 45+ cards
- Add character progression visualizations
- Implement state mutator system
- Add persistent effect tracking UI
- Create combo meter indicator
- Add front page preview button
