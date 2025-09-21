import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, X, CheckCircle2, Play } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element ID
  action?: string;
  highlight?: boolean;
  skipable?: boolean;
}

interface InteractiveOnboardingProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  gameState?: any;
}

const InteractiveOnboarding = ({ isActive, onComplete, onSkip, gameState }: InteractiveOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '🎯 Welcome to Shadow Government!',
      description: 'You are a player choosing between Government or Truth Seekers. Win by controlling 10 states, reaching 300 IP, or achieving your faction\'s truth threshold.',
      target: '#game-header',
      skipable: true
    },
    {
      id: 'hand',
      title: '🎴 Your Hand',
      description: 'Every op opens with five cards. Each shows its cost (circle) and type — click a card to inspect the details.',
      target: '#enhanced-hand',
      action: 'Click on a card to examine it'
    },
    {
      id: 'ip',
      title: '💰 Influence Points (IP)',
      description: 'IP starts at 5 for both factions. End turns to collect 5 + controlled states, then spend it to deploy cards.',
      target: '#ip-display'
    },
    {
      id: 'map',
      title: '🗺️ The Conspiracy Map',
      description: 'This is the USA map. Red states are yours, blue are AI-controlled, gray are neutral. Click states to target them.',
      target: '#map-container'
    },
    {
      id: 'zone-cards',
      title: '🎯 Zone Cards',
      description: 'ZONE cards capture states. Select a zone card, then click a neutral or enemy state to deploy it.',
      target: '[data-card-type="ZONE"]',
      action: 'Try selecting a ZONE card'
    },
    {
      id: 'turn-end',
      title: '⏭️ End Turn',
      description: 'When you\'re done playing cards, click "End Turn". You can play up to 3 cards per turn.',
      target: '#end-turn-button'
    },
    {
      id: 'victory',
      title: '🏆 Victory Conditions',
      description: 'Win by controlling 10 states, reaching 300 IP, or hitting your truth threshold (95% for Truth, 5% for Government). Watch these in the header!',
      target: '#victory-conditions'
    }
  ];

  useEffect(() => {
    if (isActive && currentStep < onboardingSteps.length) {
      const step = onboardingSteps[currentStep];
      if (step.highlight) {
        highlightElement(step.target);
      }
    }
  }, [currentStep, isActive]);

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('onboarding-highlight');
      setTimeout(() => {
        element.classList.remove('onboarding-highlight');
      }, 3000);
    }
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCompletedSteps(prev => [...prev, onboardingSteps[currentStep].id]);
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = () => {
    setCompletedSteps(prev => [...prev, onboardingSteps[currentStep].id]);
    localStorage.setItem('shadowgov-onboarding-complete', 'true');
    onComplete();
  };

  const skipOnboarding = () => {
    localStorage.setItem('shadowgov-onboarding-skipped', 'true');
    onSkip();
  };

  if (!isActive) return null;

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 animate-fade-in">
        {/* Onboarding Card */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-60 animate-slide-in-right">
          <Card className="p-6 max-w-md bg-newspaper-text text-newspaper-bg border-4 border-truth-red shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Step {currentStep + 1}/{onboardingSteps.length}
                </Badge>
                <Badge variant="outline" className="text-xs bg-truth-red/20 border-truth-red text-truth-red">
                  Tutorial
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipOnboarding}
                className="h-6 w-6 p-0 hover:bg-newspaper-bg/20"
              >
                <X size={14} />
              </Button>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">{currentStepData.title}</h3>
              <p className="text-sm leading-relaxed">{currentStepData.description}</p>
              
              {currentStepData.action && (
                <div className="mt-3 p-2 bg-truth-red/20 border border-truth-red/50 rounded text-xs font-mono">
                  🎮 {currentStepData.action}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="bg-newspaper-bg/20 border-newspaper-bg/50"
              >
                <ArrowLeft size={14} />
                <span className="ml-1">Back</span>
              </Button>

              <div className="flex gap-2">
                {currentStepData.skipable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipOnboarding}
                    className="text-xs hover:bg-newspaper-bg/20"
                  >
                    Skip Tutorial
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="bg-truth-red hover:bg-truth-red/80 text-white"
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span className="ml-1">Complete</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">Next</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Spotlight effect for highlighted elements */}
        <div 
          dangerouslySetInnerHTML={{
            __html: `
              <style>
                .onboarding-highlight {
                  position: relative !important;
                  z-index: 55 !important;
                  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.8) !important;
                  border: 3px solid rgb(239, 68, 68) !important;
                  border-radius: 8px !important;
                  animation: pulse-glow 2s infinite !important;
                }
                
                @keyframes pulse-glow {
                  0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.8) !important; }
                  50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 1) !important; }
                }
              </style>
            `
          }}
        />
      </div>
    </>
  );
};

export default InteractiveOnboarding;