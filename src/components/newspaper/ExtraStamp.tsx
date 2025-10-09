import { cn } from '@/lib/utils';

interface ExtraStampProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ExtraStamp({ className, size = 'md' }: ExtraStampProps) {
  const sizeClasses = {
    sm: 'text-2xl px-4 py-2',
    md: 'text-4xl px-6 py-3',
    lg: 'text-6xl px-8 py-4',
  };

  return (
    <div
      className={cn(
        'absolute z-10 rotate-[-15deg] transform',
        'border-4 border-red-600 bg-red-600/10 backdrop-blur-sm',
        'font-black uppercase tracking-wider',
        'text-red-600 shadow-2xl',
        'select-none pointer-events-none',
        sizeClasses[size],
        className
      )}
      style={{
        fontFamily: '"Bebas Neue", "Anton", system-ui, sans-serif',
        textShadow: '2px 2px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      EXTRA
    </div>
  );
}
