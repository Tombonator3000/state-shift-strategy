import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay = ({ onClose }: HowToPlayProps) => {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const [rulesContent, setRulesContent] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load rules from the markdown file
  useEffect(() => {
    const loadRules = async () => {
      try {
        const response = await fetch('/how-to-play-mvp.md');
        if (response.ok) {
          const content = await response.text();
          setRulesContent(content);
        } else {
          setRulesContent(fallbackRules);
        }
      } catch (error) {
        console.log('Could not load rules file, using fallback');
        setRulesContent(fallbackRules);
      }
    };
    
    loadRules();
  }, []);

  const fallbackRules = `# How to Play ShadowGov (MVP Rules)

## Objective
Win by pushing national Truth to 100 or by reducing your opponent's Influence Points (IP) to zero. Control states with pressure to accelerate your plan.

## Turn Structure
1. **Start of Turn** – Draw up to 5 cards and gain IP (5 + number of states you control).
2. **Main Phase** – Play up to three cards, targeting states when required.
3. **End Phase** – Resolve ongoing effects and pass the turn.

## Card Types
- **MEDIA** – Adjust Truth directly. Costs are fixed by rarity (Common 3, Uncommon 4, Rare 5, Legendary 6).
- **ATTACK** – Spend IP to damage your opponent's IP or force discards. Costs follow rarity (2/3/4/5).
- **ZONE** – Add pressure to specific states to claim control. Costs follow rarity (4/5/6/7).

## Effects
The MVP ruleset supports a focused effect set:
- \`truthDelta\` for MEDIA cards.
- \`ipDelta.opponent\` and optional \`discardOpponent\` for ATTACK cards.
- \`pressureDelta\` for ZONE cards.

Any legacy effect keys are ignored by the sanitiser during import.

## Deck Building Tips
- Keep a balance of card types so you can react to board state changes.
- ZONE cards win games when backed by MEDIA momentum.
- ATTACK cards are most efficient when the opponent banks IP for big plays.
`;

  const scrollTo = (direction: 'up' | 'down') => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      const scrollAmount = 300;
      const currentScroll = scrollElement.scrollTop;
      const newScroll = direction === 'down' 
        ? currentScroll + scrollAmount 
        : currentScroll - scrollAmount;
      
      scrollElement.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (event: any) => {
    const scrollElement = event.target;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 10);
  };

  // Parse markdown content to HTML-like structure
  const parseMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let currentSection = '';

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold text-newspaper-text mb-6 font-mono border-b-2 border-newspaper-text pb-2">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-bold text-newspaper-text mt-8 mb-4 font-mono">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-bold text-newspaper-text mt-6 mb-3 font-mono">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="text-newspaper-text ml-4 mb-2">
            • {line.substring(2)}
          </li>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <div key={index} className="font-bold text-newspaper-text mt-4 mb-2">
            {line.substring(2, line.length - 2)}
          </div>
        );
      } else if (line.trim() !== '' && !line.startsWith('---')) {
        elements.push(
          <p key={index} className="text-newspaper-text mb-3 leading-relaxed">
            {line}
          </p>
        );
      } else if (line.startsWith('---')) {
        elements.push(
          <div key={index} className="border-t border-newspaper-text/30 my-6"></div>
        );
      }
    });

    return elements;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] bg-newspaper-bg border-4 border-newspaper-text overflow-hidden">
        {/* Header with classified pattern */}
        <div className="relative bg-newspaper-text/10 p-6 border-b-2 border-newspaper-text">
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-newspaper-text h-4"
                style={{
                  width: `${Math.random() * 200 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 4 - 2}deg)`
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-newspaper-text font-mono">
                CLASSIFIED OPERATIONS MANUAL
              </h2>
              <p className="text-sm text-newspaper-text/70 font-mono mt-1">
                Security Clearance: EYES ONLY
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-newspaper-text text-newspaper-text hover:bg-newspaper-text/10"
            >
              CLOSE
            </Button>
          </div>

          {/* Classified stamps */}
          <div className="absolute top-2 right-20 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-1">
            TOP SECRET
          </div>
          <div className="absolute bottom-2 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-1">
            CLASSIFIED
          </div>
        </div>

        <div className="relative flex-1">
          <ScrollArea 
            ref={scrollAreaRef} 
            className="h-[calc(90vh-200px)] w-full"
          >
            <div 
              className="p-6 prose prose-sm max-w-none"
              onScroll={handleScroll}
            >
              {rulesContent ? (
                <div className="space-y-4">
                  {parseMarkdown(rulesContent)}
                </div>
              ) : (
                <div className="text-center text-newspaper-text/60 py-8">
                  Loading classified documents...
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Scroll controls */}
          {canScrollUp && (
            <Button
              onClick={() => scrollTo('up')}
              className="absolute top-4 right-4 bg-newspaper-text/20 hover:bg-newspaper-text/30 text-newspaper-text border border-newspaper-text"
              size="sm"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
          
          {canScrollDown && (
            <Button
              onClick={() => scrollTo('down')}
              className="absolute bottom-4 right-4 bg-newspaper-text/20 hover:bg-newspaper-text/30 text-newspaper-text border border-newspaper-text"
              size="sm"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="bg-newspaper-text/10 p-4 border-t-2 border-newspaper-text">
          <div className="text-center text-xs font-mono text-newspaper-text/60">
            <div>WARNING: Unauthorized access to this document is punishable by [REDACTED]</div>
            <div className="mt-1">Distribution of this information may result in spontaneous combustion</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HowToPlay;