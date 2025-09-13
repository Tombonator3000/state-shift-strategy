import { useState, useCallback, useEffect } from 'react';
import { newspaper, NewspaperIssue } from '@/systems/newspaper';
import { GameCard } from '@/types/cardTypes';

interface RoundContext {
  round: number;
  truth: number;
  ip: { human: number; ai: number };
  states?: any[];
}

export const useNewspaper = () => {
  const [currentIssue, setCurrentIssue] = useState<NewspaperIssue | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the newspaper system
  useEffect(() => {
    const initNewspaper = async () => {
      try {
        await newspaper.loadConfig();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize newspaper system:', error);
        setIsInitialized(true); // Continue with fallback config
      }
    };

    initNewspaper();
  }, []);

  // Queue an article when a card is played
  const queueArticleFromCard = useCallback((card: GameCard, context: RoundContext) => {
    if (!isInitialized) {
      console.warn('Newspaper system not yet initialized');
      return;
    }

    newspaper.queueArticleFromCard(card, context);
  }, [isInitialized]);

  // Generate and show newspaper at round end
  const showNewspaperForRound = useCallback((round: number) => {
    console.log('📰 showNewspaperForRound called for round:', round, 'initialized:', isInitialized);
    
    if (!isInitialized) {
      console.warn('Newspaper system not yet initialized');
      return;
    }

    try {
      console.log('📰 Generating newspaper issue...');
      const issue = newspaper.flushForRound(round);
      console.log('📰 Generated issue:', issue.masthead, 'Articles:', issue.mainArticles.length);
      setCurrentIssue(issue);
      setIsVisible(true);
    } catch (error) {
      console.error('Failed to generate newspaper issue:', error);
    }
  }, [isInitialized]);

  // Close the newspaper overlay
  const closeNewspaper = useCallback(() => {
    setIsVisible(false);
    // Clear issue after animation
    setTimeout(() => setCurrentIssue(null), 300);
  }, []);

  // Check if we have queued articles (useful for testing)
  const hasQueuedArticles = useCallback(() => {
    // This would require exposing queue length from newspaper system
    // For now, we'll assume articles are queued if cards were played
    return true;
  }, []);

  return {
    currentIssue,
    isVisible,
    isInitialized,
    queueArticleFromCard,
    showNewspaperForRound,
    closeNewspaper,
    hasQueuedArticles
  };
};