import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Target, Zap, Shield, TrendingUp } from 'lucide-react';

interface MechanicsTooltipProps {
  children: React.ReactNode;
  mechanic: 'zone' | 'influence' | 'truth' | 'ip' | 'pressure' | 'defense' | 'capture';
  customContent?: string;
}

const MechanicsTooltip = ({ children, mechanic, customContent }: MechanicsTooltipProps) => {
  const getMechanicInfo = () => {
    const mechanics = {
      zone: {
        title: '🎯 Zone Cards',
        icon: <Target size={16} />,
        description: 'Zone cards target specific states to add pressure. When pressure >= defense, you capture the state.',
        example: 'Example: "Drone Strike" adds 3 pressure to targeted state',
        tips: ['Target neutral states first', 'Enemy states have higher defense', 'Each zone card costs IP to play']
      },
      influence: {
        title: '⚡ Influence Cards', 
        icon: <Zap size={16} />,
        description: 'Influence cards provide immediate benefits like IP, truth manipulation, or global effects.',
        example: 'Example: "Media Leak" gives +5 IP and +10% truth',
        tips: ['Play early for economic advantage', 'Stack multiple influence cards', 'Some have lasting effects']
      },
      truth: {
        title: '🔍 Truth Meter',
        icon: <TrendingUp size={16} />,
        description: 'Truth represents public awareness of the conspiracy. Higher truth makes cards more effective.',
        example: 'At 90% truth, you win the game!',
        tips: ['Play truth-boosting cards', 'AI will try to suppress truth', 'Truth affects card costs']
      },
      ip: {
        title: '💰 Influence Points',
        icon: <Zap size={16} />,
        description: 'IP is your currency. Gain IP each turn based on controlled states. Spend it to play cards.',
        example: 'Control more states = more IP income',
        tips: ['Balance spending and saving', 'Income happens at turn start', 'Some cards provide instant IP']
      },
      pressure: {
        title: '💥 Pressure System',
        icon: <Target size={16} />,
        description: 'Pressure builds up on states. When pressure >= defense, you capture the state.',
        example: 'State with 3 defense needs 3+ pressure to capture',
        tips: ['Pressure persists between turns', 'Multiple cards can target same state', 'Captured states reset pressure']
      },
      defense: {
        title: '🛡️ State Defense',
        icon: <Shield size={16} />,
        description: 'Each state has defense value. Higher defense = harder to capture.',
        example: 'Neutral states: 2-3 defense, Enemy states: 4-5 defense',
        tips: ['Check defense before targeting', 'Plan multiple pressure cards', 'Some cards reduce defense']
      },
      capture: {
        title: '🏴 State Capture',
        icon: <Target size={16} />,
        description: 'Capture states by exceeding their defense with pressure. Captured states provide IP income.',
        example: 'Each controlled state gives +2 IP per turn',
        tips: ['Prioritize weak neutral states', 'Defend your captured states', 'Control 10 states to win']
      }
    };

    return mechanics[mechanic];
  };

  const info = getMechanicInfo();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-sm p-0 bg-transparent border-0 shadow-none"
          sideOffset={10}
        >
          <Card className="p-4 bg-newspaper-text text-newspaper-bg border-2 border-truth-red shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              {info.icon}
              <h4 className="font-bold text-sm">{info.title}</h4>
              <Badge variant="outline" className="text-xs bg-truth-red/20 border-truth-red text-truth-red">
                Help
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="text-xs leading-relaxed">
                {customContent || info.description}
              </p>

              {info.example && (
                <div className="p-2 bg-government-blue/20 border border-government-blue/50 rounded">
                  <div className="text-xs font-mono text-government-blue font-bold mb-1">
                    EXAMPLE:
                  </div>
                  <div className="text-xs">{info.example}</div>
                </div>
              )}

              {info.tips && (
                <div className="space-y-1">
                  <div className="text-xs font-bold">💡 Pro Tips:</div>
                  {info.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <span className="text-truth-red">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MechanicsTooltip;