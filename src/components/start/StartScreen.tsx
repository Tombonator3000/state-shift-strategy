import { useMemo, useRef } from 'react';
import FactionCard from './FactionCard';
import ArticleButton from './ArticleButton';
import '@/styles/newspaper.css';

type StartScreenProps = {
  onStartGame: (faction: 'government' | 'truth', agendaId?: string) => void | Promise<void>;
  onManageExpansions: () => void;
  onHowToPlay: () => void;
  onOptions: () => void;
  onCredits: () => void;
  onCardCollection: () => void;
  onLoadGame?: () => boolean;
  getSaveInfo?: () => { turn?: number } | undefined;
  audio?: { playSFX?: (key: string) => void };
  onStartNewGameFallback?: () => void;
};

const featureHeadlines = [
  'SHOCKING: ELVIS JOINS THE ILLUMINATI!',
  'LIZARD PEOPLE WIN BIG IN LOCAL ELECTION!',
  'MOON OFFICIALLY DECLARED A HOLOGRAM!',
  'GOVERNMENT ADMITS BIRDS ARE DRONES!',
  'TIME TRAVELER WARNS ABOUT LAST TUESDAY!',
  'ALIENS DEMAND RIGHT TO VOTE BY MAIL!',
  'BIGFOOT SPOTTED RUNNING FOR PRESIDENT!'
];

const featureSubheads = [
  'MIND-BENDING EXCLUSIVES FROM SOURCES WE CAN DEFINITELY TRUST.',
  'ALT-REAL NEWS AVOIDING TRUTH SINCE THIS MORNING.',
  'CITIZENS REPORT WILD SCENES AS REALITY GETS OPTIONAL.',
  'CLASSIFIED LEAKS SUGGEST EVERYTHING IS ABSOLUTELY TRUE.'
];

