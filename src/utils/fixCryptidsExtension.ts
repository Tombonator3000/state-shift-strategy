export const fixCryptidsExtension = async () => {
  try {
    // Fetch the current cryptids.json file
    const response = await fetch('/extensions/cryptids.json', {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cryptids.json');
    }
    
    const extension = await response.json();
    
    console.log('🔧 Fixing cryptids extension...');
    
    // Fix faction casing in all cards
    let fixedCount = 0;
    extension.cards.forEach((card: any) => {
      if (card.faction === 'truth') {
        card.faction = 'truth';
        fixedCount++;
      } else if (card.faction === 'Government') {
        card.faction = 'government';
        fixedCount++;
      }
    });
    
    console.log(`✅ Fixed ${fixedCount} faction casing issues`);
    
    // Convert back to JSON and create download link
    const fixedData = JSON.stringify(extension, null, 2);
    const blob = new Blob([fixedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cryptids-fixed.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Fixed cryptids.json downloaded');
    return extension;
    
  } catch (error) {
    console.error('❌ Failed to fix cryptids extension:', error);
    throw error;
  }
};