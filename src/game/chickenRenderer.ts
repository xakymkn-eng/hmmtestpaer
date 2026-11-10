/**
 * Galactic Armada Warship & Colossal Void Dreadnought Procedural Renderer
 * Replaces cartoon chicken invaders with high-tech interstellar warships,
 * heavy battlecruisers, plasma torpedoes, and quantum energy core fuel cells.
 */

import { Enemy,Bullet,Pickup } from './SkyVanguardEngine';

/**
 * Draws a High-Tech Sci-Fi Combat Warship (Chiến Tàu Vũ Trụ Tối Tân)
 * Features aerodynamic stealth alloy hull, glowing tech panel lines,
 * twin blazing ion thruster exhaust plumes, wingtip railgun cannons,
 * cockpit sensor visor, and dynamic banking motion (no bird flapping or talons!).
 */
export function drawChickenInvader(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const isHitFlash = e.hitFlashTimer > 0;
  const time = e.timeAlive;
  const variant = e.chickenVariant || 0;
  // Dynamic subtle aerodynamic bank / roll angle (micro-yaw, NOT bird wing flapping!)
  const bank = Math.sin(time * 4) * 0.08;

  ctx.save();
  ctx.rotate(bank);

  // Variant Color Palette
  const palette = [
    { primary: '#0ea5e9', secondary: '#0284c7', trim: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)' }, // 0: Cyan Interceptor
    { primary: '#ef4444', secondary: '#991b1b', trim: '#f87171', glow: 'rgba(239, 68, 68, 0.5)' }, // 1: Crimson Assault Frigate
    { primary: '#f59e0b', secondary: '#b45309', trim: '#fbbf24', glow: 'rgba(245, 158, 11, 0.5)' }, // 2: Solar Strike Gunship
    { primary: '#10b981', secondary: '#047857', trim: '#34d399', glow: 'rgba(16, 185, 129, 0.5)' }, // 3: Toxic Bio-Alloy Raider
    { primary: '#a855f7', secondary: '#6b21a8', trim: '#c084fc', glow: 'rgba(168, 85, 247, 0.5)' }, // 4: Void Stealth Cruiser
  ][variant % 5];

  // 1. Dual Engine Thruster Exhaust Plumes (Stern nozzles emitting blazing plasma)
  if (!isHitFlash) {
    const thrusterLength = 9 + Math.sin(time * 30) * 3;
    const nozzlePositions = [-7, 7];

    for (const nx of nozzlePositions) {
      ctx.save();
      const grad = ctx.createLinearGradient?.(nx, 13, nx, 13 + thrusterLength);
      if (grad && typeof grad.addColorStop === 'function') {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, palette.trim);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = palette.trim;
      }
      ctx.beginPath();
      ctx.moveTo(nx - 3, 13);
      ctx.lineTo(nx, 13 + thrusterLength);
      ctx.lineTo(nx + 3, 13);
      ctx.closePath();
      ctx.fill();

      // Outer plasma glow
      ctx.beginPath();
      ctx.arc(nx, 13, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = palette.glow;
      ctx.fill();
      ctx.restore();
    }
  }

  // 2. High-Tech Armored Hull & Swept Combat Wings (Thân Tàu Chiến Không Gian)
  const hullBase = isHitFlash ? '#ffffff' : '#090d16';
  const hullStroke = isHitFlash ? '#ffffff' : palette.trim;

  ctx.fillStyle = hullBase;
  ctx.strokeStyle = hullStroke;
  ctx.lineWidth = 1.8;

  // Render variant-specific warship chassis geometry
  if (variant === 0) {
    // VARIANT 0: Arrowhead Delta Interceptor (Tiêm Kích Hư Không)
    ctx.beginPath();
    ctx.moveTo(0, 18); // Nose prow
    ctx.lineTo(6, 8);
    ctx.lineTo(22, 11); // Starboard wingtip
    ctx.lineTo(19, 1);
    ctx.lineTo(10, -5);
    ctx.lineTo(7, -14); // Starboard thruster pod
    ctx.lineTo(2, -11);
    ctx.lineTo(0, -13); // Stern centerline
    ctx.lineTo(-2, -11);
    ctx.lineTo(-7, -14); // Port thruster pod
    ctx.lineTo(-10, -5);
    ctx.lineTo(-19, 1);
    ctx.lineTo(-22, 11); // Port wingtip
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Twin Wingtip Autocannon Barrels
    ctx.fillStyle = isHitFlash ? '#ffffff' : '#334155';
    ctx.fillRect(20, 7, 2.5, 7);
    ctx.fillRect(-22.5, 7, 2.5, 7);
  } else if (variant === 1) {
    // VARIANT 1: Heavy Assault Frigate (Hộ Vệ Hạm Thiết Giáp)
    ctx.beginPath();
    ctx.moveTo(0, 19);
    ctx.lineTo(8, 14);
    ctx.lineTo(15, 12);
    ctx.lineTo(24, -2);
    ctx.lineTo(16, -11);
    ctx.lineTo(8, -13);
    ctx.lineTo(0, -9);
    ctx.lineTo(-8, -13);
    ctx.lineTo(-16, -11);
    ctx.lineTo(-24, -2);
    ctx.lineTo(-15, 12);
    ctx.lineTo(-8, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Twin Reinforced Armor Prow Plates
    if (!isHitFlash) {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(-6, 12);
      ctx.lineTo(0, 17);
      ctx.lineTo(6, 12);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (variant === 2) {
    // VARIANT 2: Forward-Swept Strike Gunship (Chiến Đĩnh Pháo Kích)
    ctx.beginPath();
    ctx.moveTo(0, 17);
    ctx.lineTo(5, 5);
    ctx.lineTo(23, 16); // Forward-swept wingtip
    ctx.lineTo(20, 2);
    ctx.lineTo(9, -8);
    ctx.lineTo(6, -14);
    ctx.lineTo(0, -11);
    ctx.lineTo(-6, -14);
    ctx.lineTo(-9, -8);
    ctx.lineTo(-20, 2);
    ctx.lineTo(-23, 16);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dual Missile Pylons
    if (!isHitFlash) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(11, -2, 3, 9);
      ctx.fillRect(-14, -2, 3, 9);
    }
  } else if (variant === 3) {
    // VARIANT 3: Bio-Alloy Stealth Raider (Tàu Đột Kích Độc Tố)
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.bezierCurveTo(12, 10, 24, 6, 21, -8);
    ctx.lineTo(10, -13);
    ctx.lineTo(0, -9);
    ctx.lineTo(-10, -13);
    ctx.bezierCurveTo(-24, 6, -12, 10, 0, 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Radiating energy channels
    if (!isHitFlash) {
      ctx.strokeStyle = palette.trim;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(12, 2);
      ctx.moveTo(0, 15);
      ctx.lineTo(-12, 2);
      ctx.stroke();
    }
  } else {
    // VARIANT 4: Void Cruiser (Tuần Dương Hạm Hắc Ám)
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(7, 9);
    ctx.lineTo(21, 5);
    ctx.lineTo(17, -7);
    ctx.lineTo(12, -14);
    ctx.lineTo(0, -10);
    ctx.lineTo(-12, -14);
    ctx.lineTo(-17, -7);
    ctx.lineTo(-21, 5);
    ctx.lineTo(-7, 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3. Central Micro-Fusion Reactor / Energy Core (Lõi Năng Lượng Chiến Hạm)
  const corePulse = Math.sin(time * 12) * 0.2 + 0.8;
  ctx.fillStyle = isHitFlash ? '#ffffff' : palette.trim;
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.5 * corePulse, 6 * corePulse, 0, 0, Math.PI * 2);
  ctx.fill();

  // Core Glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -1, 1.8 * corePulse, 0, Math.PI * 2);
  ctx.fill();

  // 4. Cockpit Canopy / Sensor Dome (Khoang Lái Cường Lực Hologram)
  if (!isHitFlash) {
    const canopyGrad = ctx.createLinearGradient?.(0, 5, 0, 14);
    if (canopyGrad && typeof canopyGrad.addColorStop === 'function') {
      canopyGrad.addColorStop(0, '#0f172a');
      canopyGrad.addColorStop(1, palette.primary);
      ctx.fillStyle = canopyGrad;
    } else {
      ctx.fillStyle = palette.primary;
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 9, 3.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Horizontal scanning HUD visor line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-3, 9);
    ctx.lineTo(3, 9);
    ctx.stroke();
  }

  // 5. Tech Surface Trim Lines & Wingtip Formation Lights
  if (!isHitFlash) {
    // Wingtip strobe lights
    const strobe = (Math.floor(time * 8) % 2 === 0);
    ctx.fillStyle = strobe ? '#ffffff' : palette.trim;
    ctx.beginPath();
    ctx.arc(17, 3, 1.5, 0, Math.PI * 2);
    ctx.arc(-17, 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws one of the 20 Colossal Sci-Fi Galactic Dreadnoughts & Flagships (Đại Thiết Hạm & Soái Hạm Không Gian Khổng Lồ).
 * Features massive multi-layer composite armor plates, heavy broadside railgun batteries,
 * command bridge towers, dual heavy warp propulsion nacelles, and spinning antimatter reactors!
 */
export function drawChickenBoss(ctx: CanvasRenderingContext2D, e: Enemy): void {
  const isHitFlash = e.hitFlashTimer > 0;
  const shape = e.adventureBossShape || 'robo_chicken';
  const time = e.timeAlive;
  const scale = (e.radius / 55) || 1.0;

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Dual Heavy Warp Propulsion Nacelles & Blazing Ion Plumes (Stern)
  if (!isHitFlash) {
    const plumePulse = 18 + Math.sin(time * 24) * 5;
    [-42, 42].forEach((nx) => {
      ctx.save();
      const grad = ctx.createLinearGradient?.(nx, -40, nx, -40 - plumePulse);
      if (grad && typeof grad.addColorStop === 'function') {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#38bdf8');
        grad.addColorStop(0.7, '#0284c7');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#38bdf8';
      }
      ctx.beginPath();
      ctx.moveTo(nx - 8, -40);
      ctx.lineTo(nx, -40 - plumePulse);
      ctx.lineTo(nx + 8, -40);
      ctx.closePath();
      ctx.fill();

      // Nacelle casing
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(nx - 9, -40, 18, 14);
      ctx.strokeRect(nx - 9, -40, 18, 14);
      ctx.restore();
    });
  }

  // 2. Colossal Armored Battleship Broadside Wings (Cánh Thiết Hạm Hạng Nặng)
  ctx.save();
  const wingBase = isHitFlash ? '#ffffff' : '#070b14';
  const wingBorder = isHitFlash ? '#ffffff' : (e.color || '#38bdf8');
  ctx.fillStyle = wingBase;
  ctx.strokeStyle = wingBorder;
  ctx.lineWidth = 2.8;

  // Heavy Port Armored Wing
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(-44, -30);
  ctx.lineTo(-76, -12);
  ctx.lineTo(-84, 18);
  ctx.lineTo(-58, 26);
  ctx.lineTo(-32, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Heavy Starboard Armored Wing
  ctx.beginPath();
  ctx.moveTo(16, -10);
  ctx.lineTo(44, -30);
  ctx.lineTo(76, -12);
  ctx.lineTo(84, 18);
  ctx.lineTo(58, 26);
  ctx.lineTo(32, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing Panel Seam Highlights & Broadside Railguns
  if (!isHitFlash) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.4;
    // Port panel seams
    ctx.beginPath();
    ctx.moveTo(-35, -5);
    ctx.lineTo(-65, 8);
    ctx.moveTo(-45, -15);
    ctx.lineTo(-70, -2);
    ctx.stroke();
    // Starboard panel seams
    ctx.beginPath();
    ctx.moveTo(35, -5);
    ctx.lineTo(65, 8);
    ctx.moveTo(45, -15);
    ctx.lineTo(70, -2);
    ctx.stroke();

    // Broadside Heavy Railgun Cannons
    ctx.fillStyle = '#334155';
    ctx.fillRect(-78, 14, 6, 18);
    ctx.fillRect(-62, 22, 6, 16);
    ctx.fillRect(72, 14, 6, 18);
    ctx.fillRect(56, 22, 6, 16);
  }
  ctx.restore();

  // 3. Colossal Battleship Primary Hull & Armored Prow (Thân Chính Soái Hạm)
  ctx.save();
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#030712';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#0284c7';
  ctx.lineWidth = 3.2;

  // Armored Spearhead / Prow Geometry
  ctx.beginPath();
  ctx.moveTo(0, 56); // Pointed forward battle ram
  ctx.lineTo(24, 34);
  ctx.lineTo(38, 10);
  ctx.lineTo(32, -32);
  ctx.lineTo(16, -42);
  ctx.lineTo(-16, -42);
  ctx.lineTo(-32, -32);
  ctx.lineTo(-38, 10);
  ctx.lineTo(-24, 34);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Layered Titanium Armor Plates
  if (!isHitFlash) {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 42);
    ctx.lineTo(16, 26);
    ctx.lineTo(22, 4);
    ctx.lineTo(-22, 4);
    ctx.lineTo(-16, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 4. Central Antimatter Reactor Core (Lõi Lò Phản Ứng Phản Vật Chất)
  const heartBeat = Math.sin(time * 8) * 0.18 + 1.0;
  ctx.save();
  // Magnetic containment ring
  ctx.beginPath();
  ctx.arc(0, 2, 16 * heartBeat, 0, Math.PI * 2);
  ctx.fillStyle = isHitFlash ? '#ffffff' : 'rgba(14, 165, 233, 0.25)';
  ctx.fill();
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#00f2fe';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Rotating containment brackets
  if (!isHitFlash) {
    ctx.save();
    ctx.rotate(time * 3);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(14 * heartBeat, -2.5, 4, 5);
    }
    ctx.restore();
  }

  // Blazing Core Center
  ctx.beginPath();
  ctx.arc(0, 2, 8 * heartBeat, 0, Math.PI * 2);
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#ffffff';
  ctx.fill();
  ctx.restore();

  // 5. Command Bridge Citadel & Holographic Visor (Tháp Chỉ Huy & Cầu Tàu)
  ctx.save();
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#020617';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#38bdf8';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(16, -18);
  ctx.lineTo(12, -8);
  ctx.lineTo(-12, -8);
  ctx.lineTo(-16, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Bridge Windows
  if (!isHitFlash) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-8, -16, 16, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -16, 4, 3);
  }
  ctx.restore();

  // 6. 20 Bespoke Colossal Dreadnought Special Warship Modules
  switch (shape) {
    case 'robo_chicken': {
      // 1. Heavy Mecha Dreadnought Mk-I: Dual rotating heavy gatling pods & scanning visor
      [-48, 48].forEach((sx) => {
        ctx.save();
        ctx.translate(sx, -8);
        ctx.rotate(time * 8);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
          ctx.lineTo(Math.cos(a + 0.2) * 18, Math.sin(a + 0.2) * 18);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      // Red laser targeting sensor sweep
      const sweep = Math.sin(time * 6) * 16;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-20, 18, 40, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sweep - 3, 18, 6, 4);
      break;
    }

    case 'blizzard_hen': {
      // 2. Cryo-Carrier Glacies: Diamond-faceted stealth frost armor & icy railgun pylons
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + time * 0.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 45, Math.sin(ang) * 45);
        ctx.lineTo(Math.cos(ang) * 75, Math.sin(ang) * 75);
        ctx.stroke();
      }
      break;
    }

    case 'vampire_rooster': {
      // 3. Crimson Bloodfang Warcruiser: Blood-red armor plates & twin dark-lance emitters
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-18, 44, 4, 18);
      ctx.fillRect(14, 44, 4, 18);

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'tesla_mother': {
      // 4. Apex Tesla Dreadnought: High-voltage EMP lightning conduits & plasma halo
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8 + time * 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 35, Math.sin(ang) * 35);
        ctx.lineTo(Math.cos(ang) * 55 + (Math.sin(time * 20 + i) * 6), Math.sin(ang) * 55);
        ctx.lineTo(Math.cos(ang) * 75, Math.sin(ang) * 75);
        ctx.stroke();
      }
      break;
    }

    case 'bio_venom_gallus': {
      // 5. Gorgon Bio-Alloy Frigate: Caustic torpedo pods & green plasma radiators
      ctx.fillStyle = '#84cc16';
      ctx.strokeStyle = '#4d7c0f';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + time * 0.4;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 42, Math.sin(ang) * 42, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    case 'atomic_egg': {
      // 6. Antimatter Singularity Fortress: Dual orbital gravitational rings
      ctx.save();
      ctx.rotate(time * 1.2);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 68, 24, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.rotate(Math.PI / 2);
      ctx.strokeStyle = '#ec4899';
      ctx.beginPath();
      ctx.ellipse(0, 0, 68, 24, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'golden_sultan': {
      // 7. Imperial Gold Sovereign: Gilded auric armor & royal solar cannons
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.strokeRect(-28, -28, 56, 56);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 35, 7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'void_phantom': {
      // 8. Void Specter Stealth Flagship: Phase-shift cloaking plates
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(-60, -35, 120, 70);
      ctx.setLineDash([]);
      break;
    }

    case 'kraken_calamari': {
      // 9. Abyssal Kraken Battlecruiser: Heavy forward plasma lance prongs
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-35, 40);
      ctx.lineTo(-45, 75);
      ctx.lineTo(-30, 85);
      ctx.moveTo(35, 40);
      ctx.lineTo(45, 75);
      ctx.lineTo(30, 85);
      ctx.stroke();
      break;
    }

    case 'gatling_eggomatic': {
      // 10. Vulcan Rotary Fortress 3000: Quad revolving rotary barrels
      [-36, -12, 12, 36].forEach((gx) => {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(gx - 3, 35, 6, 26);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(gx - 2, 58, 4, 5);
      });
      break;
    }

    case 'magma_inferno': {
      // 11. Inferno Vulcan Battleship: Glowing molten heat sinks & magma vents
      const magmaGlow = Math.sin(time * 10) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(239, 68, 68, ${magmaGlow})`;
      ctx.fillRect(-35, -5, 70, 8);
      ctx.fillRect(-22, 18, 44, 8);
      break;
    }

    case 'prismatic_crystal': {
      // 12. Prismatic Refractor Super-Dreadnought: Diamond laser crystal hardpoints
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + time * 0.8;
        const cx = Math.cos(ang) * 55;
        const cy = Math.sin(ang) * 55;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 2);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.strokeRect(-6, -6, 12, 12);
        ctx.restore();
      }
      break;
    }

    case 'toxic_methane': {
      // 13. Methane Heavy Cruiser: Industrial high-pressure chemical turbines
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-42, 0, 16, 0, Math.PI * 2);
      ctx.arc(42, 0, 16, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'chronos_multi': {
      // 14. Chronos Quantum Dreadnought: Temporal distortion ghost afterimages
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-48, -25, 96, 50);
      ctx.strokeRect(-54, -20, 108, 40);
      ctx.restore();
      break;
    }

    case 'dreadnought_hen': {
      // 15. Imperial Leviathan Behemoth: Heavy reinforced titan armor decks
      ctx.fillStyle = '#334155';
      ctx.fillRect(-65, -15, 130, 12);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-65, -15, 130, 12);
      break;
    }

    case 'cyborg_scrappy': {
      // 16. Marauder Ironclad Pirate Flagship: Heavy reinforced spiked battle ram prow
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-15, 52);
      ctx.lineTo(0, 78);
      ctx.lineTo(15, 52);
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'strobe_beacon': {
      // 17. Pulsar Light Fortress 360°: Sweeping 360-degree radar / energy emitter ring
      ctx.save();
      ctx.rotate(time * 2.5);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -62);
      ctx.lineTo(0, 62);
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'binary_twin': {
      // 18. Gemini Dual-Core Fusion Cruiser: Catamaran twin fusion reactors
      [-22, 22].forEach((cx) => {
        ctx.beginPath();
        ctx.arc(cx, -10, 10, 0, Math.PI * 2);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      break;
    }

    case 'imperial_general': {
      // 19. Armada Admiral Flagship: 4 Golden Command Stars & Command Antennae Arrays
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★★★★', 0, -28);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-35, -30);
      ctx.lineTo(-45, -55);
      ctx.moveTo(35, -30);
      ctx.lineTo(45, -55);
      ctx.stroke();
      break;
    }

    case 'supreme_emperor': {
      // 20. THE SUPREME GALACTIC OVERLORD (ĐẠI THIẾT HẠM VUA VŨ TRỤ)
      // Imperial Crown Armor Wings & Orbiting Antimatter Singularities
      ctx.fillStyle = '#1e112a';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-35, 30);
      ctx.lineTo(-75, 45);
      ctx.lineTo(-50, 70);
      ctx.lineTo(0, 88); // Colossal Emperor Prow
      ctx.lineTo(50, 70);
      ctx.lineTo(75, 45);
      ctx.lineTo(35, 30);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dual Orbiting Dark Energy Spheres
      [-70, 70].forEach((ox, idx) => {
        const sy = Math.sin(time * 5 + idx * Math.PI) * 16;
        ctx.beginPath();
        ctx.arc(ox, sy, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#020617';
        ctx.fill();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws a Guided Plasma Torpedo / Quantum Energy Bolt (Ngự Lôi Pháo / Đạn Plasma Không Gian)
 * Replaces cartoon egg bullets with aerodynamic sci-fi projectile.
 */
export function drawEggBullet(ctx: CanvasRenderingContext2D, b: Bullet): void {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.eggRotation || 0);

  // 1. Outer Plasma Halo & Ion Shockwave Trail
  ctx.beginPath();
  ctx.arc(0, 0, b.radius + 3.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.fill();

  // 2. High-Tech Aerodynamic Plasma Warhead (Diamond Torpedo)
  ctx.beginPath();
  ctx.moveTo(0, b.radius * 1.4); // Needle point
  ctx.lineTo(b.radius * 0.85, 0);
  ctx.lineTo(0, -b.radius * 1.2);
  ctx.lineTo(-b.radius * 0.85, 0);
  ctx.closePath();
  ctx.fillStyle = b.color || '#ef4444';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // 3. Piercing Pure Energy Core
  ctx.beginPath();
  ctx.arc(0, 0, b.radius * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a Quantum Energy Core / Warp Fuel Cell Pickup (Lõi Năng Lượng Chiến Tàu / Khối Pin Lượng Tử)
 * Replaces cartoon drumsticks with a pulsing sci-fi power battery canister.
 */
export function drawDrumstickPickup(ctx: CanvasRenderingContext2D, pk: Pickup): void {
  const time = performance.now() * 0.005;
  const pulse = Math.sin(time * 2 + pk.bobOffset) * 0.12 + 1.0;

  ctx.save();
  ctx.translate(pk.x, pk.y);
  ctx.rotate(Math.sin(time + pk.bobOffset) * 0.15);

  // 1. Ambient Energy Radiance
  ctx.beginPath();
  ctx.arc(0, 0, (pk.radius + 6) * pulse, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
  ctx.fill();

  // 2. Futuristic Power Canister Body
  const cellW = 16 * pulse;
  const cellH = 22 * pulse;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(-cellW / 2, -cellH / 2, cellW, cellH);
  ctx.fillRect(-cellW / 2, -cellH / 2, cellW, cellH);

  // 3. Interior Glowing Plasma Fuel
  const fuelGrad = ctx.createLinearGradient?.(0, cellH / 2, 0, -cellH / 2);
  if (fuelGrad && typeof fuelGrad.addColorStop === 'function') {
    fuelGrad.addColorStop(0, '#d97706');
    fuelGrad.addColorStop(0.5, '#fbbf24');
    fuelGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = fuelGrad;
  } else {
    ctx.fillStyle = '#fbbf24';
  }
  ctx.fillRect(-cellW / 2 + 2, -cellH / 2 + 2, cellW - 4, cellH - 4);

  // 4. Titanium Endcaps with Warning Stripes
  ctx.fillStyle = '#334155';
  ctx.fillRect(-cellW / 2 - 2, -cellH / 2 - 4, cellW + 4, 4);
  ctx.fillRect(-cellW / 2 - 2, cellH / 2, cellW + 4, 4);

  // 5. Revolving Quantum Energy Spark Orbit Ring
  ctx.save();
  ctx.rotate(time * 3);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, cellW * 0.85, cellW * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 6. Sci-Fi Energy Battery Bolt Icon
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡', 0, 0);

  ctx.restore();
}
