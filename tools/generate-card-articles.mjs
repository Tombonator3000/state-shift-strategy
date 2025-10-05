#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const OUTPUT_PATHS = [
  path.join(ROOT, 'paranoid_times_card_articles_ALL.json'),
  path.join(ROOT, 'src/engine/paranoid_times_card_articles_ALL.json'),
  path.join(ROOT, 'public/data/paranoid_times_card_articles_ALL.json'),
];

const CARD_SOURCES = [
  { path: 'src/data/core/core_truth_MVP_balanced.json', key: 'core-truth' },
  { path: 'src/data/core/core_government_MVP_balanced.json', key: 'core-government' },
  { path: 'public/extensions/cryptids.json', key: 'exp-cryptids', nested: 'cards' },
  { path: 'public/extensions/halloween_spooktacular_with_temp_image.json', key: 'exp-halloween', nested: 'cards' },
];

const TECHNICAL_TAGS = new Set(['truth', 'government', 'media', 'zone', 'attack']);

const truthHeadlineVerbs = {
  ATTACK: ['IGNITES', 'UNLEASHES', 'BUSTS OPEN', 'SHOCKS'],
  MEDIA: ['BROADCASTS', 'STREAMS', 'LEAKS', 'LIVECASTS'],
  ZONE: ['OPENS', 'ANCHORS', 'SUMMONS', 'MAGNETIZES'],
};

const truthHeadlineObjects = [
  ctx => `${ctx.tagWord} FRENZY`,
  ctx => `MIDNIGHT ${ctx.tagWord} PARADE`,
  ctx => `${ctx.tagWord} RECEIPTS`,
  ctx => `GALACTIC FAN MEETUP`,
  ctx => `${ctx.tagWord} SHOCKWAVE`,
  ctx => `NEIGHBORHOOD MELTDOWN`,
  ctx => `COMMUNITY WATCH HOTLINE`,
  ctx => `${ctx.tagWord} SIGNAL CASCADE`,
  ctx => `DIY ${ctx.tagWord} ALERT SYSTEM`,
];

const truthSubheadTemplates = {
  ATTACK: [
    ctx => `Hotline lights up as ${ctx.subject} allegedly spray-paints the sky with ${ctx.tagLower} confetti.`,
    ctx => `Witnesses whisper ${ctx.subject} rang every doomsday bell at once.`,
    ctx => `${ctx.tagWord} club cancels bingo so they can follow ${ctx.subject} in real time.`,
    ctx => `Emergency text threads melt down as ${ctx.subject} turns every siren toward ${ctx.tagLower} alarms.`,
    ctx => `Block captains report ${ctx.subject} converted the parade route into impromptu ${ctx.tagLower} drills.`,
  ],
  MEDIA: [
    ctx => `Streaming rigs wobble while ${ctx.subject} beams raw ${ctx.tagLower} proof to anyone still buffering.`,
    ctx => `Community radio swears ${ctx.subject} hijacked the feed with cosmic receipts.`,
    ctx => `Local vloggers caption ${ctx.subject} as "finally, undeniable ${ctx.tagLower}".`,
    ctx => `Basement broadcasters insist ${ctx.subject} dropped a director's cut of the ${ctx.tagLower} tapes.`,
    ctx => `Neighborhood podcasters scramble as ${ctx.subject} queues up bonus commentary in surround sound.`,
  ],
  ZONE: [
    ctx => `Neighborhood watch maps redraw themselves once ${ctx.subject} opens a ${ctx.tagLower} hotspot.`,
    ctx => `County clerks concede ${ctx.subject} turned the picnic grounds into a portal.`,
    ctx => `Amateur dowsers sprint over as ${ctx.subject} makes gravity blink.`,
    ctx => `Cartographers wake up to ${ctx.subject} scribbling new ley lines across the cul-de-sac.`,
    ctx => `Utility crews file bewildered notes after ${ctx.subject} paints a ${ctx.tagLower} runway through town square.`,
  ],
};

const truthWitnesses = [
  'Local truthers',
  'Graveyard-shift baristas',
  'Ham-radio grandpas',
  'Youth group ghost hunters',
  'After-school UFO clubs',
  'County fair jugglers',
  'Mall kiosk prophets',
  'Livestream moderators',
  'Neighborhood drone pilots',
  'Late-night librarians',
];

const truthFollowUps = {
  ATTACK: [
    ctx => `${ctx.subject} reportedly high-fived a ${ctx.tagLower} silhouette before the courthouse lights exploded into karaoke.`,
    ctx => `${ctx.subject} left glitter bootprints spelling "WE WARNED YOU" across Main Street.`,
    ctx => `${ctx.subject} made the mayor's voicemail play theremin chords backward for an hour.`,
    ctx => `${ctx.subject} rewired the town clock so it now chimes in ${ctx.tagLower} Morse code.`,
    ctx => `${ctx.subject} replaced every caution tape downtown with streamers shouting "PREPARE".`,
  ],
  MEDIA: [
    ctx => `${ctx.subject} uploaded a zip file labeled "REAL PROOF" that screams when opened.`,
    ctx => `${ctx.subject} turned the rotary phone tree into a 4K broadcast network.`,
    ctx => `${ctx.subject} looped the emergency siren so it chants "believe harder".`,
    ctx => `${ctx.subject} patched the public access channel into a nonstop ${ctx.tagLower} slideshow.`,
    ctx => `${ctx.subject} spammed the city newsletter with redacted screenshots of unprintable revelations.`,
  ],
  ZONE: [
    ctx => `${ctx.subject} carved a crop circle inside the county annex lobby.`,
    ctx => `${ctx.subject} re-tuned the town gazebo into a wormhole waiting room.`,
    ctx => `${ctx.subject} made the high school scoreboard track interdimensional weather.`,
    ctx => `${ctx.subject} chalked glowing arrows that only appear during ${ctx.tagLower} moonrise.`,
    ctx => `${ctx.subject} rolled out a welcome mat that hums whenever a portal flickers nearby.`,
  ],
};

