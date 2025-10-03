import React, { useEffect, useRef } from 'react';

type ParticleShape = 'newsprintShard' | 'redactionBar' | 'staticSpeck';

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
  rotation: number;
  angularVelocity: number;
  shape: ParticleShape;
  trailIntensity: number;
  drag: number;
  jitterSeed: number;
  floatForce: number;
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
  | 'broadcast'
  | 'cryptid';

const TABLOID_PALETTE = ['#d7263d', '#ff564f', '#161414'];
const NIGHT_VISION_PALETTE = ['#00ff99', '#9cff7a', '#0e3b26'];
const CIGARETTE_PALETTE = ['#f2d675', '#fce7b2', '#b38a3c'];
const PHOTOCOPIER_PALETTE = ['#4ad3ff', '#b8f1ff', '#1a6aa8'];
const DEFAULT_PALETTE = ['#111111', '#444444'];

const EFFECT_PALETTES: Record<ParticleEffectType, string[]> = {
  deploy: NIGHT_VISION_PALETTE,
  chain: NIGHT_VISION_PALETTE,
  cryptid: NIGHT_VISION_PALETTE,
  capture: TABLOID_PALETTE,
  counter: TABLOID_PALETTE,
  stateloss: TABLOID_PALETTE,
  victory: CIGARETTE_PALETTE,
  bigwin: CIGARETTE_PALETTE,
  synergy: PHOTOCOPIER_PALETTE,
  stateevent: PHOTOCOPIER_PALETTE,
  broadcast: PHOTOCOPIER_PALETTE,
  flash: PHOTOCOPIER_PALETTE
};

