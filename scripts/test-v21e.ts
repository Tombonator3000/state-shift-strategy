import { CardTextGenerator } from '../src/systems/CardTextGenerator';
import { validateCard } from '../src/systems/CardEffectValidator';
import { computeV21ECost } from '../src/systems/cost/v21e';

console.log('=== v2.1E System Tests ===\n');

// 1. Cost Engine Tests
console.log('1. Cost Engine Tests:');
console.log('-------------------');

const testEffects = [
  {
    name: 'Simple Truth Card',
    effects: { truthDelta: 5 },
    rarity: 'common' as const,
    expected: 'Should be ~5 cost'
  },
  {
    name: 'Legendary with Small Effect',
    effects: { truthDelta: 2 },
    rarity: 'legendary' as const,
    expected: 'Should be 25 (legendary minimum)'
  },
  {
    name: 'Complex Card with Conditional',
    effects: { 
      truthDelta: -6, 
      draw: 1,
      conditional: { ifTruthAtLeast: 40, then: { ipDelta: { self: 2 } } }
    },
    rarity: 'rare' as const,
    expected: 'High cost with conditional discount'
  }
];

testEffects.forEach(test => {
  const cost = computeV21ECost({ rarity: test.rarity, effects: test.effects });
  console.log(`${test.name}: ${cost} IP (${test.expected})`);
});

// 2. Text Generation Tests  
console.log('\n2. Text Generation Tests:');
console.log('------------------------');

const textTests = [
  {
    name: 'Basic Effects',
    effects: { truthDelta: -4, draw: 1 }
  },
  {
    name: 'Target State Conditional',
    effects: {
      truthDelta: -4,
      conditional: {
        ifTargetStateIs: 'South Carolina',
        then: { truthDelta: -2 }
      }
    }
  },
  {
    name: 'Complex Conditional',
    effects: {
      ipDelta: { self: 3 },
      conditional: {
        ifTruthAtLeast: 60,
        then: { ipDelta: { self: 1 } },
        else: { truthDelta: -2 }
      }
    }
  }
];

textTests.forEach(test => {
  const text = CardTextGenerator.generateRulesText(test.effects);
  console.log(`${test.name}:`);
  console.log(`  Generated: "${text}"`);
  console.log();
});

// 3. Validation Tests
console.log('3. Validation Tests:');
console.log('-------------------');

const validationTests = [
  {
    id: 'test-valid',
    name: 'Valid Card',
    faction: 'truth',
    type: 'ZONE' as const,
    rarity: 'common' as const,
    cost: 10,
    text: 'Test card',
    target: { scope: 'state' as const, count: 1 },
    effects: { truthDelta: 5, zoneDefense: 2 }
  },
  {
    id: 'test-invalid-faction',
    name: 'Invalid Faction',
    faction: 'TRUTH', // Wrong casing
    type: 'MEDIA' as const,
    rarity: 'common' as const,
    cost: 5,
    text: 'Test card',
    effects: { truthDelta: 3 }
  },
  {
    id: 'test-invalid-legendary',
    name: 'Cheap Legendary',
    faction: 'government',
    type: 'MEDIA' as const,
    rarity: 'legendary' as const,
    cost: 10, // Too low for legendary
    text: 'Test card',
    effects: { truthDelta: -2 }
  }
];

validationTests.forEach(test => {
  const result = validateCard(test as any);
  console.log(`${test.name}: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
  if (!result.isValid) {
    result.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  console.log();
});

console.log('=== Test Complete ===');