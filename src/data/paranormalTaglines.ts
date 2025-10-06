export const CRYPTID_SIGHTING_TAGLINES: readonly string[] = [
  '{{QUALITY}} footage from {{LOCATION}} rattles the paranormal watch.',
  'Incident desk files {{QUALITY}} trail cam ping out of {{LOCATION}}.',
  'Field scouts relay {{QUALITY}} anomaly clip stamped {{LOCATION}}.',
  'Archive receives {{QUALITY}} hotspot reel straight from {{LOCATION}}.',
] as const;

export const HOTSPOT_SPAWN_TAGLINES: readonly string[] = [
  'Containment grid braces in {{STATE}}: Defense +{{DEFENSE}}, ±{{TRUTH}}% truth on the line.',
  'New anomaly blooms over {{STATE}} — shields +{{DEFENSE}}, truth stakes ±{{TRUTH}}%.',
  '{{STATE}} ops scramble as spectral surge promises +{{DEFENSE}} defense, ±{{TRUTH}}% truth swing.',
] as const;

export const HOTSPOT_RESOLUTION_TAGLINES: readonly string[] = [
  '{{STATE}} taskforce locks it down; truth shifts {{TRUTH_DELTA}}%.',
  'Containment crew in {{STATE}} reports final truth delta {{TRUTH_DELTA}}%.',
  'Casefile closed in {{STATE}} with truth meter settling at {{TRUTH_DELTA}}%.',
] as const;

export const HOTSPOT_EXPIRE_TAGLINES: readonly string[] = [
  '{{STATE}} anomaly fizzles; defenses normalize and sensors fall quiet.',
  'Residual echo in {{STATE}} dissipates into static.',
  'Candlelight vigil in {{STATE}} marks the anomaly’s fade-out.',
] as const;
