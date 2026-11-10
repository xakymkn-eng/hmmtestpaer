/**
 * Pure math and physics helpers for dynamic reactive starfield background animation.
 * Decoupled logic for testing and 60fps canvas performance.
 */

export interface StarParticle {
  x: number;
  y: number;
  size: number;
  depth: number; // 0.1 (far) to 1.0 (near)
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  speedY: number;
  hasCrossFlare?: boolean;
}

export interface CelestialPlanet {
  name: string;
  xRatio: number; // 0..1 screen width
  yRatio: number; // 0..1 screen height
  radius: number;
  baseColor: string;
  shadowColor: string;
  atmosphereColor: string;
  hasRings?: boolean;
  ringColor?: string;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringTilt?: number; // radians
  hasMoon?: boolean;
  moonRadius?: number;
  moonDist?: number;
  moonAngle?: number;
}

export interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  active: boolean;
  color: string;
}

export interface FastPassingStar {
  x: number;
  y: number;
  speed: number;
  length: number;
  size: number;
  alpha: number;
  color: string;
}

export interface CosmicWindStream {
  y: number;
  speed: number;
  amplitude: number;
  frequency: number;
  phase: number;
  color: string;
  alpha: number;
}

export interface MicroDustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  twinklePhase: number;
  color: string;
}

/**
 * Normalizes mouse client coordinates into [-1, 1] relative to center of viewport
 */
export function normalizeMouseCoordinates(
  clientX: number,
  clientY: number,
  width: number,
  height: number
): { x: number; y: number } {
  if (width <= 0 || height <= 0) {
    return { x: 0, y: 0 };
  }
  const normX = Math.max(-1, Math.min(1, (clientX / width) * 2 - 1));
  const normY = Math.max(-1, Math.min(1, (clientY / height) * 2 - 1));
  return { x: normX, y: normY };
}

/**
 * Calculates parallax offset based on depth layer and maximum shift limit
 */
export function calculateParallaxOffset(
  normX: number,
  normY: number,
  depth: number,
  maxShift: number = 40
): { offsetX: number; offsetY: number } {
  const clampedDepth = Math.max(0, Math.min(1, depth));
  return {
    offsetX: normX * clampedDepth * maxShift,
    offsetY: normY * clampedDepth * maxShift,
  };
}

/**
 * Linear interpolation helper
 */
export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * Math.max(0, Math.min(1, factor));
}

/**
 * Calculates CSS 3D tilt angles based on normalized mouse coordinates
 */
export function calculateTiltTransform(
  normX: number,
  normY: number,
  maxTiltDeg: number = 4
): { rotateX: number; rotateY: number } {
  return {
    rotateX: -normY * maxTiltDeg,
    rotateY: normX * maxTiltDeg,
  };
}

/**
 * Color palettes for multi-spectral space ambiance
 */
export const STAR_PALETTES = [
  '#e2e8f0', // Crisp silver
  '#38bdf8', // Neon cyan
  '#818cf8', // Galactic indigo
  '#fef08a', // Amber dwarf
  '#a7f3d0', // Emerald dust
];

/**
 * Creates a collection of star particles with depth layering and cross diffraction flares
 */
export function initStarfield(
  count: number,
  width: number,
  height: number,
  customPalette?: string[]
): StarParticle[] {
  const palette = customPalette && customPalette.length > 0 ? customPalette : STAR_PALETTES;
  const stars: StarParticle[] = [];
  for (let i = 0; i < count; i++) {
    const depth = 0.15 + Math.random() * 0.85; // 0.15 (deep background) to 1.0 (foreground)
    const baseAlpha = 0.2 + depth * 0.7;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const size = depth < 0.4 ? 1.0 : depth < 0.8 ? 1.5 + Math.random() * 0.8 : 2.2 + Math.random() * 1.5;
    const hasCrossFlare = depth > 0.88 && Math.random() < 0.45;

    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size,
      depth,
      alpha: baseAlpha,
      baseAlpha,
      twinkleSpeed: 1 + Math.random() * 3,
      twinklePhase: Math.random() * Math.PI * 2,
      color,
      speedY: 8 + depth * 35, // Near stars drift down faster
      hasCrossFlare,
    });
  }
  return stars;
}

/**
 * Re-colors active starfield particles to match a newly selected sector palette
 */
export function switchStarfieldColors(stars: StarParticle[], palette: string[]): void {
  if (!palette || palette.length === 0) return;
  for (let i = 0; i < stars.length; i++) {
    stars[i].color = palette[i % palette.length];
  }
}

/**
 * Updates a star particle's vertical drift and twinkle phase
 */
export function updateStar(
  star: StarParticle,
  dt: number,
  width: number,
  height: number,
  speedFactor: number = 1.0
): void {
  star.y += star.speedY * dt * speedFactor;
  if (star.y > height + 20) {
    star.y = -20;
    star.x = Math.random() * width;
  } else if (star.y < -20) {
    star.y = height + 20;
    star.x = Math.random() * width;
  }

  star.twinklePhase += star.twinkleSpeed * dt;
  const twinkle = Math.sin(star.twinklePhase) * 0.25;
  star.alpha = Math.max(0.08, Math.min(1.0, star.baseAlpha + twinkle));
}

