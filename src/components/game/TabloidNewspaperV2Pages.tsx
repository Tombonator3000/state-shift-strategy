/**
 * Multi-page Interactive Newspaper Pages Builder
 * Converts TabloidNewspaperV2 data into interactive newspaper pages
 */

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { ExpandableArticle } from '@/components/newspaper/ExpandableArticle';
import { MultiColumnArticle } from '@/components/newspaper/MultiColumnArticle';
import { NewspaperTexture } from '@/components/newspaper/NewspaperTexture';
import { ClassifiedAds } from '@/components/newspaper/ClassifiedAds';
import { LettersToEditor } from '@/components/newspaper/LettersToEditor';
import { ComicStrip } from '@/components/newspaper/ComicStrip';
import { NewspaperHoroscope } from '@/components/newspaper/NewspaperHoroscope';
import CardImage from '@/components/game/CardImage';
import { NewspaperSection } from './newspaperLayout';
import { formatTruthDelta } from './tabloidRoundUtils';
import type { ArticleData } from '@/components/newspaper/InteractiveNewspaperPage';
import { cn } from '@/lib/utils';

export interface PageBuilderData {
  heroHeadline: string;
  heroSubhead: string;
  heroBody: string[];
  heroTags: string[];
  heroPrimaryCardId: string | null;
  heroPrimaryCardName: string | null;
  heroPrimaryCardFaction: string | null;
  byline: string;
  sourceLine: string;
  truthProgress: number;
  truthDeltaLabel: string | null;
  playerCards: { length: number };
  opponentCards: { length: number };
  narrativeContext: { capturedStates: string[]; truthDeltaTotal: number };
  events: any[];
  runnerDispatches: Array<{
    id: string;
    headline: string;
    subhead?: string;
    summary: string;
    tone: 'truth' | 'government';
  }>;
  eventStories: Array<{
    kind: 'event';
    id: string;
    headline: string;
    subhead: string;
    summary: string;
    typeLabel: string;
  }>;
  comboNarrative: {
    magnitude: number;
    tags: string[];
    headline: string;
    deck: string;
  } | null;
  hotspotExtraArticle: {
    headline: string;
    subhead?: string;
    body: string[];
    tags?: string[];
  } | null;
  ads: string[];
  conspiracies: string[];
  weatherLine: string;
  formattedAgendaQuotes: Array<{
    id: string;
    title: string;
    headline: string;
    description: string;
    stageLabel: string;
    status: string;
    progressLabel: string;
    factionLabel: string;
    actorLabel: string;
  }>;
  campaignArcGroups: Array<{
    arcId: string;
    arcName: string;
    totalChapters: number;
    latestChapter: number;
    progressPercent: number;
    status: 'active' | 'cliffhanger' | 'finale';
    activeTagline: string;
    chapters: Array<{
      chapter: number;
      events: Array<{
        story: {
          headline: string;
          subhead: string;
          summary: string;
        };
      }>;
    }>;
  }>;
}

