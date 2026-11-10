/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React,{ useEffect,useRef,useState } from 'react';
import {
initStarfield,
updateStar,
normalizeMouseCoordinates,
calculateParallaxOffset,
calculateTiltTransform,
lerp,
StarParticle,
StardustParticle,
ShootingStar,
FastPassingStar,
MicroDustParticle,
switchStarfieldColors,
renderDiffractionSpike,
calculateLogarithmicSpiralPoint,
initMicroDust,
updateMicroDust,
initFastPassingStars,
updateFastPassingStar,
} from '../game/starfield';
import { parallaxTiltManager } from '../game/parallaxTilt';
import {
SceneryType,
SCENERY_CONFIGS,
GraphicsQuality,
FpsTarget,
getGraphicsSpecs,
} from '../game/lobbySettings';

export interface StarfieldBackgroundProps {
  sectorIndex?: number;
  activeUniverseId?: number | null;
  activeScenery?: SceneryType;
  graphicsQuality?: GraphicsQuality;
  fpsTarget?: FpsTarget;
}

export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({
  activeScenery = 'galaxy',
  graphicsQuality = 'high',
  fpsTarget = 60,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<StarParticle[]>([]);
  const [transitionFade, setTransitionFade] = useState(false);

  const sceneryConfig = SCENERY_CONFIGS[activeScenery] || SCENERY_CONFIGS.galaxy;
  const graphicsSpecs = getGraphicsSpecs(graphicsQuality);

  // Smooth blur scene transition effect when active scenery changes (High & Ultra)
  useEffect(() => {
    if (graphicsSpecs.enableBloom) {
      setTransitionFade(true);
      const timer = setTimeout(() => setTransitionFade(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeScenery, graphicsSpecs.enableBloom]);

  // Update star colors whenever scenery changes
  useEffect(() => {
    if (starsRef.current.length > 0) {
      switchStarfieldColors(starsRef.current, sceneryConfig.starColors);
    }
  }, [sceneryConfig.starColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    let targetMouse = { x: 0, y: 0 };
    let smoothMouse = { x: 0, y: 0 };
    let lastClientX = width / 2;
    let lastClientY = height / 2;
    let mouseSpeed = 0;

    // Star particle system based on graphics quality
    const starCount = Math.min(
      graphicsSpecs.starCount,
      Math.floor((width * height) / (graphicsQuality === 'low' ? 14000 : graphicsQuality === 'ultra' ? 3800 : 6000))
    );
    let stars: StarParticle[] = initStarfield(starCount, width, height, sceneryConfig.starColors);
    starsRef.current = stars;

    // Stardust sparks near cursor (enabled on medium, high, ultra; cut off on low)
    const stardustPool: StardustParticle[] = [];
    const MAX_STARDUST = graphicsSpecs.enableStardust
      ? graphicsQuality === 'ultra'
        ? 60
        : graphicsQuality === 'high'
        ? 35
        : 15
      : 0;

    // Shooting stars (disabled on low)
    const shootingStars: ShootingStar[] = [];
    let shootingStarTimer = graphicsQuality === 'ultra' ? 1.5 : 3.0;

    // Fast passing stars (High & Ultra)
    const fastPassingStars: FastPassingStar[] = graphicsSpecs.enablePassingFastStars
      ? initFastPassingStars(graphicsQuality === 'ultra' ? 18 : 8, width, height)
      : [];

    // Micro cosmic dust particles (Medium, High, Ultra)
    const microDustList: MicroDustParticle[] = graphicsSpecs.dustDensity > 0
      ? initMicroDust(graphicsSpecs.dustDensity, width, height, sceneryConfig.starColors)
      : [];

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      stars = initStarfield(
        Math.min(graphicsSpecs.starCount, Math.floor((width * height) / 6000)),
        width,
        height,
        sceneryConfig.starColors
      );
      starsRef.current = stars;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const norm = normalizeMouseCoordinates(e.clientX, e.clientY, width, height);
      targetMouse.x = norm.x;
      targetMouse.y = norm.y;

      const dx = e.clientX - lastClientX;
      const dy = e.clientY - lastClientY;
      mouseSpeed = Math.sqrt(dx * dx + dy * dy);
      lastClientX = e.clientX;
      lastClientY = e.clientY;

      if (graphicsSpecs.enableStardust && stardustPool.length < MAX_STARDUST && Math.random() < 0.6) {
        stardustPool.push({
          x: e.clientX + (Math.random() * 24 - 12),
          y: e.clientY + (Math.random() * 24 - 12),
          vx: (Math.random() * 2 - 1) * 35,
          vy: (Math.random() * 2 - 1) * 35 + 14,
          size: 1.5 + Math.random() * 2,
          alpha: 1.0,
          life: 0.8 + Math.random() * 0.6,
          maxLife: 1.2,
          color: sceneryConfig.accentColor,
        });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        const norm = normalizeMouseCoordinates(t.clientX, t.clientY, width, height);
        targetMouse.x = norm.x;
        targetMouse.y = norm.y;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    parallaxTiltManager.init();
    let lastTime = performance.now();
    let lastRenderTime = performance.now();
    const frameInterval = 1000 / (fpsTarget || 60);

    const loop = (time: number) => {
      animId = requestAnimationFrame(loop);

      // FPS throttling
      const elapsed = time - lastRenderTime;
      if (elapsed < frameInterval - 1) {
        return;
      }
      lastRenderTime = time - (elapsed % frameInterval);

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      parallaxTiltManager.update(dt);
      const tiltState = parallaxTiltManager.getState();

      smoothMouse.x = lerp(smoothMouse.x, targetMouse.x, 0.05);
      smoothMouse.y = lerp(smoothMouse.y, targetMouse.y, 0.05);

      // Centrifugal handling: strictly turned off in low graphics!
      const centrifugalMultiplier = graphicsSpecs.enableCentrifugal ? 1.0 : 0.0;
      const totalTiltX =
        smoothMouse.x +
        tiltState.tiltX * (graphicsQuality === 'low' ? 0.2 : 0.85) +
        ((tiltState.centrifugalX / 55) * centrifugalMultiplier);
      const totalTiltY =
        smoothMouse.y +
        tiltState.tiltY * (graphicsQuality === 'low' ? 0.2 : 0.85) +
        ((tiltState.centrifugalY / 55) * centrifugalMultiplier);

      mouseSpeed = Math.max(0, mouseSpeed - dt * 150);

      // CSS 3D tilt & perspective with expansive overscan margin so corners never smear or clip
      if (containerRef.current) {
        if (graphicsQuality === 'low') {
          containerRef.current.style.transform = 'scale(1.03)';
        } else {
          const tilt = calculateTiltTransform(totalTiltX, totalTiltY, graphicsQuality === 'ultra' ? 3.5 : 2.8);
          const shiftX = -totalTiltX * (graphicsQuality === 'ultra' ? 14 : 10);
          const shiftY = -totalTiltY * (graphicsQuality === 'ultra' ? 14 : 10);
          // Scale 1.05 and wide perspective pulls the camera slightly back ("khung cảnh xa ra")
          // and ensures that centrifugal sway never exposes unrendered borders or smears corners
          containerRef.current.style.transform = `scale(1.05) translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`;
        }
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // =========================================================================
      // 0. SCENERY VISTA RENDERING
      // =========================================================================
      const centerX = width / 2 + totalTiltX * (graphicsQuality === 'low' ? -5 : -25);
      const centerY = height * 0.42 + totalTiltY * (graphicsQuality === 'low' ? -5 : -25);

      if (sceneryConfig.category === 'galaxy') {
        renderMilkyWayGalaxy(ctx, centerX, centerY, time, sceneryConfig, graphicsQuality, graphicsSpecs);
      } else if (sceneryConfig.category === 'deep_space') {
        renderDeepCosmos(ctx, centerX, centerY, width, height, time, sceneryConfig, graphicsQuality, graphicsSpecs);
      } else if (sceneryConfig.category === 'nebula') {
        renderStellarNebula(ctx, centerX, centerY, time, sceneryConfig, graphicsQuality, graphicsSpecs);
      } else if (sceneryConfig.category === 'aeon_bay') {
        renderAeonBay(ctx, width, height, time, sceneryConfig, totalTiltX, totalTiltY, graphicsQuality, graphicsSpecs);
      } else if (sceneryConfig.category === 'black_hole') {
        renderRelativisticBlackHole(
          ctx,
          centerX,
          centerY,
          time,
          sceneryConfig,
          sceneryConfig.blackHoleColor || 'gold',
          graphicsQuality,
          graphicsSpecs
        );
      }

      // =========================================================================
      // 1. COSMIC SOLAR WIND STREAM (Độ hoạ Cực Cao - Luồng gió vũ trụ)
      // =========================================================================
      if (graphicsSpecs.enableCosmicWind) {
        renderCosmicWind(ctx, width, height, time, sceneryConfig.accentColor);
      }

      // =========================================================================
      // 2. PASSING FAST STARS (Độ hoạ Cao & Cực Cao - Các ngôi sao bay qua)
      // =========================================================================
      if (graphicsSpecs.enablePassingFastStars) {
        for (const fs of fastPassingStars) {
          updateFastPassingStar(fs, dt, width, height);

          ctx.strokeStyle = fs.color;
          ctx.lineWidth = fs.size;
          ctx.globalAlpha = fs.alpha * (graphicsQuality === 'ultra' ? 0.9 : 0.6);

          ctx.beginPath();
          ctx.moveTo(fs.x, fs.y);
          ctx.lineTo(fs.x, fs.y + fs.length);
          ctx.stroke();

          // Small white tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fs.x, fs.y + fs.length, fs.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // =========================================================================
      // 3. SHOOTING STARS (Sao băng - Cắt bỏ hoàn toàn ở độ hoạ thấp)
      // =========================================================================
      if (graphicsSpecs.enableShootingStars) {
        shootingStarTimer -= dt;
        if (shootingStarTimer <= 0) {
          shootingStarTimer = graphicsQuality === 'ultra' ? 1.4 + Math.random() * 2.2 : 3.0 + Math.random() * 4.0;
          const angle = Math.PI / 4 + (Math.random() * 0.3 - 0.15);
          const speed = graphicsQuality === 'ultra' ? 850 + Math.random() * 550 : 600 + Math.random() * 350;
          shootingStars.push({
            x: Math.random() * (width * 0.75),
            y: Math.random() * (height * 0.35),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: graphicsQuality === 'ultra' ? 110 + Math.random() * 90 : 75 + Math.random() * 60,
            alpha: 1.0,
            active: true,
            color: sceneryConfig.accentColor,
          });
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const ss = shootingStars[i];
          ss.x += ss.vx * dt;
          ss.y += ss.vy * dt;
          ss.alpha -= dt * (graphicsQuality === 'ultra' ? 0.8 : 1.0);
          if (ss.alpha <= 0 || ss.x > width + 100 || ss.y > height + 100) {
            shootingStars.splice(i, 1);
            continue;
          }

          const headX = ss.x;
          const headY = ss.y;
          const tailX = headX - (ss.vx / 800) * ss.length;
          const tailY = headY - (ss.vy / 800) * ss.length;

          const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.7, ss.color);
          grad.addColorStop(1, '#ffffff');

          ctx.strokeStyle = grad;
          ctx.lineWidth = graphicsQuality === 'ultra' ? 3.0 : 2.0;
          ctx.globalAlpha = Math.max(0, ss.alpha);
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.stroke();

          // Blazing tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(headX, headY, graphicsQuality === 'ultra' ? 3.5 : 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // =========================================================================
      // 4. MULTI-LAYER STAR PARTICLES WITH 3D PARALLAX
      // =========================================================================
      const maxParallax = graphicsQuality === 'low' ? 8 : 40;
      const speedFactor = graphicsQuality === 'low' ? 0.7 : 1.0 + Math.min(mouseSpeed * 0.005, 1.5);

      for (const star of stars) {
        updateStar(star, dt, width, height, speedFactor);

        const { offsetX, offsetY } = calculateParallaxOffset(
          totalTiltX,
          totalTiltY,
          star.depth,
          maxParallax
        );

        const renderX = star.x + offsetX;
        const renderY = star.y + offsetY;

        if (renderX < -10 || renderX > width + 10 || renderY < -10 || renderY > height + 10) {
          continue;
        }

        ctx.globalAlpha = graphicsQuality === 'low' ? star.baseAlpha * 0.8 : star.alpha;
        ctx.fillStyle = star.color;

        // Cut off glowing spikes completely on low graphics
        if (graphicsSpecs.enableDiffractionSpikes && star.depth > 0.78) {
          if (star.hasCrossFlare) {
            renderDiffractionSpike(ctx, renderX, renderY, star.size * 1.8, star.color, star.alpha);
          } else {
            ctx.beginPath();
            ctx.arc(renderX, renderY, star.size, 0, Math.PI * 2);
            ctx.fill();

            if (graphicsSpecs.enableGlowFilters) {
              ctx.globalAlpha = star.alpha * 0.4;
              ctx.beginPath();
              ctx.arc(renderX, renderY, star.size * 2.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else {
          ctx.fillRect(renderX, renderY, star.size, star.size);
        }
      }

      // =========================================================================
      // 5. MICRO DUST PARTICLES (Độ hoạ Cực Cao & Cao - Hạt bụi li ti nhảy múa)
      // =========================================================================
      if (microDustList.length > 0) {
        for (const dust of microDustList) {
          updateMicroDust(dust, dt, width, height, 1.0);

          ctx.fillStyle = dust.color;
          ctx.globalAlpha = dust.alpha * (graphicsQuality === 'ultra' ? 0.85 : 0.5);
          ctx.beginPath();
          ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // =========================================================================
      // 6. INTERACTIVE STARDUST SPARKS (Vệt sáng tương tác theo chuột)
      // =========================================================================
      if (graphicsSpecs.enableStardust) {
        for (let i = stardustPool.length - 1; i >= 0; i--) {
          const sp = stardustPool[i];
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.life -= dt;
          sp.alpha = Math.max(0, sp.life / sp.maxLife);

          if (sp.life <= 0) {
            stardustPool.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = sp.alpha * 0.85;
          ctx.fillStyle = sp.color;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [activeScenery, graphicsQuality, fpsTarget]);

  return (
    <div
      ref={containerRef}
      className={`absolute -inset-10 sm:-inset-16 pointer-events-none overflow-hidden z-0 transition-opacity duration-300 ease-out ${
        transitionFade ? 'opacity-85' : 'opacity-100'
      }`}
      style={{ perspective: graphicsQuality === 'low' ? undefined : 1400 }}
    >
      {/* Dynamic Ambient Nebulae reflecting current Scenery (Filtered by graphics quality) */}
      {graphicsQuality !== 'low' && (
        <>
          <div
            className={`absolute -top-32 -left-32 w-96 sm:w-[560px] h-96 sm:h-[560px] rounded-full pointer-events-none transition-all duration-700 ease-out ${
              graphicsQuality === 'ultra'
                ? 'blur-[115px] opacity-75'
                : graphicsQuality === 'high'
                ? 'blur-[95px] opacity-50'
                : 'blur-[60px] opacity-25'
            }`}
            style={{ backgroundColor: sceneryConfig.primaryColor }}
          />
          <div
            className={`absolute -bottom-40 -right-40 w-96 sm:w-[680px] h-96 sm:h-[680px] rounded-full pointer-events-none transition-all duration-700 ease-out ${
              graphicsQuality === 'ultra'
                ? 'blur-[125px] opacity-65'
                : graphicsQuality === 'high'
                ? 'blur-[100px] opacity-40'
                : 'blur-[70px] opacity-20'
            }`}
            style={{ backgroundColor: sceneryConfig.secondaryColor }}
          />
          {graphicsQuality === 'ultra' && (
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-out opacity-45"
              style={{ backgroundColor: sceneryConfig.accentColor }}
            />
          )}
        </>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

/// =============================================================================
// SCENERY RENDERERS
// =============================================================================

/**
 * 1. Dải Ngân Hà (Photorealistic Grand Spiral Milky Way Galaxy)
 * "dãi ngân hà thì làm hìng xoáy ốc với nhiều chấm li ti nhỏ giống y ngoài đời đi"
 */
function renderMilkyWayGalaxy(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  config: typeof SCENERY_CONFIGS['galaxy'],
  quality: GraphicsQuality,
  specs: ReturnType<typeof getGraphicsSpecs>
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Dynamic realistic elliptical tilt angle (~58 deg inclination like Andromeda M31 / Whirlpool M51)
  const galaxyAngle = 0.44;
  const slowRot = time * 0.00006;
  ctx.rotate(galaxyAngle + slowRot);

  // Compression factor for realistic tilted disc perspective
  const aspectY = 0.44;

  // Galaxy Scale: Large, majestic, filling the space panorama
  const maxGalaxyR = quality === 'ultra' ? 520 : quality === 'high' ? 440 : quality === 'medium' ? 360 : 260;
  const bulgeRadius = quality === 'ultra' ? 160 : quality === 'high' ? 130 : 100;

  // 1. Core Volumetric God Rays (Ánh sáng chiếu từ tâm dải ngân hà ở Cao & Cực Cao)
  if (specs.enableGodRays) {
    renderVolumetricGodRays(
      ctx,
      0,
      0,
      time,
      '#fef08a',
      specs.godRayIntensity === 'ultra' ? 0.42 : 0.22,
      maxGalaxyR * 1.1,
      aspectY
    );
  }

  // 2. Diffuse Galactic Disc Base Glow (Ánh sáng mờ mờ toàn đĩa thiên hà)
  const discGrad = ctx.createRadialGradient(0, 0, bulgeRadius * 0.2, 0, 0, maxGalaxyR);
  discGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  discGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.22)');
  discGrad.addColorStop(0.45, 'rgba(6, 182, 212, 0.16)');
  discGrad.addColorStop(0.75, 'rgba(139, 92, 246, 0.08)');
  discGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, maxGalaxyR, maxGalaxyR * aspectY, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Central Galactic Bulge & Supermassive Nucleus (Lõi sáng ngân hà bừng nở)
  const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, bulgeRadius);
  coreGrad.addColorStop(0, '#ffffff'); // Blinding white central singularity
  coreGrad.addColorStop(0.12, '#fffef0');
  coreGrad.addColorStop(0.25, '#fef08a'); // Warm old K/M giant star population
  coreGrad.addColorStop(0.5, '#06b6d488'); // Interstellar ionization front
  coreGrad.addColorStop(0.8, '#8b5cf633');
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, bulgeRadius, bulgeRadius * (aspectY * 1.15), 0, 0, Math.PI * 2);
  ctx.fill();

  // Ultra Bloom: Multi-tier radiant corona on ultra graphics
  if (specs.bloomIntensity === 'ultra') {
    const coronaGrad = ctx.createRadialGradient(0, 0, bulgeRadius * 0.4, 0, 0, bulgeRadius * 2.2);
    coronaGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    coronaGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.32)');
    coronaGrad.addColorStop(0.6, 'rgba(6, 182, 212, 0.2)');
    coronaGrad.addColorStop(0.85, 'rgba(139, 92, 246, 0.1)');
    coronaGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, bulgeRadius * 2.2, bulgeRadius * 2.2 * aspectY, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Dense Grand-Design Logarithmic Spiral Arms with thousands of tiny pinpoint stars (Chấm li ti)
  // Two major arms (Perseus & Scutum-Centaurus) + two bridge spurs (Carina-Sagittarius & Orion)
  const arms = [
    { offset: 0, tightness: 2.8, maxR: maxGalaxyR, weight: 1.0, dustLane: true },
    { offset: Math.PI, tightness: 2.8, maxR: maxGalaxyR, weight: 1.0, dustLane: true },
    { offset: 0.72, tightness: 2.4, maxR: maxGalaxyR * 0.78, weight: 0.65, dustLane: false },
    { offset: Math.PI + 0.72, tightness: 2.4, maxR: maxGalaxyR * 0.78, weight: 0.65, dustLane: false },
  ];

  const totalDotsPerArm =
    quality === 'ultra' ? 520 : quality === 'high' ? 320 : quality === 'medium' ? 160 : 60;

  // Stellar population classification colors (OB blue giants, solar G-stars, pink H-II nebular knots)
  const starTypes = [
    '#ffffff', // Brilliant blue-white young stars
    '#bae6fd',
    '#7dd3fc',
    '#38bdf8',
    '#fef08a', // Warm yellow giants
    '#fed7aa',
    '#f43f5e', // Hot pink H-II star-forming emission nebulae (Orion-like knots)
    '#fb7185',
    '#ec4899',
  ];

  // Draw Dark Interstellar Dust Lanes FIRST (Dải bụi đen liên sao chạy theo mép trong các nhánh xoắn)
  if (quality !== 'low') {
    ctx.save();
    arms.filter(a => a.dustLane).forEach((arm) => {
      ctx.beginPath();
      const laneSteps = quality === 'ultra' ? 65 : 40;
      for (let i = 0; i < laneSteps; i++) {
        const t = i / laneSteps;
        // Inner edge offset of spiral arm
        const pt = calculateLogarithmicSpiralPoint(arm.offset - 0.18, t, arm.tightness, 22, arm.maxR * 0.95);
        const dx = pt.x;
        const dy = pt.y * aspectY;
        if (i === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      }
      ctx.lineWidth = quality === 'ultra' ? 18 : 12;
      ctx.strokeStyle = quality === 'ultra' ? 'rgba(3, 7, 18, 0.65)' : 'rgba(3, 7, 18, 0.45)';
      ctx.stroke();
    });
    ctx.restore();
  }

  // Draw Spiral Arms Stars (Chấm li ti)
  arms.forEach((arm) => {
    const dotsCount = Math.floor(totalDotsPerArm * arm.weight);

    for (let i = 0; i < dotsCount; i++) {
      const t = i / dotsCount;
      const pt = calculateLogarithmicSpiralPoint(arm.offset, t, arm.tightness, 18, arm.maxR);

      // Realistic Gaussian-like radial spread across spiral arm cross-section
      const spread = (16 + t * 45) * (Math.sin(i * 17.3) * 0.7 + Math.cos(i * 11.3) * 0.3);
      const normalAngle = pt.angle + Math.PI / 2;
      const sx = pt.x + Math.cos(normalAngle) * spread;
      const sy = (pt.y + Math.sin(normalAngle) * spread) * aspectY;

      // Twinkle & alpha
      const dotAlpha = (1 - t * 0.5) * (0.35 + Math.sin(time * 0.003 + i * 2.1) * 0.35);
      const colIdx = (i * 3 + (arm.offset > 1 ? 2 : 0)) % starTypes.length;
      ctx.fillStyle = starTypes[colIdx];
      ctx.globalAlpha = Math.max(0.12, dotAlpha);

      // Micro star dot sizes: chấm li ti nhỏ xíu như ảnh chụp Hubble/Webb (0.7px - 1.8px)
      const isNebulaKnot = i % 18 === 0 && starTypes[colIdx].startsWith('#f');
      const dotSize =
        isNebulaKnot
          ? (quality === 'ultra' ? 3.0 : 2.2)
          : quality === 'ultra' && i % 15 === 0
          ? 2.0
          : quality !== 'low' && i % 8 === 0
          ? 1.4
          : 0.85;

      ctx.beginPath();
      ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow for large H-II nebula knots
      if (isNebulaKnot && quality !== 'low') {
        ctx.globalAlpha = dotAlpha * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, dotSize * 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // 5. Globular Clusters & Outer Galactic Halo Stars
  const haloCount = quality === 'ultra' ? 120 : quality === 'high' ? 65 : 25;
  for (let h = 0; h < haloCount; h++) {
    const hAngle = (h * 137.5077 * Math.PI) / 180;
    const hDist = 90 + (h * 5.1) % (maxGalaxyR * 1.15);
    const hx = Math.cos(hAngle) * hDist;
    const hy = Math.sin(hAngle) * (hDist * 0.68);
    ctx.fillStyle = h % 3 === 0 ? '#fef08a' : '#ffffff';
    ctx.globalAlpha = 0.22 + Math.sin(time * 0.003 + h) * 0.22;
    ctx.beginPath();
    ctx.arc(hx, hy, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 2. Vũ Trụ Thâm Uyên (Deep Space Cosmos, Giant Gas Planet & Quasars)
 */
function renderDeepCosmos(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  time: number,
  config: typeof SCENERY_CONFIGS['deep_space'],
  quality: GraphicsQuality,
  specs: ReturnType<typeof getGraphicsSpecs>
) {
  ctx.save();

  // 1. Majestic Ringed Giant Gas Planet hanging in the upper right
  const planetX = cx + (w > 640 ? 210 : 110);
  const planetY = cy - (h > 600 ? 60 : 30);
  const planetR = w > 640 ? 88 : 62;

  // Volumetric planetary god-rays in High & Ultra
  if (specs.enableGodRays) {
    renderVolumetricGodRays(
      ctx,
      planetX - planetR * 0.45,
      planetY - planetR * 0.45,
      time,
      '#60a5fa',
      specs.godRayIntensity === 'ultra' ? 0.38 : 0.2,
      280,
      1.0
    );
  }

  // Behind-planet Ring half
  ctx.save();
  ctx.translate(planetX, planetY);
  ctx.rotate(-0.35);
  ctx.scale(1, 0.28);
  ctx.beginPath();
  ctx.arc(0, 0, planetR * 2.3, Math.PI, Math.PI * 2);
  ctx.arc(0, 0, planetR * 1.35, Math.PI * 2, Math.PI, true);
  ctx.fillStyle = 'rgba(186, 230, 253, 0.42)';
  ctx.fill();
  ctx.restore();

  // Planet body with atmospheric band gradients
  ctx.save();
  ctx.beginPath();
  ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
  ctx.clip();

  const planetGrad = ctx.createRadialGradient(
    planetX - planetR * 0.45,
    planetY - planetR * 0.45,
    planetR * 0.1,
    planetX,
    planetY,
    planetR
  );
  planetGrad.addColorStop(0, '#67e8f9');
  planetGrad.addColorStop(0.35, '#0284c7');
  planetGrad.addColorStop(0.75, '#0f172a');
  planetGrad.addColorStop(1, '#020617');
  ctx.fillStyle = planetGrad;
  ctx.fillRect(planetX - planetR, planetY - planetR, planetR * 2, planetR * 2);

  // Cloud bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let b = -3; b <= 3; b++) {
    ctx.fillRect(planetX - planetR, planetY + b * 15, planetR * 2, 8);
  }
  ctx.restore();

  // Front-half Ring
  ctx.save();
  ctx.translate(planetX, planetY);
  ctx.rotate(-0.35);
  ctx.scale(1, 0.28);
  ctx.beginPath();
  ctx.arc(0, 0, planetR * 2.3, 0, Math.PI);
  ctx.arc(0, 0, planetR * 1.35, Math.PI, 0, true);
  ctx.fillStyle = 'rgba(186, 230, 253, 0.42)';
  ctx.fill();
  ctx.restore();

  // Atmospheric rim scattering glow
  ctx.save();
  ctx.beginPath();
  ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  // 2. Distant Deep Space Quasars and Galaxies
  const quasarX = cx - (w > 640 ? 210 : 120);
  const quasarY = cy + 45;
  const qGrad = ctx.createRadialGradient(quasarX, quasarY, 2, quasarX, quasarY, 130);
  qGrad.addColorStop(0, '#ffffff');
  qGrad.addColorStop(0.3, 'rgba(147, 197, 253, 0.55)');
  qGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.22)');
  qGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = qGrad;
  ctx.beginPath();
  ctx.arc(quasarX, quasarY, 130, 0, Math.PI * 2);
  ctx.fill();

  if (specs.enableDiffractionSpikes) {
    renderDiffractionSpike(ctx, quasarX, quasarY, 75, '#93c5fd', 0.75);
  }

  ctx.restore();
}

/**
 * 3. Sao Tinh Vân Orion (Volumetric Pillars of Creation & Cosmic Nursery)
 */
function renderStellarNebula(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  config: typeof SCENERY_CONFIGS['nebula'],
  quality: GraphicsQuality,
  specs: ReturnType<typeof getGraphicsSpecs>
) {
  ctx.save();
  ctx.translate(cx, cy);

  // Volumetric light shafts breaking through nebula rifts
  if (specs.enableGodRays) {
    renderVolumetricGodRays(
      ctx,
      0,
      -25,
      time,
      '#f43f5e',
      specs.godRayIntensity === 'ultra' ? 0.36 : 0.18,
      270,
      0.82
    );
  }

  // Multi-tier luminous ionization gas clouds
  const clouds = [
    { x: -90, y: -60, r: 240, c1: '#ec489999', c2: '#8b5cf655', c3: '#3b82f622' },
    { x: 110, y: 50, r: 250, c1: '#f43f5e88', c2: '#c084fc44', c3: '#1e1b4b11' },
    { x: -15, y: 80, r: 210, c1: '#a855f777', c2: '#06b6d433', c3: '#0f172a00' },
  ];

  clouds.forEach((cl) => {
    const pulse = 1 + Math.sin(time * 0.001 + cl.x) * 0.04;
    const g = ctx.createRadialGradient(cl.x, cl.y, 10, cl.x, cl.y, cl.r * pulse);
    g.addColorStop(0, cl.c1);
    g.addColorStop(0.5, cl.c2);
    g.addColorStop(0.85, cl.c3);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cl.x, cl.y, cl.r * pulse, 0, Math.PI * 2);
    ctx.fill();
  });

  // Pillars of cosmic dust (Dark tendril silhouettes)
  if (quality !== 'low') {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 4, 20, 0.45)';
    [-70, 20, 95].forEach((px, idx) => {
      ctx.beginPath();
      ctx.moveTo(px - 25, 180);
      ctx.quadraticCurveTo(px + Math.sin(time * 0.001 + idx) * 10, 35, px, -70 - idx * 22);
      ctx.quadraticCurveTo(px + 28, 45, px + 28, 180);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  // Newborn protostars with bright diffraction spikes
  const numProtostars = quality === 'ultra' ? 32 : quality === 'high' ? 18 : 8;
  for (let i = 0; i < numProtostars; i++) {
    const sx = Math.sin(i * 4.3) * 160;
    const sy = Math.cos(i * 3.7) * 95;
    const pAlpha = 0.5 + Math.sin(time * 0.003 + i) * 0.45;
    ctx.fillStyle = i % 2 === 0 ? '#fbcfe8' : '#e0e7ff';
    ctx.globalAlpha = pAlpha;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (specs.enableDiffractionSpikes && i % 3 === 0) {
      renderDiffractionSpike(ctx, sx, sy, 24, '#f472b6', pAlpha * 0.88);
    }
  }

  ctx.restore();
}

/**
 * 4. Vịnh Aeon Huyền Bí (Aeon Bay / Cosmic Ocean Lagoon & Auroras)
 */
function renderAeonBay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  config: typeof SCENERY_CONFIGS['aeon_bay'],
  tiltX: number,
  tiltY: number,
  quality: GraphicsQuality,
  specs: ReturnType<typeof getGraphicsSpecs>
) {
  ctx.save();
  const horizonY = h * 0.65 + tiltY * -15;

  // Luminous rising celestial moon on the horizon
  const moonX = w * 0.74 + tiltX * -20;
  const moonY = horizonY - 120;
  const moonR = 54;

  if (specs.enableGodRays) {
    renderVolumetricGodRays(
      ctx,
      moonX,
      moonY,
      time,
      config.accentColor,
      specs.godRayIntensity === 'ultra' ? 0.35 : 0.18,
      250,
      1.0
    );
  }

  const moonGrad = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, moonR);
  moonGrad.addColorStop(0, '#ffffff');
  moonGrad.addColorStop(0.4, config.accentColor);
  moonGrad.addColorStop(0.8, config.primaryColor);
  moonGrad.addColorStop(1, `${config.secondaryColor}00`);
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  // Multi-frequency undulating auroral ribbons (Cực quang vũ trụ uốn lượn)
  const numRibbons = quality === 'ultra' ? 6 : quality === 'high' ? 4 : 2;
  for (let r = 0; r < numRibbons; r++) {
    const waveFreq = 0.0032 + r * 0.0018;
    const waveSpeed = time * 0.0012 * (r % 2 === 0 ? 1 : -1);
    const yBase = horizonY - r * 46;

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, yBase);

    for (let x = 0; x <= w; x += 25) {
      const y = yBase + Math.sin(x * waveFreq + waveSpeed) * (26 + r * 14);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, yBase - 70, 0, h);
    const alpha = 0.32 - r * 0.045;
    grad.addColorStop(0, `${config.accentColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
    grad.addColorStop(0.5, `${config.primaryColor}${Math.floor(alpha * 190).toString(16).padStart(2, '0')}`);
    grad.addColorStop(1, 'rgba(3, 7, 18, 0)');

    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Shimmering reflection glints on ocean surface
  const numGlints = quality === 'ultra' ? 50 : quality === 'high' ? 30 : 12;
  for (let g = 0; g < numGlints; g++) {
    const gx = (g * 97) % w;
    const gy = horizonY + 15 + ((g * 37) % (h - horizonY - 30));
    const glintAlpha = 0.3 + Math.sin(time * 0.004 + g) * 0.4;
    ctx.fillStyle = '#a7f3d0';
    ctx.globalAlpha = Math.max(0, glintAlpha);
    ctx.fillRect(gx, gy, quality === 'ultra' ? 2.5 : 2, quality === 'ultra' ? 2.5 : 2);
  }

  ctx.restore();
}

/**
 * 5. Hố Đen Relativistic (Relativistic Black Hole with Einstein Gravitational Lensing)
 */
function renderRelativisticBlackHole(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  config: typeof SCENERY_CONFIGS['black_hole_gold'],
  bhColor: string,
  quality: GraphicsQuality,
  specs: ReturnType<typeof getGraphicsSpecs>
) {
  ctx.save();
  ctx.translate(cx, cy);

  const primaryCol = config.primaryColor;
  const accentCol = config.accentColor;
  const rHole = 56; // Event Horizon Radius

  // Volumetric relativistic jet radiation in High & Ultra
  if (specs.enableGodRays) {
    renderVolumetricGodRays(
      ctx,
      0,
      0,
      time,
      accentCol,
      specs.godRayIntensity === 'ultra' ? 0.42 : 0.22,
      280,
      0.65
    );
  }

  // 1. Polar Relativistic Plasma Jets with Helical Spirals
  const jetLength = quality === 'ultra' ? 290 : quality === 'high' ? 220 : 130;
  [-1, 1].forEach((dir) => {
    const jetGrad = ctx.createLinearGradient(0, 0, 0, dir * jetLength);
    jetGrad.addColorStop(0, '#ffffff');
    jetGrad.addColorStop(0.2, accentCol);
    jetGrad.addColorStop(0.65, `${primaryCol}55`);
    jetGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = jetGrad;
    ctx.beginPath();
    ctx.moveTo(-8, dir * (rHole * 0.45));
    ctx.lineTo(0, dir * jetLength);
    ctx.lineTo(8, dir * (rHole * 0.45));
    ctx.closePath();
    ctx.fill();

    // Helical magnetic field particle spiral
    if (quality === 'ultra') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let s = 0; s < 45; s++) {
        const sy = dir * (s * 6.2);
        const sx = Math.sin(time * 0.005 + s * 0.4) * (7 + s * 0.28);
        if (s === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
  });

  // 2. Gravitational Lensed Light Arc (Einstein Ring Upper Arc)
  ctx.save();
  const upperLensingGrad = ctx.createRadialGradient(0, -15, rHole * 0.8, 0, -15, rHole * 2.5);
  upperLensingGrad.addColorStop(0, 'rgba(0,0,0,0)');
  upperLensingGrad.addColorStop(0.35, '#ffffff');
  upperLensingGrad.addColorStop(0.65, accentCol);
  upperLensingGrad.addColorStop(0.88, `${primaryCol}55`);
  upperLensingGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = upperLensingGrad;
  ctx.beginPath();
  ctx.ellipse(0, -18, rHole * 2.3, rHole * 1.45, 0, Math.PI, 0);
  ctx.fill();
  ctx.restore();

  // 3. Gravitational Lensed Light Arc (Einstein Ring Lower Arc)
  ctx.save();
  const lowerLensingGrad = ctx.createRadialGradient(0, 15, rHole * 0.8, 0, 15, rHole * 2.2);
  lowerLensingGrad.addColorStop(0, 'rgba(0,0,0,0)');
  lowerLensingGrad.addColorStop(0.45, `${primaryCol}99`);
  lowerLensingGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lowerLensingGrad;
  ctx.beginPath();
  ctx.ellipse(0, 15, rHole * 2.0, rHole * 1.1, 0, 0, Math.PI);
  ctx.fill();
  ctx.restore();

  // 4. Slanted Accretion Disk with Doppler Boosting (Approaching left side is brilliant white)
  ctx.save();
  ctx.rotate(-0.16);

  const diskGrad = ctx.createLinearGradient(-rHole * 3.2, 0, rHole * 3.2, 0);
  diskGrad.addColorStop(0, 'rgba(0,0,0,0)');
  diskGrad.addColorStop(0.18, '#ffffff'); // Doppler boosted side
  diskGrad.addColorStop(0.35, accentCol);
  diskGrad.addColorStop(0.65, `${primaryCol}aa`);
  diskGrad.addColorStop(0.88, `${primaryCol}33`);
  diskGrad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = diskGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rHole * 3.3, rHole * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Relativistic Photon Sphere (Razor-sharp glowing sphere)
  const photonPulse = 1 + Math.sin(time * 0.005) * 0.03;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = quality === 'ultra' ? 3.2 : 2.2;
  ctx.beginPath();
  ctx.arc(0, 0, (rHole + 3) * photonPulse, 0, Math.PI * 2);
  ctx.stroke();

  // 6. Central Event Horizon Shadow (PITCH BLACK - Nothing escapes)
  ctx.fillStyle = '#010308';
  ctx.beginPath();
  ctx.arc(0, 0, rHole, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Volumetric God Rays (Ánh sáng chiếu từ tâm phong cảnh / hành tinh)
 */
function renderVolumetricGodRays(
  ctx: CanvasRenderingContext2D,
  originX: number,
  originY: number,
  time: number,
  color: string,
  maxAlpha: number,
  radius: number,
  aspectY: number = 1.0
) {
  ctx.save();
  ctx.translate(originX, originY);
  ctx.scale(1, aspectY);

  const rayCount = 10;
  const rot = time * 0.00012;

  for (let i = 0; i < rayCount; i++) {
    const angle = rot + (i * Math.PI * 2) / rayCount;
    const beamWidth = 0.24 + Math.sin(time * 0.002 + i) * 0.08;

    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
    grad.addColorStop(0, `${color}cc`);
    grad.addColorStop(0.35, `${color}44`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.globalAlpha = maxAlpha * (0.6 + Math.sin(time * 0.0028 + i * 1.6) * 0.4);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, angle - beamWidth, angle + beamWidth);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Cosmic Solar Wind Streams (Luồng gió vũ trụ ở Độ Hoạ Cực Cao)
 */
function renderCosmicWind(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  accentColor: string
) {
  ctx.save();

  const streams = [
    { yRatio: 0.22, speed: 50, amp: 26, freq: 0.0022, alpha: 0.24 },
    { yRatio: 0.46, speed: 75, amp: 35, freq: 0.0028, alpha: 0.28 },
    { yRatio: 0.70, speed: 42, amp: 28, freq: 0.0019, alpha: 0.22 },
  ];

  streams.forEach((st, idx) => {
    const yBase = h * st.yRatio;
    const shift = (time * 0.001 * st.speed) % w;

    ctx.beginPath();
    for (let x = 0; x <= w; x += 25) {
      const y = yBase + Math.sin((x + shift) * st.freq + idx) * st.amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    const windGrad = ctx.createLinearGradient(0, 0, w, 0);
    windGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    windGrad.addColorStop(0.3, `${accentColor}55`);
    windGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.45)');
    windGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.strokeStyle = windGrad;
    ctx.lineWidth = 4.2;
    ctx.globalAlpha = st.alpha;
    ctx.stroke();
  });

  ctx.restore();
}

