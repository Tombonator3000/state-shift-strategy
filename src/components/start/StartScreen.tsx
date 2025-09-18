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
  'Mind-bending exclusives from sources we can definitely trust.',
  'Alt-real news avoiding truth since this morning.',
  'Citizens report wild scenes as reality gets optional.',
  'Classified leaks suggest everything is absolutely true.'
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
    <div className="newspaper-bg min-h-dvh text-[var(--ink)]">
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 space-y-6">
        <header className="print-border bg-[var(--paper)] px-4 sm:px-6 py-4 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-['Anton',sans-serif] text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.05em] uppercase">
              THE PARANOID TIMES
            </h1>
            <span className="badge text-sm uppercase tracking-[0.08em] bg-[var(--paper)] text-[var(--ink)]">TIMES</span>
          </div>
          <div className="hr-rule my-4" aria-hidden="true" />
          <p className="font-['Bebas Neue',sans-serif] text-base sm:text-lg md:text-xl uppercase tracking-[0.1em] text-center">
            MIND-BLOWING NEWS YOU WON'T BELIEVE!
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2" aria-label="Choose your faction">
          <FactionCard
            ref={governmentCardRef}
            faction="government"
            title="GOVERNMENT"
            caption="Control the narrative."
            imageSrc="/assets/start/start-gov.jpg"
            onSelect={() => handleFactionSelect('government')}
          />
          <FactionCard
            faction="truth"
            title="TRUTH SEEKERS"
            caption="Expose the deception."
            imageSrc="/assets/start/start-truth.jpg"
            onSelect={() => handleFactionSelect('truth')}
          />
        </section>

        <section className="print-border bg-[var(--paper)] px-4 sm:px-6 py-6 text-center space-y-3">
          <span className="font-['Bebas Neue',sans-serif] text-sm sm:text-base uppercase tracking-[0.12em] text-[var(--accent)]">
            BREAKING NEWS
          </span>
          <h2 className="font-['Anton',sans-serif] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-[0.05em]">
            {headline}
          </h2>
          <p className="font-['Bebas Neue',sans-serif] text-base sm:text-lg uppercase tracking-[0.1em] text-[var(--ink-weak)]">
            {subhead}
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="print-border overflow-hidden bg-[var(--paper)]">
              <img
                src="/assets/start/start-continue.jpg"
                alt="Continue your conspiracies"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleFeatureAction}
              className="print-border w-full bg-[var(--paper)] px-4 py-4 font-['Bebas Neue',sans-serif] text-2xl md:text-3xl uppercase tracking-[0.12em] hover:bg-black/5 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
            >
              {continueLabel}
            </button>
          </div>

          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1" aria-label="Menu options">
            <ArticleButton
              label="OPTIONS"
              onClick={handleArticleAction(onOptions)}
              sub="Tune your paranoia settings"
            />
            <ArticleButton
              label="MANAGE EXPANSIONS"
              onClick={handleArticleAction(onManageExpansions)}
              sub="Sell expansions!"
            />
            <ArticleButton
              label="HOW TO PLAY"
              onClick={handleArticleAction(onHowToPlay)}
              sub="Top secret dossier"
            />
            <ArticleButton
              label="CARD COLLECTION"
              onClick={handleArticleAction(onCardCollection)}
              sub="Evidence archive"
            />
            <ArticleButton
              label="CREDITS"
              onClick={handleArticleAction(onCredits)}
              variant="ad"
              sub="Who\'s behind the curtain?"
            />
          </aside>
        </section>

        <footer className="print-border bg-[var(--paper)] px-3 py-3 text-center">
          <span className="font-['Bebas Neue',sans-serif] text-lg sm:text-xl uppercase tracking-[0.14em]">
            PHONY MOON CONTINUES TO SHINE IN NIGHT SKY!
          </span>
        </footer>
      </div>
    </div>
  );
};

export default StartScreen;
