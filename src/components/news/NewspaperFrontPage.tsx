import { cn } from '@/lib/utils';
import CardImage from '@/components/game/CardImage';
import type { GameOverReport, ReportArticleExcerpt } from '@/types/finalEdition';
import { generateSensationalistHeadline } from '@/utils/sensationalistHeadlines';
import { getArticleById, loadArticleBank, type CardArticle } from '@/news/articleBank';
import { extractArticleParagraphs, sanitizeFrontPageText } from '@/news/finalFrontPageComposer';
import { useEffect, useMemo, useState } from 'react';
import '@/styles/newspaperLayout.css';

interface NewspaperFrontPageProps {
  report: GameOverReport;
  onNavigateToPage: (page: string) => void;
}

type OperativeReport = NonNullable<GameOverReport['mvp']>;

interface StoryPanelContent {
  label: string;
  cardName: string;
  headline: string;
  subhead?: string;
  paragraphs: string[];
}

const cleanLine = (value?: string | null): string | undefined => {
  const result = sanitizeFrontPageText(value);
  if (result.value) {
    return result.value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
};

const normalizeParagraphs = (paragraphs: string[] | undefined): string[] => {
  if (!Array.isArray(paragraphs)) {
    return [];
  }
  const cleaned: string[] = [];
  for (const raw of paragraphs) {
    const line = cleanLine(raw);
    if (line) {
      cleaned.push(line);
    }
  }
  return cleaned;
};

const buildExcerptFromCardArticle = (article: CardArticle | null | undefined): ReportArticleExcerpt | null => {
  if (!article) {
    return null;
  }

  const headline = cleanLine(article.headline);
  const subhead = cleanLine(article.subhead);
  const paragraphs = normalizeParagraphs(extractArticleParagraphs(article.body));

  if (!headline && !subhead && paragraphs.length === 0) {
    return null;
  }

  return {
    headline,
    subhead,
    paragraphs,
  };
};

const normalizeReportArticle = (
  article: ReportArticleExcerpt | null | undefined,
): ReportArticleExcerpt | null => {
  if (!article) {
    return null;
  }

  const headline = cleanLine(article.headline);
  const subhead = cleanLine(article.subhead);
  const paragraphs = normalizeParagraphs(article.paragraphs);

  if (!headline && !subhead && paragraphs.length === 0) {
    return null;
  }

  return {
    headline,
    subhead,
    paragraphs,
  };
};

const formatImpactSubhead = (entry: OperativeReport): string | undefined => {
  switch (entry.impactType) {
    case 'capture':
      return entry.capturedStates.length
        ? `States secured: ${entry.capturedStates.join(', ')}`
        : 'Secured key territory in the final push.';
    case 'truth':
      return `Truth swing ${entry.truthDelta >= 0 ? '+' : ''}${Math.round(entry.truthDelta)}%`;
    case 'ip':
      return `IP swing ${entry.ipDelta >= 0 ? '+' : ''}${Math.round(entry.ipDelta)}`;
    case 'damage':
      return `Damage dealt ${Math.round(entry.damageDealt)}`;
    case 'support':
    default:
      return entry.impactLabel;
  }
};

const buildFallbackParagraphs = (entry: OperativeReport): string[] => {
  const paragraphs: string[] = [];
  const highlight = cleanLine(entry.highlight);
  if (highlight) {
    paragraphs.push(highlight);
  }

  const statFragments: string[] = [];
  if (Math.round(entry.truthDelta) !== 0) {
    statFragments.push(`Truth Δ ${entry.truthDelta >= 0 ? '+' : ''}${Math.round(entry.truthDelta)}%`);
  }
  if (Math.round(entry.ipDelta) !== 0) {
    statFragments.push(`IP Δ ${entry.ipDelta >= 0 ? '+' : ''}${Math.round(entry.ipDelta)}`);
  }
  if (Math.round(entry.damageDealt) !== 0) {
    statFragments.push(`Damage ${Math.round(entry.damageDealt)}`);
  }
  if (entry.capturedStates.length > 0) {
    statFragments.push(`States: ${entry.capturedStates.join(', ')}`);
  }
  statFragments.push(`Round ${entry.round}, Turn ${entry.turn}`);

  if (statFragments.length > 0) {
    paragraphs.push(statFragments.join(' • '));
  }

  return paragraphs;
};

const resolveStoryPanel = (
  label: string,
  cardArticle: CardArticle | null,
  reportEntry?: GameOverReport['mvp'],
  fallbackArticle?: ReportArticleExcerpt | null,
): StoryPanelContent | null => {
  const operative = (reportEntry ?? null) as OperativeReport | null;
  if (!operative) {
    return null;
  }

  const article =
    buildExcerptFromCardArticle(cardArticle)
    ?? normalizeReportArticle(fallbackArticle ?? operative.article ?? null);

  const paragraphs = article?.paragraphs.length ? article.paragraphs : buildFallbackParagraphs(operative);

  return {
    label,
    cardName: operative.cardName,
    headline: article?.headline ?? operative.cardName,
    subhead: article?.subhead ?? formatImpactSubhead(operative),
    paragraphs,
  };
};

const NewspaperFrontPage = ({ report, onNavigateToPage }: NewspaperFrontPageProps) => {
  const isVictory = report.winner === report.playerFaction;
  const mvpCardId = report.mvp?.cardId;
  const [mvpArticle, setMvpArticle] = useState<CardArticle | null>(null);
  const [runnerUpArticle, setRunnerUpArticle] = useState<CardArticle | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadArticleBank().then(bank => {
      if (cancelled) return;
      if (report.mvp?.cardId) {
        setMvpArticle(getArticleById(report.mvp.cardId, bank));
      }
      if (report.runnerUp?.cardId) {
        setRunnerUpArticle(getArticleById(report.runnerUp.cardId, bank));
      }
    }).catch(err => {
      console.error('Failed to load articles for headline:', err);
    });
    return () => { cancelled = true; };
  }, [report.mvp?.cardId, report.runnerUp?.cardId]);

  const headline = generateSensationalistHeadline({
    winner: report.winner,
    victoryType: report.victoryType,
    mvpCardName: report.mvp?.cardName,
    mvpCardArticle: mvpArticle,
    runnerUpCardArticle: runnerUpArticle,
    capturedStatesCount: report.mvp?.capturedStates.length ?? 0,
    frontPage: report.frontPage,
    finalTruth: report.finalTruth,
  });

  const editionDate = new Date(report.recordedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  const toneClass = isVictory ? 'victory' : 'defeat';

  const mvpStory = useMemo(
    () => resolveStoryPanel('MOST VALUABLE OPERATIVE', mvpArticle, report.mvp ?? null, report.mvp?.article ?? null),
    [mvpArticle, report.mvp],
  );

  const runnerUpStory = useMemo(
    () => resolveStoryPanel('RUNNER-UP OPERATIVE', runnerUpArticle, report.runnerUp ?? null, report.runnerUp?.article ?? null),
    [runnerUpArticle, report.runnerUp],
  );

  const hasStoryPanels = Boolean(mvpStory || runnerUpStory);

  const renderStoryPanel = (story: StoryPanelContent, key: string) => (
    <article key={key} className="main-story-panel">
      <div className={cn('main-story-label', toneClass)}>{story.label}</div>
      <div className="main-story-card-name">{story.cardName}</div>
      <h3 className="main-story-hed">{story.headline}</h3>
      {story.subhead ? (
        <p className="main-story-subhead">{story.subhead}</p>
      ) : null}
      {story.paragraphs.slice(0, 3).map((paragraph, index) => (
        <p key={index} className="main-story-paragraph">
          {paragraph}
        </p>
      ))}
    </article>
  );

  const bulletPoints = [
    report.mvp ? `${report.mvp.cardName} leads the charge` : null,
    report.victoryType === 'states' && report.mvp?.capturedStates.length 
      ? `${report.mvp.capturedStates.length} states flipped in final push`
      : null,
    report.victoryType === 'truth'
      ? `Truth meter hits ${Math.round(report.finalTruth)}%`
      : null,
    report.victoryType === 'ip'
      ? `${report.winner === 'truth' ? 'Truth Network' : 'Shadow Government'} dominates airwaves`
      : null,
    `Season ends after ${report.rounds} rounds`,
  ].filter(Boolean) as string[];

  return (
    <div className={cn('newspaper-front-page', toneClass)}>
      <header className="newspaper-masthead">
        <div className="masthead-top">
          <span className="masthead-date">{editionDate}</span>
          <span className="masthead-price">LATE CITY FINAL • $2.00</span>
        </div>
        <h1 className="masthead-title">PARANOID TIMES</h1>
        <div className="masthead-tagline">
          ALL THE NEWS THEY DON'T WANT YOU TO KNOW
        </div>
      </header>

      <main className="newspaper-content">
        {mvpCardId ? (
          <div className="hero-image-container">
            <CardImage
              cardId={mvpCardId}
              fit="cover"
              className="hero-image"
            />
          </div>
        ) : null}

        <div className="headline-overlay">
          <h2 className={cn('main-headline', toneClass)}>
            {headline}
          </h2>

          {bulletPoints.length > 0 ? (
            <ul className="headline-bullets">
              {bulletPoints.slice(0, 3).map((bullet, index) => (
                <li key={index} className="bullet-point">• {bullet}</li>
              ))}
            </ul>
          ) : null}
        </div>

        {hasStoryPanels ? (
          <section className="main-story-section">
            <div className="main-story-grid">
              {mvpStory ? renderStoryPanel(mvpStory, 'mvp') : null}
              {runnerUpStory ? renderStoryPanel(runnerUpStory, 'runner') : null}
            </div>
          </section>
        ) : null}

        <div className="page-jumps">
          <div className="page-jump-label">INSIDE THIS EDITION:</div>
          <div className="page-jump-buttons">
            <button
              onClick={() => onNavigateToPage('mvp-breakdown')}
              className={cn('page-jump-button', toneClass)}
            >
              ⭕ PAGE 2-3<br/>
              <span className="jump-label">MVP BREAKDOWN</span>
            </button>
            <button
              onClick={() => onNavigateToPage('key-events')}
              className={cn('page-jump-button', toneClass)}
            >
              ⭕ PAGE 4-5<br/>
              <span className="jump-label">KEY EVENTS</span>
            </button>
            <button
              onClick={() => onNavigateToPage('full-analysis')}
              className={cn('page-jump-button', toneClass)}
            >
              ⭕ PAGE 6-9<br/>
              <span className="jump-label">FULL ANALYSIS</span>
            </button>
          </div>
        </div>

        <footer className="newspaper-footer">
          <div className="footer-headline">
            ALSO: Paranormal sightings hit record high • Field ops report unexplained phenomena • Government denies everything
          </div>
        </footer>
      </main>
    </div>
  );
};

export default NewspaperFrontPage;
