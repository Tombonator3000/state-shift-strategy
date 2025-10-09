export type ParapediaSignalLevel = 'low' | 'medium' | 'high';

export type ParapediaReference = {
  id: string;
  title: string;
  url: string;
  summary: string;
  sourceType: 'declassified' | 'press' | 'witness' | 'analysis';
};

export type ParapediaTimelineEvent = {
  id: string;
  year: number;
  title: string;
  description: string;
};

export type ParapediaEntry = {
  id: string;
  name: string;
  category: 'cryptid' | 'ufo' | 'haunting' | 'conspiracy';
  stateId: string;
  region: string;
  signalLevel: ParapediaSignalLevel;
  summary: string;
  tags: string[];
  featuredQuote?: string;
  quoteAttribution?: string;
  timeline: ParapediaTimelineEvent[];
  references: ParapediaReference[];
};

export type ParapediaStateSummary = {
  stateId: string;
  name: string;
  region: string;
  anomaliesIndexed: number;
  hotspots: string[];
  headline: string;
  trend: 'rising' | 'steady' | 'volatile';
  knownFor: string;
  lastUpdated: string;
  featuredEntryIds: string[];
};

export type ParapediaAtlas = {
  generatedAt: string;
  datasetNotes: string;
  entries: readonly ParapediaEntry[];
  states: Readonly<Record<string, ParapediaStateSummary>>;
  categories: readonly string[];
};

/**
 * ParaPedia dataset: curated cryptids, UFO incidents, and spectral anomalies.
 *
 * Regeneration notes:
 * - Re-run the sourcing workflow (docs/parapedia-dataset-guide.md) when new
 *   cryptid expansion files land or Vetted releases updated UFO tallies.
 * - Normalize state identifiers against USPS codes and verify regions align
 *   with player hub map groupings (see src/state/index.ts).
 * - Update references with a stable URL plus a short description—ParaPedia
 *   surfaces them as player-facing tooltips.
 */
