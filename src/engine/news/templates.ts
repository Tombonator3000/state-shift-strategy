export const TRUTH_VERB_LIBRARY = {
  ATTACK: ['EXPOSES', 'BUSTS', 'LEAKS', 'BLOWS LID OFF', 'IGNITES'],
  MEDIA: ['GOES LIVE', 'BROADCASTS', 'TRENDING', 'LEAKS'],
  ZONE: ['MARCHES', 'SURGES', 'ERUPTS', 'HAUNTS', 'SWEEPS'],
} as const;

export const GOV_HEADLINE_PHRASES = {
  EUPHEMISMS: ['Routine Incident', 'Administrative Test', 'Benign Anomaly', 'Training Exercise', 'Localized Phenomenon'],
  MEDIA: ['Briefing Concluded', 'Statement Issued', 'Update Filed'],
  ATTACK: ['Mitigation Successful', 'Containment Ongoing', 'Review Open'],
  ZONE: ['Perimeter Established', 'Access Normalized', 'Calm Restored'],
} as const;

export type TruthHeadlineVerb = (typeof TRUTH_VERB_LIBRARY)[keyof typeof TRUTH_VERB_LIBRARY][number];
export type GovHeadlinePhrase =
  | (typeof GOV_HEADLINE_PHRASES)['EUPHEMISMS'][number]
  | (typeof GOV_HEADLINE_PHRASES)['MEDIA'][number]
  | (typeof GOV_HEADLINE_PHRASES)['ATTACK'][number]
  | (typeof GOV_HEADLINE_PHRASES)['ZONE'][number];
