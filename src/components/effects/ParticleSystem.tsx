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
  type: 'deploy' | 'capture' | 'counter' | 'victory';
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
    const particleCount = type === 'victory' ? 50 : type === 'deploy' ? 30 : 20;
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

  const createParticle = (id: number, centerX: number, centerY: number, effectType: string): Particle => {
    const angle = (Math.PI * 2 * id) / 20 + Math.random() * 0.5;
    const speed = effectType === 'victory' ? 3 + Math.random() * 4 : 2 + Math.random() * 3;
    
    let color: string;
    switch (effectType) {
      case 'deploy':
        color = `hsl(${142 + Math.random() * 20}, 76%, ${36 + Math.random() * 20}%)`; // Success green variants
        break;
      case 'capture':
        color = `hsl(${0 + Math.random() * 30}, 85%, ${55 + Math.random() * 15}%)`; // Red variants
        break;
      case 'counter':
        color = `hsl(${45 + Math.random() * 20}, 93%, ${58 + Math.random() * 15}%)`; // Warning orange variants
        break;
      case 'victory':
        color = `hsl(${25 + Math.random() * 40}, 95%, ${53 + Math.random() * 20}%)`; // Gold variants
        break;
      default:
        color = `hsl(${Math.random() * 360}, 70%, 60%)`;
    }

    return {
      id,
      x: centerX + (Math.random() - 0.5) * 50,
      y: centerY + (Math.random() - 0.5) * 50,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - Math.random() * 2, // Slight upward bias
      life: 120 + Math.random() * 60,
      maxLife: 120 + Math.random() * 60,
      size: effectType === 'victory' ? 4 + Math.random() * 4 : 2 + Math.random() * 3,
      color,
      opacity: 1
    };
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