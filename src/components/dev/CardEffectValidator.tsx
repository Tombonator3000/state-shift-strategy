// Development Component for Card Effect Validation
// Shows validation results and allows testing of the effect system

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertTriangle, Bug, Zap } from 'lucide-react';

import { CARD_DATABASE } from '@/data/cardDatabase';
import { CardEffectValidator, CardTextGenerator } from '@/systems/CardTextGenerator';
import { CardEffectProcessor } from '@/systems/CardEffectProcessor';
import type { GameCard } from '@/rules/mvp';

const CardEffectValidatorPanel: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);
  
  // Run validation on all cards
  const validationSummary = useMemo(() => {
    return CardEffectValidator.validateCards(CARD_DATABASE as GameCard[]);
  }, []);

  // Test effect processing for a sample game state
  const testGameState = {
    truth: 65,
    ip: 25,
    aiIP: 20,
    hand: [],
    aiHand: [],
    controlledStates: ['CA', 'NY', 'TX'],
    aiControlledStates: ['FL', 'OH'],
    round: 3,
    turn: 6,
    faction: 'truth' as const
  };

  const selectedCard = selectedCardId ? CARD_DATABASE.find(c => c.id === selectedCardId) : null;

  // Process effects for selected card
  const effectResult = useMemo(() => {
    if (!selectedCard) return null;
    const processor = new CardEffectProcessor(testGameState, true);
    return processor.processCard(selectedCard as GameCard);
  }, [selectedCard]);

  const cardsToShow = showAllCards ? 
    CARD_DATABASE : 
    validationSummary.results.map(r => CARD_DATABASE.find(c => c.id === r.cardId)).filter(Boolean);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Bug className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Card Effect Validation System</h1>
        <Badge variant="outline">Development Tool</Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{validationSummary.validCards}</div>
                <div className="text-sm text-muted-foreground">Valid Cards</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{validationSummary.invalidCards}</div>
                <div className="text-sm text-muted-foreground">Invalid Cards</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{validationSummary.warningCards}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{validationSummary.totalCards}</div>
                <div className="text-sm text-muted-foreground">Total Cards</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="validation" className="w-full">
        <TabsList>
          <TabsTrigger value="validation">Validation Results</TabsTrigger>
          <TabsTrigger value="testing">Effect Testing</TabsTrigger>
          <TabsTrigger value="report">Full Report</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant={showAllCards ? "default" : "outline"}
              onClick={() => setShowAllCards(true)}
            >
              All Cards ({CARD_DATABASE.length})
            </Button>
            <Button 
              variant={!showAllCards ? "default" : "outline"}
              onClick={() => setShowAllCards(false)}
            >
              Problems Only ({validationSummary.results.length})
            </Button>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-2">
              {cardsToShow.map((card: any) => {
                const validation = CardEffectValidator.validateCard(card as GameCard);
                const hasErrors = validation.issues.some(i => i.severity === 'error');
                const hasWarnings = validation.issues.some(i => i.severity === 'warning');
                
                return (
                  <Card 
                    key={card.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedCardId === card.id ? 'ring-2 ring-primary' : ''
                    } ${hasErrors ? 'border-red-200' : hasWarnings ? 'border-yellow-200' : 'border-green-200'}`}
                    onClick={() => setSelectedCardId(card.id === selectedCardId ? null : card.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{card.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {card.id} • {card.type} • {card.rarity}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasErrors && <XCircle className="w-4 h-4 text-red-500" />}
                          {hasWarnings && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          {validation.isValid && !hasWarnings && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>
                      
                      {selectedCardId === card.id && validation.issues.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {validation.issues.map((issue, idx) => (
                            <Alert key={idx} className={issue.severity === 'error' ? 'border-red-200' : 'border-yellow-200'}>
                              <AlertDescription>
                                <div className="font-medium">{issue.type.replace('_', ' ').toUpperCase()}</div>
                                <div>{issue.message}</div>
                                {issue.expected && issue.found && (
                                  <div className="mt-2 text-xs">
                                    <div className="text-green-700">Expected: "{issue.expected}"</div>
                                    <div className="text-red-700">Found: "{issue.found}"</div>
                                  </div>
                                )}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Game State</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Truth: <Badge>{testGameState.truth}%</Badge></div>
                <div>Player IP: <Badge>{testGameState.ip}</Badge></div>
                <div>AI IP: <Badge>{testGameState.aiIP}</Badge></div>
                <div>Controlled States: <Badge>{testGameState.controlledStates.length}/50</Badge></div>
                <div>Round: <Badge>{testGameState.round}</Badge> Turn: <Badge>{testGameState.turn}</Badge></div>
                <div>Faction: <Badge>{testGameState.faction}</Badge></div>
              </CardContent>
            </Card>
            
            {selectedCard && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCard.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium">Current Text:</div>
                    <div className="text-sm bg-muted p-2 rounded">{selectedCard.text || 'No text'}</div>
                  </div>
                  
                  {selectedCard.effects && (
                    <div>
                      <div className="font-medium">Generated Text:</div>
                      <div className="text-sm bg-muted p-2 rounded">
                        {CardTextGenerator.generateRulesText(selectedCard.effects)}
                      </div>
                    </div>
                  )}
                  
                  {effectResult && (
                    <div>
                      <div className="font-medium">Effect Result:</div>
                      <div className="text-xs bg-muted p-2 rounded space-y-1">
                        {effectResult.truthDelta !== 0 && <div>Truth: {effectResult.truthDelta > 0 ? '+' : ''}{effectResult.truthDelta}%</div>}
                        {effectResult.ipDelta.self !== 0 && <div>Player IP: {effectResult.ipDelta.self > 0 ? '+' : ''}{effectResult.ipDelta.self}</div>}
                        {effectResult.ipDelta.opponent !== 0 && <div>AI IP: {effectResult.ipDelta.opponent > 0 ? '+' : ''}{effectResult.ipDelta.opponent}</div>}
                        {effectResult.cardsToDraw > 0 && <div>Draw: {effectResult.cardsToDraw} cards</div>}
                        {effectResult.pressureDelta > 0 && <div>Pressure: +{effectResult.pressureDelta}</div>}
                        {effectResult.damage > 0 && <div>Damage: {effectResult.damage}</div>}
                        {effectResult.appliedConditionals.length > 0 && (
                          <div>Conditionals: {effectResult.appliedConditionals.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {!selectedCard && (
            <Alert>
              <AlertDescription>
                Select a card from the validation tab to test its effects with the current game state.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Full Validation Report</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                {CardEffectValidator.createDevReport(CARD_DATABASE as GameCard[])}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CardEffectValidatorPanel;