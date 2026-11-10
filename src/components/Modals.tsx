/**
 * Status Modals for Sky Vanguard
 * Pause, Game Over, and Victory modals with tabular metrics and data-start CTAs.
 */

import React from 'react';
import { Play,RotateCcw,Home,Award,Skull,Crosshair,Sparkles,Globe2 } from 'lucide-react';
import { STARTING_GEMS } from '../game/rules';

interface PauseModalProps {
  score: number;
  wave: number;
  onResume: () => void;
  onRestart: () => void;
  onExitToTitle: () => void;
  onOpenUniverseSelect?: () => void;
  onOpenAdventureMap?: () => void;
  gameMode?: 'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard';
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  wave,
  onResume,
  onRestart,
  onExitToTitle,
  onOpenUniverseSelect,
  onOpenAdventureMap,
  gameMode = 'endless',
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-center flex flex-col items-center">
        <div className="text-xs font-orbitron tracking-widest text-cyan-400 uppercase mb-1">
          HỆ THỐNG ĐÃ ĐÓNG BĂNG
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-orbitron text-white tracking-wider mb-6">
          TẠM DỪNG NHIỆM VỤ
        </h2>

        {/* Current Run Metrics */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-orbitron text-slate-400 uppercase">ĐỢT HIỆN TẠI</div>
            <div className="text-xl font-orbitron font-bold text-amber-400 tabular-nums">
              WAVE {wave}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-orbitron text-slate-400 uppercase">ĐIỂM TẠM TÍNH</div>
            <div className="text-xl font-orbitron font-bold text-white tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-orbitron font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg cursor-pointer touch-manipulation active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            TIẾP TỤC CHIẾN ĐẤU
          </button>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-orbitron font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer touch-manipulation active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            CHƠI LẠI ĐỢT NÀY
          </button>
          {onOpenAdventureMap && (gameMode === 'adventure') && (
            <button
              onClick={onOpenAdventureMap}
              className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-orbitron font-bold text-xs text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.35)] transition-colors cursor-pointer touch-manipulation active:scale-95"
            >
              <span>🛸</span>
              BẢN ĐỒ 20 MÀN CHIẾN DỊCH HẠM ĐỘI
            </button>
          )}
          {onOpenUniverseSelect && (
            <button
              onClick={onOpenUniverseSelect}
              className="flex items-center justify-center gap-2 py-2 px-6 rounded-xl font-orbitron font-bold text-xs text-purple-200 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-colors cursor-pointer touch-manipulation active:scale-95"
            >
              <Globe2 className="w-3.5 h-3.5 text-purple-400" />
              CHỌN MAP (80 VŨ TRỤ)
            </button>
          )}
          <button
            onClick={onExitToTitle}
            className="flex items-center justify-center gap-2 py-2 px-6 rounded-xl font-orbitron text-xs text-slate-400 hover:text-white transition-colors cursor-pointer touch-manipulation active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            VỀ NHÀ CHỨA CHIẾN CƠ
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  highScore?: number;
  wave: number;
  enemiesKilled: number;
  playTime: number;
  isVictory?: boolean;
  earnedGems?: number;
  earnedGold?: number;
  remainingHp?: number;
  maxHp?: number;
  gameMode?: 'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard';
  revivesUsed?: number;
  playerName?: string;
  onOpenBossRushLeaderboard?: () => void;
  onRestart?: () => void;
  onRetry?: () => void;
  onExitToTitle: () => void;
  onOpenUniverseSelect?: () => void;
  onOpenAdventureMap?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore = 0,
  wave,
  enemiesKilled,
  playTime,
  isVictory = false,
  earnedGems = 0,
  earnedGold = 0,
  gameMode = 'endless',
  revivesUsed = 0,
  playerName = 'Chỉ Huy Tiên Phong',
  onOpenBossRushLeaderboard,
  onRestart,
  onRetry,
  onExitToTitle,
  onOpenUniverseSelect,
  onOpenAdventureMap,
}) => {
  const effectiveRestart = onRestart || onRetry || onExitToTitle;
  const isNewRecord = score >= highScore && score > 0;
  const isBossRush = gameMode === 'boss_rush';

  const mins = Math.floor((playTime || 0) / 60).toString().padStart(2, '0');
  const secs = ((playTime || 0) % 60).toString().padStart(2, '0');
  const timeFormatted = `${mins}:${secs}`;

  // Keyboard shortcut listener: R, Space, or Enter to restart immediately
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.code === 'KeyR' || e.code === 'Space' || e.code === 'Enter') {
        effectiveRestart();
      } else if (e.code === 'Escape') {
        onExitToTitle();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [effectiveRestart, onExitToTitle]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.3)] text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-400 mb-3">
          <Skull className="w-6 h-6" />
        </div>

        <div className="text-xs font-orbitron tracking-widest text-rose-400 uppercase mb-1">
          {isVictory ? 'CHIẾN THẮNG HUYỀN THOẠI' : 'TỔN THẤT TOÀN DIỆN'}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-orbitron text-white tracking-wider mb-1">
          {isVictory ? 'NHIỆM VỤ HOÀN THÀNH' : 'CHIẾN CƠ BỊ HẠ'}
        </h2>
        <div className="text-xs font-orbitron font-bold text-cyan-300 mb-1">
          Chỉ Huy: <span className="text-white">{playerName}</span>
        </div>
        <p className="text-xs font-rajdhani text-slate-400 mb-4">
          Chiến dịch tạm dừng. Dữ liệu chuyến bay đã được mã hóa lưu trữ an toàn.
        </p>

        {/* Campaign Reward Banner */}
        {(earnedGems > 0 || earnedGold > 0) && (
          <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/60 text-amber-300 text-xs sm:text-sm font-orbitron font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>CHIẾN LỢI PHẨM:</span>
            {earnedGold > 0 && (
              <span className="text-yellow-300 font-black text-sm">+{earnedGold.toLocaleString()} 🪙</span>
            )}
            {earnedGems > 0 && (
              <span className="text-white font-black text-sm">+{earnedGems.toLocaleString()} 💎</span>
            )}
          </div>
        )}

        {isNewRecord && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-orbitron font-bold mb-4 animate-bounce">
            <Award className="w-4 h-4 text-amber-400" />
            KỶ LỤC ĐIỂM SỐ MỚI ĐƯỢC THIẾT LẬP!
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-left">
            <div className="text-[10px] font-orbitron text-slate-400">ĐIỂM CUỐI CÙNG</div>
            <div className="text-2xl font-orbitron font-black text-cyan-400 tabular-nums">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-left">
            <div className="text-[10px] font-orbitron text-slate-400">KỶ LỤC CAO NHẤT</div>
            <div className="text-2xl font-orbitron font-black text-amber-400 tabular-nums">
              {highScore.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-left">
            <div className="text-[10px] font-orbitron text-slate-400">
              {isBossRush ? 'TRÙM ĐÃ HẠ GỤC' : 'ĐỢT VƯỢT QUA'}
            </div>
            <div className="text-lg font-orbitron font-bold text-white tabular-nums">
              {isBossRush ? `${enemiesKilled} / 20 BOSS` : `WAVE ${wave}`}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-left">
            <div className="text-[10px] font-orbitron text-slate-400">
              {isBossRush ? 'SỐ LẦN HỒI SINH' : 'MỤC TIÊU TIÊU DIỆT'}
            </div>
            <div className={`text-lg font-orbitron font-bold tabular-nums flex items-center gap-1 ${
              isBossRush ? (revivesUsed === 0 ? 'text-emerald-400' : 'text-amber-400') : 'text-white'
            }`}>
              {isBossRush ? (
                <span>{revivesUsed === 0 ? '0 (BẤT TỬ)' : `${revivesUsed} LẦN`}</span>
              ) : (
                <>
                  <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                  {enemiesKilled}
                </>
              )}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-left col-span-2 flex items-center justify-between">
            <div className="text-[10px] font-orbitron text-slate-400">
              {isBossRush ? 'THỜI GIAN HẠ GỤC TRÙM' : 'THỜI GIAN CHIẾN ĐẤU'}
            </div>
            <div className="text-base font-orbitron font-bold text-cyan-300 tabular-nums">
              ⏱ {timeFormatted}
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            data-start="true"
            onClick={effectiveRestart}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-orbitron font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all touch-manipulation active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 fill-current" />
            TÁI XUẤT KÍCH
          </button>
          {onOpenBossRushLeaderboard && (
            <button
              onClick={onOpenBossRushLeaderboard}
              className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-orbitron font-bold text-xs text-white bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:from-amber-500 hover:to-rose-500 border border-amber-400/70 shadow-[0_0_18px_rgba(245,158,11,0.4)] transition-all touch-manipulation active:scale-95 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-200" />
              🏆 BẢNG XẾP HẠNG ĐẠI CHIẾN BOSS
            </button>
          )}
          {onOpenAdventureMap && (
            <button
              onClick={onOpenAdventureMap}
              className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-orbitron font-bold text-xs text-amber-300 bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 border border-amber-400/70 shadow-[0_0_18px_rgba(245,158,11,0.4)] transition-all touch-manipulation active:scale-95 cursor-pointer"
            >
              <span>🛸</span>
              BẢN ĐỒ 20 MÀN CHIẾN DỊCH HẠM ĐỘI
            </button>
          )}
          {onOpenUniverseSelect && (
            <button
              onClick={onOpenUniverseSelect}
              className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-orbitron font-bold text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/60 shadow-[0_0_18px_rgba(168,85,247,0.4)] transition-all touch-manipulation active:scale-95 cursor-pointer"
            >
              <Globe2 className="w-4 h-4 text-purple-200" />
              CHỌN MAP CHIẾN DỊCH (80 VŨ TRỤ + HỐ ĐEN)
            </button>
          )}
          <button
            onClick={onExitToTitle}
            className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-orbitron font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors touch-manipulation active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            ĐỔI CHIẾN CƠ / VỀ NHÀ CHỨA
          </button>
        </div>
      </div>
    </div>
  );
};

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.3)] text-center flex flex-col items-center animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 mb-3">
          <RotateCcw className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-[11px] font-orbitron tracking-widest text-rose-400 uppercase font-bold">
          XÁC NHẬN ĐẶT LẠI TIẾN TRÌNH
        </div>
        <h3 className="text-xl font-orbitron font-black text-white mt-1 mb-2">
          RESET TOÀN BỘ TIẾN TRÌNH?
        </h3>
        <p className="text-xs font-rajdhani text-slate-300 mb-6 leading-relaxed">
          Thao tác này sẽ xóa toàn bộ chiến cơ đã mở, phi công, phụ kiện đã mua, điểm kỷ lục và khôi phục số Ngọc khởi đầu <strong className="text-amber-300 font-orbitron">{STARTING_GEMS.toLocaleString()} 💎</strong>.
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={onCancel}
            className="py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            HỦY BỎ
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
          >
            XÁC NHẬN RESET
          </button>
        </div>
      </div>
    </div>
  );
};

