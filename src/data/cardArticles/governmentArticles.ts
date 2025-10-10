import type { CardArticle } from './articleDatabase';

/**
 * Government Faction Card-Specific Articles
 * Cards GOV-001 through GOV-200
 * 
 * Government faction articles use bureaucratic euphemisms,
 * downplay anomalies, and emphasize "everything is under control"
 */

export const governmentArticles: CardArticle[] = [
  {
    cardId: 'GOV-001',
    faction: 'government',
    headline: 'ROUTINE ATMOSPHERIC PHENOMENON EXPLAINED—CITIZENS REMINDED TO REMAIN CALM',
    subhead: 'Official statement: "Swamp gas reflecting Venus, case definitively closed"',
    byline: 'By: Public Information Officer J. Morrison',
    body: `The Department of Atmospheric Normalization has issued a comprehensive report addressing last week's "unusual sky event," confirming it was merely swamp gas refracting light from the planet Venus.\n\n"We appreciate citizen vigilance," stated Deputy Director Karen Walsh at a mandatory press briefing. "However, speculation serves no constructive purpose. Our 47-page analysis conclusively demonstrates this was a predictable meteorological occurrence that happens approximately never and will not repeat."\n\nResidents who witnessed the event are encouraged to attend voluntary memory workshops offered at convenient government facilities. Light refreshments will be served. Attendance is optional but strongly recommended for social harmony.\n\nAll related photographs have been collected for proper archival processing. Citizens are reminded that unauthorized retention of such materials may constitute inadvertent participation in information irregularities.`,
    imagePrompt: 'Sterile government press conference, official speaking at podium with department seal, neutral bureaucratic setting, formal photography',
    tags: ['official', 'denial', 'containment'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Director Karen Walsh',
    followUpHooks: [
      'Memory workshop attendance reaches 100% in affected area',
      'Venus officially "not visible from that angle," says NASA privately'
    ]
  },
  {
    cardId: 'GOV-002',
    faction: 'government',
    headline: 'MISSING TIME INCIDENTS ATTRIBUTED TO DAYLIGHT SAVING CONFUSION',
    subhead: 'Health officials recommend better sleep hygiene, possibly vitamins',
    byline: 'By: National Health Communication Bureau',
    body: `The Centers for Temporal Wellness have released new guidance addressing reports of "missing time" across seventeen states, attributing the phenomenon to widespread confusion regarding Daylight Saving Time protocols.\n\n"Many Americans struggle with the biannual clock adjustment," explained Dr. Raymond Foster, Chief of Temporal Medicine. "This year's reports of 'losing several hours' or 'waking up in unfamiliar locations' align perfectly with known circadian disruption patterns. We recommend adjusting sleep schedules gradually and consulting your physician about melatonin supplements."\n\nThe report notably does not address why missing time reports peaked during months without Daylight Saving Time changes, why affected individuals often describe "bright lights" and "humming sounds," or why several reported being in their cars when time resumed.\n\n"These details are outside our purview," Dr. Foster clarified. "Our focus remains on practical solutions: adequate hydration, sensible bedtimes, and not asking complicated questions that might cause unnecessary anxiety."`,
    imagePrompt: 'Official medical pamphlet design, clock graphics, professional health communication style, sanitized imagery',
    tags: ['coverup', 'medical', 'dismissal'],
    statesMentioned: ['Multiple'],
    recurringCharacter: 'Dr. Raymond Foster',
    followUpHooks: [
      'Dr. Foster cancels follow-up interviews, takes sudden sabbatical',
      'Melatonin supplement sales spike 890%, manufacturer cannot explain'
    ]
  },
  {
    cardId: 'GOV-003',
    faction: 'government',
    headline: 'AREA 51 RENAMED "AREA 51 FAMILY FUN ZONE"—GRAND OPENING SCHEDULED',
    subhead: 'Rebranding initiative aims to "eliminate persistent misconceptions through transparency"',
    byline: 'By: Tourism Development Council',
    body: `In a surprising policy shift, the Department of Defense announced that the previously restricted military installation known as Area 51 will undergo comprehensive rebranding as a family-friendly tourist destination, complete with gift shop, petting zoo, and educational exhibits about "boring airplane testing."\n\n"For decades, conspiracy theorists have spread wild rumors about this facility," said General Marcus Thompson during the announcement. "The best way to combat misinformation is radical transparency. Which is why we're opening everything to the public—except Buildings 7, 12, and 18 through 54, which are being renovated and definitely don't contain anything worth speculating about."\n\nThe gift shop will feature merchandise emblazoned with humorous slogans like "I Visited Area 51 and All I Found Was Conventional Aircraft" and "My Parents Went to Area 51 and All They Got Me Was This T-Shirt (Nothing Else, Definitely No Exposure to Anomalous Technology)."\n\nOpening day tickets sold out within four hours. The waiting list currently exceeds 400,000 people.`,
    imagePrompt: 'Cheerful tourist brochure design showing generic southwestern landscape, happy families, sanitized facility buildings in background',
    tags: ['rebranding', 'transparency-theater', 'tourism'],
    statesMentioned: ['Nevada'],
    recurringCharacter: 'General Marcus Thompson',
    followUpHooks: [
      'Opening day mysteriously postponed seventeen times',
      'Gift shop T-shirts spontaneously combust in warehouse, fire marshal "not suspicious"'
    ]
  },
  {
    cardId: 'GOV-004',
    faction: 'government',
    headline: 'CATTLE MUTILATION STUDY CONCLUDES: "PROBABLY COYOTES, DEFINITELY NOT LASERS"',
    subhead: 'Agricultural Department issues 600-page report ruling out precision surgical instruments',
    byline: 'By: Department of Agricultural Normalcy',
    body: `After an eight-year, $4.7 million study examining livestock deaths characterized by precise surgical incisions and missing organs, federal researchers have conclusively determined the cause: coyotes with exceptional dental precision.\n\n"The evidence overwhelmingly points to natural predation," declared lead researcher Dr. Patricia Ng, displaying photographs of carnivore teeth next to laser-straight incision marks. "Coyotes are remarkably skilled. Also, the complete absence of blood at these sites is explained by... efficient drainage. Into the ground. Which then evaporates. Scientifically."\n\nThe report dedicates 127 pages to explaining why eyewitness accounts of "hovering lights" near affected ranches are irrelevant, noting that ranchers often work long hours and may experience fatigue-related optical phenomena.\n\nRanchers interviewed for this article declined to comment on the record but did laugh for approximately forty-five seconds when asked if they found the conclusions credible.`,
    imagePrompt: 'Government scientific report cover with charts, graphs, and photos of prairie landscape, official documentation style',
    tags: ['investigation', 'livestock', 'explanation'],
    statesMentioned: ['Montana', 'Wyoming', 'Colorado'],
    recurringCharacter: 'Dr. Patricia Ng',
    followUpHooks: [
      'Coyote population in affected areas: zero, wildlife census reveals',
      'Dr. Ng transferred to Arctic research station, no forwarding address'
    ]
  },
  {
    cardId: 'GOV-005',
    faction: 'government',
    headline: 'NEW SECURITY CLEARANCE LEVEL INTRODUCED: "OMEGA PLUS ULTRA SUPREME"',
    subhead: 'Officials assure public that excessive classification protects democracy',
    byline: 'By: Inter-Agency Classification Board',
    body: `The National Security Classification Review Committee has established a new tier of document security beyond Top Secret, citing the need to protect information "so sensitive that knowing it exists might itself require clearance."\n\n"Omega Plus Ultra Supreme classification ensures that only personnel with legitimate need-to-know can access materials related to... well, we can't say what," explained Classification Czar Donald Pierce. "The topics covered are themselves classified at the Omega Plus level. Discussing why they're classified is Meta-Omega Plus classified. This interview is probably now classified."\n\nCurrent estimates suggest fewer than nine people nationwide hold the necessary clearances to access OPUS-level materials. Those nine individuals are not allowed to confirm they hold such clearances, work in the same building, or make eye contact with each other during lunch.\n\nCivil liberties groups have filed suit requesting declassification of the criteria for OPUS classification. The lawsuit was immediately classified OPUS and sealed in a vault that officially doesn't exist.`,
    imagePrompt: 'Heavily redacted official document with multiple classification stamps, bureaucratic paperwork aesthetic, excessive censorship visual',
    tags: ['classification', 'secrecy', 'bureaucracy'],
    statesMentioned: ['District of Columbia'],
    recurringCharacter: 'Classification Czar Donald Pierce',
    followUpHooks: [
      'Donald Pierce disappears mid-interview, replaced by identical spokesperson',
      'Journalist who filed FOIA request for OPUS info receives 300 completely blank pages'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  }
];