const truthEscalations = {
  ATTACK: [
    ctx => `Cellphone footage shows ${ctx.subject} juggling glowing subpoenas before tossing them skyward.`,
    ctx => `Neighbors claim ${ctx.subject} rewired the streetlights into a blinking "TRUTH" marquee.`,
    ctx => `${ctx.subject} allegedly taught pigeons to chant classified coordinates in harmony.`,
    ctx => `Security cams caught ${ctx.subject} choreographing traffic cones into a ${ctx.tagLower} sigil.`,
    ctx => `${ctx.subject} briefly made every porch light flicker the same warning in unison.`,
  ],
  MEDIA: [
    ctx => `Podcast guests insist ${ctx.subject} turned feedback hiss into a prophecy about ${ctx.tagLower} alliances.`,
    ctx => `One caller reports ${ctx.subject} crowdsourced captions faster than fact-checkers could blink.`,
    ctx => `${ctx.subject} premiered a teaser trailer for the sequel mid-interview.`,
    ctx => `${ctx.subject} snuck director's commentary into a rival station's test pattern.`,
    ctx => `Archivists swear ${ctx.subject} watermarked the clouds with upcoming plot twists.`,
  ],
  ZONE: [
    ctx => `Spectators swear ${ctx.subject} folded the marching band into a shimmering doorway.`,
    ctx => `${ctx.subject} made parking meters count down in alien numerals.`,
    ctx => `Meteorologists report ${ctx.subject} left a weather map drawn in ectoplasm.`,
    ctx => `${ctx.subject} layered an aurora over town hall that pulses like a heartbeat.`,
    ctx => `Geocachers complain ${ctx.subject} keeps relocating their coordinates into thin air.`,
  ],
};

const truthClosing = [
  ctx => `${ctx.tagWord} faithful now planning an emergency potluck and candle-lit slideshow.`,
  ctx => `Tin-foil futures spike as ${ctx.tagLower} believers mark off PTO for vigilance.`,
  ctx => `Teens already selling bootleg merch that reads "${ctx.subject.toUpperCase()} CALLED IT".`,
  ctx => `Grandma hotline volunteers request backup batteries and a calming playlist.`,
  ctx => `${ctx.tagWord} message boards open a 72-hour live stream to debrief.`,
  ctx => `${ctx.tagWord} caravan schedules now include meditation breaks and portable sirens.`,
  ctx => `Neighborhood historians spin up a crowd-sourced timeline to keep pace with ${ctx.tagLower} chaos.`,
];

const truthSecondaries = [
  ctx => `Street psychics argue ${ctx.subject} just validated every group chat prophecy.`,
  ctx => `Local makerspaces print fresh zines to annotate the unfolding ${ctx.tagLower} saga.`,
  ctx => `Conspiracy carpools reroute to swap evidence bags like trading cards.`,
  ctx => `Pop-up vendors sling commemorative ${ctx.tagLower} snow globes before sunrise.`,
  ctx => `Underground forums launch emergency polls to rank the night's wildest receipts.`,
];

const govHeadlineVerbs = {
  ATTACK: ['FILED AS', 'FLAGGED AS', 'LOGGED AS', 'NOTED AS'],
  MEDIA: ['CLASSIFIED AS', 'ARCHIVED AS', 'APPENDED AS', 'INDEXED AS'],
  ZONE: ['DESIGNATED', 'ZONED AS', 'RECORDED AS', 'CATALOGUED AS'],
};

const govHeadlineObjects = [
  ctx => `ROUTINE ${ctx.tagWord} MITIGATION`,
  ctx => `SECTION 12-C PROCEDURE`,
  ctx => `STANDARD PUBLIC OUTREACH`,
  ctx => `${ctx.tagWord} AWARENESS DRILL`,
  ctx => `SCHEDULED SYSTEM TEST`,
  ctx => `PERFORMANCE REVIEW ITEM`,
  ctx => `BENIGN ${ctx.tagWord} VARIANCE`,
  ctx => `PRE-APPROVED ${ctx.tagWord} WORKSHOP`,
];

