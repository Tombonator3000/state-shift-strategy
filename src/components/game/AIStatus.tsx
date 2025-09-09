import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, Brain, Zap, Shield, Target } from 'lucide-react';
import { type AIDifficulty } from '@/data/aiStrategy';

interface AIStatusProps {
  difficulty: AIDifficulty;
  personalityName?: string;
  isThinking?: boolean;
  currentPlayer: 'human' | 'ai';
  aiControlledStates: number;
  assessmentText?: string;
}

const AIStatus = ({ 
  difficulty, 
  personalityName, 
  isThinking = false, 
  currentPlayer,
  aiControlledStates,
  assessmentText 
}: AIStatusProps) => {
  const getDifficultyColor = (diff: AIDifficulty) => {
    switch (diff) {
      case 'easy': return 'bg-green-900/50 text-green-400 border-green-600';
      case 'medium': return 'bg-yellow-900/50 text-yellow-400 border-yellow-600';
      case 'hard': return 'bg-red-900/50 text-red-400 border-red-600';
      case 'legendary': return 'bg-purple-900/50 text-purple-400 border-purple-600';
    }
  };

  const getDifficultyIcon = (diff: AIDifficulty) => {
    switch (diff) {
      case 'easy': return <Bot size={16} />;
      case 'medium': return <Brain size={16} />;
      case 'hard': return <Zap size={16} />;
      case 'legendary': return <Target size={16} />;
    }
  };

  return (
    <Card className="p-3 bg-gray-900 border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getDifficultyIcon(difficulty)}
          <h3 className="font-bold text-sm text-white font-mono">
            AI OPPONENT
          </h3>
        </div>
        <Badge className={`text-xs font-bold ${getDifficultyColor(difficulty)}`}>
          {difficulty.toUpperCase()}
        </Badge>
      </div>

      {personalityName && (
        <div className="text-xs text-gray-400 mb-2 font-mono">
          {personalityName}
        </div>
      )}

      <div className="space-y-2">
        {/* AI Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            currentPlayer === 'ai' 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-gray-600'
          }`} />
          <span className="text-xs text-gray-300">
            {currentPlayer === 'ai' 
              ? (isThinking ? 'Calculating...' : 'Active Turn') 
              : 'Waiting'
            }
          </span>
        </div>

        {/* Territory Control */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Territory:</span>
          <span className="text-red-400 font-bold">
            {aiControlledStates} states
          </span>
        </div>

        {/* AI Assessment */}
        {assessmentText && (
          <div className="text-xs text-gray-500 italic border-t border-gray-700 pt-2 truncate">
            {assessmentText}
          </div>
        )}

        {/* Thinking Animation */}
        {isThinking && currentPlayer === 'ai' && (
          <div className="flex items-center gap-1 text-xs text-red-400">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Processing strategy...</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIStatus;