import React from 'react';

interface MapPanelProps {
  children: React.ReactNode;
  title?: string;
}

export function MapPanel({ children, title = 'USA Territory Control' }: MapPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="inline-block bg-white border-2 border-ink px-3 py-1 font-headline uppercase mb-2">
        {title}
      </div>
      <div className="flex-1 bg-[var(--grey2)] border-2 border-ink shadow-[6px_6px_0_var(--ink)] overflow-hidden rounded">
        {children}
      </div>
    </div>
  );
}