const StartScreen = ({
  onStartGame,
  onManageExpansions,
  onHowToPlay,
  onOptions,
  onCredits,
  onCardCollection,
  onLoadGame,
  getSaveInfo,
  audio,
  onStartNewGameFallback
}: StartScreenProps) => {
  const headline = useMemo(
    () => featureHeadlines[Math.floor(Math.random() * featureHeadlines.length)],
    []
  );
  const subhead = useMemo(
    () => featureSubheads[Math.floor(Math.random() * featureSubheads.length)],
    []
  );

  const governmentCardRef = useRef<HTMLDivElement>(null);

  const playClick = () => {
    audio?.playSFX?.('click');
  };

  const handleFactionSelect = async (faction: 'government' | 'truth') => {
    playClick();
    await Promise.resolve(onStartGame(faction));
  };

  const handleArticleAction = (action: () => void) => () => {
    playClick();
    action();
  };

  const saveInfo = getSaveInfo?.();
  const hasSave = Boolean(saveInfo);
  const continueLabel = hasSave
    ? `CONTINUE (TURN ${saveInfo?.turn ?? '?'})`
    : 'START NEW GAME';

  const focusHeroCards = () => {
    if (governmentCardRef.current) {
      governmentCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      governmentCardRef.current.focus({ preventScroll: true });
    }
  };

  const handleFeatureAction = () => {
    if (hasSave) {
      playClick();
      if (onLoadGame) {
        const success = onLoadGame();
        if (success) {
          const indicator = document.createElement('div');
          indicator.textContent = '✓ GAME LOADED';
          indicator.className =
            'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-[60] animate-fade-in';
          document.body.appendChild(indicator);
          setTimeout(() => indicator.remove(), 2000);
        }
      }
      return;
    }

    playClick();
    if (onStartNewGameFallback) {
      onStartNewGameFallback();
    } else {
      focusHeroCards();
    }
  };

  return (
    <main className="newspaper-bg h-[100dvh] overflow-hidden text-[var(--ink)]">
      <div className="max-w-[1200px] mx-auto h-full px-3 sm:px-4 md:px-6 lg:px-8 pt-[var(--gut)] pb-[var(--gut)]">
        <header
          className="print-border bg-[var(--paper)] px-3 md:px-4 mb-[var(--gut)] flex items-end"
          style={{ height: 'var(--hdr)' }}
        >
          <div className="w-full flex flex-col gap-2">
            <div className="w-full flex items-end justify-between">
              <h1 className="font-[Anton] uppercase tracking-wide" style={{ fontSize: 'var(--h1)' }}>
                THE PARANOID TIMES
              </h1>
              <span className="badge" style={{ fontSize: 'var(--cap)' }}>
                TIMES
              </span>
            </div>
            <div
              className="inline-block bg-[var(--ink)] px-2 py-1 font-[Bebas Neue] uppercase tracking-wider text-[var(--paper)]"
              style={{ fontSize: 'var(--btn)' }}
            >
              MIND-BLOWING NEWS YOU WON'T BELIEVE!
            </div>
          </div>
        </header>

        <section
          className="grid gap-[var(--gut)]"
          style={{
            height: 'calc(100dvh - var(--hdr) - var(--ftr) - var(--gut)*2)',
            gridTemplateRows: 'minmax(0, var(--row-top)) minmax(0, var(--row-bot))',
            gridTemplateColumns: '1fr',
          }}
        >
          <div className="grid min-h-0 grid-cols-1 gap-[var(--gut)] md:grid-cols-2" aria-label="Faction selection">
            <FactionCard
              ref={governmentCardRef}
              faction="government"
              title="GOVERNMENT"
              caption="CONTROL THE NARRATIVE."
              imageSrc="/assets/start/start-gov.jpeg"
              onSelect={() => handleFactionSelect('government')}
            />
            <FactionCard
              faction="truth"
              title="TRUTH SEEKERS"
              caption="EXPOSE THE DECEPTION."
              imageSrc="/assets/start/start-truth.jpeg"
              onSelect={() => handleFactionSelect('truth')}
            />
          </div>

          <div className="grid min-h-0 grid-cols-1 gap-[var(--gut)] md:grid-cols-[2fr_1fr]" aria-label="Main actions">
            <div className="print-border bg-[var(--paper)] min-h-0 flex flex-col">
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <img
                  src="/assets/start/start-continue.jpeg"
                  alt="Continue your conspiracies"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col gap-2 p-3 md:p-4">
                <h2
                  className="font-[Anton] uppercase tracking-wide text-[var(--ink)]"
                  style={{ fontSize: 'var(--h2)' }}
                >
                  {headline}
                </h2>
                <p
                  className="uppercase tracking-wide text-[var(--ink-weak)]"
                  style={{ fontSize: 'var(--cap)' }}
                >
                  {subhead}
                </p>
                <ArticleButton label={continueLabel} onClick={handleFeatureAction} />
              </div>
            </div>

            <aside className="grid min-h-0 content-start gap-[var(--gut)]" aria-label="Menu options">
              <ArticleButton
                label="SELL EXPANSIONS!"
                sub="STORY ON PAGE 6"
                onClick={handleArticleAction(onManageExpansions)}
              />
              <ArticleButton
                label="TOP SECRET SETTINGS"
                onClick={handleArticleAction(onOptions)}
              />
              <ArticleButton
                label="LEAKED HOW-TO GUIDE"
                onClick={handleArticleAction(onHowToPlay)}
              />
              <ArticleButton
                label="EVIDENCE ARCHIVE"
                onClick={handleArticleAction(onCardCollection)}
              />
              <ArticleButton
                label="FOLLOW THE MONEY"
                onClick={handleArticleAction(onCredits)}
              />
            </aside>
          </div>
        </section>

        <footer
          className="print-border mt-[var(--gut)] px-3 flex items-center justify-center font-[Bebas Neue] tracking-widest uppercase"
          style={{ height: 'var(--ftr)', fontSize: 'clamp(11px, 1.8vh, 18px)' }}
        >
          PHONY MOON CONTINUES TO SHINE IN NIGHT SKY!
        </footer>
      </div>
    </main>
  );
};

export default StartScreen;
