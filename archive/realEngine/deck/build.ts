export function buildDeckFromIds(ids: string[], index: Map<string, any>): any[] {
  return ids.map((id) => index.get(id)).filter(Boolean);
}

