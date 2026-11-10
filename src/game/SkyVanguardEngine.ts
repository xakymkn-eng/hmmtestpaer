/**
 * Sky Vanguard Arcade Canvas 2D Game Engine
 * High-performance 60 FPS loop, zero-GC particle ring buffer,
 * responsive multi-input, procedural vector ship rendering, and encounter design.
 */

import {
FIGHTERS,
FighterStats,
PILOTS,
Pilot,
getPilotBonus,calculateAccessoryBonuses,
checkCircleCollision,
updateCombo,
getComboMultiplier,
getWeaponUpgradeSpecs,
clamp,
SpecialWeaponType,
SPECIAL_WEAPONS,
calculateSpecialWeaponDuration,
findLightningChainTargets,
MapSector,
MAP_SECTORS,
getSectorForWave,
calculateIncomingDamage,
checkDodge,
calculateBulletDamage,
DifficultyLevel,
calculateWaveScaling,
DIFFICULTY_CONFIGS,
switchSectorBackgroundTheme,getFighterStarBonus,
calculateMobileTouchPosition,calculateLaserBeamTrajectory,
checkLaserHit
} from './rules';
import { sound } from './audio';
import { getUniverseById,UNIVERSES } from './universe';
import {
getCelestialPlanetForSector,
renderCelestialPlanet,
renderDiffractionSpike,
} from './starfield';
import {
initFreeFlightState,
updateFreeFlightPhysics,
getClosestLandmark,
CELESTIAL_LANDMARKS,
GALAXY_THEMES,
GALAXY_WORLD_WIDTH,
GALAXY_WORLD_HEIGHT,
FreeFlightState,
} from './freeFlight';
import { parallaxTiltManager } from './parallaxTilt';
import {
initCosmicDust,
updateCosmicDust,
renderCosmicDust,
CosmicDustMote,
} from './cosmicDust';
import { drawFighterSprite } from './fighterSpriteRenderer';
import {
ADVENTURE_STAGES,getAdventureStageById,
ChickenBossShape
} from './adventure';
import {
drawChickenInvader,
drawChickenBoss,
drawEggBullet,
drawDrumstickPickup,
} from './chickenRenderer';
import {
drawVillainFlagshipBoss,
drawVillainRazorScout,
drawAlienMantisHunter,
drawVillainObsidianCruiser,
drawAlienBioRavager,
drawVillainNightWraith,
drawAlienHiveBroodmother,
drawVillainSiegeFortress,
drawAlienVoidJellyfish,
drawVillainAegisDrone,
drawVillainMissileFrigate,
drawAlienBioMine,
} from './alienAndVillainRenderer';
import {
DRONES,
DroneData,
calculateDroneBonuses,
calculateDroneEscortPosition,
} from './drones';
import {
getSuperHardBoss,
isMidTierEnemy,applyDamageWithArmor,
checkMegaBeamHit,calculate9ConeSpreadAngles,calculateOscillatingConeSweepAngle,
calculateDroneFormationOffsets,
calculateBossRushVector,
calculateGammaBeamTrackingX
} from './superHard';

// Entity Types
export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape?: 'circle' | 'spark' | 'ring' | 'star';
}

export interface DamageText {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  color: string;
  fontSize: number;
  life: number;
  maxLife: number;
  isCrit?: boolean;
}

export interface BossEscortDrone {
  id: number;
  side: 'left' | 'right';
  x: number;
  y: number;
  targetOffsetX: number;
  targetOffsetY: number;
  hp: number;
  maxHp: number;
  laserChargeTimer: number;
  laserFireTimer: number;
  aimX: number;
  aimY: number;
  hitFlashTimer: number;
  timeAlive: number;
  lifeTimer: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  type?: string;
  isLaserBeam?: boolean;
  isHoming?: boolean;
  homingDurationTimer?: number; // Duration in seconds that missile actively tracks target (e.g. 3.0s)
  piercing?: boolean;
  pierce?: number;
  homingTargetId?: number | null;
  isLightningOrb?: boolean;
  isCryoIce?: boolean;
  isSingularityVortex?: boolean;
  isSolarFireball?: boolean;
  isTachyonBeam?: boolean;
  isAntimatter?: boolean;
  splashRadius?: number;
  isValkyrieLance?: boolean;
  isCosmicPulsar?: boolean;
  isSawblade?: boolean;
  isSonicWave?: boolean;
  isAcidDart?: boolean;
  isGatlingRounds?: boolean;
  isShockPulse?: boolean;
  // Astraea star bullet and sub-star attributes
  isStarBullet?: boolean;
  isSmallStarBullet?: boolean;
  isSakuraBullet?: boolean;
  isSmallSakuraBullet?: boolean;
  isMegaStarSkill?: boolean;
  isMediumStarBullet?: boolean;
  isSkillMiniStar?: boolean;
  starRotation?: number;
  starRotSpeed?: number;
  isCrit?: boolean;
  isTrueDamage?: boolean;
  isDroneLightningBolt?: boolean; // Tia điện nhỏ từ drone trấn phái DR-88 của RTS-88
  // New S & A fighters bullet mechanics
  isDragonFlame?: boolean;
  isGammaBeam?: boolean;
  isWormholeBullet?: boolean;
  isNaniteSwarm?: boolean;
  isHydraPlasma?: boolean;
  isPrismLaser?: boolean;
  ricochetsRemaining?: number;
  // 6 New Tier A fighters bullet mechanics
  isHelixBullet?: boolean;
  helixPhase?: number;
  helixBaseX?: number;
  isRiftBlade?: boolean;
  isRiftTrap?: boolean;
  trapDuration?: number;
  isNapalmCore?: boolean;
  isNapalmEmber?: boolean;
  emberLife?: number;
  isEchoResonant?: boolean;
  hasEchoDuplicated?: boolean;
  echoTimer?: number;
  isGravitonHarpoon?: boolean;
  isGravitonPulse?: boolean;
  isBioSpore?: boolean;
  isSporeNeedle?: boolean;
  // Boss bullet special mechanics
  isBossLaserBeam?: boolean;
  isBossMortarShell?: boolean;
  isBossGravitonOrb?: boolean;
  isBossEmpOrb?: boolean;
  // Chicken Invaders 4 Adventure Mechanics
  isEggBullet?: boolean;
  eggRotation?: number;
}

export interface LightningArc {
  segments: { x1: number; y1: number; x2: number; y2: number }[];
  life: number;
  maxLife: number;
  color: string;
}

export type EnemyType =
  | 'scout'
  | 'viper'
  | 'cruiser'
  | 'kamikaze'
  | 'destroyer'
  | 'stealth_phantom'
  | 'carrier'
  | 'plasma_mortar'
  | 'spectre_assassin'
  | 'shield_drone'
  | 'vanguard_missile_frigate'
  | 'boss';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  shootTimer: number;
  shootCooldown: number;
  timeAlive: number;
  phase: number;
  telegraphTimer: number; // For laser/heavy attacks
  telegraphAimX: number;
  telegraphAimY: number;
  hitFlashTimer: number;
  stunTimer?: number; // Choáng 1s từ kỹ năng Astraea
  slowTimer?: number; // Làm chậm di chuyển từ drone trấn phái RTS-88
  slowFactor?: number; // Tỉ lệ làm chậm (0.30 = 30%)
  defense?: number; // Giáp/Phòng thủ giảm sát thương nhận vào
  armor?: number; // Thanh giáp quái tầm trung & boss
  maxArmor?: number; // Thanh giáp tối đa
  isShielded?: boolean;
  mortarExplodeY?: number;
  cloakAlpha?: number;
  // Chicken Invaders 4 properties
  isChickenInvader?: boolean;
  chickenWingAngle?: number;
  chickenVariant?: number;
  adventureBossShape?: ChickenBossShape;
  // Color-coded enemy resource variant: 'gold' (hoàng kim), 'shield' (lam ngọc giáp), 'energy' (lục bảo năng lượng)
  resourceVariant?: 'gold' | 'shield' | 'energy';
}

export type PickupType = 'weapon' | 'shield' | 'bomb' | 'coin' | 'laser_box' | 'lightning_box' | 'drumstick' | 'gold_cache' | 'shield_shard' | 'energy_cell';

export interface Pickup {
  id: number;
  type: PickupType;
  x: number;
  y: number;
  vy: number;
  radius: number;
  value: number;
  color: string;
  icon: string;
  label: string;
  angle: number;
  bobOffset: number;
}

export interface CloudLayer {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  color?: string;
  depth?: number;
  hasFlare?: boolean;
}

export interface SpaceFilament {
  x: number;
  y: number;
  speed: number;
  length: number;
  alpha: number;
  color: string;
}


export interface EngineHUDState {
  hp: number;
  maxHp: number;
  armor: number; // Giáp hiện tại
  maxArmor: number; // Giáp tối đa
  defense: number; // Phòng thủ
  armorPen: number; // Xuyên giáp %
  trueDamage: number; // Sát thương chuẩn
  critRate: number; // Tỉ lệ bạo kích %
  critDamage: number; // Sát thương bạo kích %
  dodgeChance: number; // Khả năng né tránh %
  speed: number; // Tốc bay
  fireRate: number; // Tốc bắn
  playTimeSeconds: number; // Đếm giây chuẩn đang chạy
  shieldActive: boolean;
  bombs: number;
  score: number;
  highScore: number;
  combo: number;
  comboMultiplier: number;
  comboTimerProgress: number; // 0 to 1
  weaponLevel: number;
  dronesCount: number;
  wave: number;
  bossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossArmor?: number;
  bossMaxArmor?: number;
  bossName: string;
  bossPhase: number;
  bossCurrentSkill: string;
  bossSkillProgress: number;
  bossIsEnraged: boolean;
  specialWeapon: SpecialWeaponType;
  specialWeaponTimeRemaining: number;
  specialWeaponMaxTime: number;
  skillName: string;
  skillDescription: string;
  skillCooldownRemaining: number;
  skillCooldownMax: number;
  skillActive: boolean;
  skillActiveRemaining: number;
  sectorIndex: number;
  sectorName: string;
  sectorVietnameseName: string;
  sectorSubtitle: string;
  sectorAccentColor: string;
  isWarpJumping: boolean;
  warpJumpProgress: number;
  difficulty: DifficultyLevel;
  difficultyName: string;
  gameMode: 'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard';
  universeId: number | null;
  universeName: string;
  universeConquestPercent: number;
  universeTargetWaves: number;
  autoFire: boolean;
  revivesUsed: number;
  adventureStageId?: number | null;
  adventureStageName?: string;
  adventureGalaxyName?: string;
  // Free Flight Galaxy Cruise State
  freeFlightX?: number;
  freeFlightY?: number;
  freeFlightSpeed?: number;
  freeFlightBoostEnergy?: number;
  freeFlightIsBoosting?: boolean;
  freeFlightNearestLandmark?: string;
  freeFlightNearestDistance?: number;
  freeFlightThemeTitle?: string;
  freeFlightIsPhotoMode?: boolean;
  equippedDrones?: { id: string; name: string; vietnameseName: string; tier: string; color: string; avatarEmoji: string; passiveName?: string }[];
  droneAegisShieldHp?: number;
  droneOverclockTimer?: number;
  rts88ShieldHp?: number;
  rts88ShieldMaxHp?: number;
}

export interface EngineCallbacks {
  onHUDUpdate: (state: EngineHUDState) => void;
  onGameOver: (finalStats: { score: number; wave: number; enemiesKilled: number; playTime: number; revivesUsed: number; remainingHp?: number; maxHp?: number }) => void;
  onVictory: (finalStats: { score: number; wave: number; enemiesKilled: number; playTime: number; revivesUsed: number; remainingHp?: number; maxHp?: number }) => void;
  onStateChange: (state: 'title' | 'playing' | 'paused' | 'gameover') => void;
  onMissionAction?: (actionId: string, amount: number, isAbsolute?: boolean) => void;
}

export class SkyVanguardEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private running: boolean = false;
  public state: 'title' | 'playing' | 'paused' | 'gameover' = 'title';

  // Screen metrics
  public width: number = 800;
  public height: number = 900;
  private isHeadless: boolean = false;

  // Game mode & universe campaign state
  public gameMode: 'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard' = 'endless';
  public currentUniverseId: number | null = null;
  public currentAdventureStageId: number | null = null;
  public arcLaserTickTimer: number = 0;
  public lx88AudioTimer: number = 0;
  public rts88AudioTimer: number = 0;
  public rts88ShieldHp: number = 0;
  public rts88ShieldMaxHp: number = 300;
  public rts88ActiveLightning?: {
    bolts: Array<{ startX: number; startY: number; endX: number; endY: number; isChain?: boolean }>;
    expireTime: number;
  };
  public revivesUsed: number = 0;

  // Super Hard Mode: Boss Mega Beam & Laser Sweep state
  public bossMegaBeamChargingTimer: number = 0;
  public bossMegaBeamFiringTimer: number = 0;
  public bossMegaBeamX: number = 0;
  public bossMegaBeamWidth: number = 100;
  public bossLaserSweepTimer: number = 0;

  // 5 New Boss Skills State:
  // 1. Cone 9 Spread Continuous Barrage (2s):
  public boss9ConeBarrageTimer: number = 0;
  public boss9ConeNextShotTimer: number = 0;
  // 2. 6 Homing Missiles (3s tracking)
  // 3. Cone Sweep Oscillating Left & Right (2s):
  public bossConeSweepTimer: number = 0;
  public bossConeSweepTotal: number = 2.0;
  public bossConeSweepNextShotTimer: number = 0;
  // 4. 2 Laser Drones:
  public bossEscortDrones: BossEscortDrone[] = [];
  // 5. Charge and Rush:
  public bossRushState: 'none' | 'charging' | 'rushing' | 'returning' = 'none';
  public bossRushTimer: number = 0;
  public bossRushDirX: number = 0;
  public bossRushDirY: number = 0;
  public bossRushStartX: number = 0;
  public bossRushStartY: number = 0;
  public bossRushTargetX: number = 0;
  public bossRushTargetY: number = 0;
  public bossRushAfterimages: Array<{ x: number; y: number; alpha: number; color: string }> = [];

  // Free Flight State
  public freeFlightState: FreeFlightState = initFreeFlightState();

  public setGameMode(
    mode: 'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard',
    universeId: number | null = null,
    adventureStageId: number | null = null
  ) {
    this.gameMode = mode;
    this.currentUniverseId = universeId;
    this.currentAdventureStageId = adventureStageId;
    if (mode === 'free_flight') {
      this.freeFlightState = initFreeFlightState();
    }
  }

  public cycleFreeFlightTheme() {
    this.freeFlightState.themeIndex = (this.freeFlightState.themeIndex + 1) % GALAXY_THEMES.length;
    sound.playClick();
    this.dispatchHUD();
  }

  public togglePhotoMode() {
    this.freeFlightState.isPhotoMode = !this.freeFlightState.isPhotoMode;
    sound.playClick();
    this.dispatchHUD();
  }

  public triggerFreeFlightBoost() {
    if (this.freeFlightState.boostEnergy > 10) {
      this.freeFlightState.isBoosting = true;
      sound.playWarpJump();
      this.addTrauma(0.15);
    }
  }

  public stopRun() {
    this.resetToTitle();
  }

  // Selected fighter & stats
  public currentFighter: FighterStats = FIGHTERS.phoenix;

  // Player state
  public autoFire: boolean = true;
  public elapsedPlayTime: number = 0; // Accurate running seconds timer
  public player = {
    x: 400,
    y: 750,
    targetX: 400,
    targetY: 750,
    radius: 18,
    hp: 100,
    maxHp: 100,
    armor: 50,
    maxArmor: 50,
    defense: 10,
    armorPen: 10,
    trueDamage: 5,
    critRate: 12,
    critDamage: 155,
    dodgeChance: 12,
    speed: 380,
    fireRate: 8,
    armorRegenCooldown: 0,
    shieldActive: false,
    bombs: 2,
    weaponLevel: 1,
    dronesCount: 0,
    tilt: 0, // Roll bank angle in radians
    invulnerableTimer: 0,
    fireTimer: 0,
    missileTimer: 0,
    hitFlashTimer: 0,
    isFiring: false,
    activeSpecialWeapon: 'none' as SpecialWeaponType,
    specialWeaponTimer: 0,
    specialWeaponMaxTimer: 0,
    skillCooldownTimer: 0,
    skillActiveTimer: 0,
    isSkillActive: false,
    phantomWingmenActive: false,
    solarBeamActive: false,
    timeDilation: 1.0,
  };

  // Combat entities
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private pickups: Pickup[] = [];
  private lightningArcs: LightningArc[] = [];
  private damageTexts: DamageText[] = [];
  private nextEntityId: number = 1;

  // Particle pool (fixed ring buffer, zero GC per frame)
  private particlePool: Particle[] = [];
  private particleIndex: number = 0;
  private readonly MAX_PARTICLES = 300;

  // Parallax background
  private stars: Star[] = [];
  private clouds: CloudLayer[] = [];
  private filaments: SpaceFilament[] = [];
  private cosmicDust: CosmicDustMote[] = [];
  private planetDriftY: number = 0;

  // Dynamic Map Sector State (changes every 5 waves)
  public currentSector: MapSector = getSectorForWave(1);
  public warpJumpTimer: number = 0;
  private readonly WARP_JUMP_DURATION = 2.2;
  public sectorBannerTimer: number = 0;

  // Sector Ambient Features
  private floatingAsteroids: {
    x: number;
    y: number;
    size: number;
    speed: number;
    rot: number;
    rotSpeed: number;
    points: { x: number; y: number }[];
  }[] = [];
  private solarEmbers: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    color: string;
  }[] = [];
  private blackHoleRotation: number = 0;
  private auroraPhase: number = 0;

  // Shockwaves (EMP bomb or boss death)
  private shockwaves: { x: number; y: number; radius: number; maxRadius: number; color: string; alpha: number }[] = [];

  // Camera shake & hitstop
  private trauma: number = 0;
  private hitstopTimer: number = 0;

  // Run statistics
  public score: number = 0;
  public highScore: number = 0;
  public wave: number = 1;
  public enemiesKilled: number = 0;
  public playStartTime: number = 0;
  public combo: number = 1;
  public lastComboHitTime: number = 0;
  private lastBossWaveSpawned: number = 0;
  // Boss Skill tracking state
  public bossSkillCycle: number = 0;
  public bossSkillTelegraphTimer: number = 0;
  public bossSkillTelegraphMax: number = 1.0;
  public bossCurrentSkillName: string = '';
  public bossBeamActiveTimer: number = 0;
  private hudThrottleTimer: number = 0;
  private lastDispatchedHUDKey: string = '';
  private enemySpawnTimer: number = 0.5;

  // Callbacks to React
  private callbacks: EngineCallbacks;

  // Input state
  public keysPressed: Set<string> = new Set();
  public pointerPos: { x: number; y: number; isDown: boolean; hasMoved: boolean } = {
    x: 400,
    y: 750,
    isDown: false,
    hasMoved: false,
  };

  // Mobile Touch Steering State
  private touchActiveId: number | null = null;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchShipStartX: number = 0;
  private touchShipStartY: number = 0;
  public isTouching: boolean = false;

  // Event listener references for leak-free teardown
  private keydownHandler?: (e: KeyboardEvent) => void;
  private keyupHandler?: (e: KeyboardEvent) => void;
  private blurHandler?: () => void;
  private visibilityHandler?: () => void;
  private resizeHandler?: () => void;
  private mouseMoveHandler?: (e: MouseEvent) => void;
  private mouseDownHandler?: (e: MouseEvent) => void;
  private mouseUpHandler?: () => void;
  private contextMenuHandler?: (e: MouseEvent) => void;
  private touchStartHandler?: (e: TouchEvent) => void;
  private touchMoveHandler?: (e: TouchEvent) => void;
  private touchEndHandler?: (e: TouchEvent) => void;
  private touchCancelHandler?: (e: TouchEvent) => void;

  public toggleAutoFire(): boolean {
    this.autoFire = !this.autoFire;
    this.dispatchHUD();
    return this.autoFire;
  }

  public updateCallbacks(callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
  }

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
    this.callbacks = callbacks;
    if (typeof window !== 'undefined') {
      (window as unknown as { __skyEngine: SkyVanguardEngine }).__skyEngine = this;
    }

    // Detect headless environment (playwright headless shell)
    this.isHeadless =
      typeof navigator !== 'undefined' &&
      (Boolean(navigator.webdriver) || /HeadlessChrome/i.test(navigator.userAgent));

    // Load high score
    try {
      const savedScore = localStorage.getItem('sky_vanguard_highscore');
      if (savedScore) {
        this.highScore = parseInt(savedScore, 10) || 0;
      }
    } catch {}

    this.initParticlePool();
    this.initBackground();
    this.bindInputs();
    this.resizeCanvas();
  }

  private initParticlePool() {
    this.particlePool = [];
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.particlePool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 2,
        color: '#ffffff',
        shape: 'circle',
      });
    }
  }

  private emitParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    maxLife: number,
    size: number,
    color: string,
    shape: 'circle' | 'spark' | 'ring' | 'star' = 'circle'
  ) {
    const p = this.particlePool[this.particleIndex];
    this.particleIndex = (this.particleIndex + 1) % this.MAX_PARTICLES;
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.size = size;
    p.color = color;
    p.shape = shape;
  }

  private emitBurst(x: number, y: number, count: number, baseColor: string, speedMult: number = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 140 + 40) * speedMult;
      const life = Math.random() * 0.4 + 0.25;
      const size = Math.random() * 4 + 2;
      this.emitParticle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        life,
        size,
        baseColor,
        Math.random() > 0.5 ? 'spark' : 'circle'
      );
    }
  }

  private initBackground() {
    this.currentSector = getSectorForWave(this.wave);
    const theme = switchSectorBackgroundTheme(this.currentSector.sectorIndex);
    const starColors = theme.starColors;
    this.stars = [];
    const starCount = this.isHeadless ? 35 : 140;
    for (let i = 0; i < starCount; i++) {
      const depth = 0.15 + Math.random() * 0.85;
      const size = depth < 0.4 ? 1.0 : depth < 0.8 ? 1.6 + Math.random() * 0.8 : 2.4 + Math.random() * 1.6;
      const hasFlare = depth > 0.85 && Math.random() < 0.4;
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size,
        depth,
        speed: 25 + depth * 140, // Deeper stars move slower
        brightness: Math.random() * 0.7 + 0.3,
        color: starColors[i % starColors.length],
        hasFlare,
      });
    }

    this.clouds = [];
    const cloudCount = this.isHeadless ? 6 : 14;
    for (let i = 0; i < cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 160 + 90,
        speed: Math.random() * 35 + 15,
        opacity: Math.random() * 0.18 + 0.06,
      });
    }

    // Initialize Supersonic Space Flight Filaments (Stardust streaks)
    this.filaments = [];
    const filamentCount = this.isHeadless ? 6 : 22;
    for (let i = 0; i < filamentCount; i++) {
      this.filaments.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: Math.random() * 260 + 220,
        length: Math.random() * 24 + 12,
        alpha: Math.random() * 0.4 + 0.15,
        color: starColors[i % starColors.length] || '#38bdf8',
      });
    }

    // Initialize Cosmic Dust Particles (slow-moving stardust motes giving cosmic depth and scale)
    this.cosmicDust = initCosmicDust(this.isHeadless ? 25 : 75, this.width, this.height);

    // Initialize Sector 2 Cryo Ice Asteroids
    this.floatingAsteroids = [];
    for (let i = 0; i < 7; i++) {
      const sides = 6 + Math.floor(Math.random() * 3);
      const points: { x: number; y: number }[] = [];
      const baseRadius = Math.random() * 14 + 10;
      for (let s = 0; s < sides; s++) {
        const angle = (s * Math.PI * 2) / sides;
        const rad = baseRadius * (0.75 + Math.random() * 0.5);
        points.push({ x: Math.cos(angle) * rad, y: Math.sin(angle) * rad });
      }
      this.floatingAsteroids.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: baseRadius,
        speed: Math.random() * 35 + 20,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.8,
        points,
      });
    }

    // Initialize Sector 3 Solar Embers
    this.solarEmbers = [];
    for (let i = 0; i < 18; i++) {
      this.solarEmbers.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 40,
        vy: -(Math.random() * 60 + 40),
        size: Math.random() * 3 + 1.5,
        alpha: Math.random() * 0.8 + 0.2,
        color: Math.random() > 0.5 ? '#f97316' : '#ea580c',
      });
    }
  }

  public resizeCanvas() {
    const parent = this.canvas.parentElement;
    const clientW = parent ? parent.clientWidth : window.innerWidth;
    const clientH = parent ? parent.clientHeight : window.innerHeight;
    const dpr = this.isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    this.width = Math.max(280, Math.floor(clientW || window.innerWidth || 360));
    this.height = Math.max(320, Math.floor(clientH || window.innerHeight || 640));

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Keep player in bounds after resize
    this.player.x = clamp(this.player.x, 25, this.width - 25);
    this.player.y = clamp(this.player.y, 40, this.height - 50);
  }

  private bindInputs() {
    this.keydownHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      this.keysPressed.add(e.code);

      // Direct Pause trigger
      if ((e.code === 'KeyP' || e.code === 'Escape') && (this.state === 'playing' || this.state === 'paused')) {
        this.togglePause();
      }

      // EMP Bomb trigger
      if ((e.code === 'KeyB' || e.code === 'KeyF') && this.state === 'playing') {
        this.triggerBomb();
      }

      // Fighter Ultimate Skill trigger
      if ((e.code === 'KeyE' || e.code === 'KeyQ') && this.state === 'playing') {
        this.triggerSkill();
      }

      // Auto-fire toggle
      if (e.code === 'KeyC') {
        this.autoFire = !this.autoFire;
      }
    };

    this.keyupHandler = (e: KeyboardEvent) => {
      this.keysPressed.delete(e.code);
    };

    this.blurHandler = () => {
      this.keysPressed.clear();
      this.pointerPos.isDown = false;
    };

    this.visibilityHandler = () => {
      if (document.hidden) {
        this.keysPressed.clear();
        this.pointerPos.isDown = false;
      }
    };

    this.resizeHandler = () => {
      this.resizeCanvas();
    };

    // Mouse / Touch Controls
    const updatePointer = (clientX: number, clientY: number, isDown: boolean) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 20, this.width - 20);
      const y = clamp(clientY - rect.top, 30, this.height - 30);
      this.pointerPos.x = x;
      this.pointerPos.y = y;
      this.pointerPos.isDown = isDown;
      this.pointerPos.hasMoved = true;
    };

    this.mouseMoveHandler = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY, (e.buttons & 1) === 1);
    };

    this.mouseDownHandler = (e: MouseEvent) => {
      if (e.button === 0) {
        updatePointer(e.clientX, e.clientY, true);
        if (this.state === 'playing') {
          this.player.isFiring = true;
        }
      } else if (e.button === 2) {
        // Right click triggers bomb
        e.preventDefault();
        this.triggerBomb();
      }
    };

    this.mouseUpHandler = () => {
      this.pointerPos.isDown = false;
    };

    this.contextMenuHandler = (e: MouseEvent) => e.preventDefault();

    // Touch support for mobile devices with relative drag and gesture suppression
    this.touchStartHandler = (e: TouchEvent) => {
      e.preventDefault();
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        this.touchActiveId = t.identifier;
        const rect = this.canvas.getBoundingClientRect();
        this.touchStartX = t.clientX - rect.left;
        this.touchStartY = t.clientY - rect.top;
        this.touchShipStartX = this.player.x;
        this.touchShipStartY = this.player.y;
        this.isTouching = true;
        this.pointerPos.isDown = true;
        this.pointerPos.hasMoved = true;
        if (this.state === 'playing') {
          this.player.isFiring = true;
        }
      }
    };

    this.touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.touchActiveId) {
          const rect = this.canvas.getBoundingClientRect();
          const curX = t.clientX - rect.left;
          const curY = t.clientY - rect.top;
          const pos = calculateMobileTouchPosition(
            curX,
            curY,
            this.touchStartX,
            this.touchStartY,
            this.touchShipStartX,
            this.touchShipStartY,
            { minX: 24, maxX: this.width - 24, minY: 40, maxY: this.height - 35 }
          );
          this.player.targetX = pos.targetX;
          this.player.targetY = pos.targetY;
          this.pointerPos.x = pos.targetX;
          this.pointerPos.y = pos.targetY;
          this.pointerPos.hasMoved = true;
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.touchActiveId) {
          this.touchActiveId = null;
          this.isTouching = false;
          this.pointerPos.isDown = false;
          this.player.targetX = this.player.x;
          this.player.targetY = this.player.y;
          break;
        }
      }
    };

    this.touchEndHandler = handleTouchEnd;
    this.touchCancelHandler = handleTouchEnd;

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);
    window.addEventListener('blur', this.blurHandler);
    window.addEventListener('resize', this.resizeHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);

    this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
    this.canvas.addEventListener('mousedown', this.mouseDownHandler);
    this.canvas.addEventListener('mouseup', this.mouseUpHandler);
    this.canvas.addEventListener('contextmenu', this.contextMenuHandler);
    this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
    this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    this.canvas.addEventListener('touchend', this.touchEndHandler, { passive: false });
    this.canvas.addEventListener('touchcancel', this.touchCancelHandler, { passive: false });
  }

  public currentPilot: Pilot | null = null;
  public installedAccessories: string[] = [];
  public difficulty: DifficultyLevel = 'normal';
  public fighterStarLevel: number = 1;
  public equippedDroneIds: string[] = [];
  public dronePositions: { x: number; y: number; vx: number; vy: number; fireTimer: number; tilt: number }[] = [];
  public droneAegisShieldHp: number = 0;
  public droneAegisCooldownTimer: number = 0;
  public droneChronoTimer: number = 8.0;
  public droneOverclockTimer: number = 0;
  public droneVoidTimer: number = 10.0;
  public droneSolarTimer: number = 7.0;
  public droneNaniteTimer: number = 5.0;
  public droneThunderTimer: number = 5.0;

  public setDifficulty(diff: DifficultyLevel) {
    this.difficulty = diff;
    this.dispatchHUD();
  }

  public setPilot(pilotId: string | null) {
    this.currentPilot = pilotId && PILOTS[pilotId] ? PILOTS[pilotId] : null;
    this.recalculatePlayerStats();
  }

  public setAccessories(accessories: string[]) {
    this.installedAccessories = accessories || [];
    this.recalculatePlayerStats();
  }

  public setDrones(droneIds: string[]) {
    this.equippedDroneIds = droneIds ? droneIds.filter((id) => Boolean(DRONES[id])).slice(0, 2) : [];
    const now = performance.now();
    while (this.dronePositions.length < this.equippedDroneIds.length) {
      const idx = this.dronePositions.length as 0 | 1;
      const escort = calculateDroneEscortPosition(this.player.x, this.player.y, idx, this.equippedDroneIds.length, now);
      this.dronePositions.push({
        x: escort.x,
        y: escort.y,
        vx: 0,
        vy: 0,
        fireTimer: Math.random() * 0.3,
        tilt: 0,
      });
    }
    if (this.dronePositions.length > this.equippedDroneIds.length) {
      this.dronePositions = this.dronePositions.slice(0, this.equippedDroneIds.length);
    }
    // If in title mode, immediately snap positions so they never appear displaced
    if (this.state === 'title') {
      for (let i = 0; i < this.equippedDroneIds.length; i++) {
        const escort = calculateDroneEscortPosition(this.player.x, this.player.y, i as 0 | 1, this.equippedDroneIds.length, now);
        this.dronePositions[i].x = escort.x;
        this.dronePositions[i].y = escort.y;
      }
    }
    this.recalculatePlayerStats();
  }

  public activeCosmeticSkinId: string | null = null;

  public setCosmeticSkin(skinId: string | null) {
    this.activeCosmeticSkinId = skinId;
  }

  public recalculatePlayerStats() {
    const f = this.currentFighter;
    const pilotBonus = getPilotBonus(this.currentPilot?.id || null);
    const accBonus = calculateAccessoryBonuses(this.installedAccessories);
    const starBonus = getFighterStarBonus(this.fighterStarLevel);
    const droneBonus = calculateDroneBonuses(this.equippedDroneIds, this.currentFighter?.id);

    const baseHp = f.maxHp * (1 + (starBonus.hpBonusPercent || 0) / 100);
    const baseArmor = f.maxArmor * (1 + (starBonus.armorBonusPercent || 0) / 100);

    this.player.maxHp = Math.round(baseHp + pilotBonus.hpBonus + droneBonus.hpBonus);
    this.player.maxArmor = Math.round(baseArmor + pilotBonus.armorBonus + droneBonus.armorBonus);
    this.player.defense = f.defense + pilotBonus.defenseBonus + (starBonus.defenseBonus || 0) + droneBonus.defenseBonus;
    this.player.armorPen = f.armorPen + pilotBonus.armorPenPercent + (accBonus.armorPenPercent || 0) + droneBonus.armorPenPercent;
    this.player.trueDamage = f.trueDamage + pilotBonus.trueDamageBonus + (accBonus.trueDamageBonus || 0) + (starBonus.trueDamageBonus || 0) + droneBonus.trueDamageBonus;
    this.player.critRate = f.critRate + pilotBonus.critRatePercent + (accBonus.critRatePercent || 0) + (starBonus.critRateBonus || 0) + droneBonus.critRatePercent;
    this.player.critDamage = f.critDamage + pilotBonus.critDamagePercent;
    this.player.dodgeChance = f.dodgeChance + pilotBonus.dodgePercent;
    this.player.speed = f.speed * (1 + (pilotBonus.speedPercent + (starBonus.speedBonusPercent || 0) + droneBonus.speedPercent) / 100);
    this.player.fireRate = f.fireRate * (1 + (pilotBonus.fireRatePercent + accBonus.fireRatePercent + droneBonus.fireRatePercent) / 100);

    if (this.player.hp > this.player.maxHp) {
      this.player.hp = this.player.maxHp;
    }
    if (this.player.armor > this.player.maxArmor) {
      this.player.armor = this.player.maxArmor;
    }
  }

  public setFighter(fighterId: string, starLevel: number = 1) {
    if (FIGHTERS[fighterId]) {
      this.currentFighter = FIGHTERS[fighterId];
      this.fighterStarLevel = starLevel || 1;
      this.recalculatePlayerStats();
      this.player.hp = this.player.maxHp;
      this.player.armor = this.player.maxArmor;
    }
  }

  public addDamageText(
    x: number,
    y: number,
    text: string,
    colorOrType: string = 'normal',
    fontSize: number = 13,
    isCrit: boolean = false
  ) {
    let color = '#fde047';
    let size = fontSize;
    let crit = isCrit;

    if (colorOrType.startsWith('#') || colorOrType.startsWith('rgb')) {
      color = colorOrType;
    } else {
      const config = {
        normal: { color: '#fde047', size: 13, isCrit: false },
        crit: { color: '#fbbf24', size: 16, isCrit: true },
        true: { color: '#c084fc', size: 14, isCrit: false },
        dodge: { color: '#38bdf8', size: 15, isCrit: true },
        player_dmg: { color: '#f43f5e', size: 14, isCrit: false },
      }[colorOrType] || { color: '#ffffff', size: 13, isCrit: false };

      color = config.color;
      size = fontSize !== 13 ? fontSize : config.size;
      crit = isCrit || config.isCrit;
    }

    if (this.damageTexts.length > 25) {
      this.damageTexts.shift();
    }

    this.damageTexts.push({
      id: this.nextEntityId++,
      x: x + (Math.random() * 20 - 10),
      y: y + (Math.random() * 10 - 5),
      vx: (Math.random() - 0.5) * 45,
      vy: -(Math.random() * 55 + 45),
      text,
      color,
      fontSize: size,
      life: 0.85,
      maxLife: 0.85,
      isCrit: crit,
    });
  }

  public startRun() {
    this.state = 'playing';
    document.body.dataset.state = 'playing';
    this.callbacks.onStateChange('playing');

    // Reset player state
    this.player.x = this.width / 2;
    this.player.y = this.height * 0.82;
    this.player.targetX = this.player.x;
    this.player.targetY = this.player.y;
    this.recalculatePlayerStats();
    this.player.hp = this.player.maxHp;
    this.player.armor = this.player.maxArmor;
    this.player.armorRegenCooldown = 0;
    this.elapsedPlayTime = 0;
    this.damageTexts = [];
    this.player.shieldActive = false;
    this.player.bombs = 2;
    this.player.weaponLevel = 1;
    this.player.dronesCount = 0;
    this.player.invulnerableTimer = 2.0; // 2 seconds spawn shield
    this.player.fireTimer = 0;
    this.player.hitFlashTimer = 0;
    this.player.activeSpecialWeapon = 'none';
    this.player.specialWeaponTimer = 0;
    this.player.specialWeaponMaxTimer = 0;
    this.player.skillCooldownTimer = 0;
    this.player.skillActiveTimer = 0;
    this.player.isSkillActive = false;
    this.player.phantomWingmenActive = false;
    this.player.solarBeamActive = false;
    this.player.timeDilation = 1.0;

    // Reset combat arrays
    this.bullets = [];
    this.enemies = [];
    this.pickups = [];
    this.lightningArcs = [];
    this.shockwaves = [];
    this.initParticlePool();

    this.score = 0;
    this.wave = 1;
    this.currentSector = getSectorForWave(1);
    this.warpJumpTimer = 0;
    this.sectorBannerTimer = 3.0;
    this.initBackground();

    // In Universe mode, tint cosmic starfield with universe sector colors
    if (this.gameMode === 'universe' && this.currentUniverseId) {
      const u = getUniverseById(this.currentUniverseId);
      if (u) {
        for (let i = 0; i < this.stars.length; i++) {
          this.stars[i].color = i % 2 === 0 ? u.themeColor : u.accentColor;
        }
      }
    }

    // In Adventure mode, tint cosmic starfield with adventure galaxy colors
    if (this.gameMode === 'adventure' && this.currentAdventureStageId) {
      const advStage = getAdventureStageById(this.currentAdventureStageId);
      if (advStage) {
        const advColors = advStage.backgroundTheme.starColors;
        for (let i = 0; i < this.stars.length; i++) {
          this.stars[i].color = advColors[i % advColors.length];
        }
      }
    }

    // In Super Hard mode, tint cosmic starfield with ominous crimson and dark gold cosmic colors
    if (this.gameMode === 'super_hard') {
      const shColors = ['#ef4444', '#f97316', '#fbbf24', '#7f1d1d', '#991b1b'];
      for (let i = 0; i < this.stars.length; i++) {
        this.stars[i].color = shColors[i % shColors.length];
      }
    }

    this.enemiesKilled = 0;
    this.combo = 1;
    this.lastComboHitTime = 0;
    this.lastBossWaveSpawned = 0;
    this.bossMegaBeamChargingTimer = 0;
    this.bossMegaBeamFiringTimer = 0;
    this.bossLaserSweepTimer = 0;
    this.boss9ConeBarrageTimer = 0;
    this.boss9ConeNextShotTimer = 0;
    this.bossConeSweepTimer = 0;
    this.bossConeSweepTotal = 2.0;
    this.bossConeSweepNextShotTimer = 0;
    this.bossEscortDrones = [];
    this.bossRushState = 'none';
    this.bossRushAfterimages = [];
    this.enemySpawnTimer = 0.5;
    this.playStartTime = performance.now();
    this.trauma = 0;
    this.hitstopTimer = 0;
    this.revivesUsed = 0;

    this.dispatchHUD();
  }

  public revivePlayer() {
    this.revivesUsed++;
    this.player.hp = this.player.maxHp;
    this.player.armor = this.player.maxArmor;
    this.player.shieldActive = true;
    this.player.invulnerableTimer = 3.5;
    // Clear hazardous enemy bullets around player
    this.bullets = this.bullets.filter((b) => b.isPlayer);
    sound.playWarpJump();
    this.addTrauma(0.6);
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 20,
      maxRadius: Math.max(this.width, this.height) * 1.2,
      color: '#38bdf8',
      alpha: 1.0,
    });
    this.state = 'playing';
    document.body.dataset.state = 'playing';
    this.callbacks.onStateChange('playing');
    this.dispatchHUD();
  }

  /**
   * Switches the game's background stars or nebulae color based on current sector index
   * to enhance visual variety during gameplay.
   */
  public switchSectorTheme(sectorIndex: number) {
    const theme = switchSectorBackgroundTheme(sectorIndex);
    const starColors = theme.starColors;
    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].color = starColors[i % starColors.length];
    }
    const sector = MAP_SECTORS.find((s) => s.sectorIndex === theme.sectorIndex);
    if (sector) {
      this.currentSector = sector;
    }
  }

  /**
   * Cleans up all in-battle entities, effects, and hazards, cleanly returning
   * the game environment to the peaceful title screen state.
   */
  public resetToTitle() {
    this.state = 'title';
    this.gameMode = 'endless';
    this.freeFlightState = initFreeFlightState();
    document.body.dataset.state = 'title';
    this.callbacks.onStateChange('title');

    // Purge all combat objects and debris
    this.enemies = [];
    this.bullets = [];
    this.pickups = [];
    this.lightningArcs = [];
    this.shockwaves = [];
    this.damageTexts = [];
    this.floatingAsteroids = [];
    this.solarEmbers = [];

    // Reset visual timers & trauma
    this.sectorBannerTimer = 0;
    this.warpJumpTimer = 0;
    this.trauma = 0;
    this.hitstopTimer = 0;
    this.bossMegaBeamChargingTimer = 0;
    this.bossMegaBeamFiringTimer = 0;
    this.bossLaserSweepTimer = 0;
    this.boss9ConeBarrageTimer = 0;
    this.boss9ConeNextShotTimer = 0;
    this.bossConeSweepTimer = 0;
    this.bossConeSweepTotal = 2.0;
    this.bossConeSweepNextShotTimer = 0;
    this.bossEscortDrones = [];
    this.bossRushState = 'none';
    this.bossRushAfterimages = [];

    // Reset combat progress & return to Sector 1 Alpha Void
    this.wave = 1;
    this.currentSector = MAP_SECTORS[0];
    this.switchSectorTheme(1);

    // Reset player position to showcase coordinates
    this.player.x = this.width / 2;
    this.player.y = Math.min(250, this.height * 0.35);
    this.player.targetX = this.player.x;
    this.player.targetY = this.player.y;
    this.player.tilt = 0;

    // Reset drone positions directly to title escort coordinates (prevents drones from staying displaced at combat bottom)
    const resetTime = performance.now();
    for (let i = 0; i < this.equippedDroneIds.length; i++) {
      const escortPos = calculateDroneEscortPosition(
        this.player.x,
        this.player.y,
        i as 0 | 1,
        this.equippedDroneIds.length,
        resetTime
      );
      if (!this.dronePositions[i]) {
        this.dronePositions[i] = {
          x: escortPos.x,
          y: escortPos.y,
          vx: 0,
          vy: 0,
          fireTimer: 0,
          tilt: 0,
        };
      } else {
        this.dronePositions[i].x = escortPos.x;
        this.dronePositions[i].y = escortPos.y;
        this.dronePositions[i].vx = 0;
        this.dronePositions[i].vy = 0;
        this.dronePositions[i].tilt = 0;
      }
    }

    this.recalculatePlayerStats();
    this.player.hp = this.player.maxHp;
    this.player.armor = this.player.maxArmor;
    this.player.invulnerableTimer = 0;
    this.player.isSkillActive = false;
    this.player.skillActiveTimer = 0;
    this.player.shieldActive = false;
    this.player.activeSpecialWeapon = 'none';
    this.player.specialWeaponTimer = 0;
    this.player.phantomWingmenActive = false;
    this.player.solarBeamActive = false;

    // Reset particle pool clean
    this.initParticlePool();

    // Reset inputs
    this.keysPressed.clear();
    this.pointerPos.isDown = false;
  }


  public togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      document.body.dataset.state = 'paused';
      this.callbacks.onStateChange('paused');
    } else if (this.state === 'paused') {
      this.state = 'playing';
      document.body.dataset.state = 'playing';
      this.callbacks.onStateChange('playing');
      this.lastTime = performance.now();
    }
  }

  public triggerBomb() {
    if (this.state !== 'playing' || this.player.bombs <= 0) return;

    this.player.bombs--;
    sound.playBomb();
    this.addTrauma(0.7);
    this.callbacks.onMissionAction?.('trigger_bomb', 1);

    // Create EMP shockwave ring centered on player
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 20,
      maxRadius: Math.max(this.width, this.height) * 1.2,
      color: '#38bdf8',
      alpha: 1.0,
    });

    // Clear all enemy bullets into sparkling points
    for (const b of this.bullets) {
      if (!b.isPlayer) {
        this.emitBurst(b.x, b.y, 4, '#38bdf8', 0.5);
      }
    }
    this.bullets = this.bullets.filter((b) => b.isPlayer);

    // Heavy damage to all enemies on screen
    for (const enemy of this.enemies) {
      enemy.hp -= 200;
      enemy.hitFlashTimer = 0.15;
      this.emitBurst(enemy.x, enemy.y, 8, '#f43f5e');
    }

    this.dispatchHUD();
  }

  public triggerSkill() {
    if (this.state !== 'playing' || this.player.skillCooldownTimer > 0) return;

    const f = this.currentFighter;
    this.player.skillCooldownTimer = f.skillCooldown;
    this.player.isSkillActive = true;
    sound.playSkillActivation(f.id);
    this.callbacks.onMissionAction?.('use_skill', 1);

    switch (f.id) {
      case 'astraea': // Siêu Tinh Cầu Hủy Diệt (Mega Starlight Nova)
        this.player.skillActiveTimer = 3.5;
        this.addTrauma(0.65);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 15,
          maxRadius: 360,
          color: '#fbbf24',
          alpha: 1.0,
        });
        // Mega star projectile moving slowly forward (r=26, damage=300)
        this.bullets.push({
          id: this.nextEntityId++,
          x: this.player.x,
          y: this.player.y - 25,
          vx: 0,
          vy: -180, // bay chậm
          radius: 26,
          damage: 300,
          isPlayer: true,
          color: '#fde047',
          isMegaStarSkill: true,
          starRotation: 0,
          starRotSpeed: 4,
        });
        break;

      case 'phoenix': // Tăng Tốc Siêu Thanh (4s)
        this.player.skillActiveTimer = 4.0;
        this.addTrauma(0.35);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 280,
          color: '#38bdf8',
          alpha: 1.0,
        });
        break;

      case 'titan': // Pháo Đài Bất Hoại (3.5s)
        this.player.skillActiveTimer = 3.5;
        this.player.shieldActive = true;
        this.player.invulnerableTimer = 3.5;
        this.addTrauma(0.5);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 320,
          color: '#f59e0b',
          alpha: 1.0,
        });
        break;

      case 'ghost': // Tàng Hình Hư Không (4s)
        this.player.skillActiveTimer = 4.0;
        this.player.invulnerableTimer = 4.0;
        this.emitBurst(this.player.x, this.player.y, 25, '#c084fc', 1.5);
        break;

      case 'aurora': // Bão Tuyết Tuyệt Đối (4s)
        this.player.skillActiveTimer = 4.0;
        this.addTrauma(0.55);
        // Clear all enemy bullets into ice sparkles
        for (const b of this.bullets) {
          if (!b.isPlayer) {
            this.emitBurst(b.x, b.y, 6, '#7dd3fc', 0.8);
          }
        }
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        // Frost slow on all enemies
        for (const enemy of this.enemies) {
          enemy.vx *= 0.35;
          enemy.vy *= 0.35;
          this.emitBurst(enemy.x, enemy.y, 8, '#38bdf8', 0.7);
        }
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 800,
          color: '#bae6fd',
          alpha: 1.0,
        });
        break;

      case 'vortex': // Hố Đen Hút Đạn (5s)
        this.player.skillActiveTimer = 5.0;
        this.addTrauma(0.5);
        this.shockwaves.push({
          x: this.width / 2,
          y: this.height * 0.35,
          radius: 10,
          maxRadius: 420,
          color: '#a855f7',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (const enemy of this.enemies) {
          enemy.hp -= 250;
          enemy.hitFlashTimer = 0.2;
        }
        break;

      case 'mirage': // Tam Thân Phân Ảnh (5s)
        this.player.skillActiveTimer = 5.0;
        this.player.phantomWingmenActive = true;
        this.emitBurst(this.player.x - 45, this.player.y, 16, '#ec4899', 1.2);
        this.emitBurst(this.player.x + 45, this.player.y, 16, '#ec4899', 1.2);
        break;

      case 'solaris': // Bộc Phá Thái Dương (3.5s)
        this.player.skillActiveTimer = 3.5;
        this.player.solarBeamActive = true;
        this.player.invulnerableTimer = 3.5;
        this.addTrauma(0.7);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 20,
          maxRadius: 500,
          color: '#fde047',
          alpha: 1.0,
        });
        break;

      case 'chrono': // Ngưng Đọng Thời Gian (5s)
        this.player.skillActiveTimer = 5.0;
        this.player.timeDilation = 0.15;
        this.addTrauma(0.4);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 650,
          color: '#10b981',
          alpha: 1.0,
        });
        break;

      case 'apocalypse': // Tận Thế Khởi Nguyên (6s)
        this.player.skillActiveTimer = 6.0;
        this.addTrauma(0.85);
        this.hitstopTimer = 0.08;
        // Launch 12 seeking antimatter warheads
        for (let i = 0; i < 12; i++) {
          const angle = -Math.PI / 2 + ((i - 5.5) / 6) * 1.3;
          this.bullets.push({
            id: this.nextEntityId++,
            x: this.player.x,
            y: this.player.y - 20,
            vx: Math.cos(angle) * 380,
            vy: Math.sin(angle) * 380,
            radius: 7,
            damage: 95,
            isPlayer: true,
            color: '#ef4444',
            isHoming: true,
            isAntimatter: true,
          });
        }
        // Devastating Shockwave
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 900,
          color: '#f43f5e',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (const enemy of this.enemies) {
          enemy.hp -= 360;
          enemy.hitFlashTimer = 0.2;
        }
        break;

      case 'valkyrie': // Phán Quyết Thiên Giới (17s CD): Hồi 2 HP, shockwave, 16 seeking holy spears
        this.player.skillActiveTimer = 4.0;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
        this.addTrauma(0.6);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 650,
          color: '#38bdf8',
          alpha: 1.0,
        });
        // Clear enemy bullets
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI * 2) / 16;
          this.bullets.push({
            id: this.nextEntityId++,
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * 450,
            vy: Math.sin(angle) * 450,
            radius: 6,
            damage: 65,
            isPlayer: true,
            color: '#38bdf8',
            isHoming: true,
            isValkyrieLance: true,
          });
        }
        break;

      case 'nebula_sovereign': // Sụp Đổ Thiên Hà (22s CD): Mở hố đen siêu trọng lực
        this.player.skillActiveTimer = 6.0;
        this.addTrauma(0.8);
        this.shockwaves.push({
          x: this.width / 2,
          y: this.height * 0.4,
          radius: 20,
          maxRadius: 750,
          color: '#a855f7',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (const enemy of this.enemies) {
          enemy.hp -= 320;
          enemy.hitFlashTimer = 0.3;
        }
        break;

      case 'thunderbolt': // Bão Điện Từ Bất Tận (14s CD): Sét đánh toàn bộ địch
        this.player.skillActiveTimer = 4.5;
        this.addTrauma(0.5);
        for (const enemy of this.enemies) {
          const segs = this.createLightningSegments(this.player.x, this.player.y - 20, enemy.x, enemy.y, 8);
          this.lightningArcs.push({
            segments: segs,
            life: 0.25,
            maxLife: 0.25,
            color: '#06b6d4',
          });
          enemy.hp -= 220;
          enemy.hitFlashTimer = 0.2;
          this.emitBurst(enemy.x, enemy.y, 10, '#67e8f9', 1.0);
        }
        break;

      case 'plasma_reaper': // Vũ Điệu Lưỡi Hái (13s CD): 4 đĩa cưa khổng lồ quay quanh
        this.player.skillActiveTimer = 5.0;
        this.addTrauma(0.4);
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          this.bullets.push({
            id: this.nextEntityId++,
            x: this.player.x + Math.cos(angle) * 45,
            y: this.player.y + Math.sin(angle) * 45,
            vx: Math.cos(angle) * 200,
            vy: Math.sin(angle) * 200 - 300,
            radius: 14,
            damage: 180,
            isPlayer: true,
            color: '#f43f5e',
            isSawblade: true,
            piercing: true,
          });
        }
        break;

      case 'tempest': // Lốc Xoáy Vũ Trụ (14s CD): Sóng xung kích đẩy lùi và quét sạch
        this.player.skillActiveTimer = 4.0;
        this.addTrauma(0.45);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 700,
          color: '#14b8a6',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (const enemy of this.enemies) {
          enemy.y = Math.max(-50, enemy.y - 120);
          enemy.hp -= 150;
          enemy.hitFlashTimer = 0.2;
        }
        break;

      case 'viper': // Nọc Độc Hư Không (12s CD): Sương axit độc bao phủ màn hình
        this.player.skillActiveTimer = 4.5;
        this.addTrauma(0.35);
        for (const enemy of this.enemies) {
          enemy.hp -= Math.max(30, Math.floor(enemy.hp * 0.4));
          enemy.hitFlashTimer = 0.3;
          this.emitBurst(enemy.x, enemy.y, 8, '#84cc16', 0.8);
        }
        break;

      case 'falcon': // Hỏa Lực Cuồng Bạo (11s CD): Siêu tốc độ bắn +150%
        this.player.skillActiveTimer = 4.0;
        this.addTrauma(0.3);
        this.emitBurst(this.player.x, this.player.y, 14, '#3b82f6', 1.0);
        break;

      case 'bastion': // Lá Chắn Đẩy Lùi (13s CD): Sóng EMP + khiên bảo vệ
        this.player.skillActiveTimer = 3.5;
        this.player.shieldActive = true;
        this.addTrauma(0.4);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 550,
          color: '#94a3b8',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        break;

      case 'ouroboros': // Hắc Long Giáng Thế (18s CD): Rồng hư không quét sàn, 4s bất tử
        this.player.skillActiveTimer = 4.0;
        this.player.invulnerableTimer = 4.0;
        this.addTrauma(0.75);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 15,
          maxRadius: 800,
          color: '#a855f7',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (const enemy of this.enemies) {
          enemy.hp -= 320;
          enemy.hitFlashTimer = 0.25;
          this.emitBurst(enemy.x, enemy.y, 10, '#c084fc');
        }
        break;

      case 'quasar_titan': // Bão Bức Xạ Gamma (20s CD): 400 sát thương chuẩn + hóa giải đạn
        this.player.skillActiveTimer = 3.5;
        this.addTrauma(0.85);
        this.shockwaves.push({
          x: this.width / 2,
          y: this.height * 0.45,
          radius: 20,
          maxRadius: 950,
          color: '#06b6d4',
          alpha: 1.0,
        });
        for (const b of this.bullets) {
          if (!b.isPlayer && Math.random() < 0.4) {
            this.spawnPickup(b.x, b.y, 'coin');
          }
        }
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (const enemy of this.enemies) {
          enemy.hp -= 400;
          enemy.hitFlashTimer = 0.3;
          this.addDamageText(enemy.x, enemy.y, '400⚡', '#06b6d4', 16, true);
        }
        break;

      case 'chronos_phantom': // Nghịch Đảo Không Gian (16s CD): 3 ảo ảnh thời gian song hành
        this.player.skillActiveTimer = 5.0;
        this.player.timeDilation = 0.5;
        this.addTrauma(0.4);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 400,
          color: '#10b981',
          alpha: 1.0,
        });
        break;

      case 'nanite_swarm': // Bão Bọ Ăn Mòn (13s CD): Bầy bọ phát nổ, hồi 30 Giáp & 30 Máu
        this.player.skillActiveTimer = 4.0;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
        this.player.armor = Math.min(this.player.maxArmor, this.player.armor + 30);
        this.addTrauma(0.5);
        this.emitBurst(this.player.x, this.player.y, 25, '#84cc16', 1.2);
        for (const enemy of this.enemies) {
          enemy.hp -= 220;
          enemy.hitFlashTimer = 0.2;
          this.emitBurst(enemy.x, enemy.y, 8, '#a3e635');
        }
        break;

      case 'plasma_hydra': // Thủy Quái Cuồng Nộ (12s CD): 18 nòng pháo đồng loạt khai hỏa
        this.player.skillActiveTimer = 4.0;
        this.addTrauma(0.45);
        this.emitBurst(this.player.x, this.player.y, 20, '#10b981', 1.0);
        break;

      case 'prism_aegis': // Lưới Ánh Sáng Phản Xạ (15s CD): Khiên lăng kính phản xạ đạn +50 thủ
        this.player.skillActiveTimer = 4.5;
        this.player.shieldActive = true;
        this.addTrauma(0.4);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 480,
          color: '#38bdf8',
          alpha: 1.0,
        });
        break;

      case 'rts_88': // RTS-88 Tia Chớp: Khiên Sấm Sét 300 HP duy trì 10s (+80% sát thương khi có khiên)
        this.player.skillActiveTimer = 10.0;
        this.player.isSkillActive = true;
        this.rts88ShieldHp = 300;
        this.rts88ShieldMaxHp = 300;
        this.addTrauma(0.65);
        sound.playLightning();
        sound.playPowerup('shield');
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 15,
          maxRadius: Math.max(this.width, this.height) * 1.3,
          color: '#00f0ff',
          alpha: 1.0,
        });
        // Clear immediate bullets around player
        this.bullets = this.bullets.filter(
          (b) => b.isPlayer || Math.hypot(b.x - this.player.x, b.y - this.player.y) > 160
        );
        this.emitBurst(this.player.x, this.player.y, 25, '#facc15', 1.5);
        this.emitBurst(this.player.x, this.player.y, 20, '#00f0ff', 1.6);
        this.addDamageText(this.player.x, this.player.y - 36, '⚡ KHIÊN SẤM SÉT 300 HP (+80% ST)!', '#facc15', 16, true);
        this.dispatchHUD();
        break;

      case 'arc_tempest': // Lôi Đình Tê Liệt Toàn Cầu (16s CD): Kẻ địch tê liệt 6s, LX-88 tăng 80% ST, 60% Xuyên Giáp + 15 ST Chuẩn
        this.player.skillActiveTimer = 6.0;
        this.addTrauma(0.85);
        sound.playWarpJump();
        const isVampSkill = this.activeCosmeticSkinId === 'skin_lx88_vampire';
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 20,
          maxRadius: Math.max(this.width, this.height) * 1.5,
          color: isVampSkill ? '#e11d48' : '#00f2fe',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (const enemy of this.enemies) {
          enemy.stunTimer = 6.0;
          this.addDamageText(
            enemy.x,
            enemy.y - 20,
            isVampSkill ? 'NGUYỀN RỦA & TÊ LIỆT! 🦇' : 'TÊ LIỆT 6S! ⚡',
            isVampSkill ? '#f43f5e' : '#00f2fe',
            16,
            true
          );
          this.emitBurst(enemy.x, enemy.y, 14, isVampSkill ? '#e11d48' : '#00f2fe', 1.2);
        }

        if (isVampSkill) {
          // Bầy Dơi Huyết Dạ Xuất Kích: Phóng 12 phi đạn dơi huyết sắc bay vòng xoáy tìm diệt địch
          for (let batIdx = 0; batIdx < 12; batIdx++) {
            const batAngle = (batIdx / 12) * Math.PI * 2;
            this.bullets.push({
              id: this.nextEntityId++,
              x: this.player.x,
              y: this.player.y,
              vx: Math.cos(batAngle) * 450,
              vy: Math.sin(batAngle) * 450,
              radius: 9,
              damage: 75,
              isPlayer: true,
              color: '#e11d48',
              pierce: 3,
              type: 'bat_swarm',
            });
          }
          // Hồi phục ngay 20 HP & 40 Giáp khi triệu hồi Huyết Dạ
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
          this.player.armor = Math.min(this.player.maxArmor, this.player.armor + 40);
          this.addDamageText(
            this.player.x,
            this.player.y - 30,
            '🦇 BẦY DƠI HUYẾT DẠ · HỒI PHỤC HP & GIÁP · +80% ST!',
            '#f43f5e',
            16,
            true
          );
        } else {
          this.addDamageText(this.player.x, this.player.y - 30, '+80% ST · +60% XUYÊN GIÁP · +15 ST CHUẨN!', '#00f2fe', 16, true);
        }
        break;

      case 'stellar_sentinel': // Pháo Đài Vệ Tinh 360° (14s CD): Bất tử 4.5s, quét sạch đạn, 12 tia laser phản pháo
        this.player.skillActiveTimer = 4.5;
        this.player.invulnerableTimer = 4.5;
        this.player.shieldActive = true;
        this.addTrauma(0.5);
        sound.playWarpJump();
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 15,
          maxRadius: 650,
          color: '#38bdf8',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (let i = 0; i < 12; i++) {
          const ang = (i * Math.PI * 2) / 12;
          this.bullets.push({
            id: this.nextEntityId++,
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(ang) * 620,
            vy: Math.sin(ang) * 620,
            radius: 7,
            damage: 90,
            isPlayer: true,
            color: '#38bdf8',
            isLaserBeam: true,
            piercing: true,
          });
        }
        this.addDamageText(this.player.x, this.player.y - 30, 'PHÁO ĐÀI VỆ TINH 360°!', '#38bdf8', 16, true);
        break;

      case 'void_rift': // Sụp Đổ Chiều Không Gian (13s CD): Cắt đôi màn hình với 3 vết nứt chân không, -50% giáp
        this.player.skillActiveTimer = 4.0;
        this.addTrauma(0.65);
        sound.playWarpJump();
        this.shockwaves.push({
          x: this.width / 2,
          y: this.height * 0.45,
          radius: 20,
          maxRadius: 850,
          color: '#a855f7',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        [-120, 0, 120].forEach((oy) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: this.width / 2,
            y: this.height * 0.4 + oy,
            vx: 0,
            vy: 0,
            radius: 35,
            damage: 180,
            isPlayer: true,
            color: '#c084fc',
            isRiftTrap: true,
            trapDuration: 3.5,
          });
        });
        for (const enemy of this.enemies) {
          enemy.hp -= 260;
          if (enemy.defense) enemy.defense = Math.round(enemy.defense * 0.5);
          enemy.hitFlashTimer = 0.25;
          this.emitBurst(enemy.x, enemy.y, 10, '#a855f7', 1.0);
        }
        this.addDamageText(this.width / 2, this.height * 0.4, 'SỤP ĐỔ HƯ KHÔNG! -50% GIÁP', '#a855f7', 16, true);
        break;

      case 'sol_inferno': // Biển Lửa Siêu Tân Tinh (14s CD): Nửa màn hình biến thành biển lửa, hủy đạn, +40% tốc bắn
        this.player.skillActiveTimer = 5.0;
        this.addTrauma(0.6);
        sound.playExplosion('boss');
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 20,
          maxRadius: 750,
          color: '#f97316',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        for (let i = 0; i < 8; i++) {
          this.bullets.push({
            id: this.nextEntityId++,
            x: (this.width / 9) * (i + 1),
            y: this.height * 0.45,
            vx: (Math.random() - 0.5) * 40,
            vy: 60,
            radius: 22,
            damage: 90,
            isPlayer: true,
            color: '#f97316',
            isNapalmEmber: true,
            emberLife: 4.5,
          });
        }
        for (const enemy of this.enemies) {
          enemy.hp -= 200;
          enemy.hitFlashTimer = 0.2;
        }
        this.addDamageText(this.player.x, this.player.y - 30, 'BIỂN LỬA SIÊU TÂN TINH! +40% TỐC BẮN', '#f97316', 15, true);
        break;

      case 'chrono_echo': // Đảo Ngược Thời Gian (15s CD): Đẩy quái & lật ngược đạn địch, hồi 100% giáp
        this.player.skillActiveTimer = 4.0;
        this.player.armor = this.player.maxArmor;
        this.addTrauma(0.5);
        sound.playWarpJump();
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 15,
          maxRadius: 700,
          color: '#06b6d4',
          alpha: 1.0,
        });
        for (const enemy of this.enemies) {
          enemy.y = Math.max(-40, enemy.y - 200);
          enemy.hp -= 180;
          enemy.hitFlashTimer = 0.25;
          this.emitBurst(enemy.x, enemy.y, 8, '#34d399');
        }
        for (const b of this.bullets) {
          if (!b.isPlayer) {
            b.vy = -Math.abs(b.vy);
            b.isPlayer = true;
            b.color = '#06b6d4';
          }
        }
        this.addDamageText(this.player.x, this.player.y - 30, 'NGHỊCH DÒNG THỜI GIAN · HỒI 100% GIÁP!', '#06b6d4', 16, true);
        break;

      case 'graviton_lance': // Đại Pháo Khải Huyền (16s CD): Cột trọng lực 80px nghiền nát đối thủ
        this.player.skillActiveTimer = 4.0;
        this.addTrauma(0.7);
        sound.playHyperLaser();
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 20,
          maxRadius: 800,
          color: '#e11d48',
          alpha: 1.0,
        });
        this.bullets = this.bullets.filter((b) => b.isPlayer);
        this.bullets.push({
          id: this.nextEntityId++,
          x: this.player.x,
          y: this.player.y - 40,
          vx: 0,
          vy: -1500,
          radius: 38,
          damage: 480,
          isPlayer: true,
          color: '#fb7185',
          isGravitonHarpoon: true,
          piercing: true,
        });
        for (const enemy of this.enemies) {
          enemy.hp -= 280;
          enemy.hitFlashTimer = 0.3;
        }
        this.addDamageText(this.player.x, this.player.y - 30, 'ĐẠI PHÁO KHẢI HUYỀN!', '#e11d48', 16, true);
        break;

      case 'bio_spore': // Đại Dịch Ký Sinh Tuyệt Diệt (13s CD): Rút 25% HP toàn màn hình, câm lặng 3s, rơi ngọc
        this.player.skillActiveTimer = 4.0;
        this.addTrauma(0.5);
        sound.playExplosion('medium');
        this.shockwaves.push({
          x: this.width / 2,
          y: this.height * 0.45,
          radius: 20,
          maxRadius: 900,
          color: '#10b981',
          alpha: 1.0,
        });
        for (const enemy of this.enemies) {
          const leechDmg = Math.max(50, Math.round(enemy.hp * 0.25));
          enemy.hp -= leechDmg;
          enemy.shootTimer = 3.0;
          enemy.hitFlashTimer = 0.3;
          this.emitBurst(enemy.x, enemy.y, 14, '#a3e635', 1.0);
          this.addDamageText(enemy.x, enemy.y - 15, `-${leechDmg} DỊCH BỆNH`, '#10b981', 14, true);
        }
        [-60, 0, 60].forEach((ox) => {
          this.spawnPickup(this.player.x + ox, this.player.y - 40, 'shield');
        });
        this.addDamageText(this.player.x, this.player.y - 30, 'ĐẠI DỊCH KÝ SINH TUYỆT DIỆT!', '#10b981', 16, true);
        break;
    }

    this.dispatchHUD();
  }

  public addTrauma(amount: number) {
    this.trauma = clamp(this.trauma + amount, 0, 1.0);
  }

  private dispatchHUD() {
    const boss = this.enemies.find((e) => e.type === 'boss');
    const hudKey = `${Math.round(this.player.hp)}_${Math.round(this.player.armor)}_${this.score}_${this.combo}_${Math.floor(this.elapsedPlayTime)}_${this.wave}_${boss ? Math.round(boss.hp) : 0}_${this.player.bombs}_${this.player.isSkillActive}_${Math.round(this.player.skillCooldownTimer)}_${this.player.activeSpecialWeapon}_${this.warpJumpTimer > 0}`;
    if (hudKey === this.lastDispatchedHUDKey) {
      return;
    }
    this.lastDispatchedHUDKey = hudKey;

    const now = performance.now();
    const comboProgress =
      this.combo > 1 ? clamp(1 - (now - this.lastComboHitTime) / 2500, 0, 1) : 0;

    const currentUniverse = this.gameMode === 'universe' && this.currentUniverseId ? getUniverseById(this.currentUniverseId) : null;
    const currentAdvStage = this.gameMode === 'adventure' && this.currentAdventureStageId ? getAdventureStageById(this.currentAdventureStageId) : null;
    const bossRushUniv = this.gameMode === 'boss_rush' ? UNIVERSES[(this.wave - 1) % UNIVERSES.length] : null;
    const bossDisplayName = this.gameMode === 'adventure' && currentAdvStage
      ? `[BOSS MÀN ${currentAdvStage.id}/20] ${currentAdvStage.boss.name} · ${currentAdvStage.boss.title}`
      : this.gameMode === 'boss_rush' && bossRushUniv
      ? `[TRÙM ${this.wave}/20] ${bossRushUniv.bossName} · ${bossRushUniv.bossTitle}`
      : currentUniverse
      ? `${currentUniverse.bossName} · ${currentUniverse.bossTitle}`
      : 'THIẾT HẠM HƯ KHÔNG · LEVIATHAN';
    const currentConquest = this.gameMode === 'adventure' && currentAdvStage
      ? Math.round((currentAdvStage.id / 20) * 100)
      : this.gameMode === 'universe'
      ? Math.min(95, Math.floor(((this.wave - 1) / 5) * 100 + (this.enemiesKilled % 10) * 2))
      : this.gameMode === 'boss_rush'
      ? Math.round(((this.wave - 1) / 20) * 100)
      : 0;

    const nearestLandmarkInfo = this.gameMode === 'free_flight'
      ? getClosestLandmark(this.freeFlightState.x, this.freeFlightState.y)
      : null;
    const currentTheme = GALAXY_THEMES[this.freeFlightState.themeIndex] || GALAXY_THEMES[0];

    this.callbacks.onHUDUpdate({
      hp: Math.max(0, Math.round(this.player.hp)),
      maxHp: this.player.maxHp,
      armor: Math.max(0, Math.round(this.player.armor)),
      maxArmor: this.player.maxArmor,
      defense: this.player.defense,
      armorPen: this.player.armorPen,
      trueDamage: this.player.trueDamage,
      critRate: this.player.critRate,
      critDamage: this.player.critDamage,
      dodgeChance: this.player.dodgeChance,
      speed: Math.round(this.player.speed),
      fireRate: parseFloat(this.player.fireRate.toFixed(1)),
      playTimeSeconds: Math.floor(this.elapsedPlayTime),
      shieldActive: this.player.shieldActive,
      bombs: this.player.bombs,
      score: this.score,
      highScore: this.highScore,
      combo: this.combo,
      comboMultiplier: getComboMultiplier(this.combo),
      comboTimerProgress: comboProgress,
      weaponLevel: this.player.weaponLevel,
      dronesCount: this.player.dronesCount,
      wave: this.wave,
      bossActive: Boolean(boss),
      bossHp: boss ? Math.max(0, boss.hp) : 0,
      bossMaxHp: boss ? boss.maxHp : 1000,
      bossArmor: boss ? Math.max(0, Math.round(boss.armor || 0)) : 0,
      bossMaxArmor: boss ? (boss.maxArmor || 0) : 0,
      bossName: bossDisplayName,
      bossPhase: boss ? boss.phase : 1,
      bossCurrentSkill: this.bossCurrentSkillName || 'SẴN SÀNG TẤN CÔNG',
      bossSkillProgress: this.bossSkillTelegraphMax > 0 ? Math.max(0, Math.min(1, this.bossSkillTelegraphTimer / this.bossSkillTelegraphMax)) : 0,
      bossIsEnraged: boss ? boss.hp / boss.maxHp <= 0.35 : false,
      specialWeapon: this.player.activeSpecialWeapon,
      specialWeaponTimeRemaining: Math.max(0, this.player.specialWeaponTimer),
      specialWeaponMaxTime: this.player.specialWeaponMaxTimer || 15,
      skillName: this.currentFighter.skillName,
      skillDescription: this.currentFighter.skillDescription,
      skillCooldownRemaining: Math.max(0, this.player.skillCooldownTimer),
      skillCooldownMax: this.currentFighter.skillCooldown,
      skillActive: this.player.isSkillActive,
      skillActiveRemaining: Math.max(0, this.player.skillActiveTimer),
      sectorIndex: this.currentSector.sectorIndex,
      sectorName: this.currentSector.name,
      sectorVietnameseName: this.currentSector.vietnameseName,
      sectorSubtitle: this.currentSector.subtitle,
      sectorAccentColor: this.currentSector.accentColor,
      isWarpJumping: this.warpJumpTimer > 0,
      warpJumpProgress: this.warpJumpTimer / this.WARP_JUMP_DURATION,
      difficulty: this.difficulty,
      difficultyName: DIFFICULTY_CONFIGS[this.difficulty]?.vietnameseName || 'Bình Thường',
      gameMode: this.gameMode,
      universeId: this.currentUniverseId,
      universeName: this.gameMode === 'super_hard'
        ? 'CHẾ ĐỘ SIÊU KHÓ · 10 ĐỢT DIỆT TRÙM'
        : this.gameMode === 'adventure' && currentAdvStage
        ? `${currentAdvStage.name} · ${currentAdvStage.galaxyName}`
        : this.gameMode === 'boss_rush'
        ? 'ĐẠI CHIẾN 20 BOSS VŨ TRỤ'
        : this.gameMode === 'free_flight'
        ? 'DU NGOẠN THIÊN HÀ'
        : currentUniverse ? currentUniverse.name : '',
      universeConquestPercent: currentConquest,
      universeTargetWaves: this.gameMode === 'super_hard' ? 10 : this.gameMode === 'universe' ? 5 : this.gameMode === 'boss_rush' ? 20 : this.gameMode === 'adventure' ? 3 : 0,
      adventureStageId: currentAdvStage ? currentAdvStage.id : undefined,
      adventureStageName: currentAdvStage ? currentAdvStage.name : undefined,
      adventureGalaxyName: currentAdvStage ? currentAdvStage.galaxyName : undefined,
      autoFire: this.autoFire,
      revivesUsed: this.revivesUsed,
      freeFlightX: Math.round(this.freeFlightState.x),
      freeFlightY: Math.round(this.freeFlightState.y),
      freeFlightSpeed: Math.round(this.freeFlightState.speed),
      freeFlightBoostEnergy: Math.round(this.freeFlightState.boostEnergy),
      freeFlightIsBoosting: this.freeFlightState.isBoosting,
      freeFlightNearestLandmark: nearestLandmarkInfo ? `${nearestLandmarkInfo.landmark.icon} ${nearestLandmarkInfo.landmark.name}` : undefined,
      freeFlightThemeTitle: currentTheme.name,
      freeFlightIsPhotoMode: this.freeFlightState.isPhotoMode,
      equippedDrones: this.equippedDroneIds.map((id) => {
        const d = DRONES[id];
        return {
          id: d.id,
          name: d.name,
          vietnameseName: d.vietnameseName,
          tier: d.tier,
          color: d.color,
          avatarEmoji: d.avatarEmoji,
          passiveName: d.passiveSkill?.vietnameseName,
        };
      }),
      droneAegisShieldHp: this.droneAegisShieldHp,
      droneOverclockTimer: Math.max(0, this.droneOverclockTimer),
      rts88ShieldHp: this.rts88ShieldHp,
      rts88ShieldMaxHp: this.rts88ShieldMaxHp,
    });
  }

  // Main Loop
  public start() {
    this.running = true;
    this.lastTime = performance.now();
    if (this.state === 'title') {
      this.player.x = this.width / 2;
      this.player.y = 250;
    }
    const loop = (time: number) => {
      if (!this.running) return;
      const rawDt = (time - this.lastTime) / 1000;
      this.lastTime = time;

      // Clamped dt to prevent tunneling
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    this.running = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public destroy() {
    this.stop();
    if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
    if (this.keyupHandler) window.removeEventListener('keyup', this.keyupHandler);
    if (this.blurHandler) window.removeEventListener('blur', this.blurHandler);
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.visibilityHandler) document.removeEventListener('visibilitychange', this.visibilityHandler);

    if (this.mouseMoveHandler) this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    if (this.mouseDownHandler) this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
    if (this.mouseUpHandler) this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
    if (this.contextMenuHandler) this.canvas.removeEventListener('contextmenu', this.contextMenuHandler);
    if (this.touchStartHandler) this.canvas.removeEventListener('touchstart', this.touchStartHandler);
    if (this.touchMoveHandler) this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
    if (this.touchEndHandler) this.canvas.removeEventListener('touchend', this.touchEndHandler);
    if (this.touchCancelHandler) this.canvas.removeEventListener('touchcancel', this.touchCancelHandler);
  }

  private update(dt: number) {
    // Accurate running seconds timer
    if (this.state === 'playing') {
      this.elapsedPlayTime += dt;
    }

    // Floating damage texts update
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const dtText = this.damageTexts[i];
      dtText.life -= dt;
      if (dtText.life <= 0) {
        this.damageTexts.splice(i, 1);
      } else {
        dtText.x += dtText.vx * dt;
        dtText.y += dtText.vy * dt;
      }
    }

    // Warp jump timer & sector banner decay
    if (this.warpJumpTimer > 0) {
      this.warpJumpTimer = Math.max(0, this.warpJumpTimer - dt);
    }
    if (this.sectorBannerTimer > 0) {
      this.sectorBannerTimer = Math.max(0, this.sectorBannerTimer - dt);
    }

    // Background motion always updates (accelerates during warp jump!)
    const starSpeedMult = this.warpJumpTimer > 0 ? 5.5 : 1.0;
    for (const star of this.stars) {
      star.y += star.speed * starSpeedMult * dt;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }

    for (const cloud of this.clouds) {
      cloud.y += cloud.speed * (this.warpJumpTimer > 0 ? 3.0 : 1.0) * dt;
      if (cloud.y - cloud.size > this.height) {
        cloud.y = -cloud.size;
        cloud.x = Math.random() * this.width;
      }
    }

    // Update supersonic space filaments
    const filamentSpeedMult = this.warpJumpTimer > 0 ? 3.5 : 1.0;
    for (const fil of this.filaments) {
      fil.y += fil.speed * filamentSpeedMult * dt;
      if (fil.y - fil.length > this.height) {
        fil.y = -fil.length;
        fil.x = Math.random() * this.width;
      }
    }

    // Update Cosmic Dust Particles (slow, peaceful drifting stardust motes with gentle shimmer & tilt parallax)
    updateCosmicDust(
      this.cosmicDust,
      dt,
      this.width,
      this.height,
      1.0,
      this.player.tilt,
      this.warpJumpTimer > 0
    );

    // Celestial background planet subtle drift
    this.planetDriftY = (this.planetDriftY + dt * 3) % (this.height + 400);

    // Update sector ambient animations
    this.blackHoleRotation += 0.35 * dt;
    this.auroraPhase += 0.7 * dt;

    for (const ast of this.floatingAsteroids) {
      ast.y += ast.speed * dt;
      ast.rot += ast.rotSpeed * dt;
      if (ast.y - ast.size > this.height) {
        ast.y = -ast.size;
        ast.x = Math.random() * this.width;
      }
    }

    for (const ember of this.solarEmbers) {
      ember.y += ember.vy * dt;
      ember.x += ember.vx * dt;
      if (ember.y < -15) {
        ember.y = this.height + 15;
        ember.x = Math.random() * this.width;
      }
    }

    // Shockwaves update
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 800 * dt;
      sw.alpha -= 1.6 * dt;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Particles update
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particlePool[i];
      if (p.active) {
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
      }
    }

    // Decay trauma
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - 1.2 * dt);
    }

    // Simulation hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    if (this.state === 'title') {
      // Floating hero centerpiece animation responding to pointer movement
      const now = performance.now();
      const normPointerX = this.width > 0 ? (this.pointerPos.x / this.width) * 2 - 1 : 0;
      const normPointerY = this.height > 0 ? (this.pointerPos.y / this.height) * 2 - 1 : 0;
      const targetX = this.width / 2 + normPointerX * 18;
      const baseStageY = 250;
      const targetY = baseStageY + Math.sin(now * 0.003) * 6 + normPointerY * 10;
      const targetTilt = this.currentFighter.id === 'arc_tempest' ? 0 : Math.sin(now * 0.002) * 0.08 + normPointerX * 0.20;
      this.player.x += (targetX - this.player.x) * 0.08;
      this.player.y += (targetY - this.player.y) * 0.08;
      this.player.tilt = this.currentFighter.id === 'arc_tempest' ? 0 : this.player.tilt + (targetTilt - this.player.tilt) * 0.08;

      // Keep drones smoothly escorting player at all times in title / lobby mode
      this.updateDrones(dt);
      return;
    }

    if (this.gameMode === 'free_flight') {
      // Free Flight: peaceful 360-degree open universe exploration
      let moveX = 0;
      let moveY = 0;
      if (this.keysPressed.has('ArrowLeft') || this.keysPressed.has('a') || this.keysPressed.has('A')) moveX -= 1;
      if (this.keysPressed.has('ArrowRight') || this.keysPressed.has('d') || this.keysPressed.has('D')) moveX += 1;
      if (this.keysPressed.has('ArrowUp') || this.keysPressed.has('w') || this.keysPressed.has('W')) moveY -= 1;
      if (this.keysPressed.has('ArrowDown') || this.keysPressed.has('s') || this.keysPressed.has('S')) moveY += 1;

      // Pointer / touch steering
      if (this.pointerPos.isDown && this.pointerPos.hasMoved) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const pDx = this.pointerPos.x - cx;
        const pDy = this.pointerPos.y - cy;
        const pDist = Math.hypot(pDx, pDy);
        if (pDist > 25) {
          moveX = pDx / (this.width * 0.35);
          moveY = pDy / (this.height * 0.35);
        }
      }

      const isBoosting =
        this.keysPressed.has('Shift') ||
        this.keysPressed.has(' ') ||
        (this.pointerPos.isDown && this.touchActiveId !== null);

      this.freeFlightState = updateFreeFlightPhysics(
        this.freeFlightState,
        { moveX, moveY, isBoosting },
        dt,
        this.player.speed
      );

      // Emit twin thruster particle plumes behind player
      const thrusterAngle = this.freeFlightState.angle + Math.PI;
      const shipExhaustDist = 22;
      const ex1X = this.width / 2 + Math.sin(thrusterAngle) * shipExhaustDist + Math.cos(this.freeFlightState.angle) * 7;
      const ex1Y = this.height / 2 - Math.cos(thrusterAngle) * shipExhaustDist + Math.sin(this.freeFlightState.angle) * 7;
      const ex2X = this.width / 2 + Math.sin(thrusterAngle) * shipExhaustDist - Math.cos(this.freeFlightState.angle) * 7;
      const ex2Y = this.height / 2 - Math.cos(thrusterAngle) * shipExhaustDist - Math.sin(this.freeFlightState.angle) * 7;
      const plumeSpeed = isBoosting ? 280 : 120;
      const plumeColor = isBoosting ? '#38bdf8' : this.currentFighter.color || '#38bdf8';

      if (Math.random() < (isBoosting ? 0.9 : 0.4)) {
        this.emitParticle(
          ex1X,
          ex1Y,
          Math.sin(thrusterAngle) * plumeSpeed + (Math.random() - 0.5) * 40,
          -Math.cos(thrusterAngle) * plumeSpeed + (Math.random() - 0.5) * 40,
          0.3,
          isBoosting ? 4 : 2.5,
          plumeColor,
          'spark'
        );
        this.emitParticle(
          ex2X,
          ex2Y,
          Math.sin(thrusterAngle) * plumeSpeed + (Math.random() - 0.5) * 40,
          -Math.cos(thrusterAngle) * plumeSpeed + (Math.random() - 0.5) * 40,
          0.3,
          isBoosting ? 4 : 2.5,
          plumeColor,
          'spark'
        );
      }

      // Throttled HUD dispatch
      this.hudThrottleTimer += dt;
      if (this.hudThrottleTimer >= 0.1) {
        this.hudThrottleTimer = 0;
        this.dispatchHUD();
      }
      return;
    }

    // Combo timer decay check
    if (this.combo > 1 && performance.now() - this.lastComboHitTime > 2500) {
      this.combo = 1;
      this.dispatchHUD();
    }

    // Wave progression check: advance wave every 8-10 kills (except super_hard and boss_rush where waves advance on boss defeat)
    if (this.gameMode !== 'super_hard' && this.gameMode !== 'boss_rush') {
      const killsPerWave = this.gameMode === 'adventure' ? 8 : 10;
      const waveTarget = 1 + Math.floor(this.enemiesKilled / killsPerWave);
      const maxWaves = this.gameMode === 'adventure' ? 3 : this.gameMode === 'universe' ? 5 : Infinity;
      const effectiveTarget = Math.min(maxWaves, waveTarget);
      if (effectiveTarget > this.wave) {
        this.wave = effectiveTarget;

        // Check if crossing into a new sector (every 5 waves: 6, 11, 16, 21...)
        const newSector = getSectorForWave(this.wave);
        if (newSector.sectorIndex !== this.currentSector.sectorIndex) {
          this.currentSector = newSector;
          this.switchSectorTheme(newSector.sectorIndex);
          this.warpJumpTimer = this.WARP_JUMP_DURATION;
          this.sectorBannerTimer = 3.5;
          this.addTrauma(0.65);
          sound.playWarpJump();
          // Clear non-boss bullets on warp jump
          this.bullets = this.bullets.filter((b) => b.isPlayer);
          // Warp jump shockwave
          this.shockwaves.push({
            x: this.width / 2,
            y: this.height / 2,
            radius: 30,
            maxRadius: Math.max(this.width, this.height) * 1.5,
            color: newSector.accentColor,
            alpha: 1.0,
          });
        }

        this.dispatchHUD();
      }
    }

    // Boss trigger check:
    const hasBoss = this.enemies.some((e) => e.type === 'boss');
    if (!hasBoss) {
      if (this.gameMode === 'super_hard') {
        if (this.lastBossWaveSpawned !== this.wave) {
          this.spawnBoss();
          this.lastBossWaveSpawned = this.wave;
        }
      } else if (this.gameMode === 'boss_rush') {
        if (this.lastBossWaveSpawned !== this.wave) {
          this.spawnBoss();
          this.lastBossWaveSpawned = this.wave;
        }
      } else if (this.gameMode === 'adventure') {
        if (this.wave === 3 && this.lastBossWaveSpawned !== 3) {
          this.spawnBoss();
          this.lastBossWaveSpawned = 3;
        }
      } else if (this.gameMode === 'universe') {
        if (this.wave === 5 && this.lastBossWaveSpawned !== 5) {
          this.spawnBoss();
          this.lastBossWaveSpawned = 5;
        }
      } else {
        if (this.wave >= 3 && this.wave > this.lastBossWaveSpawned && this.wave % 3 === 0) {
          this.spawnBoss();
          this.lastBossWaveSpawned = this.wave;
        }
      }
    }

    // Update lightning arcs
    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      const arc = this.lightningArcs[i];
      arc.life -= dt;
      if (arc.life <= 0) {
        this.lightningArcs.splice(i, 1);
      }
    }

    this.updatePlayer(dt);
    this.updateDrones(dt);
    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.updatePickups(dt);
    this.checkCollisions();

    // Throttled HUD dispatch (~12 FPS) to eliminate React re-render lag
    this.hudThrottleTimer += dt;
    if (this.hudThrottleTimer >= 0.08) {
      this.hudThrottleTimer = 0;
      this.dispatchHUD();
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    const f = this.currentFighter;

    // Movement calculation
    let moveX = 0;
    let moveY = 0;

    if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) moveX -= 1;
    if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) moveX += 1;
    if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) moveY -= 1;
    if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) moveY += 1;

    const effectiveSpeed = (p.speed || f.speed) * (f.id === 'phoenix' && p.isSkillActive ? 1.6 : 1.0);

    if (moveX !== 0 || moveY !== 0) {
      // Normalize diagonal speed
      const len = Math.hypot(moveX, moveY);
      p.x += (moveX / len) * effectiveSpeed * dt;
      p.y += (moveY / len) * effectiveSpeed * dt;
      p.targetX = p.x;
      p.targetY = p.y;
    } else if (this.isTouching) {
      // Direct fluid 1:1 mobile touch steering
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      p.x += dx * Math.min(1, 32 * dt);
      p.y += dy * Math.min(1, 32 * dt);
      moveX = dx;
    } else if (this.pointerPos.isDown) {
      // Smooth interpolation toward pointer (mouse)
      const dx = this.pointerPos.x - p.x;
      const dy = this.pointerPos.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 3) {
        const step = Math.min(dist, effectiveSpeed * 1.5 * dt);
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
        moveX = dx;
      }
    }

    // Keep player in bounds
    p.x = clamp(p.x, 24, this.width - 24);
    p.y = clamp(p.y, 40, this.height - 35);

    // Bank tilt based on X motion (LX-88 is completely stabilized and never tilts or wobbles)
    if (f.id === 'arc_tempest') {
      p.tilt = 0;
    } else {
      const targetTilt = clamp(moveX * 0.35, -0.4, 0.4);
      p.tilt += (targetTilt - p.tilt) * 12 * dt;
    }

    // Giáp (Armor) passive regeneration: takes 4s without damage, then recovers 10 armor/s
    if (p.armorRegenCooldown > 0) {
      p.armorRegenCooldown -= dt;
    } else if (p.armor < p.maxArmor) {
      p.armor = Math.min(p.maxArmor, p.armor + 10 * dt);
    }

    // Timers
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.hitFlashTimer > 0) p.hitFlashTimer -= dt;
    if (p.skillCooldownTimer > 0) p.skillCooldownTimer -= dt;

    if (p.skillActiveTimer > 0) {
      p.skillActiveTimer -= dt;
      if (p.skillActiveTimer <= 0) {
        p.isSkillActive = false;
        p.phantomWingmenActive = false;
        p.solarBeamActive = false;
        p.timeDilation = 1.0;
        this.rts88ShieldHp = 0;
        this.dispatchHUD();
      }
    }

    // Solaris active solar ray column burn
    if (p.solarBeamActive) {
      for (const enemy of this.enemies) {
        if (Math.abs(enemy.x - p.x) < 55 && enemy.y < p.y) {
          enemy.hp -= 450 * dt;
          enemy.hitFlashTimer = 0.08;
        }
      }
      if (Math.random() < 0.6) {
        this.emitBurst(p.x + (Math.random() * 40 - 20), p.y - 30, 2, '#fde047', 1.0);
      }
    }

    // Special weapon timer decay
    if (p.activeSpecialWeapon !== 'none') {
      p.specialWeaponTimer -= dt;
      if (p.specialWeaponTimer <= 0) {
        p.activeSpecialWeapon = 'none';
        p.specialWeaponTimer = 0;
        this.dispatchHUD();
      }
    }

    // Thruster engine particles
    if (Math.random() < 0.8) {
      this.emitParticle(
        p.x + (Math.random() * 8 - 4),
        p.y + 24,
        (Math.random() * 20 - 10),
        Math.random() * 80 + 120,
        0.2,
        Math.random() * 3 + 2,
        p.isSkillActive ? '#f43f5e' : f.accentColor,
        'spark'
      );
    }

    // 7-Day Streak Cosmetic Skin Sparkling Particles
    if (this.activeCosmeticSkinId && Math.random() < 0.65) {
      const skinColor =
        this.activeCosmeticSkinId === 'skin_golden_sovereign'
          ? (Math.random() < 0.6 ? '#fbbf24' : '#fef08a')
          : this.activeCosmeticSkinId === 'skin_cosmic_nebula'
          ? (Math.random() < 0.6 ? '#c084fc' : '#38bdf8')
          : (Math.random() < 0.6 ? '#f43f5e' : '#fb7185');

      this.emitParticle(
        p.x + (Math.random() * 24 - 12),
        p.y + (Math.random() * 24 - 8),
        (Math.random() * 40 - 20),
        Math.random() * 50 + 50,
        0.35,
        Math.random() * 2.5 + 1.5,
        skinColor,
        'spark'
      );
    }

    // Firing logic (auto-fire by default or Space, click, or continuous touch)
    const wantsFire =
      this.autoFire || this.keysPressed.has('Space') || this.pointerPos.isDown || p.isFiring;

    p.fireTimer -= dt;
    if (wantsFire && p.fireTimer <= 0) {
      this.firePlayerWeapons();
      const accBonuses = calculateAccessoryBonuses(this.installedAccessories);
      let baseRate = f.fireRate;
      if (f.id === 'phoenix' && p.isSkillActive) baseRate *= 2.0;
      if (f.id === 'falcon' && p.isSkillActive) baseRate *= 2.5;

      const rawFireRate =
        p.activeSpecialWeapon === 'laser'
          ? SPECIAL_WEAPONS.laser.fireRate
          : p.activeSpecialWeapon === 'lightning'
          ? SPECIAL_WEAPONS.lightning.fireRate
          : baseRate;

      const currentFireRate = rawFireRate * (1 + accBonuses.fireRatePercent / 100);
      p.fireTimer = 1 / currentFireRate;
    }

    // Titan auto micro-missiles (always available as secondary for Titan)
    if (f.id === 'titan' && p.weaponLevel >= 2) {
      p.missileTimer -= dt;
      if (p.missileTimer <= 0) {
        this.fireHomingMissiles();
        p.missileTimer = 1.4;
      }
    }
  }

  private updateDrones(dt: number) {
    if (this.equippedDroneIds.length === 0) return;

    const now = performance.now();
    const total = this.equippedDroneIds.length;

    // Overclock timer decay
    if (this.droneOverclockTimer > 0) {
      this.droneOverclockTimer -= dt;
      if (Math.random() < 0.25) {
        this.emitParticle(
          this.player.x + (Math.random() * 24 - 12),
          this.player.y + (Math.random() * 24 - 12),
          0,
          -60,
          0.2,
          2.5,
          '#f59e0b',
          'spark'
        );
      }
    }

    // Tier S Drone: Aegis Bastion recurring barrier (25% max HP every 12 seconds)
    const hasAegisDrone = this.equippedDroneIds.some(
      (id) => DRONES[id]?.passiveSkill?.type === 'aegis_shield'
    );
    if (hasAegisDrone) {
      this.droneAegisCooldownTimer -= dt;
      if (this.droneAegisCooldownTimer <= 0) {
        this.droneAegisCooldownTimer = 12.0;
        this.droneAegisShieldHp = Math.round(this.player.maxHp * 0.25);
        this.addDamageText(this.player.x, this.player.y - 28, '🛡️ KHIÊN NANO 25% HP', '#06b6d4', 13, true);
        this.emitBurst(this.player.x, this.player.y, 10, '#38bdf8', 1.0);
        sound.playPowerup('shield');
      }
    }

    // Tier S Drone: Chrono Stasis EMP pulse (clears enemy bullets in 180px radius every 8 seconds)
    const hasChronoDrone = this.equippedDroneIds.some(
      (id) => DRONES[id]?.passiveSkill?.type === 'chrono_burst'
    );
    if (hasChronoDrone && this.state === 'playing') {
      this.droneChronoTimer -= dt;
      if (this.droneChronoTimer <= 0) {
        this.droneChronoTimer = 8.0;
        let cleared = 0;
        for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
          const b = this.bullets[bi];
          if (!b.isPlayer && Math.hypot(b.x - this.player.x, b.y - this.player.y) <= 180) {
            this.bullets.splice(bi, 1);
            this.emitBurst(b.x, b.y, 4, '#10b981', 0.5);
            cleared++;
          }
        }
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 180,
          color: '#10b981',
          alpha: 0.8,
        });
        if (cleared > 0) {
          this.addDamageText(this.player.x, this.player.y - 32, `⏳ XÓA ${cleared} ĐẠN!`, '#10b981', 13, true);
        }
        sound.playBomb();
      }
    }

    // Tier S Drone: Void Singularity (Void Rift every 10s: creates a black hole rift dealing 150 true damage to enemies)
    const hasVoidDrone = this.equippedDroneIds.some(
      (id) => DRONES[id]?.passiveSkill?.type === 'void_rift'
    );
    if (hasVoidDrone && this.state === 'playing') {
      this.droneVoidTimer -= dt;
      if (this.droneVoidTimer <= 0) {
        this.droneVoidTimer = 10.0;
        const riftX = this.player.x;
        const riftY = Math.max(120, this.player.y - 200);
        sound.playExplosion('medium');
        this.shockwaves.push({
          x: riftX,
          y: riftY,
          radius: 15,
          maxRadius: 220,
          color: '#8b5cf6',
          alpha: 1.0,
        });
        this.emitBurst(riftX, riftY, 20, '#a855f7', 1.5);
        for (const en of this.enemies) {
          if (Math.hypot(en.x - riftX, en.y - riftY) <= 200) {
            en.hp -= 150;
            en.hitFlashTimer = 0.12;
            this.addDamageText(en.x, en.y - 12, '150 HƯ KHÔNG⚡', '#a855f7', 14, true);
          }
        }
        this.addDamageText(this.player.x, this.player.y - 32, '🌌 VẾT RÁCH HƯ KHÔNG!', '#c084fc', 13, true);
      }
    }

    // Tier S Drone: Solar Prominence (Solar Flare every 7s: fires 3 searing solar beams dealing heavy damage)
    const hasSolarDrone = this.equippedDroneIds.some(
      (id) => DRONES[id]?.passiveSkill?.type === 'solar_flare'
    );
    if (hasSolarDrone && this.state === 'playing') {
      this.droneSolarTimer -= dt;
      if (this.droneSolarTimer <= 0) {
        this.droneSolarTimer = 7.0;
        sound.playHyperLaser();
        [-30, 0, 30].forEach((ox) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: this.player.x + ox,
            y: this.player.y - 24,
            vx: ox * 2.5,
            vy: -980,
            radius: 8,
            damage: 90,
            isPlayer: true,
            color: '#fbbf24',
            isTrueDamage: true,
          });
        });
        this.emitBurst(this.player.x, this.player.y - 20, 12, '#f59e0b', 1.2);
        this.addDamageText(this.player.x, this.player.y - 32, '☀️ BÃO LỬA NHẬT HOA!', '#fbbf24', 13, true);
      }
    }

    // Tier S Drone: Nanite Reconstructor (Bio-repair every 5s: restores 15 armor)
    const hasNaniteDrone = this.equippedDroneIds.some(
      (id) => DRONES[id]?.passiveSkill?.type === 'nano_swarm'
    );
    if (hasNaniteDrone && this.state === 'playing') {
      this.droneNaniteTimer -= dt;
      if (this.droneNaniteTimer <= 0) {
        this.droneNaniteTimer = 5.0;
        if (this.player.armor < this.player.maxArmor) {
          this.player.armor = Math.min(this.player.maxArmor, this.player.armor + 15);
          this.addDamageText(this.player.x, this.player.y - 26, '+15 GIÁP NANO 🧬', '#34d399', 13, true);
          this.emitBurst(this.player.x, this.player.y, 8, '#10b981', 0.6);
          sound.playPowerup('shield');
        }
      }
    }

    // Tier S Drone: Thunder Spark (DR-88 Lôi Vân Kích S passive when equipped to OTHER fighters)
    // Cứ sau 5 giây dron sẽ bắn 3 tia sét vào kẻ địch gây 200 sát thương và khiến kẻ địch bị tê liệt trong 3 giây
    const hasThunderDrone = this.equippedDroneIds.includes('drone_thunder_storm_s');
    if (hasThunderDrone && this.currentFighter.id !== 'rts_88' && this.state === 'playing') {
      this.droneThunderTimer -= dt;
      if (this.droneThunderTimer <= 0) {
        this.droneThunderTimer = 5.0;
        // Find up to 3 valid enemies on screen
        const eligibleEnemies = this.enemies
          .filter((e) => e.y >= 0 && e.y <= this.height)
          .sort((a, b) => a.y - b.y)
          .slice(0, 3);

        if (eligibleEnemies.length > 0) {
          sound.playLightning();
          const activeBolts: Array<{ startX: number; startY: number; endX: number; endY: number; isChain?: boolean }> = [];
          for (const target of eligibleEnemies) {
            activeBolts.push({
              startX: this.player.x,
              startY: this.player.y - 20,
              endX: target.x,
              endY: target.y,
            });

            target.hp = Math.max(0, target.hp - 200);
            target.stunTimer = Math.max(target.stunTimer || 0, 3.0);
            target.hitFlashTimer = 0.15;
            this.emitBurst(target.x, target.y, 8, '#00f0ff', 1.0);
            this.emitBurst(target.x, target.y, 6, '#facc15', 0.8);
            this.addDamageText(target.x, target.y - 18, '200 ⚡TÊ LIỆT 3S!', '#00f0ff', 14, true);

            if (target.hp <= 0) {
              const tIdx = this.enemies.indexOf(target);
              if (tIdx !== -1) {
                this.destroyEnemy(target, tIdx);
              }
            }
          }

          this.rts88ActiveLightning = {
            bolts: activeBolts,
            expireTime: performance.now() + 180,
          };
          this.addDamageText(this.player.x, this.player.y - 32, '⚡LÔI VÂN KÍCH 3 TIA!', '#facc15', 13, true);
        }
      }
    }

    // Update positions and autonomous firing for each equipped drone
    for (let i = 0; i < total; i++) {
      const droneId = this.equippedDroneIds[i];
      const drone = DRONES[droneId];
      if (!drone) continue;

      if (!this.dronePositions[i]) {
        this.dronePositions[i] = {
          x: this.player.x,
          y: this.player.y + 30,
          vx: 0,
          vy: 0,
          fireTimer: 0,
          tilt: 0,
        };
      }
      const dPos = this.dronePositions[i];
      const target = calculateDroneEscortPosition(
        this.player.x,
        this.player.y,
        i as 0 | 1,
        total,
        now
      );

      // Smooth lerp trailing the player fighter
      dPos.x += (target.x - dPos.x) * Math.min(1, 10 * dt);
      dPos.y += (target.y - dPos.y) * Math.min(1, 10 * dt);
      dPos.tilt = clamp((target.x - dPos.x) * 0.04, -0.3, 0.3);

      // Drone autonomous firing logic
      if (this.state === 'playing') {
        dPos.fireTimer += dt;
        const fireInterval = 1 / drone.fireRate;
        if (dPos.fireTimer >= fireInterval) {
          dPos.fireTimer = 0;
          this.fireDroneWeapon(drone, dPos.x, dPos.y);
        }
      }
    }
  }

  private fireDroneWeapon(drone: DroneData, x: number, y: number) {
    const dmg = drone.bulletDamage;
    const isOverclock = this.droneOverclockTimer > 0;
    const finalDmg = isOverclock ? Math.round(dmg * 1.15) : dmg;

    // Dron Trấn Phái RTS-88: DR-88 Lôi Vân Kích S
    // Bắn tia sét điện / tia điện nhỏ (lightning bolt) kèm hiệu ứng phóng điện nổ lách tách
    if (drone.id === 'drone_thunder_storm_s') {
      sound.playLaser('light');
      this.bullets.push({
        id: this.nextEntityId++,
        x,
        y: y - 10,
        vx: (Math.random() - 0.5) * 16,
        vy: -960,
        radius: 5,
        damage: finalDmg,
        isPlayer: true,
        color: '#38bdf8',
        isDroneLightningBolt: true,
        isTrueDamage: true,
        piercing: true,
      });

      // Tạo hiệu ứng tia điện nhỏ phóng ra từ 2 đầu cực điện của drone (tia điện nhỏ)
      const jagArc1 = this.createLightningSegments(x - 6, y - 6, x - 2 + (Math.random() - 0.5) * 6, y - 24, 4);
      const jagArc2 = this.createLightningSegments(x + 6, y - 6, x + 2 + (Math.random() - 0.5) * 6, y - 24, 4);
      this.lightningArcs.push({
        segments: jagArc1,
        life: 0.08,
        maxLife: 0.08,
        color: '#38bdf8',
      });
      this.lightningArcs.push({
        segments: jagArc2,
        life: 0.08,
        maxLife: 0.08,
        color: '#facc15',
      });

      // Muzzle spark particles
      this.emitBurst(x, y - 8, 3, '#38bdf8', 0.6);
      return;
    }

    if (drone.bulletType === 'vampiric') {
      sound.playLaser('light');
      this.bullets.push({
        id: this.nextEntityId++,
        x,
        y: y - 10,
        vx: (Math.random() - 0.5) * 30,
        vy: -780,
        radius: 6.5,
        damage: finalDmg,
        isPlayer: true,
        color: drone.bulletColor,
        isTrueDamage: true,
      });
    } else if (drone.bulletType === 'tachyon') {
      sound.playLaser('light');
      this.bullets.push({
        id: this.nextEntityId++,
        x,
        y: y - 12,
        vx: 0,
        vy: -920,
        radius: 5,
        damage: finalDmg,
        isPlayer: true,
        color: drone.bulletColor,
        isTachyonBeam: true,
      });
    } else if (drone.bulletType === 'missile') {
      sound.playLaser('light');
      this.bullets.push({
        id: this.nextEntityId++,
        x,
        y: y - 8,
        vx: (Math.random() - 0.5) * 80,
        vy: -420,
        radius: 5,
        damage: finalDmg,
        isPlayer: true,
        color: drone.bulletColor,
        isHoming: true,
      });
    } else if (drone.bulletType === 'laser') {
      sound.playLaser('light');
      this.bullets.push({
        id: this.nextEntityId++,
        x,
        y: y - 14,
        vx: 0,
        vy: -950,
        radius: 4.5,
        damage: finalDmg,
        isPlayer: true,
        color: drone.bulletColor,
        isLaserBeam: true,
        piercing: true,
      });
    } else {
      sound.playLaser('light');
      this.bullets.push({
        id: this.nextEntityId++,
        x,
        y: y - 10,
        vx: (Math.random() - 0.5) * 20,
        vy: -820,
        radius: 5.5,
        damage: finalDmg,
        isPlayer: true,
        color: drone.bulletColor,
      });
    }
  }

  private createLightningSegments(x1: number, y1: number, x2: number, y2: number, steps: number = 6) {
    const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const perpX = -dy / (len || 1);
    const perpY = dx / (len || 1);

    let prevX = x1;
    let prevY = y1;

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const jag = (Math.random() - 0.5) * 24;
      const curX = x1 + dx * t + perpX * jag;
      const curY = y1 + dy * t + perpY * jag;
      segments.push({ x1: prevX, y1: prevY, x2: curX, y2: curY });
      prevX = curX;
      prevY = curY;
    }
    segments.push({ x1: prevX, y1: prevY, x2, y2 });
    return segments;
  }

  private firePlayerWeapons() {
    const p = this.player;
    const f = this.currentFighter;
    const specs = getWeaponUpgradeSpecs(p.weaponLevel);
    const pilotBonus = getPilotBonus(this.currentPilot?.id || null);
    const accBonus = calculateAccessoryBonuses(this.installedAccessories);
    const starBonus = getFighterStarBonus(this.fighterStarLevel);
    const droneBonus = calculateDroneBonuses(this.equippedDroneIds, this.currentFighter?.id);
    const overclockMult = this.droneOverclockTimer > 0 ? 1.15 : 1.0;
    const totalBonusMultiplier = (1 + (pilotBonus.damagePercent + accBonus.damagePercent + (starBonus.damageBonusPercent || 0) + droneBonus.damagePercent) / 100) * overclockMult;
    const damage = f.bulletDamage * specs.damageMultiplier * totalBonusMultiplier;

    // 1. SPECIAL WEAPON: HỘP QUÀ ĐẠN LASER
    if (p.activeSpecialWeapon === 'laser') {
      sound.playHyperLaser();
      const laserDamage = SPECIAL_WEAPONS.laser.bulletDamage * specs.damageMultiplier * totalBonusMultiplier;

      // Heavy Piercing Center Beam
      this.bullets.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y - 30,
        vx: 0,
        vy: -1150,
        radius: 8,
        damage: laserDamage,
        isPlayer: true,
        color: '#f43f5e',
        isLaserBeam: true,
        piercing: true,
      });

      // Side piercing beams if upgraded
      if (specs.bulletCount >= 3) {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x - 18,
          y: p.y - 18,
          vx: -70,
          vy: -1100,
          radius: 6,
          damage: laserDamage * 0.75,
          isPlayer: true,
          color: '#fb7185',
          isLaserBeam: true,
          piercing: true,
        });
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + 18,
          y: p.y - 18,
          vx: 70,
          vy: -1100,
          radius: 6,
          damage: laserDamage * 0.75,
          isPlayer: true,
          color: '#fb7185',
          isLaserBeam: true,
          piercing: true,
        });
      }

      // Spark trail along laser nozzle
      if (Math.random() < 0.6) {
        this.emitParticle(p.x, p.y - 28, (Math.random() * 40 - 20), -150, 0.15, 3, '#f43f5e', 'spark');
      }
      return;
    }

    // 2. SPECIAL WEAPON: HỘP QUÀ ĐẠN SẤM SÉT
    if (p.activeSpecialWeapon === 'lightning') {
      sound.playLightning();
      const lightningDamage = SPECIAL_WEAPONS.lightning.bulletDamage * specs.damageMultiplier * totalBonusMultiplier;

      // Chain up to 3-4 targets
      const maxChain = specs.bulletCount >= 3 ? 4 : 3;
      const targets = findLightningChainTargets(p.x, p.y - 24, this.enemies, maxChain, 340);

      if (targets.length > 0) {
        let fromX = p.x;
        let fromY = p.y - 24;

        for (const target of targets) {
          const segs = this.createLightningSegments(fromX, fromY, target.x, target.y);
          this.lightningArcs.push({
            segments: segs,
            life: 0.12,
            maxLife: 0.12,
            color: '#06b6d4',
          });

          target.hp -= lightningDamage;
          target.hitFlashTimer = 0.1;
          this.emitBurst(target.x, target.y, 6, '#38bdf8', 0.8);

          if (target.hp <= 0) {
            const idx = this.enemies.indexOf(target);
            if (idx !== -1) {
              this.destroyEnemy(target, idx);
            }
          }

          fromX = target.x;
          fromY = target.y;
        }
      }

      // Always fire twin forward crackling electric orbs for direct trajectory impact
      [-12, 12].forEach((offset) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + offset,
          y: p.y - 18,
          vx: offset * 3.5,
          vy: -840,
          radius: 7,
          damage: lightningDamage * 0.7,
          isPlayer: true,
          color: '#67e8f9',
          isLightningOrb: true,
        });
      });

      return;
    }

    // Critical multiplier for Ghost void stealth
    const finalDamage = f.id === 'ghost' && p.isSkillActive ? damage * 2.0 : damage;

    if (f.id === 'rts_88') {
      // RTS-88 TIA CHỚP: Mỗi 0.1s bắn 1 đường tia sấm sét tẹt vào kẻ địch gây 22 ST
      // Nếu có kẻ địch xung quanh, tia sét lan ra xung quanh gây 70% ST gốc
      // Sát thương gây ra xuyên qua 40% giáp và phòng thủ của kẻ địch
      // Khi có khiên sấm sét bảo vệ (rts88ShieldHp > 0 && p.isSkillActive), sát thương tăng 80% (x1.8)
      const isArkOne = this.activeCosmeticSkinId === 'skin_rts88_ark_one';
      if (!this.rts88AudioTimer || performance.now() - this.rts88AudioTimer > 200) {
        if (isArkOne) {
          sound.playArkOneLightning();
        } else {
          sound.playLightning();
        }
        this.rts88AudioTimer = performance.now();
      }

      const isShieldActive = p.isSkillActive && this.rts88ShieldHp > 0;
      const skillDmgMult = isShieldActive ? 1.8 : 1.0;
      const effectiveArmorPen = Math.max(40, p.armorPen);

      const bCalc = calculateBulletDamage(
        f.bulletDamage * skillDmgMult, // 22 * 1.8 = 39.6 during shield
        specs.damageMultiplier,
        totalBonusMultiplier,
        p.critRate,
        p.critDamage,
        p.trueDamage
      );

      const noseX = p.x;
      const noseY = p.y - 28;
      const hasSignaturePilot = this.currentPilot?.id === 'pilot_raiden_s';
      const hasThunderDrone = this.equippedDroneIds.includes('drone_thunder_storm_s');

      // Sort candidate enemies ahead of fighter by distance
      const sortedEnemies = this.enemies
        .filter((e) => e.y <= p.y + 30)
        .map((e) => ({
          enemy: e,
          dist: Math.hypot((e.x - noseX) * 1.4, e.y - noseY),
        }))
        .sort((a, b) => a.dist - b.dist);

      const primaryTarget = sortedEnemies[0]?.enemy || null;
      // TRẤN PHÁI RTS-88 (Raiden): Bắn ra thêm 1 tia sấm sét nữa!
      const secondaryTarget = hasSignaturePilot
        ? (sortedEnemies[1]?.enemy || primaryTarget)
        : null;

      const activeBolts: Array<{
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        isChain?: boolean;
      }> = [];

      // Helper function to process lightning damage on a target
      const processLightningHit = (target: Enemy, boltStartX: number, boltStartY: number, isSecondary: boolean = false) => {
        activeBolts.push({
          startX: boltStartX,
          startY: boltStartY,
          endX: target.x,
          endY: target.y,
        });

        // Pierces 40% defense and armor
        const effectiveDef = Math.max(0, (target.defense || 0) * (1 - 0.40));
        const rawDmg = bCalc.finalDamage;
        const defMitigatedDmg = Math.max(1, Math.round(rawDmg * (100 / (100 + effectiveDef))));
        const dealtDmg = defMitigatedDmg + (bCalc.trueDamagePart || 0);

        if (typeof target.hp !== 'number' || isNaN(target.hp)) target.hp = target.maxHp || 100;
        if (target.armor !== undefined && (typeof target.armor !== 'number' || isNaN(target.armor))) {
          target.armor = target.maxArmor || 0;
        }

        if (target.armor !== undefined && target.armor > 0) {
          const armRes = applyDamageWithArmor(target.armor, target.hp, dealtDmg, Boolean(bCalc.trueDamagePart));
          target.armor = armRes.newArmor;
          target.hp = armRes.newHp;
          if (armRes.armorBroken) {
            this.addDamageText(target.x, target.y - 20, 'VỠ GIÁP! 🛡️', '#38bdf8', 14, true);
            sound.playShieldBreak();
          }
        } else {
          target.hp = Math.max(0, target.hp - dealtDmg);
        }

        // Drone Trấn Phái RTS-88: Khi tia sét bắn trúng địch sẽ khiến địch di chuyển chậm đi 30% (không cộng dồn)
        if (hasThunderDrone) {
          target.slowTimer = Math.max(target.slowTimer || 0, 2.5);
          target.slowFactor = 0.30;
        }

        target.hitFlashTimer = 0.08;
        if (isArkOne) {
          this.emitBurst(target.x, target.y, 6, '#ff0033', 1.0);
          this.emitBurst(target.x, target.y, 4, '#09090b', 0.8);
          this.emitBurst(target.x, target.y, 3, '#ff4d6d', 0.6);
        } else {
          this.emitBurst(target.x, target.y, 5, '#00f0ff', 0.8);
          this.emitBurst(target.x, target.y, 4, '#facc15', 0.6);
        }

        if (isSecondary) {
          this.addDamageText(
            target.x,
            target.y - 22,
            isArkOne ? `${dealtDmg} 🔴 ÁC Ý SONG LÔI` : `${dealtDmg} ⚡SONG LÔI`,
            isArkOne ? '#ff0033' : '#facc15',
            13,
            true
          );
        } else if (isArkOne) {
          this.addDamageText(target.x, target.y - 20, `${dealtDmg} 🔴 ÁC Ý ARK-ONE`, '#ff0033', 13, true);
        }

        // Chain lightning: lan ra kẻ địch xung quanh gây 70% sát thương gốc
        const chainRadius = 160;
        const chainBaseDmg = Math.max(1, Math.round(dealtDmg * 0.70));
        let chainedCount = 0;

        for (const nearby of this.enemies) {
          if (nearby.id === target.id) continue;
          const chainDist = Math.hypot(nearby.x - target.x, nearby.y - target.y);
          if (chainDist <= chainRadius && chainedCount < 4) {
            chainedCount++;
            activeBolts.push({
              startX: target.x,
              startY: target.y,
              endX: nearby.x,
              endY: nearby.y,
              isChain: true,
            });

            const nearbyEffDef = Math.max(0, (nearby.defense || 0) * (1 - 0.40));
            const chainMitigated = Math.max(1, Math.round(chainBaseDmg * (100 / (100 + nearbyEffDef))));

            if (typeof nearby.hp !== 'number' || isNaN(nearby.hp)) nearby.hp = nearby.maxHp || 100;
            if (nearby.armor !== undefined && (typeof nearby.armor !== 'number' || isNaN(nearby.armor))) {
              nearby.armor = nearby.maxArmor || 0;
            }

            if (nearby.armor !== undefined && nearby.armor > 0) {
              const armRes = applyDamageWithArmor(nearby.armor, nearby.hp, chainMitigated, false);
              nearby.armor = armRes.newArmor;
              nearby.hp = armRes.newHp;
            } else {
              nearby.hp = Math.max(0, nearby.hp - chainMitigated);
            }

            // Drone Trấn Phái: Lan truyền làm chậm 30% không cộng dồn
            if (hasThunderDrone) {
              nearby.slowTimer = Math.max(nearby.slowTimer || 0, 2.5);
              nearby.slowFactor = 0.30;
            }

            nearby.hitFlashTimer = 0.08;
            if (isArkOne) {
              this.emitBurst(nearby.x, nearby.y, 4, '#ff0033', 0.8);
              this.addDamageText(nearby.x, nearby.y - 12, `${chainMitigated} 🔴 ÁC Ý LAN`, '#ff4d6d', 12);
            } else {
              this.emitBurst(nearby.x, nearby.y, 4, '#38bdf8', 0.6);
              this.addDamageText(nearby.x, nearby.y - 12, `${chainMitigated} ⚡LAN`, '#7dd3fc', 12);
            }

            // Destroy chained enemy immediately when HP drops to 0
            if (nearby.hp <= 0) {
              const nIdx = this.enemies.indexOf(nearby);
              if (nIdx !== -1) {
                this.destroyEnemy(nearby, nIdx);
              }
            }
          }
        }

        // Destroy primary/secondary target immediately when HP drops to 0
        if (target.hp <= 0) {
          const idx = this.enemies.indexOf(target);
          if (idx !== -1) {
            this.destroyEnemy(target, idx);
          }
        }
      };

      if (primaryTarget) {
        processLightningHit(primaryTarget, hasSignaturePilot ? noseX - 4 : noseX, noseY, false);
        if (hasSignaturePilot && secondaryTarget) {
          processLightningHit(secondaryTarget, noseX + 4, noseY, true);
        }
      } else {
        // Strike upwards into the void
        if (hasSignaturePilot) {
          activeBolts.push({
            startX: noseX - 4,
            startY: noseY,
            endX: noseX - 6 + (Math.random() - 0.5) * 15,
            endY: 0,
          });
          activeBolts.push({
            startX: noseX + 4,
            startY: noseY,
            endX: noseX + 6 + (Math.random() - 0.5) * 15,
            endY: 0,
          });
        } else {
          activeBolts.push({
            startX: noseX,
            startY: noseY,
            endX: noseX + (Math.random() - 0.5) * 20,
            endY: 0,
          });
        }
      }

      this.rts88ActiveLightning = {
        bolts: activeBolts,
        expireTime: performance.now() + 115,
      };

      return;
    }

    if (f.id === 'arc_tempest') {
      // LX-88 ARC TEMPEST: Mỗi 0.1 giây gây 12 sát thương lên cho mục tiêu
      // Khi skill kích hoạt: Tăng 80% sát thương, 60% xuyên giáp và +15 sát thương chuẩn
      const isVamp = this.activeCosmeticSkinId === 'skin_lx88_vampire';
      const isRoyal =
        this.activeCosmeticSkinId === 'skin_lx88_royal_gold' ||
        this.activeCosmeticSkinId === 'skin_golden_sovereign';

      if (!this.lx88AudioTimer || performance.now() - this.lx88AudioTimer > 260) {
        if (isVamp) {
          sound.playVampireLaser();
        } else if (isRoyal) {
          sound.playRoyalLaser();
        } else {
          sound.playHyperLaser();
        }
        this.lx88AudioTimer = performance.now();
      }

      const skillDmgMult = p.isSkillActive ? 1.8 : 1.0;
      const skillArmorPenBonus = p.isSkillActive ? 60 : 0;
      const skillTrueDmgBonus = p.isSkillActive ? 15 : 0;

      const effectiveTrueDmg = p.trueDamage + skillTrueDmgBonus;
      const effectiveArmorPen = Math.min(100, p.armorPen + skillArmorPenBonus);

      const bCalc = calculateBulletDamage(
        f.bulletDamage * skillDmgMult, // 12 * 1.8 = 21.6 during skill
        specs.damageMultiplier,
        totalBonusMultiplier,
        p.critRate,
        p.critDamage,
        effectiveTrueDmg
      );

      // Straight laser beam parameters: shoots purely straight vertical upwards (tilt = 0) and tracks the fighter X seamlessly
      const trajectory = calculateLaserBeamTrajectory(p.x, p.y, 0, this.height, 34);
      const hitEnemyIds = new Set<number>();

      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (hitEnemyIds.has(e.id)) continue;

        const hitResult = checkLaserHit(
          trajectory.startX,
          trajectory.startY,
          trajectory.endX,
          trajectory.endY,
          e.x,
          e.y,
          e.radius,
          20
        );

        if (hitResult.isHit) {
          hitEnemyIds.add(e.id);
          const isBoss = e.type === 'boss';

          // Calculate defense reduction factoring armor penetration
          const effectiveDef = Math.max(0, (e.defense || 0) * (1 - effectiveArmorPen / 100));
          const rawDmg = bCalc.finalDamage;
          const defMitigatedDmg = Math.max(1, Math.round(rawDmg * (100 / (100 + effectiveDef))));
          const dealtDmg = defMitigatedDmg + (bCalc.trueDamagePart || 0);

          if (typeof e.hp !== 'number' || isNaN(e.hp)) e.hp = e.maxHp || 100;
          if (e.armor !== undefined && (typeof e.armor !== 'number' || isNaN(e.armor))) e.armor = e.maxArmor || 0;

          if (e.armor !== undefined && e.armor > 0) {
            const armRes = applyDamageWithArmor(e.armor, e.hp, dealtDmg, Boolean(bCalc.trueDamagePart));
            e.armor = armRes.newArmor;
            e.hp = armRes.newHp;
            if (armRes.armorBroken) {
              this.addDamageText(e.x, e.y - 20, 'VỠ GIÁP! 🛡️', '#38bdf8', 14, true);
              sound.playShieldBreak();
            }
          } else {
            e.hp = Math.max(0, e.hp - dealtDmg);
          }
          e.hitFlashTimer = 0.08;
          if (isVamp) {
            this.emitBurst(hitResult.projX, hitResult.projY, 6, '#e11d48', 0.9);
            this.emitParticle(hitResult.projX, hitResult.projY, (Math.random() - 0.5) * 60, -90, 0.2, 3.5, '#fda4af', 'spark');
          } else if (isRoyal) {
            this.emitBurst(hitResult.projX, hitResult.projY, 6, '#fbbf24', 0.9);
            this.emitParticle(hitResult.projX, hitResult.projY, (Math.random() - 0.5) * 60, -90, 0.2, 3.5, '#ffffff', 'spark');
          } else {
            this.emitBurst(hitResult.projX, hitResult.projY, 4, '#00f2fe', 0.8);
          }

          // Vampire Life Leech Mechanic on hit tick (22% chance)
          if (isVamp && Math.random() < 0.22) {
            const leechAmount = Math.max(1, Math.round(dealtDmg * 0.08));
            const prevHp = p.hp;
            const prevArmor = p.armor;
            p.hp = Math.min(p.maxHp, p.hp + leechAmount);
            p.armor = Math.min(p.maxArmor, p.armor + Math.max(1, Math.round(leechAmount * 0.7)));
            if (p.hp > prevHp || p.armor > prevArmor) {
              this.addDamageText(
                p.x + (Math.random() * 24 - 12),
                p.y - 25,
                `+${leechAmount} HP 🩸`,
                '#f43f5e',
                13,
                true
              );
              this.emitBurst(hitResult.projX, hitResult.projY, 4, '#fb7185', 0.7);
            }
          }

          // Floating combat text (throttled to avoid visual spam at 10 ticks/s)
          if (Math.random() < 0.35 || isBoss || bCalc.isCrit) {
            const label = isVamp
              ? (bCalc.isCrit
                  ? `${dealtDmg} 🩸 BẠO HUYẾT!`
                  : p.isSkillActive
                  ? `${dealtDmg} 🦇 (+80% ST)`
                  : `${dealtDmg} 🩸`)
              : isRoyal
              ? (bCalc.isCrit
                  ? `${dealtDmg} 👑 THÁNH QUANG!`
                  : p.isSkillActive
                  ? `${dealtDmg} 💎 (+80% ST)`
                  : `${dealtDmg} 👑`)
              : (bCalc.isCrit
                  ? `${dealtDmg}⚡ BẠO!`
                  : p.isSkillActive
                  ? `${dealtDmg}⚡ (+80% ST)`
                  : `${dealtDmg}⚡`);
            this.addDamageText(
              e.x + (Math.random() * 12 - 6),
              e.y - (isBoss ? 20 : 12),
              label,
              isVamp ? (bCalc.isCrit ? '#fda4af' : '#f43f5e') : isRoyal ? (bCalc.isCrit ? '#ffffff' : '#fde047') : (bCalc.isCrit ? '#fbbf24' : p.isSkillActive ? '#38bdf8' : '#00f2fe'),
              isBoss ? 15 : 12,
              bCalc.isCrit
            );
          }

          if (e.hp <= 0) {
            if (isVamp) {
              // Guaranteed Kill Harvest: +3 HP & +3 Giáp
              p.hp = Math.min(p.maxHp, p.hp + 3);
              p.armor = Math.min(p.maxArmor, p.armor + 3);
              this.addDamageText(p.x, p.y - 35, '+3 HÚT MÁU! 🦇', '#f43f5e', 14, true);
              this.emitBurst(p.x, p.y, 8, '#e11d48', 1.0);
            } else if (isRoyal) {
              this.addDamageText(e.x, e.y - 30, 'DIỆT TRỪ! 👑', '#fde047', 14, true);
              this.emitBurst(e.x, e.y, 10, '#fbbf24', 1.1);
            }
            this.destroyEnemy(e, ei);
          }
        }
      }

      const muzzleColor = isVamp ? '#f43f5e' : isRoyal ? '#fbbf24' : '#00f2fe';
      this.emitBurst(trajectory.startX, trajectory.startY, 4, muzzleColor, 0.6);
      return;
    }

    if (f.id === 'astraea') {
      // SX-77 ASTRAEA: Bắn ra viên đạn hình ngôi sao (hoặc Đóa Hoa Anh Đào nếu trang bị skin Sakura) gây 150 sát thương, khi trúng mục tiêu toả 5 ngôi sao / cánh hoa nhỏ
      sound.playFighterShot('astraea');
      const isSakura = this.activeCosmeticSkinId === 'skin_astraea_sakura';
      const bCalc = calculateBulletDamage(
        f.bulletDamage, // 150
        specs.damageMultiplier,
        totalBonusMultiplier,
        p.critRate,
        p.critDamage,
        p.trueDamage
      );

      // Main star / sakura blossom bullet (150 damage base)
      this.bullets.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y - 20,
        vx: 0,
        vy: -750,
        radius: 12,
        damage: bCalc.finalDamage,
        isPlayer: true,
        color: isSakura ? '#f472b6' : '#fbbf24',
        isStarBullet: !isSakura,
        isSakuraBullet: isSakura,
        starRotation: 0,
        starRotSpeed: isSakura ? 6 : 8,
        isCrit: bCalc.isCrit,
        isTrueDamage: bCalc.trueDamagePart > 0,
      });

      // Wing support stars / sakura petals if upgraded
      if (specs.hasSideGuns) {
        [-20, 20].forEach((ox) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: p.x + ox,
            y: p.y - 12,
            vx: ox * 3.5,
            vy: -700,
            radius: 8,
            damage: Math.round(bCalc.finalDamage * 0.45),
            isPlayer: true,
            color: isSakura ? '#fbcfe8' : '#38bdf8',
            isSmallStarBullet: !isSakura,
            isSmallSakuraBullet: isSakura,
            starRotation: 0,
            starRotSpeed: isSakura ? 8 : 10,
          });
        });
      }
      return;
    }

    if (f.id === 'valkyrie') {
      // VALKYRIE: Ngọn giáo thánh quang + 4-8 tên lửa thánh quang tầm nhiệt
      sound.playFighterShot('valkyrie');
      // Center Piercing Holy Lance
      this.bullets.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y - 28,
        vx: 0,
        vy: -950,
        radius: 7,
        damage: finalDamage * 1.35,
        isPlayer: true,
        color: '#38bdf8',
        isValkyrieLance: true,
        piercing: true,
      });

      // Flanking seeking holy missiles
      const missileCount = Math.min(6, Math.max(2, specs.bulletCount));
      for (let i = 0; i < missileCount; i++) {
        const offset = ((i - (missileCount - 1) / 2) * 16);
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + offset,
          y: p.y - 14,
          vx: offset * 4,
          vy: -260,
          radius: 4,
          damage: finalDamage * 0.65,
          isPlayer: true,
          color: '#bae6fd',
          isHoming: true,
        });
      }
    } else if (f.id === 'nebula_sovereign') {
      // NEBULA SOVEREIGN: Quả cầu Pulsar vũ trụ + đạn plasma xoáy
      sound.playFighterShot('nebula_sovereign');
      const count = Math.max(1, specs.bulletCount - 1);
      [-14, 14].slice(0, count).forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 24,
          vx: ox * 2.0,
          vy: -720,
          radius: 9,
          damage: finalDamage * 1.3,
          isPlayer: true,
          color: '#c084fc',
          isCosmicPulsar: true,
        });
      });
      // Center cosmic blast
      this.bullets.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y - 28,
        vx: 0,
        vy: -880,
        radius: 6,
        damage: finalDamage * 0.9,
        isPlayer: true,
        color: '#e879f9',
      });
    } else if (f.id === 'thunderbolt') {
      // THUNDERBOLT: Súng trường hồ quang giật sét lan + đạn điện cao áp
      sound.playFighterShot('thunderbolt');
      const count = specs.bulletCount;
      const spread = (specs.spreadAngleDeg * Math.PI) / 180;
      const startAngle = -Math.PI / 2 - spread / 2;
      const step = count > 1 ? spread / (count - 1) : 0;

      for (let i = 0; i < count; i++) {
        const angle = count === 1 ? -Math.PI / 2 : startAngle + i * step;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + (i - (count - 1) / 2) * 10,
          y: p.y - 20,
          vx: Math.cos(angle) * 880,
          vy: Math.sin(angle) * 880,
          radius: 5,
          damage: finalDamage * 0.9,
          isPlayer: true,
          color: '#06b6d4',
          isLightningOrb: true,
        });
      }
    } else if (f.id === 'plasma_reaper') {
      // PLASMA REAPER: Đĩa cưa xoay năng lượng cắt xuyên giáp
      sound.playFighterShot('plasma_reaper');
      const count = Math.min(3, Math.max(1, specs.bulletCount - 1));
      const offsets = count === 1 ? [0] : count === 2 ? [-15, 15] : [-22, 0, 22];

      offsets.forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 22,
          vx: ox * 2.8,
          vy: -680,
          radius: 9,
          damage: finalDamage * 1.4,
          isPlayer: true,
          color: '#f43f5e',
          isSawblade: true,
          piercing: true,
        });
      });
    } else if (f.id === 'tempest') {
      // TEMPEST: Sóng siêu âm hình sin dao động tần số cao
      sound.playFighterShot('tempest');
      const count = specs.bulletCount;
      const spread = (specs.spreadAngleDeg * Math.PI) / 180;
      const startAngle = -Math.PI / 2 - spread / 2;
      const step = count > 1 ? spread / (count - 1) : 0;

      for (let i = 0; i < count; i++) {
        const angle = count === 1 ? -Math.PI / 2 : startAngle + i * step;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + (i - (count - 1) / 2) * 12,
          y: p.y - 22,
          vx: Math.cos(angle) * 760,
          vy: Math.sin(angle) * 760,
          radius: 7,
          damage: finalDamage * 0.95,
          isPlayer: true,
          color: '#14b8a6',
          isSonicWave: true,
        });
      }
    } else if (f.id === 'viper') {
      // VIPER: Gai độc axit ăn mòn
      sound.playFighterShot('viper');
      const count = specs.bulletCount;
      const spread = ((specs.spreadAngleDeg + 4) * Math.PI) / 180;
      const startAngle = -Math.PI / 2 - spread / 2;
      const step = count > 1 ? spread / (count - 1) : 0;

      for (let i = 0; i < count; i++) {
        const angle = count === 1 ? -Math.PI / 2 : startAngle + i * step;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + (i - (count - 1) / 2) * 7,
          y: p.y - 20,
          vx: Math.cos(angle) * 820,
          vy: Math.sin(angle) * 820,
          radius: 4.5,
          damage: finalDamage * 0.9,
          isPlayer: true,
          color: '#84cc16',
          isAcidDart: true,
        });
      }
    } else if (f.id === 'falcon') {
      // FALCON: Súng máy Minigun 6 nòng đạn dày đặc
      sound.playFighterShot('falcon');
      // Alternate left/right fast streams
      [-8, 8].forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 22,
          vx: (Math.random() - 0.5) * 35,
          vy: -1050,
          radius: 3.5,
          damage: finalDamage * 0.75,
          isPlayer: true,
          color: '#60a5fa',
          isGatlingRounds: true,
        });
      });

      if (specs.bulletCount >= 3) {
        [-16, 16].forEach((ox) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: p.x + ox,
            y: p.y - 14,
            vx: ox * 3,
            vy: -1000,
            radius: 3.5,
            damage: finalDamage * 0.65,
            isPlayer: true,
            color: '#93c5fd',
            isGatlingRounds: true,
          });
        });
      }
    } else if (f.id === 'bastion') {
      // BASTION: Vòng sóng chấn động va đập
      sound.playFighterShot('bastion');
      const count = Math.max(1, specs.bulletCount - 1);
      [-12, 12].slice(0, count).forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 24,
          vx: ox * 1.5,
          vy: -700,
          radius: 8,
          damage: finalDamage * 1.25,
          isPlayer: true,
          color: '#94a3b8',
          isShockPulse: true,
        });
      });
    } else if (f.id === 'aurora') {
      // AURORA: Cryo Ice Crystal Shards
      sound.playFighterShot('aurora');
      const count = specs.bulletCount;
      const spread = (specs.spreadAngleDeg * Math.PI) / 180;
      const startAngle = -Math.PI / 2 - spread / 2;
      const step = count > 1 ? spread / (count - 1) : 0;

      for (let i = 0; i < count; i++) {
        const angle = count === 1 ? -Math.PI / 2 : startAngle + i * step;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + (i - (count - 1) / 2) * 8,
          y: p.y - 20,
          vx: Math.cos(angle) * 780,
          vy: Math.sin(angle) * 780,
          radius: 5,
          damage: finalDamage * 0.95,
          isPlayer: true,
          color: '#38bdf8',
          isCryoIce: true,
        });
      }
    } else if (f.id === 'vortex') {
      // VORTEX: Graviton Quantum Discs
      sound.playFighterShot('vortex');
      const count = Math.max(1, specs.bulletCount - 1);
      [-10, 10].slice(0, count).forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 22,
          vx: ox * 2.5,
          vy: -740,
          radius: 7,
          damage: finalDamage * 1.15,
          isPlayer: true,
          color: '#8b5cf6',
          isSingularityVortex: true,
        });
      });
    } else if (f.id === 'mirage') {
      // MIRAGE: Twin Angled 30° Crossfire Lasers
      sound.playFighterShot('mirage');
      [-12, 12].forEach((ox, idx) => {
        const angle = idx === 0 ? -Math.PI / 2 + 0.18 : -Math.PI / 2 - 0.18;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 18,
          vx: Math.cos(angle) * 820,
          vy: Math.sin(angle) * 820,
          radius: 4.5,
          damage: finalDamage * 0.85,
          isPlayer: true,
          color: '#ec4899',
        });
      });

      if (specs.bulletCount >= 3) {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x,
          y: p.y - 24,
          vx: 0,
          vy: -860,
          radius: 5,
          damage: finalDamage,
          isPlayer: true,
          color: '#f472b6',
        });
      }

      if (p.phantomWingmenActive) {
        [-45, 45].forEach((wingOx) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: p.x + wingOx,
            y: p.y - 10,
            vx: 0,
            vy: -820,
            radius: 4.5,
            damage: finalDamage * 0.8,
            isPlayer: true,
            color: '#f472b6',
          });
        });
      }
    } else if (f.id === 'solaris') {
      // SOLARIS: Solar Fusion Fireballs
      sound.playFighterShot('solaris');
      const count = Math.min(3, Math.max(1, Math.floor(specs.bulletCount / 1.5)));
      const offsets = count === 1 ? [0] : count === 2 ? [-14, 14] : [-18, 0, 18];

      offsets.forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 24,
          vx: ox * 2.2,
          vy: -720,
          radius: 8,
          damage: finalDamage * 1.3,
          isPlayer: true,
          color: '#eab308',
          isSolarFireball: true,
          splashRadius: 45,
        });
      });
    } else if (f.id === 'chrono') {
      // CHRONO: Tachyon Relativistic Piercing Beams
      sound.playFighterShot('chrono');
      const isCrit = Math.random() < 0.45;
      const tachyonDamage = isCrit ? finalDamage * 2.5 : finalDamage * 1.1;

      [-8, 8].forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 22,
          vx: 0,
          vy: -1250,
          radius: 4,
          damage: tachyonDamage,
          isPlayer: true,
          color: isCrit ? '#34d399' : '#10b981',
          isTachyonBeam: true,
          piercing: true,
        });
      });

      if (isCrit) {
        this.emitBurst(p.x, p.y - 26, 6, '#34d399', 0.8);
      }
    } else if (f.id === 'apocalypse') {
      // APOCALYPSE: Dual Antimatter Heavy Cluster Cannons
      sound.playFighterShot('apocalypse');
      [-16, 16].forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 24,
          vx: ox * 1.8,
          vy: -760,
          radius: 8.5,
          damage: finalDamage * 1.4,
          isPlayer: true,
          color: '#ef4444',
          isAntimatter: true,
        });
      });

      if (Math.random() < 0.5) {
        [-24, 24].forEach((ox) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: p.x + ox,
            y: p.y - 12,
            vx: ox * 4,
            vy: -250,
            radius: 4.5,
            damage: finalDamage * 0.7,
            isPlayer: true,
            color: '#f97316',
            isHoming: true,
          });
        });
      }
    } else if (f.id === 'ghost') {
      // GHOST: Piercing Laser Beam
      sound.playLaser('laser');
      this.bullets.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y - 24,
        vx: 0,
        vy: -900,
        radius: 6,
        damage: finalDamage * 0.9,
        isPlayer: true,
        color: '#c084fc',
        isLaserBeam: true,
        piercing: true,
      });

      if (specs.bulletCount >= 3) {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x - 14,
          y: p.y - 12,
          vx: -120,
          vy: -850,
          radius: 5,
          damage: finalDamage * 0.7,
          isPlayer: true,
          color: '#e879f9',
          piercing: true,
        });
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + 14,
          y: p.y - 12,
          vx: 120,
          vy: -850,
          radius: 5,
          damage: finalDamage * 0.7,
          isPlayer: true,
          color: '#e879f9',
          piercing: true,
        });
      }
    } else if (f.id === 'ouroboros') {
      // OX-88 OUROBOROS: Twin void dragonflame streams with lingering embers, 35% innate armor pen
      sound.playFighterShot('plasma_reaper');
      [-14, 14].forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 24,
          vx: ox * 2.5,
          vy: -850,
          radius: 8,
          damage: finalDamage * 1.35,
          isPlayer: true,
          color: '#a855f7',
          isDragonFlame: true,
        });
      });
      if (specs.bulletCount >= 3) {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x,
          y: p.y - 28,
          vx: 0,
          vy: -920,
          radius: 9,
          damage: finalDamage * 1.5,
          isPlayer: true,
          color: '#c084fc',
          isDragonFlame: true,
        });
      }
    } else if (f.id === 'quasar_titan') {
      // QX-99 QUASAR TITAN: Dense Gamma radiation piercing beam
      sound.playHyperLaser();
      this.bullets.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y - 32,
        vx: 0,
        vy: -1300,
        radius: 12,
        damage: finalDamage * 2.2,
        isPlayer: true,
        color: '#06b6d4',
        isGammaBeam: true,
        piercing: true,
      });
      if (specs.bulletCount >= 3) {
        [-18, 18].forEach((ox) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: p.x + ox,
            y: p.y - 20,
            vx: ox * 3,
            vy: -1150,
            radius: 7,
            damage: finalDamage * 0.8,
            isPlayer: true,
            color: '#38bdf8',
            isGammaBeam: true,
            piercing: true,
          });
        });
      }
    } else if (f.id === 'chronos_phantom') {
      // ZX-00 CHRONOS PHANTOM: Binary wormhole curved seeking projectiles +35% crit
      sound.playFighterShot('chrono');
      const critRoll = Math.random() < (p.critRate + 35) / 100;
      const dmg = critRoll ? finalDamage * 2.8 : finalDamage * 1.2;
      [-16, 16].forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 22,
          vx: ox * 4,
          vy: -780,
          radius: 7,
          damage: dmg,
          isPlayer: true,
          color: critRoll ? '#34d399' : '#059669',
          isWormholeBullet: true,
          isHoming: true,
          isCrit: critRoll,
        });
      });
      if (p.isSkillActive) {
        [-50, 50].forEach((ox) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: p.x + ox,
            y: p.y - 15,
            vx: 0,
            vy: -820,
            radius: 5,
            damage: finalDamage * 0.75,
            isPlayer: true,
            color: '#6ee7b7',
            isTachyonBeam: true,
          });
        });
      }
    } else if (f.id === 'nanite_swarm') {
      // NX-66 NANITE SWARM: Swarm of 5 micro-nanites that home and leech
      sound.playLaser('light');
      const count = Math.min(6, Math.max(3, specs.bulletCount + 1));
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.18;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + (i - (count - 1) / 2) * 8,
          y: p.y - 18,
          vx: Math.cos(angle) * 720,
          vy: Math.sin(angle) * 720,
          radius: 5,
          damage: finalDamage * 0.55,
          isPlayer: true,
          color: '#84cc16',
          isNaniteSwarm: true,
          isHoming: true,
        });
      }
    } else if (f.id === 'plasma_hydra') {
      // HX-9 HYDRA CANNON: 9-way wide spread barrage covering half the screen
      sound.playLaser('plasma');
      const count = p.isSkillActive ? 18 : 9;
      const spreadSpan = p.isSkillActive ? 1.4 : 1.1;
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 - spreadSpan / 2 + (i * spreadSpan) / (count - 1);
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x,
          y: p.y - 20,
          vx: Math.cos(angle) * 760,
          vy: Math.sin(angle) * 760,
          radius: 6,
          damage: finalDamage * (p.isSkillActive ? 0.65 : 0.45),
          isPlayer: true,
          color: '#10b981',
          isHydraPlasma: true,
        });
      }
    } else if (f.id === 'prism_aegis') {
      // PX-7 PRISM REFRACTOR: 3 refractive prism lasers that ricochet off screen borders
      sound.playLaser('light');
      [-22, 0, 22].forEach((ox, idx) => {
        const spreadVx = ox * 8;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 24,
          vx: spreadVx,
          vy: -860,
          radius: 6,
          damage: finalDamage * 0.85,
          isPlayer: true,
          color: idx === 0 ? '#38bdf8' : idx === 1 ? '#a855f7' : '#ec4899',
          isPrismLaser: true,
          ricochetsRemaining: 2,
        });
      });
    } else if (f.id === 'stellar_sentinel') {
      // GX-14 STELLAR SENTINEL: Double Helix kinetic stardust waves + center orbital lance
      sound.playFighterShot('stellar_sentinel');
      [-16, 16].forEach((ox, idx) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 20,
          vx: 0,
          vy: -820,
          radius: 6,
          damage: finalDamage * 0.9,
          isPlayer: true,
          color: '#38bdf8',
          isHelixBullet: true,
          helixPhase: idx === 0 ? 0 : Math.PI,
          helixBaseX: p.x + ox,
        });
      });
      if (specs.bulletCount >= 3) {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x,
          y: p.y - 26,
          vx: 0,
          vy: -950,
          radius: 7,
          damage: finalDamage * 1.2,
          isPlayer: true,
          color: '#7dd3fc',
          isLaserBeam: true,
          piercing: true,
        });
      }
    } else if (f.id === 'void_rift') {
      // VX-8 VOID RIFTWALKER: Dimensional crescent rift blades that plant lingering void traps
      sound.playFighterShot('void_rift');
      const count = Math.min(3, Math.max(1, specs.bulletCount - 1));
      const offsets = count === 1 ? [0] : count === 2 ? [-15, 15] : [-22, 0, 22];
      offsets.forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 22,
          vx: ox * 2.5,
          vy: -780,
          radius: 8,
          damage: finalDamage * 1.15,
          isPlayer: true,
          color: '#a855f7',
          isRiftBlade: true,
        });
      });
    } else if (f.id === 'sol_inferno') {
      // FX-33 SOL INFERNO: Napalm core projectiles that leave falling incendiary ember carpet
      sound.playFighterShot('sol_inferno');
      const napalmCount = p.isSkillActive ? 4 : Math.min(3, Math.max(1, Math.floor(specs.bulletCount / 1.5)));
      const offsets = napalmCount === 1 ? [0] : napalmCount === 2 ? [-14, 14] : napalmCount === 3 ? [-18, 0, 18] : [-24, -8, 8, 24];
      offsets.forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 24,
          vx: ox * 2.0,
          vy: -720,
          radius: 8.5,
          damage: finalDamage * (p.isSkillActive ? 1.4 : 1.2),
          isPlayer: true,
          color: '#f97316',
          isNapalmCore: true,
        });
      });
    } else if (f.id === 'chrono_echo') {
      // TX-19 CHRONO RESONATOR: Acoustic temporal pulse that duplicates into twin echo waves
      sound.playFighterShot('chrono_echo');
      [-12, 12].forEach((ox) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + ox,
          y: p.y - 20,
          vx: 0,
          vy: -800,
          radius: 6,
          damage: finalDamage * 0.85,
          isPlayer: true,
          color: '#06b6d4',
          isEchoResonant: true,
          echoTimer: 0.22,
          hasEchoDuplicated: false,
        });
      });
    } else if (f.id === 'graviton_lance') {
      // GX-99 GRAVITON PIERCER: Hyper-velocity piercing railgun harpoon (1400 px/s)
      sound.playFighterShot('graviton_lance');
      this.bullets.push({
        id: this.nextEntityId++,
        x: p.x,
        y: p.y - 30,
        vx: 0,
        vy: -1400,
        radius: 6,
        damage: finalDamage * 1.85,
        isPlayer: true,
        color: '#e11d48',
        isGravitonHarpoon: true,
        piercing: true,
      });
      if (specs.bulletCount >= 3) {
        [-18, 18].forEach((ox) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: p.x + ox,
            y: p.y - 18,
            vx: ox * 4.5,
            vy: -1100,
            radius: 4.5,
            damage: finalDamage * 0.7,
            isPlayer: true,
            color: '#fb7185',
            piercing: true,
          });
        });
      }
    } else if (f.id === 'bio_spore') {
      // BX-7 BIO VANGUARD: Organic parasitic spore pods that bloom into seeking toxic needles
      sound.playFighterShot('bio_spore');
      const count = Math.min(4, Math.max(2, specs.bulletCount));
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (i - (count - 1) / 2) * 0.22;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + (i - (count - 1) / 2) * 9,
          y: p.y - 20,
          vx: Math.cos(angle) * 740,
          vy: Math.sin(angle) * 740,
          radius: 6.5,
          damage: finalDamage * 0.95,
          isPlayer: true,
          color: '#10b981',
          isBioSpore: true,
        });
      }
    } else {
      // PHOENIX (Spread) or TITAN (Heavy Cannon)
      sound.playLaser(f.id === 'titan' ? 'plasma' : 'light');

      const count = specs.bulletCount;
      const spreadRad = (specs.spreadAngleDeg * Math.PI) / 180;
      const startAngle = -Math.PI / 2 - spreadRad / 2;
      const angleStep = count > 1 ? spreadRad / (count - 1) : 0;

      for (let i = 0; i < count; i++) {
        const angle = count === 1 ? -Math.PI / 2 : startAngle + i * angleStep;
        const speed = f.id === 'titan' ? 680 : 750;
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + (i - (count - 1) / 2) * 6,
          y: p.y - 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: f.id === 'titan' ? 6 : 4,
          damage: finalDamage,
          isPlayer: true,
          color: f.color,
        });
      }
    }

    // Drone escort shots
    if (p.dronesCount > 0) {
      const droneOffsets = p.dronesCount === 1 ? [-30] : [-32, 32];
      droneOffsets.forEach((offsetX) => {
        this.bullets.push({
          id: this.nextEntityId++,
          x: p.x + offsetX,
          y: p.y - 8,
          vx: 0,
          vy: -720,
          radius: 3.5,
          damage: 14,
          isPlayer: true,
          color: '#38bdf8',
        });
      });
    }
  }

  private fireHomingMissiles() {
    const p = this.player;
    sound.playMissileLaunch();

    // Spawn 2 micro missiles left and right
    [-18, 18].forEach((offsetX) => {
      this.bullets.push({
        id: this.nextEntityId++,
        x: p.x + offsetX,
        y: p.y - 10,
        vx: offsetX * 4,
        vy: -200,
        radius: 5,
        damage: 45,
        isPlayer: true,
        color: '#f59e0b',
        isHoming: true,
      });
    });
  }

  private spawnBoss() {
    sound.playBossAlarm();
    this.addTrauma(0.5);

    const isUniverse = this.gameMode === 'universe' && this.currentUniverseId;
    const currentUniverse = isUniverse ? getUniverseById(this.currentUniverseId!) : null;
    const scaling = calculateWaveScaling(this.wave, this.difficulty);

    let bossHp: number;
    let bossColor: string = '#ef4444';
    let bossDef = Math.round(scaling.enemyArmor * 1.8);

    if (this.gameMode === 'super_hard') {
      const shBoss = getSuperHardBoss(this.wave);
      // Máu trâu hơn 80% (1.8x)
      bossHp = Math.round(shBoss.baseHp * 1.8);
      bossColor = shBoss.color;
      // Điểm phòng thủ cao hơn 60% (1.6x)
      bossDef = Math.round(shBoss.defense * 1.6);
      // Thanh giáp dưới thanh máu (50% HP)
      const bossArmor = Math.round(bossHp * 0.5);

      this.enemies.push({
        id: this.nextEntityId++,
        type: 'boss',
        x: this.width / 2,
        y: -140,
        vx: 60,
        vy: 45,
        width: 145,
        height: 105,
        radius: 56,
        hp: bossHp,
        maxHp: bossHp,
        armor: bossArmor,
        maxArmor: bossArmor,
        defense: bossDef,
        color: bossColor,
        shootTimer: 1.2,
        shootCooldown: 1.8,
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: this.player.x,
        telegraphAimY: this.player.y,
        hitFlashTimer: 0,
      });

      this.dispatchHUD();
      return;
    }

    if (this.gameMode === 'adventure' && this.currentAdventureStageId) {
      const advStage = getAdventureStageById(this.currentAdventureStageId);
      const bInfo = advStage.boss;
      bossHp = Math.round(bInfo.hp * scaling.hpMultiplier);
      bossColor = bInfo.color;
      bossDef = Math.round(bInfo.defense + scaling.enemyArmor * 0.9);

      this.enemies.push({
        id: this.nextEntityId++,
        type: 'boss',
        x: this.width / 2,
        y: -140,
        vx: 65,
        vy: 45,
        width: 140,
        height: 110,
        radius: 56,
        hp: bossHp,
        maxHp: bossHp,
        defense: bossDef,
        color: bossColor,
        shootTimer: 1.5,
        shootCooldown: Math.max(0.6, 2.0 / scaling.fireRateCooldownScale),
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: this.player.x,
        telegraphAimY: this.player.y,
        hitFlashTimer: 0,
        adventureBossShape: bInfo.shapeType,
      });

      this.dispatchHUD();
      return;
    }

    if (this.gameMode === 'boss_rush') {
      const bossRushUniv = UNIVERSES[(this.wave - 1) % UNIVERSES.length];
      const dangerMult = 1.35 + (bossRushUniv.dangerRating - 1) * 0.32 + (this.wave - 1) * 0.16;
      bossHp = Math.round(2600 * dangerMult * scaling.hpMultiplier);
      bossColor = bossRushUniv.themeColor;
      bossDef = Math.round(scaling.enemyArmor * (1.6 + bossRushUniv.dangerRating * 0.14));
    } else if (currentUniverse) {
      const dangerMult = 1 + (currentUniverse.dangerRating - 1) * 0.28;
      bossHp = Math.round(1400 * dangerMult * scaling.hpMultiplier);
      bossColor = currentUniverse.themeColor;
      bossDef = Math.round(scaling.enemyArmor * (1.4 + currentUniverse.dangerRating * 0.12));
    } else {
      bossHp = Math.round((1200 + (this.wave - 3) * 450) * scaling.hpMultiplier);
    }

    this.enemies.push({
      id: this.nextEntityId++,
      type: 'boss',
      x: this.width / 2,
      y: -140, // Flies in from top
      vx: 60,
      vy: 45,
      width: 140,
      height: 100,
      radius: 55,
      hp: bossHp,
      maxHp: bossHp,
      defense: bossDef,
      color: bossColor,
      shootTimer: 1.5,
      shootCooldown: Math.max(0.6, 2.2 / scaling.fireRateCooldownScale),
      timeAlive: 0,
      phase: 1,
      telegraphTimer: 0,
      telegraphAimX: this.player.x,
      telegraphAimY: this.player.y,
      hitFlashTimer: 0,
    });

    this.dispatchHUD();
  }

  private updateEnemies(dt: number) {
    const hasBoss = this.enemies.some((e) => e.type === 'boss');
    const scaling = calculateWaveScaling(this.wave, this.difficulty);

    // Spawn regular enemies if below capacity (Never spawn small mobs in boss_rush mode!)
    this.enemySpawnTimer -= dt;
    const maxEnemies = hasBoss ? Math.min(8, Math.round(scaling.maxEnemies * 0.5)) : scaling.maxEnemies;

    if (this.gameMode !== 'boss_rush' && this.enemySpawnTimer <= 0 && this.enemies.length < maxEnemies) {
      this.spawnEnemy();
      this.enemySpawnTimer = scaling.spawnInterval;
    }

    // Update active enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.timeAlive += dt;
      if (e.hitFlashTimer > 0) e.hitFlashTimer -= dt;

      // Kỹ năng LX-88 Arc Tempest: Tê liệt toàn bộ kẻ địch trên sân trong 10 giây
      if (this.player.isSkillActive && this.currentFighter.id === 'arc_tempest') {
        if (!e.stunTimer || e.stunTimer <= 0) {
          e.stunTimer = Math.max(0.5, this.player.skillActiveTimer);
        }
      }

      // Choáng từ kỹ năng Astraea & Tê Liệt từ kỹ năng Arc Tempest
      if (e.stunTimer && e.stunTimer > 0) {
        e.stunTimer -= dt;
        if (Math.random() < 0.35) {
          this.emitParticle(
            e.x + (Math.random() * 26 - 13),
            e.y + (Math.random() * 26 - 13),
            Math.random() * 20 - 10,
            -25,
            0.25,
            3,
            '#00f2fe',
            'spark'
          );
        }
        continue;
      }

      // Hiệu ứng Làm Chậm 30% từ drone trấn phái RTS-88 (DR-88 Lôi Vân Kích S)
      if (e.slowTimer && e.slowTimer > 0) {
        e.slowTimer -= dt;
        if (Math.random() < 0.2) {
          this.emitParticle(
            e.x + (Math.random() * 20 - 10),
            e.y + (Math.random() * 20 - 10),
            0,
            12,
            0.2,
            2,
            '#38bdf8',
            'spark'
          );
        }
      }
      const enemyMoveDt = e.slowTimer && e.slowTimer > 0 ? dt * Math.max(0.2, 1 - (e.slowFactor || 0.30)) : dt;

      if (e.type === 'boss') {
        this.updateBoss(e, enemyMoveDt);
      } else if (e.type === 'scout') {
        // Sinusoidal weaving
        e.y += e.vy * enemyMoveDt;
        e.x += Math.sin(e.timeAlive * 3.5) * 110 * enemyMoveDt;
      } else if (e.type === 'viper') {
        // Fast strafer with aimed firing
        e.y += e.vy * enemyMoveDt;
        e.x += e.vx * enemyMoveDt;
        if (e.x < 30 || e.x > this.width - 30) e.vx = -e.vx;

        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && e.y > 60 && e.y < this.height - 120) {
          this.fireEnemyBullet(e.x, e.y + 16, this.player.x, this.player.y, 280, '#ef4444');
          e.shootTimer = e.shootCooldown;
        }
      } else if (e.type === 'cruiser') {
        // Armored cruiser with telegraph laser warning
        if (e.y < 160) {
          e.y += e.vy * enemyMoveDt;
        } else {
          e.x += e.vx * enemyMoveDt;
          if (e.x < 50 || e.x > this.width - 50) e.vx = -e.vx;
        }

        e.shootTimer -= dt;
        if (e.shootTimer <= 0.6 && e.telegraphTimer <= 0) {
          // Start aiming telegraph line at player
          e.telegraphTimer = 0.6;
          e.telegraphAimX = this.player.x;
          e.telegraphAimY = this.player.y;
        }

        if (e.telegraphTimer > 0) {
          e.telegraphTimer -= dt;
          if (e.telegraphTimer <= 0) {
            // Fire tri-barrel salvo
            this.fireEnemyBullet(e.x - 14, e.y + 20, e.telegraphAimX, e.telegraphAimY, 320, '#f97316');
            this.fireEnemyBullet(e.x, e.y + 24, e.telegraphAimX, e.telegraphAimY, 340, '#f97316');
            this.fireEnemyBullet(e.x + 14, e.y + 20, e.telegraphAimX, e.telegraphAimY, 320, '#f97316');
            e.shootTimer = e.shootCooldown;
          }
        }
      } else if (e.type === 'kamikaze') {
        // High-speed dive bomber with afterburner
        e.y += e.vy * dt;
        e.x += e.vx * dt;
        if (Math.random() < 0.6) {
          this.emitParticle(e.x, e.y - 12, 0, -80, 0.2, 3, '#f43f5e', 'spark');
        }
      } else if (e.type === 'destroyer') {
        // Heavy Destroyer: slow advance, periodic tri-barrel heavy plasma salvo
        if (e.y < 140) {
          e.y += e.vy * dt;
        } else {
          e.x += e.vx * dt;
          if (e.x < 60 || e.x > this.width - 60) e.vx = -e.vx;
        }

        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          [-20, 0, 20].forEach((ox) => {
            this.fireEnemyBullet(e.x + ox, e.y + 24, this.player.x + ox, this.player.y, 290, '#ef4444');
          });
          e.shootTimer = e.shootCooldown;
        }
      } else if (e.type === 'stealth_phantom') {
        // Stealth Phantom: phased dash and sniper laser shot
        e.y += e.vy * dt;
        e.x += Math.sin(e.timeAlive * 4.5) * 140 * dt;

        e.shootTimer -= dt;
        if (e.shootTimer <= 0.5 && e.telegraphTimer <= 0) {
          e.telegraphTimer = 0.5;
          e.telegraphAimX = this.player.x;
          e.telegraphAimY = this.player.y;
        }
        if (e.telegraphTimer > 0) {
          e.telegraphTimer -= dt;
          if (e.telegraphTimer <= 0) {
            this.fireEnemyBullet(e.x, e.y + 16, e.telegraphAimX, e.telegraphAimY, 480, '#c084fc');
            e.shootTimer = e.shootCooldown;
          }
        }
      } else if (e.type === 'carrier') {
        // Drone Carrier: lingers at top and deploys escort drones
        if (e.y < 110) {
          e.y += e.vy * dt;
        } else {
          e.x += e.vx * dt;
          if (e.x < 70 || e.x > this.width - 70) e.vx = -e.vx;
        }

        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && this.enemies.length < 12) {
          // Launch an escort drone
          this.enemies.push({
            id: this.nextEntityId++,
            type: 'kamikaze',
            x: e.x + (Math.random() > 0.5 ? 25 : -25),
            y: e.y + 20,
            vx: (Math.random() - 0.5) * 80,
            vy: 240,
            width: 28,
            height: 28,
            radius: 13,
            hp: 35 + this.wave * 8,
            maxHp: 35 + this.wave * 8,
            color: '#38bdf8',
            shootTimer: 999,
            shootCooldown: 999,
            timeAlive: 0,
            phase: 1,
            telegraphTimer: 0,
            telegraphAimX: 0,
            telegraphAimY: 0,
            hitFlashTimer: 0,
          });
          e.shootTimer = e.shootCooldown;
        }
      } else if (e.type === 'plasma_mortar') {
        // Heavy Plasma Mortar Artillery: slowly glides horizontally and lobs explosive mortar shells
        if (e.y < 120) {
          e.y += e.vy * dt;
        } else {
          e.x += e.vx * dt;
          if (e.x < 50 || e.x > this.width - 50) e.vx = -e.vx;
        }
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          this.bullets.push({
            id: this.nextEntityId++,
            x: e.x,
            y: e.y + 20,
            vx: (this.player.x - e.x) * 0.7,
            vy: 240,
            radius: 8,
            damage: 35,
            isPlayer: false,
            color: '#f97316',
            isBossMortarShell: true,
          });
          e.shootTimer = e.shootCooldown;
        }
      } else if (e.type === 'spectre_assassin') {
        // High-speed cloaked assassin with sniper laser
        e.y += e.vy * dt;
        e.x += Math.sin(e.timeAlive * 5.5) * 160 * dt;
        e.shootTimer -= dt;
        if (e.shootTimer <= 0.4 && e.telegraphTimer <= 0) {
          e.telegraphTimer = 0.4;
          e.telegraphAimX = this.player.x;
          e.telegraphAimY = this.player.y;
        }
        if (e.telegraphTimer > 0) {
          e.telegraphTimer -= dt;
          if (e.telegraphTimer <= 0) {
            this.fireEnemyBullet(e.x, e.y + 14, e.telegraphAimX, e.telegraphAimY, 480, '#ec4899');
            e.shootTimer = e.shootCooldown;
          }
        }
      } else if (e.type === 'shield_drone') {
        // Escort Shield Drone: weaves and projects protective energy barrier to nearby allies
        e.y += e.vy * dt;
        e.x += Math.cos(e.timeAlive * 2.5) * 60 * dt;
        for (const ally of this.enemies) {
          if (ally.id !== e.id && ally.type !== 'shield_drone') {
            if (Math.hypot(ally.x - e.x, ally.y - e.y) <= 130) {
              ally.isShielded = true;
            }
          }
        }
      } else if (e.type === 'vanguard_missile_frigate') {
        // Armored missile frigate firing dual micro-missiles
        if (e.y < 130) {
          e.y += e.vy * dt;
        } else {
          e.x += e.vx * dt;
          if (e.x < 50 || e.x > this.width - 50) e.vx = -e.vx;
        }
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          [-18, 18].forEach((ox) => {
            this.bullets.push({
              id: this.nextEntityId++,
              x: e.x + ox,
              y: e.y + 20,
              vx: ox * 2.5,
              vy: 200,
              radius: 5,
              damage: 25,
              isPlayer: false,
              color: '#f59e0b',
              isHoming: true,
            });
          });
          e.shootTimer = e.shootCooldown;
        }
      }

      // Despawn if fallen off screen
      if (e.y > this.height + 80 && e.type !== 'boss') {
        this.enemies.splice(i, 1);
      }
    }
  }

  private updateBoss(boss: Enemy, dt: number) {
    // Entrance fly-in
    if (boss.y < 120) {
      boss.y += boss.vy * dt;
      this.bossCurrentSkillName = 'TIẾN VÀO CHIẾN TRƯỜNG';
      return;
    }

    // Horizontal swaying
    boss.x += boss.vx * dt;
    if (boss.x < 100 || boss.x > this.width - 100) {
      boss.vx = -boss.vx;
    }

    // Phase management
    const hpRatio = boss.hp / boss.maxHp;
    const isEnraged = hpRatio <= 0.35;
    if (isEnraged && boss.phase < 3) {
      boss.phase = 3;
      boss.shootCooldown = 1.0;
      this.addTrauma(0.7);
      sound.playExplosion('medium');
    } else if (hpRatio <= 0.7 && boss.phase < 2) {
      boss.phase = 2;
      boss.shootCooldown = 1.5;
      this.addTrauma(0.4);
    }

    // Tick telegraph
    if (this.bossSkillTelegraphTimer > 0) {
      this.bossSkillTelegraphTimer -= dt;
      boss.telegraphTimer = this.bossSkillTelegraphTimer;
      boss.telegraphAimX = this.player.x;
      boss.telegraphAimY = this.player.y;
    }

    // ========================================================
    // 5 KỸ NĂNG CỦA BOSS CHÍNH:
    // 1. Bắn loạt đạn hình nón 9 dãi
    // 2. Bắn 6 tên lửa đi theo trong 3 giây
    // 3. Bắn loạt đạn hình nón bắn từ phải qua trái
    // 4. Tạo ra 2 drone ra bắn tia laser vào máy bay chính
    // 5. Tụ lực lại và gè theo hướng máy bay chính
    // ========================================================

    // 5. Update Rush Afterimages
    for (let ai = this.bossRushAfterimages.length - 1; ai >= 0; ai--) {
      this.bossRushAfterimages[ai].alpha -= dt * 2.2;
      if (this.bossRushAfterimages[ai].alpha <= 0) {
        this.bossRushAfterimages.splice(ai, 1);
      }
    }

    // KỸ NĂNG 5: TỤ LỰC LẠI VÀ GÈ THEO HƯỚNG MÁY BAY CHÍNH
    if (this.bossRushState === 'charging') {
      this.bossRushTimer -= dt;
      this.bossSkillTelegraphTimer = this.bossRushTimer;
      this.bossSkillTelegraphMax = 1.2;
      this.bossCurrentSkillName = '⚡ BOSS ĐANG TỤ LỰC XUNG KÍCH...';
      boss.telegraphAimX = this.player.x;
      boss.telegraphAimY = this.player.y;

      // Inward energetic particles swirling into boss core
      if (Math.random() < 0.85) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * 85 + 25;
        this.emitParticle(
          boss.x + Math.cos(ang) * dist,
          boss.y + Math.sin(ang) * dist,
          -Math.cos(ang) * 190,
          -Math.sin(ang) * 190,
          0.22,
          3.5,
          boss.color || '#ef4444',
          'spark'
        );
      }

      if (this.bossRushTimer <= 0) {
        this.bossRushState = 'rushing';
        this.bossRushTimer = 0.85;
        this.bossRushStartX = boss.x;
        this.bossRushStartY = boss.y;
        this.bossRushTargetX = this.player.x;
        this.bossRushTargetY = this.player.y;
        const rushVec = calculateBossRushVector(boss.x, boss.y, this.player.x, this.player.y, 820);
        this.bossRushDirX = rushVec.vx;
        this.bossRushDirY = rushVec.vy;
        this.bossCurrentSkillName = '💥 GÈ XUNG KÍCH THEO MÁY BAY CHÍNH!';
        sound.playHyperLaser();
        this.addTrauma(0.65);
        this.shockwaves.push({
          x: boss.x,
          y: boss.y,
          radius: 20,
          maxRadius: 380,
          color: boss.color || '#ef4444',
          alpha: 1.0,
        });
      }
      return; // Pause swaying while charging
    }

    if (this.bossRushState === 'rushing') {
      this.bossRushTimer -= dt;
      this.bossCurrentSkillName = '💥 GÈ XUNG KÍCH THEO MÁY BAY CHÍNH!';
      boss.x += this.bossRushDirX * dt;
      boss.y += this.bossRushDirY * dt;

      this.bossRushAfterimages.push({ x: boss.x, y: boss.y, alpha: 0.85, color: boss.color || '#ef4444' });
      this.emitParticle(boss.x, boss.y - 20, (Math.random() - 0.5) * 60, -80, 0.28, 4.5, '#ef4444', 'spark');

      // Collide and ram player
      if (this.player.invulnerableTimer <= 0 && checkCircleCollision({ x: boss.x, y: boss.y, radius: boss.radius }, { x: this.player.x, y: this.player.y, radius: this.player.radius })) {
        this.damagePlayer(85);
        this.addTrauma(0.8);
        sound.playExplosion('boss');
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          radius: 10,
          maxRadius: 220,
          color: '#ef4444',
          alpha: 1.0,
        });
      }

      if (this.bossRushTimer <= 0 || boss.y >= this.height - 120) {
        this.bossRushState = 'returning';
        this.bossRushTimer = 1.0;
      }
      return;
    }

    if (this.bossRushState === 'returning') {
      this.bossRushTimer -= dt;
      const targetY = 120;
      const targetX = clamp(boss.x, 150, this.width - 150);
      boss.x += (targetX - boss.x) * 4.0 * dt;
      boss.y += (targetY - boss.y) * 4.0 * dt;

      if (this.bossRushTimer <= 0 || Math.abs(boss.y - targetY) < 12) {
        boss.y = targetY;
        boss.x = targetX;
        this.bossRushState = 'none';
        boss.shootTimer = 1.0;
        this.bossCurrentSkillName = 'SẴN SÀNG TẤN CÔNG';
      }
      return;
    }

    // ========================================================
    // KỸ NĂNG 6: GÈ TIA GAMMA LỚN (MEGA GAMMA RAY BEAM)
    // ========================================================
    if (this.bossMegaBeamChargingTimer > 0) {
      this.bossMegaBeamChargingTimer -= dt;
      this.bossSkillTelegraphTimer = this.bossMegaBeamChargingTimer;
      this.bossSkillTelegraphMax = 1.4;
      this.bossCurrentSkillName = '☢️ BOSS ĐANG GÈ TIA GAMMA LỚN... ☢️';

      // "GÈ" THEO MÁY BAY CHÍNH: Rê / ngắm tọa độ X bám theo máy bay chính
      this.bossMegaBeamX = calculateGammaBeamTrackingX(this.bossMegaBeamX, this.player.x, 380, dt);

      // Inward green/cyan gamma radiation particles swirling into boss core
      if (Math.random() < 0.9) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * 95 + 25;
        this.emitParticle(
          this.bossMegaBeamX + Math.cos(ang) * dist,
          boss.y + 35 + Math.sin(ang) * dist,
          -Math.cos(ang) * 200,
          -Math.sin(ang) * 200,
          0.2,
          4,
          '#10b981',
          'spark'
        );
      }

      if (this.bossMegaBeamChargingTimer <= 0) {
        this.bossMegaBeamFiringTimer = 1.6; // Bắn tia khổng lồ trong 1.6s
        this.bossMegaBeamWidth = 125;
        this.bossCurrentSkillName = '💥 KHAI HỎA ĐẠI PHÁO TIA GAMMA HỦY DIỆT!';
        sound.playHyperLaser();
        this.addTrauma(0.8);
        this.shockwaves.push({
          x: this.bossMegaBeamX,
          y: boss.y + 35,
          radius: 20,
          maxRadius: 460,
          color: '#10b981',
          alpha: 1.0,
        });
      }
      return; // Khóa di chuyển ngang của boss khi đang tụ lực gè
    }

    if (this.bossMegaBeamFiringTimer > 0) {
      this.bossMegaBeamFiringTimer -= dt;
      this.bossCurrentSkillName = '💥 ĐẠI PHÁO TIA GAMMA HỦY DIỆT ĐANG QUÉT!';

      // Tiếp tục "gè" rê nhẹ theo máy bay người chơi khi đang bắn với tốc độ rê 75px/s
      this.bossMegaBeamX = calculateGammaBeamTrackingX(this.bossMegaBeamX, this.player.x, 75, dt);

      // Rung lắc màn hình liên tục khi tia đang quét
      this.addTrauma(0.25 * dt);

      // Trừ máu máy bay nếu trúng tia Gamma lớn
      const isHit = checkMegaBeamHit(
        this.player.x,
        this.player.y,
        this.player.radius,
        this.bossMegaBeamX,
        boss.y + 35,
        this.bossMegaBeamWidth
      );

      if (isHit && this.player.invulnerableTimer <= 0) {
        const dps = 90 * (this.gameMode === 'super_hard' ? 1.6 : 1.0);
        this.damagePlayer(Math.round(dps * dt));
        this.emitBurst(this.player.x, this.player.y, 4, '#10b981', 0.6);
      }

      // Hạt năng lượng phóng rực rỡ từ họng pháo
      this.emitParticle(
        this.bossMegaBeamX + (Math.random() - 0.5) * 45,
        boss.y + 35,
        (Math.random() - 0.5) * 90,
        180 + Math.random() * 120,
        0.18,
        4.5,
        '#34d399',
        'spark'
      );

      if (this.bossMegaBeamFiringTimer <= 0) {
        this.bossCurrentSkillName = 'SẴN SÀNG TẤN CÔNG';
        boss.shootTimer = 1.2;
      }
      return; // Khóa di chuyển khi đang bắn đại pháo
    }

    // KỸ NĂNG 1: BẮN HOÀN LOẠT ĐẠN HÌNH NÓN 9 DÃI LIÊN TỤC TRONG 2 GIÂY
    if (this.boss9ConeBarrageTimer > 0) {
      this.boss9ConeBarrageTimer -= dt;
      this.boss9ConeNextShotTimer -= dt;
      this.bossCurrentSkillName = '💥 HỎA LỰC HÌNH NÓN 9 DÃI LIÊN TỤC (2 GIÂY)';
      if (this.boss9ConeNextShotTimer <= 0) {
        this.boss9ConeNextShotTimer = 0.16; // Liên tục mỗi 0.16s (~12 đợt hoàn loạt trong 2s)
        sound.playLaser('plasma');
        const aimAngle = Math.atan2(this.player.y - (boss.y + 35), this.player.x - boss.x);
        const angles = calculate9ConeSpreadAngles(aimAngle, (84 * Math.PI) / 180);
        const dmg = Math.round(26 * (this.gameMode === 'super_hard' ? 1.5 : 1));
        angles.forEach((ang) => {
          this.bullets.push({
            id: this.nextEntityId++,
            x: boss.x,
            y: boss.y + 35,
            vx: Math.cos(ang) * 440,
            vy: Math.sin(ang) * 440,
            radius: 5.5,
            damage: dmg,
            isPlayer: false,
            color: '#f59e0b',
          });
        });
        this.emitBurst(boss.x, boss.y + 35, 8, '#f59e0b', 0.8);
      }
      if (this.boss9ConeBarrageTimer <= 0) {
        this.bossCurrentSkillName = 'SẴN SÀNG TẤN CÔNG';
      }
    }

    // KỸ NĂNG 3: BẮN HOÀN LOẠT ĐẠN HÌNH NÓN TRONG 2 GIÂY BẮN QUA BẮN LẠI
    if (this.bossConeSweepTimer > 0) {
      this.bossConeSweepTimer -= dt;
      this.bossConeSweepNextShotTimer -= dt;
      this.bossCurrentSkillName = '🌊 HỎA LỰC HÌNH NÓN BẮN QUA LẠI LIÊN TỤC (2 GIÂY)';
      if (this.bossConeSweepNextShotTimer <= 0) {
        this.bossConeSweepNextShotTimer = 0.045; // Hoàn loạt liên tục trong 2 giây (~44 viên)
        const prog = 1 - Math.max(0, this.bossConeSweepTimer / this.bossConeSweepTotal);
        // Quét từ trái qua phải rồi quét ngược lại từ phải qua trái liên tục trong 2 giây
        const sweepAngle = calculateOscillatingConeSweepAngle(prog, (110 * Math.PI) / 180);
        const speed = 460;
        sound.playLaser('light');
        const dmg = Math.round(26 * (this.gameMode === 'super_hard' ? 1.5 : 1));
        this.bullets.push({
          id: this.nextEntityId++,
          x: boss.x,
          y: boss.y + 35,
          vx: Math.cos(sweepAngle) * speed,
          vy: Math.sin(sweepAngle) * speed,
          radius: 5.5,
          damage: dmg,
          isPlayer: false,
          color: '#38bdf8',
        });
        this.emitParticle(boss.x, boss.y + 35, Math.cos(sweepAngle) * 50, Math.sin(sweepAngle) * 50, 0.15, 3, '#38bdf8', 'spark');
      }
      if (this.bossConeSweepTimer <= 0) {
        this.bossCurrentSkillName = 'SẴN SÀNG TẤN CÔNG';
      }
    }

    // KỸ NĂNG 4: CẬP NHẬT 2 DRONE BẮN TIA LASER VÀO MÁY BAY CHÍNH
    for (let di = this.bossEscortDrones.length - 1; di >= 0; di--) {
      const d = this.bossEscortDrones[di];
      d.timeAlive += dt;
      d.lifeTimer -= dt;
      if (d.hitFlashTimer > 0) d.hitFlashTimer -= dt;

      // Position formation relative to boss
      const destX = boss.x + d.targetOffsetX;
      const destY = boss.y + d.targetOffsetY;
      d.x += (destX - d.x) * 4.5 * dt;
      d.y += (destY - d.y) * 4.5 * dt;

      // Aim laser at main fighter
      d.aimX = this.player.x;
      d.aimY = this.player.y;

      if (d.laserChargeTimer > 0) {
        d.laserChargeTimer -= dt;
        if (d.laserChargeTimer <= 0) {
          d.laserFireTimer = 1.1; // Fire continuous laser beam for 1.1s
          sound.playLaser('plasma');
        }
      } else if (d.laserFireTimer > 0) {
        d.laserFireTimer -= dt;
        const targetAng = Math.atan2(d.aimY - d.y, d.aimX - d.x);
        const beamEndX = d.x + Math.cos(targetAng) * 1200;
        const beamEndY = d.y + Math.sin(targetAng) * 1200;

        const hit = checkLaserHit(d.x, d.y, beamEndX, beamEndY, this.player.x, this.player.y, this.player.radius, 14);
        if (hit.isHit && this.player.invulnerableTimer <= 0) {
          this.damagePlayer(Math.round(45 * dt * (this.gameMode === 'super_hard' ? 1.5 : 1)));
          this.emitBurst(this.player.x, this.player.y, 2, '#ef4444', 0.4);
        }
        if (d.laserFireTimer <= 0) {
          d.laserChargeTimer = 1.3;
        }
      }

      if (d.lifeTimer <= 0) {
        this.emitBurst(d.x, d.y, 8, '#38bdf8', 0.6);
        this.bossEscortDrones.splice(di, 1);
      }
    }

    boss.shootTimer -= dt;
    const speedMult = isEnraged ? 1.35 : 1.0;

    if (boss.shootTimer <= 0) {
      // Advance to next skill in 6-skill rotation (Gồm cả Tuyệt kỹ Gè Tia Gamma Lớn)
      this.bossSkillCycle = (this.bossSkillCycle + 1) % 6;
      const cooldownBase = boss.phase === 3 ? 1.4 : boss.phase === 2 ? 1.8 : 2.2;
      boss.shootCooldown = cooldownBase / speedMult;
      boss.shootTimer = boss.shootCooldown;

      switch (this.bossSkillCycle) {
        case 0: {
          // KỸ NĂNG 1: BẮN HOÀN LOẠT ĐẠN HÌNH NÓN 9 DÃI LIÊN TỤC TRONG 2 GIÂY
          this.bossCurrentSkillName = '💥 HỎA LỰC HÌNH NÓN 9 DÃI LIÊN TỤC (2 GIÂY)';
          this.boss9ConeBarrageTimer = 2.0;
          this.boss9ConeNextShotTimer = 0; // Kích hoạt ngay đợt bắn đầu tiên
          this.bossSkillTelegraphTimer = 2.0;
          this.bossSkillTelegraphMax = 2.0;
          boss.shootTimer = 2.4; // Duy trì trọn vẹn 2 giây hoàn loạt liên tục + 0.4s nghỉ
          break;
        }

        case 1: {
          // KỸ NĂNG 2: BẮN 6 TÊN LỬA ĐI THEO TRONG 3 GIÂY
          this.bossCurrentSkillName = '🚀 KHAI HỎA 6 TÊN LỬA TRUY KÍCH (3 GIÂY)';
          this.bossSkillTelegraphTimer = 0.5;
          this.bossSkillTelegraphMax = 0.5;
          sound.playFighterShot('apocalypse');
          const offsets = [-56, -34, -14, 14, 34, 56]; // Đúng chuẩn 6 tên lửa tỏa cánh
          const dmg = Math.round(32 * (this.gameMode === 'super_hard' ? 1.5 : 1));
          offsets.forEach((ox) => {
            this.bullets.push({
              id: this.nextEntityId++,
              x: boss.x + ox,
              y: boss.y + 30,
              vx: ox * 2.8,
              vy: 160,
              radius: 6.5,
              damage: dmg,
              isPlayer: false,
              color: '#ef4444',
              isHoming: true,
              homingDurationTimer: 3.0, // Đi theo truy kích trong 3 giây!
            });
          });
          break;
        }

        case 2: {
          // KỸ NĂNG 3: BẮN HOÀN LOẠT ĐẠN HÌNH NÓN TRONG 2 GIÂY BẮN QUA BẮN LẠI
          this.bossCurrentSkillName = '🌊 HỎA LỰC HÌNH NÓN BẮN QUA LẠI LIÊN TỤC (2 GIÂY)';
          this.bossConeSweepTimer = 2.0;
          this.bossConeSweepTotal = 2.0;
          this.bossConeSweepNextShotTimer = 0;
          this.bossSkillTelegraphTimer = 2.0;
          this.bossSkillTelegraphMax = 2.0;
          boss.shootTimer = 2.4; // Duy trì trọn vẹn 2 giây hoàn loạt quét qua lại + 0.4s nghỉ
          break;
        }

        case 3: {
          // KỸ NĂNG 4: TẠO RA 2 DRONE RA BẮN TIA LASER VÀO MÁY BAY CHÍNH
          this.bossCurrentSkillName = '🛸 TRIỆU HỒI 2 DRONE BẮN TIA LASER TRUY SÁT';
          sound.playBossAlarm();
          const offsets = calculateDroneFormationOffsets();
          this.bossEscortDrones = [
            {
              id: this.nextEntityId++,
              side: 'left',
              x: boss.x - 30,
              y: boss.y,
              targetOffsetX: offsets.left.offsetX,
              targetOffsetY: offsets.left.offsetY,
              hp: 450,
              maxHp: 450,
              laserChargeTimer: 0.8,
              laserFireTimer: 0,
              aimX: this.player.x,
              aimY: this.player.y,
              hitFlashTimer: 0,
              timeAlive: 0,
              lifeTimer: 8.5,
            },
            {
              id: this.nextEntityId++,
              side: 'right',
              x: boss.x + 30,
              y: boss.y,
              targetOffsetX: offsets.right.offsetX,
              targetOffsetY: offsets.right.offsetY,
              hp: 450,
              maxHp: 450,
              laserChargeTimer: 0.8,
              laserFireTimer: 0,
              aimX: this.player.x,
              aimY: this.player.y,
              hitFlashTimer: 0,
              timeAlive: 0,
              lifeTimer: 8.5,
            },
          ];
          this.emitBurst(boss.x, boss.y, 18, '#06b6d4', 1.2);
          break;
        }

        case 4: {
          // KỸ NĂNG 5: TỤ LỰC LẠI VÀ GÈ THEO HƯỚNG MÁY BAY CHÍNH
          this.bossRushState = 'charging';
          this.bossRushTimer = 1.2; // 1.2s tụ lực
          this.bossSkillTelegraphTimer = 1.2;
          this.bossSkillTelegraphMax = 1.2;
          this.bossCurrentSkillName = '⚡ BOSS ĐANG TỤ LỰC XUNG KÍCH...';
          sound.playBossAlarm();
          break;
        }

        case 5: {
          // KỸ NĂNG 6: GÈ TIA GAMMA LỚN
          this.bossCurrentSkillName = '☢️ BOSS ĐANG GÈ TIA GAMMA LỚN... ☢️';
          this.bossMegaBeamChargingTimer = 1.4; // 1.4s tụ lực & gè ngắm theo máy bay
          this.bossMegaBeamFiringTimer = 0;
          this.bossMegaBeamX = this.player.x;
          this.bossMegaBeamWidth = 125;
          this.bossSkillTelegraphTimer = 1.4;
          this.bossSkillTelegraphMax = 1.4;
          sound.playBossAlarm();
          break;
        }
      }
    }
  }

  private spawnEnemy() {
    const scaling = calculateWaveScaling(this.wave, this.difficulty);
    const roll = Math.random();
    const spawnX = clamp(Math.random() * (this.width - 60) + 30, 30, this.width - 30);

    if (this.gameMode === 'adventure') {
      const advStage = this.currentAdventureStageId ? getAdventureStageById(this.currentAdventureStageId) : ADVENTURE_STAGES[0];
      const chickenVariant = Math.floor(Math.random() * 4);
      const isCruiserChicken = roll < 0.28;
      const baseHp = (isCruiserChicken ? 90 : 45) + this.wave * 12 + advStage.id * 10;
      const hp = Math.round(baseHp * scaling.hpMultiplier);

      this.enemies.push({
        id: this.nextEntityId++,
        type: isCruiserChicken ? 'cruiser' : 'scout',
        x: spawnX,
        y: -35,
        vx: (Math.random() > 0.5 ? 1 : -1) * (55 + Math.random() * 45),
        vy: 85 + Math.random() * 45,
        width: isCruiserChicken ? 48 : 36,
        height: isCruiserChicken ? 44 : 32,
        radius: isCruiserChicken ? 22 : 16,
        hp,
        maxHp: hp,
        defense: scaling.enemyArmor,
        color: isCruiserChicken ? '#f97316' : '#fef08a',
        shootTimer: 1.0 + Math.random() * 1.5,
        shootCooldown: Math.max(0.7, 2.0 / scaling.fireRateCooldownScale),
        timeAlive: Math.random() * 5,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
        isChickenInvader: true,
        chickenVariant,
      });
      return;
    }

    if (roll < 0.15) {
      // 1. Scout Drone
      const baseHp = 35 + this.wave * 10;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'scout',
        x: spawnX,
        y: -30,
        vx: 0,
        vy: 140 + Math.random() * 40,
        width: 32,
        height: 28,
        radius: 14,
        hp,
        maxHp: hp,
        defense: scaling.enemyArmor,
        color: '#38bdf8',
        shootTimer: 999,
        shootCooldown: 999,
        timeAlive: Math.random() * 5,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else if (roll < 0.29) {
      // 2. Viper Interceptor
      const baseHp = 70 + this.wave * 18;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'viper',
        x: spawnX,
        y: -35,
        vx: (Math.random() > 0.5 ? 1 : -1) * 75,
        vy: 95 + Math.random() * 30,
        width: 40,
        height: 36,
        radius: 18,
        hp,
        maxHp: hp,
        defense: scaling.enemyArmor,
        color: '#f43f5e',
        shootTimer: 1.2 + Math.random() * 0.8,
        shootCooldown: Math.max(0.6, 1.8 / scaling.fireRateCooldownScale),
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else if (roll < 0.40) {
      // 3. Heavy Cruiser
      const baseHp = 220 + this.wave * 45;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'cruiser',
        x: spawnX,
        y: -50,
        vx: (Math.random() > 0.5 ? 1 : -1) * 45,
        vy: 60,
        width: 60,
        height: 52,
        radius: 26,
        hp,
        maxHp: hp,
        defense: Math.round(scaling.enemyArmor * 1.25),
        color: '#f97316',
        shootTimer: 2.0,
        shootCooldown: Math.max(0.8, 2.8 / scaling.fireRateCooldownScale),
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else if (roll < 0.50) {
      // 4. Kamikaze Dive Bomber - FIXED: No wave flight speed scaling!
      const targetDx = this.player.x - spawnX;
      const baseHp = 40 + this.wave * 12;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'kamikaze',
        x: spawnX,
        y: -30,
        vx: clamp(targetDx * 0.8, -120, 120),
        vy: 260 * Math.min(1.5, scaling.bulletSpeedMultiplier),
        width: 30,
        height: 30,
        radius: 14,
        hp,
        maxHp: hp,
        defense: scaling.enemyArmor,
        color: '#e11d48',
        shootTimer: 999,
        shootCooldown: 999,
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else if (roll < 0.60) {
      // 5. Plasma Mortar Artillery (NEW)
      const baseHp = 180 + this.wave * 35;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'plasma_mortar',
        x: spawnX,
        y: -45,
        vx: (Math.random() > 0.5 ? 1 : -1) * 40,
        vy: 55,
        width: 52,
        height: 48,
        radius: 24,
        hp,
        maxHp: hp,
        defense: Math.round(scaling.enemyArmor * 1.2),
        color: '#ea580c',
        shootTimer: 2.2,
        shootCooldown: Math.max(0.9, 3.0 / scaling.fireRateCooldownScale),
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else if (roll < 0.70) {
      // 6. Spectre Assassin (NEW)
      const baseHp = 95 + this.wave * 20;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'spectre_assassin',
        x: spawnX,
        y: -35,
        vx: (Math.random() > 0.5 ? 1 : -1) * 90,
        vy: 105,
        width: 38,
        height: 38,
        radius: 18,
        hp,
        maxHp: hp,
        defense: scaling.enemyArmor,
        color: '#ec4899',
        shootTimer: 1.4,
        shootCooldown: Math.max(0.6, 2.0 / scaling.fireRateCooldownScale),
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else if (roll < 0.78) {
      // 7. Shield Drone (NEW)
      const baseHp = 140 + this.wave * 28;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'shield_drone',
        x: spawnX,
        y: -35,
        vx: (Math.random() > 0.5 ? 1 : -1) * 50,
        vy: 65,
        width: 42,
        height: 42,
        radius: 20,
        hp,
        maxHp: hp,
        defense: Math.round(scaling.enemyArmor * 1.5),
        color: '#06b6d4',
        shootTimer: 999,
        shootCooldown: 999,
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else if (roll < 0.86) {
      // 8. Vanguard Missile Frigate (NEW)
      const baseHp = 260 + this.wave * 50;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'vanguard_missile_frigate',
        x: spawnX,
        y: -55,
        vx: (Math.random() > 0.5 ? 1 : -1) * 35,
        vy: 50,
        width: 64,
        height: 54,
        radius: 28,
        hp,
        maxHp: hp,
        defense: Math.round(scaling.enemyArmor * 1.3),
        color: '#f59e0b',
        shootTimer: 2.0,
        shootCooldown: Math.max(0.8, 2.6 / scaling.fireRateCooldownScale),
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else if (roll < 0.93) {
      // 9. Heavy Destroyer
      const baseHp = 340 + this.wave * 60;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'destroyer',
        x: spawnX,
        y: -55,
        vx: (Math.random() > 0.5 ? 1 : -1) * 35,
        vy: 50,
        width: 68,
        height: 58,
        radius: 30,
        hp,
        maxHp: hp,
        defense: Math.round(scaling.enemyArmor * 1.5),
        color: '#dc2626',
        shootTimer: 1.8,
        shootCooldown: Math.max(0.7, 2.4 / scaling.fireRateCooldownScale),
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    } else {
      // 10. Drone Carrier (Support Fortress)
      const baseHp = 420 + this.wave * 75;
      const hp = Math.round(baseHp * scaling.hpMultiplier);
      this.enemies.push({
        id: this.nextEntityId++,
        type: 'carrier',
        x: spawnX,
        y: -65,
        vx: (Math.random() > 0.5 ? 1 : -1) * 30,
        vy: 40,
        width: 76,
        height: 64,
        radius: 34,
        hp,
        maxHp: hp,
        defense: Math.round(scaling.enemyArmor * 1.4),
        color: '#0284c7',
        shootTimer: 2.5,
        shootCooldown: Math.max(1.0, 3.5 / scaling.fireRateCooldownScale),
        timeAlive: 0,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
      });
    }

    // Chế độ Siêu Khó: Quái tầm trung đổ lên có Máu trâu hơn 80%, Phòng thủ cao hơn 60% và có Thanh Giáp dưới thanh máu
    const lastSpawned = this.enemies[this.enemies.length - 1];
    if (lastSpawned && this.gameMode === 'super_hard' && lastSpawned.type !== 'boss' && isMidTierEnemy(lastSpawned.type)) {
      lastSpawned.hp = Math.round(lastSpawned.hp * 1.8);
      lastSpawned.maxHp = lastSpawned.hp;
      lastSpawned.defense = Math.round((lastSpawned.defense || 0) * 1.6);
      lastSpawned.maxArmor = Math.round(lastSpawned.hp * 0.5);
      lastSpawned.armor = lastSpawned.maxArmor;
    }

    // Color-coded enemy resource variants (~25% of spawned enemies):
    // - 'gold': Hoàng kim lấp lánh -> Rơi Hòm Vàng Hoàng Kim (Gold Cache +250 Vàng/Xu)
    // - 'shield': Lam ngọc tinh thể -> Rơi Mảnh Sạc Khiên Năng Lượng (+40 Giáp & kích hoạt khiên)
    // - 'energy': Lục bảo quang tử -> Rơi Lõi Năng Lượng Lục Bảo (+15 HP & sạc nộ kỹ năng)
    if (lastSpawned && lastSpawned.type !== 'boss') {
      const variantRoll = Math.random();
      if (variantRoll < 0.09) {
        lastSpawned.resourceVariant = 'gold';
        lastSpawned.color = '#fbbf24'; // Hoàng kim rực rỡ
      } else if (variantRoll < 0.18) {
        lastSpawned.resourceVariant = 'shield';
        lastSpawned.color = '#38bdf8'; // Lam ngọc khiên giáp
      } else if (variantRoll < 0.26) {
        lastSpawned.resourceVariant = 'energy';
        lastSpawned.color = '#10b981'; // Lục bảo năng lượng
      }
    }
  }

  private fireEnemyBullet(
    fromX: number,
    fromY: number,
    targetX: number,
    targetY: number,
    speed: number,
    color: string,
    baseDamage: number = 25
  ) {
    const scaling = calculateWaveScaling(this.wave, this.difficulty);
    const angle = Math.atan2(targetY - fromY, targetX - fromX);
    const effectiveSpeed = speed * scaling.bulletSpeedMultiplier;
    let finalDamage = Math.max(15, Math.round(baseDamage * scaling.damageMultiplier));
    if (this.gameMode === 'super_hard') {
      finalDamage = Math.round(finalDamage * 1.5); // +50% sát thương
    }
    const isEgg = this.gameMode === 'adventure';
    this.bullets.push({
      id: this.nextEntityId++,
      x: fromX,
      y: fromY,
      vx: Math.cos(angle) * effectiveSpeed,
      vy: Math.sin(angle) * effectiveSpeed,
      radius: isEgg ? 6.5 : 4.5,
      damage: finalDamage,
      isPlayer: false,
      color: isEgg ? '#fef08a' : color,
      isEggBullet: isEgg,
      eggRotation: angle + Math.PI / 2,
    });
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      // Homing missile navigation
      if (b.isHoming) {
        if (b.isPlayer) {
          let target = this.enemies.find((e) => e.id === b.homingTargetId);
          if (!target) {
            // Find closest enemy
            let closestDist = Infinity;
            for (const enemy of this.enemies) {
              const dist = Math.hypot(enemy.x - b.x, enemy.y - b.y);
              if (dist < closestDist) {
                closestDist = dist;
                target = enemy;
                b.homingTargetId = enemy.id;
              }
            }
          }

          if (target) {
            const desiredAngle = Math.atan2(target.y - b.y, target.x - b.x);
            const currentAngle = Math.atan2(b.vy, b.vx);
            let diff = desiredAngle - currentAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            const newAngle = currentAngle + clamp(diff, -5 * dt, 5 * dt);
            const speed = 460;
            b.vx = Math.cos(newAngle) * speed;
            b.vy = Math.sin(newAngle) * speed;
          }
        } else {
          // Boss/Enemy homing missile actively tracking player
          if (b.homingDurationTimer !== undefined) {
            b.homingDurationTimer -= dt;
            if (b.homingDurationTimer <= 0) {
              b.isHoming = false; // Dừng truy đuổi sau 3 giây, tiếp tục bay thẳng theo quán tính!
            }
          }
          if (b.isHoming) {
            const desiredAngle = Math.atan2(this.player.y - b.y, this.player.x - b.x);
            const currentAngle = Math.atan2(b.vy, b.vx);
            let diff = desiredAngle - currentAngle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            const turnRate = 3.6;
            const newAngle = currentAngle + clamp(diff, -turnRate * dt, turnRate * dt);
            const speed = 330;
            b.vx = Math.cos(newAngle) * speed;
            b.vy = Math.sin(newAngle) * speed;
          }
        }

        // Missile smoke trail
        if (Math.random() < 0.6) {
          this.emitParticle(b.x, b.y, 0, b.isPlayer ? 40 : -b.vy * 0.1, 0.25, 2.5, b.isPlayer ? '#f59e0b' : '#ef4444', 'spark');
        }
      }

      // Prism Laser screen border ricochet
      if (b.isPrismLaser && b.ricochetsRemaining && b.ricochetsRemaining > 0) {
        if (b.x <= 16 || b.x >= this.width - 16) {
          b.vx = -b.vx;
          b.ricochetsRemaining--;
          this.emitBurst(b.x, b.y, 4, b.color, 0.4);
        }
      }

      // Boss / Mortar Shell detonation
      if (b.isBossMortarShell && !b.isPlayer && (b.y >= this.player.y || b.y >= this.height - 140)) {
        this.bullets.splice(i, 1);
        this.emitBurst(b.x, b.y, 16, '#f97316', 1.0);
        this.addTrauma(0.15);
        for (let s = 0; s < 6; s++) {
          const sAngle = (s * Math.PI * 2) / 6;
          this.bullets.push({
            id: this.nextEntityId++,
            x: b.x,
            y: b.y,
            vx: Math.cos(sAngle) * 220,
            vy: Math.sin(sAngle) * 220,
            radius: 4.5,
            damage: 20,
            isPlayer: false,
            color: '#f97316',
          });
        }
        continue;
      }

      // Graviton Singularity Orb gravity field pull
      if (b.isBossGravitonOrb && !b.isPlayer) {
        const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
        if (dist < 220 && dist > 10) {
          const pull = 60 * dt;
          this.player.x += ((b.x - this.player.x) / dist) * pull;
          this.player.y += ((b.y - this.player.y) / dist) * pull;
        }
        if (Math.random() < 0.4) {
          this.emitParticle(b.x + (Math.random() * 20 - 10), b.y + (Math.random() * 20 - 10), 0, 0, 0.2, 3, '#c084fc');
        }
      }

      // Egg bullet rotation for CI4 adventure mode
      if (b.isEggBullet) {
        b.eggRotation = (b.eggRotation || 0) + 3.5 * dt;
      }

      // Double Helix kinetic stardust wave oscillation
      if (b.isHelixBullet) {
        b.helixPhase = (b.helixPhase || 0) + 14 * dt;
        b.x = (b.helixBaseX || b.x) + Math.sin(b.helixPhase) * 26;
      }

      // Chrono Echo pulse duplication
      if (b.isEchoResonant && b.echoTimer !== undefined) {
        b.echoTimer -= dt;
        if (b.echoTimer <= 0 && !b.hasEchoDuplicated) {
          b.hasEchoDuplicated = true;
          this.emitBurst(b.x, b.y, 4, '#34d399', 0.5);
          [-85, 85].forEach((sideVx) => {
            this.bullets.push({
              id: this.nextEntityId++,
              x: b.x,
              y: b.y,
              vx: sideVx,
              vy: b.vy,
              radius: b.radius * 0.9,
              damage: b.damage * 0.75,
              isPlayer: true,
              color: '#34d399',
              isEchoResonant: true,
              hasEchoDuplicated: true,
              echoTimer: 999,
            });
          });
        }
      }

      // Void Rift Trap persistence and ticking
      if (b.isRiftTrap) {
        b.vx = 0;
        b.vy = 0;
        b.trapDuration = (b.trapDuration || 1.8) - dt;
        if (b.trapDuration <= 0) {
          this.bullets.splice(i, 1);
          continue;
        }
        for (const enemy of this.enemies) {
          if (Math.hypot(enemy.x - b.x, enemy.y - b.y) <= b.radius + enemy.radius) {
            enemy.hp -= b.damage * 0.6 * dt;
            enemy.hitFlashTimer = 0.05;
          }
        }
      }

      // Napalm Ember slow falling & duration
      if (b.isNapalmEmber) {
        b.emberLife = (b.emberLife || 2.2) - dt;
        if (b.emberLife <= 0) {
          this.bullets.splice(i, 1);
          continue;
        }
        if (Math.random() < 0.25) {
          this.emitParticle(b.x, b.y, (Math.random() - 0.5) * 15, -20, 0.2, 2.5, '#f97316', 'spark');
        }
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.starRotation !== undefined && b.starRotSpeed !== undefined) {
        b.starRotation += b.starRotSpeed * dt;
      }

      // Bullet bounds cull
      if (b.x < -30 || b.x > this.width + 30 || b.y < -40 || b.y > this.height + 40) {
        this.bullets.splice(i, 1);
      }
    }
  }

  private updatePickups(dt: number) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.y += p.vy * dt;
      p.angle += 2 * dt;

      // Magnetic attraction to player if close
      const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (dist < 140) {
        const pullSpeed = 240 * dt;
        p.x += ((this.player.x - p.x) / dist) * pullSpeed;
        p.y += ((this.player.y - p.y) / dist) * pullSpeed;
      }

      if (p.y > this.height + 40) {
        this.pickups.splice(i, 1);
      }
    }
  }

  private checkCollisions() {
    const p = this.player;

    // 1. Player Bullets vs Enemies
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      if (!b.isPlayer) continue;

      // Check collision with Boss Escort Drones
      let hitDrone = false;
      for (let di = this.bossEscortDrones.length - 1; di >= 0; di--) {
        const d = this.bossEscortDrones[di];
        if (checkCircleCollision({ x: b.x, y: b.y, radius: b.radius }, { x: d.x, y: d.y, radius: 18 })) {
          hitDrone = true;
          d.hp -= b.damage;
          d.hitFlashTimer = 0.08;
          sound.playHit(false);
          this.emitBurst(b.x, b.y, 4, b.color, 0.5);
          this.addDamageText(d.x + (Math.random() * 12 - 6), d.y - 10, `${Math.round(b.damage)}`, '#38bdf8', 12);
          if (!b.piercing) {
            this.bullets.splice(bi, 1);
          }
          if (d.hp <= 0) {
            sound.playExplosion('small');
            this.emitBurst(d.x, d.y, 16, '#06b6d4', 1.2);
            this.addDamageText(d.x, d.y - 15, 'DRONE PHÁ HỦY! 💥', '#f43f5e', 14, true);
            this.score += 350;
            this.bossEscortDrones.splice(di, 1);
          }
          break;
        }
      }
      if (hitDrone && !b.piercing) continue;

      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (checkCircleCollision({ x: b.x, y: b.y, radius: b.radius }, { x: e.x, y: e.y, radius: e.radius })) {
          // Apply enemy armor / defense mitigation:
          let baseDef = e.defense || 0;
          if (e.isShielded) {
            baseDef += 60; // Shield Drone defense barrier buff
          }
          const pen = b.isDragonFlame ? Math.min(100, p.armorPen + 35) : p.armorPen;
          const effectiveDefense = Math.max(0, baseDef * (1 - pen / 100));
          const isTrueDmg = b.isTrueDamage || b.isGammaBeam;
          const netDamage = isTrueDmg ? b.damage : Math.max(1, Math.round(b.damage * (100 / (100 + effectiveDefense))));

          // Sanitize e.hp and e.armor to completely eliminate NaN
          if (typeof e.hp !== 'number' || isNaN(e.hp)) e.hp = e.maxHp || 100;
          if (e.armor !== undefined && (typeof e.armor !== 'number' || isNaN(e.armor))) e.armor = e.maxArmor || 0;

          if (e.armor !== undefined && e.armor > 0) {
            const armRes = applyDamageWithArmor(e.armor, e.hp, netDamage, isTrueDmg);
            e.armor = armRes.newArmor;
            e.hp = armRes.newHp;
            if (armRes.armorBroken) {
              this.addDamageText(e.x, e.y - 20, 'VỠ GIÁP! 🛡️', '#38bdf8', 14, true);
              sound.playShieldBreak();
            } else if (armRes.absorbedByArmor > 0) {
              this.addDamageText(e.x + (Math.random() * 16 - 8), e.y - 12, `🛡️ -${Math.round(armRes.absorbedByArmor)}`, '#38bdf8', 12);
            }
            if (armRes.damageToHp > 0) {
              if (b.isCrit) {
                this.addDamageText(e.x + (Math.random() * 16 - 8), e.y - 12, `${Math.round(armRes.damageToHp)}!`, '#fbbf24', 15, true);
              } else {
                this.addDamageText(e.x + (Math.random() * 16 - 8), e.y - 12, `${Math.round(armRes.damageToHp)}`, '#ffffff', 12);
              }
            }
          } else {
            e.hp = Math.max(0, e.hp - netDamage);
            if (b.isCrit) {
              this.addDamageText(e.x + (Math.random() * 16 - 8), e.y - 12, `${Math.round(netDamage)}!`, '#fbbf24', 15, true);
            } else if (isTrueDmg) {
              this.addDamageText(e.x + (Math.random() * 16 - 8), e.y - 12, `${Math.round(netDamage)}⚡`, '#c084fc', 13);
            } else {
              this.addDamageText(e.x + (Math.random() * 16 - 8), e.y - 12, `${Math.round(netDamage)}`, '#ffffff', 12);
            }
          }

          e.hitFlashTimer = 0.08;
          sound.playHit(false);

          this.emitBurst(b.x, b.y, 3, b.color, 0.6);

          // Astraea: Viên đạn sao chính khi trúng toả 5 ngôi sao nhỏ (giảm 60% sát thương: 60 -> 24)
          if (b.isStarBullet) {
            this.emitBurst(b.x, b.y, 14, '#facc15', 1.0);
            for (let k = 0; k < 5; k++) {
              const starAngle = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
              this.bullets.push({
                id: this.nextEntityId++,
                x: b.x,
                y: b.y,
                vx: Math.cos(starAngle) * 440,
                vy: Math.sin(starAngle) * 440,
                radius: 6,
                damage: 24, // Giảm 60% (60 -> 24)
                isPlayer: true,
                color: '#facc15',
                isSmallStarBullet: true,
                starRotation: starAngle,
                starRotSpeed: 8,
              });
            }
          }

          // Astraea Sakura Blossom: Đạn hoa anh đào khi trúng bung tỏa bão 5 cánh hoa anh đào nhỏ
          if (b.isSakuraBullet) {
            this.emitBurst(b.x, b.y, 18, '#f472b6', 1.3);
            this.emitBurst(b.x, b.y, 10, '#fbcfe8', 0.9);
            for (let k = 0; k < 5; k++) {
              const petAngle = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
              this.bullets.push({
                id: this.nextEntityId++,
                x: b.x,
                y: b.y,
                vx: Math.cos(petAngle) * 440,
                vy: Math.sin(petAngle) * 440,
                radius: 6,
                damage: 24,
                isPlayer: true,
                color: '#fbcfe8',
                isSmallSakuraBullet: true,
                starRotation: petAngle,
                starRotSpeed: 8,
              });
            }
          }

          // Astraea Skill: Ngôi sao to trúng mục tiêu, nổ lan nhỏ + toả 5 sao tầm trung (giảm 60%)
          if (b.isMegaStarSkill) {
            sound.playExplosion('medium');
            this.addTrauma(0.4);
            this.emitBurst(b.x, b.y, 24, '#fbbf24', 1.5);
            this.shockwaves.push({
              x: b.x,
              y: b.y,
              radius: 10,
              maxRadius: 180,
              color: '#fbbf24',
              alpha: 1.0,
            });
            // Nổ lan trong phạm vi nhỏ (150 -> 60)
            for (const other of this.enemies) {
              if (other.id !== e.id && Math.hypot(other.x - b.x, other.y - b.y) <= 120) {
                other.hp -= 60;
                other.hitFlashTimer = 0.08;
                this.addDamageText(other.x, other.y - 8, '60 Lan', '#f59e0b', 12);
                if (other.hp <= 0) {
                  const oIdx = this.enemies.indexOf(other);
                  if (oIdx !== -1) {
                    this.destroyEnemy(other, oIdx);
                  }
                }
              }
            }
            // Toả 5 ngôi sao tầm trung (100 -> 40)
            for (let k = 0; k < 5; k++) {
              const midAngle = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
              this.bullets.push({
                id: this.nextEntityId++,
                x: b.x,
                y: b.y,
                vx: Math.cos(midAngle) * 380,
                vy: Math.sin(midAngle) * 380,
                radius: 8,
                damage: 40,
                isPlayer: true,
                color: '#fde047',
                isMediumStarBullet: true,
                starRotation: midAngle,
                starRotSpeed: 6,
              });
            }
          }

          // Astraea Skill: Ngôi sao tầm trung khi trúng toả 5 ngôi sao nhỏ (50 -> 20)
          if (b.isMediumStarBullet) {
            this.emitBurst(b.x, b.y, 10, '#fde047', 0.8);
            for (let k = 0; k < 5; k++) {
              const miniAngle = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
              this.bullets.push({
                id: this.nextEntityId++,
                x: b.x,
                y: b.y,
                vx: Math.cos(miniAngle) * 340,
                vy: Math.sin(miniAngle) * 340,
                radius: 5,
                damage: 20,
                isPlayer: true,
                color: '#fef08a',
                isSkillMiniStar: true,
                starRotation: miniAngle,
                starRotSpeed: 10,
              });
            }
          }

          // Astraea Skill: Ngôi sao nhỏ gây 20 ST và làm choáng 1s
          if (b.isSkillMiniStar) {
            e.stunTimer = 1.0;
            this.addDamageText(e.x, e.y - 24, 'CHOÁNG 1s!', '#38bdf8', 13, true);
            this.emitBurst(e.x, e.y, 8, '#fde047', 0.8);
          }

          // Nanite Swarm Leech HP & Armor
          if (b.isNaniteSwarm) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1.2);
            this.player.armor = Math.min(this.player.maxArmor, this.player.armor + 1.2);
            this.emitBurst(b.x, b.y, 4, '#84cc16', 0.5);
          }

          // Hiệu ứng tia điện nhỏ trúng kẻ địch từ Drone Trấn Phái RTS-88 (DR-88 Lôi Vân Kích S)
          if (b.isDroneLightningBolt) {
            const arcCount = 2;
            for (let k = 0; k < arcCount; k++) {
              const segs = this.createLightningSegments(
                b.x,
                b.y,
                e.x + (Math.random() - 0.5) * e.radius * 1.2,
                e.y + (Math.random() - 0.5) * e.radius * 1.2,
                4
              );
              this.lightningArcs.push({
                segments: segs,
                life: 0.08,
                maxLife: 0.08,
                color: Math.random() > 0.4 ? '#38bdf8' : '#facc15',
              });
            }
            this.emitBurst(b.x, b.y, 4, '#38bdf8', 0.8);
          }

          if (b.isCryoIce) {
            // Cryo freeze: slow enemy speed by 40%
            e.vx *= 0.6;
            e.vy *= 0.6;
            this.emitBurst(e.x, e.y, 5, '#7dd3fc', 0.8);
          }

          if (b.isSingularityVortex) {
            // Singularity pull towards vortex core
            e.x += (b.x - e.x) * 0.3;
            this.emitBurst(b.x, b.y, 6, '#8b5cf6', 0.7);
          }

          if (b.isSolarFireball) {
            // Solar Area Splash Explosion
            const splashRad = b.splashRadius || 45;
            this.emitBurst(b.x, b.y, 14, '#f59e0b', 1.2);
            for (const other of this.enemies) {
              if (other.id !== e.id && Math.hypot(other.x - b.x, other.y - b.y) <= splashRad) {
                other.hp -= b.damage * 0.6;
                other.hitFlashTimer = 0.08;
                if (other.hp <= 0) {
                  const oIdx = this.enemies.indexOf(other);
                  if (oIdx !== -1) {
                    this.destroyEnemy(other, oIdx);
                  }
                }
              }
            }
          }

          if (b.isAntimatter) {
            // Heavy antimatter explosion burst
            this.emitBurst(b.x, b.y, 10, '#ef4444', 1.4);
            this.addTrauma(0.08);
          }

          if (b.isLightningOrb) {
            // Electric AoE chain burst to adjacent enemies
            this.emitBurst(b.x, b.y, 10, '#06b6d4', 1.0);
            const others = this.enemies.filter((o) => o.id !== e.id);
            const chained = findLightningChainTargets(e.x, e.y, others, 2, 180);
            for (const c of chained) {
              const segs = this.createLightningSegments(e.x, e.y, c.x, c.y, 4);
              this.lightningArcs.push({
                segments: segs,
                life: 0.1,
                maxLife: 0.1,
                color: '#38bdf8',
              });
              c.hp -= b.damage * 0.7;
              c.hitFlashTimer = 0.08;
              this.emitBurst(c.x, c.y, 4, '#38bdf8', 0.6);
              if (c.hp <= 0) {
                const cIdx = this.enemies.indexOf(c);
                if (cIdx !== -1) {
                  this.destroyEnemy(c, cIdx);
                }
              }
            }
          }

          // Void Rift Blade: Leaves persistent Dimensional Rift Trap
          if (b.isRiftBlade) {
            this.bullets.push({
              id: this.nextEntityId++,
              x: e.x,
              y: e.y,
              vx: 0,
              vy: 0,
              radius: 26,
              damage: b.damage * 0.75,
              isPlayer: true,
              color: '#c084fc',
              isRiftTrap: true,
              trapDuration: 1.8,
            });
            this.emitBurst(e.x, e.y, 8, '#a855f7', 0.8);
          }

          // Sol Inferno Napalm Core: Explodes into 4 falling fire embers
          if (b.isNapalmCore) {
            this.emitBurst(b.x, b.y, 14, '#f97316', 1.0);
            for (let k = 0; k < 4; k++) {
              const ang = -Math.PI / 2 + (k * Math.PI) / 3;
              this.bullets.push({
                id: this.nextEntityId++,
                x: b.x,
                y: b.y,
                vx: Math.cos(ang) * 90,
                vy: 40 + Math.random() * 40,
                radius: 12,
                damage: b.damage * 0.45,
                isPlayer: true,
                color: '#f97316',
                isNapalmEmber: true,
                emberLife: 2.2,
              });
            }
          }

          // Bio Spore: Blooms into 4 seeking toxic needles
          if (b.isBioSpore) {
            this.emitBurst(b.x, b.y, 8, '#10b981', 0.8);
            for (let k = 0; k < 4; k++) {
              const ang = (k * Math.PI * 2) / 4;
              this.bullets.push({
                id: this.nextEntityId++,
                x: b.x,
                y: b.y,
                vx: Math.cos(ang) * 340,
                vy: Math.sin(ang) * 340,
                radius: 4.5,
                damage: b.damage * 0.45,
                isPlayer: true,
                color: '#a3e635',
                isHoming: true,
                isSporeNeedle: true,
              });
            }
          }

          // Graviton Harpoon: Lateral compression waves
          if (b.isGravitonHarpoon) {
            this.emitBurst(e.x, e.y, 8, '#e11d48', 0.8);
            [-1, 1].forEach((dir) => {
              this.bullets.push({
                id: this.nextEntityId++,
                x: e.x + dir * 18,
                y: e.y,
                vx: dir * 320,
                vy: 0,
                radius: 10,
                damage: b.damage * 0.35,
                isPlayer: true,
                color: '#fb7185',
                isGravitonPulse: true,
                piercing: true,
              });
            });
          }

          if (!b.piercing) {
            this.bullets.splice(bi, 1);
          }

          // Enemy destroyed!
          if (e.hp <= 0) {
            this.destroyEnemy(e, ei);
          }
          break;
        }
      }
    }

    // 2. Enemy Bullets vs Player
    if (p.invulnerableTimer <= 0) {
      for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
        const b = this.bullets[bi];
        if (b.isPlayer) continue;

        if (checkCircleCollision({ x: b.x, y: b.y, radius: b.radius }, { x: p.x, y: p.y, radius: p.radius })) {
          this.bullets.splice(bi, 1);

          // Prism Aegis Skill: 50% reflect enemy projectile back as player prism laser!
          if (p.isSkillActive && this.currentFighter.id === 'prism_aegis' && Math.random() < 0.5) {
            sound.playLaser('light');
            this.bullets.push({
              id: this.nextEntityId++,
              x: p.x,
              y: p.y - 20,
              vx: (Math.random() - 0.5) * 200,
              vy: -850,
              radius: 6,
              damage: 75,
              isPlayer: true,
              color: '#38bdf8',
              isPrismLaser: true,
              ricochetsRemaining: 2,
            });
            this.addDamageText(p.x, p.y - 15, 'PHẢN XẠ!', '#38bdf8', 13, true);
          } else {
            this.damagePlayer(b.damage || 25);
          }
          break;
        }
      }
    }

    // 3. Enemies vs Player (body ramming)
    if (p.invulnerableTimer <= 0) {
      const scaling = calculateWaveScaling(this.wave, this.difficulty);
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (checkCircleCollision({ x: e.x, y: e.y, radius: e.radius }, { x: p.x, y: p.y, radius: p.radius })) {
          e.hp -= 150;
          this.damagePlayer(Math.round(40 * scaling.damageMultiplier));
          if (e.hp <= 0) {
            this.destroyEnemy(e, ei);
          }
          break;
        }
      }
    }

    // 4. Player vs Pickups
    for (let pi = this.pickups.length - 1; pi >= 0; pi--) {
      const pk = this.pickups[pi];
      if (checkCircleCollision({ x: pk.x, y: pk.y, radius: pk.radius }, { x: p.x, y: p.y, radius: p.radius + 6 })) {
        this.collectPickup(pk);
        this.pickups.splice(pi, 1);
      }
    }
  }

  private destroyEnemy(enemy: Enemy, enemyIndex: number) {
    this.enemies.splice(enemyIndex, 1);
    this.enemiesKilled++;
    this.callbacks.onMissionAction?.('kill_enemies', 1);
    this.callbacks.onMissionAction?.('reach_score', this.score, true);
    if (this.wave >= 3) {
      this.callbacks.onMissionAction?.('reach_wave', this.wave, true);
    }

    // DRONE TIER S PASSIVE: Vampiric Harvest (Hồi 10% Máu tối đa khi tiêu diệt mục tiêu)
    const hasVampiricDrone = this.equippedDroneIds.some(
      (id) => DRONES[id]?.passiveSkill?.type === 'vampiric'
    );
    if (hasVampiricDrone) {
      const healAmount = Math.max(5, Math.round(this.player.maxHp * 0.10));
      if (this.player.hp < this.player.maxHp) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        this.addDamageText(this.player.x, this.player.y - 30, `+${healAmount} HP (HÚT MÁU)`, '#10b981', 14, true);
        this.emitBurst(this.player.x, this.player.y, 8, '#22c55e', 0.8);
        sound.playPowerup('shield');
      }
    }

    // DRONE TIER S PASSIVE: Overclock Surge (Tăng 15% ST trong 5s khi tiêu diệt mục tiêu)
    const hasOverclockDrone = this.equippedDroneIds.some(
      (id) => DRONES[id]?.passiveSkill?.type === 'overclock'
    );
    if (hasOverclockDrone && this.droneOverclockTimer <= 0) {
      this.droneOverclockTimer = 5.0;
      this.addDamageText(this.player.x, this.player.y - 44, '⚡ +15% ST QUÁ TẢI!', '#f59e0b', 14, true);
      sound.playPowerup('weapon');
    }

    // Combo & Score calculations
    const now = performance.now();
    const comboRes = updateCombo(this.combo, this.lastComboHitTime, now);
    this.combo = comboRes.combo;
    this.lastComboHitTime = comboRes.lastHitTime;

    const basePts =
      enemy.type === 'boss' ? 2500 : enemy.type === 'cruiser' ? 300 : enemy.type === 'viper' ? 150 : 80;
    const earned = Math.round(basePts * getComboMultiplier(this.combo) * (1 + (this.wave - 1) * 0.15));
    this.score += earned;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('sky_vanguard_highscore', String(this.highScore));
      } catch {}
    }

    // Sound & FX
    if (enemy.type === 'boss') {
      this.bossEscortDrones = [];
      this.bossRushState = 'none';
      this.bossRushAfterimages = [];
      this.boss9ConeBarrageTimer = 0;
      this.boss9ConeNextShotTimer = 0;
      this.bossConeSweepTimer = 0;
      this.bossConeSweepNextShotTimer = 0;
      this.bossMegaBeamChargingTimer = 0;
      this.bossMegaBeamFiringTimer = 0;
      sound.playExplosion('boss');
      this.addTrauma(0.8);
      this.hitstopTimer = 0.08;
      this.emitBurst(enemy.x, enemy.y, 45, '#ef4444', 1.8);
      this.shockwaves.push({
        x: enemy.x,
        y: enemy.y,
        radius: 30,
        maxRadius: 600,
        color: '#fbbf24',
        alpha: 1,
      });

      // Boss drops high-value powerups & upgrades (no bullet gift boxes)
      this.spawnPickup(enemy.x - 30, enemy.y, 'weapon');
      this.spawnPickup(enemy.x + 30, enemy.y, 'weapon');
      this.spawnPickup(enemy.x - 12, enemy.y + 15, 'shield');
      this.spawnPickup(enemy.x + 12, enemy.y + 15, 'bomb');
      this.spawnPickup(enemy.x, enemy.y + 30, 'coin');

      // Super Hard mode or Boss Rush victory / next cosmic boss progression
      if (this.gameMode === 'super_hard') {
        if (this.wave >= 10) {
          setTimeout(() => {
            if (this.state === 'playing') {
              this.victory();
            }
          }, 1200);
        } else {
          setTimeout(() => {
            if (this.state === 'playing') {
              this.wave++;
              this.lastBossWaveSpawned = 0; // Trigger next cosmic boss!
              this.sectorBannerTimer = 3.0;
              this.dispatchHUD();
            }
          }, 1500);
        }
      } else if (this.gameMode === 'boss_rush') {
        if (this.wave >= 20) {
          setTimeout(() => {
            if (this.state === 'playing') {
              this.victory();
            }
          }, 1200);
        } else {
          setTimeout(() => {
            if (this.state === 'playing') {
              this.wave++;
              this.lastBossWaveSpawned = 0; // Trigger next cosmic boss!
              this.sectorBannerTimer = 3.0;
              this.dispatchHUD();
            }
          }, 1500);
        }
      } else if (this.gameMode === 'adventure') {
        setTimeout(() => {
          if (this.state === 'playing') {
            this.victory();
          }
        }, 1200);
      } else if (this.gameMode === 'universe') {
        setTimeout(() => {
          if (this.state === 'playing') {
            this.victory();
          }
        }, 1200);
      }
    } else if (enemy.resourceVariant) {
      sound.playExplosion(enemy.type === 'cruiser' ? 'medium' : 'small');
      this.addTrauma(enemy.type === 'cruiser' ? 0.35 : 0.2);
      this.emitBurst(enemy.x, enemy.y, 16, enemy.color, 1.2);

      // Color-Coded Resource Variant Guaranteed Drops:
      if (enemy.resourceVariant === 'gold') {
        this.spawnPickup(enemy.x, enemy.y, 'gold_cache');
        this.addDamageText(enemy.x, enemy.y - 20, '★ RƠI KHO VÀNG!', '#fbbf24', 13, true);
      } else if (enemy.resourceVariant === 'shield') {
        this.spawnPickup(enemy.x, enemy.y, 'shield_shard');
        this.addDamageText(enemy.x, enemy.y - 20, '🛡️ MẢNH SẠC KHIÊN!', '#38bdf8', 13, true);
      } else if (enemy.resourceVariant === 'energy') {
        this.spawnPickup(enemy.x, enemy.y, 'energy_cell');
        this.addDamageText(enemy.x, enemy.y - 20, '⚡ LÕI NĂNG LƯỢNG!', '#10b981', 13, true);
      }
    } else if (enemy.type === 'cruiser') {
      sound.playExplosion('medium');
      this.addTrauma(0.35);
      this.emitBurst(enemy.x, enemy.y, 18, enemy.color);

      if (this.gameMode === 'adventure') {
        this.spawnPickup(enemy.x, enemy.y, 'drumstick');
      }

      // Heavy Cruisers drop weapon upgrade or shield
      if (Math.random() < 0.6) {
        this.spawnPickup(enemy.x - 12, enemy.y, 'weapon');
      } else {
        this.spawnPickup(enemy.x - 12, enemy.y, 'shield');
      }
      this.spawnPickup(enemy.x + 12, enemy.y, 'coin');
    } else {
      sound.playExplosion('small');
      this.addTrauma(0.15);
      this.emitBurst(enemy.x, enemy.y, 10, enemy.color);

      // Random drop rates from regular enemies (no bullet gift boxes)
      const dropRoll = Math.random();
      if (this.gameMode === 'adventure' && dropRoll < 0.35) {
        this.spawnPickup(enemy.x, enemy.y, 'drumstick');
      } else if (dropRoll < 0.22) {
        this.spawnPickup(enemy.x, enemy.y, 'coin');
      } else if (dropRoll < 0.35) {
        this.spawnPickup(enemy.x, enemy.y, 'weapon');
      } else if (dropRoll < 0.44) {
        this.spawnPickup(enemy.x, enemy.y, 'shield');
      } else if (dropRoll < 0.50) {
        this.spawnPickup(enemy.x, enemy.y, 'bomb');
      }
    }
  }

  private spawnPickup(x: number, y: number, type: PickupType) {
    const config = {
      weapon: { color: '#38bdf8', icon: 'P', label: 'CẤP ĐỘ', value: 1, radius: 13 },
      shield: { color: '#10b981', icon: 'S', label: 'KHIÊN', value: 1, radius: 13 },
      bomb: { color: '#f59e0b', icon: 'B', label: 'BOM EMP', value: 1, radius: 13 },
      coin: { color: '#fbbf24', icon: '★', label: 'XU', value: 50, radius: 11 },
      laser_box: { color: '#f43f5e', icon: 'L', label: 'LASER', value: 15, radius: 16 },
      lightning_box: { color: '#06b6d4', icon: '⚡', label: 'SẤM SÉT', value: 15, radius: 16 },
      drumstick: { color: '#f59e0b', icon: '🔋', label: 'LÕI NĂNG LƯỢNG', value: 500, radius: 15 },
      gold_cache: { color: '#fbbf24', icon: '💰', label: 'HÒM VÀNG', value: 250, radius: 14 },
      shield_shard: { color: '#38bdf8', icon: '🛡️', label: 'SẠC GIÁP', value: 1, radius: 14 },
      energy_cell: { color: '#10b981', icon: '⚡', label: 'NĂNG LƯỢNG', value: 100, radius: 14 },
    }[type];

    this.pickups.push({
      id: this.nextEntityId++,
      type,
      x,
      y,
      vy: 100,
      radius: config.radius,
      value: config.value,
      color: config.color,
      icon: config.icon,
      label: config.label,
      angle: 0,
      bobOffset: Math.random() * Math.PI * 2,
    });
  }

  private collectPickup(pk: Pickup) {
    this.emitBurst(pk.x, pk.y, 10, pk.color, 0.8);

    if (pk.type === 'laser_box') {
      this.callbacks.onMissionAction?.('collect_boxes', 1);
      const res = calculateSpecialWeaponDuration(
        this.player.activeSpecialWeapon,
        'laser',
        this.player.specialWeaponTimer,
        15,
        30
      );
      this.player.activeSpecialWeapon = res.weapon;
      this.player.specialWeaponTimer = res.duration;
      this.player.specialWeaponMaxTimer = Math.max(15, res.duration);
      sound.playGiftBoxPickup('laser');
      this.emitBurst(pk.x, pk.y, 22, '#f43f5e', 1.4);
      this.addTrauma(0.2);
    } else if (pk.type === 'lightning_box') {
      this.callbacks.onMissionAction?.('collect_boxes', 1);
      const res = calculateSpecialWeaponDuration(
        this.player.activeSpecialWeapon,
        'lightning',
        this.player.specialWeaponTimer,
        15,
        30
      );
      this.player.activeSpecialWeapon = res.weapon;
      this.player.specialWeaponTimer = res.duration;
      this.player.specialWeaponMaxTimer = Math.max(15, res.duration);
      sound.playGiftBoxPickup('lightning');
      this.emitBurst(pk.x, pk.y, 22, '#06b6d4', 1.4);
      this.addTrauma(0.2);
    } else if (pk.type === 'weapon') {
      this.callbacks.onMissionAction?.('collect_boxes', 1);
      sound.playPowerup('weapon');
      if (this.player.weaponLevel < 5) {
        this.player.weaponLevel++;
      } else if (this.player.dronesCount < 2) {
        this.player.dronesCount++;
      } else {
        this.score += 200;
      }
    } else if (pk.type === 'shield') {
      this.callbacks.onMissionAction?.('collect_boxes', 1);
      sound.playPowerup('shield');
      this.player.shieldActive = true;
      this.player.armor = this.player.maxArmor;
      this.addDamageText(this.player.x, this.player.y - 20, '+HỒI GIÁP', '#06b6d4', 13);
    } else if (pk.type === 'bomb') {
      this.callbacks.onMissionAction?.('collect_boxes', 1);
      sound.playPowerup('bomb');
      this.player.bombs = Math.min(this.player.bombs + 1, 5);
    } else if (pk.type === 'coin') {
      sound.playPowerup('coin');
      this.score += pk.value * getComboMultiplier(this.combo);
    } else if (pk.type === 'drumstick') {
      sound.playPowerup('coin');
      this.score += 500 * getComboMultiplier(this.combo);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 8);
      this.addDamageText(this.player.x, this.player.y - 20, '+500 🔋 LÕI NĂNG LƯỢNG!', '#fbbf24', 14);
      this.emitBurst(this.player.x, this.player.y, 10, '#f59e0b', 0.8);
    } else if (pk.type === 'gold_cache') {
      sound.playPowerup('coin');
      const bonusScore = Math.round(250 * getComboMultiplier(this.combo));
      this.score += bonusScore;
      this.callbacks.onMissionAction?.('collect_gold', 250);
      this.addDamageText(this.player.x, this.player.y - 24, `+${bonusScore} 💰 KHO VÀNG!`, '#fbbf24', 15, true);
      this.emitBurst(this.player.x, this.player.y, 14, '#fbbf24', 1.2);
    } else if (pk.type === 'shield_shard') {
      sound.playPowerup('shield');
      this.player.shieldActive = true;
      const rechargeAmount = Math.max(25, Math.round(this.player.maxArmor * 0.4));
      this.player.armor = Math.min(this.player.maxArmor, this.player.armor + rechargeAmount);
      this.addDamageText(this.player.x, this.player.y - 24, `+${rechargeAmount} 🛡️ SẠC GIÁP!`, '#38bdf8', 14, true);
      this.emitBurst(this.player.x, this.player.y, 14, '#38bdf8', 1.2);
    } else if (pk.type === 'energy_cell') {
      sound.playPowerup('weapon');
      const healHp = Math.max(10, Math.round(this.player.maxHp * 0.15));
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healHp);
      // Reduce active skill cooldown
      if (this.player.skillCooldownTimer > 0) {
        this.player.skillCooldownTimer = Math.max(0, this.player.skillCooldownTimer - 3.0);
      }
      this.addDamageText(this.player.x, this.player.y - 24, `+${healHp} HP ⚡ HỒI NĂNG LƯỢNG!`, '#10b981', 14, true);
      this.emitBurst(this.player.x, this.player.y, 14, '#10b981', 1.2);
    }

    this.dispatchHUD();
  }

  private damagePlayer(rawAmount: number = 25) {
    const p = this.player;

    // 1. Kiểm tra né tránh (Dodge)
    if (checkDodge(p.dodgeChance)) {
      this.addDamageText(p.x, p.y - 24, 'NÉ TRÁNH!', '#38bdf8', 15, true);
      sound.playDodge();
      p.invulnerableTimer = 0;
      return;
    }

    // 2. Khiên năng lượng bảo vệ tuyệt đối 1 đòn
    if (p.shieldActive) {
      p.shieldActive = false;
      p.invulnerableTimer = 0;
      sound.playHit(true);
      this.addTrauma(0.3);
      this.addDamageText(p.x, p.y - 24, 'HẤP THỤ KHIÊN!', '#10b981', 14);
      this.emitBurst(p.x, p.y, 14, '#10b981');
      this.dispatchHUD();
      return;
    }

    // 2.5 Hấp thụ sát thương bằng Lá Chắn Hạt Nano của Drone Aegis Bastion
    if (this.droneAegisShieldHp > 0) {
      const absorbed = Math.min(this.droneAegisShieldHp, rawAmount);
      this.droneAegisShieldHp -= absorbed;
      rawAmount -= absorbed;
      this.addDamageText(p.x, p.y - 24, `-${absorbed} KHIÊN NANO`, '#06b6d4', 13, true);
      this.emitBurst(p.x, p.y, 8, '#38bdf8', 0.8);
      sound.playHit(true);
      if (rawAmount <= 0) {
        this.dispatchHUD();
        return;
      }
    }

    // 2.6 Hấp thụ sát thương bằng Khiên Sấm Sét 300 HP của RTS-88 Tia Chớp
    if (this.rts88ShieldHp > 0 && p.isSkillActive) {
      const absorbed = Math.min(this.rts88ShieldHp, rawAmount);
      this.rts88ShieldHp -= absorbed;
      rawAmount -= absorbed;
      this.addDamageText(p.x, p.y - 24, `-${absorbed} ⚡ KHIÊN SÉT (${Math.round(this.rts88ShieldHp)}/300)`, '#facc15', 14, true);
      this.emitBurst(p.x, p.y, 8, '#00f0ff', 0.9);
      sound.playHit(true);
      if (this.rts88ShieldHp <= 0) {
        sound.playShieldBreak();
        this.addDamageText(p.x, p.y - 42, 'KHIÊN SÉT VỠ! ⚡', '#f87171', 15, true);
      }
      if (rawAmount <= 0) {
        this.dispatchHUD();
        return;
      }
    }

    // 3. Tính toán giảm sát thương theo Phòng Thủ
    const netDamage = calculateIncomingDamage(rawAmount, p.defense);
    p.armorRegenCooldown = 4.0; // Reset thời gian chờ hồi giáp

    // 4. Giáp chịu sát thương trước máu
    if (p.armor > 0) {
      if (p.armor >= netDamage) {
        p.armor -= netDamage;
        this.addDamageText(p.x, p.y - 24, `-${netDamage} GIÁP`, '#06b6d4', 14);
        sound.playHit(true);
        if (p.armor === 0) {
          sound.playShieldBreak();
          this.addDamageText(p.x, p.y - 40, 'VỠ GIÁP!', '#ef4444', 15, true);
        }
      } else {
        const absorbed = p.armor;
        const leftover = netDamage - absorbed;
        p.armor = 0;
        p.hp = Math.max(0, p.hp - leftover);
        sound.playShieldBreak();
        this.addDamageText(p.x, p.y - 24, `-${absorbed} GIÁP -${leftover} MÁU`, '#ef4444', 14, true);
      }
    } else {
      p.hp = Math.max(0, p.hp - netDamage);
      this.addDamageText(p.x, p.y - 24, `-${netDamage} MÁU`, '#ef4444', 14);
      sound.playHit(false);
    }

    p.hitFlashTimer = 0.15;
    p.invulnerableTimer = 0; // Đã loại bỏ cơ chế bất tử vài giây khi nhận sát thương theo yêu cầu
    this.addTrauma(0.55);
    this.hitstopTimer = 0.05;
    this.emitBurst(p.x, p.y, 16, '#ef4444');

    this.dispatchHUD();

    if (p.hp <= 0) {
      this.gameOver();
    }
  }

  private gameOver() {
    this.state = 'gameover';
    document.body.dataset.state = 'gameover';
    sound.playGameOver();
    this.callbacks.onStateChange('gameover');

    const duration = Math.round((performance.now() - this.playStartTime) / 1000);
    this.callbacks.onGameOver({
      score: this.score,
      wave: this.wave,
      enemiesKilled: this.enemiesKilled,
      playTime: duration,
      revivesUsed: this.revivesUsed,
      remainingHp: Math.max(0, Math.round(this.player.hp)),
      maxHp: Math.round(this.player.maxHp),
    });
  }

  public victory() {
    this.state = 'gameover';
    document.body.dataset.state = 'gameover';
    sound.playVictory();
    this.callbacks.onStateChange('gameover');

    const duration = Math.round((performance.now() - this.playStartTime) / 1000);
    this.callbacks.onVictory({
      score: this.score,
      wave: this.wave,
      enemiesKilled: this.enemiesKilled,
      playTime: duration,
      revivesUsed: this.revivesUsed,
      remainingHp: Math.max(0, Math.round(this.player.hp)),
      maxHp: Math.round(this.player.maxHp),
    });
  }

  // Canvas Rendering
  private render() {
    const ctx = this.ctx;
    ctx.save();

    // Parallax Tilt & Centrifugal Sway (smoothly dampened to avoid corner edge distortion)
    const tiltState = parallaxTiltManager.getState();
    const maxShift = 28;
    const tiltCamX = clamp(tiltState.tiltX * 14 + tiltState.centrifugalX * 0.7, -maxShift, maxShift);
    const tiltCamY = clamp(tiltState.tiltY * 10 + tiltState.centrifugalY * 0.7, -maxShift, maxShift);

    // Screen Shake Offset (trauma^2) + Centrifugal sway
    let totalCamX = tiltCamX;
    let totalCamY = tiltCamY;
    if (this.trauma > 0) {
      const shakeAmt = this.trauma * this.trauma * 14;
      totalCamX += (Math.random() * 2 - 1) * shakeAmt;
      totalCamY += (Math.random() * 2 - 1) * shakeAmt;
    }
    ctx.translate(totalCamX, totalCamY);

    if (this.gameMode === 'free_flight' && this.state !== 'title') {
      this.renderFreeFlightGalaxy(ctx);
      ctx.restore();
      return;
    }

    // Multi-sector & Universe-aware background gradient
    const sector = this.state === 'title' ? MAP_SECTORS[0] : (this.currentSector || getSectorForWave(this.wave));
    const activeUniv = (this.gameMode === 'universe' && this.currentUniverseId) ? getUniverseById(this.currentUniverseId) : null;
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (activeUniv) {
      bgGrad.addColorStop(0, '#02050e');
      bgGrad.addColorStop(0.4, `${activeUniv.themeColor}22`);
      bgGrad.addColorStop(1, `${activeUniv.accentColor}33`);
    } else {
      bgGrad.addColorStop(0, sector.bgColorTop);
      bgGrad.addColorStop(1, sector.bgColorBottom);
    }
    ctx.fillStyle = bgGrad;
    // Generous overscan padding (+160px on all sides): ensures corners never clip or expose black voids on shake
    ctx.fillRect(-160, -160, this.width + 320, this.height + 320);

    // 0. Deep Space Majestic Celestial Landmark (Ringed Planet, Quasar, or Event Horizon)
    if (this.state !== 'title') {
      const activeClusterId = activeUniv ? Math.min(5, Math.ceil(activeUniv.id / 4)) : sector.sectorIndex;
      const celestialPlanet = getCelestialPlanetForSector(activeClusterId);
      const pX = this.width * celestialPlanet.xRatio;
      const pY = ((this.height * celestialPlanet.yRatio + this.planetDriftY) % (this.height + 400)) - 100;
      renderCelestialPlanet(ctx, celestialPlanet, pX, pY);
    }

    // Sector-specific Ambient Celestial Backdrops (active only during in-game combat)
    if (this.state !== 'title') {
      if (sector.ambientType === 'alpha_void') {
        // Sector 1: Cyber void coordinate matrix dots and subtle horizontal scan grids
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        const gridStep = 75;
        const scrollOffset = (performance.now() * 0.02) % gridStep;
        for (let y = scrollOffset; y < this.height; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(this.width, y);
          ctx.stroke();
        }
        ctx.restore();
      } else if (sector.ambientType === 'cryo_ice') {
        // Sector 2: Drifting crystalline ice asteroids with faceted polygon geometry
        for (const ast of this.floatingAsteroids) {
          ctx.save();
          ctx.translate(ast.x, ast.y);
          ctx.rotate(ast.rot);

          ctx.fillStyle = 'rgba(14, 116, 144, 0.25)';
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ast.points.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Inner crystalline highlight
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ast.points[0]?.x * 0.5 || 0, ast.points[0]?.y * 0.5 || 0);
          ctx.lineTo(ast.points[2]?.x * 0.5 || 0, ast.points[2]?.y * 0.5 || 0);
          ctx.stroke();

          ctx.restore();
        }
      } else if (sector.ambientType === 'solar_flare') {
        // Sector 3: Giant coronal loop & incandescent floating embers
        ctx.save();
        ctx.beginPath();
        ctx.arc(-80, this.height * 0.45, 280, -Math.PI / 3, Math.PI / 3);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.22)';
        ctx.lineWidth = 45;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(254, 215, 170, 0.45)';
        ctx.lineWidth = 6;
        ctx.stroke();

        for (const ember of this.solarEmbers) {
          ctx.fillStyle = ember.color;
          ctx.globalAlpha = ember.alpha;
          ctx.beginPath();
          ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (sector.ambientType === 'black_hole') {
        // Sector 4: Graviton Singularity Event Horizon & glowing accretion rings
        ctx.save();
        const bhX = this.width * 0.5;
        const bhY = this.height * 0.28;

        ctx.translate(bhX, bhY);
        ctx.rotate(this.blackHoleRotation);
        for (let r = 0; r < 4; r++) {
          const ringRad = 70 + r * 22;
          ctx.beginPath();
          ctx.ellipse(0, 0, ringRad, ringRad * 0.45, 0, 0, Math.PI * 2);
          ctx.strokeStyle = r % 2 === 0 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(192, 132, 252, 0.3)';
          ctx.lineWidth = 4 - r * 0.6;
          ctx.stroke();
        }

        // Pure Void core (event horizon)
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.fillStyle = '#05020a';
        ctx.fill();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      } else if (sector.ambientType === 'olympus_core') {
        // Sector 5: Golden Aurora Borealis ribbons waving across the sky
        ctx.save();
        for (let layer = 0; layer < 3; layer++) {
          ctx.beginPath();
          const baseOffset = layer * 90;
          ctx.moveTo(0, 120 + baseOffset);
          for (let x = 0; x <= this.width; x += 30) {
            const y =
              120 +
              baseOffset +
              Math.sin(x * 0.008 + this.auroraPhase + layer) * 45 +
              Math.cos(x * 0.015 - this.auroraPhase * 0.5) * 20;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle =
            layer === 0
              ? 'rgba(251, 191, 36, 0.22)'
              : layer === 1
              ? 'rgba(168, 85, 247, 0.18)'
              : 'rgba(56, 189, 248, 0.16)';
          ctx.lineWidth = 32;
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 1. Draw Clouds / Volumetric Sector Nebulae (with rich color stops)
    for (const cloud of this.clouds) {
      const grad = ctx.createRadialGradient(cloud.x, cloud.y, 10, cloud.x, cloud.y, cloud.size);
      grad.addColorStop(0, sector.nebulaPrimary);
      grad.addColorStop(0.65, sector.nebulaSecondary);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1.5 Cosmic Dust Particle Effect ("Bụi vũ trụ" chuyển động chậm trong nền)
    if (this.cosmicDust) {
      renderCosmicDust(ctx, this.cosmicDust);
    }

    // 2. Draw Multi-depth Starfield (with Hyperspace Warp Streaks and Diffraction Flares)
    const isWarp = this.state !== 'title' && this.warpJumpTimer > 0;
    for (const star of this.stars) {
      const starColor = star.color || sector.starColor;
      if (isWarp) {
        ctx.strokeStyle = starColor;
        ctx.lineWidth = star.size * 1.8;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x, star.y - star.speed * 0.6);
        ctx.stroke();
      } else {
        if (star.hasFlare) {
          renderDiffractionSpike(ctx, star.x, star.y, star.size * 1.4, starColor, star.brightness);
        } else if (star.depth && star.depth > 0.75) {
          ctx.fillStyle = starColor;
          ctx.globalAlpha = star.brightness;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = starColor;
          ctx.globalAlpha = star.brightness;
          ctx.fillRect(star.x, star.y, star.size, star.size);
        }
      }
    }
    ctx.globalAlpha = 1.0;

    // 3. Supersonic Space Flight Filaments (Stardust speed lines)
    if (this.state !== 'title') {
      for (const fil of this.filaments) {
        ctx.save();
        ctx.globalAlpha = fil.alpha * (isWarp ? 2.0 : 1.0);
        ctx.strokeStyle = fil.color;
        ctx.lineWidth = isWarp ? 2.5 : 1.2;
        ctx.beginPath();
        ctx.moveTo(fil.x, fil.y);
        ctx.lineTo(fil.x, fil.y + fil.length * (isWarp ? 3.5 : 1.0));
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. Warp Tunnel Flash FX during hyperspace jump
    if (isWarp) {
      ctx.save();
      const cx = this.width / 2;
      const cy = this.height / 2;
      const warpGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, this.width * 0.85);
      warpGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      warpGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.28)');
      warpGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.15)');
      warpGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = warpGrad;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    // 3 - 7: Combat Entities (Active only during in-game battle, NOT on peaceful Title Screen)
    if (this.state !== 'title') {
      // 3. Draw Shockwaves
      for (const sw of this.shockwaves) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = sw.alpha;
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Telegraph Warning Lines for Enemies
      for (const e of this.enemies) {
        if (e.telegraphTimer > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + 20);
          ctx.lineTo(e.telegraphAimX, e.telegraphAimY);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 5. Draw Pickups & Gift Boxes
      for (const pk of this.pickups) {
        ctx.save();
        ctx.translate(pk.x, pk.y);

        if (pk.type === 'laser_box' || pk.type === 'lightning_box') {
          const isLaser = pk.type === 'laser_box';
          const boxSize = 26;
          const half = boxSize / 2;
          const pulse = Math.sin(performance.now() * 0.007 + pk.bobOffset) * 0.15 + 1.0;

          // Outer radiant aura ring
          ctx.beginPath();
          ctx.arc(0, 0, (pk.radius + 6) * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = isLaser ? 'rgba(244, 63, 94, 0.45)' : 'rgba(6, 182, 212, 0.45)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.rotate(Math.sin(performance.now() * 0.003 + pk.bobOffset) * 0.12);

          // Box base (high-tech cube container)
          ctx.fillStyle = isLaser ? '#4c0519' : '#083344';
          ctx.strokeStyle = pk.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(-half, -half, boxSize, boxSize, 4);
          } else {
            ctx.rect(-half, -half, boxSize, boxSize);
          }
          ctx.fill();
          ctx.stroke();

          // Cross ribbon bands (Ruy-băng gói quà)
          ctx.fillStyle = isLaser ? '#f43f5e' : '#38bdf8';
          // Vertical band
          ctx.fillRect(-3, -half, 6, boxSize);
          // Horizontal band
          ctx.fillRect(-half, -3, boxSize, 6);

          // Ribbon bow / knot on top of gift box
          ctx.beginPath();
          ctx.ellipse(-4, -half - 2, 4, 3, -Math.PI / 6, 0, Math.PI * 2);
          ctx.ellipse(4, -half - 2, 4, 3, Math.PI / 6, 0, Math.PI * 2);
          ctx.fillStyle = isLaser ? '#fda4af' : '#a5f3fc';
          ctx.fill();

          // Central glowing power symbol
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px "Orbitron", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pk.icon, 0, 0);

          // Floating label badge below box
          ctx.font = 'bold 9px "Chakra Petch", sans-serif';
          ctx.fillStyle = pk.color;
          ctx.fillText(pk.label, 0, half + 10);
        } else if (pk.type === 'drumstick') {
          drawDrumstickPickup(ctx, pk);
        } else {
          // Standard circular pickups (Weapon, Shield, Bomb, Coin)
          ctx.rotate(pk.angle);

          // Glow halo
          ctx.beginPath();
          ctx.arc(0, 0, pk.radius + 3, 0, Math.PI * 2);
          ctx.fillStyle = `${pk.color}33`;
          ctx.fill();

          // Core socket
          ctx.beginPath();
          ctx.arc(0, 0, pk.radius, 0, Math.PI * 2);
          ctx.fillStyle = pk.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Icon text
          ctx.fillStyle = '#050b14';
          ctx.font = 'bold 12px Orbitron, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pk.icon, 0, 1);
        }
        ctx.restore();
      }

      // 5.5 Draw Active Lightning Arcs
      for (const arc of this.lightningArcs) {
        const alpha = arc.life / arc.maxLife;
        ctx.save();
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = 3.5;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (const seg of arc.segments) {
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();

        // Inner intense white core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 6. Draw Enemies
      for (const e of this.enemies) {
        this.drawEnemy(e);
      }

      // 7. Draw Bullets
      for (const b of this.bullets) {
        this.drawBullet(b);
      }

      // 7.4 Draw Super Hard Boss Mega Gamma Beam (Charging Telegraph or Firing Colossal Beam)
      if (this.bossMegaBeamChargingTimer > 0) {
        ctx.save();
        const beamX = this.bossMegaBeamX;
        const progress = Math.max(0, 1 - this.bossMegaBeamChargingTimer / 1.4);
        const warningW = 70 + progress * 55;

        // Warning target column with pulsing emerald-cyan Gamma radiation
        const pulse = 0.15 + Math.sin(performance.now() * 0.025) * 0.1;
        ctx.fillStyle = `rgba(16, 185, 129, ${pulse})`;
        ctx.fillRect(beamX - warningW / 2, 0, warningW, this.height);

        // Dashed boundary warning lines in radiant emerald
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(beamX - warningW / 2, 0);
        ctx.lineTo(beamX - warningW / 2, this.height);
        ctx.moveTo(beamX + warningW / 2, 0);
        ctx.lineTo(beamX + warningW / 2, this.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Central tracking laser guideline ("Gè" theo máy bay)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(beamX, 0);
        ctx.lineTo(beamX, this.height);
        ctx.stroke();

        // Crosshair reticle at player's vertical elevation
        const pY = this.player.y;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.strokeRect(beamX - 18, pY - 18, 36, 36);

        // Danger exclamation marker
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 14px "Orbitron", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☢ CẢNH BÁO: GÈ TIA GAMMA LỚN ☢', beamX, this.height * 0.52);
        ctx.font = 'bold 11px "Chakra Petch", sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText('ĐANG KHÓA TỌA ĐỘ MÁY BAY CHÍNH...', beamX, this.height * 0.52 + 20);
        ctx.restore();
      }

      if (this.bossMegaBeamFiringTimer > 0) {
        ctx.save();
        const beamX = this.bossMegaBeamX;
        const beamW = this.bossMegaBeamWidth || 125;
        const now = performance.now();

        // 1. Massive outer chromatic shock glow (Emerald & Cyan Gamma radiation)
        const glowPulse = 1.0 + Math.sin(now * 0.035) * 0.15;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.38)';
        ctx.fillRect(beamX - (beamW * 1.45 * glowPulse) / 2, 0, beamW * 1.45 * glowPulse, this.height);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.28)';
        ctx.fillRect(beamX - (beamW * 1.25 * glowPulse) / 2, 0, beamW * 1.25 * glowPulse, this.height);

        // 2. High-energy Gamma plasma beam column
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.fillRect(beamX - beamW / 2, 0, beamW, this.height);

        // 3. Piercing ultraviolet & radiant green mid-layer
        ctx.fillStyle = 'rgba(52, 211, 153, 0.9)';
        ctx.fillRect(beamX - (beamW * 0.65) / 2, 0, beamW * 0.65, this.height);

        // 4. Searing white-hot core beam
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(beamX - (beamW * 0.35) / 2, 0, beamW * 0.35, this.height);

        // 5. Electric discharge ionizing arcs running through the beam
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        for (let a = 0; a < 9; a++) {
          const arcY = (now * 0.9 + a * 95) % this.height;
          ctx.beginPath();
          ctx.moveTo(beamX - beamW * 0.45, arcY);
          ctx.lineTo(beamX + (Math.random() - 0.5) * 50, arcY + 22);
          ctx.lineTo(beamX + beamW * 0.45, arcY + 45);
          ctx.stroke();
        }

        // 6. Muzzle blast shockwave ring at boss cannon
        const boss = this.enemies.find((e) => e.type === 'boss');
        if (boss) {
          ctx.beginPath();
          ctx.arc(beamX, boss.y + 35, 45 + Math.sin(now * 0.04) * 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fill();
        }
        ctx.restore();
      }

      // 7.41 Draw Boss Rush Afterimages (Trail while rushing/gè)
      for (const img of this.bossRushAfterimages) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, img.alpha * 0.45));
        ctx.translate(img.x, img.y);
        ctx.fillStyle = img.color || '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7.42 Draw Boss Rush Charging Telegraph Line & Warning
      if (this.bossRushState === 'charging') {
        const boss = this.enemies.find((e) => e.type === 'boss');
        if (boss) {
          ctx.save();
          const pulse = 1.0 + Math.sin(performance.now() * 0.02) * 0.2;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(boss.x, boss.y, (boss.radius + 15) * pulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([10, 6]);
          ctx.beginPath();
          ctx.moveTo(boss.x, boss.y);
          ctx.lineTo(this.player.x, this.player.y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 13px "Orbitron", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠ CẢNH BÁO: BOSS TỤ LỰC GÈ THEO HƯỚNG MÁY BAY ⚠', boss.x, boss.y - 55);
          ctx.restore();
        }
      }

      // 7.43 Draw Boss Escort Laser Drones & Laser Beams
      for (const d of this.bossEscortDrones) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.fillStyle = d.hitFlashTimer > 0 ? '#ffffff' : '#1e293b';

        // Drone metallic chassis
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Thruster wings
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-22, -4, 8, 8);
        ctx.fillRect(14, -4, 8, 8);

        // Core eye
        ctx.fillStyle = d.laserFireTimer > 0 ? '#ef4444' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Mini HP bar
        const dBarW = 28;
        const dHpPct = Math.max(0, d.hp / d.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(-dBarW / 2, -22, dBarW, 3);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(-dBarW / 2, -22, dBarW * dHpPct, 3);
        ctx.restore();

        // Draw Drone Telegraph Warning Laser Line
        if (d.laserChargeTimer > 0) {
          ctx.save();
          const targetAng = Math.atan2(d.aimY - d.y, d.aimX - d.x);
          const endX = d.x + Math.cos(targetAng) * 900;
          const endY = d.y + Math.sin(targetAng) * 900;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + Math.sin(performance.now() * 0.02) * 0.3})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          ctx.restore();
        }

        // Draw Drone Lethal Laser Beam
        if (d.laserFireTimer > 0) {
          ctx.save();
          const targetAng = Math.atan2(d.aimY - d.y, d.aimX - d.x);
          const endX = d.x + Math.cos(targetAng) * 1100;
          const endY = d.y + Math.sin(targetAng) * 1100;

          // Outer bloom
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Core intense beam
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Plasma energy line
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          ctx.restore();
        }
      }

      // 7.5 Draw Arc Tempest Straight Laser Beam along aircraft heading (strictly straight vertical, tracking player)
      if (this.currentFighter.id === 'arc_tempest' && (this.state === 'playing' || this.state === 'paused')) {
        const p = this.player;
        const trajectory = calculateLaserBeamTrajectory(p.x, p.y, 0, this.height, 34);
        const { startX, startY, endX, endY, dirX, dirY, beamLength } = trajectory;
        const isRoyalGold =
          this.activeCosmeticSkinId === 'skin_lx88_royal_gold' ||
          this.activeCosmeticSkinId === 'skin_golden_sovereign';
        const isVampire = this.activeCosmeticSkinId === 'skin_lx88_vampire';

        ctx.save();
        // Outer pulsing aura
        const pulse = 1.0 + Math.sin(performance.now() * 0.015) * 0.15;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        if (isVampire) {
          ctx.strokeStyle = p.isSkillActive ? 'rgba(225, 29, 72, 0.85)' : 'rgba(190, 18, 60, 0.55)';
        } else if (isRoyalGold) {
          ctx.strokeStyle = p.isSkillActive ? 'rgba(251, 191, 36, 0.65)' : 'rgba(245, 158, 11, 0.45)';
        } else {
          ctx.strokeStyle = p.isSkillActive ? 'rgba(56, 189, 248, 0.45)' : 'rgba(0, 242, 254, 0.35)';
        }
        ctx.lineWidth = (p.isSkillActive ? 32 : 24) * pulse;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Mid beam
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        if (isVampire) {
          ctx.strokeStyle = p.isSkillActive ? '#f43f5e' : '#e11d48';
        } else if (isRoyalGold) {
          ctx.strokeStyle = p.isSkillActive ? '#fbbf24' : '#f59e0b';
        } else {
          ctx.strokeStyle = p.isSkillActive ? '#38bdf8' : '#00f2fe';
        }
        ctx.lineWidth = p.isSkillActive ? 14 : 10;
        ctx.stroke();

        // Inner searing core
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = isVampire ? '#ffe4e6' : isRoyalGold ? '#fffbeb' : '#ffffff';
        ctx.lineWidth = p.isSkillActive ? 6 : 4;
        ctx.stroke();

        // High-tech muzzle flare at fighter nose
        const flareRadius = p.isSkillActive ? 26 : 18;
        const flareGrad = ctx.createRadialGradient(startX, startY, 0, startX, startY, flareRadius);
        if (isVampire) {
          flareGrad.addColorStop(0, '#ffffff');
          flareGrad.addColorStop(0.35, '#fda4af');
          flareGrad.addColorStop(0.7, p.isSkillActive ? '#f43f5e' : '#be123c');
          flareGrad.addColorStop(1, 'rgba(136, 19, 55, 0)');
        } else if (isRoyalGold) {
          flareGrad.addColorStop(0, '#ffffff');
          flareGrad.addColorStop(0.35, '#fef08a');
          flareGrad.addColorStop(0.7, p.isSkillActive ? '#f59e0b' : '#d97706');
          flareGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
        } else {
          flareGrad.addColorStop(0, '#ffffff');
          flareGrad.addColorStop(0.4, p.isSkillActive ? '#38bdf8' : '#00f2fe');
          flareGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');
        }
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(startX, startY, flareRadius, 0, Math.PI * 2);
        ctx.fill();

        const now = performance.now();
        const perpX = -dirY;
        const perpY = dirX;

        // VAMPIRE EXCLUSIVE: Zigzagging Red Fluid Tendrils ("Thủy đỏ bay zick zack dọc theo tia laser")
        if (isVampire) {
          ctx.save();
          // Draw dual spiraling blood tendrils snaking up the beam
          [-1, 1].forEach((side, streamIdx) => {
            ctx.beginPath();
            const segments = 16;
            for (let s = 0; s <= segments; s++) {
              const tNorm = s / segments;
              const by = startY + (endY - startY) * tNorm;
              // Zigzagging sinusoid along the straight beam
              const zigOffset = Math.sin(tNorm * Math.PI * 6 - now * 0.012 + streamIdx * Math.PI) * (14 + (p.isSkillActive ? 8 : 4));
              const bx = startX + zigOffset * side;
              if (s === 0) ctx.moveTo(bx, by);
              else ctx.lineTo(bx, by);
            }
            ctx.strokeStyle = streamIdx === 0 ? 'rgba(244, 63, 94, 0.9)' : 'rgba(225, 29, 72, 0.85)';
            ctx.lineWidth = p.isSkillActive ? 3.2 : 2.2;
            ctx.stroke();

            // Core white-hot blood thread
            ctx.strokeStyle = '#ffe4e6';
            ctx.lineWidth = 1.0;
            ctx.stroke();

            // Blood droplets traveling along the zigzag beam
            for (let d = 0; d < 3; d++) {
              const dProgress = ((now * 0.0015 + d / 3 + streamIdx * 0.25) % 1);
              const dy = startY + (endY - startY) * dProgress;
              const dx = startX + Math.sin(dProgress * Math.PI * 6 - now * 0.012 + streamIdx * Math.PI) * (14 + (p.isSkillActive ? 8 : 4)) * side;
              ctx.fillStyle = '#f43f5e';
              ctx.beginPath();
              ctx.arc(dx, dy, 2.8, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          ctx.restore();
        } else if (isRoyalGold) {
          // ROYAL GOLD EXCLUSIVE: Orbiting Diamond Starburst Rings along beam
          ctx.save();
          for (let k = 0; k < 5; k++) {
            const tRing = (k / 5 + (now * 0.0018) % 1) % 1;
            const ry = startY + (endY - startY) * tRing;
            const rPulse = 12 + Math.sin(now * 0.01 + k) * 4;

            // Diamond flare ring
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.ellipse(startX, ry, rPulse, rPulse * 0.35, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Faceted diamond sparkles at the edges of the ring
            [-1, 1].forEach((dSide) => {
              const dX = startX + dSide * rPulse;
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(dX - 1.5, ry - 1.5, 3, 3);
            });
          }
          ctx.restore();
        }

        // Searing electric lightning arcs dancing along the straight beam
        for (let k = 0; k < 6; k++) {
          const t1 = (k / 6 + (now * 0.003) % 1) % 1;
          const lx = startX + dirX * (beamLength * t1);
          const ly = startY + dirY * (beamLength * t1);
          const jitter = Math.sin(now * 0.02 + k * 2.3) * (p.isSkillActive ? 14 : 9);
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + perpX * jitter, ly + perpY * jitter);
          ctx.strokeStyle = isVampire
            ? (p.isSkillActive ? '#fda4af' : '#fb7185')
            : isRoyalGold
            ? (p.isSkillActive ? '#fef08a' : '#fde047')
            : (p.isSkillActive ? '#bae6fd' : '#e0f2fe');
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 7.6 Draw RTS-88 Lightning Bolt & Chain Arcs
      if (
        this.currentFighter.id === 'rts_88' &&
        this.rts88ActiveLightning &&
        performance.now() < this.rts88ActiveLightning.expireTime &&
        (this.state === 'playing' || this.state === 'paused')
      ) {
        this.drawRts88LightningBolts();
      }
    }

    // 8. Draw Player Fighter & Escort Drones (if active or title screen demo)
    if (this.state === 'playing' || this.state === 'paused' || this.state === 'title') {
      this.drawPlayerFighter();
      this.drawDrones();
    }

    // 9. Draw Zero-GC Particle Pool
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particlePool[i];
      if (p.active) {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        if (p.shape === 'spark') {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 2);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // 9.5 & 10: In-Combat Floating Text & Sector Transition Banner (Active only during battle)
    if (this.state !== 'title') {
      // 9.5 Draw Floating Damage Numbers
      for (const dt of this.damageTexts) {
        const alpha = Math.min(1.0, dt.life / (dt.maxLife * 0.35));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = dt.color;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = dt.isCrit ? 4 : 2.5;
        ctx.font = `900 ${dt.fontSize}px 'Orbitron', 'Chakra Petch', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(dt.text, dt.x, dt.y);
        ctx.fillText(dt.text, dt.x, dt.y);
        ctx.restore();
      }

      // 10. Draw Hyperspace Sector Banner Overlay during sector transition
      if (this.sectorBannerTimer > 0) {
        const alpha = Math.min(1.0, this.sectorBannerTimer / 0.8);
        ctx.save();
        ctx.globalAlpha = alpha;
        const centerY = this.height * 0.32;

        const bannerW = Math.min(this.width - 40, 520);
        const bannerH = 88;
        const bannerX = (this.width - bannerW) / 2;
        const bannerY = centerY - bannerH / 2;

        // Dark futuristic glass container
        ctx.fillStyle = 'rgba(5, 11, 20, 0.90)';
        ctx.strokeStyle = sector.accentColor;
        ctx.lineWidth = 2;
        if (typeof ctx.roundRect === 'function') {
          ctx.beginPath();
          ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 12);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
          ctx.strokeRect(bannerX, bannerY, bannerW, bannerH);
        }

        // Glowing corner brackets
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        [-1, 1].forEach((dirX) => {
          const cx = dirX === -1 ? bannerX + 4 : bannerX + bannerW - 4;
          ctx.beginPath();
          ctx.moveTo(cx, bannerY + 12);
          ctx.lineTo(cx, bannerY + 4);
          ctx.lineTo(cx - dirX * 8, bannerY + 4);
          ctx.stroke();
        });

        // Header Tagline
        ctx.fillStyle = sector.accentColor;
        ctx.font = '700 12px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `BƯỚC NHẢY KHÔNG GIAN · KHU VỰC 0${sector.sectorIndex}`,
          this.width / 2,
          centerY - 20
        );

        // Sector Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 18px "Chakra Petch", sans-serif';
        ctx.fillText(sector.vietnameseName.toUpperCase(), this.width / 2, centerY + 3);

        // Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 12px "Chakra Petch", sans-serif';
        ctx.fillText(sector.subtitle, this.width / 2, centerY + 24);

        ctx.restore();
      }
    }


    ctx.restore();
  }

  private renderFreeFlightGalaxy(ctx: CanvasRenderingContext2D) {
    const ff = this.freeFlightState;
    const theme = GALAXY_THEMES[ff.themeIndex] || GALAXY_THEMES[0];
    const camX = ff.x - this.width / 2;
    const camY = ff.y - this.height / 2;
    const now = performance.now();

    // 1. Deep Space Cosmic Backdrop Radial Gradient
    const bgGrad = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      50,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.95
    );
    bgGrad.addColorStop(0, theme.bgGradMid);
    bgGrad.addColorStop(1, theme.bgGradStart);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Parallax Multi-Layer Starfield
    for (let i = 0; i < 200; i++) {
      const starSeedX = (i * 359.13) % GALAXY_WORLD_WIDTH;
      const starSeedY = (i * 491.77) % GALAXY_WORLD_HEIGHT;
      const depth = 0.2 + ((i % 5) / 4) * 0.8; // 0.2 to 1.0

      const sx = (((starSeedX - camX * depth) % this.width) + this.width) % this.width;
      const sy = (((starSeedY - camY * depth) % this.height) + this.height) % this.height;
      const size = depth < 0.4 ? 1.0 : depth < 0.8 ? 1.8 : 2.8;

      ctx.fillStyle = theme.starColors[i % theme.starColors.length];
      ctx.globalAlpha = 0.3 + depth * 0.7;
      ctx.fillRect(sx, sy, size, size);

      if (depth > 0.8 && i % 8 === 0) {
        // Subtle flare
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(sx - 3, sy, 7, 1);
        ctx.fillRect(sx, sy - 3, 1, 7);
      }
    }
    ctx.globalAlpha = 1.0;

    // 3. Render Grand Celestial Landmarks in World Coordinates
    for (const lm of CELESTIAL_LANDMARKS) {
      const lmScreenX = lm.x - camX;
      const lmScreenY = lm.y - camY;

      // Viewport culling with generous buffer
      if (
        lmScreenX >= -lm.radius * 1.5 &&
        lmScreenX <= this.width + lm.radius * 1.5 &&
        lmScreenY >= -lm.radius * 1.5 &&
        lmScreenY <= this.height + lm.radius * 1.5
      ) {
        ctx.save();
        ctx.translate(lmScreenX, lmScreenY);

        // Radiant celestial glow
        const glow = ctx.createRadialGradient(0, 0, 20, 0, 0, lm.radius);
        glow.addColorStop(0, `${lm.themeColor}55`);
        glow.addColorStop(0.5, `${lm.accentColor}25`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, lm.radius, 0, Math.PI * 2);
        ctx.fill();

        if (lm.id === 'galactic_core') {
          // Swirling 4-Arm Spiral Galaxy Core
          const spin = now * 0.0003;
          ctx.rotate(spin);
          for (let arm = 0; arm < 4; arm++) {
            const armAngle = (arm * Math.PI) / 2;
            ctx.beginPath();
            for (let r = 25; r < lm.radius * 0.85; r += 12) {
              const theta = armAngle + r / 45;
              const ax = Math.cos(theta) * r;
              const ay = Math.sin(theta) * r;
              if (r === 25) ctx.moveTo(ax, ay);
              else ctx.lineTo(ax, ay);
            }
            ctx.strokeStyle = arm % 2 === 0 ? 'rgba(56, 189, 248, 0.55)' : 'rgba(234, 179, 8, 0.45)';
            ctx.lineWidth = 16;
            ctx.stroke();
          }

          // Blazing Quasar Core
          ctx.beginPath();
          ctx.arc(0, 0, 70, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 0, 52, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (lm.id === 'saturn_prime') {
          // Giant Ringed Gas Giant
          ctx.save();
          ctx.rotate(-0.35);
          ctx.beginPath();
          ctx.ellipse(0, 0, 210, 60, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
          ctx.lineWidth = 22;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(254, 243, 199, 0.5)';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Planet Body
          const pGrad = ctx.createRadialGradient(-20, -20, 10, 0, 0, 85);
          pGrad.addColorStop(0, '#fef08a');
          pGrad.addColorStop(0.7, '#d97706');
          pGrad.addColorStop(1, '#451a03');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 85, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (lm.id === 'pillars_of_creation') {
          // Emerald-Gold Nebular Pillars
          for (let pIdx = -1; pIdx <= 1; pIdx++) {
            const px = pIdx * 70;
            const pGrad = ctx.createLinearGradient(px, -180, px, 180);
            pGrad.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
            pGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.4)');
            pGrad.addColorStop(1, 'rgba(5, 150, 105, 0.1)');
            ctx.fillStyle = pGrad;
            ctx.fillRect(px - 30, -160, 60, 320);
          }
        } else if (lm.id === 'aurora_veil') {
          // Translucent undulating aurora curtains
          for (let layer = 0; layer < 4; layer++) {
            ctx.beginPath();
            const phase = now * 0.0015 + layer;
            ctx.moveTo(-lm.radius * 0.8, -80 + layer * 40);
            for (let x = -lm.radius * 0.8; x <= lm.radius * 0.8; x += 25) {
              const y = -80 + layer * 40 + Math.sin(x * 0.015 + phase) * 35;
              ctx.lineTo(x, y);
            }
            ctx.strokeStyle =
              layer % 2 === 0 ? 'rgba(236, 72, 153, 0.45)' : 'rgba(168, 85, 247, 0.45)';
            ctx.lineWidth = 28;
            ctx.stroke();
          }
        } else if (lm.id === 'binary_pulsar') {
          // Rotating binary pair
          const bSpin = now * 0.002;
          const pDist = 75;
          [-1, 1].forEach((dir, i) => {
            const bx = Math.cos(bSpin + i * Math.PI) * pDist;
            const by = Math.sin(bSpin + i * Math.PI) * pDist;
            ctx.beginPath();
            ctx.arc(bx, by, 32, 0, Math.PI * 2);
            ctx.fillStyle = dir === 1 ? 'rgba(6, 182, 212, 0.3)' : 'rgba(244, 63, 94, 0.3)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(bx, by, 24, 0, Math.PI * 2);
            ctx.fillStyle = dir === 1 ? '#06b6d4' : '#f43f5e';
            ctx.fill();
          });
        } else if (lm.id === 'ancient_station') {
          // Geometric Station
          ctx.rotate(now * 0.0006);
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 4;
          ctx.strokeRect(-60, -60, 120, 120);
          ctx.beginPath();
          ctx.arc(0, 0, 45, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Holographic landmark proximity plaque
        const distToShip = Math.hypot(lm.x - ff.x, lm.y - ff.y);
        if (distToShip < lm.radius + 350 && !ff.isPhotoMode) {
          ctx.fillStyle = 'rgba(5, 11, 20, 0.90)';
          ctx.strokeStyle = lm.themeColor;
          ctx.lineWidth = 1.5;
          const labelW = 280;
          const labelH = 52;
          const labelY = lm.radius * 0.65;
          if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(-labelW / 2, labelY, labelW, labelH, 10);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillRect(-labelW / 2, labelY, labelW, labelH);
            ctx.strokeRect(-labelW / 2, labelY, labelW, labelH);
          }

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 13px "Chakra Petch", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${lm.icon} ${lm.name}`, 0, labelY + 18);

          ctx.fillStyle = lm.themeColor;
          ctx.font = '600 11px "Chakra Petch", sans-serif';
          ctx.fillText(`${lm.title} · ${Math.round(distToShip)} ly`, 0, labelY + 36);
        }

        ctx.restore();
      }
    }

    // 4. Boost Warp Speed Streaks
    if (ff.isBoosting) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 40; i++) {
        const ang = (i * Math.PI * 2) / 40 + (now * 0.005) % 0.2;
        const rad1 = 60 + ((i * 19) % 80);
        const rad2 = rad1 + 100 + ((i * 31) % 150);
        ctx.beginPath();
        ctx.moveTo(this.width / 2 + Math.cos(ang) * rad1, this.height / 2 + Math.sin(ang) * rad1);
        ctx.lineTo(this.width / 2 + Math.cos(ang) * rad2, this.height / 2 + Math.sin(ang) * rad2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Render Player's Fighter Center Screen with Rotation
    this.player.x = this.width / 2;
    this.player.y = this.height / 2;
    this.player.tilt = ff.angle;
    this.drawPlayerFighter();

    // 6. Navigation radar & direction arrows to offscreen landmarks
    if (!ff.isPhotoMode) {
      // Subtle circular reticle
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height / 2, 85, 0, Math.PI * 2);
      ctx.stroke();

      for (const lm of CELESTIAL_LANDMARKS) {
        const dx = lm.x - ff.x;
        const dy = lm.y - ff.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 350) {
          const ang = Math.atan2(dy, dx);
          const edgeR = Math.min(this.width, this.height) * 0.42;
          const px = this.width / 2 + Math.cos(ang) * edgeR;
          const py = this.height / 2 + Math.sin(ang) * edgeR;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(ang);
          ctx.fillStyle = lm.themeColor;
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(-6, -6);
          ctx.lineTo(-3, 0);
          ctx.lineTo(-6, 6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }
  }

  private drawRts88LightningBolts() {
    if (!this.rts88ActiveLightning || !this.rts88ActiveLightning.bolts.length) return;
    const ctx = this.ctx;
    const p = this.player;
    const isShieldActive = p.isSkillActive && this.rts88ShieldHp > 0;
    const isArkOne = this.activeCosmeticSkinId === 'skin_rts88_ark_one';
    const isNeonViolet = this.activeCosmeticSkinId === 'skin_rts88_neon_violet';
    const now = performance.now();

    ctx.save();
    for (const bolt of this.rts88ActiveLightning.bolts) {
      const { startX, startY, endX, endY, isChain } = bolt;
      const dx = endX - startX;
      const dy = endY - startY;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) continue;

      // Fine segments with controlled convergence envelope
      const segments = Math.max(8, Math.min(24, Math.floor(dist / 12)));
      const points: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
      const subPoints: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];

      const nx = -dy / dist;
      const ny = dx / dist;

      for (let s = 1; s < segments; s++) {
        const ratio = s / segments;
        const basePx = startX + dx * ratio;
        const basePy = startY + dy * ratio;
        // Smooth sine envelope so the bolt converges tightly to 0 jitter at emitter and target
        const envelope = Math.sin(ratio * Math.PI);

        // Kamen Rider Ark-One: Tia sấm sét đỏ đen ác quỷ và uốn cong
        // Powerful sinister whip arc that curves dramatically through space
        const curveDir = Math.sin(now * 0.007 + (startX % 7)) > 0 ? 1 : -1;
        const arkCurve = isArkOne
          ? Math.sin(ratio * Math.PI) * (curveDir * 26 + Math.sin(now * 0.024 + s * 1.5) * 12)
          : 0;

        const wave = Math.sin(now * 0.05 + s * 3.8);
        const seed = (wave * (isChain ? 3.5 : 5.0) + arkCurve) * envelope;
        const subSeed = (-wave * (isChain ? 2.5 : 3.8) + arkCurve * 0.75) * envelope;

        points.push({
          x: basePx + nx * seed,
          y: basePy + ny * seed,
        });

        subPoints.push({
          x: basePx + nx * subSeed,
          y: basePy + ny * subSeed,
        });
      }
      points.push({ x: endX, y: endY });
      subPoints.push({ x: endX, y: endY });

      // -------------------------------------------------------------
      // PASS 1: Broad Radiant Outer Halo Glow (Red-Black Malice / Neon Violet / Golden Shield)
      // -------------------------------------------------------------
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let s = 1; s < points.length; s++) {
        ctx.lineTo(points[s].x, points[s].y);
      }
      ctx.strokeStyle = isArkOne
        ? 'rgba(255, 0, 51, 0.55)'
        : isNeonViolet
        ? 'rgba(168, 85, 247, 0.45)'
        : isShieldActive
        ? 'rgba(250, 204, 21, 0.55)'
        : isChain
        ? 'rgba(2, 132, 199, 0.45)'
        : 'rgba(0, 180, 255, 0.55)';
      ctx.lineWidth = isArkOne ? (isChain ? 18 : 28) : isShieldActive ? (isChain ? 16 : 24) : (isChain ? 10 : 18);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'bevel';
      ctx.stroke();

      // -------------------------------------------------------------
      // PASS 2: Outer Plasma Sheath (Searing Blood Red Plasma / Electric Blue)
      // -------------------------------------------------------------
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let s = 1; s < points.length; s++) {
        ctx.lineTo(points[s].x, points[s].y);
      }
      ctx.strokeStyle = isArkOne
        ? '#ff0033'
        : isNeonViolet
        ? '#c084fc'
        : isShieldActive
        ? '#facc15'
        : isChain
        ? '#0284c7'
        : '#00e5ff';
      ctx.lineWidth = isArkOne ? (isChain ? 10 : 15) : isShieldActive ? (isChain ? 8 : 12) : (isChain ? 5 : 8.5);
      ctx.stroke();

      // -------------------------------------------------------------
      // PASS 3: Secondary Braided Micro-Filament (High-frequency Malice arc)
      // -------------------------------------------------------------
      ctx.beginPath();
      ctx.moveTo(subPoints[0].x, subPoints[0].y);
      for (let s = 1; s < subPoints.length; s++) {
        ctx.lineTo(subPoints[s].x, subPoints[s].y);
      }
      ctx.strokeStyle = isArkOne
        ? '#ff4d6d'
        : isNeonViolet
        ? '#e879f9'
        : isShieldActive
        ? '#fef08a'
        : '#67e8f9';
      ctx.lineWidth = isChain ? 1.8 : 2.8;
      ctx.stroke();

      // -------------------------------------------------------------
      // PASS 4: Malice Core (Pitch-Black Obsidian Core with Crimson Fringe)
      // -------------------------------------------------------------
      if (isArkOne) {
        // Ark-One Dark Malice Void Core
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let s = 1; s < points.length; s++) {
          ctx.lineTo(points[s].x, points[s].y);
        }
        ctx.strokeStyle = '#050508';
        ctx.lineWidth = isChain ? 3.4 : 5.0;
        ctx.stroke();

        // Inner razor-thin blood red conductor
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let s = 1; s < points.length; s++) {
          ctx.lineTo(points[s].x, points[s].y);
        }
        ctx.strokeStyle = '#ff1a40';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let s = 1; s < points.length; s++) {
          ctx.lineTo(points[s].x, points[s].y);
        }
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isShieldActive ? (isChain ? 2.8 : 3.6) : (isChain ? 1.8 : 2.6);
        ctx.stroke();
      }

      // -------------------------------------------------------------
      // PASS 5: Concentrated Convergence Points (Emitter & Target impact)
      // -------------------------------------------------------------
      const sparkRadius = isArkOne ? 18 : isShieldActive ? 16 : 12;
      const outerGlowColor = isArkOne
        ? '#ff0033'
        : isNeonViolet
        ? '#a855f7'
        : isShieldActive
        ? '#facc15'
        : '#00f0ff';
      const grad = ctx.createRadialGradient(endX, endY, 0, endX, endY, sparkRadius);
      grad.addColorStop(0, isArkOne ? '#000000' : '#ffffff');
      grad.addColorStop(0.35, isArkOne ? '#ff0033' : '#ffffff');
      grad.addColorStop(0.65, outerGlowColor);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(endX, endY, sparkRadius, 0, Math.PI * 2);
      ctx.fill();

      // Emitter nozzle plasma spark
      const emitterGrad = ctx.createRadialGradient(startX, startY, 0, startX, startY, isArkOne ? 9 : 7);
      emitterGrad.addColorStop(0, isArkOne ? '#000000' : '#ffffff');
      emitterGrad.addColorStop(0.4, isArkOne ? '#ff0033' : '#ffffff');
      emitterGrad.addColorStop(0.7, outerGlowColor);
      emitterGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = emitterGrad;
      ctx.beginPath();
      ctx.arc(startX, startY, isArkOne ? 9 : 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPlayerFighter() {
    const ctx = this.ctx;
    const p = this.player;
    const f = this.currentFighter;
    const isHitFlash = p.invulnerableTimer > 0;

    // Flash when invulnerable
    if (p.invulnerableTimer > 0 && Math.floor(performance.now() / 80) % 2 === 0) {
      // Blink
      return;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(f.id === 'arc_tempest' ? 0 : p.tilt);

    // Ghost Void Stealth Cloaking Opacity
    if (f.id === 'ghost' && p.isSkillActive) {
      ctx.globalAlpha = 0.4;
    }

    // 0. Solaris Ultimate Sunburst Solar Beam (Pillar of raw sunlight)
    if (p.solarBeamActive) {
      ctx.save();
      const beamW = 80 + Math.sin(performance.now() * 0.02) * 12;
      const beamGrad = ctx.createLinearGradient(-beamW / 2, 0, beamW / 2, 0);
      beamGrad.addColorStop(0, 'rgba(234, 179, 8, 0)');
      beamGrad.addColorStop(0.2, 'rgba(234, 179, 8, 0.6)');
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      beamGrad.addColorStop(0.8, 'rgba(234, 179, 8, 0.6)');
      beamGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(-beamW / 2, -this.height, beamW, this.height);
      ctx.restore();
    }

    // 0.5 Mirage Holographic Phantom Wingmen
    if (p.phantomWingmenActive) {
      [-45, 45].forEach((ox) => {
        ctx.save();
        ctx.translate(ox, 10);
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = '#ec4899';
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(14, 10);
        ctx.lineTo(0, 5);
        ctx.lineTo(-14, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }

    // 1. Drones Escort
    if (p.dronesCount > 0) {
      const offsets = p.dronesCount === 1 ? [-30] : [-32, 32];
      offsets.forEach((ox) => {
        ctx.save();
        ctx.translate(ox, 4);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(7, 8);
        ctx.lineTo(0, 5);
        ctx.lineTo(-7, 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
    }

    const now = performance.now();

    // 1.5 Pulsing Hull Plasma Aura
    const auraPulse = Math.sin(now * 0.006) * 4;
    const auraGrad = ctx.createRadialGradient(0, 4, 10, 0, 4, 38 + auraPulse);
    auraGrad.addColorStop(0, `${f.accentColor}35`);
    auraGrad.addColorStop(0.6, `${f.color}18`);
    auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 4, 38 + auraPulse, 0, Math.PI * 2);
    ctx.fill();

    // 1.6 7-Day Streak Exclusive Cosmetic Skin Aura & Royal Crest
    if (this.activeCosmeticSkinId) {
      if (this.activeCosmeticSkinId === 'skin_golden_sovereign') {
        const goldGrad = ctx.createRadialGradient(0, 2, 6, 0, 2, 45 + auraPulse * 1.5);
        goldGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        goldGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.32)');
        goldGrad.addColorStop(0.85, 'rgba(217, 119, 6, 0.12)');
        goldGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = goldGrad;
        ctx.beginPath();
        ctx.arc(0, 2, 45 + auraPulse * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Imperial Crown Ring
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 2, 33, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.stroke();
        ctx.restore();
      } else if (this.activeCosmeticSkinId === 'skin_cosmic_nebula') {
        const nebGrad = ctx.createRadialGradient(0, 2, 6, 0, 2, 45 + auraPulse * 1.5);
        nebGrad.addColorStop(0, 'rgba(224, 231, 255, 0.45)');
        nebGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.32)');
        nebGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.12)');
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nebGrad;
        ctx.beginPath();
        ctx.arc(0, 2, 45 + auraPulse * 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.activeCosmeticSkinId === 'skin_void_obsidian') {
        const voidGrad = ctx.createRadialGradient(0, 2, 6, 0, 2, 45 + auraPulse * 1.5);
        voidGrad.addColorStop(0, 'rgba(254, 205, 211, 0.45)');
        voidGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.32)');
        voidGrad.addColorStop(0.85, 'rgba(159, 18, 57, 0.12)');
        voidGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = voidGrad;
        ctx.beginPath();
        ctx.arc(0, 2, 45 + auraPulse * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. High-Tech Dual Supersonic Plasma Exhaust Afterburners
    const isSkillBoost = p.isSkillActive && (f.id === 'phoenix' || f.id === 'falcon');
    const baseLen = isSkillBoost ? 32 : 18;
    const flicker1 = Math.sin(now * 0.05) * 4 + Math.random() * 4;
    const flicker2 = Math.cos(now * 0.05) * 4 + Math.random() * 4;

    // Twin exhaust nozzles at x = -7 and x = 7 with glowing additive blend
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    [-7, 7].forEach((exX, idx) => {
      const flameLen = baseLen + (idx === 0 ? flicker1 : flicker2);

      // Outer thermal flare
      ctx.fillStyle = `${f.accentColor}66`;
      ctx.beginPath();
      ctx.moveTo(exX - 7, 20);
      ctx.quadraticCurveTo(exX, 20 + flameLen * 1.35, exX + 7, 20);
      ctx.fill();

      // Main colored plasma jet
      const jetGrad = ctx.createLinearGradient(exX, 18, exX, 18 + flameLen);
      jetGrad.addColorStop(0, '#ffffff');
      jetGrad.addColorStop(0.3, f.accentColor);
      jetGrad.addColorStop(1, `${f.color}00`);
      ctx.fillStyle = jetGrad;
      ctx.beginPath();
      ctx.moveTo(exX - 4.5, 20);
      ctx.lineTo(exX, 20 + flameLen);
      ctx.lineTo(exX + 4.5, 20);
      ctx.closePath();
      ctx.fill();

      // Inner white supersonic shock diamond core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(exX - 1.8, 20);
      ctx.lineTo(exX, 20 + flameLen * 0.6);
      ctx.lineTo(exX + 1.8, 20);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();

    // 3. Main Jet Hull (Unified Vector Fighter Sprite for 100% Visual Parity with Lobby & Full Skin Support)
    if (
      f.tier === 'S' ||
      f.id === 'rts_88' ||
      f.id === 'arc_tempest' ||
      f.id === 'astraea' ||
      f.id === 'solaris' ||
      f.id === 'chrono' ||
      f.id === 'apocalypse' ||
      f.id === 'valkyrie' ||
      f.id === 'ouroboros' ||
      f.id === 'nebula_sovereign' ||
      f.id === 'quasar_titan' ||
      f.id === 'chronos_phantom' ||
      this.activeCosmeticSkinId
    ) {
      drawFighterSprite(ctx, {
        fighter: f,
        activeSkinId: this.activeCosmeticSkinId,
        now,
        isHitFlash,
        scale: 1.0,
        isShowcase: false,
      });
    } else if (f.id === 'titan') {
      // Bulky Heavy Bomber
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(12, -10);
      ctx.lineTo(26, 8);
      ctx.lineTo(24, 22);
      ctx.lineTo(12, 18);
      ctx.lineTo(8, 24);
      ctx.lineTo(-8, 24);
      ctx.lineTo(-12, 18);
      ctx.lineTo(-24, 22);
      ctx.lineTo(-26, 8);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = f.color;
      ctx.fillRect(-6, -6, 12, 16);
      // Heavy armor plates
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(-16, 2, 8, 12);
      ctx.strokeRect(8, 2, 8, 12);
    } else if (f.id === 'ghost') {
      // Stealth Delta Wing
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(22, 18);
      ctx.lineTo(10, 14);
      ctx.lineTo(0, 20);
      ctx.lineTo(-10, 14);
      ctx.lineTo(-22, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(4, 2);
      ctx.lineTo(0, 6);
      ctx.lineTo(-4, 2);
      ctx.closePath();
      ctx.fill();
    } else if (f.id === 'aurora') {
      // Cryo Ice Needle Fighter
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(8, -12);
      ctx.lineTo(26, 6);
      ctx.lineTo(18, 14);
      ctx.lineTo(6, 10);
      ctx.lineTo(0, 22);
      ctx.lineTo(-6, 10);
      ctx.lineTo(-18, 14);
      ctx.lineTo(-26, 6);
      ctx.lineTo(-8, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Glacial ice crystal core
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
    } else if (f.id === 'vortex') {
      // Quantum Singularity Ring Jet
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(16, -6);
      ctx.lineTo(22, 14);
      ctx.lineTo(8, 20);
      ctx.lineTo(0, 14);
      ctx.lineTo(-8, 20);
      ctx.lineTo(-22, 14);
      ctx.lineTo(-16, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Center pulsating vortex eye
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.stroke();
    } else if (f.id === 'mirage') {
      // Holographic Split-Wing Mirage
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(14, -8);
      ctx.lineTo(24, 16);
      ctx.lineTo(12, 18);
      ctx.lineTo(0, 10);
      ctx.lineTo(-12, 18);
      ctx.lineTo(-24, 16);
      ctx.lineTo(-14, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(-2, -12, 4, 18);
    } else if (f.id === 'solaris') {
      // Solar Dreadnought Flagship with burning corona halo
      const solarRot = now * 0.003;
      ctx.save();
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 2, 24, solarRot, solarRot + Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(14, -14);
      ctx.lineTo(28, 4);
      ctx.lineTo(22, 22);
      ctx.lineTo(10, 18);
      ctx.lineTo(0, 24);
      ctx.lineTo(-10, 18);
      ctx.lineTo(-22, 22);
      ctx.lineTo(-28, 4);
      ctx.lineTo(-14, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Blazing fusion core
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (f.id === 'chrono') {
      // Tachyon Chronoship with rotating quantum ring
      ctx.save();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 10, now * 0.002, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(8, -10);
      ctx.lineTo(20, 8);
      ctx.lineTo(8, 16);
      ctx.lineTo(0, 18);
      ctx.lineTo(-8, 16);
      ctx.lineTo(-20, 8);
      ctx.lineTo(-8, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (f.id === 'apocalypse') {
      // Apocalypse Antimatter Overlord with twin railgun cannons
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(16, -14);
      ctx.lineTo(30, 2);
      ctx.lineTo(24, 24);
      ctx.lineTo(12, 16);
      ctx.lineTo(0, 26);
      ctx.lineTo(-12, 16);
      ctx.lineTo(-24, 24);
      ctx.lineTo(-30, 2);
      ctx.lineTo(-16, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Heavy twin railgun nozzles glowing red
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-15, -24, 4, 16);
      ctx.fillRect(11, -24, 4, 16);
    } else if (f.id === 'valkyrie') {
      // Valkyrie Angelic Wing Jet with halo
      ctx.save();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -26, 12, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(10, -12);
      ctx.lineTo(26, 4);
      ctx.lineTo(18, 20);
      ctx.lineTo(6, 16);
      ctx.lineTo(0, 24);
      ctx.lineTo(-6, 16);
      ctx.lineTo(-18, 20);
      ctx.lineTo(-26, 4);
      ctx.lineTo(-10, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Glowing holy lance nose & crest
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.lineTo(4, -14);
      ctx.lineTo(-4, -14);
      ctx.closePath();
      ctx.fill();
    } else if (f.id === 'arc_tempest') {
      // LX-88 ARC TEMPEST: High-Voltage Lightning Arc Interceptor (Upgraded AAA Visuals)
      const isRoyalGold =
        this.activeCosmeticSkinId === 'skin_lx88_royal_gold' ||
        this.activeCosmeticSkinId === 'skin_golden_sovereign';
      const isVampire = this.activeCosmeticSkinId === 'skin_lx88_vampire';
      const now = performance.now();
      const thrusterPulse = Math.sin(now * 0.02) * 3 + 14;

      // 1. Dynamic Vectoring Ion Afterburner Plumes
      const thrusterGrad = ctx.createLinearGradient(0, 18, 0, 18 + thrusterPulse);
      if (isVampire) {
        thrusterGrad.addColorStop(0, '#ffffff');
        thrusterGrad.addColorStop(0.3, '#fb7185');
        thrusterGrad.addColorStop(0.7, '#be123c');
        thrusterGrad.addColorStop(1, 'rgba(76, 5, 25, 0)');
      } else if (isRoyalGold) {
        thrusterGrad.addColorStop(0, '#ffffff');
        thrusterGrad.addColorStop(0.3, '#fde047');
        thrusterGrad.addColorStop(0.7, '#f59e0b');
        thrusterGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
      } else {
        thrusterGrad.addColorStop(0, '#ffffff');
        thrusterGrad.addColorStop(0.3, '#38bdf8');
        thrusterGrad.addColorStop(0.7, '#0284c7');
        thrusterGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
      }
      ctx.fillStyle = thrusterGrad;
      // Left engine flame
      ctx.beginPath();
      ctx.moveTo(-13, 18);
      ctx.lineTo(-7, 18);
      ctx.lineTo(-10, 18 + thrusterPulse);
      ctx.closePath();
      ctx.fill();
      // Right engine flame
      ctx.beginPath();
      ctx.moveTo(7, 18);
      ctx.lineTo(13, 18);
      ctx.lineTo(10, 18 + thrusterPulse);
      ctx.closePath();
      ctx.fill();

      // 2. Base Aerodynamic Hull (Serrated Gothic Batwings for Vampire Lord)
      ctx.beginPath();
      if (isVampire) {
        ctx.moveTo(0, -38); // Dracula Fang Point
        ctx.lineTo(4, -30);
        ctx.lineTo(8, -22);
        ctx.lineTo(14, -16); // Upper Batwing Rib
        ctx.lineTo(10, -10);
        ctx.lineTo(18, -4);
        ctx.lineTo(34, 6);   // Outer Batwing Scallop Tip 1
        ctx.lineTo(28, 12);  // Batwing Scallop Notch
        ctx.lineTo(36, 17);  // Outer Batwing Scallop Tip 2
        ctx.lineTo(22, 14);
        ctx.lineTo(15, 20);  // Right nozzle housing
        ctx.lineTo(6, 20);
        ctx.lineTo(3, 15);
        ctx.lineTo(0, 19);   // Tail Talon
        ctx.lineTo(-3, 15);
        ctx.lineTo(-6, 20);
        ctx.lineTo(-15, 20); // Left nozzle housing
        ctx.lineTo(-22, 14);
        ctx.lineTo(-36, 17); // Left Batwing Scallop Tip 2
        ctx.lineTo(-28, 12); // Batwing Scallop Notch
        ctx.lineTo(-34, 6);  // Left Batwing Scallop Tip 1
        ctx.lineTo(-18, -4);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-14, -16); // Left Upper Batwing Rib
        ctx.lineTo(-8, -22);
        ctx.lineTo(-4, -30);
      } else {
        ctx.moveTo(0, -36); // Needle nosecone
        ctx.lineTo(6, -22);
        ctx.lineTo(11, -18); // Canard edge
        ctx.lineTo(9, -12);
        ctx.lineTo(16, -6);
        ctx.lineTo(32, 4);   // Outer delta wing forward tip
        ctx.lineTo(36, 15);  // Wing trailing edge
        ctx.lineTo(22, 13);
        ctx.lineTo(15, 19);  // Right engine nozzle housing
        ctx.lineTo(6, 19);
        ctx.lineTo(3, 15);
        ctx.lineTo(0, 17);   // Center tail spine
        ctx.lineTo(-3, 15);
        ctx.lineTo(-6, 19);
        ctx.lineTo(-15, 19); // Left engine nozzle housing
        ctx.lineTo(-22, 13);
        ctx.lineTo(-36, 15); // Wing trailing edge
        ctx.lineTo(-32, 4);  // Outer delta wing forward tip
        ctx.lineTo(-16, -6);
        ctx.lineTo(-9, -12);
        ctx.lineTo(-11, -18); // Left canard edge
        ctx.lineTo(-6, -22);
      }
      ctx.closePath();

      // Main Hull Fill & Shading
      if (isHitFlash) {
        ctx.fillStyle = '#ffffff';
      } else if (isVampire) {
        const hullGrad = ctx.createLinearGradient(0, -38, 0, 22);
        hullGrad.addColorStop(0, '#f43f5e');
        hullGrad.addColorStop(0.2, '#881337');
        hullGrad.addColorStop(0.6, '#1e050e');
        hullGrad.addColorStop(0.9, '#090104');
        hullGrad.addColorStop(1, '#050102');
        ctx.fillStyle = hullGrad;
      } else if (isRoyalGold) {
        const hullGrad = ctx.createLinearGradient(0, -36, 0, 20);
        hullGrad.addColorStop(0, '#fffbeb');
        hullGrad.addColorStop(0.2, '#fef08a');
        hullGrad.addColorStop(0.5, '#2a1f07');
        hullGrad.addColorStop(0.85, '#171103');
        hullGrad.addColorStop(1, '#0c0902');
        ctx.fillStyle = hullGrad;
      } else {
        const hullGrad = ctx.createLinearGradient(0, -36, 0, 20);
        hullGrad.addColorStop(0, '#38bdf8');
        hullGrad.addColorStop(0.25, '#0f172a');
        hullGrad.addColorStop(0.8, '#030712');
        hullGrad.addColorStop(1, '#020617');
        ctx.fillStyle = hullGrad;
      }
      ctx.fill();

      // Edge Armor Contours
      ctx.strokeStyle = isHitFlash
        ? '#ffffff'
        : isVampire
        ? '#e11d48'
        : isRoyalGold
        ? '#fbbf24'
        : '#00f2fe';
      ctx.lineWidth = isVampire ? 2.5 : isRoyalGold ? 2.4 : 1.8;
      ctx.stroke();

      // 3. Multi-layer Inner Wing Armor Panels
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(12, -4);
      ctx.lineTo(26, 8);
      ctx.lineTo(18, 10);
      ctx.lineTo(8, 6);
      ctx.lineTo(0, -2);
      ctx.lineTo(-8, 6);
      ctx.lineTo(-18, 10);
      ctx.lineTo(-26, 8);
      ctx.lineTo(-12, -4);
      ctx.closePath();
      ctx.fillStyle = isVampire
        ? 'rgba(225, 29, 72, 0.22)'
        : isRoyalGold
        ? 'rgba(251, 191, 36, 0.18)'
        : 'rgba(14, 165, 233, 0.18)';
      ctx.fill();
      ctx.strokeStyle = isVampire
        ? '#f43f5e'
        : isRoyalGold
        ? '#f59e0b'
        : 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // 4. Central Linear Railgun / Dracula Fangs & High-Voltage Arc Chamber
      if (isVampire) {
        ctx.fillStyle = '#4c0519';
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 1;
        // Left Fang
        ctx.beginPath();
        ctx.moveTo(-4, -26);
        ctx.lineTo(-2, -36);
        ctx.lineTo(-1, -26);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Right Fang
        ctx.beginPath();
        ctx.moveTo(1, -26);
        ctx.lineTo(2, -36);
        ctx.lineTo(4, -26);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1c040c';
        ctx.fillRect(-3, -24, 6, 22);
        ctx.strokeStyle = '#e11d48';
        ctx.strokeRect(-3, -24, 6, 22);

        const corePulse = (Math.sin(now * 0.008) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 228, 230, ${0.7 + corePulse * 0.3})`;
        ctx.fillRect(-1.5, -20 + corePulse * 12, 3, 5);
      } else {
        ctx.fillStyle = isRoyalGold ? '#451a03' : '#082f49';
        ctx.fillRect(-3.5, -24, 7, 24);
        ctx.strokeStyle = isRoyalGold ? '#fef08a' : '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-3.5, -24, 7, 24);

        // Oscillating Magnetic Core Pulse
        const coreOffset = (now * 0.05) % 18;
        ctx.fillStyle = isRoyalGold ? '#ffffff' : '#e0f2fe';
        ctx.fillRect(-1.5, -22 + coreOffset, 3, 4);
      }

      // 5. Faceted Stealth Cockpit Canopy (Demon Eye for Vampire)
      const canopyGrad = ctx.createLinearGradient(0, -18, 0, -2);
      if (isVampire) {
        const heartPulse = Math.sin(now * 0.007) * 0.15;
        canopyGrad.addColorStop(0, '#ffffff');
        canopyGrad.addColorStop(0.3, '#f43f5e');
        canopyGrad.addColorStop(0.7, '#881337');
        canopyGrad.addColorStop(1, '#3b0716');
        ctx.fillStyle = canopyGrad;
        ctx.beginPath();
        ctx.moveTo(0, -19);
        ctx.lineTo(4 + heartPulse * 2, -10);
        ctx.lineTo(3.2, -2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-3.2, -2);
        ctx.lineTo(-4 - heartPulse * 2, -10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = '#050103';
        ctx.beginPath();
        ctx.ellipse(0, -10, 1.1, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        if (isRoyalGold) {
          canopyGrad.addColorStop(0, '#ffffff');
          canopyGrad.addColorStop(0.3, '#fde047');
          canopyGrad.addColorStop(1, '#92400e');
        } else {
          canopyGrad.addColorStop(0, '#ffffff');
          canopyGrad.addColorStop(0.3, '#38bdf8');
          canopyGrad.addColorStop(1, '#075985');
        }
        ctx.fillStyle = canopyGrad;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(3.5, -10);
        ctx.lineTo(3, -2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-3, -2);
        ctx.lineTo(-3.5, -10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isRoyalGold ? '#fffbeb' : '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 6. Wingtip High-Voltage Arc Emitter Pods (Blood Orbs for Vampire, Topaz in Gold)
      const emitterPulse = Math.sin(now * 0.015) * 0.5 + 0.5;
      const emitterColor = isVampire ? '#f43f5e' : isRoyalGold ? '#fef08a' : '#00f2fe';

      // Left Emitter
      ctx.fillStyle = emitterColor;
      ctx.beginPath();
      ctx.arc(-30, 6, 3.5 + emitterPulse * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-30, 6, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Right Emitter
      ctx.fillStyle = emitterColor;
      ctx.beginPath();
      ctx.arc(30, 6, 3.5 + emitterPulse * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(30, 6, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Ambient Fluttering Vampire Bats (In-Combat Vampire Exclusive)
      if (isVampire) {
        for (let b = 0; b < 3; b++) {
          const batPhase = now * 0.003 + b * 2.1;
          const bx = Math.sin(batPhase) * 38 + (b === 0 ? -14 : b === 1 ? 14 : 0);
          const by = Math.cos(batPhase * 1.4) * 16 - 12;
          const flap = Math.sin(now * 0.025 + b * 1.8);
          ctx.save();
          ctx.translate(bx, by);
          ctx.fillStyle = '#1c040c';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-4.5, -2 + flap * 2.5);
          ctx.lineTo(-2, 1);
          ctx.lineTo(0, 2);
          ctx.lineTo(2, 1);
          ctx.lineTo(4.5, -2 + flap * 2.5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }

      // 7. Micro Electric Arcs between Emitters & Fuselage
      if (Math.random() < 0.35) {
        ctx.strokeStyle = isRoyalGold ? '#fde047' : '#7dd3fc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(30, 6);
        ctx.lineTo(22 + (Math.random() - 0.5) * 4, 10);
        ctx.lineTo(16, 2);
        ctx.stroke();
      }
      if (Math.random() < 0.35) {
        ctx.strokeStyle = isRoyalGold ? '#fde047' : '#7dd3fc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-30, 6);
        ctx.lineTo(-22 + (Math.random() - 0.5) * 4, 10);
        ctx.lineTo(-16, 2);
        ctx.stroke();
      }

      // 8. Royal Gold 24K Exclusive Embellishments
      if (isRoyalGold) {
        ctx.save();
        // Golden Wing Filigree Runes
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(8, -14);
        ctx.lineTo(24, -2);
        ctx.lineTo(28, 8);
        ctx.moveTo(-8, -14);
        ctx.lineTo(-24, -2);
        ctx.lineTo(-28, 8);
        ctx.stroke();

        // Imperial Crown Signet on Fore Fuselage
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#fffbeb';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-4, -26);
        ctx.lineTo(-4, -30);
        ctx.lineTo(-2, -28);
        ctx.lineTo(0, -32);
        ctx.lineTo(2, -28);
        ctx.lineTo(4, -30);
        ctx.lineTo(4, -26);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crown Jewels
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -28, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else if (f.id === 'nebula_sovereign') {
      // Nebula Sovereign Cosmic Flagship
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(18, -12);
      ctx.lineTo(32, 8);
      ctx.lineTo(18, 22);
      ctx.lineTo(0, 16);
      ctx.lineTo(-18, 22);
      ctx.lineTo(-32, 8);
      ctx.lineTo(-18, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.id === 'thunderbolt') {
      // Thunderbolt Twin Prongs
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(14, -8);
      ctx.lineTo(24, 14);
      ctx.lineTo(12, 18);
      ctx.lineTo(4, 12);
      ctx.lineTo(0, 20);
      ctx.lineTo(-4, 12);
      ctx.lineTo(-12, 18);
      ctx.lineTo(-24, 14);
      ctx.lineTo(-14, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-10, -18, 3, 10);
      ctx.fillRect(7, -18, 3, 10);
    } else if (f.id === 'plasma_reaper') {
      // Plasma Reaper Blade Wings
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(12, -14);
      ctx.lineTo(28, 2);
      ctx.lineTo(20, 20);
      ctx.lineTo(8, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(-8, 14);
      ctx.lineTo(-20, 20);
      ctx.lineTo(-28, 2);
      ctx.lineTo(-12, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-3, -12, 6, 16);
    } else if (f.id === 'tempest') {
      // Tempest Wave-Rider
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(14, -6);
      ctx.lineTo(22, 16);
      ctx.lineTo(8, 14);
      ctx.lineTo(0, 20);
      ctx.lineTo(-8, 14);
      ctx.lineTo(-22, 16);
      ctx.lineTo(-14, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#14b8a6';
      ctx.beginPath();
      ctx.arc(0, -8, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (f.id === 'viper') {
      // Viper Needle Fighter
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(8, -14);
      ctx.lineTo(18, 12);
      ctx.lineTo(6, 18);
      ctx.lineTo(0, 14);
      ctx.lineTo(-6, 18);
      ctx.lineTo(-18, 12);
      ctx.lineTo(-8, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(-2, -26, 4, 10);
    } else if (f.id === 'falcon') {
      // Falcon Minigun Fighter
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(12, -10);
      ctx.lineTo(22, 12);
      ctx.lineTo(12, 16);
      ctx.lineTo(0, 18);
      ctx.lineTo(-12, 16);
      ctx.lineTo(-22, 12);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(-6, -24, 12, 6);
    } else if (f.id === 'bastion') {
      // Bastion Armored Bulwark
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(16, -10);
      ctx.lineTo(24, 10);
      ctx.lineTo(18, 22);
      ctx.lineTo(0, 26);
      ctx.lineTo(-18, 22);
      ctx.lineTo(-24, 10);
      ctx.lineTo(-16, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (f.id === 'rts_88') {
      // RTS-88 TIA CHỚP (Lightning Interceptor / Kamen Rider Ark-One [HUYỀN THOẠI])
      const isArkOne = this.activeCosmeticSkinId === 'skin_rts88_ark_one';
      const isNeonViolet = this.activeCosmeticSkinId === 'skin_rts88_neon_violet';

      if (isArkOne) {
        // 1. VÒNG TRÒN ARK-ONE XOAY QUANH PHÍA SAU MÁY BAY
        const ringRot = now * 0.003;
        const ringY = 18;
        const ringR = 30;

        ctx.save();
        // Malice void haze
        const maliceHaze = ctx.createRadialGradient(0, ringY, 4, 0, ringY, ringR + 10);
        maliceHaze.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
        maliceHaze.addColorStop(0.5, 'rgba(255, 0, 51, 0.35)');
        maliceHaze.addColorStop(1, 'rgba(255, 0, 51, 0)');
        ctx.fillStyle = maliceHaze;
        ctx.beginPath();
        ctx.arc(0, ringY, ringR + 10, 0, Math.PI * 2);
        ctx.fill();

        // Outer segmented ring with 8 malice teeth
        ctx.save();
        ctx.translate(0, ringY);
        ctx.rotate(ringRot);
        ctx.strokeStyle = '#ff0033';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4;
          const tx = Math.cos(ang) * ringR;
          const ty = Math.sin(ang) * ringR;
          const toothX = Math.cos(ang) * (ringR + 5);
          const toothY = Math.sin(ang) * (ringR + 5);
          ctx.strokeStyle = i % 2 === 0 ? '#ff0033' : '#09090b';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(toothX, toothY);
          ctx.stroke();
        }
        ctx.restore();

        // Counter-rotating inner rune circle
        ctx.save();
        ctx.translate(0, ringY);
        ctx.rotate(-ringRot * 1.5);
        ctx.strokeStyle = 'rgba(255, 26, 64, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, ringR - 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        ctx.restore();

        // 2. Twin Malice Thrusters
        const thrusterPulse = Math.sin(now * 0.03) * 4 + 18;
        const arkThrusterGrad = ctx.createLinearGradient(0, 16, 0, 16 + thrusterPulse);
        arkThrusterGrad.addColorStop(0, '#09090b');
        arkThrusterGrad.addColorStop(0.35, '#ff0033');
        arkThrusterGrad.addColorStop(0.8, '#99001f');
        arkThrusterGrad.addColorStop(1, 'rgba(255, 0, 51, 0)');
        ctx.fillStyle = arkThrusterGrad;
        ctx.beginPath();
        ctx.moveTo(-11, 16);
        ctx.lineTo(-5, 16);
        ctx.lineTo(-8, 16 + thrusterPulse);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(5, 16);
        ctx.lineTo(11, 16);
        ctx.lineTo(8, 16 + thrusterPulse);
        ctx.closePath();
        ctx.fill();

        // 3. Asymmetrical Ark-One Fuselage
        ctx.beginPath();
        ctx.moveTo(0, -36);
        ctx.lineTo(5, -24);
        ctx.lineTo(12, -12);
        ctx.lineTo(34, 4);
        ctx.lineTo(28, 14);
        ctx.lineTo(16, 8);
        ctx.lineTo(12, 18);
        ctx.lineTo(4, 18);
        ctx.lineTo(0, 22);
        ctx.lineTo(-4, 18);
        ctx.lineTo(-12, 18);
        ctx.lineTo(-16, 8);
        ctx.lineTo(-28, 14);
        ctx.lineTo(-34, 4);
        ctx.lineTo(-12, -12);
        ctx.lineTo(-5, -24);
        ctx.closePath();
        ctx.fillStyle = '#09090b';
        ctx.fill();
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Right side: pure white ceramic armor plate
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(0, -36);
        ctx.lineTo(5, -24);
        ctx.lineTo(12, -12);
        ctx.lineTo(34, 4);
        ctx.lineTo(28, 14);
        ctx.lineTo(16, 8);
        ctx.lineTo(12, 18);
        ctx.lineTo(3, 18);
        ctx.lineTo(0, 21);
        ctx.closePath();
        ctx.fill();

        // Left side: cracked glowing red veins
        ctx.strokeStyle = '#ff0033';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(-6, -15);
        ctx.lineTo(-15, -6);
        ctx.lineTo(-26, 4);
        ctx.moveTo(-15, -6);
        ctx.lineTo(-22, 12);
        ctx.stroke();

        // Ark Driver One Central Core
        const corePulse = (Math.sin(now * 0.015) + 1) * 0.5;
        const arkCoreGrad = ctx.createRadialGradient(0, -2, 1, 0, -2, 7);
        arkCoreGrad.addColorStop(0, '#ffffff');
        arkCoreGrad.addColorStop(0.35, '#ff0033');
        arkCoreGrad.addColorStop(1, '#09090b');
        ctx.fillStyle = arkCoreGrad;
        ctx.beginPath();
        ctx.arc(0, -2, 6.5 + corePulse * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Visor: Left cracked red eye
        ctx.fillStyle = '#ff0033';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.quadraticCurveTo(-4, -8, -4, 2);
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.quadraticCurveTo(4, -8, 4, 2);
        ctx.lineTo(0, 2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Default & Epic Neon Violet RTS-88
        const thrusterPulse = Math.sin(now * 0.03) * 4 + 16;
        const thrusterGrad = ctx.createLinearGradient(0, 18, 0, 18 + thrusterPulse);
        if (isNeonViolet) {
          thrusterGrad.addColorStop(0, '#ffffff');
          thrusterGrad.addColorStop(0.3, '#e879f9');
          thrusterGrad.addColorStop(0.7, '#a855f7');
          thrusterGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        } else {
          thrusterGrad.addColorStop(0, '#ffffff');
          thrusterGrad.addColorStop(0.3, '#38bdf8');
          thrusterGrad.addColorStop(0.7, '#00f0ff');
          thrusterGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        }
        ctx.fillStyle = thrusterGrad;
        // Left thruster flame
        ctx.beginPath();
        ctx.moveTo(-11, 16);
        ctx.lineTo(-5, 16);
        ctx.lineTo(-8, 16 + thrusterPulse);
        ctx.closePath();
        ctx.fill();
        // Right thruster flame
        ctx.beginPath();
        ctx.moveTo(5, 16);
        ctx.lineTo(11, 16);
        ctx.lineTo(8, 16 + thrusterPulse);
        ctx.closePath();
        ctx.fill();

        // Main aerodynamic forward-swept lightning fuselage
        ctx.beginPath();
        ctx.moveTo(0, -36); // Needle tip
        ctx.lineTo(5, -24);
        ctx.lineTo(12, -12);
        ctx.lineTo(32, 4); // Main wingtip
        ctx.lineTo(26, 12);
        ctx.lineTo(16, 8);
        ctx.lineTo(12, 18); // Right engine pod
        ctx.lineTo(4, 18);
        ctx.lineTo(0, 22); // Center tail spine
        ctx.lineTo(-4, 18);
        ctx.lineTo(-12, 18); // Left engine pod
        ctx.lineTo(-16, 8);
        ctx.lineTo(-26, 12);
        ctx.lineTo(-32, 4); // Left wingtip
        ctx.lineTo(-12, -12);
        ctx.lineTo(-5, -24);
        ctx.closePath();
        ctx.fillStyle = isNeonViolet ? '#150826' : '#082f49';
        ctx.fill();
        ctx.strokeStyle = isNeonViolet ? '#c084fc' : '#00f0ff';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Dual Tesla emitter prongs at nose
        ctx.strokeStyle = isNeonViolet ? '#f472b6' : '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, -20);
        ctx.lineTo(-3, -38);
        ctx.moveTo(4, -20);
        ctx.lineTo(3, -38);
        ctx.stroke();

        // Micro electric arc between prongs
        if (Math.random() < 0.6) {
          ctx.strokeStyle = isNeonViolet ? '#e879f9' : '#00f0ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-3, -34);
          ctx.lineTo(0, -36 + (Math.random() - 0.5) * 4);
          ctx.lineTo(3, -34);
          ctx.stroke();
        }

        // Wing lightning capacitor plates
        ctx.fillStyle = isNeonViolet ? '#9333ea' : '#0284c7';
        ctx.beginPath();
        ctx.moveTo(14, -4);
        ctx.lineTo(28, 6);
        ctx.lineTo(18, 10);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-14, -4);
        ctx.lineTo(-28, 6);
        ctx.lineTo(-18, 10);
        ctx.closePath();
        ctx.fill();

        // Center High-Voltage Lightning Core (pulses electric yellow/cyan or neon violet)
        const corePulse = (Math.sin(now * 0.015) + 1) * 0.5;
        ctx.fillStyle = isNeonViolet
          ? `rgba(232, 121, 249, ${0.85 + corePulse * 0.15})`
          : `rgba(250, 204, 21, ${0.8 + corePulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(0, -2, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (f.id === 'astraea') {
      // SX-77 ASTRAEA: Sleek Golden Celestial Star Interceptor / Sakura Blossom Mecha
      const isSakura = this.activeCosmeticSkinId === 'skin_astraea_sakura';

      if (isSakura) {
        // Orbiting Sakura Petals in combat
        const petalOrbit = now * 0.0025;
        for (let p = 0; p < 6; p++) {
          const a = petalOrbit + (p * Math.PI * 2) / 6;
          const px = Math.cos(a) * 34;
          const py = Math.sin(a) * 20;
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(now * 0.004 + p);
          ctx.fillStyle = '#f472b6';
          ctx.shadowColor = '#f472b6';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.5, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Sakura Wing Silhouette
        ctx.beginPath();
        ctx.moveTo(0, -34);
        ctx.bezierCurveTo(6, -26, 12, -12, 14, -8);
        ctx.bezierCurveTo(24, -10, 32, -4, 36, 4);
        ctx.lineTo(34, 10);
        ctx.bezierCurveTo(30, 16, 20, 18, 14, 14);
        ctx.lineTo(10, 24);
        ctx.lineTo(0, 19);
        ctx.lineTo(-10, 24);
        ctx.lineTo(-14, 14);
        ctx.bezierCurveTo(-20, 18, -30, 16, -34, 10);
        ctx.lineTo(-36, 4);
        ctx.bezierCurveTo(-32, -4, -24, -10, -14, -8);
        ctx.bezierCurveTo(-12, -12, -6, -26, 0, -34);
        ctx.closePath();
        ctx.fillStyle = '#fbcfe8';
        ctx.fill();
        ctx.strokeStyle = '#f472b6';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Center 5-petal sakura emblem
        for (let s = 0; s < 5; s++) {
          const fa = (s * Math.PI * 2) / 5;
          ctx.save();
          ctx.rotate(fa);
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.ellipse(0, -4.5, 2, 3.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard Astraea Golden Stars
        const orbitAngle = now * 0.0025;
        for (let s = 0; s < 5; s++) {
          const a = orbitAngle + (s * Math.PI * 2) / 5;
          const sx = Math.cos(a) * 34;
          const sy = Math.sin(a) * 20;
          this.drawStar(sx, sy, 4, 3.2, 1.6, '#fde047', '#ffffff');
        }

        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(10, -14);
        ctx.lineTo(28, 4);
        ctx.lineTo(22, 18);
        ctx.lineTo(8, 14);
        ctx.lineTo(0, 24);
        ctx.lineTo(-8, 14);
        ctx.lineTo(-22, 18);
        ctx.lineTo(-28, 4);
        ctx.lineTo(-10, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wing starlight crystals
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(14, -6);
        ctx.lineTo(26, 6);
        ctx.lineTo(16, 12);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-14, -6);
        ctx.lineTo(-26, 6);
        ctx.lineTo(-16, 12);
        ctx.closePath();
        ctx.fill();

        // Center glowing 5-pointed celestial star emblem
        this.drawStar(0, -2, 5, 8.5, 3.8, '#fbbf24', '#ffffff');
      }
    } else if (f.id === 'ouroboros') {
      // OX-88 OUROBOROS: Void Dragon with curving wings and runic purple highlights
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(8, -16);
      ctx.lineTo(26, -4);
      ctx.lineTo(32, 16);
      ctx.lineTo(16, 14);
      ctx.lineTo(6, 22);
      ctx.lineTo(0, 16);
      ctx.lineTo(-6, 22);
      ctx.lineTo(-16, 14);
      ctx.lineTo(-32, 16);
      ctx.lineTo(-26, -4);
      ctx.lineTo(-8, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dragon spine plates
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-2, -22, 4, 28);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-2, -22, 4, 28);
    } else if (f.id === 'quasar_titan') {
      // QX-99 QUASAR TITAN: Heavy armored celestial battleship with dual gamma coils
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(16, -18);
      ctx.lineTo(28, 6);
      ctx.lineTo(22, 24);
      ctx.lineTo(10, 20);
      ctx.lineTo(0, 26);
      ctx.lineTo(-10, 20);
      ctx.lineTo(-22, 24);
      ctx.lineTo(-28, 6);
      ctx.lineTo(-16, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing Gamma Emitter Core
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, -2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (f.id === 'chronos_phantom') {
      // ZX-00 CHRONOS PHANTOM: Dual-fork tachyon needle fighter
      ctx.beginPath();
      ctx.moveTo(-10, -32);
      ctx.lineTo(-6, -10);
      ctx.lineTo(0, -18);
      ctx.lineTo(6, -10);
      ctx.lineTo(10, -32);
      ctx.lineTo(18, 4);
      ctx.lineTo(24, 18);
      ctx.lineTo(10, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(-10, 14);
      ctx.lineTo(-24, 18);
      ctx.lineTo(-18, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chrono loop rings
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.id === 'nanite_swarm') {
      // NX-66 NANITE SWARM: Hive-like segmented fuselage
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(12, -14);
      ctx.lineTo(22, 0);
      ctx.lineTo(18, 16);
      ctx.lineTo(6, 12);
      ctx.lineTo(0, 20);
      ctx.lineTo(-6, 12);
      ctx.lineTo(-18, 16);
      ctx.lineTo(-22, 0);
      ctx.lineTo(-12, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Nanite vents
      ctx.fillStyle = '#84cc16';
      [-8, 8].forEach((vx) => {
        ctx.fillRect(vx - 2, -4, 4, 8);
      });
    } else if (f.id === 'plasma_hydra') {
      // HX-9 HYDRA CANNON: Multi-barrel wide cannon wings
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(14, -8);
      ctx.lineTo(30, 4);
      ctx.lineTo(24, 20);
      ctx.lineTo(12, 16);
      ctx.lineTo(0, 24);
      ctx.lineTo(-12, 16);
      ctx.lineTo(-24, 20);
      ctx.lineTo(-30, 4);
      ctx.lineTo(-14, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 9 cannon tips along the forward edge
      ctx.fillStyle = '#10b981';
      for (let c = -4; c <= 4; c++) {
        ctx.fillRect(c * 6 - 1.5, -12 - Math.abs(c) * 1.5, 3, 5);
      }
    } else if (f.id === 'prism_aegis') {
      // PX-7 PRISM REFRACTOR: Diamond crystal hull with prismatic facets
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(18, -6);
      ctx.lineTo(26, 12);
      ctx.lineTo(12, 18);
      ctx.lineTo(0, 26);
      ctx.lineTo(-12, 18);
      ctx.lineTo(-26, 12);
      ctx.lineTo(-18, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Facet triangulation lines
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(0, 26);
      ctx.moveTo(-18, -6);
      ctx.lineTo(18, -6);
      ctx.stroke();
    } else if (f.id === 'stellar_sentinel') {
      // GX-14 STELLAR SENTINEL: Sleek aerospace hull with dual orbiting satellite drones
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(12, -10);
      ctx.lineTo(26, 6);
      ctx.lineTo(18, 18);
      ctx.lineTo(6, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(-6, 14);
      ctx.lineTo(-18, 18);
      ctx.lineTo(-26, 6);
      ctx.lineTo(-12, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dual Orbiting Satellite Drones
      const orbitAng = now * 0.004;
      [-1, 1].forEach((dir) => {
        const sx = Math.cos(orbitAng * dir) * 38;
        const sy = Math.sin(orbitAng * dir) * 18;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Canopy
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(-2, -18, 4, 14);
    } else if (f.id === 'void_rift') {
      // VX-8 VOID RIFTWALKER: Forward-swept void wings with rift core
      ctx.beginPath();
      ctx.moveTo(0, -34);
      ctx.lineTo(8, -14);
      ctx.lineTo(28, -20);
      ctx.lineTo(22, 16);
      ctx.lineTo(8, 10);
      ctx.lineTo(0, 24);
      ctx.lineTo(-8, 10);
      ctx.lineTo(-22, 16);
      ctx.lineTo(-28, -20);
      ctx.lineTo(-8, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pulsing Dimensional Rift Core
      const riftPulse = 1 + Math.sin(now * 0.008) * 0.25;
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 5 * riftPulse, 10 * riftPulse, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (f.id === 'sol_inferno') {
      // FX-33 SOL INFERNO: Aggressive swept delta with napalm heat vents
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(14, -8);
      ctx.lineTo(30, 10);
      ctx.lineTo(20, 22);
      ctx.lineTo(8, 16);
      ctx.lineTo(0, 24);
      ctx.lineTo(-8, 16);
      ctx.lineTo(-20, 22);
      ctx.lineTo(-30, 10);
      ctx.lineTo(-14, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Thermal Heat Chambers
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-12, -4, 5, 12);
      ctx.fillRect(7, -4, 5, 12);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-3, -20, 6, 12);
    } else if (f.id === 'chrono_echo') {
      // TX-19 CHRONO RESONATOR: Twin forward tuning fork needles with cyan harmonic rings
      ctx.beginPath();
      ctx.moveTo(-8, -34);
      ctx.lineTo(-4, -12);
      ctx.lineTo(0, -22);
      ctx.lineTo(4, -12);
      ctx.lineTo(8, -34);
      ctx.lineTo(18, 4);
      ctx.lineTo(24, 18);
      ctx.lineTo(10, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(-10, 14);
      ctx.lineTo(-24, 18);
      ctx.lineTo(-18, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chrono Harmonic Rings
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -2, 16, 6, now * 0.003, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.id === 'graviton_lance') {
      // GX-99 GRAVITON PIERCER: Long railgun prow with magnetic containment rings
      ctx.beginPath();
      ctx.moveTo(0, -38);
      ctx.lineTo(6, -16);
      ctx.lineTo(22, 6);
      ctx.lineTo(18, 24);
      ctx.lineTo(6, 18);
      ctx.lineTo(0, 26);
      ctx.lineTo(-6, 18);
      ctx.lineTo(-18, 24);
      ctx.lineTo(-22, 6);
      ctx.lineTo(-6, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Railgun Barrel & Magnetic Coils
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(-2, -36, 4, 26);
      ctx.fillStyle = '#ffffff';
      [-30, -22, -14].forEach((py) => {
        ctx.fillRect(-4, py, 8, 3);
      });
    } else if (f.id === 'bio_spore') {
      // BX-7 BIO VANGUARD: Organic carapace with chitinous wings and spore vents
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(12, -12);
      ctx.lineTo(24, -2);
      ctx.lineTo(20, 18);
      ctx.lineTo(8, 14);
      ctx.lineTo(0, 24);
      ctx.lineTo(-8, 14);
      ctx.lineTo(-20, 18);
      ctx.lineTo(-24, -2);
      ctx.lineTo(-12, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bioluminescent Spore Sockets
      ctx.fillStyle = '#a3e635';
      [-8, 8].forEach((sx) => {
        ctx.beginPath();
        ctx.arc(sx, 2, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-2, -16, 4, 16);
    } else {
      // Phoenix Interceptor
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(6, -8);
      ctx.lineTo(24, 12);
      ctx.lineTo(14, 18);
      ctx.lineTo(5, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(-5, 14);
      ctx.lineTo(-14, 18);
      ctx.lineTo(-24, 12);
      ctx.lineTo(-6, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wing panel trim
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-18, 10);
      ctx.lineTo(-6, 2);
      ctx.moveTo(18, 10);
      ctx.lineTo(6, 2);
      ctx.stroke();
    }

    // High-Gloss Aerodynamic Prismatic Cockpit Canopy (For non-S tier without custom sprite)
    if (f.tier !== 'S' && !this.activeCosmeticSkinId) {
      const canopyGrad = ctx.createLinearGradient(0, -16, 0, 4);
      canopyGrad.addColorStop(0, '#ffffff');
      canopyGrad.addColorStop(0.35, isHitFlash ? '#ffffff' : f.accentColor);
      canopyGrad.addColorStop(1, '#091322');
      ctx.fillStyle = canopyGrad;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, -4, 3.8, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glare reflection highlight line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-1.2, -10);
      ctx.lineTo(-0.8, -3);
      ctx.stroke();
    }

    // Wingtip Strobes (Right: Cyan/Green, Left: Red/Rose)
    const strobeAlpha = (Math.sin(now * 0.01) + 1) * 0.5;
    ctx.fillStyle = f.accentColor;
    ctx.globalAlpha = strobeAlpha;
    ctx.beginPath();
    ctx.arc(-24, 10, 2.5, 0, Math.PI * 2);
    ctx.arc(24, 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 4. Sci-Fi Hexagonal Energy Shield Barrier Bubble with Electric Nodes
    if (p.shieldActive || (p.isSkillActive && f.id === 'titan')) {
      const shieldColor = f.id === 'titan' ? '#f59e0b' : '#38bdf8';
      const shieldAccent = f.id === 'titan' ? '#fbbf24' : '#00f2fe';
      const shieldRad = p.radius + 12;
      const shieldRot = now * 0.0015;

      ctx.save();
      // Outer radiant aura
      ctx.strokeStyle = shieldAccent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, shieldRad + 3, shieldRot, shieldRot + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Hexagonal Barrier Shell
      ctx.beginPath();
      for (let h = 0; h < 6; h++) {
        const hAng = shieldRot + (h * Math.PI) / 3;
        const hx = Math.cos(hAng) * shieldRad;
        const hy = Math.sin(hAng) * shieldRad;
        if (h === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = f.id === 'titan' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(56, 189, 248, 0.18)';
      ctx.fill();
      ctx.strokeStyle = shieldColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Glowing hex vertex nodes
      for (let h = 0; h < 6; h++) {
        const hAng = shieldRot + (h * Math.PI) / 3;
        const nx = Math.cos(hAng) * shieldRad;
        const ny = Math.sin(hAng) * shieldRad;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(nx, ny, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 4.5 RTS-88 Tia Chớp: Khiên Sấm Sét 300 HP (+80% ST) kèm hiệu ứng tia sét bao bọc phi cơ
    if (this.rts88ShieldHp > 0 && p.isSkillActive && f.id === 'rts_88') {
      const shieldRad = p.radius + 18;
      const rot = now * 0.002;
      ctx.save();

      // Outer electric corona (layered alpha strokes)
      const pulse = 1.0 + Math.sin(now * 0.012) * 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRad * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 14;
      ctx.stroke();

      // Main electric shield border
      ctx.beginPath();
      ctx.arc(0, 0, shieldRad, 0, Math.PI * 2);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Inner electric ring
      ctx.beginPath();
      ctx.arc(0, 0, shieldRad - 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 6 Rotating Electric Tesla Nodes & Jagged Lightning Arcs jumping between them
      const nodeCount = 6;
      const nodePoints: Array<{ x: number; y: number }> = [];
      for (let n = 0; n < nodeCount; n++) {
        const ang = rot + (n * Math.PI * 2) / nodeCount;
        const nx = Math.cos(ang) * shieldRad;
        const ny = Math.sin(ang) * shieldRad;
        nodePoints.push({ x: nx, y: ny });

        // Draw node spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw jagged lightning arcs connecting the nodes around the shield
      ctx.lineWidth = 2;
      for (let n = 0; n < nodeCount; n++) {
        const p1 = nodePoints[n];
        const p2 = nodePoints[(n + 1) % nodeCount];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const jitter = Math.sin(now * 0.02 + n * 3.7) * 7;
        const perpX = -(p2.y - p1.y) * 0.15;
        const perpY = (p2.x - p1.x) * 0.15;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(midX + perpX + jitter, midY + perpY + jitter);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = n % 2 === 0 ? '#00f0ff' : '#fde047';
        ctx.stroke();
      }

      // Floating Shield HP badge & damage boost display
      ctx.font = 'bold 9px "Orbitron", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#facc15';
      ctx.fillText(`⚡ KHIÊN: ${Math.round(this.rts88ShieldHp)}/300 (+80% ST)`, 0, -shieldRad - 10);

      ctx.restore();
    }

    ctx.restore();
  }

  private drawDrones() {
    if (this.equippedDroneIds.length === 0) return;
    const ctx = this.ctx;
    const now = performance.now();

    // 1. Draw Nano Aegis Shield Barrier around player if active
    if (this.droneAegisShieldHp > 0) {
      ctx.save();
      ctx.translate(this.player.x, this.player.y);
      const shieldPulse = 1 + Math.sin(now * 0.008) * 0.06;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';

      // Hexagonal force field
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const ang = (s * Math.PI) / 3 + now * 0.001;
        const rad = (this.player.radius + 14) * shieldPulse;
        const hx = Math.cos(ang) * rad;
        const hy = Math.sin(ang) * rad;
        if (s === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      // Shield health indicator label
      ctx.font = 'bold 9px "Orbitron", sans-serif';
      ctx.fillStyle = '#67e8f9';
      ctx.textAlign = 'center';
      ctx.fillText(`NANO SHIELD: ${this.droneAegisShieldHp}`, 0, this.player.radius + 24);
      ctx.restore();
    }

    // 2. Draw Each Equipped Drone
    for (let i = 0; i < this.equippedDroneIds.length; i++) {
      const droneId = this.equippedDroneIds[i];
      const drone = DRONES[droneId];
      const dPos = this.dronePositions[i];
      if (!drone || !dPos) continue;

      ctx.save();
      ctx.translate(dPos.x, dPos.y);
      ctx.rotate(dPos.tilt);

      const isS = drone.tier === 'S';
      const isA = drone.tier === 'A';

      // Tier S Radiant Aura Halo
      if (isS) {
        const haloPulse = 1 + Math.sin(now * 0.009 + i) * 0.15;
        ctx.strokeStyle = drone.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 16 * haloPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Animated Thruster Exhaust Plume
      const exhaustLen = 10 + Math.random() * 6;
      ctx.fillStyle = drone.accentColor;
      ctx.beginPath();
      ctx.moveTo(-4, 7);
      ctx.lineTo(0, 7 + exhaustLen);
      ctx.lineTo(4, 7);
      ctx.closePath();
      ctx.fill();

      // Drone Chassis (Sleek Angular Delta Wingman)
      ctx.beginPath();
      ctx.moveTo(0, -14); // Nose
      ctx.lineTo(9, 2);   // Right wingtip
      ctx.lineTo(6, 8);   // Right tail
      ctx.lineTo(2, 6);   // Engine inlet
      ctx.lineTo(-2, 6);  // Engine inlet
      ctx.lineTo(-6, 8);  // Left tail
      ctx.lineTo(-9, 2);  // Left wingtip
      ctx.closePath();

      // Gradient Fill
      const grad = ctx.createLinearGradient(0, -14, 0, 8);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, drone.color);
      grad.addColorStop(1, '#091322');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = drone.accentColor;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Optical Core Lens / Sensor Eye
      ctx.fillStyle = isS ? '#fbbf24' : isA ? '#c084fc' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Mini Wing Guns
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-8, -4, 2, 8);
      ctx.fillRect(6, -4, 2, 8);

      // Overclock Electric Sparks dancing on drone
      if (this.droneOverclockTimer > 0) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, (Math.random() - 0.5) * 12);
        ctx.lineTo(10, (Math.random() - 0.5) * 12);
        ctx.stroke();
      }

      // DR-88 Lôi Vân Kích S: Tia điện nhỏ lách tách quanh cánh cực điện
      if (drone.id === 'drone_thunder_storm_s') {
        const t = now * 0.007;
        ctx.strokeStyle = Math.sin(t * 6) > 0 ? '#38bdf8' : '#facc15';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const jx = (Math.random() - 0.5) * 6;
        const jy = (Math.random() - 0.5) * 4;
        ctx.moveTo(-8, -4);
        ctx.lineTo(jx, -10 + jy);
        ctx.lineTo(8, -4);
        ctx.stroke();

        // Tip lightning prongs micro-glow
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8.5, -5, 3, 2);
        ctx.fillRect(5.5, -5, 3, 2);
      }

      ctx.restore();
    }
  }

  private drawEnemy(e: Enemy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(e.x, e.y);

    // Chicken Invaders 4 Adventure Minions
    if (e.isChickenInvader) {
      drawChickenInvader(ctx, e);
      if (e.isShielded) {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (e.type !== 'boss' && e.hp < e.maxHp) {
        const barW = e.width;
        const barH = 3;
        const pct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-barW / 2, -e.height / 2 - 8, barW, barH);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-barW / 2, -e.height / 2 - 8, barW * pct, barH);
      }
      ctx.restore();
      return;
    }

    // Chicken Invaders 4 Adventure Bosses (20 distinct bosses)
    if (e.type === 'boss' && e.adventureBossShape) {
      drawChickenBoss(ctx, e);
      if (e.isShielded) {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      return;
    }

    const isHitFlash = e.hitFlashTimer > 0;

    // Alien Bio-Monsters and Villainous Combat Aircraft Renderers (All non-adventure modes)
    if (e.type === 'boss') {
      drawVillainFlagshipBoss(ctx, e.timeAlive, isHitFlash, Boolean(e.hp / e.maxHp <= 0.35), e.phase || 1);
    } else if (e.type === 'cruiser') {
      drawVillainObsidianCruiser(ctx, isHitFlash);
    } else if (e.type === 'destroyer') {
      drawAlienBioRavager(ctx, e.timeAlive, isHitFlash);
    } else if (e.type === 'stealth_phantom') {
      drawVillainNightWraith(ctx, isHitFlash);
    } else if (e.type === 'carrier') {
      drawAlienHiveBroodmother(ctx, e.timeAlive, isHitFlash);
    } else if (e.type === 'viper') {
      drawAlienMantisHunter(ctx, e.timeAlive, isHitFlash);
    } else if (e.type === 'plasma_mortar') {
      drawVillainSiegeFortress(ctx, isHitFlash);
    } else if (e.type === 'spectre_assassin') {
      drawAlienVoidJellyfish(ctx, e.timeAlive, isHitFlash);
    } else if (e.type === 'shield_drone') {
      drawVillainAegisDrone(ctx, e.timeAlive, isHitFlash);
    } else if (e.type === 'vanguard_missile_frigate') {
      drawVillainMissileFrigate(ctx, isHitFlash);
    } else if (e.type === 'kamikaze') {
      drawAlienBioMine(ctx, e.timeAlive, isHitFlash);
    } else {
      drawVillainRazorScout(ctx, isHitFlash, e.color || '#ef4444');
    }

    // Color-Coded Resource Variant Tactical Visuals:
    // - Gold: Pulsing golden ring + '★ VÀNG' badge
    // - Shield: Pulsing cyan hexagonal ring + '🛡️ GIÁP' badge
    // - Energy: Pulsing emerald ring + '⚡ NĂNG LƯỢNG' badge
    if (e.resourceVariant && e.type !== 'boss') {
      ctx.save();
      const pulseTime = performance.now();
      const pulseRing = 1 + Math.sin(pulseTime * 0.008 + e.id) * 0.12;
      const ringColor =
        e.resourceVariant === 'gold'
          ? '#fbbf24'
          : e.resourceVariant === 'shield'
          ? '#38bdf8'
          : '#10b981';
      const labelText =
        e.resourceVariant === 'gold'
          ? '★ VÀNG'
          : e.resourceVariant === 'shield'
          ? '🛡️ GIÁP'
          : '⚡ LÕI';

      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 2.0;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, (e.radius + 8) * pulseRing, 0, Math.PI * 2);
      ctx.stroke();

      // Tactical resource tag above enemy
      ctx.font = 'bold 8px "Orbitron", sans-serif';
      ctx.fillStyle = ringColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(labelText, 0, -e.height / 2 - 14);
      ctx.restore();
    }

    // Protective energy bubble if shielded by a Shield Drone
    if (e.isShielded) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Mini HP & Armor bar for damaged heavy enemies, cruisers, or armored enemies
    if (e.type !== 'boss' && (e.hp < e.maxHp || (e.maxArmor && e.maxArmor > 0))) {
      const barW = Math.max(e.width, 36);
      const barH = 3.5;
      const pct = Math.max(0, e.hp / e.maxHp);
      const hasArmor = Boolean(e.maxArmor && e.maxArmor > 0);
      const topOffset = hasArmor ? -e.height / 2 - 14 : -e.height / 2 - 8;

      // Thanh Máu (Health bar)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(-barW / 2, topOffset, barW, barH);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-barW / 2, topOffset, barW * pct, barH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-barW / 2, topOffset, barW, barH);

      // Thanh Giáp dưới thanh máu (Armor bar under HP bar)
      if (hasArmor && e.maxArmor) {
        const armorPct = Math.max(0, (e.armor || 0) / e.maxArmor);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(-barW / 2, topOffset + 4.5, barW, barH);
        ctx.fillStyle = '#06b6d4'; // Cyan giáp công nghệ
        ctx.fillRect(-barW / 2, topOffset + 4.5, barW * armorPct, barH);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-barW / 2, topOffset + 4.5, barW, barH);
      }
    }

    ctx.restore();
  }

  private drawStar(
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
    fill: string,
    stroke?: string
  ) {
    const ctx = this.ctx;
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  private drawBullet(b: Bullet) {
    const ctx = this.ctx;
    ctx.save();

    if (b.isEggBullet) {
      drawEggBullet(ctx, b);
      ctx.restore();
      return;
    }

    if (b.isSakuraBullet || b.isSmallSakuraBullet) {
      ctx.translate(b.x, b.y);
      if (b.starRotation !== undefined) {
        ctx.rotate(b.starRotation);
      }
      const isSmall = b.isSmallSakuraBullet;
      const petR = isSmall ? 7 : 13;
      const petW = isSmall ? 2.8 : 5.0;

      // Draw 5-Petal Sakura Blossom Flower Projectile (Hoa Anh Đào 5 cánh)
      ctx.shadowColor = 'rgba(244, 114, 182, 0.9)';
      ctx.shadowBlur = isSmall ? 8 : 14;

      for (let p = 0; p < 5; p++) {
        const petAng = (p * Math.PI * 2) / 5;
        ctx.save();
        ctx.rotate(petAng);

        const pGrad = ctx.createLinearGradient(0, 0, 0, -petR);
        pGrad.addColorStop(0, '#ffffff');
        pGrad.addColorStop(0.3, '#fbcfe8');
        pGrad.addColorStop(0.85, '#f472b6');
        pGrad.addColorStop(1, '#e11d48');
        ctx.fillStyle = pGrad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-petW, -petR * 0.35, -petW * 1.15, -petR * 0.9, -petW * 0.45, -petR);
        ctx.lineTo(0, -petR * 0.82); // Authentic Sakura petal tip notch
        ctx.lineTo(petW * 0.45, -petR);
        ctx.bezierCurveTo(petW * 1.15, -petR * 0.9, petW, -petR * 0.35, 0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      // Golden center stamen
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, isSmall ? 2.0 : 3.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    if (b.isStarBullet || b.isSmallStarBullet || b.isMegaStarSkill || b.isMediumStarBullet || b.isSkillMiniStar) {
      ctx.translate(b.x, b.y);
      if (b.starRotation !== undefined) {
        ctx.rotate(b.starRotation);
      }
      if (b.isMegaStarSkill) {
        // High-speed GPU dual-layer glowing celestial nova star
        this.drawStar(0, 0, 5, 30, 13, 'rgba(251, 191, 36, 0.35)');
        this.drawStar(0, 0, 5, 24, 10, '#fbbf24', '#ffffff');
        this.drawStar(0, 0, 5, 12, 5, '#ffffff');
      } else if (b.isStarBullet) {
        // High-speed dual-layer star
        this.drawStar(0, 0, 5, 16, 7, 'rgba(250, 204, 21, 0.35)');
        this.drawStar(0, 0, 5, 12, 5, '#facc15', '#ffffff');
        this.drawStar(0, 0, 5, 5, 2.2, '#ffffff');
      } else if (b.isMediumStarBullet) {
        this.drawStar(0, 0, 5, 12, 5.5, 'rgba(253, 224, 71, 0.35)');
        this.drawStar(0, 0, 5, 9, 4, '#fde047', '#ffffff');
      } else {
        this.drawStar(0, 0, 5, 8, 3.5, 'rgba(254, 240, 138, 0.4)');
        this.drawStar(0, 0, 5, 6, 2.5, '#fef08a', '#ffffff');
      }
      ctx.restore();
      return;
    }

    if (b.isLaserBeam) {
      const isHyper = b.color === '#f43f5e' || b.color === '#fb7185';
      const beamW = isHyper ? 8 : 4;
      const beamLen = isHyper ? 44 : 24;

      ctx.strokeStyle = b.color;
      ctx.lineWidth = beamW + 4;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + beamLen);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = b.color;
      ctx.lineWidth = beamW;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + beamLen);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isHyper ? 2.8 : 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + beamLen);
      ctx.stroke();
    } else if (b.isDroneLightningBolt) {
      // Tia điện nhỏ DR-88 Lôi Vân Kích S (Signature Drone của RTS-88)
      const beamLen = 22;
      const jag = ((b.id % 5) - 2) * 2.5;

      // Outer cyan aura (zero shadowBlur for high performance)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(b.x - jag, b.y + beamLen);
      ctx.lineTo(b.x + jag, b.y + beamLen * 0.5);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Main Electric Bolt
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(b.x - jag * 0.8, b.y + beamLen);
      ctx.lineTo(b.x + jag * 0.8, b.y + beamLen * 0.5);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Golden fork micro-spark
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(b.x + jag, b.y + beamLen * 0.7);
      ctx.lineTo(b.x - jag * 0.5, b.y + beamLen * 0.3);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Intense white lightning core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + beamLen);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Tip electric spark glow
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isLightningOrb) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (b.isCryoIce) {
      // Ice crystal diamond shard
      ctx.translate(b.x, b.y);
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, 9);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (b.isSingularityVortex) {
      // Spinning quantum vortex ring
      ctx.translate(b.x, b.y);
      ctx.rotate(performance.now() * 0.01);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isSolarFireball) {
      // Blazing solar fire core
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#eab308';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (b.isTachyonBeam) {
      // Emerald relativistic beam
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 20);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 20);
      ctx.stroke();
    } else if (b.isAntimatter) {
      // Heavy dark red antimatter shell
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    } else if (b.isValkyrieLance) {
      // Radiant Holy Lance Beam
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 28);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - 2);
      ctx.lineTo(b.x, b.y + 26);
      ctx.stroke();
    } else if (b.isCosmicPulsar) {
      // Swirling Cosmic Pulsar Sphere
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#f0abfc';
      ctx.fill();
    } else if (b.isSawblade) {
      // Whirring Sawblade Disc
      ctx.translate(b.x, b.y);
      ctx.rotate(performance.now() * 0.02);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // Teeth lines
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 4, Math.sin(ang) * 4);
        ctx.lineTo(Math.cos(ang) * (b.radius + 3), Math.sin(ang) * (b.radius + 3));
        ctx.stroke();
      }
    } else if (b.isSonicWave) {
      // Oscillating Sonic Ring Arc
      ctx.translate(b.x, b.y);
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius + 2, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      ctx.strokeStyle = '#5eead4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius - 2, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
    } else if (b.isAcidDart) {
      // Corrosive Acid Dart
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 16);
      ctx.stroke();
      ctx.fillStyle = '#bef264';
      ctx.beginPath();
      ctx.arc(b.x, b.y - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isGatlingRounds) {
      // Fast minigun kinetic streak
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 14);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 10);
      ctx.stroke();
    } else if (b.isShockPulse) {
      // Heavy Concussive Shockwave Ring
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
    } else if (b.isHoming) {
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2.5, -7, 5, 14);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(3, -7);
      ctx.lineTo(-3, -7);
    } else if (b.isDragonFlame) {
      // Violet void dragonflame
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#f5d0fe';
      ctx.fill();
    } else if (b.isGammaBeam) {
      // Cyan piercing gamma radiation beam
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 36);
      ctx.stroke();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 36);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 36);
      ctx.stroke();
    } else if (b.isWormholeBullet) {
      // Emerald quantum rift orb
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (b.isNaniteSwarm) {
      // Swarm of 3 micro lime-green nanite sparks
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
      ctx.fillStyle = '#a3e635';
      ctx.fillRect(b.x + 3, b.y + 1, 3, 3);
      ctx.fillRect(b.x - 3, b.y + 2, 3, 3);
    } else if (b.isHydraPlasma) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (b.isPrismLaser) {
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.025, b.y - b.vy * 0.025);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    } else if (b.isHelixBullet) {
      // Helix kinetic stardust wave
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (b.isRiftBlade) {
      // Curved crescent dimensional blade
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
      ctx.fillStyle = '#a855f7';
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.lineTo(0, -b.radius * 1.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (b.isRiftTrap) {
      // Persistent dimensional void crack
      ctx.translate(b.x, b.y);
      const pulse = 1 + Math.sin(performance.now() * 0.015) * 0.2;
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
      ctx.lineWidth = 6 * pulse;
      ctx.beginPath();
      ctx.arc(0, 0, b.radius * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.ellipse(0, 0, b.radius * 0.7 * pulse, b.radius * 0.3 * pulse, performance.now() * 0.003, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isNapalmCore) {
      // Incandescent Napalm Core
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    } else if (b.isNapalmEmber) {
      // Burning falling ember droplet
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#fb923c';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (b.isEchoResonant) {
      // Concentric acoustic temporal rings
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isGravitonHarpoon) {
      // Needle-sharp supersonic magnetic spike
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 32);
      ctx.stroke();
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 32);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + 24);
      ctx.stroke();
    } else if (b.isGravitonPulse) {
      // Expanding gravitational shock ring
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (b.isBioSpore) {
      // Organic emerald pod
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.fillStyle = '#a3e635';
      ctx.beginPath();
      ctx.arc(b.x - 2, b.y - 1, 2, 0, Math.PI * 2);
      ctx.arc(b.x + 2, b.y + 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isSporeNeedle) {
      // Seeking toxic needle
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.isBossLaserBeam) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.05, b.y - b.vy * 0.05);
      ctx.stroke();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (b.isBossMortarShell) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (b.isBossGravitonOrb) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#090514';
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
    } else if (b.isBossEmpOrb) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      if (b.isPlayer) {
        // High-velocity plasma slug with aerodynamic energy comet tail
        const velAngle = Math.atan2(b.vy, b.vx);
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const tailLen = Math.min(22, Math.max(10, speed * 0.035 + b.radius * 2.2));

        ctx.translate(b.x, b.y);
        ctx.rotate(velAngle + Math.PI / 2);

        // Outer radiant glow aura
        const glowGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, b.radius + 6);
        glowGrad.addColorStop(0, `${b.color}99`);
        glowGrad.addColorStop(0.5, `${b.color}44`);
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Tapered energy comet trail
        const trailGrad = ctx.createLinearGradient(0, -b.radius, 0, tailLen);
        trailGrad.addColorStop(0, '#ffffff');
        trailGrad.addColorStop(0.35, b.color);
        trailGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.moveTo(-b.radius * 0.85, 0);
        ctx.lineTo(0, tailLen);
        ctx.lineTo(b.radius * 0.85, 0);
        ctx.closePath();
        ctx.fill();

        // Searing white core projectile
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, b.radius * 0.65, b.radius * 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Menacing pulsing enemy plasma orb with sinister danger aura
        const pulse = 1.0 + Math.sin(performance.now() * 0.015) * 0.15;
        // Danger warning halo
        ctx.beginPath();
        ctx.arc(b.x, b.y, (b.radius + 4) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.fill();

        // Outer danger ring
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color || '#ef4444';
        ctx.fill();

        // Dark dense core ring
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = '#450a0a';
        ctx.fill();

        // Incandescent white pinpoint highlight
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
