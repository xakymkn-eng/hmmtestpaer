/**
 * Drone Hangar & Loadout Management Modal (Kho Drone & Quản Lý Trợ Thủ)
 * - Spacious, enlarged selection cards with smooth touch-drag scrolling (touch-pan-y)
 * - Direct "Chọn Vị Trí" (Slot 1 Cánh Trái / Slot 2 Cánh Phải) buttons right on selection
 * - Dedicated "Thông Tin Chi Tiết" modal and dossier displaying full stats, DPS, passive skills
 * - Sticky Mobile Action Bar for instant one-tap equip & inspection without tedious scrolling
 * - Top Wingman Slot Bar & Aggregated Buffs summary
 */

import React,{ useState,useEffect } from 'react';
import {
Radio,
X,
Sparkles,CheckCircle2,
Lock,
Info,Compass
} from 'lucide-react';
import {
DRONES,DroneTier,
calculateDroneBonuses
} from '../game/drones';
import { sound } from '../game/audio';
import { DroneGraphic } from './DroneGraphic';

interface DronesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedDroneId?: string | null;
  ownedDroneIds: string[];
  equippedDroneIds: string[];
  onEquipDrone: (droneId: string, slotIndex: 0 | 1) => void;
  onUnequipDrone: (slotIndex: 0 | 1) => void;
  onOpenDroneGacha: () => void;
}

