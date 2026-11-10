/**
 * Pilot Detail Modal (Bảng Thông Tin Chi Tiết Tay Lái / Phi Công)
 * Comprehensive tactical dossier, combat backstory, voice quote,
 * signature aircraft synergy (Trấn Phái RTS-88), and complete 12-stat matrix.
 */

import React,{ useEffect } from 'react';
import {
X,Shield,
Zap,
Sparkles,
Heart,
Crosshair,
Gauge,
Flame,
Award,
Check,
Compass,Info,
Clock,
Bomb
} from 'lucide-react';
import { Pilot } from '../game/rules';
import { getPilotDossier } from '../game/pilotDetails';
import { sound } from '../game/audio';

interface PilotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pilot: Pilot | null;
  isOwned: boolean;
  isEquipped: boolean;
  onEquipPilot: (pilotId: string) => void;
  onOpenPilotGacha?: () => void;
}

export const PilotDetailModal: React.FC<PilotDetailModalProps> = ({
  isOpen,
  onClose,
  pilot,
  isOwned,
  isEquipped,
  onEquipPilot,
  onOpenPilotGacha,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pilot) return null;

  const dossier = getPilotDossier(pilot.id);
  const b = pilot.bonus;

  const handleEquip = () => {
    sound.playPowerup();
    onEquipPilot(pilot.id);
  };

  const statItems = [
    { label: 'Sát Thương', value: `+${b.damagePercent || 0}%`, icon: Flame, color: 'text-rose-400', active: (b.damagePercent || 0) > 0 },
    { label: 'Máu Tối Đa', value: `+${b.hpBonus || 0} HP`, icon: Heart, color: 'text-emerald-400', active: (b.hpBonus || 0) > 0 },
    { label: 'Giáp Trụ', value: `+${b.armorBonus || 0} Giáp`, icon: Shield, color: 'text-cyan-400', active: (b.armorBonus || 0) > 0 },
    { label: 'Phòng Thủ', value: `+${b.defenseBonus || 0}`, icon: Shield, color: 'text-blue-400', active: (b.defenseBonus || 0) > 0 },
    { label: 'Xuyên Giáp', value: `+${b.armorPenPercent || 0}%`, icon: Crosshair, color: 'text-amber-400', active: (b.armorPenPercent || 0) > 0 },
    { label: 'ST Chuẩn', value: `+${b.trueDamageBonus || 0}`, icon: Zap, color: 'text-purple-400', active: (b.trueDamageBonus || 0) > 0 },
    { label: 'Tỉ Lệ Bạo', value: `+${b.critRatePercent || 0}%`, icon: Sparkles, color: 'text-yellow-400', active: (b.critRatePercent || 0) > 0 },
    { label: 'ST Bạo Kích', value: `+${b.critDamagePercent || 0}%`, icon: Flame, color: 'text-orange-400', active: (b.critDamagePercent || 0) > 0 },
    { label: 'Tốc Độ Bay', value: `+${b.speedPercent || 0}%`, icon: Gauge, color: 'text-sky-400', active: (b.speedPercent || 0) > 0 },
    { label: 'Tốc Độ Bắn', value: `+${b.fireRatePercent || 0}%`, icon: Crosshair, color: 'text-teal-400', active: (b.fireRatePercent || 0) > 0 },
    { label: 'Né Tránh', value: `+${b.dodgePercent || 0}%`, icon: Compass, color: 'text-indigo-400', active: (b.dodgePercent || 0) > 0 },
    { label: 'Hồi Chiêu', value: `-${b.cooldownReductionPercent || 0}%`, icon: Clock, color: 'text-pink-400', active: (b.cooldownReductionPercent || 0) > 0 },
    { label: 'Nổ Bom EMP', value: `+${b.bombRadiusPercent || 0}%`, icon: Bomb, color: 'text-red-400', active: (b.bombRadiusPercent || 0) > 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#0a1220] via-[#050b14] to-[#040810] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border shadow-lg bg-gradient-to-br ${pilot.avatarBg}`}
            >
              {pilot.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-white">
                  {pilot.callsign}
                </h2>
                <span
                  className={`text-[9px] font-orbitron font-black px-2 py-0.5 rounded uppercase ${
                    pilot.tier === 'S'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-400'
                      : pilot.tier === 'A'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-400'
                      : 'bg-cyan-500/25 text-cyan-300 border border-cyan-400'
                  }`}
                >
                  BẬC {pilot.tier}
                </span>

                {isEquipped && (
                  <span className="text-[9px] font-orbitron font-black px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-400 flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" />
                    ĐANG LÁI
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">
                {pilot.name} · {pilot.vietnameseTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng thông tin tay lái"
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Quote Banner */}
        {pilot.quote && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-cyan-950/40 border border-purple-500/30 flex items-start gap-2.5">
            <span className="text-2xl leading-none text-purple-400 select-none">“</span>
            <p className="text-xs sm:text-sm text-purple-200 font-rajdhani italic font-medium leading-relaxed">
              {pilot.quote}
            </p>
            <span className="text-2xl leading-none text-purple-400 select-none self-end">”</span>
          </div>
        )}

        {/* Trấn Phái (Signature Aircraft Synergy Highlight) */}
        {(pilot.signatureFighterId || dossier.signatureFighterSynergy) && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/50 via-yellow-950/30 to-slate-950/80 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <div className="flex items-center gap-2 text-amber-300 font-orbitron font-black text-xs uppercase mb-1">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>TRẤN PHÁI CHIẾN CƠ ĐỒNG BỘ: {dossier.signatureFighterName || 'RTS-88 Tia Chớp'}</span>
            </div>
            <p className="text-xs text-amber-100/90 font-rajdhani leading-relaxed">
              {dossier.signatureFighterSynergy || pilot.bonusText}
            </p>
          </div>
        )}

        {/* Tactical Dossier (Backstory & Combat Role) */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-cyan-300 uppercase">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>HỒ SƠ TÁC CHIẾN & TIỂU SỬ CHIẾN BINH</span>
          </div>
          <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
            {dossier.biography}
          </p>

          <div className="mt-1 pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 font-orbitron">Phong cách: </span>
              <span className="text-cyan-300 font-bold">{dossier.combatStyle}</span>
            </div>
            <div>
              <span className="text-slate-400 font-orbitron">Lời khuyên chiến thuật: </span>
              <span className="text-emerald-300 font-bold">{dossier.tacticalAdvice}</span>
            </div>
          </div>
        </div>

        {/* Stat Breakdown Matrix */}
        <div className="mt-3">
          <div className="text-xs font-orbitron font-bold text-slate-300 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>CHỈ SỐ TĂNG CƯỜNG CHIẾN HẠM</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold">{pilot.bonusText}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {statItems.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                    stat.active
                      ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/40 border-slate-800/50 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 ${stat.color} shrink-0`} />
                    <span className="text-[10.5px] font-orbitron text-slate-300 truncate">
                      {stat.label}
                    </span>
                  </div>
                  <span className={`text-[11px] font-orbitron font-bold ${stat.color} shrink-0`}>
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-orbitron font-bold transition-colors cursor-pointer"
          >
            ĐÓNG
          </button>

          {isEquipped ? (
            <div className="px-5 py-2 rounded-xl bg-purple-500/30 border border-purple-400 text-purple-300 font-orbitron font-bold text-xs flex items-center gap-1.5 shadow">
              <Check className="w-4 h-4" />
              ĐANG ĐẢM NHIỆM LÁI CHÍNH
            </div>
          ) : isOwned ? (
            <button
              onClick={handleEquip}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-bold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-slate-950" />
              CHỌN TAY LÁI NÀY
            </button>
          ) : onOpenPilotGacha ? (
            <button
              onClick={() => {
                onClose();
                onOpenPilotGacha();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-orbitron font-bold text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              QUAY CHIÊU MỘ TAY LÁI
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