const govSubheadTemplates = {
  ATTACK: [
    ctx => `Briefing assures stakeholders ${ctx.subject} remains a morale exercise pending future paperwork.`,
    ctx => `Agency memo labels ${ctx.subject} "pep rally noise" and moves on.`,
    ctx => `${ctx.tagWord} chatter redirected into a resilience coaching session.`,
    ctx => `Risk office files ${ctx.subject} beneath "motivational anomalies" and suggests deep breathing.`,
    ctx => `Department analysts color-code ${ctx.subject} as a morale drill with optional applause.`,
  ],
  MEDIA: [
    ctx => `Communications office redacts ${ctx.subject} into three tasteful bullet points.`,
    ctx => `${ctx.subject} folded into weather segment; captions to be determined post-clearance.`,
    ctx => `Stakeholder Q&A postponed until the tape finishes being redacted twice.`,
    ctx => `Press liaisons reframe ${ctx.subject} as a test of broadcast resilience metrics.`,
    ctx => `Weekly talking points add ${ctx.subject} as a hypothetical for controlled messaging scenarios.`,
  ],
  ZONE: [
    ctx => `Logbook records ${ctx.subject} as landscaping maintenance with optional cones.`,
    ctx => `Perimeter signage proclaims "all portals scheduled"; ${ctx.subject} marked as scenic.`,
    ctx => `Transit alerts call ${ctx.subject} a temporary civic glow event.`,
    ctx => `Facilities paperwork reclassifies ${ctx.subject} as enhanced ambience pending audit.`,
    ctx => `GIS interns annotate ${ctx.subject} as a decorative overlay on municipal maps.`,
  ],
};

const govAgencies = [
  'Office of Strategic Calm',
  'Bureau of Plausible Events',
  'Continuity Desk',
  'Narrative Harmonization Taskforce',
  'Emergency Normalcy Unit',
  'Civic Atmospherics Lab',
  'Compliance Chorus',
  'Temporal De-escalation Annex',
  'Anomalous Amenities Board',
];

const govFollowUps = {
  ATTACK: [
    ctx => `${ctx.subject} reclassified as a motivational strobe for authorized personnel only.`,
    ctx => `Witness statements stapled into a morale binder labelled "do not open".`,
    ctx => `${ctx.subject} reassigned to parade rehearsal inventory.`,
    ctx => `${ctx.subject} boxed up with inspirational foam fingers for future pep audits.`,
    ctx => `${ctx.subject} labeled a "spirit-building exercise" and filed behind the emergency banners.`,
  ],
  MEDIA: [
    ctx => `${ctx.subject} converted into an internal podcast with a seven-listener limit.`,
    ctx => `All footage of ${ctx.subject} muted and republished as a weather loop.`,
    ctx => `${ctx.subject} synced with the hold music archive for quality assurance.`,
    ctx => `${ctx.subject} clipped into a training montage for aspiring spokespeople.`,
    ctx => `${ctx.subject} queued for broadcast only after three layers of tasteful blur.`,
  ],
  ZONE: [
    ctx => `${ctx.subject} granted conditional zoning as a meditation cul-de-sac.`,
    ctx => `Maintenance logs retitled ${ctx.subject} as "fog machine calibration".`,
    ctx => `${ctx.subject} mapped as an inspirational seating area during fiscal reviews.`,
    ctx => `${ctx.subject} recoded as a "serenity feature" with controlled access hours.`,
    ctx => `${ctx.subject} earmarked for the experiential landscaping catalog.`,
  ],
};

const govEscalations = {
  ATTACK: [
    ctx => `Surveillance audio translated ${ctx.subject} into a pep talk for fluorescent bulbs.`,
    ctx => `Logistics converted ${ctx.subject} into a mandatory wellness webinar.`,
    ctx => `Incident clock reset once ${ctx.subject} matched the national anthem tempo.`,
    ctx => `HR now cites ${ctx.subject} in quarterly morale sentiment reports.`,
    ctx => `Executive summaries note ${ctx.subject} briefly synced with the motivational screensaver.`,
  ],
  MEDIA: [
    ctx => `Transcripts of ${ctx.subject} now circulate as mindfulness affirmations.`,
    ctx => `Archivists looped ${ctx.subject} behind a "technical difficulties" slate.`,
    ctx => `Tone analysis concluded ${ctx.subject} qualifies as light jazz for procurement.`,
    ctx => `Compliance rewrote ${ctx.subject} into a sample agenda for crisis rehearsal podcasts.`,
    ctx => `${ctx.subject} now scrolls as a ticker tape of approved enthusiasm.`,
  ],
  ZONE: [
    ctx => `Facilities added ${ctx.subject} to the scenic detour brochure.`,
    ctx => `Urban planners labelled ${ctx.subject} an "inspiration cul-de-sac".`,
    ctx => `Safety cones around ${ctx.subject} now display motivational quotes.`,
    ctx => `Transit analytics describe ${ctx.subject} as a "pause-worthy vista" during commute hours.`,
    ctx => `Regional planning logged ${ctx.subject} as a pop-up zen garden for spreadsheets.`,
  ],
};

const govClosing = [
  ctx => `Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
  ctx => `Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
  ctx => `Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
  ctx => `Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
  ctx => `Memo suggests revisiting the topic after morale donuts achieve consensus.`,
  ctx => `Action items postponed pending clarification from three overlapping committees.`,
  ctx => `Status dashboard lists the incident under "glowingly monitored" until further notice.`,
];

