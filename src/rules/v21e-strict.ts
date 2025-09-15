export type CanonicalEffects = {
  // Kjerne
  truthDelta?: number;                              // ±% Truth (global)
  ipDelta?: { self?: number; opponent?: number };   // ±IP
  draw?: number;                                    // trekk (self)
  discardOpponent?: number;                         // motstander kaster (random)
  zoneDefense?: number;                             // +forsvarsbonus (passivt)

  // Pressure
  pressureDelta?: number;                           // +/− til TARGET state
  pressureAllDelta?: number;                        // +/− til ALLE stater

  // Reaction (brukes kun i reaction-vindu)
  reaction?: { block?: boolean; immune?: boolean };

  // Varige modifikatorer / økonomi
  costModDelta?: { zone?: number; media?: number }; // +dyrere/−billigere
  ipIncomePerTurn?: number;                         // passiv IP/turn

  // Tidskontroll
  skipOpponentAction?: number;                      // hopp over N neste handlinger (typisk 1)

  // Betingelser
  conditional?: {
    ifTruthAtLeast?: number;
    ifZonesControlledAtLeast?: number;
    ifTargetStateIs?: string;                       // sammenlignes mot stateId (USPS-kode)
    then?: CanonicalEffects;
    else?: CanonicalEffects;
  };
};
