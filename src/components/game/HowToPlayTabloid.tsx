import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HowToPlayTabloidProps {
  onClose: () => void;
}

const HowToPlayTabloid = ({ onClose }: HowToPlayTabloidProps) => {
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

  // Parse markdown content to tabloid-style HTML
  const parseMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <div key={index} className="border-4 border-black bg-white p-4 mb-4 shadow-[4px_4px_0_#000]">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
              {line.substring(2)}
            </h1>
          </div>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <div key={index} className="border-2 border-black bg-white p-3 mt-4 mb-2 shadow-[2px_2px_0_#000] relative">
            <div className="absolute -top-1 -right-1 bg-red-600 text-white px-1 py-0.5 text-[8px] font-black uppercase">
              SECRET
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
              {line.substring(3)}
            </h2>
          </div>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-black uppercase tracking-tight mt-4 mb-2 font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <div key={index} className="ml-4 mb-1 text-sm">
            <span className="font-black">▪</span> {line.substring(2)}
          </div>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <div key={index} className="font-black uppercase mt-2 mb-1 text-sm tracking-wide">
            {line.substring(2, line.length - 2)}
          </div>
        );
      } else if (line.trim() !== '' && !line.startsWith('---')) {
        elements.push(
          <p key={index} className="text-sm mb-2 leading-relaxed">
            {line}
          </p>
        );
      } else if (line.startsWith('---')) {
        elements.push(
          <div key={index} className="my-4">
            <div className="h-2 bg-[#e9e9e9]"></div>
            <div className="h-2 bg-[#e9e9e9] w-3/4 my-1"></div>
            <div className="h-2 bg-[#e9e9e9] w-1/2"></div>
          </div>
        );
      }
    });

    return elements;
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] p-4 md:p-8">
      {/* Masthead */}
      <div className="border-4 border-black bg-white px-4 py-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-4xl md:text-5xl font-black uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
            LEAKED INSTRUCTIONS!
          </div>
          <Button 
            onClick={onClose}
            className="w-auto border-2 border-black bg-white text-black text-lg font-extrabold uppercase px-4 py-2 shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            CLOSE
          </Button>
        </div>
        <div className="mt-2 bg-black text-white font-black uppercase text-xs md:text-sm px-2 py-1 inline-block">
          CLASSIFIED OPERATIONS MANUAL EXPOSED!
        </div>
      </div>

      {/* Content area */}
      <div className="border-4 border-black bg-white shadow-[6px_6px_0_#000] relative">
        {/* Classified stamps */}
        <div className="absolute top-4 right-4 text-red-600 font-mono text-xs transform rotate-12 border-2 border-red-600 p-1 bg-white z-10">
          TOP SECRET
        </div>
        <div className="absolute bottom-4 left-4 text-red-600 font-mono text-xs transform -rotate-12 border-2 border-red-600 p-1 bg-white z-10">
          CLASSIFIED
        </div>

        <div className="relative">
          <ScrollArea 
            ref={scrollAreaRef} 
            className="h-[70vh] w-full"
          >
            <div 
              className="p-6"
              onScroll={handleScroll}
            >
              {rulesContent ? (
                <div className="space-y-2">
                  {parseMarkdown(rulesContent)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  Loading classified documents...
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Scroll controls */}
          {canScrollUp && (
            <Button
              onClick={() => scrollTo('up')}
              className="absolute top-4 right-16 bg-white border-2 border-black text-black hover:bg-gray-100 shadow-[2px_2px_0_#000]"
              size="sm"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
          
          {canScrollDown && (
            <Button
              onClick={() => scrollTo('down')}
              className="absolute bottom-4 right-16 bg-white border-2 border-black text-black hover:bg-gray-100 shadow-[2px_2px_0_#000]"
              size="sm"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom fake ads */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border-2 border-black bg-white p-2 text-xs uppercase tracking-wide text-center">
          <div className="font-black">SURVIVAL BUNKERS</div>
          <div>Nuclear-proof hideouts from $99,999</div>
        </div>
        <div className="border-2 border-black bg-white p-2 text-xs uppercase tracking-wide text-center">
          <div className="font-black">TRUTH SERUM</div>
          <div>Make anyone confess! FDA not approved</div>
        </div>
        <div className="border-2 border-black bg-white p-2 text-xs uppercase tracking-wide text-center">
          <div className="font-black">SPY GADGETS</div>
          <div>Hidden cameras, bugs & more!</div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayTabloid;