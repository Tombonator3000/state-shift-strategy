import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useArticleCombiner } from '@/hooks/useArticleCombiner';
import { CARD_ARTICLE_DATABASE } from '@/data/cardArticles/articleDatabase';
import { Loader2 } from 'lucide-react';

export function ArticleCombinerDemo() {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [combineMethod, setCombineMethod] = useState<'ai' | 'template'>('ai');
  const [tone, setTone] = useState<string>('investigative');
  const { combine, combinedArticle, isLoading, reset } = useArticleCombiner();

  const availableArticles = CARD_ARTICLE_DATABASE.slice(0, 20); // Show first 20 for demo

  const handleToggleCard = (cardId: string) => {
    setSelectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleCombine = async () => {
    if (selectedCards.length < 2) {
      return;
    }

    await combine({
      cardIds: selectedCards,
      combineMethod,
      tone: tone as any,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article Combiner System</CardTitle>
          <CardDescription>
            Combine multiple card articles into a single cohesive news story using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Combine Method</Label>
              <Select value={combineMethod} onValueChange={(v) => setCombineMethod(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">AI-Powered</SelectItem>
                  <SelectItem value="template">Template-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="investigative">Investigative</SelectItem>
                  <SelectItem value="exposé">Exposé</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                  <SelectItem value="dismissive">Dismissive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Select Articles to Combine (min 2)</Label>
            <div className="mt-2 max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
              {availableArticles.map(article => (
                <div key={article.cardId} className="flex items-start space-x-2">
                  <Checkbox
                    id={article.cardId}
                    checked={selectedCards.includes(article.cardId)}
                    onCheckedChange={() => handleToggleCard(article.cardId)}
                  />
                  <Label
                    htmlFor={article.cardId}
                    className="text-sm cursor-pointer leading-tight"
                  >
                    <div className="font-medium">{article.headline}</div>
                    <div className="text-muted-foreground text-xs">{article.subhead}</div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCombine}
              disabled={selectedCards.length < 2 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Combining...
                </>
              ) : (
                `Combine ${selectedCards.length} Articles`
              )}
            </Button>
            {combinedArticle && (
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {combinedArticle && (
        <Card>
          <CardHeader>
            <CardTitle>Combined Article</CardTitle>
            <CardDescription>
              Generated from {combinedArticle.sourceArticles.length} source articles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold mb-2">{combinedArticle.headline}</div>
              <div className="text-lg text-muted-foreground mb-2">{combinedArticle.subhead}</div>
              <div className="text-sm italic mb-4">{combinedArticle.byline}</div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              {combinedArticle.body.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="text-xs text-muted-foreground">
              <div>Faction: {combinedArticle.faction}</div>
              <div>Tags: {combinedArticle.tags.join(', ')}</div>
              <div>Sources: {combinedArticle.sourceArticles.join(', ')}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
