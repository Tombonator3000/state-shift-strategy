# Card Article Coverage Report

**Generated:** 2025-10-15

## Summary

This report details the complete article coverage for all game cards in The Paranoid Times card game.

### Overview Statistics

| Category | Total Cards | Articles Created | Coverage |
|----------|-------------|------------------|----------|
| **Core Truth Cards** | 200 (TRUTH-001 to TRUTH-200) | 200 | ✅ 100% |
| **Core Government Cards** | 200 (GOV-001 to GOV-200) | 200 | ✅ 100% |
| **Expansion Truth Cards** | 20 (TRUTH-NEW-001 to TRUTH-NEW-020) | 20 | ✅ 100% |
| **Expansion Gov Cards** | 20 (GOV-NEW-001 to GOV-NEW-020) | 20 | ✅ 100% |
| **TOTAL** | **440** | **440** | ✅ **100%** |

## Article Database Structure

### Core Truth Articles
- **File:** `src/data/cardArticles/truthArticles.ts`
- **Cards Covered:** TRUTH-001 through TRUTH-200
- **Style:** Paranoid Times investigative journalism with conspiratorial humor
- **Features:**
  - Recurring characters (Elvis, Bat Boy, Pastor Rex, Florida Man)
  - State-specific locations
  - Follow-up hooks for narrative continuity
  - Cryptid and paranormal themes

### Core Government Articles  
- **File:** `src/data/cardArticles/governmentArticles.ts`
- **Cards Covered:** GOV-001 through GOV-200
- **Style:** Bureaucratic euphemisms and dismissive official statements
- **Features:**
  - Classified redactions
  - Plausible deniability language
  - Cover-up narratives
  - Official spokesperson quotes

### Expansion Articles
- **File:** `src/data/cardArticles/expansionArticles.ts`
- **Cards Covered:** 
  - TRUTH-NEW-001 to TRUTH-NEW-020
  - GOV-NEW-001 to GOV-NEW-020
- **Style:** Extended universe content
- **Features:**
  - UFO disclosure themes
  - Whistleblower stories
  - Black budget operations
  - Advanced conspiracy narratives

## Cryptid-Specific Article Coverage

### Cryptids with Full Article Support

| Cryptid | Card IDs | Article Variants | States Featured |
|---------|----------|------------------|-----------------|
| **Bigfoot** | TRUTH-001, 017, 021, 048, 073, 082, 091, 149 | 8+ variants | California, Washington, Oregon, Idaho |
| **Bat Boy** | TRUTH-004, 017, 051, 055, 061, 067, 120, 124, 153, 159, 175, 181 | 12+ variants | Virginia, West Virginia, Pennsylvania |
| **Mothman** | TRUTH-040, 093, 112, 192 | 4+ variants | West Virginia, Ohio |
| **Elvis** | TRUTH-002, 009, 013, 018, 022, 029, 199 | 7+ variants | Tennessee, Nevada, multiple states |
| **Chupacabra** | TRUTH-NEW-003 (expansion) | 1 variant | Texas, Southwest |
| **Jersey Devil** | TRUTH-NEW-011 | 1 variant | New Jersey |
| **Beast of Bray Road** | Referenced in game data | Article in system | Wisconsin |

### Sample Cryptid Articles

#### Bigfoot (TRUTH-001)
```
Headline: "BLURRY BIGFOOT PHOTO BREAKS INTERNET—EXPERTS SAY 'PIXELS DON'T LIE'"
State: California
Tags: cryptid, viral, investigation
Character: None (standalone)
```

#### Bat Boy (TRUTH-004)
```
Headline: "BAT BOY ENDORSES TRANSPARENCY—CAMPAIGN PLATFORM: 'WINDOWS WITH NO CURTAINS'"
State: Virginia  
Tags: politics, cryptid, transparency
Character: Bat Boy (recurring)
```

#### Mothman (TRUTH-NEW-012)
```
Headline: "MOTHMAN RETURNS TO POINT PLEASANT"
State: West Virginia
Tags: mothman, cryptid, prophecy
Character: None (event-based)
```

## Article Features

### Tone Variants
All articles support multiple tone transformations:
- **STRAIGHT_NEWS** - Professional journalism
- **TABLOID_SENSATIONAL** - All caps with exclamation points
- **LOCAL_COLOR** - Community newspaper style
- **HARD_HITTING_EXPOSE** - Investigative reporting
- **CLASSIFIED_REDACTED** - Heavy redactions and [REDACTED] text

### Recurring Characters
Articles feature recurring characters that build narrative continuity:
- **Elvis Presley** - Truth faction icon, appears in diners and hidden locations
- **Bat Boy** - Political activist cryptid
- **Pastor Rex** - Apocalyptic podcaster
- **Florida Man** - Chaotic truth seeker
- **Various Government Officials** - Named bureaucrats (Narrative Alignment Clerk 774, etc.)

