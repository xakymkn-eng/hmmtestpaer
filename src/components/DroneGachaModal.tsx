/**
 * Dedicated Drone Gacha Summoning Chamber (Cơ Chế Gacha Máy Bay Không Người Lái)
 * Provides a dedicated, high-tech holographic UI specifically for summoning Drones (Tier B, A, S).
 * Features:
 * - Single (200 Gems) & 10x Summons (1,800 Gems)
 * - Pity Guarantees: Tier S within 80 pulls, Tier A within 10 pulls, 10x guaranteed at least 1 Tier A or S
 * - 3D card flipping reveals with Tier S Golden Jackpot Celebrations
 * - Detailed stat cards showing ATK%, Fire Rate%, Speed%, HP, Armor, True DMG, Armor Pen%, and Tier S Passives
 * - Quick Equip ("Trang bị ngay") button into Slot 1 or Slot 2 directly from reveal cards
 * - Detailed Rates & Information dialog
 */

import React,{ useState,useEffect } from 'react';
import {
Sparkles,
X,AlertCircle,Plus,HelpCircle,
Radio,
Layers
} from 'lucide-react';
import {
DRONES,
DroneData,DroneGachaItem,
DRONE_GACHA_SINGLE_COST,
DRONE_GACHA_TEN_COST
} from '../game/drones';
import { sound } from '../game/audio';
import { DroneGraphic } from './DroneGraphic';

interface DroneGachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  gems: number;
  dronePityS: number;
  dronePityA: number;
  ownedDroneIds: string[];
  equippedDroneIds: string[];
  onPullDrones: (count: 1 | 10) => DroneGachaItem[];
  onEquipDrone: (droneId: string, slotIndex: 0 | 1) => void;
  onOpenRecharge?: () => void;
  onOpenDronesHangar?: () => void;
}

