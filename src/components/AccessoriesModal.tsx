/**
 * Weapon Accessories & Armory Modal (Xưởng Phụ Kiện Vũ Khí Bán Bằng Vàng)
 * Allows players to buy 29 tiered accessories using Gold (50,000 to 100,000,000 Gold)
 * and equip Barrels, Loaders, and Quantum Cores onto their fighters.
 */

import React,{ useState } from 'react';
import {
X,Wrench,
AlertCircle,ArrowUpDown
} from 'lucide-react';
import {
FighterStats,
WEAPON_ACCESSORIES,
WeaponAccessory,
AccessorySlot,
AccessoryTier,
calculateAccessoryBonuses,
} from '../game/rules';
import { sound } from '../game/audio';

interface AccessoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFighter: FighterStats;
  gold: number;
  gems?: number;
  ownedAccessoryIds: string[];
  fighterAccessories: Record<string, string[]>;
  onBuyAccessory: (accId: string, costGold: number) => void;
  onToggleEquipAccessory: (fighterId: string, accId: string) => void;
  onOpenRecharge?: () => void;
}

export const AccessoriesModal: React.FC<AccessoriesModalProps> = ({
  isOpen,
  onClose,
  selectedFighter,
  gold = 0,
  gems = 0,
  ownedAccessoryIds = [],
  fighterAccessories = {},
  onBuyAccessory,
  onToggleEquipAccessory,
}) => {
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<'ALL' | AccessorySlot>('ALL');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'ALL' | AccessoryTier>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [insufficientWarning, setInsufficientWarning] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const installedIds = fighterAccessories[selectedFighter.id] || [];
  const currentBonuses = calculateAccessoryBonuses(installedIds);
  const allAccessories = Object.values(WEAPON_ACCESSORIES);

  // Filtering
  let filtered = allAccessories.filter((acc) => {
    if (selectedSlotFilter !== 'ALL' && acc.slot !== selectedSlotFilter) return false;
    if (selectedTierFilter !== 'ALL' && acc.tier !== selectedTierFilter) return false;
    return true;
  });

  // Sorting by Gold price
  filtered = [...filtered].sort((a, b) => {
    return sortOrder === 'asc' ? a.costGold - b.costGold : b.costGold - a.costGold;
  });

  const ownedSet = new Set(ownedAccessoryIds);
  const installedSet = new Set(installedIds);

  const handleBuy = (acc: WeaponAccessory) => {
    if (gold < acc.costGold) {
      setInsufficientWarning(
        `Cần thêm ${(acc.costGold - gold).toLocaleString()} Vàng nữa để mua ${acc.vietnameseName}! Hãy chiến đấu vượt ải để tích lũy thêm Vàng thưởng!`
      );
      return;
    }
    setInsufficientWarning(null);
    sound.playPowerup();
    onBuyAccessory(acc.id, acc.costGold);
  };

  const handleToggle = (acc: WeaponAccessory) => {
    sound.playPowerup();
    onToggleEquipAccessory(selectedFighter.id, acc.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#091322] via-[#050b14] to-[#040810] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col p-3.5 sm:p-5">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 via-amber-400 to-cyan-500 flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.5)]">
              <Wrench className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-cyan-400">
                XƯỞNG PHỤ KIỆN VŨ KHÍ · BÁN BẰNG VÀNG
              </h2>
              <p className="text-[11px] text-slate-400 font-rajdhani hidden sm:block">
                Mua bằng Vàng nhận từ mỗi trận chiến (50.000 đến 100.000.000 Vàng) · Lắp tối đa 3 phụ kiện
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gold Currency Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-yellow-400/50 shadow-[0_0_10px_rgba(234,179,8,0.25)]">
              <span className="text-base">🪙</span>
              <span className="font-orbitron font-bold text-yellow-300 text-xs sm:text-sm tabular-nums">
                {gold.toLocaleString()}
              </span>
              <span className="text-[10px] text-yellow-500 font-bold font-orbitron">VÀNG</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Insufficient Warning Banner */}
        {insufficientWarning && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/80 shadow flex items-center justify-between gap-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="text-xs text-rose-200 font-rajdhani">
                <strong className="font-orbitron text-white">CHƯA ĐỦ VÀNG!</strong> {insufficientWarning}
              </div>
            </div>
            <button
              onClick={() => setInsufficientWarning(null)}
              className="px-2 py-0.5 text-slate-400 hover:text-white text-xs font-orbitron cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Compact Fighter Loadout Banner */}
        <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-slate-900/90 via-cyan-950/40 to-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-orbitron font-black text-sm border shadow"
              style={{
                backgroundColor: `${selectedFighter.color}20`,
                borderColor: selectedFighter.color,
                color: selectedFighter.color,
              }}
            >
              {selectedFighter.tier}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-orbitron font-black text-white">
                  {selectedFighter.vietnameseName}
                </span>
                <span className="text-[10px] text-cyan-400 font-orbitron">({selectedFighter.name})</span>
              </div>
              <div className="text-[10px] text-slate-400 font-rajdhani line-clamp-1">
                {selectedFighter.tagline}
              </div>
            </div>
          </div>

          {/* Current Installed Stat Boosts */}
          <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-lg border border-cyan-500/20 text-xs font-orbitron">
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block uppercase">SÁT THƯƠNG</span>
              <span className="text-xs font-black text-rose-400">+{currentBonuses.damagePercent}%</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block uppercase">TỐC BẮN</span>
              <span className="text-xs font-black text-amber-300">+{currentBonuses.fireRatePercent}%</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block uppercase">BẠO KÍCH</span>
              <span className="text-xs font-black text-yellow-300">+{currentBonuses.critRatePercent}%</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block uppercase">XUYÊN GIÁP</span>
              <span className="text-xs font-black text-cyan-300">+{currentBonuses.armorPenPercent}%</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block uppercase">ST CHUẨN</span>
              <span className="text-xs font-black text-purple-300">+{currentBonuses.trueDamageBonus}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-[9px] text-slate-400 block uppercase">ĐÃ LẮP</span>
              <span className="text-xs font-black text-white">{installedIds.length}/3</span>
            </div>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-1">
          {/* Slot Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px] font-orbitron font-bold">
            <button
              onClick={() => setSelectedSlotFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                selectedSlotFilter === 'ALL'
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              TẤT CẢ ({allAccessories.length})
            </button>
            <button
              onClick={() => setSelectedSlotFilter('barrel')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                selectedSlotFilter === 'barrel'
                  ? 'bg-rose-500/20 border border-rose-400 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              NÒNG SÚNG (+ST)
            </button>
            <button
              onClick={() => setSelectedSlotFilter('loader')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                selectedSlotFilter === 'loader'
                  ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              BỘ NẠP (+Tốc)
            </button>
            <button
              onClick={() => setSelectedSlotFilter('core')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                selectedSlotFilter === 'core'
                  ? 'bg-purple-500/20 border border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              LÕI (Song Hệ & Thần Thoại)
            </button>
          </div>

          {/* Tier Filter & Price Sort */}
          <div className="flex items-center gap-1.5 text-[11px] font-orbitron font-bold">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/80 border border-slate-800">
              {(['ALL', 'B', 'A', 'S', 'SS', 'MYTHIC'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTierFilter(t)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                    selectedTierFilter === t
                      ? t === 'MYTHIC'
                        ? 'bg-rose-600 text-white font-black shadow'
                        : t === 'SS'
                        ? 'bg-red-500/30 border border-red-400 text-red-300'
                        : t === 'S'
                        ? 'bg-amber-500/30 border border-amber-400 text-amber-300'
                        : t === 'A'
                        ? 'bg-purple-500/30 border border-purple-400 text-purple-300'
                        : 'bg-cyan-500/30 border border-cyan-400 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'ALL' ? 'TẤT CẢ' : t}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-[10px] cursor-pointer"
              title="Đổi chiều sắp xếp theo giá Vàng"
            >
              <ArrowUpDown className="w-3 h-3 text-yellow-400" />
              <span>{sortOrder === 'asc' ? 'Giá: Thấp → Cao' : 'Giá: Cao → Thấp'}</span>
            </button>
          </div>
        </div>

        {/* 29 Accessories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-2.5">
          {filtered.map((acc) => {
            const isOwned = ownedSet.has(acc.id);
            const isInstalled = installedSet.has(acc.id);
            const isMythic = acc.tier === 'MYTHIC';
            const isSS = acc.tier === 'SS';
            const isS = acc.tier === 'S';
            const isA = acc.tier === 'A';

            return (
              <div
                key={acc.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isInstalled
                    ? 'bg-gradient-to-b from-cyan-950/70 to-slate-950 border-cyan-400 ring-1 ring-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : isMythic
                    ? 'bg-gradient-to-b from-red-950/40 via-purple-950/30 to-slate-950 border-red-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                    : isSS
                    ? 'bg-gradient-to-b from-rose-950/30 to-slate-950 border-rose-500/50'
                    : isOwned
                    ? 'bg-slate-900/85 border-slate-700 hover:border-slate-500'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">{acc.icon}</span>
                      <div>
                        <div
                          className="font-orbitron font-bold text-xs text-white leading-tight"
                          style={{ color: isMythic ? '#fb7185' : isSS ? '#f43f5e' : isS ? '#fbbf24' : undefined }}
                        >
                          {acc.vietnameseName}
                        </div>
                        <div className="text-[9px] text-slate-400 font-rajdhani">{acc.slotLabel}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-orbitron font-black px-1.5 py-0.2 rounded ${
                        isMythic
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow'
                          : isSS
                          ? 'bg-red-500/25 text-red-300 border border-red-400/50'
                          : isS
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                          : isA
                          ? 'bg-purple-500/25 text-purple-300 border border-purple-400/50'
                          : 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50'
                      }`}
                    >
                      BẬC {acc.tier}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-300 font-rajdhani line-clamp-2 leading-snug">
                    {acc.description}
                  </p>

                  {/* Stat Highlights Badges */}
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    {acc.damageBonusPercent > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-orbitron font-bold">
                        +{acc.damageBonusPercent}% ST
                      </span>
                    )}
                    {acc.fireRateBonusPercent > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-orbitron font-bold">
                        +{acc.fireRateBonusPercent}% TỐC
                      </span>
                    )}
                    {(acc.critRatePercent ?? 0) > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-[10px] font-orbitron font-bold">
                        +{acc.critRatePercent}% BẠO
                      </span>
                    )}
                    {(acc.armorPenPercent ?? 0) > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-orbitron font-bold">
                        +{acc.armorPenPercent}% XUYÊN
                      </span>
                    )}
                    {(acc.trueDamageBonus ?? 0) > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-orbitron font-bold">
                        +{acc.trueDamageBonus} CHUẨN
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  {isInstalled ? (
                    <button
                      onClick={() => handleToggle(acc)}
                      className="w-full py-1.5 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-orbitron font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      THÁO RA
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleToggle(acc)}
                      className="w-full py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-orbitron font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Wrench className="w-3 h-3" />
                      LẮP CHO CHIẾN CƠ NÀY
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(acc)}
                      className={`w-full py-1.5 px-2 rounded-lg font-orbitron font-bold text-[11px] transition-all cursor-pointer flex items-center justify-between ${
                        gold >= acc.costGold
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 text-yellow-300 hover:scale-[1.01]'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-rose-500/50'
                      }`}
                    >
                      <span>MUA VÀNG</span>
                      <span className="text-yellow-200 font-black tabular-nums">
                        🪙 {acc.costGold.toLocaleString()}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
