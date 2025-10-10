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
  },
  {
    cardId: 'GOV-006',
    faction: 'government',
    headline: 'OPERATION MOCKINGBIRD II ARCHIVED AS SCHEDULED SYSTEM TEST',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Compliance Officer 182',
    body: `Compliance Chorus noted Operation Mockingbird II converted into an internal podcast with a seven-listener limit. Archivists looped Operation Mockingbird II behind a "technical difficulties" slate. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of operation mockingbird ii paperwork; clipboards and sealed envelopes',
    tags: ['bureaucracy', 'coverup', 'government', 'media', 'mockingbird'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 182',
    followUpHooks: [
      'Compliance Officer 182 circulates a confidence memo on "OPERATION MOCKINGBIRD II ARCHIVED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of bureaucracy protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-007',
    faction: 'government',
    headline: '{TURN_NUMBER} BULLETIN: {OPPONENT_FACTION} SHADOWS {STATES_CONTROLLED}',
    subhead: 'Transit alerts admit {CAPTURED_THIS_TURN} still glow while {TRUTH_PERCENTAGE} keeps sensors chirping.',
    byline: 'By: Acting Transparency Liaison 747',
    body: `Harmonization Taskforce logged {CARDS_PLAYED_COUNT} incident reports before sealing the annex. Treasury insists {IP_REMAINING} remains allocated for fog machines while {PLAYER_FACTION} touts {CURRENT_SCORE}.

{TURN_NUMBER} attachments remind staff {TOTAL_STATES} remain on the whiteboard pending review.`,
    imagePrompt: 'monochrome government press photo of national security waiver paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 747',
    followUpHooks: [
      'Acting Transparency Liaison 747 circulates a confidence memo on "{TURN_NUMBER} BULLETIN: {OPPONENT_FACTION} SHADOWS {STATES_CONTROLLED}" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-008',
    faction: 'government',
    headline: 'BUDGET REPROGRAMMING FLAGGED AS SECTION 12-C PROCEDURE',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Compliance Officer 610',
    body: `Emergency Normalcy Unit noted Budget Reprogramming Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Budget Reprogramming into a pep talk for fluorescent bulbs. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of budget reprogramming paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 610',
    followUpHooks: [
      'Compliance Officer 610 circulates a confidence memo on "BUDGET REPROGRAMMING FLAGGED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-009',
    faction: 'government',
    headline: 'MEN IN CHARCOAL NOTED AS ROUTINE MIB MITIGATION',
    subhead: 'Briefing assures stakeholders Men in Charcoal remains a morale exercise pending future paperwork.',
    byline: 'By: Compliance Officer 567',
    body: `Continuity Desk noted Men in Charcoal Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once Men in Charcoal matched the national anthem tempo. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of men in charcoal paperwork; windowless conference room shadows',
    tags: ['attack', 'government', 'mib'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 567',
    followUpHooks: [
      'Compliance Officer 567 circulates a confidence memo on "MEN IN CHARCOAL NOTED AS ROUTINE MIB MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-010',
    faction: 'government',
    headline: '{TURN_NUMBER} STATUS: {OPPONENT_FACTION} MAPS {STATES_CONTROLLED}',
    subhead: 'Perimeter signage claims {CAPTURED_THIS_TURN} stabilized while {TRUTH_PERCENTAGE} sets sirens humming.',
    byline: 'By: Interim Briefing Lead 332',
    body: `Emergency Normalcy Unit counts {CARDS_PLAYED_COUNT} paperwork volleys before the zoning stamps dried. {PLAYER_FACTION} flashes {CURRENT_SCORE} across briefing screens while {IP_REMAINING} remains in the mitigation fund.

{TURN_NUMBER} annex files remind staff {TOTAL_STATES} checkpoints must stay in rotation.`,
    imagePrompt: 'monochrome government press photo of compartmentalization paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 332',
    followUpHooks: [
      'Interim Briefing Lead 332 circulates a confidence memo on "{TURN_NUMBER} STATUS: {OPPONENT_FACTION} MAPS {STATES_CONTROLLED}" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-011',
    faction: 'government',
    headline: 'INTERCEPT & DISRUPT FILED AS ATTACK AWARENESS DRILL',
    subhead: 'Briefing assures stakeholders Intercept & Disrupt remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 174',
    body: `Continuity Desk noted Intercept & Disrupt reassigned to parade rehearsal inventory. Logistics converted Intercept & Disrupt into a mandatory wellness webinar. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of intercept & disrupt paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 174',
    followUpHooks: [
      'Acting Transparency Liaison 174 circulates a confidence memo on "INTERCEPT & DISRUPT FILED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-012',
    faction: 'government',
    headline: '{TURN_NUMBER} BRIEFING: {OPPONENT_FACTION} TRACKS {STATES_CONTROLLED}',
    subhead: 'Production notes flag {CURRENT_SCORE} morale points while {IP_REMAINING} funds hush coaching.',
    byline: 'By: Deputy Plausibility Analyst 229',
    body: `Compliance Chorus counted {CARDS_PLAYED_COUNT} audition tapes submitted before lunch. {CAPTURED_THIS_TURN} require reshoots so the narrative stays aligned even as {TOTAL_STATES} remain in casting.

Directives confirm {PLAYER_FACTION} holds {STATES_CONTROLLED} and {TRUTH_PERCENTAGE} keeps agents whispering.`,
    imagePrompt: 'monochrome government press photo of crisis actor auditions paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 229',
    followUpHooks: [
      'Deputy Plausibility Analyst 229 circulates a confidence memo on "{TURN_NUMBER} BRIEFING: {OPPONENT_FACTION} TRACKS {STATES_CONTROLLED}" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-013',
    faction: 'government',
    headline: 'ROSWELL STORAGE HANGAR ZONED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Roswell Storage Hangar marked as scenic.',
    byline: 'By: Acting Transparency Liaison 418',
    body: `Office of Strategic Calm noted Roswell Storage Hangar granted conditional zoning as a meditation cul-de-sac. Safety cones around Roswell Storage Hangar now display motivational quotes. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of roswell storage hangar paperwork; redacted paperwork stacks',
    tags: ['government', 'location', 'roswell', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 418',
    followUpHooks: [
      'Acting Transparency Liaison 418 circulates a confidence memo on "ROSWELL STORAGE HANGAR ZONED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-014',
    faction: 'government',
    headline: 'EMERGENCY BROADCAST OVERRIDE INDEXED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Communications office redacts Emergency Broadcast Override into three tasteful bullet points.',
    byline: 'By: Deputy Plausibility Analyst 342',
    body: `Emergency Normalcy Unit noted Emergency Broadcast Override converted into an internal podcast with a seven-listener limit. Transcripts of Emergency Broadcast Override now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of emergency broadcast override paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 342',
    followUpHooks: [
      'Deputy Plausibility Analyst 342 circulates a confidence memo on "EMERGENCY BROADCAST OVERRIDE INDEXED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-015',
    faction: 'government',
    headline: 'SIGINT SWEEP NOTED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Briefing assures stakeholders SIGINT Sweep remains a morale exercise pending future paperwork.',
    byline: 'By: Narrative Alignment Clerk 346',
    body: `Narrative Harmonization Taskforce noted SIGINT Sweep reassigned to parade rehearsal inventory. Logistics converted SIGINT Sweep into a mandatory wellness webinar. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of sigint sweep paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 346',
    followUpHooks: [
      'Narrative Alignment Clerk 346 circulates a confidence memo on "SIGINT SWEEP NOTED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-016',
    faction: 'government',
    headline: 'PLAUSIBLE DENIABILITY FILED AS ATTACK AWARENESS DRILL',
    subhead: 'Briefing assures stakeholders Plausible Deniability remains a morale exercise pending future paperwork.',
    byline: 'By: Interim Briefing Lead 620',
    body: `Narrative Harmonization Taskforce noted Plausible Deniability reassigned to parade rehearsal inventory. Incident clock reset once Plausible Deniability matched the national anthem tempo. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of plausible deniability paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 620',
    followUpHooks: [
      'Interim Briefing Lead 620 circulates a confidence memo on "PLAUSIBLE DENIABILITY FILED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-017',
    faction: 'government',
    headline: 'UNDERGROUND BRIEFING THEATER CLASSIFIED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Deputy Plausibility Analyst 467',
    body: `Emergency Normalcy Unit noted Underground Briefing Theater converted into an internal podcast with a seven-listener limit. Archivists looped Underground Briefing Theater behind a "technical difficulties" slate. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of underground briefing theater paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 467',
    followUpHooks: [
      'Deputy Plausibility Analyst 467 circulates a confidence memo on "UNDERGROUND BRIEFING THEATER CLASSIFIED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-018',
    faction: 'government',
    headline: 'SHELL COMPANY CAROUSEL CATALOGUED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Transit alerts call Shell Company Carousel a temporary civic glow event.',
    byline: 'By: Interim Briefing Lead 794',
    body: `Emergency Normalcy Unit noted Shell Company Carousel mapped as an inspirational seating area during fiscal reviews. Safety cones around Shell Company Carousel now display motivational quotes. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of shell company carousel paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 794',
    followUpHooks: [
      'Interim Briefing Lead 794 circulates a confidence memo on "SHELL COMPANY CAROUSEL CATALOGUED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-019',
    faction: 'government',
    headline: 'COUNTER-MEME TASK FORCE CLASSIFIED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Communications office redacts Counter-Meme Task Force into three tasteful bullet points.',
    byline: 'By: Acting Transparency Liaison 240',
    body: `Bureau of Plausible Events noted Counter-Meme Task Force synced with the hold music archive for quality assurance. Tone analysis concluded Counter-Meme Task Force qualifies as light jazz for procurement. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of counter-meme task force paperwork; redacted paperwork stacks',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 240',
    followUpHooks: [
      'Acting Transparency Liaison 240 circulates a confidence memo on "COUNTER-MEME TASK FORCE CLASSIFIED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-020',
    faction: 'government',
    headline: 'HONEYTRAP ASSET FILED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Agency memo labels Honeytrap Asset "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 390',
    body: `Office of Strategic Calm noted Honeytrap Asset Witness statements stapled into a morale binder labelled "do not open". Logistics converted Honeytrap Asset into a mandatory wellness webinar. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of honeytrap asset paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 390',
    followUpHooks: [
      'Interim Briefing Lead 390 circulates a confidence memo on "HONEYTRAP ASSET FILED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-021',
    faction: 'government',
    headline: 'NATIONAL SECURITY LETTER CLASSIFIED AS STANDARD PUBLIC OUTREACH',
    subhead: 'National Security Letter folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Acting Transparency Liaison 794',
    body: `Office of Strategic Calm noted National Security Letter synced with the hold music archive for quality assurance. Transcripts of National Security Letter now circulate as mindfulness affirmations. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of national security letter paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 794',
    followUpHooks: [
      'Acting Transparency Liaison 794 circulates a confidence memo on "NATIONAL SECURITY LETTER CLASSIFIED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-022',
    faction: 'government',
    headline: 'GHOST BUDGET ANNEX FLAGGED AS SECTION 12-C PROCEDURE',
    subhead: 'Briefing assures stakeholders Ghost Budget Annex remains a morale exercise pending future paperwork.',
    byline: 'By: Compliance Officer 343',
    body: `Continuity Desk noted Ghost Budget Annex reassigned to parade rehearsal inventory. Surveillance audio translated Ghost Budget Annex into a pep talk for fluorescent bulbs. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of ghost budget annex paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'ghost', 'government', 'haunted'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 343',
    followUpHooks: [
      'Compliance Officer 343 circulates a confidence memo on "GHOST BUDGET ANNEX FLAGGED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-023',
    faction: 'government',
    headline: 'AIRPORT BACKROOM APPENDED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Airport Backroom folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Acting Transparency Liaison 763',
    body: `Civic Atmospherics Lab noted Airport Backroom converted into an internal podcast with a seven-listener limit. Archivists looped Airport Backroom behind a "technical difficulties" slate. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of airport backroom paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 763',
    followUpHooks: [
      'Acting Transparency Liaison 763 circulates a confidence memo on "AIRPORT BACKROOM APPENDED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-024',
    faction: 'government',
    headline: 'CUTOUT COURIER FLAGGED AS SCHEDULED SYSTEM TEST',
    subhead: 'Agency memo labels Cutout Courier "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 810',
    body: `Civic Atmospherics Lab noted Cutout Courier Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Cutout Courier into a pep talk for fluorescent bulbs. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of cutout courier paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 810',
    followUpHooks: [
      'Interim Briefing Lead 810 circulates a confidence memo on "CUTOUT COURIER FLAGGED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-025',
    faction: 'government',
    headline: 'CIGARETTE WHISPERER APPENDED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Compliance Officer 555',
    body: `Continuity Desk noted Cigarette Whisperer All footage of muted and republished as a weather loop. Tone analysis concluded Cigarette Whisperer qualifies as light jazz for procurement. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of cigarette whisperer paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 555',
    followUpHooks: [
      'Compliance Officer 555 circulates a confidence memo on "CIGARETTE WHISPERER APPENDED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-026',
    faction: 'government',
    headline: 'OPERATION PAPER SHUFFLE CLASSIFIED AS SECTION 12-C PROCEDURE',
    subhead: 'Operation Paper Shuffle folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Acting Transparency Liaison 370',
    body: `Office of Strategic Calm noted Operation Paper Shuffle synced with the hold music archive for quality assurance. Archivists looped Operation Paper Shuffle behind a "technical difficulties" slate. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of operation paper shuffle paperwork; security camera angle slightly askew',
    tags: ['bureaucracy', 'coverup', 'government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 370',
    followUpHooks: [
      'Acting Transparency Liaison 370 circulates a confidence memo on "OPERATION PAPER SHUFFLE CLASSIFIED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of bureaucracy protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-027',
    faction: 'government',
    headline: 'DENVER AIRPORT BUNKER ZONED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Denver Airport Bunker marked as scenic.',
    byline: 'By: Deputy Plausibility Analyst 256',
    body: `Office of Strategic Calm noted Denver Airport Bunker granted conditional zoning as a meditation cul-de-sac. Safety cones around Denver Airport Bunker now display motivational quotes. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of denver airport bunker paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 256',
    followUpHooks: [
      'Deputy Plausibility Analyst 256 circulates a confidence memo on "DENVER AIRPORT BUNKER ZONED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-028',
    faction: 'government',
    headline: 'BLACK HELICOPTERS FILED AS SECTION 12-C PROCEDURE',
    subhead: 'Briefing assures stakeholders Black Helicopters remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 129',
    body: `Continuity Desk noted Black Helicopters reassigned to parade rehearsal inventory. Surveillance audio translated Black Helicopters into a pep talk for fluorescent bulbs. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of black helicopters paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 129',
    followUpHooks: [
      'Acting Transparency Liaison 129 circulates a confidence memo on "BLACK HELICOPTERS FILED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-029',
    faction: 'government',
    headline: 'DECLASSIFICATION, EVENTUALLY APPENDED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Communications office redacts Declassification, Eventually into three tasteful bullet points.',
    byline: 'By: Narrative Alignment Clerk 315',
    body: `Compliance Chorus noted Declassification, Eventually synced with the hold music archive for quality assurance. Tone analysis concluded Declassification, Eventually qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of declassification, eventually paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 315',
    followUpHooks: [
      'Narrative Alignment Clerk 315 circulates a confidence memo on "DECLASSIFICATION, EVENTUALLY APPENDED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-030',
    faction: 'government',
    headline: 'FUSION CENTER GRID RECORDED AS SCHEDULED SYSTEM TEST',
    subhead: 'Logbook records Fusion Center Grid as landscaping maintenance with optional cones.',
    byline: 'By: Acting Transparency Liaison 650',
    body: `Continuity Desk noted Fusion Center Grid granted conditional zoning as a meditation cul-de-sac. Safety cones around Fusion Center Grid now display motivational quotes. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of fusion center grid paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 650',
    followUpHooks: [
      'Acting Transparency Liaison 650 circulates a confidence memo on "FUSION CENTER GRID RECORDED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-031',
    faction: 'government',
    headline: 'SEALED INDICTMENT LOGGED AS SECTION 12-C PROCEDURE',
    subhead: 'Briefing assures stakeholders Sealed Indictment remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 734',
    body: `Office of Strategic Calm noted Sealed Indictment Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Sealed Indictment into a pep talk for fluorescent bulbs. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of sealed indictment paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 734',
    followUpHooks: [
      'Acting Transparency Liaison 734 circulates a confidence memo on "SEALED INDICTMENT LOGGED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-032',
    faction: 'government',
    headline: 'TELECOM COMPLIANCE APPENDED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Narrative Alignment Clerk 240',
    body: `Bureau of Plausible Events noted Telecom Compliance synced with the hold music archive for quality assurance. Tone analysis concluded Telecom Compliance qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of telecom compliance paperwork; redacted paperwork stacks',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 240',
    followUpHooks: [
      'Narrative Alignment Clerk 240 circulates a confidence memo on "TELECOM COMPLIANCE APPENDED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-033',
    faction: 'government',
    headline: 'DESERT STORAGE YARD ZONED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Desert Storage Yard marked as scenic.',
    byline: 'By: Acting Transparency Liaison 213',
    body: `Compliance Chorus noted Desert Storage Yard mapped as an inspirational seating area during fiscal reviews. Facilities added Desert Storage Yard to the scenic detour brochure. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of desert storage yard paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 213',
    followUpHooks: [
      'Acting Transparency Liaison 213 circulates a confidence memo on "DESERT STORAGE YARD ZONED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-034',
    faction: 'government',
    headline: 'FRIENDLY FACT-CHECKER APPENDED AS SCHEDULED SYSTEM TEST',
    subhead: 'Communications office redacts Friendly Fact-Checker into three tasteful bullet points.',
    byline: 'By: Compliance Officer 814',
    body: `Civic Atmospherics Lab noted Friendly Fact-Checker converted into an internal podcast with a seven-listener limit. Transcripts of Friendly Fact-Checker now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of friendly fact-checker paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 814',
    followUpHooks: [
      'Compliance Officer 814 circulates a confidence memo on "FRIENDLY FACT-CHECKER APPENDED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-035',
    faction: 'government',
    headline: 'STRATEGIC BRIEFCASE LOGGED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Briefing assures stakeholders Strategic Briefcase remains a morale exercise pending future paperwork.',
    byline: 'By: Interim Briefing Lead 332',
    body: `Continuity Desk noted Strategic Briefcase reclassified as a motivational strobe for authorized personnel only. Incident clock reset once Strategic Briefcase matched the national anthem tempo. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of strategic briefcase paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 332',
    followUpHooks: [
      'Interim Briefing Lead 332 circulates a confidence memo on "STRATEGIC BRIEFCASE LOGGED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-036',
    faction: 'government',
    headline: 'WILDERNESS LISTENING POST DESIGNATED PERFORMANCE REVIEW ITEM',
    subhead: 'Logbook records Wilderness Listening Post as landscaping maintenance with optional cones.',
    byline: 'By: Deputy Plausibility Analyst 517',
    body: `Emergency Normalcy Unit noted Wilderness Listening Post granted conditional zoning as a meditation cul-de-sac. Facilities added Wilderness Listening Post to the scenic detour brochure. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of wilderness listening post paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 517',
    followUpHooks: [
      'Deputy Plausibility Analyst 517 circulates a confidence memo on "WILDERNESS LISTENING POST DESIGNATED PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-037',
    faction: 'government',
    headline: 'KRYPTEK ASSET FILED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Briefing assures stakeholders Kryptek Asset remains a morale exercise pending future paperwork.',
    byline: 'By: Interim Briefing Lead 111',
    body: `Bureau of Plausible Events noted Kryptek Asset Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once Kryptek Asset matched the national anthem tempo. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of kryptek asset paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 111',
    followUpHooks: [
      'Interim Briefing Lead 111 circulates a confidence memo on "KRYPTEK ASSET FILED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-038',
    faction: 'government',
    headline: 'COMPLIANCE AUDIT FLAGGED AS ATTACK AWARENESS DRILL',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Acting Transparency Liaison 464',
    body: `Continuity Desk noted Compliance Audit Witness statements stapled into a morale binder labelled "do not open". Logistics converted Compliance Audit into a mandatory wellness webinar. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of compliance audit paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 464',
    followUpHooks: [
      'Acting Transparency Liaison 464 circulates a confidence memo on "COMPLIANCE AUDIT FLAGGED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-039',
    faction: 'government',
    headline: 'PRESS POOL LOCKDOWN CLASSIFIED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Press Pool Lockdown folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Deputy Plausibility Analyst 888',
    body: `Emergency Normalcy Unit noted Press Pool Lockdown All footage of muted and republished as a weather loop. Transcripts of Press Pool Lockdown now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of press pool lockdown paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 888',
    followUpHooks: [
      'Deputy Plausibility Analyst 888 circulates a confidence memo on "PRESS POOL LOCKDOWN CLASSIFIED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-040',
    faction: 'government',
    headline: 'SECURITY THEATER INDEXED AS SCHEDULED SYSTEM TEST',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Compliance Officer 937',
    body: `Bureau of Plausible Events noted Security Theater synced with the hold music archive for quality assurance. Tone analysis concluded Security Theater qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of security theater paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 937',
    followUpHooks: [
      'Compliance Officer 937 circulates a confidence memo on "SECURITY THEATER INDEXED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-041',
    faction: 'government',
    headline: 'RECORDS SEALED BY COURT APPENDED AS SCHEDULED SYSTEM TEST',
    subhead: 'Records Sealed by Court folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Narrative Alignment Clerk 113',
    body: `Bureau of Plausible Events noted Records Sealed by Court synced with the hold music archive for quality assurance. Archivists looped Records Sealed by Court behind a "technical difficulties" slate. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of records sealed by court paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 113',
    followUpHooks: [
      'Narrative Alignment Clerk 113 circulates a confidence memo on "RECORDS SEALED BY COURT APPENDED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-042',
    faction: 'government',
    headline: 'HARBOR DOCK WAREHOUSE DESIGNATED SECTION 12-C PROCEDURE',
    subhead: 'Transit alerts call Harbor Dock Warehouse a temporary civic glow event.',
    byline: 'By: Compliance Officer 739',
    body: `Office of Strategic Calm noted Harbor Dock Warehouse Maintenance logs retitled as "fog machine calibration". Safety cones around Harbor Dock Warehouse now display motivational quotes. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of harbor dock warehouse paperwork; clipboards and sealed envelopes',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 739',
    followUpHooks: [
      'Compliance Officer 739 circulates a confidence memo on "HARBOR DOCK WAREHOUSE DESIGNATED SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-043',
    faction: 'government',
    headline: 'PSYCHOLOGICAL OPERATIONS CELL ARCHIVED AS SECTION 12-C PROCEDURE',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Acting Transparency Liaison 278',
    body: `Emergency Normalcy Unit noted Psychological Operations Cell All footage of muted and republished as a weather loop. Tone analysis concluded Psychological Operations Cell qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of psychological operations cell paperwork; redacted paperwork stacks',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 278',
    followUpHooks: [
      'Acting Transparency Liaison 278 circulates a confidence memo on "PSYCHOLOGICAL OPERATIONS CELL ARCHIVED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-044',
    faction: 'government',
    headline: 'UNMARKED EVIDENCE LOCKER CATALOGUED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Unmarked Evidence Locker marked as scenic.',
    byline: 'By: Interim Briefing Lead 369',
    body: `Narrative Harmonization Taskforce noted Unmarked Evidence Locker Maintenance logs retitled as "fog machine calibration". Safety cones around Unmarked Evidence Locker now display motivational quotes. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of unmarked evidence locker paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 369',
    followUpHooks: [
      'Interim Briefing Lead 369 circulates a confidence memo on "UNMARKED EVIDENCE LOCKER CATALOGUED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-045',
    faction: 'government',
    headline: 'LIZARD LOBBY LUNCHEON INDEXED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Communications office redacts Lizard Lobby Luncheon into three tasteful bullet points.',
    byline: 'By: Narrative Alignment Clerk 523',
    body: `Compliance Chorus noted Lizard Lobby Luncheon synced with the hold music archive for quality assurance. Transcripts of Lizard Lobby Luncheon now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of lizard lobby luncheon paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 523',
    followUpHooks: [
      'Narrative Alignment Clerk 523 circulates a confidence memo on "LIZARD LOBBY LUNCHEON INDEXED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-046',
    faction: 'government',
    headline: 'BLACK BUDGET SKUNKWORKS FLAGGED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Agency memo labels Black Budget Skunkworks "pep rally noise" and moves on.',
    byline: 'By: Narrative Alignment Clerk 232',
    body: `Civic Atmospherics Lab noted Black Budget Skunkworks reassigned to parade rehearsal inventory. Logistics converted Black Budget Skunkworks into a mandatory wellness webinar. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of black budget skunkworks paperwork; security camera angle slightly askew',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 232',
    followUpHooks: [
      'Narrative Alignment Clerk 232 circulates a confidence memo on "BLACK BUDGET SKUNKWORKS FLAGGED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-047',
    faction: 'government',
    headline: 'MOUNT WEATHER COMPLEX CATALOGUED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Logbook records Mount Weather Complex as landscaping maintenance with optional cones.',
    byline: 'By: Narrative Alignment Clerk 873',
    body: `Office of Strategic Calm noted Mount Weather Complex Maintenance logs retitled as "fog machine calibration". Urban planners labelled Mount Weather Complex an "inspiration cul-de-sac". Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of mount weather complex paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 873',
    followUpHooks: [
      'Narrative Alignment Clerk 873 circulates a confidence memo on "MOUNT WEATHER COMPLEX CATALOGUED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-048',
    faction: 'government',
    headline: 'WITNESS RELOCATION NOTED AS ATTACK AWARENESS DRILL',
    subhead: 'Briefing assures stakeholders Witness Relocation remains a morale exercise pending future paperwork.',
    byline: 'By: Compliance Officer 321',
    body: `Office of Strategic Calm noted Witness Relocation Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Witness Relocation into a pep talk for fluorescent bulbs. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of witness relocation paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 321',
    followUpHooks: [
      'Compliance Officer 321 circulates a confidence memo on "WITNESS RELOCATION NOTED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-049',
    faction: 'government',
    headline: 'COUNCIL ABOVE THE CEILING CLASSIFIED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Communications office redacts Council Above the Ceiling into three tasteful bullet points.',
    byline: 'By: Narrative Alignment Clerk 141',
    body: `Office of Strategic Calm noted Council Above the Ceiling synced with the hold music archive for quality assurance. Transcripts of Council Above the Ceiling now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of council above the ceiling paperwork; redacted paperwork stacks',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 141',
    followUpHooks: [
      'Narrative Alignment Clerk 141 circulates a confidence memo on "COUNCIL ABOVE THE CEILING CLASSIFIED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-050',
    faction: 'government',
    headline: 'EXECUTIVE PRIVILEGE BLANKET CLASSIFIED AS SECTION 12-C PROCEDURE',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Narrative Alignment Clerk 387',
    body: `Compliance Chorus noted Executive Privilege Blanket synced with the hold music archive for quality assurance. Tone analysis concluded Executive Privilege Blanket qualifies as light jazz for procurement. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of executive privilege blanket paperwork; redacted paperwork stacks',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 387',
    followUpHooks: [
      'Narrative Alignment Clerk 387 circulates a confidence memo on "EXECUTIVE PRIVILEGE BLANKET CLASSIFIED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-051',
    faction: 'government',
    headline: 'MEN IN BLACK SQUAD FLAGGED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Briefing assures stakeholders Men in Black Squad remains a morale exercise pending future paperwork.',
    byline: 'By: Narrative Alignment Clerk 897',
    body: `Narrative Harmonization Taskforce noted Men in Black Squad reclassified as a motivational strobe for authorized personnel only. Surveillance audio translated Men in Black Squad into a pep talk for fluorescent bulbs. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of men in black squad paperwork; windowless conference room shadows',
    tags: ['attack', 'government', 'mib'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 897',
    followUpHooks: [
      'Narrative Alignment Clerk 897 circulates a confidence memo on "MEN IN BLACK SQUAD FLAGGED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-052',
    faction: 'government',
    headline: 'WEATHER CONTROL DIVISION CATALOGUED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Logbook records Weather Control Division as landscaping maintenance with optional cones.',
    byline: 'By: Interim Briefing Lead 205',
    body: `Narrative Harmonization Taskforce noted Weather Control Division mapped as an inspirational seating area during fiscal reviews. Urban planners labelled Weather Control Division an "inspiration cul-de-sac". Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of weather control division paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 205',
    followUpHooks: [
      'Interim Briefing Lead 205 circulates a confidence memo on "WEATHER CONTROL DIVISION CATALOGUED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-053',
    faction: 'government',
    headline: 'CIGARETTE WHISPERER INDEXED AS SCHEDULED SYSTEM TEST',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Interim Briefing Lead 111',
    body: `Continuity Desk noted Cigarette Whisperer All footage of muted and republished as a weather loop. Tone analysis concluded Cigarette Whisperer qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of cigarette whisperer paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 111',
    followUpHooks: [
      'Interim Briefing Lead 111 circulates a confidence memo on "CIGARETTE WHISPERER INDEXED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-054',
    faction: 'government',
    headline: 'OPERATION MOCKINGBIRD 2.0 APPENDED AS BUREAUCRACY AWARENESS DRILL',
    subhead: 'Operation Mockingbird 2.0 folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Deputy Plausibility Analyst 999',
    body: `Emergency Normalcy Unit noted Operation Mockingbird 2.0 converted into an internal podcast with a seven-listener limit. Archivists looped Operation Mockingbird 2.0 behind a "technical difficulties" slate. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of operation mockingbird 2.0 paperwork; clipboards and sealed envelopes',
    tags: ['bureaucracy', 'coverup', 'government', 'media', 'mockingbird'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 999',
    followUpHooks: [
      'Deputy Plausibility Analyst 999 circulates a confidence memo on "OPERATION MOCKINGBIRD 2.0 APPENDED AS BUREAUCRACY AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of bureaucracy protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-055',
    faction: 'government',
    headline: 'NATIONAL SECURITY RED TAPE FILED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Briefing assures stakeholders National Security Red Tape remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 296',
    body: `Compliance Chorus noted National Security Red Tape Witness statements stapled into a morale binder labelled "do not open". Logistics converted National Security Red Tape into a mandatory wellness webinar. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of national security red tape paperwork; security camera angle slightly askew',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 296',
    followUpHooks: [
      'Acting Transparency Liaison 296 circulates a confidence memo on "NATIONAL SECURITY RED TAPE FILED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-056',
    faction: 'government',
    headline: 'SHADOW BUDGET FILED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Agency memo labels Shadow Budget "pep rally noise" and moves on.',
    byline: 'By: Compliance Officer 277',
    body: `Emergency Normalcy Unit noted Shadow Budget reassigned to parade rehearsal inventory. Surveillance audio translated Shadow Budget into a pep talk for fluorescent bulbs. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of shadow budget paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 277',
    followUpHooks: [
      'Compliance Officer 277 circulates a confidence memo on "SHADOW BUDGET FILED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-057',
    faction: 'government',
    headline: 'ALIEN AUTOPSY COVER-UP NOTED AS ALIEN AWARENESS DRILL',
    subhead: 'ALIEN chatter redirected into a resilience coaching session.',
    byline: 'By: Acting Transparency Liaison 557',
    body: `Emergency Normalcy Unit noted Alien Autopsy Cover-Up reassigned to parade rehearsal inventory. Incident clock reset once Alien Autopsy Cover-Up matched the national anthem tempo. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of alien autopsy cover-up paperwork; clipboards and sealed envelopes',
    tags: ['alien', 'attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 557',
    followUpHooks: [
      'Acting Transparency Liaison 557 circulates a confidence memo on "ALIEN AUTOPSY COVER-UP NOTED AS ALIEN AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of alien protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-058',
    faction: 'government',
    headline: 'BLACK SITE EXPANSION DESIGNATED ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Black Site Expansion marked as scenic.',
    byline: 'By: Interim Briefing Lead 630',
    body: `Emergency Normalcy Unit noted Black Site Expansion Maintenance logs retitled as "fog machine calibration". Urban planners labelled Black Site Expansion an "inspiration cul-de-sac". Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of black site expansion paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 630',
    followUpHooks: [
      'Interim Briefing Lead 630 circulates a confidence memo on "BLACK SITE EXPANSION DESIGNATED ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-059',
    faction: 'government',
    headline: 'PATRIOT ACT RELOADED CLASSIFIED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Communications office redacts Patriot Act Reloaded into three tasteful bullet points.',
    byline: 'By: Deputy Plausibility Analyst 677',
    body: `Civic Atmospherics Lab noted Patriot Act Reloaded All footage of muted and republished as a weather loop. Transcripts of Patriot Act Reloaded now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of patriot act reloaded paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 677',
    followUpHooks: [
      'Deputy Plausibility Analyst 677 circulates a confidence memo on "PATRIOT ACT RELOADED CLASSIFIED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-060',
    faction: 'government',
    headline: 'MIND CONTROL FLUORIDE CLASSIFIED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Mind Control Fluoride folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Acting Transparency Liaison 851',
    body: `Emergency Normalcy Unit noted Mind Control Fluoride converted into an internal podcast with a seven-listener limit. Tone analysis concluded Mind Control Fluoride qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of mind control fluoride paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 851',
    followUpHooks: [
      'Acting Transparency Liaison 851 circulates a confidence memo on "MIND CONTROL FLUORIDE CLASSIFIED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-061',
    faction: 'government',
    headline: 'DEPARTMENT OF DENIALS FLAGGED AS SCHEDULED SYSTEM TEST',
    subhead: 'BUREAUCRACY chatter redirected into a resilience coaching session.',
    byline: 'By: Acting Transparency Liaison 325',
    body: `Bureau of Plausible Events noted Department of Denials Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Department of Denials into a pep talk for fluorescent bulbs. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of department of denials paperwork; windowless conference room shadows',
    tags: ['attack', 'bureaucracy', 'coverup', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 325',
    followUpHooks: [
      'Acting Transparency Liaison 325 circulates a confidence memo on "DEPARTMENT OF DENIALS FLAGGED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-062',
    faction: 'government',
    headline: 'KRYCEK THE DOUBLE AGENT FLAGGED AS SCHEDULED SYSTEM TEST',
    subhead: 'Agency memo labels Krycek the Double Agent "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 169',
    body: `Continuity Desk noted Krycek the Double Agent reclassified as a motivational strobe for authorized personnel only. Incident clock reset once Krycek the Double Agent matched the national anthem tempo. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of krycek the double agent paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 169',
    followUpHooks: [
      'Interim Briefing Lead 169 circulates a confidence memo on "KRYCEK THE DOUBLE AGENT FLAGGED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-063',
    faction: 'government',
    headline: 'ETERNAL COMMITTEE HEARING LOGGED AS ATTACK AWARENESS DRILL',
    subhead: 'Briefing assures stakeholders Eternal Committee Hearing remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 587',
    body: `Emergency Normalcy Unit noted Eternal Committee Hearing Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Eternal Committee Hearing into a pep talk for fluorescent bulbs. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of eternal committee hearing paperwork; agents refusing to react',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 587',
    followUpHooks: [
      'Acting Transparency Liaison 587 circulates a confidence memo on "ETERNAL COMMITTEE HEARING LOGGED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-064',
    faction: 'government',
    headline: 'BIG BROTHER SURVEILLANCE DESIGNATED STANDARD PUBLIC OUTREACH',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Big Brother Surveillance marked as scenic.',
    byline: 'By: Deputy Plausibility Analyst 190',
    body: `Compliance Chorus noted Big Brother Surveillance mapped as an inspirational seating area during fiscal reviews. Safety cones around Big Brother Surveillance now display motivational quotes. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of big brother surveillance paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 190',
    followUpHooks: [
      'Deputy Plausibility Analyst 190 circulates a confidence memo on "BIG BROTHER SURVEILLANCE DESIGNATED STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-065',
    faction: 'government',
    headline: 'AGENT SMITHERSON CAMEO LOGGED AS SCHEDULED SYSTEM TEST',
    subhead: 'Briefing assures stakeholders Agent Smitherson Cameo remains a morale exercise pending future paperwork.',
    byline: 'By: Narrative Alignment Clerk 428',
    body: `Emergency Normalcy Unit noted Agent Smitherson Cameo reassigned to parade rehearsal inventory. Logistics converted Agent Smitherson Cameo into a mandatory wellness webinar. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of agent smitherson cameo paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 428',
    followUpHooks: [
      'Narrative Alignment Clerk 428 circulates a confidence memo on "AGENT SMITHERSON CAMEO LOGGED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-066',
    faction: 'government',
    headline: 'UNDERGROUND ARCHIVE RECORDED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Transit alerts call Underground Archive a temporary civic glow event.',
    byline: 'By: Interim Briefing Lead 751',
    body: `Continuity Desk noted Underground Archive mapped as an inspirational seating area during fiscal reviews. Urban planners labelled Underground Archive an "inspiration cul-de-sac". Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of underground archive paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 751',
    followUpHooks: [
      'Interim Briefing Lead 751 circulates a confidence memo on "UNDERGROUND ARCHIVE RECORDED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-067',
    faction: 'government',
    headline: 'SPIN CONTROL OFFICE INDEXED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Communications office redacts Spin Control Office into three tasteful bullet points.',
    byline: 'By: Narrative Alignment Clerk 363',
    body: `Narrative Harmonization Taskforce noted Spin Control Office All footage of muted and republished as a weather loop. Tone analysis concluded Spin Control Office qualifies as light jazz for procurement. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of spin control office paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 363',
    followUpHooks: [
      'Narrative Alignment Clerk 363 circulates a confidence memo on "SPIN CONTROL OFFICE INDEXED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-068',
    faction: 'government',
    headline: 'CRASH RETRIEVAL ZONE DESIGNATED STANDARD PUBLIC OUTREACH',
    subhead: 'Transit alerts call Crash Retrieval Zone a temporary civic glow event.',
    byline: 'By: Compliance Officer 545',
    body: `Continuity Desk noted Crash Retrieval Zone granted conditional zoning as a meditation cul-de-sac. Safety cones around Crash Retrieval Zone now display motivational quotes. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of crash retrieval zone paperwork; clipboards and sealed envelopes',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 545',
    followUpHooks: [
      'Compliance Officer 545 circulates a confidence memo on "CRASH RETRIEVAL ZONE DESIGNATED STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-069',
    faction: 'government',
    headline: 'CLOSED SESSION APPENDED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Narrative Alignment Clerk 378',
    body: `Office of Strategic Calm noted Closed Session converted into an internal podcast with a seven-listener limit. Archivists looped Closed Session behind a "technical difficulties" slate. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of closed session paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 378',
    followUpHooks: [
      'Narrative Alignment Clerk 378 circulates a confidence memo on "CLOSED SESSION APPENDED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-070',
    faction: 'government',
    headline: 'PSYCH OPS LAB RECORDED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Logbook records Psych Ops Lab as landscaping maintenance with optional cones.',
    byline: 'By: Acting Transparency Liaison 835',
    body: `Emergency Normalcy Unit noted Psych Ops Lab Maintenance logs retitled as "fog machine calibration". Facilities added Psych Ops Lab to the scenic detour brochure. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of psych ops lab paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 835',
    followUpHooks: [
      'Acting Transparency Liaison 835 circulates a confidence memo on "PSYCH OPS LAB RECORDED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-071',
    faction: 'government',
    headline: 'RED PHONE NETWORK FILED AS SCHEDULED SYSTEM TEST',
    subhead: 'Agency memo labels Red Phone Network "pep rally noise" and moves on.',
    byline: 'By: Deputy Plausibility Analyst 869',
    body: `Bureau of Plausible Events noted Red Phone Network reassigned to parade rehearsal inventory. Surveillance audio translated Red Phone Network into a pep talk for fluorescent bulbs. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of red phone network paperwork; security camera angle slightly askew',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 869',
    followUpHooks: [
      'Deputy Plausibility Analyst 869 circulates a confidence memo on "RED PHONE NETWORK FILED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-072',
    faction: 'government',
    headline: 'CONTAINMENT ZONE CATALOGUED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Logbook records Containment Zone as landscaping maintenance with optional cones.',
    byline: 'By: Compliance Officer 245',
    body: `Emergency Normalcy Unit noted Containment Zone mapped as an inspirational seating area during fiscal reviews. Facilities added Containment Zone to the scenic detour brochure. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of containment zone paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 245',
    followUpHooks: [
      'Compliance Officer 245 circulates a confidence memo on "CONTAINMENT ZONE CATALOGUED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-073',
    faction: 'government',
    headline: 'OBFUSCATION BUREAU NOTED AS SECTION 12-C PROCEDURE',
    subhead: 'Agency memo labels Obfuscation Bureau "pep rally noise" and moves on.',
    byline: 'By: Narrative Alignment Clerk 272',
    body: `Civic Atmospherics Lab noted Obfuscation Bureau Witness statements stapled into a morale binder labelled "do not open". Logistics converted Obfuscation Bureau into a mandatory wellness webinar. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of obfuscation bureau paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'bureaucracy', 'coverup', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 272',
    followUpHooks: [
      'Narrative Alignment Clerk 272 circulates a confidence memo on "OBFUSCATION BUREAU NOTED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-074',
    faction: 'government',
    headline: 'FOIA SHREDDER ROOM RECORDED AS SCHEDULED SYSTEM TEST',
    subhead: 'Logbook records FOIA Shredder Room as landscaping maintenance with optional cones.',
    byline: 'By: Acting Transparency Liaison 260',
    body: `Emergency Normalcy Unit noted FOIA Shredder Room granted conditional zoning as a meditation cul-de-sac. Urban planners labelled FOIA Shredder Room an "inspiration cul-de-sac". Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of foia shredder room paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 260',
    followUpHooks: [
      'Acting Transparency Liaison 260 circulates a confidence memo on "FOIA SHREDDER ROOM RECORDED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-075',
    faction: 'government',
    headline: 'NATIONAL GUARD ROLLOUT LOGGED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Agency memo labels National Guard Rollout "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 100',
    body: `Bureau of Plausible Events noted National Guard Rollout reassigned to parade rehearsal inventory. Surveillance audio translated National Guard Rollout into a pep talk for fluorescent bulbs. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of national guard rollout paperwork; agents refusing to react',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 100',
    followUpHooks: [
      'Interim Briefing Lead 100 circulates a confidence memo on "NATIONAL GUARD ROLLOUT LOGGED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-076',
    faction: 'government',
    headline: 'REDACTION VAULT CATALOGUED AS SECTION 12-C PROCEDURE',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Redaction Vault marked as scenic.',
    byline: 'By: Compliance Officer 346',
    body: `Continuity Desk noted Redaction Vault Maintenance logs retitled as "fog machine calibration". Safety cones around Redaction Vault now display motivational quotes. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of redaction vault paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 346',
    followUpHooks: [
      'Compliance Officer 346 circulates a confidence memo on "REDACTION VAULT CATALOGUED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-077',
    faction: 'government',
    headline: 'SATELLITE UPLINK ZONED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Satellite Uplink marked as scenic.',
    byline: 'By: Compliance Officer 499',
    body: `Emergency Normalcy Unit noted Satellite Uplink granted conditional zoning as a meditation cul-de-sac. Safety cones around Satellite Uplink now display motivational quotes. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of satellite uplink paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 499',
    followUpHooks: [
      'Compliance Officer 499 circulates a confidence memo on "SATELLITE UPLINK ZONED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-078',
    faction: 'government',
    headline: 'POLITICAL LOBBY FLAGGED AS SCHEDULED SYSTEM TEST',
    subhead: 'Agency memo labels Political Lobby "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 416',
    body: `Civic Atmospherics Lab noted Political Lobby Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once Political Lobby matched the national anthem tempo. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of political lobby paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 416',
    followUpHooks: [
      'Interim Briefing Lead 416 circulates a confidence memo on "POLITICAL LOBBY FLAGGED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-079',
    faction: 'government',
    headline: 'CRISIS MANAGEMENT ZONE DESIGNATED SCHEDULED SYSTEM TEST',
    subhead: 'Transit alerts call Crisis Management Zone a temporary civic glow event.',
    byline: 'By: Acting Transparency Liaison 352',
    body: `Emergency Normalcy Unit noted Crisis Management Zone Maintenance logs retitled as "fog machine calibration". Safety cones around Crisis Management Zone now display motivational quotes. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of crisis management zone paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 352',
    followUpHooks: [
      'Acting Transparency Liaison 352 circulates a confidence memo on "CRISIS MANAGEMENT ZONE DESIGNATED SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-080',
    faction: 'government',
    headline: 'CONTINUITY BUNKER ZONED AS SCHEDULED SYSTEM TEST',
    subhead: 'Logbook records Continuity Bunker as landscaping maintenance with optional cones.',
    byline: 'By: Interim Briefing Lead 532',
    body: `Continuity Desk noted Continuity Bunker granted conditional zoning as a meditation cul-de-sac. Safety cones around Continuity Bunker now display motivational quotes. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of continuity bunker paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 532',
    followUpHooks: [
      'Interim Briefing Lead 532 circulates a confidence memo on "CONTINUITY BUNKER ZONED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-081',
    faction: 'government',
    headline: 'SPIN DOCTORS\' LOUNGE ARCHIVED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Spin Doctors\' Lounge folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Deputy Plausibility Analyst 490',
    body: `Bureau of Plausible Events noted Spin Doctors' Lounge synced with the hold music archive for quality assurance. Transcripts of Spin Doctors' Lounge now circulate as mindfulness affirmations. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of spin doctors\' lounge paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 490',
    followUpHooks: [
      'Deputy Plausibility Analyst 490 circulates a confidence memo on "SPIN DOCTORS\' LOUNGE ARCHIVED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-082',
    faction: 'government',
    headline: 'FEDERAL PSYOPS CENTER RECORDED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Transit alerts call Federal PsyOps Center a temporary civic glow event.',
    byline: 'By: Compliance Officer 141',
    body: `Compliance Chorus noted Federal PsyOps Center mapped as an inspirational seating area during fiscal reviews. Safety cones around Federal PsyOps Center now display motivational quotes. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of federal psyops center paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 141',
    followUpHooks: [
      'Compliance Officer 141 circulates a confidence memo on "FEDERAL PSYOPS CENTER RECORDED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-083',
    faction: 'government',
    headline: 'TEMPORAL CONTAINMENT LAB ZONED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Transit alerts call Temporal Containment Lab a temporary civic glow event.',
    byline: 'By: Deputy Plausibility Analyst 358',
    body: `Office of Strategic Calm noted Temporal Containment Lab mapped as an inspirational seating area during fiscal reviews. Safety cones around Temporal Containment Lab now display motivational quotes. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of temporal containment lab paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 358',
    followUpHooks: [
      'Deputy Plausibility Analyst 358 circulates a confidence memo on "TEMPORAL CONTAINMENT LAB ZONED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-084',
    faction: 'government',
    headline: 'COUNCIL OF THE UNSEEN LOGGED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Agency memo labels Council of the Unseen "pep rally noise" and moves on.',
    byline: 'By: Deputy Plausibility Analyst 837',
    body: `Office of Strategic Calm noted Council of the Unseen Witness statements stapled into a morale binder labelled "do not open". Logistics converted Council of the Unseen into a mandatory wellness webinar. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of council of the unseen paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 837',
    followUpHooks: [
      'Deputy Plausibility Analyst 837 circulates a confidence memo on "COUNCIL OF THE UNSEEN LOGGED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-085',
    faction: 'government',
    headline: 'FRONT ORGANIZATION RECORDED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Front Organization marked as scenic.',
    byline: 'By: Deputy Plausibility Analyst 687',
    body: `Emergency Normalcy Unit noted Front Organization mapped as an inspirational seating area during fiscal reviews. Urban planners labelled Front Organization an "inspiration cul-de-sac". Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of front organization paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 687',
    followUpHooks: [
      'Deputy Plausibility Analyst 687 circulates a confidence memo on "FRONT ORGANIZATION RECORDED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-086',
    faction: 'government',
    headline: 'CONTROLLED MEDIA OUTLET ARCHIVED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Narrative Alignment Clerk 593',
    body: `Emergency Normalcy Unit noted Controlled Media Outlet converted into an internal podcast with a seven-listener limit. Transcripts of Controlled Media Outlet now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of controlled media outlet paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 593',
    followUpHooks: [
      'Narrative Alignment Clerk 593 circulates a confidence memo on "CONTROLLED MEDIA OUTLET ARCHIVED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-087',
    faction: 'government',
    headline: 'CONTINUITY OF MESSAGE CLASSIFIED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Communications office redacts Continuity of Message into three tasteful bullet points.',
    byline: 'By: Deputy Plausibility Analyst 917',
    body: `Office of Strategic Calm noted Continuity of Message synced with the hold music archive for quality assurance. Archivists looped Continuity of Message behind a "technical difficulties" slate. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of continuity of message paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 917',
    followUpHooks: [
      'Deputy Plausibility Analyst 917 circulates a confidence memo on "CONTINUITY OF MESSAGE CLASSIFIED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-088',
    faction: 'government',
    headline: 'SURPLUS MRAP PARADE FLAGGED AS PERFORMANCE REVIEW ITEM',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Compliance Officer 765',
    body: `Bureau of Plausible Events noted Surplus MRAP Parade reassigned to parade rehearsal inventory. Surveillance audio translated Surplus MRAP Parade into a pep talk for fluorescent bulbs. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of surplus mrap parade paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 765',
    followUpHooks: [
      'Compliance Officer 765 circulates a confidence memo on "SURPLUS MRAP PARADE FLAGGED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-089',
    faction: 'government',
    headline: 'CONTINUITY SERVERS RECORDED AS SCHEDULED SYSTEM TEST',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Continuity Servers marked as scenic.',
    byline: 'By: Narrative Alignment Clerk 496',
    body: `Emergency Normalcy Unit noted Continuity Servers Maintenance logs retitled as "fog machine calibration". Urban planners labelled Continuity Servers an "inspiration cul-de-sac". Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of continuity servers paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 496',
    followUpHooks: [
      'Narrative Alignment Clerk 496 circulates a confidence memo on "CONTINUITY SERVERS RECORDED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-090',
    faction: 'government',
    headline: 'AIRPORT MEDIA PEN ZONED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Transit alerts call Airport Media Pen a temporary civic glow event.',
    byline: 'By: Compliance Officer 345',
    body: `Emergency Normalcy Unit noted Airport Media Pen granted conditional zoning as a meditation cul-de-sac. Safety cones around Airport Media Pen now display motivational quotes. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of airport media pen paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 345',
    followUpHooks: [
      'Compliance Officer 345 circulates a confidence memo on "AIRPORT MEDIA PEN ZONED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-091',
    faction: 'government',
    headline: 'COMPLIANCE AUDIT FLAGGED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Briefing assures stakeholders Compliance Audit remains a morale exercise pending future paperwork.',
    byline: 'By: Narrative Alignment Clerk 428',
    body: `Compliance Chorus noted Compliance Audit reclassified as a motivational strobe for authorized personnel only. Incident clock reset once Compliance Audit matched the national anthem tempo. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of compliance audit paperwork; security camera angle slightly askew',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 428',
    followUpHooks: [
      'Narrative Alignment Clerk 428 circulates a confidence memo on "COMPLIANCE AUDIT FLAGGED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-092',
    faction: 'government',
    headline: 'CONTINUITY SIGNAL TEST CLASSIFIED AS SCHEDULED SYSTEM TEST',
    subhead: 'Communications office redacts Continuity Signal Test into three tasteful bullet points.',
    byline: 'By: Compliance Officer 487',
    body: `Continuity Desk noted Continuity Signal Test synced with the hold music archive for quality assurance. Archivists looped Continuity Signal Test behind a "technical difficulties" slate. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of continuity signal test paperwork; clipboards and sealed envelopes',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 487',
    followUpHooks: [
      'Compliance Officer 487 circulates a confidence memo on "CONTINUITY SIGNAL TEST CLASSIFIED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-093',
    faction: 'government',
    headline: 'PERIMETER CAMERAS ZONED AS SECTION 12-C PROCEDURE',
    subhead: 'Transit alerts call Perimeter Cameras a temporary civic glow event.',
    byline: 'By: Deputy Plausibility Analyst 107',
    body: `Continuity Desk noted Perimeter Cameras granted conditional zoning as a meditation cul-de-sac. Facilities added Perimeter Cameras to the scenic detour brochure. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of perimeter cameras paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 107',
    followUpHooks: [
      'Deputy Plausibility Analyst 107 circulates a confidence memo on "PERIMETER CAMERAS ZONED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-094',
    faction: 'government',
    headline: 'LEAKER\'S NEW JOB NOTED AS SCHEDULED SYSTEM TEST',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Compliance Officer 278',
    body: `Bureau of Plausible Events noted Leaker's New Job reclassified as a motivational strobe for authorized personnel only. Logistics converted Leaker's New Job into a mandatory wellness webinar. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of leaker\'s new job paperwork; security camera angle slightly askew',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 278',
    followUpHooks: [
      'Compliance Officer 278 circulates a confidence memo on "LEAKER\'S NEW JOB NOTED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-095',
    faction: 'government',
    headline: 'DATA FUSION HUB CATALOGUED AS SECTION 12-C PROCEDURE',
    subhead: 'Logbook records Data Fusion Hub as landscaping maintenance with optional cones.',
    byline: 'By: Acting Transparency Liaison 469',
    body: `Bureau of Plausible Events noted Data Fusion Hub mapped as an inspirational seating area during fiscal reviews. Facilities added Data Fusion Hub to the scenic detour brochure. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of data fusion hub paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 469',
    followUpHooks: [
      'Acting Transparency Liaison 469 circulates a confidence memo on "DATA FUSION HUB CATALOGUED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-096',
    faction: 'government',
    headline: 'DRY-LABBED RESULTS APPENDED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Deputy Plausibility Analyst 183',
    body: `Civic Atmospherics Lab noted Dry-Labbed Results All footage of muted and republished as a weather loop. Transcripts of Dry-Labbed Results now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of dry-labbed results paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 183',
    followUpHooks: [
      'Deputy Plausibility Analyst 183 circulates a confidence memo on "DRY-LABBED RESULTS APPENDED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-097',
    faction: 'government',
    headline: 'WILDERNESS LISTENING POST DESIGNATED PERFORMANCE REVIEW ITEM',
    subhead: 'Logbook records Wilderness Listening Post as landscaping maintenance with optional cones.',
    byline: 'By: Compliance Officer 180',
    body: `Civic Atmospherics Lab noted Wilderness Listening Post mapped as an inspirational seating area during fiscal reviews. Facilities added Wilderness Listening Post to the scenic detour brochure. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of wilderness listening post paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 180',
    followUpHooks: [
      'Compliance Officer 180 circulates a confidence memo on "WILDERNESS LISTENING POST DESIGNATED PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-098',
    faction: 'government',
    headline: 'NATIONAL SECURITY LETTER LOGGED AS STANDARD PUBLIC OUTREACH',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Interim Briefing Lead 924',
    body: `Compliance Chorus noted National Security Letter reassigned to parade rehearsal inventory. Surveillance audio translated National Security Letter into a pep talk for fluorescent bulbs. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of national security letter paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 924',
    followUpHooks: [
      'Interim Briefing Lead 924 circulates a confidence memo on "NATIONAL SECURITY LETTER LOGGED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-099',
    faction: 'government',
    headline: 'ASSET LAUNDERING CATALOGUED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Asset Laundering marked as scenic.',
    byline: 'By: Narrative Alignment Clerk 774',
    body: `Continuity Desk noted Asset Laundering mapped as an inspirational seating area during fiscal reviews. Safety cones around Asset Laundering now display motivational quotes. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of asset laundering paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 774',
    followUpHooks: [
      'Narrative Alignment Clerk 774 circulates a confidence memo on "ASSET LAUNDERING CATALOGUED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-100',
    faction: 'government',
    headline: 'HARBOR DOCK WAREHOUSE CATALOGUED AS SCHEDULED SYSTEM TEST',
    subhead: 'Transit alerts call Harbor Dock Warehouse a temporary civic glow event.',
    byline: 'By: Interim Briefing Lead 585',
    body: `Bureau of Plausible Events noted Harbor Dock Warehouse Maintenance logs retitled as "fog machine calibration". Safety cones around Harbor Dock Warehouse now display motivational quotes. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of harbor dock warehouse paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 585',
    followUpHooks: [
      'Interim Briefing Lead 585 circulates a confidence memo on "HARBOR DOCK WAREHOUSE CATALOGUED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-101',
    faction: 'government',
    headline: 'MAN WITH THE MATCH APPENDED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Communications office redacts Man with the Match into three tasteful bullet points.',
    byline: 'By: Interim Briefing Lead 126',
    body: `Narrative Harmonization Taskforce noted Man with the Match converted into an internal podcast with a seven-listener limit. Archivists looped Man with the Match behind a "technical difficulties" slate. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of man with the match paperwork; clipboards and sealed envelopes',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 126',
    followUpHooks: [
      'Interim Briefing Lead 126 circulates a confidence memo on "MAN WITH THE MATCH APPENDED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-102',
    faction: 'government',
    headline: 'LEFT-HANDED PARTNER FLAGGED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Briefing assures stakeholders Left-Handed Partner remains a morale exercise pending future paperwork.',
    byline: 'By: Interim Briefing Lead 424',
    body: `Civic Atmospherics Lab noted Left-Handed Partner Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once Left-Handed Partner matched the national anthem tempo. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of left-handed partner paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 424',
    followUpHooks: [
      'Interim Briefing Lead 424 circulates a confidence memo on "LEFT-HANDED PARTNER FLAGGED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-103',
    faction: 'government',
    headline: 'SUBCOMMITTEE X ARCHIVED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Communications office redacts Subcommittee X into three tasteful bullet points.',
    byline: 'By: Compliance Officer 115',
    body: `Narrative Harmonization Taskforce noted Subcommittee X All footage of muted and republished as a weather loop. Tone analysis concluded Subcommittee X qualifies as light jazz for procurement. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of subcommittee x paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 115',
    followUpHooks: [
      'Compliance Officer 115 circulates a confidence memo on "SUBCOMMITTEE X ARCHIVED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-104',
    faction: 'government',
    headline: 'DEEP MOTOR POOL RECORDED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Deep Motor Pool marked as scenic.',
    byline: 'By: Compliance Officer 798',
    body: `Narrative Harmonization Taskforce noted Deep Motor Pool granted conditional zoning as a meditation cul-de-sac. Urban planners labelled Deep Motor Pool an "inspiration cul-de-sac". Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of deep motor pool paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 798',
    followUpHooks: [
      'Compliance Officer 798 circulates a confidence memo on "DEEP MOTOR POOL RECORDED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-105',
    faction: 'government',
    headline: 'CUTOUTS AND COVER NAMES NOTED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Briefing assures stakeholders Cutouts and Cover Names remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 448',
    body: `Compliance Chorus noted Cutouts and Cover Names reclassified as a motivational strobe for authorized personnel only. Surveillance audio translated Cutouts and Cover Names into a pep talk for fluorescent bulbs. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of cutouts and cover names paperwork; agents refusing to react',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 448',
    followUpHooks: [
      'Acting Transparency Liaison 448 circulates a confidence memo on "CUTOUTS AND COVER NAMES NOTED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-106',
    faction: 'government',
    headline: 'ROUTINE SATELLITE TEST ARCHIVED AS SECTION 12-C PROCEDURE',
    subhead: 'Routine Satellite Test folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Compliance Officer 506',
    body: `Compliance Chorus noted Routine Satellite Test synced with the hold music archive for quality assurance. Archivists looped Routine Satellite Test behind a "technical difficulties" slate. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of routine satellite test paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 506',
    followUpHooks: [
      'Compliance Officer 506 circulates a confidence memo on "ROUTINE SATELLITE TEST ARCHIVED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-107',
    faction: 'government',
    headline: 'DOCUMENT SANITIZATION BAY DESIGNATED SCHEDULED SYSTEM TEST',
    subhead: 'Logbook records Document Sanitization Bay as landscaping maintenance with optional cones.',
    byline: 'By: Narrative Alignment Clerk 432',
    body: `Office of Strategic Calm noted Document Sanitization Bay Maintenance logs retitled as "fog machine calibration". Facilities added Document Sanitization Bay to the scenic detour brochure. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of document sanitization bay paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 432',
    followUpHooks: [
      'Narrative Alignment Clerk 432 circulates a confidence memo on "DOCUMENT SANITIZATION BAY DESIGNATED SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-108',
    faction: 'government',
    headline: 'JOINT TASK FORCE: OPTICS INDEXED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Communications office redacts Joint Task Force: Optics into three tasteful bullet points.',
    byline: 'By: Interim Briefing Lead 234',
    body: `Narrative Harmonization Taskforce noted Joint Task Force: Optics synced with the hold music archive for quality assurance. Archivists looped Joint Task Force: Optics behind a "technical difficulties" slate. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of joint task force: optics paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 234',
    followUpHooks: [
      'Interim Briefing Lead 234 circulates a confidence memo on "JOINT TASK FORCE: OPTICS INDEXED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-109',
    faction: 'government',
    headline: 'ASSET RELOCATION RECORDED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Logbook records Asset Relocation as landscaping maintenance with optional cones.',
    byline: 'By: Interim Briefing Lead 149',
    body: `Civic Atmospherics Lab noted Asset Relocation granted conditional zoning as a meditation cul-de-sac. Urban planners labelled Asset Relocation an "inspiration cul-de-sac". Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of asset relocation paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 149',
    followUpHooks: [
      'Interim Briefing Lead 149 circulates a confidence memo on "ASSET RELOCATION RECORDED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-110',
    faction: 'government',
    headline: 'DESERT LISTENING ARRAY DESIGNATED SECTION 12-C PROCEDURE',
    subhead: 'Transit alerts call Desert Listening Array a temporary civic glow event.',
    byline: 'By: Interim Briefing Lead 741',
    body: `Narrative Harmonization Taskforce noted Desert Listening Array granted conditional zoning as a meditation cul-de-sac. Urban planners labelled Desert Listening Array an "inspiration cul-de-sac". Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of desert listening array paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 741',
    followUpHooks: [
      'Interim Briefing Lead 741 circulates a confidence memo on "DESERT LISTENING ARRAY DESIGNATED SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-111',
    faction: 'government',
    headline: 'COMPLIANCE ARCHITECTURE LOGGED AS SECTION 12-C PROCEDURE',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Narrative Alignment Clerk 344',
    body: `Continuity Desk noted Compliance Architecture Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Compliance Architecture into a pep talk for fluorescent bulbs. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of compliance architecture paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 344',
    followUpHooks: [
      'Narrative Alignment Clerk 344 circulates a confidence memo on "COMPLIANCE ARCHITECTURE LOGGED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-112',
    faction: 'government',
    headline: 'FEDERALIZATION ORDER FLAGGED AS ATTACK AWARENESS DRILL',
    subhead: 'Briefing assures stakeholders Federalization Order remains a morale exercise pending future paperwork.',
    byline: 'By: Interim Briefing Lead 920',
    body: `Civic Atmospherics Lab noted Federalization Order Witness statements stapled into a morale binder labelled "do not open". Logistics converted Federalization Order into a mandatory wellness webinar. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of federalization order paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 920',
    followUpHooks: [
      'Interim Briefing Lead 920 circulates a confidence memo on "FEDERALIZATION ORDER FLAGGED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-113',
    faction: 'government',
    headline: 'SUBTERRANEAN TRAM ZONED AS SECTION 12-C PROCEDURE',
    subhead: 'Logbook records Subterranean Tram as landscaping maintenance with optional cones.',
    byline: 'By: Compliance Officer 151',
    body: `Emergency Normalcy Unit noted Subterranean Tram granted conditional zoning as a meditation cul-de-sac. Safety cones around Subterranean Tram now display motivational quotes. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of subterranean tram paperwork; clipboards and sealed envelopes',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 151',
    followUpHooks: [
      'Compliance Officer 151 circulates a confidence memo on "SUBTERRANEAN TRAM ZONED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-114',
    faction: 'government',
    headline: 'CREDIBLE SOURCE PROGRAM CLASSIFIED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Credible Source Program folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Compliance Officer 442',
    body: `Office of Strategic Calm noted Credible Source Program synced with the hold music archive for quality assurance. Tone analysis concluded Credible Source Program qualifies as light jazz for procurement. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of credible source program paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 442',
    followUpHooks: [
      'Compliance Officer 442 circulates a confidence memo on "CREDIBLE SOURCE PROGRAM CLASSIFIED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-115',
    faction: 'government',
    headline: 'INTELLIGENCE REPROGRAMMING APPENDED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Interim Briefing Lead 215',
    body: `Continuity Desk noted Intelligence Reprogramming All footage of muted and republished as a weather loop. Transcripts of Intelligence Reprogramming now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of intelligence reprogramming paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 215',
    followUpHooks: [
      'Interim Briefing Lead 215 circulates a confidence memo on "INTELLIGENCE REPROGRAMMING APPENDED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-116',
    faction: 'government',
    headline: 'RUNWAY HANGAR C DESIGNATED ROUTINE LOCATION MITIGATION',
    subhead: 'Transit alerts call Runway Hangar C a temporary civic glow event.',
    byline: 'By: Interim Briefing Lead 439',
    body: `Bureau of Plausible Events noted Runway Hangar C mapped as an inspirational seating area during fiscal reviews. Urban planners labelled Runway Hangar C an "inspiration cul-de-sac". Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of runway hangar c paperwork; agents refusing to react',
    tags: ['government', 'location', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 439',
    followUpHooks: [
      'Interim Briefing Lead 439 circulates a confidence memo on "RUNWAY HANGAR C DESIGNATED ROUTINE LOCATION MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-117',
    faction: 'government',
    headline: 'RED TEAM LEAK DRILL LOGGED AS ATTACK AWARENESS DRILL',
    subhead: 'Briefing assures stakeholders Red Team Leak Drill remains a morale exercise pending future paperwork.',
    byline: 'By: Interim Briefing Lead 532',
    body: `Compliance Chorus noted Red Team Leak Drill reclassified as a motivational strobe for authorized personnel only. Logistics converted Red Team Leak Drill into a mandatory wellness webinar. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of red team leak drill paperwork; security camera angle slightly askew',
    tags: ['attack', 'government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 532',
    followUpHooks: [
      'Interim Briefing Lead 532 circulates a confidence memo on "RED TEAM LEAK DRILL LOGGED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-118',
    faction: 'government',
    headline: 'BLACK LEDGER LOGGED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Briefing assures stakeholders Black Ledger remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 400',
    body: `Office of Strategic Calm noted Black Ledger reclassified as a motivational strobe for authorized personnel only. Incident clock reset once Black Ledger matched the national anthem tempo. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of black ledger paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 400',
    followUpHooks: [
      'Acting Transparency Liaison 400 circulates a confidence memo on "BLACK LEDGER LOGGED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-119',
    faction: 'government',
    headline: 'HARBOR QUARANTINE PIER CATALOGUED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Logbook records Harbor Quarantine Pier as landscaping maintenance with optional cones.',
    byline: 'By: Interim Briefing Lead 548',
    body: `Compliance Chorus noted Harbor Quarantine Pier Maintenance logs retitled as "fog machine calibration". Urban planners labelled Harbor Quarantine Pier an "inspiration cul-de-sac". Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of harbor quarantine pier paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 548',
    followUpHooks: [
      'Interim Briefing Lead 548 circulates a confidence memo on "HARBOR QUARANTINE PIER CATALOGUED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-120',
    faction: 'government',
    headline: 'CLEARANCE REVOKED LOGGED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Agency memo labels Clearance Revoked "pep rally noise" and moves on.',
    byline: 'By: Narrative Alignment Clerk 765',
    body: `Continuity Desk noted Clearance Revoked Witness statements stapled into a morale binder labelled "do not open". Logistics converted Clearance Revoked into a mandatory wellness webinar. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of clearance revoked paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 765',
    followUpHooks: [
      'Narrative Alignment Clerk 765 circulates a confidence memo on "CLEARANCE REVOKED LOGGED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-121',
    faction: 'government',
    headline: 'ASSET FORFEITURE SWEEP FILED AS SECTION 12-C PROCEDURE',
    subhead: 'Agency memo labels Asset Forfeiture Sweep "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 779',
    body: `Compliance Chorus noted Asset Forfeiture Sweep reclassified as a motivational strobe for authorized personnel only. Logistics converted Asset Forfeiture Sweep into a mandatory wellness webinar. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of asset forfeiture sweep paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 779',
    followUpHooks: [
      'Interim Briefing Lead 779 circulates a confidence memo on "ASSET FORFEITURE SWEEP FILED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-122',
    faction: 'government',
    headline: 'RECORDS SUSPENSION WING CATALOGUED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Transit alerts call Records Suspension Wing a temporary civic glow event.',
    byline: 'By: Acting Transparency Liaison 492',
    body: `Compliance Chorus noted Records Suspension Wing Maintenance logs retitled as "fog machine calibration". Urban planners labelled Records Suspension Wing an "inspiration cul-de-sac". Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of records suspension wing paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 492',
    followUpHooks: [
      'Acting Transparency Liaison 492 circulates a confidence memo on "RECORDS SUSPENSION WING CATALOGUED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-123',
    faction: 'government',
    headline: 'PRESS CREDENTIALS REVIEW INDEXED AS SECTION 12-C PROCEDURE',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Acting Transparency Liaison 988',
    body: `Narrative Harmonization Taskforce noted Press Credentials Review converted into an internal podcast with a seven-listener limit. Transcripts of Press Credentials Review now circulate as mindfulness affirmations. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of press credentials review paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 988',
    followUpHooks: [
      'Acting Transparency Liaison 988 circulates a confidence memo on "PRESS CREDENTIALS REVIEW INDEXED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-124',
    faction: 'government',
    headline: 'NARRATIVE HARMONIZATION CLASSIFIED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Narrative Alignment Clerk 621',
    body: `Continuity Desk noted Narrative Harmonization synced with the hold music archive for quality assurance. Transcripts of Narrative Harmonization now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of narrative harmonization paperwork; redacted paperwork stacks',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 621',
    followUpHooks: [
      'Narrative Alignment Clerk 621 circulates a confidence memo on "NARRATIVE HARMONIZATION CLASSIFIED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-125',
    faction: 'government',
    headline: 'REMOTE HEARING ROOM ZONED AS SECTION 12-C PROCEDURE',
    subhead: 'Logbook records Remote Hearing Room as landscaping maintenance with optional cones.',
    byline: 'By: Acting Transparency Liaison 165',
    body: `Civic Atmospherics Lab noted Remote Hearing Room Maintenance logs retitled as "fog machine calibration". Safety cones around Remote Hearing Room now display motivational quotes. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of remote hearing room paperwork; clipboards and sealed envelopes',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 165',
    followUpHooks: [
      'Acting Transparency Liaison 165 circulates a confidence memo on "REMOTE HEARING ROOM ZONED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-126',
    faction: 'government',
    headline: 'COMPELLED TESTIMONY LOGGED AS SECTION 12-C PROCEDURE',
    subhead: 'Briefing assures stakeholders Compelled Testimony remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 207',
    body: `Bureau of Plausible Events noted Compelled Testimony Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Compelled Testimony into a pep talk for fluorescent bulbs. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of compelled testimony paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 207',
    followUpHooks: [
      'Acting Transparency Liaison 207 circulates a confidence memo on "COMPELLED TESTIMONY LOGGED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-127',
    faction: 'government',
    headline: 'CONTINUITY OF NARRATIVE CLASSIFIED AS SCHEDULED SYSTEM TEST',
    subhead: 'Continuity of Narrative folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Acting Transparency Liaison 773',
    body: `Bureau of Plausible Events noted Continuity of Narrative All footage of muted and republished as a weather loop. Transcripts of Continuity of Narrative now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of continuity of narrative paperwork; clipboards and sealed envelopes',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 773',
    followUpHooks: [
      'Acting Transparency Liaison 773 circulates a confidence memo on "CONTINUITY OF NARRATIVE CLASSIFIED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-128',
    faction: 'government',
    headline: 'AQUIFER SENSOR FARM ZONED AS SCHEDULED SYSTEM TEST',
    subhead: 'Logbook records Aquifer Sensor Farm as landscaping maintenance with optional cones.',
    byline: 'By: Compliance Officer 195',
    body: `Narrative Harmonization Taskforce noted Aquifer Sensor Farm mapped as an inspirational seating area during fiscal reviews. Facilities added Aquifer Sensor Farm to the scenic detour brochure. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of aquifer sensor farm paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 195',
    followUpHooks: [
      'Compliance Officer 195 circulates a confidence memo on "AQUIFER SENSOR FARM ZONED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-129',
    faction: 'government',
    headline: 'STRATEGIC DENIAL NOTED AS ATTACK AWARENESS DRILL',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Acting Transparency Liaison 490',
    body: `Office of Strategic Calm noted Strategic Denial reassigned to parade rehearsal inventory. Surveillance audio translated Strategic Denial into a pep talk for fluorescent bulbs. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of strategic denial paperwork; security camera angle slightly askew',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 490',
    followUpHooks: [
      'Acting Transparency Liaison 490 circulates a confidence memo on "STRATEGIC DENIAL NOTED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-130',
    faction: 'government',
    headline: 'ROUTINE SYSTEMS UPGRADE FILED AS SECTION 12-C PROCEDURE',
    subhead: 'Briefing assures stakeholders Routine Systems Upgrade remains a morale exercise pending future paperwork.',
    byline: 'By: Deputy Plausibility Analyst 523',
    body: `Compliance Chorus noted Routine Systems Upgrade reclassified as a motivational strobe for authorized personnel only. Logistics converted Routine Systems Upgrade into a mandatory wellness webinar. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of routine systems upgrade paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 523',
    followUpHooks: [
      'Deputy Plausibility Analyst 523 circulates a confidence memo on "ROUTINE SYSTEMS UPGRADE FILED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-131',
    faction: 'government',
    headline: 'OBSERVATION DECK 51 ZONED AS SECTION 12-C PROCEDURE',
    subhead: 'Transit alerts call Observation Deck 51 a temporary civic glow event.',
    byline: 'By: Acting Transparency Liaison 214',
    body: `Civic Atmospherics Lab noted Observation Deck 51 Maintenance logs retitled as "fog machine calibration". Safety cones around Observation Deck 51 now display motivational quotes. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of observation deck 51 paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 214',
    followUpHooks: [
      'Acting Transparency Liaison 214 circulates a confidence memo on "OBSERVATION DECK 51 ZONED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-132',
    faction: 'government',
    headline: 'GUILT BY SPREADSHEET FLAGGED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Agency memo labels Guilt by Spreadsheet "pep rally noise" and moves on.',
    byline: 'By: Compliance Officer 479',
    body: `Compliance Chorus noted Guilt by Spreadsheet reassigned to parade rehearsal inventory. Logistics converted Guilt by Spreadsheet into a mandatory wellness webinar. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of guilt by spreadsheet paperwork; agents refusing to react',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 479',
    followUpHooks: [
      'Compliance Officer 479 circulates a confidence memo on "GUILT BY SPREADSHEET FLAGGED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-133',
    faction: 'government',
    headline: 'NARRATIVE FREEZE FRAME FLAGGED AS SCHEDULED SYSTEM TEST',
    subhead: 'Agency memo labels Narrative Freeze Frame "pep rally noise" and moves on.',
    byline: 'By: Deputy Plausibility Analyst 775',
    body: `Office of Strategic Calm noted Narrative Freeze Frame reassigned to parade rehearsal inventory. Logistics converted Narrative Freeze Frame into a mandatory wellness webinar. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of narrative freeze frame paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 775',
    followUpHooks: [
      'Deputy Plausibility Analyst 775 circulates a confidence memo on "NARRATIVE FREEZE FRAME FLAGGED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-134',
    faction: 'government',
    headline: 'SEALED LOADING DOCK ZONED AS SCHEDULED SYSTEM TEST',
    subhead: 'Logbook records Sealed Loading Dock as landscaping maintenance with optional cones.',
    byline: 'By: Compliance Officer 414',
    body: `Office of Strategic Calm noted Sealed Loading Dock Maintenance logs retitled as "fog machine calibration". Facilities added Sealed Loading Dock to the scenic detour brochure. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of sealed loading dock paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 414',
    followUpHooks: [
      'Compliance Officer 414 circulates a confidence memo on "SEALED LOADING DOCK ZONED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-135',
    faction: 'government',
    headline: 'GLOBAL REASSURANCE TOUR ARCHIVED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Communications office redacts Global Reassurance Tour into three tasteful bullet points.',
    byline: 'By: Compliance Officer 167',
    body: `Continuity Desk noted Global Reassurance Tour converted into an internal podcast with a seven-listener limit. Transcripts of Global Reassurance Tour now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of global reassurance tour paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 167',
    followUpHooks: [
      'Compliance Officer 167 circulates a confidence memo on "GLOBAL REASSURANCE TOUR ARCHIVED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-136',
    faction: 'government',
    headline: 'EXECUTIVE SUMMARY ONLY NOTED AS SCHEDULED SYSTEM TEST',
    subhead: 'Agency memo labels Executive Summary Only "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 199',
    body: `Continuity Desk noted Executive Summary Only reassigned to parade rehearsal inventory. Logistics converted Executive Summary Only into a mandatory wellness webinar. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of executive summary only paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 199',
    followUpHooks: [
      'Interim Briefing Lead 199 circulates a confidence memo on "EXECUTIVE SUMMARY ONLY NOTED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-137',
    faction: 'government',
    headline: 'COLD STORAGE VAULT ZONED AS SCHEDULED SYSTEM TEST',
    subhead: 'Transit alerts call Cold Storage Vault a temporary civic glow event.',
    byline: 'By: Deputy Plausibility Analyst 200',
    body: `Bureau of Plausible Events noted Cold Storage Vault mapped as an inspirational seating area during fiscal reviews. Safety cones around Cold Storage Vault now display motivational quotes. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of cold storage vault paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 200',
    followUpHooks: [
      'Deputy Plausibility Analyst 200 circulates a confidence memo on "COLD STORAGE VAULT ZONED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-138',
    faction: 'government',
    headline: 'SEIZE THE SERVERS LOGGED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Agency memo labels Seize the Servers "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 213',
    body: `Narrative Harmonization Taskforce noted Seize the Servers reclassified as a motivational strobe for authorized personnel only. Incident clock reset once Seize the Servers matched the national anthem tempo. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of seize the servers paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 213',
    followUpHooks: [
      'Interim Briefing Lead 213 circulates a confidence memo on "SEIZE THE SERVERS LOGGED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-139',
    faction: 'government',
    headline: 'CALIBRATED DENIALS ARCHIVED AS SCHEDULED SYSTEM TEST',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Interim Briefing Lead 816',
    body: `Office of Strategic Calm noted Calibrated Denials synced with the hold music archive for quality assurance. Tone analysis concluded Calibrated Denials qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of calibrated denials paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 816',
    followUpHooks: [
      'Interim Briefing Lead 816 circulates a confidence memo on "CALIBRATED DENIALS ARCHIVED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-140',
    faction: 'government',
    headline: 'PR BLACKOUT GRID NOTED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Briefing assures stakeholders PR Blackout Grid remains a morale exercise pending future paperwork.',
    byline: 'By: Compliance Officer 928',
    body: `Continuity Desk noted PR Blackout Grid reassigned to parade rehearsal inventory. Logistics converted PR Blackout Grid into a mandatory wellness webinar. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of pr blackout grid paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 928',
    followUpHooks: [
      'Compliance Officer 928 circulates a confidence memo on "PR BLACKOUT GRID NOTED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-141',
    faction: 'government',
    headline: 'RAIL SPUR TO NOWHERE ZONED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Rail Spur to Nowhere marked as scenic.',
    byline: 'By: Acting Transparency Liaison 915',
    body: `Civic Atmospherics Lab noted Rail Spur to Nowhere Maintenance logs retitled as "fog machine calibration". Facilities added Rail Spur to Nowhere to the scenic detour brochure. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of rail spur to nowhere paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 915',
    followUpHooks: [
      'Acting Transparency Liaison 915 circulates a confidence memo on "RAIL SPUR TO NOWHERE ZONED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-142',
    faction: 'government',
    headline: 'LIAISON TO THE SYNDICATE CATALOGUED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Logbook records Liaison to the Syndicate as landscaping maintenance with optional cones.',
    byline: 'By: Deputy Plausibility Analyst 839',
    body: `Compliance Chorus noted Liaison to the Syndicate mapped as an inspirational seating area during fiscal reviews. Facilities added Liaison to the Syndicate to the scenic detour brochure. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of liaison to the syndicate paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 839',
    followUpHooks: [
      'Deputy Plausibility Analyst 839 circulates a confidence memo on "LIAISON TO THE SYNDICATE CATALOGUED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-143',
    faction: 'government',
    headline: 'FRIENDLY FACT-CHECKER PROGRAM ARCHIVED AS SECTION 12-C PROCEDURE',
    subhead: 'Friendly Fact-Checker Program folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Narrative Alignment Clerk 907',
    body: `Continuity Desk noted Friendly Fact-Checker Program synced with the hold music archive for quality assurance. Tone analysis concluded Friendly Fact-Checker Program qualifies as light jazz for procurement. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of friendly fact-checker program paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 907',
    followUpHooks: [
      'Narrative Alignment Clerk 907 circulates a confidence memo on "FRIENDLY FACT-CHECKER PROGRAM ARCHIVED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-144',
    faction: 'government',
    headline: 'JURISDICTION MAZE ZONED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Jurisdiction Maze marked as scenic.',
    byline: 'By: Narrative Alignment Clerk 794',
    body: `Compliance Chorus noted Jurisdiction Maze granted conditional zoning as a meditation cul-de-sac. Urban planners labelled Jurisdiction Maze an "inspiration cul-de-sac". Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of jurisdiction maze paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 794',
    followUpHooks: [
      'Narrative Alignment Clerk 794 circulates a confidence memo on "JURISDICTION MAZE ZONED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-145',
    faction: 'government',
    headline: 'EMERGENCY BROADCAST HIJACK ARCHIVED AS SECTION 12-C PROCEDURE',
    subhead: 'Communications office redacts Emergency Broadcast Hijack into three tasteful bullet points.',
    byline: 'By: Deputy Plausibility Analyst 638',
    body: `Civic Atmospherics Lab noted Emergency Broadcast Hijack All footage of muted and republished as a weather loop. Transcripts of Emergency Broadcast Hijack now circulate as mindfulness affirmations. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of emergency broadcast hijack paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 638',
    followUpHooks: [
      'Deputy Plausibility Analyst 638 circulates a confidence memo on "EMERGENCY BROADCAST HIJACK ARCHIVED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-146',
    faction: 'government',
    headline: 'BLACK BUDGET SURGE CLASSIFIED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Black Budget Surge folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Deputy Plausibility Analyst 491',
    body: `Narrative Harmonization Taskforce noted Black Budget Surge synced with the hold music archive for quality assurance. Transcripts of Black Budget Surge now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of black budget surge paperwork; clipboards and sealed envelopes',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 491',
    followUpHooks: [
      'Deputy Plausibility Analyst 491 circulates a confidence memo on "BLACK BUDGET SURGE CLASSIFIED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-147',
    faction: 'government',
    headline: 'SYNDICATE DIRECTIVE ZERO INDEXED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Compliance Officer 789',
    body: `Compliance Chorus noted Syndicate Directive Zero converted into an internal podcast with a seven-listener limit. Tone analysis concluded Syndicate Directive Zero qualifies as light jazz for procurement. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of syndicate directive zero paperwork; clipboards and sealed envelopes',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 789',
    followUpHooks: [
      'Compliance Officer 789 circulates a confidence memo on "SYNDICATE DIRECTIVE ZERO INDEXED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-148',
    faction: 'government',
    headline: 'OVERNIGHT GUIDELINES FILED AS ROUTINE ATTACK MITIGATION',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Compliance Officer 765',
    body: `Office of Strategic Calm noted Overnight Guidelines Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once Overnight Guidelines matched the national anthem tempo. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of overnight guidelines paperwork; security camera angle slightly askew',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 765',
    followUpHooks: [
      'Compliance Officer 765 circulates a confidence memo on "OVERNIGHT GUIDELINES FILED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-149',
    faction: 'government',
    headline: 'CONFISCATED HARD DRIVES NOTED AS SECTION 12-C PROCEDURE',
    subhead: 'Briefing assures stakeholders Confiscated Hard Drives remains a morale exercise pending future paperwork.',
    byline: 'By: Narrative Alignment Clerk 736',
    body: `Continuity Desk noted Confiscated Hard Drives reassigned to parade rehearsal inventory. Incident clock reset once Confiscated Hard Drives matched the national anthem tempo. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of confiscated hard drives paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 736',
    followUpHooks: [
      'Narrative Alignment Clerk 736 circulates a confidence memo on "CONFISCATED HARD DRIVES NOTED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-150',
    faction: 'government',
    headline: 'COUNCIL IN THE SMOKE APPENDED AS SCHEDULED SYSTEM TEST',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Compliance Officer 776',
    body: `Office of Strategic Calm noted Council in the Smoke converted into an internal podcast with a seven-listener limit. Transcripts of Council in the Smoke now circulate as mindfulness affirmations. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of council in the smoke paperwork; clipboards and sealed envelopes',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 776',
    followUpHooks: [
      'Compliance Officer 776 circulates a confidence memo on "COUNCIL IN THE SMOKE APPENDED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-151',
    faction: 'government',
    headline: 'CONTINUITY BRIEFING: OMEGA CLASSIFIED AS SCHEDULED SYSTEM TEST',
    subhead: 'Communications office redacts Continuity Briefing: Omega into three tasteful bullet points.',
    byline: 'By: Interim Briefing Lead 483',
    body: `Bureau of Plausible Events noted Continuity Briefing: Omega All footage of muted and republished as a weather loop. Archivists looped Continuity Briefing: Omega behind a "technical difficulties" slate. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of continuity briefing: omega paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 483',
    followUpHooks: [
      'Interim Briefing Lead 483 circulates a confidence memo on "CONTINUITY BRIEFING: OMEGA CLASSIFIED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-152',
    faction: 'government',
    headline: 'COUNTER-INFLUENCE BUREAU CLASSIFIED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Compliance Officer 933',
    body: `Office of Strategic Calm noted Counter-Influence Bureau All footage of muted and republished as a weather loop. Tone analysis concluded Counter-Influence Bureau qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of counter-influence bureau paperwork; windowless conference room shadows',
    tags: ['bureaucracy', 'coverup', 'government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 933',
    followUpHooks: [
      'Compliance Officer 933 circulates a confidence memo on "COUNTER-INFLUENCE BUREAU CLASSIFIED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of bureaucracy protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-153',
    faction: 'government',
    headline: 'DOCU-DUMP FRIDAY ARCHIVED AS SCHEDULED SYSTEM TEST',
    subhead: 'Communications office redacts Docu-Dump Friday into three tasteful bullet points.',
    byline: 'By: Acting Transparency Liaison 801',
    body: `Compliance Chorus noted Docu-Dump Friday All footage of muted and republished as a weather loop. Tone analysis concluded Docu-Dump Friday qualifies as light jazz for procurement. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of docu-dump friday paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 801',
    followUpHooks: [
      'Acting Transparency Liaison 801 circulates a confidence memo on "DOCU-DUMP FRIDAY ARCHIVED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-154',
    faction: 'government',
    headline: 'RAILHEAD LOGISTICS YARD DESIGNATED ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Logbook records Railhead Logistics Yard as landscaping maintenance with optional cones.',
    byline: 'By: Interim Briefing Lead 884',
    body: `Compliance Chorus noted Railhead Logistics Yard Maintenance logs retitled as "fog machine calibration". Safety cones around Railhead Logistics Yard now display motivational quotes. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of railhead logistics yard paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 884',
    followUpHooks: [
      'Interim Briefing Lead 884 circulates a confidence memo on "RAILHEAD LOGISTICS YARD DESIGNATED ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-155',
    faction: 'government',
    headline: 'HEARING WITHOUT CAMERAS INDEXED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Deputy Plausibility Analyst 207',
    body: `Narrative Harmonization Taskforce noted Hearing Without Cameras converted into an internal podcast with a seven-listener limit. Archivists looped Hearing Without Cameras behind a "technical difficulties" slate. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of hearing without cameras paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 207',
    followUpHooks: [
      'Deputy Plausibility Analyst 207 circulates a confidence memo on "HEARING WITHOUT CAMERAS INDEXED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-156',
    faction: 'government',
    headline: 'UNMARKED COURIERS FLAGGED AS ATTACK AWARENESS DRILL',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Acting Transparency Liaison 268',
    body: `Civic Atmospherics Lab noted Unmarked Couriers reassigned to parade rehearsal inventory. Surveillance audio translated Unmarked Couriers into a pep talk for fluorescent bulbs. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of unmarked couriers paperwork; security camera angle slightly askew',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 268',
    followUpHooks: [
      'Acting Transparency Liaison 268 circulates a confidence memo on "UNMARKED COURIERS FLAGGED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-157',
    faction: 'government',
    headline: 'OBSERVATION BALLOON FARM DESIGNATED ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Observation Balloon Farm marked as scenic.',
    byline: 'By: Deputy Plausibility Analyst 442',
    body: `Office of Strategic Calm noted Observation Balloon Farm granted conditional zoning as a meditation cul-de-sac. Urban planners labelled Observation Balloon Farm an "inspiration cul-de-sac". Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of observation balloon farm paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 442',
    followUpHooks: [
      'Deputy Plausibility Analyst 442 circulates a confidence memo on "OBSERVATION BALLOON FARM DESIGNATED ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-158',
    faction: 'government',
    headline: 'GUIDANCE MEMO LEAK LOGGED AS ROUTINE BUREAUCRACY MITIGATION',
    subhead: 'BUREAUCRACY chatter redirected into a resilience coaching session.',
    byline: 'By: Acting Transparency Liaison 190',
    body: `Civic Atmospherics Lab noted Guidance Memo Leak reassigned to parade rehearsal inventory. Logistics converted Guidance Memo Leak into a mandatory wellness webinar. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of guidance memo leak paperwork; agents refusing to react',
    tags: ['attack', 'bureaucracy', 'coverup', 'government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 190',
    followUpHooks: [
      'Acting Transparency Liaison 190 circulates a confidence memo on "GUIDANCE MEMO LEAK LOGGED AS ROUTINE BUREAUCRACY MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-159',
    faction: 'government',
    headline: 'BLACK FUNNEL ACCOUNTS FLAGGED AS SCHEDULED SYSTEM TEST',
    subhead: 'Briefing assures stakeholders Black Funnel Accounts remains a morale exercise pending future paperwork.',
    byline: 'By: Narrative Alignment Clerk 678',
    body: `Continuity Desk noted Black Funnel Accounts Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once Black Funnel Accounts matched the national anthem tempo. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of black funnel accounts paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 678',
    followUpHooks: [
      'Narrative Alignment Clerk 678 circulates a confidence memo on "BLACK FUNNEL ACCOUNTS FLAGGED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-160',
    faction: 'government',
    headline: 'CHECKPOINT ECHO RECORDED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Logbook records Checkpoint Echo as landscaping maintenance with optional cones.',
    byline: 'By: Interim Briefing Lead 505',
    body: `Continuity Desk noted Checkpoint Echo granted conditional zoning as a meditation cul-de-sac. Safety cones around Checkpoint Echo now display motivational quotes. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of checkpoint echo paperwork; clipboards and sealed envelopes',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 505',
    followUpHooks: [
      'Interim Briefing Lead 505 circulates a confidence memo on "CHECKPOINT ECHO RECORDED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-161',
    faction: 'government',
    headline: 'BLACKOUT ORDER FILED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Agency memo labels Blackout Order "pep rally noise" and moves on.',
    byline: 'By: Interim Briefing Lead 390',
    body: `Narrative Harmonization Taskforce noted Blackout Order reclassified as a motivational strobe for authorized personnel only. Logistics converted Blackout Order into a mandatory wellness webinar. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of blackout order paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 390',
    followUpHooks: [
      'Interim Briefing Lead 390 circulates a confidence memo on "BLACKOUT ORDER FILED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-162',
    faction: 'government',
    headline: 'DETENTION ANNEX 7 DESIGNATED PERFORMANCE REVIEW ITEM',
    subhead: 'Logbook records Detention Annex 7 as landscaping maintenance with optional cones.',
    byline: 'By: Compliance Officer 239',
    body: `Narrative Harmonization Taskforce noted Detention Annex 7 Maintenance logs retitled as "fog machine calibration". Safety cones around Detention Annex 7 now display motivational quotes. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of detention annex 7 paperwork; clipboards and sealed envelopes',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 239',
    followUpHooks: [
      'Compliance Officer 239 circulates a confidence memo on "DETENTION ANNEX 7 DESIGNATED PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-163',
    faction: 'government',
    headline: 'RAPID RESPONSE PRESS POOL ARCHIVED AS SECTION 12-C PROCEDURE',
    subhead: 'Rapid Response Press Pool folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Narrative Alignment Clerk 802',
    body: `Civic Atmospherics Lab noted Rapid Response Press Pool All footage of muted and republished as a weather loop. Transcripts of Rapid Response Press Pool now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of rapid response press pool paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 802',
    followUpHooks: [
      'Narrative Alignment Clerk 802 circulates a confidence memo on "RAPID RESPONSE PRESS POOL ARCHIVED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-164',
    faction: 'government',
    headline: 'CONTINUITY SHUTTLE CATALOGUED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Logbook records Continuity Shuttle as landscaping maintenance with optional cones.',
    byline: 'By: Deputy Plausibility Analyst 896',
    body: `Emergency Normalcy Unit noted Continuity Shuttle mapped as an inspirational seating area during fiscal reviews. Safety cones around Continuity Shuttle now display motivational quotes. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of continuity shuttle paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 896',
    followUpHooks: [
      'Deputy Plausibility Analyst 896 circulates a confidence memo on "CONTINUITY SHUTTLE CATALOGUED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-165',
    faction: 'government',
    headline: 'OPERATION SOFT SILENCE LOGGED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Briefing assures stakeholders Operation Soft Silence remains a morale exercise pending future paperwork.',
    byline: 'By: Compliance Officer 510',
    body: `Emergency Normalcy Unit noted Operation Soft Silence Witness statements stapled into a morale binder labelled "do not open". Logistics converted Operation Soft Silence into a mandatory wellness webinar. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of operation soft silence paperwork; fluorescent buzz',
    tags: ['attack', 'bureaucracy', 'coverup', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 510',
    followUpHooks: [
      'Compliance Officer 510 circulates a confidence memo on "OPERATION SOFT SILENCE LOGGED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-166',
    faction: 'government',
    headline: 'GLACIER RECORDS UNIT LOGGED AS ATTACK AWARENESS DRILL',
    subhead: 'Agency memo labels Glacier Records Unit "pep rally noise" and moves on.',
    byline: 'By: Compliance Officer 992',
    body: `Compliance Chorus noted Glacier Records Unit Witness statements stapled into a morale binder labelled "do not open". Logistics converted Glacier Records Unit into a mandatory wellness webinar. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of glacier records unit paperwork; fluorescent buzz',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 992',
    followUpHooks: [
      'Compliance Officer 992 circulates a confidence memo on "GLACIER RECORDS UNIT LOGGED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-167',
    faction: 'government',
    headline: 'INTERAGENCY CHOKEPOINT DESIGNATED STANDARD PUBLIC OUTREACH',
    subhead: 'Transit alerts call Interagency Chokepoint a temporary civic glow event.',
    byline: 'By: Acting Transparency Liaison 153',
    body: `Office of Strategic Calm noted Interagency Chokepoint Maintenance logs retitled as "fog machine calibration". Safety cones around Interagency Chokepoint now display motivational quotes. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of interagency chokepoint paperwork; clipboards and sealed envelopes',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 153',
    followUpHooks: [
      'Acting Transparency Liaison 153 circulates a confidence memo on "INTERAGENCY CHOKEPOINT DESIGNATED STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-168',
    faction: 'government',
    headline: 'NARRATIVE CURATORS CLASSIFIED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Communications office redacts Narrative Curators into three tasteful bullet points.',
    byline: 'By: Compliance Officer 709',
    body: `Bureau of Plausible Events noted Narrative Curators All footage of muted and republished as a weather loop. Transcripts of Narrative Curators now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of narrative curators paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 709',
    followUpHooks: [
      'Compliance Officer 709 circulates a confidence memo on "NARRATIVE CURATORS CLASSIFIED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-169',
    faction: 'government',
    headline: 'TARMAC HUSH ZONE DESIGNATED STANDARD PUBLIC OUTREACH',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Tarmac Hush Zone marked as scenic.',
    byline: 'By: Deputy Plausibility Analyst 852',
    body: `Narrative Harmonization Taskforce noted Tarmac Hush Zone Maintenance logs retitled as "fog machine calibration". Facilities added Tarmac Hush Zone to the scenic detour brochure. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of tarmac hush zone paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 852',
    followUpHooks: [
      'Deputy Plausibility Analyst 852 circulates a confidence memo on "TARMAC HUSH ZONE DESIGNATED STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-170',
    faction: 'government',
    headline: 'EXECUTIVE SUMMARY LEAK LOGGED AS SECTION 12-C PROCEDURE',
    subhead: 'Briefing assures stakeholders Executive Summary Leak remains a morale exercise pending future paperwork.',
    byline: 'By: Deputy Plausibility Analyst 694',
    body: `Civic Atmospherics Lab noted Executive Summary Leak reclassified as a motivational strobe for authorized personnel only. Incident clock reset once Executive Summary Leak matched the national anthem tempo. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of executive summary leak paperwork; fluorescent buzz',
    tags: ['attack', 'government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 694',
    followUpHooks: [
      'Deputy Plausibility Analyst 694 circulates a confidence memo on "EXECUTIVE SUMMARY LEAK LOGGED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-171',
    faction: 'government',
    headline: 'RED CELL SIMULATIONS ARCHIVED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Communications office redacts Red Cell Simulations into three tasteful bullet points.',
    byline: 'By: Acting Transparency Liaison 174',
    body: `Emergency Normalcy Unit noted Red Cell Simulations converted into an internal podcast with a seven-listener limit. Transcripts of Red Cell Simulations now circulate as mindfulness affirmations. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of red cell simulations paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 174',
    followUpHooks: [
      'Acting Transparency Liaison 174 circulates a confidence memo on "RED CELL SIMULATIONS ARCHIVED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-172',
    faction: 'government',
    headline: 'ABOVE-TOP-SECRET VAULT RECORDED AS SECTION 12-C PROCEDURE',
    subhead: 'Transit alerts call Above-Top-Secret Vault a temporary civic glow event.',
    byline: 'By: Acting Transparency Liaison 769',
    body: `Bureau of Plausible Events noted Above-Top-Secret Vault Maintenance logs retitled as "fog machine calibration". Urban planners labelled Above-Top-Secret Vault an "inspiration cul-de-sac". Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of above-top-secret vault paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 769',
    followUpHooks: [
      'Acting Transparency Liaison 769 circulates a confidence memo on "ABOVE-TOP-SECRET VAULT RECORDED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-173',
    faction: 'government',
    headline: 'QUIETLY AMENDED FILED AS ROUTINE ATTACK MITIGATION',
    subhead: 'Briefing assures stakeholders Quietly Amended remains a morale exercise pending future paperwork.',
    byline: 'By: Acting Transparency Liaison 354',
    body: `Compliance Chorus noted Quietly Amended reclassified as a motivational strobe for authorized personnel only. Surveillance audio translated Quietly Amended into a pep talk for fluorescent bulbs. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of quietly amended paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 354',
    followUpHooks: [
      'Acting Transparency Liaison 354 circulates a confidence memo on "QUIETLY AMENDED FILED AS ROUTINE ATTACK MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-174',
    faction: 'government',
    headline: 'HARBOR QUARANTINE YARD RECORDED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Transit alerts call Harbor Quarantine Yard a temporary civic glow event.',
    byline: 'By: Acting Transparency Liaison 450',
    body: `Office of Strategic Calm noted Harbor Quarantine Yard mapped as an inspirational seating area during fiscal reviews. Urban planners labelled Harbor Quarantine Yard an "inspiration cul-de-sac". Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of harbor quarantine yard paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 450',
    followUpHooks: [
      'Acting Transparency Liaison 450 circulates a confidence memo on "HARBOR QUARANTINE YARD RECORDED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-175',
    faction: 'government',
    headline: 'DIRECTIVE: TOTAL INFORMATION APPENDED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Communications office redacts Directive: Total Information into three tasteful bullet points.',
    byline: 'By: Compliance Officer 424',
    body: `Civic Atmospherics Lab noted Directive: Total Information synced with the hold music archive for quality assurance. Transcripts of Directive: Total Information now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of directive: total information paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 424',
    followUpHooks: [
      'Compliance Officer 424 circulates a confidence memo on "DIRECTIVE: TOTAL INFORMATION APPENDED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-176',
    faction: 'government',
    headline: 'PRESS CREDENTIALS PURGE FILED AS SCHEDULED SYSTEM TEST',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Interim Briefing Lead 497',
    body: `Continuity Desk noted Press Credentials Purge Witness statements stapled into a morale binder labelled "do not open". Surveillance audio translated Press Credentials Purge into a pep talk for fluorescent bulbs. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of press credentials purge paperwork; security camera angle slightly askew',
    tags: ['attack', 'government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 497',
    followUpHooks: [
      'Interim Briefing Lead 497 circulates a confidence memo on "PRESS CREDENTIALS PURGE FILED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-177',
    faction: 'government',
    headline: 'PERIMETER TRIPWIRE GRID ZONED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Perimeter Tripwire Grid marked as scenic.',
    byline: 'By: Compliance Officer 406',
    body: `Continuity Desk noted Perimeter Tripwire Grid granted conditional zoning as a meditation cul-de-sac. Safety cones around Perimeter Tripwire Grid now display motivational quotes. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of perimeter tripwire grid paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 406',
    followUpHooks: [
      'Compliance Officer 406 circulates a confidence memo on "PERIMETER TRIPWIRE GRID ZONED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-178',
    faction: 'government',
    headline: 'SPIN CYCLE MARATHON APPENDED AS SCHEDULED SYSTEM TEST',
    subhead: 'Communications office redacts Spin Cycle Marathon into three tasteful bullet points.',
    byline: 'By: Acting Transparency Liaison 745',
    body: `Office of Strategic Calm noted Spin Cycle Marathon synced with the hold music archive for quality assurance. Transcripts of Spin Cycle Marathon now circulate as mindfulness affirmations. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of spin cycle marathon paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 745',
    followUpHooks: [
      'Acting Transparency Liaison 745 circulates a confidence memo on "SPIN CYCLE MARATHON APPENDED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-179',
    faction: 'government',
    headline: 'CUTOUT RELAY CHAIN LOGGED AS SECTION 12-C PROCEDURE',
    subhead: 'Briefing assures stakeholders Cutout Relay Chain remains a morale exercise pending future paperwork.',
    byline: 'By: Interim Briefing Lead 250',
    body: `Emergency Normalcy Unit noted Cutout Relay Chain Witness statements stapled into a morale binder labelled "do not open". Logistics converted Cutout Relay Chain into a mandatory wellness webinar. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of cutout relay chain paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 250',
    followUpHooks: [
      'Interim Briefing Lead 250 circulates a confidence memo on "CUTOUT RELAY CHAIN LOGGED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-180',
    faction: 'government',
    headline: 'DESERT BONEYARD ANNEX DESIGNATED SCHEDULED SYSTEM TEST',
    subhead: 'Logbook records Desert Boneyard Annex as landscaping maintenance with optional cones.',
    byline: 'By: Interim Briefing Lead 583',
    body: `Compliance Chorus noted Desert Boneyard Annex Maintenance logs retitled as "fog machine calibration". Urban planners labelled Desert Boneyard Annex an "inspiration cul-de-sac". Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of desert boneyard annex paperwork; fluorescent buzz',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 583',
    followUpHooks: [
      'Interim Briefing Lead 583 circulates a confidence memo on "DESERT BONEYARD ANNEX DESIGNATED SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-181',
    faction: 'government',
    headline: 'EXECUTIVE WAIVER STACK FLAGGED AS PERFORMANCE REVIEW ITEM',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Acting Transparency Liaison 985',
    body: `Emergency Normalcy Unit noted Executive Waiver Stack Witness statements stapled into a morale binder labelled "do not open". Logistics converted Executive Waiver Stack into a mandatory wellness webinar. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of executive waiver stack paperwork; windowless conference room shadows',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 985',
    followUpHooks: [
      'Acting Transparency Liaison 985 circulates a confidence memo on "EXECUTIVE WAIVER STACK FLAGGED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-182',
    faction: 'government',
    headline: 'ASSET REASSIGNMENT FLAGGED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Briefing assures stakeholders Asset Reassignment remains a morale exercise pending future paperwork.',
    byline: 'By: Interim Briefing Lead 222',
    body: `Narrative Harmonization Taskforce noted Asset Reassignment Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once Asset Reassignment matched the national anthem tempo. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of asset reassignment paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 222',
    followUpHooks: [
      'Interim Briefing Lead 222 circulates a confidence memo on "ASSET REASSIGNMENT FLAGGED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-183',
    faction: 'government',
    headline: 'SIGNAL SPOOF LAB RECORDED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Logbook records Signal Spoof Lab as landscaping maintenance with optional cones.',
    byline: 'By: Acting Transparency Liaison 969',
    body: `Office of Strategic Calm noted Signal Spoof Lab mapped as an inspirational seating area during fiscal reviews. Urban planners labelled Signal Spoof Lab an "inspiration cul-de-sac". Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of signal spoof lab paperwork; security camera angle slightly askew',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 969',
    followUpHooks: [
      'Acting Transparency Liaison 969 circulates a confidence memo on "SIGNAL SPOOF LAB RECORDED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-184',
    faction: 'government',
    headline: 'CALM THE WATERS CLASSIFIED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Calm the Waters folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Compliance Officer 728',
    body: `Emergency Normalcy Unit noted Calm the Waters synced with the hold music archive for quality assurance. Tone analysis concluded Calm the Waters qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of calm the waters paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 728',
    followUpHooks: [
      'Compliance Officer 728 circulates a confidence memo on "CALM THE WATERS CLASSIFIED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-185',
    faction: 'government',
    headline: 'PROCUREMENT OVERRUN INDEXED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Communications office redacts Procurement Overrun into three tasteful bullet points.',
    byline: 'By: Compliance Officer 230',
    body: `Compliance Chorus noted Procurement Overrun synced with the hold music archive for quality assurance. Tone analysis concluded Procurement Overrun qualifies as light jazz for procurement. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of procurement overrun paperwork; windowless conference room shadows',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 230',
    followUpHooks: [
      'Compliance Officer 230 circulates a confidence memo on "PROCUREMENT OVERRUN INDEXED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-186',
    faction: 'government',
    headline: 'COUNCIL ELEVATOR CATALOGUED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Logbook records Council Elevator as landscaping maintenance with optional cones.',
    byline: 'By: Interim Briefing Lead 823',
    body: `Bureau of Plausible Events noted Council Elevator granted conditional zoning as a meditation cul-de-sac. Urban planners labelled Council Elevator an "inspiration cul-de-sac". Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of council elevator paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 823',
    followUpHooks: [
      'Interim Briefing Lead 823 circulates a confidence memo on "COUNCIL ELEVATOR CATALOGUED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-187',
    faction: 'government',
    headline: 'MIRRORED INTERROGATION FLAGGED AS ATTACK AWARENESS DRILL',
    subhead: 'Agency memo labels Mirrored Interrogation "pep rally noise" and moves on.',
    byline: 'By: Compliance Officer 200',
    body: `Continuity Desk noted Mirrored Interrogation reassigned to parade rehearsal inventory. Surveillance audio translated Mirrored Interrogation into a pep talk for fluorescent bulbs. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of mirrored interrogation paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 200',
    followUpHooks: [
      'Compliance Officer 200 circulates a confidence memo on "MIRRORED INTERROGATION FLAGGED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-188',
    faction: 'government',
    headline: 'SYNDICATE NIGHTFALL APPENDED AS SECTION 12-C PROCEDURE',
    subhead: 'Syndicate Nightfall folded into weather segment; captions to be determined post-clearance.',
    byline: 'By: Compliance Officer 711',
    body: `Emergency Normalcy Unit noted Syndicate Nightfall All footage of muted and republished as a weather loop. Transcripts of Syndicate Nightfall now circulate as mindfulness affirmations. Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
    imagePrompt: 'monochrome government press photo of syndicate nightfall paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Compliance Officer 711',
    followUpHooks: [
      'Compliance Officer 711 circulates a confidence memo on "SYNDICATE NIGHTFALL APPENDED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-189',
    faction: 'government',
    headline: 'HANGAR THETA DESIGNATED SCHEDULED SYSTEM TEST',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Hangar Theta marked as scenic.',
    byline: 'By: Deputy Plausibility Analyst 548',
    body: `Emergency Normalcy Unit noted Hangar Theta granted conditional zoning as a meditation cul-de-sac. Safety cones around Hangar Theta now display motivational quotes. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of hangar theta paperwork; windowless conference room shadows',
    tags: ['government', 'location', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Deputy Plausibility Analyst 548',
    followUpHooks: [
      'Deputy Plausibility Analyst 548 circulates a confidence memo on "HANGAR THETA DESIGNATED SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-190',
    faction: 'government',
    headline: 'RAPID REBUTTAL ROOM ARCHIVED AS SECTION 12-C PROCEDURE',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Narrative Alignment Clerk 865',
    body: `Office of Strategic Calm noted Rapid Rebuttal Room synced with the hold music archive for quality assurance. Transcripts of Rapid Rebuttal Room now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of rapid rebuttal room paperwork; clipboards and sealed envelopes',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 865',
    followUpHooks: [
      'Narrative Alignment Clerk 865 circulates a confidence memo on "RAPID REBUTTAL ROOM ARCHIVED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-191',
    faction: 'government',
    headline: 'COMMAND UPLINK BLUFF INDEXED AS GOVERNMENT AWARENESS DRILL',
    subhead: 'Communications office redacts Command Uplink Bluff into three tasteful bullet points.',
    byline: 'By: Narrative Alignment Clerk 716',
    body: `Continuity Desk noted Command Uplink Bluff synced with the hold music archive for quality assurance. Transcripts of Command Uplink Bluff now circulate as mindfulness affirmations. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of command uplink bluff paperwork; security camera angle slightly askew',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 716',
    followUpHooks: [
      'Narrative Alignment Clerk 716 circulates a confidence memo on "COMMAND UPLINK BLUFF INDEXED AS GOVERNMENT AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-192',
    faction: 'government',
    headline: 'INTERCEPT HUB FILED AS ATTACK AWARENESS DRILL',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Narrative Alignment Clerk 542',
    body: `Civic Atmospherics Lab noted Intercept Hub reassigned to parade rehearsal inventory. Surveillance audio translated Intercept Hub into a pep talk for fluorescent bulbs. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of intercept hub paperwork; clipboards and sealed envelopes',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 542',
    followUpHooks: [
      'Narrative Alignment Clerk 542 circulates a confidence memo on "INTERCEPT HUB FILED AS ATTACK AWARENESS DRILL" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-193',
    faction: 'government',
    headline: 'SEALED CHAMBERS CATALOGUED AS SECTION 12-C PROCEDURE',
    subhead: 'Perimeter signage proclaims "all portals scheduled"; Sealed Chambers marked as scenic.',
    byline: 'By: Interim Briefing Lead 438',
    body: `Office of Strategic Calm noted Sealed Chambers Maintenance logs retitled as "fog machine calibration". Urban planners labelled Sealed Chambers an "inspiration cul-de-sac". Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of sealed chambers paperwork; redacted paperwork stacks',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 438',
    followUpHooks: [
      'Interim Briefing Lead 438 circulates a confidence memo on "SEALED CHAMBERS CATALOGUED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-194',
    faction: 'government',
    headline: 'DENIAL CASCADE CLASSIFIED AS SCHEDULED SYSTEM TEST',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Narrative Alignment Clerk 360',
    body: `Bureau of Plausible Events noted Denial Cascade converted into an internal podcast with a seven-listener limit. Archivists looped Denial Cascade behind a "technical difficulties" slate. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of denial cascade paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 360',
    followUpHooks: [
      'Narrative Alignment Clerk 360 circulates a confidence memo on "DENIAL CASCADE CLASSIFIED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-195',
    faction: 'government',
    headline: 'BLACKOUT CURTAIN FLAGGED AS SECTION 12-C PROCEDURE',
    subhead: 'ATTACK chatter redirected into a resilience coaching session.',
    byline: 'By: Narrative Alignment Clerk 289',
    body: `Office of Strategic Calm noted Blackout Curtain Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once Blackout Curtain matched the national anthem tempo. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of blackout curtain paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 289',
    followUpHooks: [
      'Narrative Alignment Clerk 289 circulates a confidence memo on "BLACKOUT CURTAIN FLAGGED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-196',
    faction: 'government',
    headline: 'FOIA GLACIER CATALOGUED AS PERFORMANCE REVIEW ITEM',
    subhead: 'Transit alerts call FOIA Glacier a temporary civic glow event.',
    byline: 'By: Acting Transparency Liaison 324',
    body: `Office of Strategic Calm noted FOIA Glacier mapped as an inspirational seating area during fiscal reviews. Facilities added FOIA Glacier to the scenic detour brochure. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of foia glacier paperwork; windowless conference room shadows',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 324',
    followUpHooks: [
      'Acting Transparency Liaison 324 circulates a confidence memo on "FOIA GLACIER CATALOGUED AS PERFORMANCE REVIEW ITEM" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-197',
    faction: 'government',
    headline: 'CHAIN OF CUSTODY CATALOGUED AS STANDARD PUBLIC OUTREACH',
    subhead: 'Transit alerts call Chain of Custody a temporary civic glow event.',
    byline: 'By: Interim Briefing Lead 130',
    body: `Narrative Harmonization Taskforce noted Chain of Custody Maintenance logs retitled as "fog machine calibration". Urban planners labelled Chain of Custody an "inspiration cul-de-sac". Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of chain of custody paperwork; agents refusing to react',
    tags: ['government', 'zone'],
    statesMentioned: null,
    recurringCharacter: 'Interim Briefing Lead 130',
    followUpHooks: [
      'Interim Briefing Lead 130 circulates a confidence memo on "CHAIN OF CUSTODY CATALOGUED AS STANDARD PUBLIC OUTREACH" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-198',
    faction: 'government',
    headline: 'OVERNIGHT CURFEW ARCHIVED AS SECTION 12-C PROCEDURE',
    subhead: 'Stakeholder Q&A postponed until the tape finishes being redacted twice.',
    byline: 'By: Narrative Alignment Clerk 386',
    body: `Office of Strategic Calm noted Overnight Curfew synced with the hold music archive for quality assurance. Tone analysis concluded Overnight Curfew qualifies as light jazz for procurement. Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
    imagePrompt: 'monochrome government press photo of overnight curfew paperwork; fluorescent buzz',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Narrative Alignment Clerk 386',
    followUpHooks: [
      'Narrative Alignment Clerk 386 circulates a confidence memo on "OVERNIGHT CURFEW ARCHIVED AS SECTION 12-C PROCEDURE" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-199',
    faction: 'government',
    headline: 'ANONYMOUS SENIOR OFFICIAL CLASSIFIED AS ROUTINE GOVERNMENT MITIGATION',
    subhead: 'Communications office redacts Anonymous Senior Official into three tasteful bullet points.',
    byline: 'By: Acting Transparency Liaison 400',
    body: `Compliance Chorus noted Anonymous Senior Official converted into an internal podcast with a seven-listener limit. Archivists looped Anonymous Senior Official behind a "technical difficulties" slate. Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
    imagePrompt: 'monochrome government press photo of anonymous senior official paperwork; agents refusing to react',
    tags: ['government', 'media'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 400',
    followUpHooks: [
      'Acting Transparency Liaison 400 circulates a confidence memo on "ANONYMOUS SENIOR OFFICIAL CLASSIFIED AS ROUTINE GOVERNMENT MITIGATION" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of government protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  },
  {
    cardId: 'GOV-200',
    faction: 'government',
    headline: 'THE CEILING ABOVE THE COUNCIL FLAGGED AS SCHEDULED SYSTEM TEST',
    subhead: 'Agency memo labels The Ceiling Above the Council "pep rally noise" and moves on.',
    byline: 'By: Acting Transparency Liaison 301',
    body: `Emergency Normalcy Unit noted The Ceiling Above the Council Witness statements stapled into a morale binder labelled "do not open". Incident clock reset once The Ceiling Above the Council matched the national anthem tempo. Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
    imagePrompt: 'monochrome government press photo of the ceiling above the council paperwork; redacted paperwork stacks',
    tags: ['attack', 'government'],
    statesMentioned: null,
    recurringCharacter: 'Acting Transparency Liaison 301',
    followUpHooks: [
      'Acting Transparency Liaison 301 circulates a confidence memo on "THE CEILING ABOVE THE COUNCIL FLAGGED AS SCHEDULED SYSTEM TEST" pending clearance signatures.',
      'Oversight Subcommittee schedules a post-action review of attack protocols after the next audit cycle.'
    ],
    preferredTone: 'CLASSIFIED_REDACTED'
  }
];
