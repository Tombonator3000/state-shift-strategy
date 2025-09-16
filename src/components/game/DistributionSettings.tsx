import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useDistributionSettings } from '@/hooks/useDistributionSettings';
import { extensionManager } from '@/data/extensionSystem';
import type { DistributionMode } from '@/data/weightedCardDistribution';

interface DistributionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DistributionSettings = ({ isOpen, onClose }: DistributionSettingsProps) => {
  const {
    settings,
    isLoading,
    setMode,
    setSetWeight,
    setRarityTarget,
    toggleTypeBalancing,
    setDuplicateLimit,
    resetToDefaults,
    getSimulation
  } = useDistributionSettings();

  const [simulationData, setSimulationData] = useState<any>(null);

  // Get available sets
  const availableSets = React.useMemo(() => {
    const sets = [{ id: 'core', name: 'Core Set', enabled: true }];
    const enabledExtensions = extensionManager.getEnabledExtensions();
    
    enabledExtensions.forEach(ext => {
      sets.push({
        id: ext.id,
        name: ext.name,
        enabled: true
      });
    });
    
    return sets;
  }, []);

  // Run simulation
  const runSimulation = () => {
    const results = getSimulation(1000);
    setSimulationData(results);
  };

  // Get mode display name
  const getModeDisplayName = (mode: DistributionMode) => {
    switch (mode) {
      case 'core-only': return 'Core Only';
      case 'expansion-only': return 'Expansion Only';
      case 'balanced': return 'Balanced Mix';
      case 'custom': return 'Custom Mix';
      default: return mode;
    }
  };

  if (isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Card Distribution Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="mode" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mode">Mode</TabsTrigger>
            <TabsTrigger value="weights">Weights</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="mode" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(['core-only', 'expansion-only', 'balanced', 'custom'] as DistributionMode[]).map(mode => (
                  <div key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={mode}
                      checked={settings.mode === mode}
                      onChange={() => setMode(mode)}
                      className="w-4 h-4"
                    />
                    <label htmlFor={mode} className="flex-1 cursor-pointer">
                      <div className="font-medium">{getModeDisplayName(mode)}</div>
                      <div className="text-sm text-muted-foreground">
                        {mode === 'core-only' && 'Only use core cards'}
                        {mode === 'expansion-only' && 'Only use expansion cards'}
                        {mode === 'balanced' && 'Core 2:1 ratio with expansions'}
                        {mode === 'custom' && 'Custom weights for each set'}
                      </div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Set Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableSets.map(set => (
                  <div key={set.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{set.name}</Label>
                      <Badge variant="outline">
                        {(settings.setWeights[set.id] || 0).toFixed(1)}
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.setWeights[set.id] || 0]}
                      onValueChange={([value]) => setSetWeight(set.id, value)}
                      max={3}
                      min={0}
                      step={0.1}
                      disabled={settings.mode !== 'custom'}
                      className="w-full"
                    />
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">
                  {settings.mode !== 'custom' && 'Switch to Custom Mode to adjust weights manually'}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Balance Safeguards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Type Balancing</Label>
                    <div className="text-sm text-muted-foreground">
                      Prevent any single card type from dominating
                    </div>
                  </div>
                  <Switch
                    checked={settings.typeBalancing.enabled}
                    onCheckedChange={toggleTypeBalancing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duplicate Limit: {settings.duplicateLimit}</Label>
                  <Slider
                    value={[settings.duplicateLimit]}
                    onValueChange={([value]) => setDuplicateLimit(value)}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Rarity Distribution</h4>
                  {Object.entries(settings.rarityTargets).map(([rarity, target]) => (
                    <div key={rarity} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="capitalize">{rarity}</Label>
                        <Badge variant="outline">{(target * 100).toFixed(0)}%</Badge>
                      </div>
                      <Slider
                        value={[target]}
                        onValueChange={([value]) => setRarityTarget(rarity as any, value)}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runSimulation} className="w-full">
                  Simulate 1000 Decks
                </Button>

                {simulationData && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Set Distribution</h4>
                      {Array.from(simulationData.setDistribution.entries()).map(([setId, count]) => {
                        const percentage = ((count / 40000) * 100).toFixed(1);
                        const setName = availableSets.find(s => s.id === setId)?.name || setId;
                        return (
                          <div key={setId} className="flex items-center justify-between">
                            <span>{setName}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{percentage}%</span>
                              <Progress value={parseFloat(percentage)} className="w-20" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Rarity Distribution</h4>
                      {Array.from(simulationData.rarityDistribution.entries()).map(([rarity, count]) => {
                        const percentage = ((count / 40000) * 100).toFixed(1);
                        return (
                          <div key={rarity} className="flex items-center justify-between">
                            <span className="capitalize">{rarity}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{percentage}%</span>
                              <Progress value={parseFloat(percentage)} className="w-20" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};