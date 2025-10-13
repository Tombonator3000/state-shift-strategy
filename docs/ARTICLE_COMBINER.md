# Article Combiner System

## Overview

The Article Combiner System allows you to merge multiple card articles into a single, cohesive news story. This system uses AI (Lovable AI with Gemini) to intelligently weave together different articles while maintaining the paranoid/conspiratorial tone of The Paranoid Times.

## Key Features

- **AI-Powered Combination**: Uses Gemini 2.5 Flash to create natural, flowing combined narratives
- **Template-Based Fallback**: If AI is unavailable, falls back to template-based combination
- **Flexible Tone Control**: Support for multiple tones (urgent, investigative, exposé, official, dismissive)
- **Related Article Detection**: Automatically find related articles based on tags, states, and characters
- **Multi-Faction Support**: Handle truth, government, or mixed faction articles

## Architecture

### Core Components

1. **ArticleCombiner.ts** (`src/engine/newspaper/ArticleCombiner.ts`)
   - Main logic for combining articles
   - Functions: `combineArticles()`, `findRelatedArticles()`
   - Handles both AI and template methods

2. **combine-articles Edge Function** (`supabase/functions/combine-articles/index.ts`)
   - Backend API that calls Lovable AI
   - Constructs prompts for article combination
   - Returns structured JSON response

3. **useArticleCombiner Hook** (`src/hooks/useArticleCombiner.ts`)
   - React hook for easy integration
   - Handles loading states and errors
   - Provides toast notifications

4. **ArticleCombinerDemo Component** (`src/components/newspaper/ArticleCombinerDemo.tsx`)
   - UI demonstration of the system
   - Article selection interface
   - Live preview of combined results

## Usage

### Basic Usage

```typescript
import { combineArticles } from '@/engine/newspaper/ArticleCombiner';

const result = await combineArticles({
  cardIds: ['attack_whistleblower', 'media_conspiracy_podcast'],
  combineMethod: 'ai',
  tone: 'investigative'
});

console.log(result.headline);
console.log(result.body);
```

### Using the React Hook

```typescript
import { useArticleCombiner } from '@/hooks/useArticleCombiner';

function MyComponent() {
  const { combine, combinedArticle, isLoading } = useArticleCombiner();

  const handleCombine = async () => {
    await combine({
      cardIds: ['card1', 'card2', 'card3'],
      combineMethod: 'ai',
      tone: 'urgent'
    });
  };

  return (
    <div>
      <button onClick={handleCombine} disabled={isLoading}>
        Combine Articles
      </button>
      {combinedArticle && (
        <div>
          <h2>{combinedArticle.headline}</h2>
          <p>{combinedArticle.body}</p>
        </div>
      )}
    </div>
  );
}
```

### Finding Related Articles

```typescript
import { findRelatedArticles } from '@/engine/newspaper/ArticleCombiner';
import { CARD_ARTICLE_DATABASE } from '@/data/cardArticles/articleDatabase';

const baseArticle = CARD_ARTICLE_DATABASE[0];
const related = findRelatedArticles(baseArticle, CARD_ARTICLE_DATABASE, 3);

console.log(`Found ${related.length} related articles`);
```

## API Reference

### `combineArticles(request: ArticleCombinationRequest): Promise<CombinedArticle | null>`

Combines multiple card articles into one cohesive story.

**Parameters:**
- `request.cardIds` (string[]): Array of card IDs to combine (minimum 2)
- `request.combineMethod` ('ai' | 'template'): Combination method (default: 'ai')
- `request.tone` (string): Desired tone (default: based on faction)

**Returns:** CombinedArticle or null if combination fails

### `findRelatedArticles(baseArticle, allArticles, maxResults): CardArticle[]`

Finds articles related to a base article based on tags, states, and characters.

**Scoring System:**
- Tag overlap: +3 points per shared tag
- State overlap: +2 points per shared state
- Character match: +5 points if same recurring character
- Same faction: +1 point

## Demo Page

Access the demo at `/dev/article-combiner` to:
- Select multiple articles to combine
- Choose between AI and template methods
- Set custom tone
- See real-time combined results

## Configuration

### Required Environment Variables

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key
- `LOVABLE_API_KEY`: Automatically configured in Lovable Cloud

### Edge Function Configuration

The `combine-articles` function needs to be deployed to Supabase. It uses:
- Model: `google/gemini-2.5-flash` (free during promotional period)
- Response format: JSON object
- Error handling: Includes 429 rate limit and 402 payment required

## Error Handling

The system includes comprehensive error handling:

1. **Insufficient Articles**: Returns null if fewer than 2 articles provided
2. **AI Failures**: Falls back to template-based combination
3. **Rate Limits (429)**: Shows user-friendly message
4. **Payment Required (402)**: Alerts user to add credits
5. **Network Errors**: Catches and logs all network issues

## Future Enhancements

Potential improvements:
- Support for streaming AI responses
- Custom prompt templates per faction
- Image generation for combined articles
- Article clustering based on semantic similarity
- Multi-language support
- Save/load combined article history

## Examples

### Example 1: Combining Truth Faction Articles

```typescript
const truthCombo = await combineArticles({
  cardIds: [
    'attack_whistleblower',
    'attack_investigative_journalist',
    'media_conspiracy_podcast'
  ],
  combineMethod: 'ai',
  tone: 'exposé'
});

// Result: A hard-hitting exposé connecting whistleblower leaks,
// investigative journalism, and viral podcast coverage
```

### Example 2: Mixed Faction Crisis

```typescript
const mixedCombo = await combineArticles({
  cardIds: [
    'zone_silicon_valley',    // Truth faction
    'media_social_media_purge' // Government faction
  ],
  combineMethod: 'ai',
  tone: 'urgent'
});

// Result: An urgent story showing the tension between
// tech surveillance revelations and platform censorship
```

## Testing

To test the system:

1. Navigate to `/dev/article-combiner`
2. Select 2+ articles from the list
3. Choose AI or template method
4. Select desired tone
5. Click "Combine Articles"
6. Review the generated story

## Dependencies

- Lovable AI Gateway (Gemini 2.5 Flash)
- Supabase Edge Functions
- React Query for API calls
- Shadcn UI components

## License

Part of The Paranoid Times project.
