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

interface ParticleSystemProps {
  active: boolean;
  x: number;
  y: number;
  type: 'deploy' | 'capture' | 'counter' | 'victory' | 'synergy' | 'bigwin' | 'stateloss' | 'chain';
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

      // Continue animation if particles exist and not too much time has passed
      if (particlesRef.current.length > 0 && elapsed < 3000) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
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

  const getParticleCount = (type: string): number => {
    switch (type) {
      case 'victory': case 'bigwin': return 60;
      case 'synergy': return 40;
      case 'chain': return 35;
      case 'deploy': case 'stateloss': return 30;
      case 'capture': case 'counter': return 20;
      default: return 20;
    }
  };

  const createParticle = (id: number, centerX: number, centerY: number, effectType: string): Particle => {
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

  const getParticleSpeed = (type: string): number => {
    switch (type) {
      case 'victory': case 'bigwin': return 4 + Math.random() * 5;
      case 'synergy': return 3 + Math.random() * 4;
      case 'chain': return 2.5 + Math.random() * 3;
      case 'stateloss': return 1.5 + Math.random() * 2;
      default: return 2 + Math.random() * 3;
    }
  };

  const getParticleColor = (type: string): string => {
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
      case 'chain':
        return `hsl(${180 + Math.random() * 40}, 90%, ${50 + Math.random() * 20}%)`;
      case 'stateloss':
        return `hsl(${0 + Math.random() * 20}, 95%, ${40 + Math.random() * 15}%)`;
      default:
        return `hsl(${Math.random() * 360}, 70%, 60%)`;
    }
  };

  const getParticleSpread = (type: string): number => {
    switch (type) {
      case 'victory': case 'bigwin': return 80;
      case 'synergy': return 70;
      case 'chain': return 60;
      default: return 50;
    }
  };

  const getParticleLifespan = (type: string): number => {
    const base = 120 + Math.random() * 60;
    switch (type) {
      case 'victory': case 'bigwin': return base * 1.5;
      case 'synergy': return base * 1.3;
      case 'chain': return base * 1.1;
      case 'stateloss': return base * 0.8;
      default: return base;
    }
  };

  const getParticleSize = (type: string): number => {
    switch (type) {
      case 'victory': case 'bigwin': return 5 + Math.random() * 5;
      case 'synergy': return 4 + Math.random() * 4;
      case 'chain': return 3 + Math.random() * 3;
      case 'stateloss': return 2 + Math.random() * 2;
      default: return 2 + Math.random() * 3;
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