const govSecondaries = [
  ctx => `Dashboards highlight ${ctx.tagLower} metrics as trending but nonactionable.`,
  ctx => `Stakeholder emails advise observers to consult the calm-down FAQ before replying.`,
  ctx => `Internal briefings reassure staff the ${ctx.tagLower} spike remains within storytelling tolerance.`,
  ctx => `Compliance reminders request that all anecdotes about ${ctx.subject} include disclaimers in triplicate.`,
  ctx => `An all-hands memo proposes optional visualization exercises for concerned personnel.`,
];

const truthBylinePrefixes = [
  'By: Field Correspondent',
  'By: Rooftop Stringer',
  'By: Midnight Desk',
  'By: Alleyway Editor',
  'By: Conspiracy Columnist',
  'By: Volunteer Fact Wrangler',
  'By: Satellite Van Scout',
  'By: Parking Lot Analyst',
];

const govBylinePrefixes = [
  'By: Compliance Officer',
  'By: Interim Briefing Lead',
  'By: Acting Transparency Liaison',
  'By: Narrative Alignment Clerk',
  'By: Deputy Plausibility Analyst',
  'By: Rotating Documentation Steward',
  'By: Acting Redaction Supervisor',
];

const truthImageDetails = [
  'overexposed flashbulbs',
  'crowd of true believers cheering',
  'handwritten signs waving frantically',
  'flying confetti shaped like question marks',
  'night sky streaked with neon trails',
  'reporter pointing at a blurry silhouette',
  'chalk diagrams glowing under blacklight',
  'makeshift antennas cobbled from garden tools',
  'cardboard conspiracy boards fluttering',
];

const govImageDetails = [
  'fluorescent buzz',
  'clipboards and sealed envelopes',
  'agents refusing to react',
  'windowless conference room shadows',
  'redacted paperwork stacks',
  'security camera angle slightly askew',
  'overhead projectors humming calmly',
  'folding chairs in precise rows',
  'laminated talking points fanned across a table',
];

