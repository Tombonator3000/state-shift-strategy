# 📰 Shadow Government: Tabloid Newspaper System

## Overview

The tabloid newspaper system generates Weekly World News-style newspapers that appear after each round, featuring headlines based on cards played during the game. The system uses JSON-driven content generation to create satirical, conspiracy-themed news articles.

## Key Features

- **Dynamic Headlines**: Generated from templates based on card type and faction
- **Rotating Mastheads**: 50+ newspaper names that rotate each round
- **Fake Advertisements**: 100+ parody ads for conspiracy-themed products
- **Visual Style**: Classic tabloid layout with black/white design and red accents
- **5% Glitch Mode**: Occasional "corrupted" editions with altered mastheads
- **Mobile Responsive**: Optimized for all screen sizes

## System Architecture

```
src/systems/newspaper.ts          # Core newspaper generation logic
src/components/game/NewspaperOverlay.tsx  # UI component for display
src/hooks/useNewspaper.ts         # React hook for newspaper state
public/data/newspaper.config.json # Content templates and data
```

## Content Generation

### Headlines
Headlines are generated using templates with placeholders:
- `{CARD}` - Card name in uppercase
- `{EFFECT}` - Summarized card effects
- `{PLACE}` - Random location (Area 51, Roswell, etc.)
- `{TARGET}` - Target description based on card scope
- `{VALUE}` - Numeric values from card effects

### Example Templates
```json
{
  "type": "MEDIA",
  "faction": "Truth", 
  "templates": [
    "FIRST PHOTOS OF {PLACE}! {CARD} STUNS EXPERTS",
    "ALIEN TIP LINE CONFIRMS: {CARD}",
    "ELVIS BACKS REPORT: {CARD}"
  ]
}
```

### Fake Advertisements
Over 100 parody ads including:
- "Buy 2 Tinfoil Hats — Get 3rd FREE!"
- "Alien Probiotic Gummies - Gut flora from Zeta Reticuli"
- "Florida Man Legal Services - No case too weird"

## Integration Flow

1. **Card Play**: When cards are played, `newspaper.queueArticleFromCard()` is called
2. **Round End**: When AI turn ends, newspaper phase begins
3. **Generation**: `newspaper.flushForRound()` creates complete issue  
4. **Display**: `NewspaperOverlay` renders the tabloid-style interface
5. **Cleanup**: Articles are cleared and round increments

## Usage

### Basic Integration

```typescript
import { newspaper } from '@/systems/newspaper';
import { useNewspaper } from '@/hooks/useNewspaper';

// Queue article when card is played
const context = {
  round: gameState.round,
  truth: gameState.truth,
  ip: { human: gameState.ip, ai: gameState.aiIP },
  states: gameState.states
};
newspaper.queueArticleFromCard(card, context);

// Show newspaper at round end
const { showNewspaperForRound } = useNewspaper();
showNewspaperForRound(gameState.round);
```

### Component Usage

```tsx
import { NewspaperOverlay } from '@/components/game/NewspaperOverlay';

{isNewspaperVisible && currentIssue && (
  <NewspaperOverlay 
    issue={currentIssue} 
    onClose={closeNewspaper}
  />
)}
```

## Configuration

The system loads content from `public/data/newspaper.config.json`:

```json
{
  "mastheads": [
    {"name": "Weekly World Whoa!"},
    {"name": "The Paranoid Times"}
  ],
  "ads": [
    {"title": "Tinfoil Hats", "body": "Mind protection guaranteed"}
  ],
  "headlineTemplates": [...],
  "sidebars": ["Fun conspiracy facts"],
  "tickers": ["Breaking news items"],
  "editorialStamps": ["EXCLUSIVE!", "TOP SECRET!"]
}
```

## Visual Design

- **Typography**: Impact-style headlines, serif body text
- **Layout**: Classic tabloid newspaper grid
- **Colors**: Black text on white, red accents for stamps/arrows
- **Effects**: Halftone filter on images, glitch animations
- **Accessibility**: Keyboard navigation (ESC/ENTER/SPACE to close)

## Testing

Run the newspaper system test:

```typescript
import { testNewspaperSystem } from '@/test/newspaperSystemTest';
await testNewspaperSystem();
```

## Performance

- Config loaded once at startup
- Articles limited to 4 per round (overflow goes to ticker)
- Newspaper rendered only when needed
- Lightweight JSON-based content system

## Future Enhancements

- **Share Headlines**: Copy newspaper headlines to clipboard
- **Archive System**: View last 3 newspaper issues
- **Easter Eggs**: Special headlines for rare card combinations
- **Localization**: Support for multiple languages

## Troubleshooting

**Config not loading**: Check `public/data/newspaper.config.json` exists
**No headlines**: Verify card types match template types
**Missing images**: Ensure classified placeholder exists at `/img/classified-placeholder.png`
**Layout issues**: Check responsive CSS in `NewspaperOverlay.tsx`