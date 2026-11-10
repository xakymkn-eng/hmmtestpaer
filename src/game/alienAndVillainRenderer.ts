/**
 * Alien Bio-Monsters & Villainous Combat Aircraft Renderers
 * Completely replaces legacy simplistic polygons for ALL non-adventure enemies.
 * Features:
 * - Alien Bio-Monsters: Chitinous carapaces, undulating tentacles/fins, glowing multi-eye clusters,
 *   pulsating bio-plasma toxin sacs, and breathing organic silhouettes.
 * - Villainous Aircraft: Heavy faceted stealth armor plates, forward-swept razor wings,
 *   illuminated crimson/amethyst sensor visors, heavy cannon hardpoints, and roaring ion afterburners.
 */

export interface RenderEnemyContext {
  ctx: CanvasRenderingContext2D;
  timeAlive: number;
  width: number;
  height: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  isHitFlash: boolean;
  phase?: number;
  isEnraged?: boolean;
}

/**
 * 1. Boss: Dreadnought Villain Flagship / Cosmic Void Behemoth
 */
export function drawVillainFlagshipBoss(
  ctx: CanvasRenderingContext2D,
  time: number,
  isHitFlash: boolean,
  isEnraged: boolean = false,
  phase: number = 1
) {
  const now = performance.now();
  const pulse = Math.sin(now * 0.006) * 0.2 + 0.8;
  const rageColor = isEnraged ? '#ef4444' : phase === 3 ? '#a855f7' : '#f97316';

  // Twin massive ion exhaust afterburners (pointing up in local space)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  [-36, 36].forEach((exX) => {
    const flameH = (isEnraged ? 45 : 30) + Math.sin(now * 0.04 + exX) * 8;
    const flameGrad = ctx.createLinearGradient(exX, -50, exX, -50 - flameH);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, rageColor);
    flameGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(exX - 10, -48);
    ctx.lineTo(exX, -50 - flameH);
    ctx.lineTo(exX + 10, -48);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();

  // Main Heavy Armored Flagship Fuselage
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#0a0f1d';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : rageColor;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(0, 56); // Forward ram prow
  ctx.lineTo(24, 38);
  ctx.lineTo(45, 42); // Forward weapon pods
  ctx.lineTo(76, 16); // Main wingtip
  ctx.lineTo(72, -18);
  ctx.lineTo(52, -12);
  ctx.lineTo(48, -48); // Rear engine nacelle
  ctx.lineTo(24, -40);
  ctx.lineTo(12, -48);
  ctx.lineTo(0, -42);
  ctx.lineTo(-12, -48);
  ctx.lineTo(-24, -40);
  ctx.lineTo(-48, -48);
  ctx.lineTo(-52, -12);
  ctx.lineTo(-72, -18);
  ctx.lineTo(-76, 16);
  ctx.lineTo(-45, 42);
  ctx.lineTo(-24, 38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Layered Titanium Armor Plates
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#111827';
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  // Left armor wing
  ctx.beginPath();
  ctx.moveTo(-18, 28);
  ctx.lineTo(-64, 12);
  ctx.lineTo(-44, -10);
  ctx.lineTo(-16, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Right armor wing
  ctx.beginPath();
  ctx.moveTo(18, 28);
  ctx.lineTo(64, 12);
  ctx.lineTo(44, -10);
  ctx.lineTo(16, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Menacing Glowing Crimson Command Bridge (Angled stealth visor)
  const bridgeGrad = ctx.createLinearGradient(0, 16, 0, 32);
  bridgeGrad.addColorStop(0, '#fca5a5');
  bridgeGrad.addColorStop(0.5, rageColor);
  bridgeGrad.addColorStop(1, '#450a0a');
  ctx.fillStyle = bridgeGrad;
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(14, 20);
  ctx.lineTo(0, 24);
  ctx.lineTo(-14, 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Central Supermassive Dark-Matter Energy Reactor Core with Containment Ribs
  const coreRad = 16 * pulse;
  const coreGrad = ctx.createRadialGradient(0, -8, 2, 0, -8, coreRad + 6);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.4, rageColor);
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, -8, coreRad + 6, 0, Math.PI * 2);
  ctx.fill();

  // Containment Core Ribs
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(-12, -18, 24, 20);
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(12, -8);
  ctx.stroke();

  // Heavy Rotary Plasma Battery Turrets (Left & Right)
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(-52, 22, 8, 20);
  ctx.fillRect(44, 22, 8, 20);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-50, 40, 4, 6);
  ctx.fillRect(46, 40, 4, 6);
}

