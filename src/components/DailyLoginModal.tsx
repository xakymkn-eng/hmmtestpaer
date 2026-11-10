/**
 * Daily Login Bonus Modal Component (24-Hour Cycle & 7-Day Streak Rewards)
 * Provides a 7-day progressive login bonus track with countdown timer,
 * exclusive cosmetic fighter skins, bonus shards for consistent play,
 * instant gem claims, and streak tracking.
 */

import React,{ useState,useEffect } from 'react';
import {
Calendar,
X,
Sparkles,
CheckCircle2,
Lock,
Gift,
Clock,Zap,
Crown,
Palette,
Check
} from 'lucide-react';
import {
DAILY_BONUS_DAYS,
DailyLoginState,
checkDailyBonusStatus,
COSMETIC_SKINS,StreakRewardResult
} from '../game/rules';
import { sound } from '../game/audio';

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyState: DailyLoginState;
  onClaim: () => void;
  gems: number;
  onToggleSkin?: (skinId: string) => void;
  lastStreakReward?: StreakRewardResult | null;
}

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({
  isOpen,
  onClose,
  dailyState,
  onClaim,
  gems,
  onToggleSkin,
  lastStreakReward,
}) => {
  const [now, setNow] = useState<number>(Date.now());
  const [justClaimedAnimation, setJustClaimedAnimation] = useState<boolean>(false);

  // Update timer every second for real-time countdown
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const status = checkDailyBonusStatus(dailyState, now);
  const {
    canClaim,
    formattedCountdown,
    nextDayToClaim,
    rewardGems,
    isStreakBroken,
    isStreakMilestone,
    nextStreakSkin,
    streakCount,
  } = status;
  const currentClaimedDay = dailyState.lastClaimTimestamp ? dailyState.currentStreakDay : 0;
  const unlockedSkinIds = dailyState.unlockedSkinIds || [];
  const activeSkinId = dailyState.activeSkinId || null;

  const handleClaimClick = () => {
    if (!canClaim) return;
    sound.playClaimReward();
    setJustClaimedAnimation(true);
    onClaim();
    setTimeout(() => {
      setJustClaimedAnimation(false);
    }, 1200);
  };

  const handleSkinAction = (skinId: string) => {
    sound.playClick();
    if (onToggleSkin) {
      onToggleSkin(skinId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Đóng cửa sổ"
          aria-label="Đóng điểm danh"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-orbitron font-bold uppercase tracking-wider mb-2">
            <Gift className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            HỆ THỐNG TIẾP TẾ 24 GIỜ & CHUỖI 7 NGÀY
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-orbitron tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
            ĐIỂM DANH HÀNG NGÀY
          </h2>
          <p className="text-xs text-slate-300 font-rajdhani mt-1 max-w-lg mx-auto">
            Đăng nhập mỗi 24 giờ nhận tiếp tế Gems. Đạt <strong className="text-amber-400 font-semibold">Chuỗi 7 Ngày liên tiếp</strong> để mở khóa <strong className="text-yellow-300 font-semibold">Trang Phục Phi Cơ Độc Quyền</strong> và <strong className="text-amber-300 font-semibold">+150 Mảnh Chiến Cơ Bậc S</strong>!
          </p>
        </div>

        {/* Streak & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-orbitron font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-orbitron text-slate-400">CHUỖI ĐIỂM DANH HIỆN TẠI</div>
              <div className="text-base font-orbitron font-bold text-amber-300 flex items-center gap-2 flex-wrap">
                <span>{dailyState.lastClaimTimestamp ? `Ngày ${dailyState.currentStreakDay} / 7` : 'Chưa điểm danh'}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-orbitron">
                  <Crown className="w-3 h-3 text-yellow-400" />
                  Đã hoàn tất: {streakCount} Chuỗi 7 Ngày
                </span>
                {dailyState.totalClaimsCount > 0 && (
                  <span className="text-xs text-slate-400 font-rajdhani">
                    (Tổng: {dailyState.totalClaimsCount} ngày)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canClaim ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-orbitron font-bold animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                SẴN SÀNG NHẬN
              </span>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-orbitron">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Làm mới sau: <strong className="text-amber-300 font-mono">{formattedCountdown}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Streak Grand Milestone Banner if on Day 7 */}
        {isStreakMilestone && canClaim && (
          <div className="p-3 mb-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400 text-center animate-pulse">
            <div className="flex items-center justify-center gap-2 text-sm font-black font-orbitron text-yellow-300">
              <Crown className="w-4 h-4 text-amber-400 fill-current" />
              <span>MỐC HOÀN THÀNH CHUỖI 7 NGÀY ĐANG CHỜ ĐÓN!</span>
              <Crown className="w-4 h-4 text-amber-400 fill-current" />
            </div>
            <div className="text-xs text-amber-100 font-rajdhani mt-0.5">
              Nhận ngay <strong className="text-white font-bold">10,000 Gems</strong> + Mở khóa <strong className="text-yellow-300 font-bold">{nextStreakSkin ? `Trang phục [${nextStreakSkin.vietnameseName}]` : 'Siêu thưởng Mảnh Bậc S'}</strong> + <strong className="text-white font-bold">+150 Mảnh Chiến Cơ Bậc S</strong>!
            </div>
          </div>
        )}

        {/* Streak broken notice */}
        {isStreakBroken && canClaim && (
          <div className="p-2.5 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-rajdhani text-center">
            ⚠️ Đã quá 48 giờ kể từ lần điểm danh trước. Chuỗi thưởng bắt đầu lại từ Ngày 1!
          </div>
        )}

        {/* 7-Day Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
          {DAILY_BONUS_DAYS.map((dayConfig) => {
            const isDayClaimed =
              dailyState.lastClaimTimestamp !== null &&
              !canClaim &&
              dayConfig.day <= currentClaimedDay;

            const isNextToClaim = canClaim && dayConfig.day === nextDayToClaim;

            return (
              <div
                key={dayConfig.day}
                className={`relative flex flex-col items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 ${
                  dayConfig.isSpecial
                    ? 'col-span-2 sm:col-span-2 bg-gradient-to-br from-amber-950/50 via-slate-900/95 to-yellow-950/50 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.35)]'
                    : isNextToClaim
                    ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-102 ring-2 ring-amber-400/50'
                    : isDayClaimed
                    ? 'bg-slate-900/60 border-emerald-500/40 opacity-75'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                {/* Special Tag for Day 7 */}
                {dayConfig.isSpecial && (
                  <div className="absolute -top-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black font-orbitron uppercase tracking-wider shadow flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-current" />
                    CHUỖI 7 NGÀY: SKIN + MẢNH S
                  </div>
                )}

                {/* Day Header */}
                <div className="text-[11px] font-orbitron font-bold text-slate-400 uppercase mb-1">
                  NGÀY {dayConfig.day}
                </div>

                {/* Gem Visual Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center my-1.5 text-2xl transition-transform ${
                    isNextToClaim ? 'scale-110 animate-bounce' : ''
                  } ${
                    dayConfig.isSpecial
                      ? 'bg-gradient-to-tr from-amber-500/30 to-yellow-400/30 border border-amber-400'
                      : isDayClaimed
                      ? 'bg-emerald-500/20 border border-emerald-500/40'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  {isDayClaimed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : dayConfig.isSpecial ? (
                    <span className="text-2xl drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">👑</span>
                  ) : (
                    <span className="text-2xl drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]">💎</span>
                  )}
                </div>

                {/* Gem Amount */}
                <div
                  className={`text-base sm:text-lg font-black font-orbitron tabular-nums ${
                    dayConfig.isSpecial
                      ? 'text-yellow-300'
                      : isNextToClaim
                      ? 'text-amber-300'
                      : isDayClaimed
                      ? 'text-emerald-300'
                      : 'text-slate-200'
                  }`}
                >
                  +{dayConfig.gems.toLocaleString()}
                </div>

                {/* Day 7 Extra perks summary */}
                {dayConfig.isSpecial ? (
                  <div className="text-[10px] font-orbitron text-amber-200/90 text-center flex flex-col items-center gap-0.5 my-1">
                    <span className="text-yellow-300 font-bold">✨ +1 Skin Độc Quyền</span>
                    <span className="text-amber-300 font-bold">🧩 +150 Mảnh Chiến Cơ S</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 font-rajdhani text-center line-clamp-1 mb-2">
                    {dayConfig.title.split(': ')[1] || dayConfig.title}
                  </div>
                )}

                {/* Status Indicator */}
                <div className="w-full text-center mt-1">
                  {isDayClaimed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-orbitron font-bold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> ĐÃ NHẬN
                    </span>
                  ) : isNextToClaim ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-orbitron font-black text-amber-400 animate-pulse">
                      <Zap className="w-3 h-3 fill-current" /> NHẬN NGAY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-orbitron text-slate-500">
                      <Lock className="w-3 h-3" /> CHƯA MỞ
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-Day Streak Exclusive Cosmetic Skins Showcase & Wardrobe */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 mb-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-black font-orbitron text-amber-300 uppercase tracking-wide">
                BỘ SƯU TẬP TRANG PHỤC CHUỖI 7 NGÀY (7-DAY STREAK SKINS)
              </h3>
            </div>
            <span className="text-[11px] font-orbitron text-slate-400">
              Đã sở hữu: <strong className="text-amber-300 font-mono">{unlockedSkinIds.length}/3</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.values(COSMETIC_SKINS).map((skin, idx) => {
              const isUnlocked = unlockedSkinIds.includes(skin.id);
              const isEquipped = activeSkinId === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                      : isUnlocked
                      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                      : 'bg-slate-900/50 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{skin.icon}</span>
                      <div>
                        <div className="text-xs font-bold font-orbitron text-white leading-tight">
                          {skin.vietnameseName}
                        </div>
                        <div className="text-[9px] font-orbitron text-amber-400/90 uppercase">
                          {skin.tag}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black font-orbitron border ${
                        skin.rarity === 'HUYỀN THOẠI'
                          ? 'bg-gradient-to-r from-red-600/30 via-amber-500/30 to-rose-600/30 text-amber-300 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {skin.rarity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-rajdhani line-clamp-2 mb-2.5">
                    {skin.description}
                  </p>

                  <div className="mt-auto">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleSkinAction(skin.id)}
                        className={`w-full py-1.5 px-2 rounded-lg text-xs font-orbitron font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isEquipped
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ĐANG TRANG BỊ
                          </>
                        ) : (
                          'TRANG BỊ'
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-1.5 px-2 rounded-lg bg-slate-800/60 border border-slate-800 text-[10px] font-orbitron text-slate-400 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        CHUỖI KỲ {idx + 1}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claim Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-amber-500/30">
          <div>
            <div className="text-xs font-orbitron text-slate-400 uppercase">TIẾP TẾ SẴN CÓ</div>
            <div className="text-xl sm:text-2xl font-black font-orbitron text-amber-300 flex items-center gap-2">
              <span>+{rewardGems.toLocaleString()} GEMS</span>
              <span className="text-sm">💎</span>
              {nextDayToClaim === 7 && canClaim && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-yellow-300">
                  +150 MẢNH S & SKIN
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-rajdhani">
              {canClaim
                ? nextDayToClaim === 7
                  ? `Mốc Chuỗi 7 Ngày: Nhận 10,000 Gems, mở khóa Trang phục và 150 Mảnh Chiến Cơ Bậc S!`
                  : `Nhận quà cho Ngày ${nextDayToClaim}. Kho đá quý hiện tại: ${gems.toLocaleString()} Gems.`
                : `Bạn đã hoàn tất nhận quà hôm nay. Vui lòng quay lại sau ${formattedCountdown}.`}
            </div>
          </div>

          <button
            onClick={handleClaimClick}
            disabled={!canClaim}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black font-orbitron text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              canClaim
                ? nextDayToClaim === 7
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 ring-2 ring-yellow-400/80 animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70'
            } ${justClaimedAnimation ? 'ring-4 ring-emerald-400 scale-105' : ''}`}
          >
            {canClaim ? (
              nextDayToClaim === 7 ? (
                <>
                  <Crown className="w-4 h-4 fill-current animate-bounce" />
                  NHẬN KHO BÁU CHUỖI 7 NGÀY
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current animate-spin" />
                  NHẬN THƯỞNG NGÀY {nextDayToClaim}
                </>
              )
            ) : (
              <>
                <Clock className="w-4 h-4" />
                ĐÃ NHẬN HÔM NAY ({formattedCountdown})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
