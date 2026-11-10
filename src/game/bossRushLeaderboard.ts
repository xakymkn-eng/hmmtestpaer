/**
 * Dedicated Local Leaderboard System for 'Đại Chiến Boss' (Boss Rush)
 * Tracks:
 * - Fastest boss defeat clear time (thời gian hạ gục trùm nhanh nhất)
 * - Fewest revives used (số lần hồi sinh ít nhất)
 * - Number of bosses defeated (20/20)
 * - Fighter used, star level, pilot, difficulty, and date
 */

import { DifficultyLevel } from './rules';

export interface BossRushLeaderboardEntry {
  id: string;
  playerName: string;
  callsign: string;
  fighterId: string;
  fighterName: string;
  fighterTier: 'S' | 'A' | 'B';
  fighterStars: number;
  bossesDefeated: number; // up to 20
  totalBosses: number; // 20
  clearTimeSeconds: number; // Thời gian hạ gục trùm (càng ít càng cao)
  revivesUsed: number; // Số lần hồi sinh (càng ít càng cao)
  score: number;
  difficulty: DifficultyLevel;
  isVictory: boolean;
  timestamp: number;
}

export const BOSS_RUSH_LEADERBOARD_KEY = 'sky_vanguard_boss_rush_leaderboard';

/**
 * Seed initial atmospheric veteran records to give player a competitive benchmark
 */
export const INITIAL_BOSS_RUSH_LEADERBOARD: BossRushLeaderboardEntry[] = [
  {
    id: 'seed-1',
    playerName: 'Thiếu Tá Kira Yamato',
    callsign: 'TỰ DO TỐI CAO',
    fighterId: 'astraea',
    fighterName: 'SX-77 Tinh Tú Tiên Phong',
    fighterTier: 'S',
    fighterStars: 6,
    bossesDefeated: 20,
    totalBosses: 20,
    clearTimeSeconds: 168.4, // 02:48
    revivesUsed: 0,
    score: 1850000,
    difficulty: 'hard',
    isVictory: true,
    timestamp: Date.now() - 86400000 * 3,
  },
  {
    id: 'seed-2',
    playerName: 'Đại Úy Vance Walker',
    callsign: 'LÔI ĐÌNH THẦN TỐC',
    fighterId: 'arc_tempest',
    fighterName: 'LX-88 Lôi Quang Tiên Phong',
    fighterTier: 'S',
    fighterStars: 5,
    bossesDefeated: 20,
    totalBosses: 20,
    clearTimeSeconds: 194.2, // 03:14
    revivesUsed: 0,
    score: 1620000,
    difficulty: 'normal',
    isVictory: true,
    timestamp: Date.now() - 86400000 * 5,
  },
  {
    id: 'seed-3',
    playerName: 'Nữ Phi Công Lyra Vance',
    callsign: 'VÕNG MẠC ÁNH SAO',
    fighterId: 'valkyrie',
    fighterName: 'VX-1 Nữ Thần Chiến Thắng',
    fighterTier: 'S',
    fighterStars: 5,
    bossesDefeated: 20,
    totalBosses: 20,
    clearTimeSeconds: 225.8, // 03:45
    revivesUsed: 1,
    score: 1450000,
    difficulty: 'normal',
    isVictory: true,
    timestamp: Date.now() - 86400000 * 7,
  },
  {
    id: 'seed-4',
    playerName: 'Trung Tá Jax Nova',
    callsign: 'KỶ NGUYÊN LƯỢNG TỬ',
    fighterId: 'chrono',
    fighterName: 'TX-0 Kỷ Nguyên',
    fighterTier: 'S',
    fighterStars: 4,
    bossesDefeated: 20,
    totalBosses: 20,
    clearTimeSeconds: 258.0, // 04:18
    revivesUsed: 1,
    score: 1320000,
    difficulty: 'normal',
    isVictory: true,
    timestamp: Date.now() - 86400000 * 10,
  },
  {
    id: 'seed-5',
    playerName: 'Tân Binh Tiên Phong',
    callsign: 'HỎA PHƯỢNG',
    fighterId: 'phoenix',
    fighterName: 'PX-01 Phượng Hoàng Lửa',
    fighterTier: 'B',
    fighterStars: 3,
    bossesDefeated: 15,
    totalBosses: 20,
    clearTimeSeconds: 290.5, // 04:50
    revivesUsed: 2,
    score: 820000,
    difficulty: 'easy',
    isVictory: false,
    timestamp: Date.now() - 86400000 * 12,
  },
];

/**
 * Compare two leaderboard entries according to strict ranking rules:
 * 1. Most Bosses Defeated (descending)
 * 2. Fewest Revives Used (ascending)
 * 3. Fastest Boss Clear Time (ascending)
 * 4. Highest Score (descending)
 */
export function compareBossRushEntries(a: BossRushLeaderboardEntry, b: BossRushLeaderboardEntry): number {
  // 1. Số trùm hạ gục nhiều hơn đứng trước
  if (b.bossesDefeated !== a.bossesDefeated) {
    return b.bossesDefeated - a.bossesDefeated;
  }
  // 2. Số lần hồi sinh ít hơn đứng trước (0 hồi sinh ưu tiên số 1)
  if (a.revivesUsed !== b.revivesUsed) {
    return a.revivesUsed - b.revivesUsed;
  }
  // 3. Thời gian hoàn thành nhanh hơn đứng trước
  if (Math.abs(a.clearTimeSeconds - b.clearTimeSeconds) > 0.05) {
    return a.clearTimeSeconds - b.clearTimeSeconds;
  }
  // 4. Điểm số cao hơn
  return b.score - a.score;
}

/**
 * Load Leaderboard from localStorage, seeded if empty
 */
export function getBossRushLeaderboard(): BossRushLeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(BOSS_RUSH_LEADERBOARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort(compareBossRushEntries);
      }
    }
  } catch {}
  return [...INITIAL_BOSS_RUSH_LEADERBOARD].sort(compareBossRushEntries);
}

/**
 * Save a new run entry into the Leaderboard and return updated ranking
 */
export function addBossRushRecord(
  entry: Omit<BossRushLeaderboardEntry, 'id' | 'timestamp' | 'playerName' | 'callsign'> & {
    playerName?: string;
    callsign?: string;
  }
): { leaderboard: BossRushLeaderboardEntry[]; rank: number; isTopRecord: boolean; id: string } {
  const current = getBossRushLeaderboard();
  const newEntry: BossRushLeaderboardEntry = {
    playerName: entry.playerName || 'Chỉ Huy Sky Vanguard',
    callsign: entry.callsign || 'PHI ĐỘI VŨ TRỤ',
    ...entry,
    id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };

  const updated = [...current, newEntry].sort(compareBossRushEntries).slice(0, 50); // Keep top 50
  const rank = updated.findIndex((item) => item.id === newEntry.id) + 1;
  const isTopRecord = rank === 1;

  try {
    localStorage.setItem(BOSS_RUSH_LEADERBOARD_KEY, JSON.stringify(updated));
  } catch {}

  return { leaderboard: updated, rank, isTopRecord, id: newEntry.id };
}

/**
 * Format seconds into mm:ss or mm:ss.s
 */
export function formatBossClearTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const minutes = Math.floor(s / 60);
  const seconds = Math.floor(s % 60);
  const tenths = Math.floor((s * 10) % 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}
