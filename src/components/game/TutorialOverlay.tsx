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
      return { status: 'completed', color: 'text-green-400 bg-green-900/20' };
    } else if (tutorialManager.isSequenceAvailable(sequence.id)) {
      return { status: 'available', color: 'text-blue-400 bg-blue-900/20' };
    } else {
      return { status: 'locked', color: 'text-gray-400 bg-gray-900/20' };
    }
  };

  const getDifficultyColor = (sequence: TutorialSequence) => {
    const stepCount = sequence.steps.length;
    if (stepCount <= 5) return 'text-green-400 bg-green-900/20';
    if (stepCount <= 10) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-red-400 bg-red-900/20';
  };

  const getDifficultyText = (sequence: TutorialSequence) => {
    const stepCount = sequence.steps.length;
    if (stepCount <= 5) return 'Basic';
    if (stepCount <= 10) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <div className={`flex h-full flex-col ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <BookOpen size={24} className="text-blue-400" />
          <div>
            <h2 className="font-mono text-xl font-bold text-white">SHADOW ACADEMY</h2>
            <div className="text-sm text-gray-400">Master the art of shadow operations</div>
          </div>
        </div>
        {showCloseButton && onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="h-full border-gray-700 bg-gray-800 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Training Modules</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div>Progress: {stats.completionRate}%</div>
                  <Progress value={stats.completionRate} className="h-2 w-20" />
                </div>
              </div>

              <div className="max-h-96 space-y-3 overflow-y-auto">
                {TUTORIAL_SEQUENCES.map(sequence => {
                  const { status, color } = getSequenceStatus(sequence);
                  const isSelected = selectedSequence?.id === sequence.id;

                  return (
                    <div
                      key={sequence.id}
                      className={`cursor-pointer rounded p-4 transition-all ${
                        isSelected
                          ? 'border border-blue-600 bg-blue-900/30'
                          : 'bg-gray-700 hover:bg-gray-600'
                      } ${status === 'locked' ? 'opacity-60' : ''}`}
                      onClick={() => {
                        if (status !== 'locked') {
                          setSelectedSequence(sequence);
                        }
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${
                            status === 'completed' ? 'bg-green-400'
                              : status === 'available' ? 'bg-blue-400'
                                : 'bg-gray-600'
                          }`} />
                          <h4 className="font-semibold text-white">{sequence.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={color}>
                            {status === 'completed' ? 'Completed'
                              : status === 'available' ? 'Available' : 'Locked'}
                          </Badge>
                          <Badge className={getDifficultyColor(sequence)}>
                            {getDifficultyText(sequence)}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-2 text-sm text-gray-300">
                        {sequence.description}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
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
            <Card className="h-full border-gray-700 bg-gray-800 p-4">
              {selectedSequence ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-white">{selectedSequence.name}</h3>
                    <div className="text-sm leading-relaxed text-gray-300">
                      {selectedSequence.description}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Steps:</span>
                      <span className="text-sm text-white">{selectedSequence.steps.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Difficulty:</span>
                      <Badge className={getDifficultyColor(selectedSequence)}>
                        {getDifficultyText(selectedSequence)}
                      </Badge>
                    </div>

                    {selectedSequence.prerequisites && (
                      <div className="space-y-1">
                        <span className="text-sm text-gray-400">Prerequisites:</span>
                        <div className="space-y-1">
                          {selectedSequence.prerequisites.map(prereq => {
                            const isCompleted = completedSequences.includes(prereq);
                            const prereqSequence = TUTORIAL_SEQUENCES.find(s => s.id === prereq);
                            return (
                              <div key={prereq} className="flex items-center gap-2 text-sm">
                                <div className={`h-2 w-2 rounded-full ${
                                  isCompleted ? 'bg-green-400' : 'bg-red-400'
                                }`} />
                                <span className={isCompleted ? 'text-green-300' : 'text-red-300'}>
                                  {prereqSequence?.name || prereq}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedSequence.unlockAchievement && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-yellow-400" />
                        <span className="text-yellow-300">
                          Unlocks achievement on completion
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <Button
                      onClick={() => handleStartTutorial(selectedSequence.id)}
                      disabled={!availableSequences.includes(selectedSequence.id)}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Play size={16} className="mr-2" />
                      {completedSequences.includes(selectedSequence.id) ? 'Replay Tutorial' : 'Start Tutorial'}
                    </Button>

                    {!availableSequences.includes(selectedSequence.id) && (
                      <div className="mt-2 text-center text-xs text-red-400">
                        Complete prerequisite tutorials first
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <div className="mb-2 text-lg font-medium">Select a Tutorial</div>
                  <div className="text-sm">
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
      <Card className="h-[80vh] w-full max-w-5xl overflow-hidden border-gray-700 bg-gray-900">
        <TutorialSection
          onClose={onClose}
          onStartTutorial={onStartTutorial}
          showCloseButton
          className="h-full"
        />
      </Card>
    </div>
  );
};

export default TutorialOverlay;
