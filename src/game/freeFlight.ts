/**
 * Free Flight & Galaxy Sightseeing System (Du Ngoạn Thiên Hà)
 * Provides a massive 6000x6000px expansive open-space galaxy canvas,
 * 360-degree omnidirectional flight physics, celestial landmarks,
 * radiant nebulae, warp boost, and cinematic photo mode.
 */


export interface CelestialLandmark {
  id: string;
  name: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  radius: number;
  themeColor: string;
  accentColor: string;
  description: string;
}

export const GALAXY_WORLD_WIDTH = 6000;
export const GALAXY_WORLD_HEIGHT = 6000;

export const CELESTIAL_LANDMARKS: CelestialLandmark[] = [
  {
    id: 'galactic_core',
    name: 'Tâm Thiên Hà Xoắn Ốc Sáng Rực',
    title: 'Trái Tim Dải Ngân Hà',
    icon: '🌀',
    x: 3000,
    y: 3000,
    radius: 420,
    themeColor: '#38bdf8',
    accentColor: '#c084fc',
    description: 'Tâm chấn thiên hà rực sáng với hàng tỉ ngôi sao quay quanh luồng ánh sáng lượng tử huyền bí.',
  },
  {
    id: 'pillars_of_creation',
    name: 'Trụ Cột Sáng Tạo · Tinh Vân Đại Bàng',
    title: 'Vườn Ươm Vì Sao Cổ Đại',
    icon: '🦅',
    x: 1400,
    y: 1400,
    radius: 350,
    themeColor: '#10b981',
    accentColor: '#fbbf24',
    description: 'Những cột mây khí và bụi khổng lồ cao hàng năm ánh sáng, nơi muôn vì sao mới được sinh ra.',
  },
  {
    id: 'saturn_prime',
    name: 'Hành Tinh Khí Saturn-Prime & Vành Đai Băng',
    title: 'Kỳ Quan Vành Đai Pha Lê',
    icon: '🪐',
    x: 4600,
    y: 1500,
    radius: 380,
    themeColor: '#f59e0b',
    accentColor: '#38bdf8',
    description: 'Hành tinh khí khổng lồ với vành đai thạch anh lấp lánh phản chiếu ánh sáng các chòm sao xa xôi.',
  },
  {
    id: 'aurora_veil',
    name: 'Vực Thẳm Cực Quang Hồng Tím Borealis',
    title: 'Dải Lụa Cực Quang Vô Tận',
    icon: '🌌',
    x: 1500,
    y: 4600,
    radius: 360,
    themeColor: '#ec4899',
    accentColor: '#8b5cf6',
    description: 'Dải ruy băng cực quang ion hóa mềm mại uốn lượn huyền ảo giữa không gian tĩnh lặng.',
  },
  {
    id: 'binary_pulsar',
    name: 'Cụm Sao Đôi Pha Lê Song Sinh',
    title: 'Điệu Nhảy Của Hai Vì Tinh Tú',
    icon: '⭐',
    x: 4600,
    y: 4600,
    radius: 320,
    themeColor: '#06b6d4',
    accentColor: '#f43f5e',
    description: 'Cặp sao đôi lam ngọc và huyết thạch quay quanh nhau với nhịp đập ánh sáng rực rỡ.',
  },
  {
    id: 'ancient_station',
    name: 'Trạm Quan Sát Tiền Tiêu Cổ Đại',
    title: 'Di Tích Nền Văn Minh Cổ',
    icon: '🛸',
    x: 3000,
    y: 1100,
    radius: 300,
    themeColor: '#00f2fe',
    accentColor: '#10b981',
    description: 'Cấu trúc hình học kỳ vĩ của nền văn minh cổ đại lơ lửng ngắm nhìn toàn cảnh dải ngân hà.',
  },
];

export interface GalaxyTheme {
  name: string;
  vietnameseTitle: string;
  bgGradStart: string;
  bgGradMid: string;
  bgGradEnd: string;
  nebulaColor1: string;
  nebulaColor2: string;
  starColors: string[];
}

export const GALAXY_THEMES: GalaxyTheme[] = [
  {
    name: 'Xanh Lam Kỳ Bí',
    vietnameseTitle: 'Ngân Hà Lam Ngọc Hoang Sơ',
    bgGradStart: '#020617',
    bgGradMid: '#082f49',
    bgGradEnd: '#030712',
    nebulaColor1: 'rgba(56, 189, 248, 0.16)',
    nebulaColor2: 'rgba(168, 85, 247, 0.14)',
    starColors: ['#ffffff', '#bae6fd', '#38bdf8', '#c084fc'],
  },
  {
    name: 'Cực Quang Hồng Tím',
    vietnameseTitle: 'Vực Thẳm Cực Quang Nebula',
    bgGradStart: '#090214',
    bgGradMid: '#3b0764',
    bgGradEnd: '#03020c',
    nebulaColor1: 'rgba(236, 72, 153, 0.18)',
    nebulaColor2: 'rgba(192, 132, 252, 0.16)',
    starColors: ['#ffffff', '#fbcfe8', '#f472b6', '#e879f9'],
  },
  {
    name: 'Hoàng Kim Thái Dương',
    vietnameseTitle: 'Vùng Sáng Tinh Tú Hoàng Kim',
    bgGradStart: '#0a0600',
    bgGradMid: '#451a03',
    bgGradEnd: '#050301',
    nebulaColor1: 'rgba(251, 191, 36, 0.18)',
    nebulaColor2: 'rgba(249, 115, 22, 0.14)',
    starColors: ['#ffffff', '#fef08a', '#f59e0b', '#fb923c'],
  },
  {
    name: 'Ngọc Bích Lượng Tử',
    vietnameseTitle: 'Biển Sao Ngọc Bích Emerald',
    bgGradStart: '#01140e',
    bgGradMid: '#064e3b',
    bgGradEnd: '#010906',
    nebulaColor1: 'rgba(52, 211, 153, 0.18)',
    nebulaColor2: 'rgba(45, 212, 191, 0.14)',
    starColors: ['#ffffff', '#a7f3d0', '#10b981', '#38bdf8'],
  },
  {
    name: 'Hỏa Ngục Dung Nham',
    vietnameseTitle: 'Dải Tinh Vân Hỏa Long',
    bgGradStart: '#120205',
    bgGradMid: '#4c0519',
    bgGradEnd: '#050102',
    nebulaColor1: 'rgba(244, 63, 94, 0.18)',
    nebulaColor2: 'rgba(251, 113, 133, 0.14)',
    starColors: ['#ffffff', '#fecdd3', '#f43f5e', '#fbbf24'],
  },
];

