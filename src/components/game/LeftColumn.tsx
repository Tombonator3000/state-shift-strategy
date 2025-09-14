import React from 'react';

interface ColumnBox {
  title: string;
  content: React.ReactNode;
}

interface LeftColumnProps {
  victory: ColumnBox;
  agenda: ColumnBox;
  intel: ColumnBox;
}

export function LeftColumn({ victory, agenda, intel }: LeftColumnProps) {
  return (
    <div className="flex flex-col gap-3">
      {[victory, agenda, intel].map((box, i) => (
        <section
          key={i}
          className="bg-[#fff] border-2 border-black shadow-[4px_4px_0_#000] p-3"
        >
          <h3 className="font-[anton] text-lg uppercase mb-1">{box.title}</h3>
          <div className="text-sm leading-snug">{box.content}</div>
        </section>
      ))}
    </div>
  );
}

