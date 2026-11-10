/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';
export type FpsTarget = 30 | 60 | 120;

export type BlackHoleColor = 'gold' | 'crimson' | 'violet' | 'cyan' | 'emerald' | 'prismatic';

export type SceneryType =
  | 'galaxy'            // Dải Ngân Hà (Milky Way / Spiral Galaxy)
  | 'deep_space'        // Vũ Trụ (Deep Cosmos / Quasars & Gas Giants)
  | 'nebula'            // Sao Tinh Vân (Nebula Starfield & Pillars)
  | 'aeon_bay'          // Vịnh Máy Ngọc Lam (Emerald Aeon Bay)
  | 'hangar_bay_violet' // Vịnh Máy Tím Neon (Neon Violet Cyber Bay)
  | 'hangar_bay_cyan'   // Vịnh Máy Lôi Quang (Electric Cyan Lightning Bay)
  | 'hangar_bay_gold'   // Vịnh Máy Hoàng Kim (Royal Sovereign Gold Bay)
  | 'hangar_bay_crimson'// Vịnh Máy Huyết Nguyệt (Crimson Plasma Bay)
  | 'black_hole_gold'   // Hố Đen Hoàng Kim
  | 'black_hole_crimson'// Hố Đen Huyết Nguyệt
  | 'black_hole_violet' // Hố Đen Tím Hư Không
  | 'black_hole_cyan'   // Hố Đen Lam Băng
  | 'black_hole_emerald'// Hố Đen Ngọc Lục Bảo
  | 'black_hole_prismatic'; // Hố Đen Thần Thoại Cầu Vồng

export interface SceneryConfig {
  id: SceneryType;
  category: 'galaxy' | 'deep_space' | 'nebula' | 'aeon_bay' | 'black_hole';
  name: string;
  categoryName: string;
  description: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  ambientGlow: string;
  starColors: string[];
  blackHoleColor?: BlackHoleColor;
}