/**
 * 2. Scout / Grunt: Villain Razor Scout Jet (Máy bay phản diện cảm tử trinh sát)
 */
export function drawVillainRazorScout(ctx: CanvasRenderingContext2D, isHitFlash: boolean, color: string = '#ef4444') {
  const now = performance.now();
  // Thruster flame
  const flm = 8 + Math.sin(now * 0.05) * 3;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
  ctx.beginPath();
  ctx.moveTo(-3, -15);
  ctx.lineTo(0, -15 - flm);
  ctx.lineTo(3, -15);
  ctx.closePath();
  ctx.fill();

  // Aggressive forward-swept delta hull
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#090d16';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : color;
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.moveTo(0, 18); // Needle nose
  ctx.lineTo(14, 4);
  ctx.lineTo(16, -12); // Forward-swept wingtip
  ctx.lineTo(8, -8);
  ctx.lineTo(4, -14);
  ctx.lineTo(-4, -14);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-16, -12);
  ctx.lineTo(-14, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing red optical cockpit visor
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(4, 2);
  ctx.lineTo(-4, 2);
  ctx.closePath();
  ctx.fill();
}

/**
 * 3. Viper: Alien Xenomorph Mantis Hunter (Quái vật bọ ngoài hành tinh săn mồi)
 */
