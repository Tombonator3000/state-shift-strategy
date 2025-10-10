import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GameCard } from '@/rules/mvp';
import { getArticleForCard } from '@/data/cardArticles/articleDatabase';
import type { GameOverReport } from '@/types/finalEdition';

interface EnhancedFinalEditionProps {
  winner: 'player' | 'ai' | 'draw';
  mvpCard: GameCard | null;
  runnerUpCard: GameCard | null;
  extraExtraCombos: Array<{ headline: string; cards: string[] }>;
  stateResults: Array<{ name: string; owner: 'player' | 'ai' | 'neutral' }>;
  finalTruth: number;
  finalPlayerIP: number;
  finalAiIP: number;
  recurringEpilogues?: GameOverReport['recurringCharacterEpilogues'];
}

/**
 * Enhanced final edition newspaper with multiple sections
 */
export function EnhancedFinalEdition({
  winner,
  mvpCard,
  runnerUpCard,
  extraExtraCombos,
  stateResults,
  finalTruth,
  finalPlayerIP,
  finalAiIP,
  recurringEpilogues = [],
}: EnhancedFinalEditionProps) {
  const mvpArticle = mvpCard ? getArticleForCard(mvpCard.id) : null;
  const runnerUpArticle = runnerUpCard ? getArticleForCard(runnerUpCard.id) : null;

  const playerStates = stateResults.filter(s => s.owner === 'player').length;
  const aiStates = stateResults.filter(s => s.owner === 'ai').length;
  const outcomeBadge =
    winner === 'player'
      ? '🏆 Truth Prevails'
      : winner === 'ai'
        ? '🔒 Secrets Secured'
        : '⚖️ Narrative Deadlock';

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-6xl mx-auto">
        <ScrollArea className="h-[90vh]">
          <div className="p-8 space-y-8">
            {/* Masthead */}
            <div className="border-b-4 border-double border-border pb-4">
              <h1 className="text-6xl font-bold font-serif text-center mb-2">
                THE PARANOID TIMES
              </h1>
              <p className="text-center text-sm text-muted-foreground uppercase tracking-widest">
                Final Edition • Truth Revealed • Est. 1947
              </p>
              <div className="text-center mt-2">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {outcomeBadge}
                </span>
              </div>
            </div>

            {/* Main Article (MVP) */}
            {mvpArticle && (
              <div className="border-4 border-primary p-6 space-y-3">
                <h2 className="text-4xl font-bold font-serif leading-tight">
                  {mvpArticle.headline}
                </h2>
                <p className="text-xl italic text-muted-foreground border-l-4 border-primary pl-3">
                  {mvpArticle.subhead}
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {mvpArticle.byline}
                </p>
                <div className="prose max-w-none space-y-2">
                  {mvpArticle.body.split('\n\n').map((para, idx) => (
                    <p key={idx} className="text-justify leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Runner-Up Article */}
              <div className="md:col-span-2 space-y-4">
                {runnerUpArticle && (
                  <Card className="p-4 border-2">
                    <h3 className="text-2xl font-bold font-serif mb-2">
                      {runnerUpArticle.headline}
                    </h3>
                    <p className="text-sm italic text-muted-foreground mb-2">
                      {runnerUpArticle.subhead}
                    </p>
                    <div className="text-sm space-y-2">
                      {runnerUpArticle.body.split('\n\n').slice(0, 2).map((para, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {para}
                        </p>
                      ))}
                      <p className="text-xs text-muted-foreground italic">
                        [Continued on page 12...]
                      </p>
                    </div>
                  </Card>
                )}

                {/* State-by-State Results */}
                <Card className="p-4 border-2">
                  <h3 className="text-xl font-bold font-serif mb-3">
                    State-by-State Results
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold">Truth Faction Control:</p>
                      <p className="text-2xl font-bold text-primary">{playerStates}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold">Government Control:</p>
                      <p className="text-2xl font-bold text-destructive">{aiStates}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t space-y-1">
                    <p className="text-xs">
                      <span className="font-semibold">Final Truth Meter:</span> {finalTruth}%
                    </p>
                    <p className="text-xs">
                      <span className="font-semibold">Truth IP:</span> {finalPlayerIP}
                    </p>
                    <p className="text-xs">
                      <span className="font-semibold">Government IP:</span> {finalAiIP}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Extra Extra Combos */}
                {extraExtraCombos.length > 0 && (
                  <Card className="p-4 bg-muted border-2">
                    <h3 className="text-lg font-bold font-serif mb-3">
                      EXTRA! EXTRA!
                    </h3>
                    <div className="space-y-2">
                      {extraExtraCombos.map((combo, idx) => (
                        <div key={idx} className="text-xs border-b border-border pb-2">
                          <p className="font-bold">{combo.headline}</p>
                          <p className="text-muted-foreground text-[10px]">
                            {combo.cards.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {recurringEpilogues.length > 0 && (
                  <Card className="p-4 border-2">
                    <h3 className="text-lg font-bold font-serif mb-3">Where Are They Now?</h3>
                    <div className="space-y-3 text-xs leading-snug">
                      {recurringEpilogues.map(epilogue => (
                        <div key={epilogue.id} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                          <p className="text-[10px] uppercase text-muted-foreground">
                            Stage {epilogue.stage + 1} • {epilogue.appearances} appearances
                          </p>
                          <p className="font-bold">
                            {epilogue.name} — {epilogue.title}
                          </p>
                          <p className="italic text-muted-foreground">{epilogue.summary}</p>
                          <p className="mt-1 text-justify">{epilogue.epilogue}</p>
                          {epilogue.milestones.length > 0 && (
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              Milestones: {epilogue.milestones.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Classified Ads */}
                <Card className="p-4 bg-muted/50 border-2">
                  <h3 className="text-sm font-bold font-serif mb-3 uppercase">
                    Classified Ads
                  </h3>
                  <div className="space-y-2 text-[10px]">
                    {winner === 'player' ? (
                      <>
                        <p className="border-b border-border pb-1">
                          <span className="font-bold">FOIA REQUESTS:</span> Professional document hunter available. No redaction too heavy.
                        </p>
                        <p className="border-b border-border pb-1">
                          <span className="font-bold">TRUTH SEEKERS UNITE:</span> Weekly meetings at undisclosed location. Bring tinfoil.
                        </p>
                        <p>
                          <span className="font-bold">CRYPTID TOURS:</span> See where the sightings happened. Insurance waiver required.
                        </p>
                      </>
                    ) : winner === 'ai' ? (
                      <>
                        <p className="border-b border-border pb-1">
                          <span className="font-bold">EMPLOYMENT:</span> Plausible deniability specialists needed. Clearance required.
                        </p>
                        <p className="border-b border-border pb-1">
                          <span className="font-bold">SHREDDING SERVICES:</span> Industrial capacity. Ask no questions. Guaranteed results.
                        </p>
                        <p>
                          <span className="font-bold">WEATHER BALLOONS:</span> Bulk discount available. Various cover story applications.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="border-b border-border pb-1">
                          <span className="font-bold">MEDIATORS WANTED:</span> Seeking neutral parties to translate competing press releases.
                        </p>
                        <p className="border-b border-border pb-1">
                          <span className="font-bold">FACT-CHECK CO-OP:</span> Volunteers needed to untangle dueling narratives. Coffee provided.
                        </p>
                        <p>
                          <span className="font-bold">PUBLIC FORUM:</span> Town hall on indefinite hiatus. Bring your own red string.
                        </p>
                      </>
                    )}
                  </div>
                </Card>

                {/* Letters to the Editor */}
                <Card className="p-4 bg-muted/30 border-2">
                  <h3 className="text-sm font-bold font-serif mb-3 uppercase">
                    Letters to the Editor
                  </h3>
                  <div className="space-y-2 text-[10px] italic">
                    <p>
                      "Finally, someone is asking the right questions!" - D.H., Memphis
                    </p>
                    <p>
                      "This is all ridiculous. Please cancel my subscription." - G.B., Area 51
                    </p>
                    <p>
                      "My cousin's friend saw it too!" - Anonymous, Pacific Northwest
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
