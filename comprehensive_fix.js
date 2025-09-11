const fs = require('fs');

let content = fs.readFileSync('src/data/cardDatabase.ts', 'utf8');

console.log('Starting comprehensive fix...');

// Fix 1: All RESOURCE -> DEVELOPMENT
let resourceCount = (content.match(/type: "RESOURCE"/g) || []).length;
content = content.replace(/type: "RESOURCE"/g, 'type: "DEVELOPMENT"');
console.log(`Fixed ${resourceCount} RESOURCE -> DEVELOPMENT`);

// Fix 2: All DEFENSE -> DEFENSIVE  
let defenseCount = (content.match(/type: "DEFENSE"/g) || []).length;
content = content.replace(/type: "DEFENSE"/g, 'type: "DEFENSIVE"');
console.log(`Fixed ${defenseCount} DEFENSE -> DEFENSIVE`);

// Fix 3: Government cards flavor: -> flavorGov:
// Find the Government section start
const governmentStart = content.indexOf('// ===== BATCH 5: GOVERNMENT (1-50) =====');
if (governmentStart === -1) {
  console.error('Could not find Government section marker');
  process.exit(1);
}

// Split content at Government section
const beforeGov = content.substring(0, governmentStart);
const afterGov = content.substring(governmentStart);

// Fix Government cards: flavor: -> flavorGov:
let govFlavorCount = (afterGov.match(/(\s+)flavor: "/g) || []).length;
const fixedAfterGov = afterGov.replace(/(\s+)flavor: "/g, '$1flavorGov: "');
console.log(`Fixed ${govFlavorCount} Government flavor -> flavorGov`);

// Fix any remaining Truth cards: flavor: -> flavorTruth: (in case any were missed)
let truthFlavorCount = (beforeGov.match(/(\s+)flavor: "/g) || []).length;  
const fixedBeforeGov = beforeGov.replace(/(\s+)flavor: "/g, '$1flavorTruth: "');
console.log(`Fixed ${truthFlavorCount} Truth flavor -> flavorTruth`);

// Reconstruct the file
const finalContent = fixedBeforeGov + fixedAfterGov;

fs.writeFileSync('src/data/cardDatabase.ts', finalContent, 'utf8');
console.log('✅ All fixes applied successfully!');