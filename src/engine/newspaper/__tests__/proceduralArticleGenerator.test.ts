import { generateProceduralArticle } from '../proceduralArticleGenerator';
import type { Card } from '@/types';

const withFixedRandom = <T>(value: number, fn: () => T): T => {
  const originalRandom = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
};

describe('generateProceduralArticle tags', () => {
  const baseCard: Card = {
    id: 'test-card',
    name: 'Signal Boost Protocol',
    type: 'MEDIA',
    faction: 'truth',
    cost: 3,
  };

  it('prioritizes normalized card tags when available', () => {
    const article = generateProceduralArticle({
      card: {
        ...baseCard,
        tags: ['  Signal   Boost  ', 'Contact   Protocol', 'Signal   Boost'],
      },
      player: 'human',
    });

    expect(article.tags.slice(0, 2)).toEqual(['#signal-boost', '#contact-protocol']);
    expect(article.tags).toEqual(
      expect.arrayContaining(['#signal-boost', '#contact-protocol', 'media', 'coverage'])
    );
  });

  it('falls back to base faction/type tags when metadata is missing', () => {
    const article = generateProceduralArticle({
      card: {
        ...baseCard,
        id: 'fallback-card',
        type: 'ATTACK',
        faction: 'government',
        tags: ['   ', '', ' \t '],
      },
      player: 'ai',
    });

    expect(article.tags).toEqual(expect.arrayContaining(['attack', 'scandal']));
    expect(article.tags.some(tag => tag.startsWith('#'))).toBe(false);
  });
});

describe('generateProceduralArticle thematic word banks', () => {
  const truthCard: Card = {
    id: 'cryptid-card',
    name: 'Midnight Trail Runners',
    type: 'SCHEME',
    faction: 'truth',
    cost: 2,
    tags: ['Cryptid Watch'],
  };

  const govCard: Card = {
    id: 'op-card',
    name: 'Operation Umbra Fold',
    type: 'OPERATION',
    faction: 'government',
    cost: 4,
    tags: ['Covert Operation'],
  };

  it('switches to cryptid-focused pools when cryptid metadata is present', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: truthCard,
        player: 'human',
      })
    );

    expect(article.headline).toContain('TRACKS APPALACHIAN HOWLER');
    expect(article.body).toContain('APPALACHIAN HOWLER');
    expect(article.body).toContain('misty pine barrens watchtower');
  });

  it('leans on operation euphemisms for government suppression pieces', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: govCard,
        player: 'ai',
      })
    );

    expect(article.headline).toContain('DECOMMISSIONS');
    expect(article.headline).toContain('strategic reclassification initiative');
    expect(article.body).toContain('binder swap conducted in the windowless logistics wing');
  });
});

