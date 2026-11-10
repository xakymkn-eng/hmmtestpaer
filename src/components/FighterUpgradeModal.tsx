/**
 * Fighter Star Upgrade Modal (Nâng Cấp Sao Chiến Cơ Bằng Mảnh)
 * Allows players to upgrade star rank (★1 to ★6) using Shards and Gold
 * earned from duplicate Gacha rolls and battle completions.
 * Optimized with large touch targets (min-h-[44px]/[52px]), prominent CTAs,
 * test shard supply button, and responsive layout for mobile and desktop.
 */

import React,{ useState } from 'react';
import {
X,
Star,
Sparkles,
Shield,
Zap,
Gauge,
Crosshair,
TrendingUp,
Award,
ChevronRight,
Gift,
CheckCircle2,
AlertCircle,
} from 'lucide-react';
import {
FIGHTERS,
FighterStats,
MAX_FIGHTER_STARS,
FIGHTER_STAR_CONFIGS,
getFighterStarBonus,
getFighterStarUpgradeCost,
canUpgradeFighterStar,
} from '../game/rules';
import { sound } from '../game/audio';

interface FighterUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighter: FighterStats;
  allFighters: FighterStats[];
  ownedFighterIds: string[];
  gold: number;
  fighterShards: Record<string, number>;
  fighterStars: Record<string, number>;
  onSelectFighter: (fighterId: string) => void;
  onUpgradeStar: (fighterId: string) => void;
  onOpenGacha?: () => void;
  onOpenFighterDetail?: (fighter: FighterStats) => void;
  onGrantTestShards?: (fighterId: string) => void;
}