export const buildNewspaperPages = (data: PageBuilderData): React.ReactNode[] => {
  const pages: React.ReactNode[] = [];

  // PAGE 1: FRONT PAGE - Hero story with Truth Index
  const heroCardCaptionParts = [
    data.heroPrimaryCardName,
    data.heroPrimaryCardFaction ? `${data.heroPrimaryCardFaction} faction` : null,
  ].filter((value): value is string => Boolean(value?.trim()));

  const heroCardImage = data.heroPrimaryCardId
    ? (
        <figure className="flex w-full flex-col items-center gap-2 md:items-start">
          <CardImage
            cardId={data.heroPrimaryCardId}
            fit="cover"
            className="h-56 w-full max-w-[240px] rounded border border-newspaper-border bg-white shadow-sm md:h-64"
          />
          {heroCardCaptionParts.length > 0 && (
            <figcaption className="text-center text-[11px] font-semibold uppercase tracking-wide text-newspaper-text/70 md:text-left">
              {heroCardCaptionParts.join(' • ')}
            </figcaption>
          )}
        </figure>
      )
    : undefined;

  const frontPage = (
    <NewspaperTexture key="page-1" intensity="medium" aged className="p-6 min-h-[600px]">
      {/* Truth Index Bar */}
      <NewspaperSection className="mb-6 bg-white/90 px-4 py-3 text-newspaper-text rounded shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold uppercase tracking-wide text-sm">Truth Index</span>
            <div className="w-36">
              <Progress value={data.truthProgress} className="h-2 bg-white/40" />
            </div>
            <span className="font-mono text-xs">{data.truthProgress}%</span>
            {data.truthDeltaLabel && (
              <span className="rounded border border-newspaper-border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide">
                {data.truthDeltaLabel}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-wide text-newspaper-text/70">
            <span>Your Cards: {data.playerCards.length}</span>
            <span>Opposition: {data.opponentCards.length}</span>
            <span>Captured: {data.narrativeContext.capturedStates.length || '—'}</span>
          </div>
        </div>
      </NewspaperSection>

      {/* Hero Article */}
      <MultiColumnArticle
        headline={data.heroHeadline}
        subhead={data.heroSubhead}
        content={data.heroBody}
        byline={data.byline}
        image={heroCardImage}
        imagePosition={heroCardImage ? 'left' : 'top'}
        columns={2}
        className="mb-4"
      />

      {/* Tags */}
      {data.heroTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {data.heroTags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="rounded border border-newspaper-border bg-white/70 px-3 py-1 text-xs uppercase tracking-wide text-newspaper-text/70"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </NewspaperTexture>
  );
  pages.push(frontPage);

  // PAGE 2: INSIDE - Secondary stories and combo dispatch
  const insideArticles: ArticleData[] = [];

  // Add runner dispatches as expandable articles
  if (data.runnerDispatches.length > 0) {
    data.runnerDispatches.slice(0, 3).forEach((dispatch, index) => {
      insideArticles.push({
        headline: dispatch.headline,
        subhead: dispatch.subhead,
        preview: dispatch.summary.substring(0, 150) + '...',
        fullContent: dispatch.summary,
        byline: 'By: Composite Desk',
      });
    });
  }

  // Add combo narrative
  if (data.comboNarrative) {
    insideArticles.push({
      headline: data.comboNarrative.headline,
      subhead: `Chain: ${data.comboNarrative.magnitude} · ${data.comboNarrative.tags.join(' • ')}`,
      preview: data.comboNarrative.deck,
      fullContent: data.comboNarrative.deck + '\n\nOperatives executed synchronized maneuvers with precision timing, demonstrating advanced coordination protocols.',
      byline: 'By: Field Operations Desk',
    });
  }

  // Add event stories
  if (data.eventStories.length > 0) {
    data.eventStories.slice(0, 2).forEach(story => {
      insideArticles.push({
        headline: story.headline,
        subhead: story.subhead,
        preview: story.summary.substring(0, 120) + '...',
        fullContent: story.summary,
        byline: 'By: Event Wire',
      });
    });
  }

  if (insideArticles.length > 0) {
    const insidePage = (
      <NewspaperTexture key="page-2" intensity="light" className="p-6 min-h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insideArticles.map((article, i) => (
            <ExpandableArticle
              key={i}
              {...article}
              className="h-fit"
            />
          ))}
        </div>
      </NewspaperTexture>
    );
    pages.push(insidePage);
  }

  // PAGE 3: FEATURES - Comics, horoscope, letters, hotspot article
  const featuresPage = (
    <NewspaperTexture key="page-3" intensity="light" className="p-6 min-h-[600px]">
      <div className="space-y-6">
        <ComicStrip />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NewspaperHoroscope />
          <LettersToEditor count={4} />
        </div>

        {data.hotspotExtraArticle && (
          <div className="mt-6">
            <ExpandableArticle
              headline={data.hotspotExtraArticle.headline}
              subhead={data.hotspotExtraArticle.subhead}
              preview={data.hotspotExtraArticle.body[0] || 'Paranormal activity detected...'}
              fullContent={data.hotspotExtraArticle.body.join('\n\n')}
              byline="By: Paranormal Desk"
            />
          </div>
        )}
      </div>
    </NewspaperTexture>
  );
  pages.push(featuresPage);

  // PAGE 4: BACK PAGE - Classifieds, conspiracy corner, weather, agenda
  const backPage = (
    <NewspaperTexture key="page-4" intensity="heavy" aged className="p-6 min-h-[600px]">
      <div className="space-y-6">
        <ClassifiedAds count={8} includePersonals />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Conspiracy Corner */}
          {data.conspiracies.length > 0 && (
            <section className="rounded-md border-2 border-newspaper-border bg-white/80 p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-newspaper-text border-b-2 border-newspaper-text pb-2">
                Conspiracy Corner
              </h3>
              <ul className="space-y-2 text-xs leading-relaxed">
                {data.conspiracies.slice(0, 6).map((item, index) => (
                  <li key={`${item}-${index}`} className="before:mr-2 before:text-newspaper-text before:content-['•']">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Weather Desk */}
          <section className="rounded-md border-2 border-newspaper-border bg-white/80 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-newspaper-text border-b-2 border-newspaper-text pb-2">
              Weather Desk
            </h3>
            <p className="text-xs leading-relaxed">{data.weatherLine}</p>
          </section>
        </div>

        {/* Agenda Moments */}
        {data.formattedAgendaQuotes.length > 0 && (
          <section className="rounded-md border-2 border-newspaper-border bg-white/80 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-newspaper-text border-b-2 border-newspaper-text pb-2">
              Agenda Moments
            </h3>
            <div className="space-y-3">
              {data.formattedAgendaQuotes.map(quote => (
                <div
                  key={quote.id}
                  className="rounded border border-dashed border-newspaper-border/60 bg-white/60 p-3 text-xs"
                >
                  <div className="font-semibold uppercase tracking-wide text-newspaper-text/70">{quote.title}</div>
                  <p className="mt-1 font-semibold leading-snug">{quote.headline}</p>
                  <p className="mt-1 text-newspaper-text/70">
                    {quote.stageLabel}: {quote.progressLabel}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Campaign Arcs */}
        {data.campaignArcGroups.length > 0 && (
          <section className="rounded-md border-2 border-newspaper-border bg-white/80 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-newspaper-text border-b-2 border-newspaper-text pb-2">
              Campaign Archives
            </h3>
            <div className="space-y-4">
              {data.campaignArcGroups.map(arc => (
                <div key={arc.arcId} className="border-b border-dashed border-newspaper-border/60 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold uppercase text-sm">{arc.arcName}</h4>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded uppercase font-semibold",
                      arc.status === 'finale' && "bg-green-100 text-green-800",
                      arc.status === 'cliffhanger' && "bg-yellow-100 text-yellow-800",
                      arc.status === 'active' && "bg-blue-100 text-blue-800"
                    )}>
                      {arc.status}
                    </span>
                  </div>
                  <Progress value={arc.progressPercent} className="h-1.5 mb-2" />
                  <p className="text-xs italic text-newspaper-text/70">{arc.activeTagline}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </NewspaperTexture>
  );
  pages.push(backPage);

  return pages;
};