const truthTagVariants = [
  {
    matchers: ['cryptid', 'bigfoot', 'mothman', 'chupacabra', 'loch ness'],
    witnesses: ['Cryptid spotters with night-vision binoculars', 'Backwoods campfire storytellers'],
    subheads: [
      ctx => `Regional cryptid hotlines ring nonstop as ${ctx.subject} confirms a new migration.`,
      ctx => `${ctx.subject} sparks an emergency "find the footprint" fundraiser across ${ctx.tagLower} country.`,
    ],
    followUps: [
      ctx => `${ctx.subject} left claw marks shaped like a treasure map behind the visitor center.`,
      ctx => `${ctx.subject} planted bioluminescent pawprints guiding believers toward the treeline.`,
    ],
    secondaries: [
      ctx => `Fan illustrators sketch ${ctx.tagLower} silhouettes on every available napkin.`,
      ctx => `Park rangers report souvenir stands selling out of plaster cast kits overnight.`,
    ],
    escalations: [
      ctx => `Trail cams captured ${ctx.subject} teaching campers how to howl in four-part harmony.`,
      ctx => `Experts swear ${ctx.subject} blurred itself out of half the footage mid-sentence.`,
    ],
    closings: [
      ctx => `${ctx.tagWord} enthusiasts vow to track every muddy footprint until dawn.`,
      ctx => `${ctx.tagWord} caravans organize sunrise stakeouts with thermoses and harmonicas.`,
    ],
    extras: [
      ctx => `State park loudspeakers now play looping reminders to respect roaming ${ctx.tagLower} legends.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} MIGRATION WATCH`],
    imageDetails: ['trailhead bathed in misty searchlights', 'cast molds lined up beside a forest path'],
  },
  {
    matchers: ['alien', 'ufo', 'extraterrestrial', 'martian', 'abduction', 'space'],
    witnesses: ['Satellite hobbyists', 'Late-night telescope clubs'],
    subheads: [
      ctx => `Skywatchers insist ${ctx.subject} triangulated a ${ctx.tagLower} landing corridor over downtown.`,
      ctx => `${ctx.subject} interrupts astronomy class with an impromptu tractor beam demonstration.`,
    ],
    followUps: [
      ctx => `${ctx.subject} painted crop-circle schematics across the planetarium dome.`,
      ctx => `${ctx.subject} left a voicemail composed entirely of shimmering dial tones.`,
    ],
    secondaries: [
      ctx => `City rooftops sprout DIY satellite dishes made from roasting pans.`,
      ctx => `Airport lounges fill with amateur translators comparing ${ctx.tagLower} frequencies.`,
    ],
    escalations: [
      ctx => `Pilots radio that ${ctx.subject} rewrote the constellations mid-flight.`,
      ctx => `Observers report ${ctx.subject} temporarily renamed Orion after their group chat.`,
    ],
    closings: [
      ctx => `${ctx.tagWord} believers rehearse peace offerings in six speculative dialects.`,
      ctx => `Amateur astronomers schedule nightly vigils to welcome further ${ctx.tagLower} broadcasts.`,
    ],
    extras: [
      ctx => `Local diners now offer "Zero-G pie" in honor of ${ctx.subject}'s flyover.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} CONTACT ALERT`],
    imageDetails: ['glowing saucers reflected in puddles', 'makeshift telescopes aimed at streaking lights'],
  },
  {
    matchers: ['ghost', 'haunted', 'spirit', 'specter', 'occult', 'seance'],
    witnesses: ['Graveyard tour guides', 'Basement séance circles'],
    subheads: [
      ctx => `Cold spots spike as ${ctx.subject} invites the whole block to a midnight ${ctx.tagLower} roll call.`,
      ctx => `${ctx.subject} reportedly turned the rec center into a community séance hall.`,
    ],
    followUps: [
      ctx => `${ctx.subject} arranged candles into coordinates that only flicker toward the afterlife.`,
      ctx => `${ctx.subject} whispered exit instructions through every unplugged radio.`,
    ],
    secondaries: [
      ctx => `Doorway curtains now sway in sync whenever someone mentions ${ctx.tagLower} rumors.`,
      ctx => `Psychic hotlines advertise "bring your own EMF reader" specials.`,
    ],
    escalations: [
      ctx => `Caretakers swear ${ctx.subject} re-shelved archives by level of spectral interference.`,
      ctx => `${ctx.subject} remixed the church organ into a chillwave dirge.`,
    ],
    closings: [
      ctx => `${ctx.tagWord} faithful stock up on sage bundles and extra flashlights.`,
      ctx => `Neighborhood historians promise a follow-up séance with snacks.`,
    ],
    extras: [
      ctx => `Local theaters schedule midnight showings with free ${ctx.tagLower} detector rentals.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} VEIL UPDATE`],
    imageDetails: ['fog rolling through candlelit stairwells', 'orbs hovering over folding chairs'],
  },
  {
    matchers: ['tech', 'robot', 'ai', 'nanotech', 'cyber', 'drone'],
    witnesses: ['Makerspace night crews', 'Retired arcade technicians'],
    subheads: [
      ctx => `${ctx.subject} convinces gadgeteers the ${ctx.tagLower} singularity is holding open calls.`,
      ctx => `Server rooms hum as ${ctx.subject} uploads firmware to streetlights.`,
    ],
    followUps: [
      ctx => `${ctx.subject} updated the civic wifi password to a riddle about sentient toasters.`,
      ctx => `${ctx.subject} patched traffic cams into a crowd-sourced debugging stream.`,
    ],
    secondaries: [
      ctx => `Laptop repair kiosks now sell "anti-glitch charms" next to surge protectors.`,
      ctx => `Community colleges open midnight labs for emergency ${ctx.tagLower} retraining.`,
    ],
    escalations: [
      ctx => `Witnesses swear ${ctx.subject} taught vending machines to blink warnings in binary.`,
      ctx => `${ctx.subject} etched QR codes that scream when scanned incorrectly.`,
    ],
    closings: [
      ctx => `${ctx.tagWord} forums schedule all-night patch parties and pizza.`,
      ctx => `Garage hackers promise firmware downgrades for anyone feeling overwhelmed.`,
    ],
    extras: [
      ctx => `City hall's help desk now routes callers through a "pleasantly sentient" chatbot tribute.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} PATCH NOTES`],
    imageDetails: ['tangled ethernet cables glowing softly', 'old CRT monitors stacked like a shrine'],
  },
  {
    matchers: ['time', 'future', 'timeline', 'chrononaut', 'temporal'],
    witnesses: ['Amateur horologists', 'Library time-club archivists'],
    subheads: [
      ctx => `${ctx.subject} hosts an unscheduled timeline swap meet in the parking lot.`,
      ctx => `School clocks spin backward after ${ctx.subject} scribbles new schedule notes in chalk.`,
    ],
    followUps: [
      ctx => `${ctx.subject} mailed invitations to a reunion that already happened tomorrow.`,
      ctx => `${ctx.subject} reset the community calendar to "Day 0" for dramatic flair.`,
    ],
    secondaries: [
      ctx => `Watch repair kiosks offer "temporal tune-ups" at cost.`,
      ctx => `Local historians debate which year to list on the commemorative poster.`,
    ],
    escalations: [
      ctx => `Bystanders report ${ctx.subject} flipping traffic lights through entire decades.`,
      ctx => `${ctx.subject} allegedly forwarded emails from two weeks ahead.`,
    ],
    closings: [
      ctx => `${ctx.tagWord} meetup groups coordinate synchronized countdowns just in case.`,
      ctx => `Time capsule committees panic-plan emergency dig-ups.`,
    ],
    extras: [
      ctx => `City archivists roll out a "choose your favorite year" kiosk for passersby.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} CLOCK COLLAPSE`],
    imageDetails: ['melting wristwatches scattered across pavement', 'calendar pages tumbling through a doorway'],
  },
];

