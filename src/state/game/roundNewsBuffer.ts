export type PlayedCardMetaLite = {
  id: string;
  name: string;
  type: 'ATTACK' | 'MEDIA' | 'ZONE';
  faction: 'TRUTH' | 'GOV';
};

let buffer: PlayedCardMetaLite[] = [];

export function clearNewsBuffer() {
  buffer = [];
}

export function pushToNewsBuffer(card: PlayedCardMetaLite) {
  buffer.push(card);
  if (buffer.length > 3) buffer.shift();
}

export function getNewsTriplet(): PlayedCardMetaLite[] | null {
  return buffer.length === 3 ? [...buffer] : null;
}
