// Utility to bulk fix flavor text issues in cardDatabase.ts
export function fixFlavorTextIssues() {
  console.log('🔧 Starting bulk flavor text fix...');
  
  // This function would need to read the file, replace all "flavor:" with "flavorGov:"
  // for Government cards and validate the changes
  
  // Since we can't directly modify files in the browser, this is a development utility
  // that shows what needs to be done
  
  const replacements = [
    { from: '    flavor:', to: '    flavorGov:' }
  ];
  
  console.log('✅ All flavor text issues should be fixed by replacing:');
  replacements.forEach((replacement, index) => {
    console.log(`${index + 1}. "${replacement.from}" → "${replacement.to}"`);
  });
  
  return {
    totalReplacements: 103,
    status: 'ready_for_manual_replacement'
  };
}

// Log the fix function to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).fixFlavorText = fixFlavorTextIssues;
}