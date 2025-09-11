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
  EnhancedCardBalancer, 
  EnhancedCardAnalysis,
  EnhancedBalanceReport,
  SimulationReport
} from '@/data/enhancedCardBalancing';
import { Download, RefreshCw, AlertTriangle, CheckCircle, XCircle, ChevronDown, Info } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface BalancingDashboardProps {
  onClose: () => void;
}

const BalancingDashboard = ({ onClose }: BalancingDashboardProps) => {
  const [includeExtensions, setIncludeExtensions] = useState(true);
  
  const enhancedBalancer = useMemo(() => new EnhancedCardBalancer(includeExtensions), [includeExtensions]);
  
  const [selectedCard, setSelectedCard] = useState<EnhancedCardAnalysis | null>(null);
  
  const report: EnhancedBalanceReport = useMemo(() => enhancedBalancer.generateEnhancedReport(), [enhancedBalancer]);
  const simulationResult: SimulationReport = useMemo(() => enhancedBalancer.runEnhancedSimulation(), [enhancedBalancer]);
  
  // Get cards that need attention (undercosted or overcosted)
  const cardsNeedingAttention = useMemo(() => 
    report.cardAnalysis.filter(card => card.classification !== 'On Curve')
      .sort((a, b) => (b.severity === 'Severe' ? 2 : 1) - (a.severity === 'Severe' ? 2 : 1))
  , [report]);

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'On Curve': return 'text-green-400 bg-green-900/20';
      case 'Undercosted': return 'text-red-400 bg-red-900/20';
      case 'Overcosted': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'On Curve': return <CheckCircle size={16} />;
      case 'Undercosted': return <XCircle size={16} />;
      case 'Overcosted': return <AlertTriangle size={16} />;
      default: return null;
    }
  };

  const getFactionAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case 'Aligned': return 'text-green-400 bg-green-900/20';
      case 'Mixed': return 'text-yellow-400 bg-yellow-900/20';
      case 'Misaligned': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Severe': return 'text-red-400 bg-red-900/20';
      case 'High': return 'text-orange-400 bg-orange-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'Low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const balanceDistributionData = [
    { name: 'On Curve', value: report.onCurve, color: '#10b981' },
    { name: 'Undercosted', value: report.undercosted, color: '#ef4444' },
    { name: 'Overcosted', value: report.overcosted, color: '#f59e0b' }
  ];

  const alignmentDistributionData = [
    { name: 'Truth Cards', value: report.truthCards, color: '#10b981' },
    { name: 'Government Cards', value: report.governmentCards, color: '#3b82f6' },
    { name: 'Neutral Cards', value: report.neutralCards, color: '#6b7280' },
    { name: 'Misaligned', value: report.misalignedCards, color: '#ef4444' }
  ];

  const costByTypeData = Object.entries(report.averageCostByType).map(([type, cost]) => ({
    type,
    cost: Math.round(cost * 10) / 10
  }));

  const costByRarityData = Object.entries(report.averageCostByRarity).map(([rarity, cost]) => ({
    rarity,
    cost: Math.round(cost * 10) / 10
  }));

  const exportDataAsJSON = () => {
    const completeData = enhancedBalancer.exportFullAnalysis();
    
    const blob = new Blob([JSON.stringify(completeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enhanced-balance-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPatchesAsCSV = () => {
    const csvData = enhancedBalancer.generatePatchExport('csv');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance-patches-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportDataAsTXT = () => {
    const reportText = enhancedBalancer.generatePatchExport('txt');
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enhanced-balance-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] bg-gray-900 border-gray-700 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white font-mono">ENHANCED CARD BALANCING DASHBOARD</h2>
            <div className="text-xs text-green-400 mt-1 font-mono">
              Analyzer v2.0 — Cost cap: 15 | Max step: ±3 | Truth weighting: 2.0x | Threshold scaling: 1.0-2.0x
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIncludeExtensions(!includeExtensions)}
              variant={includeExtensions ? "default" : "outline"}
              size="sm"
              className={includeExtensions ? "bg-green-600 hover:bg-green-700" : "text-gray-400 border-gray-600"}
            >
              {includeExtensions ? "With Extensions" : "Base Cards Only"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-400 border-green-600 hover:bg-green-900/20"
                >
                  <Download size={16} className="mr-1" />
                  Export
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-gray-800 border-gray-600 shadow-lg">
                <DropdownMenuItem 
                  onClick={exportDataAsJSON}
                  className="text-gray-200 hover:bg-gray-700 cursor-pointer focus:bg-gray-700"
                >
                  <Download size={14} className="mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={exportPatchesAsCSV}
                  className="text-gray-200 hover:bg-gray-700 cursor-pointer focus:bg-gray-700"
                >
                  <Download size={14} className="mr-2" />
                  Export Patches (CSV)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={exportDataAsTXT}
                  className="text-gray-200 hover:bg-gray-700 cursor-pointer focus:bg-gray-700"
                >
                  <Download size={14} className="mr-2" />
                  Export as TXT
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <TabsList className="w-full flex flex-wrap gap-1 bg-gray-800">
              <TabsTrigger className="flex-1 sm:flex-none min-w-[120px]" value="overview">Overview</TabsTrigger>
              <TabsTrigger className="flex-1 sm:flex-none min-w-[120px]" value="cards">Card Analysis</TabsTrigger>
              <TabsTrigger className="flex-1 sm:flex-none min-w-[120px]" value="simulation">Simulation</TabsTrigger>
              <TabsTrigger className="flex-1 sm:flex-none min-w-[120px]" value="outliers">Top Outliers</TabsTrigger>
              <TabsTrigger className="flex-1 sm:flex-none min-w-[120px]" value="charts">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* Simulation Results */}
              <Card className="p-4 bg-gray-800 border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Simulation Results (1000 games)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{simulationResult.truthWinRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Truth Seeker Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{simulationResult.governmentWinRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Government Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400">{simulationResult.drawRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-400">Draw Rate</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-400 mb-2">Balance Target: 45-55% per faction</div>
                  <div className="text-xs text-gray-500">
                    Total: {(simulationResult.truthWinRate + simulationResult.governmentWinRate + simulationResult.drawRate).toFixed(1)}% | 
                    Avg Game Length: {simulationResult.averageGameLength.toFixed(1)} turns
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-white">{report.totalCards}</div>
                  <div className="text-sm text-gray-400">Total Cards</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-green-400">{report.onCurve}</div>
                  <div className="text-sm text-gray-400">On Curve</div>
                  <div className="text-xs text-gray-500">{Math.round((report.onCurve / report.totalCards) * 100)}%</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-red-400">{report.undercosted}</div>
                  <div className="text-sm text-gray-400">Undercosted</div>
                  <div className="text-xs text-gray-500">{Math.round((report.undercosted / report.totalCards) * 100)}%</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-yellow-400">{report.overcosted}</div>
                  <div className="text-sm text-gray-400">Overcosted</div>
                  <div className="text-xs text-gray-500">{Math.round((report.overcosted / report.totalCards) * 100)}%</div>
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
                  <h3 className="text-lg font-semibold text-white mb-4">Faction Alignment</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={alignmentDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {alignmentDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Priority Issues</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {cardsNeedingAttention.slice(0, 8).map(card => (
                      <div 
                        key={card.cardId}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                        onClick={() => setSelectedCard(card)}
                      >
                        <div>
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <div className="text-xs text-gray-400">{card.type} • {card.rarity}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getClassificationColor(card.classification)}>
                            {getClassificationIcon(card.classification)}
                            <span className="ml-1">{card.classification}</span>
                          </Badge>
                          <Badge className={getSeverityColor(card.severity)}>
                            {card.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Faction Alignment Issues</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {report.cardAnalysis
                      .filter(card => card.alignment === 'Misaligned')
                      .slice(0, 8)
                      .map((card, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-red-900/20 rounded border border-red-700">
                          <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-red-400">{card.name}</div>
                            <div className="text-xs text-gray-400">{card.faction} card with opposing faction effects</div>
                          </div>
                        </div>
                      ))
                    }
                    {report.cardAnalysis.filter(card => card.alignment === 'Misaligned').length === 0 && (
                      <div className="text-sm text-green-400">✓ No faction alignment issues detected</div>
                    )}
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
                          key={card.cardId}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedCard?.cardId === card.cardId 
                              ? 'bg-blue-900/30 border border-blue-600' 
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                          onClick={() => setSelectedCard(card)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-white">{card.name}</div>
                            <div className="flex gap-1">
                              <Badge className={getClassificationColor(card.classification)}>
                                {card.classification}
                              </Badge>
                              <Badge className={getFactionAlignmentColor(card.alignment)}>
                                {card.alignment}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{card.type} • {card.rarity} • {card.faction}</span>
                            <span>
                              Current: {card.currentCost} IP → 
                              {card.costRecommendation 
                                ? ` Step 1: ${card.costRecommendation} IP${card.rarityRecommendation ? ` → ${card.rarityRecommendation}` : ''}`
                                : ` ${card.currentCost} IP`
                              }
                            </span>
                          </div>
                          <div className="mt-1">
                            <div className="text-xs text-gray-500">
                              Utility: {card.totalUtilityScore.toFixed(1)} • {card.reasoning}
                            </div>
                            {Math.abs((card.costRecommendation || card.currentCost) - card.currentCost) > 3 && (
                              <div className="text-xs text-blue-400 mt-1">
                                ⚠ Large change requires multiple steps (max ±3 per iteration)
                              </div>
                            )}
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
                          <div className="text-sm text-gray-400">{selectedCard.type} • {selectedCard.rarity} • {selectedCard.faction}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-400">Current Cost</div>
                            <div className="text-lg font-bold text-white">{selectedCard.currentCost}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Recommended</div>
                            <div className={`text-lg font-bold ${selectedCard.costRecommendation ? 'text-blue-400' : 'text-gray-400'}`}>
                              {selectedCard.costRecommendation || 'No change'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-2">Total Utility Score</div>
                          <div className="text-lg text-white">{selectedCard.totalUtilityScore.toFixed(1)} IP-equiv</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Budget: {selectedCard.expectedCostRange.min}-{selectedCard.expectedCostRange.max}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-2">Effect Breakdown</div>
                          <div className="space-y-1">
                            {Object.entries(selectedCard.effectBreakdown).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="text-gray-400 capitalize">{key}:</span>
                                <span className="text-white">{value.toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-400 mb-1">Status</div>
                          <div className="flex gap-2">
                            <Badge className={getClassificationColor(selectedCard.classification)}>
                              {selectedCard.classification}
                            </Badge>
                            <Badge className={getFactionAlignmentColor(selectedCard.alignment)}>
                              {selectedCard.alignment}
                            </Badge>
                            <Badge className={getSeverityColor(selectedCard.severity)}>
                              {selectedCard.severity}
                            </Badge>
                          </div>
                        </div>

                        {selectedCard.alignmentReason && (
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Alignment Reason</div>
                            <div className="text-xs text-gray-300 bg-gray-700 p-2 rounded">
                              {selectedCard.alignmentReason}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-xs text-gray-400 mb-1">Reasoning</div>
                          <div className="text-xs text-gray-300 bg-gray-700 p-2 rounded">
                            {selectedCard.reasoning}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">Click on a card from the list to see detailed analysis.</p>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="simulation" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-blue-400">{simulationResult.truthWinRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Truth Win Rate</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-red-400">{simulationResult.governmentWinRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Government Win Rate</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-gray-400">{simulationResult.drawRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Draw Rate</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-white">{simulationResult.averageGameLength.toFixed(1)}</div>
                  <div className="text-sm text-gray-400">Avg Game Length</div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Overpowered Cards</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {simulationResult.cardPerformance.topOverpowered.map((card, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-900/20 rounded">
                        <div>
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <div className="text-xs text-gray-400">Impact: {card.impactScore.toFixed(2)}</div>
                        </div>
                        <div className="text-xs text-gray-300">{card.recommendedFix}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Underpowered Cards</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {simulationResult.cardPerformance.topUnderpowered.map((card, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-yellow-900/20 rounded">
                        <div>
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <div className="text-xs text-gray-400">Usage: {card.usageRate.toFixed(1)}%</div>
                        </div>
                        <div className="text-xs text-gray-300">{card.recommendedFix}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="outliers" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Top Overpowered Cards (Simulation)</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {simulationResult.cardPerformance.topOverpowered.map((card, index) => (
                      <div key={index} className="p-3 bg-red-900/20 border border-red-700 rounded">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <Badge className="text-red-400 bg-red-900/40">Impact: {card.impactScore.toFixed(1)}</Badge>
                        </div>
                        <div className="text-xs text-gray-400">{card.recommendedFix}</div>
                      </div>
                    ))}
                    {simulationResult.cardPerformance.topOverpowered.length === 0 && (
                      <div className="text-sm text-gray-400">No overpowered cards detected</div>
                    )}
                  </div>
                </Card>
                
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4">Top Underpowered Cards (Simulation)</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {simulationResult.cardPerformance.topUnderpowered.map((card, index) => (
                      <div key={index} className="p-3 bg-yellow-900/20 border border-yellow-700 rounded">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <Badge className="text-yellow-400 bg-yellow-900/40">Usage: {(card.usageRate * 100).toFixed(1)}%</Badge>
                        </div>
                        <div className="text-xs text-gray-400">{card.recommendedFix}</div>
                      </div>
                    ))}
                    {simulationResult.cardPerformance.topUnderpowered.length === 0 && (
                      <div className="text-sm text-gray-400">No underpowered cards detected</div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Undercosted Cards (Analysis)</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {report.topOutliers.undercosted.slice(0, 10).map((card, index) => (
                      <div key={index} className="p-3 bg-red-900/20 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <Badge className="text-red-400 bg-red-900/20">
                            {card.costRecommendation ? `${card.currentCost} → ${card.costRecommendation}` : 'Rarity change'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">
                          {card.type} • {card.rarity} • Utility: {card.totalUtilityScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-300">{card.reasoning}</div>
                        {Math.abs((card.costRecommendation || card.currentCost) - card.currentCost) > 3 && (
                          <div className="text-xs text-blue-400 mt-1">⚠ Requires multi-step patch (±3 max per iteration)</div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Overcosted Cards (Analysis)</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {report.topOutliers.overcosted.slice(0, 10).map((card, index) => (
                      <div key={index} className="p-3 bg-yellow-900/20 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-white">{card.name}</div>
                          <Badge className="text-yellow-400 bg-yellow-900/20">
                            {card.costRecommendation ? `${card.currentCost} → ${card.costRecommendation}` : 'Rarity change'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">
                          {card.type} • {card.rarity} • Utility: {card.totalUtilityScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-300">{card.reasoning}</div>
                        {Math.abs((card.costRecommendation || card.currentCost) - card.currentCost) > 3 && (
                          <div className="text-xs text-blue-400 mt-1">⚠ Requires multi-step patch (±3 max per iteration)</div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Average Cost by Type</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costByTypeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cost" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Average Cost by Rarity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costByRarityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rarity" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cost" fill="#3b82f6" />
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