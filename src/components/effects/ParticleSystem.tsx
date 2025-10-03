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
  | 'cryptid'
  | 'ectoplasm'
  | 'surveillanceRedaction'
  | 'corkboardPins'
  | 'hotspotFlare';

type SizeMultiplierMap = Partial<Record<ParticleShape, number>> & { default?: number };
type Range = [number, number];

interface ParticleMotionProfile {
  vx: Range;
  vy: Range;
  drag: number;
  floatForce: number;
  angularVelocity: Range;
  reducedAngularVelocityScale?: number;
  trailIntensity: number;
  shapeOverrides?: Partial<
    Record<ParticleShape, { angularVelocity?: Range; trailIntensity?: number }>
  >;
}

interface ParticleMotifDefaults {
  count: number;
  spread: number;
  lifespanMultiplier: number;
  sizeMultiplier?: SizeMultiplierMap;
}

interface ParticleMotifConfig {
  palette: string[];
  shapeWeights: Array<{ shape: ParticleShape; weight: number }>;
  motion: ParticleMotionProfile;
  defaults: ParticleMotifDefaults;
  overrides?: Partial<Record<ParticleEffectType, Partial<ParticleMotifDefaults>>>;
}

type ParticleMotifKey =
  | 'dossierShards'
  | 'scanlineGlitch'
  | 'victoryConfetti'
  | 'memoAsh'
  | 'ectoplasmSmear'
  | 'corkboardPins'
  | 'surveillanceBars'
  | 'hotspotFlares';

const TABLOID_PALETTE = ['#d7263d', '#ff564f', '#161414', '#f4d8b4'];
const NIGHT_VISION_PALETTE = ['#00ff99', '#9cff7a', '#0e3b26', '#133a2a'];
const CIGARETTE_PALETTE = ['#f2d675', '#fce7b2', '#b38a3c', '#2d1c0f'];
const PHOTOCOPIER_PALETTE = ['#4ad3ff', '#b8f1ff', '#1a6aa8', '#0b1f2e'];
const MEMO_ASH_PALETTE = ['#ff9e53', '#ffd7a3', '#5c3d2e', '#1f140b'];
const SURVEILLANCE_PALETTE = ['#f9f9f9', '#cfcfcf', '#2b2b2b', '#ff4d4d'];
const HOTSPOT_PALETTE = ['#ff8a3d', '#ffd166', '#ff5d8f', '#fff3d9'];
const CORKBOARD_PALETTE = ['#f5d0a9', '#d98324', '#b0432c', '#4a1e15'];
const DEFAULT_PALETTE = ['#111111', '#444444'];

