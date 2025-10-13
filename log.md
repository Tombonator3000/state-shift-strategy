# Article Combiner System - Technical Log

## Overview
The Article Combiner system merges multiple card articles into a single cohesive news story using AI or template-based methods.

## System Architecture

### Core Components

1. **ArticleCombiner.ts** (`src/engine/newspaper/ArticleCombiner.ts`)
   - Main orchestration logic
   - Handles both AI and template combination methods
   - Provides related article detection

2. **Edge Function** (`supabase/functions/combine-articles/index.ts`)
   - Backend API endpoint
   - Calls Lovable AI Gateway (Gemini 2.5 Flash)
   - Constructs prompts and returns structured JSON

3. **React Hook** (`src/hooks/useArticleCombiner.ts`)
   - Manages state for combining operations
   - Provides loading/error handling
   - Shows toast notifications

4. **Demo Component** (`src/components/newspaper/ArticleCombinerDemo.tsx`)
   - UI for testing the system
   - Article selection interface
   - Live preview of results

## Data Flow

### 1. Initialization
```
User selects cardIds → combineArticles(request)
├─ request.cardIds: string[]
├─ request.combineMethod: 'ai' | 'template' (default: 'ai')
└─ request.tone: 'urgent' | 'investigative' | 'exposé' | 'official' | 'dismissive'
```

### 2. Article Fetching
```
combineArticles() 
└─ cardIds.map(id => getArticleForCard(id))
   └─ Filter out null results
      └─ Validation: Need at least 2 valid articles
```

### 3. Method Selection

#### A. AI Method (Primary)
```
combineWithAI(articles, tone)
├─ Determine faction from articles
├─ Prepare payload for edge function
│  ├─ articles: { headline, subhead, body, faction, tags }
│  ├─ faction: 'truth' | 'government' | 'mixed'
│  └─ tone: string
├─ POST to /functions/v1/combine-articles
└─ Response handling
   ├─ Success → Parse JSON → Return CombinedArticle
   └─ Failure → Fall back to template method
```

**Edge Function Flow:**
```
combine-articles/index.ts
├─ Validate: articles.length >= 2
├─ Get LOVABLE_API_KEY from env
├─ Construct system prompt
│  ├─ Set publication: "The Paranoid Times"
│  ├─ Set tone from request
│  └─ Set perspective based on faction
├─ Construct user prompt
│  └─ Include article summaries (first 500 chars of body)
├─ Call Lovable AI Gateway
│  ├─ Model: google/gemini-2.5-flash
│  ├─ Messages: [system, user]
│  └─ response_format: { type: "json_object" }
└─ Return structured response
   ├─ headline: ALL CAPS style
   ├─ subhead: connecting narrative
   ├─ byline: reporter attribution
   └─ body: 3-4 paragraph combined story
```

**AI Prompt Structure:**
```
System Prompt:
- Role: Skilled newspaper editor for "The Paranoid Times"
- Tone: ${tone} (e.g., urgent, investigative)
- Guidelines:
  * ALL CAPS headlines with urgent style
  * Compelling subhead connecting articles
  * Coherent narrative weaving
  * Maintain faction perspective (truth-seeking/official/balanced)
  * Use transition phrases
  * Keep paranoid/conspiratorial tone
  * 3-4 paragraphs maximum

User Prompt:
- Task: Combine N articles
- Input: Article summaries with headline/subhead/body
- Output: JSON with headline, subhead, byline, body
```

#### B. Template Method (Fallback)
```
combineWithTemplate(articles)
├─ Determine faction
├─ Aggregate all tags
├─ Create composite headline
│  ├─ 2 articles: "${art1} AS ${art2}"
│  └─ 3+ articles: "MULTIPLE REVELATIONS SHAKE [FACTION]"
├─ Create subhead
│  └─ "Connected events reveal larger pattern in N developments"
├─ Combine bodies with connective tissue
│  ├─ First article: no prefix
│  ├─ Middle articles: "Meanwhile, " prefix
│  └─ Last article: "Furthermore, " prefix
├─ Derive byline from first article
│  └─ Add "and staff" if multiple sources
└─ Return CombinedArticle
```

### 4. Response Structure
```typescript
interface CombinedArticle {
  id: string;                    // e.g., "combined_ai_1634567890"
  headline: string;              // Combined headline
  subhead: string;               // Connecting narrative
  byline: string;                // Attribution
  body: string;                  // Full merged article
  sourceArticles: string[];      // Original cardIds
  faction: 'truth' | 'government' | 'mixed';
  tags: string[];                // Aggregated tags
  imagePrompt?: string;          // From first article
}
```

## Related Article Detection

### findRelatedArticles() Algorithm
```
Input: baseArticle, allArticles[], maxResults
├─ Filter: Remove baseArticle itself
├─ Score each article:
│  ├─ Tag overlap: +3 points per shared tag
│  ├─ State overlap: +2 points per shared state
│  ├─ Character match: +5 points (same recurring character)
│  └─ Faction match: +1 point
├─ Filter: score > 0
├─ Sort: descending by score
└─ Return: top maxResults articles
```

**Scoring Example:**
```
Base: { tags: ['surveillance', 'tech'], states: ['CA'], faction: 'truth' }
Candidate: { tags: ['surveillance', 'privacy'], states: ['CA', 'NY'], faction: 'truth' }

Score calculation:
- Tag overlap: 1 match ('surveillance') = +3
- State overlap: 1 match ('CA') = +2  
- Character match: none = 0
- Faction match: both 'truth' = +1
Total: 6 points
```

## Faction Determination

