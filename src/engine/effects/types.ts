export type SideAbs = 'player' | 'ai';          // absolute
export type SideRel = 'self' | 'opponent';      // relative to the acting side
export type SideAny = SideAbs | SideRel;

export type Effect =
  | { k: 'draw'; who: SideAny; n: number }
  | { k: 'ip'; who: SideAny; v: number }
  | { k: 'truth'; v: number }
  | { k: 'discardRandom'; who: SideAny; n: number }
  | { k: 'discardChoice'; who: SideAny; n: number }
  | { k: 'pressure'; who: SideAbs; state: string; v: number }
  | { k: 'defense'; state: string; v: 1 | -1 }
  | { k: 'addCard'; who: SideAbs; cardId: string }
  | { k: 'flag'; name: string; on?: boolean }
  | { k: 'conditional'; if: (gs: any, target?: any) => boolean; then: Effect[]; else?: Effect[] }
  | { k: 'special'; fn: (gs: any, target?: any) => void };
