/**
 * Combat Titles & Battle Honors System (Bảng Danh Hiệu Tác Chiến Sau Trận Đấu)
 * Evaluates performance metrics (enemies killed, remaining HP, wave, victory, revives)
 * and awards prestigious combat titles such as 'Xạ thủ thiện xạ', 'Không sợ hiểm nguy', etc.
 */

export type TitleTier = 'mythic' | 'legendary' | 'epic' | 'rare' | 'common';

export interface CombatTitle {
  id: string;
  name: string;             // Tên danh hiệu tiếng Việt (e.g. 'Xạ thủ thiện xạ')
  badgeEmoji: string;       // Biểu tượng huy hiệu (e.g. '🎯')
  tier: TitleTier;          // Phẩm cấp danh hiệu
  tierName: string;         // 'Huyền Thoại', 'Sử Thi', 'Hiếm', 'Cao Cấp', 'Cơ Bản'
  color: string;            // Primary accent color
  bgGradient: string;       // Card background styling
  borderClass: string;      // Tailwind border class
  textClass: string;        // Tailwind text color class
  description: string;      // Mô tả điều kiện đạt được
  criteriaMetText: string;  // Dữ liệu chứng thực (e.g. 'Hạ 56 địch', 'Còn 18% HP')
}

export interface CombatStatsInput {
  enemiesKilled: number;
  remainingHp: number;
  maxHp: number;
  wave: number;
  score: number;
  playTime?: number;
  isVictory?: boolean;
  revivesUsed?: number;
}

export const TITLE_TIER_ORDER: Record<TitleTier, number> = {
  mythic: 5,
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
};

/**
 * Evaluates match statistics and returns a list of earned combat titles.
 * Always ensures at least 2 to 4 fitting titles are awarded per run, ranked by tier prestige.
 */