export const DroneGachaModal: React.FC<DroneGachaModalProps> = ({
  isOpen,
  onClose,
  gems,
  dronePityS,
  dronePityA,
  ownedDroneIds,
  equippedDroneIds,
  onPullDrones,
  onEquipDrone,
  onOpenRecharge,
  onOpenDronesHangar,
}) => {
  const [isSummoning, setIsSummoning] = useState<boolean>(false);
  const [results, setResults] = useState<DroneGachaItem[] | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [selectedDroneDetail, setSelectedDroneDetail] = useState<DroneData | null>(null);
  const [insufficientPrompt, setInsufficientPrompt] = useState<{ needed: number } | null>(null);
  const [showRatesModal, setShowRatesModal] = useState<boolean>(false);
  const [celebrationItem, setCelebrationItem] = useState<DroneGachaItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResults(null);
      setRevealedIndices(new Set());
      setInsufficientPrompt(null);
      setCelebrationItem(null);
      setShowRatesModal(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSummon = (count: 1 | 10) => {
    const cost = count === 10 ? DRONE_GACHA_TEN_COST : DRONE_GACHA_SINGLE_COST;
    if (gems < cost) {
      sound.playClick();
      setInsufficientPrompt({ needed: cost - gems });
      return;
    }

    setInsufficientPrompt(null);
    setIsSummoning(true);
    setCelebrationItem(null);
    sound.playWarpJump();

    setTimeout(() => {
      const pullResults = onPullDrones(count);
      setResults(pullResults);
      setIsSummoning(false);

      if (count === 1) {
        setRevealedIndices(new Set([0]));
        const pulled = pullResults[0];
        if (pulled.tier === 'S') {
          sound.playGachaReveal('S');
          setCelebrationItem(pulled);
        } else if (pulled.tier === 'A') {
          sound.playGachaReveal('A');
        } else {
          sound.playGachaReveal('B');
        }
      } else {
        // Auto-reveal for 10x with staggered fanfare
        setRevealedIndices(new Set());
        const hasTierS = pullResults.find((r) => r.tier === 'S');
        if (hasTierS) {
          setTimeout(() => {
            sound.playGachaReveal('S');
            setCelebrationItem(hasTierS);
          }, 600);
        } else {
          sound.playGachaReveal(pullResults.some(r => r.tier === 'A') ? 'A' : 'B');
        }
      }
    }, 1100);
  };

  const revealAllCards = () => {
    if (!results) return;
    const all = new Set<number>();
    results.forEach((_, i) => all.add(i));
    setRevealedIndices(all);
    sound.playClick();
  };

  const revealSingleCard = (idx: number) => {
    if (revealedIndices.has(idx)) return;
    const next = new Set(revealedIndices);
    next.add(idx);
    setRevealedIndices(next);
    const item = results?.[idx];
    if (item?.tier === 'S') {
      sound.playGachaReveal('S');
      setCelebrationItem(item);
    } else if (item?.tier === 'A') {
      sound.playGachaReveal('A');
    } else {
      sound.playGachaReveal('B');
    }
  };

  const tierSShowcase = [
    DRONES.drone_vampiric_s,
    DRONES.drone_overclock_s,
    DRONES.drone_aegis_s,
    DRONES.drone_chrono_s,
    DRONES.drone_plasma_s,
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Top Glowing Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-cyan-500/30 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-orbitron font-black text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-300 tracking-wider">
                  CỔNG TRIỆU HỒI DRONE CHIẾN ĐẤU
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[10px] font-orbitron font-bold">
                  BẬC B · A · S
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-rajdhani">
                Máy bay không người lái bay hộ tống, tự động xả đạn & tăng cường chỉ số cực đại
              </p>
            </div>
          </div>

          {/* Right Controls: Gems pill, Rate info, Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-950 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="text-xs">💎</span>
              <span className="font-orbitron font-bold text-amber-300 text-xs sm:text-sm tabular-nums">
                {gems.toLocaleString()}
              </span>
              {onOpenRecharge && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenRecharge();
                  }}
                  className="w-4 h-4 ml-1 rounded bg-amber-400 text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                  title="Nạp thêm kim cương"
                >
                  <Plus className="w-2.5 h-2.5 stroke-[3]" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowRatesModal(true);
              }}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors"
              title="Xem tỉ lệ & quy tắc quay Drone"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Insufficient Gems Banner Prompt */}
        {insufficientPrompt && (
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-rose-950/90 to-slate-900 border-b border-rose-500/50 text-rose-200 text-xs font-rajdhani animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Không đủ Kim Cương! Bạn cần thêm{' '}
                <strong className="text-amber-300 font-orbitron">{insufficientPrompt.needed.toLocaleString()} 💎</strong>
              </span>
            </div>
            {onOpenRecharge && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenRecharge();
                }}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-orbitron font-bold text-[10px] hover:scale-105 transition-transform"
              >
                NẠP NGAY
              </button>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-4">
          
          {/* Summoning Warp Hyperspace Tunnel */}
          {isSummoning && (
            <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center gap-3">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-3 rounded-full border-4 border-amber-400/30 border-b-amber-400 animate-spin [animation-duration:1.5s]" />
                <div className="absolute inset-6 rounded-full border-2 border-fuchsia-400/40 border-l-fuchsia-400 animate-spin [animation-duration:0.8s]" />
                <Radio className="w-10 h-10 text-cyan-300 animate-bounce" />
              </div>
              <div className="font-orbitron font-black text-cyan-300 text-sm tracking-widest animate-pulse">
                ĐANG KẾT NỐI VỆ TINH LƯỢNG TỬ...
              </div>
              <div className="text-xs text-slate-400 font-rajdhani">
                Đang dò tìm tín hiệu máy bay không người lái hộ tống
              </div>
            </div>
          )}

          {/* Reveal Screen If We Have Results */}
          {!isSummoning && results && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-orbitron font-bold text-xs text-slate-200 uppercase tracking-wider">
                    KẾT QUẢ TRIỆU HỒI ({revealedIndices.size}/{results.length})
                  </span>
                </div>
                {revealedIndices.size < results.length && (
                  <button
                    onClick={revealAllCards}
                    className="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-orbitron font-bold transition-all active:scale-95"
                  >
                    MỞ TẤT CẢ
                  </button>
                )}
              </div>

              {/* Cards Grid */}
              <div className={`grid gap-2.5 sm:gap-3 ${results.length === 1 ? 'grid-cols-1 max-w-sm mx-auto w-full' : 'grid-cols-2 sm:grid-cols-5'}`}>
                {results.map((item, idx) => {
                  const isRevealed = revealedIndices.has(idx);
                  const drone = DRONES[item.droneId];
                  const isEquippedSlot1 = equippedDroneIds[0] === item.droneId;
                  const isEquippedSlot2 = equippedDroneIds[1] === item.droneId;
                  const isEquipped = isEquippedSlot1 || isEquippedSlot2;

                  if (!isRevealed) {
                    return (
                      <button
                        key={idx}
                        onClick={() => revealSingleCard(idx)}
                        className="relative h-44 sm:h-52 rounded-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-cyan-500/40 hover:border-cyan-400 flex flex-col items-center justify-center p-3 text-center transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.15)] group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform mb-2">
                          <Radio className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="font-orbitron font-bold text-xs text-cyan-200">
                          HỘP DRONE #{idx + 1}
                        </div>
                        <div className="text-[10px] text-slate-400 font-rajdhani mt-1">
                          Nhấn để mở
                        </div>
                      </button>
                    );
                  }

                  // Card Revealed State
                  const isS = item.tier === 'S';
                  const isA = item.tier === 'A';
                  const tierBg = isS
                    ? 'from-amber-950/80 via-slate-900/90 to-slate-950 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                    : isA
                    ? 'from-purple-950/80 via-slate-900/90 to-slate-950 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'from-slate-900 via-slate-950 to-slate-950 border-cyan-500/40';

                  return (
                    <div
                      key={idx}
                      className={`relative rounded-2xl bg-gradient-to-b ${tierBg} border-2 p-2.5 sm:p-3 flex flex-col justify-between transition-all animate-in zoom-in-90 duration-300`}
                    >
                      {/* Top Badges: Tier & IsNew */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-orbitron font-black border ${
                            isS
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : isA
                              ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                              : 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          }`}
                        >
                          BẬC {item.tier}
                        </span>

                        {item.isNew ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[8px] font-orbitron font-bold animate-pulse">
                            MỚI!
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[8px] font-orbitron">
                            +{item.duplicateBonusGems} 💎
                          </span>
                        )}
                      </div>

                      {/* Drone Avatar & Visual */}
                      <div className="flex flex-col items-center my-1.5">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border relative overflow-hidden"
                          style={{
                            backgroundColor: `${item.color}20`,
                            borderColor: item.color,
                          }}
                        >
                          {drone ? (
                            <DroneGraphic drone={drone} size={50} showAura={isS} />
                          ) : (
                            <span className="text-2xl">{item.avatarEmoji}</span>
                          )}
                          {isS && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                          )}
                        </div>

                        <div className="font-orbitron font-bold text-[11px] text-white text-center mt-1.5 truncate max-w-full">
                          {item.vietnameseName}
                        </div>
                        <div className="text-[9px] text-slate-400 font-rajdhani truncate max-w-full">
                          {item.name}
                        </div>
                      </div>

                      {/* Stat Buff Highlights */}
                      {drone && (
                        <div className="p-1 rounded-lg bg-slate-950/70 border border-slate-800 text-[8.5px] font-rajdhani flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-amber-300 font-bold">
                            <span>Sát thương:</span>
                            <span>+{drone.statBuffs.damagePercent}%</span>
                          </div>
                          <div className="flex items-center justify-between text-cyan-300">
                            <span>Tốc bắn:</span>
                            <span>+{drone.statBuffs.fireRatePercent}%</span>
                          </div>
                          {isS && drone.passiveSkill && (
                            <div className="mt-0.5 pt-0.5 border-t border-amber-500/30 text-amber-200 text-[8px] font-bold truncate">
                              ⭐ {drone.passiveSkill.vietnameseName}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Card Action Buttons: Quick Equip */}
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => onEquipDrone(item.droneId, 0)}
                          className={`flex-1 py-1 rounded-lg text-[8.5px] font-orbitron font-bold transition-all ${
                            isEquippedSlot1
                              ? 'bg-emerald-500 text-slate-950 shadow'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                          title="Trang bị vào Trợ Thủ Trái (Slot 1)"
                        >
                          {isEquippedSlot1 ? 'SLOT 1 ✓' : 'SLOT 1'}
                        </button>
                        <button
                          onClick={() => onEquipDrone(item.droneId, 1)}
                          className={`flex-1 py-1 rounded-lg text-[8.5px] font-orbitron font-bold transition-all ${
                            isEquippedSlot2
                              ? 'bg-emerald-500 text-slate-950 shadow'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                          title="Trang bị vào Trợ Thủ Phải (Slot 2)"
                        >
                          {isEquippedSlot2 ? 'SLOT 2 ✓' : 'SLOT 2'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom After-Summon Action */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleSummon(1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/60 text-cyan-200 text-xs font-orbitron font-bold transition-all active:scale-95"
                >
                  QUAY TIẾP 1 LẦN (200 💎)
                </button>
                <button
                  onClick={() => handleSummon(10)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-orbitron font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                >
                  QUAY TIẾP 10 LẦN (1,800 💎)
                </button>
              </div>
            </div>
          )}

          {/* Banner Showcase (Visible when not in results view) */}
          {!isSummoning && !results && (
            <div className="flex flex-col gap-4">
              {/* Grand Banner Showcase */}
              <div className="relative rounded-3xl overflow-hidden border border-cyan-500/50 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-orbitron font-black mb-2">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>DRONE HUYỀN THOẠI BẬC S · NỘI TẠI ĐỘC BẢN</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-300 mb-1.5">
                      DR-99 HUYẾT NGUYỆT & DR-X QUÁ TẢI
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 font-rajdhani max-w-xl">
                      Drone Bậc S sở hữu chức năng nội tại siêu việt: <strong className="text-emerald-400">Tiêu diệt kẻ địch hồi 10% Max HP</strong>,{' '}
                      <strong className="text-amber-400">Tăng 15% sát thương khi gây dame</strong>, và{' '}
                      <strong className="text-cyan-400">Lá chắn Nano 25% Max HP</strong> mỗi 12 giây!
                    </p>

                    {/* Pity Trackers */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap justify-center sm:justify-start">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-[11px] font-orbitron flex items-center gap-1.5">
                        <span className="text-amber-400">⭐ BẢO HIỂM BẬC S:</span>
                        <span className="font-bold text-white tabular-nums">{dronePityS}/80</span>
                        <span className="text-[9px] text-slate-400">({80 - dronePityS} lượt)</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-purple-500/40 text-[11px] font-orbitron flex items-center gap-1.5">
                        <span className="text-purple-400">💎 BẢO HIỂM BẬC A:</span>
                        <span className="font-bold text-white tabular-nums">{dronePityA}/10</span>
                        <span className="text-[9px] text-slate-400">({10 - dronePityA} lượt)</span>
                      </div>
                    </div>
                  </div>

                  {/* S-Tier Featured Hologram Carousel */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                    {tierSShowcase.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDroneDetail(d)}
                        className="w-24 sm:w-28 p-2 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-amber-400/60 hover:border-amber-300 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105 shadow-md shrink-0"
                      >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-1 overflow-hidden">
                          <DroneGraphic drone={d} size={44} showAura={true} />
                        </div>
                        <div className="font-orbitron font-bold text-[10px] text-white truncate max-w-full">
                          {d.vietnameseName.split(' ')[0]}
                        </div>
                        <div className="text-[8px] text-amber-300 font-rajdhani font-bold truncate max-w-full">
                          {d.passiveSkill?.vietnameseName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Summon Action Buttons Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  {onOpenDronesHangar && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onOpenDronesHangar();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-orbitron font-bold transition-all active:scale-95"
                    >
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>KHO DRONE ({ownedDroneIds.length}/14)</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Single Summon */}
                  <button
                    onClick={() => handleSummon(1)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/60 text-cyan-200 font-orbitron font-bold text-xs sm:text-sm shadow-lg hover:border-cyan-300 transition-all active:scale-95 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>TRIỆU HỒI 1 LẦN</span>
                    <span className="text-amber-300 font-black tabular-nums">200 💎</span>
                  </button>

                  {/* 10x Summon */}
                  <button
                    onClick={() => handleSummon(10)}
                    className="flex-1 sm:flex-none relative flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-orbitron font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase shadow">
                      TIẾT KIỆM 200💎
                    </span>
                    <Sparkles className="w-4 h-4" />
                    <span>TRIỆU HỒI 10 LẦN</span>
                    <span className="text-slate-950 font-black tabular-nums">1,800 💎</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* S-Tier Celebration Fullscreen Fanfare Overlay */}
      {celebrationItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-2 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.6)] flex flex-col items-center text-center">
            <div className="text-4xl animate-bounce mb-2">🎉</div>
            <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-orbitron font-black text-xs uppercase mb-2">
              XUẤT HIỆN DRONE BẬC S HUYỀN THOẠI!
            </div>

            <div className="w-24 h-24 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] my-2 overflow-hidden">
              {DRONES[celebrationItem.droneId] ? (
                <DroneGraphic drone={DRONES[celebrationItem.droneId]} size={84} showAura={true} />
              ) : (
                <span className="text-4xl">{celebrationItem.avatarEmoji}</span>
              )}
            </div>

            <h3 className="font-orbitron font-black text-xl text-white">
              {celebrationItem.vietnameseName}
            </h3>
            <p className="text-xs text-slate-300 font-rajdhani mt-1 max-w-xs">
              {DRONES[celebrationItem.droneId]?.tagline}
            </p>

            {DRONES[celebrationItem.droneId]?.passiveSkill && (
              <div className="w-full mt-3 p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-left">
                <div className="text-[10px] font-orbitron font-black text-amber-300 uppercase">
                  ⭐ NỘI TẠI: {DRONES[celebrationItem.droneId].passiveSkill?.vietnameseName}
                </div>
                <div className="text-xs text-amber-100 font-rajdhani mt-0.5">
                  {DRONES[celebrationItem.droneId].passiveSkill?.description}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 w-full mt-4">
              <button
                onClick={() => {
                  sound.playClick();
                  onEquipDrone(celebrationItem.droneId, 0);
                  setCelebrationItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-orbitron font-black text-xs shadow hover:scale-105 active:scale-95 transition-all"
              >
                TRANG BỊ SLOT 1
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onEquipDrone(celebrationItem.droneId, 1);
                  setCelebrationItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-orbitron font-black text-xs shadow hover:scale-105 active:scale-95 transition-all"
              >
                TRANG BỊ SLOT 2
              </button>
            </div>

            <button
              onClick={() => setCelebrationItem(null)}
              className="mt-3 text-xs text-slate-400 hover:text-white font-rajdhani cursor-pointer"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}

      {/* Rates & Mechanics Dialog */}
      {showRatesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg p-5 rounded-3xl bg-slate-900 border border-cyan-500/60 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron font-bold text-sm text-white">
                  TỈ LỆ & QUY TẮC TRIỆU HỒI DRONE
                </h3>
              </div>
              <button
                onClick={() => setShowRatesModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-rajdhani text-slate-300">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between">
                <div>
                  <strong className="text-amber-300 font-orbitron">DRONE BẬC S (Huyền Thoại):</strong>
                  <div className="text-[11px] text-slate-400">Có kỹ năng nội tại đặc biệt (Hồi máu 10%, Quá tải 15% ST, Khiên Nano...)</div>
                </div>
                <span className="font-orbitron font-black text-amber-300 text-sm">1.0%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-between">
                <div>
                  <strong className="text-purple-300 font-orbitron">DRONE BẬC A (Tinh Anh):</strong>
                  <div className="text-[11px] text-slate-400">Laser quang tử, Bão vi tên lửa, Đạn hàn băng, Sét hồ quang...</div>
                </div>
                <span className="font-orbitron font-black text-purple-300 text-sm">10.0%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between">
                <div>
                  <strong className="text-cyan-300 font-orbitron">DRONE BẬC B (Tiêu Chuẩn):</strong>
                  <div className="text-[11px] text-slate-400">Trinh sát, Hộ vệ thép, Kim châm liên thanh, Đục giáp vonfram...</div>
                </div>
                <span className="font-orbitron font-black text-cyan-300 text-sm">89.0%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                <div className="text-cyan-300 font-bold">🛡️ Cơ Chế Bảo Hiểm (Pity):</div>
                <div>• Chắc chắn ra Drone Bậc S trong tối đa 80 lượt quay.</div>
                <div>• Chắc chắn ra Drone Bậc A hoặc S trong tối đa 10 lượt quay.</div>
                <div>• Lượt quay 10x chắc chắn xuất hiện ít nhất 1 Drone Bậc A hoặc Bậc S!</div>
                <div>• Quay trùng Drone sẽ tự động hoàn trả Kim Cương (Bậc S: 500💎, Bậc A: 200💎, Bậc B: 50💎).</div>
              </div>
            </div>

            <button
              onClick={() => setShowRatesModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-orbitron font-bold text-xs"
            >
              ĐÃ HIỂU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
