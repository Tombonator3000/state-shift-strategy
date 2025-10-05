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
];

const truthSubheadTemplates = {
  ATTACK: [
    ctx => `Hotline lights up as ${ctx.subject} allegedly spray-paints the sky with ${ctx.tagLower} confetti.`,
    ctx => `Witnesses whisper ${ctx.subject} rang every doomsday bell at once.`,
    ctx => `${ctx.tagWord} club cancels bingo so they can follow ${ctx.subject} in real time.`,
  ],
  MEDIA: [
    ctx => `Streaming rigs wobble while ${ctx.subject} beams raw ${ctx.tagLower} proof to anyone still buffering.`,
    ctx => `Community radio swears ${ctx.subject} hijacked the feed with cosmic receipts.`,
    ctx => `Local vloggers caption ${ctx.subject} as "finally, undeniable ${ctx.tagLower}".`,
  ],
  ZONE: [
    ctx => `Neighborhood watch maps redraw themselves once ${ctx.subject} opens a ${ctx.tagLower} hotspot.`,
    ctx => `County clerks concede ${ctx.subject} turned the picnic grounds into a portal.`,
    ctx => `Amateur dowsers sprint over as ${ctx.subject} makes gravity blink.`,
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
];

const truthFollowUps = {
  ATTACK: [
    ctx => `${ctx.subject} reportedly high-fived a ${ctx.tagLower} silhouette before the courthouse lights exploded into karaoke.`,
    ctx => `${ctx.subject} left glitter bootprints spelling "WE WARNED YOU" across Main Street.`,
    ctx => `${ctx.subject} made the mayor's voicemail play theremin chords backward for an hour.`,
  ],
  MEDIA: [
    ctx => `${ctx.subject} uploaded a zip file labeled "REAL PROOF" that screams when opened.`,
    ctx => `${ctx.subject} turned the rotary phone tree into a 4K broadcast network.`,
    ctx => `${ctx.subject} looped the emergency siren so it chants "believe harder".`,
  ],
  ZONE: [
    ctx => `${ctx.subject} carved a crop circle inside the county annex lobby.`,
    ctx => `${ctx.subject} re-tuned the town gazebo into a wormhole waiting room.`,
    ctx => `${ctx.subject} made the high school scoreboard track interdimensional weather.`,
  ],
};

const truthEscalations = {
  ATTACK: [
    ctx => `Cellphone footage shows ${ctx.subject} juggling glowing subpoenas before tossing them skyward.`,
    ctx => `Neighbors claim ${ctx.subject} rewired the streetlights into a blinking "TRUTH" marquee.`,
    ctx => `${ctx.subject} allegedly taught pigeons to chant classified coordinates in harmony.`,
  ],
  MEDIA: [
    ctx => `Podcast guests insist ${ctx.subject} turned feedback hiss into a prophecy about ${ctx.tagLower} alliances.`,
    ctx => `One caller reports ${ctx.subject} crowdsourced captions faster than fact-checkers could blink.`,
    ctx => `${ctx.subject} premiered a teaser trailer for the sequel mid-interview.`,
  ],
  ZONE: [
    ctx => `Spectators swear ${ctx.subject} folded the marching band into a shimmering doorway.`,
    ctx => `${ctx.subject} made parking meters count down in alien numerals.`,
    ctx => `Meteorologists report ${ctx.subject} left a weather map drawn in ectoplasm.`,
  ],
};

const truthClosing = [
  ctx => `${ctx.tagWord} faithful now planning an emergency potluck and candle-lit slideshow.`,
  ctx => `Tin-foil futures spike as ${ctx.tagLower} believers mark off PTO for vigilance.`,
  ctx => `Teens already selling bootleg merch that reads "${ctx.subject.toUpperCase()} CALLED IT".`,
  ctx => `Grandma hotline volunteers request backup batteries and a calming playlist.`,
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
];

const govSubheadTemplates = {
  ATTACK: [
    ctx => `Briefing assures stakeholders ${ctx.subject} remains a morale exercise pending future paperwork.`,
    ctx => `Agency memo labels ${ctx.subject} "pep rally noise" and moves on.`,
    ctx => `${ctx.tagWord} chatter redirected into a resilience coaching session.`,
  ],
  MEDIA: [
    ctx => `Communications office redacts ${ctx.subject} into three tasteful bullet points.`,
    ctx => `${ctx.subject} folded into weather segment; captions to be determined post-clearance.`,
    ctx => `Stakeholder Q&A postponed until the tape finishes being redacted twice.`,
  ],
  ZONE: [
    ctx => `Logbook records ${ctx.subject} as landscaping maintenance with optional cones.`,
    ctx => `Perimeter signage proclaims "all portals scheduled"; ${ctx.subject} marked as scenic.`,
    ctx => `Transit alerts call ${ctx.subject} a temporary civic glow event.`,
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
];

const govFollowUps = {
  ATTACK: [
    ctx => `${ctx.subject} reclassified as a motivational strobe for authorized personnel only.`,
    ctx => `Witness statements stapled into a morale binder labelled "do not open".`,
    ctx => `${ctx.subject} reassigned to parade rehearsal inventory.`,
  ],
  MEDIA: [
    ctx => `${ctx.subject} converted into an internal podcast with a seven-listener limit.`,
    ctx => `All footage of ${ctx.subject} muted and republished as a weather loop.`,
    ctx => `${ctx.subject} synced with the hold music archive for quality assurance.`,
  ],
  ZONE: [
    ctx => `${ctx.subject} granted conditional zoning as a meditation cul-de-sac.`,
    ctx => `Maintenance logs retitled ${ctx.subject} as "fog machine calibration".`,
    ctx => `${ctx.subject} mapped as an inspirational seating area during fiscal reviews.`,
  ],
};

const govEscalations = {
  ATTACK: [
    ctx => `Surveillance audio translated ${ctx.subject} into a pep talk for fluorescent bulbs.`,
    ctx => `Logistics converted ${ctx.subject} into a mandatory wellness webinar.`,
    ctx => `Incident clock reset once ${ctx.subject} matched the national anthem tempo.`,
  ],
  MEDIA: [
    ctx => `Transcripts of ${ctx.subject} now circulate as mindfulness affirmations.`,
    ctx => `Archivists looped ${ctx.subject} behind a "technical difficulties" slate.`,
    ctx => `Tone analysis concluded ${ctx.subject} qualifies as light jazz for procurement.`,
  ],
  ZONE: [
    ctx => `Facilities added ${ctx.subject} to the scenic detour brochure.`,
    ctx => `Urban planners labelled ${ctx.subject} an "inspiration cul-de-sac".`,
    ctx => `Safety cones around ${ctx.subject} now display motivational quotes.`,
  ],
};

const govClosing = [
  ctx => `Review deferred until after the next fiscal eclipse or sooner if the copier behaves.`,
  ctx => `Public inquiries invited via form 27-B/∞ with carbon copies for recycling.`,
  ctx => `Final determination scheduled for a meeting that keeps being rescheduled to yesterday.`,
  ctx => `Advisory concludes everything is proceeding at a comfortable bureaucratic pace.`,
];

const truthBylinePrefixes = [
  'By: Field Correspondent',
  'By: Rooftop Stringer',
  'By: Midnight Desk',
  'By: Alleyway Editor',
  'By: Conspiracy Columnist',
  'By: Volunteer Fact Wrangler',
];

const govBylinePrefixes = [
  'By: Compliance Officer',
  'By: Interim Briefing Lead',
  'By: Acting Transparency Liaison',
  'By: Narrative Alignment Clerk',
  'By: Deputy Plausibility Analyst',
];

const truthImageDetails = [
  'overexposed flashbulbs',
  'crowd of true believers cheering',
  'handwritten signs waving frantically',
  'flying confetti shaped like question marks',
  'night sky streaked with neon trails',
  'reporter pointing at a blurry silhouette',
];

const govImageDetails = [
  'fluorescent buzz',
  'clipboards and sealed envelopes',
  'agents refusing to react',
  'windowless conference room shadows',
  'redacted paperwork stacks',
  'security camera angle slightly askew',
];

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

  const headline = `${subject.toUpperCase()} ${pick(truthHeadlineVerbs[card.type] ?? truthHeadlineVerbs.MEDIA, rng)} ${
    pick(truthHeadlineObjects, rng)(ctx)
  }!`;
  const subhead = pick(truthSubheadTemplates[card.type] ?? truthSubheadTemplates.MEDIA, rng)(ctx);
  const witness = pick(truthWitnesses, rng);
  const primary = pick(truthFollowUps[card.type] ?? truthFollowUps.MEDIA, rng)(ctx);
  const escalation = pick(truthEscalations[card.type] ?? truthEscalations.MEDIA, rng)(ctx);
  const closer = pick(truthClosing, rng)(ctx);
  const body = `${witness} swear ${primary} ${escalation} ${closer}`;

  const bylinePrefix = pick(truthBylinePrefixes, rng);
  const byline = `${bylinePrefix} ${Math.floor(rng() * 90 + 10)}`;
  const imagePrompt = `grainy tabloid photo of ${subject.toLowerCase()} amid ${tagLower} chaos; ${pick(
    truthImageDetails,
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

  const headline = `${subject.toUpperCase()} ${pick(govHeadlineVerbs[card.type] ?? govHeadlineVerbs.MEDIA, rng)} ${
    pick(govHeadlineObjects, rng)(ctx)
  }`;
  const subhead = pick(govSubheadTemplates[card.type] ?? govSubheadTemplates.MEDIA, rng)(ctx);
  const agency = pick(govAgencies, rng);
  const primary = pick(govFollowUps[card.type] ?? govFollowUps.MEDIA, rng)(ctx);
  const descriptor = primary.replace(`${subject} `, '');
  const first = `${agency} noted ${subject} ${descriptor}`;
  const escalation = pick(govEscalations[card.type] ?? govEscalations.MEDIA, rng)(ctx);
  const closer = pick(govClosing, rng)(ctx);
  const body = `${first} ${escalation} ${closer}`;

  const byline = `${pick(govBylinePrefixes, rng)} ${Math.floor(rng() * 900 + 100)}`;
  const imagePrompt = `monochrome government press photo of ${subject.toLowerCase()} paperwork; ${pick(
    govImageDetails,
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
