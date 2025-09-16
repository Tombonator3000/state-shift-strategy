// Quick test component for validating card effects in development
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CardEffectValidator, CardTextGenerator } from '@/systems/CardTextGenerator';
import { CardEffectProcessor } from '@/systems/CardEffectProcessor';
import { CARD_DATABASE } from '@/data/cardDatabase';
import type { Card as CardType } from '@/types/cardEffects';

const EffectTestPanel: React.FC = () => {
  const [cardId, setCardId] = useState('TS-001');
  const [showValidation, setShowValidation] = useState(false);
  
  const testCard = CARD_DATABASE.find(c => c.id === cardId);
  const gameState = {
    truth: 65,
    ip: 25,
    aiIP: 20,
    hand: [],
    aiHand: [],
    controlledStates: ['CA', 'NY'],
    aiControlledStates: ['FL'],
    round: 2,
    turn: 4,
    faction: 'truth' as const
  };

  if (!testCard) return null;

  const processor = new CardEffectProcessor(gameState, true);
  const result = processor.processCard(testCard as CardType);
  const validation = CardEffectValidator.validateCard(testCard as CardType);
  const generatedText = testCard.effects ? CardTextGenerator.generateRulesText(testCard.effects) : 'No effects';

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-background border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Effect Test</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowValidation(!showValidation)}
        >
          {showValidation ? 'Hide' : 'Validate'}
        </Button>
      </div>
      
      <div className="space-y-3">
        <Input
          placeholder="Card ID (e.g., TS-001)"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
        />
        
        <Card className="text-xs">
          <CardHeader className="p-2">
            <CardTitle className="text-sm">{testCard.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-2">
            <div>
              <Badge variant="outline">{testCard.type}</Badge>
              <Badge variant="secondary" className="ml-1">{testCard.cost} IP</Badge>
            </div>
            
            <div>
              <div className="font-medium">Current Text:</div>
              <div className="bg-muted p-1 rounded text-xs">{testCard.text || 'No text'}</div>
            </div>
            
            <div>
              <div className="font-medium">Generated Text:</div>
              <div className="bg-muted p-1 rounded text-xs">{generatedText}</div>
            </div>
            
            <div>
              <div className="font-medium">Effect Result:</div>
              <div className="bg-muted p-1 rounded text-xs">
                {result.truthDelta !== 0 && <div>Truth: {result.truthDelta > 0 ? '+' : ''}{result.truthDelta}%</div>}
                {result.ipDelta.self !== 0 && <div>IP: {result.ipDelta.self > 0 ? '+' : ''}{result.ipDelta.self}</div>}
                {result.cardsToDraw > 0 && <div>Draw: {result.cardsToDraw}</div>}
                {result.pressureDelta > 0 && <div>Pressure: +{result.pressureDelta}</div>}
                {result.damage > 0 && <div>Damage: {result.damage}</div>}
              </div>
            </div>
            
            {showValidation && (
              <div>
                <div className="font-medium">Validation:</div>
                <div className="space-y-1">
                  {validation.isValid ? (
                    <Badge variant="default" className="text-xs">✅ Valid</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">❌ Invalid</Badge>
                  )}
                  {validation.issues.map((issue, idx) => (
                    <div key={idx} className="text-xs text-red-600">
                      {issue.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EffectTestPanel;