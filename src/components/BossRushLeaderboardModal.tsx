/**
 * Dedicated Local Leaderboard Modal for 'Đại Chiến Boss' (Boss Rush Mode)
 * Highlights:
 * - Fastest boss defeat clear time (Thời gian hạ gục trùm nhanh nhất)
 * - Minimum revives used (Số lần hồi sinh ít nhất)
 * - Bosses reached/defeated (20/20)
 * - Fighter used, star rating, pilot callsign, and difficulty
 */

import React,{ useState } from 'react';
import {
X,
Trophy,
Crown,
Clock,
Heart,Star,
Swords,RotateCcw,
Sparkles,Edit3
} from 'lucide-react';
import {
BossRushLeaderboardEntry,
getBossRushLeaderboard,
formatBossClearTime,
BOSS_RUSH_LEADERBOARD_KEY,
INITIAL_BOSS_RUSH_LEADERBOARD,
} from '../game/bossRushLeaderboard';
import { sound } from '../game/audio';

interface BossRushLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBossRush?: () => void;
  onStartBossRush?: () => void;
  highlightRecordId?: string | null;
  highlightEntryId?: string | null;
  playerName?: string;
  onOpenRename?: () => void;
}

export const BossRushLeaderboardModal: React.FC<BossRushLeaderboardModalProps> = ({
  isOpen,
  onClose,
  onSelectBossRush,
  onStartBossRush,
  highlightRecordId = null,
  highlightEntryId = null,
  playerName = 'Chỉ Huy Tiên Phong',
  onOpenRename,
}) => {
  const effectiveHighlight = highlightEntryId || highlightRecordId;
  const onStartAction = onStartBossRush || onSelectBossRush;
  const [filter, setFilter] = useState<'all' | 'zero_revive' | 'cleared'>('all');
  const [leaderboard, setLeaderboard] = useState<BossRushLeaderboardEntry[]>(() =>
    getBossRushLeaderboard()
  );

  if (!isOpen) return null;

  const handleResetLeaderboard = () => {
    if (window.confirm('Đặt lại bảng xếp hạng Đại Chiến Boss về các kỷ lục mẫu ban đầu?')) {
      try {
        localStorage.removeItem(BOSS_RUSH_LEADERBOARD_KEY);
      } catch {}
      setLeaderboard([...INITIAL_BOSS_RUSH_LEADERBOARD]);
      sound.playReward();
    }
  };

  const filteredList = leaderboard.filter((entry) => {
    if (filter === 'zero_revive') return entry.revivesUsed === 0;
    if (filter === 'cleared') return entry.bossesDefeated >= 20 || entry.isVictory;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden bg-gradient-to-b from-[#0b172a] via-[#050b14] to-[#03070f] border border-rose-500/50 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.35)] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-rose-500/20 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-red-600 to-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.6)]">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-300">
                  BẢNG XẾP HẠNG ĐẠI CHIẾN BOSS
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-orbitron font-bold text-rose-300">
                  LOCAL LEADERBOARD
                </span>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">
                Vinh danh thành tích: <strong className="text-cyan-300">Thời gian hạ trùm nhanh nhất</strong> & <strong className="text-rose-400">Số lần hồi sinh ít nhất</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetLeaderboard}
              title="Đặt lại bảng xếp hạng về mặc định"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-orbitron flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">MẶC ĐỊNH</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              aria-label="Đóng bảng xếp hạng"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Top Overview */}
        <div className="p-3 sm:px-5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-orbitron font-bold">
            <button
              onClick={() => {
                sound.playClick();
                setFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TẤT CẢ KỶ LỤC ({leaderboard.length})
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilter('zero_revive');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'zero_revive'
                  ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current text-rose-300" />
              <span>0 HỒI SINH (HOÀN HẢO)</span>
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilter('cleared');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'cleared'
                  ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              <span>HẠ ĐỦ 20 TRÙM</span>
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs font-orbitron text-slate-400 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
              <span>Chỉ Huy:</span>
              <span className="text-cyan-300 font-bold">{playerName}</span>
              {onOpenRename && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenRename();
                  }}
                  className="ml-1 text-[10px] text-cyan-400 hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40 active:scale-95 transition-all"
                  title="Đổi tên Chỉ Huy"
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Đổi tên</span>
                </button>
              )}
            </div>

            <div className="text-xs font-orbitron text-slate-400 flex items-center gap-2 hidden lg:flex">
              <span>Tiêu chí:</span>
              <span className="text-amber-400 font-bold">1. Trùm hạ gục</span>
              <span className="text-rose-400 font-bold">2. Ít hồi sinh nhất</span>
              <span className="text-cyan-400 font-bold">3. Nhanh nhất</span>
            </div>
          </div>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 font-rajdhani">
              Chưa có kỷ lục nào thỏa mãn bộ lọc này. Hãy tham chiến chế độ Đại Chiến Boss để ghi danh vào bảng vàng!
            </div>
          ) : (
            filteredList.map((entry, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;
              const isHighlighted = effectiveHighlight === entry.id;

              const rankBadgeClass = isFirst
                ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)] font-black'
                : isSecond
                ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950 font-black'
                : isThird
                ? 'bg-gradient-to-br from-amber-600 to-orange-800 text-white font-black'
                : 'bg-slate-800 text-slate-300 font-bold';

              const rankIcon = isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${rank}`;

              return (
                <div
                  key={entry.id}
                  className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isHighlighted
                      ? 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-rose-400 ring-2 ring-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                      : isFirst
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-900/90 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Rank & Pilot/Fighter info */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-orbitron text-sm sm:text-base shrink-0 ${rankBadgeClass}`}
                    >
                      {rankIcon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-orbitron font-black text-sm text-white">
                          {entry.playerName}
                        </span>
                        {entry.callsign && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 text-[10px] font-orbitron font-bold">
                            {entry.callsign}
                          </span>
                        )}
                        {entry.isVictory && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[9px] font-orbitron font-black flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            ĐÃ QUÉT SẠCH 20 BOSS
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-rajdhani text-slate-300 mt-0.5">
                        <span className="text-cyan-300 font-bold font-orbitron">
                          {entry.fighterName}
                        </span>
                        <span className="text-amber-400 font-bold font-orbitron flex items-center">
                          <Star className="w-3 h-3 fill-current inline" />
                          {entry.fighterStars}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 capitalize">
                          Độ khó: {entry.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Key Battle Metrics (Boss Defeated, Clear Time, Revives, Score) */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 text-right">
                    {/* Bosses Cleared */}
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] font-orbitron text-slate-400 uppercase">
                        HẠ GỤC
                      </div>
                      <div className="font-orbitron font-black text-sm sm:text-base text-rose-300 tabular-nums">
                        {entry.bossesDefeated}/{entry.totalBosses} BOSS
                      </div>
                    </div>

                    {/* Clear Time (Thời gian hạ gục) */}
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] font-orbitron text-slate-400 uppercase flex items-center justify-center sm:justify-end gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>THỜI GIAN</span>
                      </div>
                      <div className="font-orbitron font-black text-sm sm:text-base text-cyan-300 tabular-nums">
                        {formatBossClearTime(entry.clearTimeSeconds)}
                      </div>
                    </div>

                    {/* Revives Used (Số lần hồi sinh) */}
                    <div className="text-right">
                      <div className="text-[10px] font-orbitron text-slate-400 uppercase flex items-center justify-end gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span>HỒI SINH</span>
                      </div>
                      <div
                        className={`font-orbitron font-black text-sm sm:text-base tabular-nums ${
                          entry.revivesUsed === 0
                            ? 'text-emerald-400 font-black'
                            : entry.revivesUsed <= 1
                            ? 'text-yellow-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {entry.revivesUsed === 0 ? '0 LẦN ⭐' : `${entry.revivesUsed} LẦN`}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="hidden md:block text-right min-w-[90px]">
                      <div className="text-[10px] font-orbitron text-slate-400 uppercase">
                        ĐIỂM SỐ
                      </div>
                      <div className="font-orbitron font-bold text-sm text-amber-300 tabular-nums">
                        {entry.score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs font-rajdhani text-slate-400 hidden sm:block">
            Kỷ lục được tự động ghi nhận ngay sau khi hoàn thành hoặc kết thúc trận đấu Đại Chiến Boss.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onStartAction && (
              <button
                onClick={() => {
                  sound.playClick();
                  onClose();
                  onStartAction();
                }}
                className="flex-1 sm:flex-initial min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-400 text-white font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.5)] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
              >
                <Swords className="w-4 h-4" />
                <span>⚔️ XUẤT TRẬN ĐẠI CHIẾN BOSS</span>
              </button>
            )}
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-orbitron font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              ĐÓNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
