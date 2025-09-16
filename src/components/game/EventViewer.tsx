import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { EventManager, EVENT_DATABASE, type GameEvent } from '@/data/eventDatabase';
import { AlertTriangle, Zap, Eye, Crown, Calendar, Filter, Play, BarChart3, TestTube, Dice6, RefreshCw } from 'lucide-react';

interface EventViewerProps {
  onClose: () => void;
}

interface TestGameState {
  turn: number;
  truth: number;
  ip: number;
  controlledStates: number;
}

const EventViewer = ({ onClose }: EventViewerProps) => {
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Testing tools state
  const [testGameState, setTestGameState] = useState<TestGameState>({
    turn: 1,
    truth: 50,
    ip: 10,
    controlledStates: 3
  });
  const [triggerResults, setTriggerResults] = useState<string[]>([]);
  const [probabilityResults, setProbabilityResults] = useState<{event: GameEvent, probability: number}[]>([]);
  const [simulationResults, setSimulationResults] = useState<{[key: string]: number}>({});
  
  const eventManager = new EventManager();
  const eventStats = eventManager.getEventStats();

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-900/20';
      case 'uncommon': return 'text-green-400 bg-green-900/20';
      case 'rare': return 'text-blue-400 bg-blue-900/20';
      case 'legendary': return 'text-purple-400 bg-purple-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'conspiracy': return 'text-yellow-400 bg-yellow-900/20';
      case 'government': return 'text-red-400 bg-red-900/20';
      case 'truth': return 'text-blue-400 bg-blue-900/20';
      case 'crisis': return 'text-red-500 bg-red-900/30';
      case 'opportunity': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conspiracy': return <Eye size={14} />;
      case 'government': return <Crown size={14} />;
      case 'truth': return <Zap size={14} />;
      case 'crisis': return <AlertTriangle size={14} />;
      case 'opportunity': return <Calendar size={14} />;
      default: return null;
    }
  };

  const filteredEvents = EVENT_DATABASE.filter(event => {
    if (filterRarity !== 'all' && event.rarity !== filterRarity) return false;
    if (filterType !== 'all' && event.type !== filterType) return false;
    return true;
  });

  const formatConditions = (conditions: GameEvent['conditions']) => {
    if (!conditions) return 'None';
    
    const parts = [];
    if (conditions.minTurn) parts.push(`Turn ≥ ${conditions.minTurn}`);
    if (conditions.maxTurn) parts.push(`Turn ≤ ${conditions.maxTurn}`);
    if (conditions.truthAbove) parts.push(`Truth > ${conditions.truthAbove}%`);
    if (conditions.truthBelow) parts.push(`Truth < ${conditions.truthBelow}%`);
    if (conditions.ipAbove) parts.push(`IP > ${conditions.ipAbove}`);
    if (conditions.ipBelow) parts.push(`IP < ${conditions.ipBelow}`);
    if (conditions.controlledStates) parts.push(`States ≥ ${conditions.controlledStates}`);
    if (conditions.requiresState) parts.push(`Requires ${conditions.requiresState}`);
    
    return parts.length > 0 ? parts.join(', ') : 'None';
  };

  const formatEffects = (effects: GameEvent['effects']) => {
    if (!effects) return 'None';
    
    const parts = [];
    if (effects.truth) parts.push(`Truth ${effects.truth > 0 ? '+' : ''}${effects.truth}%`);
    if (effects.ip) parts.push(`IP ${effects.ip > 0 ? '+' : ''}${effects.ip}`);
    if (effects.cardDraw) parts.push(`Draw ${effects.cardDraw} cards`);
    if (effects.skipTurn) parts.push('Skip next turn');
    if (effects.doubleIncome) parts.push('Double income next turn');
    if (effects.stateEffects?.pressure) parts.push(`State pressure +${effects.stateEffects.pressure}`);
    if (effects.stateEffects?.defense) parts.push(`State defense +${effects.stateEffects.defense}`);
    
    return parts.length > 0 ? parts.join(', ') : 'None';
  };

  // Testing Tools Functions
  const checkEventConditions = (event: GameEvent, gameState: TestGameState): boolean => {
    const conditions = event.conditions;
    if (!conditions) return true;
    
    if (conditions.minTurn && gameState.turn < conditions.minTurn) return false;
    if (conditions.maxTurn && gameState.turn > conditions.maxTurn) return false;
    if (conditions.truthAbove && gameState.truth <= conditions.truthAbove) return false;
    if (conditions.truthBelow && gameState.truth >= conditions.truthBelow) return false;
    if (conditions.ipAbove && gameState.ip <= conditions.ipAbove) return false;
    if (conditions.ipBelow && gameState.ip >= conditions.ipBelow) return false;
    if (conditions.controlledStates && gameState.controlledStates < conditions.controlledStates) return false;
    
    return true;
  };

  const triggerEvent = (eventId: string) => {
    const event = EVENT_DATABASE.find(e => e.id === eventId);
    if (!event) {
      setTriggerResults(prev => [...prev, `❌ Event ${eventId} not found`]);
      return;
    }

    const canTrigger = checkEventConditions(event, testGameState);
    if (canTrigger) {
      setTriggerResults(prev => [...prev, `✅ Triggered: ${event.title} - ${formatEffects(event.effects)}`]);
    } else {
      setTriggerResults(prev => [...prev, `❌ Cannot trigger ${event.title} - Conditions not met: ${formatConditions(event.conditions)}`]);
    }
  };

  const analyzeWeightDistribution = () => {
    const availableEvents = EVENT_DATABASE.filter(event => 
      checkEventConditions(event, testGameState)
    );
    
    const totalWeight = availableEvents.reduce((sum, event) => sum + event.weight, 0);
    
    const probabilities = availableEvents.map(event => ({
      event,
      probability: totalWeight > 0 ? (event.weight / totalWeight) * 100 : 0
    })).sort((a, b) => b.probability - a.probability);
    
    setProbabilityResults(probabilities);
  };

  const runSimulation = (iterations: number = 1000) => {
    const testManager = new EventManager();
    testManager.updateTurn(testGameState.turn);
    
    const results: {[key: string]: number} = {};
    
    for (let i = 0; i < iterations; i++) {
      const mockGameState = {
        turn: testGameState.turn,
        truth: testGameState.truth,
        ip: testGameState.ip,
        controlledStates: testGameState.controlledStates,
        // Add other required properties for game state
      };
      
      const selectedEvent = testManager.selectRandomEvent(mockGameState);
      if (selectedEvent) {
        results[selectedEvent.id] = (results[selectedEvent.id] || 0) + 1;
      }
    }
    
    setSimulationResults(results);
  };

  const clearTestingResults = () => {
    setTriggerResults([]);
    setProbabilityResults([]);
    setSimulationResults({});
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] bg-gray-900 border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white font-mono">EVENT DATABASE</h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-600"
          >
            Close
          </Button>
        </div>

        <div className="p-4 h-full overflow-hidden">
          <Tabs defaultValue="browser" className="h-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="browser">Event Browser</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="testing">Testing Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="browser" className="mt-4 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <div className="lg:col-span-2">
                  <Card className="p-4 bg-gray-800 border-gray-700 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                          value={filterRarity}
                          onChange={(e) => setFilterRarity(e.target.value)}
                          className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                          <option value="all">All Rarities</option>
                          <option value="common">Common</option>
                          <option value="uncommon">Uncommon</option>
                          <option value="rare">Rare</option>
                          <option value="legendary">Legendary</option>
                        </select>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                        >
                          <option value="all">All Types</option>
                          <option value="conspiracy">Conspiracy</option>
                          <option value="government">Government</option>
                          <option value="truth">Truth</option>
                          <option value="crisis">Crisis</option>
                          <option value="opportunity">Opportunity</option>
                        </select>
                      </div>
                      <div className="text-sm text-gray-400">
                        {filteredEvents.length} events
                      </div>
                    </div>

                    <ScrollArea className="h-[60vh]">
                      <div className="space-y-2">
                        {filteredEvents.map(event => (
                          <div 
                            key={event.id}
                            className={`p-3 rounded cursor-pointer transition-colors ${
                              selectedEvent?.id === event.id 
                                ? 'bg-blue-900/30 border border-blue-600' 
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium text-white">{event.title}</div>
                              <div className="flex items-center gap-2">
                                <Badge className={getRarityColor(event.rarity)}>
                                  {event.rarity}
                                </Badge>
                                <Badge className={getTypeColor(event.type)}>
                                  {getTypeIcon(event.type)}
                                  <span className="ml-1">{event.type}</span>
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">{event.headline}</div>
                            <div className="text-xs text-gray-500 mt-1">Weight: {event.weight}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>

                <div>
                  <Card className="p-4 bg-gray-800 border-gray-700 h-full">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {selectedEvent ? 'Event Details' : 'Select an Event'}
                    </h3>
                    {selectedEvent ? (
                      <ScrollArea className="h-[60vh]">
                        <div className="space-y-4">
                          <div>
                            <div className="text-lg font-bold text-white">{selectedEvent.title}</div>
                            <div className="text-sm text-gray-400 mt-1">{selectedEvent.headline}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={getRarityColor(selectedEvent.rarity)}>
                              {selectedEvent.rarity}
                            </Badge>
                            <Badge className={getTypeColor(selectedEvent.type)}>
                              {getTypeIcon(selectedEvent.type)}
                              <span className="ml-1">{selectedEvent.type}</span>
                            </Badge>
                          </div>

                          <div>
                            <div className="text-xs text-gray-400 mb-1">Content</div>
                            <div className="text-sm text-gray-300 leading-relaxed">
                              {selectedEvent.content}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-400 mb-1">Conditions</div>
                            <div className="text-sm text-gray-300">
                              {formatConditions(selectedEvent.conditions)}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-400 mb-1">Effects</div>
                            <div className="text-sm text-gray-300">
                              {formatEffects(selectedEvent.effects)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-400">Weight</div>
                              <div className="text-sm text-white">{selectedEvent.weight}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Faction</div>
                              <div className="text-sm text-white">{selectedEvent.faction || 'Any'}</div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        Click on an event to view detailed information
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-white">{eventStats.total}</div>
                  <div className="text-sm text-gray-400">Total Events</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-gray-400">{eventStats.common}</div>
                  <div className="text-sm text-gray-400">Common</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-green-400">{eventStats.uncommon}</div>
                  <div className="text-sm text-gray-400">Uncommon</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-blue-400">{eventStats.rare}</div>
                  <div className="text-sm text-gray-400">Rare</div>
                </Card>
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="text-2xl font-bold text-purple-400">{eventStats.legendary}</div>
                  <div className="text-sm text-gray-400">Legendary</div>
                </Card>
              </div>

              <div className="mt-6">
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Events by Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(eventStats.byType).map(([type, count]) => (
                      <div key={type} className="text-center">
                        <div className="text-xl font-bold text-white">{count}</div>
                        <div className="text-sm text-gray-400 capitalize">{type}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="testing" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Game State Simulator */}
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <TestTube size={20} className="text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Game State Simulator</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-300">Turn: {testGameState.turn}</Label>
                      <Slider
                        value={[testGameState.turn]}
                        onValueChange={([value]) => setTestGameState(prev => ({...prev, turn: value}))}
                        max={30}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-300">Truth Level: {testGameState.truth}%</Label>
                      <Slider
                        value={[testGameState.truth]}
                        onValueChange={([value]) => setTestGameState(prev => ({...prev, truth: value}))}
                        max={100}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-300">Influence Points: {testGameState.ip}</Label>
                      <Slider
                        value={[testGameState.ip]}
                        onValueChange={([value]) => setTestGameState(prev => ({...prev, ip: value}))}
                        max={50}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm text-gray-300">Controlled States: {testGameState.controlledStates}</Label>
                      <Slider
                        value={[testGameState.controlledStates]}
                        onValueChange={([value]) => setTestGameState(prev => ({...prev, controlledStates: value}))}
                        max={20}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={analyzeWeightDistribution}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <BarChart3 size={16} />
                        Analyze Probabilities
                      </Button>
                      <Button
                        onClick={() => runSimulation(1000)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Dice6 size={16} />
                        Run Simulation
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Manual Event Triggering */}
                <Card className="p-4 bg-gray-800 border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Play size={20} className="text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Manual Event Testing</h3>
                    <Button
                      onClick={clearTestingResults}
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-gray-400"
                    >
                      <RefreshCw size={16} />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <Label className="text-sm text-gray-300">Select Event to Trigger</Label>
                    <select
                      onChange={(e) => e.target.value && triggerEvent(e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                      defaultValue=""
                    >
                      <option value="">Choose an event...</option>
                      {EVENT_DATABASE.map(event => (
                        <option key={event.id} value={event.id}>
                          {event.title} ({event.rarity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <ScrollArea className="h-32 border border-gray-700 rounded p-2 bg-gray-900">
                    <div className="space-y-1">
                      {triggerResults.map((result, index) => (
                        <div key={index} className="text-xs text-gray-300 font-mono">
                          {result}
                        </div>
                      ))}
                      {triggerResults.length === 0 && (
                        <div className="text-xs text-gray-500 italic">
                          Trigger results will appear here...
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>

                {/* Probability Distribution */}
                <Card className="p-4 bg-gray-800 border-gray-700 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={20} className="text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Event Probability Analysis</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Weight Distribution */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Available Events (Current State)</h4>
                      <ScrollArea className="h-48 border border-gray-700 rounded">
                        <div className="p-2 space-y-1">
                          {probabilityResults.length > 0 ? (
                            probabilityResults.slice(0, 10).map(({ event, probability }) => (
                              <div key={event.id} className="flex justify-between text-xs">
                                <span className="text-gray-300 truncate mr-2">{event.title}</span>
                                <div className="flex items-center gap-2">
                                  <Badge className={getRarityColor(event.rarity)}>
                                    {event.rarity}
                                  </Badge>
                                  <span className="text-white font-mono">{probability.toFixed(1)}%</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 italic">
                              Click "Analyze Probabilities" to see results
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Simulation Results */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Simulation Results (1000 iterations)</h4>
                      <ScrollArea className="h-48 border border-gray-700 rounded">
                        <div className="p-2 space-y-1">
                          {Object.keys(simulationResults).length > 0 ? (
                            Object.entries(simulationResults)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 10)
                              .map(([eventId, count]) => {
                                const event = EVENT_DATABASE.find(e => e.id === eventId);
                                if (!event) return null;
                                return (
                                  <div key={eventId} className="flex justify-between text-xs">
                                    <span className="text-gray-300 truncate mr-2">{event.title}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getRarityColor(event.rarity)}>
                                        {event.rarity}
                                      </Badge>
                                      <span className="text-white font-mono">
                                        {count} ({((count / 1000) * 100).toFixed(1)}%)
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                          ) : (
                            <div className="text-xs text-gray-500 italic">
                              Click "Run Simulation" to see results
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default EventViewer;