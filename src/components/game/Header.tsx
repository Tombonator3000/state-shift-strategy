export function Masthead() {
  return (
    <div className="bg-black text-white font-[anton] tracking-wide px-4 py-2 text-2xl md:text-3xl border-b-4 border-[#1a1a1a]">
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
    <div className="bg-[#111] text-[#f1f5f9] px-3 py-2 text-xs md:text-sm flex gap-6 overflow-x-auto border-b border-[#2a2a2a]">
      <span>ROUND {round}</span>
      <span>YOUR IP {yourIp}</span>
      <span>TRUTH {truth}%</span>
      <span>YOUR STATES {yourStates}</span>
      <span>AI IP {aiIp}</span>
      <span>AI STATES {aiStates}</span>
    </div>
  );
}