const hexToRgba = (hex: string): string => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized.length === 3 ? normalized.repeat(2) : normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, 1)`;
};

const pickColorForEffect = (type: ParticleEffectType): string => {
  const palette = EFFECT_PALETTES[type] ?? DEFAULT_PALETTE;
  const color = palette[Math.floor(Math.random() * palette.length)];
  return hexToRgba(color);
};

const pickShapeForEffect = (type: ParticleEffectType): ParticleShape => {
  switch (type) {
    case 'capture':
    case 'counter':
    case 'stateloss':
      return Math.random() > 0.4 ? 'redactionBar' : 'newsprintShard';
    case 'victory':
    case 'bigwin':
    case 'stateevent':
      return Math.random() > 0.3 ? 'newsprintShard' : 'staticSpeck';
    case 'broadcast':
    case 'flash':
      return Math.random() > 0.2 ? 'staticSpeck' : 'redactionBar';
    default:
      return 'staticSpeck';
  }
};

const getRandomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;

const getParticleCount = (type: ParticleEffectType): number => {
  switch (type) {
    case 'victory':
    case 'bigwin':
      return 46;
    case 'flash':
    case 'broadcast':
      return 42;
    case 'synergy':
    case 'stateevent':
      return 36;
    case 'chain':
    case 'cryptid':
      return 32;
    case 'deploy':
      return 30;
    case 'stateloss':
      return 26;
    case 'capture':
    case 'counter':
      return 24;
    default:
      return 28;
  }
};

const getMotionForParticle = (
  effectType: ParticleEffectType,
  shape: ParticleShape,
  reducedMotion: boolean
): {
  vx: number;
  vy: number;
  drag: number;
  floatForce: number;
  angularVelocity: number;
  trailIntensity: number;
} => {
  const motionScale = reducedMotion ? 0.5 : 1;

  switch (effectType) {
    case 'capture':
    case 'counter':
    case 'stateloss':
      return {
        vx: getRandomInRange(-0.7, 0.7) * motionScale,
        vy: getRandomInRange(-0.3, 0.15) * motionScale,
        drag: 0.88,
        floatForce: 0.02,
        angularVelocity:
          (shape === 'redactionBar'
            ? getRandomInRange(-0.015, 0.015)
            : getRandomInRange(-0.02, 0.02)) * (reducedMotion ? 0.4 : 1),
        trailIntensity: reducedMotion ? 0 : 0.25
      };
    case 'victory':
    case 'bigwin':
    case 'stateevent':
      return {
        vx: getRandomInRange(-0.9, 0.9) * motionScale,
        vy: getRandomInRange(-0.6, 0.1) * motionScale,
        drag: 0.93,
        floatForce: 0.028,
        angularVelocity: getRandomInRange(-0.025, 0.025) * (reducedMotion ? 0.4 : 1),
        trailIntensity: reducedMotion ? 0 : 0.4
      };
    case 'flash':
    case 'broadcast':
      return {
        vx: getRandomInRange(-0.5, 0.5) * motionScale,
        vy: getRandomInRange(-0.4, 0.4) * motionScale,
        drag: 0.9,
        floatForce: 0.012,
        angularVelocity:
          shape === 'staticSpeck'
            ? getRandomInRange(-0.02, 0.02) * (reducedMotion ? 0.3 : 1)
            : getRandomInRange(-0.015, 0.015),
        trailIntensity: reducedMotion ? 0 : 0.55
      };
    case 'synergy':
      return {
        vx: getRandomInRange(-0.6, 0.6) * motionScale,
        vy: getRandomInRange(-0.5, 0.2) * motionScale,
        drag: 0.91,
        floatForce: 0.016,
        angularVelocity: getRandomInRange(-0.02, 0.02) * (reducedMotion ? 0.35 : 1),
        trailIntensity: reducedMotion ? 0 : 0.5
      };
    case 'chain':
    case 'cryptid':
      return {
        vx: getRandomInRange(-0.65, 0.65) * motionScale,
        vy: getRandomInRange(-0.45, 0.15) * motionScale,
        drag: 0.92,
        floatForce: 0.014,
        angularVelocity: getRandomInRange(-0.02, 0.02) * (reducedMotion ? 0.35 : 1),
        trailIntensity: reducedMotion ? 0 : 0.35
      };
    default:
      return {
        vx: getRandomInRange(-0.6, 0.6) * motionScale,
        vy: getRandomInRange(-0.4, 0.2) * motionScale,
        drag: 0.92,
        floatForce: 0.015,
        angularVelocity: getRandomInRange(-0.02, 0.02) * (reducedMotion ? 0.35 : 1),
        trailIntensity: reducedMotion ? 0 : 0.3
      };
  }
};

const getParticleSpread = (type: ParticleEffectType): number => {
  switch (type) {
    case 'victory':
    case 'bigwin':
      return 68;
    case 'flash':
    case 'broadcast':
      return 64;
    case 'synergy':
    case 'stateevent':
      return 58;
    case 'chain':
    case 'cryptid':
      return 52;
    case 'stateloss':
      return 46;
    default:
      return 50;
  }
};

const getParticleLifespan = (type: ParticleEffectType): number => {
  const base = getRandomInRange(140, 200);
  switch (type) {
    case 'victory':
    case 'bigwin':
    case 'stateevent':
      return base * 1.4;
    case 'flash':
    case 'broadcast':
      return base * 1.1;
    case 'synergy':
      return base * 1.2;
    case 'chain':
    case 'cryptid':
      return base * 1.05;
    case 'stateloss':
      return base * 0.85;
    default:
      return base;
  }
};

const getParticleSize = (type: ParticleEffectType, shape: ParticleShape): number => {
  const base =
    shape === 'newsprintShard'
      ? getRandomInRange(6, 12)
      : shape === 'redactionBar'
        ? getRandomInRange(5, 9)
        : getRandomInRange(2, 4);

  switch (type) {
    case 'victory':
    case 'bigwin':
      return base * 1.1;
    case 'flash':
    case 'broadcast':
      return base * 0.9;
    case 'stateloss':
      return base * 0.8;
    default:
      return base;
  }
};

const createParticle = (
  id: number,
  centerX: number,
  centerY: number,
  effectType: ParticleEffectType,
  reducedMotion: boolean
): Particle => {
  const shape = pickShapeForEffect(effectType);
  const spread = getParticleSpread(effectType);
  const lifespan = getParticleLifespan(effectType);
  const motion = getMotionForParticle(effectType, shape, reducedMotion);

  return {
    id,
    x: centerX + getRandomInRange(-spread / 2, spread / 2),
    y: centerY + getRandomInRange(-spread / 2, spread / 2),
    vx: motion.vx,
    vy: motion.vy,
    life: lifespan,
    maxLife: lifespan,
    size: getParticleSize(effectType, shape),
    color: pickColorForEffect(effectType),
    opacity: 1,
    rotation: getRandomInRange(-Math.PI, Math.PI),
    angularVelocity: motion.angularVelocity,
    shape,
    trailIntensity: motion.trailIntensity,
    drag: motion.drag,
    jitterSeed: Math.random() * Math.PI * 2,
    floatForce: motion.floatForce
  };
};

const updateParticle = (particle: Particle) => {
  const progress = 1 - particle.life / particle.maxLife;
  const wobble = Math.sin(progress * Math.PI * 2 + particle.jitterSeed) * 0.12;

  particle.vx += wobble * 0.03 * (particle.shape === 'staticSpeck' ? 1.2 : 0.6);
  particle.vx *= particle.drag;
  particle.vy = particle.vy * particle.drag + particle.floatForce;

  if (particle.shape === 'newsprintShard') {
    particle.vy += Math.sin(progress * Math.PI + particle.jitterSeed) * 0.01;
  }

  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.rotation += particle.angularVelocity;
  particle.life--;
  particle.opacity = Math.max(0, particle.life / particle.maxLife);
};

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.globalAlpha = particle.opacity;
  ctx.fillStyle = particle.color;

  if (particle.shape === 'newsprintShard') {
    const width = particle.size * 0.8;
    const height = particle.size * 2.1;
    ctx.beginPath();
    ctx.moveTo(-width, -height * 0.4);
    ctx.lineTo(width, -height * 0.2 + Math.sin(particle.jitterSeed) * 2);
    ctx.lineTo(width * 0.7, height * 0.6);
    ctx.lineTo(-width * 1.1, height * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.lineWidth = 0.75;
    ctx.strokeStyle = 'rgba(17, 17, 17, 0.35)';
    ctx.stroke();
  } else if (particle.shape === 'redactionBar') {
    const width = particle.size * 2.6;
    const height = particle.size * 0.6;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.globalAlpha = particle.opacity * 0.35;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-width / 2, -height / 2, width, height);
  } else {
    const size = particle.size;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.globalAlpha = particle.opacity * 0.4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    const dotSize = size * 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  if (particle.trailIntensity > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = particle.opacity * particle.trailIntensity;
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = Math.max(0.5, particle.size * 0.25);
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(particle.x - particle.vx * 6, particle.y - particle.vy * 6);
    ctx.stroke();
    ctx.restore();
  }
};

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
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reducedMotionRef.current = media.matches;
    };

    update();
    media.addEventListener('change', update);

    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

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
    const reducedMotion = reducedMotionRef.current;

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(i, x, y, type, reducedMotion));
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

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1000]"
      style={{ zIndex: 1000 }}
    />
  );
};