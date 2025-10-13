import { useState } from 'react';
import { combineArticles, type CombinedArticle, type ArticleCombinationRequest } from '@/engine/newspaper/ArticleCombiner';
import { toast } from '@/hooks/use-toast';

export function useArticleCombiner() {
  const [isLoading, setIsLoading] = useState(false);
  const [combinedArticle, setCombinedArticle] = useState<CombinedArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const combine = async (request: ArticleCombinationRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await combineArticles(request);
      
      if (!result) {
        throw new Error('Failed to combine articles');
      }

      setCombinedArticle(result);
      toast({
        title: 'Articles Combined',
        description: `Successfully merged ${request.cardIds.length} articles into one story`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: 'Combination Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCombinedArticle(null);
    setError(null);
  };

  return {
    combine,
    combinedArticle,
    isLoading,
    error,
    reset,
  };
}
