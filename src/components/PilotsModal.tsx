/**
 * Pilots Barracks Modal (Doanh Trại Phi Công / Tay Lái)
 * View all 12 pilots across Tiers S, A, and B, their quotes, and stat bonuses.
 * Allows equipping a pilot to the active fleet.
 */

import React,{ useState } from 'react';
import { X,Check,Sparkles,User,Info } from 'lucide-react';
import { PILOTS,Pilot,PilotTier } from '../game/rules';
import { sound } from '../game/audio';
import { PilotDetailModal } from './PilotDetailModal';

interface PilotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownedPilotIds: string[];
  equippedPilotId: string | null;
  onEquipPilot: (pilotId: string) => void;
  onOpenPilotGacha: () => void;
}

export const PilotsModal: React.FC<PilotsModalProps> = ({
  isOpen,
  onClose,
  ownedPilotIds,
  equippedPilotId,
  onEquipPilot,
  onOpenPilotGacha,
}) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<'ALL' | PilotTier>('ALL');
  const [selectedPilotForDetail, setSelectedPilotForDetail] = useState<Pilot | null>(null);

  if (!isOpen) return null;

  const pilotsList = Object.values(PILOTS);
  const ownedSet = new Set(ownedPilotIds);

  const filteredPilots = selectedTierFilter === 'ALL'
    ? pilotsList
    : pilotsList.filter((p) => p.tier === selectedTierFilter);

  const handleEquip = (pilot: Pilot) => {
    sound.playPowerup();
    onEquipPilot(pilot.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#091322] via-[#050b14] to-[#040810] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-300">
                DOANH TRẠI TAY LÁI PHI ĐỘI
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                {ownedPilotIds.length}/{pilotsList.length} Phi công đã chiêu mộ · Chọn tay lái xuất sắc nhất chỉ huy chiến cơ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenPilotGacha();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/60 hover:border-amber-300 text-amber-300 text-xs font-orbitron font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>CHIÊU MỘ TAY LÁI</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tier Filters Tabs */}
        <div className="flex items-center justify-between gap-2 mt-3 mb-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-orbitron font-bold">
            {(['ALL', 'S', 'A', 'B'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTierFilter(tier)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedTierFilter === tier
                    ? tier === 'S'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-400'
                      : tier === 'A'
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-400'
                      : 'bg-cyan-500/30 text-cyan-300 border border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier === 'ALL'
                  ? `TẤT CẢ (${pilotsList.length})`
                  : `BẬC ${tier} (${pilotsList.filter((p) => p.tier === tier).length})`}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400 font-rajdhani hidden sm:block">
            Hiển thị {filteredPilots.length} tay lái
          </div>
        </div>

        {/* Pilots Grid (Compact & Easy to Read) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-2">
          {filteredPilots.map((p) => {
            const isOwned = ownedSet.has(p.id);
            const isEquipped = equippedPilotId === p.id;

            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'bg-gradient-to-b from-purple-950/70 to-slate-950 border-purple-400 ring-2 ring-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : isOwned
                    ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div>
                  {/* Top Line */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-lg border shadow-inner shrink-0 ${p.avatarBg}`}>
                        {p.avatarEmoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-orbitron font-bold text-xs text-white truncate">
                          {p.callsign}
                        </div>
                        <div className="text-[10px] text-slate-400 font-rajdhani truncate">
                          {p.name}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-orbitron font-black px-1.5 py-0.2 rounded shrink-0 ${
                        p.tier === 'S'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : p.tier === 'A'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      }`}
                    >
                      BẬC {p.tier}
                    </span>
                  </div>

                  {/* Bonus Specs Badge */}
                  <div className="py-1 px-1.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-orbitron text-amber-300 font-bold truncate">
                    {p.bonusText}
                  </div>

                  {/* Nút Xem Thông Tin Cho Tay Lái */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      setSelectedPilotForDetail(p);
                    }}
                    className="w-full mt-1.5 py-1 px-2 rounded-lg bg-slate-950/90 hover:bg-cyan-950/50 border border-slate-700/80 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-orbitron font-bold text-[9.5px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95"
                    title={`Xem thông tin chi tiết, tiểu sử và chỉ số của ${p.callsign}`}
                  >
                    <Info className="w-3 h-3 text-cyan-400" />
                    <span>XEM THÔNG TIN</span>
                  </button>
                </div>

                {/* Bottom CTA */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/80">
                  {isEquipped ? (
                    <div className="w-full py-1 px-2 rounded-lg bg-purple-500/30 border border-purple-400 text-purple-300 font-orbitron font-bold text-[10px] flex items-center justify-center gap-1 shadow">
                      <Check className="w-3 h-3" />
                      ĐANG LÁI
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(p)}
                      className="w-full py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-orbitron font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      CHỌN LÁI
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPilotGacha();
                      }}
                      className="w-full py-1 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-400 text-amber-300/80 hover:text-amber-300 font-orbitron font-bold text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      QUAY GACHA
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Chi Tiết Tay Lái */}
        <PilotDetailModal
          isOpen={selectedPilotForDetail !== null}
          onClose={() => setSelectedPilotForDetail(null)}
          pilot={selectedPilotForDetail}
          isOwned={selectedPilotForDetail ? ownedSet.has(selectedPilotForDetail.id) : false}
          isEquipped={selectedPilotForDetail ? equippedPilotId === selectedPilotForDetail.id : false}
          onEquipPilot={(id) => {
            onEquipPilot(id);
            setSelectedPilotForDetail(null);
          }}
          onOpenPilotGacha={() => {
            setSelectedPilotForDetail(null);
            onClose();
            onOpenPilotGacha();
          }}
        />
      </div>
    </div>
  );
};

