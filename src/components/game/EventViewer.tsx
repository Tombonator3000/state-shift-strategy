import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EventManager, EVENT_DATABASE, type GameEvent } from '@/data/eventDatabase';
import { AlertTriangle, Zap, Eye, Crown, Calendar, Filter } from 'lucide-react';

interface EventViewerProps {
  onClose: () => void;
}

const EventViewer = ({ onClose }: EventViewerProps) => {
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
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
              <Card className="p-4 bg-gray-800 border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Event Testing Tools</h3>
                <div className="text-sm text-gray-400">
                  Testing tools for developers to trigger specific events and analyze probability distributions.
                  This would include controls to manually trigger events, view weight distributions, and test condition logic.
                </div>
                <div className="mt-4 p-4 bg-gray-700 rounded">
                  <div className="text-xs text-yellow-400">Development Feature</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Event testing interface would be implemented here for debugging and balancing purposes.
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default EventViewer;