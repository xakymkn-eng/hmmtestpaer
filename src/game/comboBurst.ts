/**
 * Combo Burst System
 * Triggers spectacular visual & score milestone notifications when players
 * cross milestone thresholds (e.g. 50x, 100x, 150x, 200x, 250x, 300x combo hits)
 * or major score thresholds (50k, 100k, 250k, 500k, 1,000,000 pts).
 */

export interface ComboBurstTier {
  threshold: number;
  title: string;
  subtitle: string;
  vietnameseTitle: string;
  vietnameseSubtitle: string;
  themeColor: string; // Primary neon glow color
  accentColor: string; // Complementary highlight
  bannerGradient: string;
  borderClass: string;
  badgeClass: string;
  rankCode: string;
  icon: 'zap' | 'flame' | 'sparkles' | 'crown' | 'supernova' | 'godlike';
}

export const COMBO_BURST_TIERS: Record<number, ComboBurstTier> = {
  50: {
    threshold: 50,
    title: '50x COMBO BURST!',
    subtitle: 'HYPER VELOCITY STRIKE',
    vietnameseTitle: '⚡ BÙNG NỔ LIÊN HOÀN 50x! ⚡',
    vietnameseSubtitle: 'XUNG KÍCH TỐC ĐỘ CAO · SÁT THƯƠNG TĂNG TỐC!',
    themeColor: '#00f2fe',
    accentColor: '#38bdf8',
    bannerGradient: 'from-cyan-950/95 via-sky-900/90 to-blue-950/95',
    borderClass: 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.85)]',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60',
    rankCode: 'TIER-1 BURST',
    icon: 'zap',
  },
  100: {
    threshold: 100,
    title: '100x SUPER BURST!',
    subtitle: 'COSMIC ANNIHILATION',
    vietnameseTitle: '🔥 SIÊU BÙNG NỔ 100x! 🔥',
    vietnameseSubtitle: 'HỦY DIỆT VŨ TRỤ · HỆ SỐ ĐIỂM TĂNG VỌT 3.5x!',
    themeColor: '#a855f7',
    accentColor: '#c084fc',
    bannerGradient: 'from-purple-950/95 via-fuchsia-900/90 to-violet-950/95',
    borderClass: 'border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.9)]',
    badgeClass: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/60',
    rankCode: 'TIER-2 BURST',
    icon: 'flame',
  },
  150: {
    threshold: 150,
    title: '150x MEGA BURST!',
    subtitle: 'TITAN OVERDRIVE FURY',
    vietnameseTitle: '💎 CUỒNG NỘ TITAN 150x! 💎',
    vietnameseSubtitle: 'QUÁ TẢI TOÀN HỆ THỐNG · CHIẾN TRƯỜNG LÀM CHỦ!',
    themeColor: '#10b981',
    accentColor: '#34d399',
    bannerGradient: 'from-emerald-950/95 via-teal-900/90 to-cyan-950/95',
    borderClass: 'border-emerald-400 shadow-[0_0_32px_rgba(16,185,129,0.9)]',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60',
    rankCode: 'TIER-3 BURST',
    icon: 'sparkles',
  },
  200: {
    threshold: 200,
    title: '200x ULTRA BURST!',
    subtitle: 'SOLAR APEX DOMINANCE',
    vietnameseTitle: '👑 ĐỈNH CAO THÁI DƯƠNG 200x! 👑',
    vietnameseSubtitle: 'BỨC XẠ THẦN KINH · BÁ CHỦ CHIẾN TRƯỜNG 4.5x!',
    themeColor: '#fbbf24',
    accentColor: '#f59e0b',
    bannerGradient: 'from-amber-950/95 via-yellow-900/90 to-amber-950/95',
    borderClass: 'border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.95)]',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/60',
    rankCode: 'TIER-4 BURST',
    icon: 'crown',
  },
  250: {
    threshold: 250,
    title: '250x HYPER BURST!',
    subtitle: 'SUPERNOVA CATACLYSM',
    vietnameseTitle: '💥 SIÊU TÂN TINH 250x! 💥',
    vietnameseSubtitle: 'SỨC MẠNH TẬN DIỆT · BÙNG NỔ HỎA LỰC TỐI THƯỢNG!',
    themeColor: '#f43f5e',
    accentColor: '#fb7185',
    bannerGradient: 'from-rose-950/95 via-red-900/90 to-rose-950/95',
    borderClass: 'border-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.95)]',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/60',
    rankCode: 'TIER-5 BURST',
    icon: 'supernova',
  },
  300: {
    threshold: 300,
    title: '300x GODLIKE BURST!',
    subtitle: 'TRANSCENDENT APEX DEITY',
    vietnameseTitle: '🌟 TUYỆT THẾ THẦN THOẠI 300x! 🌟',
    vietnameseSubtitle: 'BẤT KHẢ CHIẾN BẠI · CẤP ĐỘ THẦN THÁNH VĨNH CỬU 5.0x!',
    themeColor: '#ec4899',
    accentColor: '#a855f7',
    bannerGradient: 'from-pink-950/95 via-purple-900/90 to-amber-950/95',
    borderClass: 'border-pink-400 shadow-[0_0_45px_rgba(236,72,153,1)]',
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-400/60',
    rankCode: 'GODLIKE BURST',
    icon: 'godlike',
  },
};

