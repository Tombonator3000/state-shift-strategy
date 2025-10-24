# Procedural Article Generation System

## Overview

The article system now generates funny, Weekly World News-style content dynamically based on card plays and game state. Articles are no longer static—they're procedurally generated with variations every time.

## How It Works

### 1. **Procedural Generation** (`proceduralArticleGenerator.ts`)
- Creates tabloid-style articles from scratch when no static article exists
- Uses card data, game state, and context to generate varied content
- Follows Weekly World News style: sensational, specific details, deadpan delivery

### 2. **Article Enhancement** (`articleEnhancer.ts`)
- Takes existing static articles and makes them funnier
- Injects specific numbers (47, 23, 666) instead of vague terms
- Adds tabloid flourishes and witness reactions
- Includes truth meter references

### 3. **Integration** (`IssueGenerator.ts`)
- Static articles used when available (for recurring characters)
- All articles enhanced with humor injections
- Falls back to procedural generation for missing articles
- Game state influences article content dynamically

## Article Components

### Headlines
**Truth faction:**
- "EXPOSES AREA 51—LEAKED FILES GO VIRAL"
- "BIGFOOT CONNECTION REVEALED—OFFICIALS PANIC"

**Government faction:**
- "CLASSIFIED AS 'ROUTINE TRAINING EXERCISE'—NOTHING TO SEE"
- "DESIGNATED STANDARD WEATHER BALLOON—CITIZENS REMINDED TO REMAIN CALM"

### Subheads
Include specific details:
- "Eyewitness reports 'exactly what conspiracy theorists said'—at 3:47 AM"
- "Officials assure public this is completely normal routine administrative adjustment"

### Body Text
**Truth articles:**
- Expert quotes ("Dr. Helena Frost, who was recently asked to leave three different conferences")
- Specific details (time, place, witnesses)
- Truth meter references
- Viral spread documentation
- Government scrambling

**Government articles:**
- Bureaucratic doublespeak
- Circular logic ("Eyewitnesses experience stress. Stress causes misperception. Misperception is itself a form of routine training exercise.")
- Voluntary mandatory workshops
- 847-page reports with 347 pages explaining why questions shouldn't be asked

## Tabloid Style Rules

### Specific Numbers
Use oddly specific numbers:
- ✅ "47 million views"
- ✅ "340% spike"
- ✅ "12,000 signatures"
- ❌ "many views"
- ❌ "a lot of people"

### Specific Times
- "exactly 3:47 AM"
- "17 minutes before dawn"
- "during the station identification"

### Deadpan Absurdity
Treat ridiculous things as completely normal:
- "The 37-year-old cryptid-American"
- "Attendance is optional but strongly recommended"
- "Gift shop T-shirts spontaneously combust in warehouse, fire marshal 'not suspicious'"

### Character Details
Give everyone weird, specific credentials:
- "Dr. Helena Frost of the Independent Image Analysis Institute"
- "Agent X (Retired)"
- "Classification Czar Donald Pierce"

## Tag-driven Themes

Procedural pieces now scan the triggering card's tags (normalized in `proceduralArticleGenerator.ts`) and, when a recognized theme surfaces, swap into bespoke word banks:

- **Cryptid tags** (`#cryptid`, `cryptid sighting`, etc.) lean into field journals and tranquilizer denials with verbs like "TRACKS" and euphemisms such as "authorized wildlife mitigation protocol".
- **Broadcast tags** (`#broadcast`, `shortwave-signal`) pull from pirate radio lore, invoking numbers stations, uplink hijacks, and maintenance doublespeak like "routine broadcast quality assurance".
- **Operation tags** (`#operation`, `project nightfall`) highlight codenamed dossiers, cover identities, and bureaucratic phrases like "strategic reclassification initiative".

If no themed tags are present, the generator falls back to the legacy cryptid/location/conspiracy pools and the standard government euphemisms described below.

## Word Banks

### Locations
Area 51, Roswell, Dulce Base, Pine Gap, Denver Airport, Hangar 18, Cheyenne Mountain

### Cryptids
Bigfoot, Mothman, Chupacabra, Jersey Devil, Wendigo, Bat Boy, Skunk Ape

### Conspiracy Groups
Shadow Government, Majestic 12, Men in Black, Bilderberg Group, Committee of 300

### Witnesses
- "truck driver who saw 'too much'"
- "former government employee with conscience problems"
- "night shift Walmart employee"
- "diner waitress working the graveyard shift"

### Government Euphemisms
- "routine administrative adjustment"
- "benign atmospheric phenomenon"
- "scheduled maintenance event"
- "localized temporal anomaly"
- "nothing to see here situation"

## Enhancement Features

### Automatic Injections
- Vague terms → specific numbers
- Generic times → specific times (3:47 AM)
- Missing quotes → witness reactions or government evasions

### Truth Meter Integration
Articles reference current truth level when relevant:
- "Public awareness is surging, with truth-seeking networks reporting 73% of surveyed citizens now questioning official narratives"

### Dynamic Context
Articles adapt to:
- Current turn number
- States captured
- Truth meter level
- Card type (attack/media/zone)
- Faction (truth/government)

## Tips for Adding Content

### Good Headlines
✅ "MOTHMAN SIGHTING PROVES GOVERNMENT COVERUP—OFFICIALS SCRAMBLE"
✅ "INTERNAL MEMO: ROUTINE SWAMP GAS EVENT—NOTHING TO SEE HERE"

### Bad Headlines
❌ "Something Unusual Happened"
❌ "Government Makes Announcement"

### Good Body Paragraphs
✅ Include specific experts with weird credentials
✅ Add oddly specific statistics
✅ Quote witnesses with memorable details
✅ Reference bureaucratic absurdity
✅ Keep deadpan tone while being absurd

### Bad Body Paragraphs
❌ Generic descriptions
❌ No specific details
❌ Breaking character/being too silly
❌ Explaining the joke

## Future Expansion

To add more variety:
1. Add items to word banks in `proceduralArticleGenerator.ts`
2. Create new body paragraph templates
3. Add more specific details in `articleEnhancer.ts`
4. Expand witness reactions and government evasions

The system is designed to scale—more word bank items = more variation!
