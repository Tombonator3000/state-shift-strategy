import React, { useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

export type ParticleEffectType =
  | 'deploy'
  | 'capture'
  | 'counter'
  | 'victory'
  | 'synergy'
  | 'bigwin'
  | 'stateloss'
  | 'chain'
  | 'flash'
  | 'stateevent'
  | 'contested'
  | 'broadcast'
  | 'cryptid';

interface ParticleSystemProps {
  active: boolean;
  x: number;
  y: number;
  type: ParticleEffectType;
  onComplete?: () => void;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  active, 
  x, 
  y, 
  type, 
  onComplete 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef<number>();
  const effectDurationRef = useRef<number>();

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to full window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles based on effect type
    const particleCount = getParticleCount(type);
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(i, x, y, type));
    }
    
    particlesRef.current = particles;
    startTimeRef.current = Date.now();
    effectDurationRef.current = particles.length
      ? particles.reduce((max, particle) => Math.max(max, particle.maxLife), 0) * (1000 / 60)
      : undefined;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now);
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        updateParticle(particle);
        drawParticle(ctx, particle);
        return particle.life > 0;
      });

      const hasLivingParticles = particlesRef.current.length > 0;
      const expectedDuration = effectDurationRef.current ?? 0;
      const exceededExpectedDuration = expectedDuration > 0 && elapsed >= expectedDuration + 120;

      if (hasLivingParticles && !exceededExpectedDuration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = undefined;
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, x, y, type, onComplete]);

  const getParticleCount = (type: ParticleEffectType): number => {
    switch (type) {
      case 'victory':
      case 'bigwin':
        return 60;
      case 'flash':
        return 48;
      case 'synergy':
      case 'stateevent':
      case 'broadcast':
        return 40;
      case 'chain':
      case 'contested':
      case 'cryptid':
        return 35;
      case 'deploy':
      case 'stateloss':
        return 30;
      case 'capture':
      case 'counter':
        return 20;
      default: return 20;
    }
  };

  const createParticle = (id: number, centerX: number, centerY: number, effectType: ParticleEffectType): Particle => {
    const angle = (Math.PI * 2 * id) / 20 + Math.random() * 0.5;
    const speed = getParticleSpeed(effectType);

    const color = getParticleColor(effectType);

    const spread = getParticleSpread(effectType);
    const lifespan = getParticleLifespan(effectType);

    return {
      id,
      x: centerX + (Math.random() - 0.5) * spread,
      y: centerY + (Math.random() - 0.5) * spread,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2,
      life: lifespan,
      maxLife: lifespan,
      size: getParticleSize(effectType),
      color,
      opacity: 1
    };
  };

  const getParticleSpeed = (type: ParticleEffectType): number => {
    switch (type) {
      case 'victory':
      case 'bigwin':
        return 4 + Math.random() * 5;
      case 'flash':
        return 3.5 + Math.random() * 4;
      case 'synergy':
      case 'stateevent':
      case 'broadcast':
        return 3 + Math.random() * 4;
      case 'chain':
      case 'contested':
      case 'cryptid':
        return 2.5 + Math.random() * 3;
      case 'stateloss':
        return 1.5 + Math.random() * 2;
      default:
        return 2 + Math.random() * 3;
    }
  };

  const getParticleColor = (type: ParticleEffectType): string => {
    switch (type) {
      case 'deploy':
        return `hsl(${142 + Math.random() * 20}, 76%, ${36 + Math.random() * 20}%)`;
      case 'capture':
        return `hsl(${0 + Math.random() * 30}, 85%, ${55 + Math.random() * 15}%)`;
      case 'counter':
        return `hsl(${45 + Math.random() * 20}, 93%, ${58 + Math.random() * 15}%)`;
      case 'victory': case 'bigwin':
        return `hsl(${25 + Math.random() * 40}, 95%, ${53 + Math.random() * 20}%)`;
      case 'synergy':
        return `hsl(${270 + Math.random() * 30}, 85%, ${65 + Math.random() * 15}%)`;
      case 'broadcast':
        return `hsla(${195 + Math.random() * 20}, 90%, ${70 + Math.random() * 10}%, ${0.8 - Math.random() * 0.2})`;
      case 'chain':
        return `hsl(${180 + Math.random() * 40}, 90%, ${50 + Math.random() * 20}%)`;
      case 'stateloss':
        return `hsl(${0 + Math.random() * 20}, 95%, ${40 + Math.random() * 15}%)`;
      case 'flash':
        return `hsla(${50 + Math.random() * 10}, 95%, ${85 + Math.random() * 10}%, ${0.85 - Math.random() * 0.2})`;
      case 'stateevent':
        return `hsl(${305 + Math.random() * 20}, 88%, ${62 + Math.random() * 12}%)`;
      case 'contested':
        return `hsl(${200 + Math.random() * 20}, 72%, ${58 + Math.random() * 10}%)`;
      case 'cryptid':
        return `hsl(${135 + Math.random() * 30}, 60%, ${50 + Math.random() * 15}%)`;
      default:
        return `hsl(${Math.random() * 360}, 70%, 60%)`;
    }
  };

  const getParticleSpread = (type: ParticleEffectType): number => {
    switch (type) {
      case 'victory':
      case 'bigwin':
        return 80;
      case 'flash':
        return 90;
      case 'synergy':
      case 'stateevent':
      case 'broadcast':
        return 70;
      case 'chain':
      case 'contested':
      case 'cryptid':
        return 60;
      default:
        return 50;
    }
  };

  const getParticleLifespan = (type: ParticleEffectType): number => {
    const base = 120 + Math.random() * 60;
    switch (type) {
      case 'victory':
      case 'bigwin':
        return base * 1.5;
      case 'flash':
        return base * 1.2;
      case 'synergy':
      case 'stateevent':
      case 'broadcast':
        return base * 1.3;
      case 'chain':
      case 'contested':
      case 'cryptid':
        return base * 1.1;
      case 'stateloss':
        return base * 0.8;
      default:
        return base;
    }
  };

  const getParticleSize = (type: ParticleEffectType): number => {
    switch (type) {
      case 'victory':
      case 'bigwin':
        return 5 + Math.random() * 5;
      case 'flash':
        return 3 + Math.random() * 3;
      case 'synergy':
      case 'stateevent':
      case 'broadcast':
        return 4 + Math.random() * 4;
      case 'chain':
      case 'contested':
      case 'cryptid':
        return 3 + Math.random() * 3;
      case 'stateloss':
        return 2 + Math.random() * 2;
      default:
        return 2 + Math.random() * 3;
    }
  };

  const updateParticle = (particle: Particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.1; // Gravity
    particle.vx *= 0.99; // Air resistance
    particle.life--;
    particle.opacity = Math.max(0, particle.life / particle.maxLife);
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add inner glow
    ctx.globalAlpha = particle.opacity * 0.3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1000]"
      style={{ zIndex: 1000 }}
    />
  );
};