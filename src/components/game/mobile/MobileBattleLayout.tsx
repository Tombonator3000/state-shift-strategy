import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Crosshair, Map, List, History, Menu, BookOpen, ArrowRight, Loader2, Shield, Coins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import type { GameCard } from '@/rules/mvp';
import type { CardPlayRecord, GameState } from '@/hooks/gameStateTypes';
import '@/styles/mobile-battle.css';

type BattleState = Pick<GameState['states'][number], 'id' | 'name' | 'abbreviation' | 'owner' | 'defense' | 'pressurePlayer' | 'pressureAi' | 'baseIP'>;

interface MobileBattleLayoutProps {
  round: number;
  faction: 'truth' | 'government';
  ip: number;
  rivalIP: number;
  truth: number;
  states: BattleState[];
  playsUsed: number;
  handCount: number;
  discardCount: number;
  discardCost: number;
  aiTurn: boolean;
  locked: boolean;
  resolving: boolean;
  targetCard: GameCard | null;
  playedCards: CardPlayRecord[];
  board: ReactNode;
  hand: ReactNode;
  briefing: ReactNode;
  menu: (close: () => void) => ReactNode;
  onStateClick: (id: string) => void;
  onCancelTarget: () => void;
  onInspectPlayed: (card: GameCard) => void;
  onEndTurn: () => void;
}