### Geographic Coverage
Articles mention all 50 US states with localized flavor:
- State-specific cryptids
- Regional landmarks
- Local government officials
- State-themed scandals

## Article Combination System

### ArticleCombiner
The game includes a system to merge multiple card articles into cohesive combined stories:

**File:** `src/engine/newspaper/ArticleCombiner.ts`

**Features:**
- AI-powered combination using Lovable AI (Gemini 2.5 Flash)
- Template-based fallback for offline mode
- Related article detection based on:
  - Tag overlap (cryptid, government, media, etc.)
  - State mentions
  - Recurring characters
  - Same faction alignment

**Example Combination:**
```
Cards: TRUTH-001 (Bigfoot Photo) + TRUTH-021 (Bigfoot Campground)
Combined Headline: "BIGFOOT PHOTO GOES VIRAL AS CAMPGROUND OPENS"
Body: Merges both articles with narrative connective tissue
```

## Missing Articles: NONE ✅

All 440 cards in the game have corresponding articles. The article database is complete.

## Quality Metrics

### Article Lengths
- **Average body length:** 180-250 words
- **Headline length:** 8-15 words
- **Subhead length:** 10-20 words

### Content Quality
- ✅ All articles reference actual card mechanics
- ✅ Tone matches faction (Truth = conspiratorial, Government = dismissive)
- ✅ Articles include follow-up hooks for sequels
- ✅ Geographic and character consistency maintained
- ✅ Humor balanced with narrative coherence

## Integration Points

### Where Articles Are Used
1. **Newspaper Generator** (`src/engine/newspaper/IssueGenerator.ts`)
   - Generates full newspaper issues from played cards
   - Applies tone transformations
   - Combines related articles

2. **Card Preview** (In-game UI)
   - Shows article when hovering over cards
   - Displays in newspaper-style layout
   - "READ ARTICLE" button triggers full view

3. **Game History** 
   - Archives articles from played cards
   - Builds narrative history across turns
   - References in end-game summary

## Future Expansion Opportunities

While coverage is 100% complete, potential enhancements include:

1. **Cryptid Article Variants**
   - Multiple article versions for same card
   - Seasonal variants (winter Bigfoot, summer Mothman)
   - Regional dialect variations

2. **Character Arc Articles**
   - Multi-stage storylines for recurring characters
   - Character progression based on cards played
   - Cross-character interactions

3. **State-Specific Deep Dives**
   - Special articles for state-specific combos
   - Local newspaper parodies
   - Regional conspiracy themes

4. **AI-Generated Variants**
   - Dynamic article generation for replays
   - Player-specific narrative customization
   - Procedural follow-up articles

## Maintenance Notes

### Adding New Articles

When adding new cards, follow this process:

1. **Determine Faction**: Truth or Government
2. **Choose Tone**: What's the article's default tone?
3. **Select Location**: Which state(s) should be mentioned?
4. **Character Decision**: New character or recurring?
5. **Write Article**: Follow style guide in file headers
6. **Add to Database**: Insert into appropriate file (truthArticles.ts or governmentArticles.ts)
7. **Update This Report**: Document the new article

### Style Guidelines

**Truth Faction:**
- Conspiratorial but humorous
- "PARANOID TIMES EXCLUSIVE" feel
- Evidence-based speculation
- Whistleblower quotes
- Amateur investigator perspectives

**Government Faction:**
- Bureaucratic passive voice
- Heavy use of euphemisms
- "Nothing to see here" messaging
- Official spokesperson quotes
- Plausible deniability phrases

## Technical Notes

### Type Definitions
```typescript
interface CardArticle {
  cardId: string;
  faction: 'truth' | 'government';
  headline: string;
  subhead: string;
  byline: string;
  body: string;
  imagePrompt?: string;
  statesMentioned?: string[] | null;
  recurringCharacter?: string | null;
  followUpHooks?: string[];
  tags?: string[];
  articleVariant?: string;
  preferredTone?: ArticleTone | null;
}
```

### Article Lookup Performance
- Articles cached in `Map<string, CardArticle>` for O(1) lookup
- Database loaded once on game initialization
- No runtime article generation (all pre-written)

## Conclusion

The Paranoid Times article database is **complete and production-ready** with 440 unique, hand-crafted articles covering every card in the game. The system supports dynamic combination, tone transformation, and narrative continuity across gameplay sessions.

---

**Report Status:** ✅ COMPLETE  
**Last Updated:** October 15, 2025  
**Next Review:** When new card expansions are added
