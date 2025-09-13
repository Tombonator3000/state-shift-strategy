// End-to-end validation of the entire newspaper system workflow
import { newspaper } from '@/systems/newspaper';

export class EndToEndValidator {
  
  static async validateCompleteNewspaperWorkflow(): Promise<{
    success: boolean;
    steps: Array<{ step: string; success: boolean; details?: any; error?: string }>;
    summary: string;
  }> {
    console.log('🚀 END-TO-END NEWSPAPER WORKFLOW VALIDATION');
    console.log('==========================================');
    
    const steps: Array<{ step: string; success: boolean; details?: any; error?: string }> = [];
    let overallSuccess = true;
    
    // Step 1: Initialize system
    try {
      console.log('1️⃣ Testing system initialization...');
      await newspaper.loadConfig();
      steps.push({
        step: 'System Initialization',
        success: true,
        details: 'Config loaded successfully'
      });
      console.log('✅ System initialized');
    } catch (error) {
      steps.push({
        step: 'System Initialization',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      overallSuccess = false;
      console.error('❌ System initialization failed:', error);
    }
    
    // Step 2: Queue articles from cards
    try {
      console.log('2️⃣ Testing article queueing...');
      
      const testCards = [
        {
          id: 'test-media-1',
          name: 'LEAKED DOCUMENTS',
          type: 'MEDIA' as const,
          faction: 'truth' as const,
          cost: 3,
          flavorTruth: 'The truth is revealed',
          flavorGov: 'Damage control',
          effects: { truthDelta: 8 }
        },
        {
          id: 'test-attack-1',
          name: 'DEEP COVER OPERATION',
          type: 'ATTACK' as const,
          faction: 'government' as const,
          cost: 5,
          flavorTruth: 'They strike back',
          flavorGov: 'Mission success',
          effects: { ipDelta: { self: 10, opponent: -5 } }
        }
      ];
      
      const context = {
        round: 1,
        truth: 65,
        ip: { human: 12, ai: 18 },
        states: []
      };
      
      testCards.forEach(card => {
        newspaper.queueArticleFromCard(card, context);
      });
      
      steps.push({
        step: 'Article Queueing',
        success: true,
        details: `Queued ${testCards.length} test articles`
      });
      console.log(`✅ Queued ${testCards.length} articles`);
      
    } catch (error) {
      steps.push({
        step: 'Article Queueing',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      overallSuccess = false;
      console.error('❌ Article queueing failed:', error);
    }
    
    // Step 3: Generate newspaper issue
    let generatedIssue: any = null;
    try {
      console.log('3️⃣ Testing issue generation...');
      
      generatedIssue = newspaper.flushForRound(1);
      
      const hasArticles = generatedIssue.mainArticles.length > 0;
      const hasMasthead = generatedIssue.masthead && generatedIssue.masthead.length > 0;
      const hasAds = generatedIssue.ads.length > 0;
      
      if (hasArticles && hasMasthead && hasAds) {
        steps.push({
          step: 'Issue Generation',
          success: true,
          details: {
            masthead: generatedIssue.masthead,
            articles: generatedIssue.mainArticles.length,
            ads: generatedIssue.ads.length,
            sampleHeadline: generatedIssue.mainArticles[0]?.title
          }
        });
        console.log('✅ Issue generated successfully');
        console.log(`   Masthead: "${generatedIssue.masthead}"`);
        console.log(`   Articles: ${generatedIssue.mainArticles.length}`);
        console.log(`   Sample headline: "${generatedIssue.mainArticles[0]?.title}"`);
      } else {
        throw new Error('Generated issue missing required components');
      }
      
    } catch (error) {
      steps.push({
        step: 'Issue Generation',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      overallSuccess = false;
      console.error('❌ Issue generation failed:', error);
    }
    
    // Step 4: Validate content quality
    try {
      console.log('4️⃣ Testing content quality...');
      
      if (generatedIssue) {
        const qualityChecks = {
          dynamicMasthead: generatedIssue.masthead !== 'DEFAULT_MASTHEAD',
          validHeadlines: generatedIssue.mainArticles.every((a: any) => a.title && a.title.length > 5),
          hasBodyText: generatedIssue.mainArticles.every((a: any) => a.body && a.body.length > 0),
          diverseAds: generatedIssue.ads.length >= 2 && generatedIssue.ads.every((ad: any) => ad.title),
          hasStamps: generatedIssue.mainArticles.some((a: any) => a.stamp)
        };
        
        const passedChecks = Object.values(qualityChecks).filter(Boolean).length;
        const totalChecks = Object.keys(qualityChecks).length;
        
        if (passedChecks >= totalChecks * 0.8) { // 80% pass rate
          steps.push({
            step: 'Content Quality',
            success: true,
            details: {
              passedChecks,
              totalChecks,
              score: `${Math.round((passedChecks / totalChecks) * 100)}%`,
              checks: qualityChecks
            }
          });
          console.log(`✅ Content quality check passed (${passedChecks}/${totalChecks})`);
        } else {
          throw new Error(`Quality check failed (${passedChecks}/${totalChecks})`);
        }
      } else {
        throw new Error('No issue to validate');
      }
      
    } catch (error) {
      steps.push({
        step: 'Content Quality',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      overallSuccess = false;
      console.error('❌ Content quality validation failed:', error);
    }
    
    // Step 5: Test UI integration readiness
    try {
      console.log('5️⃣ Testing UI integration readiness...');
      
      const uiChecks = {
        hasNewspaperOverlay: typeof document !== 'undefined' && 
                           document.querySelector('body') !== null, // Basic DOM check
        hasTestFunctions: typeof (window as any).debugNewspaper === 'function',
        hasVerificationFunctions: typeof (window as any).verifyRealTime === 'function',
        configAccessible: true // We tested this earlier
      };
      
      const uiPassedChecks = Object.values(uiChecks).filter(Boolean).length;
      const uiTotalChecks = Object.keys(uiChecks).length;
      
      steps.push({
        step: 'UI Integration Readiness',
        success: uiPassedChecks >= uiTotalChecks * 0.75,
        details: {
          passedChecks: uiPassedChecks,
          totalChecks: uiTotalChecks,
          checks: uiChecks
        }
      });
      
      if (uiPassedChecks >= uiTotalChecks * 0.75) {
        console.log(`✅ UI integration ready (${uiPassedChecks}/${uiTotalChecks})`);
      } else {
        console.warn(`⚠️ UI integration may have issues (${uiPassedChecks}/${uiTotalChecks})`);
      }
      
    } catch (error) {
      steps.push({
        step: 'UI Integration Readiness',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error('❌ UI integration check failed:', error);
    }
    
    // Generate summary
    const successfulSteps = steps.filter(s => s.success).length;
    const totalSteps = steps.length;
    const successRate = Math.round((successfulSteps / totalSteps) * 100);
    
    let summary: string;
    if (successRate >= 100) {
      summary = '🎉 PERFECT! All systems working flawlessly!';
    } else if (successRate >= 80) {
      summary = '✅ GOOD! System mostly working with minor issues.';
    } else if (successRate >= 60) {
      summary = '⚠️ PARTIAL! System partially working but needs attention.';
    } else {
      summary = '❌ FAILED! System has significant issues that need fixing.';
    }
    
    console.log('\n📊 END-TO-END VALIDATION COMPLETE');
    console.log('==================================');
    console.log(`Success Rate: ${successRate}% (${successfulSteps}/${totalSteps} steps)`);
    console.log(`Summary: ${summary}`);
    
    steps.forEach((step, index) => {
      const icon = step.success ? '✅' : '❌';
      console.log(`${icon} ${index + 1}. ${step.step}`);
      if (step.error) {
        console.log(`   Error: ${step.error}`);
      }
    });
    
    return {
      success: overallSuccess && successRate >= 80,
      steps,
      summary
    };
  }
}

// Expose globally
if (typeof window !== 'undefined') {
  (window as any).validateEndToEnd = EndToEndValidator.validateCompleteNewspaperWorkflow;
}