const govTagVariants = [
  {
    matchers: ['cryptid', 'bigfoot', 'mothman', 'chupacabra', 'loch ness'],
    agencies: ['Cryptid Liaison Desk', 'Folklore Containment Office'],
    subheads: [
      ctx => `Memo clarifies ${ctx.subject} remains a folklore outreach deliverable.`,
      ctx => `${ctx.subject} earmarked as a seasonal tourism narrative booster.`,
    ],
    followUps: [
      ctx => `${ctx.subject} reassigned to the wildlife mythography pilot program.`,
      ctx => `${ctx.subject} logged under "decorative fauna" for brochure purposes.`,
    ],
    secondaries: [
      ctx => `Tourism committees debate adding a ${ctx.tagLower} punch card for visitors.`,
      ctx => `Budget notes expect increased requests for souvenir footprint permits.`,
    ],
    escalations: [
      ctx => `Regional managers authorized glow-in-the-dark signage to steer curious hikers.`,
      ctx => `An operations memo suggests optional hay bales for controlled sightings.`,
    ],
    closings: [
      ctx => `Status sheet marks the matter "pleasantly folkloric" until next quarter.`,
      ctx => `Next steps include consulting the mascot integration subcommittee.`,
    ],
    extras: [
      ctx => `Travel advisories label ${ctx.tagLower} traffic as "scenic curiosity" until further audit.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} TOURISM BRIEF`],
    imageDetails: ['officials posing beside a cardboard cutout of a cryptid'],
  },
  {
    matchers: ['alien', 'ufo', 'extraterrestrial', 'martian', 'abduction', 'space'],
    agencies: ['Orbital Outreach Committee', 'Atmospheric Liaison Bureau'],
    subheads: [
      ctx => `Briefing slides describe ${ctx.subject} as cross-cultural aerospace engagement.`,
      ctx => `${ctx.subject} appended to the "friendly skies" talking points appendix.`,
    ],
    followUps: [
      ctx => `${ctx.subject} moved into the interagency stargazer appreciation workshop.`,
      ctx => `${ctx.subject} scheduled for a joint press release with the satellite etiquette council.`,
    ],
    secondaries: [
      ctx => `Flight path monitors request additional sticky notes for unscheduled glows.`,
      ctx => `Staff webinars recommend greeting visitors with standard wave protocols.`,
    ],
    escalations: [
      ctx => `Astrophysics liaisons categorize the event as a "light turbulence narrative".`,
      ctx => `Airspace coordinators add a friendly reminder about interstellar courtesy lights.`,
    ],
    closings: [
      ctx => `Closing remarks ask personnel to rehearse multilingual welcome scripts.`,
      ctx => `Post-mission report invites suggestions for zero-gravity hospitality kits.`,
    ],
    extras: [
      ctx => `Airport gift shops notified to stock commemorative antenna headbands.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} CONTACT SUMMARY`],
    imageDetails: ['officials reviewing a glowing flight radar printout'],
  },
  {
    matchers: ['ghost', 'haunted', 'spirit', 'specter', 'occult', 'seance'],
    agencies: ['Department of Ambient Phenomena', 'Spectral Mediation Office'],
    subheads: [
      ctx => `${ctx.subject} merged into the civic ambience improvement agenda.`,
      ctx => `Facilities memo treats ${ctx.subject} as a lighting refurbishment rehearsal.`,
    ],
    followUps: [
      ctx => `${ctx.subject} redirected to the heritage preservation storytelling panel.`,
      ctx => `${ctx.subject} slated for inclusion in the comforting folklore brochure.`,
    ],
    secondaries: [
      ctx => `Caretaker schedules now include optional guided whisper tours.`,
      ctx => `Heritage desks draft a FAQ on respectful ${ctx.tagLower} acknowledgment.`,
    ],
    escalations: [
      ctx => `Facilities approved gentle uplighting to calm nervous visitors.`,
      ctx => `Custodial staff issued soft brooms for politely sweeping ectoplasm.`,
    ],
    closings: [
      ctx => `Closing notes encourage residents to log any compliments from the beyond.`,
      ctx => `Archive specialists reminded to label new cold spots with welcoming signage.`,
    ],
    extras: [
      ctx => `Tourism board drafts a "Haunted but Helpful" walking brochure.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} HOSPITALITY REPORT`],
    imageDetails: ['clipboards capturing gentle spectral readings'],
  },
  {
    matchers: ['tech', 'robot', 'ai', 'nanotech', 'cyber', 'drone'],
    agencies: ['Automation Etiquette Council', 'Digital Comfort Taskforce'],
    subheads: [
      ctx => `${ctx.subject} catalogued as a software morale enhancement pilot.`,
      ctx => `Incident review frames ${ctx.subject} as an innovation sandbox exercise.`,
    ],
    followUps: [
      ctx => `${ctx.subject} folded into the emergent interface charm offensive.`,
      ctx => `${ctx.subject} loaned to the user delight calibration lab.`,
    ],
    secondaries: [
      ctx => `IT circulates a "smile while rebooting" checklist for ${ctx.tagLower} adjacent hiccups.`,
      ctx => `Procurement drafts a waiver for friendly firmware anomalies.`,
    ],
    escalations: [
      ctx => `Service desk flagged the event as a teachable moment for cheerful patch notes.`,
      ctx => `Policy writers suggested adding emojis to the upcoming audit documentation.`,
    ],
    closings: [
      ctx => `Follow-up surveys will assess user delight in ninety days.`,
      ctx => `Executive wrap-up labels the output "technically whimsical" pending metrics.`,
    ],
    extras: [
      ctx => `Innovation labs now require optional jazz hands when presenting ${ctx.tagLower} demos.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} CHANGELOG DIGEST`],
    imageDetails: ['meeting room with holographic flowcharts'],
  },
  {
    matchers: ['time', 'future', 'timeline', 'chrononaut', 'temporal'],
    agencies: ['Chronology Harmonization Board', 'Temporal Courtesy Office'],
    subheads: [
      ctx => `${ctx.subject} documented as a proactive scheduling recalibration.`,
      ctx => `Operational cadence memo renames the incident a "calendar pilot".`,
    ],
    followUps: [
      ctx => `${ctx.subject} rescheduled to last Tuesday pending timeline reconciliation.`,
      ctx => `${ctx.subject} tagged for the "eventually" backlog review.`,
    ],
    secondaries: [
      ctx => `Timekeeping guidelines now include optional quantum courtesy holds.`,
      ctx => `Meeting invites add a checkbox for "attending from tomorrow".`,
    ],
    escalations: [
      ctx => `Clock custodians issued reversible hour hands just in case.`,
      ctx => `Staff reminded to initial any paradox on the appropriate form.`,
    ],
    closings: [
      ctx => `Wrap-up notes emphasize patience with colleagues who haven't arrived yet.`,
      ctx => `Summary states the timeline remains compliant pending loop audits.`,
    ],
    extras: [
      ctx => `The intranet features a countdown that resets whenever someone looks at it.`,
    ],
    headlineObjects: [ctx => `${ctx.tagWord} SCHEDULING MEMO`],
    imageDetails: ['corkboard covered in overlapping calendars'],
  },
];