export const parapediaAtlas = {
  generatedAt: '2024-02-12T00:00:00Z',
  datasetNotes:
    'Blends Cryptids Expansion hotspots with Vetted UFO surveillance digest and archival haunting dossiers.',
  categories: ['cryptid', 'ufo', 'haunting', 'conspiracy'],
  entries: [
    {
      id: 'wa-bigfoot-1974',
      name: 'Cascade Bigfoot Relay',
      category: 'cryptid',
      stateId: 'WA',
      region: 'Pacific Northwest',
      signalLevel: 'high',
      summary:
        'Furry silhouettes sprint between Cascades trailheads, leaving cedar-scented residue on ranger cams and shredded FOIA requests in their wake.',
      tags: ['bigfoot', 'trailhead', 'foia leak'],
      featuredQuote: 'He waved his laminated backstage pass before vanishing into the tree line.',
      quoteAttribution: 'Truth asset “Polaroid Prophet”',
      timeline: [
        {
          id: 'wa-bigfoot-1967',
          year: 1967,
          title: 'Patterson–Gimlin Film Resurface',
          description:
            'Truth archivists restore the classic reel, revealing a second figure in the tree canopy signaling Morse code toward Mount St. Helens.',
        },
        {
          id: 'wa-bigfoot-1999',
          year: 1999,
          title: 'Backstage Pass Sting',
          description:
            'Government agents pose as festival security; Bigfoot trades autographs for redacted setlists that later leak to ParaPedia.',
        },
        {
          id: 'wa-bigfoot-2023',
          year: 2023,
          title: 'Trail Relay Mystery',
          description:
            'Vetted drone sweep spots synchronized footprints near Snoqualmie. Truth operatives log the pattern as “relay baton drops.”',
        },
      ],
      references: [
        {
          id: 'ref-cryptids-readme-bigfoot',
          title: 'Cryptids Expansion Appendix A — Bigfoot Congress',
          url: 'https://paranoid-times.invalid/extensions/cryptids#bigfoot',
          summary: 'Design bible excerpt detailing Bigfoot combos and homestate bonuses.',
          sourceType: 'analysis',
        },
        {
          id: 'ref-vetted-ufo-2023',
          title: 'Vetted: 2023 US UFO Sightings Breakdown',
          url: 'https://www.vetted.ai/blog/us-ufo-sightings-2023',
          summary: 'Vetted anomaly index cross-references Pacific Northwest radar events.',
          sourceType: 'analysis',
        },
        {
          id: 'ref-wikipedia-bigfoot',
          title: 'Wikipedia — Bigfoot',
          url: 'https://en.wikipedia.org/wiki/Bigfoot',
          summary: 'Public dossier of alleged Sasquatch encounters and cultural impact.',
          sourceType: 'press',
        },
      ],
    },
    {
      id: 'wv-mothman-1966',
      name: 'Point Pleasant Beacon',
      category: 'cryptid',
      stateId: 'WV',
      region: 'Appalachia',
      signalLevel: 'medium',
      summary:
        'Red-eyed sentry loops the Silver Bridge ruins, blinking Morse warnings whenever municipal paperwork looks too tidy.',
      tags: ['mothman', 'bridge', 'omen'],
      featuredQuote: 'If you hear the wings, you already signed the waiver.',
      quoteAttribution: 'Agent Glasswing (Truth Field Desk)',
      timeline: [
        {
          id: 'wv-mothman-1966-sightings',
          year: 1966,
          title: 'First Silver Bridge Sweep',
          description:
            'Witnesses report a “man-sized owl” circling squad cars. Government memos classify it as a prank, ParaPedia logs the flight pattern.',
        },
        {
          id: 'wv-mothman-1975',
          year: 1975,
          title: 'Blue Book Addendum Leak',
          description:
            'ShadowGov analyst uploads an addendum linking the omen to faulty rivets; Truth archivists mirror the file before deletion.',
        },
        {
          id: 'wv-mothman-2017',
          year: 2017,
          title: 'Drone-Thermal Confirmation',
          description:
            'Vetted crowdsource project captures heat signatures above the river; ParaPedia cross-tags it with renewed bridge audits.',
        },
      ],
      references: [
        {
          id: 'ref-cryptids-readme-mothman',
          title: 'Cryptids Expansion Appendix A — Mothman Prophecy',
          url: 'https://paranoid-times.invalid/extensions/cryptids#mothman',
          summary: 'Combo table entry describing the media amplification effect.',
          sourceType: 'analysis',
        },
        {
          id: 'ref-wikipedia-mothman',
          title: 'Wikipedia — Mothman',
          url: 'https://en.wikipedia.org/wiki/Mothman',
          summary: 'Encyclopedia entry covering Point Pleasant sightings and folklore.',
          sourceType: 'press',
        },
        {
          id: 'ref-vetted-sightings',
          title: 'Vetted: Appalachian Radar Irregularities',
          url: 'https://www.vetted.ai/blog/appalachian-radar-ghosts',
          summary: 'Radar sweeps capturing unexplained nocturnal traffic over Point Pleasant.',
          sourceType: 'analysis',
        },
      ],
    },
    {
      id: 'nj-jersey-devil-1909',
      name: 'Pine Barrens Intercept',
      category: 'cryptid',
      stateId: 'NJ',
      region: 'Mid-Atlantic',
      signalLevel: 'medium',
      summary:
        'Hoofprints melt fresh snow near decommissioned radio towers; Homeland Security insists it is feral horses wearing night-vision.',
      tags: ['jersey devil', 'pine barrens', 'radio towers'],
      timeline: [
        {
          id: 'nj-jersey-devil-1909-flap',
          year: 1909,
          title: 'South Jersey 1909 Flap',
          description:
            'Newspapers publish the week-long panic. ParaPedia threads the dispatches into a timeline of disrupted rail shipments.',
        },
        {
          id: 'nj-jersey-devil-1972',
          year: 1972,
          title: 'Fort Dix Security Report',
          description:
            'Base MPs chase a winged form beyond the perimeter. Classified memo leaks to Truth message boards in 2004.',
        },
        {
          id: 'nj-jersey-devil-2021',
          year: 2021,
          title: 'Cell Tower Anomaly',
          description:
            'Telecom contractors log repeated outages. ParaPedia cross-links the outages with Pine Barrens “screech hour” recordings.',
        },
      ],
      references: [
        {
          id: 'ref-cryptids-readme-jersey-devil',
          title: 'Cryptids Expansion Homestate Bonuses — Jersey Devil',
          url: 'https://paranoid-times.invalid/extensions/cryptids#jersey-devil',
          summary: 'Homestate matrix describing the New Jersey pressure bonus.',
          sourceType: 'analysis',
        },
        {
          id: 'ref-wikipedia-jersey-devil',
          title: 'Wikipedia — Jersey Devil',
          url: 'https://en.wikipedia.org/wiki/Jersey_Devil',
          summary: 'Historical sightings and cultural references from South Jersey.',
          sourceType: 'press',
        },
        {
          id: 'ref-wp-haunted-pinebarrens',
          title: 'Weird NJ: Haunted Pine Barrens Field Notes',
          url: 'https://weirdnj.com/stories/pine-barrens/',
          summary: 'Local field reporters catalogue screeching encounters and scorched sand circles.',
          sourceType: 'witness',
        },
      ],
    },
    {
      id: 'nm-dulce-1980',
      name: 'Archuleta Mesa Listening Post',
      category: 'ufo',
      stateId: 'NM',
      region: 'Four Corners',
      signalLevel: 'high',
      summary:
        'Subterranean hum rattles Dulce every solstice. Truth agents claim elevator doors open to a joint shadow lab run by tired greys.',
      tags: ['dulce base', 'archuleta', 'ufo'],
      featuredQuote: 'They keep refilling the vending machines with chlorophyll gum. Someone lives down there.',
      quoteAttribution: 'Agent Hatch (Truth Logistics)',
      timeline: [
        {
          id: 'nm-dulce-1980',
          year: 1980,
          title: 'Cattle Mutilation Brief',
          description:
            'FBI memo cites ritual predators. ParaPedia copies the diagrams before the ink dries and tags matching laser scoring.',
        },
        {
          id: 'nm-dulce-1995',
          year: 1995,
          title: 'Archuleta Summit Seismic Spikes',
          description:
            'Seismographs catch elevator-like rhythms. Truth op “Sandstone” overlays them with maintenance schedules.',
        },
        {
          id: 'nm-dulce-2022',
          year: 2022,
          title: 'Vetted Orbital Sweep',
          description:
            'Commercial satellite AI picks up heat plumes. ParaPedia issues an alert to reroute Truth couriers through reservation safehouses.',
        },
      ],
      references: [
        {
          id: 'ref-vetted-desert-ufos',
          title: 'Vetted: Desert Corridor UAP Patterns',
          url: 'https://www.vetted.ai/blog/desert-uap-patterns',
          summary: 'Breakdown of persistent Four Corners radar anomalies.',
          sourceType: 'analysis',
        },
        {
          id: 'ref-wikipedia-dulce',
          title: 'Wikipedia — Dulce Base',
          url: 'https://en.wikipedia.org/wiki/Dulce_Base',
          summary: 'Overview of the alleged subterranean facility near Dulce, NM.',
          sourceType: 'press',
        },
        {
          id: 'ref-cryptids-readme-homestate',
          title: 'Cryptids Expansion Homestate Bonuses — Southwest',
          url: 'https://paranoid-times.invalid/extensions/cryptids#southwest',
          summary: 'Homestate notes connecting UFO cattle raids with Truth bonuses.',
          sourceType: 'analysis',
        },
      ],
    },
    {
      id: 'il-chicago-ghosts-1915',
      name: 'Lake Michigan Phantom Frequency',
      category: 'haunting',
      stateId: 'IL',
      region: 'Great Lakes',
      signalLevel: 'low',
      summary:
        'Faint ship-to-shore transmissions repeat the Eastland disaster manifest every summer; ferry captains say the river replies.',
      tags: ['haunting', 'lake michigan', 'eastland'],
      timeline: [
        {
          id: 'il-ghosts-1915',
          year: 1915,
          title: 'SS Eastland Capsize',
          description:
            'Passenger ship overturns in the Chicago River. ParaPedia links casualty lists to recurring EVP bursts near Navy Pier.',
        },
        {
          id: 'il-ghosts-1978',
          year: 1978,
          title: 'Ham Radio Intercepts',
          description:
            'Amateur operators log phantom calls requesting clearance. Truth interns digitize the cassettes into ParaPedia.',
        },
        {
          id: 'il-ghosts-2019',
          year: 2019,
          title: 'Tour Boat Feedback Loop',
          description:
            'Guides report PA systems auto-playing roll calls at dusk. Government inspectors blame “moisture in the wiring.”',
        },
      ],
      references: [
        {
          id: 'ref-wikipedia-ss-eastland',
          title: 'Wikipedia — SS Eastland disaster',
          url: 'https://en.wikipedia.org/wiki/SS_Eastland',
          summary: 'Historical grounding for the spectral roll call phenomenon.',
          sourceType: 'press',
        },
        {
          id: 'ref-chicagotribune-eastland',
          title: 'Chicago Tribune Archives — Eastland Anniversary',
          url: 'https://www.chicagotribune.com/history/eastland-disaster',
          summary: 'Local archival coverage reused in ParaPedia memorial prompts.',
          sourceType: 'press',
        },
        {
          id: 'ref-wikipedia-residual-hauntings',
          title: 'Wikipedia — Residual haunting',
          url: 'https://en.wikipedia.org/wiki/Residual_haunting',
          summary: 'Background on looping phantom audio phenomenon for dossier notes.',
          sourceType: 'analysis',
        },
      ],
    },
  ],
  states: {
    WA: {
      stateId: 'WA',
      name: 'Washington',
      region: 'Pacific Northwest',
      anomaliesIndexed: 18,
      hotspots: ['Mount St. Helens tree line', 'Snoqualmie trailheads', 'North Cascades radio quiet zone'],
      headline: 'Sasquatch relay pings every ranger tower before dawn briefing.',
      trend: 'rising',
      knownFor: 'Bigfoot summit mixers and FOIA confetti storms.',
      lastUpdated: '2024-02-01',
      featuredEntryIds: ['wa-bigfoot-1974'],
    },
    WV: {
      stateId: 'WV',
      name: 'West Virginia',
      region: 'Appalachia',
      anomaliesIndexed: 11,
      hotspots: ['Silver Bridge ruins', 'TNT Area munitions bunkers', 'Ohio River fog shelf'],
      headline: 'Winged omens shadow infrastructure audits across the valley.',
      trend: 'steady',
      knownFor: 'Mothman siren drills and redacted bridge memos.',
      lastUpdated: '2024-01-18',
      featuredEntryIds: ['wv-mothman-1966'],
    },
    NJ: {
      stateId: 'NJ',
      name: 'New Jersey',
      region: 'Mid-Atlantic',
      anomaliesIndexed: 9,
      hotspots: ['Pine Barrens ranger towers', 'Wharton State Forest staging grounds', 'Abandoned Leeds family manor'],
      headline: 'Night patrols report charred sand circles near every antenna.',
      trend: 'volatile',
      knownFor: 'Jersey Devil patrols disguised as Turnpike maintenance crews.',
      lastUpdated: '2024-02-06',
      featuredEntryIds: ['nj-jersey-devil-1909'],
    },
    NM: {
      stateId: 'NM',
      name: 'New Mexico',
      region: 'Four Corners',
      anomaliesIndexed: 23,
      hotspots: ['Archuleta Mesa access shafts', 'Dulce outskirts', 'Chaco signal relays'],
      headline: 'Subterranean elevators hum louder than the desert cicadas.',
      trend: 'rising',
      knownFor: 'Joint research labs staffed by “visiting consultants” with reflective eyes.',
      lastUpdated: '2024-02-02',
      featuredEntryIds: ['nm-dulce-1980'],
    },
    IL: {
      stateId: 'IL',
      name: 'Illinois',
      region: 'Great Lakes',
      anomaliesIndexed: 7,
      hotspots: ['Chicago River lock stations', 'Navy Pier broadcast deck', 'Tour boat PA closets'],
      headline: 'Phantom roll calls echo through waterfront tourist traps nightly.',
      trend: 'steady',
      knownFor: 'Spectral maritime dispatches and soot-smeared manifests.',
      lastUpdated: '2024-01-27',
      featuredEntryIds: ['il-chicago-ghosts-1915'],
    },
  },
} as const satisfies ParapediaAtlas;

export type ParapediaAtlasType = typeof parapediaAtlas;

export const getParapediaCategories = (): readonly string[] => parapediaAtlas.categories;
