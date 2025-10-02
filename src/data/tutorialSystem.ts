export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'wait' | 'input';
  actionTarget?: string;
  condition?: () => boolean;
  autoAdvance?: boolean;
  delay?: number;
}

export interface TutorialSequence {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  prerequisites?: string[];
  unlockAchievement?: string;
}

export const TUTORIAL_SEQUENCES: TutorialSequence[] = [
  {
    id: 'basic_gameplay',
    name: 'Shadow Government Basics',
    description: 'Learn the fundamental mechanics of influence and control',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to the Shadow Government',
        description: 'You are now part of a secret operation to control or expose the truth. Every decision matters, every card has power, and every state can shift the balance.',
        position: 'center',
        delay: 2000
      },
      {
        id: 'faction_choice',
        title: 'Choose Your Side',
        description: 'Select Truth Seekers to expose conspiracies and fight for transparency, or Government to maintain control and suppress dissent.',
        targetElement: '.faction-selection',
        position: 'bottom',
        action: 'click',
        actionTarget: '.faction-button'
      },
      {
        id: 'game_interface',
        title: 'Your Command Center',
        description: 'This is your operational interface. The map shows state control and hotspots, your hand holds action cards, the meters track Truth and IP, and side panels surface agendas, combos, and newspaper intel.',
        position: 'center',
        delay: 3000
      },
      {
        id: 'truth_meter',
        title: 'Truth Level Monitor',
        description: 'This meter shows public awareness. Truth Seekers push toward 95% Truth, Government suppresses toward 5%. Crossing those thresholds triggers victory checks and fuels certain agendas.',
        targetElement: '.truth-meter',
        position: 'right',
        delay: 4000
      },
      {
        id: 'ip_display',
        title: 'Influence Points (IP)',
        description: 'IP is your operational currency. Gain it from controlled states, state combos, and events, then spend it to deploy cards. Banking 300 IP before the AI does secures an economic victory.',
        targetElement: '.ip-display',
        position: 'left',
        delay: 3000
      },
      {
        id: 'state_map',
        title: 'Territory Control',
        description: 'Each state can be controlled by you (blue), the AI (red), or remain neutral (gray). Capture states to earn their IP income, trigger special bonuses, and unlock regional combos. Watch for ghostly hotspot markers that boost defense until resolved.',
        targetElement: '.usa-map',
        position: 'bottom',
        delay: 4000
      },
      {
        id: 'card_hand',
        title: 'Your Action Cards',
        description: 'These cards are your tools of influence. MEDIA shifts Truth, ZONE applies pressure to seize states, and ATTACK drains enemy IP or hand resources. Plan around your IP budget before committing a card.',
        targetElement: '.game-hand',
        position: 'top',
        delay: 3000
      },
      {
        id: 'first_card_play',
        title: 'Play Your First Card',
        description: 'Click on a card in your hand to select it. Cards show their IP cost and effects. You can play up to 3 cards per turn.',
        targetElement: '.game-hand .card:first-child',
        position: 'top',
        action: 'click',
        actionTarget: '.game-hand .card:first-child'
      },
      {
        id: 'target_selection',
        title: 'Choose Your Target',
        description: 'ZONE cards require a target. Click a state to apply pressure; if your total meets its defense, you capture it immediately, reset pressure, and claim its income and combo progress.',
        targetElement: '.usa-map',
        position: 'bottom',
        action: 'click',
        actionTarget: '[data-state-id]',
        condition: () => document.querySelector('.selected-card') !== null
      },
      {
        id: 'secret_agenda',
        title: 'Your Secret Mission',
        description: 'This panel tracks your hidden objective. Agenda progress updates automatically; finishing it overrides every other victory path, so monitor both your milestones and the AI’s suspicious behaviour.',
        targetElement: '.secret-agenda',
        position: 'right',
        delay: 3000
      },
      {
        id: 'ai_opponent',
        title: 'AI Opposition',
        description: 'Your AI opponent plays by the same rules, pursues its own secret agenda, and obeys the same victory thresholds. Difficulty settings adjust how aggressively it pushes Truth, IP, and territory.',
        targetElement: '.ai-status',
        position: 'left',
        delay: 3000
      },
      {
        id: 'end_turn',
        title: 'Complete Your Turn',
        description: 'When ready, end your turn to trigger income, card draw, possible events, and give the AI its turn. Timing your turn end can be strategic.',
        targetElement: '.end-turn-button',
        position: 'left',
        action: 'click',
        actionTarget: '.end-turn-button'
      },
      {
        id: 'newspaper_events',
        title: 'Breaking News',
        description: 'After each round, the newspaper records card plays, combo highlights, and tabloid events. Legendary headlines can reveal agendas, spawn paranormal hotspots, or swing Truth—study them before the next turn.',
        targetElement: '.newspaper',
        position: 'center',
        delay: 4000,
        condition: () => document.querySelector('.newspaper') !== null
      },
      {
        id: 'victory_conditions',
        title: 'Path to Victory',
        description: 'Victory checks run in priority order: 1) spike the Truth meter to ≥95% (Truth) or ≤5% (Government), 2) bank 300 IP, 3) control 10 states. Secret Agendas now fuel that Truth surge based on difficulty—plan around the swing before the AI does.',
        position: 'center',
        delay: 4000
      }
    ]
  },
  {
    id: 'advanced_tactics',
    name: 'Advanced Operations',
    description: 'Master advanced strategies and card interactions',
    prerequisites: ['basic_gameplay'],
    steps: [
      {
        id: 'card_types_deep',
        title: 'Master Card Categories',
        description: 'MEDIA cards swing the Truth meter, ZONE cards escalate pressure and unlock state combos, and ATTACK cards strip IP or hands. Chain them to trigger combo bonuses without overspending IP.',
        position: 'center',
        delay: 3000
      },
      {
        id: 'rarity_system',
        title: 'Card Rarity & Power',
        description: 'Commons (gray) fuel efficiency, Uncommons (green) add swingy plays, Rares (blue) shape turns, and Legendary cards (orange) create headline moments at steep IP costs. Curve your deck so you can afford them.',
        targetElement: '.game-hand',
        position: 'top',
        delay: 4000
      },
      {
        id: 'state_specialization',
        title: 'Strategic State Selection',
        description: 'States carry unique IP yields, defense values, and bonuses. California’s tech hubs lower MEDIA costs, Texas oil boosts income, DC amps political effects. Capture sets to unlock permanent combo rewards.',
        targetElement: '.usa-map',
        position: 'bottom',
        delay: 4000
      },
      {
        id: 'timing_strategy',
        title: 'Turn Timing Mastery',
        description: 'Card order matters. Open with setup plays that establish combos, follow with disruptive ATTACKs, then close with ZONE captures. Leave IP for surprise plays triggered by events or hotspots before ending the turn.',
        position: 'center',
        delay: 4000
      },
      {
        id: 'ai_prediction',
        title: 'Reading AI Patterns',
        description: 'Each AI difficulty has a distinct cadence. Easier modes telegraph Truth pushes, higher tiers pivot between agenda progress, state combos, and economic plays—track its Truth/IP spikes to anticipate the next strike.',
        targetElement: '.ai-status',
        position: 'left',
        delay: 4000
      }
    ]
  },
  {
    id: 'expert_mastery',
    name: 'Shadow Master Training',
    description: 'Achieve true mastery of the shadow war',
    prerequisites: ['basic_gameplay', 'advanced_tactics'],
    steps: [
      {
        id: 'meta_gaming',
        title: 'Meta-Game Awareness',
        description: 'Track opponent patterns, memorize their likely cards, predict their secret agenda progress, and manipulate their decision-making through misdirection.',
        position: 'center',
        delay: 3000
      },
      {
        id: 'economic_control',
        title: 'Economic Warfare',
        description: 'Control high-IP states early, deny opponent resources, time attacks to deprive income, and leverage economic advantages into territorial control.',
        position: 'center',
        delay: 4000
      },
      {
        id: 'truth_manipulation',
        title: 'Information Warfare',
        description: 'Use Truth meter as weapon. Push extremes for victory conditions, deny opponent their preferred Truth range, and time Truth swings with major plays.',
        targetElement: '.truth-meter',
        position: 'right',
        delay: 4000
      },
      {
        id: 'endgame_scenarios',
        title: 'Victory Path Management',
        description: 'Monitor all victory conditions simultaneously. Switch strategies based on game state. Deny opponent victories while securing your own.',
        position: 'center',
        delay: 5000
      }
    ]
  }
];

