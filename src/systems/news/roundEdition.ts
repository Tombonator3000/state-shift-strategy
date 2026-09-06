import { USA_STATES } from '@/data/usaStates';
import type { GameCard } from '@/rules/mvp';
import type { CompositeStory } from '@/types/news';
import type { GameEvent } from '@/data/eventDatabase';

export interface EditionPlay {
  card: GameCard; player: 'human' | 'ai'; round?: number; targetState?: string | null;
  truthDelta?: number; ipDelta?: number; aiIpDelta?: number; capturedStates?: string[];
}
interface Beat { key: string; subject: string; incident: string; evidence: string; twist: string }
// Setup → Twist → Footnote. Card titles are references, never used as people's names.
// Intent: contradictory witness reports become one bureaucratic problem at the Joint Spin Bureau.
const beats: Array<[RegExp, Beat]> = [
  [/bigfoot|sasquatch/i, { key: 'bigfoot', subject: 'Bigfoot', incident: 'Bigfoot was photographed outside a routine public meeting', evidence: 'an enormous footprint beside the visitors’ register', twist: 'the witness asked to be described as a concerned local, height unspecified' }],
  [/mothman/i, { key: 'mothman', subject: 'Mothman', incident: 'Mothman arrived with a warning nobody had ordered', evidence: 'wing marks on a newly issued evacuation notice', twist: 'the warning arrived before the incident it was warning about' }],
  [/ufo|saucer|alien|abduct|extraterrestrial/i, { key: 'ufo', subject: 'a visiting saucer crew', incident: 'an unidentified craft interrupted the local timetable', evidence: 'a flight path that ends in the middle of a football field', twist: 'the visitors requested landing clearance retroactively' }],
  [/elvis/i, { key: 'elvis', subject: 'Elvis', incident: 'Elvis appeared at a venue that denies booking him', evidence: 'a backstage pass dated after his official departure', twist: 'the encore was classified as an impersonation of an impersonation' }],
  [/reptil|lizard/i, { key: 'reptile', subject: 'a reptilian official', incident: 'a committee member shed more than light on the proceedings', evidence: 'scales attached to the signed minutes', twist: 'the stenographer recorded the hissing as unanimous consent' }],
  [/time|temporal|clock|future|past/i, { key: 'time', subject: 'the temporal audit team', incident: 'tomorrow’s minutes reached the newsroom before today’s meeting', evidence: 'two identical timestamps on mutually exclusive events', twist: 'the correction was filed yesterday' }],
  [/ghost|haunt|spectr|phantom/i, { key: 'ghost', subject: 'an unregistered apparition', incident: 'an apparition clocked in for a shift nobody could explain', evidence: 'a payroll entry with no living recipient', twist: 'Human Resources refused to comment on former personnel' }],
  [/chemtrail|weather|cloud|balloon/i, { key: 'weather', subject: 'the weather bureau', incident: 'a routine forecast developed a suspiciously precise flight plan', evidence: 'atmospheric samples stamped for internal use only', twist: 'the forecast was revised to a thirty-percent chance of questions' }],
  [/surveil|camera|wiretap|monitor|drone/i, { key: 'surveillance', subject: 'the surveillance office', incident: 'a monitoring team discovered that someone was monitoring its monitors', evidence: 'a surveillance photograph showing another surveillance photograph', twist: 'the observer requested witness protection from their own camera' }],
  [/redact|classif|cover|foia|censor|denial|bureau|file|audit/i, { key: 'files', subject: 'the records office', incident: 'a routine file review uncovered an inconveniently complete paper trail', evidence: 'a heavily stamped folder with one unredacted corner', twist: 'the records office classified the missing pages as proof of completeness' }],
];
function beatFor(card: GameCard): Beat {
  const match = beats.find(([pattern]) => pattern.test(`${card.name} ${(card.tags ?? []).join(' ')}`));
  if (match) return match[1];
  const namedWitness = card.name.match(/^(.{1,40})['’]s\b/u)?.[1];
  if (namedWitness) return { key: card.type, subject: namedWitness, incident: `${namedWitness} submitted a witness statement the official record could not accommodate`, evidence: 'a signed account attached to a contradictory briefing', twist: 'the witness was asked to correct their recollection to match the approved minutes' };
  return { key: card.type, subject: card.faction === 'government' ? 'a departmental spokesperson' : 'a local correspondent', incident: card.type === 'ZONE' ? 'a field investigation drew unusual attention in the state' : card.type === 'ATTACK' ? 'a disputed briefing put rival officials on the defensive' : 'a fresh dispatch reached the night desk', evidence: 'a source file whose official explanation does not match the witness account', twist: 'the Joint Spin Bureau confirmed receiving the question and denied receiving the answer' };
}
const signed = (n: number) => `${n > 0 ? '+' : ''}${n}`;
export function composeRoundEdition(plays: EditionPlay[], events: GameEvent[], round: number, faction: 'truth' | 'government'): CompositeStory & { round: number; records: EditionPlay[]; outcome: string; caption: string } {
  const records = plays.filter(p => p.round === undefined || p.round === round);
  const focal = records.filter(p => p.player === 'human');
  const sourcePlays = focal.length ? focal : records;
  const sources = sourcePlays.map(p => ({ id: p.card.id, headline: p.card.name, subhead: p.player === 'human' ? 'Your dispatch' : 'Rival dispatch' }));
  const truthDelta = records.reduce((n, p) => n + (p.truthDelta ?? 0), 0);
  const captured = records.flatMap(p => p.capturedStates ?? []);
  const outcome = `Card results: Truth ${signed(truthDelta)}% · ${captured.length} state capture${captured.length === 1 ? '' : 's'}.`;
  const common = { round, records, sources, tone: faction, byline: 'Composite Desk' as const, tags: ['ROUND ' + round, faction === 'truth' ? 'FIELD REPORT' : 'OFFICIAL RECORD'], outcome };
  if (!sourcePlays.length) {
    const event = events[0];
    return { ...common, headline: event?.headline ?? 'NOTHING HAPPENED. OFFICIALLY.', subhead: event?.content ?? 'No cards reached the press this round. The blank space has been cleared for publication.', body: event ? [event.content, 'The Joint Spin Bureau has opened a file on the incident. Its existence is currently being reviewed.'] : ['The newsroom received no card dispatches before the deadline. Officials called the silence “a comprehensive statement”.', 'The night editor has reserved this space for any evidence that survives the next round.'], caption: 'The night desk awaits its next source.' };
  }
  const selected = sourcePlays.slice(0, 3);
  const evidence = selected.map(p => beatFor(p.card));
  const [first, second, third] = evidence;
  const target = selected.map(p => p.targetState).find(Boolean);
  const location = target ? stateLabel(target) : 'the district';
  const keys = new Set(evidence.map(b => b.key));
  let headline: string;
  let subhead: string;
  let body: string[];
  if (keys.has('bigfoot') && keys.has('mothman')) {
    headline = faction === 'truth' ? 'BIGFOOT HIRES MOTHMAN AS PRESS SECRETARY' : 'WILDLIFE BRIEFING PROCEEDS AS SCHEDULED';
    subhead = keys.has('ufo') ? 'UFO flyover turns a local warning into a national briefing.' : 'The new spokesman predicts difficult questions before reporters ask them.';
    body = ['A photograph of Bigfoot triggered a request for comment. Mothman arrived to deliver the response, carrying a warning that the Joint Spin Bureau had yet to authorise.', keys.has('ufo') ? 'The briefing moved to the football field when a saucer interrupted proceedings. Witnesses treated the flyover as independent confirmation; officials recorded it as a weather interruption.' : 'With witnesses gathering around the new spokesman, the original sighting became a public briefing. The Bureau requested that all prophecies be submitted in triplicate.', 'By deadline, the photograph, the warning and the official explanation could not be made to agree. The minutes nevertheless conclude: “No anomalies detected.”'];
  } else {
    headline = faction === 'government'
      ? `${second ? 'LINKED INCIDENTS' : 'LOCAL INCIDENT'} DECLARED ENTIRELY ROUTINE`
      : second ? `${first.subject.toUpperCase()} LINKED TO ${second.subject.toUpperCase()}` : `${first.subject.toUpperCase()}: THE FILE THEY CAN’T EXPLAIN`;
    subhead = second ? `A second report turns an isolated sighting into a problem for the Joint Spin Bureau.` : `A dispatch from ${location} leaves the official version short of an explanation.`;
    const setup = `${first.incident[0].toUpperCase()}${first.incident.slice(1)}. Reporters recovered ${first.evidence}.`;
    const twist = second ? `The inquiry widened when ${second.incident}. Comparing the two reports, the night desk found ${second.evidence}. The Bureau was asked to explain why both records had arrived under the same case number.` : `Officials were asked to reconcile the witness account with the record. Instead, ${first.twist}. The editor kept both versions in the file.`;
    const escalation = third ? `Before the file could close, ${third.incident}. This added ${third.evidence} to an already inconvenient inquiry. According to the latest revision, ${third.twist}.` : second ? `At deadline, ${second.twist}. The Joint Spin Bureau marked the file “resolved”, then requested another copy.` : 'The copy filed for public inspection contained the conclusion but none of the supporting pages. The night desk retained its own copy.';
    body = [setup, twist, escalation];
  }
  const opposition = records.filter(p => p.player === 'ai');
  if (focal.length && opposition.length) body.push(`The rival desk filed ${opposition.length} response${opposition.length === 1 ? '' : 's'}. Both accounts remain attached to the same case; neither newsroom has withdrawn its version.`);
  return { ...common, headline, subhead, body, caption: `${first.evidence[0].toUpperCase()}${first.evidence.slice(1)}. Illustration from the source dispatch.` };
}

// The engine advances the round counter before opening the completed round’s paper.
export const completedRoundNumber = (incomingRound: number) => Math.max(1, incomingRound - 1);

export function stateLabel(target?: string | null): string {
  if (!target) return 'Nationwide';
  const key = target.trim().toLowerCase();
  return USA_STATES.find(state => [state.id, state.name, state.abbreviation].some(value => value.toLowerCase() === key))?.name ?? 'Undisclosed state';
}
