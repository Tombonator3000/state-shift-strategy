import type { CardArticle } from './articleBank';
import type { PlayedCardMeta } from './mainStory';

export type HeadlineTemplate = {
  id: string;
  tone: 'truth' | 'gov';
  compose(inputs: {
    cards: PlayedCardMeta[];
    articles: (CardArticle | null)[];
    commonTags: string[];
    pick: <T>(arr: T[], seedKey: string) => T;
  }): { headline: string; subhead?: string; debugNote?: string };
};

const TRUTH_VERBS: Record<PlayedCardMeta['type'], string[]> = {
  ATTACK: ['EXPOSES', 'BUSTS', 'LEAKS', 'BLOWS LID OFF', 'IGNITES'],
  MEDIA: ['GOES LIVE', 'BROADCASTS', 'TRENDING', 'LEAKS'],
  ZONE: ['MARCHES', 'SURGES', 'ERUPTS', 'HAUNTS', 'SWEEPS'],
};

const GOV_EUPHEMISMS = ['Routine Incident', 'Administrative Test', 'Benign Anomaly', 'Training Exercise'];
const GOV_MEDIA = ['Briefing Concluded', 'Statement Issued', 'Update Filed'];
const GOV_ATTACK = ['Mitigation Successful', 'Containment Ongoing', 'Review Open'];
const GOV_ZONE = ['Perimeter Established', 'Access Normalized', 'Calm Restored'];

const govPoolForType = (cardType: PlayedCardMeta['type']): string[] => {
  switch (cardType) {
    case 'ATTACK':
      return GOV_ATTACK;
    case 'MEDIA':
      return GOV_MEDIA;
    case 'ZONE':
    default:
      return GOV_ZONE;
  }
};

const truthHeadlineA: HeadlineTemplate = {
  id: 'truth:triad:surge',
  tone: 'truth',
  compose({ cards, pick }) {
    const [subject, second, third] = cards;
    const verbs = [subject, second, third].map((card, index) => {
      const pool = TRUTH_VERBS[card?.type ?? 'MEDIA'] ?? TRUTH_VERBS.MEDIA;
      return pick(pool, `truth:verb:${index}`);
    });

    const subjectName = subject?.name?.toUpperCase() ?? 'UNKNOWN SUBJECT';
    const secondName = second?.name?.toUpperCase() ?? 'UNKNOWN ALLY';
    const thirdName = third?.name?.toUpperCase() ?? 'UNKNOWN ALLY';

    const headline = `${subjectName} ${verbs[0] ?? 'IGNITES'} AS ${secondName} ${verbs[1] ?? 'BROADCASTS'} — ${thirdName} ${verbs[2] ?? 'SURGES'}!`;

    return {
      headline,
      debugNote: verbs.join('|'),
    };
  },
};

const truthHeadlineB: HeadlineTemplate = {
  id: 'truth:triad:alert',
  tone: 'truth',
  compose({ cards, pick }) {
    const [subject, second, third] = cards;
    const verbs = [subject, second, third].map((card, index) => {
      const pool = TRUTH_VERBS[card?.type ?? 'MEDIA'] ?? TRUTH_VERBS.MEDIA;
      return pick(pool, `truth:verb-alt:${index}`);
    });

    const subjectName = subject?.name?.toUpperCase() ?? 'UNKNOWN SUBJECT';
    const secondName = second?.name?.toUpperCase() ?? 'UNKNOWN ALLY';
    const thirdName = third?.name?.toUpperCase() ?? 'UNKNOWN ALLY';

    const headline = `${subjectName}: ${verbs[0] ?? 'EXPOSES'}! ${secondName} ${verbs[1] ?? 'BROADCASTS'}, ${thirdName} ${verbs[2] ?? 'SURGES'}!`;

    return {
      headline,
      debugNote: verbs.join('|'),
    };
  },
};

const govHeadlineA: HeadlineTemplate = {
  id: 'gov:triad:bulletin',
  tone: 'gov',
  compose({ cards, pick }) {
    const [subject, second, third] = cards;
    const subjectName = subject?.name?.toUpperCase() ?? 'OFFICIAL CHANNEL';
    const secondName = second?.name?.toUpperCase() ?? 'AUXILIARY UNIT';
    const thirdName = third?.name?.toUpperCase() ?? 'AUXILIARY UNIT';

    const euphemism = pick(GOV_EUPHEMISMS, 'gov:euph');
    const phrase2 = pick(govPoolForType(second?.type ?? 'ZONE'), 'gov:phrase:1');
    const phrase3 = pick(govPoolForType(third?.type ?? 'ZONE'), 'gov:phrase:2');

    const headline = `${subjectName}: ${euphemism}; ${secondName} ${phrase2}; ${thirdName} ${phrase3}`;

    return {
      headline,
      debugNote: [euphemism, phrase2, phrase3].join('|'),
    };
  },
};

const govHeadlineB: HeadlineTemplate = {
  id: 'gov:triad:status',
  tone: 'gov',
  compose({ cards, pick }) {
    const [subject, second, third] = cards;
    const subjectName = subject?.name?.toUpperCase() ?? 'OFFICIAL CHANNEL';
    const secondName = second?.name?.toUpperCase() ?? 'AUXILIARY UNIT';
    const thirdName = third?.name?.toUpperCase() ?? 'AUXILIARY UNIT';

    const euphemism = pick(GOV_EUPHEMISMS, 'gov:euph:status');
    const phrase2 = pick(govPoolForType(second?.type ?? 'ZONE'), 'gov:phrase:status:1');
    const phrase3 = pick(govPoolForType(third?.type ?? 'ZONE'), 'gov:phrase:status:2');

    const headline = `${subjectName}: CONFIRMS ${euphemism}; ${secondName} ${phrase2}; ${thirdName} ${phrase3}`;

    return {
      headline,
      debugNote: [euphemism, phrase2, phrase3].join('|'),
    };
  },
};

export const truthTemplates: HeadlineTemplate[] = [truthHeadlineA, truthHeadlineB];
export const govTemplates: HeadlineTemplate[] = [govHeadlineA, govHeadlineB];