export class TutorialManager {
  private currentSequence: TutorialSequence | null = null;
  private currentStep: number = 0;
  private completedSequences: string[] = [];
  private highlightedElement: HTMLElement | null = null;
  private tutorialOverlay: HTMLElement | null = null;

  constructor() {
    this.loadProgress();
  }

  // Load tutorial progress from localStorage
  loadProgress() {
    const saved = localStorage.getItem('shadow_government_tutorial_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.completedSequences = data.completedSequences || [];
      } catch (e) {
        console.warn('Failed to load tutorial progress:', e);
      }
    }
  }

  // Save tutorial progress
  saveProgress() {
    const data = {
      completedSequences: this.completedSequences,
      timestamp: Date.now()
    };
    localStorage.setItem('shadow_government_tutorial_progress', JSON.stringify(data));
  }

  // Check if tutorial sequence is available
  isSequenceAvailable(sequenceId: string): boolean {
    const sequence = TUTORIAL_SEQUENCES.find(s => s.id === sequenceId);
    if (!sequence) return false;

    // Check prerequisites
    if (sequence.prerequisites) {
      return sequence.prerequisites.every(prereq => 
        this.completedSequences.includes(prereq)
      );
    }

    return true;
  }

  // Start tutorial sequence
  startSequence(sequenceId: string): boolean {
    if (!this.isSequenceAvailable(sequenceId)) return false;

    const sequence = TUTORIAL_SEQUENCES.find(s => s.id === sequenceId);
    if (!sequence) return false;

    this.currentSequence = sequence;
    this.currentStep = 0;
    this.showCurrentStep();
    return true;
  }

  // Show current tutorial step
  private showCurrentStep() {
    if (!this.currentSequence || this.currentStep >= this.currentSequence.steps.length) {
      this.completeSequence();
      return;
    }

    const step = this.currentSequence.steps[this.currentStep];
    
    // Check conditions if any
    if (step.condition && !step.condition()) {
      // Wait for condition or skip
      setTimeout(() => this.showCurrentStep(), 500);
      return;
    }

    // Clear previous highlights
    this.clearHighlight();

    // Create tutorial overlay
    this.createTutorialOverlay(step);

    // Highlight target element
    if (step.targetElement) {
      this.highlightElement(step.targetElement);
    }

    // Handle auto-advance
    if (step.autoAdvance || step.delay) {
      setTimeout(() => {
        this.nextStep();
      }, step.delay || 3000);
    }

    // Set up action listeners
    if (step.action && step.actionTarget) {
      this.setupActionListener(step);
    }
  }

  // Create tutorial overlay UI
  private createTutorialOverlay(step: TutorialStep) {
    // Remove existing overlay
    if (this.tutorialOverlay) {
      this.tutorialOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay fixed inset-0 z-[60] pointer-events-none';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip absolute bg-gray-900 border border-blue-500 rounded-lg p-4 max-w-sm pointer-events-auto shadow-xl';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold text-white mb-2 font-mono';
    title.textContent = step.title;
    
    const description = document.createElement('p');
    description.className = 'text-sm text-gray-300 mb-4 leading-relaxed';
    description.textContent = step.description;
    
    const controls = document.createElement('div');
    controls.className = 'flex items-center justify-between';
    
    const progress = document.createElement('div');
    progress.className = 'text-xs text-gray-500';
    progress.textContent = `${this.currentStep + 1} / ${this.currentSequence!.steps.length}`;
    
    const buttons = document.createElement('div');
    buttons.className = 'flex gap-2';
    
    if (!step.autoAdvance && !step.action) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors';
      nextBtn.textContent = 'Next';
      nextBtn.onclick = () => this.nextStep();
      buttons.appendChild(nextBtn);
    }
    
    const skipBtn = document.createElement('button');
    skipBtn.className = 'px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors';
    skipBtn.textContent = 'Skip Tutorial';
    skipBtn.onclick = () => this.skipSequence();
    buttons.appendChild(skipBtn);
    
    controls.appendChild(progress);
    controls.appendChild(buttons);
    
    tooltip.appendChild(title);
    tooltip.appendChild(description);
    tooltip.appendChild(controls);
    
    // Position tooltip
    this.positionTooltip(tooltip, step);
    
    overlay.appendChild(tooltip);
    document.body.appendChild(overlay);
    
    this.tutorialOverlay = overlay;
  }

  // Position tooltip relative to target or screen
  private positionTooltip(tooltip: HTMLElement, step: TutorialStep) {
    const targetElement = step.targetElement ? document.querySelector(step.targetElement) : null;
    
    if (targetElement && step.position !== 'center') {
      const rect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let top = 0, left = 0;
      
      switch (step.position) {
        case 'top':
          top = rect.top - tooltipRect.height - 10;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left - tooltipRect.width - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.right + 10;
          break;
      }
      
      // Keep tooltip on screen
      top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
      left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    } else {
      // Center on screen
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
    }
  }

  // Highlight target element
  private highlightElement(selector: string) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.classList.add('tutorial-highlight');
      element.style.position = 'relative';
      element.style.zIndex = '50';
      this.highlightedElement = element;
      
      // Add pulsing border
      const style = document.createElement('style');
      style.textContent = `
        .tutorial-highlight::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 3px solid #3b82f6;
          border-radius: 8px;
          animation: tutorial-pulse 2s infinite;
          pointer-events: none;
          z-index: -1;
        }
        @keyframes tutorial-pulse {
          0%, 100% { opacity: 1; border-color: #3b82f6; }
          50% { opacity: 0.6; border-color: #60a5fa; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Clear element highlight
  private clearHighlight() {
    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('tutorial-highlight');
      this.highlightedElement = null;
    }
  }

  // Setup action listener for interactive steps
  private setupActionListener(step: TutorialStep) {
    const target = document.querySelector(step.actionTarget!);
    if (target && step.action) {
      const handler = () => {
        target.removeEventListener(step.action!, handler);
        setTimeout(() => this.nextStep(), 500);
      };
      
      target.addEventListener(step.action, handler);
    }
  }

  // Advance to next step
  nextStep() {
    this.currentStep++;
    this.showCurrentStep();
  }

  // Skip current sequence
  skipSequence() {
    this.cleanup();
    this.currentSequence = null;
    this.currentStep = 0;
  }

  // Complete current sequence
  private completeSequence() {
    if (this.currentSequence) {
      this.completedSequences.push(this.currentSequence.id);
      this.saveProgress();
      
      // Trigger achievement if specified
      if (this.currentSequence.unlockAchievement) {
        // This would integrate with achievement system
        console.log(`Tutorial completed: ${this.currentSequence.name}`);
      }
    }
    
    this.cleanup();
    this.currentSequence = null;
    this.currentStep = 0;
  }

  // Clean up tutorial UI
  private cleanup() {
    this.clearHighlight();
    if (this.tutorialOverlay) {
      this.tutorialOverlay.remove();
      this.tutorialOverlay = null;
    }
  }

  // Get available sequences
  getAvailableSequences(): TutorialSequence[] {
    return TUTORIAL_SEQUENCES.filter(seq => this.isSequenceAvailable(seq.id));
  }

  // Get completed sequences
  getCompletedSequences(): string[] {
    return [...this.completedSequences];
  }

  // Check if specific sequence is completed
  isSequenceCompleted(sequenceId: string): boolean {
    return this.completedSequences.includes(sequenceId);
  }

  // Reset all tutorial progress
  resetProgress() {
    this.completedSequences = [];
    this.saveProgress();
    localStorage.removeItem('shadow_government_tutorial_progress');
  }

  // Get tutorial statistics
  getStats() {
    return {
      totalSequences: TUTORIAL_SEQUENCES.length,
      completedSequences: this.completedSequences.length,
      availableSequences: this.getAvailableSequences().length,
      completionRate: Math.round((this.completedSequences.length / TUTORIAL_SEQUENCES.length) * 100)
    };
  }
}
