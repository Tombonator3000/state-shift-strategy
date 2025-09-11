import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAudio } from '@/hooks/useAudio';

interface EndCreditsProps {
  isVisible: boolean;
  playerFaction: 'truth' | 'government';
  onClose: () => void;
}

const EndCredits = ({ isVisible, playerFaction, onClose }: EndCreditsProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoExit, setAutoExit] = useState(false);
  const audio = useAudio();

  const credits = [
    {
      title: "SHADOW GOVERNMENT",
      subtitle: "A Classified Production",
      content: "\"Remember: They're Watching, But So Are We\""
    },
    {
      title: "EXECUTIVE PRODUCER",
      subtitle: "Tom Husby",
      content: "Chief Bat Boy Negotiator & Temporal Leak Janitor (Acting)"
    },
    {
      title: "CREATIVE DIRECTOR",
      subtitle: "Tom Husby",
      content: "Head of Lizard Hospitality & Interdimensional Coffee Service"
    },
    {
      title: "LEAD CONSPIRACY THEORIST",
      subtitle: "Tom Husby",
      content: "Senior Tinfoil Hat Designer & Moon Base Operations Manager"
    },
    {
      title: "AUDIO ENGINEER",
      subtitle: "Tom Husby",
      content: "Frequency Manipulator & Subliminal Message Consultant"
    },
    {
      title: "QUALITY ASSURANCE",
      subtitle: "Tom Husby",
      content: "Bug Whisperer & Reality Debugging Specialist"
    },
    {
      title: "SPECIAL THANKS",
      subtitle: "The Usual Suspects",
      content: [
        "Three grandmas on shortwave radio",
        "Anonymous leak platform contributors", 
        "The Bat Boy Focus Group",
        "Five committees that don't exist",
        "Emergency horoscope consultants"
      ].join(" • ")
    },
    {
      title: "FACTION ADVISORS",
      subtitle: playerFaction === 'government' 
        ? "Department of Plausible Deniability" 
        : "Underground Truth Network",
      content: playerFaction === 'government'
        ? "\"If you can read this, you have proper clearance\""
        : "\"The truth is out there... we just made it easier to find\""
    },
    {
      title: "DISCLAIMER",
      subtitle: "Legal Department of Shadows",
      content: "Any resemblance to actual conspiracies, living or dead, is purely intentional. No lizard people were harmed in the making of this game."
    },
    {
      title: "THE END",
      subtitle: "Or Is It?",
      content: "Stay vigilant. Stay paranoid. The game never really ends."
    }
  ];

  useEffect(() => {
    if (isVisible) {
      // Start credits music after first user interaction
      setTimeout(() => {
        audio.playSFX('typewriter');
      }, 500);

      const slideInterval = setInterval(() => {
        setCurrentSlide(prev => {
          if (prev >= credits.length - 1) {
            setAutoExit(true);
            return prev;
          }
          return prev + 1;
        });
      }, 4000);

      // Auto-exit after 90 seconds
      const exitTimeout = setTimeout(() => {
        onClose();
      }, 90000);

      return () => {
        clearInterval(slideInterval);
        clearTimeout(exitTimeout);
      };
    }
  }, [isVisible, audio, onClose]);

  useEffect(() => {
    if (autoExit) {
      const exitTimeout = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(exitTimeout);
    }
  }, [autoExit, onClose]);

  if (!isVisible) return null;

  const currentCredit = credits[currentSlide];
  const factionColors = playerFaction === 'government' 
    ? 'border-government-blue bg-government-blue/5' 
    : 'border-truth-red bg-truth-red/5';

  return (
    <div className="fixed inset-0 bg-newspaper-bg flex items-center justify-center z-50">
      {/* Newsprint background pattern */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JheSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjgiIGhlaWdodD0iOCI+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMwMDAiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNncmF5KSIvPjwvc3ZnPg==')]"></div>

      <Card className={`bg-newspaper-bg/95 backdrop-blur-sm border-4 ${factionColors} max-w-4xl mx-4 p-0 transform animate-fade-in shadow-2xl`}>
        <div className="p-8 text-center min-h-[400px] flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-black font-serif text-newspaper-text mb-2 tracking-tight">
              {currentCredit.title}
            </h1>
            <div className="w-24 h-1 bg-newspaper-accent mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-newspaper-text/80 mb-6">
              {currentCredit.subtitle}
            </h2>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-lg text-newspaper-text/90 leading-relaxed max-w-2xl">
              {currentCredit.content}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {credits.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? 'bg-newspaper-accent' : 'bg-newspaper-text/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Control buttons */}
        <div className="border-t-2 border-newspaper-border bg-newspaper-header/30 p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="font-mono text-sm"
          >
            Previous
          </Button>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentSlide(Math.min(credits.length - 1, currentSlide + 1))}
              disabled={currentSlide === credits.length - 1}
              className="font-mono text-sm"
            >
              Next
            </Button>
            
            <Button
              onClick={onClose}
              className="font-mono text-sm bg-newspaper-accent hover:bg-newspaper-accent/80 text-white"
            >
              Skip Credits
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="font-mono text-sm"
            >
              Return to Main Menu
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EndCredits;