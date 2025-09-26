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
    clearNewlyUnlocked,
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
      case 'common':
        return 'border border-slate-500/60 bg-slate-900/60 text-slate-300';
      case 'uncommon':
        return 'border border-emerald-400/60 bg-emerald-500/15 text-emerald-200';
      case 'rare':
        return 'border border-sky-400/60 bg-sky-500/15 text-sky-200';
      case 'legendary':
        return 'border border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-200';
      default:
        return 'border border-slate-500/60 bg-slate-900/60 text-slate-300';
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
    <div className={`flex h-full flex-col gap-5 text-slate-200 ${className ?? ''}`}>
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950/85 px-5 py-4 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
        <div className="pointer-events-none absolute inset-0 opacity-45">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.25),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(56,189,248,0.16),_transparent_50%,_rgba(16,185,129,0.18))]" />
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/15 text-emerald-200 shadow-[0_0_35px_rgba(16,185,129,0.25)]">
              <Trophy size={22} />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-200/80">Achievements Matrix</div>
              <h2 className="font-mono text-xl font-semibold uppercase tracking-[0.15em] text-emerald-100">ACHIEVEMENTS</h2>
              <div className="text-sm text-emerald-100/70">
                {progress.unlocked}/{progress.total} unlocked • {progress.totalPoints} points • {progress.rank}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={exportProgress}
              variant="outline"
              size="sm"
              className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200 transition hover:bg-emerald-500/20 hover:text-emerald-100"
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
            <Button
              onClick={importProgress}
              variant="outline"
              size="sm"
              className="border-sky-400/40 bg-sky-500/10 text-sky-200 transition hover:bg-sky-500/20 hover:text-sky-100"
            >
              <Upload size={16} className="mr-1" />
              Import
            </Button>
            <Button
              onClick={handleResetProgress}
              variant="outline"
              size="sm"
              className="border-rose-400/40 bg-rose-500/10 text-rose-200 transition hover:bg-rose-500/20 hover:text-rose-100"
            >
              <RotateCcw size={16} className="mr-1" />
              Reset
            </Button>
            {showCloseButton && onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-emerald-400/30 bg-slate-950/60 text-slate-300 transition hover:bg-emerald-500/20 hover:text-emerald-100"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-emerald-500/25 bg-slate-950/80 p-5 shadow-inner shadow-emerald-500/15">
        <Tabs defaultValue="achievements" className="flex h-full flex-col gap-5">
          <TabsList className="grid w-full grid-cols-3 gap-2 rounded-lg border border-emerald-500/20 bg-slate-900/70 p-1 backdrop-blur">
            <TabsTrigger
              value="achievements"
              className="rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200"
            >
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200"
            >
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="rounded-md border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400 transition data-[state=active]:border-emerald-400/60 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-200"
            >
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="flex-1 overflow-hidden focus-visible:outline-none">
            <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="flex h-full flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100">Achievement List</h3>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="rounded-md border border-emerald-500/30 bg-slate-900/70 px-3 py-2 text-sm uppercase tracking-[0.2em] text-emerald-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
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

                  <ScrollArea className="h-[60vh] pr-2">
                    <div className="space-y-6">
                      {filteredUnlocked.length > 0 && (
                        <div>
                          <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                            Unlocked ({filteredUnlocked.length})
                          </h4>
                          <div className="space-y-2">
                            {filteredUnlocked.map(achievement => (
                              <button
                                key={achievement.id}
                                type="button"
                                className={`w-full rounded-xl border p-4 text-left transition-all ${
                                  selectedAchievement?.id === achievement.id
                                    ? 'border-emerald-400/60 bg-emerald-500/15 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                                    : 'border-emerald-500/20 bg-slate-900/60 hover:border-emerald-400/40 hover:bg-slate-900/80'
                                }`}
                                onClick={() => setSelectedAchievement(achievement)}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="text-3xl text-emerald-200">{achievement.icon}</div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5 className="text-base font-semibold text-slate-100">{achievement.name}</h5>
                                      <Badge className={`${getRarityColor(achievement.rarity)} uppercase tracking-wide`}> 
                                        {achievement.rarity}
                                      </Badge>
                                      <Badge className="border border-amber-400/60 bg-amber-500/15 text-amber-200">
                                        {achievement.points}pts
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-slate-300">{achievement.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-emerald-200/70">
                                      {getCategoryIcon(achievement.category)}
                                      <span className="capitalize">{achievement.category}</span>
                                      <span className="text-emerald-300">✓ Completed</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredLocked.length > 0 && (
                        <div>
                          <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                            Locked ({filteredLocked.length})
                          </h4>
                          <div className="space-y-2">
                            {filteredLocked.map(achievement => (
                              <button
                                key={achievement.id}
                                type="button"
                                className={`w-full rounded-xl border p-4 text-left transition-all ${
                                  selectedAchievement?.id === achievement.id
                                    ? 'border-sky-400/60 bg-sky-500/15 shadow-[0_0_25px_rgba(56,189,248,0.25)]'
                                    : 'border-emerald-500/15 bg-slate-900/50 hover:border-emerald-400/30 hover:bg-slate-900/70'
                                } opacity-70`}
                                onClick={() => setSelectedAchievement(achievement)}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="text-3xl text-slate-400">{achievement.icon}</div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5 className="text-base font-semibold text-slate-200">{achievement.name}</h5>
                                      <Badge className={`${getRarityColor(achievement.rarity)} uppercase tracking-wide`}>
                                        {achievement.rarity}
                                      </Badge>
                                      <Badge className="border border-amber-400/60 bg-amber-500/10 text-amber-200">
                                        {achievement.points}pts
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-slate-400">{achievement.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                      {getCategoryIcon(achievement.category)}
                                      <span className="capitalize">{achievement.category}</span>
                                      <span>🔒 Locked</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              <div>
                <Card className="flex h-full flex-col rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                  <h3 className="mb-4 text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100">
                    {selectedAchievement ? 'Achievement Details' : 'Select Achievement'}
                  </h3>
                  {selectedAchievement ? (
                    <ScrollArea className="h-[60vh] pr-2">
                      <div className="space-y-5">
                        <div className="text-center">
                          <div className="mb-3 text-6xl text-emerald-200">{selectedAchievement.icon}</div>
                          <h4 className="text-xl font-bold text-slate-100">{selectedAchievement.name}</h4>
                          <p className="mt-2 text-sm text-slate-300">{selectedAchievement.description}</p>
                        </div>

                        <div className="space-y-4 text-sm">
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Category</span>
                            <div className="flex items-center gap-2 text-emerald-200">
                              {getCategoryIcon(selectedAchievement.category)}
                              <span className="capitalize">{selectedAchievement.category}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span>Rarity</span>
                            <Badge className={`${getRarityColor(selectedAchievement.rarity)} uppercase tracking-wide`}>
                              {selectedAchievement.rarity}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span>Points</span>
                            <span className="font-semibold text-amber-300">{selectedAchievement.points}</span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span>Status</span>
                            <Badge className={
                              unlockedAchievements.find(a => a.id === selectedAchievement.id)
                                ? 'border border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                                : 'border border-rose-400/60 bg-rose-500/15 text-rose-200'
                            }>
                              {unlockedAchievements.find(a => a.id === selectedAchievement.id) ? '✓ Unlocked' : '🔒 Locked'}
                            </Badge>
                          </div>

                          {selectedAchievement.requirements && (
                            <div className="space-y-2">
                              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Requirements</div>
                              <div className="space-y-2">
                                {selectedAchievement.requirements.conditions.map((condition, index) => (
                                  <div key={index} className="rounded-lg border border-emerald-500/20 bg-slate-900/60 p-2 text-xs text-slate-300">
                                    {condition.key.replace(/_/g, ' ')}: {condition.operator || '=='} {condition.value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedAchievement.rewards && (
                            <div className="space-y-2">
                              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Rewards</div>
                              <div className="space-y-1 text-xs text-emerald-200">
                                {selectedAchievement.rewards.title && (
                                  <div>Title: {selectedAchievement.rewards.title}</div>
                                )}
                                {selectedAchievement.rewards.unlockTutorial && (
                                  <div className="text-sky-200">
                                    Unlocks: {selectedAchievement.rewards.unlockTutorial} tutorial
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedAchievement.hidden && (
                            <div className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 p-4">
                              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-200">Hidden Achievement</div>
                              <div className="mt-1 text-xs text-fuchsia-100/80">
                                This is a secret achievement that was discovered through special actions.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                      <Trophy size={48} className="opacity-40" />
                      <div className="text-lg font-medium text-slate-300">Achievement Details</div>
                      <div className="text-sm text-slate-400">Click on an achievement to view detailed information</div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics" className="flex-1 overflow-y-auto focus-visible:outline-none">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="text-2xl font-bold text-emerald-200">{stats.total_games_played}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Games Played</div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="text-2xl font-bold text-emerald-300">{stats.games_won}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Games Won</div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="text-2xl font-bold text-amber-300">{stats.max_win_streak}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Best Win Streak</div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="text-2xl font-bold text-sky-300">{progress.totalPoints}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Achievement Points</div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="text-2xl font-bold text-fuchsia-300">{stats.legendary_cards_played}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Legendary Cards</div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="text-2xl font-bold text-rose-300">{stats.max_states_controlled_single_game}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Max States Controlled</div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="text-2xl font-bold text-cyan-300">{stats.fastest_victory_turns === 999 ? '—' : stats.fastest_victory_turns}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Fastest Victory (turns)</div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <div className="text-2xl font-bold text-orange-300">{Math.round(stats.total_play_time_minutes / 60)}h</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Play Time</div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)] md:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-2xl font-bold text-fuchsia-300">{stats.total_combos_executed}</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Combos Triggered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-sky-300">{stats.highest_combo_chain}</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Best Combo Chain</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-300">{stats.max_combos_in_single_game}</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Most Combos in a Game</div>
                  </div>
                </div>
              </Card>
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)] md:col-span-2">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Combo Category Breakdown</h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <span>Sequence</span>
                    <span className="font-semibold text-slate-100">{stats.total_sequence_combos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Count</span>
                    <span className="font-semibold text-slate-100">{stats.total_count_combos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Threshold</span>
                    <span className="font-semibold text-slate-100">{stats.total_threshold_combos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>State Control</span>
                    <span className="font-semibold text-slate-100">{stats.total_state_combos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hybrid</span>
                    <span className="font-semibold text-slate-100">{stats.total_hybrid_combos}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="flex-1 overflow-y-auto focus-visible:outline-none">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <h3 className="mb-4 text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100">Overall Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                      <span>Achievements</span>
                      <span>{progress.unlocked}/{progress.total}</span>
                    </div>
                    <Progress value={progress.completionRate} className="h-3 bg-slate-900/60" />
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                    <div className="text-sm uppercase tracking-[0.35em] text-emerald-200/80">Current Rank</div>
                    <div className="text-2xl font-bold text-emerald-100">{progress.rank}</div>
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 text-slate-200 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <h3 className="mb-4 text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100">Category Progress</h3>
                <div className="space-y-3">
                  {['victory', 'mastery', 'discovery', 'challenge', 'social', 'collection'].map(category => {
                    const total = ACHIEVEMENTS.filter(a => a.category === category && !a.hidden).length;
                    const unlocked = unlockedAchievements.filter(a => a.category === category).length;
                    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                          <div className="flex items-center gap-2 text-slate-300">
                            {getCategoryIcon(category)}
                            <span className="capitalize tracking-normal">{category}</span>
                          </div>
                          <span>{unlocked}/{total}</span>
                        </div>
                        <Progress value={percentage} className="h-2 bg-slate-900/60" />
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
      <Card className="relative h-[90vh] w-full max-w-7xl overflow-hidden border border-emerald-500/25 bg-slate-950/95 text-slate-100 shadow-[0_0_80px_rgba(16,185,129,0.25)]">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(56,189,248,0.12),_transparent_55%)]" />
        </div>
        <div className="relative h-full p-6">
          <AchievementsSection onClose={onClose} showCloseButton className="h-full" />
        </div>
      </Card>
    </div>
  );
};

export default AchievementPanel;