export interface FreeFlightState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // In radians, 0 is pointing up (-Y)
  speed: number;
  boostMultiplier: number;
  isBoosting: boolean;
  boostEnergy: number; // 0 to 100
  themeIndex: number;
  isPhotoMode: boolean;
  cameraZoom: number; // 0.6x to 1.4x
}

export function initFreeFlightState(): FreeFlightState {
  return {
    x: 3000, // Spawn near center
    y: 3350,
    vx: 0,
    vy: -150,
    angle: 0,
    speed: 150,
    boostMultiplier: 1.0,
    isBoosting: false,
    boostEnergy: 100,
    themeIndex: 0,
    isPhotoMode: false,
    cameraZoom: 1.0,
  };
}

export interface FreeFlightInput {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  isBoosting: boolean;
}

/**
 * Updates free flight physics with smooth 360-degree rotation and inertia.
 */
export function updateFreeFlightPhysics(
  state: FreeFlightState,
  input: FreeFlightInput,
  dt: number,
  baseCruiseSpeed: number = 320
): FreeFlightState {
  let { x, y, vx, vy, angle, boostEnergy, themeIndex, isPhotoMode, cameraZoom } = state;

  const hasDirectionalInput = Math.hypot(input.moveX, input.moveY) > 0.15;
  const targetAngle = hasDirectionalInput ? Math.atan2(input.moveX, -input.moveY) : angle;

  // Smooth angular interpolation
  let angleDiff = targetAngle - angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  angle += angleDiff * Math.min(1.0, dt * 7.5);

  // Boost handling
  const canBoost = input.isBoosting && boostEnergy > 5;
  const isBoosting = canBoost;
  if (isBoosting) {
    boostEnergy = Math.max(0, boostEnergy - dt * 28);
  } else {
    boostEnergy = Math.min(100, boostEnergy + dt * 18);
  }

  const currentBoostMultiplier = isBoosting ? 2.6 : 1.0;
  const targetSpeed = baseCruiseSpeed * currentBoostMultiplier;

  // Move in heading direction or towards input vector
  const moveHeadingX = hasDirectionalInput ? input.moveX : Math.sin(angle);
  const moveHeadingY = hasDirectionalInput ? input.moveY : -Math.cos(angle);
  const moveLen = Math.hypot(moveHeadingX, moveHeadingY) || 1;
  const normX = moveHeadingX / moveLen;
  const normY = moveHeadingY / moveLen;

  const targetVx = normX * targetSpeed;
  const targetVy = normY * targetSpeed;

  const accelRate = isBoosting ? 6.0 : 4.0;
  vx += (targetVx - vx) * Math.min(1.0, dt * accelRate);
  vy += (targetVy - vy) * Math.min(1.0, dt * accelRate);

  x += vx * dt;
  y += vy * dt;

  // Bound within expansive world with smooth wrap-around
  if (x < 0) x += GALAXY_WORLD_WIDTH;
  if (x >= GALAXY_WORLD_WIDTH) x -= GALAXY_WORLD_WIDTH;
  if (y < 0) y += GALAXY_WORLD_HEIGHT;
  if (y >= GALAXY_WORLD_HEIGHT) y -= GALAXY_WORLD_HEIGHT;

  const speed = Math.hypot(vx, vy);

  return {
    x,
    y,
    vx,
    vy,
    angle,
    speed,
    boostMultiplier: currentBoostMultiplier,
    isBoosting,
    boostEnergy,
    themeIndex,
    isPhotoMode,
    cameraZoom,
  };
}

/**
 * Finds the closest landmark to the player coordinates.
 */
export function getClosestLandmark(
  x: number,
  y: number
): { landmark: CelestialLandmark; distance: number; bearingDegrees: number } {
  let closest = CELESTIAL_LANDMARKS[0];
  let minDistance = Infinity;

  for (const lm of CELESTIAL_LANDMARKS) {
    const dx = lm.x - x;
    const dy = lm.y - y;
    const d = Math.hypot(dx, dy);
    if (d < minDistance) {
      minDistance = d;
      closest = lm;
    }
  }

  const dx = closest.x - x;
  const dy = closest.y - y;
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (angle < 0) angle += 360;

  return {
    landmark: closest,
    distance: Math.round(minDistance),
    bearingDegrees: Math.round(angle),
  };
}