const PARTICLE_MOTIFS: Record<ParticleMotifKey, ParticleMotifConfig> = {
  dossierShards: {
    palette: TABLOID_PALETTE,
    shapeWeights: [
      { shape: 'newsprintShard', weight: 0.6 },
      { shape: 'redactionBar', weight: 0.3 },
      { shape: 'staticSpeck', weight: 0.1 }
    ],
    motion: {
      vx: [-0.7, 0.7],
      vy: [-0.35, 0.15],
      drag: 0.88,
      floatForce: 0.02,
      angularVelocity: [-0.02, 0.02],
      reducedAngularVelocityScale: 0.4,
      trailIntensity: 0.25,
      shapeOverrides: {
        redactionBar: { angularVelocity: [-0.015, 0.015], trailIntensity: 0.2 }
      }
    },
    defaults: {
      count: 28,
      spread: 48,
      lifespanMultiplier: 1,
      sizeMultiplier: { redactionBar: 1.1, newsprintShard: 1, staticSpeck: 0.9 }
    },
    overrides: {
      deploy: { count: 30 },
      capture: { count: 24 },
      counter: { count: 24 },
      chain: { count: 32, spread: 52, lifespanMultiplier: 1.05 }
    }
  },
  scanlineGlitch: {
    palette: PHOTOCOPIER_PALETTE,
    shapeWeights: [
      { shape: 'staticSpeck', weight: 0.7 },
      { shape: 'redactionBar', weight: 0.3 }
    ],
    motion: {
      vx: [-0.5, 0.5],
      vy: [-0.4, 0.4],
      drag: 0.9,
      floatForce: 0.012,
      angularVelocity: [-0.02, 0.02],
      reducedAngularVelocityScale: 0.3,
      trailIntensity: 0.55,
      shapeOverrides: {
        redactionBar: { angularVelocity: [-0.015, 0.015] }
      }
    },
    defaults: {
      count: 42,
      spread: 64,
      lifespanMultiplier: 1.1,
      sizeMultiplier: { redactionBar: 1.2, staticSpeck: 0.8 }
    }
  },
  victoryConfetti: {
    palette: CIGARETTE_PALETTE,
    shapeWeights: [
      { shape: 'newsprintShard', weight: 0.7 },
      { shape: 'staticSpeck', weight: 0.3 }
    ],
    motion: {
      vx: [-0.9, 0.9],
      vy: [-0.6, 0.1],
      drag: 0.93,
      floatForce: 0.028,
      angularVelocity: [-0.025, 0.025],
      reducedAngularVelocityScale: 0.4,
      trailIntensity: 0.4
    },
    defaults: {
      count: 40,
      spread: 60,
      lifespanMultiplier: 1.3,
      sizeMultiplier: { newsprintShard: 1.1, staticSpeck: 1 }
    },
    overrides: {
      victory: { count: 46, spread: 68, lifespanMultiplier: 1.4 },
      bigwin: { count: 46, spread: 68, lifespanMultiplier: 1.4 },
      stateevent: { count: 36, spread: 58, lifespanMultiplier: 1.2 }
    }
  },
  memoAsh: {
    palette: MEMO_ASH_PALETTE,
    shapeWeights: [
      { shape: 'newsprintShard', weight: 0.4 },
      { shape: 'staticSpeck', weight: 0.5 },
      { shape: 'redactionBar', weight: 0.1 }
    ],
    motion: {
      vx: [-0.5, 0.5],
      vy: [-0.25, 0.1],
      drag: 0.9,
      floatForce: 0.01,
      angularVelocity: [-0.015, 0.015],
      reducedAngularVelocityScale: 0.35,
      trailIntensity: 0.2,
      shapeOverrides: {
        redactionBar: { angularVelocity: [-0.01, 0.01], trailIntensity: 0.15 }
      }
    },
    defaults: {
      count: 26,
      spread: 46,
      lifespanMultiplier: 0.85,
      sizeMultiplier: { staticSpeck: 0.9, newsprintShard: 0.9 }
    }
  },
  ectoplasmSmear: {
    palette: NIGHT_VISION_PALETTE,
    shapeWeights: [
      { shape: 'staticSpeck', weight: 0.6 },
      { shape: 'newsprintShard', weight: 0.3 },
      { shape: 'redactionBar', weight: 0.1 }
    ],
    motion: {
      vx: [-0.65, 0.65],
      vy: [-0.45, 0.15],
      drag: 0.92,
      floatForce: 0.014,
      angularVelocity: [-0.02, 0.02],
      reducedAngularVelocityScale: 0.35,
      trailIntensity: 0.35
    },
    defaults: {
      count: 32,
      spread: 52,
      lifespanMultiplier: 1.05,
      sizeMultiplier: { staticSpeck: 1, newsprintShard: 0.95 }
    }
  },
  corkboardPins: {
    palette: CORKBOARD_PALETTE,
    shapeWeights: [
      { shape: 'newsprintShard', weight: 0.45 },
      { shape: 'staticSpeck', weight: 0.45 },
      { shape: 'redactionBar', weight: 0.1 }
    ],
    motion: {
      vx: [-0.45, 0.45],
      vy: [-0.3, 0.12],
      drag: 0.92,
      floatForce: 0.02,
      angularVelocity: [-0.018, 0.018],
      reducedAngularVelocityScale: 0.35,
      trailIntensity: 0.3
    },
    defaults: {
      count: 36,
      spread: 58,
      lifespanMultiplier: 1.2,
      sizeMultiplier: { newsprintShard: 0.95, staticSpeck: 0.85 }
    },
    overrides: {
      corkboardPins: { count: 24, spread: 34, lifespanMultiplier: 1 }
    }
  },
  surveillanceBars: {
    palette: SURVEILLANCE_PALETTE,
    shapeWeights: [
      { shape: 'redactionBar', weight: 0.8 },
      { shape: 'staticSpeck', weight: 0.2 }
    ],
    motion: {
      vx: [-0.4, 0.4],
      vy: [-0.18, 0.08],
      drag: 0.88,
      floatForce: 0.008,
      angularVelocity: [-0.012, 0.012],
      reducedAngularVelocityScale: 0.3,
      trailIntensity: 0.18,
      shapeOverrides: {
        redactionBar: { angularVelocity: [-0.008, 0.008], trailIntensity: 0.15 }
      }
    },
    defaults: {
      count: 22,
      spread: 28,
      lifespanMultiplier: 0.95,
      sizeMultiplier: { redactionBar: 1.4, staticSpeck: 0.7 }
    }
  },
  hotspotFlares: {
    palette: HOTSPOT_PALETTE,
    shapeWeights: [
      { shape: 'staticSpeck', weight: 0.7 },
      { shape: 'newsprintShard', weight: 0.3 }
    ],
    motion: {
      vx: [-0.6, 0.6],
      vy: [-0.5, 0.2],
      drag: 0.9,
      floatForce: 0.02,
      angularVelocity: [-0.022, 0.022],
      reducedAngularVelocityScale: 0.35,
      trailIntensity: 0.5
    },
    defaults: {
      count: 34,
      spread: 48,
      lifespanMultiplier: 1.1,
      sizeMultiplier: { staticSpeck: 1, newsprintShard: 0.9 }
    }
  }
};

