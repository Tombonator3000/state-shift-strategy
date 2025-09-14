import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCardBalancer } from '@/data/enhancedCardBalancing';
import { Download, RefreshCw, Image, FileText, BarChart3 } from 'lucide-react';
import { exportEffectsFiles } from '@/balance/exportEffects';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface EnhancedBalancingDashboardProps {
  onClose: () => void;
}

const EnhancedBalancingDashboard = ({ onClose }: EnhancedBalancingDashboardProps) => {
  const [includeExtensions, setIncludeExtensions] = useState(true);
  
  const enhancedBalancer = useMemo(() => new EnhancedCardBalancer(includeExtensions), [includeExtensions]);
  const report = useMemo(() => enhancedBalancer.generateEnhancedReport(), [enhancedBalancer]);
  const simulation = useMemo(() => enhancedBalancer.runEnhancedSimulation(500), [enhancedBalancer]);

  // Get actual card counts from the balancer
  const actualCardCount = report.totalCards;
  const coreCardCount = 20; // Current CARD_DATABASE size
  const extensionCardCount = actualCardCount - coreCardCount;

  console.log(`🔢 Enhanced Balancing Card Counts:
  - Core Database: ${coreCardCount} cards
  - Extension Cards: ${extensionCardCount} cards  
  - Total Cards: ${actualCardCount} cards
  - Include Extensions: ${includeExtensions}`);

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

  const exportCardIdsNeedingArt = () => {
    const cardsNeedingArt = report.cardAnalysis.filter(card => 
      !card.cardId.includes('temp') && // Cards with temp images
      (card.classification === 'Undercosted' || card.severity === 'Severe')
    );
    
    const artExport = {
      timestamp: new Date().toISOString(),
      totalCards: cardsNeedingArt.length,
      categories: {
        undercosted: cardsNeedingArt.filter(c => c.classification === 'Undercosted').map(c => ({
          id: c.cardId,
          name: c.name,
          faction: c.faction,
          rarity: c.rarity,
          reason: 'Undercosted - needs better art to justify power'
        })),
        severe: cardsNeedingArt.filter(c => c.severity === 'Severe').map(c => ({
          id: c.cardId,
          name: c.name,
          faction: c.faction,
          rarity: c.rarity,
          reason: 'Severe balance issues - high priority art needed'
        }))
      },
      cardIds: cardsNeedingArt.map(c => c.cardId)
    };

    const blob = new Blob([JSON.stringify(artExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cards-needing-art-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart data preparation
  const factionPieData = [
    { name: 'Truth Seeker', value: report.truthCards, color: '#3b82f6' },
    { name: 'Government', value: report.governmentCards, color: '#ef4444' },
    { name: 'Misaligned', value: report.misalignedCards, color: '#f97316' }
  ];

  const balancePieData = [
    { name: 'Balanserte', value: report.onCurve, color: '#10b981' },
    { name: 'Underpriset', value: report.undercosted, color: '#ef4444' },
    { name: 'Overpriset', value: report.overcosted, color: '#f59e0b' }
  ];

  const costDistributionData = useMemo(() => {
    const costs: { [key: number]: number } = {};
    report.cardAnalysis.forEach(card => {
      costs[card.cost] = (costs[card.cost] || 0) + 1;
    });
    return Object.entries(costs).map(([cost, count]) => ({
      cost: parseInt(cost),
      count,
      name: `${cost} IP`
    })).sort((a, b) => a.cost - b.cost);
  }, [report.cardAnalysis]);

  const rarityDistributionData = useMemo(() => {
    const rarities: { [key: string]: number } = {};
    report.cardAnalysis.forEach(card => {
      rarities[card.rarity] = (rarities[card.rarity] || 0) + 1;
    });
    return Object.entries(rarities).map(([rarity, count]) => ({
      rarity,
      count,
      color: rarity === 'Legendary' ? '#8b5cf6' : 
             rarity === 'Rare' ? '#3b82f6' : 
             rarity === 'Common' ? '#10b981' : '#6b7280'
    }));
  }, [report.cardAnalysis]);

  const utilityVsCostData = useMemo(() => {
    return report.cardAnalysis.map(card => ({
      name: card.name,
      cost: card.cost,
      utility: card.totalUtility,
      faction: card.faction,
      classification: card.classification
    }));
  }, [report.cardAnalysis]);

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
            <Button
              onClick={() => {
                exportData();
                exportEffectsFiles(includeExtensions);
              }}
              variant="outline"
              size="sm"
            >
              <Download size={16} className="mr-1" />
              Export Data
            </Button>
            <Button onClick={exportCardIdsNeedingArt} variant="outline" size="sm">
              <Image size={16} className="mr-1" />
              Export Art List
            </Button>
            <Button 
              onClick={() => window.open('/dev/recovery', '_blank')} 
              variant="outline" 
              size="sm"
              className="text-orange-400 border-orange-600 hover:bg-orange-900/20"
            >
              <RefreshCw size={16} className="mr-1" />
              Database Recovery
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">Lukk</Button>
          </div>
        </div>

        <div className="p-4 h-full overflow-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="w-full bg-gray-800">
              <TabsTrigger value="overview">Oversikt</TabsTrigger>
              <TabsTrigger value="charts">Grafer & Diagrammer</TabsTrigger>
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
                      <span className="text-white font-mono">{actualCardCount}</span>
                    </div>
                    {includeExtensions && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">- Core kort:</span>
                          <span className="text-gray-300 font-mono">{coreCardCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">- Extension kort:</span>
                          <span className="text-gray-300 font-mono">{extensionCardCount}</span>
                        </div>
                      </>
                    )}
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

            <TabsContent value="charts" className="mt-4 space-y-6">
              {/* Pie Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Faction Fordeling</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={factionPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}`}
                      >
                        {factionPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Balance Status</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={balancePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}`}
                      >
                        {balancePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Rarity Fordeling</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={rarityDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="count"
                        label={({rarity, count}) => `${rarity}: ${count}`}
                      >
                        {rarityDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Bar Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Kostnad Distribusjon</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#374151', 
                          border: '1px solid #4b5563',
                          borderRadius: '6px'
                        }} 
                      />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Utility vs Kostnad</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={utilityVsCostData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="cost" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#374151', 
                          border: '1px solid #4b5563',
                          borderRadius: '6px'
                        }} 
                      />
                      <Area type="monotone" dataKey="utility" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Win Rate Trend */}
              <Card className="p-4 bg-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Simulering Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { name: 'Truth Seeker', winRate: simulation.truthWinRate, color: '#3b82f6' },
                    { name: 'Government', winRate: simulation.governmentWinRate, color: '#ef4444' },
                    { name: 'Draw', winRate: simulation.drawRate, color: '#6b7280' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#374151', 
                        border: '1px solid #4b5563',
                        borderRadius: '6px'
                      }} 
                    />
                    <Line type="monotone" dataKey="winRate" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="cards" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Kort som trenger oppmerksomhet</h3>
                    <Button onClick={exportCardIdsNeedingArt} variant="outline" size="sm">
                      <FileText size={16} className="mr-1" />
                      Export Problem Cards
                    </Button>
                  </div>
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

                <Card className="p-4 bg-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Kort som trenger grafikk</h3>
                  <div className="grid gap-2 max-h-96 overflow-y-auto">
                    {report.cardAnalysis
                      .filter(card => 
                        !card.cardId.includes('temp') && 
                        (card.classification === 'Undercosted' || card.severity === 'Severe' || card.cardId.includes('temp-image'))
                      )
                      .sort((a, b) => b.severity === 'Severe' ? 1 : -1)
                      .slice(0, 15)
                      .map(card => (
                        <div key={card.cardId} className="p-3 bg-gray-700 rounded border border-gray-600">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-white">{card.name}</div>
                              <div className="text-sm text-gray-400">
                                ID: {card.cardId}
                              </div>
                              <div className="text-sm text-gray-400">
                                {card.type} | {card.faction} | {card.rarity}
                              </div>
                              <div className="text-xs text-orange-400">
                                {card.cardId.includes('temp') ? 'Har midlertidig grafikk' : 'Trenger bedre grafikk'}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-col">
                              <Badge className="bg-purple-600 text-xs">
                                Art Needed
                              </Badge>
                              {card.severity === 'Severe' && (
                                <Badge className="bg-red-600 text-xs">
                                  Priority
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
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