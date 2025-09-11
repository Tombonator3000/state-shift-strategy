const fs = require('fs');

const content = fs.readFileSync('src/data/cardDatabase.ts', 'utf8');

// Fix all remaining flavor: -> flavorTruth: for Truth cards (before Government section)
// Fix all remaining flavor: -> flavorGov: for Government cards (after Government section)

const governmentStart = content.indexOf('// ===== BATCH 5: GOVERNMENT (1-50) =====');
if (governmentStart === -1) {
    console.error('Could not find Government section');
    process.exit(1);
}

const truthSection = content.substring(0, governmentStart);
const govSection = content.substring(governmentStart);

// Fix Truth cards
const fixedTruthSection = truthSection.replace(/(\s+)flavor: "/g, '$1flavorTruth: "');

// Fix Government cards  
const fixedGovSection = govSection.replace(/(\s+)flavor: "/g, '$1flavorGov: "');

const fixedContent = fixedTruthSection + fixedGovSection;

fs.writeFileSync('src/data/cardDatabase.ts', fixedContent, 'utf8');
console.log('Fixed all flavor fields successfully!');