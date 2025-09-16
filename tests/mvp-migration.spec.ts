import { describe, it, expect } from "vitest";
import { migrateCardsInMemory, type LegacyCard } from "../scripts/migrate-to-mvp";
import { validateCard } from "../scripts/validate-mvp";

describe("migrateCardsInMemory", () => {
  it("normalizes legacy cards to MVP schema", () => {
    const legacyCards: LegacyCard[] = [
      {
        id: "CARD-001",
        name: "Intercepted Orders",
        faction: "Truth",
        type: "DEFENSIVE",
        rarity: "common",
        cost: 7,
        effects: { ipDelta: { opponent: -5 }, discardOpponent: 2 },
        flavorTruth: "Truth owns the narrative.",
        flavorGov: "Files lost in transit.",
      },
      {
        id: "CARD-002",
        name: "Logistics Web",
        faction: "GOVERNMENT",
        type: "DEFENSIVE",
        rarity: "rare",
        cost: 9,
        effects: { ipDelta: { self: 3 } },
        flavorGov: "Supplies arrive before the rumors.",
      },
      {
        id: "CARD-003",
        name: "Satellite Flash",
        faction: "truth",
        type: "MEDIA",
        rarity: "uncommon",
        cost: 8,
        effects: { truthDelta: 7, draw: 1 },
      },
      {
        id: "CARD-004",
        name: "Token Strike",
        faction: "government",
        type: "ATTACK",
        rarity: "common",
        cost: 2,
        effects: { ipDelta: { opponent: 0 }, discardOpponent: 2 },
      },
      {
        id: "CARD-005",
        name: "Total Shutdown",
        faction: "government",
        type: "ATTACK",
        rarity: "legendary",
        cost: 7,
        effects: { ipDelta: { opponent: 9 }, discardOpponent: 3 },
      },
      {
        id: "CARD-006",
        name: "Gradual Influence",
        faction: "truth",
        type: "ZONE",
        rarity: "uncommon",
        cost: 6,
        effects: { pressureDelta: 3.6, draw: 1 },
      },
    ];

    const { cards } = migrateCardsInMemory(legacyCards);

    expect(cards).toHaveLength(6);

    const [convertedAttack, convertedZone, mediaCard, lowAttack, highAttack, fractionalZone] = cards;

    expect(convertedAttack.type).toBe("ATTACK");
    expect(convertedAttack.faction).toBe("truth");
    expect(convertedAttack.effects).toEqual({ ipDelta: { opponent: 4 }, discardOpponent: 2 });
    expect(convertedAttack.rarity).toBe("legendary");
    expect(convertedAttack.cost).toBe(5);
    expect(convertedAttack.flavor).toBe("Truth owns the narrative.");

    expect(convertedZone.type).toBe("ZONE");
    expect(convertedZone.faction).toBe("government");
    expect(convertedZone.effects).toEqual({ pressureDelta: 3 });
    expect(convertedZone.rarity).toBe("rare");
    expect(convertedZone.cost).toBe(6);
    expect(convertedZone.flavor).toBe("Supplies arrive before the rumors.");

    expect(mediaCard.type).toBe("MEDIA");
    expect(mediaCard.effects).toEqual({ truthDelta: 4 });
    expect(mediaCard.rarity).toBe("legendary");
    expect(mediaCard.cost).toBe(6);

    expect(lowAttack.effects).toEqual({ ipDelta: { opponent: 1 } });
    expect(lowAttack.rarity).toBe("common");
    expect("discardOpponent" in (lowAttack.effects as any)).toBe(false);

    expect(highAttack.effects).toEqual({ ipDelta: { opponent: 4 }, discardOpponent: 2 });
    expect(highAttack.rarity).toBe("legendary");
    expect(highAttack.cost).toBe(5);

    expect(fractionalZone.effects).toEqual({ pressureDelta: 3 });
    expect(fractionalZone.rarity).toBe("rare");
    expect(fractionalZone.cost).toBe(6);

    const validationErrors = cards.flatMap((card) =>
      validateCard(card, { file: "test-suite", exportName: "sample" })
    );
    expect(validationErrors).toHaveLength(0);
  });
});
