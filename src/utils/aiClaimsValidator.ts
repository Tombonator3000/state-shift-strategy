// Validator to check if AI claims about code changes are actually true
export class AIClaimsValidator {
  
  static async validateClaim(claim: string, evidence: any): Promise<boolean> {
    console.log(`🤖 VALIDATING AI CLAIM: "${claim}"`);
    
    switch (claim.toLowerCase()) {
      case 'old system disabled':
        return this.validateOldSystemDisabled();
      
      case 'new system active':
        return this.validateNewSystemActive();
      
      case 'debugging added':
        return this.validateDebuggingAdded();
      
      case 'config file accessible':
        return await this.validateConfigFileAccessible();
      
      default:
        console.warn('⚠️ Unknown claim type:', claim);
        return false;
    }
  }
  
  private static validateOldSystemDisabled(): boolean {
    // Check if old TabloidNewspaper is not in DOM
    const oldElements = document.querySelectorAll('[class*="TabloidNewspaper"]');
    const isDisabled = oldElements.length === 0;
    
    console.log(isDisabled ? '✅ Old system disabled' : '❌ Old system still active');
    return isDisabled;
  }
  
  private static validateNewSystemActive(): boolean {
    // Check if new system functions exist
    const hasNewFunctions = typeof (window as any).debugNewspaper === 'function' &&
                           typeof (window as any).testNewspaper === 'function';
    
    console.log(hasNewFunctions ? '✅ New system functions exist' : '❌ New system functions missing');
    return hasNewFunctions;
  }
  
  private static validateDebuggingAdded(): boolean {
    // Check console for debug messages or test if debug functions exist
    const hasDebugFunctions = typeof (window as any).verifyRealTime === 'function';
    
    console.log(hasDebugFunctions ? '✅ Debug functions exist' : '❌ Debug functions missing');
    return hasDebugFunctions;
  }
  
  private static async validateConfigFileAccessible(): Promise<boolean> {
    try {
      const response = await fetch('/data/newspaper.config.json');
      const isAccessible = response.ok;
      
      console.log(isAccessible ? '✅ Config file accessible' : '❌ Config file not accessible');
      return isAccessible;
    } catch (error) {
      console.log('❌ Config file error:', error);
      return false;
    }
  }
  
  static async runAllValidations(): Promise<{ passed: number; failed: number; results: any[] }> {
    console.log('🧐 RUNNING AI CLAIMS VALIDATION');
    console.log('===============================');
    
    const claims = [
      'old system disabled',
      'new system active',
      'debugging added',
      'config file accessible'
    ];
    
    const results = [];
    let passed = 0;
    let failed = 0;
    
    for (const claim of claims) {
      try {
        const result = await this.validateClaim(claim, null);
        results.push({ claim, result, status: result ? 'PASSED' : 'FAILED' });
        
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        results.push({ claim, result: false, status: 'ERROR', error });
        failed++;
      }
    }
    
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=====================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / claims.length) * 100)}%`);
    
    results.forEach(r => {
      const icon = r.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} ${r.claim}: ${r.status}`);
    });
    
    return { passed, failed, results };
  }
}

// Expose globally
if (typeof window !== 'undefined') {
  (window as any).validateAIClaims = AIClaimsValidator.runAllValidations;
}