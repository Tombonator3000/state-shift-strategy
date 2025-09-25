import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MVP_RULES_SECTIONS,
  MVP_RULES_TITLE,
  MVP_COMBO_OVERVIEW,
} from '@/content/mvpRules';
import { Badge } from '@/components/ui/badge';

interface RulesReferenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RulesReferenceDrawer({ open, onOpenChange }: RulesReferenceDrawerProps) {
  const sections = MVP_RULES_SECTIONS;
  const combos = useMemo(() => MVP_COMBO_OVERVIEW, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-full w-full max-w-2xl flex-col border-l border-border bg-background/98 backdrop-blur">
        <SheetHeader className="space-y-2 border-b border-border/70 pb-4 text-left">
          <SheetTitle className="text-xl font-black uppercase tracking-[0.35em] text-foreground">
            {MVP_RULES_TITLE}
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed text-muted-foreground">
            Reference for the MVP rule set enforced by the in-game engine. The rules below sync with tutorial callouts and the automated tests we run for every build.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-8 px-1 py-6 pr-4">
            {sections.map(section => (
              <article key={section.title} id={section.title.toLowerCase().replace(/\s+/g, '-')}
                className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4 shadow-sm">
                <header className="space-y-1">
                  <h3 className="text-lg font-semibold uppercase tracking-[0.28em] text-foreground">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">{section.description}</p>
                  )}
                </header>
                {section.bullets && (
                  <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed text-foreground/90">
                    {section.bullets.map(entry => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            <section className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4 shadow-sm">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold uppercase tracking-[0.28em] text-foreground">Combo reference</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Combos award bonus Truth or IP when you hit sequencing or volume goals within a turn. Use this quick lookup to align your plays with the reward caps.
                </p>
              </header>
              <div className="space-y-4">
                {combos.map(group => (
                  <article key={group.category} className="space-y-2 rounded border border-border/50 bg-background/80 p-3">
                    <header className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group.category}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-[0.28em]">{group.combos.length} combos</Badge>
                    </header>
                    <ul className="space-y-2 text-sm">
                      {group.combos.map(combo => (
                        <li key={combo.id} className="rounded border border-border/40 bg-muted/40 p-2">
                          <p className="font-semibold">{combo.name}</p>
                          <p className="text-xs text-muted-foreground">{combo.description}</p>
                          <p className="text-xs font-mono text-foreground/80">
                            Reward: {combo.reward || 'Varies'}{combo.cap ? ` • Cap ${combo.cap}` : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default RulesReferenceDrawer;
