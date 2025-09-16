import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAudioContext } from '@/contexts/AudioContext';

interface EndCreditsProps {
  isVisible: boolean;
  playerFaction: 'truth' | 'government';
  onClose: () => void;
}

const EndCredits = ({ isVisible, playerFaction, onClose }: EndCreditsProps) => {
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'segments' | 'cameos' | 'outro'>('intro');
  const [currentText, setCurrentText] = useState('');
  const [currentSubtext, setCurrentSubtext] = useState('');
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const timelineRef = useRef<NodeJS.Timeout[]>([]);
  const { setEndCreditsMusic, stopMusic, playSFX } = useAudioContext();

  // Zany credit texts
  const creditTexts = {
    intro: [
      { title: "THE WEEKLY PARANOID NEWS", subtitle: "CLASSIFIED EDITION" },
      { title: "A SHADOW GOVERNMENT PRODUCTION", subtitle: "Remember: They're Watching, But So Are We" }
    ],
    segments: [
      { title: "EXECUTIVE PRODUCER", subtitle: "Tom Husby — Chief Bat Boy Negotiator & Temporal Leak Janitor (Acting)" },
      { title: "CREATIVE DIRECTOR", subtitle: "Tom Husby — Head of Lizard Hospitality & Interdimensional Coffee Service" },
      { title: "LEAD CONSPIRACY THEORIST", subtitle: "Tom Husby — Senior Tinfoil Hat Designer & Moon Base Operations Manager" },
      { title: "AUDIO ENGINEER", subtitle: "Tom Husby — Frequency Manipulator & Subliminal Message Consultant" },
      { title: "QUALITY ASSURANCE", subtitle: "Tom Husby — Bug Whisperer & Reality Debugging Specialist" },
      { title: "REGIONAL COORDINATOR", subtitle: "Tom Husby — Regional Vending Machine Marriage Counselor" },
      { title: "SPECIAL THANKS", subtitle: "Three grandmas on shortwave radio — Signal Boost Specialists" },
      { title: "CONSULTING SERVICES", subtitle: "Anonymous leak platform contributors — 'We come in peace, mostly'" }
    ],
    cameos: [
      "Five committees that don't exist — Unanimous approval",
      "Emergency horoscope consultants — IP: favorable", 
      "Bat Boy Focus Group — Snacks vanished mysteriously",
      "Time-Travel Insurance — You were already covered yesterday",
      "Psychic Wi-Fi — 6G Chakra Plan available now",
      "Reptile Thermos™ — Keeps coffee hot, blood cold"
    ],
    outro: [
      { title: "FACTION ADVISORS", subtitle: playerFaction === 'government' 
        ? "Department of Plausible Deniability — 'If you can read this, you have proper clearance'"
        : "Underground Truth Network — 'The truth is out there... we just made it easier to find'" },
      { title: "DISCLAIMER", subtitle: "Any resemblance to actual conspiracies, living or dead, is purely intentional" },
      { title: "PRINTED ON", subtitle: "Recycled surveillance reports and declassified documents" },
      { title: "THANKS FOR PLAYING", subtitle: "Stay vigilant. Stay paranoid. The game never really ends." }
    ]
  };

  const startTimeline = () => {
    const timeouts: NodeJS.Timeout[] = [];
    let currentTime = 0;

    // Helper function to add timeline events
    const addEvent = (delay: number, callback: () => void) => {
      currentTime += delay;
      const timeout = setTimeout(callback, currentTime);
      timeouts.push(timeout);
    };

    // Intro phase (6 seconds total)
    creditTexts.intro.forEach((credit, index) => {
      addEvent(index === 0 ? 500 : 3000, () => {
        setCurrentPhase('intro');
        setCurrentText(credit.title);
        setCurrentSubtext(credit.subtitle);
        setIsTextVisible(true);
      });
    });

    // Segments phase (48 seconds - 8 segments × 6 seconds)
    creditTexts.segments.forEach((credit, index) => {
      addEvent(6000, () => {
        setCurrentPhase('segments');
        setIsTextVisible(false);
        setTimeout(() => {
          setCurrentText(credit.title);
          setCurrentSubtext(credit.subtitle);
          setIsTextVisible(true);
        }, 300);
      });
    });

    // Cameos phase (12 seconds - rapid montage)
    creditTexts.cameos.forEach((cameo, index) => {
      addEvent(2000, () => {
        setCurrentPhase('cameos');
        setIsTextVisible(false);
        setTimeout(() => {
          setCurrentText('SPECIAL CAMEOS');
          setCurrentSubtext(cameo);
          setIsTextVisible(true);
        }, 200);
      });
    });

    // Outro phase (12 seconds)
    creditTexts.outro.forEach((credit, index) => {
      addEvent(index === 0 ? 3000 : 3000, () => {
        setCurrentPhase('outro');
        setIsTextVisible(false);
        setTimeout(() => {
          setCurrentText(credit.title);
          setCurrentSubtext(credit.subtitle);
          setIsTextVisible(true);
        }, 300);
      });
    });

    // Auto-exit after timeline completes
    addEvent(6000, () => {
      handleClose();
    });

    timelineRef.current = timeouts;
  };

  const startMusic = () => {
    console.log('🎵 EndCredits: Starting end credits music via main audio system');
    setEndCreditsMusic();
  };

  const stopEndCreditsMusic = () => {
    console.log('🎵 EndCredits: Stopping end credits music via main audio system');
    stopMusic();
  };

  const clearTimeline = () => {
    timelineRef.current.forEach(timeout => clearTimeout(timeout));
    timelineRef.current = [];
  };

  const handleClose = () => {
    stopEndCreditsMusic();
    clearTimeline();
    onClose();
  };

  useEffect(() => {
    if (isVisible) {
      // Start music and timeline
      startMusic();
      startTimeline();
      
      // Show initial text
      setCurrentText('THE WEEKLY PARANOID NEWS');
      setCurrentSubtext('CLASSIFIED EDITION');
      setIsTextVisible(true);
    } else {
      // Cleanup when not visible
      stopEndCreditsMusic();
      clearTimeline();
      setCurrentPhase('intro');
      setIsTextVisible(false);
    }

    return () => {
      stopEndCreditsMusic();
      clearTimeline();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const getPhaseBackground = () => {
    switch (currentPhase) {
      case 'intro':
        return 'bg-gradient-to-br from-newspaper-bg via-newspaper-bg to-newspaper-header/10';
      case 'segments':
        return 'bg-gradient-to-br from-newspaper-bg via-newspaper-header/5 to-newspaper-bg';
      case 'cameos':
        return 'bg-gradient-to-br from-newspaper-header/10 via-newspaper-bg to-newspaper-header/10';
      case 'outro':
        return 'bg-gradient-to-br from-newspaper-bg via-newspaper-bg to-newspaper-accent/10';
      default:
        return 'bg-newspaper-bg';
    }
  };

  const factionAccent = playerFaction === 'government' ? 'text-red-800' : 'text-blue-800';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      {/* Classified background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InJlZGFjdGVkIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI3JlZGFjdGVkKSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]"></div>
      </div>

      {/* Main credits display */}
      <div className={`relative w-full max-w-4xl mx-4 min-h-[600px] flex items-center justify-center transition-all duration-1000 ${getPhaseBackground()}`}>
        {/* Newsprint texture overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JheSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjgiIGhlaWdodD0iOCI+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMwMDAiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNncmF5KSIvPjwvc3ZnPg==')]"></div>

        {/* Credit text */}
        <div className={`text-center p-8 transform transition-all duration-700 ${
          isTextVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}>
          {/* Main title */}
          <h1 className="text-4xl md:text-6xl font-black font-serif text-gray-900 mb-4 tracking-tight leading-none">
            {currentText}
          </h1>
          
          {/* Accent line */}
          <div className="w-32 h-1 bg-red-600 mx-auto mb-6 transform scale-x-100 transition-transform duration-500"></div>
          
          {/* Subtitle */}
          <div className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto font-serif">
            {currentSubtext}
          </div>

          {/* Phase indicator */}
          <div className={`mt-8 text-sm font-mono tracking-wider uppercase ${factionAccent}`}>
            {currentPhase === 'intro' && '• CLASSIFIED TRANSMISSION •'}
            {currentPhase === 'segments' && '• PERSONNEL FILES •'}
            {currentPhase === 'cameos' && '• SPECIAL RECOGNITION •'}
            {currentPhase === 'outro' && '• END OF TRANSMISSION •'}
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute top-6 right-6 flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            className="bg-white/90 hover:bg-white text-gray-900 border-gray-300 shadow-lg font-mono text-sm"
            aria-label="Skip end credits and return to main menu"
          >
            Skip Credits
          </Button>
        </div>
      )}

      {/* Bottom controls */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={handleClose}
            className="bg-red-600 hover:bg-red-700 text-white font-mono text-sm shadow-lg"
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