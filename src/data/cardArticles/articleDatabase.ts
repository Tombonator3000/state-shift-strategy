/**
 * Card-Specific Article Database
 * Detailed, coherent newspaper articles for each card in the game.
 * These articles provide narrative depth and humor while referencing actual card mechanics.
 */

export interface CardArticle {
  cardId: string;
  faction: 'truth' | 'government';
  headline: string;
  subhead: string;
  byline: string;
  body: string;
  imagePrompt?: string;
  statesMentioned?: string[];
  recurringCharacter?: string;
  followUpHooks?: string[];
  tags?: string[];
}

export const CARD_ARTICLE_DATABASE: CardArticle[] = [
  // TRUTH FACTION ARTICLES
  {
    cardId: 'TRUTH-001',
    faction: 'truth',
    headline: "BLURRY BIGFOOT PHOTO GOES VIRAL — Experts Confirm: Pixels Don't Lie",
    subhead: 'Forest Service declines to investigate; locals arm themselves with cameras',
    byline: 'By: Field Correspondent Luna Ramirez',
    body: 'A grainy photograph captured last Tuesday near Mount Hood has ignited renewed interest in Pacific Northwest cryptid sightings. The image, posted anonymously to a wilderness enthusiast forum, depicts what appears to be a large, bipedal figure striding through dense underbrush approximately forty yards from the photographer.\n\nDigital forensics consultant Dr. Helena Marsh analyzed the file metadata and pronounced it "frustratingly authentic." The original poster, who requested anonymity citing "harassment from skeptics and also Bigfoot himself," claims the encounter lasted under ten seconds before the subject vanished into the tree line.\n\nForest Service spokesperson Gerald Brooks released a terse statement: "We have no comment on unverified wildlife claims." Local hiking groups have organized nightly camera expeditions. Sales of trail cameras have tripled at regional outdoor retailers.',
    imagePrompt: '1950s-style grainy black and white photo of large bipedal figure in forest, obviously blurry',
    statesMentioned: ['Washington', 'Oregon'],
    recurringCharacter: null,
    followUpHooks: [
      'Trail camera footage shows second figure',
      'Forest Service finds massive footprints, denies significance',
      'Bigfoot spotted near Roswell anniversary',
    ],
    tags: ['bigfoot', 'cryptid', 'viral', 'photo', 'forest'],
  },
  {
    cardId: 'TRUTH-002',
    faction: 'truth',
    headline: "ELVIS SPOTTED AT 3 A.M. DINER — The King Recommends the Midnight Pancakes",
    subhead: "Waitress swears on grandmother's Bible; manager calls it 'slow news day'",
    byline: "By: Night Desk Reporter Sal Marino",
    body: "MEMPHIS — The King may not have left the building, but he apparently left Graceland long enough to grab a short stack at Frankie's 24-Hour Diner on Lamar Avenue early Thursday morning. According to night-shift waitress Darlene Hobbs, a man matching Elvis Presley's description—'if Elvis aged real gracefully and started wearing a lot of scarves'—ordered black coffee, the midnight special pancakes, and asked if the jukebox had any Hank Williams.\n\n'He tipped forty percent and hummed Don't Be Cruel while reading the sports section,' Hobbs told reporters. 'Either it's Elvis or the world's most committed impersonator.'\n\nDiner manager Frank Costello declined to review security footage, citing 'customer privacy and also I don't want to deal with this right now.'\n\nThis marks the fourteenth Elvis sighting in Memphis this year and the third at Frankie's specifically.",
    imagePrompt: '1950s newspaper photo of diner booth, coffee cup, empty plate with syrup, Elvis-style sunglasses left behind',
    statesMentioned: ['Tennessee'],
    recurringCharacter: 'Darlene Hobbs',
    followUpHooks: [
      'Darlene starts "Elvis Sighting" tour business',
      'Graceland security reports "unusual activity"',
      'Elvis spotted at Roswell anniversary festival',
    ],
    tags: ['elvis', 'memphis', 'sighting', 'diner', 'conspiracy'],
  },
  {
    cardId: 'TRUTH-003',
    faction: 'truth',
    headline: "PASTOR REX'S APOCALYPSE PODCAST HITS #1 — Sponsored by Doomsday Beans™",
    subhead: "His seventeen doomsday predictions: sixteen wrong, one terrifyingly accurate",
    byline: "By: Religion & Paranoia Desk",
    body: "Local fire-and-brimstone preacher Pastor Rex Richardson has transformed his basement recording setup into the nation's fastest-growing apocalypse analysis platform. His thrice-weekly podcast, 'Rex's Reckoning,' now boasts 2.3 million subscribers and lucrative sponsorship deals with survival gear companies.\n\n'The signs are accelerating,' Rex announced on Tuesday's episode, while unboxing a shipment of freeze-dried chili. 'My prophetic accuracy rate has climbed to almost six percent, which is six percent higher than the mainstream meteorologists.'\n\nCritics note that Rex predicted the end times for May 15th, June 3rd, July 22nd, and 'any Tuesday in August.' His sole correct prediction—that a mysterious light would appear over the water treatment plant—occurred three days after he made it, a timing discrepancy Rex attributes to 'divine scheduling adjustments.'\n\nDoomsday Beans™ reports record sales. The water treatment plant remains unexplained.",
    imagePrompt: 'Grainy photo of basement podcast studio, doomsday charts on wall, cans of survival beans stacked high',
    statesMentioned: [],
    recurringCharacter: 'Pastor Rex',
    followUpHooks: [
      'Rex predicts specific date—countdown begins',
      'Doomsday Beans warehouse mysteriously burns',
      'Rex spotted near UFO hotspot',
    ],
    tags: ['pastor-rex', 'apocalypse', 'podcast', 'prophecy', 'sponsored'],
  },
{
    cardId: 'TRUTH-004',
    faction: 'truth',
    headline: 'BAT BOY ENDORSES TRANSPARENCY — His Platform: Windows With No Curtains',
    subhead: 'Campaign promises include mandatory disclosure, free dental for cryptids',
    byline: 'By: Political Oddities Correspondent',
    body: "In a surprise press conference held in the parking garage of an undisclosed government building, the cryptid known only as 'Bat Boy' announced his endorsement of radical transparency initiatives. Flanked by what appeared to be volunteer coordinators in moth costumes, Bat Boy delivered a seventeen-minute speech calling for 'full disclosure of all classified files, especially the ones about me.'\n\n'For too long, the people have been kept in the dark,' Bat Boy declared, his distinctive features illuminated by a single parking garage fixture. 'Literally. Because of all the cover-ups. Also it's nighttime.'\n\nHis policy proposals include mandatory weekly document dumps, criminal penalties for redaction abuse, and a federal cryptid healthcare program. Political analysts struggle to determine which party he represents.\n\n'He's definitely anti-secrecy,' noted strategist Amanda Chen. 'Beyond that, your guess is as good as mine.' Bat Boy's campaign has already raised $47,000, mostly in small donations and what appears to be cave guano.",
    imagePrompt: 'Grainy parking garage photo of Bat Boy at makeshift podium, moth-costumed volunteers in background',
    statesMentioned: [],
    recurringCharacter: 'Bat Boy',
    followUpHooks: [
      'Bat Boy files for candidacy in three states',
      'IRS questions origin of campaign funds',
      'Bat Boy spotted at other campaign events',
    ],
    tags: ['bat-boy', 'cryptid', 'transparency', 'politics', 'disclosure'],
  },
  {
    cardId: 'TRUTH-007',
    faction: 'truth',
    headline: 'UFO INTERRUPTS HOMECOMING GAME — Wildcats Win Anyway',
    subhead: 'Visiting team claims "cosmic interference"; referee shrugs',
    byline: 'By: Sports & Saucers Desk',
    body: "CENTERVILLE, OH — The Centerville High Wildcats secured a 28-24 victory over the visiting Bulldogs last Friday night, despite—or perhaps because of—a luminous disc-shaped object hovering over the fifty-yard line during the fourth quarter. Witnesses report the craft remained stationary for approximately seven minutes while emitting a low hum that several attendees described as 'weirdly soothing, like elevator music from Neptune.'\n\nBulldogs coach Terry Hammond filed a formal protest, citing 'cosmic interference' and demanding a rematch on neutral ground 'with properly shielded airspace.' Wildcats quarterback Jake Morrison told reporters he thought the object was 'just a really bright blimp' until it 'did that spinny thing and shot off toward the water tower.'\n\nLocal officials declined to comment. The FAA released a statement reading simply: 'Weather balloon. Next question.'\n\nThe Wildcats advance to regionals. The Bulldogs do not.",
    imagePrompt: '1950s newspaper photo of high school football field at night with UFO hovering above, crowd looking up',
    statesMentioned: ['Ohio', 'Kentucky'],
    recurringCharacter: 'Coach Terry Hammond',
    followUpHooks: [
      'Coach Hammond starts UFO support group',
      'Water tower now emitting faint hum',
      'Wildcats receive mysterious scholarship offers',
    ],
    tags: ['ufo', 'football', 'highschool', 'ohio', 'sports'],
  },
];

/**
 * Get article for a specific card
 */
export function getArticleForCard(cardId: string): CardArticle | null {
  return CARD_ARTICLE_DATABASE.find(article => article.cardId === cardId) || null;
}

/**
 * Get articles by faction
 */
export function getArticlesByFaction(faction: 'truth' | 'government'): CardArticle[] {
  return CARD_ARTICLE_DATABASE.filter(article => article.faction === faction);
}

/**
 * Get articles mentioning a state
 */
export function getArticlesByState(stateName: string): CardArticle[] {
  return CARD_ARTICLE_DATABASE.filter(article => 
    article.statesMentioned?.some(state => 
      state.toLowerCase().includes(stateName.toLowerCase())
    )
  );
}

/**
 * Get articles featuring a recurring character
 */
export function getArticlesByCharacter(characterName: string): CardArticle[] {
  return CARD_ARTICLE_DATABASE.filter(article => 
    article.recurringCharacter?.toLowerCase().includes(characterName.toLowerCase())
  );
}

export default CARD_ARTICLE_DATABASE;
