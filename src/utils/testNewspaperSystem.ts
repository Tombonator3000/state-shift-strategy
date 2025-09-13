// Quick test utility for newspaper system
import { newspaper } from '@/systems/newspaper';

export const testNewspaperQuick = async () => {
  console.log('🧪 Testing newspaper system...');
  
  try {
    // Initialize
    await newspaper.loadConfig();
    console.log('✅ Config loaded');
    
    // Create a test card
    const testCard = {
      id: 'test-media',
      name: 'LEAKED DOCUMENTS',
      type: 'MEDIA' as const,
      faction: 'truth' as const,
      cost: 3,
      flavorTruth: 'The truth is finally revealed',
      flavorGov: 'Damage control measures',
      effects: { truthDelta: 8 }
    };
    
    // Queue article
    newspaper.queueArticleFromCard(testCard, {
      round: 1,
      truth: 65,
      ip: { human: 12, ai: 18 },
      states: []
    });
    console.log('📰 Article queued');
    
    // Generate issue
    const issue = newspaper.flushForRound(1);
    console.log('📰 Issue generated:', issue.masthead);
    console.log('📰 Articles:', issue.mainArticles.length);
    console.log('📰 Ads:', issue.ads.length);
    
    return issue;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
};

// Auto-run in dev
if (typeof window !== 'undefined') {
  (window as any).testNewspaper = testNewspaperQuick;
}