import React, { useEffect, useMemo, useRef, useState } from 'react';

interface PhaseTransitionProps {
  phase: string;
  previousPhase: string;
  onComplete: () => void;
  // New context for faction-aware, data-driven UI
  truth?: number; // 0-100
  round?: number;
  faction?: 'truth' | 'government';
}

// Tabloid-style Phase Modal replacing the old [CLASSIFIED INTEL] overlay
// - Faction-aware meter (Gov prefers low Truth, Truth Seekers prefer high)
// - Random masthead + fake ads
// - Click/ESC to dismiss (no auto-hide) per spec
const PhaseTransition = ({
  phase,
  previousPhase,
  onComplete,
  truth = 50,
  round = 1,
  faction = 'government',
}: PhaseTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  // Guarded dismiss to avoid double-calls
  const completedRef = useRef(false);

  const tabloids = useMemo(
    () => [
      'WEEKLY WEIRD WORLD',
      'AREA 51 DIGEST',
      'THE PARANOID TIMES',
      'THE SHEEPLE DAILY',
      'BLACK HELICOPTER GAZETTE',
      'THE WEEKLY PARANOID NEWS',
    ],
    []
  );

  const fakeAds = useMemo(
    () => [
      { big: 'BUY 2 TINFOIL HATS', small: 'GET 3RD FREE!' },
      { big: 'PASTOR REX HEALING CRYSTALS', small: 'Now with 5G blocking' },
      { big: "AGENT SMITHERSON’S MEMORY WIPES", small: 'Forget this ad instantly!' },
      { big: 'FLORIDA MAN SELF-HELP COURSE', small: 'Become your final form' },
      { big: 'BIGFOOT CAMEO', small: 'He records. You believe.' },
      { big: 'TIME-TRAVEL INSURANCE', small: "You're already covered yesterday" },
      { big: 'PSYCHIC WI-FI', small: '6G Chakra Plan' },
    ],
    []
  );

  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  const phaseBadge = useMemo(() => {
    if (phase === 'action') return '⚡ ACTION PHASE';
    if (phase === 'resolution') return '🧾 RESOLUTION PHASE';
    if (phase === 'event' || phase === 'newspaper') return '📰 BREAKING EVENT';
    return `${phase?.toUpperCase?.() || 'PHASE'}`;
  }, [phase]);

  const headline = useMemo(() => {
    if (phase === 'action' && faction === 'government') return "UNMARKED HELICOPTERS DELIVER ‘DEMOCRACY’";
    if (phase === 'action') return 'BAT BOY MARRIES VENDING MACHINE — DEMANDS TRANSPARENCY';
    if (phase === 'event') return 'ELVIS SPOTTED IN HAUNTED WALMART';
    if (phase === 'resolution') return "SHADOWS MOVE — PUBLIC DOESN’T NOTICE";
    return 'STRANGE LIGHTS OVER NEVADA';
  }, [phase, faction]);

  const bullets = useMemo(() => {
    const items: string[] = [];
    if (phase === 'action') {
      items.push(`Round ${round} begins — Truth at ${Math.round(truth)}%`);
      items.push('Play up to 3 cards; target states glow on hover');
      items.push('Space = End turn · U = Upgrades · Q = Save');
    } else if (phase === 'event') {
      items.push(`Developments shake the nation — Round ${round}`);
      items.push('Read the briefing. Adapt your strategy.');
      items.push('Press ESC to acknowledge.');
    } else {
      items.push('Operational update in progress...');
    }
    return items;
  }, [phase, round, truth]);

  const factionTag = useMemo(
    () => (faction === 'government' ? 'Government Operative Edition' : 'Truth Seeker Special'),
    [faction]
  );

  // Conspiracy meter logic: Gov wants low truth; Truth wants high
  const conspiracyPercent = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, truth));
    return faction === 'government' ? 100 - clamped : clamped;
  }, [truth, faction]);

  const conspiracyLevel = useMemo(() => {
    if (conspiracyPercent >= 80) return 'MAXIMUM';
    if (conspiracyPercent >= 50) return 'ELEVATED';
    return 'QUIET PANIC';
  }, [conspiracyPercent]);

  const [paperTitle, setPaperTitle] = useState(pick(tabloids));
  const [ads, setAds] = useState(() => [pick(fakeAds), pick(fakeAds)]);

  const dismiss = (source: 'click' | 'esc' | 'phase-change') => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsVisible(false);
    try {
      onComplete?.();
    } catch (e) {
      console.error('[PhaseTransition] onComplete error', e);
    }
  };

  // Show only when the phase actually changed and is one of the spec phases
  useEffect(() => {
    if (phase !== previousPhase && (phase === 'action' || phase === 'event' || phase === 'resolution')) {
      setIsVisible(true);
      completedRef.current = false;
      setPaperTitle(pick(tabloids));
      setAds([pick(fakeAds), pick(fakeAds)]);
      // No auto-hide — user must click/ESC
      // Console for debugging
      console.debug('[PhaseTransition:Tabloid] show', { from: previousPhase, to: phase, truth, round, faction });
    }
  }, [phase, previousPhase, truth, round, faction, tabloids, fakeAds]);

  // ESC to dismiss when visible
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismiss('esc');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 bottom-40 z-50 bg-black/60 flex items-center justify-center px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={() => dismiss('click')}
    >
      <div className="bg-newspaper-bg border-4 border-newspaper-border shadow-2xl w-full max-w-3xl p-0 transform animate-scale-in">
        {/* Masthead */}
        <div className="bg-newspaper-header p-4 border-b-4 border-newspaper-border text-center">
          <div className="text-xs font-bold tracking-widest opacity-60 mb-1">EXTRA! EXTRA! – Round {round}</div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight font-serif text-newspaper-text uppercase">
            {paperTitle}
          </h1>
        </div>

        {/* Hero */}
        <div className="px-6 pt-5 text-center">
          <div className="inline-block bg-newspaper-text text-newspaper-bg px-4 py-2 font-black tracking-wide border-2 border-newspaper-border shadow-md">
            {phaseBadge}
          </div>
          <div className="mt-2 text-sm font-bold text-newspaper-text/80">
            Conspiracy Level: <span className="font-extrabold">{conspiracyLevel}</span>
          </div>
          <div className="mt-3 mx-auto w-2/3 h-2 border-2 border-newspaper-border bg-newspaper-header relative">
            <div
              className="h-full bg-truth-red"
              style={{ width: `${conspiracyPercent}%` }}
            />
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-5">
          <div className="md:col-span-2">
            <div className="font-black uppercase text-lg md:text-xl text-newspaper-text border-l-8 border-newspaper-text pl-2 mb-2">
              {headline}
            </div>
            <ul className="list-disc marker:text-newspaper-text/80 pl-5 space-y-1 text-newspaper-text/90">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
          <aside className="md:col-span-1">
            <div className="border-2 border-newspaper-border bg-newspaper-header p-2 text-center font-extrabold text-newspaper-text mb-2">
              CLASSIFIED ADS
            </div>
            <div className="space-y-2">
              {ads.map((ad, i) => (
                <div key={i} className="border-2 border-newspaper-border bg-newspaper-bg p-3 text-center">
                  <div className="font-black uppercase">{ad.big}</div>
                  <small className="block opacity-80">{ad.small}</small>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-newspaper-border bg-newspaper-header px-6 py-3 flex items-center justify-between text-newspaper-text">
          <div className="font-black uppercase tracking-wide">{factionTag}</div>
          <div className="text-xs opacity-80">Klikk eller trykk ESC for å fortsette</div>
        </div>
      </div>
    </div>
  );
};

export default PhaseTransition;
