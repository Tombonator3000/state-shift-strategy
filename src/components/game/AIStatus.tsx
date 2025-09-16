import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, Brain, Zap, Shield, Target, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { type AIDifficulty } from '@/data/aiStrategy';
import { useState } from 'react';

interface AIStatusProps {
  difficulty: AIDifficulty;
  personalityName?: string;
  isThinking?: boolean;
  currentPlayer: 'human' | 'ai';
  aiControlledStates: number;
  assessmentText?: string;
  aiHandSize?: number;
  aiObjectiveProgress?: number;
}

const AIStatus = ({ 
  difficulty, 
  personalityName, 
  isThinking = false, 
  currentPlayer,
  aiControlledStates,
  assessmentText,
  aiHandSize = 0,
  aiObjectiveProgress = 0
}: AIStatusProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <Card className="p-3 bg-gray-900 border-gray-700 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getDifficultyIcon(difficulty)}
          <h3 className="font-bold text-sm text-white font-mono">
            AI OPPONENT
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-bold ${getDifficultyColor(difficulty)}`}>
            {difficulty.toUpperCase()}
          </Badge>
          {isExpanded ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
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

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-2 border-t border-gray-700 pt-2">
            {/* AI Intel Section */}
            <div className="bg-gray-800 p-2 rounded border border-gray-600">
              <h4 className="font-bold text-xs mb-1 text-white font-mono">AI INTEL</h4>
              <div className="text-xs font-mono text-gray-300 space-y-1">
                <div>Hand Size: {aiHandSize}</div>
                <div>Strategy: Suppressing Truth</div>
                <div>Threat Level: LOW</div>
              </div>
            </div>

            {/* AI Objective Section */}
            <div className="bg-black p-2 rounded border border-red-900/50 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 to-transparent rounded"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={12} className="text-red-400/70" />
                  <h4 className="font-bold text-xs font-mono text-red-400/70">
                    AI OBJECTIVE
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-800 rounded">
                    <div 
                      className="h-full bg-red-400/70 rounded transition-all"
                      style={{ width: `${aiObjectiveProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {Math.floor(aiObjectiveProgress)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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