export function calculateCombatTitles(stats: CombatStatsInput): CombatTitle[] {
  const {
    enemiesKilled,
    remainingHp,
    maxHp,
    wave,
    score,
    playTime = 0,
    isVictory = false,
    revivesUsed = 0,
  } = stats;

  const validMaxHp = Math.max(1, maxHp);
  const hpRatio = Math.max(0, Math.min(1, remainingHp / validMaxHp));
  const hpPercent = Math.round(hpRatio * 100);

  const titles: CombatTitle[] = [];

  // 1. "Cuồng phong quét sạch" (Kills >= 120)
  if (enemiesKilled >= 120) {
    titles.push({
      id: 'void_tempest',
      name: 'Cuồng Phong Quét Sạch',
      badgeEmoji: '🌪️',
      tier: 'mythic',
      tierName: 'Thần Thoại',
      color: '#ec4899',
      bgGradient: 'from-pink-950/80 via-purple-950/60 to-slate-900',
      borderClass: 'border-pink-500/70',
      textClass: 'text-pink-300',
      description: 'Càn quét toàn bộ không phận, hủy diệt trên 120 mục tiêu của quân địch!',
      criteriaMetText: `Tiêu diệt ${enemiesKilled} kẻ địch`,
    });
  }

  // 2. "Thần chết không gian" (Kills >= 80)
  else if (enemiesKilled >= 80) {
    titles.push({
      id: 'cosmic_reaper',
      name: 'Thần Chết Không Gian',
      badgeEmoji: '💀',
      tier: 'mythic',
      tierName: 'Thần Thoại',
      color: '#a855f7',
      bgGradient: 'from-purple-950/80 via-slate-900 to-slate-950',
      borderClass: 'border-purple-500/70',
      textClass: 'text-purple-300',
      description: 'Hỏa lực áp đảo tuyệt đối, gieo rắc kinh hoàng cho toàn bộ hạm đội địch.',
      criteriaMetText: `Hạ gục ${enemiesKilled} tàu địch`,
    });
  }

  // 3. "Xạ thủ thiện xạ" (Kills >= 40)
  if (enemiesKilled >= 40) {
    titles.push({
      id: 'sharpshooter',
      name: 'Xạ Thủ Thiện Xạ',
      badgeEmoji: '🎯',
      tier: 'legendary',
      tierName: 'Huyền Thoại',
      color: '#f59e0b',
      bgGradient: 'from-amber-950/80 via-yellow-950/50 to-slate-900',
      borderClass: 'border-amber-400/80',
      textClass: 'text-amber-300',
      description: 'Độ chuẩn xác phi thường, nhắm bắn hạ gục hơn 40 mục tiêu di động.',
      criteriaMetText: `Bắn hạ ${enemiesKilled} máy bay địch`,
    });
  }

  // 4. "Không sợ hiểm nguy" (Survived or fought bravely at critical HP <= 25%, or took heroic battle with remaining HP <= 30%)
  if ((hpRatio > 0 && hpRatio <= 0.3) || (remainingHp === 0 && enemiesKilled >= 30)) {
    titles.push({
      id: 'fearless_ace',
      name: 'Không Sợ Hiểm Nguy',
      badgeEmoji: '⚡',
      tier: 'epic',
      tierName: 'Sử Thi',
      color: '#f97316',
      bgGradient: 'from-orange-950/80 via-red-950/50 to-slate-900',
      borderClass: 'border-orange-500/70',
      textClass: 'text-orange-300',
      description: 'Bất chấp hiểm nguy, kiên cường tác chiến giữa làn mưa đạn dù máu ở mức báo động!',
      criteriaMetText: hpRatio > 0 ? `Chiến đấu với ${hpPercent}% Máu` : 'Tử chiến kiên cường',
    });
  }

  // 5. "Bất khả xâm phạm" (Remaining HP >= 85%)
  if (hpRatio >= 0.85) {
    titles.push({
      id: 'untouchable_aegis',
      name: 'Bất Khả Xâm Phạm',
      badgeEmoji: '🛡️',
      tier: 'legendary',
      tierName: 'Huyền Thoại',
      color: '#06b6d4',
      bgGradient: 'from-cyan-950/80 via-sky-950/50 to-slate-900',
      borderClass: 'border-cyan-400/80',
      textClass: 'text-cyan-300',
      description: 'Khả năng cơ động né đạn thượng thừa, bảo toàn hơn 85% thanh máu của phi cơ.',
      criteriaMetText: `Bảo toàn ${hpPercent}% HP`,
    });
  }

  // 6. "Chiến thần bất tử" (Victory with 0 revives and healthy HP >= 50%)
  if (isVictory && revivesUsed === 0 && hpRatio >= 0.5) {
    titles.push({
      id: 'immortal_warlord',
      name: 'Chiến Thần Bất Tử',
      badgeEmoji: '👑',
      tier: 'mythic',
      tierName: 'Thần Thoại',
      color: '#eab308',
      bgGradient: 'from-yellow-950/80 via-amber-950/60 to-slate-900',
      borderClass: 'border-yellow-400',
      textClass: 'text-yellow-300',
      description: 'Chiến thắng toàn diện, vượt qua mọi cạm bẫy mà không tốn một lần hồi sinh!',
      criteriaMetText: `Thắng đợt · 0 hồi sinh · ${hpPercent}% HP`,
    });
  }

  // 7. "Bão lửa tốc chiến" (High score per second: aggressive combos)
  if (playTime >= 15 && score / Math.max(1, playTime) >= 30) {
    titles.push({
      id: 'blitz_striker',
      name: 'Bão Lửa Tốc Chiến',
      badgeEmoji: '🔥',
      tier: 'epic',
      tierName: 'Sử Thi',
      color: '#ef4444',
      bgGradient: 'from-red-950/80 via-rose-950/50 to-slate-900',
      borderClass: 'border-red-500/70',
      textClass: 'text-red-300',
      description: 'Tiến công thần tốc, hạ gục kẻ địch liên hoàn với nhịp độ chiến trận dồn dập.',
      criteriaMetText: `${Math.round(score / Math.max(1, playTime))} điểm/giây`,
    });
  }

  // 8. "Ý chí kiên định" (Wave >= 3 or survived long intense engagement)
  if (wave >= 3 || playTime >= 90 || revivesUsed > 0) {
    titles.push({
      id: 'iron_will',
      name: 'Ý Chí Kiên Định',
      badgeEmoji: '⚓',
      tier: 'rare',
      tierName: 'Hiếm',
      color: '#38bdf8',
      bgGradient: 'from-sky-950/80 via-blue-950/50 to-slate-900',
      borderClass: 'border-sky-500/60',
      textClass: 'text-sky-300',
      description: 'Vượt qua nhiều đợt tấn công hiểm hóc, bám trụ kiên cường trên chiến trường không gian.',
      criteriaMetText: `Vượt Wave ${wave} · ${Math.floor(playTime)}s`,
    });
  }

  // 9. "Tử chiến đến cùng" (Defeat but fought bravely with kills >= 15)
  if (!isVictory && enemiesKilled >= 15 && remainingHp === 0) {
    titles.push({
      id: 'heroic_last_stand',
      name: 'Tử Chiến Đến Cùng',
      badgeEmoji: '⚔️',
      tier: 'rare',
      tierName: 'Hiếm',
      color: '#f43f5e',
      bgGradient: 'from-rose-950/80 via-slate-900 to-slate-950',
      borderClass: 'border-rose-500/60',
      textClass: 'text-rose-300',
      description: 'Chiến đấu dũng mãnh tới giọt năng lượng cuối cùng trước khi bị áp đảo.',
      criteriaMetText: `Chiến đấu oanh liệt · ${enemiesKilled} Kills`,
    });
  }

  // 10. Fallback: "Tân binh dũng cảm" (Cadet) if few titles earned
  if (titles.length === 0 || (enemiesKilled >= 1 && enemiesKilled < 40 && !titles.some((t) => t.id === 'sharpshooter'))) {
    titles.push({
      id: 'valiant_cadet',
      name: 'Tân Binh Dũng Cảm',
      badgeEmoji: '🎖️',
      tier: 'common',
      tierName: 'Cơ Bản',
      color: '#94a3b8',
      bgGradient: 'from-slate-900 via-slate-950 to-slate-950',
      borderClass: 'border-slate-700',
      textClass: 'text-slate-300',
      description: 'Dám đương đầu với phi đội xâm lược ngoài không gian, tích lũy kinh nghiệm quý giá.',
      criteriaMetText: `${enemiesKilled} mục tiêu hạ gục`,
    });
  }

  // Sort titles by prestige (mythic > legendary > epic > rare > common)
  const sorted = titles.sort((a, b) => TITLE_TIER_ORDER[b.tier] - TITLE_TIER_ORDER[a.tier]);

  // Return the top 3-4 most prestigious titles
  return sorted.slice(0, 4);
}
