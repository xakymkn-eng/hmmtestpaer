/**
 * Missions System Modal Component (Từ Dễ Đến Khó, Đa Dạng Nhiệm Vụ)
 * Displays combat, gacha, and skill missions with difficulty filter tabs (Dễ, Trung Bình, Khó, Ác Mộng)
 * and dual rewards: Vàng (Gold) + Kim Cương (Gems, đã giảm 90%).
 */

import React,{ useState } from 'react';
import { Target,X,CheckCircle2,Award,Gift,Zap,Crosshair } from 'lucide-react';
import { Mission,MissionDifficulty } from '../game/rules';
import { sound } from '../game/audio';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  onClaim: (missionId: string) => void;
  onClaimAll: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  onClaim,
  onClaimAll,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | MissionDifficulty>('all');

  if (!isOpen) return null;

  const filteredMissions = selectedDifficulty === 'all'
    ? missions
    : missions.filter((m) => m.difficulty === selectedDifficulty);

  const claimableCount = missions.filter((m) => m.completed && !m.claimed).length;
  const completedCount = missions.filter((m) => m.claimed).length;

  const handleClaimSingle = (missionId: string) => {
    sound.playClaimReward();
    onClaim(missionId);
  };

  const handleClaimAllAvailable = () => {
    sound.playClaimReward();
    onClaimAll();
  };

  const getCategoryIcon = (category: Mission['category']) => {
    switch (category) {
      case 'combat':
        return <Crosshair className="w-4 h-4 text-rose-400" />;
      case 'gacha':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'powerup':
        return <Gift className="w-4 h-4 text-cyan-400" />;
      case 'skill':
        return <Zap className="w-4 h-4 text-purple-400" />;
    }
  };

  const getDifficultyBadge = (diff: MissionDifficulty = 'normal') => {
    switch (diff) {
      case 'easy':
        return (
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-orbitron font-bold">
            DỄ
          </span>
        );
      case 'normal':
        return (
          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-orbitron font-bold">
            TRUNG BÌNH
          </span>
        );
      case 'hard':
        return (
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[9px] font-orbitron font-bold">
            KHÓ
          </span>
        );
      case 'nightmare':
        return (
          <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-rose-300 border border-rose-400/60 text-[9px] font-orbitron font-black shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse">
            🔥 ÁC MỘNG
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#091322] via-[#050b14] to-[#040810] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Target className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                NHIỆM VỤ CHỈ HUY BẦU TRỜI
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Nhiệm vụ đa dạng từ Dễ đến Ác Mộng · Nhận thưởng Vàng và Kim Cương tiếp tế quân nhu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {claimableCount > 0 && (
              <button
                onClick={handleClaimAllAvailable}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-orbitron font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:brightness-110 cursor-pointer animate-pulse"
              >
                NHẬN TẤT CẢ ({claimableCount})
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
          {[
            { id: 'all', label: `TẤT CẢ (${missions.length})` },
            { id: 'easy', label: `DỄ (${missions.filter((m) => m.difficulty === 'easy').length})` },
            { id: 'normal', label: `TRUNG BÌNH (${missions.filter((m) => m.difficulty === 'normal').length})` },
            { id: 'hard', label: `KHÓ (${missions.filter((m) => m.difficulty === 'hard').length})` },
            { id: 'nightmare', label: `ÁC MỘNG (${missions.filter((m) => m.difficulty === 'nightmare').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedDifficulty(tab.id as 'all' | MissionDifficulty)}
              className={`px-3 py-1.5 rounded-xl text-xs font-orbitron font-bold shrink-0 transition-all cursor-pointer ${
                selectedDifficulty === tab.id
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Bar */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 font-rajdhani px-1">
          <div>
            Tiến độ tổng: <span className="font-orbitron font-bold text-cyan-300">{completedCount}/{missions.length}</span> hoàn thành
          </div>
          {claimableCount > 0 && (
            <div className="text-amber-400 font-orbitron font-semibold animate-pulse">
              Có {claimableCount} nhiệm vụ sẵn sàng nhận thưởng!
            </div>
          )}
        </div>

        {/* Missions List */}
        <div className="mt-2.5 space-y-2.5">
          {filteredMissions.map((m) => {
            const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));
            const isReadyToClaim = m.completed && !m.claimed;

            return (
              <div
                key={m.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  m.claimed
                    ? 'bg-slate-950/50 border-slate-800/80 opacity-70'
                    : isReadyToClaim
                    ? 'bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/40'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                {/* Info */}
                <div className="flex-1 space-y-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1 rounded bg-slate-800/80">{getCategoryIcon(m.category)}</span>
                    <span className="font-orbitron font-bold text-xs sm:text-sm text-white">
                      {m.title}
                    </span>
                    {getDifficultyBadge(m.difficulty)}
                    {m.claimed && (
                      <span className="text-[10px] font-orbitron text-emerald-400 flex items-center gap-1 ml-auto sm:ml-0">
                        <CheckCircle2 className="w-3 h-3" /> Đã nhận
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-rajdhani">{m.description}</p>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          m.claimed
                            ? 'bg-emerald-500'
                            : isReadyToClaim
                            ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                            : 'bg-gradient-to-r from-cyan-500 to-sky-400'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="font-orbitron text-[11px] text-slate-300 tabular-nums whitespace-nowrap">
                      {m.current.toLocaleString()} / {m.target.toLocaleString()} ({progressPct}%)
                    </span>
                  </div>
                </div>

                {/* Reward & Claim CTA */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  {/* Rewards Pills */}
                  <div className="flex items-center gap-1.5">
                    {/* Gold Reward */}
                    {m.rewardGold > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-yellow-500/40 text-yellow-300 font-orbitron font-bold text-xs shadow-inner">
                        <span>🪙</span>
                        <span>+{m.rewardGold.toLocaleString()}</span>
                      </div>
                    )}
                    {/* Gems Reward */}
                    {m.rewardGems > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-300 font-orbitron font-bold text-xs shadow-inner">
                        <span>💎</span>
                        <span>+{m.rewardGems.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {m.claimed ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-500 text-xs font-orbitron font-semibold cursor-not-allowed"
                    >
                      ĐÃ NHẬN
                    </button>
                  ) : isReadyToClaim ? (
                    <button
                      onClick={() => handleClaimSingle(m.id)}
                      className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-orbitron font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer animate-bounce"
                    >
                      NHẬN
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-orbitron font-medium cursor-not-allowed"
                    >
                      CHƯA ĐẠT
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-orbitron text-slate-300 cursor-pointer"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
