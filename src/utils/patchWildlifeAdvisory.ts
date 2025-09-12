// Wildlife Advisory Patch Utility
// Fixes Wildlife Advisory cards to be ZONE type with proper targeting and effects

export interface WildlifeAdvisoryPatchResult {
  updated: number;
  alreadyOk: number;
  errors: string[];
}

export async function patchWildlifeAdvisoryCards(): Promise<WildlifeAdvisoryPatchResult> {
  const result: WildlifeAdvisoryPatchResult = {
    updated: 0,
    alreadyOk: 0,
    errors: []
  };

  try {
    // Load cryptids.json
    const response = await fetch('/extensions/cryptids.json');
    if (!response.ok) {
      throw new Error(`Failed to load cryptids.json: ${response.statusText}`);
    }
    
    const data = await response.json();
    const cards = data.cards || [];

    for (const card of cards) {
      const name = card.name || "";
      const match = name.match(/^(.*) Wildlife Advisory$/);
      if (!match) continue;

      const state = match[1].trim();
      let cardUpdated = false;

      // Ensure faction is government (lowercase, v2.1)
      if (card.faction !== "government") {
        card.faction = "government";
        cardUpdated = true;
      }

      // Make it a ZONE card
      if (card.type !== "ZONE") {
        card.type = "ZONE";
        cardUpdated = true;
      }

      // Set cost to 5 (v2.1 for ZONE)
      if (card.cost !== 5) {
        card.cost = 5;
        cardUpdated = true;
      }

      // Target must be a state
      const target = card.target || {};
      if (target.scope !== "state" || target.count !== 1) {
        card.target = { scope: "state", count: 1 };
        cardUpdated = true;
      }

      // Ensure base debunk: -4% Truth
      card.effects = card.effects || {};
      if (card.effects.truthDelta !== -4) {
        card.effects.truthDelta = -4;
        cardUpdated = true;
      }

      // Ensure home-state bonus: -2% extra Truth if targeting home state
      const conditional = card.effects.conditional || {};
      if (conditional.ifTargetStateIs !== state) {
        conditional.ifTargetStateIs = state;
        cardUpdated = true;
      }

      const thenBlock = conditional.then || {};
      if (!(typeof thenBlock.truthDelta === "number" && thenBlock.truthDelta <= -2)) {
        thenBlock.truthDelta = -2;
        cardUpdated = true;
      }

      conditional.then = thenBlock;
      card.effects.conditional = conditional;

      // Add advisory tag
      const tags = new Set([...(card.tags || []), "advisory"]);
      if (tags.size !== (card.tags?.length || 0)) {
        card.tags = Array.from(tags);
        cardUpdated = true;
      }

      if (cardUpdated) {
        result.updated++;
      } else {
        result.alreadyOk++;
      }
    }

    // Create download link for the fixed file
    const fixedJson = JSON.stringify(data, null, 2);
    const blob = new Blob([fixedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cryptids-wildlife-advisory-fixed.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  return result;
}