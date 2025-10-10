import type { GameCard } from '@/rules/mvp';
import newGovernmentCards from '../expansion/newGovernmentCards.json';
import newTruthCards from '../expansion/newTruthCards.json';

export interface BuiltinExpansionSource {
  id: string;
  name: string;
  fileName: string;
  description: string;
  version: string;
  author: string;
  cards: GameCard[];
}

const cloneCards = (cards: GameCard[]): GameCard[] => cards.map(card => ({ ...card }));

export const BUILTIN_EXPANSION_SOURCES: BuiltinExpansionSource[] = [
  {
    id: 'truth-new',
    name: 'Truth Vanguard Initiative',
    fileName: 'newTruthCards.json',
    description:
      'Activists, eyewitnesses, and rogue insiders flood the airwaves with disclosure-grade evidence.',
    version: '1.0.0',
    author: 'Paranoid Times Narrative Desk',
    cards: cloneCards(newTruthCards as GameCard[]),
  },
  {
    id: 'gov-new',
    name: 'Government Countermeasures Bureau',
    fileName: 'newGovernmentCards.json',
    description:
      'Shadow cabinets deploy black-budget programs and deniability teams to suffocate the truth.',
    version: '1.0.0',
    author: 'Paranoid Times Narrative Desk',
    cards: cloneCards(newGovernmentCards as GameCard[]),
  },
];
