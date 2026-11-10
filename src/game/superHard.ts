/**
 * Pure game rules, constants, and math calculations for 'CHẾ ĐỘ SIÊU KHÓ' (Super Hard Mode)
 * Decoupled from React and DOM for fast deterministic testing with node:test.
 */

export type BossSkillType =
  | 'cone_9_spread'
  | 'homing_6_missiles'
  | 'cone_sweep_right_to_left'
  | 'spawn_2_laser_drones'
  | 'charge_and_rush'
  | 'mega_gamma_beam'
  | 'laser_beam'
  | 'tracking_missiles'
  | 'mega_energy_blast';

export interface SuperHardBossConfig {
  wave: number;
  id: string;
  name: string;
  vietnameseTitle: string;
  subtitle: string;
  color: string;
  accentColor: string;
  baseHp: number;
  defense: number;
  skills: BossSkillType[];
}

export const SUPER_HARD_TOTAL_WAVES = 10;

/**
 * 10 distinct cosmic bosses for Waves 1 through 10 of Super Hard Mode
 */
export const SUPER_HARD_BOSSES: Record<number, SuperHardBossConfig> = {
  1: {
    wave: 1,
    id: 'sh_boss_1_titan',
    name: 'TITAN-X VANGUARD',
    vietnameseTitle: 'TRÙM ĐỢT 1: THIẾT GIÁP TIÊN PHONG TITAN-X',
    subtitle: 'Đạn Nón 9 Dải & Cụm 6 Tên Lửa Truy Kích 3 Giây',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    baseHp: 3200,
    defense: 25,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  2: {
    wave: 2,
    id: 'sh_boss_2_wraith',
    name: 'WRAITH-99 SPECTRE',
    vietnameseTitle: 'TRÙM ĐỢT 2: U LINH KHÔNG GIAN WRAITH-99',
    subtitle: 'Đạn Nón Quét Tử Thần & Drone Laser Truy Sát',
    color: '#a855f7',
    accentColor: '#c084fc',
    baseHp: 4400,
    defense: 32,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  3: {
    wave: 3,
    id: 'sh_boss_3_volt',
    name: 'VOLT-STORM TEMPEST',
    vietnameseTitle: 'TRÙM ĐỢT 3: LÔI THẦN BÃO TỐ VOLT-STORM',
    subtitle: 'Chùm Đạn Nón 9 Dải & Tụ Lực Gè Xung Kích',
    color: '#06b6d4',
    accentColor: '#38bdf8',
    baseHp: 5800,
    defense: 38,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  4: {
    wave: 4,
    id: 'sh_boss_4_leviathan',
    name: 'NEBULA LEVIATHAN',
    vietnameseTitle: 'TRÙM ĐỢT 4: THỦY QUÁI TINH VÂN LEVIATHAN',
    subtitle: '6 Tên Lửa Khóa Đuôi 3s & Song Drone Diệt Hạm',
    color: '#10b981',
    accentColor: '#34d399',
    baseHp: 7400,
    defense: 46,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  5: {
    wave: 5,
    id: 'sh_boss_5_solar',
    name: 'SOLAR-IGNIS COLOSSUS',
    vietnameseTitle: 'TRÙM ĐỢT 5: HỎA PHÁO THÁI DƯƠNG SOLAR-IGNIS',
    subtitle: 'Gè Tốc Lực Xuyên Phá & Quét Đạn Nón Phải Qua Trái',
    color: '#ef4444',
    accentColor: '#f87171',
    baseHp: 9200,
    defense: 54,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  6: {
    wave: 6,
    id: 'sh_boss_6_scorpion',
    name: 'MECHA SCORPIO MK-IV',
    vietnameseTitle: 'TRÙM ĐỢT 6: THẦN BỌ CẠP CƠ KHÍ SCORPIO-IV',
    subtitle: 'Khai Hỏa 6 Tên Lửa Độc & 2 Drone Hộ Tống Laser',
    color: '#eab308',
    accentColor: '#fde047',
    baseHp: 11200,
    defense: 62,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  7: {
    wave: 7,
    id: 'sh_boss_7_abyss',
    name: 'ABYSS KNIGHT DREAD',
    vietnameseTitle: 'TRÙM ĐỢT 7: KỴ SĨ HƯ VÔ ABYSS-KNIGHT',
    subtitle: 'Tụ Lực Đột Kích Bạo Liệt & Bão Đạn Nón Quét Màn Hình',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    baseHp: 13500,
    defense: 72,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  8: {
    wave: 8,
    id: 'sh_boss_8_cyclops',
    name: 'CYCLOPS OMEGA PRIME',
    vietnameseTitle: 'TRÙM ĐỢT 8: ĐỘC NHÃN HỦY DIỆT CYCLOPS-OMEGA',
    subtitle: 'Loạt Đạn Nón 9 Dải & 6 Tên Lửa Hạt Nhân Đi Theo 3s',
    color: '#f43f5e',
    accentColor: '#fb7185',
    baseHp: 16000,
    defense: 82,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  9: {
    wave: 9,
    id: 'sh_boss_9_singularity',
    name: 'SINGULARITY COLOSSUS',
    vietnameseTitle: 'TRÙM ĐỢT 9: CHÚA TỂ HỐ ĐEN SINGULARITY',
    subtitle: 'Song Drone Siêu Quang Tuyến & Tụ Lực Gè Trọng Lực',
    color: '#0284c7',
    accentColor: '#38bdf8',
    baseHp: 19000,
    defense: 92,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
  10: {
    wave: 10,
    id: 'sh_boss_10_omni_zero',
    name: 'OMNI-ZERO APOCALYPSE',
    vietnameseTitle: 'TRÙM CUỐI: HOÀNG ĐẾ HỦY DIỆT VŨ TRỤ OMNI-ZERO',
    subtitle: 'BẬC THẦY TẬN THẾ: Toàn Bộ 5 Tuyệt Kỹ Siêu Cấp',
    color: '#fbbf24',
    accentColor: '#f43f5e',
    baseHp: 24000,
    defense: 105,
    skills: ['cone_9_spread', 'homing_6_missiles', 'cone_sweep_right_to_left', 'spawn_2_laser_drones', 'charge_and_rush', 'mega_gamma_beam'],
  },
};

/**
 * Checks if enemy type is mid-tier or above (quái tầm trung đổ lên)
 */
export function isMidTierEnemy(type: string): boolean {
  const midTierTypes = [
    'viper',
    'cruiser',
    'destroyer',
    'stealth_phantom',
    'carrier',
    'plasma_mortar',
    'spectre_assassin',
    'vanguard_missile_frigate',
    'boss',
  ];
  return midTierTypes.includes(type);
}

/**
 * Multipliers for mid-tier enemies and above in Super Hard mode:
 * - Máu trâu hơn 80% (+80% HP => 1.8x)
 * - Sát thương cao hơn 50% (+50% DMG => 1.5x)
 * - Điểm phòng thủ cao hơn 60% (+60% Defense => 1.6x)
 * - Có thanh giáp dưới thanh máu (Armor bar is 50% of boosted HP)
 */
export const SUPER_HARD_STATS = {
  HP_MULTIPLIER: 1.8,
  DAMAGE_MULTIPLIER: 1.5,
  DEFENSE_MULTIPLIER: 1.6,
  ARMOR_RATIO: 0.5, // 50% of HP as Armor Bar
};

export interface SuperHardCalculatedStats {
  hp: number;
  maxHp: number;
  damage: number;
  defense: number;
  armor: number;
  maxArmor: number;
  hasArmor: boolean;
}

/**
 * Computes enemy stats under Super Hard mode rules.
 * Small enemies (scouts, kamikazes, shield drones) keep normal stats.
 * Mid-tier and above gain +80% HP, +50% DMG, +60% Def, and an Armor Bar.
 */
export function calculateSuperHardEnemyStats(
  type: string,
  baseHp: number,
  baseDamage: number,
  baseDefense: number
): SuperHardCalculatedStats {
  if (isMidTierEnemy(type)) {
    const hp = Math.round(baseHp * SUPER_HARD_STATS.HP_MULTIPLIER);
    const damage = Math.round(baseDamage * SUPER_HARD_STATS.DAMAGE_MULTIPLIER);
    const defense = Math.round(baseDefense * SUPER_HARD_STATS.DEFENSE_MULTIPLIER);
    const maxArmor = Math.round(hp * SUPER_HARD_STATS.ARMOR_RATIO);
    return {
      hp,
      maxHp: hp,
      damage,
      defense,
      armor: maxArmor,
      maxArmor,
      hasArmor: true,
    };
  }

  return {
    hp: baseHp,
    maxHp: baseHp,
    damage: baseDamage,
    defense: baseDefense,
    armor: 0,
    maxArmor: 0,
    hasArmor: false,
  };
}

/**
 * Gets Boss definition for a given wave in Super Hard mode (1 to 10).
 */
export function getSuperHardBoss(wave: number): SuperHardBossConfig {
  const clampedWave = Math.max(1, Math.min(SUPER_HARD_TOTAL_WAVES, Math.floor(wave)));
  return SUPER_HARD_BOSSES[clampedWave] || SUPER_HARD_BOSSES[1];
}

export interface DamageWithArmorResult {
  newArmor: number;
  newHp: number;
  absorbedByArmor: number;
  damageToHp: number;
  armorBroken: boolean;
  // Aliases for comprehensive caller compatibility:
  remainingArmor: number;
  remainingHp: number;
  armorDamageDealt: number;
  hpDamageDealt: number;
}

/**
 * Applies damage to an armored entity.
 * Armor absorbs damage first; true damage penetrates directly to HP.
 * Any overflow damage after armor breaks damages remaining HP.
 * Supports both new and legacy field names for 100% bug-free damage calculations.
 */
export function applyDamageWithArmor(
  currentArmor: number,
  currentHp: number,
  incomingDamage: number,
  isTrueDamage: boolean = false
): DamageWithArmorResult {
  const safeArmor = typeof currentArmor === 'number' && !isNaN(currentArmor) ? Math.max(0, currentArmor) : 0;
  const safeHp = typeof currentHp === 'number' && !isNaN(currentHp) ? Math.max(0, currentHp) : 100;
  const safeDmg = typeof incomingDamage === 'number' && !isNaN(incomingDamage) ? Math.max(0, incomingDamage) : 0;

  if (safeDmg <= 0) {
    return {
      newArmor: safeArmor,
      newHp: safeHp,
      absorbedByArmor: 0,
      damageToHp: 0,
      armorBroken: false,
      remainingArmor: safeArmor,
      remainingHp: safeHp,
      armorDamageDealt: 0,
      hpDamageDealt: 0,
    };
  }

  // True damage penetrates directly to HP
  if (isTrueDamage) {
    const newHp = Math.max(0, safeHp - safeDmg);
    return {
      newArmor: safeArmor,
      newHp,
      absorbedByArmor: 0,
      damageToHp: safeDmg,
      armorBroken: false,
      remainingArmor: safeArmor,
      remainingHp: newHp,
      armorDamageDealt: 0,
      hpDamageDealt: safeDmg,
    };
  }

  // If armor exists, armor absorbs damage
  if (safeArmor > 0) {
    if (safeArmor >= safeDmg) {
      const newArmor = safeArmor - safeDmg;
      return {
        newArmor,
        newHp: safeHp,
        absorbedByArmor: safeDmg,
        damageToHp: 0,
        armorBroken: newArmor === 0,
        remainingArmor: newArmor,
        remainingHp: safeHp,
        armorDamageDealt: safeDmg,
        hpDamageDealt: 0,
      };
    } else {
      const absorbedByArmor = safeArmor;
      const overflow = safeDmg - safeArmor;
      const newHp = Math.max(0, safeHp - overflow);
      return {
        newArmor: 0,
        newHp,
        absorbedByArmor,
        damageToHp: overflow,
        armorBroken: true,
        remainingArmor: 0,
        remainingHp: newHp,
        armorDamageDealt: absorbedByArmor,
        hpDamageDealt: overflow,
      };
    }
  }

  // No armor remaining
  const newHp = Math.max(0, safeHp - safeDmg);
  return {
    newArmor: 0,
    newHp,
    absorbedByArmor: 0,
    damageToHp: safeDmg,
    armorBroken: false,
    remainingArmor: 0,
    remainingHp: newHp,
    armorDamageDealt: 0,
    hpDamageDealt: safeDmg,
  };
}

/**
 * Homing missile steering calculation.
 * Computes smoothly rotated velocity toward target with clamped angular turn rate.
 */
export function calculateHomingVelocity(
  currX: number,
  currY: number,
  targetX: number,
  targetY: number,
  currVx: number,
  currVy: number,
  speed: number,
  turnRateRadPerSec: number,
  dt: number
): { vx: number; vy: number; angle: number } {
  const desiredAngle = Math.atan2(targetY - currY, targetX - currX);
  const currentAngle = Math.atan2(currVy, currVx);

  let diff = desiredAngle - currentAngle;
  // Normalize difference to [-PI, PI]
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;

  const maxTurn = turnRateRadPerSec * dt;
  const turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
  const newAngle = currentAngle + turn;

  return {
    vx: Math.cos(newAngle) * speed,
    vy: Math.sin(newAngle) * speed,
    angle: newAngle,
  };
}

/**
 * Checks whether player is hit by the Boss Mega Energy Beam.
 * The Mega Beam is a colossal vertical column (width 80-120px) centered at beamCenterX.
 */
export function checkMegaBeamHit(
  playerX: number,
  playerY: number,
  playerRadius: number,
  beamCenterX: number,
  beamStartY: number,
  beamWidth: number
): boolean {
  if (playerY < beamStartY) return false;
  const halfW = beamWidth / 2;
  const withinX = playerX + playerRadius >= beamCenterX - halfW && playerX - playerRadius <= beamCenterX + halfW;
  return withinX;
}

/**
 * Calculates 9 spread angles for the 9-way cone barrage.
 */
export function calculate9ConeSpreadAngles(
  centerAngle: number = Math.PI / 2,
  totalSpreadRadians: number = (80 * Math.PI) / 180
): number[] {
  const angles: number[] = [];
  const count = 9;
  const halfSpread = totalSpreadRadians / 2;
  for (let i = 0; i < count; i++) {
    const angle = centerAngle - halfSpread + (i * totalSpreadRadians) / (count - 1);
    angles.push(angle);
  }
  return angles;
}

/**
 * Calculates the sweeping angle from Right (+55 deg) across to Left (-55 deg) relative to straight down (PI/2).
 * Progress goes from 0.0 (rightmost) to 1.0 (leftmost).
 */
export function calculateConeSweepAngle(
  progress: number,
  spreadSpan: number = (110 * Math.PI) / 180
): number {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const halfSpan = spreadSpan / 2;
  const rightAngle = Math.PI / 2 + halfSpan;
  return rightAngle - clampedProgress * spreadSpan;
}

/**
 * Calculates oscillating sweeping angle across Left and Right ("bắn qua bắn lại").
 * Progress goes from 0.0 to 1.0 (over the 2.0 second barrage).
 * Starts sweeping from Left -> Right (progress 0.0 -> 0.5), then sweeps back Right -> Left (progress 0.5 -> 1.0).
 */
export function calculateOscillatingConeSweepAngle(
  progress: number,
  spreadSpan: number = (110 * Math.PI) / 180,
  centerAngle: number = Math.PI / 2
): number {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const pingPong = clampedProgress <= 0.5 ? clampedProgress * 2 : (1 - clampedProgress) * 2;
  const halfSpan = spreadSpan / 2;
  const leftAngle = centerAngle - halfSpan;
  return leftAngle + pingPong * spreadSpan;
}

/**
 * Timing & bullet configs for continuous 2.0s boss barrages
 */
export const SUPER_HARD_2S_BARRAGE = {
  NINE_CONE: {
    duration: 2.0,
    interval: 0.16,
    baseDamage: 26,
    coneSpread: (84 * Math.PI) / 180,
    bulletSpeed: 440,
  },
  CONE_SWEEP_OSCILLATING: {
    duration: 2.0,
    interval: 0.045,
    baseDamage: 28,
    sweepSpan: (110 * Math.PI) / 180,
    bulletSpeed: 460,
  },
};

/**
 * Calculates relative drone positions for the 2 escort laser drones.
 */
export function calculateDroneFormationOffsets(): {
  left: { offsetX: number; offsetY: number };
  right: { offsetX: number; offsetY: number };
} {
  return {
    left: { offsetX: -115, offsetY: 32 },
    right: { offsetX: 115, offsetY: 32 },
  };
}

/**
 * Calculates rush vector and angle towards player.
 */
export function calculateBossRushVector(
  bossX: number,
  bossY: number,
  targetX: number,
  targetY: number,
  rushSpeed: number = 780
): { vx: number; vy: number; angle: number; dist: number } {
  const dx = targetX - bossX;
  const dy = targetY - bossY;
  const dist = Math.hypot(dx, dy) || 1;
  const angle = Math.atan2(dy, dx);
  return {
    vx: (dx / dist) * rushSpeed,
    vy: (dy / dist) * rushSpeed,
    angle,
    dist,
  };
}

/**
 * Calculates smooth tracking / aiming ("gè") of the colossal Gamma Ray Beam toward player X.
 * Clamps maximum tracking speed per second so the player can dodge with skillful maneuvering.
 */
export function calculateGammaBeamTrackingX(
  currentBeamX: number,
  playerX: number,
  trackingSpeedPxPerSec: number,
  dt: number
): number {
  const diff = playerX - currentBeamX;
  const maxStep = trackingSpeedPxPerSec * dt;
  if (Math.abs(diff) <= maxStep) {
    return playerX;
  }
  return currentBeamX + Math.sign(diff) * maxStep;
}