export const SCENERY_CONFIGS: Record<SceneryType, SceneryConfig> = {
  galaxy: {
    id: 'galaxy',
    category: 'galaxy',
    name: 'Dải Ngân Hà',
    categoryName: 'Dải Ngân Hà',
    description: 'Vòng xoáy thiên hà rực rỡ với hàng tỉ vì tinh tú và lõi sáng ngân hà bừng nở.',
    icon: '🌀',
    primaryColor: '#06b6d4',
    secondaryColor: '#8b5cf6',
    accentColor: '#38bdf8',
    ambientGlow: 'rgba(6, 182, 212, 0.25)',
    starColors: ['#ffffff', '#bae6fd', '#c4b5fd', '#fef08a'],
  },
  deep_space: {
    id: 'deep_space',
    category: 'deep_space',
    name: 'Vũ Trụ Thâm Uyên',
    categoryName: 'Vũ Trụ',
    description: 'Khoảng không vô tận của vũ trụ sâu thẳm, tĩnh lặng và lấp lánh các quasar triệu năm ánh sáng.',
    icon: '🌌',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e1b4b',
    accentColor: '#60a5fa',
    ambientGlow: 'rgba(59, 130, 246, 0.2)',
    starColors: ['#ffffff', '#e0f2fe', '#93c5fd', '#fcd34d'],
  },
  nebula: {
    id: 'nebula',
    category: 'nebula',
    name: 'Sao Tinh Vân Orion',
    categoryName: 'Sao Tinh Vân',
    description: 'Đám mây bụi khí tinh vân rực cháy sắc hồng tím, nơi ươm mầm các vì sao siêu mới.',
    icon: '✨',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    accentColor: '#f43f5e',
    ambientGlow: 'rgba(236, 72, 153, 0.3)',
    starColors: ['#ffffff', '#fbcfe8', '#e9d5ff', '#fed7aa'],
  },
  aeon_bay: {
    id: 'aeon_bay',
    category: 'aeon_bay',
    name: 'Vịnh Máy Ngọc Lam (Aeon Bay)',
    categoryName: 'Vịnh Máy',
    description: 'Vịnh hải lưu vũ trụ xanh ngọc lam tuyệt mỹ với cực quang Aeon uốn lượn lấp lánh.',
    icon: '🌊',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    accentColor: '#34d399',
    ambientGlow: 'rgba(16, 185, 129, 0.28)',
    starColors: ['#ffffff', '#a7f3d0', '#67e8f9', '#fef9c3'],
  },
  hangar_bay_violet: {
    id: 'hangar_bay_violet',
    category: 'aeon_bay',
    name: 'Vịnh Máy Tím Neon (Cyber Violet)',
    categoryName: 'Vịnh Máy',
    description: 'Sơ đồ vịnh máy Tím Neon tương lai rực rỡ, ánh sáng LED tím cực quang đồng điệu cùng RTS-88 Tím Neon.',
    icon: '🟣',
    primaryColor: '#a855f7',
    secondaryColor: '#d946ef',
    accentColor: '#c084fc',
    ambientGlow: 'rgba(168, 85, 247, 0.35)',
    starColors: ['#ffffff', '#e9d5ff', '#f5d0fe', '#fae8ff'],
  },
  hangar_bay_cyan: {
    id: 'hangar_bay_cyan',
    category: 'aeon_bay',
    name: 'Vịnh Máy Lôi Quang (Electric Cyan)',
    categoryName: 'Vịnh Máy',
    description: 'Sơ đồ vịnh máy Lôi Quang xanh điện lực cao thế, chùm sáng bảo dưỡng ion và đường băng plasma xanh lam.',
    icon: '⚡',
    primaryColor: '#00f0ff',
    secondaryColor: '#0284c7',
    accentColor: '#38bdf8',
    ambientGlow: 'rgba(0, 240, 255, 0.35)',
    starColors: ['#ffffff', '#bae6fd', '#e0f2fe', '#7dd3fc'],
  },
  hangar_bay_gold: {
    id: 'hangar_bay_gold',
    category: 'aeon_bay',
    name: 'Vịnh Máy Hoàng Kim (Royal Sovereign)',
    categoryName: 'Vịnh Máy',
    description: 'Sơ đồ vịnh máy mạ vàng hoàng gia 24K quyền uy, dải đèn halo vàng hổ phách và năng lượng mặt trời.',
    icon: '👑',
    primaryColor: '#f59e0b',
    secondaryColor: '#b45309',
    accentColor: '#fde047',
    ambientGlow: 'rgba(245, 158, 11, 0.32)',
    starColors: ['#ffffff', '#fef08a', '#fed7aa', '#fde68a'],
  },
  hangar_bay_crimson: {
    id: 'hangar_bay_crimson',
    category: 'aeon_bay',
    name: 'Vịnh Máy Huyết Nguyệt (Crimson Flame)',
    categoryName: 'Vịnh Máy',
    description: 'Sơ đồ vịnh máy hỏa ngục đỏ thẫm rực cháy, trường nhiệt hạch phản ứng nhanh và đèn cảnh báo đỏ ruby.',
    icon: '🔥',
    primaryColor: '#ef4444',
    secondaryColor: '#991b1b',
    accentColor: '#f87171',
    ambientGlow: 'rgba(239, 68, 68, 0.35)',
    starColors: ['#ffffff', '#fecaca', '#fee2e2', '#fca5a5'],
  },
  black_hole_gold: {
    id: 'black_hole_gold',
    category: 'black_hole',
    name: 'Hố Đen Hoàng Kim',
    categoryName: 'Hố Đen',
    description: 'Đĩa bồi tụ vàng rực của siêu hố đen Sagittarius A* uốn cong ánh sáng vũ trụ.',
    icon: '🕳️',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    accentColor: '#fde047',
    ambientGlow: 'rgba(245, 158, 11, 0.35)',
    starColors: ['#ffffff', '#fef08a', '#fed7aa', '#fde68a'],
    blackHoleColor: 'gold',
  },
  black_hole_crimson: {
    id: 'black_hole_crimson',
    category: 'black_hole',
    name: 'Hố Đen Huyết Nguyệt',
    categoryName: 'Hố Đen',
    description: 'Chân trời sự kiện đỏ thẫm rực lửa, phóng ra luồng tia plasma tử thần hủy diệt.',
    icon: '🔴',
    primaryColor: '#ef4444',
    secondaryColor: '#991b1b',
    accentColor: '#f87171',
    ambientGlow: 'rgba(239, 68, 68, 0.35)',
    starColors: ['#ffffff', '#fecaca', '#fca5a5', '#fee2e2'],
    blackHoleColor: 'crimson',
  },
  black_hole_violet: {
    id: 'black_hole_violet',
    category: 'black_hole',
    name: 'Hố Đen Tím Hư Không',
    categoryName: 'Hố Đen',
    description: 'Điểm kỳ dị màu tím thẫm của bóng tối vĩnh hằng nuốt chửng mọi vật chất.',
    icon: '🟣',
    primaryColor: '#a855f7',
    secondaryColor: '#581c87',
    accentColor: '#c084fc',
    ambientGlow: 'rgba(168, 85, 247, 0.35)',
    starColors: ['#ffffff', '#e9d5ff', '#ddd6fe', '#f3e8ff'],
    blackHoleColor: 'violet',
  },
  black_hole_cyan: {
    id: 'black_hole_cyan',
    category: 'black_hole',
    name: 'Hố Đen Lam Băng Cygnus',
    categoryName: 'Hố Đen',
    description: 'Vòng bồi tụ lượng tử phát ra bức xạ Hawking xanh băng giá cực đại.',
    icon: '🔷',
    primaryColor: '#06b6d4',
    secondaryColor: '#0e7490',
    accentColor: '#67e8f9',
    ambientGlow: 'rgba(6, 182, 212, 0.35)',
    starColors: ['#ffffff', '#cffafe', '#a5f3fc', '#e0f2fe'],
    blackHoleColor: 'cyan',
  },
  black_hole_emerald: {
    id: 'black_hole_emerald',
    category: 'black_hole',
    name: 'Hố Đen Ngọc Lục Bảo',
    categoryName: 'Hố Đen',
    description: 'Lực hấp dẫn phản vật chất tỏa ánh sáng ngọc bích huyền bí giữa không gian.',
    icon: '🟢',
    primaryColor: '#10b981',
    secondaryColor: '#047857',
    accentColor: '#6ee7b7',
    ambientGlow: 'rgba(16, 185, 129, 0.35)',
    starColors: ['#ffffff', '#d1fae5', '#a7f3d0', '#ecfdf5'],
    blackHoleColor: 'emerald',
  },
  black_hole_prismatic: {
    id: 'black_hole_prismatic',
    category: 'black_hole',
    name: 'Hố Đen Thần Thoại Cầu Vồng',
    categoryName: 'Hố Đen',
    description: 'Quasar siêu cổ đại phát tán dải quang phổ bảy sắc cầu vồng rực rỡ.',
    icon: '🌈',
    primaryColor: '#f43f5e',
    secondaryColor: '#8b5cf6',
    accentColor: '#38bdf8',
    ambientGlow: 'rgba(236, 72, 153, 0.35)',
    starColors: ['#ffffff', '#fbcfe8', '#bae6fd', '#fde047'],
    blackHoleColor: 'prismatic',
  },
};

