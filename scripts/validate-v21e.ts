import { CARD_DATABASE } from '../src/data/cardDatabase';
import { createValidationReport } from '../src/systems/CardEffectValidator';

console.log('Running v2.1E validation...\n');

const report = createValidationReport(CARD_DATABASE);
console.log(report);

// Exit with error code if validation fails
const hasErrors = report.includes('Invalid Cards: ') && !report.includes('Invalid Cards: 0');
if (hasErrors) {
  console.log('\n❌ Validation failed! Fix the issues above before proceeding.');
  process.exit(1);
} else {
  console.log('\n✅ All cards passed v2.1E validation!');
  process.exit(0);
}