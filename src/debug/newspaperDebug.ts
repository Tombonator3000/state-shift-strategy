// Debug utilities for newspaper system
import { newspaper } from '@/systems/newspaper';

export const debugNewspaperSystem = async () => {
  console.log('🔍 NEWSPAPER SYSTEM DEBUG');
  console.log('========================');
  
  try {
    // Test config loading
    console.log('1. Testing config loading...');
    const config = await newspaper.loadConfig();
    console.log('✅ Config loaded:', {
      mastheads: config.mastheads.length,
      ads: config.ads.length,
      templates: config.headlineTemplates.length
    });
    
    // Test article generation
    console.log('2. Testing article generation...');
    const testCard = {
      id: 'debug-test',
      name: 'DEBUG CARD',
      type: 'MEDIA' as const,
      faction: 'truth' as const,
      cost: 1,
      flavorTruth: 'Debug flavor',
      flavorGov: 'Debug flavor gov',
      effects: { truthDelta: 5 }
    };
    
    const testContext = {
      round: 1,
      truth: 50,
      ip: { human: 10, ai: 10 },
      states: []
    };
    
    console.log('Queueing test card:', testCard.name);
    newspaper.queueArticleFromCard(testCard, testContext);
    console.log('✅ Card queued');
    
    // Test issue generation
    console.log('3. Testing issue generation...');
    const issue = newspaper.flushForRound(1);
    console.log('✅ Issue generated:', {
      masthead: issue.masthead,
      articles: issue.mainArticles.length,
      ads: issue.ads.length
    });
    
    if (issue.mainArticles.length > 0) {
      console.log('📄 Sample article:', {
        title: issue.mainArticles[0].title,
        dek: issue.mainArticles[0].dek,
        bodyParagraphs: issue.mainArticles[0].body.length
      });
    }
    
    console.log('🎉 All newspaper debug tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Newspaper debug failed:', error);
    return false;
  }
};

// Expose globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).debugNewspaper = debugNewspaperSystem;
}