export const ALL_SCENERIES: SceneryConfig[] = Object.values(SCENERY_CONFIGS);

export const BLACK_HOLE_VARIANTS: SceneryConfig[] = ALL_SCENERIES.filter(
  (s) => s.category === 'black_hole'
);

export const HANGAR_BAY_VARIANTS: SceneryConfig[] = ALL_SCENERIES.filter(
  (s) => s.category === 'aeon_bay'
);

export interface GameSettings {
  graphicsQuality: GraphicsQuality;
  fpsTarget: FpsTarget;
  isMuted: boolean;
  activeScenery: SceneryType;
}

export const DEFAULT_SETTINGS: GameSettings = {
  graphicsQuality: 'high',
  fpsTarget: 60,
  isMuted: false,
  activeScenery: 'galaxy',
};

const SETTINGS_STORAGE_KEY = 'sky_vanguard_user_settings';

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        graphicsQuality: validateGraphicsQuality(parsed.graphicsQuality),
        fpsTarget: validateFpsTarget(parsed.fpsTarget),
        isMuted: Boolean(parsed.isMuted),
        activeScenery: validateSceneryType(parsed.activeScenery),
      };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveGameSettings(settings: Partial<GameSettings>): GameSettings {
  const current = loadGameSettings();
  const updated: GameSettings = {
    ...current,
    ...settings,
  };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function validateGraphicsQuality(val: unknown): GraphicsQuality {
  if (val === 'low' || val === 'medium' || val === 'high' || val === 'ultra') return val;
  return 'high';
}

export function validateFpsTarget(val: unknown): FpsTarget {
  if (val === 30 || val === 60 || val === 120) return val;
  return 60;
}

export function validateSceneryType(val: unknown): SceneryType {
  if (typeof val === 'string' && val in SCENERY_CONFIGS) {
    return val as SceneryType;
  }
  return 'galaxy';
}

export function getNextScenery(current: SceneryType): SceneryType {
  const keys = Object.keys(SCENERY_CONFIGS) as SceneryType[];
  const currentIndex = keys.indexOf(current);
  if (currentIndex === -1) return keys[0];
  const nextIndex = (currentIndex + 1) % keys.length;
  return keys[nextIndex];
}

export interface GraphicsSpecs {
  starCount: number;
  enableShootingStars: boolean;
  enableStardust: boolean;
  enableGlowFilters: boolean;
  enableHighDpr: boolean;
  maxParticles: number;
  enableCentrifugal: boolean;
  enableBloom: boolean;
  bloomIntensity: 'none' | 'soft' | 'ultra';
  enableGodRays: boolean;
  godRayIntensity: 'none' | 'soft' | 'ultra';
  enableCosmicWind: boolean;
  enablePassingFastStars: boolean;
  enableDiffractionSpikes: boolean;
  shadowQuality: 'none' | 'soft' | 'strong' | 'ultra';
  dustDensity: number;
}

export function getGraphicsSpecs(quality: GraphicsQuality): GraphicsSpecs {
  switch (quality) {
    case 'low':
      // Độ hoạ thấp: Cắt bỏ hoàn toàn các hiệu ứng lấp lánh đẹp đẽ, tắt luôn art li tâm
      return {
        starCount: 65,
        enableShootingStars: false,
        enableStardust: false,
        enableGlowFilters: false,
        enableHighDpr: false,
        maxParticles: 30,
        enableCentrifugal: false,
        enableBloom: false,
        bloomIntensity: 'none',
        enableGodRays: false,
        godRayIntensity: 'none',
        enableCosmicWind: false,
        enablePassingFastStars: false,
        enableDiffractionSpikes: false,
        shadowQuality: 'none',
        dustDensity: 0,
      };
    case 'medium':
      // Độ hoạ trung bình: Có đổ bóng, có art li tâm và có 1 ít hiệu ứng nhẹ
      return {
        starCount: 130,
        enableShootingStars: true,
        enableStardust: true,
        enableGlowFilters: false,
        enableHighDpr: false,
        maxParticles: 75,
        enableCentrifugal: true,
        enableBloom: false,
        bloomIntensity: 'none',
        enableGodRays: false,
        godRayIntensity: 'none',
        enableCosmicWind: false,
        enablePassingFastStars: false,
        enableDiffractionSpikes: false,
        shadowQuality: 'soft',
        dustDensity: 8,
      };
    case 'high':
      // Độ hoạ cao: Có bloom viền hào quang sáng mờ ảo nhẹ, có hiệu ứng chuyển cảnh mờ mờ có đổ bóng mạnh, có ánh sáng chiếu từ phong cảnh từ các hành tinh
      return {
        starCount: 230,
        enableShootingStars: true,
        enableStardust: true,
        enableGlowFilters: true,
        enableHighDpr: true,
        maxParticles: 150,
        enableCentrifugal: true,
        enableBloom: true,
        bloomIntensity: 'soft',
        enableGodRays: true,
        godRayIntensity: 'soft',
        enableCosmicWind: false,
        enablePassingFastStars: true,
        enableDiffractionSpikes: true,
        shadowQuality: 'strong',
        dustDensity: 22,
      };
    case 'ultra':
    default:
      // Độ hoạ cực cao: Có bloom siêu mạnh và đẹp, có đổ bóng siêu chân thực, có luồng gió vũ trụ, có các ngôi sao bay qua, có các hạt bụi li ti, có ánh sáng chiếu cực mạnh
      return {
        starCount: 380,
        enableShootingStars: true,
        enableStardust: true,
        enableGlowFilters: true,
        enableHighDpr: true,
        maxParticles: 280,
        enableCentrifugal: true,
        enableBloom: true,
        bloomIntensity: 'ultra',
        enableGodRays: true,
        godRayIntensity: 'ultra',
        enableCosmicWind: true,
        enablePassingFastStars: true,
        enableDiffractionSpikes: true,
        shadowQuality: 'ultra',
        dustDensity: 50,
      };
  }
}
