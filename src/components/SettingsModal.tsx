/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
GraphicsQuality,
FpsTarget,
GameSettings,SCENERY_CONFIGS
} from '../game/lobbySettings';
import {
X,
Sliders,
Monitor,
Zap,
Volume2,
VolumeX,
Sparkles,Shield,
Gauge,
Flame
} from 'lucide-react';
import { sound } from '../game/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onOpenSceneryModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenSceneryModal,
}) => {
  if (!isOpen) return null;

  const currentScenery = SCENERY_CONFIGS[settings.activeScenery] || SCENERY_CONFIGS.galaxy;

  const handleQualityChange = (quality: GraphicsQuality) => {
    sound.playClick();
    onUpdateSettings({ graphicsQuality: quality });
  };

  const handleFpsChange = (fps: FpsTarget) => {
    sound.playClick();
    onUpdateSettings({ fpsTarget: fps });
  };

  const handleToggleMute = () => {
    sound.playClick();
    const nextMute = !settings.isMuted;
    sound.toggleMute();
    onUpdateSettings({ isMuted: nextMute });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.4)] p-4 sm:p-6 text-white max-h-[92vh] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-orbitron tracking-wider text-cyan-200 uppercase">
                CÀI ĐẶT HỆ THỐNG
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-rajdhani">
                Tùy chỉnh chất lượng đồ họa, tốc độ khung hình & âm thanh
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Đóng Cài Đặt"
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm font-rajdhani">
          
          {/* 1. ĐỒ HỌA (Thấp / Trung Bình / Cao / Cực Cao) */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs sm:text-sm text-cyan-300">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>CHẤT LƯỢNG ĐỒ HỌA</span>
              </div>
              <span className="text-[10px] font-orbitron font-semibold text-cyan-300 uppercase">
                {settings.graphicsQuality === 'ultra'
                  ? 'Cực Cao (Siêu Đẹp)'
                  : settings.graphicsQuality === 'high'
                  ? 'Cao Cấp (Bloom & Chiếu Sáng)'
                  : settings.graphicsQuality === 'medium'
                  ? 'Cân Bằng'
                  : 'Tiết Kiệm (Tắt Hiệu Ứng)'}
              </span>
            </div>

            <p className="text-[10.5px] text-slate-400 leading-snug">
              Tùy chỉnh mức độ chi tiết không gian, hiệu ứng lấp lánh, bloom hào quang, gió vũ trụ và ánh sáng chiếu từ phong cảnh.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Thấp */}
              <button
                type="button"
                onClick={() => handleQualityChange('low')}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                  settings.graphicsQuality === 'low'
                    ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Shield className="w-4 h-4 mb-1 text-emerald-400" />
                <span className="font-orbitron font-bold text-xs">THẤP</span>
                <span className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">
                  Tắt lấp lánh & art li tâm
                </span>
              </button>

              {/* Trung Bình */}
              <button
                type="button"
                onClick={() => handleQualityChange('medium')}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                  settings.graphicsQuality === 'medium'
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Gauge className="w-4 h-4 mb-1 text-cyan-400" />
                <span className="font-orbitron font-bold text-xs">TRUNG BÌNH</span>
                <span className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">
                  Đổ bóng nhẹ & art li tâm
                </span>
              </button>

              {/* Cao */}
              <button
                type="button"
                onClick={() => handleQualityChange('high')}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                  settings.graphicsQuality === 'high'
                    ? 'bg-amber-950/70 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.35)] ring-1 ring-amber-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <Flame className="w-4 h-4 mb-1 text-amber-400" />
                <span className="font-orbitron font-bold text-xs">CAO</span>
                <span className="text-[8.5px] text-slate-400 mt-0.5 leading-tight">
                  Bloom mờ ảo & tia sáng
                </span>
              </button>

              {/* Cực Cao */}
              <button
                type="button"
                onClick={() => handleQualityChange('ultra')}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                  settings.graphicsQuality === 'ultra'
                    ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-[0_0_16px_rgba(168,85,247,0.45)] ring-1 ring-purple-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-purple-500'
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1 text-purple-400 animate-pulse" />
                <span className="font-orbitron font-bold text-xs text-purple-300">CỰC CAO ★</span>
                <span className="text-[8.5px] text-purple-300/80 mt-0.5 leading-tight">
                  Bloom mạnh, gió & bụi sao
                </span>
              </button>
            </div>
          </div>

          {/* 2. CHỈNH FPS (30 FPS / 60 FPS / 120 FPS) */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs sm:text-sm text-yellow-300">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>GIỚI HẠN TỐC ĐỘ KHUNG HÌNH (FPS)</span>
              </div>
              <span className="text-[10px] font-orbitron font-black text-amber-400">
                {settings.fpsTarget} FPS
              </span>
            </div>

            <p className="text-[10.5px] text-slate-400 leading-snug">
              Tùy chỉnh tần số quét khung hình hiển thị cho sảnh chờ và trận chiến không gian.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* 30 FPS */}
              <button
                type="button"
                onClick={() => handleFpsChange(30)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                  settings.fpsTarget === 30
                    ? 'bg-yellow-950/70 border-yellow-400 text-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.3)] ring-1 ring-yellow-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="font-orbitron font-black text-sm">30 FPS</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Máy mát mẻ</span>
              </button>

              {/* 60 FPS */}
              <button
                type="button"
                onClick={() => handleFpsChange(60)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                  settings.fpsTarget === 60
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="font-orbitron font-black text-sm text-cyan-300">60 FPS</span>
                <span className="text-[9px] text-cyan-400/80 mt-0.5">Chuẩn Arcade ★</span>
              </button>

              {/* 120 FPS */}
              <button
                type="button"
                onClick={() => handleFpsChange(120)}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                  settings.fpsTarget === 120
                    ? 'bg-purple-950/70 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)] ring-1 ring-purple-400'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="font-orbitron font-black text-sm text-purple-300">120 FPS</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Siêu mượt 120Hz</span>
              </button>
            </div>
          </div>

          {/* 3. PHONG CẢNH SẢNH CHỜ */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs sm:text-sm text-sky-300">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>PHONG CẢNH SẢNH HIỆN TẠI</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenSceneryModal();
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/70 text-cyan-300 text-[10px] font-orbitron font-bold transition-all active:scale-95 cursor-pointer"
              >
                ĐỔI PHONG CẢNH ➔
              </button>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border shrink-0"
                style={{
                  backgroundColor: `${currentScenery.primaryColor}22`,
                  borderColor: currentScenery.primaryColor,
                }}
              >
                {currentScenery.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-orbitron font-bold text-xs text-white flex items-center gap-1.5">
                  <span>{currentScenery.name}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.2 rounded font-orbitron"
                    style={{
                      backgroundColor: `${currentScenery.primaryColor}33`,
                      color: currentScenery.accentColor,
                    }}
                  >
                    {currentScenery.categoryName}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentScenery.description}
                </div>
              </div>
            </div>
          </div>

          {/* 4. ÂM THANH */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                {settings.isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div>
                <div className="font-orbitron font-bold text-xs text-white">ÂM THANH TRÒ CHƠI</div>
                <div className="text-[10px] text-slate-400">Hiệu ứng pháo phản lực, động cơ & nhạc nền</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className={`px-3 py-1.5 rounded-xl font-orbitron font-bold text-xs border transition-all cursor-pointer active:scale-95 ${
                settings.isMuted
                  ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                  : 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
              }`}
            >
              {settings.isMuted ? 'ĐANG TẮT' : 'ĐANG BẬT'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/30 pt-3 mt-3 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 font-orbitron font-black text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            ĐÓNG & LƯU CÀI ĐẶT
          </button>
        </div>

      </div>
    </div>
  );
};
