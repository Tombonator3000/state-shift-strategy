import { useEffect, useRef, useState } from 'react';
import CardImage from '@/components/game/CardImage';
import { useAudioContext } from '@/contexts/AudioContext';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { CardPlayRecord } from '@/hooks/gameStateTypes';
import { dispatchForPlay, type PressDispatch } from '@/systems/news/pressDispatch';
import { safeGetLocalStorageItem, safeSetLocalStorageItem } from '@/utils/storage';

export function PressDispatchTray({ records, suspended = false }: { records: CardPlayRecord[]; suspended?: boolean }) {
  const [queue, setQueue] = useState<PressDispatch[]>([]);
  const archiveKey = `press-dispatches:${records[0]?.timestamp ?? 'new'}`;
  const [archive, setArchive] = useState<PressDispatch[]>(() => {
    try { const data = JSON.parse(safeGetLocalStorageItem(archiveKey) || '[]'); return Array.isArray(data) ? data.filter(item => item?.id && Array.isArray(item.sources) && Array.isArray(item.body)).slice(-60) : []; } catch { return []; }
  });
  useEffect(() => { if (records.length) safeSetLocalStorageItem(archiveKey, JSON.stringify(archive)); }, [archive, archiveKey, records.length]);
  const [opened, setOpened] = useState<PressDispatch | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const seen = useRef(new Set([...archive.map(item => item.id), ...records.slice(0, -1).map(r => dispatchForPlay(r).id)]));
  const audio = useAudioContext();
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const enqueue = (items: PressDispatch[]) => {
    const fresh = items.filter(item => !seen.current.has(item.id));
    fresh.forEach(item => seen.current.add(item.id));
    if (fresh.length) { setQueue(q => [...q, ...fresh].slice(-8)); setArchive(a => [...a, ...fresh].slice(-60)); }
  };
  useEffect(() => { enqueue(records.map(dispatchForPlay)); }, [records]);
  useEffect(() => {
    const combo = (event: Event) => enqueue([(event as CustomEvent<PressDispatch>).detail]);
    const openArchive = () => setShowArchive(true);
    window.addEventListener('press-dispatch', combo);
    window.addEventListener('open-press-archive', openArchive);
    return () => { window.removeEventListener('press-dispatch', combo); window.removeEventListener('open-press-archive', openArchive); };
  }, []);
  const current = queue[0];
  useEffect(() => {
    if (!current || suspended || opened || showArchive) return;
    void audioRef.current.playSFX(current.kind === 'combo' ? 'stateCapture' : 'newspaper');
    const timer = setTimeout(() => setQueue(q => q.filter(item => item.id !== current.id)), 7000);
    return () => clearTimeout(timer);
  }, [current, suspended, opened, showArchive]);
  const history = [...new Map([...archive, ...records.map(dispatchForPlay)].map(item => [item.id, item])).values()].reverse();
  return <div data-press-desk className="press-desk-host">
    {!suspended && <button type="button" className="press-archive-toggle" onClick={() => setShowArchive(true)}>Dispatches <b>{history.length}</b></button>}
    {current && !suspended && !opened && !showArchive && <aside className={`press-dispatch press-dispatch--${current.kind}`} aria-label="Latest press dispatch">
      <div className="press-kicker"><span>{current.kind === 'combo' ? 'EXTRA! COMBO CONFIRMED' : current.kind === 'redacted' ? 'OFFICIAL RECORD · REDACTED' : 'BREAKING NEWS'}</span><button type="button" aria-label="Dismiss dispatch" onClick={() => setQueue(q => q.slice(1))}>×</button></div>
      <div className="press-dispatch-body">{current.sources[0] && <CardImage cardId={current.sources[0].id} className="dispatch-photo" />}<div><h2>{current.title}</h2><p role="status">{current.outcome}</p></div></div>
      <footer><button type="button" onClick={() => setOpened(current)}>Read the story</button><span>{queue.length > 1 ? `${queue.length - 1} more on the desk` : 'Saved in Dispatches'}</span></footer>
    </aside>}
    <Dialog open={Boolean(opened) || showArchive} onOpenChange={open => { if (!open) { setOpened(null); setShowArchive(false); } }}><DialogContent className="press-dialog press-story-dialog"><DialogTitle>{opened?.title ?? 'The dispatch archive'}</DialogTitle><DialogDescription>{opened ? opened.outcome : 'Completed plays and confirmed combinations. Open any dispatch to read it again.'}</DialogDescription>
      {opened ? <><div className="dispatch-sources">{opened.sources.map((card, i) => <figure key={`${card.id}-${i}`}><CardImage cardId={card.id} /><figcaption>{card.name}</figcaption></figure>)}</div><div className="press-story">{opened.body.map((p, i) => <p key={i}>{p}</p>)}</div><button type="button" onClick={() => { setOpened(null); setShowArchive(true); }}>Back to dispatches</button></> : <div className="dispatch-history">{!history.length && <p>No dispatches yet. Play your first card to make the news.</p>}{history.map(item => <button type="button" key={item.id} onClick={() => setOpened(item)}><small>{item.kind.toUpperCase()}</small><strong>{item.title}</strong><span>{item.outcome}</span></button>)}</div>}
    </DialogContent></Dialog>
  </div>;
}
