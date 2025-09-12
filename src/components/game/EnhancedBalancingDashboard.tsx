import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCardBalancer } from '@/data/enhancedCardBalancing';
import { Download, RefreshCw } from 'lucide-react';

interface EnhancedBalancingDashboardProps {
  onClose: () => void;
}

const EnhancedBalancingDashboard = ({ onClose }: EnhancedBalancingDashboardProps) => {
  const [includeExtensions, setIncludeExtensions] = useState(true);
  
  const enhancedBalancer = useMemo(() => new EnhancedCardBalancer(includeExtensions), [includeExtensions]);
  const report = useMemo(() => enhancedBalancer.generateEnhancedReport(), [enhancedBalancer]);
  const simulation = useMemo(() => enhancedBalancer.runEnhancedSimulation(500), [enhancedBalancer]);

  const exportData = () => {
    const data = enhancedBalancer.exportFullAnalysis();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance-report-v21e-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] bg-gray-900 border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white font-mono">ENHANCED BALANCING v2.1E</h2>
            <div className="text-xs text-green-400 mt-1">Oppdatert for strukturerte card effects</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIncludeExtensions(!includeExtensions)}
              variant={includeExtensions ? "default" : "outline"}
              size="sm"
            >
              {includeExtensions ? "Med Extensions" : "Kun Base Cards"}
            </Button>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download size={16} className="mr-1" />
              Export Data
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">Lukk</Button>
          </div>
        </div>

        <div className="p-4 h-full overflow-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger value="overview">Oversikt</TabsTrigger>
              <TabsTrigger value="cards">Kort Analyse</TabsTrigger>
              <TabsTrigger value="simulation">Simulering</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Balance Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Balanserte kort:</span>
                      <Badge className="bg-green-600">{report.onCurve}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Underpriset:</span>
                      <Badge className="bg-red-600">{report.undercosted}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Overpriset:</span>
                      <Badge className="bg-yellow-600">{report.overcosted}</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Faction Fordeling</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Truth kort:</span>
                      <Badge className="bg-blue-600">{report.truthCards}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Government kort:</span>
                      <Badge className="bg-red-600">{report.governmentCards}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Misaligned:</span>
                      <Badge className="bg-orange-600">{report.misalignedCards}</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-2">Statistikk</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Totalt kort:</span>
                      <span className="text-white">{report.totalCards}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Snitt kostnad:</span>
                      <span className="text-white">{report.averageCost.toFixed(1)} IP</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Snitt utility:</span>
                      <span className="text-white">{report.averageUtility.toFixed(1)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="mt-4">
              <Card className="p-4 bg-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Kort som trenger oppmerksomhet</h3>
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                  {report.cardAnalysis
                    .filter(card => card.classification !== 'On Curve')
                    .sort((a, b) => b.severity === 'Severe' ? 1 : -1)
                    .slice(0, 20)
                    .map(card => (
                      <div key={card.cardId} className="p-3 bg-gray-700 rounded border border-gray-600">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-white">{card.name}</div>
                            <div className="text-sm text-gray-400">
                              {card.type} | {card.faction} | {card.rarity}
                            </div>
                            <div className="text-sm text-yellow-400">
                              Kostnad: {card.cost} IP | Utility: {card.totalUtility.toFixed(1)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={
                              card.classification === 'Undercosted' ? 'bg-red-600' :
                              card.classification === 'Overcosted' ? 'bg-yellow-600' : 'bg-green-600'
                            }>
                              {card.classification}
                            </Badge>
                            <Badge className={
                              card.severity === 'Severe' ? 'bg-red-600' :
                              card.severity === 'High' ? 'bg-orange-600' :
                              card.severity === 'Medium' ? 'bg-yellow-600' : 'bg-green-600'
                            }>
                              {card.severity}
                            </Badge>
                          </div>
                        </div>
                        {card.recommendation.cost && (
                          <div className="mt-2 text-sm text-blue-400">
                            Anbefaling: {card.recommendation.cost} IP ({card.recommendation.reasoning})
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="simulation" className="mt-4">
              <Card className="p-4 bg-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Simulering ({simulation.iterations} spill)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{simulation.truthWinRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Truth Seeker Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{simulation.governmentWinRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Government Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{simulation.drawRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Draws</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Gjennomsnittlig spillengde: {simulation.averageGameLength.toFixed(1)} runder
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedBalancingDashboard;