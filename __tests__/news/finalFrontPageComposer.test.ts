import { beforeAll, beforeEach, describe, expect, test } from 'bun:test';

import {
  composeFinalFrontPage,
  getFinalFrontPageTemplates,
  getLegacyFrontPageFallback,
  type FrontPageTemplateData,
} from '../../src/news/finalFrontPageComposer';

let originalTemplates: FrontPageTemplateData | null = null;

const cloneTemplates = (templates: FrontPageTemplateData): FrontPageTemplateData => ({
  kickers: [...templates.kickers],
  connectors: [...templates.connectors],
  headlineFormats: templates.headlineFormats.map(format => ({
    id: format.id,
    subjects: [...format.subjects],
    events: [...format.events],
  })),
  dekSnippets: [...templates.dekSnippets],
});

const restoreTemplates = () => {
  if (!originalTemplates) {
    return;
  }

  const templates = getFinalFrontPageTemplates();
  if (!templates) {
    return;
  }

  templates.kickers.splice(0, templates.kickers.length, ...originalTemplates.kickers);
  templates.connectors.splice(0, templates.connectors.length, ...originalTemplates.connectors);
  templates.dekSnippets.splice(0, templates.dekSnippets.length, ...originalTemplates.dekSnippets);
  templates.headlineFormats.splice(
    0,
    templates.headlineFormats.length,
    ...originalTemplates.headlineFormats.map(format => ({
      id: format.id,
      subjects: [...format.subjects],
      events: [...format.events],
    })),
  );
};

beforeAll(() => {
  const templates = getFinalFrontPageTemplates();
  if (templates) {
    originalTemplates = cloneTemplates(templates);
  }
});

beforeEach(() => {
  restoreTemplates();
});

describe('composeFinalFrontPage', () => {
  test('fuses bulletin snippets with generated template output', () => {
    const templates = getFinalFrontPageTemplates();
    if (!templates) {
      throw new Error('final front page templates missing');
    }

    templates.kickers.splice(0, templates.kickers.length, 'Template Signal');
    templates.connectors.splice(0, templates.connectors.length, 'links');
    templates.headlineFormats.splice(0, templates.headlineFormats.length, {
      id: 'fusion-check',
      subjects: ['Midnight operatives'],
      events: ['merge the dossiers'],
    });
    templates.dekSnippets.splice(0, templates.dekSnippets.length, 'Template dek hook.');

    const result = composeFinalFrontPage({
      seed: 1337,
      bulletin: {
        kicker: 'Truth Broadcast Feed',
        dek: 'Truth ops broadcast the finale dossier.',
      },
    });

    expect(result.kicker).toBe('Truth Broadcast Feed');
    expect(result.dek).toBe('Truth ops broadcast the finale dossier.');
    expect(result.hed).toBe('Midnight operatives links merge the dossiers');
    expect(result.metadata).toEqual({
      templateId: 'fusion-check',
      usedBulletinHed: false,
      usedBulletinDek: true,
      sanitizedHed: false,
      sanitizedDek: false,
      fallback: false,
    });
  });

  test('returns the legacy fallback when templates cannot generate copy', () => {
    const templates = getFinalFrontPageTemplates();
    if (!templates) {
      throw new Error('final front page templates missing');
    }

    templates.kickers.splice(0, templates.kickers.length);
    templates.connectors.splice(0, templates.connectors.length);
    templates.headlineFormats.splice(0, templates.headlineFormats.length);
    templates.dekSnippets.splice(0, templates.dekSnippets.length);

    const result = composeFinalFrontPage();
    const fallback = getLegacyFrontPageFallback();

    expect(result).toEqual(fallback);
  });

  test('strips food terms from supplied bulletin copy', () => {
    const templates = getFinalFrontPageTemplates();
    if (!templates) {
      throw new Error('final front page templates missing');
    }

    templates.kickers.splice(0, templates.kickers.length, 'Template Signal');
    templates.connectors.splice(0, templates.connectors.length, 'flags');
    templates.headlineFormats.splice(0, templates.headlineFormats.length, {
      id: 'sanitizer',
      subjects: ['Counter-ops'],
      events: ['erase the cafeteria ledger'],
    });
    templates.dekSnippets.splice(0, templates.dekSnippets.length, 'Template dek hook.');

    const result = composeFinalFrontPage({
      seed: 99,
      bulletin: {
        kicker: 'Banana Signal Broadcast',
        hed: 'Agents smuggle apples into the vault',
        dek: 'Croissant caches leak tomato secrets.',
      },
    });

    expect(result.kicker).toBe('Signal Broadcast');
    expect(result.hed).toBe('Agents smuggle into the vault');
    expect(result.dek).toBe('caches leak secrets.');
    expect(result.metadata).toEqual({
      templateId: undefined,
      usedBulletinHed: true,
      usedBulletinDek: true,
      sanitizedHed: true,
      sanitizedDek: true,
      fallback: false,
    });
  });
});
