export function Masthead() {
  return (
    <div className="masthead font-headline tracking-wide px-4 py-2 text-2xl md:text-3xl border-b-4 border-[var(--line)]">
      THE PARANOID TIMES
    </div>
  );
}

interface StatusBarProps {
  round: number;
  yourIp: number;
  truth: number;
  yourStates: number;
  aiIp: number;
  aiStates: number;
}

export function StatusBar({
  round,
  yourIp,
  truth,
  yourStates,
  aiIp,
  aiStates,
}: StatusBarProps) {
  return (
    <div className="bg-status-bg text-status-text px-3 py-2 text-xs md:text-sm flex gap-6 overflow-x-auto border-b border-status-border font-body">
      <span>ROUND {round}</span>
      <span>YOUR IP {yourIp}</span>
      <span>TRUTH {truth}%</span>
      <span>YOUR STATES {yourStates}</span>
      <span>AI IP {aiIp}</span>
      <span>AI STATES {aiStates}</span>
    </div>
  );
}

