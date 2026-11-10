/**
 * Mode Selection Modal:
 * Appears when clicking 'XUẤT CHIẾN' from the title screen or header mode buttons.
 * Allows choosing between 3 distinct gameplay forms:
 * 1. 'CHỌN VŨ TRỤ' (Cosmic Campaign: Conquer 20 scattered universes to 100%)
 * 2. 'ĐẠI CHIẾN BOSS' (Boss Rush: Consecutively fight 20 super powerful cosmic-tier bosses)
 * 3. 'ĐẤU VÔ HẠN' (Endless Survival: Wave-based infinite survival mode)
 */

import React from 'react';
import { X,Globe2,Flame,Trophy,Swords,Sparkles,ChevronRight,ShieldCheck,Compass,Crown,Skull,Star } from 'lucide-react';
import { getConquestSummary } from '../game/universe';
import { sound } from '../game/audio';
import { DifficultyLevel } from '../game/rules';

interface ModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSuperHardMode?: () => void;
  onSelectAdventureMode?: () => void;
  onSelectUniverseMode: () => void;
  onSelectEndlessMode: () => void;
  onSelectBossRushMode: () => void;
  onSelectFreeFlightMode?: () => void;
  onOpenBossRushLeaderboard?: () => void;
  universeProgress: Record<number, number>;
  difficulty?: DifficultyLevel;
  highScore: number;
  adventureStars?: number;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectSuperHardMode,
  onSelectAdventureMode,
  onSelectUniverseMode,
  onSelectEndlessMode,
  onSelectBossRushMode,
  onSelectFreeFlightMode,
  onOpenBossRushLeaderboard,
  universeProgress,
  highScore,
  adventureStars = 0,
}) => {
  if (!isOpen) return null;

  const conquestSummary = getConquestSummary(universeProgress);

  const handleChooseSuperHard = () => {
    sound.playClick();
    if (onSelectSuperHardMode) {
      onSelectSuperHardMode();
    }
  };

  const handleChooseAdventure = () => {
    sound.playClick();
    if (onSelectAdventureMode) {
      onSelectAdventureMode();
    }
  };

  const handleChooseUniverse = () => {
    sound.playClick();
    onSelectUniverseMode();
  };

  const handleChooseFreeFlight = () => {
    sound.playClick();
    if (onSelectFreeFlightMode) {
      onSelectFreeFlightMode();
    }
  };

  const handleChooseBossRush = () => {
    sound.playClick();
    onSelectBossRushMode();
  };

  const handleChooseEndless = () => {
    sound.playClick();
    onSelectEndlessMode();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#0b172a] via-[#050b14] to-[#03070f] border border-cyan-400/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col p-4 sm:p-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Compass className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-300 to-cyan-400">
                CHỌN HÌNH THỨC XUẤT CHIẾN
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Lựa chọn phương thức triển khai phi đội: Chinh phạt 20 vũ trụ, Đại chiến Boss hoặc Sinh tồn vô hạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng lựa chọn xuất chiến"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Conquest Status Ribbon */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-orbitron">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold">TIẾN ĐỘ CHINH PHỤC THIÊN HÀ:</span>
            <span className="text-cyan-300 font-black tabular-nums">
              {conquestSummary.conqueredCount} / {conquestSummary.totalUniverses} VŨ TRỤ
            </span>
            <span className="text-amber-400 font-bold">({conquestSummary.averagePercent}% TỔNG THỂ)</span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xs min-w-[140px]">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-purple-500 via-cyan-400 to-yellow-300 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ width: `${conquestSummary.averagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 6 Game Modes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5 mt-3 sm:mt-4">
          {/* Card: CHẾ ĐỘ SIÊU KHÓ (Super Hard Mode) */}
          <div
            onClick={handleChooseSuperHard}
            className="group relative p-4 rounded-2xl bg-gradient-to-b from-red-950/70 via-slate-900/95 to-amber-950/60 border-2 border-red-500 hover:border-red-400 shadow-[0_0_35px_rgba(239,68,68,0.45)] hover:shadow-[0_0_50px_rgba(239,68,68,0.7)] transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer ring-1 ring-red-400/60"
          >
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-orbitron font-black text-[9px] tracking-wider shadow animate-pulse flex items-center gap-1">
              <span>🔥</span>
              <span>10 ĐỢT 10 BOSS</span>
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 border border-red-400 flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(239,68,68,0.8)] text-2xl">
                💀
              </div>

              <div className="text-[10px] font-orbitron text-red-400 tracking-wider uppercase font-bold mb-0.5">
                THỬ THÁCH ĐỘT PHÁ
              </div>
              <h3 className="text-base sm:text-lg font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-rose-200 to-amber-300 tracking-wide mb-1.5">
                CHẾ ĐỘ SIÊU KHÓ
              </h3>

              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mb-3">
                <strong>10 đợt - 10 Boss dị biệt</strong> sở hữu chiêu thức mới: <em>Laser quét, tên lửa rượt đuổi, gè đại pháo</em>! Quái tầm trung có <strong>Thanh Giáp</strong>, máu +80%, sát thương +50%, thủ +60%.
              </p>

              {/* Stats pill */}
              <div className="p-2 rounded-xl bg-slate-950/90 border border-red-500/50 flex flex-col gap-1 text-[11px] font-orbitron mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <span>🛡️</span> Giáp quái:
                  </span>
                  <span className="text-cyan-300 font-black">DƯỚI MÁU</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Chỉ số:</span>
                  <span className="text-amber-300 font-bold">+80% HP · +50% ST</span>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChooseSuperHard();
              }}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 text-white font-orbitron font-black text-xs tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
            >
              <span>🔥 CHIẾN SIÊU KHÓ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 0: CHẾ ĐỘ PHIÊU LƯU: HẠM ĐỘI MA QUÁI & TRÙM KINH DỊ CI4 */}
          <div
            onClick={handleChooseAdventure}
            className="group relative p-4 rounded-2xl bg-gradient-to-b from-rose-950/50 via-slate-900/90 to-purple-950/40 border-2 border-rose-500/90 hover:border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.35)] hover:shadow-[0_0_40px_rgba(244,63,94,0.6)] transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer ring-1 ring-rose-400/50"
          >
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 text-slate-950 font-orbitron font-black text-[9px] tracking-wider shadow animate-pulse">
              🛸 CHIẾN DỊCH HẠM ĐỘI
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 via-purple-700 to-slate-900 border border-rose-500/40 flex items-center justify-center text-slate-950 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.7)] text-2xl">
                👹
              </div>

              <div className="text-[10px] font-orbitron text-rose-400 tracking-wider uppercase font-bold mb-0.5">
                CHIẾN HẠM MA QUÁI & TRÙM KINH DỊ
              </div>
              <h3 className="text-base sm:text-lg font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-purple-200 to-amber-300 tracking-wide mb-1.5">
                HẠM ĐỘI MA QUÁI
              </h3>

              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mb-3">
                Bản đồ <strong>20 dải ngân hà từ dưới lên trên</strong>! Bầy chiến tàu quái vật ma quái kinh dị, <strong>20 Boss quái vật siêu kinh dị</strong>, cầu plasma nguyền rủa và cổ vật linh hồn.
              </p>

              {/* Adventure progress pill */}
              <div className="p-2 rounded-xl bg-slate-950/80 border border-rose-500/40 flex items-center justify-between text-xs font-orbitron mb-3">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Sao tích lũy:</span>
                </div>
                <span className="text-yellow-300 font-black">
                  {adventureStars} / 60 ⭐
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChooseAdventure();
              }}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 hover:from-rose-500 text-white font-orbitron font-black text-xs tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.5)] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
            >
              <span>🗺️ MỞ BẢN ĐỒ 20 MÀN</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 1: CHỌN VŨ TRỤ (Cosmic Campaign) */}
          <div
            onClick={handleChooseUniverse}
            className="group relative p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 via-slate-900/90 to-indigo-950/40 border-2 border-purple-500/60 hover:border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer"
          >
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-orbitron font-black text-[9px] tracking-wider shadow">
              80 MAP + HỐ ĐEN
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                <Globe2 className="w-7 h-7" />
              </div>

              <div className="text-[10px] font-orbitron text-purple-400 tracking-wider uppercase font-bold mb-0.5">
                CHIẾN DỊCH CHINH PHẠT
              </div>
              <h3 className="text-base sm:text-lg font-black font-orbitron text-white tracking-wide group-hover:text-purple-300 transition-colors mb-1.5">
                CHỌN MAP VŨ TRỤ
              </h3>

              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mb-3">
                Bản đồ đại thiên hà với <strong>80 vũ trụ rải rác</strong> và <strong>Map Hố Đen Siêu To</strong> ngay trung tâm. Mỗi vũ trụ có quái, bối cảnh và cơ chế độc nhất.
              </p>

              {/* Conquest progress pill */}
              <div className="p-2 rounded-xl bg-slate-950/80 border border-purple-500/30 flex items-center justify-between text-xs font-orbitron mb-3">
                <div className="flex items-center gap-1.5 text-purple-300">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Đã chiếm:</span>
                </div>
                <span className="text-amber-300 font-black">
                  {conquestSummary.conqueredCount} / {conquestSummary.totalUniverses} ({conquestSummary.averagePercent}%)
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChooseUniverse();
              }}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 hover:from-purple-500 text-white font-orbitron font-black text-xs tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
            >
              <span>🗺️ MỞ BẢN ĐỒ 80 VŨ TRỤ</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: DU NGOẠN THIÊN HÀ (Free Flight Sightseeing) - MỚI! */}
          <div
            onClick={handleChooseFreeFlight}
            className="group relative p-4 rounded-2xl bg-gradient-to-b from-teal-950/50 via-slate-900/90 to-cyan-950/40 border-2 border-emerald-400/80 hover:border-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer ring-1 ring-emerald-400/50"
          >
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-orbitron font-black text-[9px] tracking-wider shadow animate-pulse">
              ✨ MAP SIÊU RỘNG MỚI
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.7)]">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="text-[10px] font-orbitron text-emerald-400 tracking-wider uppercase font-bold mb-0.5">
                KHU VỰC THĂM QUAN · THƯ GIÃN
              </div>
              <h3 className="text-base sm:text-lg font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-300 tracking-wide mb-1.5">
                KHU VỰC THĂM QUAN
              </h3>

              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mb-3">
                Map siêu rộng 6000x6000px với <strong>dải ngân hà xoắn ốc tuyệt mỹ</strong>, các kỳ quan tinh vân lung linh. Tự do lượn ngắm cảnh, chụp ảnh, có nút thoát về sảnh bất cứ lúc nào!
              </p>

              {/* Galaxy Features */}
              <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center justify-between text-xs font-orbitron mb-3">
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Quy mô:</span>
                </div>
                <span className="text-cyan-300 font-black">
                  VÔ HẠN 360° · NGẮM CẢNH
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChooseFreeFlight();
              }}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 text-slate-950 font-orbitron font-black text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>🌌 VÀO KHU VỰC THĂM QUAN</span>
            </button>
          </div>

          {/* Card 3: ĐẠI CHIẾN BOSS (Boss Rush Mode) */}
          <div
            onClick={handleChooseBossRush}
            className="group relative p-4 rounded-2xl bg-gradient-to-b from-rose-950/50 via-slate-900/90 to-amber-950/40 border-2 border-rose-500/70 hover:border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.35)] hover:shadow-[0_0_40px_rgba(244,63,94,0.6)] transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer"
          >
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white font-orbitron font-black text-[9px] tracking-wider shadow">
              👑 ĐẠI CHIẾN 20 TRÙM
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-red-600 to-amber-500 flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(244,63,94,0.7)]">
                <Crown className="w-7 h-7" />
              </div>

              <div className="text-[10px] font-orbitron text-rose-400 tracking-wider uppercase font-bold mb-0.5">
                THÁCH THỨC VŨ TRỤ
              </div>
              <h3 className="text-base sm:text-lg font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-300 tracking-wide mb-1.5">
                ĐẠI CHIẾN BOSS
              </h3>

              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mb-3">
                Lần lượt xuất hiện <strong>những con Boss cấp độ vũ trụ siêu mạnh</strong> liên tiếp! Đua thời gian hạ gục và số lần hồi sinh ít nhất.
              </p>

              {/* Boss Rush encounter info */}
              <div className="p-2 rounded-xl bg-slate-950/80 border border-rose-500/40 flex items-center justify-between text-xs font-orbitron mb-3">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <Swords className="w-4 h-4 text-rose-400" />
                  <span>Quy mô:</span>
                </div>
                <span className="text-amber-300 font-black">
                  20 BOSS VŨ TRỤ
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {onOpenBossRushLeaderboard && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onOpenBossRushLeaderboard();
                  }}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-500 border border-amber-400/80 text-white font-orbitron font-bold text-[11px] tracking-wider shadow flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-yellow-200" />
                  <span>BXH BOSS RUSH</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChooseBossRush();
                }}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-400 text-white font-orbitron font-black text-xs tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
              >
                <Skull className="w-4 h-4" />
                <span>⚔️ CHIẾN BOSS</span>
              </button>
            </div>
          </div>

          {/* Card 4: ĐẤU VÔ HẠN (Endless Survival) */}
          <div
            onClick={handleChooseEndless}
            className="group relative p-4 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-slate-900/90 to-sky-950/40 border-2 border-cyan-500/60 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer"
          >
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-orbitron font-black text-[9px] tracking-wider shadow">
              SINH TỒN VÔ TẬN
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-slate-950 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                <Flame className="w-7 h-7 fill-current" />
              </div>

              <div className="text-[10px] font-orbitron text-cyan-400 tracking-wider uppercase font-bold mb-0.5">
                CHẾ ĐỘ KINH ĐIỂN
              </div>
              <h3 className="text-base sm:text-lg font-black font-orbitron text-white tracking-wide group-hover:text-cyan-300 transition-colors mb-1.5">
                ĐẤU VÔ HẠN
              </h3>

              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mb-3">
                Thách thức giới hạn phản xạ! Sóng quái vô tận dồn dập với <strong>cộng dồn sức mạnh mỗi wave</strong>. Lập kỷ lục điểm số!
              </p>

              {/* Highscore & Difficulty pill */}
              <div className="p-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between text-xs font-orbitron mb-3">
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Kỷ lục:</span>
                </div>
                <span className="text-amber-300 font-black tabular-nums">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChooseEndless();
              }}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400 hover:from-cyan-300 text-slate-950 font-orbitron font-black text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>XUẤT CHIẾN VÔ HẠN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
