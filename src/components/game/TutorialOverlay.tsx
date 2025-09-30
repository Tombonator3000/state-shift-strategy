import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Play, BookOpen, Award } from 'lucide-react';
import { TutorialManager, TUTORIAL_SEQUENCES, type TutorialSequence } from '@/data/tutorialSystem';
import { useToast } from '@/hooks/use-toast';

interface TutorialSectionProps {
  onClose?: () => void;
  onStartTutorial?: (sequenceId: string) => void;
  className?: string;
  showCloseButton?: boolean;
  isActive?: boolean;
}

export const TutorialSection = ({
  onClose,
  onStartTutorial,
  className,
  showCloseButton = false,
  isActive = true,
}: TutorialSectionProps) => {
  const [tutorialManager] = useState(() => new TutorialManager());
  const [selectedSequence, setSelectedSequence] = useState<TutorialSequence | null>(null);
  const { toast } = useToast();

  const stats = tutorialManager.getStats();
  const availableSequences = tutorialManager.getAvailableSequences();
  const completedSequences = tutorialManager.getCompletedSequences();

  useEffect(() => {
    if (!isActive) {
      setSelectedSequence(null);
    }
  }, [isActive]);

  const handleStartTutorial = (sequenceId: string) => {
    const success = tutorialManager.startSequence(sequenceId);
    if (success) {
      const sequence = TUTORIAL_SEQUENCES.find(s => s.id === sequenceId);
      toast({
        title: 'Tutorial Started',
        description: `Beginning ${sequence?.name ?? 'tutorial sequence'}`,
      });
      onStartTutorial?.(sequenceId);
      onClose?.();
    } else {
      toast({
        title: 'Tutorial Unavailable',
        description: 'Complete prerequisite tutorials first',
        variant: 'destructive'
      });
    }
  };

  const getSequenceStatus = (sequence: TutorialSequence) => {
    if (completedSequences.includes(sequence.id)) {
      return { status: 'completed', color: 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-200' };
    } else if (tutorialManager.isSequenceAvailable(sequence.id)) {
      return { status: 'available', color: 'border border-sky-400/50 bg-sky-500/15 text-sky-200' };
    } else {
      return { status: 'locked', color: 'border border-slate-500/50 bg-slate-900/60 text-slate-300' };
    }
  };

  const getDifficultyColor = (sequence: TutorialSequence) => {
    const stepCount = sequence.steps.length;
    if (stepCount <= 5) return 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-200';
    if (stepCount <= 10) return 'border border-amber-400/50 bg-amber-500/15 text-amber-200';
    return 'border border-rose-400/50 bg-rose-500/15 text-rose-200';
  };

  const getDifficultyText = (sequence: TutorialSequence) => {
    const stepCount = sequence.steps.length;
    if (stepCount <= 5) return 'Basic';
    if (stepCount <= 10) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <div className={`flex h-full flex-col gap-5 text-slate-200 ${className ?? ''}`}>
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950/85 px-5 py-4 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
        <div className="pointer-events-none absolute inset-0 opacity-45">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(16,185,129,0.16),_transparent_50%,_rgba(56,189,248,0.14))]" />
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/50 bg-sky-500/15 text-sky-200 shadow-[0_0_35px_rgba(56,189,248,0.3)]">
              <BookOpen size={22} />
            </div>
            <div className="space-y-1">
              <div className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-200/80">Shadow Academy</div>
              <h2 className="font-mono text-xl font-semibold uppercase tracking-[0.2em] text-emerald-100">TRAINING VAULT</h2>
              <div className="text-sm text-emerald-100/70">Master the art of shadow operations</div>
            </div>
          </div>
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

      <div className="flex-1 overflow-hidden rounded-2xl border border-emerald-500/25 bg-slate-950/80 p-5 shadow-inner shadow-emerald-500/15">
        <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="flex h-full flex-col rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-semibold uppercase tracking-[0.2em] text-emerald-100">Training Modules</h3>
                <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Progress: {stats.completionRate}%</span>
                  <Progress value={stats.completionRate} className="h-2 w-24 bg-slate-900/60" />
                </div>
              </div>

              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {TUTORIAL_SEQUENCES.map(sequence => {
                  const { status, color } = getSequenceStatus(sequence);
                  const isSelected = selectedSequence?.id === sequence.id;

                  return (
                    <div
                      key={sequence.id}
                      className={`rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-sky-400/60 bg-sky-500/15 shadow-[0_0_25px_rgba(56,189,248,0.25)]'
                          : status === 'locked'
                            ? 'border-emerald-500/15 bg-slate-900/50 opacity-60'
                            : 'border-emerald-500/20 bg-slate-900/60 hover:border-emerald-400/40 hover:bg-slate-900/80'
                      }`}
                      onClick={() => {
                        if (status !== 'locked') {
                          setSelectedSequence(sequence);
                        }
                      }}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-slate-200">
                          <div className={`h-3 w-3 rounded-full ${
                            status === 'completed' ? 'bg-emerald-300' : status === 'available' ? 'bg-sky-300' : 'bg-slate-600'
                          }`} />
                          <h4 className="font-semibold uppercase tracking-[0.1em] text-emerald-100">{sequence.name}</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${color} uppercase tracking-wide`}>
                            {status === 'completed' ? 'Completed'
                              : status === 'available' ? 'Available' : 'Locked'}
                          </Badge>
                          <Badge className={`${getDifficultyColor(sequence)} uppercase tracking-wide`}>
                            {getDifficultyText(sequence)}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-2 text-sm text-slate-300">
                        {sequence.description}
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
                        <span>{sequence.steps.length} steps</span>
                        {sequence.prerequisites && (
                          <span>Requires: {sequence.prerequisites.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div>
            <Card className="flex h-full flex-col rounded-2xl border border-emerald-500/20 bg-slate-950/75 p-5 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              {selectedSequence ? (
                <div className="flex h-full flex-col gap-5">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-emerald-100">{selectedSequence.name}</h3>
                    <div className="text-sm leading-relaxed text-slate-300">
                      {selectedSequence.description}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Steps</span>
                      <span className="text-emerald-200">{selectedSequence.steps.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Difficulty</span>
                      <Badge className={`${getDifficultyColor(selectedSequence)} uppercase tracking-wide`}>
                        {getDifficultyText(selectedSequence)}
                      </Badge>
                    </div>

                    {selectedSequence.prerequisites && (
                      <div className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Prerequisites</span>
                        <div className="space-y-1">
                          {selectedSequence.prerequisites.map(prereq => {
                            const isCompleted = completedSequences.includes(prereq);
                            const prereqSequence = TUTORIAL_SEQUENCES.find(s => s.id === prereq);
                            return (
                              <div key={prereq} className="flex items-center gap-2 text-xs">
                                <div className={`h-2 w-2 rounded-full ${
                                  isCompleted ? 'bg-emerald-300' : 'bg-rose-300'
                                }`} />
                                <span className={isCompleted ? 'text-emerald-200' : 'text-rose-200'}>
                                  {prereqSequence?.name || prereq}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedSequence.unlockAchievement && (
                      <div className="flex items-center gap-2 text-xs text-amber-200">
                        <Award size={14} />
                        <span>Unlocks achievement on completion</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto border-t border-emerald-500/20 pt-4">
                    <Button
                      onClick={() => handleStartTutorial(selectedSequence.id as any)}
                      disabled={!availableSequences.includes(selectedSequence.id as any)}
                      className="w-full rounded-xl border border-sky-400/50 bg-sky-500/20 text-sky-100 transition hover:bg-sky-500/30"
                    >
                      <Play size={16} className="mr-2" />
                      {completedSequences.includes(selectedSequence.id) ? 'Replay Tutorial' : 'Start Tutorial'}
                    </Button>

                    {!availableSequences.includes(selectedSequence.id as any) && (
                      <div className="mt-2 text-center text-xs text-rose-200">
                        Complete prerequisite tutorials first
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                  <BookOpen size={48} className="opacity-40" />
                  <div className="text-lg font-medium text-slate-300">Select a Tutorial</div>
                  <div className="text-sm text-slate-400">
                    Choose a training module to learn advanced shadow operations
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TutorialOverlayProps {
  onClose: () => void;
  onStartTutorial?: (sequenceId: string) => void;
}

const TutorialOverlay = ({ onClose, onStartTutorial }: TutorialOverlayProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="relative h-[80vh] w-full max-w-5xl overflow-hidden border border-emerald-500/25 bg-slate-950/95 text-slate-100 shadow-[0_0_70px_rgba(16,185,129,0.25)]">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(56,189,248,0.14),_transparent_55%)]" />
        </div>
        <div className="relative h-full p-6">
          <TutorialSection
            onClose={onClose}
            onStartTutorial={onStartTutorial}
            showCloseButton
            className="h-full"
          />
        </div>
      </Card>
    </div>
  );
};

export default TutorialOverlay;