export const DronesModal: React.FC<DronesModalProps> = ({
  isOpen,
  onClose,
  initialSelectedDroneId = null,
  ownedDroneIds,
  equippedDroneIds,
  onEquipDrone,
  onUnequipDrone,
  onOpenDroneGacha,
}) => {
  const [selectedDroneId, setSelectedDroneId] = useState<string>(() => {
    return initialSelectedDroneId || equippedDroneIds[0] || ownedDroneIds[0] || 'drone_vampiric_s';
  });
  const [tierFilter, setTierFilter] = useState<'ALL' | 'OWNED' | DroneTier>('ALL');
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('list');
  const [showDetailDialog, setShowDetailDialog] = useState<boolean>(false);

  // Sync selected drone if opened with a specific initial target drone
  useEffect(() => {
    if (initialSelectedDroneId && DRONES[initialSelectedDroneId]) {
      setSelectedDroneId(initialSelectedDroneId);
    }
  }, [initialSelectedDroneId, isOpen]);

  if (!isOpen) return null;

  const allDrones = Object.values(DRONES);
  const ownedSet = new Set(ownedDroneIds);

  const filteredDrones = allDrones.filter((d) => {
    if (tierFilter === 'OWNED') return ownedSet.has(d.id);
    if (tierFilter === 'ALL') return true;
    return d.tier === tierFilter;
  });

  const selectedDrone = DRONES[selectedDroneId] || allDrones[0];
  const isSelectedOwned = ownedSet.has(selectedDrone.id);

  const slot1Drone = equippedDroneIds[0] ? DRONES[equippedDroneIds[0]] : null;
  const slot2Drone = equippedDroneIds[1] ? DRONES[equippedDroneIds[1]] : null;

  const totalBonuses = calculateDroneBonuses(equippedDroneIds);

  const isEquippedSlot1 = equippedDroneIds[0] === selectedDrone.id;
  const isEquippedSlot2 = equippedDroneIds[1] === selectedDrone.id;
  const isEquippedAny = isEquippedSlot1 || isEquippedSlot2;

  const handleSelectDrone = (droneId: string) => {
    sound.playClick();
    setSelectedDroneId(droneId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-cyan-500/30 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] shrink-0">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="font-orbitron font-black text-xs sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-300 tracking-wider truncate">
                  KHO MÁY BAY KHÔNG NGƯỜI LÁI (DRONE)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[9px] sm:text-[10px] font-orbitron font-bold shrink-0">
                  SỞ HỮU: {ownedDroneIds.length}/14
                </span>
              </div>
              <p className="text-[9px] sm:text-xs text-slate-400 font-rajdhani truncate hidden xs:block">
                Trang bị tối đa 2 Drone hộ tống Cánh Trái & Phải, tự xả đạn phụ và cộng dồn chỉ số siêu cấp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                onOpenDroneGacha();
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-orbitron font-black text-[10px] sm:text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95 cursor-pointer touch-manipulation"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>GACHA DRONE</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Active Equipped Slots Bar & Aggregated Buffs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 sm:gap-2 px-2.5 sm:px-6 py-2 bg-slate-950/95 border-b border-slate-800/80 shrink-0">
          {/* Slot 1: Wingman Left */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center shrink-0 relative overflow-hidden">
                {slot1Drone ? (
                  <DroneGraphic drone={slot1Drone} size={36} showAura={false} />
                ) : (
                  <span className="text-slate-600 text-[10px] font-orbitron">TRỐNG</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[8.5px] sm:text-[9px] font-orbitron text-cyan-400 font-bold uppercase tracking-wide">
                  SLOT 1 (CÁNH TRÁI)
                </div>
                <div className="text-xs font-orbitron font-black text-white truncate">
                  {slot1Drone ? slot1Drone.vietnameseName : 'Chưa trang bị'}
                </div>
                {slot1Drone && (
                  <div className="text-[8.5px] sm:text-[9px] text-amber-300 font-rajdhani truncate font-bold">
                    +{slot1Drone.statBuffs.damagePercent}% ST · {slot1Drone.tier === 'S' ? `⭐ ${slot1Drone.passiveSkill?.vietnameseName}` : 'Hộ vệ'}
                  </div>
                )}
              </div>
            </div>
            {slot1Drone && (
              <button
                onClick={() => {
                  sound.playClick();
                  onUnequipDrone(0);
                }}
                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[8.5px] font-orbitron font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
                title="Tháo gỡ Drone khỏi Cánh Trái"
              >
                GỠ
              </button>
            )}
          </div>

          {/* Slot 2: Wingman Right */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-950/60 border border-amber-400/50 flex items-center justify-center shrink-0 relative overflow-hidden">
                {slot2Drone ? (
                  <DroneGraphic drone={slot2Drone} size={36} showAura={false} />
                ) : (
                  <span className="text-slate-600 text-[10px] font-orbitron">TRỐNG</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[8.5px] sm:text-[9px] font-orbitron text-amber-400 font-bold uppercase tracking-wide">
                  SLOT 2 (CÁNH PHẢI)
                </div>
                <div className="text-xs font-orbitron font-black text-white truncate">
                  {slot2Drone ? slot2Drone.vietnameseName : 'Chưa trang bị'}
                </div>
                {slot2Drone && (
                  <div className="text-[8.5px] sm:text-[9px] text-amber-300 font-rajdhani truncate font-bold">
                    +{slot2Drone.statBuffs.damagePercent}% ST · {slot2Drone.tier === 'S' ? `⭐ ${slot2Drone.passiveSkill?.vietnameseName}` : 'Hộ vệ'}
                  </div>
                )}
              </div>
            </div>
            {slot2Drone && (
              <button
                onClick={() => {
                  sound.playClick();
                  onUnequipDrone(1);
                }}
                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[8.5px] font-orbitron font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
                title="Tháo gỡ Drone khỏi Cánh Phải"
              >
                GỠ
              </button>
            )}
          </div>

          {/* Aggregated Active Buffs Summary */}
          <div className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-[9px] sm:text-[10px] font-orbitron flex flex-col justify-center">
            <div className="flex items-center justify-between text-slate-400 text-[8.5px] sm:text-[9px]">
              <span>TỔNG BUFF ĐANG KÍCH HOẠT:</span>
              <span className="text-emerald-400 font-bold">
                {equippedDroneIds.length}/2 DRONE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1 text-[8.5px] sm:text-[9px] font-rajdhani font-bold">
              <span className="text-amber-300 truncate">⚔️ +{totalBonuses.damagePercent}% ST</span>
              <span className="text-cyan-300 truncate">⚡ +{totalBonuses.fireRatePercent}% Bắn</span>
              <span className="text-emerald-300 truncate">🩸 +{totalBonuses.hpBonus} HP</span>
              <span className="text-sky-300 truncate">🛡️ +{totalBonuses.armorBonus} Giáp</span>
              <span className="text-purple-300 truncate">🎯 +{totalBonuses.armorPenPercent}% Xuyên</span>
              <span className="text-yellow-300 truncate">✨ +{totalBonuses.trueDamageBonus} Chuẩn</span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Switcher (< md) */}
        <div className="md:hidden flex border-b border-slate-800 bg-slate-900/90 shrink-0">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'list'
                ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-950/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>DANH SÁCH DRONE ({filteredDrones.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('detail')}
            className={`flex-1 py-2 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'detail'
                ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-950/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>CHI TIẾT & TRANG BỊ</span>
          </button>
        </div>

        {/* Main Body: Drone Cards List & Detail Dossier */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-3 p-2.5 sm:p-4 pb-20 md:pb-4">
          
          {/* Left Column: Drone Cards (Visible on desktop OR when mobileTab === 'list') */}
          <div className={`md:col-span-7 flex flex-col gap-2 overflow-hidden ${mobileTab === 'list' ? 'flex' : 'hidden md:flex'}`}>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap shrink-0">
              {(['ALL', 'OWNED', 'S', 'A', 'B'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    sound.playClick();
                    setTierFilter(t);
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-orbitron font-bold transition-all cursor-pointer ${
                    tierFilter === t
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {t === 'ALL'
                    ? 'TẤT CẢ (14)'
                    : t === 'OWNED'
                    ? `ĐÃ CÓ (${ownedDroneIds.length})`
                    : `BẬC ${t}`}
                </button>
              ))}
            </div>

            {/* Drone Selection Scroll Area (Enlarged, very spacious cards, smooth touch scrolling) */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain pr-1 flex flex-col gap-2.5 touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {filteredDrones.map((d) => {
                const isOwned = ownedSet.has(d.id);
                const isSelected = selectedDrone.id === d.id;
                const isEquipped1 = equippedDroneIds[0] === d.id;
                const isEquipped2 = equippedDroneIds[1] === d.id;
                const isEquipped = isEquipped1 || isEquipped2;

                const isS = d.tier === 'S';
                const isA = d.tier === 'A';
                
                const cardBorder = isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40'
                  : isS
                  ? 'border-amber-500/50 hover:border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-slate-900/90'
                  : isA
                  ? 'border-purple-500/40 hover:border-purple-400/70 bg-slate-900/90'
                  : 'border-slate-800 hover:border-cyan-500/40 bg-slate-900/80';

                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDrone(d.id)}
                    className={`relative p-3 sm:p-3.5 rounded-2xl border-2 ${cardBorder} flex flex-col gap-2 cursor-pointer transition-all hover:scale-[1.005] active:scale-[0.99] touch-manipulation group ${
                      !isOwned ? 'opacity-70 grayscale-[20%]' : ''
                    }`}
                  >
                    {/* Top Row: Visual + Main Info */}
                    <div className="flex items-center gap-3">
                      {/* Big Visual Drone Frame */}
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 border relative overflow-hidden transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${d.color}15`,
                          borderColor: isSelected ? '#22d3ee' : `${d.color}60`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                        <DroneGraphic drone={d} size={isS ? 64 : 58} showAura={isS} />
                      </div>

                      {/* Main Info */}
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        {/* Badges Bar */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-orbitron font-black border uppercase tracking-wider ${
                                isS
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                                  : isA
                                  ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                                  : 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              }`}
                            >
                              BẬC {d.tier}
                            </span>
                            <span className="text-[9px] text-slate-400 font-orbitron font-bold">
                              {d.id.replace('drone_', '').toUpperCase()}
                            </span>
                          </div>

                          {isEquipped ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-orbitron font-black shadow">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isEquipped1 ? 'CÁNH TRÁI' : 'CÁNH PHẢI'}</span>
                            </span>
                          ) : isOwned ? (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[8.5px] font-orbitron font-bold">
                              SỞ HỮU
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[8.5px] font-orbitron">
                              <Lock className="w-2.5 h-2.5" />
                              <span>CHƯA CÓ</span>
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <div className="font-orbitron font-black text-xs sm:text-sm text-white leading-normal truncate mt-1" title={d.vietnameseName}>
                          {d.vietnameseName}
                        </div>

                        {/* Key Stats Chips */}
                        <div className="text-[9.5px] sm:text-[10px] font-rajdhani font-bold flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-amber-300 font-orbitron">⚔️ +{d.statBuffs.damagePercent}% ST</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-cyan-300 font-orbitron">⚡ +{d.statBuffs.fireRatePercent}% Tốc</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-emerald-300 font-orbitron">🩸 +{d.statBuffs.hpBonus} HP</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-sky-300 font-orbitron">🛡️ +{d.statBuffs.armorBonus} Giáp</span>
                        </div>

                        {/* Tier S Unique Passive preview */}
                        {isS && d.passiveSkill ? (
                          <div className="mt-1 text-[9px] sm:text-[10px] text-amber-200 bg-amber-950/60 border border-amber-500/40 rounded px-2 py-0.5 font-rajdhani font-bold truncate flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="font-bold text-amber-300">Nội tại:</span>
                            <span className="truncate">{d.passiveSkill.vietnameseName}</span>
                          </div>
                        ) : (
                          <div className="text-[9px] text-slate-400 font-rajdhani truncate mt-0.5">
                            Đạn tự bắn: <strong className="text-cyan-300">{d.bulletDamage} ST</strong> ({d.bulletType}) · {d.fireRate} viên/giây
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Strip: Direct "Chọn Vị Trí" and "Thông Tin" buttons right on the card */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-2">
                      {isOwned ? (
                        <>
                          <div className="flex items-center gap-1 sm:gap-1.5 flex-1">
                            {/* Slot 1 Equip Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playClick();
                                if (isEquipped1) onUnequipDrone(0);
                                else onEquipDrone(d.id, 0);
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-xl font-orbitron font-bold text-[9px] sm:text-[10px] transition-all cursor-pointer active:scale-95 touch-manipulation flex items-center justify-center gap-1 ${
                                isEquipped1
                                  ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 shadow'
                                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 hover:text-white'
                              }`}
                            >
                              <Compass className="w-3 h-3" />
                              <span>{isEquipped1 ? 'GỠ SLOT 1' : 'VÀO SLOT 1'}</span>
                            </button>

                            {/* Slot 2 Equip Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playClick();
                                if (isEquipped2) onUnequipDrone(1);
                                else onEquipDrone(d.id, 1);
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-xl font-orbitron font-bold text-[9px] sm:text-[10px] transition-all cursor-pointer active:scale-95 touch-manipulation flex items-center justify-center gap-1 ${
                                isEquipped2
                                  ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 shadow'
                                  : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-200 hover:text-white'
                              }`}
                            >
                              <Compass className="w-3 h-3" />
                              <span>{isEquipped2 ? 'GỠ SLOT 2' : 'VÀO SLOT 2'}</span>
                            </button>
                          </div>

                          {/* Info Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playClick();
                              setSelectedDroneId(d.id);
                              setShowDetailDialog(true);
                            }}
                            className="py-1.5 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-cyan-300 text-[9px] sm:text-[10px] font-orbitron font-bold transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center gap-1 shrink-0"
                            title="Xem chi tiết toàn bộ chỉ số Drone"
                          >
                            <Info className="w-3 h-3 text-cyan-400" />
                            <span>THÔNG TIN</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className="text-[10px] text-slate-400 font-rajdhani">
                            Chưa mở khóa Drone này
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playClick();
                              onOpenDroneGacha();
                            }}
                            className="py-1 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-orbitron font-bold text-[9.5px] shadow transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>QUAY GACHA</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Drone Detail Dossier (Visible on desktop OR when mobileTab === 'detail') */}
          <div className={`md:col-span-5 flex-col justify-between rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-cyan-500/40 p-3 sm:p-4 overflow-y-auto overscroll-contain touch-pan-y ${mobileTab === 'detail' ? 'flex' : 'hidden md:flex'}`}>
            <div>
              {/* Drone Showcase Header: Big Visual Viewport */}
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 p-3 flex flex-col items-center justify-center overflow-hidden shadow-inner min-h-[140px] sm:min-h-[160px]">
                {/* Background Tech Scanner Rings */}
                <div className="absolute w-36 h-36 rounded-full border border-cyan-500/20 animate-spin [animation-duration:20s] pointer-events-none" />
                <div className="absolute w-24 h-24 rounded-full border border-amber-500/20 animate-pulse pointer-events-none" />
                <div
                  className="absolute w-28 h-28 rounded-full blur-2xl pointer-events-none"
                  style={{ backgroundColor: `${selectedDrone.color}25` }}
                />

                {/* Big Drone Model Graphic */}
                <div className="relative z-10 transition-transform hover:scale-110 duration-300">
                  <DroneGraphic drone={selectedDrone} size={90} showAura={true} />
                </div>

                {/* Floating Tier & Code Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-orbitron font-black border ${
                      selectedDrone.tier === 'S'
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : selectedDrone.tier === 'A'
                        ? 'bg-purple-500/25 border-purple-400 text-purple-300'
                        : 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                    }`}
                  >
                    BẬC {selectedDrone.tier}
                  </span>
                  <span className="text-[10px] text-slate-300 font-orbitron font-bold">
                    {selectedDrone.id.replace('drone_', '').toUpperCase()}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 z-10">
                  {isSelectedOwned ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[9px] font-orbitron font-bold">
                      ĐÃ SỞ HỮU
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[9px] font-orbitron font-bold">
                      CHƯA SỞ HỮU
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="mt-2.5">
                <h3 className="font-orbitron font-black text-sm sm:text-base text-white">
                  {selectedDrone.vietnameseName}
                </h3>
                <div className="text-[10px] text-slate-400 font-rajdhani">
                  {selectedDrone.name} · Loại đạn: <strong className="text-cyan-300 uppercase">{selectedDrone.bulletType}</strong>
                </div>
              </div>

              {/* Tagline & Description */}
              <div className="my-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-rajdhani">
                <div className="text-cyan-300 font-bold mb-0.5">
                  {selectedDrone.tagline}
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedDrone.description}
                </div>
              </div>

              {/* Tier S Unique Passive Showcase */}
              {selectedDrone.tier === 'S' && selectedDrone.passiveSkill && (
                <div className="my-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                  <div className="flex items-center gap-1.5 text-xs font-orbitron font-black text-amber-300 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>NỘI TẠI BẬC S: {selectedDrone.passiveSkill.vietnameseName}</span>
                  </div>
                  <div className="text-[11px] text-amber-100 font-rajdhani mt-1 leading-relaxed font-medium">
                    {selectedDrone.passiveSkill.description}
                  </div>
                </div>
              )}

              {/* Comprehensive Stat Breakdown */}
              <div className="space-y-1 text-xs font-rajdhani">
                <div className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>CHỈ SỐ TĂNG CƯỜNG CHO MÁY BAY CHÍNH:</span>
                  <button
                    onClick={() => setShowDetailDialog(true)}
                    className="text-cyan-300 hover:underline flex items-center gap-0.5 text-[9px] cursor-pointer"
                  >
                    <Info className="w-2.5 h-2.5" />
                    <span>Chi tiết</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">⚔️ Tăng Sát Thương:</span>
                    <strong className="text-amber-400 font-orbitron tabular-nums">
                      +{selectedDrone.statBuffs.damagePercent}%
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">⚡ Tốc Độ Bắn:</span>
                    <strong className="text-cyan-400 font-orbitron tabular-nums">
                      +{selectedDrone.statBuffs.fireRatePercent}%
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🚀 Tốc Độ Bay:</span>
                    <strong className="text-sky-300 font-orbitron tabular-nums">
                      +{selectedDrone.statBuffs.speedPercent}%
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🩸 Máu Tối Đa:</span>
                    <strong className="text-emerald-400 font-orbitron tabular-nums">
                      +{selectedDrone.statBuffs.hpBonus}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🛡️ Giáp Tối Đa:</span>
                    <strong className="text-cyan-300 font-orbitron tabular-nums">
                      +{selectedDrone.statBuffs.armorBonus}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🔰 Phòng Thủ:</span>
                    <strong className="text-blue-300 font-orbitron tabular-nums">
                      +{selectedDrone.statBuffs.defenseBonus}
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">🎯 Xuyên Giáp:</span>
                    <strong className="text-purple-300 font-orbitron tabular-nums">
                      +{selectedDrone.statBuffs.armorPenPercent}%
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">✨ ST Chuẩn:</span>
                    <strong className="text-yellow-300 font-orbitron tabular-nums">
                      +{selectedDrone.statBuffs.trueDamageBonus}
                    </strong>
                  </div>
                </div>

                {/* Drone Autonomous Weaponry */}
                <div className="p-2 mt-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between text-xs">
                  <span className="text-slate-300">💥 Hỏa lực Drone tự xả đạn:</span>
                  <span className="font-orbitron font-bold text-cyan-300">
                    {selectedDrone.bulletDamage} ST · {selectedDrone.fireRate} viên/s
                  </span>
                </div>
              </div>
            </div>

            {/* Equip / Unlock Actions in Inspector */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2 shrink-0">
              {isSelectedOwned ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (isEquippedSlot1) onUnequipDrone(0);
                      else onEquipDrone(selectedDrone.id, 0);
                    }}
                    className={`py-2 sm:py-2.5 rounded-xl font-orbitron font-bold text-xs transition-all cursor-pointer active:scale-95 touch-manipulation flex items-center justify-center gap-1.5 ${
                      isEquippedSlot1
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{isEquippedSlot1 ? 'THÁO KHỎI SLOT 1' : 'TRANG BỊ CÁNH TRÁI (1)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      if (isEquippedSlot2) onUnequipDrone(1);
                      else onEquipDrone(selectedDrone.id, 1);
                    }}
                    className={`py-2 sm:py-2.5 rounded-xl font-orbitron font-bold text-xs transition-all cursor-pointer active:scale-95 touch-manipulation flex items-center justify-center gap-1.5 ${
                      isEquippedSlot2
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{isEquippedSlot2 ? 'THÁO KHỎI SLOT 2' : 'TRANG BỊ CÁNH PHẢI (2)'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenDroneGacha();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 text-slate-950 font-orbitron font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>MỞ KHÓA TẠI CỔNG GACHA DRONE</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Mobile Quick Action Bar (Always accessible at bottom of screen on mobile) */}
        <div className="md:hidden absolute bottom-0 inset-x-0 bg-slate-950/95 border-t border-cyan-500/50 p-2 flex items-center justify-between gap-2 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shrink-0">
              <DroneGraphic drone={selectedDrone} size={30} showAura={false} />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] font-orbitron font-bold text-cyan-300 truncate">
                {selectedDrone.vietnameseName}
              </div>
              <div className="text-[8px] text-amber-300 font-rajdhani truncate font-bold">
                Bậc {selectedDrone.tier} · +{selectedDrone.statBuffs.damagePercent}% ST
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isSelectedOwned ? (
              <>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (isEquippedSlot1) onUnequipDrone(0);
                    else onEquipDrone(selectedDrone.id, 0);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[9px] font-orbitron font-bold transition-all active:scale-95 ${
                    isEquippedSlot1
                      ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                      : 'bg-cyan-500 text-slate-950 font-black shadow'
                  }`}
                >
                  {isEquippedSlot1 ? 'GỠ 1' : 'SLOT 1'}
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (isEquippedSlot2) onUnequipDrone(1);
                    else onEquipDrone(selectedDrone.id, 1);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[9px] font-orbitron font-bold transition-all active:scale-95 ${
                    isEquippedSlot2
                      ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                      : 'bg-amber-400 text-slate-950 font-black shadow'
                  }`}
                >
                  {isEquippedSlot2 ? 'GỠ 2' : 'SLOT 2'}
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowDetailDialog(true);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300"
                  title="Xem thông tin chi tiết"
                >
                  <Info className="w-4 h-4 text-cyan-400" />
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenDroneGacha();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-orbitron font-black text-[9px] shadow"
              >
                GACHA DRONE
              </button>
            )}
          </div>
        </div>

        {/* Dedicated Full Technical Info Modal (Xem Toàn Bộ Thông Tin Chi Tiết) */}
        {showDetailDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-cyan-400 p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShowDetailDialog(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Drone Banner */}
              <div className="flex items-center gap-3.5 mb-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${selectedDrone.color}20`,
                    borderColor: selectedDrone.color,
                  }}
                >
                  <DroneGraphic drone={selectedDrone} size={60} showAura={selectedDrone.tier === 'S'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-orbitron font-black border uppercase ${
                        selectedDrone.tier === 'S'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : selectedDrone.tier === 'A'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                          : 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      }`}
                    >
                      BẬC {selectedDrone.tier}
                    </span>
                    <span className="text-xs text-slate-400 font-orbitron font-bold">
                      {selectedDrone.id}
                    </span>
                  </div>
                  <h3 className="font-orbitron font-black text-base sm:text-lg text-white mt-1">
                    {selectedDrone.vietnameseName}
                  </h3>
                  <div className="text-[11px] text-cyan-300 font-rajdhani">
                    {selectedDrone.tagline}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-rajdhani text-slate-300 leading-relaxed mb-3">
                {selectedDrone.description}
              </div>

              {/* Passive Skill */}
              {selectedDrone.tier === 'S' && selectedDrone.passiveSkill && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-400/80 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-orbitron font-black text-amber-300 uppercase">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>NỘI TẠI ĐỘC QUYỀN: {selectedDrone.passiveSkill.vietnameseName}</span>
                  </div>
                  <div className="text-xs text-amber-100 font-rajdhani mt-1 font-medium">
                    {selectedDrone.passiveSkill.description}
                  </div>
                </div>
              )}

              {/* All Stats Table */}
              <div className="text-xs font-rajdhani space-y-1.5 mb-4">
                <div className="font-orbitron font-bold text-slate-400 text-[10px] uppercase">
                  BẢNG THÔNG SỐ KỸ THUẬT & BUFF:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">⚔️ Tăng Sát Thương:</span>
                    <strong className="text-amber-400 font-orbitron">+{selectedDrone.statBuffs.damagePercent}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">⚡ Tốc Độ Bắn:</span>
                    <strong className="text-cyan-400 font-orbitron">+{selectedDrone.statBuffs.fireRatePercent}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">🚀 Tốc Độ Bay:</span>
                    <strong className="text-sky-300 font-orbitron">+{selectedDrone.statBuffs.speedPercent}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">🩸 Máu Tối Đa:</span>
                    <strong className="text-emerald-400 font-orbitron">+{selectedDrone.statBuffs.hpBonus} HP</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">🛡️ Giáp Tối Đa:</span>
                    <strong className="text-cyan-300 font-orbitron">+{selectedDrone.statBuffs.armorBonus} Giáp</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">🔰 Phòng Thủ:</span>
                    <strong className="text-blue-300 font-orbitron">+{selectedDrone.statBuffs.defenseBonus}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">🎯 Xuyên Giáp:</span>
                    <strong className="text-purple-300 font-orbitron">+{selectedDrone.statBuffs.armorPenPercent}%</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">✨ Sát Thương Chuẩn:</span>
                    <strong className="text-yellow-300 font-orbitron">+{selectedDrone.statBuffs.trueDamageBonus}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-400/40 flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-300">💥 Hỏa lực tự hành Drone:</span>
                  <span className="font-orbitron font-bold text-cyan-300">
                    {selectedDrone.bulletDamage} ST · {selectedDrone.fireRate} viên/giây ({selectedDrone.bulletType})
                  </span>
                </div>
              </div>

              {/* Action Buttons inside Info Modal */}
              {isSelectedOwned ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (isEquippedSlot1) onUnequipDrone(0);
                      else onEquipDrone(selectedDrone.id, 0);
                    }}
                    className={`py-2.5 rounded-xl font-orbitron font-bold text-xs transition-all cursor-pointer ${
                      isEquippedSlot1
                        ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                        : 'bg-cyan-500 text-slate-950 shadow'
                    }`}
                  >
                    {isEquippedSlot1 ? 'THÁO SLOT 1 (TRÁI)' : 'GẮN VÀO CÁNH TRÁI'}
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (isEquippedSlot2) onUnequipDrone(1);
                      else onEquipDrone(selectedDrone.id, 1);
                    }}
                    className={`py-2.5 rounded-xl font-orbitron font-bold text-xs transition-all cursor-pointer ${
                      isEquippedSlot2
                        ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                        : 'bg-amber-400 text-slate-950 shadow'
                    }`}
                  >
                    {isEquippedSlot2 ? 'THÁO SLOT 2 (PHẢI)' : 'GẮN VÀO CÁNH PHẢI'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowDetailDialog(false);
                    onOpenDroneGacha();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-orbitron font-black text-xs shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>MỞ KHÓA TẠI CỔNG GACHA DRONE</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
