/**
 * Saved Loadouts Modal Component
 * Allows players to save, manage, rename, and quickly switch between
 * pre-configured Fighter + Pilot + Accessory loadout setups.
 */

import { useState } from 'react';
import {
X,
Zap,
Save,
Trash2,
Edit2,
Check,
Plus
} from 'lucide-react';
import {
SavedLoadout,
LOADOUT_ICONS,
saveOrUpdateLoadoutSlot,
deleteLoadoutSlot,
getLoadoutStatsSummary,
} from '../game/loadouts';
import { PILOTS,FighterStats } from '../game/rules';

interface SavedLoadoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loadouts: SavedLoadout[];
  onSaveLoadouts: (loadouts: SavedLoadout[]) => void;
  currentFighter: FighterStats;
  currentPilotId: string | null;
  currentAccessories: string[];
  activeLoadoutId: string | null;
  onApplyLoadout: (loadout: SavedLoadout) => void;
  ownedFighterIds: string[];
  ownedPilotIds: string[];
  ownedAccessoryIds: string[];
}

export function SavedLoadoutsModal({
  isOpen,
  onClose,
  loadouts,
  onSaveLoadouts,
  currentFighter,
  currentPilotId,
  currentAccessories,
  activeLoadoutId,
  onApplyLoadout,
  ownedFighterIds,
  ownedPilotIds,
  ownedAccessoryIds,
}: SavedLoadoutsModalProps) {
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editIcon, setEditIcon] = useState<string>('⚡');
  const [showIconPickerForId, setShowIconPickerForId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPilot = currentPilotId ? PILOTS[currentPilotId] : null;

  const handleStartRename = (loadout: SavedLoadout) => {
    setEditingSlotId(loadout.id);
    setEditName(loadout.name);
    setEditIcon(loadout.icon);
    setShowIconPickerForId(null);
  };

  const handleSaveRename = (slotId: string) => {
    const existing = loadouts.find((l) => l.id === slotId);
    if (!existing) return;
    const updated = saveOrUpdateLoadoutSlot(
      loadouts,
      slotId,
      editName,
      editIcon,
      existing.fighterId,
      existing.pilotId,
      existing.accessoryIds
    );
    onSaveLoadouts(updated);
    setEditingSlotId(null);
  };

  const handleOverwriteCurrentIntoSlot = (slotId: string) => {
    const existing = loadouts.find((l) => l.id === slotId);
    const updated = saveOrUpdateLoadoutSlot(
      loadouts,
      slotId,
      existing?.name || `Đội Hình ${slotId}`,
      existing?.icon || '⚡',
      currentFighter.id,
      currentPilotId,
      currentAccessories
    );
    onSaveLoadouts(updated);
  };

  const handleCreateNewSlotFromCurrent = () => {
    const newId = `loadout_${Date.now()}`;
    const newName = `Đội Hình ${loadouts.length + 1}`;
    const updated = saveOrUpdateLoadoutSlot(
      loadouts,
      newId,
      newName,
      '⚡',
      currentFighter.id,
      currentPilotId,
      currentAccessories
    );
    onSaveLoadouts(updated);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (loadouts.length <= 1) return;
    const updated = deleteLoadoutSlot(loadouts, slotId);
    onSaveLoadouts(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                  BỘ TRANG BỊ CỨU HỘ & ĐỘI HÌNH
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-orbitron font-bold text-cyan-300">
                  {loadouts.length}/10 SLOTS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-rajdhani">
                Lưu và chuyển đổi tức thì giữa các tổ hợp Chiến Cơ · Phi Công · Phụ Kiện tối ưu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition-all cursor-pointer touch-manipulation active:scale-95"
            aria-label="Đóng bảng trang bị"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Setup Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
            <span className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider shrink-0">
              ĐANG SỬ DỤNG:
            </span>

            {/* Fighter Chip */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 shrink-0 text-xs font-orbitron">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentFighter.color }} />
              <span className="text-white font-bold">{currentFighter.vietnameseName}</span>
              <span className="text-[9px] text-cyan-300 bg-cyan-950/80 px-1 rounded">BẬC {currentFighter.tier}</span>
            </div>

            {/* Pilot Chip */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-purple-500/40 shrink-0 text-xs font-orbitron">
              <span>{currentPilot ? currentPilot.avatarEmoji : '🧑‍✈️'}</span>
              <span className="text-purple-300">{currentPilot ? currentPilot.callsign : 'Chưa chọn'}</span>
            </div>

            {/* Accessories Count */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-teal-500/40 shrink-0 text-xs font-orbitron text-teal-300">
              <span>🔧</span>
              <span>{currentAccessories.length}/3 Phụ kiện</span>
            </div>
          </div>

          <button
            onClick={handleCreateNewSlotFromCurrent}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>LƯU THÀNH SLOT MỚI</span>
          </button>
        </div>

        {/* Saved Loadouts List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4">
          {loadouts.map((loadout) => {
            const isEditing = editingSlotId === loadout.id;
            const stats = getLoadoutStatsSummary(loadout.fighterId, loadout.pilotId, loadout.accessoryIds);
            const isActive = activeLoadoutId === loadout.id || (
              currentFighter.id === loadout.fighterId &&
              currentPilotId === loadout.pilotId &&
              JSON.stringify(currentAccessories.sort()) === JSON.stringify([...loadout.accessoryIds].sort())
            );

            const fighterOwned = ownedFighterIds.includes(loadout.fighterId);
            const pilotOwned = !loadout.pilotId || ownedPilotIds.includes(loadout.pilotId);
            const missingAccsCount = loadout.accessoryIds.filter((id) => !ownedAccessoryIds.includes(id)).length;

            return (
              <div
                key={loadout.id}
                className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col gap-3 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Active Neon Accent Tag */}
                {isActive && (
                  <div className="absolute top-0 right-0 px-3 py-0.5 rounded-bl-xl bg-cyan-400 text-slate-950 font-orbitron font-black text-[9px] tracking-wider shadow">
                    ĐANG KÍCH HOẠT
                  </div>
                )}

                {/* Slot Top Header: Icon + Name / Edit + Overwrite + Delete */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Icon Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowIconPickerForId(showIconPickerForId === loadout.id ? null : loadout.id)}
                        className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-400 text-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                        title="Đổi biểu tượng"
                      >
                        {isEditing ? editIcon : loadout.icon}
                      </button>

                      {/* Icon Picker Popover */}
                      {showIconPickerForId === loadout.id && (
                        <div className="absolute top-10 left-0 z-50 p-2 rounded-xl bg-slate-900 border border-cyan-500/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] grid grid-cols-5 gap-1 w-44">
                          {LOADOUT_ICONS.map((ic) => (
                            <button
                              key={ic}
                              onClick={() => {
                                if (isEditing) {
                                  setEditIcon(ic);
                                } else {
                                  const updated = saveOrUpdateLoadoutSlot(
                                    loadouts,
                                    loadout.id,
                                    loadout.name,
                                    ic,
                                    loadout.fighterId,
                                    loadout.pilotId,
                                    loadout.accessoryIds
                                  );
                                  onSaveLoadouts(updated);
                                }
                                setShowIconPickerForId(null);
                              }}
                              className="w-7 h-7 rounded hover:bg-slate-800 flex items-center justify-center text-base transition-colors cursor-pointer"
                            >
                              {ic}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Name or Edit Input */}
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          maxLength={25}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-cyan-400 text-white font-orbitron font-bold text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-300 w-44 sm:w-56"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(loadout.id);
                            if (e.key === 'Escape') setEditingSlotId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(loadout.id)}
                          className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/50 cursor-pointer"
                          title="Lưu tên"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingSlotId(null)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-black text-sm sm:text-base text-white tracking-wide">
                          {loadout.name}
                        </span>
                        <button
                          onClick={() => handleStartRename(loadout)}
                          className="text-slate-500 hover:text-cyan-300 p-1 transition-colors cursor-pointer"
                          title="Đổi tên slot"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Overwrite & Delete Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOverwriteCurrentIntoSlot(loadout.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/70 text-slate-300 hover:text-amber-300 text-[10px] font-orbitron transition-all cursor-pointer active:scale-95"
                      title="Ghi đè trang bị đang dùng vào slot này"
                    >
                      <Save className="w-3 h-3" />
                      <span>GHI ĐÈ</span>
                    </button>

                    {loadouts.length > 1 && (
                      <button
                        onClick={() => handleDeleteSlot(loadout.id)}
                        className="p-1 rounded-lg bg-slate-950 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500/70 text-slate-500 hover:text-rose-400 text-xs transition-all cursor-pointer active:scale-95"
                        title="Xóa slot trang bị này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Assets Overview Row: Fighter, Pilot, Accessories */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-orbitron">
                  {/* Fighter Asset */}
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] text-slate-950 shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${stats.fighter.color}, #ffffff)`,
                        }}
                      >
                        {stats.fighter.tier}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-rajdhani uppercase">Chiến cơ</div>
                        <div className="text-white font-bold truncate text-[11px]">{stats.fighter.vietnameseName}</div>
                      </div>
                    </div>
                    {!fighterOwned && (
                      <span className="text-[9px] text-rose-400 bg-rose-950/80 border border-rose-500/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                        Chưa sở hữu
                      </span>
                    )}
                  </div>

                  {/* Pilot Asset */}
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{stats.pilot ? stats.pilot.avatarEmoji : '🧑‍✈️'}</span>
                      <div className="min-w-0">
                        <div className="text-[9px] text-slate-400 font-rajdhani uppercase">Phi công</div>
                        <div className="text-purple-300 font-bold truncate text-[11px]">
                          {stats.pilot ? stats.pilot.callsign : 'Chưa phân công'}
                        </div>
                      </div>
                    </div>
                    {loadout.pilotId && !pilotOwned && (
                      <span className="text-[9px] text-rose-400 bg-rose-950/80 border border-rose-500/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                        Chưa sở hữu
                      </span>
                    )}
                  </div>

                  {/* Accessories Installed */}
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-center">
                    <div className="text-[9px] text-slate-400 font-rajdhani uppercase mb-1">
                      Phụ kiện vũ khí ({stats.accessories.length}/3)
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {stats.accessories.length === 0 ? (
                        <span className="text-[10px] text-slate-500 font-rajdhani italic">Trống</span>
                      ) : (
                        stats.accessories.map((acc) => (
                          <span
                            key={acc.id}
                            className="px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-500/40 text-[9px] text-teal-300 font-semibold truncate max-w-[90px]"
                            title={acc.name}
                          >
                            {acc.name}
                          </span>
                        ))
                      )}
                      {missingAccsCount > 0 && (
                        <span className="text-[8px] text-amber-400 font-bold shrink-0">
                          (Thiếu {missingAccsCount})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aggregated Combat Specs Pills */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[10px] font-orbitron">
                  <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 font-rajdhani">MÁU</span>
                    <span className="text-emerald-400 font-bold">{stats.totalHp}</span>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 font-rajdhani">GIÁP</span>
                    <span className="text-cyan-400 font-bold">{stats.totalArmor}</span>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 font-rajdhani">SÁT THƯƠNG</span>
                    <span className="text-rose-400 font-bold">x{stats.totalDamageMultiplier}</span>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 font-rajdhani">BẠO KÍCH</span>
                    <span className="text-amber-400 font-bold">{stats.totalCritRate}%</span>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 font-rajdhani">TỐC BẮN</span>
                    <span className="text-yellow-300 font-bold">{stats.totalFireRate}/s</span>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
                    <span className="text-[9px] text-slate-400 font-rajdhani">NÉ TRÁNH</span>
                    <span className="text-sky-300 font-bold">{stats.totalDodge}%</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => {
                      onApplyLoadout(loadout);
                      onClose();
                    }}
                    className={`w-full sm:w-auto px-5 py-2 rounded-xl font-orbitron font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-slate-800/90 border border-cyan-400/70 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    <Zap className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-950 stroke-[3]'}`} />
                    <span>{isActive ? 'ĐANG SỬ DỤNG' : 'KÍCH HOẠT ĐỘI HÌNH'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-rajdhani">
          <span>💡 <em>Mẹo: Bạn có thể chuyển nhanh giữa các bộ trang bị ngay tại Sảnh chính chỉ bằng 1 chạm!</em></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-orbitron font-semibold text-xs border border-slate-700 cursor-pointer"
          >
            ĐÓNG
          </button>
        </div>

      </div>
    </div>
  );
}