export function drawAlienMantisHunter(ctx: CanvasRenderingContext2D, timeAlive: number, isHitFlash: boolean) {
  const now = performance.now();
  const flap = Math.sin(timeAlive * 12) * 4;

  // Segmented Chitin Carapace
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#022c22';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#10b981';
  ctx.lineWidth = 1.8;

  // Bio insectoid wings (Left & Right) undulating
  ctx.save();
  ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1;
  // Left wing
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(-22 - flap, -8, -26 - flap, 8);
  ctx.quadraticCurveTo(-14, 14, 0, 8);
  ctx.fill();
  ctx.stroke();
  // Right wing
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(22 + flap, -8, 26 + flap, 8);
  ctx.quadraticCurveTo(14, 14, 0, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Torso & Chitin segments
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#064e3b';
  ctx.beginPath();
  ctx.ellipse(0, 2, 8, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Serrated Mantis Scythes / Venom Mandibles (pointing down toward player)
  const scytheGrip = Math.sin(now * 0.008) * 3;
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2.2;
  // Left scythe
  ctx.beginPath();
  ctx.moveTo(-5, 12);
  ctx.lineTo(-12 + scytheGrip, 24);
  ctx.lineTo(-4 + scytheGrip, 28);
  ctx.stroke();
  // Right scythe
  ctx.beginPath();
  ctx.moveTo(5, 12);
  ctx.lineTo(12 - scytheGrip, 24);
  ctx.lineTo(4 - scytheGrip, 28);
  ctx.stroke();

  // 3-Eye Glowing Alien Cluster
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(-3, 14, 2, 0, Math.PI * 2);
  ctx.arc(3, 14, 2, 0, Math.PI * 2);
  ctx.arc(0, 18, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Bioluminescent venom sack at abdomen
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(0, -8, 4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 4. Cruiser: Villain Obsidian Heavy Gunship (Chiến hạm phản diện bọc thép)
 */
export function drawVillainObsidianCruiser(ctx: CanvasRenderingContext2D, isHitFlash: boolean) {
  const now = performance.now();
  // Dual ion thruster plumes
  [-8, 8].forEach((tx) => {
    const flameH = 12 + Math.sin(now * 0.04 + tx) * 4;
    ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
    ctx.beginPath();
    ctx.moveTo(tx - 3.5, -24);
    ctx.lineTo(tx, -24 - flameH);
    ctx.lineTo(tx + 3.5, -24);
    ctx.closePath();
    ctx.fill();
  });

  // Heavy stealth faceted armor
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#0b1120';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#f43f5e';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 28); // Sharp bow
  ctx.lineTo(18, 16);
  ctx.lineTo(28, 10);
  ctx.lineTo(26, -24); // Rear wing
  ctx.lineTo(12, -18);
  ctx.lineTo(0, -22);
  ctx.lineTo(-12, -18);
  ctx.lineTo(-26, -24);
  ctx.lineTo(-28, 10);
  ctx.lineTo(-18, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Armor Plates & Thermal Grates
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-14, -8, 28, 12);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(-14, -8, 28, 12);

  // Twin kinetic rotary cannon pods
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-18, 12, 5, 14);
  ctx.fillRect(13, 12, 5, 14);

  // Ruby targeting visor
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(-6, 8, 12, 4);
}

/**
 * 5. Destroyer: Alien Bio-Crustacean Ravager (Quái vật ngoài hành tinh giáp xác)
 */
export function drawAlienBioRavager(ctx: CanvasRenderingContext2D, timeAlive: number, isHitFlash: boolean) {
  const breath = Math.sin(timeAlive * 4) * 2;

  // Segmented Bio-Shell
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#2e1065';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#c084fc';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 34); // Stinger head
  ctx.lineTo(16, 22);
  ctx.lineTo(34 + breath, 8); // Armored spiky carapace
  ctx.lineTo(28, -26);
  ctx.lineTo(12, -20);
  ctx.lineTo(0, -32);
  ctx.lineTo(-12, -20);
  ctx.lineTo(-28, -26);
  ctx.lineTo(-34 - breath, 8);
  ctx.lineTo(-16, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Undulating organic bio-glands
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.arc(0, -4, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f0abfc';
  ctx.beginPath();
  ctx.arc(0, -4, 5, 0, Math.PI * 2);
  ctx.fill();

  // Lateral bio-tentacle spines
  ctx.strokeStyle = '#e879f9';
  ctx.lineWidth = 2;
  [-1, 1].forEach((dir) => {
    ctx.beginPath();
    ctx.moveTo(dir * 18, 12);
    ctx.quadraticCurveTo(dir * 28, 26, dir * 22, 38);
    ctx.stroke();
  });
}

/**
 * 6. Stealth Phantom: Villain Night-Wraith Stealth Fighter (Phi cơ tàng hình phản diện)
 */
export function drawVillainNightWraith(ctx: CanvasRenderingContext2D, isHitFlash: boolean) {
  const now = performance.now();
  // Phase cloaking pulse
  const phaseAlpha = 0.65 + Math.sin(now * 0.008) * 0.35;

  ctx.save();
  ctx.globalAlpha = isHitFlash ? 1.0 : phaseAlpha;

  // Faceted stealth fuselage
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#050811';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#a855f7';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.lineTo(24, -12);
  ctx.lineTo(14, -22);
  ctx.lineTo(0, -16);
  ctx.lineTo(-14, -22);
  ctx.lineTo(-24, -12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Diamond Canopy & Phase Energy Conduits
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.lineTo(10, 0);
  ctx.lineTo(0, -8);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = '#9333ea';
  ctx.beginPath();
  ctx.arc(0, -2, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 7. Carrier: Alien Hive Broodmother (Tổ mẹ sinh học ngoài hành tinh)
 */
export function drawAlienHiveBroodmother(ctx: CanvasRenderingContext2D, timeAlive: number, isHitFlash: boolean) {
  const pulse = Math.sin(timeAlive * 3) * 3;

  ctx.fillStyle = isHitFlash ? '#ffffff' : '#1e1b4b';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#818cf8';
  ctx.lineWidth = 2.2;

  // Big organic hive shell
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.lineTo(38 + pulse, 16);
  ctx.lineTo(36, -30);
  ctx.lineTo(18, -36);
  ctx.lineTo(0, -30);
  ctx.lineTo(-18, -36);
  ctx.lineTo(-36, -30);
  ctx.lineTo(-38 - pulse, 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Brood Egg Sacs
  [-16, 0, 16].forEach((ox, idx) => {
    ctx.fillStyle = idx === 1 ? '#6366f1' : '#a5b4fc';
    ctx.beginPath();
    ctx.ellipse(ox, -6, 6, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

/**
 * 8. Plasma Mortar: Villain Heavy Siege Fortress (Pháo đài hỏa lực phản diện)
 */
export function drawVillainSiegeFortress(ctx: CanvasRenderingContext2D, isHitFlash: boolean) {
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#18181b';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#f97316';
  ctx.lineWidth = 2.5;

  // Heavy Octagonal Citadel
  ctx.beginPath();
  ctx.moveTo(-14, 26);
  ctx.lineTo(14, 26);
  ctx.lineTo(26, 10);
  ctx.lineTo(22, -24);
  ctx.lineTo(-22, -24);
  ctx.lineTo(-26, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dual Heavy Plasma Mortar Barrels
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(-16, -20, 8, 20);
  ctx.fillRect(8, -20, 8, 20);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(-14, 0, 4, 18);
  ctx.fillRect(10, 0, 4, 18);

  // Warning heat coils
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(-8, -10);
  ctx.moveTo(8, -10);
  ctx.lineTo(16, -10);
  ctx.stroke();
}

/**
 * 9. Spectre Assassin: Alien Void Jellyfish / Psionic Ghost (Quái vật tâm linh hư không)
 */
export function drawAlienVoidJellyfish(ctx: CanvasRenderingContext2D, timeAlive: number, isHitFlash: boolean) {
  const wave = Math.sin(timeAlive * 7) * 4;

  // Bioluminescent Jelly Bell (Carapace)
  ctx.fillStyle = isHitFlash ? '#ffffff' : 'rgba(131, 24, 67, 0.85)';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#f43f5e';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 24);
  ctx.quadraticCurveTo(18, 12, 18, -12);
  ctx.quadraticCurveTo(0, -22, -18, -12);
  ctx.quadraticCurveTo(-18, 12, 0, 24);
  ctx.fill();
  ctx.stroke();

  // Undulating Stinging Tentacles
  ctx.strokeStyle = '#fda4af';
  ctx.lineWidth = 1.8;
  [-12, -4, 4, 12].forEach((tx, idx) => {
    ctx.beginPath();
    ctx.moveTo(tx, -12);
    ctx.quadraticCurveTo(tx + Math.sin(timeAlive * 8 + idx) * 8, -26, tx + wave * (idx % 2 === 0 ? 1 : -1), -38);
    ctx.stroke();
  });

  // Glowing Psionic Core
  ctx.fillStyle = '#ffe4e6';
  ctx.beginPath();
  ctx.arc(0, 2, 5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 10. Shield Drone: Villain Aegis Defense Drone (Drone phòng thủ phản diện)
 */
export function drawVillainAegisDrone(ctx: CanvasRenderingContext2D, timeAlive: number, isHitFlash: boolean) {
  const rot = timeAlive * 2;

  // Armored Drone Core
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#0c4a6e';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#38bdf8';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rotating Tri-Node Magnetic Emitter Plates
  ctx.save();
  ctx.rotate(rot);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3;
    const px = Math.cos(ang) * 20;
    const py = Math.sin(ang) * 20;
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // Center Force-Field Generator
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 11. Vanguard Missile Frigate: Villain Vindicator Missile Frigate (Chiến hạm phóng tên lửa phản diện)
 */
export function drawVillainMissileFrigate(ctx: CanvasRenderingContext2D, isHitFlash: boolean) {
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#1c1917';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#f59e0b';
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.moveTo(0, 28);
  ctx.lineTo(28, 14);
  ctx.lineTo(24, -22);
  ctx.lineTo(-24, -22);
  ctx.lineTo(-28, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Twin Vertical Launch Missile Silos (with glowing warheads)
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-22, -12, 8, 18);
  ctx.fillRect(14, -12, 8, 18);

  ctx.fillStyle = '#ef4444';
  // Red warhead tips
  ctx.beginPath();
  ctx.arc(-18, -12, 3, 0, Math.PI * 2);
  ctx.arc(18, -12, 3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 12. Kamikaze: Alien Bio-Mine Parasite (Ký sinh trùng cảm tử ngoài hành tinh)
 */
export function drawAlienBioMine(ctx: CanvasRenderingContext2D, timeAlive: number, isHitFlash: boolean) {
  const pulse = Math.sin(timeAlive * 10) * 2;

  // Pulsating Spiky Toxic Bio-Sac
  ctx.fillStyle = isHitFlash ? '#ffffff' : '#7f1d1d';
  ctx.strokeStyle = isHitFlash ? '#ffffff' : '#f87171';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, 13 + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Writhing Chitin Spikes (6 radial spikes)
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI) / 3 + timeAlive * 2;
    const sx = Math.cos(ang) * (13 + pulse);
    const sy = Math.sin(ang) * (13 + pulse);
    const ex = Math.cos(ang) * (22 + pulse);
    const ey = Math.sin(ang) * (22 + pulse);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // Toxic Volatile Glowing Core
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
}
