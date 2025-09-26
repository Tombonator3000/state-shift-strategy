import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Trophy, Star, Target, Zap, Users, BookOpen, Eye, Download, Upload, RotateCcw } from 'lucide-react';
import { ACHIEVEMENTS, type Achievement } from '@/data/achievementSystem';
import { useAchievements } from '@/contexts/AchievementContext';
import { useToast } from '@/hooks/use-toast';

interface AchievementsSectionProps {
  onClose?: () => void;
  className?: string;
  showCloseButton?: boolean;
}

export const AchievementsSection = ({
  onClose,
  className,
  showCloseButton = false,
}: AchievementsSectionProps) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const {
    manager,
    stats,
    unlockedAchievements,
    lockedAchievements,
    newlyUnlocked,
    exportData,
    importData,
    resetProgress,
    clearNewlyUnlocked
  } = useAchievements();

  const { toast } = useToast();

  const progress = manager.getProgress();

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      clearNewlyUnlocked();
    }
  }, [newlyUnlocked, clearNewlyUnlocked]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'victory': return <Trophy size={16} />;
      case 'mastery': return <Star size={16} />;
      case 'discovery': return <Eye size={16} />;
      case 'challenge': return <Target size={16} />;
      case 'social': return <Users size={16} />;
      case 'collection': return <BookOpen size={16} />;
      default: return <Zap size={16} />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-900/20 border-gray-600';
      case 'uncommon': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'rare': return 'text-blue-400 bg-blue-900/20 border-blue-600';
      case 'legendary': return 'text-purple-400 bg-purple-900/20 border-purple-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const filteredUnlocked = filter === 'all'
    ? unlockedAchievements
    : unlockedAchievements.filter(a => a.category === filter);

  const filteredLocked = filter === 'all'
    ? lockedAchievements
    : lockedAchievements.filter(a => a.category === filter);

  const exportProgress = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shadow-government-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Progress Exported',
      description: 'Your achievements and statistics have been downloaded',
    });
  };

  const importProgress = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            importData(data);
          } catch (error) {
            toast({
              title: 'Import Failed',
              description: 'Invalid file format',
              variant: 'destructive',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all achievements and statistics? This cannot be undone.')) {
      resetProgress();
    }
  };

  return (
    <div className={`flex h-full flex-col ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-white font-mono">ACHIEVEMENTS</h2>
            <div className="text-sm text-gray-400">
              {progress.unlocked}/{progress.total} unlocked • {progress.totalPoints} points • {progress.rank}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportProgress}
            variant="outline"
            size="sm"
            className="text-green-400 border-green-600 hover:bg-green-900/20"
          >
            <Download size={16} className="mr-1" />
            Export
          </Button>
          <Button
            onClick={importProgress}
            variant="outline"
            size="sm"
            className="text-blue-400 border-blue-600 hover:bg-blue-900/20"
          >
            <Upload size={16} className="mr-1" />
            Import
          </Button>
          <Button
            onClick={handleResetProgress}
            variant="outline"
            size="sm"
            className="text-red-400 border-red-600 hover:bg-red-900/20"
          >
            <RotateCcw size={16} className="mr-1" />
            Reset
          </Button>
          {showCloseButton && onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-600"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <Tabs defaultValue="achievements" className="h-full">
          <TabsList className="mb-4 grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="h-full">
            <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="h-full border-gray-700 bg-gray-800 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Achievement List</h3>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="rounded border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white"
                    >
                      <option value="all">All Categories</option>
                      <option value="victory">Victory</option>
                      <option value="mastery">Mastery</option>
                      <option value="discovery">Discovery</option>
                      <option value="challenge">Challenge</option>
                      <option value="social">Social</option>
                      <option value="collection">Collection</option>
                    </select>
                  </div>

                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                      {filteredUnlocked.length > 0 && (
                        <div>
                          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-green-400">
                            Unlocked ({filteredUnlocked.length})
                          </h4>
                          <div className="space-y-2">
                            {filteredUnlocked.map(achievement => (
                              <div
                                key={achievement.id}
                                className={`rounded p-3 transition-colors cursor-pointer ${
                                  selectedAchievement?.id === achievement.id
                                    ? 'bg-blue-900/30 border border-blue-600'
                                    : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                                onClick={() => setSelectedAchievement(achievement)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">{achievement.icon}</div>
                                  <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <h5 className="font-semibold text-white">{achievement.name}</h5>
                                      <Badge className={getRarityColor(achievement.rarity)}>
                                        {achievement.rarity}
                                      </Badge>
                                      <Badge className="bg-yellow-900/20 text-yellow-400">
                                        {achievement.points}pts
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-300">{achievement.description}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                      {getCategoryIcon(achievement.category)}
                                      <span className="text-xs capitalize text-gray-500">{achievement.category}</span>
                                      <span className="text-xs text-green-400">✓ Completed</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredLocked.length > 0 && (
                        <div>
                          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
                            Locked ({filteredLocked.length})
                          </h4>
                          <div className="space-y-2">
                            {filteredLocked.map(achievement => (
                              <div
                                key={achievement.id}
                                className={`rounded p-3 transition-colors opacity-60 cursor-pointer ${
                                  selectedAchievement?.id === achievement.id
                                    ? 'bg-blue-900/30 border border-blue-600'
                                    : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                                onClick={() => setSelectedAchievement(achievement)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl grayscale">{achievement.icon}</div>
                                  <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                      <h5 className="font-semibold text-gray-300">{achievement.name}</h5>
                                      <Badge className={getRarityColor(achievement.rarity)}>
                                        {achievement.rarity}
                                      </Badge>
                                      <Badge className="bg-yellow-900/20 text-yellow-400">
                                        {achievement.points}pts
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-400">{achievement.description}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                      {getCategoryIcon(achievement.category)}
                                      <span className="text-xs capitalize text-gray-500">{achievement.category}</span>
                                      <span className="text-xs text-gray-500">🔒 Locked</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              <div>
                <Card className="h-full border-gray-700 bg-gray-800 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-white">
                    {selectedAchievement ? 'Achievement Details' : 'Select Achievement'}
                  </h3>
                  {selectedAchievement ? (
                    <ScrollArea className="h-[60vh]">
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="mb-2 text-6xl">{selectedAchievement.icon}</div>
                          <h4 className="text-xl font-bold text-white">{selectedAchievement.name}</h4>
                          <p className="mt-1 text-sm text-gray-300">{selectedAchievement.description}</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Category:</span>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(selectedAchievement.category)}
                              <span className="text-sm capitalize text-white">{selectedAchievement.category}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Rarity:</span>
                            <Badge className={getRarityColor(selectedAchievement.rarity)}>
                              {selectedAchievement.rarity}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Points:</span>
                            <span className="text-sm font-bold text-yellow-400">{selectedAchievement.points}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Status:</span>
                            <Badge className={
                              unlockedAchievements.find(a => a.id === selectedAchievement.id)
                                ? 'text-green-400 bg-green-900/20'
                                : 'text-red-400 bg-red-900/20'
                            }>
                              {unlockedAchievements.find(a => a.id === selectedAchievement.id) ? '✓ Unlocked' : '🔒 Locked'}
                            </Badge>
                          </div>

                          {selectedAchievement.requirements && (
                            <div>
                              <div className="mb-2 text-sm text-gray-400">Requirements:</div>
                              <div className="space-y-1">
                                {selectedAchievement.requirements.conditions.map((condition, index) => (
                                  <div key={index} className="rounded bg-gray-700 p-2 text-xs text-gray-500">
                                    {condition.key.replace(/_/g, ' ')}: {condition.operator || '=='} {condition.value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedAchievement.rewards && (
                            <div>
                              <div className="mb-2 text-sm text-gray-400">Rewards:</div>
                              <div className="space-y-1">
                                {selectedAchievement.rewards.title && (
                                  <div className="text-xs text-yellow-400">Title: {selectedAchievement.rewards.title}</div>
                                )}
                                {selectedAchievement.rewards.unlockTutorial && (
                                  <div className="text-xs text-blue-400">
                                    Unlocks: {selectedAchievement.rewards.unlockTutorial} tutorial
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedAchievement.hidden && (
                            <div className="rounded border border-purple-600 bg-purple-900/20 p-3">
                              <div className="text-sm font-bold text-purple-400">Hidden Achievement</div>
                              <div className="mt-1 text-xs text-purple-300">
                                This is a secret achievement that was discovered through special actions.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                      <div className="mb-2 text-lg font-medium">Achievement Details</div>
                      <div className="text-sm">
                        Click on an achievement to view detailed information
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-gray-700 bg-gray-800 p-4">
                <div className="text-2xl font-bold text-white">{stats.total_games_played}</div>
                <div className="text-sm text-gray-400">Games Played</div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4">
                <div className="text-2xl font-bold text-green-400">{stats.games_won}</div>
                <div className="text-sm text-gray-400">Games Won</div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4">
                <div className="text-2xl font-bold text-yellow-400">{stats.max_win_streak}</div>
                <div className="text-sm text-gray-400">Best Win Streak</div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4">
                <div className="text-2xl font-bold text-blue-400">{progress.totalPoints}</div>
                <div className="text-sm text-gray-400">Achievement Points</div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4">
                <div className="text-2xl font-bold text-purple-400">{stats.legendary_cards_played}</div>
                <div className="text-sm text-gray-400">Legendary Cards</div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4">
                <div className="text-2xl font-bold text-red-400">{stats.max_states_controlled_single_game}</div>
                <div className="text-sm text-gray-400">Max States Controlled</div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4">
                <div className="text-2xl font-bold text-cyan-400">
                  {stats.fastest_victory_turns === 999 ? '—' : stats.fastest_victory_turns}
                </div>
                <div className="text-sm text-gray-400">Fastest Victory (turns)</div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4">
                <div className="text-2xl font-bold text-orange-400">{Math.round(stats.total_play_time_minutes / 60)}h</div>
                <div className="text-sm text-gray-400">Play Time</div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4 md:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-2xl font-bold text-fuchsia-400">{stats.total_combos_executed}</div>
                    <div className="text-sm text-gray-400">Combos Triggered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-400">{stats.highest_combo_chain}</div>
                    <div className="text-sm text-gray-400">Best Combo Chain</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400">{stats.max_combos_in_single_game}</div>
                    <div className="text-sm text-gray-400">Most Combos in a Game</div>
                  </div>
                </div>
              </Card>
              <Card className="border-gray-700 bg-gray-800 p-4 md:col-span-2">
                <h4 className="mb-3 text-sm font-semibold text-gray-200">Combo Category Breakdown</h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-300 sm:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <span>Sequence</span>
                    <span className="font-semibold text-white">{stats.total_sequence_combos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Count</span>
                    <span className="font-semibold text-white">{stats.total_count_combos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Threshold</span>
                    <span className="font-semibold text-white">{stats.total_threshold_combos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>State Control</span>
                    <span className="font-semibold text-white">{stats.total_state_combos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hybrid</span>
                    <span className="font-semibold text-white">{stats.total_hybrid_combos}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="border-gray-700 bg-gray-800 p-4">
                <h3 className="mb-4 text-lg font-semibold text-white">Overall Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Achievements</span>
                      <span>{progress.unlocked}/{progress.total}</span>
                    </div>
                    <Progress value={progress.completionRate} className="h-3" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{progress.rank}</div>
                    <div className="text-sm text-gray-400">Current Rank</div>
                  </div>
                </div>
              </Card>

              <Card className="border-gray-700 bg-gray-800 p-4">
                <h3 className="mb-4 text-lg font-semibold text-white">Category Progress</h3>
                <div className="space-y-3">
                  {['victory', 'mastery', 'discovery', 'challenge', 'social', 'collection'].map(category => {
                    const total = ACHIEVEMENTS.filter(a => a.category === category && !a.hidden).length;
                    const unlocked = unlockedAchievements.filter(a => a.category === category).length;
                    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

                    return (
                      <div key={category}>
                        <div className="mb-1 flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(category)}
                            <span className="capitalize">{category}</span>
                          </div>
                          <span>{unlocked}/{total}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface AchievementPanelProps {
  onClose: () => void;
}

const AchievementPanel = ({ onClose }: AchievementPanelProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="h-[90vh] w-full max-w-7xl overflow-hidden border-gray-700 bg-gray-900">
        <AchievementsSection onClose={onClose} showCloseButton className="h-full" />
      </Card>
    </div>
  );
};

export default AchievementPanel;