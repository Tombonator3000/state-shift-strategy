import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAudioContext } from '@/contexts/AudioContext';

interface EndCreditsProps {
  isVisible: boolean;
  playerFaction: 'truth' | 'government';
  onClose: () => void;
}

type CreditPhase = 'intro' | 'segments' | 'cameos' | 'outro';

interface CreditEntry {
  phase: CreditPhase;
  title: string;
  subtitle: string;
  hold: number;
  cardHint?: string;
}

const EndCredits = ({ isVisible, playerFaction, onClose }: EndCreditsProps) => {
  const [currentEntry, setCurrentEntry] = useState<CreditEntry | null>(null);
  const [isEntryVisible, setIsEntryVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const timelineRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cardIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    setEndCreditsMusic,
    stopMusic,
    setMenuMusic,
    queueMenuMusicAfterEnd,
    cancelMenuMusicQueue
  } = useAudioContext();

  const cardPhotos = useMemo(
    () => [
      '/card-art/GOV-001.jpg',
      '/card-art/GOV-004.jpg',
      '/card-art/GOV-009.jpg',
      '/card-art/GOV-013.jpg',
      '/card-art/GOV-018.jpg',
      '/card-art/GOV-021.jpg',
      '/card-art/TRUTH-002.jpg',
      '/card-art/TRUTH-004.jpg',
      '/card-art/TRUTH-009.jpg',
      '/card-art/TRUTH-017.jpg'
    ],
    []
  );

  const totalCardPhotos = cardPhotos.length;

  const creditEntries = useMemo<CreditEntry[]>(() => {
    const factionFinale =
      playerFaction === 'government'
        ? "Department of Plausible Deniability — Minutes recorded, hissing politely ignored"
        : "Underground Truth Network — Broadcast relayed via laundromat dryer #4";

    return [
      {
        phase: 'intro',
        title: 'THE WEEKLY PARANOID NEWS',
        subtitle: 'CLASSIFIED EDITION • DO NOT LEAVE ON BUS BENCHES',
        hold: 3200,
        cardHint: 'Front page compositors posed with confiscated Polaroids'
      },
      {
        phase: 'intro',
        title: 'A SHADOW GOVERNMENT PRODUCTION',
        subtitle: "Remember: They're Watching, But So Are We",
        hold: 3200,
        cardHint: 'Broadcast sanitized for plausible deniability'
      },
      {
        phase: 'segments',
        title: 'EXECUTIVE PRODUCERS',
        subtitle: 'Tom Husby • Keeper of Spare Moon Rocks & Acting Bat Boy Liaison',
        hold: 5000,
        cardHint: 'Signed off on interdimensional catering receipts'
      },
      {
        phase: 'segments',
        title: 'DIRECTOR OF COVER STORIES',
        subtitle: 'Agent P. Redacted — Filed the “Nothing To See Here” paperwork in triplicate',
        hold: 5000,
        cardHint: 'Fingerprints replaced with ink smudges'
      },
      {
        phase: 'segments',
        title: 'TIMELINE WRANGLERS',
        subtitle: 'Chrono-Bureau Annex 7 • Resetting Tuesdays since last Thursday',
        hold: 5000,
        cardHint: 'Guaranteeing reruns of today tomorrow'
      },
      {
        phase: 'segments',
        title: 'EVIDENCE LIBRARIANS',
        subtitle: '“Mothman on Microfiche” digitization crew — currently misplaced',
        hold: 5000,
        cardHint: 'Return overdue sightings to avoid late fees'
      },
      {
        phase: 'segments',
        title: 'CLASSIFIED FACT-CHECKERS',
        subtitle: 'Florida Man Mutual Aid Society • Verified every rumor twice, shouted thrice',
        hold: 5000,
        cardHint: 'Clipboards reinforced with tinfoil corners'
      },
      {
        phase: 'segments',
        title: 'AUDIO SCRAMBLER OPERATORS',
        subtitle: '“Totally Normal Elevator Music” Initiative • Subliminal grooves by sub-basement DJs',
        hold: 5000,
        cardHint: 'Requests processed in reverse chronological order'
      },
      {
        phase: 'segments',
        title: 'FIELD CORRESPONDENTS',
        subtitle: 'Alligator Rodeo Bureau • Motto: “Hold my classified briefing”',
        hold: 5000,
        cardHint: 'Boots muddied on three coasts simultaneously'
      },
      {
        phase: 'segments',
        title: 'RED STRING CONSULTANTS',
        subtitle: 'Basement Cartographers • Mapping coincidences into actionable intel',
        hold: 5000,
        cardHint: 'Accept payment in yarn or rumors'
      },
      {
        phase: 'cameos',
        title: 'SPECIAL CAMEOS',
        subtitle: 'Council of Imaginary Friends — Provided invisible security detail',
        hold: 2600,
        cardHint: 'Badge reads “If found, forget”'
      },
      {
        phase: 'cameos',
        title: 'SPECIAL CAMEOS',
        subtitle: 'Laundry Chute Couriers — Delivered dossiers folded into swans',
        hold: 2600,
        cardHint: 'Currently hiding in ventilation'
      },
      {
        phase: 'cameos',
        title: 'SPECIAL CAMEOS',
        subtitle: 'Bat Boy Focus Group — Demanded more tasteful cave lighting',
        hold: 2600,
        cardHint: 'Paid in novelty sunglasses'
      },
      {
        phase: 'cameos',
        title: 'SPECIAL CAMEOS',
        subtitle: 'Psychic Wi-Fi Technicians — Forecast your download speeds yesterday',
        hold: 2600,
        cardHint: 'Router password: 0MN1V0Y3R'
      },
      {
        phase: 'cameos',
        title: 'SPECIAL CAMEOS',
        subtitle: 'International Committee on Routine Anomalies — Approved these credits unanimously',
        hold: 2600,
        cardHint: 'Meeting minutes mostly scorch marks'
      },
      {
        phase: 'outro',
        title: 'FACTION ADVISORS',
        subtitle: factionFinale,
        hold: 4200,
        cardHint: 'Messages relayed via pneumatic tubes and suspicious pastries'
      },
      {
        phase: 'outro',
        title: 'PRINTED ON',
        subtitle: 'Recycled surveillance reports, third-generation fax paper, hopeful whispers',
        hold: 4200,
        cardHint: 'Smells faintly of ozone and cover stories'
      },
      {
        phase: 'outro',
        title: 'POST-CREDITS SCENE',
        subtitle: 'Stay seated: projector may spontaneously reveal additional redacted truths',
        hold: 4200,
        cardHint: 'Snacks confiscated for evidence'
      },
      {
        phase: 'outro',
        title: 'THANKS FOR PLAYING',
        subtitle: 'Stay vigilant. Stay paranoid. The game never really ends.',
        hold: 5400,
        cardHint: 'Exit through the gift shop, avoid the unmarked van'
      }
    ];
  }, [playerFaction]);

  const clearTimeline = useCallback(() => {
    timelineRef.current.forEach(timeout => clearTimeout(timeout));
    timelineRef.current = [];
  }, []);

  const stopCardInterval = useCallback(() => {
    if (cardIntervalRef.current) {
      clearInterval(cardIntervalRef.current);
      cardIntervalRef.current = null;
    }
  }, []);

  const closeCredits = useCallback(() => {
    clearTimeline();
    stopCardInterval();
    onClose();
  }, [clearTimeline, stopCardInterval, onClose]);

  const handleTimelineComplete = useCallback(() => {
    queueMenuMusicAfterEnd();
    closeCredits();
  }, [queueMenuMusicAfterEnd, closeCredits]);

  const startTimeline = useCallback(() => {
    if (creditEntries.length === 0) {
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let accumulatedDelay = 0;

    creditEntries.forEach((entry, index) => {
      if (index === 0) {
        return;
      }

      const previousHold = creditEntries[index - 1]?.hold ?? 0;
      accumulatedDelay += previousHold;

      const timeout = setTimeout(() => {
        setIsEntryVisible(false);

        setTimeout(() => {
          setCurrentEntry(entry);
          setIsEntryVisible(true);
          if (entry.cardHint && totalCardPhotos > 0) {
            setCardIndex(prev => (prev + 1) % totalCardPhotos);
          }
        }, 260);
      }, accumulatedDelay);

      timeouts.push(timeout);
    });

    const lastHold = creditEntries[creditEntries.length - 1]?.hold ?? 4000;
    const finaleTimeout = setTimeout(() => {
      handleTimelineComplete();
    }, accumulatedDelay + lastHold + 1800);

    timeouts.push(finaleTimeout);
    timelineRef.current = timeouts;
  }, [creditEntries, handleTimelineComplete, totalCardPhotos]);

  const startMusic = useCallback(() => {
    console.log('🎵 EndCredits: Starting end credits music via main audio system');
    setEndCreditsMusic();
  }, [setEndCreditsMusic]);

  const stopEndCreditsMusic = useCallback(() => {
    console.log('🎵 EndCredits: Stopping end credits music via main audio system');
    stopMusic();
  }, [stopMusic]);

  const handleManualClose = useCallback(() => {
    cancelMenuMusicQueue();
    stopEndCreditsMusic();
    setMenuMusic();
    closeCredits();
  }, [cancelMenuMusicQueue, stopEndCreditsMusic, setMenuMusic, closeCredits]);

  useEffect(() => {
    if (!isVisible) {
      clearTimeline();
      stopCardInterval();
      setCurrentEntry(null);
      setIsEntryVisible(false);
      setShowControls(true);
      return () => {
        clearTimeline();
        stopCardInterval();
      };
    }

    if (creditEntries.length === 0) {
      return () => {
        clearTimeline();
        stopCardInterval();
      };
    }

    clearTimeline();
    cancelMenuMusicQueue();
    startMusic();
    startTimeline();
    setCurrentEntry(creditEntries[0]);
    setIsEntryVisible(true);
    setShowControls(true);
    setCardIndex(0);

    if (totalCardPhotos > 0) {
      stopCardInterval();
      cardIntervalRef.current = setInterval(() => {
        setCardIndex(prev => (prev + 1) % totalCardPhotos);
      }, 7000);
    }

    return () => {
      clearTimeline();
      stopCardInterval();
    };
  }, [
    isVisible,
    creditEntries,
    totalCardPhotos,
    cancelMenuMusicQueue,
    startMusic,
    startTimeline,
    stopCardInterval,
    clearTimeline
  ]);

  if (!isVisible || !currentEntry) return null;

  const factionAccent = playerFaction === 'government' ? 'text-red-300' : 'text-blue-200';

  const phaseTagMap: Record<CreditPhase, string> = {
    intro: '• CLASSIFIED TRANSMISSION •',
    segments: '• PERSONNEL FILES •',
    cameos: '• SPECIAL RECOGNITION •',
    outro: '• END OF TRANSMISSION •'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#111217] to-black opacity-95" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-screen"
        style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cmVjdCB3aWR0aD0iMyIgaGVpZ2h0PSIzIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjYiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')" }}
        aria-hidden="true"
      />

      <div className="relative h-full flex flex-col">
        <header className="pt-12 px-8 text-center font-mono text-xs uppercase tracking-[0.5em] text-red-400/80">
          Classified Transmission // Authorized Eyes Only
        </header>

        <div className="relative flex-1 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 px-6">
            <div
              className={`mx-auto max-w-4xl text-center transition-all duration-700 ease-out ${
                isEntryVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <h1 className="mb-4 text-3xl md:text-5xl font-black tracking-[0.4em] uppercase text-white/95">
                {currentEntry.title}
              </h1>
              <div className="mx-auto mb-6 h-1 w-32 bg-red-500/90" />
              <p className="mx-auto max-w-3xl font-serif text-lg md:text-xl text-white/80 leading-relaxed">
                {currentEntry.subtitle}
              </p>
              <div className={`mt-10 font-mono text-sm uppercase tracking-[0.4em] ${factionAccent}`}>
                {phaseTagMap[currentEntry.phase]}
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 flex justify-between px-10 pt-16 text-[0.65rem] font-mono uppercase tracking-[0.35em] text-white/30">
            <span>Projector 7B // Rewound</span>
            <span>Paranoid Times Archives</span>
            <span>Roll {String(cardIndex + 1).padStart(2, '0')}</span>
          </div>

          {totalCardPhotos > 0 && (
            <figure
              className={`absolute bottom-16 right-12 w-64 origin-bottom-right rounded-md border border-white/20 bg-white/5 p-3 shadow-[0_20px_45px_rgba(0,0,0,0.45)] transition-all duration-700 ease-out ${
                isEntryVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded">
                <img
                  src={cardPhotos[cardIndex % totalCardPhotos]}
                  alt="Archived card evidence"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[0.65rem] font-mono uppercase tracking-[0.25em] text-white/60">
                {currentEntry.cardHint || 'Evidence retrieved from vault 13-B'}
              </figcaption>
            </figure>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/70 to-transparent" />
        </div>

        <footer className="relative z-10 flex items-center justify-center gap-12 pb-10 pt-6 text-[0.7rem] font-mono uppercase tracking-[0.3em] text-white/40">
          <span>Rewind Requested? Press Escape</span>
          <span>Project Code: {playerFaction === 'government' ? 'OBFUSCATE' : 'REVEAL'}</span>
          <span>Signal Clean Since 1993*</span>
        </footer>
      </div>

      {showControls && (
        <div className="absolute inset-x-0 bottom-8 flex justify-center gap-4">
          <Button
            onClick={handleManualClose}
            variant="outline"
            className="bg-white/10 text-white hover:bg-white/20 border-white/30 font-mono text-xs uppercase tracking-[0.4em]"
            aria-label="Skip end credits and return to main menu"
          >
            Skip Credits
          </Button>
          <Button
            onClick={handleManualClose}
            className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase tracking-[0.4em]"
            aria-label="Return to main menu"
          >
            Return to Main Menu
          </Button>
        </div>
      )}
    </div>
  );
};

export default EndCredits;