const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`;

export function MobileBattleLayout(props: MobileBattleLayoutProps) {
  const { round, faction, ip, rivalIP, truth, states, playsUsed, aiTurn, locked, resolving, targetCard } = props;
  const [view, setView] = useState('map');
  const [panel, setPanel] = useState<'briefing' | 'menu' | null>(null);
  const panelOpener = useRef<HTMLButtonElement | null>(null);
  const [filter, setFilter] = useState('');
  const [inspectedState, setInspectedState] = useState<string | null>(null);
  const targetId = targetCard?.id;
  const ownCount = states.filter(state => state.owner === 'player').length;
  const rivalCount = states.filter(state => state.owner === 'ai').length;
  const remaining = Math.max(0, 3 - playsUsed);
  const latest = props.playedCards.at(-1);
  const affectedState = states.find(state => state.id === latest?.targetState || state.abbreviation === latest?.targetState);
  const opposingIPDelta = latest?.player === 'human' ? latest.aiIpDelta : latest?.ipDelta;
  const receiptOutcome = !latest ? null
    : latest.capturedStates.length ? `${latest.capturedStates.length} state${latest.capturedStates.length === 1 ? '' : 's'} captured`
    : latest.truthDelta !== 0 ? `${signed(latest.truthDelta)}% truth`
    : opposingIPDelta ? `${signed(opposingIPDelta)} ${latest.player === 'human' ? 'rival' : 'your'} IP`
    : affectedState ? `${affectedState.abbreviation} targeted`
    : null;
  const stateList = useMemo(() => states
    .filter(state => `${state.name} ${state.abbreviation}`.toLowerCase().includes(filter.toLowerCase().trim()))
    .slice().sort((a, b) => {
      if (targetId && (a.owner === 'player') !== (b.owner === 'player')) return a.owner === 'player' ? 1 : -1;
      return a.name.localeCompare(b.name);
    }), [states, filter, targetId]);

  useEffect(() => {
    if (targetId) {
      setView('states');
      setPanel(null);
      setFilter('');
    }
  }, [targetId]);

  const phaseText = resolving ? 'Resolving card…' : aiTurn ? 'Rival turn' : locked ? 'Resolving turn…' : targetCard ? 'Choose a target' : remaining ? 'Your turn' : 'Ready to print';

  return (
    <div className="mobile-battle" data-faction={faction} data-testid="mobile-battle-layout">
      <header className="mobile-battle-header">
        <div className="mobile-masthead">
          <span className="mobile-edition">NO. {String(round).padStart(2, '0')}</span>
          <h1>Paranoid Times<span>THE TRUTH HAS A DEADLINE.</span></h1>
          <button type="button" className="mobile-icon-button" aria-label="Open game menu" onClick={event => { panelOpener.current = event.currentTarget; setPanel('menu'); }}><Menu aria-hidden="true" size={21} /></button>
        </div>
        <div className="mobile-scoreboard">
          <div className="mobile-score mobile-score-you"><span>YOU · {faction === 'truth' ? 'TRUTH' : 'GOV'}</span><strong key={`ip-${ip}`} className="mobile-value-change">{ip}<small> IP</small></strong><span>{ownCount} states</span></div>
          <button type="button" className="mobile-truth" onClick={event => { panelOpener.current = event.currentTarget; setPanel('briefing'); }} aria-label={`Truth ${truth} percent. View objectives`}>
            <span>PUBLIC TRUTH <BookOpen size={12} aria-hidden="true" /></span>
            <strong key={`truth-${truth}`} className="mobile-value-change">{truth}<small>%</small></strong>
            <span className="mobile-truth-track" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, truth))}%` }} /></span>
          </button>
          <div className="mobile-score mobile-score-rival"><span>RIVAL · {faction === 'truth' ? 'GOV' : 'TRUTH'}</span><strong key={`rival-${rivalIP}`} className="mobile-value-change">{rivalIP}<small> IP</small></strong><span>{rivalCount} states</span></div>
        </div>
      </header>

      <main className="mobile-battle-board" aria-label="Battlefield">
        <Tabs value={view} onValueChange={setView} className="mobile-board-tabs">
          <TabsList className="mobile-board-nav" aria-label="Battlefield views">
            <TabsTrigger value="map"><Map size={16} aria-hidden="true" />Map</TabsTrigger>
            <TabsTrigger value="states"><List size={16} aria-hidden="true" />States</TabsTrigger>
            <TabsTrigger value="played"><History size={16} aria-hidden="true" />Played<span className="mobile-tab-count">{props.playedCards.length}</span></TabsTrigger>
          </TabsList>
          {targetCard && (
            <div className="mobile-target-prompt" role="status">
              <Crosshair size={18} aria-hidden="true" /><span><strong>Choose a state</strong><span>{targetCard.name}</span></span>
              <button type="button" onClick={props.onCancelTarget} disabled={resolving}>Cancel</button>
            </div>
          )}
          <TabsContent value="map" forceMount hidden={view !== 'map'} className="mobile-map-panel">
            <div className="mobile-map-legend"><span className="mobile-legend-you">You</span><span className="mobile-legend-rival">Rival</span><span>Unclaimed</span><span className="mobile-legend-contested">Contested</span></div>
            {props.board}
            <p className="mobile-map-hint">Use + / − to explore. Choose States for larger targets.</p>
          </TabsContent>
          <TabsContent value="states" className="mobile-states-panel">
            <label className="mobile-state-search"><span className="sr-only">Find a state</span><input type="search" placeholder="Find a state…" value={filter} onChange={event => setFilter(event.target.value)} /></label>
            <div className="mobile-state-list">
              {stateList.length === 0 && <p className="mobile-empty">No states match “{filter}”.</p>}
              {stateList.map(state => {
                const owned = state.owner === 'player';
                const unavailable = Boolean(targetCard) && (owned || locked || resolving);
                return <div className="mobile-state-entry" key={state.id}>
                  <button type="button" className="mobile-state-row" data-owner={state.owner} disabled={unavailable}
                    aria-label={targetCard ? owned ? `${state.name}, already yours` : `Target ${state.name}` : `Inspect ${state.name}`}
                    aria-expanded={!targetCard ? inspectedState === state.id : undefined}
                    onClick={() => targetCard ? props.onStateClick(state.id) : setInspectedState(inspectedState === state.id ? null : state.id)}>
                    <span className="mobile-state-abbr">{state.abbreviation}</span><span className="mobile-state-name"><strong>{state.name}</strong><span>{owned ? 'Your state' : state.owner === 'ai' ? 'Rival state' : 'Unclaimed'} · +{state.baseIP} IP / turn</span></span>
                    <span className="mobile-state-defense"><Shield size={13} aria-hidden="true" />{state.defense}{targetCard && !owned && <Crosshair size={17} aria-hidden="true" />}</span>
                  </button>
                  {!targetCard && inspectedState === state.id && <div className="mobile-state-details">Your pressure: {state.pressurePlayer} · Rival pressure: {state.pressureAi} · Defense: {state.defense}<p>Use a ZONE card to add pressure to an unclaimed or rival state.</p></div>}
                </div>;
              })}
            </div>
          </TabsContent>
          <TabsContent value="played" className="mobile-played-panel">
            <h2>This round’s stories</h2>
            {props.playedCards.length === 0 && <p className="mobile-empty">No cards played yet. Your first move starts the story.</p>}
            {props.playedCards.slice().reverse().map((record, index) => (
              <button type="button" key={`${record.timestamp}-${record.card.id}-${index}`} className="mobile-play-record" data-player={record.player} onClick={() => props.onInspectPlayed(record.card)}>
                <span>{record.player === 'human' ? 'YOU' : 'RIVAL'} · {record.card.type}</span><strong>{record.card.name}</strong>
                <span>{record.truthDelta !== 0 && `Truth ${signed(record.truthDelta)} · `}{record.ipDelta !== 0 && `Your IP ${signed(record.ipDelta)} · `}{record.aiIpDelta !== 0 && `Rival IP ${signed(record.aiIpDelta)} · `}{record.targetState ?? 'Nationwide'}</span>
              </button>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <section className="mobile-hand-zone" aria-label="Your hand">
        <div className="mobile-action-receipt" role="status" aria-live="polite">
          {latest ? <span className="mobile-receipt-entry" key={`${latest.timestamp}-${props.playedCards.length}`} data-type={latest.card.type}><span>{latest.player === 'human' ? 'YOU PLAYED' : 'RIVAL PLAYED'}</span><strong>{latest.card.name}</strong>{receiptOutcome && <b>{receiptOutcome}</b>}</span>
            : <span className="mobile-receipt-entry"><span>FIRST EDITION</span><strong>Pick a card. Make the headlines.</strong></span>}
        </div>
        <div className="mobile-hand-heading"><h2>Your hand <span>{props.handCount}</span></h2><span className="mobile-play-pips" aria-label={`${remaining} of 3 card plays remaining`}>{[0, 1, 2].map(i => <i key={i} data-used={i < playsUsed} />)}<span>{remaining} plays left</span></span></div>
        <div className="mobile-hand-rail">{props.hand}</div>
        <p className="mobile-hand-help">{props.discardCount ? `${props.discardCount} queued to discard · ${props.discardCost ? `${props.discardCost} IP` : 'free'} at turn end` : 'Swipe to browse · Tap for rules, play or discard'}</p>
      </section>

      <footer className="mobile-turn-bar">
        <div className="mobile-turn-status" role="status"><span className="mobile-turn-dot" data-waiting={aiTurn || locked} /><span><strong>{phaseText}</strong><span><Coins size={12} aria-hidden="true" />{ip} IP available</span></span></div>
        <button type="button" id="end-turn-button" className="mobile-end-turn" disabled={locked || resolving || Boolean(targetCard)} onClick={props.onEndTurn}>
          {aiTurn || locked ? <><Loader2 size={17} aria-hidden="true" />Please wait</> : <><span>End turn<small>GO TO PRESS</small></span><ArrowRight size={19} aria-hidden="true" /></>}
        </button>
      </footer>

      <Sheet open={panel !== null} onOpenChange={open => { if (!open) setPanel(null); }}>
        <SheetContent side="bottom" className="mobile-battle-sheet" onCloseAutoFocus={event => {
          event.preventDefault();
          if (document.activeElement === document.body) panelOpener.current?.focus();
        }}>
          <SheetTitle>{panel === 'briefing' ? 'Your briefing' : 'Newsroom menu'}</SheetTitle>
          <SheetDescription>{panel === 'briefing' ? 'Victory conditions, your agenda and the rival newsroom.' : 'Settings, your collection and campaign information.'}</SheetDescription>
          <div className="mobile-sheet-body">{panel === 'briefing' ? props.briefing : props.menu(() => setPanel(null))}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
