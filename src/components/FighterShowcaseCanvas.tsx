/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React,{ useEffect,useRef } from 'react';
import { FighterStats } from '../game/rules';
import { DroneData } from '../game/drones';
import { GraphicsQuality } from '../game/lobbySettings';
import {
createHangarParticlePool,
updateHangarParticles,
renderHangarParticles,
HangarParticleTheme,
} from '../game/hangarParticles';
import { drawFighterSprite } from '../game/fighterSpriteRenderer';

interface FighterShowcaseCanvasProps {
  fighter: FighterStats;
  starCount?: number;
  width?: number;
  height?: number;
  slot1Drone?: DroneData | null;
  slot2Drone?: DroneData | null;
  onDroneClick?: (slot: 1 | 2) => void;
  graphicsQuality?: GraphicsQuality;
  activeSkinId?: string | null;
}

export const FighterShowcaseCanvas: React.FC<FighterShowcaseCanvasProps> = ({
  fighter,
  starCount = 1,
  width = 320,
  height = 190,
  slot1Drone = null,
  slot2Drone = null,
  graphicsQuality = 'high',
  activeSkinId = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeSkinRef = useRef(activeSkinId);
  activeSkinRef.current = activeSkinId;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const f = fighter;

    // Subtle atmospheric hangar particles pool (dust motes & maintenance/ion sparks)
    const particleCount =
      graphicsQuality === 'ultra'
        ? 34
        : graphicsQuality === 'high'
        ? 24
        : graphicsQuality === 'medium'
        ? 15
        : 8;

    const getHangarTheme = (): HangarParticleTheme => {
      const skin = activeSkinRef.current;
      if (skin === 'skin_lx88_vampire') {
        return {
          primary: '#e11d48',
          accent: '#fda4af',
          glow: 'rgba(225, 29, 72, 0.55)',
        };
      }
      if (skin === 'skin_lx88_royal_gold' || skin === 'skin_golden_sovereign') {
        return {
          primary: '#fde047',
          accent: '#f59e0b',
          glow: 'rgba(251, 191, 36, 0.5)',
        };
      }
      if (skin === 'skin_solaris_cyberpunk') {
        return {
          primary: '#ff007f',
          accent: '#00f2fe',
          glow: 'rgba(255, 0, 127, 0.5)',
        };
      }
      if (skin === 'skin_astraea_sakura') {
        return {
          primary: '#f472b6',
          accent: '#fb7185',
          glow: 'rgba(244, 114, 182, 0.5)',
        };
      }
      if (skin === 'skin_rts88_ark_one') {
        return {
          primary: '#ff0033',
          accent: '#ffffff',
          glow: 'rgba(255, 0, 51, 0.75)',
        };
      }
      if (skin === 'skin_rts88_neon_violet') {
        return {
          primary: '#a855f7',
          accent: '#d946ef',
          glow: 'rgba(168, 85, 247, 0.65)',
        };
      }
      if (skin === 'skin_chrono_void') {
        return {
          primary: '#a855f7',
          accent: '#22d3ee',
          glow: 'rgba(168, 85, 247, 0.5)',
        };
      }
      if (skin === 'skin_apocalypse_inferno') {
        return {
          primary: '#dc2626',
          accent: '#f97316',
          glow: 'rgba(220, 38, 38, 0.5)',
        };
      }
      if (skin === 'skin_victory_valkyrie') {
        return {
          primary: '#e2e8f0',
          accent: '#38bdf8',
          glow: 'rgba(226, 232, 240, 0.5)',
        };
      }
      if (skin === 'skin_dragon_mecha') {
        return {
          primary: '#10b981',
          accent: '#06b6d4',
          glow: 'rgba(16, 185, 129, 0.5)',
        };
      }
      return {
        primary: f.color || '#38bdf8',
        accent: f.accentColor || '#facc15',
        glow: 'rgba(56, 189, 248, 0.35)',
      };
    };

    const hangarParticles = createHangarParticlePool(
      particleCount,
      width,
      height,
      getHangarTheme()
    );

    let lastTime = performance.now();

    const render = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Update and render background layer of particles
      if (graphicsQuality !== 'low') {
        updateHangarParticles(hangarParticles, dt, width, height);
        renderHangarParticles(ctx, hangarParticles, 'back');
      }

      // Gentle floating bob
      const hoverY = Math.sin(now * 0.002) * 5;
      const hoverTilt = Math.sin(now * 0.0015) * 0.03;

      ctx.save();
      ctx.translate(width / 2, height / 2 + hoverY);
      ctx.rotate(hoverTilt);

      // Star Grade Under-glow
      if (starCount > 1) {
        const starAuraColor =
          starCount >= 6
            ? 'rgba(239, 68, 68, 0.25)'
            : starCount >= 5
            ? 'rgba(168, 85, 247, 0.25)'
            : starCount >= 4
            ? 'rgba(251, 191, 36, 0.22)'
            : starCount >= 3
            ? 'rgba(56, 189, 248, 0.2)'
            : 'rgba(16, 185, 129, 0.18)';

        ctx.save();
        const auraPulse = (Math.sin(now * 0.003) + 1) * 0.5;
        const rad = 42 + auraPulse * 8;
        const grad = ctx.createRadialGradient(0, 4, 10, 0, 4, rad);
        grad.addColorStop(0, starAuraColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 4, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Render Escort Drones if equipped
      if (slot1Drone) {
        ctx.save();
        const d1Float = Math.sin(now * 0.0025) * 4;
        ctx.translate(-58, 8 + d1Float);
        renderShowcaseDrone(ctx, slot1Drone, now);
        ctx.restore();
      }

      if (slot2Drone) {
        ctx.save();
        const d2Float = Math.cos(now * 0.0023) * 4;
        ctx.translate(58, 8 + d2Float);
        renderShowcaseDrone(ctx, slot2Drone, now);
        ctx.restore();
      }

      // 3. Render Unified Fighter Sprite (100% parity with Combat Match)
      drawFighterSprite(ctx, {
        fighter: f,
        activeSkinId: activeSkinRef.current,
        now,
        isHitFlash: false,
        scale: 1.0,
        isShowcase: true,
      });

      // Wingtip Strobes
      const strobeAlpha = (Math.sin(now * 0.01) + 1) * 0.5;
      ctx.fillStyle = f.accentColor || f.color;
      ctx.globalAlpha = strobeAlpha;
      ctx.beginPath();
      ctx.arc(-22, 10, 2.2, 0, Math.PI * 2);
      ctx.arc(22, 10, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      ctx.restore();

      // Render foreground layer of hangar particles (depth)
      if (graphicsQuality !== 'low') {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        renderHangarParticles(ctx, hangarParticles, 'front');
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [fighter, starCount, width, height, slot1Drone, slot2Drone, graphicsQuality]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] pointer-events-none"
      style={{ width, height }}
    />
  );
};

/**
 * Renders a miniature escort wingman drone in the lobby showcase
 */
function renderShowcaseDrone(
  ctx: CanvasRenderingContext2D,
  drone: DroneData,
  now: number
) {
  const pulse = Math.sin(now * 0.006) * 0.3 + 0.7;

  // Drone Thruster flame
  const tGrad = ctx.createLinearGradient(0, 8, 0, 16);
  tGrad.addColorStop(0, '#ffffff');
  tGrad.addColorStop(0.4, drone.color);
  tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = tGrad;
  ctx.beginPath();
  ctx.moveTo(-3, 8);
  ctx.lineTo(3, 8);
  ctx.lineTo(0, 15 + pulse * 3);
  ctx.closePath();
  ctx.fill();

  // Drone Chassis
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = drone.color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(8, -4);
  ctx.lineTo(12, 6);
  ctx.lineTo(4, 8);
  ctx.lineTo(0, 6);
  ctx.lineTo(-4, 8);
  ctx.lineTo(-12, 6);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Core
  ctx.fillStyle = drone.accentColor || '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
}
