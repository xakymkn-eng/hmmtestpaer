/**
 * In-Game HUD Component (Mobile & Touch Optimized)
 * Full-viewport perimeter clusters, responsive tabular-nums readouts,
 * vitality gauges, centered boss health bar, and tactile virtual gamepad touch controls
 * (Auto-fire toggle, EMP Bomb [B], Fighter Skill [E], Pause & Audio).
 */

import React from 'react';
import { EngineHUDState } from '../game/SkyVanguardEngine';
import { getComboRankInfo } from '../game/rules';
import {
ComboBurstEvent,
checkComboBurstCrossing,
checkScoreThresholdCrossing,
createComboBurstEvent,
} from '../game/comboBurst';
import { sound } from '../game/audio';
import { Volume2,VolumeX,Pause,Shield,Bomb,Zap,Sparkles,Flame,CheckCircle2,Compass,Camera,Palette,Home,Eye } from 'lucide-react';

interface HUDProps {
  state: EngineHUDState;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerBomb: () => void;
  onTriggerSkill: () => void;
  onToggleAutoFire?: () => void;
  missionToast?: string | null;
  onExitFreeFlight?: () => void;
  onCycleFreeFlightTheme?: () => void;
  onTogglePhotoMode?: () => void;
  onBoostFreeFlight?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  state,
  onPause,
  isMuted,
  onToggleMute,
  onTriggerBomb,
  onTriggerSkill,
  onToggleAutoFire,
  missionToast,
  onExitFreeFlight,
  onCycleFreeFlightTheme,
  onTogglePhotoMode,
  onBoostFreeFlight,
}) => {
  // Boss HP ratio
  const bossHpPct =
    state.bossActive && state.bossMaxHp > 0
      ? Math.max(0, Math.min(100, Math.round((state.bossHp / state.bossMaxHp) * 100)))
      : 0;

  const isSkillReady = state.skillCooldownRemaining <= 0;
  const skillCdProgress = state.skillCooldownMax > 0
    ? (1 - state.skillCooldownRemaining / state.skillCooldownMax) * 100
    : 100;

  const rank = getComboRankInfo(state.combo);

  // Format running seconds timer MM:SS
  const mins = Math.floor(state.playTimeSeconds / 60).toString().padStart(2, '0');
  const secs = (state.playTimeSeconds % 60).toString().padStart(2, '0');
  const timerDisplay = `${mins}:${secs}`;

  const hpPct = Math.max(0, Math.min(100, Math.round((state.hp / state.maxHp) * 100)));
  const armorPct = state.maxArmor > 0
    ? Math.max(0, Math.min(100, Math.round((state.armor / state.maxArmor) * 100)))
    : 0;

  // Subtle pulse animation on combo multiplier HUD whenever combo increases
  // plus energized shake & radiant pulse when reaching a combo milestone (e.g. every 50 hits)
  const [comboPulsing, setComboPulsing] = React.useState(false);
  const [milestoneActive, setMilestoneActive] = React.useState(false);
  const [milestoneValue, setMilestoneValue] = React.useState<number | null>(null);
  const [activeComboBurst, setActiveComboBurst] = React.useState<ComboBurstEvent | null>(null);

  const prevComboRef = React.useRef(state.combo);
  const prevScoreRef = React.useRef(state.score);
  const milestoneTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Monitor combo milestones (e.g. 50x, 100x, 150x, 200x, 250x, 300x combos)
  React.useEffect(() => {
    const prev = prevComboRef.current;
    const current = state.combo;

    // Reset when combo drops or is lost
    if (current <= 1) {
      setComboPulsing(false);
      setMilestoneActive(false);
      setMilestoneValue(null);
      if (milestoneTimerRef.current) {
        clearTimeout(milestoneTimerRef.current);
        milestoneTimerRef.current = null;
      }
      prevComboRef.current = current;
      return;
    }

    if (current > prev) {
      // Check for milestone crossing (every 50 hits: 50, 100, 150, 200...)
      const reachedMilestone = checkComboBurstCrossing(prev, current, 50);
      if (reachedMilestone) {
        setMilestoneActive(true);
        setMilestoneValue(reachedMilestone);

        // Create Visually Enhanced Combo Burst notification event
        const burstEvent = createComboBurstEvent(reachedMilestone, 'combo', state.comboMultiplier);
        setActiveComboBurst(burstEvent);

        try {
          sound.playComboMilestone(reachedMilestone);
        } catch {}

        if (milestoneTimerRef.current) clearTimeout(milestoneTimerRef.current);
        milestoneTimerRef.current = setTimeout(() => {
          setMilestoneActive(false);
          milestoneTimerRef.current = null;
        }, 850);

        if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
        burstTimerRef.current = setTimeout(() => {
          setActiveComboBurst(null);
          burstTimerRef.current = null;
        }, 2200);
      } else {
        // Standard subtle pulse for normal hits
        setComboPulsing(true);
        const timer = setTimeout(() => setComboPulsing(false), 240);
        prevComboRef.current = current;
        return () => clearTimeout(timer);
      }
    }
    prevComboRef.current = current;
  }, [state.combo, state.comboMultiplier]);

  // Monitor score milestones (e.g. 50k, 100k, 250k, 500k, 1M pts)
  React.useEffect(() => {
    const prevScore = prevScoreRef.current;
    const currentScore = state.score;

    if (currentScore > prevScore) {
      const reachedScore = checkScoreThresholdCrossing(prevScore, currentScore);
      if (reachedScore) {
        const scoreEvent = createComboBurstEvent(reachedScore, 'score', state.comboMultiplier);
        setActiveComboBurst(scoreEvent);
        try {
          sound.playComboMilestone(100);
        } catch {}

        if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
        burstTimerRef.current = setTimeout(() => {
          setActiveComboBurst(null);
          burstTimerRef.current = null;
        }, 2400);
      }
    }
    prevScoreRef.current = currentScore;
  }, [state.score, state.comboMultiplier]);

  // FREE FLIGHT GALAXY CRUISE HUD (KHU VỰC THĂM QUAN)
  if (state.gameMode === 'free_flight') {
    if (state.freeFlightIsPhotoMode) {
      return (
        <div className="absolute inset-0 pointer-events-none z-30 select-none p-3 sm:p-5 pt-[max(16px,env(safe-area-inset-top))]">
          <div className="pointer-events-auto flex items-center justify-between gap-2 max-w-full">
            <button
              onClick={onExitFreeFlight}
              type="button"
              aria-label="Thoát ra sảnh"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-950/85 hover:bg-rose-900 border border-rose-500/80 text-rose-100 backdrop-blur-md text-xs font-orbitron font-bold tracking-wider transition-all shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-95 cursor-pointer touch-manipulation"
            >
              <Home className="w-4 h-4 text-rose-300" />
              <span>🚪 THOÁT RA SẢNH</span>
            </button>

            <button
              onClick={onTogglePhotoMode}
              type="button"
              aria-label="Hiện giao diện"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/85 hover:bg-slate-900/95 border border-cyan-400 text-cyan-300 backdrop-blur-md text-xs font-orbitron font-semibold tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 cursor-pointer touch-manipulation"
            >
              <Eye className="w-4 h-4" />
              <span>HIỆN GIAO DIỆN [P]</span>
            </button>
          </div>
        </div>
      );
    }

    const boostPct = Math.round(state.freeFlightBoostEnergy ?? 100);
    const speed = Math.round(state.freeFlightSpeed ?? 0);
    const posX = Math.round(state.freeFlightX ?? 0);
    const posY = Math.round(state.freeFlightY ?? 0);
    const nearestLandmark = state.freeFlightNearestLandmark || 'Không gian sâu';
    const nearestDistance = Math.round(state.freeFlightNearestDistance ?? 0);
    const themeName = state.freeFlightThemeTitle || 'Dải Ngân Hà Rực Rỡ';

    return (
      <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-2.5 sm:p-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]">
        {/* Top bar with responsive wrapping and prominent Exit Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-2.5">
          {/* Coordinates & Landmark Info */}
          <div className="pointer-events-auto bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-[0_0_20px_rgba(0,0,0,0.6)] max-w-full sm:max-w-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 text-cyan-400 font-orbitron text-xs sm:text-sm font-bold tracking-wider">
                <Compass className="w-4 h-4 animate-spin text-cyan-300" />
                <span>KHU VỰC THĂM QUAN THIÊN HÀ</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-orbitron font-bold text-emerald-300">
                THƯ GIÃN
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-300 font-rajdhani flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Tọa độ:</span>
                <span className="font-mono text-cyan-200">X: {posX} | Y: {posY}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Vận tốc:</span>
                <span className="font-mono text-emerald-300 font-bold">{speed} km/s</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-800/80 pt-1 mt-0.5">
                <span className="text-slate-400 truncate">Kỳ quan gần nhất:</span>
                <span className="text-amber-300 font-semibold truncate text-right">{nearestLandmark} ({nearestDistance}ly)</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-[9px] text-slate-400 pt-0.5">
                <span>Chủ đề:</span>
                <span className="text-fuchsia-300 truncate">{themeName}</span>
              </div>
            </div>
          </div>

          {/* Action buttons with high priority prominent VỀ SẢNH */}
          <div className="pointer-events-auto flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={onExitFreeFlight}
              type="button"
              aria-label="Thoát ra sảnh chính"
              title="Thoát khu vực thăm quan và trở về sảnh chính"
              className="min-h-[42px] px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-400/80 text-white backdrop-blur-md transition-all active:scale-95 shadow-[0_0_18px_rgba(244,63,94,0.55)] flex items-center gap-2 font-orbitron text-xs sm:text-sm font-black cursor-pointer touch-manipulation ring-1 ring-rose-400/40"
            >
              <Home className="w-4 h-4 text-white" />
              <span>🚪 THOÁT RA SẢNH</span>
            </button>

            <button
              onClick={onCycleFreeFlightTheme}
              type="button"
              aria-label="Đổi chủ đề ngân hà"
              title="Đổi màu sắc & bối cảnh thiên hà"
              className="min-h-[42px] p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-fuchsia-500/40 text-fuchsia-300 backdrop-blur-md transition-all active:scale-95 shadow-md flex items-center gap-1.5 font-orbitron text-xs font-semibold cursor-pointer touch-manipulation"
            >
              <Palette className="w-4 h-4 text-fuchsia-400" />
              <span className="hidden sm:inline">CHỦ ĐỀ</span>
            </button>

            <button
              onClick={onTogglePhotoMode}
              type="button"
              aria-label="Chế độ ngắm cảnh / chụp ảnh"
              title="Ẩn toàn bộ giao diện để ngắm cảnh / chụp ảnh"
              className="min-h-[42px] p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/40 text-cyan-300 backdrop-blur-md transition-all active:scale-95 shadow-md flex items-center gap-1.5 font-orbitron text-xs font-semibold cursor-pointer touch-manipulation"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">NGẮM CẢNH</span>
            </button>

            <button
              onClick={onToggleMute}
              type="button"
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="min-h-[42px] min-w-[42px] p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700 text-slate-300 backdrop-blur-md transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer touch-manipulation"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Center Hint */}
        <div className="text-center pointer-events-none">
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-950/60 border border-cyan-500/20 text-cyan-300/80 text-[10px] sm:text-xs font-rajdhani backdrop-blur-sm animate-pulse">
            Chạm & Kéo / Phím Mũi tên / Chuột để điều hướng 360° • Bấm Boost để tăng tốc Warp
          </div>
        </div>

        {/* Bottom Bar: Warp Boost Controls & Gauge */}
        <div className="flex items-end justify-between gap-4">
          {/* Boost Energy Gauge */}
          <div className="pointer-events-auto bg-slate-950/75 border border-cyan-500/30 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 min-w-[180px] sm:min-w-[220px]">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-orbitron text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-cyan-300 font-bold">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                NĂNG LƯỢNG WARP
              </span>
              <span className="font-mono text-cyan-300">{boostPct}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-cyan-900/60">
              <div
                className={`h-full transition-all duration-100 ${
                  state.freeFlightIsBoosting
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-400'
                }`}
                style={{ width: `${boostPct}%` }}
              />
            </div>
          </div>

          {/* Touch Boost Button */}
          <button
            onPointerDown={onBoostFreeFlight}
            type="button"
            aria-label="Tăng tốc độ Warp"
            className={`pointer-events-auto flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl border font-orbitron font-bold text-xs sm:text-sm tracking-wider transition-all cursor-pointer touch-manipulation min-h-[48px] active:scale-90 shadow-lg ${
              state.freeFlightIsBoosting
                ? 'bg-rose-500/40 border-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse scale-105'
                : 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 hover:bg-cyan-500/40 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
            }`}
          >
            <Zap className={`w-5 h-5 ${state.freeFlightIsBoosting ? 'text-amber-300 animate-spin' : 'text-cyan-300'}`} />
            <span>WARP BOOST [SPACE / SHIFT]</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-2 sm:p-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-[max(10px,env(safe-area-inset-top))] px-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] max-w-full overflow-hidden">
      {/* VISUALLY ENHANCED 'COMBO BURST' & SCORE THRESHOLD NOTIFICATION (CSS ANIMATED) */}
      {activeComboBurst && (
        <div
          key={activeComboBurst.id}
          className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-start pt-[12vh] sm:pt-[15vh] overflow-hidden select-none"
        >
          {/* Fullscreen Edge Vignette Flash (non-intrusive edge glow, leaves center play clear) */}
          <div
            className="absolute inset-0 pointer-events-none animate-combo-screen-vignette"
            style={{
              background: `radial-gradient(circle at center, transparent 40%, ${activeComboBurst.themeColor}26 75%, ${activeComboBurst.themeColor}55 100%)`,
              boxShadow: `inset 0 0 70px ${activeComboBurst.themeColor}88, inset 0 0 130px ${activeComboBurst.accentColor}55`,
            }}
          />

          {/* Rotating Ambient Holographic Rays */}
          <div className="relative flex flex-col items-center max-w-[94vw] sm:max-w-md pointer-events-auto">
            <div
              className="absolute -top-16 w-64 h-64 sm:w-80 sm:h-80 rounded-full opacity-35 animate-combo-burst-rays pointer-events-none blur-sm"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${activeComboBurst.themeColor} 30deg, transparent 60deg, ${activeComboBurst.accentColor} 90deg, transparent 120deg, ${activeComboBurst.themeColor} 150deg, transparent 180deg, ${activeComboBurst.accentColor} 210deg, transparent 240deg, ${activeComboBurst.themeColor} 270deg, transparent 300deg, ${activeComboBurst.accentColor} 330deg, transparent 360deg)`,
              }}
            />

            {/* Main Burst Card */}
            <div
              onClick={() => setActiveComboBurst(null)}
              className={`relative z-10 flex flex-col items-center px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-gradient-to-b ${activeComboBurst.bannerGradient} border-2 ${activeComboBurst.borderClass} backdrop-blur-xl animate-combo-burst-slam shadow-2xl transition-all cursor-pointer`}
              style={{
                boxShadow: `0 0 40px ${activeComboBurst.themeColor}88, inset 0 0 25px ${activeComboBurst.accentColor}44`,
              }}
              title="Nhấn để ẩn thông báo"
            >
              {/* Top Tag: Rank / Tier Code */}
              <div className="flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/20 text-[8px] sm:text-[10px] font-orbitron font-black tracking-widest uppercase">
                <span
                  className="w-2 h-2 rounded-full animate-ping shrink-0"
                  style={{ backgroundColor: activeComboBurst.themeColor }}
                />
                <span style={{ color: activeComboBurst.themeColor }}>
                  {activeComboBurst.rankCode}
                </span>
                <span className="text-white/60">·</span>
                <span className="text-white">COMBO BURST ACTIVATED</span>
              </div>

              {/* Big Impact Title with Neon Gradient and Shimmer */}
              <div
                className="text-center font-orbitron font-black text-xl sm:text-3xl tracking-wider text-transparent bg-clip-text animate-combo-text-shimmer drop-shadow-[0_0_16px_rgba(255,255,255,0.7)]"
                style={{
                  backgroundImage: `linear-gradient(90deg, #ffffff 0%, ${activeComboBurst.themeColor} 25%, #ffffff 50%, ${activeComboBurst.accentColor} 75%, #ffffff 100%)`,
                }}
              >
                {activeComboBurst.vietnameseTitle}
              </div>

              {/* Subtitle / Battle Cry */}
              <div className="text-center text-[10px] sm:text-xs font-rajdhani font-bold text-slate-200 tracking-wide mt-0.5 max-w-[320px] sm:max-w-sm line-clamp-1">
                {activeComboBurst.vietnameseSubtitle}
              </div>

              {/* Multiplier / Score Surge Badge */}
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${activeComboBurst.badgeClass} font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-md`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  <span>HỆ SỐ {activeComboBurst.multiplierText}</span>
                  <span className="text-[10px] text-white/80 font-semibold">• BÙNG NỔ SÁT THƯƠNG</span>
                </div>
              </div>

              {/* Floating Sparks */}
              <div className="absolute -top-2 left-6 text-xs animate-ping pointer-events-none">✨</div>
              <div className="absolute -bottom-2 right-8 text-xs animate-ping pointer-events-none">⚡</div>
              <div className="absolute top-1/2 -left-3 text-xs animate-bounce pointer-events-none">🔥</div>
              <div className="absolute top-1/2 -right-3 text-xs animate-bounce pointer-events-none">💎</div>
            </div>
          </div>
        </div>
      )}

      {/* TOP REGION */}
      <div className="flex flex-col w-full gap-1 max-w-full">
        {/* ROW 1: Top Bar (Vitality on Left, Score & Controls on Right) */}
        <div className="flex items-start justify-between w-full gap-1.5 max-w-full">
          {/* Top-Left: Vitality (MÁU & GIÁP) Gauges & Wave */}
          <div className="flex flex-col gap-0.5 sm:gap-1 w-36 sm:w-60 max-w-[48vw] shrink-0">
            {/* Header row with Live Timer & Title */}
            <div className="flex items-center justify-between text-[8px] sm:text-[10px] pb-0.2">
              <span className="font-orbitron font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="truncate">CHIẾN CƠ</span>
              </span>
              <div className="flex items-center gap-1 px-1 py-0.2 rounded bg-slate-950/85 border border-cyan-500/40 font-orbitron font-bold text-cyan-300 tabular-nums text-[8px] sm:text-[10px]">
                <span className="text-slate-400 text-[7px] sm:text-[8px]">⏱</span>
                <span>{timerDisplay}</span>
              </div>
            </div>

            {/* Thanh Máu (HP Bar) */}
            <div className="flex flex-col gap-0.2 sm:gap-0.5 bg-slate-950/85 px-1.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-slate-800 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-orbitron font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  MÁU
                </span>
                <span className="text-white tabular-nums text-[8px] sm:text-[10px]">
                  {state.hp} / {state.maxHp}
                </span>
              </div>
              <div className="w-full h-1 sm:h-2 bg-slate-900 rounded overflow-hidden border border-emerald-900/60 p-0.2">
                <div
                  className={`h-full rounded transition-all duration-150 ${
                    hpPct <= 25
                      ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                      : hpPct <= 50
                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                  }`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </div>

            {/* Thanh Giáp (Armor Bar) */}
            <div className="flex flex-col gap-0.2 sm:gap-0.5 bg-slate-950/85 px-1.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-slate-800 backdrop-blur-xs">
              <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-orbitron font-bold">
                <span className="text-cyan-400 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-cyan-400" />
                  GIÁP
                  {state.shieldActive && (
                    <span className="text-[7px] px-0.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      KHIÊN
                    </span>
                  )}
                </span>
                <span className="text-white tabular-nums text-[8px] sm:text-[10px]">
                  {state.armor} / {state.maxArmor}
                </span>
              </div>
              <div className="w-full h-1 sm:h-2 bg-slate-900 rounded overflow-hidden border border-cyan-900/60 p-0.2">
                <div
                  className="h-full rounded bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  style={{ width: `${armorPct}%` }}
                />
              </div>
            </div>

            {/* Wave indicator & Sector badge */}
            <div className="flex items-center justify-between gap-1 text-[7px] sm:text-[9px] font-orbitron">
              <div className="flex items-center gap-1">
                {state.gameMode === 'super_hard' ? (
                  <span className="px-1.5 py-0.2 rounded border uppercase font-black text-[7px] sm:text-[8px] bg-red-600/30 text-red-300 border-red-500/70 shadow-[0_0_8px_rgba(239,68,68,0.5)] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    SIÊU KHÓ · ĐỢT {state.wave}/10
                  </span>
                ) : (
                  <span className="text-amber-400 font-black tabular-nums">
                    {state.gameMode === 'universe' ? `WAVE ${state.wave}/5` : state.gameMode === 'boss_rush' ? `BOSS ${state.wave}/20` : `WAVE ${state.wave.toString().padStart(2, '0')}`}
                  </span>
                )}
              </div>

              {state.gameMode === 'adventure' ? (
                <div className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-rose-950/90 border border-rose-500/60 text-[7px] sm:text-[8px] backdrop-blur-xs truncate">
                  <span>👹</span>
                  <span className="font-bold text-rose-300 uppercase truncate max-w-[55px] sm:max-w-[130px]">
                    {state.adventureStageName || `MÀN ${state.adventureStageId || 1}`}
                  </span>
                </div>
              ) : state.gameMode === 'universe' ? (
                <div className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-indigo-950/90 border border-indigo-400/60 text-[7px] sm:text-[8px] backdrop-blur-xs truncate">
                  <span className="font-bold text-cyan-300 uppercase truncate max-w-[45px] sm:max-w-[90px]">{state.universeName || 'VŨ TRỤ'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 px-1 py-0.2 rounded bg-slate-950/85 border border-slate-800 text-[7px] sm:text-[8px] backdrop-blur-xs truncate">
                  <span
                    className="font-bold truncate max-w-[50px] sm:max-w-[110px]"
                    style={{ color: state.sectorAccentColor || '#38bdf8' }}
                  >
                    {state.sectorVietnameseName}
                  </span>
                </div>
              )}
            </div>

            {/* Drone Wingmen & Aegis Barrier Status Indicator */}
            {state.equippedDrones && state.equippedDrones.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                {state.equippedDrones.map((d, di) => (
                  <div
                    key={di}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900/90 border border-cyan-500/40 text-[7px] sm:text-[8px] font-orbitron"
                  >
                    <span>{d.avatarEmoji}</span>
                    <span className="text-white font-bold truncate max-w-[45px] sm:max-w-[70px]">
                      {d.vietnameseName.split(' ')[0]}
                    </span>
                    <span
                      className={`px-0.5 rounded text-[6px] sm:text-[7px] font-black ${
                        d.tier === 'S' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}
                    >
                      {d.tier}
                    </span>
                  </div>
                ))}

                {state.droneAegisShieldHp !== undefined && state.droneAegisShieldHp > 0 && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-400 text-[7px] sm:text-[8px] font-orbitron text-cyan-300 animate-pulse">
                    <Shield className="w-2.5 h-2.5 text-cyan-300" />
                    <span>NANO {state.droneAegisShieldHp}</span>
                  </div>
                )}

                {state.droneOverclockTimer !== undefined && state.droneOverclockTimer > 0 && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-950/90 border border-amber-400 text-[7px] sm:text-[8px] font-orbitron text-amber-300 animate-bounce">
                    <Zap className="w-2.5 h-2.5 text-amber-300" />
                    <span>QUÁ TẢI +15%</span>
                  </div>
                )}

                {state.rts88ShieldHp !== undefined && state.rts88ShieldHp > 0 && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-yellow-950/90 border border-yellow-400 text-[7px] sm:text-[8px] font-orbitron text-yellow-300 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                    <Zap className="w-2.5 h-2.5 text-yellow-300" />
                    <span>KHIÊN SÉT {state.rts88ShieldHp}/300 (+80% ST)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top-Right: Score, Combo & Game Controls */}
          <div className="flex flex-col items-end gap-0.5 sm:gap-1 shrink-0 max-w-[48vw]">
            <div className="flex items-center gap-1 pointer-events-auto">
              {/* Mute button */}
              <button
                onClick={onToggleMute}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-900/85 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer touch-manipulation active:scale-95"
                aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                tabIndex={-1}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              {/* Pause button */}
              <button
                onClick={onPause}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-slate-900/85 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer touch-manipulation active:scale-95"
                aria-label="Tạm dừng game"
                tabIndex={-1}
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Score Readout */}
            <div className="text-right">
              <div className="text-[7px] sm:text-[9px] font-orbitron tracking-widest text-slate-400 uppercase">
                ĐIỂM SỐ
              </div>
              <div className="font-orbitron font-black text-sm sm:text-2xl text-white tracking-wider tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                {state.score.toLocaleString()}
              </div>
            </div>

            {/* Combo Multiplier Badge with Dynamic Pulse and Milestone Shake */}
            {state.combo > 1 && (
              <div
                key="combo-hud-badge"
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-lg border bg-gradient-to-r ${rank.bgGradient} ${rank.borderClass} backdrop-blur-md transition-all duration-200 transform max-w-full ${
                  milestoneActive
                    ? 'animate-combo-milestone-shake ring-1 ring-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.9)] brightness-125'
                    : comboPulsing
                    ? 'scale-105 ring-1 ring-white/70 shadow-[0_0_15px_rgba(255,255,255,0.8)] brightness-120'
                    : 'scale-100 shadow-md'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: milestoneActive ? '#fbbf24' : rank.color }}
                />
                <span
                  className="text-[8px] sm:text-[10px] font-orbitron font-black tabular-nums tracking-wide flex items-center gap-1"
                  style={{ color: rank.color }}
                >
                  <span>{state.combo} HITS</span>
                  <span
                    className={`inline-flex items-center px-1 py-0.2 rounded font-black ${
                      milestoneActive ? 'text-amber-300 bg-amber-950/80 border border-amber-400/80' : 'text-cyan-200 bg-black/40'
                    }`}
                  >
                    ({state.comboMultiplier}x)
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Mission Toast OR Centered Boss Health Bar */}
        {missionToast && (
          <div className="mx-auto my-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/90 to-rose-500/90 border border-amber-300 text-slate-950 font-orbitron font-bold text-[10px] sm:text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
            <span>{missionToast}</span>
          </div>
        )}

        {state.bossActive && (
          <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center animate-fadeIn select-none px-1">
            {/* Header: Hazard Tag, Boss Name & HP */}
            <div className="flex items-center justify-between w-full mb-0.5">
              <span className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black font-orbitron px-1.5 py-0.2 rounded bg-rose-950/90 border border-rose-500/70 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                BOSS · GĐ {state.bossPhase || 1}
                {state.bossIsEnraged && <span className="text-amber-300 ml-1 font-bold">🔥 CUỒNG BẠO</span>}
              </span>

              <div className="text-[9px] sm:text-[10px] font-orbitron font-bold text-rose-300 tabular-nums flex items-center gap-1">
                <span>{bossHpPct}%</span>
              </div>
            </div>

            {/* Boss Name */}
            <div className="w-full text-left text-[10px] sm:text-[11px] font-orbitron font-black text-rose-400 tracking-wider truncate mb-0.5">
              {state.bossName}
            </div>

            {/* Main Boss Health Bar with 25% Segment Markers */}
            <div className="w-full relative h-3.5 sm:h-4 bg-slate-950 border-2 border-rose-500/80 rounded overflow-hidden p-0.2 shadow-[0_0_14px_rgba(244,63,94,0.4)]">
              {/* Health Fill Bar */}
              <div
                className={`h-full rounded-xs transition-all duration-150 relative ${
                  state.bossIsEnraged
                    ? 'bg-gradient-to-r from-rose-600 via-amber-500 to-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.9)]'
                    : 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-400 shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                }`}
                style={{ width: `${bossHpPct}%` }}
              />

              {/* Segment Markers at every 25% (25%, 50%, 75%) for clear Boss Phase awareness */}
              <div className="absolute inset-0 pointer-events-none flex">
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] bg-slate-950/90 shadow-[0_0_4px_rgba(255,255,255,0.7)] z-10"
                  style={{ left: '25%' }}
                  title="Giai đoạn 4 / Cuồng bạo (25%)"
                >
                  <div className="w-full h-full bg-white/70" />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-slate-950/90 shadow-[0_0_6px_rgba(251,191,36,0.9)] z-10"
                  style={{ left: '50%' }}
                  title="Giai đoạn 3 (50%)"
                >
                  <div className="w-full h-full bg-amber-300/90" />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-[1.5px] bg-slate-950/90 shadow-[0_0_4px_rgba(255,255,255,0.7)] z-10"
                  style={{ left: '75%' }}
                  title="Giai đoạn 2 (75%)"
                >
                  <div className="w-full h-full bg-white/70" />
                </div>
              </div>

              {/* Subtle Quarter Tick Marks / Phase Dots */}
              <div className="absolute inset-0 pointer-events-none flex justify-between px-[12.5%] items-center z-20">
                <span className="text-[6.5px] font-orbitron font-black text-rose-200/50 drop-shadow select-none">IV</span>
                <span className="text-[6.5px] font-orbitron font-black text-amber-200/60 drop-shadow select-none">III</span>
                <span className="text-[6.5px] font-orbitron font-black text-purple-200/60 drop-shadow select-none">II</span>
                <span className="text-[6.5px] font-orbitron font-black text-cyan-200/60 drop-shadow select-none">I</span>
              </div>
            </div>

            {/* Boss Armor Bar (under health bar) */}
            {state.bossMaxArmor !== undefined && state.bossMaxArmor > 0 && (
              <div className="w-full mt-1 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-orbitron font-bold text-cyan-300">
                  <span className="flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-cyan-400" />
                    GIÁP TRÙM
                  </span>
                  <span className="tabular-nums">
                    {state.bossArmor || 0} / {state.bossMaxArmor}
                  </span>
                </div>
                <div className="w-full h-1.5 sm:h-2 bg-slate-950 border border-cyan-500/70 rounded overflow-hidden p-0.2 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  <div
                    className="h-full rounded-xs bg-gradient-to-r from-cyan-600 via-sky-400 to-cyan-300 transition-all duration-150"
                    style={{ width: `${Math.max(0, Math.min(100, Math.round(((state.bossArmor || 0) / state.bossMaxArmor) * 100)))}%` }}
                  />
                </div>
              </div>
            )}

            {/* Telegraphed Boss Skill Cast Progress */}
            {state.bossSkillProgress > 0 && (
              <div className="w-full mt-0.5 flex flex-col gap-0.5 bg-slate-950/90 px-1.5 py-0.5 rounded border border-slate-800">
                <div className="flex items-center justify-between text-[8px] font-orbitron font-bold">
                  <span className="flex items-center gap-1 text-amber-300 truncate max-w-[200px]">
                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                    [CHIÊU] {state.bossCurrentSkill || 'SẴN SÀNG'}
                  </span>
                  <span className="text-slate-400 tabular-nums">
                    {Math.round(state.bossSkillProgress * 100)}%
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-75"
                    style={{ width: `${Math.round(state.bossSkillProgress * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM REGION: Weapon Info on Left, Mobile Touch Gamepad Controls on Right */}
      <div className="flex items-end justify-between w-full gap-1.5 sm:gap-2 max-w-full">
        {/* Bottom-Left: Weapon Status & Special Weapon Duration */}
        <div className="flex flex-col gap-0.5 max-w-[120px] sm:max-w-xs shrink-0">
          {state.specialWeapon === 'laser' ? (
            <div className="flex flex-col gap-0.5 bg-rose-950/90 px-1.5 py-1 rounded-lg border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse">
              <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[9px] font-orbitron font-bold text-rose-300">
                <span className="flex items-center gap-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
                  <span className="truncate">LASER</span>
                </span>
                <span className="tabular-nums font-black text-white shrink-0">
                  {state.specialWeaponTimeRemaining.toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-rose-800">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-300 transition-all duration-75"
                  style={{
                    width: `${Math.min(100, (state.specialWeaponTimeRemaining / (state.specialWeaponMaxTime || 15)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : state.specialWeapon === 'lightning' ? (
            <div className="flex flex-col gap-0.5 bg-cyan-950/90 px-1.5 py-1 rounded-lg border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse">
              <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[9px] font-orbitron font-bold text-cyan-300">
                <span className="flex items-center gap-1 truncate">
                  <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-300 animate-bounce shrink-0" />
                  <span className="truncate">SẤM SÉT</span>
                </span>
                <span className="tabular-nums font-black text-white shrink-0">
                  {state.specialWeaponTimeRemaining.toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-cyan-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-300 transition-all duration-75"
                  style={{
                    width: `${Math.min(100, (state.specialWeaponTimeRemaining / (state.specialWeaponMaxTime || 15)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 bg-slate-950/85 px-1.5 py-1 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1 text-[7px] sm:text-[9px] font-orbitron font-bold text-cyan-400 uppercase">
                <Zap className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span>CẤP {state.weaponLevel}/5</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`w-2.5 sm:w-4 h-1 sm:h-1.5 rounded-xs border transition-all ${
                      lvl <= state.weaponLevel
                        ? 'bg-cyan-400 border-cyan-200'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                ))}
              </div>
              {state.dronesCount > 0 && (
                <div className="text-[7px] sm:text-[8px] font-orbitron text-sky-300">
                  +{state.dronesCount} DRONES
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom-Right: Tactical Mobile Gamepad Controls */}
        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto shrink-0">
          {/* Auto-Fire Toggle Button for Mobile Comfort */}
          {onToggleAutoFire && (
            <button
              onClick={onToggleAutoFire}
              type="button"
              className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg sm:rounded-xl border font-orbitron font-bold text-[8px] sm:text-[10px] tracking-wider transition-all cursor-pointer touch-manipulation active:scale-90 w-8 h-8 sm:w-11 sm:h-11 ${
                state.autoFire
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Chuyển chế độ Tự động bắn / Thủ công"
              aria-label={state.autoFire ? 'Tự động bắn đang bật' : 'Tự động bắn đang tắt'}
            >
              <Flame className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${state.autoFire ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-[7px] hidden sm:inline">{state.autoFire ? 'AUTO' : 'MANUAL'}</span>
            </button>
          )}

          {/* Fighter Skill Button [E] */}
          <button
            onClick={onTriggerSkill}
            disabled={!isSkillReady || state.skillActive}
            type="button"
            aria-label={`Kích hoạt Tuyệt kỹ ${state.skillName || 'Chiến cơ'}`}
            className={`relative overflow-hidden flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl border font-orbitron font-bold text-[9px] sm:text-xs tracking-wider transition-all cursor-pointer touch-manipulation min-h-[34px] sm:min-h-[44px] active:scale-90 ${
              state.skillActive
                ? 'bg-rose-500/30 border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse'
                : isSkillReady
                ? 'bg-cyan-500/25 hover:bg-cyan-500/35 border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.5)] animate-pulse'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            {/* Cooldown progress overlay */}
            {!isSkillReady && !state.skillActive && (
              <div
                className="absolute inset-0 bg-cyan-950/40 pointer-events-none"
                style={{ width: `${skillCdProgress}%` }}
              />
            )}

            <Sparkles
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                state.skillActive
                  ? 'text-rose-400 animate-spin'
                  : isSkillReady
                  ? 'text-cyan-300 animate-bounce'
                  : 'text-slate-500'
              }`}
            />

            <div className="text-left relative z-10">
              <div className="line-clamp-1 max-w-[55px] sm:max-w-[120px] text-[8px] sm:text-xs font-black">
                {state.skillName || 'KỸ NĂNG'}
              </div>
              <div className="text-[7px] sm:text-[9px] font-normal text-slate-400">
                {state.skillActive
                  ? `${state.skillActiveRemaining.toFixed(1)}s`
                  : isSkillReady
                  ? '[E] SẴN SÀNG'
                  : `${state.skillCooldownRemaining.toFixed(1)}s`}
              </div>
            </div>
          </button>

          {/* EMP Bomb Button [B] */}
          <button
            onClick={onTriggerBomb}
            disabled={state.bombs <= 0}
            type="button"
            aria-label={`Thả Bom EMP, còn ${state.bombs} quả`}
            className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl border font-orbitron font-bold text-[9px] sm:text-xs tracking-wider transition-all cursor-pointer touch-manipulation min-h-[34px] sm:min-h-[44px] active:scale-90 ${
              state.bombs > 0
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            <Bomb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse shrink-0" />
            <span>BOM ({state.bombs})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
