// Effect System Dashboard - Comprehensive tool for analyzing and fixing card effects
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardEffectAnalyzer, AnalysisReport } from '@/tools/CardEffectAnalyzer';
import { CardFixGenerator, CardFix } from '@/tools/CardFixGenerator';

const EffectSystemDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [fixes, setFixes] = useState<CardFix[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const runAnalysis = async () => {
    setLoading(true);
    try {
      console.time('Analysis');
      const analysisResult = CardEffectAnalyzer.analyzeAllCards();
      setAnalysis(analysisResult);
      
      console.time('Fix Generation');
      const fixResults = CardFixGenerator.generateFixes();
      setFixes(fixResults);
      console.timeEnd('Fix Generation');
      
      console.timeEnd('Analysis');
      console.log('Analysis complete:', analysisResult.summary);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    setLoading(false);
  };

  const downloadReport = () => {
    if (!analysis) return;
    
    const report = CardEffectAnalyzer.generateReport(analysis);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'card-effect-analysis.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFixes = () => {
    if (fixes.length === 0) return;
    
    const fixScript = CardFixGenerator.generateFixScript(fixes);
    const blob = new Blob([fixScript], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'card-effect-fixes.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'major': return 'secondary';  
      case 'minor': return 'outline';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Card Effect System Dashboard</h1>
          <p className="text-muted-foreground">Analyze and fix discrepancies between card text and effects data</p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button 
            onClick={runAnalysis} 
            disabled={loading}
            size="lg"
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          
          {analysis && (
            <Button variant="outline" onClick={downloadReport}>
              Download Report
            </Button>
          )}
          
          {fixes.length > 0 && (
            <Button variant="outline" onClick={downloadFixes}>
              Download Fixes
            </Button>
          )}
        </div>

        {analysis && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="critical">Critical Issues</TabsTrigger>
              <TabsTrigger value="fixes">Suggested Fixes</TabsTrigger>
              <TabsTrigger value="missing">Missing Effects</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Cards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.totalCards}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {((analysis.totalCards - analysis.cardsWithDiscrepancies) / analysis.totalCards * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Issues Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{analysis.cardsWithDiscrepancies}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">High Confidence Fixes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {fixes.filter(f => f.confidence === 'high').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Severity Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Critical</Badge>
                      <span>{analysis.summary.critical}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Major</Badge>
                      <span>{analysis.summary.major}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Minor</Badge>
                      <span>{analysis.summary.minor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="critical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Critical Issues Requiring Immediate Attention</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {analysis.discrepancies
                        .filter(d => d.severity === 'critical')
                        .slice(0, 20)
                        .map(discrepancy => (
                        <div key={discrepancy.cardId} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{discrepancy.cardName}</h3>
                            <Badge variant={getSeverityColor(discrepancy.severity) as any}>
                              {discrepancy.severity}
                            </Badge>
                          </div>
                          <div className="text-sm space-y-2">
                            <div>
                              <strong>Original:</strong> "{discrepancy.originalText}"
                            </div>
                            <div>
                              <strong>Generated:</strong> "{discrepancy.generatedText}"
                            </div>
                            <div>
                              <strong>Missing:</strong> {discrepancy.missingEffects.join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fixes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Fixes</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Showing fixes ordered by confidence level
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {fixes.slice(0, 20).map(fix => (
                        <div key={fix.cardId} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{fix.cardName}</h3>
                            <Badge variant={getConfidenceColor(fix.confidence) as any}>
                              {fix.confidence} confidence
                            </Badge>
                          </div>
                          <div className="text-sm space-y-2">
                            <div>
                              <strong>Notes:</strong> {fix.notes.join(', ')}
                            </div>
                            <details className="cursor-pointer">
                              <summary className="font-medium">View Suggested Effects</summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                                {JSON.stringify(fix.suggestedEffects, null, 2)}
                              </pre>
                            </details>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="missing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Missing Effect Types</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Effect types that need to be implemented in the schema
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.from(analysis.missingEffectTypes).map(effectType => (
                      <Badge key={effectType} variant="outline">
                        {effectType.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default EffectSystemDashboard;