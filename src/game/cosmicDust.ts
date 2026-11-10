/**
 * Cosmic Dust Particle Simulation for Sky Vanguard
 * Provides slow-moving, multi-layered ethereal stardust motes drifting in the deep background.
 * Responsive to player movement, warp jumps, and depth parallax.
 */

export interface CosmicDustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  depth: number; // 0.1 (far) to 0.9 (near)
  baseAlpha: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
  haloColor: string;
}

export const COSMIC_DUST_PALETTES = [
  { core: '#e0f2fe', halo: 'rgba(56, 189, 248, 0.35)' }, // Cyan stardust
  { core: '#fdf4ff', halo: 'rgba(216, 180, 254, 0.35)' }, // Galactic lavender
  { core: '#fef9c3', halo: 'rgba(251, 191, 36, 0.30)' }, // Solar amber dust
  { core: '#ccfbf1', halo: 'rgba(20, 184, 166, 0.32)' }, // Aquamarine nebula dust
  { core: '#ffe4e6', halo: 'rgba(244, 63, 94, 0.28)' }, // Rose nova stardust
];

/**
 * Initializes a pool of cosmic dust motes scattered across the screen.
 */
export function initCosmicDust(
  count: number,
  width: number,
  height: number,
  paletteOverride?: { core: string; halo: string }[]
): CosmicDustMote[] {
  const palette = paletteOverride && paletteOverride.length > 0 ? paletteOverride : COSMIC_DUST_PALETTES;
  const dust: CosmicDustMote[] = [];
  const safeWidth = Math.max(320, width);
  const safeHeight = Math.max(480, height);

  for (let i = 0; i < count; i++) {
    const depth = 0.15 + Math.random() * 0.85; // 0.15 to 1.0
    const colorPair = palette[i % palette.length];
    const size = 1.2 + depth * 2.6; // Small, floating specks: 1.2px to 3.8px
    const baseAlpha = 0.18 + depth * 0.45; // Subtle, non-distracting
    const vy = 12 + depth * 28; // Slow drift: 12 - 40 px/s
    const vx = (Math.random() - 0.5) * 8; // Gentle lateral drift

    dust.push({
      x: Math.random() * safeWidth,
      y: Math.random() * safeHeight,
      vx,
      vy,
      size,
      depth,
      baseAlpha,
      alpha: baseAlpha,
      pulseSpeed: 1.2 + Math.random() * 2.5,
      pulsePhase: Math.random() * Math.PI * 2,
      color: colorPair.core,
      haloColor: colorPair.halo,
    });
  }

  return dust;
}

/**
 * Updates cosmic dust motes over delta time.
 * Includes gentle sinusoidal drifting, smooth wrapping, and subtle player lateral parallax.
 */
export function updateCosmicDust(
  dust: CosmicDustMote[],
  dt: number,
  width: number,
  height: number,
  speedMultiplier: number = 1.0,
  playerTilt: number = 0,
  isWarp: boolean = false
): void {
  const safeWidth = Math.max(320, width);
  const safeHeight = Math.max(480, height);
  const effectiveSpeed = isWarp ? speedMultiplier * 3.2 : speedMultiplier;

  for (let i = 0; i < dust.length; i++) {
    const p = dust[i];

    // Pulsate alpha gently for shimmering starlight effect
    p.pulsePhase += p.pulseSpeed * dt;
    const shimmer = Math.sin(p.pulsePhase) * 0.22;
    p.alpha = Math.max(0.06, Math.min(1.0, p.baseAlpha + shimmer));

    // Horizontal swaying curl
    const sway = Math.sin(p.pulsePhase * 0.7) * 4.5 * p.depth;

    // Lateral parallax based on player ship tilt/roll
    const lateralParallax = -playerTilt * 25 * p.depth;

    p.y += (p.vy * effectiveSpeed) * dt;
    p.x += (p.vx + sway + lateralParallax) * dt;

    // Seamless toroidal screen wrapping with margin
    if (p.y > safeHeight + 15) {
      p.y = -15;
      p.x = Math.random() * safeWidth;
    } else if (p.y < -15) {
      p.y = safeHeight + 15;
      p.x = Math.random() * safeWidth;
    }

    if (p.x > safeWidth + 20) {
      p.x = -15;
    } else if (p.x < -20) {
      p.x = safeWidth + 15;
    }
  }
}

/**
 * Renders cosmic dust particles onto canvas context with soft glowing haloball.
 */
export function renderCosmicDust(
  ctx: CanvasRenderingContext2D,
  dust: CosmicDustMote[]
): void {
  ctx.save();
  for (let i = 0; i < dust.length; i++) {
    const p = dust[i];
    ctx.globalAlpha = p.alpha;

    // 1. Soft glowing aura for high-depth or prominent dust motes
    if (p.depth > 0.45) {
      ctx.fillStyle = p.haloColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Bright incandescent dust core
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