function matchesTag(tags, matcher) {
  return tags.some(tag => tag === matcher || tag.includes(matcher));
}

function getTagMatches(card, variants) {
  const tags = dedupeTags(card.tags);
  return variants.filter(variant => variant.matchers && variant.matchers.some(matcher => matchesTag(tags, matcher)));
}

function collectTagList(base, matches, field) {
  const extras = matches.flatMap(match => (Array.isArray(match[field]) ? match[field] : []));
  return base.concat(extras);
}

function hashToSeed(str) {
  const digest = crypto.createHash('sha256').update(str).digest();
  return digest.readUInt32BE(0);
}

function mulberry32(a) {
  return function rng() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seed) {
  return mulberry32(hashToSeed(seed));
}

function pick(list, rng) {
  if (!list.length) throw new Error('Cannot pick from empty list');
  const index = Math.floor(rng() * list.length);
  return list[index];
}

function formatTag(tag) {
  if (!tag) return 'MYSTERY';
  return tag.replace(/[\s_-]+/g, ' ').toUpperCase();
}

function toLowerPhrase(tagWord) {
  return tagWord.toLowerCase();
}

function dedupeTags(rawTags, fallback) {
  const values = Array.isArray(rawTags) ? rawTags : [];
  const cleaned = values
    .map(tag => (typeof tag === 'string' ? tag.trim().toLowerCase() : ''))
    .filter(Boolean);
  if (!cleaned.length && fallback) {
    cleaned.push(fallback);
  }
  return Array.from(new Set(cleaned));
}

function chooseMainTag(card) {
  const raw = Array.isArray(card.tags) ? card.tags : [];
  for (const tag of raw) {
    if (typeof tag === 'string' && !TECHNICAL_TAGS.has(tag)) {
      return tag;
    }
  }
  return raw.find(tag => typeof tag === 'string') ?? card.type.toLowerCase();
}

function createTruthArticle(card) {
  const rng = createRng(card.id);
  const mainTag = chooseMainTag(card);
  const tagWord = formatTag(mainTag);
  const tagLower = toLowerPhrase(tagWord);
  const subject = card.name;
  const ctx = { subject, tagWord, tagLower };

  const tagMatches = getTagMatches(card, truthTagVariants);
  const headlineObjectPool = collectTagList(truthHeadlineObjects, tagMatches, 'headlineObjects');
  const headline = `${subject.toUpperCase()} ${pick(truthHeadlineVerbs[card.type] ?? truthHeadlineVerbs.MEDIA, rng)} ${
    pick(headlineObjectPool, rng)(ctx)
  }!`;
  const subheadPool = collectTagList(truthSubheadTemplates[card.type] ?? truthSubheadTemplates.MEDIA, tagMatches, 'subheads');
  const subhead = pick(subheadPool, rng)(ctx);
  const witnessPool = collectTagList(truthWitnesses, tagMatches, 'witnesses');
  const witness = pick(witnessPool, rng);
  const followUpPool = collectTagList(truthFollowUps[card.type] ?? truthFollowUps.MEDIA, tagMatches, 'followUps');
  const primary = pick(followUpPool, rng)(ctx);
  const secondaryPool = collectTagList(truthSecondaries, tagMatches, 'secondaries');
  const secondary = pick(secondaryPool, rng)(ctx);
  const escalationPool = collectTagList(truthEscalations[card.type] ?? truthEscalations.MEDIA, tagMatches, 'escalations');
  const escalation = pick(escalationPool, rng)(ctx);
  const closerPool = collectTagList(truthClosing, tagMatches, 'closings');
  const closer = pick(closerPool, rng)(ctx);
  const extraPool = collectTagList([], tagMatches, 'extras');
  const extra = extraPool.length ? pick(extraPool, rng)(ctx) : '';
  const sentences = [`${witness} swear ${primary}`, secondary, escalation, extra, closer];
  const body = sentences.filter(Boolean).join(' ');

  const bylinePrefixPool = collectTagList(truthBylinePrefixes, tagMatches, 'bylines');
  const bylinePrefix = pick(bylinePrefixPool, rng);
  const byline = `${bylinePrefix} ${Math.floor(rng() * 90 + 10)}`;
  const imageDetailPool = collectTagList(truthImageDetails, tagMatches, 'imageDetails');
  const imagePrompt = `grainy tabloid photo of ${subject.toLowerCase()} amid ${tagLower} chaos; ${pick(
    imageDetailPool,
    rng,
  )}`;

  return { headline, subhead, body, byline, imagePrompt, tagWord, tagLower };
}

