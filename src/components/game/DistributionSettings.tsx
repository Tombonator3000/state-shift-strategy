import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useDistributionSettings } from '@/hooks/useDistributionSettings';

interface DistributionSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DistributionSettings = ({ isOpen, onClose }: DistributionSettingsProps) => {
  const {
    settings,
    isLoading,
    setRarityTarget,
    toggleTypeBalancing,
    setDuplicateLimit,
    setEarlySeedCount,
    resetToDefaults,
    getSimulation,
  } = useDistributionSettings();

  const [simulationData, setSimulationData] = React.useState<any>(null);

  const runSimulation = () => {
    const results = getSimulation(500);
    setSimulationData(results);
  };

  if (isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>MVP Card Distribution</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">
                Extension sets are disabled for this milestone. Adjust the sliders below to fine-tune the core deck mix.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Duplicate Limit: {settings.duplicateLimit}</Badge>
                <Badge variant="outline">Early Seeds: {settings.earlySeedCount}</Badge>
                <Badge variant="outline">Type Balancing: {settings.typeBalancing.enabled ? 'Enabled' : 'Disabled'}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Type Balancing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Prevent any type from exceeding {Math.round(settings.typeBalancing.maxTypeRatio * 100)}%</Label>
                  <p className="text-xs text-muted-foreground">Ensures ATTACK/MEDIA/ZONE stay close to the MVP ratio.</p>
                </div>
                <Switch checked={settings.typeBalancing.enabled} onCheckedChange={toggleTypeBalancing} />
              </div>
              <div className="space-y-2">
                <Label>Duplicate Limit: {settings.duplicateLimit}</Label>
                <Slider
                  value={[settings.duplicateLimit]}
                  onValueChange={([value]) => setDuplicateLimit(value)}
                  max={5}
                  min={1}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Early Seed Count: {settings.earlySeedCount}</Label>
                <Slider
                  value={[settings.earlySeedCount]}
                  onValueChange={([value]) => setEarlySeedCount(value)}
                  max={10}
                  min={0}
                  step={1}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rarity Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.rarityTargets).map(([rarity, target]) => (
                <div key={rarity} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="uppercase">{rarity}</Label>
                    <Badge variant="outline">{Math.round(target * 100)}%</Badge>
                  </div>
                  <Slider
                    value={[target]}
                    onValueChange={([value]) => setRarityTarget(rarity as keyof typeof settings.rarityTargets, value)}
                    max={1}
                    min={0}
                    step={0.01}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Simulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={runSimulation} variant="outline">Run Sample Deck</Button>
              {simulationData ? (
                <div className="grid gap-2 md:grid-cols-3 text-xs text-muted-foreground">
                  {simulationData.samples?.map((sample: any, index: number) => (
                    <div key={index} className="space-y-1 border border-border rounded p-2">
                      <div className="font-semibold text-foreground">Sample {index + 1}</div>
                      <div>Attack: {sample.typeCounts?.ATTACK ?? 0}</div>
                      <div>Media: {sample.typeCounts?.MEDIA ?? 0}</div>
                      <div>Zone: {sample.typeCounts?.ZONE ?? 0}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">Run the simulation to preview type distribution.</p>
              )}
              {simulationData?.rarityAverages && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Average Rarity Mix</div>
                  {Object.entries(simulationData.rarityAverages).map(([rarity, value]: any) => (
                    <div key={rarity}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="uppercase">{rarity}</span>
                        <span>{(value * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={value * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
