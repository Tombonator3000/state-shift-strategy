import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  MVP_COST_TABLE_ROWS,
  MVP_RULES_SECTIONS,
  MVP_RULES_TITLE,
} from '@/content/mvpRules';

interface HowToPlayTabloidProps {
  onClose: () => void;
}

const HowToPlayTabloid = ({ onClose }: HowToPlayTabloidProps) => {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const updateScrollButtons = useCallback(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 2);
  }, []);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) return;

    updateScrollButtons();
    viewport.addEventListener('scroll', updateScrollButtons);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updateScrollButtons())
      : null;

    resizeObserver?.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', updateScrollButtons);
      resizeObserver?.disconnect();
    };
  }, [updateScrollButtons]);

  const scrollTo = (direction: 'up' | 'down') => {
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) return;

    const scrollAmount = 300;
    const newScroll = direction === 'down'
      ? viewport.scrollTop + scrollAmount
      : viewport.scrollTop - scrollAmount;

    viewport.scrollTo({
      top: newScroll,
      behavior: 'smooth'
    });
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
            <div className="p-6 space-y-4">
              <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
                  {MVP_RULES_TITLE}
                </h1>
              </div>

              {MVP_RULES_SECTIONS.map((section) => (
                <section key={section.title} className="border-2 border-black bg-white p-3 shadow-[2px_2px_0_#000]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
                      {section.title}
                    </h2>
                    <div className="bg-red-600 text-white px-1 py-0.5 text-[8px] font-black uppercase">
                      VERIFIED
                    </div>
                  </div>
                  {section.description && (
                    <p className="mt-2 text-sm leading-relaxed">
                      {section.description}
                    </p>
                  )}
                  {section.bullets && (
                    <ul className="mt-2 space-y-2 text-sm">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <span className="font-black text-lg leading-none">▪</span>
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <section className="border-2 border-black bg-white p-3 shadow-[2px_2px_0_#000] space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black uppercase tracking-tight font-[Oswald,Impact,Arial-Black,system-ui,sans-serif]">
                    COST BENCHMARKS BY RARITY
                  </h2>
                  <div className="bg-yellow-400 text-black px-1 py-0.5 text-[8px] font-black uppercase">
                    AUDIT READY
                  </div>
                </div>
                <p className="text-sm leading-relaxed">
                  Every MVP card follows a fixed IP cost with predictable baseline effects. Spot anything outside this grid and raise the alarm.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="border border-black px-2 py-1 font-black uppercase">RARITY</th>
                        <th className="border border-black px-2 py-1 font-black uppercase">ATTACK</th>
                        <th className="border border-black px-2 py-1 font-black uppercase">MEDIA</th>
                        <th className="border border-black px-2 py-1 font-black uppercase">ZONE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MVP_COST_TABLE_ROWS.map((row) => (
                        <tr key={row.rarity} className="odd:bg-[#f5f5f5]">
                          <td className="border border-black px-2 py-1 font-black uppercase">
                            {row.rarity}
                          </td>
                          <td className="border border-black px-2 py-1">
                            <div className="font-black uppercase text-xs md:text-sm">{row.attack.effect}</div>
                            <div className="text-[10px] md:text-xs uppercase text-gray-600">Cost {row.attack.cost}</div>
                          </td>
                          <td className="border border-black px-2 py-1">
                            <div className="font-black uppercase text-xs md:text-sm">{row.media.effect}</div>
                            <div className="text-[10px] md:text-xs uppercase text-gray-600">Cost {row.media.cost}</div>
                          </td>
                          <td className="border border-black px-2 py-1">
                            <div className="font-black uppercase text-xs md:text-sm">{row.zone.effect}</div>
                            <div className="text-[10px] md:text-xs uppercase text-gray-600">Cost {row.zone.cost}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
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
