import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  MVP_COMBO_OVERVIEW,
  MVP_COST_TABLE_ROWS,
  MVP_RULES_SECTIONS,
  MVP_RULES_TITLE,
  MVP_SYNERGY_GROUPS,
} from '@/content/mvpRules';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay = ({ onClose }: HowToPlayProps) => {
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
            <div className="p-6 prose prose-sm max-w-none space-y-6">
              <h1 className="text-3xl font-bold text-newspaper-text mb-2 font-mono border-b-2 border-newspaper-text pb-2">
                {MVP_RULES_TITLE}
              </h1>

              {MVP_RULES_SECTIONS.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="text-2xl font-bold text-newspaper-text font-mono">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-newspaper-text/80 leading-relaxed">
                      {section.description}
                    </p>
                  )}
                  {section.bullets && (
                    <ul className="space-y-2 text-newspaper-text">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="pl-4 relative">
                          <span className="absolute left-0 text-newspaper-text/70">•</span>
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-newspaper-text font-mono">
                  Cost Benchmarks by Rarity
                </h2>
                <p className="text-newspaper-text/80 leading-relaxed">
                  MVP cards follow fixed IP costs and baseline effects. Use this table to spot curve breakers before they reach the battlefield.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-newspaper-text/10">
                        <th className="border border-newspaper-text/30 px-3 py-2 font-mono">Rarity</th>
                        <th className="border border-newspaper-text/30 px-3 py-2 font-mono">ATTACK</th>
                        <th className="border border-newspaper-text/30 px-3 py-2 font-mono">MEDIA</th>
                        <th className="border border-newspaper-text/30 px-3 py-2 font-mono">ZONE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MVP_COST_TABLE_ROWS.map((row) => (
                        <tr key={row.rarity}>
                          <td className="border border-newspaper-text/30 px-3 py-2 font-semibold uppercase">
                            {row.rarity}
                          </td>
                          <td className="border border-newspaper-text/30 px-3 py-2">
                            <div className="font-semibold">{row.attack.effect}</div>
                            <div className="text-xs text-newspaper-text/70">Cost {row.attack.cost}</div>
                          </td>
                          <td className="border border-newspaper-text/30 px-3 py-2">
                            <div className="font-semibold">{row.media.effect}</div>
                            <div className="text-xs text-newspaper-text/70">Cost {row.media.cost}</div>
                          </td>
                          <td className="border border-newspaper-text/30 px-3 py-2">
                            <div className="font-semibold">{row.zone.effect}</div>
                            <div className="text-xs text-newspaper-text/70">Cost {row.zone.cost}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-newspaper-text font-mono">
                  Combo Catalogue
                </h2>
                <p className="text-newspaper-text/80 leading-relaxed">
                  Combos award extra resources when you meet their turn-based requirements. Each entry below shows the reward payload and any caps that limit repeated payouts. Mix and match to build the turn that fits your strategy.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {MVP_COMBO_OVERVIEW.map(group => (
                    <div
                      key={group.category}
                      className="border border-newspaper-text/30 bg-newspaper-text/5 p-3 rounded"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-newspaper-text font-mono uppercase">
                          {group.category} Combos
                        </h3>
                        <span className="text-xs font-semibold text-newspaper-text/70">
                          {group.combos.length} listed
                        </span>
                      </div>
                      <div className="space-y-3 text-sm">
                        {group.combos.map(combo => {
                          const rewardText = combo.reward.replace(/[()]/g, '').trim();
                          return (
                            <div key={combo.id} className="border-t border-dashed border-newspaper-text/30 pt-2 first:border-t-0 first:pt-0">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <span className="font-semibold text-newspaper-text">{combo.name}</span>
                                {rewardText && (
                                  <span className="text-xs font-mono text-newspaper-text/70">
                                    Reward: {rewardText}
                                  </span>
                                )}
                              </div>
                              <p className="text-newspaper-text/80 text-xs leading-relaxed mt-1">
                                {combo.description}
                              </p>
                              {(combo.cap || combo.fxText) && (
                                <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-newspaper-text/60">
                                  {combo.cap ? <span>Cap: {combo.cap}</span> : null}
                                  {combo.fxText ? <span className="italic">FX: {combo.fxText}</span> : null}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-2xl font-bold text-newspaper-text font-mono">
                  Territorial Synergies
                </h2>
                <p className="text-newspaper-text/80 leading-relaxed">
                  Control every state in a listed combination to activate its passive bonus. IP gains stack with normal income and each bonus effect persists as long as you keep the entire set.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {MVP_SYNERGY_GROUPS.map(group => (
                    <div
                      key={group.id}
                      className="border border-newspaper-text/30 bg-newspaper-text/5 p-3 rounded space-y-3"
                    >
                      <div>
                        <div className="text-lg font-semibold text-newspaper-text">
                          {group.title}
                        </div>
                        <p className="text-xs text-newspaper-text/70 mt-1 leading-relaxed">
                          {group.description}
                        </p>
                      </div>
                      <div className="space-y-3">
                        {group.combos.map(combo => (
                          <div key={combo.id} className="border-t border-dashed border-newspaper-text/30 pt-2 first:border-t-0 first:pt-0">
                            <div className="font-semibold text-newspaper-text text-sm">
                              {combo.name}
                            </div>
                            <div className="text-xs text-newspaper-text/70">
                              States: {combo.requiredStates.join(', ')}
                            </div>
                            <div className="text-xs text-newspaper-text/80">
                              Reward: +{combo.bonusIp} IP{combo.bonusEffect ? ` · ${combo.bonusEffect}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
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