/**
 * Supported score thresholds that trigger celebratory notifications
 */
export const SCORE_BURST_THRESHOLDS = [
  50_000,
  100_000,
  250_000,
  500_000,
  1_000_000,
  2_500_000,
  5_000_000,
];

export interface ComboBurstEvent {
  id: string;
  type: 'combo' | 'score';
  threshold: number;
  title: string;
  subtitle: string;
  vietnameseTitle: string;
  vietnameseSubtitle: string;
  themeColor: string;
  accentColor: string;
  bannerGradient: string;
  borderClass: string;
  badgeClass: string;
  rankCode: string;
  multiplierText: string;
  timestamp: number;
}

/**
 * Returns tier config for a specific combo hit count.
 * Matches exact multiples of 50 or falls back to closest tier bracket.
 */
export function getComboBurstTier(combo: number): ComboBurstTier {
  if (combo >= 300) return COMBO_BURST_TIERS[300];
  if (combo >= 250) return COMBO_BURST_TIERS[250];
  if (combo >= 200) return COMBO_BURST_TIERS[200];
  if (combo >= 150) return COMBO_BURST_TIERS[150];
  if (combo >= 100) return COMBO_BURST_TIERS[100];
  return COMBO_BURST_TIERS[50];
}

/**
 * Checks if a combo count has crossed a 50x threshold (50, 100, 150, 200, 250, 300, etc.)
 */
export function checkComboBurstCrossing(prevCombo: number, currentCombo: number, step: number = 50): number | null {
  if (currentCombo <= 0 || step <= 0) return null;
  if (currentCombo <= prevCombo) return null;

  const prevTier = Math.floor(prevCombo / step);
  const currentTier = Math.floor(currentCombo / step);

  if (currentTier > prevTier && currentTier > 0) {
    return currentTier * step;
  }
  return null;
}

/**
 * Checks if player score crossed any of the major score milestones
 */
export function checkScoreThresholdCrossing(prevScore: number, currentScore: number): number | null {
  if (currentScore <= prevScore || currentScore <= 0) return null;

  for (const threshold of SCORE_BURST_THRESHOLDS) {
    if (prevScore < threshold && currentScore >= threshold) {
      return threshold;
    }
  }
  return null;
}

/**
 * Creates a ComboBurstEvent when either a combo milestone or score milestone is crossed
 */
export function createComboBurstEvent(
  threshold: number,
  type: 'combo' | 'score',
  multiplier: number = 1.0
): ComboBurstEvent {
  if (type === 'combo') {
    const tier = getComboBurstTier(threshold);
    return {
      id: `combo-${threshold}-${Date.now()}`,
      type: 'combo',
      threshold,
      title: tier.title,
      subtitle: tier.subtitle,
      vietnameseTitle: tier.vietnameseTitle,
      vietnameseSubtitle: tier.vietnameseSubtitle,
      themeColor: tier.themeColor,
      accentColor: tier.accentColor,
      bannerGradient: tier.bannerGradient,
      borderClass: tier.borderClass,
      badgeClass: tier.badgeClass,
      rankCode: tier.rankCode,
      multiplierText: `${multiplier.toFixed(1)}x`,
      timestamp: Date.now(),
    };
  }

  // Score Milestone Event
  const formattedScore = threshold.toLocaleString();
  const isMythic = threshold >= 1_000_000;
  return {
    id: `score-${threshold}-${Date.now()}`,
    type: 'score',
    threshold,
    title: `${formattedScore} PTS REACHED!`,
    subtitle: isMythic ? 'MYTHIC ARCHON PILOT' : 'SCORE MILESTONE SURGE',
    vietnameseTitle: isMythic
      ? `👑 MỐC ĐIỂM THẦN THOẠI: ${formattedScore} ĐIỂM! 👑`
      : `⭐ ĐẠT MỐC ĐIỂM: ${formattedScore} ĐIỂM! ⭐`,
    vietnameseSubtitle: isMythic
      ? 'KỶ LỤC VÔ TIỀN KHOÁNG HẬU · VINH DANH BẢNG VÀNG VŨ TRỤ!'
      : 'BỨC PHÁ ĐỈNH CAO · TIẾP TỤC DUY TRÌ BÙNG NỔ HỎA LỰC!',
    themeColor: isMythic ? '#ec4899' : '#fbbf24',
    accentColor: isMythic ? '#a855f7' : '#38bdf8',
    bannerGradient: isMythic
      ? 'from-pink-950/95 via-purple-900/90 to-amber-950/95'
      : 'from-amber-950/95 via-yellow-900/90 to-slate-950/95',
    borderClass: isMythic
      ? 'border-pink-400 shadow-[0_0_40px_rgba(236,72,153,0.95)]'
      : 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.9)]',
    badgeClass: isMythic
      ? 'bg-pink-500/20 text-pink-300 border-pink-400/60'
      : 'bg-amber-500/20 text-amber-300 border-amber-400/60',
    rankCode: isMythic ? 'MYTHIC SCORE' : 'MILESTONE',
    multiplierText: `${multiplier.toFixed(1)}x`,
    timestamp: Date.now(),
  };
}