/**
 * Retrieves predefined majestic celestial bodies for sectors or universe clusters
 */
export function getCelestialPlanetForSector(sectorIndex: number = 1): CelestialPlanet {
  switch (sectorIndex) {
    case 2: // Cryo Glacial
      return {
        name: 'Cryo-Prime Gas Giant',
        xRatio: 0.82,
        yRatio: 0.22,
        radius: 95,
        baseColor: '#0891b2',
        shadowColor: '#042f2e',
        atmosphereColor: 'rgba(34, 211, 238, 0.45)',
        hasRings: true,
        ringColor: 'rgba(165, 243, 252, 0.45)',
        ringInnerRadius: 110,
        ringOuterRadius: 185,
        ringTilt: -0.38,
        hasMoon: true,
        moonRadius: 12,
        moonDist: 210,
        moonAngle: 0.6,
      };
    case 3: // Solar Quasar
      return {
        name: 'Quasar Solaris Dwarf',
        xRatio: 0.18,
        yRatio: 0.24,
        radius: 110,
        baseColor: '#ea580c',
        shadowColor: '#431407',
        atmosphereColor: 'rgba(251, 146, 60, 0.65)',
        hasRings: false,
        hasMoon: false,
      };
    case 4: // Black Hole / Singularity
      return {
        name: 'Sagittarius Event Horizon',
        xRatio: 0.84,
        yRatio: 0.28,
        radius: 80,
        baseColor: '#030712',
        shadowColor: '#09090b',
        atmosphereColor: 'rgba(192, 132, 252, 0.6)',
        hasRings: true,
        ringColor: 'rgba(216, 180, 254, 0.5)',
        ringInnerRadius: 95,
        ringOuterRadius: 170,
        ringTilt: 0.42,
        hasMoon: false,
      };
    case 5: // Olympus Sovereign Core
      return {
        name: 'Olympus Golden Star Citadel',
        xRatio: 0.78,
        yRatio: 0.20,
        radius: 105,
        baseColor: '#d97706',
        shadowColor: '#451a03',
        atmosphereColor: 'rgba(251, 191, 36, 0.6)',
        hasRings: true,
        ringColor: 'rgba(254, 240, 138, 0.55)',
        ringInnerRadius: 120,
        ringOuterRadius: 195,
        ringTilt: -0.25,
        hasMoon: true,
        moonRadius: 14,
        moonDist: 230,
        moonAngle: -0.8,
      };
    case 1:
    default: // Alpha Void / Orion
      return {
        name: 'Aethelgard Gas Giant',
        xRatio: 0.85,
        yRatio: 0.20,
        radius: 90,
        baseColor: '#1e3a8a',
        shadowColor: '#020617',
        atmosphereColor: 'rgba(56, 189, 248, 0.5)',
        hasRings: true,
        ringColor: 'rgba(125, 211, 252, 0.4)',
        ringInnerRadius: 105,
        ringOuterRadius: 175,
        ringTilt: -0.32,
        hasMoon: true,
        moonRadius: 11,
        moonDist: 200,
        moonAngle: 0.5,
      };
  }
}

/**
 * Draws a celestial planet with atmospheric rim glow, terminator shadow, and rings
 */
