import { ReactNode } from 'react';

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-2">
    <h3 className="text-xl font-bold text-newspaper-text font-mono uppercase tracking-wider">
      {title}
    </h3>
    <div className="space-y-2 text-newspaper-text/80 leading-relaxed text-sm">
      {children}
    </div>
  </section>
);

export const WhatIsParanoidTimes = () => (
  <div className="space-y-6 text-newspaper-text">
    <div className="space-y-3">
      <h2 className="text-2xl font-bold font-mono text-newspaper-text uppercase tracking-[0.2em]">
        Welcome to the Paranoid Times
      </h2>
      <p className="text-sm text-newspaper-text/80 leading-relaxed">
        The newsroom operates off leaked telexes, intercepted memos, and a suspiciously punctual future-self.
        Every broadcast is a field report from a timeline that never quite agreed to stay put.
      </p>
    </div>

    <Section title="How this desk operates">
      <p>
        We investigate state-sponsored cover stories, broadcast counter-narratives, and bankroll agents who can
        pivot a broadcast before the Ministry notices.
      </p>
      <p>
        Each issue you publish nudges the paranoia index; escalate too quickly and our sources vanish, hesitate and
        rival cabals rewrite the script.
      </p>
    </Section>

    <Section title="Your clearance dossier">
      <ul className="list-disc pl-6 space-y-2 text-sm text-newspaper-text/80">
        <li>Codename assignments rotate nightly. Use your alias to requisition intel without alerting the censors.</li>
        <li>Signal boosts buy you favors with embedded assets. Spend them before they expire at dawn.</li>
        <li>Archive reels aren&apos;t history—they&apos;re warnings. Playback carefully to map the fractures you can exploit.</li>
      </ul>
    </Section>

    <Section title="Operational objective">
      <p>
        Publish the definitive narrative before the opposition rewrites reality. The front page is yours—just make
        sure it still exists when the presses stop.
      </p>
    </Section>
  </div>
);

export default WhatIsParanoidTimes;
