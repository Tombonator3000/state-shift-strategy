import { useMemo } from 'react';

interface TickerTapeProps {
  messages: string[];
}

export const TickerTape = ({ messages }: TickerTapeProps) => {
  const visible = useMemo(() => messages.slice(0, 3), [messages]);

  if (visible.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-3 overflow-hidden rounded border-2 border-black bg-black text-[11px] font-mono uppercase text-yellow-300 shadow-[2px_2px_0_rgba(0,0,0,0.45)]"
    >
      <div className="flex animate-[ticker_18s_linear_infinite] gap-8 whitespace-nowrap py-1 px-3">
        {visible.map((message, index) => (
          <span key={`${message}-${index}`}>🛰️ {message}</span>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;