export function renderCelestialPlanet(
  ctx: CanvasRenderingContext2D,
  planet: CelestialPlanet,
  centerX: number,
  centerY: number,
  tiltX: number = 0,
  tiltY: number = 0
): void {
  const px = centerX + tiltX;
  const py = centerY + tiltY;

  ctx.save();

  // 1. Behind-planet half of rings
  if (planet.hasRings && planet.ringColor) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(planet.ringTilt || -0.3);
    ctx.scale(1, 0.3);

    ctx.beginPath();
    ctx.arc(0, 0, planet.ringOuterRadius || planet.radius * 1.8, Math.PI, Math.PI * 2);
    ctx.arc(0, 0, planet.ringInnerRadius || planet.radius * 1.2, Math.PI * 2, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = planet.ringColor;
    ctx.fill();
    ctx.restore();
  }

  // 2. Planet Body & Terminator Shading
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
  ctx.clip();

  // Base spherical gradient
  const sphereGrad = ctx.createRadialGradient(
    px - planet.radius * 0.35,
    py - planet.radius * 0.35,
    planet.radius * 0.1,
    px,
    py,
    planet.radius
  );
  sphereGrad.addColorStop(0, planet.baseColor);
  sphereGrad.addColorStop(0.7, planet.shadowColor);
  sphereGrad.addColorStop(1, '#000000');
  ctx.fillStyle = sphereGrad;
  ctx.fillRect(px - planet.radius, py - planet.radius, planet.radius * 2, planet.radius * 2);

  // Subtle cloud bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let b = -3; b <= 3; b++) {
    const bandY = py + b * (planet.radius * 0.22);
    ctx.fillRect(px - planet.radius, bandY, planet.radius * 2, planet.radius * 0.12);
  }
  ctx.restore();

  // 3. Atmospheric Rim Glow (Limb)
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
  ctx.strokeStyle = planet.atmosphereColor;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Outer soft atmospheric haze
  const hazeGrad = ctx.createRadialGradient(px, py, planet.radius * 0.85, px, py, planet.radius * 1.25);
  hazeGrad.addColorStop(0, planet.atmosphereColor);
  hazeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hazeGrad;
  ctx.beginPath();
  ctx.arc(px, py, planet.radius * 1.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Front-half of rings
  if (planet.hasRings && planet.ringColor) {
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(planet.ringTilt || -0.3);
    ctx.scale(1, 0.3);

    ctx.beginPath();
    ctx.arc(0, 0, planet.ringOuterRadius || planet.radius * 1.8, 0, Math.PI);
    ctx.arc(0, 0, planet.ringInnerRadius || planet.radius * 1.2, Math.PI, 0, true);
    ctx.closePath();
    ctx.fillStyle = planet.ringColor;
    ctx.fill();
    ctx.restore();
  }

  // 5. Orbiting Moon
  if (planet.hasMoon && planet.moonRadius && planet.moonDist) {
    const angle = planet.moonAngle || 0.4;
    const mx = px + Math.cos(angle) * planet.moonDist;
    const my = py + Math.sin(angle) * (planet.moonDist * 0.4);

    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, planet.moonRadius, 0, Math.PI * 2);
    const moonGrad = ctx.createRadialGradient(mx - 2, my - 2, 1, mx, my, planet.moonRadius);
    moonGrad.addColorStop(0, '#f1f5f9');
    moonGrad.addColorStop(0.8, '#475569');
    moonGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = moonGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws a 4-point cross diffraction lens flare on a high-magnitude star
 */
export function renderDiffractionSpike(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number
): void {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;

  // Horizontal spike
  ctx.beginPath();
  ctx.moveTo(x - radius * 3.5, y);
  ctx.lineTo(x + radius * 3.5, y);
  ctx.stroke();

  // Vertical spike
  ctx.beginPath();
  ctx.moveTo(x, y - radius * 3.5);
  ctx.lineTo(x, y + radius * 3.5);
  ctx.stroke();

  // Glowing center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Calculates logarithmic spiral position for realistic Milky Way galaxy arms
 * r = a * e^(b * theta)
 */
export function calculateLogarithmicSpiralPoint(
  armOffset: number,
  t: number, // 0 to 1 along arm
  spiralTightness: number = 2.6,
  minRadius: number = 15,
  maxRadius: number = 260,
  randomScatter: number = 16
): { x: number; y: number; dist: number; angle: number } {
  const theta = armOffset + t * (Math.PI * spiralTightness);
  const dist = minRadius + Math.pow(t, 1.35) * (maxRadius - minRadius);
  const px = Math.cos(theta) * dist;
  const py = Math.sin(theta) * dist;
  return { x: px, y: py, dist, angle: theta };
}

/**
 * Initializes micro-dust particles for the ultra graphics tier
 */
export function initMicroDust(
  count: number,
  width: number,
  height: number,
  palette: string[]
): MicroDustParticle[] {
  const dust: MicroDustParticle[] = [];
  for (let i = 0; i < count; i++) {
    const baseAlpha = 0.25 + Math.random() * 0.55;
    dust.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 12 + 6, // gentle drift to the right
      vy: (Math.random() - 0.5) * 8 + 4,
      size: 0.6 + Math.random() * 1.4,
      alpha: baseAlpha,
      baseAlpha,
      twinklePhase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
    });
  }
  return dust;
}

/**
 * Updates floating micro-dust particle position and twinkle
 */
export function updateMicroDust(
  p: MicroDustParticle,
  dt: number,
  width: number,
  height: number,
  windSpeed: number = 1.0
): void {
  p.x += p.vx * dt * windSpeed;
  p.y += p.vy * dt * windSpeed;

  if (p.x > width + 20) p.x = -20;
  if (p.x < -20) p.x = width + 20;
  if (p.y > height + 20) p.y = -20;
  if (p.y < -20) p.y = height + 20;

  p.twinklePhase += dt * 2.5;
  p.alpha = Math.max(0.1, Math.min(1.0, p.baseAlpha + Math.sin(p.twinklePhase) * 0.25));
}

/**
 * Initializes fast passing stars for the ultra and high graphics tier
 */
export function initFastPassingStars(
  count: number,
  width: number,
  height: number
): FastPassingStar[] {
  const stars: FastPassingStar[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 400 + Math.random() * 600,
      length: 25 + Math.random() * 45,
      size: 1.2 + Math.random() * 1.2,
      alpha: 0.3 + Math.random() * 0.6,
      color: Math.random() > 0.4 ? '#ffffff' : '#bae6fd',
    });
  }
  return stars;
}

/**
 * Updates fast passing star downwards with wrap-around
 */
export function updateFastPassingStar(
  s: FastPassingStar,
  dt: number,
  width: number,
  height: number
): void {
  s.y += s.speed * dt;
  if (s.y > height + 50) {
    s.y = -50;
    s.x = Math.random() * width;
  }
}