export const FighterUpgradeModal: React.FC<FighterUpgradeModalProps> = ({
  isOpen,
  onClose,
  fighter,
  allFighters,
  ownedFighterIds,
  gold,
  fighterShards,
  fighterStars,
  onSelectFighter,
  onUpgradeStar,
  onOpenGacha,
  onOpenFighterDetail,
  onGrantTestShards,
}) => {
  const [selectedId, setSelectedId] = useState<string>(fighter?.id || 'phoenix');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (fighter?.id) {
      setSelectedId(fighter.id);
    }
  }, [fighter?.id]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentFighter = FIGHTERS[selectedId] || fighter || FIGHTERS.phoenix;
  const currentStar = fighterStars[currentFighter.id] || 1;
  const currentShards = fighterShards[currentFighter.id] || 0;
  const cost = getFighterStarUpgradeCost(currentStar);
  const currentBonus = getFighterStarBonus(currentStar);
  const nextBonus = getFighterStarBonus(cost.nextStar);
  const canUpgrade = canUpgradeFighterStar(currentStar, currentShards, gold);

  const ownedFightersList = allFighters.filter((f) => ownedFighterIds.includes(f.id));
  const displayList = ownedFightersList.length > 0 ? ownedFightersList : [currentFighter];

  const handleUpgrade = () => {
    if (cost.maxed) return;
    if (!canUpgrade) {
      sound.playClick();
      setFeedbackMsg(`Chưa đủ điều kiện! Cần thêm ${Math.max(0, cost.shards - currentShards)} Mảnh hoặc ${Math.max(0, cost.gold - gold).toLocaleString()} Vàng.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
      return;
    }
    sound.playPowerup();
    onUpgradeStar(currentFighter.id);
    setFeedbackMsg(`🎉 Đột phá thành công ${currentFighter.vietnameseName} lên ★${cost.nextStar}!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleGrantShards = () => {
    sound.playReward();
    if (onGrantTestShards) {
      onGrantTestShards(currentFighter.id);
    }
    setFeedbackMsg(`🎁 Đã cấp 120 Mảnh ${currentFighter.vietnameseName} & 500,000 Vàng để thử nghiệm!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const progressPercent = cost.maxed
    ? 100
    : Math.min(100, Math.round((currentShards / (cost.shards || 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-gradient-to-b from-[#091322] via-[#050b14] to-[#040810] border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col p-3.5 sm:p-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/25">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Star className="w-6 h-6 text-slate-950 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
                XƯỞNG NÂNG CẤP SAO CHIẾN CƠ
              </h2>
              <p className="text-xs text-slate-300 font-rajdhani">
                Đột phá từ <span className="text-amber-400 font-bold">★1</span> lên <span className="text-amber-400 font-bold">★6 Thần Khởi</span> để tăng toàn diện chỉ số và sức mạnh tuyệt kỹ
              </p>
            </div>
          </div>

          {/* Currencies & Large Easy Close */}
          <div className="flex items-center gap-2">
            {/* Gold Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-yellow-500/60 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              <span className="text-base">🪙</span>
              <span className="font-orbitron font-bold text-yellow-300 text-xs sm:text-sm tabular-nums">
                {gold.toLocaleString()}
              </span>
            </div>

            {/* Easy Click Close Button */}
            <button
              onClick={onClose}
              aria-label="Đóng bảng nâng cấp sao"
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer flex items-center justify-center touch-manipulation active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Fleet Horizontal Selector with spacious min-h-[44px] buttons */}
        <div className="my-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-orbitron text-amber-400 uppercase tracking-wider font-bold">
              CHỌN CHIẾN CƠ NÂNG CẤP ({displayList.length}):
            </span>
            <span className="text-[11px] text-slate-400 font-rajdhani">
              Nhấn trực tiếp vào từng máy bay bên dưới
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {displayList.map((f) => {
              const star = fighterStars[f.id] || 1;
              const shards = fighterShards[f.id] || 0;
              const isCur = f.id === currentFighter.id;
              const fCost = getFighterStarUpgradeCost(star);
              const canUp = !fCost.maxed && shards >= fCost.shards && gold >= fCost.gold;

              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedId(f.id);
                    onSelectFighter(f.id);
                    sound.playClick();
                  }}
                  className={`relative min-h-[46px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-orbitron font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer touch-manipulation active:scale-95 ${
                    isCur
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-102 ring-2 ring-amber-400/50'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
                  }`}
                >
                  <span style={{ color: f.color }}>{f.vietnameseName}</span>
                  <span className="text-amber-400 font-bold">
                    {'★'.repeat(star)}
                  </span>
                  {canUp && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1 shadow" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Feedback Toast inside modal */}
        {feedbackMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-400 text-amber-200 text-xs sm:text-sm font-orbitron font-bold text-center animate-bounce shadow">
            {feedbackMsg}
          </div>
        )}

        {/* Fighter Main Presentation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {/* Left Column: Fighter Profile & Star Badges */}
          <div className="md:col-span-5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-orbitron font-black px-2.5 py-1 rounded-md ${
                    currentFighter.tier === 'S'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-400/70 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : currentFighter.tier === 'A'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-400/70'
                      : 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/70'
                  }`}
                >
                  BẬC {currentFighter.tier}
                </span>

                <div className="flex items-center gap-1">
                  {Array.from({ length: MAX_FIGHTER_STARS }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        i < currentStar
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                          : 'text-slate-700 fill-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black font-orbitron text-white" style={{ color: currentFighter.color }}>
                {currentFighter.vietnameseName}
              </h3>
              <div className="text-xs text-slate-400 font-rajdhani mb-3 font-semibold">
                {currentFighter.name} · <span className="text-amber-300">{FIGHTER_STAR_CONFIGS[currentStar]?.title}</span>
              </div>

              {/* Shards Progress Card */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/30 mb-3">
                <div className="flex items-center justify-between text-xs sm:text-sm font-orbitron mb-1.5">
                  <span className="text-slate-200 flex items-center gap-1 font-rajdhani font-bold">
                    <span>🧩</span> Mảnh Chiến Cơ Hiện Có:
                  </span>
                  <span className="font-bold text-amber-300 tabular-nums text-sm sm:text-base">
                    {currentShards} {cost.maxed ? '' : `/ ${cost.shards} Mảnh`}
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {!cost.maxed && currentShards < cost.shards && (
                  <div className="mt-2 text-xs text-slate-300 font-rajdhani flex flex-wrap items-center justify-between gap-1">
                    <span>Thiếu: <strong className="text-rose-400 font-orbitron">{cost.shards - currentShards} Mảnh</strong></span>
                    {onOpenGacha && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenGacha();
                        }}
                        className="text-amber-400 hover:text-amber-300 underline font-orbitron text-xs cursor-pointer font-bold"
                      >
                        Quay Gacha lấy mảnh →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Instant Test Shards Supply Button (1-Click for Instant Testing!) */}
              <button
                type="button"
                onClick={handleGrantShards}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-400 text-emerald-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow mb-3"
                title="Cấp mảnh miễn phí để thử nghiệm nâng sao tức thì"
              >
                <Gift className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>🎁 NHẬN 120 MẢNH & 500K VÀNG (THỬ NGHIỆM)</span>
              </button>

              {/* Skill description */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs mb-3">
                <div className="font-orbitron font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Kỹ Năng: {currentFighter.skillName}</span>
                </div>
                <p className="text-slate-200 font-rajdhani text-xs leading-relaxed">
                  {currentFighter.skillDescription}
                </p>
              </div>

              {/* View Full Technical Specs & Lore CTA */}
              {onOpenFighterDetail && (
                <button
                  type="button"
                  onClick={() => onOpenFighterDetail(currentFighter)}
                  className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-300 text-cyan-300 hover:text-white font-orbitron font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>XEM HỒ SƠ & THÔNG SỐ CHI TIẾT</span>
                </button>
              )}
            </div>

            <div className="mt-3 text-[11px] text-slate-400 font-rajdhani text-center">
              *Roll trúng chiến cơ trùng trong Gacha tự động chuyển thành 30 (B), 60 (A) hoặc 120 (S) Mảnh chiến cơ!
            </div>
          </div>

          {/* Right Column: Stat Comparison & Upgrade Action */}
          <div className="md:col-span-7 p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs sm:text-sm font-orbitron font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  SO SÁNH THÔNG SỐ SAO CHIẾN ĐẤU
                </span>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-orbitron font-bold">
                  <span className="text-slate-400 flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 text-slate-400 fill-slate-400" />
                    Cấp {currentStar}
                  </span>
                  {!cost.maxed && (
                    <>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Cấp {cost.nextStar}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Table Comparison */}
              <div className="space-y-2">
                {/* Sát thương đạn */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm font-rajdhani">
                  <span className="text-slate-200 font-semibold flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-rose-400" /> Sát Thương Đạn (DMG):
                  </span>
                  <div className="flex items-center gap-2 font-orbitron tabular-nums">
                    <span className="text-slate-400">+{currentBonus.damageBonusPercent}%</span>
                    {!cost.maxed && (
                      <>
                        <span className="text-slate-600">→</span>
                        <span className="text-emerald-400 font-bold">+{nextBonus.damageBonusPercent}%</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          (+{nextBonus.damageBonusPercent - currentBonus.damageBonusPercent}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Máu & Giáp */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm font-rajdhani">
                  <span className="text-slate-200 font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" /> Máu & Giáp Tối Đa:
                  </span>
                  <div className="flex items-center gap-2 font-orbitron tabular-nums">
                    <span className="text-slate-400">+{currentBonus.hpBonusPercent}%</span>
                    {!cost.maxed && (
                      <>
                        <span className="text-slate-600">→</span>
                        <span className="text-emerald-400 font-bold">+{nextBonus.hpBonusPercent}%</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          (+{nextBonus.hpBonusPercent - currentBonus.hpBonusPercent}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tốc độ bay */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm font-rajdhani">
                  <span className="text-slate-200 font-semibold flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-cyan-400" /> Tốc Độ Bay:
                  </span>
                  <div className="flex items-center gap-2 font-orbitron tabular-nums">
                    <span className="text-slate-400">+{currentBonus.speedBonusPercent}%</span>
                    {!cost.maxed && (
                      <>
                        <span className="text-slate-600">→</span>
                        <span className="text-cyan-400 font-bold">+{nextBonus.speedBonusPercent}%</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                          (+{nextBonus.speedBonusPercent - currentBonus.speedBonusPercent}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tỉ lệ bạo kích */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm font-rajdhani">
                  <span className="text-slate-200 font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Tỉ Lệ Bạo Kích:
                  </span>
                  <div className="flex items-center gap-2 font-orbitron tabular-nums">
                    <span className="text-slate-400">+{currentBonus.critRateBonus}%</span>
                    {!cost.maxed && (
                      <>
                        <span className="text-slate-600">→</span>
                        <span className="text-amber-400 font-bold">+{nextBonus.critRateBonus}%</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          (+{nextBonus.critRateBonus - currentBonus.critRateBonus}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Phòng thủ & Sát thương chuẩn */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm font-rajdhani">
                  <span className="text-slate-200 font-semibold flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" /> Phòng Thủ / ST Chuẩn:
                  </span>
                  <div className="flex items-center gap-2 font-orbitron tabular-nums">
                    <span className="text-slate-400">+{currentBonus.defenseBonus} / +{currentBonus.trueDamageBonus}</span>
                    {!cost.maxed && (
                      <>
                        <span className="text-slate-600">→</span>
                        <span className="text-purple-300 font-bold">+{nextBonus.defenseBonus} / +{nextBonus.trueDamageBonus}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Giảm hồi chiêu kỹ năng */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm font-rajdhani">
                  <span className="text-slate-200 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" /> Giảm Hồi Tuyệt Kỹ:
                  </span>
                  <div className="flex items-center gap-2 font-orbitron tabular-nums">
                    <span className="text-slate-400">-{currentBonus.cooldownReductionPercent}%</span>
                    {!cost.maxed && (
                      <>
                        <span className="text-slate-600">→</span>
                        <span className="text-yellow-300 font-bold">-{nextBonus.cooldownReductionPercent}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Action Footer - Highly visible and prominent */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              {cost.maxed ? (
                <div className="min-h-[52px] p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-400/60 text-center font-orbitron font-bold text-amber-300 text-sm sm:text-base flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  <span>👑 CHIẾN CƠ ĐÃ ĐẠT CẤP SAO TỐI THƯỢNG (★6 THẦN KHỞI)!</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-orbitron">
                        <span className="text-slate-400">Tiêu hao:</span>
                        <span className={`font-bold tabular-nums ${currentShards >= cost.shards ? 'text-amber-300 font-black' : 'text-rose-400'}`}>
                          🧩 {cost.shards} Mảnh ({currentShards}/{cost.shards})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-orbitron">
                        <span className="text-slate-400">+</span>
                        <span className={`font-bold tabular-nums ${gold >= cost.gold ? 'text-yellow-300 font-black' : 'text-rose-400'}`}>
                          🪙 {cost.gold.toLocaleString()} Vàng
                        </span>
                      </div>
                    </div>

                    {!canUpgrade && (
                      <span className="text-rose-400 text-xs font-rajdhani font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Chưa đủ tài nguyên (Bấm "Nhận 120 Mảnh" phía trên)
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleUpgrade}
                    className={`w-full min-h-[54px] px-6 py-3.5 rounded-xl font-orbitron font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all touch-manipulation cursor-pointer active:scale-98 ${
                      canUpgrade
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-yellow-200'
                        : 'bg-gradient-to-r from-amber-600/40 to-yellow-600/40 border border-amber-500/50 text-amber-200 hover:bg-amber-600/50'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current text-slate-950" />
                    <span>
                      {canUpgrade
                        ? `BẤM ĐỘT PHÁ LÊN CẤP ${cost.nextStar} SAO NGAY`
                        : `THIẾU TÀI NGUYÊN - BẤM ĐỂ XEM CHI TIẾT`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
