import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Target, TrendingUp, TrendingDown, Download, Filter, BarChart3, PieChart } from 'lucide-react';
import FactionBalanceAnalyzer, { CardAnalysisResult, BalanceReport, SimulationResult } from '@/data/factionBalanceAnalyzer';

interface FactionBalanceDashboardProps {
  onClose: () => void;
}

const FactionBalanceDashboard: React.FC<FactionBalanceDashboardProps> = ({ onClose }) => {
  const [selectedCard, setSelectedCard] = useState<CardAnalysisResult | null>(null);
  const [filterFaction, setFilterFaction] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // Initialize analyzer and generate reports
  const analyzer = useMemo(() => new FactionBalanceAnalyzer(), []);
  const balanceReport = useMemo(() => analyzer.generateBalanceReport(), [analyzer]);
  const simulationResult = useMemo(() => analyzer.runBalanceSimulation(), [analyzer]);

  // Filter cards based on selected filters
  const filteredCards = useMemo(() => {
    return balanceReport.cardAnalysis.filter(card => {
      if (filterFaction !== 'all' && card.faction !== filterFaction) return false;
      if (filterSeverity !== 'all' && card.severity !== filterSeverity) return false;
      if (filterRarity !== 'all' && card.rarity !== filterRarity) return false;
      return true;
    });
  }, [balanceReport.cardAnalysis, filterFaction, filterSeverity, filterRarity]);

  // Helper functions for UI
  const getSeverityColor = (severity: CardAnalysisResult['severity']) => {
    switch (severity) {
      case 'Severe': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlignmentColor = (alignment: CardAnalysisResult['alignment']) => {
    switch (alignment) {
      case 'Aligned': return 'bg-green-500';
      case 'Mixed': return 'bg-yellow-500';
      case 'Misaligned': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCostStatusColor = (status: CardAnalysisResult['costStatus']) => {
    switch (status) {
      case 'Undercosted': return 'text-red-400';
      case 'Overcosted': return 'text-orange-400';
      case 'On Curve': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const exportData = () => {
    const data = analyzer.exportBalanceData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faction-balance-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-7xl h-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Faction Balance Analysis</h2>
            <p className="text-sm text-muted-foreground">Comprehensive card balance and faction alignment report</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
              <Download size={16} />
              Export Data
            </Button>
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </div>

        <div className="p-6 h-full overflow-y-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cards">Card Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{balanceReport.totalCards}</div>
                    <div className="text-xs text-muted-foreground">Analyzed</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      Severe Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">{balanceReport.severeIssues}</div>
                    <div className="text-xs text-muted-foreground">Require immediate attention</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Truth Seekers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">{balanceReport.truthSeekerStats.total}</div>
                    <div className="text-xs text-muted-foreground">
                      Avg NUS: {balanceReport.truthSeekerStats.averageNUS.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Government</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">{balanceReport.governmentStats.total}</div>
                    <div className="text-xs text-muted-foreground">
                      Avg NUS: {balanceReport.governmentStats.averageNUS.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Faction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-400">Truth Seekers Alignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Aligned</span>
                        <span className="font-mono">{balanceReport.truthSeekerStats.aligned}</span>
                      </div>
                      <Progress value={(balanceReport.truthSeekerStats.aligned / balanceReport.truthSeekerStats.total) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mixed</span>
                        <span className="font-mono">{balanceReport.truthSeekerStats.mixed}</span>
                      </div>
                      <Progress value={(balanceReport.truthSeekerStats.mixed / balanceReport.truthSeekerStats.total) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Misaligned</span>
                        <span className="font-mono">{balanceReport.truthSeekerStats.misaligned}</span>
                      </div>
                      <Progress value={(balanceReport.truthSeekerStats.misaligned / balanceReport.truthSeekerStats.total) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-400">Government Alignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Aligned</span>
                        <span className="font-mono">{balanceReport.governmentStats.aligned}</span>
                      </div>
                      <Progress value={(balanceReport.governmentStats.aligned / balanceReport.governmentStats.total) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mixed</span>
                        <span className="font-mono">{balanceReport.governmentStats.mixed}</span>
                      </div>
                      <Progress value={(balanceReport.governmentStats.mixed / balanceReport.governmentStats.total) * 100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Misaligned</span>
                        <span className="font-mono">{balanceReport.governmentStats.misaligned}</span>
                      </div>
                      <Progress value={(balanceReport.governmentStats.misaligned / balanceReport.governmentStats.total) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Global Recommendations Preview */}
              {balanceReport.globalRecommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target size={16} />
                      Key Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {balanceReport.globalRecommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Card Analysis Tab */}
            <TabsContent value="cards" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <Select value={filterFaction} onValueChange={setFilterFaction}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Faction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Factions</SelectItem>
                    <SelectItem value="truth">Truth Seekers</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="Severe">Severe</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRarity} onValueChange={setFilterRarity}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarity</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground">
                  Showing {filteredCards.length} of {balanceReport.cardAnalysis.length} cards
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredCards.map((card) => (
                    <div
                      key={card.cardId}
                      onClick={() => setSelectedCard(card)}
                      className={`p-4 border rounded cursor-pointer transition-colors ${
                        selectedCard?.cardId === card.cardId ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium truncate">{card.name}</span>
                        <div className="flex gap-1">
                          <Badge className={`${getSeverityColor(card.severity)} text-white text-xs`}>
                            {card.severity}
                          </Badge>
                          <Badge className={`${getAlignmentColor(card.alignment)} text-white text-xs`}>
                            {card.alignment}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{card.type} • {card.rarity} • {card.faction}</span>
                        <span className={getCostStatusColor(card.costStatus)}>
                          {card.cost} IP ({card.costStatus})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {selectedCard ? selectedCard.name : 'Select a card to view details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCard ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Type:</span> {selectedCard.type}
                          </div>
                          <div>
                            <span className="font-medium">Rarity:</span> {selectedCard.rarity}
                          </div>
                          <div>
                            <span className="font-medium">Faction:</span> {selectedCard.faction}
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span> {selectedCard.cost} IP
                          </div>
                        </div>

                        <div>
                          <span className="font-medium">Net Utility Score:</span>
                          <div className="text-2xl font-mono font-bold">
                            {selectedCard.netUtilityScore.total.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Truth: {selectedCard.netUtilityScore.breakdown.truth.toFixed(1)} • 
                            IP: {selectedCard.netUtilityScore.breakdown.ip.toFixed(1)} • 
                            Pressure: {selectedCard.netUtilityScore.breakdown.pressure.toFixed(1)}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium">Alignment:</span>
                          <div className="mt-1">
                            <Badge className={`${getAlignmentColor(selectedCard.alignment)} text-white`}>
                              {selectedCard.alignment}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedCard.alignmentReason}
                          </p>
                        </div>

                        {selectedCard.issues.length > 0 && (
                          <div>
                            <span className="font-medium">Issues:</span>
                            <ul className="text-sm text-red-400 mt-1 space-y-1">
                              {selectedCard.issues.map((issue, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedCard.recommendations.length > 0 && (
                          <div>
                            <span className="font-medium">Recommendations:</span>
                            <ul className="text-sm text-blue-400 mt-1 space-y-1">
                              {selectedCard.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Target size={12} className="mt-0.5 flex-shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Click on a card from the list to see detailed analysis
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid gap-4">
                {/* Global Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target size={16} />
                      Global Balance Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {balanceReport.globalRecommendations.length > 0 ? (
                      <ul className="space-y-3">
                        {balanceReport.globalRecommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-orange-500/10 rounded border-l-4 border-orange-500">
                            <AlertTriangle size={16} className="text-orange-500 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No global recommendations at this time. The overall balance looks good!
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Severe Issues */}
                {balanceReport.severeIssues > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle size={16} />
                        Critical Issues Requiring Immediate Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {balanceReport.cardAnalysis
                          .filter(card => card.severity === 'Severe')
                          .map((card) => (
                            <div key={card.cardId} className="p-4 bg-red-500/10 rounded border-l-4 border-red-500">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{card.name}</span>
                                <Badge className="bg-red-500 text-white">{card.severity}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{card.alignmentReason}</p>
                              {card.recommendations.length > 0 && (
                                <ul className="text-sm space-y-1">
                                  {card.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <div className="w-1 h-1 bg-red-400 rounded-full mt-2"></div>
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* High Priority Issues */}
                {balanceReport.highIssues > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-400">
                        <TrendingDown size={16} />
                        High Priority Balance Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {balanceReport.cardAnalysis
                          .filter(card => card.severity === 'High')
                          .map((card) => (
                            <div key={card.cardId} className="p-3 bg-orange-500/10 rounded border-l-2 border-orange-500">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{card.name}</span>
                                <span className="text-xs text-muted-foreground">{card.type}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{card.issues.join(', ')}</p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Simulation Tab */}
            <TabsContent value="simulation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Truth Seekers Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">
                      {simulationResult.truthWinRate.toFixed(1)}%
                    </div>
                    <Progress value={simulationResult.truthWinRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Government Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">
                      {simulationResult.governmentWinRate.toFixed(1)}%
                    </div>
                    <Progress value={simulationResult.governmentWinRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Avg IP Swing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{simulationResult.averageIPSwing.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Per Game</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Avg Cards/Turn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{simulationResult.averageCardsPerTurn.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Both Players</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <TrendingUp size={16} />
                      Top Overpowered Cards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {simulationResult.topOverpoweredCards.length > 0 ? (
                      <ul className="space-y-2">
                        {simulationResult.topOverpoweredCards.map((cardName, index) => (
                          <li key={index} className="text-sm p-2 bg-red-500/10 rounded">
                            {index + 1}. {cardName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">No overpowered cards detected</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <TrendingDown size={16} />
                      Top Underpowered Cards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {simulationResult.topUnderpoweredCards.length > 0 ? (
                      <ul className="space-y-2">
                        {simulationResult.topUnderpoweredCards.map((cardName, index) => (
                          <li key={index} className="text-sm p-2 bg-blue-500/10 rounded">
                            {index + 1}. {cardName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">No underpowered cards detected</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Balance Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>Balance Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Math.abs(simulationResult.truthWinRate - 50) > 10 && (
                      <div className="p-3 bg-orange-500/10 border-l-4 border-orange-500 rounded-r">
                        <p className="text-sm">
                          <strong>Win Rate Imbalance Detected:</strong> {simulationResult.truthWinRate > 50 ? 'Truth Seekers' : 'Government'} have a {Math.abs(simulationResult.truthWinRate - 50).toFixed(1)}% advantage. Consider balancing faction cards.
                        </p>
                      </div>
                    )}
                    
                    {Math.abs(simulationResult.truthWinRate - 50) <= 5 && (
                      <div className="p-3 bg-green-500/10 border-l-4 border-green-500 rounded-r">
                        <p className="text-sm">
                          <strong>Excellent Balance:</strong> Win rates are within 5% of each other, indicating good faction balance.
                        </p>
                      </div>
                    )}

                    {simulationResult.averageCardsPerTurn > 3 && (
                      <div className="p-3 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r">
                        <p className="text-sm">
                          <strong>High Card Velocity:</strong> Average {simulationResult.averageCardsPerTurn.toFixed(1)} cards per turn may indicate games are too fast-paced.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 size={16} />
                      Average Cost by Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(balanceReport.costByType).map(([type, cost]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{type}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(cost / 10) * 100} className="w-20 h-2" />
                            <span className="text-sm font-mono">{cost.toFixed(1)} IP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart size={16} />
                      Average Cost by Rarity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(balanceReport.costByRarity).map(([rarity, cost]) => (
                        <div key={rarity} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{rarity}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(cost / 15) * 100} className="w-20 h-2" />
                            <span className="text-sm font-mono">{cost.toFixed(1)} IP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Issue Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Severity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{balanceReport.severeIssues}</div>
                      <div className="text-sm text-muted-foreground">Severe</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{balanceReport.highIssues}</div>
                      <div className="text-sm text-muted-foreground">High</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{balanceReport.mediumIssues}</div>
                      <div className="text-sm text-muted-foreground">Medium</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{balanceReport.lowIssues}</div>
                      <div className="text-sm text-muted-foreground">Low</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FactionBalanceDashboard;