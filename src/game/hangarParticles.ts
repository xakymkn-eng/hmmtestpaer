/**
 * Performance-efficient Hangar & Title Particle System
 * Simulates gentle floating zero-g dust motes and intermittent hangar welding/ion sparks
 * around the selected fighter to enhance atmospheric immersion.
 * Decoupled pure logic for deterministic unit testing.
 */

export type HangarParticleType = 'dust' | 'spark';

export interface HangarParticle {
  id: number;
  type: HangarParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
  glowColor: string;
  layer: -1 | 1; // -1: Behind fighter, 1: In front of fighter (creates depth)
  gravity: number;
  drag: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export interface HangarParticleTheme {
  primary: string;
  accent: string;
  glow: string;
}

export const DEFAULT_HANGAR_THEME: HangarParticleTheme = {
  primary: '#38bdf8',
  accent: '#fbbf24',
  glow: 'rgba(56, 189, 248, 0.4)',
};

/**
 * Creates a pre-allocated pool of hangar dust and spark particles.
 * Pre-allocation eliminates runtime garbage collection pauses.
 */
export function createHangarParticlePool(
  count: number,
  width: number,
  height: number,
  theme: HangarParticleTheme = DEFAULT_HANGAR_THEME
): HangarParticle[] {
  const particles: HangarParticle[] = [];
  const safeW = Math.max(100, width);
  const safeH = Math.max(100, height);

  for (let i = 0; i < count; i++) {
    // 70% dust motes, 30% hangar sparks
    const isSpark = i % 3 === 0;
    particles.push(respawnHangarParticle(i, isSpark ? 'spark' : 'dust', safeW, safeH, theme, true));
  }

  return particles;
}

/**
 * Respawns or recycles a particle within the pool without new heap allocations.
 */
export function respawnHangarParticle(
  id: number,
  type: HangarParticleType,
  width: number,
  height: number,
  theme: HangarParticleTheme,
  initialSpread: boolean = false
): HangarParticle {
  const isSpark = type === 'spark';

  if (isSpark) {
    // Sparks emit from near the engine / center maintenance gantry (mid-height, centered)
    const startX = width * 0.5 + (Math.random() - 0.5) * (width * 0.45);
    const startY = initialSpread
      ? Math.random() * height
      : height * 0.55 + (Math.random() - 0.5) * (height * 0.25);

    const speed = 25 + Math.random() * 45;
    const angle = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.4; // Upwards fan arc
    const maxLife = 0.8 + Math.random() * 1.2;

    return {
      id,
      type: 'spark',
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.0 + Math.random() * 1.6,
      alpha: 0,
      maxAlpha: 0.65 + Math.random() * 0.35,
      life: initialSpread ? Math.random() * maxLife : maxLife,
      maxLife,
      color: Math.random() < 0.6 ? '#ffffff' : theme.accent,
      glowColor: theme.glow,
      layer: Math.random() < 0.5 ? -1 : 1,
      gravity: 28 + Math.random() * 20, // Gentle downward gravity
      drag: 0.94,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 4 + Math.random() * 4,
    };
  }

  // Floating zero-g hangar dust mote
  const maxLife = 3.5 + Math.random() * 4.0;
  return {
    id,
    type: 'dust',
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 8, // Very gentle thermal drift
    vy: -6 - Math.random() * 10,   // Slow ambient convection upwards
    size: 1.2 + Math.random() * 2.2,
    alpha: 0,
    maxAlpha: 0.25 + Math.random() * 0.35,
    life: initialSpread ? Math.random() * maxLife : maxLife,
    maxLife,
    color: Math.random() < 0.5 ? '#ffffff' : theme.primary,
    glowColor: theme.glow,
    layer: Math.random() < 0.6 ? -1 : 1, // More behind the plane for depth
    gravity: 0,
    drag: 0.995,
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 1.2 + Math.random() * 2.0,
  };
}

/**
 * Updates all hangar particles over delta time (seconds).
 * Recycles expired particles seamlessly.
 */
export function updateHangarParticles(
  particles: HangarParticle[],
  dt: number,
  width: number,
  height: number,
  theme: HangarParticleTheme = DEFAULT_HANGAR_THEME
): void {
  const safeW = Math.max(100, width);
  const safeH = Math.max(100, height);
  const clampedDt = Math.min(0.1, Math.max(0.001, dt));

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.life -= clampedDt;

    if (p.life <= 0) {
      // Recycle particle in place
      particles[i] = respawnHangarParticle(p.id, p.type, safeW, safeH, theme, false);
      continue;
    }

    // Smooth fade in and out curve
    const lifeRatio = p.life / p.maxLife; // 1 -> 0
    if (lifeRatio > 0.85) {
      p.alpha = ((1 - lifeRatio) / 0.15) * p.maxAlpha;
    } else if (lifeRatio < 0.25) {
      p.alpha = (lifeRatio / 0.25) * p.maxAlpha;
    } else {
      p.alpha = p.maxAlpha;
    }

    if (p.type === 'spark') {
      p.vy += p.gravity * clampedDt;
      p.vx *= Math.pow(p.drag, clampedDt * 60);
      p.vy *= Math.pow(p.drag, clampedDt * 60);
      p.x += p.vx * clampedDt;
      p.y += p.vy * clampedDt;
    } else {
      // Dust mote sinusoidal gentle sway
      p.pulsePhase += p.pulseSpeed * clampedDt;
      const sway = Math.sin(p.pulsePhase) * 4;
      p.x += (p.vx + sway) * clampedDt;
      p.y += p.vy * clampedDt;

      // Wrap dust around screen edges
      if (p.y < -10) p.y = safeH + 5;
      if (p.y > safeH + 10) p.y = -5;
      if (p.x < -10) p.x = safeW + 5;
      if (p.x > safeW + 10) p.x = -5;
    }
  }
}

/**
 * Renders hangar particles to a 2D canvas context.
 * Supports rendering either back layer, front layer, or all particles.
 */
export function renderHangarParticles(
  ctx: CanvasRenderingContext2D,
  particles: HangarParticle[],
  layerFilter: 'all' | 'back' | 'front' = 'all'
): void {
  ctx.save();

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (layerFilter === 'back' && p.layer !== -1) continue;
    if (layerFilter === 'front' && p.layer !== 1) continue;
    if (p.alpha <= 0.01) continue;

    ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

    if (p.type === 'spark') {
      // Draw incandescent spark streak with soft glow
      ctx.fillStyle = p.glowColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Sharp bright core
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Motion trail
      if (Math.abs(p.vx) > 5 || Math.abs(p.vy) > 5) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.75;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
        ctx.stroke();
      }
    } else {
      // Soft floating dust mote with radial aura
      ctx.fillStyle = p.glowColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
