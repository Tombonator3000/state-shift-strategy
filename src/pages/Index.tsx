import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import USAMap from "@/components/game/USAMap";
import GameHand from "@/components/game/GameHand";
import CardCollection from "@/components/game/CardCollection";
import Options from "@/components/game/Options";
import { useGameState } from "@/hooks/useGameState";
import { toast } from "@/components/ui/sonner";
import type { Card as ShowcaseCard } from "@/types/public";

const Index = () => {
  const { gameState, initGame, playCard, endTurn, executeAITurn, showNewspaper, newspaperHeadline, closeNewspaper, mapPulse } = useGameState();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [showCollection, setShowCollection] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const playerHand = useMemo(() => gameState.playerHand ?? [], [gameState.playerHand]);
  const aiHand = useMemo(() => gameState.aiHand ?? [], [gameState.aiHand]);

  const handlePlayCard = (index: number) => {
    setSelectedCardIndex(index);
    const event = playCard(index);
    if (event.toast) {
      toast(event.toast);
    }
    if (event.newspaper) {
      toast("📰 Newspaper updated");
    }
  };

  const handleEndTurn = () => {
    const event = endTurn();
    if (event.toast) {
      toast(event.toast);
    }
  };

  const handleAITurn = () => {
    const event = executeAITurn();
    if (event.toast) {
      toast(event.toast);
    }
  };

  const selectedCard: ShowcaseCard | null =
    selectedCardIndex !== null ? playerHand[selectedCardIndex] ?? null : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ShadowGov Showcase</h1>
            <p className="text-sm text-slate-300">UI-only mode – explore the interface without gameplay rules.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={initGame} variant="default">
              Start Showcase
            </Button>
            <Button onClick={handleEndTurn} variant="secondary">
              End Round
            </Button>
            <Button onClick={handleAITurn} variant="outline">
              Trigger AI Highlight
            </Button>
            <Button onClick={() => setShowCollection(true)} variant="ghost">
              Card Collection
            </Button>
            <Button onClick={() => setShowOptions(true)} variant="ghost">
              Options
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <Card className="bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>USA Control Map</CardTitle>
            </CardHeader>
            <CardContent>
              <USAMap
                states={gameState.states}
                onStateClick={(stateId) => toast(`State focus: ${stateId}`)}
                selectedCard={selectedCard?.id ?? null}
                audio={undefined}
              />
              {mapPulse && (
                <div className="mt-4 text-sm text-emerald-300">
                  Map pulse active over {mapPulse}. States fill gradually as you showcase cards.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-black/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Your Hand</CardTitle>
              </CardHeader>
              <CardContent>
                <GameHand
                  cards={playerHand}
                  onPlayCard={(cardId) => {
                    const index = playerHand.findIndex(card => card.id === cardId);
                    if (index >= 0) {
                      handlePlayCard(index);
                    }
                  }}
                  disabled={false}
                />
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle>AI Showcase Hand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiHand.length === 0 && (
                    <p className="text-sm text-slate-300">AI deck is idling for now.</p>
                  )}
                  {aiHand.map(card => (
                    <div key={card.id} className="rounded border border-white/10 bg-white/5 p-3">
                      <div className="text-sm font-semibold">{card.name}</div>
                      <div className="text-xs text-slate-300">{card.faction.toUpperCase()} · {card.type}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <aside className="space-y-6">
          <Card className="bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Round Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Round</span>
                <span className="font-mono text-lg">{gameState.round}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Truth Meter</span>
                <span className="font-mono">{gameState.truth}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Influence Points</span>
                <span className="font-mono">{gameState.ip}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>AI Momentum</span>
                <span className="font-mono">{gameState.aiIP}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Deck Size</span>
                <span className="font-mono">{gameState.deck.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Latest Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {gameState.log.length === 0 && (
                  <p className="text-slate-300">Play cards to populate the activity log.</p>
                )}
                {gameState.log.slice(-8).map((entry, index) => (
                  <div key={`${entry}-${index}`} className="rounded border border-white/5 bg-white/5 px-3 py-2">
                    {entry}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>

      {showNewspaper && newspaperHeadline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <Card className="max-w-2xl bg-newspaper-bg text-newspaper-text">
            <CardHeader>
              <CardTitle className="text-center text-2xl">EXTRA EDITION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg font-semibold">{newspaperHeadline}</p>
              <p className="text-sm text-newspaper-text/80">
                Showcase mode generates playful headlines whenever you highlight a card or end a round.
              </p>
              <Button onClick={closeNewspaper} className="w-full">
                Close Newspaper
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <CardCollection open={showCollection} onOpenChange={setShowCollection} />
      {showOptions && <Options onClose={() => setShowOptions(false)} />}
    </div>
  );
};

export default Index;
