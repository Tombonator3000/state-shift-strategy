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
        const response = await fetch('/ShadowGov-Rules-v2.1.md');
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

  const fallbackRules = `# SHADOW GOVERNMENT — Official Rules v2.1

## 1. Theme & Premise
Shadow Government (Deep State) vs Truth Seekers (Conspiracy opposition).  
- Government: suppress public awareness, control narrative.  
- Truth Seekers: expose secrets, raise paranoia to 90% Truth.  
Satirical, humorous style with **Weekly World News** flair.

## 2. Objective
Win immediately if ANY of the following is true:
- Truth ≥ 90% (Truth Seekers win)  
- Truth ≤ 10% (Government wins)  
- Control 10 states  
- Reach 200 IP (Influence Points)  
- Complete your Secret Agenda  

## 3. Components
- USA map with 50 states (interactive).  
- Cards (MEDIA, ZONE, ATTACK, DEFENSIVE).  
- IP (currency).  
- Truth meter (0–100%).  
- State Pressure counters (per player).  
- Defense values (per state).  
- Secret Agenda deck (hidden objectives).  
- Newspaper overlay (round summary with satire).  

## 4. Setup
1. Select Faction:  
   - **Government**: Truth starts 40%, +10 IP.  
   - **Truth Seekers**: Truth starts 60%, +10 Truth, +1 extra starting card.  
2. Draw 1 hidden Secret Agenda.  
3. Starting Hand: 5 cards (Truth Seekers get +1).  
4. Initial Truth: 50% baseline, adjusted by faction bonus.  

## 5. Turn Structure
Each round has two turns: player → opponent.

**Start of Turn**  
- Draw until hand = 5 cards (if possible).  
- Gain +5 base IP + IP from states owned.  

**Action Phase**  
- Play up to 3 cards, paying IP cost.  
- **ATTACK** triggers Defense reaction:  
  - Opponent may play 1 DEFENSIVE within 4s.  
  - If none, Attack resolves.  

**Resolution**  
- Apply card effects.  
- ZONE captures are immediate (Pressure ≥ Defense).  

**Newspaper Phase**  
- Satirical overlay with plays + 1 random event.  

**Victory Check**  
- If any win condition is met, game ends.  

## 6. Cards & Costs
Fixed card costs by type:  
- MEDIA = 7 IP  
- ZONE = 5 IP  
- ATTACK = 6 IP  
- DEFENSIVE = 3 IP  

Rarity distribution:  
- Common 70% (grey border)  
- Uncommon 20% (green)  
- Rare 8% (blue)  
- Legendary 2% (orange)  

## 7. Hotkeys
- **1–9**: Play cards 1-9 from hand
- **Space**: End Turn
- **ESC**: Options menu
- **S**: Quick Save
- **L**: Quick Load
- **H**: How to Play

## 8. Victory Conditions
- Truth ≥90% (Truth Seekers win).  
- Truth ≤10% (Government wins).  
- Control 10 states.  
- Reach 200 IP.  
- Complete Secret Agenda.  
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