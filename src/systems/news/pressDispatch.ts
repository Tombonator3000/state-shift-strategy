import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import { composeRoundEdition, stateLabel } from './roundEdition';
export interface PressDispatch { id: string; kind: 'breaking' | 'redacted' | 'combo'; title: string; body: string[]; outcome: string; sources: Array<{ id: string; name: string }> }
const signed = (n: number) => `${n > 0 ? '+' : ''}${n}`;
export function dispatchForPlay(record: CardPlayRecord): PressDispatch {
  const story = composeRoundEdition([record], [], record.round, record.faction);
  return { id: `${record.round}:${record.turn}:${record.timestamp}:${record.card.id}`, kind: record.faction === 'government' ? 'redacted' : 'breaking', title: story.headline, body: story.body,
    outcome: `Truth ${signed(record.truthDelta)}% · Your IP ${signed(record.ipDelta)} · Rival IP ${signed(record.aiIpDelta)}${record.capturedStates.length ? ` · Captured: ${record.capturedStates.map(stateLabel).join(', ')}` : record.targetState ? ` · Target: ${stateLabel(record.targetState)}` : ''}`,
    sources: [{ id: record.card.id, name: record.card.name }] };
}
