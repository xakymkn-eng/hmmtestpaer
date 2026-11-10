/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FighterStats } from './rules';

export interface DrawFighterSpriteOptions {
  fighter: FighterStats;
  activeSkinId?: string | null;
  now: number;
  isHitFlash?: boolean;
  scale?: number;
  isShowcase?: boolean;
}

/**
 * Universal Fighter Sprite Renderer
 * Guarantees 100% visual parity between Lobby Hangar Showcase and In-Game Combat
 * for all 11 Tier-S fighters and all equipped cosmetic skins.
 */
export function drawFighterSprite(
  ctx: CanvasRenderingContext2D,
  options: DrawFighterSpriteOptions
): void {
  const {
    fighter,
    activeSkinId,
    now,
    isHitFlash = false,
    scale = 1.0,
    isShowcase = false,
  } = options;

  ctx.save();
  if (scale !== 1.0) {
    ctx.scale(scale, scale);
  }

  // Animation ticks
  const pulse = (Math.sin(now * 0.005) + 1) * 0.5; // 0..1
  const rapidPulse = (Math.sin(now * 0.012) + 1) * 0.5;
  const flicker = 0.85 + Math.random() * 0.3;

  // Resolve active theme colors based on equipped skin or default fighter palette
  let primaryColor = fighter.color;
  let secondaryColor = fighter.accentColor || '#38bdf8';
  let glowColor = (fighter as { glowColor?: string }).glowColor || 'rgba(56, 189, 248, 0.6)';
  let engineFlamesColor = '#38bdf8';
  let engineCoreColor = '#e0f2fe';

  const skin = activeSkinId || null;

  // Global / Themed skin overrides
  if (skin === 'skin_rts88_ark_one') {
    primaryColor = '#09090b';
    secondaryColor = '#ff0033';
    glowColor = 'rgba(255, 0, 51, 0.95)';
    engineFlamesColor = '#ff0033';
    engineCoreColor = '#18181b';
  } else if (skin === 'skin_rts88_neon_violet') {
    primaryColor = '#1e1136';
    secondaryColor = '#c026d3';
    glowColor = 'rgba(192, 38, 211, 0.9)';
    engineFlamesColor = '#d946ef';
    engineCoreColor = '#fae8ff';
  } else if (skin === 'skin_lx88_royal_gold' || skin === 'skin_golden_sovereign') {
    primaryColor = '#d97706';
    secondaryColor = '#fbbf24';
    glowColor = 'rgba(251, 191, 36, 0.95)';
    engineFlamesColor = '#f59e0b';
    engineCoreColor = '#fef3c7';
  } else if (skin === 'skin_lx88_vampire' || skin === 'skin_void_obsidian') {
    primaryColor = '#18181b';
    secondaryColor = '#e11d48';
    glowColor = 'rgba(225, 29, 72, 0.95)';
    engineFlamesColor = '#be123c';
    engineCoreColor = '#ffe4e6';
  } else if (skin === 'skin_solaris_cyberpunk') {
    primaryColor = '#0f172a';
    secondaryColor = '#ff007f';
    glowColor = 'rgba(255, 0, 127, 0.9)';
    engineFlamesColor = '#00f2fe';
    engineCoreColor = '#ffed4a';
  } else if (skin === 'skin_astraea_sakura') {
    primaryColor = '#fbcfe8';
    secondaryColor = '#f472b6';
    glowColor = 'rgba(244, 114, 182, 0.95)';
    engineFlamesColor = '#fb7185';
    engineCoreColor = '#fff1f2';
  } else if (skin === 'skin_chrono_void' || skin === 'skin_cosmic_nebula') {
    primaryColor = '#1e1b4b';
    secondaryColor = '#818cf8';
    glowColor = 'rgba(129, 140, 248, 0.9)';
    engineFlamesColor = '#c084fc';
    engineCoreColor = '#e0e7ff';
  } else if (skin === 'skin_apocalypse_inferno') {
    primaryColor = '#450a0a';
    secondaryColor = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.95)';
    engineFlamesColor = '#f97316';
    engineCoreColor = '#fef08a';
  } else if (skin === 'skin_victory_valkyrie') {
    primaryColor = '#e2e8f0';
    secondaryColor = '#38bdf8';
    glowColor = 'rgba(226, 232, 240, 0.95)';
    engineFlamesColor = '#7dd3fc';
    engineCoreColor = '#ffffff';
  } else if (skin === 'skin_dragon_mecha') {
    primaryColor = '#064e3b';
    secondaryColor = '#10b981';
    glowColor = 'rgba(16, 185, 129, 0.95)';
    engineFlamesColor = '#06b6d4';
    engineCoreColor = '#a7f3d0';
  } else if (skin === 'skin_nebula_supernova') {
    primaryColor = '#3b0764';
    secondaryColor = '#c084fc';
    glowColor = 'rgba(192, 132, 252, 0.95)';
    engineFlamesColor = '#38bdf8';
    engineCoreColor = '#f0abfc';
  } else if (skin === 'skin_quasar_colossus') {
    primaryColor = '#713f12';
    secondaryColor = '#eab308';
    glowColor = 'rgba(234, 179, 8, 0.95)';
    engineFlamesColor = '#f97316';
    engineCoreColor = '#fef08a';
  } else if (skin === 'skin_phantom_tachyon') {
    primaryColor = '#2e1065';
    secondaryColor = '#ec4899';
    glowColor = 'rgba(236, 72, 153, 0.95)';
    engineFlamesColor = '#8b5cf6';
    engineCoreColor = '#fdf2f8';
  }

  // Flash white on hit
  if (isHitFlash) {
    primaryColor = '#ffffff';
    secondaryColor = '#ffffff';
    glowColor = 'rgba(255, 255, 255, 0.9)';
  }

  // -------------------------------------------------------------
  // HELPER: Thruster Flame Renderer
  // -------------------------------------------------------------
  const drawThruster = (x: number, y: number, flameW: number, flameH: number) => {
    ctx.save();
    const dynamicH = flameH * (0.85 + flicker * 0.3);
    const grad = ctx.createLinearGradient(x, y, x, y + dynamicH);
    grad.addColorStop(0, engineCoreColor);
    grad.addColorStop(0.35, engineFlamesColor);
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - flameW * 0.5, y);
    ctx.quadraticCurveTo(x - flameW * 0.8, y + dynamicH * 0.5, x, y + dynamicH);
    ctx.quadraticCurveTo(x + flameW * 0.8, y + dynamicH * 0.5, x + flameW * 0.5, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // -------------------------------------------------------------
  // 1. RTS-88 TIA CHỚP (Lightning Interceptor - Forward Swept Wings)
  // -------------------------------------------------------------
  if (fighter.id === 'rts_88') {
    const isArkOne = skin === 'skin_rts88_ark_one';

    if (isArkOne) {
      // =========================================================
      // RTS-88 KAMEN RIDER ARK-ONE [HUYỀN THOẠI]
      // =========================================================
      // 1. VÒNG TRÒN ARK-ONE XOAY QUANH Ở PHÍA SAU MÁY BAY
      ctx.save();
      const ringCenterY = 22;
      const ringRot = now * 0.003;
      const ringRadius = 32;

      // Malice Singularity Void Haze
      const maliceHazeGrad = ctx.createRadialGradient(0, ringCenterY, 3, 0, ringCenterY, ringRadius + 14);
      maliceHazeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      maliceHazeGrad.addColorStop(0.45, 'rgba(255, 0, 51, 0.4)');
      maliceHazeGrad.addColorStop(1, 'rgba(255, 0, 51, 0)');
      ctx.fillStyle = maliceHazeGrad;
      ctx.beginPath();
      ctx.arc(0, ringCenterY, ringRadius + 14, 0, Math.PI * 2);
      ctx.fill();

      // Outer Segmented Ark-One Malice Ring (8 mechanical notches / teeth)
      ctx.save();
      ctx.translate(0, ringCenterY);
      ctx.rotate(ringRot);
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(255, 0, 51, 0.95)';
      ctx.shadowBlur = isShowcase ? 20 : 13;

      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 8 Malice teeth jutting out from ring (Ark Driver One gear teeth)
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI) / 4;
        const tx = Math.cos(ang) * ringRadius;
        const ty = Math.sin(ang) * ringRadius;
        const toothX = Math.cos(ang) * (ringRadius + (i % 2 === 0 ? 6.5 : 4));
        const toothY = Math.sin(ang) * (ringRadius + (i % 2 === 0 ? 6.5 : 4));

        ctx.strokeStyle = i % 2 === 0 ? '#ff0033' : '#09090b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(toothX, toothY);
        ctx.stroke();

        // Mechanical bracket block
        ctx.fillStyle = '#18181b';
        ctx.fillRect(tx - 2, ty - 2, 4, 4);
      }
      ctx.restore();

      // Counter-rotating inner malice rune circle
      ctx.save();
      ctx.translate(0, ringCenterY);
      ctx.rotate(-ringRot * 1.5);
      ctx.strokeStyle = 'rgba(255, 26, 64, 0.7)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius - 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 Runic Malice Diamond Glyphs
      for (let g = 0; g < 4; g++) {
        const gang = (g * Math.PI) / 2;
        const gx = Math.cos(gang) * (ringRadius - 6);
        const gy = Math.sin(gang) * (ringRadius - 6);
        ctx.fillStyle = '#ff0033';
        ctx.beginPath();
        ctx.moveTo(gx, gy - 2.8);
        ctx.lineTo(gx + 2.8, gy);
        ctx.lineTo(gx, gy + 2.8);
        ctx.lineTo(gx - 2.8, gy);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Malice digital code bits / red binary dots drifting around the ring
      for (let d = 0; d < 7; d++) {
        const dang = now * 0.0019 + d * 0.92;
        const dr = ringRadius + 4 + Math.sin(now * 0.004 + d) * 4;
        const dx = Math.cos(dang) * dr;
        const dy = ringCenterY + Math.sin(dang) * (dr * 0.85);
        ctx.fillStyle = d % 2 === 0 ? '#ff0033' : '#ffffff';
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 6;
        ctx.fillRect(dx - 1.2, dy - 1.2, 2.5, 2.5);
      }
      ctx.restore();

      // 2. SINISTER RED-BLACK MALICE THRUSTERS
      drawThruster(-11, 23, 7, 28);
      drawThruster(11, 23, 7, 28);

      ctx.save();
      ctx.shadowColor = 'rgba(255, 0, 51, 0.95)';
      ctx.shadowBlur = isShowcase ? 24 : 16;

      // 3. ASYMMETRICAL MALICE FUSELAGE
      // Base dark chassis
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -36); // Needle prow
      ctx.lineTo(8, -16);
      ctx.lineTo(16, -4);
      ctx.lineTo(36, 8); // Right forward wingtip
      ctx.lineTo(38, 14);
      ctx.lineTo(30, 20);
      ctx.lineTo(16, 17);
      ctx.lineTo(12, 25);
      ctx.lineTo(4, 23);
      ctx.lineTo(0, 28);
      ctx.lineTo(-4, 23);
      ctx.lineTo(-12, 25);
      ctx.lineTo(-16, 17);
      ctx.lineTo(-30, 20);
      ctx.lineTo(-38, 14);
      ctx.lineTo(-36, 8); // Left wingtip
      ctx.lineTo(-16, -4);
      ctx.lineTo(-8, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // RIGHT HALF: Stark Composite White Armor Plate (Ark-One iconic pure white side)
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -36);
      ctx.lineTo(8, -16);
      ctx.lineTo(16, -4);
      ctx.lineTo(35, 8);
      ctx.lineTo(37, 14);
      ctx.lineTo(29, 19);
      ctx.lineTo(15, 16);
      ctx.lineTo(11, 24);
      ctx.lineTo(3, 22);
      ctx.lineTo(0, 26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Black mechanical panel cuts on white plate
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(7, -14);
      ctx.lineTo(18, -2);
      ctx.lineTo(28, 12);
      ctx.moveTo(4, -4);
      ctx.lineTo(12, 10);
      ctx.stroke();

      // LEFT HALF: Corrupted Obsidian Malice Armor with Fractured Crimson Veins
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(0, -36);
      ctx.lineTo(-8, -16);
      ctx.lineTo(-16, -4);
      ctx.lineTo(-35, 8);
      ctx.lineTo(-37, 14);
      ctx.lineTo(-29, 19);
      ctx.lineTo(-15, 16);
      ctx.lineTo(-11, 24);
      ctx.lineTo(-3, 22);
      ctx.lineTo(0, 26);
      ctx.closePath();
      ctx.fill();

      // Jagged glowing crimson malice veins on left wing
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(-6, -15);
      ctx.lineTo(-15, -6);
      ctx.lineTo(-26, 4);
      ctx.lineTo(-34, 11);
      ctx.moveTo(-15, -6);
      ctx.lineTo(-22, 12);
      ctx.moveTo(-6, -15);
      ctx.lineTo(-10, 6);
      ctx.stroke();

      // Spiked forward malice horns / canard spikes
      ctx.fillStyle = '#ff0033';
      ctx.beginPath();
      ctx.moveTo(-7, -16);
      ctx.lineTo(-14, -26);
      ctx.lineTo(-6, -21);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(7, -16);
      ctx.lineTo(14, -26);
      ctx.lineTo(6, -21);
      ctx.closePath();
      ctx.fill();

      // 4. ARK DRIVER ONE CENTRAL MALICE REACTOR CORE
      ctx.save();
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hang = (h * Math.PI) / 3;
        const hx = Math.cos(hang) * 9.5;
        const hy = Math.sin(hang) * 9.5;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central Ocular Malice Pupil (Ark eye)
      const arkPulse = (Math.sin(now * 0.012) + 1) * 0.5;
      const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 7.5);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.35, '#ff0033');
      coreGrad.addColorStop(0.8, '#99001f');
      coreGrad.addColorStop(1, '#000000');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 6.5 + arkPulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. ASYMMETRICAL COCKPIT / VISOR: Left Cracked Red Eye & Right White Ridge
      // Right side white visor frame
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.quadraticCurveTo(4, -8, 4, 3);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();

      // Left side CRACKED ARK-ONE MALICE EYE
      ctx.fillStyle = '#ff0033';
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.quadraticCurveTo(-5, -8, -5, 3);
      ctx.lineTo(0, 3);
      ctx.closePath();
      ctx.fill();

      // Sinister red malice ocular slit
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-1, -12);
      ctx.lineTo(-3.5, -6);
      ctx.lineTo(-2, 1);
      ctx.stroke();

      // 6. TWIN WINGTIP TESLA MALICE ARCS (Sấm sét ác quỷ uốn cong tại đầu cánh)
      ctx.strokeStyle = '#ff0033';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      const jxR = Math.sin(now * 0.026) * 5;
      const jyR = Math.cos(now * 0.026) * 4;
      ctx.moveTo(24, 10);
      ctx.quadraticCurveTo(32 + jxR, 2 + jyR, 42 + jxR * 0.6, 10 + jyR * 0.6);
      const jxL = Math.cos(now * 0.022) * 5;
      const jyL = Math.sin(now * 0.022) * 4;
      ctx.moveTo(-24, 10);
      ctx.quadraticCurveTo(-32 - jxL, 2 + jyL, -42 - jxL * 0.6, 10 + jyL * 0.6);
      ctx.stroke();

      ctx.restore();
      ctx.restore();
      return;
    }

    // Default & Epic Neon Violet RTS-88
    drawThruster(-11, 23, 6, 26);
    drawThruster(11, 23, 6, 26);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 22 : 14;

    // Outer Aerodynamic Wing Silhouette (Forward Swept Inverted Gull)
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(0, -35); // Hypersonic needle prow
    ctx.lineTo(8, -16);
    ctx.lineTo(16, -4);
    ctx.lineTo(36, 8); // Forward-swept wingtip razor
    ctx.lineTo(38, 14);
    ctx.lineTo(30, 20);
    ctx.lineTo(16, 17);
    ctx.lineTo(12, 25); // Right thruster fairing
    ctx.lineTo(4, 23);
    ctx.lineTo(0, 28); // Ventral spine fin
    ctx.lineTo(-4, 23);
    ctx.lineTo(-12, 25); // Left thruster fairing
    ctx.lineTo(-16, 17);
    ctx.lineTo(-30, 20);
    ctx.lineTo(-38, 14);
    ctx.lineTo(-36, 8); // Forward-swept wingtip razor left
    ctx.lineTo(-16, -4);
    ctx.lineTo(-8, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Secondary Titanium Plating & High-Voltage Circuit Conduits
    ctx.fillStyle = secondaryColor;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(5, -12);
    ctx.lineTo(12, 2);
    ctx.lineTo(3, 14);
    ctx.lineTo(0, 16);
    ctx.lineTo(-3, 14);
    ctx.lineTo(-12, 2);
    ctx.lineTo(-5, -12);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Wing panel bevel lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(16, -4);
    ctx.lineTo(32, 12);
    ctx.moveTo(-16, -4);
    ctx.lineTo(-32, 12);
    ctx.stroke();

    // Twin Wingtip Tesla Nodes with animated energetic lightning arcing
    const arcColor = skin === 'skin_rts88_neon_violet' ? '#f0abfc' : '#67e8f9';
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Right wing arc
    const jxR = Math.sin(now * 0.024) * 4;
    const jyR = Math.cos(now * 0.024) * 3;
    ctx.moveTo(24, 10);
    ctx.lineTo(36 + jxR, 7 + jyR);
    ctx.lineTo(40 + jxR * 0.5, 12 + jyR * 0.5);
    // Left wing arc
    const jxL = Math.cos(now * 0.021) * 4;
    const jyL = Math.sin(now * 0.021) * 3;
    ctx.moveTo(-24, 10);
    ctx.lineTo(-36 - jxL, 7 + jyL);
    ctx.lineTo(-40 - jxL * 0.5, 12 + jyL * 0.5);
    ctx.stroke();

    // High-tech Cockpit Canopy with prismatic specular reflection
    const cockpitGrad = ctx.createLinearGradient(0, -20, 0, 6);
    if (skin === 'skin_rts88_neon_violet') {
      cockpitGrad.addColorStop(0, '#ffffff');
      cockpitGrad.addColorStop(0.3, '#f0abfc');
      cockpitGrad.addColorStop(0.7, '#a855f7');
      cockpitGrad.addColorStop(1, '#3b0764');
    } else {
      cockpitGrad.addColorStop(0, '#ffffff');
      cockpitGrad.addColorStop(0.3, '#bae6fd');
      cockpitGrad.addColorStop(0.7, '#0284c7');
      cockpitGrad.addColorStop(1, '#082f49');
    }
    ctx.fillStyle = cockpitGrad;
    ctx.beginPath();
    ctx.ellipse(0, -6, 5, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Cockpit Specular Glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-1.5, -9, 1.5, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 2. ARC_TEMPEST (LX-88 Lôi Quang Tiên Phong & 2 SKIN HUYỀN THOẠI)
  // -------------------------------------------------------------
  if (fighter.id === 'arc_tempest') {
    const isVampire = skin === 'skin_lx88_vampire';
    const isRoyalGold = skin === 'skin_lx88_royal_gold' || skin === 'skin_golden_sovereign';

    // =============================================================
    // SKIN 1: LX-88 MA CÀ RỒNG HUYẾT DẠ [HUYỀN THOẠI]
    // =============================================================
    if (isVampire) {
      // 1. Eerie Blood Mist & Hellfire Thrusters
      drawThruster(-16, 22, 6, 24);
      drawThruster(0, 27, 8, 30);
      drawThruster(16, 22, 6, 24);

      ctx.save();
      ctx.shadowColor = 'rgba(225, 29, 72, 0.95)';
      ctx.shadowBlur = isShowcase ? 26 : 18;

      // 2. "HIỆU ỨNG THỦY ĐỎ BAY ZICK ZACK QUANH MÁY BAY" (Vampiric Zigzag Blood Streams)
      ctx.save();
      const bloodStreams = [-1, 1]; // Left and Right zigzag tendrils
      bloodStreams.forEach((side, streamIdx) => {
        const timeOffset = streamIdx * Math.PI * 0.5;
        const waveSpeed = now * 0.007;

        // Trace undulating zigzag blood ribbon
        ctx.beginPath();
        const startY = 32;
        const endY = -42;
        const steps = 14;

        for (let s = 0; s <= steps; s++) {
          const tNorm = s / steps;
          const curY = startY + (endY - startY) * tNorm;
          // Zigzag frequency and amplitude: snaking in and out around the wings
          const zigX =
            side * (24 + Math.sin(tNorm * Math.PI * 4 + waveSpeed + timeOffset) * 14);
          if (s === 0) {
            ctx.moveTo(zigX, curY);
          } else {
            ctx.lineTo(zigX, curY);
          }
        }

        // Glowing blood fluid stroke
        ctx.strokeStyle = streamIdx % 2 === 0 ? 'rgba(244, 63, 94, 0.85)' : 'rgba(225, 29, 72, 0.9)';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Secondary inner core fluid line (bright crimson / ruby)
        ctx.strokeStyle = '#ffe4e6';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Blood orbs / droplets traveling dynamically along the zigzag stream
        for (let b = 0; b < 3; b++) {
          const bProgress = ((waveSpeed * 0.4 + b / 3 + streamIdx * 0.25) % 1);
          const bY = startY + (endY - startY) * bProgress;
          const bX =
            side * (24 + Math.sin(bProgress * Math.PI * 4 + waveSpeed + timeOffset) * 14);
          const bRad = 2.4 + Math.sin(now * 0.01 + b) * 0.8;

          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(bX, bY, bRad, 0, Math.PI * 2);
          ctx.fill();

          // Droplet highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bX - 0.7, bY - 0.7, bRad * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // 3. Orbiting Vampire Bats Flapping Wings Around the Aircraft
      ctx.save();
      const batCount = 3;
      for (let bi = 0; bi < batCount; bi++) {
        const batAngle = now * 0.0032 + (bi * Math.PI * 2) / batCount;
        const batDistX = Math.cos(batAngle) * (isShowcase ? 46 : 38);
        const batDistY = Math.sin(batAngle) * (isShowcase ? 26 : 22);
        const flap = Math.sin(now * 0.024 + bi * 2); // Fast wing flap

        ctx.save();
        ctx.translate(batDistX, batDistY);
        ctx.rotate(batAngle + Math.PI * 0.5);

        // Bat body & jagged gothic wings
        ctx.fillStyle = '#1c1917';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, -3); // Head
        ctx.lineTo(2, 0);
        ctx.lineTo(6, -2 + flap * 3); // Right wingtip
        ctx.lineTo(4, 3);
        ctx.lineTo(2, 2);
        ctx.lineTo(0, 4); // Tail
        ctx.lineTo(-2, 2);
        ctx.lineTo(-4, 3);
        ctx.lineTo(-6, -2 + flap * 3); // Left wingtip
        ctx.lineTo(-2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing red bat eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-1, -2, 0.8, 0.8);
        ctx.fillRect(0.5, -2, 0.8, 0.8);
        ctx.restore();
      }
      ctx.restore();

      // 4. Gothic Demonic Bat-Wing Hull (Obsidian Black + Crimson Veins)
      ctx.fillStyle = '#0f0a0a'; // Dark Gothic Obsidian
      ctx.strokeStyle = '#e11d48'; // Vivid Blood Red
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      // Dual forward vampire fangs
      ctx.moveTo(-6, -34); // Left Fang
      ctx.lineTo(-3, -16);
      ctx.lineTo(0, -8);
      ctx.lineTo(3, -16);
      ctx.lineTo(6, -34); // Right Fang
      ctx.lineTo(12, -16);
      ctx.lineTo(18, -8);
      ctx.lineTo(40, 6); // Bat wing outer claw
      ctx.lineTo(36, 15);
      ctx.lineTo(28, 11);
      ctx.lineTo(32, 22); // Secondary bat wing scalloped tip
      ctx.lineTo(22, 18);
      ctx.lineTo(16, 27);
      ctx.lineTo(4, 24);
      ctx.lineTo(0, 29); // Demon tail barb
      ctx.lineTo(-4, 24);
      ctx.lineTo(-16, 27);
      ctx.lineTo(-22, 18);
      ctx.lineTo(-32, 22); // Secondary bat wing scalloped tip left
      ctx.lineTo(-28, 11);
      ctx.lineTo(-36, 15);
      ctx.lineTo(-40, 6); // Bat wing outer claw left
      ctx.lineTo(-18, -8);
      ctx.lineTo(-12, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gothic Blood Bone Veins on Wings
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      // Right wing bone arches
      ctx.moveTo(12, -4);
      ctx.quadraticCurveTo(24, 0, 38, 8);
      ctx.moveTo(14, 4);
      ctx.quadraticCurveTo(22, 10, 30, 20);
      // Left wing bone arches
      ctx.moveTo(-12, -4);
      ctx.quadraticCurveTo(-24, 0, -38, 8);
      ctx.moveTo(-14, 4);
      ctx.quadraticCurveTo(-22, 10, -30, 20);
      ctx.stroke();

      // 5. Pulsing Cardiac Eye of Dracula (Organic Heartbeat Rhythm)
      const heartbeat =
        Math.pow(Math.sin(now * 0.007), 8) * 0.35 +
        Math.pow(Math.sin(now * 0.007 + 0.3), 8) * 0.25;
      const eyeRad = 6.5 + heartbeat * 2.5;

      // Concentric blood shock ring
      ctx.save();
      ctx.strokeStyle = `rgba(244, 63, 94, ${0.4 + heartbeat * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -3, eyeRad + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Deep Ruby Core with White Specular Slit
      const rubyEye = ctx.createRadialGradient(0, -3, 1, 0, -3, eyeRad);
      rubyEye.addColorStop(0, '#ffffff');
      rubyEye.addColorStop(0.3, '#f43f5e');
      rubyEye.addColorStop(0.7, '#881337');
      rubyEye.addColorStop(1, '#4c0519');
      ctx.fillStyle = rubyEye;
      ctx.beginPath();
      ctx.arc(0, -3, eyeRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Slit pupil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -3, 1.2, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();
      return;
    }

    // =============================================================
    // SKIN 2: LX-88 HOÀNG KIM ĐẾ VƯƠNG [HUYỀN THOẠI]
    // =============================================================
    if (isRoyalGold) {
      // 1. Triple Radiant Solar Gold Thrusters
      drawThruster(-14, 22, 6, 26);
      drawThruster(0, 28, 8, 32);
      drawThruster(14, 22, 6, 26);

      ctx.save();
      ctx.shadowColor = 'rgba(251, 191, 36, 0.95)';
      ctx.shadowBlur = isShowcase ? 26 : 18;

      // 2. "CÓ CÁC KIM CƯƠNG ĐÁ QUÝ BAY QUANH MÁY BAY" (Orbiting Faceted Diamonds & Gemstones)
      ctx.save();
      const gemColors = [
        { name: 'diamond', base: '#ffffff', mid: '#38bdf8', deep: '#0284c7' }, // Brilliant Diamond
        { name: 'sapphire', base: '#93c5fd', mid: '#2563eb', deep: '#1e3a8a' }, // Royal Sapphire
        { name: 'emerald', base: '#86efac', mid: '#10b981', deep: '#064e3b' }, // Imperial Emerald
        { name: 'ruby', base: '#fda4af', mid: '#f43f5e', deep: '#881337' }, // Sovereign Ruby
        { name: 'topaz', base: '#fef08a', mid: '#f59e0b', deep: '#78350f' }, // Golden Topaz
      ];

      const orbitRadiusX = isShowcase ? 48 : 42;
      const orbitRadiusY = isShowcase ? 28 : 24;

      gemColors.forEach((gem, gi) => {
        const gemAngle = now * 0.0028 + (gi * Math.PI * 2) / gemColors.length;
        const gemX = Math.cos(gemAngle) * orbitRadiusX;
        const gemY = Math.sin(gemAngle) * orbitRadiusY + 2;
        const gemZ = Math.sin(gemAngle); // -1 (back) to +1 (front)
        const gemScale = 0.85 + gemZ * 0.25;

        // Golden Stardust Trail behind orbiting gems
        for (let ti = 1; ti <= 3; ti++) {
          const trailAngle = gemAngle - ti * 0.12;
          const trailX = Math.cos(trailAngle) * orbitRadiusX;
          const trailY = Math.sin(trailAngle) * orbitRadiusY + 2;
          ctx.fillStyle = `rgba(251, 191, 36, ${0.45 / ti})`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, 1.4 / ti, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.translate(gemX, gemY);
        ctx.scale(gemScale, gemScale);

        // Draw Faceted Gemstone / Brilliant Diamond
        const gRad = 5.2;
        // Outer diamond facets
        ctx.fillStyle = gem.mid;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, -gRad); // Top vertex
        ctx.lineTo(gRad * 0.9, -gRad * 0.3);
        ctx.lineTo(gRad * 0.6, gRad);
        ctx.lineTo(-gRad * 0.6, gRad);
        ctx.lineTo(-gRad * 0.9, -gRad * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner table facet (Top face)
        ctx.fillStyle = gem.base;
        ctx.beginPath();
        ctx.moveTo(0, -gRad * 0.6);
        ctx.lineTo(gRad * 0.5, -gRad * 0.2);
        ctx.lineTo(gRad * 0.3, gRad * 0.4);
        ctx.lineTo(-gRad * 0.3, gRad * 0.4);
        ctx.lineTo(-gRad * 0.5, -gRad * 0.2);
        ctx.closePath();
        ctx.fill();

        // 4-Point Sparkling Star Flare on Gem
        const twinkle = Math.max(0, Math.sin(now * 0.008 + gi * 2.2));
        if (twinkle > 0.4) {
          const flareLen = 8 * twinkle;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-flareLen, 0);
          ctx.lineTo(flareLen, 0);
          ctx.moveTo(0, -flareLen);
          ctx.lineTo(0, flareLen);
          ctx.stroke();
        }

        ctx.restore();
      });
      ctx.restore();

      // 3. Sovereign 24K Pure Gold Regalia Fuselage
      ctx.fillStyle = '#b45309'; // Rich 24K Polished Gold Base
      ctx.strokeStyle = '#fef08a'; // Radiant Pale Gold Rim
      ctx.lineWidth = 2.4;

      ctx.beginPath();
      // Imperial Crown Prow
      ctx.moveTo(0, -36); // Center Crown Scepter
      ctx.lineTo(3, -24);
      ctx.lineTo(7, -30); // Right Crown Jewel Spike
      ctx.lineTo(6, -16);
      ctx.lineTo(14, -8);
      ctx.lineTo(38, 8); // Sovereign Angel Wingtip
      ctx.lineTo(34, 18);
      ctx.lineTo(24, 14);
      ctx.lineTo(28, 24); // Imperial Feather Flange
      ctx.lineTo(16, 20);
      ctx.lineTo(14, 28);
      ctx.lineTo(4, 24);
      ctx.lineTo(0, 28); // Sovereign Crest Tail
      ctx.lineTo(-4, 24);
      ctx.lineTo(-14, 28);
      ctx.lineTo(-16, 20);
      ctx.lineTo(-28, 24); // Imperial Feather Flange left
      ctx.lineTo(-24, 14);
      ctx.lineTo(-34, 18);
      ctx.lineTo(-38, 8); // Sovereign Angel Wingtip left
      ctx.lineTo(-14, -8);
      ctx.lineTo(-6, -16);
      ctx.lineTo(-7, -30); // Left Crown Jewel Spike
      ctx.lineTo(-3, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White Porcelain Enamel Wing Inlays with Gold Filigree
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(10, -4);
      ctx.lineTo(26, 8);
      ctx.lineTo(16, 12);
      ctx.lineTo(0, 16);
      ctx.lineTo(-16, 12);
      ctx.lineTo(-26, 8);
      ctx.lineTo(-10, -4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 4. Central Imperial Sapphire Core & Golden Celestial Halo
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 12 + Math.sin(now * 0.006) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const sapphireGrad = ctx.createRadialGradient(0, -3, 1, 0, -3, 7);
      sapphireGrad.addColorStop(0, '#ffffff');
      sapphireGrad.addColorStop(0.3, '#60a5fa');
      sapphireGrad.addColorStop(0.7, '#1d4ed8');
      sapphireGrad.addColorStop(1, '#172554');
      ctx.fillStyle = sapphireGrad;
      ctx.beginPath();
      ctx.arc(0, -3, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();
      ctx.restore();
      return;
    }

    // =============================================================
    // DEFAULT: ARC_TEMPEST (LX-88 Lôi Quang Tiên Phong Tiêu Chuẩn)
    // =============================================================
    // Central + Twin Nacelle Thrusters
    drawThruster(-14, 21, 5, 22);
    drawThruster(0, 26, 7, 28);
    drawThruster(14, 21, 5, 22);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 22 : 15;

    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.2;

    // Dual Forward Prongs & Heavy Tempest Wings
    ctx.beginPath();
    ctx.moveTo(-6, -32);
    ctx.lineTo(-3, -16);
    ctx.lineTo(0, -9);
    ctx.lineTo(3, -16);
    ctx.lineTo(6, -32);
    ctx.lineTo(12, -15);
    ctx.lineTo(18, -6);
    ctx.lineTo(38, 12); // Broad right wing
    ctx.lineTo(32, 22);
    ctx.lineTo(18, 18);
    ctx.lineTo(14, 26);
    ctx.lineTo(4, 24);
    ctx.lineTo(0, 28);
    ctx.lineTo(-4, 24);
    ctx.lineTo(-14, 26);
    ctx.lineTo(-18, 18);
    ctx.lineTo(-32, 22);
    ctx.lineTo(-38, 12); // Broad left wing
    ctx.lineTo(-18, -6);
    ctx.lineTo(-12, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // High-Voltage Capacitor Rail Inlays
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, -28);
    ctx.lineTo(-4, -12);
    ctx.moveTo(4, -28);
    ctx.lineTo(4, -12);
    ctx.stroke();

    // Central High Voltage Capacitor Core
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.arc(0, 2, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Azure Energy Canopy
    const eyeGrad = ctx.createRadialGradient(0, -4, 1, 0, -4, 6);
    eyeGrad.addColorStop(0, '#ffffff');
    eyeGrad.addColorStop(0.4, '#38bdf8');
    eyeGrad.addColorStop(1, '#075985');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(0, -4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 3. ASTRAEA (SX-77 Tinh Cầu Hộ Mệnh - Prismatic Star Wings)
  // -------------------------------------------------------------
  if (fighter.id === 'astraea') {
    const isSakura = skin === 'skin_astraea_sakura';

    if (isSakura) {
      // =========================================================
      // SX-77 ASTRAL CHERRY BLOSSOM [EPIC] (HOA ANH ĐÀO THẦN MỘC)
      // =========================================================
      // 1. ORBITING SAKURA BLOSSOM PETALS (CÁNH HOA ANH ĐÀO BAY LƯỢN QUANH MÁY BAY)
      ctx.save();
      const petalCount = 7;
      const orbitA = 34 + pulse * 3;
      const orbitB = 22;

      for (let pIdx = 0; pIdx < petalCount; pIdx++) {
        const pAng = now * 0.0022 + (pIdx * Math.PI * 2) / petalCount;
        const px = Math.cos(pAng) * orbitA;
        const py = Math.sin(pAng) * orbitB + Math.sin(now * 0.004 + pIdx) * 3;
        const pSpin = now * 0.0035 + pIdx * 1.2;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(pSpin);
        ctx.shadowColor = 'rgba(244, 114, 182, 0.9)';
        ctx.shadowBlur = 8;

        // Draw 1 Sakura Petal (Heart/notched blossom petal)
        const petGrad = ctx.createLinearGradient(0, -6, 0, 6);
        petGrad.addColorStop(0, '#ffffff');
        petGrad.addColorStop(0.35, '#fbcfe8');
        petGrad.addColorStop(1, '#f472b6');
        ctx.fillStyle = petGrad;

        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.bezierCurveTo(-4, 2, -4.5, -4, -2, -5.5);
        ctx.lineTo(0, -3.5); // Petal tip notch
        ctx.lineTo(2, -5.5);
        ctx.bezierCurveTo(4.5, -4, 4, 2, 0, 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // 2. SAKURA BLOSSOM THRUSTERS
      drawThruster(-12, 21, 6, 24);
      drawThruster(12, 21, 6, 24);

      ctx.save();
      ctx.shadowColor = 'rgba(244, 114, 182, 0.95)';
      ctx.shadowBlur = isShowcase ? 22 : 15;

      // 3. SAKURA MECHA BLOSSOM WINGS (5-Petal Scalloped Sakura Wings)
      const sakuraHullGrad = ctx.createLinearGradient(0, -36, 0, 26);
      sakuraHullGrad.addColorStop(0, '#ffffff');
      sakuraHullGrad.addColorStop(0.3, '#fbcfe8');
      sakuraHullGrad.addColorStop(0.8, '#f472b6');
      sakuraHullGrad.addColorStop(1, '#db2777');

      ctx.fillStyle = sakuraHullGrad;
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 2.0;

      ctx.beginPath();
      ctx.moveTo(0, -36); // Sakura bud tip
      ctx.bezierCurveTo(5, -28, 8, -18, 12, -10);
      // Upper blossom petal curve
      ctx.bezierCurveTo(20, -14, 32, -8, 38, 2);
      ctx.lineTo(36, 8); // Petal notch
      // Lower blossom petal sweep
      ctx.bezierCurveTo(34, 16, 24, 18, 16, 14);
      ctx.lineTo(12, 25);
      ctx.lineTo(0, 20);
      ctx.lineTo(-12, 25);
      ctx.lineTo(-16, 14);
      ctx.bezierCurveTo(-24, 18, -34, 16, -36, 8);
      ctx.lineTo(-38, 2);
      ctx.bezierCurveTo(-32, -8, -20, -14, -12, -10);
      ctx.bezierCurveTo(-8, -18, -5, -28, 0, -36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Ivory Silk Floral Plating
      ctx.fillStyle = '#fff1f2';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.bezierCurveTo(6, -18, 10, -4, 16, 2);
      ctx.lineTo(8, 12);
      ctx.lineTo(0, 14);
      ctx.lineTo(-8, 12);
      ctx.bezierCurveTo(-10, -4, -6, -18, 0, -28);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Delicate Pink Petal Vein Lines
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(10, -8);
      ctx.quadraticCurveTo(24, -2, 34, 4);
      ctx.moveTo(-10, -8);
      ctx.quadraticCurveTo(-24, -2, -34, 4);
      ctx.stroke();

      // 4. CENTRAL 5-PETAL SAKURA BLOSSOM EMBLEM
      ctx.save();
      ctx.translate(0, 0);
      ctx.rotate(now * 0.001);
      for (let fIdx = 0; fIdx < 5; fIdx++) {
        const fAng = (fIdx * Math.PI * 2) / 5;
        ctx.save();
        ctx.rotate(fAng);
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-3, -3, -4, -8, -1.5, -9);
        ctx.lineTo(0, -7.5); // Petal tip cleft
        ctx.lineTo(1.5, -9);
        ctx.bezierCurveTo(4, -8, 3, -3, 0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // Golden stamen center
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. SPRING CRYSTAL COCKPIT
      const springCockpitGrad = ctx.createLinearGradient(0, -22, 0, -2);
      springCockpitGrad.addColorStop(0, '#ffffff');
      springCockpitGrad.addColorStop(0.4, '#fbcfe8');
      springCockpitGrad.addColorStop(1, '#db2777');
      ctx.fillStyle = springCockpitGrad;
      ctx.beginPath();
      ctx.ellipse(0, -12, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Specular glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.ellipse(-1.2, -15, 1.2, 3.2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      ctx.restore();
      return;
    }

    // Default SX-77 Astraea (Celestial Diamond Star)
    drawThruster(-12, 21, 6, 24);
    drawThruster(12, 21, 6, 24);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 24 : 16;

    // Prismatic celestial halo with 8 rotating starlight nodes
    ctx.save();
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.7 + pulse * 0.3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32 + pulse * 4, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let si = 0; si < 6; si++) {
      const sang = now * 0.003 + (si * Math.PI * 2) / 6;
      const sx = Math.cos(sang) * (32 + pulse * 4);
      const sy = Math.sin(sang) * 20;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Main fuselage: elegant diamond star
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(0, -36); // Top crystal point
    ctx.lineTo(10, -12);
    ctx.lineTo(36, 4); // Crystal star wing right
    ctx.lineTo(28, 16);
    ctx.lineTo(16, 14);
    ctx.lineTo(11, 25);
    ctx.lineTo(0, 19);
    ctx.lineTo(-11, 25);
    ctx.lineTo(-16, 14);
    ctx.lineTo(-28, 16);
    ctx.lineTo(-36, 4); // Crystal star wing left
    ctx.lineTo(-10, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Prismatic Gem Core
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 15);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 4. SOLARIS (ZX-99 Thái Dương Thần - Twin Solar Turbines)
  // -------------------------------------------------------------
  if (fighter.id === 'solaris') {
    // Twin massive plasma turbines
    drawThruster(-14, 25, 8, 30);
    drawThruster(14, 25, 8, 30);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 24 : 17;

    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.4;

    // Solar Wings with radiator fin arrays
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(10, -14);
    ctx.lineTo(22, -4);
    ctx.lineTo(40, 12); // Broad solar panel sweep
    ctx.lineTo(34, 24);
    ctx.lineTo(20, 18);
    ctx.lineTo(14, 27);
    ctx.lineTo(0, 23);
    ctx.lineTo(-14, 27);
    ctx.lineTo(-20, 18);
    ctx.lineTo(-34, 24);
    ctx.lineTo(-40, 12);
    ctx.lineTo(-22, -4);
    ctx.lineTo(-10, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Solar Core Turbine Spheres with solar corona rings
    ctx.fillStyle = skin === 'skin_solaris_cyberpunk' ? '#ff007f' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(-14, 6, 6, 0, Math.PI * 2);
    ctx.arc(14, 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Solar Cockpit Canopy
    ctx.fillStyle = skin === 'skin_solaris_cyberpunk' ? '#00f2fe' : '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, -9, 5.5, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 5. CHRONO (TX-0 Kỷ Nguyên Lượng Tử - Tachyon Rings)
  // -------------------------------------------------------------
  if (fighter.id === 'chrono') {
    // Tri-thruster quantum drive
    drawThruster(-12, 21, 5, 22);
    drawThruster(0, 25, 6, 26);
    drawThruster(12, 21, 5, 22);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 24 : 16;

    // Tachyon Time-Dilation Dual Rings with temporal ticks
    ctx.save();
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.ellipse(0, -2, 30, 30, (now * 0.003) % (Math.PI * 2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -2, 22, 22, -(now * 0.004) % (Math.PI * 2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Chrono Stealth Hull
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(0, -36); // Sharp needle nose
    ctx.lineTo(8, -15);
    ctx.lineTo(25, 0);
    ctx.lineTo(36, 18);
    ctx.lineTo(24, 18);
    ctx.lineTo(13, 14);
    ctx.lineTo(8, 25);
    ctx.lineTo(0, 21);
    ctx.lineTo(-8, 25);
    ctx.lineTo(-13, 14);
    ctx.lineTo(-24, 18);
    ctx.lineTo(-36, 18);
    ctx.lineTo(-25, 0);
    ctx.lineTo(-8, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Quantum Vortex Fuselage
    const vortexGrad = ctx.createRadialGradient(0, -2, 1, 0, -2, 9);
    vortexGrad.addColorStop(0, '#ffffff');
    vortexGrad.addColorStop(0.5, secondaryColor);
    vortexGrad.addColorStop(1, primaryColor);
    ctx.fillStyle = vortexGrad;
    ctx.beginPath();
    ctx.ellipse(0, -7, 5, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 6. APOCALYPSE (EX-Omega Tận Thế - Jagged Heavy Dreadnought)
  // -------------------------------------------------------------
  if (fighter.id === 'apocalypse') {
    // Quad Hellfire Thrusters
    drawThruster(-17, 23, 5, 24);
    drawThruster(-7, 26, 6, 28);
    drawThruster(7, 26, 6, 28);
    drawThruster(17, 23, 5, 24);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 26 : 18;

    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.4;

    // Menacing Jagged Demon Wings
    ctx.beginPath();
    ctx.moveTo(0, -34); // Heavy spike prow
    ctx.lineTo(6, -19);
    ctx.lineTo(14, -15);
    ctx.lineTo(22, -22); // Demon horn barb
    ctx.lineTo(23, -6);
    ctx.lineTo(42, 14); // Huge serrated wing
    ctx.lineTo(33, 23);
    ctx.lineTo(24, 17);
    ctx.lineTo(18, 26);
    ctx.lineTo(0, 21);
    ctx.lineTo(-18, 26);
    ctx.lineTo(-24, 17);
    ctx.lineTo(-33, 23);
    ctx.lineTo(-42, 14); // Huge serrated wing left
    ctx.lineTo(-23, -6);
    ctx.lineTo(-22, -22); // Demon horn barb left
    ctx.lineTo(-14, -15);
    ctx.lineTo(-6, -19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Magma Vent Cracks with glowing core
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(0, -11);
    ctx.lineTo(10, 0);
    ctx.moveTo(-6, 8);
    ctx.lineTo(0, 2);
    ctx.lineTo(6, 8);
    ctx.stroke();

    // Core furnace
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 7. VALKYRIE (VX-1 Nữ Thần Cánh Bạc - Angelic Swept Wings)
  // -------------------------------------------------------------
  if (fighter.id === 'valkyrie') {
    // Twin holy starlight thrusters
    drawThruster(-11, 23, 6, 26);
    drawThruster(11, 23, 6, 26);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 24 : 16;

    // Radiant Angel Halo
    ctx.save();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -19, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Feathered Swept Wings
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(0, -36); // Holy Spear Tip
    ctx.lineTo(8, -15);
    ctx.lineTo(17, -5);
    ctx.lineTo(38, 6); // Wing feather 1
    ctx.lineTo(35, 15);
    ctx.lineTo(26, 13);
    ctx.lineTo(31, 21); // Wing feather 2
    ctx.lineTo(20, 19);
    ctx.lineTo(12, 26);
    ctx.lineTo(0, 23);
    ctx.lineTo(-12, 26);
    ctx.lineTo(-20, 19);
    ctx.lineTo(-31, 21); // Wing feather 2 left
    ctx.lineTo(-26, 13);
    ctx.lineTo(-35, 15);
    ctx.lineTo(-38, 6); // Wing feather 1 left
    ctx.lineTo(-17, -5);
    ctx.lineTo(-8, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Holy Aegis Crystal Canopy
    const valkCanopy = ctx.createLinearGradient(0, -19, 0, 5);
    valkCanopy.addColorStop(0, '#ffffff');
    valkCanopy.addColorStop(0.5, secondaryColor);
    valkCanopy.addColorStop(1, '#0284c7');
    ctx.fillStyle = valkCanopy;
    ctx.beginPath();
    ctx.ellipse(0, -5, 5, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 8. OUROBOROS (OX-88 Hắc Long Vô Tận / Dragon Mecha)
  // -------------------------------------------------------------
  if (fighter.id === 'ouroboros') {
    // Twin Emerald Dragonfire Thrusters
    drawThruster(-12, 24, 6, 28);
    drawThruster(12, 24, 6, 28);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 24 : 17;

    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.4;

    // Draconic Horned Wing Frame
    ctx.beginPath();
    ctx.moveTo(0, -34); // Dragon Snout
    ctx.lineTo(8, -23);
    ctx.lineTo(15, -30); // Dragon Right Horn
    ctx.lineTo(13, -15);
    ctx.lineTo(25, -4);
    ctx.lineTo(40, 10); // Dragon Wing Spine 1
    ctx.lineTo(33, 19);
    ctx.lineTo(25, 15);
    ctx.lineTo(27, 26); // Dragon Tail Fin
    ctx.lineTo(14, 21);
    ctx.lineTo(0, 27);
    ctx.lineTo(-14, 21);
    ctx.lineTo(-27, 26);
    ctx.lineTo(-25, 15);
    ctx.lineTo(-33, 19);
    ctx.lineTo(-40, 10); // Dragon Wing Spine 1 left
    ctx.lineTo(-25, -4);
    ctx.lineTo(-13, -15);
    ctx.lineTo(-15, -30); // Dragon Left Horn
    ctx.lineTo(-8, -23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Dragon Eyes (Twin Glowing Slits)
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(-4.5, -15, 2, 4.5, -0.2, 0, Math.PI * 2);
    ctx.ellipse(4.5, -15, 2, 4.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Emerald Scaled Core
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(7, 4);
    ctx.lineTo(0, 15);
    ctx.lineTo(-7, 4);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 9. NEBULA_SOVEREIGN (Tối Cao Tinh Vân - Cosmic Void Cruiser)
  // -------------------------------------------------------------
  if (fighter.id === 'nebula_sovereign') {
    drawThruster(-15, 21, 6, 24);
    drawThruster(0, 25, 8, 28);
    drawThruster(15, 21, 6, 24);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 24 : 17;

    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.4;

    // Broad Crescent Nebula Wings
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.lineTo(11, -13);
    ctx.lineTo(25, -5);
    ctx.lineTo(41, 14);
    ctx.lineTo(31, 23);
    ctx.lineTo(19, 17);
    ctx.lineTo(12, 25);
    ctx.lineTo(0, 21);
    ctx.lineTo(-12, 25);
    ctx.lineTo(-19, 17);
    ctx.lineTo(-31, 23);
    ctx.lineTo(-41, 14);
    ctx.lineTo(-25, -5);
    ctx.lineTo(-11, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cosmic Galaxy Nebula Vortex
    const nebGrad = ctx.createRadialGradient(0, -2, 1, 0, -2, 11);
    nebGrad.addColorStop(0, '#ffffff');
    nebGrad.addColorStop(0.5, '#c084fc');
    nebGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = nebGrad;
    ctx.beginPath();
    ctx.arc(0, -2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 10. QUASAR_TITAN (Kình Thiên Khổng Thần - Heavy Cosmic Dreadnought)
  // -------------------------------------------------------------
  if (fighter.id === 'quasar_titan') {
    // Quad Heavy Plasma Thrusters
    drawThruster(-17, 25, 6, 28);
    drawThruster(-8, 27, 6, 30);
    drawThruster(8, 27, 6, 30);
    drawThruster(17, 25, 6, 28);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 24 : 17;

    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.5;

    // Heavy Armor Plated Titan Wings
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(13, -19);
    ctx.lineTo(23, -13);
    ctx.lineTo(40, 8);
    ctx.lineTo(35, 25);
    ctx.lineTo(21, 21);
    ctx.lineTo(11, 27);
    ctx.lineTo(0, 25);
    ctx.lineTo(-11, 27);
    ctx.lineTo(-21, 21);
    ctx.lineTo(-35, 25);
    ctx.lineTo(-40, 8);
    ctx.lineTo(-23, -13);
    ctx.lineTo(-13, -19);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Reinforced Titanium Shield Plates
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(-13, -4, 26, 11);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(-13, -4, 26, 11);

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // 11. CHRONOS_PHANTOM (Thời Không Ảo Ảnh - Mirage Razor Wings)
  // -------------------------------------------------------------
  if (fighter.id === 'chronos_phantom') {
    // Twin stealth warp thrusters
    drawThruster(-10, 22, 5, 24);
    drawThruster(10, 22, 5, 24);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = isShowcase ? 24 : 16;

    // Ghostly Mirage Echo (Phase Shift)
    ctx.save();
    ctx.globalAlpha = 0.4 + rapidPulse * 0.3;
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(34, 17);
    ctx.lineTo(0, 23);
    ctx.lineTo(-34, 17);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Solid Mirage Hull
    ctx.fillStyle = primaryColor;
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(8, -16);
    ctx.lineTo(19, -5);
    ctx.lineTo(37, 14);
    ctx.lineTo(26, 19);
    ctx.lineTo(13, 15);
    ctx.lineTo(8, 24);
    ctx.lineTo(0, 19);
    ctx.lineTo(-8, 24);
    ctx.lineTo(-13, 15);
    ctx.lineTo(-26, 19);
    ctx.lineTo(-37, 14);
    ctx.lineTo(-19, -5);
    ctx.lineTo(-8, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tachyon Razor Canopy
    const phanCanopy = ctx.createLinearGradient(0, -19, 0, 5);
    phanCanopy.addColorStop(0, '#ffffff');
    phanCanopy.addColorStop(0.5, secondaryColor);
    phanCanopy.addColorStop(1, '#3b0764');
    ctx.fillStyle = phanCanopy;
    ctx.beginPath();
    ctx.ellipse(0, -5, 4.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
    ctx.restore();
    return;
  }

  // -------------------------------------------------------------
  // FALLBACK: Generic / Tier A & B fighters
  // -------------------------------------------------------------
  drawThruster(-8, 20, 6, 20);
  drawThruster(8, 20, 6, 20);

  ctx.save();
  ctx.fillStyle = primaryColor;
  ctx.strokeStyle = secondaryColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(24, 14);
  ctx.lineTo(12, 12);
  ctx.lineTo(0, 20);
  ctx.lineTo(-12, 12);
  ctx.lineTo(-24, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = secondaryColor;
  ctx.beginPath();
  ctx.ellipse(0, -4, 4, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}
