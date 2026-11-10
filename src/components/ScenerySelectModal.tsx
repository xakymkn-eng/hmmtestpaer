/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React,{ useState } from 'react';
import {
SceneryType,ALL_SCENERIES,
BLACK_HOLE_VARIANTS,
HANGAR_BAY_VARIANTS
} from '../game/lobbySettings';
import { X,Check,Compass } from 'lucide-react';
import { sound } from '../game/audio';

interface ScenerySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenery: SceneryType;
  onSelectScenery: (scenery: SceneryType) => void;
}

type SceneryFilter = 'ALL' | 'galaxy' | 'deep_space' | 'nebula' | 'aeon_bay' | 'black_hole';

export const ScenerySelectModal: React.FC<ScenerySelectModalProps> = ({
  isOpen,
  onClose,
  activeScenery,
  onSelectScenery,
}) => {
  const [filter, setFilter] = useState<SceneryFilter>('ALL');

  if (!isOpen) return null;

  const filteredSceneries = ALL_SCENERIES.filter((s) => {
    if (filter === 'ALL') return true;
    return s.category === filter;
  });

  const handleSelect = (sceneryId: SceneryType) => {
    sound.playClick();
    onSelectScenery(sceneryId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(6,182,212,0.4)] p-4 sm:p-6 text-white max-h-[92vh] flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-orbitron tracking-wider text-cyan-200 uppercase">
                PHONG CẢNH SẢNH CHỜ
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-rajdhani">
                Chọn phong cảnh vũ trụ yêu thích: Dải Ngân Hà, Tinh Vân, Vịnh Aeon & Hố Đen đa sắc màu
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Đóng bảng chọn phong cảnh"
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none shrink-0 text-[10px] sm:text-xs font-orbitron font-bold">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              filter === 'ALL'
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            TẤT CẢ ({ALL_SCENERIES.length})
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setFilter('galaxy');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              filter === 'galaxy'
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🌀 DẢI NGÂN HÀ
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setFilter('deep_space');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              filter === 'deep_space'
                ? 'bg-blue-500/30 border-blue-400 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🌌 VŨ TRỤ
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setFilter('nebula');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              filter === 'nebula'
                ? 'bg-pink-500/30 border-pink-400 text-pink-200 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ✨ SAO TINH VÂN
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setFilter('aeon_bay');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              filter === 'aeon_bay'
                ? 'bg-purple-500/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🛸 SƠ ĐỒ VỊNH MÁY ({HANGAR_BAY_VARIANTS.length} MÀU)
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setFilter('black_hole');
            }}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
              filter === 'black_hole'
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🕳️ HỐ ĐEN ({BLACK_HOLE_VARIANTS.length} MÀU)
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredSceneries.map((scenery) => {
            const isCurrent = activeScenery === scenery.id;

            return (
              <div
                key={scenery.id}
                onClick={() => handleSelect(scenery.id)}
                className={`group relative p-3 rounded-2xl border transition-all cursor-pointer active:scale-98 flex flex-col justify-between overflow-hidden ${
                  isCurrent
                    ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400'
                    : 'bg-slate-950/70 hover:bg-slate-900/80 border-slate-800 hover:border-slate-600'
                }`}
              >
                {/* Ambient Color Glow in Background */}
                <div
                  className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none"
                  style={{ backgroundColor: scenery.primaryColor }}
                />

                <div className="relative z-10 flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shadow-md shrink-0"
                    style={{
                      backgroundColor: `${scenery.primaryColor}22`,
                      borderColor: `${scenery.primaryColor}88`,
                    }}
                  >
                    {scenery.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-orbitron font-black text-xs sm:text-sm text-white">
                        {scenery.name}
                      </span>
                      <span
                        className="text-[8.5px] px-1.5 py-0.2 rounded font-orbitron font-bold"
                        style={{
                          backgroundColor: `${scenery.primaryColor}33`,
                          color: scenery.accentColor,
                          border: `1px solid ${scenery.primaryColor}55`,
                        }}
                      >
                        {scenery.categoryName}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-rajdhani leading-snug mt-1">
                      {scenery.description}
                    </p>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-[9px] text-slate-400 font-rajdhani">Quang phổ:</span>
                      {scenery.starColors.map((color, ci) => (
                        <span
                          key={ci}
                          className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Status / CTA */}
                <div className="relative z-10 mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  {isCurrent ? (
                    <div className="flex items-center gap-1 text-cyan-300 font-orbitron font-bold text-[10px]">
                      <Check className="w-3.5 h-3.5 stroke-[3] text-cyan-400" />
                      <span>ĐANG SỬ DỤNG</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 group-hover:text-cyan-300 font-orbitron text-[10px] transition-colors">
                      Nhấn để áp dụng ➔
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(scenery.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-orbitron font-black transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                        : 'bg-slate-800 hover:bg-cyan-500/30 text-slate-200 hover:text-cyan-200 border border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    {isCurrent ? 'KÍCH HOẠT' : 'CHỌN'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/30 pt-3 mt-3 flex items-center justify-between gap-2 shrink-0">
          <div className="text-[10px] sm:text-xs text-slate-400 font-rajdhani">
            Phong cảnh được lưu vĩnh viễn và tự động hiển thị mỗi khi vào sảnh.
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 font-orbitron font-black text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            HOÀN TẤT
          </button>
        </div>

      </div>
    </div>
  );
};