```typescript
determineFaction(articles: CardArticle[])
├─ Extract unique factions from articles
├─ Count distinct factions
│  ├─ All same → return that faction
│  └─ Mixed → return 'mixed'
└─ Result used for:
   ├─ AI prompt perspective
   ├─ Default tone selection
   └─ Combined article metadata
```

## Error Handling

### Edge Function Errors
```
429 Rate Limit
└─ Return: "Rate limit exceeded. Please try again later."

402 Payment Required  
└─ Return: "Payment required. Please add credits to your workspace."

500 AI Service Error
└─ Log error → Fall back to template method

Network/Parse Errors
└─ Catch → Log → Fall back to template method
```

### Client-Side Errors
```
useArticleCombiner hook
├─ Try: combineArticles(request)
├─ Catch: 
│  ├─ Set error state
│  ├─ Show destructive toast
│  └─ Return null
└─ Finally: setIsLoading(false)
```

## Performance Characteristics

### AI Method
- **Latency:** 2-5 seconds (depends on Gemini API)
- **Quality:** High - natural narrative flow
- **Cost:** Per-request AI credits
- **Reliability:** Network dependent, has fallback

### Template Method
- **Latency:** <100ms (synchronous)
- **Quality:** Medium - mechanical but functional
- **Cost:** Zero
- **Reliability:** 100% (no external dependencies)

## Integration Points

### 1. Article Database
```
getArticleForCard(cardId: string)
└─ Searches: CARD_ARTICLE_DATABASE
   └─ Returns: CardArticle | null
```

### 2. Lovable AI Gateway
```
POST https://ai.gateway.lovable.dev/v1/chat/completions
Headers:
  - Authorization: Bearer ${LOVABLE_API_KEY}
  - Content-Type: application/json
Body:
  - model: "google/gemini-2.5-flash"
  - messages: [system, user]
  - response_format: { type: "json_object" }
```

### 3. Environment Variables
```
VITE_SUPABASE_URL              # Edge function base URL
VITE_SUPABASE_PUBLISHABLE_KEY  # Client auth token
LOVABLE_API_KEY                # AI Gateway key (backend only)
```

## Usage Patterns

### Basic Combination
```typescript
const result = await combineArticles({
  cardIds: ['card1', 'card2'],
  combineMethod: 'ai',
  tone: 'investigative'
});
```

### With React Hook
```typescript
const { combine, combinedArticle, isLoading } = useArticleCombiner();

await combine({
  cardIds: selectedCards,
  combineMethod: 'ai',
  tone: 'urgent'
});
```

### Finding Related Articles
```typescript
const related = findRelatedArticles(
  baseArticle,
  CARD_ARTICLE_DATABASE,
  3 // max results
);

// Then combine the related articles
const combo = await combineArticles({
  cardIds: [baseArticle.cardId, ...related.map(a => a.cardId)]
});
```

## Tone Effects

### Tone → Prompt Influence
```
'urgent' → Fast-paced, breaking news style
'investigative' → Deep dive, connecting dots style  
'exposé' → Hard-hitting revelations style
'official' → Government statement style
'dismissive' → Downplaying/debunking style
```

### Faction → Default Tone
```
'truth' → 'investigative' (default)
'government' → 'dismissive' (default)
'mixed' → 'urgent' (default)
```

## Testing Scenarios

### Scenario 1: Same Faction Articles
```
Input: 3 truth faction articles about surveillance
Expected: Hard-hitting exposé connecting all surveillance threads
Tone: investigative
```

### Scenario 2: Mixed Faction Conflict
```
Input: 1 truth + 1 government article
Expected: Tense narrative showing opposing viewpoints
Tone: urgent
```

### Scenario 3: AI Failure Fallback
```
Input: Any valid articles + AI service down
Expected: Template method produces mechanical but functional combination
```

### Scenario 4: Related Article Chain
```
Input: Base article with high tag/state overlap to others
Process: findRelatedArticles → combine top matches
Expected: Thematic story cluster
```

## Known Limitations

1. **AI Quota:** Limited by Lovable AI credits
2. **Context Window:** Article bodies truncated to 500 chars in prompt
3. **Tone Consistency:** AI interpretation of tone varies
4. **Template Quality:** Fallback method lacks narrative sophistication
5. **No Multi-Language:** Currently English-only prompts

## Future Enhancements

1. **Streaming Responses:** Real-time article generation
2. **Custom Prompt Templates:** Per-faction customization
3. **Image Generation:** Combine article imagePrompts
4. **Semantic Clustering:** Use embeddings for better related article detection
5. **History Tracking:** Save/load combined article history
6. **A/B Testing:** Compare AI vs template quality metrics

## Debugging Tips

### Check Article Fetch
```typescript
console.log('Fetching articles for:', cardIds);
const articles = cardIds.map(id => getArticleForCard(id));
console.log('Found articles:', articles.filter(a => a !== null).length);
```

### Monitor AI Calls
```typescript
// In edge function:
console.log('AI request:', { articleCount: articles.length, faction, tone });
console.log('AI response status:', response.status);
console.log('AI response content:', content);
```

### Test Related Article Scoring
```typescript
const scores = allArticles.map(a => ({
  id: a.cardId,
  score: calculateScore(baseArticle, a)
}));
console.table(scores.sort((a, b) => b.score - a.score));
```

## Conclusion

The Article Combiner system provides a flexible, AI-powered way to merge multiple card articles into cohesive narratives while maintaining the paranoid/conspiratorial tone of The Paranoid Times. It balances quality (AI method) with reliability (template fallback) and includes intelligent related article detection for thematic clustering.
