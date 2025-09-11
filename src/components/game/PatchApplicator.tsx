import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { 
  PatchParser, 
  PatchValidator, 
  PatchApplicator,
  type ParsedPatch,
  type ValidationResult,
  type PatchApplicationResult
} from '@/data/patchApplication';

interface PatchApplicatorProps {
  onPatchApplied?: () => void;
  onClose?: () => void;
}

const PatchApplicatorComponent = ({ onPatchApplied, onClose }: PatchApplicatorProps) => {
  const [txtContent, setTxtContent] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedPatch, setParsedPatch] = useState<ParsedPatch | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [applicationResult, setApplicationResult] = useState<PatchApplicationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleTxtParse = useCallback(() => {
    if (!txtContent.trim()) return;
    
    try {
      setIsProcessing(true);
      const parsed = PatchParser.parseTXT(txtContent);
      setParsedPatch(parsed);
      
      const validationResult = PatchValidator.validate(parsed);
      setValidation(validationResult);
      
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [`Parse error: ${error}`],
        warnings: []
      });
    } finally {
      setIsProcessing(false);
    }
  }, [txtContent]);
  
  const handleCsvUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setIsProcessing(true);
        const content = e.target?.result as string;
        const parsed = PatchParser.parseCSV(content);
        setParsedPatch(parsed);
        
        const validationResult = PatchValidator.validate(parsed);
        setValidation(validationResult);
        
      } catch (error) {
        setValidation({
          isValid: false,
          errors: [`CSV parse error: ${error}`],
          warnings: []
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsText(file);
  }, []);
  
  const handleApplyPatch = useCallback(async () => {
    if (!parsedPatch || !validation?.isValid) return;
    
    try {
      setIsProcessing(true);
      const result = await PatchApplicator.applyPatch(parsedPatch);
      setApplicationResult(result);
      
      if (result.success && onPatchApplied) {
        onPatchApplied();
      }
      
    } catch (error) {
      setApplicationResult({
        success: false,
        appliedCards: 0,
        skippedCards: parsedPatch.cards.length,
        errors: [`Application error: ${error}`],
        changes: []
      });
    } finally {
      setIsProcessing(false);
    }
  }, [parsedPatch, validation, onPatchApplied]);
  
  const downloadReport = useCallback((format: 'csv' | 'json' | 'txt' = 'txt') => {
    if (!applicationResult || !parsedPatch) return;
    
    let content: string;
    let filename: string;
    let mimeType: string;
    
    if (format === 'csv') {
      content = PatchApplicator.exportPatchSummary(applicationResult, 'csv');
      filename = `patch_applied_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = PatchApplicator.exportPatchSummary(applicationResult, 'json');
      filename = `patch_applied_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      content = PatchApplicator.generateReport(applicationResult, parsedPatch);
      filename = `Patch_Apply_Report_${new Date().toISOString().split('T')[0]}.txt`;
      mimeType = 'text/plain';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [applicationResult, parsedPatch]);
  
  const resetState = useCallback(() => {
    setTxtContent('');
    setCsvFile(null);
    setParsedPatch(null);
    setValidation(null);
    setApplicationResult(null);
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patch Applicator</h2>
          <p className="text-muted-foreground">Apply card balancing patches with validation and backup</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
      
      {/* Constraints Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Patch Constraints:</strong> Cost cap ≤15, Step limit ±3 IP, Rarity changes ±1 tier only. 
          Automatic backup created before application.
        </AlertDescription>
      </Alert>
      
      {/* Input Methods */}
      <Tabs defaultValue="txt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="txt">TXT Patch Format</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="txt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                TXT Patch Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste TXT patch content here...

Example format:
PATCH-VERSION: v1.0-calibrated
CONSTRAINTS: cap15; step<=3; rarityChangeAllowed

CARD: media_001 | Cable News Spin
CURRENT: cost=4, rarity=common
STEP 1: cost +3 -> 7, rarity=unchanged ; REASON: MEDIA near threshold
STEP 2: cost +3 -> 10, rarity=promote ; REASON: Move to uncommon budget
CLASS: undercosted ; ALIGNMENT: aligned ; SEVERITY: medium"
                value={txtContent}
                onChange={(e) => setTxtContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleTxtParse}
                  disabled={!txtContent.trim() || isProcessing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  Parse & Validate
                </Button>
                
                <Button variant="outline" onClick={() => setTxtContent('')}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                CSV File Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-dashed border-2 border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select CSV patch file
                  </p>
                  <p className="text-xs text-muted-foreground/75 mt-1">
                    Expected columns: cardId, currentCost, currentRarity, step, recCost, recRarity, reason
                  </p>
                </label>
              </div>
              
              {csvFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{csvFile.name}</span>
                  <Badge variant="outline">{(csvFile.size / 1024).toFixed(1)} KB</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Validation Results */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedPatch && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{parsedPatch.cards.length}</div>
                  <div className="text-sm text-muted-foreground">Cards to Patch</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {validation.isValid ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-muted-foreground">Valid Format</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{validation.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{validation.warnings.length}</div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
              </div>
            )}
            
            {validation.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-500 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Errors Found
                </h4>
                <ul className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-400 bg-red-900/20 p-2 rounded">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-500 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings
                </h4>
                <ul className="space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-400 bg-yellow-900/20 p-2 rounded">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Patch Preview */}
      {parsedPatch && validation?.isValid && (
        <Card>
          <CardHeader>
            <CardTitle>Patch Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {parsedPatch.cards.slice(0, 10).map((card) => (
                <div key={card.cardId} className="border rounded p-3 text-sm">
                  <div className="font-medium">{card.cardName || card.cardId}</div>
                  <div className="text-muted-foreground">
                    Cost: {card.currentCost} → {card.steps[card.steps.length - 1]?.newCost} 
                    ({card.steps.length} steps)
                  </div>
                  <div className="text-muted-foreground">
                    Rarity: {card.currentRarity} → {card.steps[card.steps.length - 1]?.newRarity}
                  </div>
                </div>
              ))}
              
              {parsedPatch.cards.length > 10 && (
                <div className="text-center text-muted-foreground text-sm">
                  ... and {parsedPatch.cards.length - 10} more cards
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex gap-2">
              <Button
                onClick={handleApplyPatch}
                disabled={isProcessing || !validation.isValid}
                className="flex items-center gap-2"
                variant="default"
              >
                <Zap className={`h-4 w-4 ${isProcessing ? 'animate-pulse' : ''}`} />
                {isProcessing ? 'Applying...' : 'Apply Patch'}
              </Button>
              
              <Button variant="outline" onClick={resetState}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Application Results */}
      {applicationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {applicationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Patch Application Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{applicationResult.appliedCards}</div>
                <div className="text-sm text-muted-foreground">Cards Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{applicationResult.skippedCards}</div>
                <div className="text-sm text-muted-foreground">Cards Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{applicationResult.changes.length}</div>
                <div className="text-sm text-muted-foreground">Total Changes</div>
              </div>
            </div>
            
            {applicationResult.backupPath && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Backup created: <code>{applicationResult.backupPath}</code>
                </AlertDescription>
              </Alert>
            )}
            
            {applicationResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-500 mb-2">Application Errors</h4>
                <ul className="space-y-1">
                  {applicationResult.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-400 bg-red-900/20 p-2 rounded">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Separator />
            
            <div className="flex gap-2">
              <Button
                onClick={() => downloadReport('txt')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Report (TXT)
              </Button>
              
              <Button
                onClick={() => downloadReport('csv')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              
              <Button
                onClick={() => downloadReport('json')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatchApplicatorComponent;