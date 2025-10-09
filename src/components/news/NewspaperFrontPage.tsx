import { cn } from '@/lib/utils';
import CardImage from '@/components/game/CardImage';
import type { GameOverReport } from '@/types/finalEdition';
import { generateSensationalistHeadline } from '@/utils/sensationalistHeadlines';
import '@/styles/newspaperFrontPage.css';

interface NewspaperFrontPageProps {
  report: GameOverReport;
  onNavigateToPage: (page: string) => void;
}

const NewspaperFrontPage = ({ report, onNavigateToPage }: NewspaperFrontPageProps) => {
  const isVictory = report.winner === report.playerFaction;
  const mvpCardId = report.mvp?.cardId;

  const headline = generateSensationalistHeadline({
    winner: report.winner,
    victoryType: report.victoryType,
    mvpCardName: report.mvp?.cardName,
    capturedStatesCount: report.mvp?.capturedStates.length ?? 0,
    frontPage: report.frontPage,
  });

  const editionDate = new Date(report.recordedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  const toneClass = isVictory ? 'victory' : 'defeat';
  
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
