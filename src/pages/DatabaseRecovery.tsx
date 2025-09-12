import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CardDatabaseRecovery } from '@/tools/CardDatabaseRecovery';
import { ExtensionEffectMigrator } from '@/tools/ExtensionEffectMigrator';
import { AlertTriangle, Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface RecoveryReport {
  totalCards: number;
  coreCards: number;
  extensionCards: number;
  validationSummary: any;
  issues: Array<{
    cardId: string;
    cardName: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  extensions: Array<{
    id: string;
    name: string;
    cardCount: number;
    migrationSuccess: boolean;
  }>;
}

export default function DatabaseRecovery() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<RecoveryReport | null>(null);
  const [progress, setProgress] = useState(0);

  const runRecovery = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      // Simulate progress updates
      const progressTimer = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const recoveryReport = await CardDatabaseRecovery.performFullRecovery();
      
      clearInterval(progressTimer);
      setProgress(100);
      setReport(recoveryReport);
    } catch (error) {
      console.error('Recovery failed:', error);
      alert('Recovery failed: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const downloadRecoveryFiles = async () => {
    if (!report) return;
    
    try {
      await CardDatabaseRecovery.downloadRecoveryFiles();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed: ' + error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning' as any;
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const successRate = report ? ((report.totalCards - report.issues.filter(i => i.severity === 'high').length) / report.totalCards * 100) : 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Card Database Recovery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Emergency recovery tool to restore and integrate the complete card database including extensions.
        </p>
        
        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Data Recovery Mode</AlertTitle>
          <AlertDescription>
            This tool will migrate extension cards from the old format and validate the entire database.
            Use this to recover from data loss or format inconsistencies.
          </AlertDescription>
        </Alert>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Recovery Actions
            </CardTitle>
            <CardDescription>
              Start the recovery process to analyze and restore your card database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {progress < 30 ? 'Loading extensions...' :
                   progress < 60 ? 'Migrating card effects...' :
                   progress < 90 ? 'Validating cards...' :
                   'Finalizing recovery...'}
                </p>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button 
                onClick={runRecovery} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Recovering...' : 'Start Recovery'}
              </Button>
              
              {report && (
                <Button 
                  onClick={downloadRecoveryFiles}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Recovery Files
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {report && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="extensions">Extensions</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recovery Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-primary">{report.totalCards}</div>
                      <div className="text-sm text-muted-foreground">Total Cards</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-blue-600">{report.coreCards}</div>
                      <div className="text-sm text-muted-foreground">Core Cards</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-green-600">{report.extensionCards}</div>
                      <div className="text-sm text-muted-foreground">Extension Cards</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold text-purple-600">{successRate.toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recovery Progress</span>
                      <span>{successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={successRate} className="h-2" />
                  </div>

                  {report.issues.length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Perfect Recovery!</AlertTitle>
                      <AlertDescription>
                        All cards were successfully recovered and validated with no issues found.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Issues Found</AlertTitle>
                      <AlertDescription>
                        {report.issues.length} issues were found during recovery. Check the Issues tab for details.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="extensions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Extension Recovery Status</CardTitle>
                  <CardDescription>
                    Status of extension loading and migration from old format to new CardEffects schema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.extensions.map((ext) => (
                      <div key={ext.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-semibold">{ext.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {ext.cardCount} cards migrated
                          </div>
                        </div>
                        <Badge variant={ext.migrationSuccess ? 'default' : 'destructive'}>
                          {ext.migrationSuccess ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Issues Found ({report.issues.length})</CardTitle>
                  <CardDescription>
                    Problems discovered during recovery that need attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.issues.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No issues found! All cards recovered successfully.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {report.issues.map((issue, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{issue.cardName}</div>
                            <Badge variant={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">ID: {issue.cardId}</div>
                          <div className="text-sm">{issue.issue}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Results</CardTitle>
                  <CardDescription>
                    Card effect validation and text generation analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.validationSummary ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-green-600">
                            {report.validationSummary.successCount}
                          </div>
                          <div className="text-sm text-muted-foreground">Valid Cards</div>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-red-600">
                            {report.validationSummary.errorCount}
                          </div>
                          <div className="text-sm text-muted-foreground">Invalid Cards</div>
                        </div>
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-blue-600">
                            {report.validationSummary.successRate?.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                      </div>

                      <Progress 
                        value={report.validationSummary.successRate || 0} 
                        className="h-2" 
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No validation data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}