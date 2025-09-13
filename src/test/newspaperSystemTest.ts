// Test file for the newspaper system
import { newspaper } from '@/systems/newspaper';
import { GameCard } from '@/types/cardTypes';

// Mock card for testing
const testCard: GameCard = {
  id: 'test-media-card',
  name: 'LEAKED DOCUMENTS',
  type: 'MEDIA',
  faction: 'truth',
  cost: 3,
  flavorTruth: 'The truth is finally revealed in these classified files.',
  flavorGov: 'Damage control measures are now in effect.',
  effects: {
    truthDelta: 8,
    ipDelta: { self: 2 }
  }
};

const testContext = {
  round: 1,
  truth: 65,
  ip: { human: 12, ai: 18 },
  states: []
};

export const testNewspaperSystem = async () => {
  console.log('🧪 Testing newspaper system...\n');
  
  try {
    // Test 1: Load configuration
    console.log('📰 Loading newspaper configuration...');
    const config = await newspaper.loadConfig();
    console.log('✅ Configuration loaded successfully');
    console.log(`   - ${config.mastheads.length} mastheads available`);
    console.log(`   - ${config.ads.length} fake ads available`);
    console.log(`   - ${config.headlineTemplates.length} headline templates available\n`);
    
    // Test 2: Queue a card article
    console.log('📝 Queuing test article...');
    newspaper.queueArticleFromCard(testCard, testContext);
    console.log('✅ Article queued successfully\n');
    
    // Test 3: Generate newspaper issue
    console.log('📰 Generating newspaper issue...');
    const issue = newspaper.flushForRound(1);
    console.log('✅ Newspaper issue generated successfully');
    console.log(`   - Masthead: "${issue.masthead}"`);
    console.log(`   - Volume: ${issue.volume}`);
    console.log(`   - Main articles: ${issue.mainArticles.length}`);
    console.log(`   - Fake ads: ${issue.ads.length}`);
    console.log(`   - Ticker items: ${issue.ticker.length}`);
    console.log(`   - Is glitch edition: ${issue.isGlitchEdition}\n`);
    
    // Test 4: Check article content
    if (issue.mainArticles.length > 0) {
      const article = issue.mainArticles[0];
      console.log('📄 Sample article generated:');
      console.log(`   - Title: "${article.title}"`);
      console.log(`   - Dek: "${article.dek}"`);
      console.log(`   - Body paragraphs: ${article.body.length}`);
      console.log(`   - Image URL: ${article.imageUrl}`);
      console.log(`   - Stamp: ${article.stamp}\n`);
    }
    
    // Test 5: Check fake ads
    if (issue.ads.length > 0) {
      const ad = issue.ads[0];
      console.log('📢 Sample fake ad:');
      console.log(`   - Title: "${ad.title}"`);
      console.log(`   - Body: "${ad.body}"\n`);
    }
    
    console.log('🎉 All newspaper system tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Newspaper system test failed:', error);
    return false;
  }
};

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to run tests automatically
  // setTimeout(() => testNewspaperSystem(), 2000);
}