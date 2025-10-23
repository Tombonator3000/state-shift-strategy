import { cn } from '@/lib/utils';

interface NewspaperTextureProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  aged?: boolean;
  className?: string;
}

export const NewspaperTexture = ({
  children,
  intensity = 'medium',
  aged = false,
  className,
}: NewspaperTextureProps) => {
  const noiseOpacity = {
    light: 0.02,
    medium: 0.04,
    heavy: 0.08,
  }[intensity];

  return (
    <div className={cn("relative", className)}>
      {/* Paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, ${noiseOpacity}) 2px,
              rgba(0, 0, 0, ${noiseOpacity}) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, ${noiseOpacity / 2}) 2px,
              rgba(0, 0, 0, ${noiseOpacity / 2}) 4px
            )
          `,
          opacity: 0.5,
        }}
      />

      {/* Aged paper effect */}
      {aged && (
        <>
          {/* Coffee stain effect */}
          <div
            className="absolute top-4 right-8 w-24 h-24 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(139, 90, 43, 0.15) 0%, transparent 70%)',
            }}
          />
          
          {/* Another stain */}
          <div
            className="absolute bottom-12 left-12 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(139, 90, 43, 0.1) 0%, transparent 70%)',
            }}
          />

          {/* Slight yellowing */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'rgba(255, 248, 220, 0.3)',
              mixBlendMode: 'multiply',
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
