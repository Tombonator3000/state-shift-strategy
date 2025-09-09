import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  CardBalancer, 
  CardMetrics,
  BalancingReport 
} from '@/data/cardBalancing';
import { Download, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface BalancingDashboardProps {
  onClose: () => void;
}

const BalancingDashboard = ({ onClose }: BalancingDashboardProps) => {
  const [balancer] = useState(() => new CardBalancer());
  const [selectedCard, setSelectedCard] = useState<CardMetrics | null>(null);
  
  const report = useMemo(() => balancer.generateBalancingReport(), [balancer]);
  const cardsNeedingAttention = useMemo(() => balancer.getCardsNeedingAttention(), [balancer]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'balanced': return 'text-green-400 bg-green-900/20';
      case 'underpowered': return 'text-yellow-400 bg-yellow-900/20';
      case 'overpowered': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'balanced': return <CheckCircle size={16} />;
      case 'underpowered': return <AlertTriangle size={16} />;
      case 'overpowered': return <XCircle size={16} />;
      default: return null;
    }
  };

  const balanceDistributionData = [
    { name: 'Balanced', value: report.balancedCards, color: '#10b981' },
    { name: 'Underpowered', value: report.underpoweredCards, color: '#f59e0b' },
    { name: 'Overpowered', value: report.overpoweredCards, color: '#ef4444' }
  ];

  const costByTypeData = Object.entries(report.averageCostByType).map(([type, cost]) => ({
    type,
    cost: Math.round(cost * 10) / 10
  }));

  const costByRarityData = Object.entries(report.averageCostByRarity).map(([rarity, cost]) => ({
    rarity,
    cost: Math.round(cost * 10) / 10
  }));

  const exportData = () => {
    const data = balancer.exportBalancingData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `card-balancing-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] bg-gray-900 border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white font-mono">CARD BALANCING DASHBOARD</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="text-green-400 border-green-600 hover:bg-green-900/20"
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-600"
            >
              Close
            </Button>
          </div>
        </div>

        <div className="p-4 h-full overflow-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cards">Card Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-white">{report.totalCards}</div>
                  <div className="text-sm text-gray-400">Total Cards</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-green-400">{report.balancedCards}</div>
                  <div className="text-sm text-gray-400">Balanced</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-yellow-400">{report.underpoweredCards}</div>
                  <div className="text-sm text-gray-400">Underpowered</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-red-400">{report.overpoweredCards}</div>
                  <div className="text-sm text-gray-400">Overpowered</div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Balance Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={balanceDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {balanceDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Cards Needing Attention</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {cardsNeedingAttention.slice(0, 8).map(card => (
                      <div 
                        key={card.id}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                        onClick={() => setSelectedCard(card)}
                      >
                        <div>
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <div className="text-xs text-gray-400">{card.type} • {card.rarity}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(card.balanceStatus)}>
                            {getStatusIcon(card.balanceStatus)}
                            <span className="ml-1">{card.balanceStatus}</span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <div className="lg:col-span-2">
                  <Card className="p-4 bg-gray-800 border-gray-700 h-full">
                    <h3 className="text-lg font-semibold text-white mb-4">Card Analysis</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {cardsNeedingAttention.map(card => (
                        <div 
                          key={card.id}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedCard?.id === card.id 
                              ? 'bg-blue-900/30 border border-blue-600' 
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                          onClick={() => setSelectedCard(card)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-white">{card.name}</div>
                            <Badge className={getStatusColor(card.balanceStatus)}>
                              {card.balanceStatus}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{card.type} • {card.rarity}</span>
                            <span>Current: {card.currentCost} → Recommended: {card.recommendedCost}</span>
                          </div>
                          <div className="mt-1">
                            <Progress 
                              value={Math.min(100, card.powerScore * 10)} 
                              className="h-2"
                            />
                            <div className="text-xs text-gray-500 mt-1">Power Score: {card.powerScore}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div>
                  <Card className="p-4 bg-gray-800 border-gray-700 h-full">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {selectedCard ? 'Card Details' : 'Select a Card'}
                    </h3>
                    {selectedCard ? (
                      <div className="space-y-4">
                        <div>
                          <div className="text-lg font-bold text-white">{selectedCard.name}</div>
                          <div className="text-sm text-gray-400">{selectedCard.type} • {selectedCard.rarity}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-400">Current Cost</div>
                            <div className="text-lg font-bold text-white">{selectedCard.currentCost}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Recommended</div>
                            <div className="text-lg font-bold text-blue-400">{selectedCard.recommendedCost}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-1">Power Score</div>
                          <Progress value={Math.min(100, selectedCard.powerScore * 10)} className="h-3" />
                          <div className="text-sm text-white mt-1">{selectedCard.powerScore}/10</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-400">Usage Rate</div>
                            <div className="text-sm text-white">{selectedCard.usageRate.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Win Rate</div>
                            <div className="text-sm text-white">{selectedCard.winRateWhenPlayed.toFixed(1)}%</div>
                          </div>
                        </div>

                        {selectedCard.issues.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-400 mb-2">Issues</div>
                            <div className="space-y-1">
                              {selectedCard.issues.map((issue, index) => (
                                <div key={index} className="text-xs text-yellow-400 flex items-start gap-1">
                                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                                  {issue}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center">
                        Click on a card to view detailed analysis
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <Card className="p-4 bg-gray-800 border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Balancing Recommendations</h3>
                <div className="space-y-4">
                  {report.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded">
                      <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-300">{rec}</div>
                    </div>
                  ))}
                  
                  {report.recommendations.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <CheckCircle size={48} className="mx-auto mb-2 text-green-400" />
                      <div>No major balancing issues detected!</div>
                      <div className="text-xs mt-1">The card set appears well-balanced overall.</div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Average Cost by Type</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={costByTypeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="type" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Bar dataKey="cost" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Average Cost by Rarity</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={costByRarityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="rarity" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Bar dataKey="cost" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default BalancingDashboard;