describe('generateProceduralArticle snapshots', () => {
  it('builds a moon-hoax truth spread with tabloid flourishes', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: {
          id: 'moon-card',
          name: 'Apollo Leak Broadcast',
          type: 'MEDIA',
          faction: 'truth',
          cost: 3,
          tags: ['Moon Landing Hoax'],
        },
        player: 'human',
      })
    );

    expect(article).toMatchInlineSnapshot(`
      Object {
        "body": "Leaked documents obtained inside a warehouse-sized lunar backdrop closet reveal explosive details about Apollo Leak Broadcast, confirming what conspiracy researchers have suspected for years: the connection to SEA OF TRANQUILITY PROP DEPARTMENT is undeniable and extensively documented.\n\n\"I've spent twenty years investigating this,\" said Dr. Helena Frost, an independent researcher who was recently asked to leave three different conferences. \"The Apollo Leak Broadcast evidence doesn't just suggest a conspiracy—it proves one. The documentation is meticulous. Almost like they wanted to get caught.\"\n\nA local resident who wishes to remain anonymous first posted the materials online at inside a warehouse-sized lunar backdrop closet, leading to immediate viral spread across seventeen platforms before coordinated takedown attempts began. \"I watched the downloads hit a million before my internet mysteriously cut out,\" the source said by phone from an undisclosed location. \"They're scrambling.\"\n\nGovernment response has been notably aggressive, with three press conferences scheduled, canceled, and rescheduled before officials settled on a brief emailed statement reading simply: \"These reports are unsubstantiated and also classified.\"\n\nPublic awareness is climbing, with truth-seeking networks reporting 50% of surveyed citizens now questioning official narratives. \"The paradigm is shifting,\" noted researcher Dr. Helena Frost. \"People are ready to know what's behind Apollo Leak Broadcast.\"",
        "byline": "By: Anonymous Parking Garage Source",
        "headline": "UNMASKS SEA OF TRANQUILITY PROP DEPARTMENT—APOLLO LEAK BROADCAST FILES LEAK NATIONWIDE",
        "imagePrompt": "Grainy surveillance photo showing anomalous figure, motion blur, amateur photography, newsprint quality",
        "subhead": "Eyewitness reports \"exactly what conspiracy theorists said\"—inside a warehouse-sized lunar backdrop closet",
        "tags": Array [
          "#moon-landing-hoax",
          "media",
          "coverage",
          "leaked",
        ],
      }
    `);
  });

  it('renders a psychic hotline denial drenched in bureaucracy', () => {
    const article = withFixedRandom(0, () =>
      generateProceduralArticle({
        card: {
          id: 'psychic-gov-card',
          name: 'Psychic Hotline Compliance Blitz',
          type: 'OPERATION',
          faction: 'government',
          cost: 5,
          tags: ['Psychic Hotline'],
        },
        player: 'ai',
      })
    );

    expect(article).toMatchInlineSnapshot(`
      Object {
        "body": "The Department of Normalcy issued a comprehensive 847-page report today addressing public concerns about Psychic Hotline Compliance Blitz, conclusively determining it qualifies as a standard telepathic hotline calibration tied to a cubicle maze patrolled by the Department of Telepathic Licensing requiring no further citizen attention.\n\n\"We appreciate community vigilance,\" stated Director Karen Walsh at a mandatory press briefing. \"However, speculation regarding Psychic Hotline Compliance Blitz serves no constructive purpose. Our analysis demonstrates this is textbook telepathic hotline calibration, occurring approximately never and unlikely to repeat. All documentation supports this conclusion, which is why we've classified the documentation.\"\n\nThe report notably dedicates 347 pages to explaining why certain questions should not be asked, 289 pages to redacted appendices, and a final chapter titled \"Why This Report Itself Should Not Raise Questions.\" A sealed appendix further catalogues a cubicle maze patrolled by the Department of Telepathic Licensing.\n\nCitizens who witnessed events related to Psychic Hotline Compliance Blitz are invited to attend voluntary memory alignment workshops at convenient government facilities. Attendance is optional but strongly encouraged. Light refreshments will be served. Names will not be taken down but will be remembered institutionally.\n\nWhen pressed on inconsistencies between eyewitness accounts and official conclusions, Director Karen Walsh clarified: \"Eyewitnesses experience stress. Stress causes misperception. Misperception is itself a form of telepathic hotline calibration. The circle of explanation is logically complete. This press conference is now concluded. Please exit in an orderly fashion and avoid discussing what was said here.\"",
        "byline": "By: Public Information Officer J. Morrison",
        "headline": "PSYCHIC HOTLINE COMPLIANCE BLITZ DESIGNATED AS \"telepathic hotline calibration\"—NOTHING TO SEE HERE",
        "imagePrompt": "Sterile government press conference, podium with official seal, bureaucratic setting, formal photography",
        "subhead": "Officials assure public this is completely normal telepathic hotline calibration",
        "tags": Array [
          "#psychic-hotline",
          "official",
          "classified",
        ],
      }
    `);
  });
});
