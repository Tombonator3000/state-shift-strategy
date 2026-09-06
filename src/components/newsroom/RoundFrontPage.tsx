import CardImage from '@/components/game/CardImage';
import { stateLabel, type composeRoundEdition } from '@/systems/news/roundEdition';
export function RoundFrontPage({ edition, truth, ip }: { edition: ReturnType<typeof composeRoundEdition>; truth: number; ip?: number }) {
  return <article className="round-front-page">
    <div className="press-edition-line"><span>ROUND {edition.round} · NIGHT EDITION</span><span>TRUTH {truth}% · YOUR DESK {ip ?? '—'} IP</span></div>
    <div className="press-banner">EXCLUSIVE <span>THE TRUTH HAS A DEADLINE.</span></div>
    <h1>{edition.headline}</h1><p className="press-deck">{edition.subhead}</p>
    <div className="press-article-grid"><figure className="press-evidence-photo">{edition.sources[0] ? <CardImage cardId={edition.sources[0].id} className="press-hero-art" fit="cover" /> : <div className="press-missing-art"><span>JOINT SPIN BUREAU</span><b>PHOTO<br/>WITHHELD</b><small>REQUEST PENDING SINCE 1947</small></div>}<figcaption>{edition.caption}</figcaption></figure>
      <div className="press-story"><p className="press-byline">BY THE NIGHT DESK · CASE {String(edition.round).padStart(4, '0')}</p>{edition.body.map((p, i) => <p key={i}>{p}</p>)}<blockquote>“No anomalies detected.”<cite>— Joint Spin Bureau</cite></blockquote></div>
    </div>
    <aside className="press-results"><b>WHAT ACTUALLY CHANGED</b><p>{edition.outcome}</p>{edition.records.map((record, i) => <div key={`${record.card.id}-${i}`}><span>{record.player === 'human' ? 'YOU' : 'RIVAL'}</span><strong>{record.card.name}</strong><span>{stateLabel(record.targetState)}</span></div>)}</aside>
    {edition.sources.length > 0 && <section className="press-source-cards"><h2>From the evidence desk</h2><p>These cards supplied the characters and clues for this round’s article.</p><div>{edition.sources.map((source, i) => <figure key={`${source.id}-${i}`}><CardImage cardId={source.id} className="press-source-art" /><figcaption><b>{String(i + 1).padStart(2, '0')}</b>{source.headline}</figcaption></figure>)}</div></section>}
    <footer className="press-small-ad"><b>MISSING TIME?</b> Our archivists can file a complaint before it happens. Enquire at Window 12-C.</footer>
  </article>;
}
