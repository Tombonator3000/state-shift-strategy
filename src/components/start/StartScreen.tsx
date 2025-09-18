import { useMemo, useRef } from 'react';
import FactionCard from './FactionCard';
import ArticleButton from './ArticleButton';
import '@/styles/newspaper.css';

type StartScreenProps = {
  onStartGame: (faction: 'government' | 'truth') => void | Promise<void>;
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
    <main className="newspaper-bg flex h-screen flex-col overflow-hidden text-[var(--ink)]">
      <div className="mx-auto flex h-full max-w-[1200px] flex-1 flex-col overflow-hidden px-3 py-2 sm:px-4 md:px-6 md:py-4 lg:px-8">
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="print-border bg-[var(--paper)] px-3 py-3 md:px-4 md:py-4 [flex:0_0_15%] sm:[flex:0_0_14%] lg:[flex:0_0_12%]">
            <div className="flex h-full flex-col justify-center gap-2">
              <div className="flex items-end justify-between gap-2">
                <h1 className="font-[Anton] text-4xl tracking-wide uppercase md:text-6xl">THE PARANOID TIMES</h1>
                <span className="badge text-xs md:text-sm">TIMES</span>
              </div>
              <div className="inline-block bg-[var(--ink)] px-2 py-1 font-[Bebas Neue] text-[11px] uppercase tracking-wider text-[var(--paper)] md:text-sm">
                MIND-BLOWING NEWS YOU WON'T BELIEVE!
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            <div className="grid h-full grid-rows-[0.4fr_minmax(0,0.2fr)_0.4fr] gap-3 overflow-hidden md:gap-4 lg:grid-rows-[0.32fr_minmax(0,0.2fr)_0.48fr]">
              <section className="grid min-h-0 grid-cols-1 gap-3 md:grid-cols-2 md:gap-4" aria-label="Faction selection">
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
              </section>

              <section className="print-border min-h-0 px-3 py-3 md:px-4 md:py-4">
                <h2 className="font-[Anton] text-2xl leading-tight tracking-wide uppercase sm:text-4xl md:text-5xl">{headline}</h2>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-[var(--ink-weak)] md:text-sm">{subhead}</p>
                <div className="mt-3 hr-rule" />
              </section>

              <section className="grid min-h-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-4" aria-label="Main actions">
                <div className="flex min-h-0 flex-col overflow-hidden print-border bg-[var(--paper)]">
                  <div className="flex-1 overflow-hidden bg-black/10">
                    <img
                      src="/assets/start/start-continue.jpeg"
                      alt="Continue your conspiracies"
                      loading="lazy"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="px-3 py-3 md:px-4 md:py-4">
                    <ArticleButton label={continueLabel} onClick={handleFeatureAction} />
                  </div>
                </div>

                <aside className="flex min-h-0 flex-col justify-evenly gap-2 md:gap-3 lg:gap-4" aria-label="Menu options">
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
              </section>
            </div>
          </div>

          <footer className="print-border px-3 py-2 text-center font-[Bebas Neue] text-base uppercase tracking-widest md:px-4 md:text-lg [flex:0_0_10%] sm:[flex:0_0_9%] lg:[flex:0_0_7%]">
            PHONY MOON CONTINUES TO SHINE IN NIGHT SKY!
          </footer>
        </div>
      </div>
    </main>
  );
};

export default StartScreen;
