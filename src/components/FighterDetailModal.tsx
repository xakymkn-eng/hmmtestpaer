/**
 * Fighter Detail Dossier Modal (Thông Tin Chi Tiết Chiến Cơ)
 * Deep technical specifications, historical lore, weapons schematics,
 * stat matrices, and combat tactical advice.
 */

import React,{ useState } from 'react';
import {
X,
Star,
Shield,
Zap,
Gauge,
Crosshair,
Award,
BookOpen,
Check,
Flame,
Sparkles,
Info,ChevronRight
} from 'lucide-react';
import { FighterStats,COSMETIC_SKINS,isSkinUnlocked } from '../game/rules';
import { getFighterDossier } from '../game/fighterDetails';
import { sound } from '../game/audio';
import { FighterShowcaseCanvas } from './FighterShowcaseCanvas';

interface FighterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fighter: FighterStats | null;
  fighterStars?: Record<string, number>;
  fighterShards?: Record<string, number>;
  onSelectFighter?: (id: string) => void;
  onOpenUpgrade?: (id: string) => void;
  isOwned?: boolean;
  unlockedSkinIds?: string[];
  activeSkinId?: string | null;
  onToggleSkin?: (skinId: string) => void;
}

export const FighterDetailModal: React.FC<FighterDetailModalProps> = ({
  isOpen,
  onClose,
  fighter,
  fighterStars = {},
  fighterShards = {},
  onSelectFighter,
  onOpenUpgrade,
  isOwned = false,
  unlockedSkinIds = [],
  activeSkinId = null,
  onToggleSkin,
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'skins' | 'lore'>('specs');
  const [previewSkinId, setPreviewSkinId] = useState<string | null>(null);

  // Sync preview skin when modal opens or activeSkinId changes
  React.useEffect(() => {
    setPreviewSkinId(activeSkinId);
  }, [isOpen, activeSkinId]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !fighter) return null;

  const dossier = getFighterDossier(fighter.id);
  const currentStar = fighterStars[fighter.id] || 1;
  const currentShards = fighterShards[fighter.id] || 0;
  const isAstraea = fighter.id === 'astraea';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#0a1220] via-[#050b14] to-[#040810] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col p-4 sm:p-6">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg border"
              style={{
                backgroundColor: `${fighter.color}25`,
                borderColor: fighter.color,
                color: fighter.color,
              }}
            >
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-white">
                  {fighter.vietnameseName}
                </h2>

                <span
                  className={`text-[9px] font-orbitron font-black px-2 py-0.5 rounded uppercase ${
                    fighter.tier === 'S'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-400'
                      : fighter.tier === 'A'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-400'
                      : 'bg-cyan-500/25 text-cyan-300 border border-cyan-400'
                  }`}
                >
                  BẬC {fighter.tier}
                </span>

                {isAstraea && (
                  <span className="text-[9px] font-orbitron font-black px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse">
                    LIMITED · GIỚI HẠN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-rajdhani">
                <span>{fighter.name}</span>
                <span>•</span>
                <span className="text-amber-400 flex items-center gap-0.5 font-orbitron">
                  {Array.from({ length: currentStar }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-[11px] font-bold">★{currentStar}</span>
                </span>
                {isOwned && (
                  <>
                    <span>•</span>
                    <span className="text-amber-300 font-orbitron text-[11px]">🧩 {currentShards} Mảnh</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => {
              setActiveTab('specs');
              sound.playClick();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>THÔNG SỐ</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('skins');
              sound.playClick();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'skins'
                ? 'bg-amber-500/25 border border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>TRANG PHỤC</span>
            {fighter.id === 'arc_tempest' && (
              <span className="text-[9px] bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                ✨ 2 HUYỀN THOẠI
              </span>
            )}
            {fighter.id === 'rts_88' && (
              <span className="text-[9px] bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,51,0.6)]">
                ✨ HUYỀN THOẠI
              </span>
            )}
            {fighter.id === 'astraea' && (
              <span className="text-[9px] bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.6)]">
                🌸 EPIC
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('lore');
              sound.playClick();
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-orbitron font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'lore'
                ? 'bg-purple-500/20 border border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>TIỂU SỬ & MẸO</span>
          </button>
        </div>

        {/* Tab 1: Specs & Weapons */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            {/* Primary Weapon Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 shadow-inner">
              <div className="flex items-center justify-between text-xs font-orbitron font-bold text-cyan-300 mb-1">
                <span className="flex items-center gap-1.5 uppercase">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  HỆ THỐNG VŨ KHÍ CHÍNH: {dossier.mainWeaponName}
                </span>
                <span className="text-[10px] text-slate-400">Tốc độ xả: {fighter.fireRate} viên/giây</span>
              </div>
              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
                {dossier.mainWeaponDetails || fighter.bulletMechanic}
              </p>
            </div>

            {/* Ultimate Skill Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-900/80 border border-purple-500/40">
              <div className="flex items-center justify-between text-xs font-orbitron font-bold text-purple-300 mb-1">
                <span className="flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  TUYỆT KỸ ĐẶC BIỆT: {fighter.skillName}
                </span>
                <span className="text-[10px] text-amber-300 font-bold">
                  Hồi chiêu: {fighter.skillCooldown}s
                </span>
              </div>
              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
                {dossier.skillMechanism || fighter.skillDescription}
              </p>
            </div>

            {/* Technical Stat Matrix Grid */}
            <div>
              <div className="text-xs font-orbitron font-bold text-slate-400 mb-2 uppercase tracking-wider">
                BẢNG THÔNG SỐ TÁC CHIẾN CƠ BẢN
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Máu */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> MÁU (HP)
                    </span>
                  </div>
                  <div className="text-base font-orbitron font-bold text-emerald-400 tabular-nums">
                    {fighter.maxHp}
                  </div>
                </div>

                {/* Giáp */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-cyan-400" /> GIÁP TỐI ĐA
                    </span>
                  </div>
                  <div className="text-base font-orbitron font-bold text-cyan-400 tabular-nums">
                    {fighter.maxArmor}
                  </div>
                </div>

                {/* Sát thương đạn */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-rose-400" /> SÁT THƯƠNG
                    </span>
                  </div>
                  <div className="text-base font-orbitron font-bold text-rose-400 tabular-nums">
                    {fighter.bulletDamage}
                  </div>
                </div>

                {/* Sát thương chuẩn */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> ST CHUẨN
                    </span>
                  </div>
                  <div className="text-base font-orbitron font-bold text-amber-400 tabular-nums">
                    +{fighter.trueDamage}
                  </div>
                </div>

                {/* Tốc độ bay */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-sky-400" /> VẬN TỐC BAY
                    </span>
                  </div>
                  <div className="text-base font-orbitron font-bold text-sky-400 tabular-nums">
                    {fighter.speed} px/s
                  </div>
                </div>

                {/* Phòng thủ */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-purple-400" /> PHÒNG THỦ
                    </span>
                  </div>
                  <div className="text-base font-orbitron font-bold text-purple-400 tabular-nums">
                    {fighter.defense} pts
                  </div>
                </div>

                {/* Bạo kích */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400" /> BẠO KÍCH
                    </span>
                  </div>
                  <div className="text-base font-orbitron font-bold text-yellow-400 tabular-nums">
                    {fighter.critRate}% <span className="text-[10px] font-normal text-slate-400">(x{(fighter.critDamage / 100).toFixed(1)})</span>
                  </div>
                </div>

                {/* Né tránh */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-orbitron text-slate-400 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-teal-400" /> NÉ TRÁNH
                    </span>
                  </div>
                  <div className="text-base font-orbitron font-bold text-teal-400 tabular-nums">
                    {fighter.dodgeChance}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Skins & Cosmetic Wardrobe */}
        {activeTab === 'skins' && (
          <div className="space-y-4">
            {/* Live Interactive Skin Showcase Preview */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-900/90 border border-amber-500/30 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12)_0%,transparent_70%)] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <FighterShowcaseCanvas
                  fighter={fighter}
                  width={260}
                  height={160}
                  starCount={currentStar}
                  activeSkinId={previewSkinId}
                />

                <div className="mt-2 text-center">
                  <div className="text-xs font-orbitron font-bold text-amber-300 flex items-center justify-center gap-1.5">
                    <span>👑</span>
                    <span>
                      {previewSkinId && COSMETIC_SKINS[previewSkinId]
                        ? COSMETIC_SKINS[previewSkinId].vietnameseName
                        : `Chiến Cơ ${fighter.vietnameseName} (Nguyên Bản)`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-rajdhani mt-0.5">
                    {previewSkinId === activeSkinId
                      ? '⭐ Đang áp dụng khi xuất chiến'
                      : '👀 Xem trước hiệu ứng ngoại hình'}
                  </div>
                </div>
              </div>
            </div>

            {/* Skins List */}
            {fighter.id === 'arc_tempest' ? (
              <div className="space-y-3">
                {/* 1. LX-88 Crimson Vampire Lord Exclusive Skin */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                    activeSkinId === 'skin_lx88_vampire'
                      ? 'bg-gradient-to-r from-rose-950/50 via-red-950/40 to-slate-950/90 border-rose-500 shadow-[0_0_24px_rgba(225,29,72,0.35)]'
                      : 'bg-slate-950/85 border-rose-900/50 hover:border-rose-500/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-rose-500/25">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500 text-lg flex items-center justify-center shadow">
                        🧛
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-orbitron font-black text-rose-300">
                            LX-88 Huyết Dạ Ma Cà Rồng
                          </h4>
                          <span className="text-[9px] font-orbitron font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-950/80 via-rose-900/80 to-red-950/80 border border-amber-400 text-amber-300 uppercase shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse">
                            ✨ HUYỀN THOẠI · MA CÀ RỒNG HUYẾT DẠ
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold font-orbitron flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" /> BẬC HUYỀN THOẠI TỐI THƯỢNG
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewSkinId('skin_lx88_vampire');
                          sound.playClick();
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-orbitron font-bold border transition-all cursor-pointer ${
                          previewSkinId === 'skin_lx88_vampire'
                            ? 'bg-rose-500/30 border-rose-400 text-rose-200'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        XEM THỬ
                      </button>

                      {onToggleSkin && (
                        <button
                          type="button"
                          onClick={() => {
                            onToggleSkin('skin_lx88_vampire');
                            setPreviewSkinId(
                              activeSkinId === 'skin_lx88_vampire' ? null : 'skin_lx88_vampire'
                            );
                            sound.playClick();
                          }}
                          className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow ${
                            activeSkinId === 'skin_lx88_vampire'
                              ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/35'
                              : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(225,29,72,0.5)]'
                          }`}
                        >
                          {activeSkinId === 'skin_lx88_vampire' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>ĐANG TRANG BỊ</span>
                            </>
                          ) : (
                            <>
                              <span>🦇</span>
                              <span>TRANG BỊ SKIN MA CÀ RỒNG</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-rose-100/90 font-rajdhani leading-relaxed mb-2.5">
                    Trang phục HUYỀN THOẠI Ma Cà Rồng tối thượng cho LX-88. Thân phi cơ tạo hình cánh dơi Gothic hắc thạch viền huyết ngọc, buồng lái Mắt Quỷ Đỏ Thẫm đập nhịp tim ma cà rồng, 4 luồng Thủy Đỏ ma thuật bay zick zack uốn lượn liên tục quanh thân máy bay. Khai hỏa chùm Laser Huyết Tinh rền vang tiếng rít ma cà rồng ghê rợn, bầy dơi đêm chao lượn và hiệu ứng Hút Máu Huyết Nguyệt tối thượng.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-rajdhani">
                    <div className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200">
                      🩸 4 Luồng Thủy Đỏ Bay Zick Zack
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200">
                      🧛 Âm Thanh Ma Cà Rồng & Hút Máu
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200">
                      🦇 Bầy Dơi Đêm & Tim Quỷ Đập
                    </div>
                    <div className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200">
                      ⚡ Laser Huyết Tinh Xuyên Phá
                    </div>
                  </div>
                </div>

                {/* 2. LX-88 Royal Sovereign Gold 24K Exclusive Skin */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                    activeSkinId === 'skin_lx88_royal_gold'
                      ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-950/80 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-950/80 border-amber-500/40 hover:border-amber-400/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 text-lg flex items-center justify-center shadow">
                        👑
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-orbitron font-black text-amber-300">
                            LX-88 Hoàng Kim Đế Vương
                          </h4>
                          <span className="text-[9px] font-orbitron font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-950/80 via-yellow-900/80 to-amber-950/80 border border-amber-400 text-amber-300 uppercase shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse">
                            ✨ HUYỀN THOẠI · HOÀNG GIA ĐẾ VƯƠNG
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold font-orbitron flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" /> BẬC HUYỀN THOẠI TỐI THƯỢNG
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewSkinId('skin_lx88_royal_gold');
                          sound.playClick();
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-orbitron font-bold border transition-all cursor-pointer ${
                          previewSkinId === 'skin_lx88_royal_gold'
                            ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        XEM THỬ
                      </button>

                      {onToggleSkin && (
                        <button
                          type="button"
                          onClick={() => {
                            onToggleSkin('skin_lx88_royal_gold');
                            setPreviewSkinId(
                              activeSkinId === 'skin_lx88_royal_gold' ? null : 'skin_lx88_royal_gold'
                            );
                            sound.playClick();
                          }}
                          className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow ${
                            activeSkinId === 'skin_lx88_royal_gold'
                              ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/35'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          }`}
                        >
                          {activeSkinId === 'skin_lx88_royal_gold' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>ĐANG TRANG BỊ</span>
                            </>
                          ) : (
                            <>
                              <span>👑</span>
                              <span>TRANG BỊ SKIN HOÀNG GIA</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-rajdhani leading-relaxed mb-2.5">
                    Trang phục HUYỀN THOẠI mạ vàng hoàng gia 24K siêu đỉnh cho LX-88. Thân phi cơ đúc bằng hợp kim hoàng kim nguyên khối nạm đá quý hoàng tộc, có các viên kim cương và đá quý đa sắc bay xoay tròn lơ lửng quanh máy bay phát sáng lấp lánh. Khai hỏa chùm Thánh Quang Đế Vương ngân vang chuông thánh quang rực rỡ kèm bão bụi vàng kim cương lộng lẫy.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-rajdhani">
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20 text-amber-200">
                      💎 Kim Cương & Đá Quý Bay Quanh
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20 text-amber-200">
                      👑 Mạ Vàng 24K & Vương Miện
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20 text-amber-200">
                      🔔 Âm Thanh Thánh Chuông Đế Vương
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20 text-amber-200">
                      ✨ Thánh Quang Hoàng Kim Quét Sạch
                    </div>
                  </div>
                </div>

                {/* 3. Original Stealth Cyber Arc Skin */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    activeSkinId !== 'skin_lx88_royal_gold' && activeSkinId !== 'skin_lx88_vampire'
                      ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 text-base flex items-center justify-center">
                        ⚡
                      </div>
                      <div>
                        <h4 className="text-sm font-orbitron font-bold text-cyan-300">
                          Nguyên Bản Titan Arc (Default)
                        </h4>
                        <span className="text-[10px] text-slate-400 font-rajdhani">
                          Thiết kế khí động học tàng hình chuẩn quân đội
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewSkinId(null);
                          sound.playClick();
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-orbitron font-bold border transition-all cursor-pointer ${
                          previewSkinId === null
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        XEM THỬ
                      </button>

                      {onToggleSkin && (
                        <button
                          type="button"
                          onClick={() => {
                            if (activeSkinId === 'skin_lx88_royal_gold' || activeSkinId === 'skin_lx88_vampire') {
                              onToggleSkin(activeSkinId);
                            }
                            setPreviewSkinId(null);
                            sound.playClick();
                          }}
                          className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all cursor-pointer ${
                            activeSkinId !== 'skin_lx88_royal_gold' && activeSkinId !== 'skin_lx88_vampire'
                              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                              : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {activeSkinId !== 'skin_lx88_royal_gold' && activeSkinId !== 'skin_lx88_vampire'
                            ? '✅ ĐANG DÙNG'
                            : 'DÙNG BẢN GỐC'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (() => {
              // Collect all skins applicable to this fighter (dedicated themed skins + unlocked universal streak skins)
              const matchingSkins = Object.values(COSMETIC_SKINS).filter(
                (s) => s.targetFighterId === fighter.id || (!s.targetFighterId && isSkinUnlocked(s.id, unlockedSkinIds))
              );

              if (matchingSkins.length > 0) {
                return (
                  <div className="space-y-3">
                    {matchingSkins.map((themedSkin) => {
                      const isEquipped = activeSkinId === themedSkin.id;
                      return (
                        <div
                          key={themedSkin.id}
                          className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                            isEquipped
                              ? 'bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950/80 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                              : 'bg-slate-950/80 border-slate-700 hover:border-purple-400/70'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-9 h-9 rounded-xl border text-lg flex items-center justify-center shadow"
                                style={{
                                  backgroundColor: `${themedSkin.primaryColor}25`,
                                  borderColor: themedSkin.primaryColor,
                                }}
                              >
                                {themedSkin.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4
                                    className="text-sm font-orbitron font-black"
                                    style={{ color: themedSkin.primaryColor }}
                                  >
                                    {themedSkin.vietnameseName}
                                  </h4>
                                  <span
                                    className={`text-[9px] font-orbitron font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                      themedSkin.rarity === 'HUYỀN THOẠI'
                                        ? 'bg-gradient-to-r from-red-950/80 via-amber-950/70 to-rose-950/80 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse'
                                        : ''
                                    }`}
                                    style={
                                      themedSkin.rarity !== 'HUYỀN THOẠI'
                                        ? {
                                            backgroundColor: `${themedSkin.primaryColor}25`,
                                            borderColor: themedSkin.primaryColor,
                                            color: themedSkin.secondaryColor,
                                          }
                                        : undefined
                                    }
                                  >
                                    {themedSkin.rarity === 'HUYỀN THOẠI' ? `✨ ${themedSkin.tag}` : themedSkin.tag}
                                  </span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-bold font-orbitron flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-400" /> ĐÃ MỞ KHÓA
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewSkinId(themedSkin.id);
                                  sound.playClick();
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-orbitron font-bold border transition-all cursor-pointer ${
                                  previewSkinId === themedSkin.id
                                    ? 'bg-purple-500/25 border-purple-400 text-purple-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                                }`}
                              >
                                XEM THỬ
                              </button>

                              {onToggleSkin && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleSkin(themedSkin.id);
                                    setPreviewSkinId(isEquipped ? null : themedSkin.id);
                                    sound.playClick();
                                  }}
                                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-orbitron font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow ${
                                    isEquipped
                                      ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/35'
                                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                                  }`}
                                >
                                  {isEquipped ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                                      <span>ĐANG TRANG BỊ</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>{themedSkin.icon}</span>
                                      <span>TRANG BỊ SKIN</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
                            {themedSkin.description}
                          </p>
                        </div>
                      );
                    })}

                    {/* Default Skin Card */}
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        !activeSkinId
                          ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🚀</span>
                        <div>
                          <div className="text-xs font-orbitron font-bold text-cyan-300">
                            {fighter.vietnameseName} (Nguyên Bản)
                          </div>
                          <div className="text-[10px] text-slate-400 font-rajdhani">
                            Màu sắc vỏ bọc chiến đấu tiêu chuẩn
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewSkinId(null);
                            sound.playClick();
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-orbitron font-bold border transition-all cursor-pointer ${
                            previewSkinId === null
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          XEM THỬ
                        </button>

                        {onToggleSkin && (
                          <button
                            type="button"
                            onClick={() => {
                              if (activeSkinId) onToggleSkin(activeSkinId);
                              setPreviewSkinId(null);
                              sound.playClick();
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all cursor-pointer ${
                              !activeSkinId
                                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                                : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            {!activeSkinId ? '✅ ĐANG DÙNG' : 'DÙNG BẢN GỐC'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard Fallback for Fighters without dedicated themed skin
              return (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🚀</span>
                      <div>
                        <div className="text-xs font-orbitron font-bold text-cyan-300">
                          {fighter.vietnameseName} (Nguyên Bản)
                        </div>
                        <div className="text-[10px] text-slate-400 font-rajdhani">
                          Màu sắc vỏ bọc chiến đấu tiêu chuẩn
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-orbitron font-bold text-emerald-400">
                      ✅ ĐANG SỬ DỤNG
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/30 to-amber-950/20 border border-purple-500/30 text-xs">
                    <div className="font-orbitron font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>TRANG PHỤC TOÀN HẠM ĐỘI (CHUỖI 7 NGÀY)</span>
                    </div>
                    <p className="text-slate-300 font-rajdhani text-[11px] leading-relaxed mb-2">
                      Tham gia Điểm Danh Hàng Ngày liên tục 7 ngày để mở khóa các trang phục Quang Phổ Toàn Hạm Đội như Hoàng Kim Đế Vương, Tinh Vân Huyền Ảo và Hắc Long Hư Không!
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] font-orbitron text-amber-300">
                      <span>👑 Hoàng Kim Đế Vương</span>
                      <span>•</span>
                      <span>🌌 Tinh Vân Huyền Ảo</span>
                      <span>•</span>
                      <span>🐉 Hắc Long Hư Không</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 3: Lore & Tactical Advice */}
        {activeTab === 'lore' && (
          <div className="space-y-3.5">
            {/* Manufacturing & Origin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-rajdhani">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 font-orbitron text-[10px] uppercase block mb-1">
                  Đơn Vị Chế Tạo:
                </span>
                <span className="font-bold text-cyan-300">{dossier.manufacturer}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 font-orbitron text-[10px] uppercase block mb-1">
                  Khu Vực Xuất Sứ:
                </span>
                <span className="font-bold text-purple-300">{dossier.originRealm}</span>
              </div>
            </div>

            {/* Lore Narrative */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-orbitron font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                <span>HỒ SƠ LỊCH SỬ & CÂU CHUYỆN KHỞI NGUYÊN</span>
              </div>
              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
                {dossier.lore}
              </p>
            </div>

            {/* Tactical Strengths & Playstyle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-xs font-orbitron font-bold text-emerald-300 mb-1">
                  ⚡ ƯU THẾ CHIẾN THUẬT:
                </div>
                <p className="text-slate-300 font-rajdhani leading-relaxed text-[11px]">
                  {dossier.tacticalAdvantage}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-xs font-orbitron font-bold text-sky-300 mb-1">
                  🎯 LỜI KHUYÊN ĐIỀU KHIỂN:
                </div>
                <p className="text-slate-300 font-rajdhani leading-relaxed text-[11px]">
                  {dossier.recommendedPlaystyle}
                </p>
              </div>
            </div>

            {/* Counterplay Tip */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
              <div className="font-orbitron font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <span>💡</span>
                <span>MẸO TÁC CHIẾN DIỆT TRÙM:</span>
              </div>
              <p className="text-amber-200/90 font-rajdhani text-[11px] leading-relaxed">
                {dossier.counterplayTip}
              </p>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-400 font-rajdhani">
            {isOwned ? (
              <span className="text-emerald-400 font-orbitron font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> ĐÃ SỞ HỮU TRONG HẠM ĐỘI
              </span>
            ) : (
              <span className="text-amber-400 font-orbitron">
                *Chưa sở hữu. Hãy triệu hồi tại Cổng Gacha!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isOwned && onOpenUpgrade && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgrade(fighter.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-400/60 hover:border-amber-300 text-amber-300 font-orbitron font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>NÂNG SAO (★{currentStar})</span>
              </button>
            )}

            {isOwned && onSelectFighter && (
              <button
                onClick={() => {
                  onSelectFighter(fighter.id);
                  sound.playClick();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                <span>CHỌN XUẤT KÍCH</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
