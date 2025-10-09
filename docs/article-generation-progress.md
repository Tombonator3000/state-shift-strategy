# Card Article Generation Progress

## Current Status: Infrastructure Complete + Sample Articles

### Completed ✅
1. **Truth Articles**: 12 complete articles (TRUTH-001 through TRUTH-010, TRUTH-018, TRUTH-050)
2. **Government Articles**: 5 complete articles (GOV-001 through GOV-005)
3. **Infrastructure Files**:
   - `src/data/cardArticles/truthArticles.ts` - Truth faction article database
   - `src/data/cardArticles/governmentArticles.ts` - Government faction article database
   - `src/data/cardArticles/allArticles.ts` - Combined article aggregator with query functions
   - Updated `src/data/cardArticles/articleDatabase.ts` to import from centralized system

### Article Structure Template

Each article includes:
```typescript
{
  cardId: string;              // e.g., "TRUTH-001" or "GOV-001"
  faction: 'truth' | 'government';
  headline: string;            // Attention-grabbing main headline
  subhead: string;             // Secondary headline with additional context
  byline: string;              // Author attribution 
  body: string;                // 3-4 paragraphs of narrative content
  imagePrompt: string;         // Description for AI image generation
  tags: string[];              // Keyword tags for categorization
  statesMentioned: string[] | null;  // US states referenced in article
  recurringCharacter: string | null; // Named character for story continuity
  followUpHooks: string[];     // 2-3 teaser lines for future narratives
}
```

### Faction-Specific Tone Guidelines

#### Truth Faction
- Conspiratorial yet humorous
- Exposes "hidden truths" with tabloid enthusiasm
- Characters: Elvis, Bat Boy, Pastor Rex, cryptids, whistleblowers
- Keywords: EXPOSED, LEAKED, SPOTTED, CONFIRMS, REVEALS
- Style: Exclamatory, urgent, "citizen journalism"

#### Government Faction  
- Bureaucratic euphemisms and understatement
- Dismisses anomalies with "official explanations"
- Characters: Deputy Directors, Classification Officers, Study Coordinators
- Keywords: ROUTINE, CLARIFIES, CONFIRMS (opposite meaning), STUDY CONCLUDES
- Style: Passive voice, jargon-heavy, "nothing to see here"

### Remaining Work

**Truth Faction**: 188 articles needed (TRUTH-011 through TRUTH-200)
**Government Faction**: 195 articles needed (GOV-006 through GOV-200)

### Recommended Generation Approach

1. **Batch Creation**: Generate articles in batches of 20-30 by card type
   - ATTACK cards: Dramatic confrontations, exposés, disruptions
   - MEDIA cards: Viral phenomena, broadcast incidents, information warfare
   - ZONE cards: Geographic anomalies, territorial claims, local conspiracies

2. **Character Arc Integration**: Distribute recurring characters across multiple articles
   - Elvis: 8-10 appearances
   - Bat Boy: 8-10 appearances  
   - Pastor Rex: 6-8 appearances
   - Deputy Director Walsh: 10-12 appearances (Government)
   - Dr. Raymond Foster: 8-10 appearances (Government)

3. **Geographic Distribution**: Ensure broad state coverage
   - Major conspiracy hubs: Nevada, New Mexico, Area 51 corridor
   - Population centers for relatability
   - Rural areas for isolated phenomena
   - Government centers (DC, Virginia, Maryland) for institutional stories

4. **Tag Diversity**: Maintain varied keyword coverage
   - Truth: ufo, cryptid, conspiracy, viral, classified, exposure, witness
   - Government: denial, containment, study, routine, clarification, security

### Sample Article Quality Metrics

Current sample articles demonstrate:
- ✅ 300-500 word body text per article
- ✅ Distinct voice for each faction
- ✅ Narrative hooks and follow-up potential
- ✅ Mix of humor and in-universe consistency
- ✅ Geographic and character diversity
- ✅ Detailed image generation prompts

### Integration Points

Articles are automatically available to:
- `src/engine/news/mainStory.ts` - Headline generation system
- `src/engine/newspaper/StoryComposer.ts` - Individual card stories  
- `src/components/game/TabloidNewspaperV2.tsx` - Visual newspaper rendering
- `src/ui/newspaper/FrontPage.tsx` - Final edition layout

### Next Steps

To complete the full 400-article database:
1. Use template to generate remaining Truth articles in themed batches
2. Generate Government articles using bureaucratic tone framework
3. Distribute recurring characters for narrative continuity
4. Ensure tag and geographic diversity
5. Test integration with newspaper generation systems
6. Review for tonal consistency and humor quality
