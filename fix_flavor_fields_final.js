const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/data/cardDatabase.ts', 'utf8');

// Replace all instances of `flavor: "` with `flavorGov: "` for Government cards
// This regex finds Government cards and replaces flavor with flavorGov
content = content.replace(
  /(faction: "Government",[\s\S]*?)(\s+)flavor: ("/g),
  '$1$2flavorGov: $3'
);

// Write back to file
fs.writeFileSync('src/data/cardDatabase.ts', content);

console.log('Fixed all Government card flavor fields to flavorGov');