import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CardImage from '@/components/game/CardImage';
import type { GameCard } from '@/rules/mvp';
import type { GameState } from '@/hooks/gameStateTypes';
import { validStateTarget } from '@/game/stateTargeting';

type TargetState = Pick<GameState['states'][number], 'id' | 'name' | 'abbreviation' | 'owner' | 'defense' | 'pressurePlayer'>;
export function StateTargetPicker({ open, card, states, ip, cost, pressure, targetId, locked, onTarget, onConfirm, onCancel, onMap }: {
  open: boolean; card: GameCard; states: TargetState[]; ip: number; cost: number; pressure: number;
  targetId?: string | null; locked: boolean; onTarget: (id: string) => void;
  onConfirm: (id: string) => Promise<void>; onCancel: () => void; onMap: () => void;
}) {
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const target = validStateTarget(states, targetId);
  const after = (target?.pressurePlayer ?? 0) + pressure;
  const disabled = locked || submitting || !target || ip < cost;
  return <Dialog open={open} onOpenChange={value => { if (!value && !pending.current) onCancel(); }}>
    <DialogContent className="press-dialog target-picker">
      <header className="press-kicker">FIELD DESK · CHOOSE YOUR NEXT HEADLINE</header>
      <DialogTitle>Put the pressure on.</DialogTitle>
      <DialogDescription>Choose a state, review the result, then confirm your assignment.</DialogDescription>
      <div className="target-card-summary"><CardImage cardId={card.id} className="target-card-art" /><div><strong>{card.name}</strong><p>{cost} IP · +{pressure} pressure</p></div></div>
      <div className="target-search"><label>Find a state<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name or abbreviation…" /></label><button type="button" onClick={onMap} disabled={submitting}>Choose on map</button></div>
      <div className="target-options" role="group" aria-label="State targets">
        {states.filter(s => `${s.name} ${s.abbreviation}`.toLowerCase().includes(query.trim().toLowerCase())).map(state => <button type="button" key={state.id} disabled={state.owner === 'player' || locked || submitting} aria-pressed={state.id === target?.id} onClick={() => onTarget(state.id)}>
          <b>{state.abbreviation}</b><span>{state.name}<small>{state.owner === 'player' ? 'Already yours' : `Pressure ${state.pressurePlayer} · Defense ${state.defense}`}</small></span>
          <span>{state.id === target?.id ? 'SELECTED' : state.owner === 'player' ? 'HELD' : '+'}</span>
        </button>)}
        {!states.some(s => `${s.name} ${s.abbreviation}`.toLowerCase().includes(query.trim().toLowerCase())) && <p>No states match your search.</p>}
      </div>
      <div className="target-proof" role="status">{target ? <><strong>{target.name}: {target.pressurePlayer} → {after} pressure</strong><span>Defense {target.defense} · {after >= target.defense ? 'Enough pressure to capture' : `${target.defense - after} more pressure needed`}</span><span>Your IP: {ip} → {ip - cost}</span><small>Preview before counter-cards, capture rewards and triggered effects.</small></> : <strong>Select a state above or on the map.</strong>}{ip < cost && <b>Not enough IP.</b>}</div>
      <footer className="press-actions"><button type="button" disabled={submitting} onClick={onCancel}>Cancel</button><button type="button" className="press-primary" disabled={disabled} onClick={async () => {
        if (disabled || !target || pending.current) return;
        pending.current = true; setSubmitting(true);
        try { await onConfirm(target.id); } finally { pending.current = false; setSubmitting(false); }
      }}>{submitting ? 'Sending assignment…' : `Confirm · ${cost} IP`}</button></footer>
    </DialogContent>
  </Dialog>;
}