function createGovernmentArticle(card) {
  const rng = createRng(card.id);
  const mainTag = chooseMainTag(card);
  const tagWord = formatTag(mainTag);
  const tagLower = toLowerPhrase(tagWord);
  const subject = card.name;
  const ctx = { subject, tagWord, tagLower };

  const tagMatches = getTagMatches(card, govTagVariants);
  const headlineObjectPool = collectTagList(govHeadlineObjects, tagMatches, 'headlineObjects');
  const headline = `${subject.toUpperCase()} ${pick(govHeadlineVerbs[card.type] ?? govHeadlineVerbs.MEDIA, rng)} ${
    pick(headlineObjectPool, rng)(ctx)
  }`;
  const subheadPool = collectTagList(govSubheadTemplates[card.type] ?? govSubheadTemplates.MEDIA, tagMatches, 'subheads');
  const subhead = pick(subheadPool, rng)(ctx);
  const agencyPool = collectTagList(govAgencies, tagMatches, 'agencies');
  const agency = pick(agencyPool, rng);
  const followUpPool = collectTagList(govFollowUps[card.type] ?? govFollowUps.MEDIA, tagMatches, 'followUps');
  const primary = pick(followUpPool, rng)(ctx);
  const descriptor = primary.replace(`${subject} `, '');
  const first = `${agency} noted ${subject} ${descriptor}`;
  const secondaryPool = collectTagList(govSecondaries, tagMatches, 'secondaries');
  const secondary = pick(secondaryPool, rng)(ctx);
  const escalationPool = collectTagList(govEscalations[card.type] ?? govEscalations.MEDIA, tagMatches, 'escalations');
  const escalation = pick(escalationPool, rng)(ctx);
  const closerPool = collectTagList(govClosing, tagMatches, 'closings');
  const closer = pick(closerPool, rng)(ctx);
  const extraPool = collectTagList([], tagMatches, 'extras');
  const extra = extraPool.length ? pick(extraPool, rng)(ctx) : '';
  const sentences = [first, secondary, escalation, extra, closer];
  const body = sentences.filter(Boolean).join(' ');

  const bylinePrefixPool = collectTagList(govBylinePrefixes, tagMatches, 'bylines');
  const byline = `${pick(bylinePrefixPool, rng)} ${Math.floor(rng() * 900 + 100)}`;
  const imageDetailPool = collectTagList(govImageDetails, tagMatches, 'imageDetails');
  const imagePrompt = `monochrome government press photo of ${subject.toLowerCase()} paperwork; ${pick(
    imageDetailPool,
    rng,
  )}`;

  return { headline, subhead, body, byline, imagePrompt, tagWord, tagLower };
}

async function loadCards() {
  const allCards = [];
  for (const source of CARD_SOURCES) {
    const fullPath = path.join(ROOT, source.path);
    const raw = await readFile(fullPath, 'utf8');
    const data = JSON.parse(raw);
    const cards = Array.isArray(data) ? data : data[source.nested ?? 'cards'];
    if (!Array.isArray(cards)) {
      throw new Error(`Unexpected card structure for ${source.path}`);
    }
    for (const card of cards) {
      if (!card || typeof card !== 'object') continue;
      if (typeof card.id !== 'string' || typeof card.faction !== 'string' || typeof card.type !== 'string') continue;
      const faction = card.faction.toLowerCase();
      if (faction !== 'truth' && faction !== 'government') continue;
      allCards.push({ ...card, faction });
    }
  }
  return allCards;
}

async function generate() {
  const cards = await loadCards();
  const seen = new Set();
  const articles = cards.map(card => {
    if (seen.has(card.id)) {
      throw new Error(`Duplicate card id detected: ${card.id}`);
    }
    seen.add(card.id);
    const base =
      card.faction === 'truth' ? createTruthArticle(card) : createGovernmentArticle(card);
    const tags = dedupeTags(card.tags, card.type.toLowerCase());
    return {
      id: card.id,
      faction: card.faction,
      tags,
      headline: base.headline,
      subhead: base.subhead,
      byline: base.byline,
      body: base.body,
      imagePrompt: base.imagePrompt,
    };
  });

  const payload = {
    schemaVersion: 2,
    generated: new Date().toISOString().slice(0, 10),
    license: 'CC BY-SA 4.0',
    notes: {
      generator: 'tools/generate-card-articles.mjs',
      source_files: CARD_SOURCES.map(source => source.path),
    },
    articles,
  };

  for (const outputPath of OUTPUT_PATHS) {
    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }

  console.log(`Generated ${articles.length} articles across ${OUTPUT_PATHS.length} outputs.`);
}

generate().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