const EFFECT_TO_MOTIF: Record<ParticleEffectType, ParticleMotifKey> = {
  deploy: 'dossierShards',
  capture: 'dossierShards',
  counter: 'dossierShards',
  chain: 'dossierShards',
  stateloss: 'memoAsh',
  victory: 'victoryConfetti',
  bigwin: 'victoryConfetti',
  stateevent: 'victoryConfetti',
  flash: 'scanlineGlitch',
  broadcast: 'scanlineGlitch',
  synergy: 'corkboardPins',
  corkboardPins: 'corkboardPins',
  cryptid: 'ectoplasmSmear',
  ectoplasm: 'ectoplasmSmear',
  surveillanceRedaction: 'surveillanceBars',
  hotspotFlare: 'hotspotFlares'
};

const DEFAULT_MOTIF_KEY: ParticleMotifKey = 'dossierShards';

const getMotifConfig = (type: ParticleEffectType): ParticleMotifConfig => {
  const motifKey = EFFECT_TO_MOTIF[type] ?? DEFAULT_MOTIF_KEY;
  return PARTICLE_MOTIFS[motifKey] ?? PARTICLE_MOTIFS[DEFAULT_MOTIF_KEY];
};

const getMotifSetting = <K extends keyof ParticleMotifDefaults>(
  type: ParticleEffectType,
  key: K
): ParticleMotifDefaults[K] => {
  const config = getMotifConfig(type);
  const override = config.overrides?.[type]?.[key];
  if (override !== undefined) {
    return override as ParticleMotifDefaults[K];
  }
  return config.defaults[key];
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
  const palette = getMotifConfig(type).palette ?? DEFAULT_PALETTE;
  const safePalette = palette.length > 0 ? palette : DEFAULT_PALETTE;
  const color = safePalette[Math.floor(Math.random() * safePalette.length)] ?? DEFAULT_PALETTE[0];
  return hexToRgba(color);
};

const pickShapeForEffect = (type: ParticleEffectType): ParticleShape => {
  const { shapeWeights } = getMotifConfig(type);
  if (!shapeWeights.length) {
    return 'staticSpeck';
  }

  const totalWeight = shapeWeights.reduce((sum, item) => sum + item.weight, 0);
  const threshold = Math.random() * totalWeight;
  let cumulative = 0;

  for (const item of shapeWeights) {
    cumulative += item.weight;
    if (threshold <= cumulative) {
      return item.shape;
    }
  }

  return shapeWeights[shapeWeights.length - 1]?.shape ?? 'staticSpeck';
};

const getRandomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;

const getParticleCount = (type: ParticleEffectType): number => getMotifSetting(type, 'count');

const getParticleSpread = (type: ParticleEffectType): number => getMotifSetting(type, 'spread');

const getParticleLifespan = (type: ParticleEffectType): number => {
  const base = getRandomInRange(140, 200);
  return base * getMotifSetting(type, 'lifespanMultiplier');
};

const getParticleSize = (type: ParticleEffectType, shape: ParticleShape): number => {
  const base =
    shape === 'newsprintShard'
      ? getRandomInRange(6, 12)
      : shape === 'redactionBar'
        ? getRandomInRange(5, 9)
        : getRandomInRange(2, 4);

  const sizeMultiplierMap = getMotifSetting(type, 'sizeMultiplier');
  if (!sizeMultiplierMap) {
    return base;
  }

  const shapeMultiplier = sizeMultiplierMap[shape];
  const defaultMultiplier = sizeMultiplierMap.default ?? 1;
  return base * (shapeMultiplier ?? defaultMultiplier ?? 1);
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
  const config = getMotifConfig(effectType);
  const motion = config.motion;
  const motionScale = reducedMotion ? 0.5 : 1;

  const vx = getRandomInRange(motion.vx[0], motion.vx[1]) * motionScale;
  const vy = getRandomInRange(motion.vy[0], motion.vy[1]) * motionScale;

  const angularRange = motion.shapeOverrides?.[shape]?.angularVelocity ?? motion.angularVelocity;
  const angularScale = reducedMotion ? motion.reducedAngularVelocityScale ?? 0.4 : 1;
  const angularVelocity = getRandomInRange(angularRange[0], angularRange[1]) * angularScale;

  const baseTrail = motion.shapeOverrides?.[shape]?.trailIntensity ?? motion.trailIntensity;

  return {
    vx,
    vy,
    drag: motion.drag,
    floatForce: motion.floatForce,
    angularVelocity,
    trailIntensity: reducedMotion ? 0 : baseTrail
  };
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