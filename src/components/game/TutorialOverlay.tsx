import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Play, BookOpen, Award } from 'lucide-react';
import { TutorialManager, TUTORIAL_SEQUENCES, type TutorialSequence } from '@/data/tutorialSystem';
import { useToast } from '@/hooks/use-toast';

interface TutorialOverlayProps {
  onClose: () => void;
  onStartTutorial?: (sequenceId: string) => void;
}

const TutorialOverlay = ({ onClose, onStartTutorial }: TutorialOverlayProps) => {
  const [tutorialManager] = useState(() => new TutorialManager());
  const [selectedSequence, setSelectedSequence] = useState<TutorialSequence | null>(null);
  const { toast } = useToast();

  const stats = tutorialManager.getStats();
  const availableSequences = tutorialManager.getAvailableSequences();
  const completedSequences = tutorialManager.getCompletedSequences();

  const handleStartTutorial = (sequenceId: string) => {
    const success = tutorialManager.startSequence(sequenceId);
    if (success) {
      toast({
        title: "Tutorial Started",
        description: `Beginning ${selectedSequence?.name || 'tutorial sequence'}`,
      });
      onStartTutorial?.(sequenceId);
      onClose();
    } else {
      toast({
        title: "Tutorial Unavailable", 
        description: "Complete prerequisite tutorials first",
        variant: "destructive"
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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl h-[80vh] bg-gray-900 border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white font-mono">SHADOW ACADEMY</h2>
              <div className="text-sm text-gray-400">Master the art of shadow operations</div>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-gray-400 border-gray-600"
          >
            <X size={16} />
          </Button>
        </div>

        <div className="p-4 h-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Tutorial List */}
            <div className="lg:col-span-2">
              <Card className="p-4 bg-gray-800 border-gray-700 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Training Modules</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div>Progress: {stats.completionRate}%</div>
                    <Progress value={stats.completionRate} className="w-20 h-2" />
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {TUTORIAL_SEQUENCES.map(sequence => {
                    const { status, color } = getSequenceStatus(sequence);
                    const isSelected = selectedSequence?.id === sequence.id;
                    
                    return (
                      <div 
                        key={sequence.id}
                        className={`p-4 rounded cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-900/30 border border-blue-600' 
                            : 'bg-gray-700 hover:bg-gray-600'
                        } ${status === 'locked' ? 'opacity-60' : ''}`}
                        onClick={() => setSelectedSequence(sequence)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              status === 'completed' ? 'bg-green-400' :
                              status === 'available' ? 'bg-blue-400' : 'bg-gray-600'
                            }`} />
                            <h4 className="font-semibold text-white">{sequence.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={color}>
                              {status === 'completed' ? 'Completed' : 
                               status === 'available' ? 'Available' : 'Locked'}
                            </Badge>
                            <Badge className={getDifficultyColor(sequence)}>
                              {getDifficultyText(sequence)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-300 mb-2">
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

            {/* Tutorial Details & Controls */}
            <div>
              <Card className="p-4 bg-gray-800 border-gray-700 h-full">
                {selectedSequence ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {selectedSequence.name}
                      </h3>
                      <div className="text-sm text-gray-300 leading-relaxed">
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
                                  <div className={`w-2 h-2 rounded-full ${
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

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Tutorial Steps:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedSequence.steps.map((step, index) => (
                          <div key={step.id} className="text-xs text-gray-400 p-2 bg-gray-700 rounded">
                            <div className="font-medium text-gray-300">
                              {index + 1}. {step.title}
                            </div>
                            <div className="mt-1">
                              {step.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <Button
                        onClick={() => handleStartTutorial(selectedSequence.id)}
                        disabled={!tutorialManager.isSequenceAvailable(selectedSequence.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Play size={16} className="mr-2" />
                        {completedSequences.includes(selectedSequence.id) ? 'Replay Tutorial' : 'Start Tutorial'}
                      </Button>
                      
                      {!tutorialManager.isSequenceAvailable(selectedSequence.id) && (
                        <div className="text-xs text-red-400 text-center mt-2">
                          Complete prerequisite tutorials first
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <div className="text-lg font-medium mb-2">Select a Tutorial</div>
                    <div className="text-sm">
                      Choose a training module to learn advanced shadow operations
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TutorialOverlay;