export interface CryptidIdleReport {
  state: string;
  cryptid: string;
  summary: string;
}

export const CRYPTID_IDLE_REPORTS: CryptidIdleReport[] = [
  {
    state: 'Washington',
    cryptid: 'Bigfoot',
    summary:
      'Cascade listening posts report only cedar-scented footsteps tonight; hush stipends remain ready if the tour resumes.',
  },
  {
    state: 'Oregon',
    cryptid: 'Bigfoot',
    summary:
      'Timberline trail cams caught lingering campfire heat but no full silhouette—press pool still drafts the Cascade rally recap.',
  },
  {
    state: 'West Virginia',
    cryptid: 'Mothman & Flatwoods Monster',
    summary:
      'Local TV crews idle vans by the TNT domes while librarians catalogue prophecy clippings for the next ratings spike.',
  },
  {
    state: 'Texas',
    cryptid: 'Chupacabra',
    summary:
      'Ranch liaison logs dry nights; emergency plasma coolers stay staged in case the milk run headline hits again.',
  },
  {
    state: 'New Jersey',
    cryptid: 'Jersey Devil',
    summary:
      'Pine Barrens spotters sweep casino rooftops; civic PACs rehearse statements for hoofprints on the turnpike overpass.',
  },
  {
    state: 'Florida',
    cryptid: 'Skunk Ape & Tourist Nessie',
    summary:
      'Airboat patrols smell only sunscreen; influencer brigade keeps livestream drones fueled for a bayou encore.',
  },
  {
    state: 'Minnesota',
    cryptid: 'Wendigo',
    summary:
      'Northwoods listening stations clear their channels while mutual aid stockpiles hot coffee to blunt the hunger rumors.',
  },
  {
    state: 'South Carolina',
    cryptid: 'Lizard Man',
    summary:
      'Scape Ore Swamp floodlights hum over empty reeds; statehouse aides prewrite denials about tire marks on patrol sedans.',
  },
  {
    state: 'Louisiana',
    cryptid: 'Mokele-mbembe',
    summary:
      'Bayou sonar buoys only find catfish; tourism board still prints dinosaur disclaimers for the swamp tour buses.',
  },
  {
    state: 'Connecticut',
    cryptid: 'Connie the River Serpent',
    summary:
      'Harbor pilots swap doodled sonar charts but report calm currents; port inspectors restock bribe receipts just in case.',
  },
  {
    state: 'Delaware',
    cryptid: 'Pukwudgie',
    summary:
      'Park wardens note only singed pinecones; prank abatement grants remain untouched for tonight’s shift.',
  },
  {
    state: 'Maryland',
    cryptid: 'Goatman',
    summary:
      'Bowie cul-de-sacs stay quiet, though PTA rumor hotlines rehearse their scripts about laboratory topiary.',
  },
  {
    state: 'Pennsylvania',
    cryptid: 'Squonk',
    summary:
      'Allegheny morale officers hand out empathy umbrellas while siphons stay capped pending another tearful dissolve.',
  },
  {
    state: 'Maine',
    cryptid: 'Pocomoonshine Lake Monster',
    summary:
      'Northern lake patrols chart only loons; canoe insurance actuaries nevertheless audit capsizing clauses.',
  },
];

export const DEFAULT_CRYPTID_IDLE_REPORT: CryptidIdleReport = {
  state: 'National Grid',
  cryptid: 'General Anomalies',
  summary: 'Orbital surveyors log a calm lattice; analysts rotate fresh batteries into the next wave of detectors.',
};
