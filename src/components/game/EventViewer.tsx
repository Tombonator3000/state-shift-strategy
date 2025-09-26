import { useEffect, useState } from 'react';
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

type EventViewerTab = 'browser' | 'statistics' | 'testing';
type EventViewerVariant = 'modal' | 'embedded';

interface EventViewerProps {
  onClose?: () => void;
  variant?: EventViewerVariant;
  defaultTab?: EventViewerTab;
  className?: string;
}

interface TestGameState {
  turn: number;
  truth: number;
  ip: number;
  controlledStates: number;
  controlledStateIds: string;
  faction: 'truth' | 'government';
}

const EventViewer = ({
  onClose,
  variant = 'modal',
  defaultTab = 'browser',
  className,
}: EventViewerProps) => {
  const [activeTab, setActiveTab] = useState<EventViewerTab>(defaultTab);
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Testing tools state
  const [testGameState, setTestGameState] = useState<TestGameState>({
    turn: 1,
    truth: 50,
    ip: 10,
    controlledStates: 3,
    controlledStateIds: '',
    faction: 'truth'
  });
  const [triggerResults, setTriggerResults] = useState<string[]>([]);
  const [probabilityResults, setProbabilityResults] = useState<{
    event: GameEvent;
    triggerChance: number;
    conditionalChance: number;
  }[]>([]);
  const [simulationResults, setSimulationResults] = useState<{[key: string]: number}>({});
  const [simulationIterations, setSimulationIterations] = useState(1000);
  const [simulationTriggerCount, setSimulationTriggerCount] = useState(0);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const isModal = variant === 'modal';
  const listHeightClass = isModal ? 'h-[60vh]' : 'h-[52vh]';
  const detailHeightClass = isModal ? 'h-[60vh]' : 'h-[52vh]';

  const eventManager = new EventManager();
  const eventStats = eventManager.getEventStats();

  const parseControlledStateIds = (raw: string): string[] =>
    raw
      .split(',')
      .map(value => value.trim().toUpperCase())
      .filter(Boolean);

  const buildControlledStatesArray = (): string[] => {
    const specifiedIds = parseControlledStateIds(testGameState.controlledStateIds);
    const placeholdersNeeded = Math.max(0, testGameState.controlledStates - specifiedIds.length);
    const placeholders = Array.from({ length: placeholdersNeeded }, (_, index) => `PLACEHOLDER_${index}`);
    return [...specifiedIds, ...placeholders];
  };

  const buildManagerGameState = () => ({
    truth: testGameState.truth,
    ip: testGameState.ip,
    controlledStates: buildControlledStatesArray(),
    faction: testGameState.faction,
  });

  const formatPercent = (value: number): string => {
    if (!Number.isFinite(value) || value <= 0) {
      return '0%';
    }

    const percent = value * 100;
    let precision = 2;

    if (percent >= 10) {
      precision = 0;
    } else if (percent >= 1) {
      precision = 1;
    } else if (percent >= 0.1) {
      precision = 2;
    } else {
      precision = 3;
    }

    const formatted = percent.toFixed(precision)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*?)0+$/, '$1');

    return `${formatted}%`;
  };

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

    if (conditions.requiresState) {
      const controlledIds = parseControlledStateIds(gameState.controlledStateIds);
      if (!controlledIds.includes(conditions.requiresState.toUpperCase())) {
        return false;
      }
    }

    if (event.faction && event.faction !== 'neutral' && event.faction !== gameState.faction) {
      return false;
    }

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
      eventManager.updateTurn(testGameState.turn);
      const managerState = buildManagerGameState();
      const availableEvents = eventManager.getAvailableEvents(managerState);
      const conditionalChance = eventManager.calculateConditionalChance(event, availableEvents);
      const triggerChance = eventManager.calculateTriggerChance(event, availableEvents);
      const conditionalLabel = conditionalChance > 0 ? formatPercent(conditionalChance) : null;
      const triggerLabel = formatPercent(triggerChance);

      setTriggerResults(prev => [
        ...prev,
        `✅ Triggered: ${event.title} - ${formatEffects(event.effects)} (Chance This Turn: ${triggerLabel}${conditionalLabel ? `, If Triggered: ${conditionalLabel}` : ''})`,
      ]);
    } else {
      setTriggerResults(prev => [...prev, `❌ Cannot trigger ${event.title} - Conditions not met: ${formatConditions(event.conditions)}`]);
    }
  };

  const analyzeWeightDistribution = () => {
    eventManager.updateTurn(testGameState.turn);
    const managerState = buildManagerGameState();
    const availableEvents = eventManager.getAvailableEvents(managerState);

    if (!availableEvents.length) {
      setProbabilityResults([]);
      return;
    }

    const probabilities = availableEvents
      .map(event => ({
        event,
        conditionalChance: eventManager.calculateConditionalChance(event, availableEvents),
        triggerChance: eventManager.calculateTriggerChance(event, availableEvents),
      }))
      .sort((a, b) => b.triggerChance - a.triggerChance);

    setProbabilityResults(probabilities);
  };

  const runSimulation = (iterations: number = 1000) => {
    const testManager = new EventManager();

    const results: {[key: string]: number} = {};
    let triggeredCount = 0;

    for (let i = 0; i < iterations; i++) {
      testManager.reset();
      testManager.updateTurn(testGameState.turn);
      const mockGameState = buildManagerGameState();

      const selectedEvent = testManager.maybeSelectRandomEvent(mockGameState);
      if (selectedEvent) {
        triggeredCount += 1;
        results[selectedEvent.id] = (results[selectedEvent.id] || 0) + 1;
      }
    }

    setSimulationResults(results);
    setSimulationIterations(iterations);
    setSimulationTriggerCount(triggeredCount);
  };

  const clearTestingResults = () => {
    setTriggerResults([]);
    setProbabilityResults([]);
    setSimulationResults({});
    setSimulationIterations(1000);
    setSimulationTriggerCount(0);
  };

  const renderHeader = () => (
    <div
      className={`flex items-center justify-between ${
        isModal
          ? 'p-4 border-b border-gray-700'
          : 'p-4 border-b border-gray-800 bg-gray-900/60'
      }`}
    >
      <div>
        <h2
          className={`text-xl font-bold font-mono ${
            isModal ? 'text-white' : 'text-emerald-200'
          }`}
        >
          EVENT DATABASE
        </h2>
        {!isModal && (
          <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-400">
            Dev Tool Access
          </p>
        )}
      </div>
      {isModal ? (
        onClose ? (
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-600"
          >
            Close
          </Button>
        ) : null
      ) : (
        <Badge
          variant="outline"
          className="uppercase tracking-wide text-[11px] text-emerald-300 border-emerald-500/40"
        >
          Dev Tool
        </Badge>
      )}
    </div>
  );

  const renderContent = () => (
    <div className={`${isModal ? 'p-4 h-full' : 'p-4 flex-1'} overflow-hidden`}> 
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as EventViewerTab)}
        className="flex h-full flex-col"
      >
        <TabsList
          className={`${
            isModal
              ? 'grid w-full grid-cols-3 bg-gray-800'
              : 'grid w-full grid-cols-3 gap-1 rounded-md border border-gray-800 bg-gray-900/60 p-1'
          }`}
        >
          <TabsTrigger value="browser" className="text-xs uppercase tracking-wide">
            Event Browser
          </TabsTrigger>
          <TabsTrigger value="statistics" className="text-xs uppercase tracking-wide">
            Statistics
          </TabsTrigger>
          <TabsTrigger value="testing" className="text-xs uppercase tracking-wide">
            Testing Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="browser"
          className="mt-4 flex-1 overflow-hidden focus-visible:outline-none"
        >
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="h-full border-gray-700 bg-gray-800 p-4">
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

                    <ScrollArea className={listHeightClass}>
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
                  <Card className="h-full border-gray-700 bg-gray-800 p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {selectedEvent ? 'Event Details' : 'Select an Event'}
                    </h3>
                    {selectedEvent ? (
                      <ScrollArea className={detailHeightClass}>
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

        <TabsContent
          value="statistics"
          className="mt-4 flex-1 overflow-y-auto space-y-6 focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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

          <div>
            <Card className="border-gray-700 bg-gray-800 p-4">
              <h3 className="mb-4 text-lg font-semibold text-white">Events by Type</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {Object.entries(eventStats.byType).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="text-xl font-bold text-white">{count}</div>
                    <div className="text-sm capitalize text-gray-400">{type}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="testing"
          className="mt-4 flex-1 overflow-y-auto focus-visible:outline-none"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

                    <div>
                      <Label className="text-sm text-gray-300">Faction</Label>
                      <select
                        value={testGameState.faction}
                        onChange={(event) => setTestGameState(prev => ({ ...prev, faction: event.target.value as TestGameState['faction'] }))}
                        className="mt-2 w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white"
                      >
                        <option value="truth">Truth</option>
                        <option value="government">Government</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-300">Specific Controlled States (comma separated)</Label>
                      <Input
                        value={testGameState.controlledStateIds}
                        onChange={(event) => setTestGameState(prev => ({ ...prev, controlledStateIds: event.target.value }))}
                        placeholder="e.g. CA, NY, TX"
                        className="mt-2 bg-gray-700 text-white"
                      />
                      <p className="mt-1 text-[11px] text-gray-400">
                        Include state abbreviations to satisfy events that require specific territories.
                      </p>
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

                  <div className="text-xs text-gray-400 mb-4">
                    Base event roll chance: {formatPercent(eventManager.getBaseEventChance())}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Weight Distribution */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Available Events (Current State)</h4>
                      <ScrollArea className="h-48 border border-gray-700 rounded">
                        <div className="p-2 space-y-1">
                          {probabilityResults.length > 0 ? (
                            probabilityResults.slice(0, 10).map(({ event, triggerChance, conditionalChance }) => (
                              <div key={event.id} className="flex justify-between text-xs">
                                <span className="text-gray-300 truncate mr-2">{event.title}</span>
                                <div className="flex items-center gap-2">
                                  <Badge className={getRarityColor(event.rarity)}>
                                    {event.rarity}
                                  </Badge>
                                  <div className="text-right">
                                    <div className="text-white font-mono">{formatPercent(triggerChance)}</div>
                                    <div className="text-[10px] text-gray-400">If triggered: {formatPercent(conditionalChance)}</div>
                                  </div>
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
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Simulation Results ({simulationIterations} iterations)</h4>
                      <ScrollArea className="h-48 border border-gray-700 rounded">
                        <div className="p-2 space-y-1">
                          {Object.keys(simulationResults).length > 0 ? (
                            Object.entries(simulationResults)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 10)
                              .map(([eventId, count]) => {
                                const event = EVENT_DATABASE.find(e => e.id === eventId);
                                if (!event) return null;
                                const perTurn = count / simulationIterations;
                                const shareOfTriggers = simulationTriggerCount > 0 ? count / simulationTriggerCount : 0;
                                return (
                                  <div key={eventId} className="flex justify-between text-xs">
                                    <span className="text-gray-300 truncate mr-2">{event.title}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getRarityColor(event.rarity)}>
                                        {event.rarity}
                                      </Badge>
                                      <span className="text-white font-mono">
                                        {count} ({formatPercent(perTurn)}
                                        {simulationTriggerCount > 0 ? ` · ${formatPercent(shareOfTriggers)} of triggers` : ''})
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
                      {simulationTriggerCount > 0 ? (
                        <div className="mt-2 text-[11px] text-gray-400">
                          Triggered {simulationTriggerCount} times out of {simulationIterations} iterations.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <Card className="h-[90vh] w-full max-w-7xl overflow-hidden border-gray-700 bg-gray-900">
          {renderHeader()}
          {renderContent()}
        </Card>
      </div>
    );
  }

  const baseEmbeddedClass = 'flex h-full flex-col overflow-hidden rounded-lg border border-gray-800/80 bg-gray-950/80';
  const combinedClassName = className ? `${baseEmbeddedClass} ${className}` : baseEmbeddedClass;

  return (
    <div className={combinedClassName}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};

export default EventViewer;