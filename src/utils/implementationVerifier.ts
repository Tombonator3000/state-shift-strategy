// Automatic verification system to check if claimed implementations actually exist
import { newspaper } from '@/systems/newspaper';

export interface VerificationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  details: Record<string, any>;
}

export class ImplementationVerifier {
  
  static async verifyNewspaperSystem(): Promise<VerificationResult> {
    console.log('🔍 VERIFYING NEWSPAPER SYSTEM IMPLEMENTATION');
    console.log('============================================');
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const details: Record<string, any> = {};
    
    try {
      // 1. Check if old system is properly disabled
      console.log('1. Checking if old TabloidNewspaper is disabled...');
      const indexPageContent = await this.getFileContent('/src/pages/Index.tsx');
      
      // Look for the old system render
      const hasOldSystemDisabled = indexPageContent.includes('{false && gameState.showNewspaper &&') ||
                                   indexPageContent.includes('OLD NEWSPAPER SYSTEM - DISABLED');
      
      if (!hasOldSystemDisabled) {
        errors.push('❌ Old TabloidNewspaper system is NOT properly disabled');
      } else {
        console.log('✅ Old system is disabled');
        details.oldSystemDisabled = true;
      }
      
      // 2. Check if new system is active
      console.log('2. Checking if new NewspaperOverlay is active...');
      const hasNewSystemActive = indexPageContent.includes('NewspaperOverlay') &&
                                 indexPageContent.includes('isNewspaperVisible && currentIssue');
      
      if (!hasNewSystemActive) {
        errors.push('❌ New NewspaperOverlay system is NOT active');
      } else {
        console.log('✅ New system is active');
        details.newSystemActive = true;
      }
      
      // 3. Check if config file exists and is accessible
      console.log('3. Checking newspaper config file...');
      try {
        const configResponse = await fetch('/data/newspaper.config.json');
        if (!configResponse.ok) {
          errors.push(`❌ Config file not accessible: ${configResponse.status}`);
        } else {
          const configData = await configResponse.json();
          details.configFile = {
            accessible: true,
            mastheads: configData.mastheads?.length || 0,
            ads: configData.ads?.length || 0,
            templates: configData.headlineTemplates?.length || 0
          };
          console.log('✅ Config file accessible with data:', details.configFile);
        }
      } catch (error) {
        errors.push(`❌ Config file error: ${error}`);
      }
      
      // 4. Check if newspaper system can be initialized
      console.log('4. Testing newspaper system initialization...');
      try {
        await newspaper.loadConfig();
        console.log('✅ Newspaper system initializes successfully');
        details.systemInitialization = true;
      } catch (error) {
        errors.push(`❌ Newspaper system initialization failed: ${error}`);
      }
      
      // 5. Check if debugging is implemented
      console.log('5. Checking if debugging is implemented...');
      const gameStateContent = await this.getFileContent('/src/hooks/useGameState.ts');
      
      const hasDebugInCardPlay = gameStateContent.includes('🎮 PLAYING CARD:') &&
                                gameStateContent.includes('📰 QUEUEING ARTICLE');
      
      if (!hasDebugInCardPlay) {
        warnings.push('⚠️ Card play debugging may not be properly implemented');
      } else {
        console.log('✅ Card play debugging is implemented');
        details.cardPlayDebugging = true;
      }
      
      // 6. Check if useNewspaper hook is integrated
      console.log('6. Checking useNewspaper hook integration...');
      const hasNewspaperHook = indexPageContent.includes('useNewspaper') &&
                              indexPageContent.includes('showNewspaperForRound');
      
      if (!hasNewspaperHook) {
        errors.push('❌ useNewspaper hook is NOT properly integrated');
      } else {
        console.log('✅ useNewspaper hook is integrated');
        details.newspaperHookIntegrated = true;
      }
      
      // 7. Test article generation
      console.log('7. Testing article generation...');
      try {
        const testCard = {
          id: 'verify-test',
          name: 'VERIFICATION TEST',
          type: 'MEDIA' as const,
          faction: 'truth' as const,
          cost: 1,
          flavorTruth: 'Test flavor',
          flavorGov: 'Test flavor gov',
          effects: { truthDelta: 5 }
        };
        
        const testContext = {
          round: 1,
          truth: 50,
          ip: { human: 10, ai: 10 },
          states: []
        };
        
        newspaper.queueArticleFromCard(testCard, testContext);
        const issue = newspaper.flushForRound(999); // Use high round number to avoid conflicts
        
        if (issue.mainArticles.length > 0) {
          console.log('✅ Article generation works');
          details.articleGeneration = {
            working: true,
            articleTitle: issue.mainArticles[0].title,
            masthead: issue.masthead
          };
        } else {
          warnings.push('⚠️ Article generation produces empty articles');
        }
      } catch (error) {
        errors.push(`❌ Article generation failed: ${error}`);
      }
      
      // 8. Check if classified placeholder exists
      console.log('8. Checking classified placeholder image...');
      try {
        const imageResponse = await fetch('/img/classified-placeholder.png');
        if (!imageResponse.ok) {
          warnings.push('⚠️ Classified placeholder image may not exist');
        } else {
          console.log('✅ Classified placeholder exists');
          details.classifiedPlaceholder = true;
        }
      } catch (error) {
        warnings.push(`⚠️ Could not verify classified placeholder: ${error}`);
      }
      
    } catch (error) {
      errors.push(`❌ Verification system error: ${error}`);
    }
    
    // Summary
    const passed = errors.length === 0;
    console.log('\n📊 VERIFICATION SUMMARY');
    console.log('=======================');
    console.log(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 ERRORS:');
      errors.forEach(error => console.log(error));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(warning => console.log(warning));
    }
    
    console.log('\n📋 DETAILS:', details);
    
    return {
      passed,
      errors,
      warnings,
      details
    };
  }
  
  private static async getFileContent(filePath: string): Promise<string> {
    // This is a simulation - in a real implementation, we'd need to fetch the file
    // For now, we'll use a placeholder that always returns empty string
    // In a real scenario, you'd need to implement file reading
    console.log(`📄 Would read file: ${filePath}`);
    return '';
  }
  
  static async verifyAllImplementations(): Promise<VerificationResult> {
    console.log('🔍 RUNNING COMPLETE IMPLEMENTATION VERIFICATION');
    console.log('==============================================');
    
    const newspaperResult = await this.verifyNewspaperSystem();
    
    // Add more verification methods here as needed
    // const otherResult = await this.verifyOtherSystem();
    
    return newspaperResult;
  }
}

// Expose globally for easy access
if (typeof window !== 'undefined') {
  (window as any).verifyImplementation = ImplementationVerifier.verifyAllImplementations;
  (window as any).verifyNewspaper = ImplementationVerifier.verifyNewspaperSystem;
}