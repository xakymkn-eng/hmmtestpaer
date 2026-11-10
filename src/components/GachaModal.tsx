/**
 * Gacha Summoning Chamber Component (Chiến Cơ & Tay Lái)
 * Dual-tab summon gates for unlocking Fighters and Pilots.
 * Cinematic hyperspace warp animation, interactive 3D holographic card reveal,
 * Tier S celebratory jackpot fanfare, 10-day Astraea Limited Banner Countdown & Expiration,
 * and comprehensive Rate Details & Mechanics Modal.
 */

import React,{ useState,useEffect } from 'react';
import {
Sparkles,
X,Award,
AlertCircle,
RefreshCw,
User,
Plane,Plus,
CreditCard,
Eye,ChevronRight,
Crown,
HelpCircle,
Clock,
Info,
Radio
} from 'lucide-react';
import {
FighterStats,
FIGHTERS,
PILOTS,
Pilot,
GACHA_SINGLE_COST,
GACHA_TEN_COST,
GachaItem,
PilotGachaItem,
getAstraeaBannerStatus,
ASTRAEA_LIMITED_BANNER_DURATION_DAYS,
} from '../game/rules';
import { sound } from '../game/audio';

export type GachaBannerTab = 'fighters' | 'pilots';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  gems: number;
  pityS: number;
  pityA: number;
  pilotPityS: number;
  pilotPityA: number;
  ownedFighterIds: string[];
  ownedPilotIds: string[];
  initialTab?: GachaBannerTab;
  onPullFighters: (count: 1 | 10, isAstraeaActive?: boolean) => GachaItem[];
  onPullPilots: (count: 1 | 10) => PilotGachaItem[];
  onSelectFighter: (id: string) => void;
  onEquipPilot: (id: string) => void;
  equippedPilotId: string | null;
  onOpenRecharge?: () => void;
  onInspectFighter?: (fighter: FighterStats) => void;
  astraeaBannerStartTime?: number;
  onOpenDroneGacha?: () => void;
}

export const GachaModal: React.FC<GachaModalProps> = ({
  isOpen,
  onClose,
  gems,
  pityS,
  pityA,
  pilotPityS,
  pilotPityA,
  ownedFighterIds,
  ownedPilotIds,
  initialTab = 'fighters',
  onPullFighters,
  onPullPilots,
  onSelectFighter,
  onEquipPilot,
  equippedPilotId,
  onOpenRecharge,
  onInspectFighter,
  astraeaBannerStartTime,
  onOpenDroneGacha,
}) => {
  const [activeTab, setActiveTab] = useState<GachaBannerTab>(initialTab);
  const [isSummoning, setIsSummoning] = useState<boolean>(false);
  const [fighterResults, setFighterResults] = useState<GachaItem[] | null>(null);
  const [pilotResults, setPilotResults] = useState<PilotGachaItem[] | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [selectedPilotDetail, setSelectedPilotDetail] = useState<Pilot | null>(null);
  const [insufficientPrompt, setInsufficientPrompt] = useState<{ needed: number } | null>(null);
  const [showRatesModal, setShowRatesModal] = useState<boolean>(false);
  const [celebrationItem, setCelebrationItem] = useState<{
    type: 'fighter' | 'pilot';
    tier: string;
    id: string;
    name: string;
    vietnameseName: string;
    avatar?: string;
    accentColor?: string;
    isLimited?: boolean;
  } | null>(null);

  // 10-day Astraea Limited Banner Countdown state
  const bannerStartTime = astraeaBannerStartTime || Date.now();
  const [bannerStatus, setBannerStatus] = useState(() => getAstraeaBannerStatus(bannerStartTime));

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBannerStatus(getAstraeaBannerStatus(bannerStartTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, bannerStartTime]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setFighterResults(null);
      setPilotResults(null);
      setRevealedIndices(new Set());
      setInsufficientPrompt(null);
      setCelebrationItem(null);
      setShowRatesModal(false);
    }
  }, [isOpen, initialTab]);

  const handleClose = () => {
    setFighterResults(null);
    setPilotResults(null);
    setShowRatesModal(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showRatesModal) {
          setShowRatesModal(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showRatesModal, onClose]);

  if (!isOpen) return null;

  const handleExecutePull = (count: 1 | 10) => {
    const cost = count === 10 ? GACHA_TEN_COST : GACHA_SINGLE_COST;
    if (gems < cost) {
      setInsufficientPrompt({ needed: cost - gems });
      return;
    }

    setInsufficientPrompt(null);
    setIsSummoning(true);
    setFighterResults(null);
    setPilotResults(null);
    setRevealedIndices(new Set());
    setCelebrationItem(null);
    setSelectedPilotDetail(null);
    sound.playGachaWarp();

    setTimeout(() => {
      if (activeTab === 'fighters') {
        const results = onPullFighters(count, bannerStatus.isActive);
        setFighterResults(results);
        setIsSummoning(false);
        if (count === 1) {
          setRevealedIndices(new Set([0]));
          if (results[0].tier === 'S') {
            sound.playGachaReveal('S');
            setCelebrationItem({
              type: 'fighter',
              tier: 'S',
              id: results[0].fighterId,
              name: results[0].name,
              vietnameseName: results[0].vietnameseName,
              accentColor: FIGHTERS[results[0].fighterId]?.accentColor || '#fbbf24',
              isLimited: results[0].fighterId === 'astraea',
            });
          } else {
            sound.playGachaReveal(results[0].tier as 'S' | 'A' | 'B');
          }
        }
      } else {
        const results = onPullPilots(count);
        setPilotResults(results);
        setIsSummoning(false);
        if (count === 1) {
          setRevealedIndices(new Set([0]));
          if (results[0].tier === 'S') {
            sound.playGachaReveal('S');
            setCelebrationItem({
              type: 'pilot',
              tier: 'S',
              id: results[0].pilotId,
              name: results[0].name,
              vietnameseName: results[0].callsign,
              avatar: results[0].avatarEmoji,
            });
          } else {
            sound.playGachaReveal(results[0].tier as 'S' | 'A' | 'B');
          }
        }
      }
    }, 1400);
  };

  const handleRevealCard = (idx: number, item: GachaItem | PilotGachaItem, type: 'fighter' | 'pilot') => {
    if (revealedIndices.has(idx)) return;
    const next = new Set(revealedIndices);
    next.add(idx);
    setRevealedIndices(next);
    sound.playHit(true);

    if (item.tier === 'S') {
      sound.playGachaReveal('S');
      const fighterId = 'fighterId' in item ? item.fighterId : item.pilotId;
      setCelebrationItem({
        type,
        tier: 'S',
        id: fighterId,
        name: item.name,
        vietnameseName: 'callsign' in item ? item.callsign : item.vietnameseName,
        avatar: 'avatarEmoji' in item ? item.avatarEmoji : undefined,
        accentColor: 'fighterId' in item ? FIGHTERS[item.fighterId]?.accentColor : undefined,
        isLimited: 'fighterId' in item && item.fighterId === 'astraea',
      });
    } else {
      sound.playGachaReveal(item.tier as 'S' | 'A' | 'B');
    }
  };

  const handleRevealAll = (results: (GachaItem | PilotGachaItem)[], type: 'fighter' | 'pilot') => {
    const all = new Set(results.map((_, i) => i));
    setRevealedIndices(all);
    const sItem = results.find((r) => r.tier === 'S');
    if (sItem) {
      sound.playGachaReveal('S');
      const fighterId = 'fighterId' in sItem ? sItem.fighterId : sItem.pilotId;
      setCelebrationItem({
        type,
        tier: 'S',
        id: fighterId,
        name: sItem.name,
        vietnameseName: 'callsign' in sItem ? sItem.callsign : sItem.vietnameseName,
        avatar: 'avatarEmoji' in sItem ? sItem.avatarEmoji : undefined,
        accentColor: 'fighterId' in sItem ? FIGHTERS[sItem.fighterId]?.accentColor : undefined,
        isLimited: 'fighterId' in sItem && sItem.fighterId === 'astraea',
      });
    } else {
      const hasA = results.some((r) => r.tier === 'A');
      sound.playGachaReveal(hasA ? 'A' : 'B');
    }
  };

  const handleEquipFighterAndClose = (fighterId: string) => {
    onSelectFighter(fighterId);
    onClose();
  };

  const handleEquipPilotAndClose = (pilotId: string) => {
    onEquipPilot(pilotId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none">
      {/* Container Box */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#091322] via-[#050b14] to-[#040810] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col p-4 sm:p-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-200 to-rose-400">
                TRIỆU HỒI HẠM ĐỘI & TAY LÁI
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Tỉ lệ: Bậc S 1% (Bảo hiểm 80 lần) · Bậc A 10% (x10 đảm bảo A) · Bậc B 89%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rates & Rule Details Button */}
            <button
              onClick={() => setShowRatesModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/50 hover:border-cyan-300 text-cyan-300 hover:text-white text-xs font-orbitron font-bold transition-all cursor-pointer shadow hover:scale-105 active:scale-95"
              title="Xem Chi Tiết Tỷ Lệ & Quy Tắc Gacha"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">CHI TIẾT TỶ LỆ</span>
            </button>

            {/* Gems Display + Direct Top-Up Button */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/50 shadow-inner">
              <span className="text-base">💎</span>
              <span className="font-orbitron font-bold text-amber-300 text-sm tabular-nums">
                {gems.toLocaleString()}
              </span>
              {onOpenRecharge && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRecharge();
                  }}
                  className="ml-1 p-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 transition-transform active:scale-90 cursor-pointer"
                  title="Nạp thêm Ngọc"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              )}
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Insufficient Gems Prompt */}
        {insufficientPrompt && (
          <div className="my-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-center justify-between text-xs text-rose-200 font-rajdhani animate-shake">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                Không đủ Ngọc! Bạn còn thiếu{' '}
                <strong className="text-amber-300 font-orbitron">{insufficientPrompt.needed.toLocaleString()} 💎</strong>.
              </span>
            </div>
            {onOpenRecharge && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecharge();
                }}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-1 cursor-pointer shadow"
              >
                <CreditCard className="w-3.5 h-3.5" /> NẠP NGAY
              </button>
            )}
          </div>
        )}

        {/* Banner Select Tabs */}
        {!isSummoning && !fighterResults && !pilotResults && (
          <div className="flex items-center gap-2 my-4">
            <button
              onClick={() => setActiveTab('fighters')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'fighters'
                  ? 'bg-gradient-to-r from-cyan-500/30 via-cyan-400/20 to-transparent border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>CỔNG CHIẾN CƠ VŨ TRỤ (24 MÁY BAY)</span>
            </button>

            <button
              onClick={() => setActiveTab('pilots')}
              className={`flex-1 py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'pilots'
                  ? 'bg-gradient-to-r from-purple-500/30 via-purple-400/20 to-transparent border border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>CỔNG TAY LÁI (27 PHI CÔNG)</span>
            </button>

            {onOpenDroneGacha && (
              <button
                onClick={() => {
                  handleClose();
                  onOpenDroneGacha();
                }}
                className="py-2.5 px-3 rounded-xl font-orbitron font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/60 text-emerald-300 hover:text-white hover:border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95"
                title="Mở cổng Triệu hồi Drone Không Người Lái"
              >
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>CỔNG DRONE (14 MẪU)</span>
              </button>
            )}
          </div>
        )}

        {/* Active Banner Showcase Stage */}
        {!isSummoning && !fighterResults && !pilotResults && (
          <div className="space-y-4">
            {activeTab === 'fighters' ? (
              /* Fighters Showcase */
              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-4 sm:p-6 shadow-inner">
                {/* 10-Day Limited Astraea Banner Countdown Header */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-orbitron font-black text-[10px] tracking-wide shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                      LIMITED · GIỚI HẠN
                    </span>
                    <span className="font-orbitron font-bold text-xs text-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {bannerStatus.isActive ? (
                        <span>SỰ KIỆN SAO TINH TÚ: CÒN <strong className="text-white font-mono">{bannerStatus.formattedCountdown}</strong></span>
                      ) : (
                        <span className="text-rose-400">ĐÃ HẾT HẠN 10 NGÀY · SAO TINH TÚ ĐÃ RÚT KHỎI VÒNG QUAY</span>
                      )}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-rajdhani">
                    {bannerStatus.isActive
                      ? `*Hết ${ASTRAEA_LIMITED_BANNER_DURATION_DAYS} ngày sẽ loại bỏ SX-77 Astraea ra khỏi banner`
                      : '*Astraea không còn xuất hiện trong vòng quay'}
                  </span>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[11px] font-orbitron font-bold text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" /> BẢO HIỂM BẬC S: CÒN {80 - pityS} LẦN
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black font-orbitron tracking-wide text-white flex items-center gap-2 flex-wrap justify-center md:justify-start">
                      <span>SX-77 Tinh Tú Tiên Phong</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400 text-amber-300 font-bold">
                        LIMITED
                      </span>
                      <span className="text-slate-400 font-normal text-lg sm:text-2xl">& Hắc Long Ouroboros</span>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg font-rajdhani leading-relaxed">
                      {bannerStatus.isActive ? (
                        <>
                          Cơ hội triệu hồi chiến cơ giới hạn <strong>SX-77 Astraea Starfire (Máy Bay Sao Tinh Tú)</strong> với đạn phân tách 5 nhánh & Siêu tinh cầu hủy diệt, cùng dàn chiến cơ huyền thoại Bậc S tối tân.
                        </>
                      ) : (
                        <>
                          Sự kiện giới hạn máy bay Sao Tinh Tú (Astraea) đã kết thúc. Bạn vẫn có thể triệu hồi các chiến cơ Bậc S cực mạnh khác như Ouroboros, Solaris, Chrono và Quasar Titan.
                        </>
                      )}
                    </p>

                    {/* Rates Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-orbitron">
                      <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300">
                        Bậc S: 1.0% (Bảo hiểm: {80 - pityS} lần)
                      </span>
                      <span className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-400/40 text-purple-300">
                        Bậc A: 10.0% (x10 chắc chắn ra A)
                      </span>
                      <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                        Bậc B: 89.0%
                      </span>
                    </div>
                  </div>

                  {/* Highlights of S-Tier Fighters */}
                  <div className="flex items-center gap-2.5">
                    {/* Astraea Preview */}
                    <div
                      onClick={() => onInspectFighter && onInspectFighter(FIGHTERS.astraea)}
                      className={`relative flex flex-col items-center p-3 rounded-xl border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                        bannerStatus.isActive
                          ? 'bg-slate-950/90 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/50'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                      title="Nhấp để xem thông số chi tiết"
                    >
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-rose-500 text-white font-orbitron font-black text-[8px] whitespace-nowrap shadow">
                        {bannerStatus.isActive ? 'LIMITED' : 'HẾT HẠN'}
                      </span>
                      <span className="text-2xl mb-1 mt-1">⭐</span>
                      <span className="font-orbitron font-bold text-xs text-white">Astraea</span>
                      <span className="text-[10px] text-amber-300 font-orbitron">Sao Tinh Tú</span>
                      <span className="text-[9px] text-cyan-400 font-rajdhani mt-0.5 underline">Xem chi tiết</span>
                    </div>

                    {/* Ouroboros Preview */}
                    <div
                      onClick={() => onInspectFighter && onInspectFighter(FIGHTERS.ouroboros)}
                      className="flex flex-col items-center p-3 rounded-xl bg-slate-950/80 border border-purple-500/50 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      title="Nhấp để xem thông số chi tiết"
                    >
                      <span className="text-2xl mb-1">🐉</span>
                      <span className="font-orbitron font-bold text-xs text-white">Ouroboros</span>
                      <span className="text-[10px] text-purple-300 font-orbitron">Hắc Long</span>
                      <span className="text-[9px] text-cyan-400 font-rajdhani mt-0.5 underline">Xem chi tiết</span>
                    </div>

                    {/* Quasar Preview */}
                    <div
                      onClick={() => onInspectFighter && onInspectFighter(FIGHTERS.quasar_titan)}
                      className="flex flex-col items-center p-3 rounded-xl bg-slate-950/80 border border-cyan-500/50 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      title="Nhấp để xem thông số chi tiết"
                    >
                      <span className="text-2xl mb-1">⚡</span>
                      <span className="font-orbitron font-bold text-xs text-white">Quasar</span>
                      <span className="text-[10px] text-cyan-300 font-orbitron">Gamma</span>
                      <span className="text-[9px] text-cyan-400 font-rajdhani mt-0.5 underline">Xem chi tiết</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Pilots Showcase */
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 p-4 sm:p-6 shadow-inner">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-[11px] font-orbitron font-bold text-amber-300">
                      <Award className="w-3.5 h-3.5" /> TAY LÁI HUYỀN THOẠI BẬC S (1%)
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black font-orbitron tracking-wide text-white">
                      Đại Úy Celestia & Chỉ Huy Aegis
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg font-rajdhani leading-relaxed">
                      Tuyển dụng 27 phi công ưu tú gia tăng trực tiếp Giáp, Phòng Thủ, Né Tránh, Bạo Kích, Xuyên Giáp và Sát Thương Chuẩn cho toàn bộ hạm đội.
                    </p>

                    {/* Exact Rates Notice */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-orbitron">
                      <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300">
                        Bậc S: 1.0% (Bảo hiểm: {80 - pilotPityS} lần)
                      </span>
                      <span className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-400/40 text-purple-300">
                        Bậc A: 10.0% (x10 chắc chắn ra A)
                      </span>
                      <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                        Bậc B: 89.0%
                      </span>
                    </div>
                  </div>

                  {/* Pilot Previews */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-950/80 border border-amber-500/50">
                      <span className="text-2xl mb-1">⭐</span>
                      <span className="font-orbitron font-bold text-xs text-white">Celestia</span>
                      <span className="text-[10px] text-amber-300 font-orbitron">+35 ST Chuẩn</span>
                    </div>

                    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-950/80 border border-orange-500/50">
                      <span className="text-2xl mb-1">🛡️</span>
                      <span className="font-orbitron font-bold text-xs text-white">Aegis</span>
                      <span className="text-[10px] text-orange-300 font-orbitron">+25 Giáp / +12 Thủ</span>
                    </div>

                    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-950/80 border border-purple-500/50">
                      <span className="text-2xl mb-1">👻</span>
                      <span className="font-orbitron font-bold text-xs text-white">Phantom</span>
                      <span className="text-[10px] text-purple-300 font-orbitron">+18% Né / +25% Bạo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Pull 1x */}
              <button
                onClick={() => handleExecutePull(1)}
                className="group relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-900 to-cyan-950 border border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
              >
                <div className="text-left">
                  <div className="text-base font-orbitron font-bold text-cyan-300">
                    {activeTab === 'fighters' ? 'TRIỆU HỒI CHIẾN CƠ x1' : 'CHIÊU MỘ TAY LÁI x1'}
                  </div>
                  <div className="text-xs text-slate-400 font-rajdhani">1 lượt quay ngẫu nhiên</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-400 text-amber-300 font-orbitron font-bold text-sm">
                  <span>💎</span>
                  <span>{GACHA_SINGLE_COST.toLocaleString()}</span>
                </div>
              </button>

              {/* Pull 10x */}
              <button
                onClick={() => handleExecutePull(10)}
                className="group relative flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-rose-950/60 border border-amber-400/60 hover:border-amber-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-orbitron font-black text-amber-300">
                      {activeTab === 'fighters' ? 'TRIỆU HỒI x10' : 'CHIÊU MỘ x10'}
                    </span>
                    <span className="text-[10px] font-orbitron font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40">
                      TIẾT KIỆM 200 💎
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-rajdhani">
                    10 lượt quay · Đảm bảo ít nhất 1 Bậc A trở lên
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-400 text-amber-300 font-orbitron font-bold text-sm">
                  <span>💎</span>
                  <span>{GACHA_TEN_COST.toLocaleString()}</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Cinematic Hyperspace Warp Animation Stage */}
        {isSummoning && (
          <div className="relative py-16 flex flex-col items-center justify-center text-center overflow-hidden rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-purple-950/30 to-slate-950 pointer-events-none" />

            <div className="relative w-44 h-44 flex items-center justify-center my-6">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping [animation-duration:1.2s]" />
              <div className="absolute inset-4 rounded-full border-2 border-amber-400/50 animate-ping [animation-duration:1.8s]" />
              <div className="absolute inset-8 rounded-full border-2 border-rose-400/60 animate-ping [animation-duration:2.4s]" />

              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-amber-400 to-rose-500 flex items-center justify-center shadow-[0_0_35px_rgba(245,158,11,0.8)] animate-spin [animation-duration:3s]">
                <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border-2 border-white/80">
                  <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="relative z-10 space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/60 text-xs font-orbitron font-bold text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ĐANG KÍCH HOẠT LỖ SÂU BƯỚC NHẢY
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-200 to-rose-400 tracking-wider">
                {activeTab === 'fighters' ? 'TRUY XUẤT TỌA ĐỘ CHIẾN CƠ...' : 'KẾT NỐI HỒ SƠ PHI CÔNG QUÂN ĐOÀN...'}
              </h3>
              <p className="text-xs text-slate-400 font-rajdhani">
                Giải mã tín hiệu lượng tử không gian bậc cao · Vui lòng chờ...
              </p>
            </div>
          </div>
        )}

        {/* Fighter Results Screen with Interactive 3D Card Reveal */}
        {fighterResults && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-orbitron font-bold text-cyan-300 tracking-wider">
                  KẾT QUẢ TRIỆU HỒI CHIẾN CƠ ({revealedIndices.size}/{fighterResults.length})
                </span>
                <span className="text-[10px] text-slate-400 font-rajdhani">
                  (Nhấp vào từng thẻ để lật bài hoặc chọn Mở Tất Cả)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {revealedIndices.size < fighterResults.length && (
                  <button
                    onClick={() => handleRevealAll(fighterResults, 'fighter')}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-orbitron font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>MỞ TẤT CẢ</span>
                  </button>
                )}

                <button
                  onClick={() => setFighterResults(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-orbitron text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" /> QUAY TIẾP
                </button>
              </div>
            </div>

            {/* Interactive Cards Grid */}
            <div
              className={`grid gap-3 ${
                fighterResults.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2 sm:grid-cols-5'
              }`}
            >
              {fighterResults.map((item, idx) => {
                const fighter = FIGHTERS[item.fighterId];
                const isRevealed = revealedIndices.has(idx);
                const isTierS = item.tier === 'S';
                const isTierA = item.tier === 'A';
                const isAstraeaCard = item.fighterId === 'astraea';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isRevealed) {
                        handleRevealCard(idx, item, 'fighter');
                      } else if (onInspectFighter && fighter) {
                        onInspectFighter(fighter);
                      }
                    }}
                    className={`relative p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all duration-300 min-h-[175px] select-none ${
                      !isRevealed
                        ? isTierS
                          ? 'bg-slate-950 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse'
                          : isTierA
                          ? 'bg-slate-950 border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                          : 'bg-slate-950 border-cyan-800/80 hover:border-cyan-400 shadow-sm'
                        : isTierS
                        ? 'bg-gradient-to-b from-amber-950/90 to-slate-950 border-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.6)] ring-1 ring-amber-400/60 scale-[1.02]'
                        : isTierA
                        ? 'bg-gradient-to-b from-purple-950/80 to-slate-950 border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.45)]'
                        : 'bg-slate-900/90 border-cyan-800 hover:border-cyan-500'
                    }`}
                  >
                    {!isRevealed ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                            isTierS
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : isTierA
                              ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                              : 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300'
                          }`}
                        >
                          <Sparkles className="w-6 h-6 animate-spin [animation-duration:4s]" />
                        </div>
                        <span className="font-orbitron font-bold text-[11px] text-slate-300">
                          {isTierS ? 'BẬC S (Huyền Thoại)' : isTierA ? 'BẬC A (Ưu Tú)' : 'BẬC B'}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-rajdhani animate-pulse">
                          Chạm để mở
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Top Badges */}
                        <div className="absolute top-1 right-1 flex items-center gap-1">
                          {isAstraeaCard && (
                            <span className="text-[8px] font-black font-orbitron px-1.5 py-0.2 rounded bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow animate-pulse">
                              LIMITED
                            </span>
                          )}
                          {item.isNew ? (
                            <span className="text-[9px] font-black font-orbitron px-1.5 py-0.2 rounded bg-rose-500 text-white animate-pulse">
                              MỚI!
                            </span>
                          ) : (
                            <span className="text-[8px] font-bold font-orbitron px-1.5 py-0.2 rounded bg-amber-500/30 border border-amber-400/50 text-amber-300">
                              TRÙNG
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[9px] font-orbitron font-bold px-1.5 py-0.5 rounded mb-1 ${
                            isTierS
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-400'
                              : isTierA
                              ? 'bg-purple-500/30 text-purple-300 border border-purple-400'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          }`}
                        >
                          BẬC {item.tier}
                        </span>

                        <span className="font-orbitron font-bold text-xs text-white line-clamp-1">
                          {item.vietnameseName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-rajdhani mb-1 line-clamp-1">
                          {item.name}
                        </span>

                        {!item.isNew && (
                          <div className="flex items-center justify-center gap-1 my-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-orbitron font-bold">
                            <span>🧩</span>
                            <span>+{item.duplicateBonusShards} Mảnh</span>
                          </div>
                        )}

                        <div className="w-full mt-auto flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEquipFighterAndClose(item.fighterId);
                            }}
                            className="flex-1 py-1 px-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-orbitron font-bold text-[9px] cursor-pointer shadow transition-all hover:scale-102"
                          >
                            TRANG BỊ
                          </button>
                          {onInspectFighter && fighter && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onInspectFighter(fighter);
                              }}
                              className="p-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 text-[9px] font-orbitron"
                              title="Xem chi tiết"
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Direct Re-pull buttons on Results Screen */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-cyan-500/20">
              <button
                onClick={() => handleExecutePull(1)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-400/60 hover:border-cyan-300 text-cyan-300 font-orbitron font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>QUAY TIẾP 1 LẦN</span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-400/50 text-amber-300 text-[11px]">
                  💎 {GACHA_SINGLE_COST.toLocaleString()}
                </span>
              </button>

              <button
                onClick={() => handleExecutePull(10)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-orbitron font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>QUAY TIẾP 10 LẦN</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-300 text-amber-200 text-[11px]">
                  💎 {GACHA_TEN_COST.toLocaleString()}
                </span>
              </button>

              <button
                onClick={() => setFighterResults(null)}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-orbitron text-xs cursor-pointer transition-all"
              >
                QUAY LẠI CỔNG
              </button>
            </div>
          </div>
        )}

        {/* Pilot Results Screen */}
        {pilotResults && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-orbitron font-bold text-purple-300 tracking-wider">
                  KẾT QUẢ CHIÊU MỘ TAY LÁI ({revealedIndices.size}/{pilotResults.length})
                </span>
                <span className="text-[10px] text-slate-400 font-rajdhani">
                  (Nhấp vào từng thẻ để lật bài hoặc chọn Mở Tất Cả)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {revealedIndices.size < pilotResults.length && (
                  <button
                    onClick={() => handleRevealAll(pilotResults, 'pilot')}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-orbitron font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>MỞ TẤT CẢ</span>
                  </button>
                )}

                <button
                  onClick={() => setPilotResults(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-orbitron text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-purple-400" /> QUAY TIẾP
                </button>
              </div>
            </div>

            <div
              className={`grid gap-3 ${
                pilotResults.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2 sm:grid-cols-5'
              }`}
            >
              {pilotResults.map((item, idx) => {
                const pilot = PILOTS[item.pilotId];
                const isRevealed = revealedIndices.has(idx);
                const isTierS = item.tier === 'S';
                const isTierA = item.tier === 'A';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isRevealed) {
                        handleRevealCard(idx, item, 'pilot');
                      } else {
                        setSelectedPilotDetail(pilot);
                      }
                    }}
                    className={`relative p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all duration-300 min-h-[170px] select-none ${
                      !isRevealed
                        ? isTierS
                          ? 'bg-slate-950 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse'
                          : isTierA
                          ? 'bg-slate-950 border-purple-400/70 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                          : 'bg-slate-950 border-purple-900/80 hover:border-purple-400 shadow-sm'
                        : isTierS
                        ? 'bg-gradient-to-b from-amber-950/90 to-slate-950 border-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.6)] ring-1 ring-amber-400/60 scale-[1.02]'
                        : isTierA
                        ? 'bg-gradient-to-b from-purple-950/80 to-slate-950 border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.45)]'
                        : 'bg-slate-900/80 border-slate-700'
                    }`}
                  >
                    {!isRevealed ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border text-2xl ${
                            isTierS
                              ? 'bg-amber-500/20 border-amber-400'
                              : isTierA
                              ? 'bg-purple-500/20 border-purple-400'
                              : 'bg-cyan-500/10 border-cyan-400/40'
                          }`}
                        >
                          ❓
                        </div>
                        <span className="font-orbitron font-bold text-[11px] text-slate-300">
                          {isTierS ? 'BẬC S (Huyền Thoại)' : isTierA ? 'BẬC A (Ưu Tú)' : 'BẬC B'}
                        </span>
                        <span className="text-[10px] text-purple-400 font-rajdhani animate-pulse">
                          Chạm để mở
                        </span>
                      </div>
                    ) : (
                      <>
                        {item.isNew && (
                          <span className="absolute top-1 right-1 text-[9px] font-black font-orbitron px-1.5 py-0.2 rounded bg-rose-500 text-white animate-pulse">
                            MỚI!
                          </span>
                        )}

                        <div className="text-3xl my-1">{item.avatarEmoji}</div>

                        <span
                          className={`text-[9px] font-orbitron font-bold px-1.5 py-0.5 rounded mb-1 ${
                            isTierS
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-400'
                              : isTierA
                              ? 'bg-purple-500/30 text-purple-300 border border-purple-400'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          }`}
                        >
                          BẬC {item.tier}
                        </span>

                        <span className="font-orbitron font-bold text-xs text-white line-clamp-1">
                          {item.callsign}
                        </span>
                        <span className="text-[10px] text-slate-400 font-rajdhani mb-2 line-clamp-1">
                          {item.name}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquipPilotAndClose(item.pilotId);
                          }}
                          className="w-full mt-auto py-1 px-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400 text-purple-300 font-orbitron font-bold text-[10px] cursor-pointer shadow transition-all hover:scale-102"
                        >
                          CHỌN LÁI
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-purple-500/20">
              <button
                onClick={() => handleExecutePull(1)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-400/60 hover:border-purple-300 text-purple-300 font-orbitron font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span>QUAY TIẾP 1 LẦN</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-400/50 text-amber-300 text-[11px]">
                  💎 {GACHA_SINGLE_COST.toLocaleString()}
                </span>
              </button>

              <button
                onClick={() => handleExecutePull(10)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-orbitron font-black text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>QUAY TIẾP 10 LẦN</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-300 text-amber-200 text-[11px]">
                  💎 {GACHA_TEN_COST.toLocaleString()}
                </span>
              </button>

              <button
                onClick={() => setPilotResults(null)}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-orbitron text-xs cursor-pointer transition-all"
              >
                QUAY LẠI CỔNG
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gacha Detailed Rates & Rules Modal Dialog */}
      {showRatesModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none">
          <div className="relative max-w-2xl w-full max-h-[88vh] overflow-y-auto p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0a1424] via-[#060c18] to-[#040810] border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black font-orbitron text-white">
                  THÔNG TIN CHI TIẾT TỶ LỆ & QUY TẮC GACHA
                </h3>
              </div>
              <button
                onClick={() => setShowRatesModal(false)}
                className="p-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Banner Limited Rules */}
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-400/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-orbitron font-black text-amber-300">
                <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px]">LIMITED</span>
                <span>QUY TẮC BANNER GIỚI HẠN MÁY BAY SAO TINH TÚ (ASTRAEA)</span>
              </div>
              <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
                • Chiến cơ <strong>SX-77 Tinh Tú Tiên Phong (Astraea)</strong> là máy bay giới hạn (Limited) đặc quyền của sự kiện mở cổng trong <strong>10 ngày</strong>.<br />
                • Thời gian đếm ngược còn lại: <strong className="text-amber-300 font-orbitron">{bannerStatus.formattedCountdown}</strong>.<br />
                • <strong>Khi hết 10 ngày</strong>, máy bay Sao Tinh Tú sẽ được tự động <strong>loại bỏ hoàn toàn khỏi danh sách triệu hồi</strong> của Cổng Gacha. Các chiến cơ Bậc S khác vẫn tiếp tục có thể quay được bình thường.
              </p>
            </div>

            {/* Base Drop Rates */}
            <div className="space-y-2">
              <div className="text-xs font-orbitron font-bold text-cyan-300 uppercase">
                1. TỈ LỆ RƠI CƠ BẢN (BASE DROP RATES)
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50">
                  <div className="text-amber-400 font-black font-orbitron text-base sm:text-lg">1.0%</div>
                  <div className="text-xs font-orbitron font-bold text-white">BẬC S (Huyền Thoại)</div>
                  <div className="text-[10px] text-slate-400 font-rajdhani">Bảo hiểm 80 lần</div>
                </div>
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/50">
                  <div className="text-purple-400 font-black font-orbitron text-base sm:text-lg">10.0%</div>
                  <div className="text-xs font-orbitron font-bold text-white">BẬC A (Ưu Tú)</div>
                  <div className="text-[10px] text-slate-400 font-rajdhani">x10 chắc chắn ra A</div>
                </div>
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/50">
                  <div className="text-cyan-400 font-black font-orbitron text-base sm:text-lg">89.0%</div>
                  <div className="text-xs font-orbitron font-bold text-white">BẬC B (Tiêu Chuẩn)</div>
                  <div className="text-[10px] text-slate-400 font-rajdhani">Chiến cơ & Phi công</div>
                </div>
              </div>
            </div>

            {/* Pity Mechanics */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs text-slate-300 font-rajdhani">
              <div className="font-orbitron font-bold text-cyan-300 text-xs mb-1">
                2. CƠ CHẾ BẢO HIỂM (PITY SYSTEM)
              </div>
              <p>• <strong>Bảo hiểm Bậc S:</strong> Nếu trong 79 lượt quay liên tiếp chưa ra Bậc S, lượt quay thứ 80 chắc chắn 100% nhận Bậc S. Khi trúng Bậc S, bộ đếm bảo hiểm tự động reset về 0.</p>
              <p>• <strong>Bảo hiểm x10:</strong> Khi thực hiện quay 10 lần cùng lúc, hệ thống đảm bảo ít nhất có 1 vật phẩm Bậc A hoặc Bậc S.</p>
              <p>• <strong>Quy đổi trùng lặp (Duplicate Shards):</strong> Quay trúng máy bay đã sở hữu sẽ quy đổi thành 30 (Bậc B), 60 (Bậc A) hoặc 120 (Bậc S) Mảnh chiến cơ để nâng cấp Sao tại Xưởng Cơ Khí.</p>
            </div>

            {/* Full Catalog Table */}
            <div className="space-y-1.5">
              <div className="text-xs font-orbitron font-bold text-slate-300 uppercase">
                3. DANH SÁCH CHIẾN CƠ CÓ THỂ TRIỆU HỒI ({Object.keys(FIGHTERS).length} MÁY BAY)
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 text-[11px] font-rajdhani">
                {Object.values(FIGHTERS).map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1 py-0.2 rounded font-orbitron font-bold text-[8px] ${
                          f.tier === 'S'
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-400'
                            : f.tier === 'A'
                            ? 'bg-purple-500/30 text-purple-300 border border-purple-400'
                            : 'bg-cyan-500/30 text-cyan-300 border border-cyan-400'
                        }`}
                      >
                        {f.tier}
                      </span>
                      <span className="font-bold text-white">{f.vietnameseName}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({f.name})</span>
                      {f.id === 'astraea' && (
                        <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500 text-white font-orbitron font-bold">
                          {bannerStatus.isActive ? 'LIMITED (10 NGÀY)' : 'ĐÃ HẾT HẠN'}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-orbitron text-[10px]">
                      {f.tier === 'S'
                        ? f.id === 'astraea' && !bannerStatus.isActive
                          ? '0.00% (Hết hạn)'
                          : '0.11%'
                        : f.tier === 'A'
                        ? '1.11%'
                        : '14.83%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowRatesModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs cursor-pointer transition-all"
              >
                ĐÃ HIỂU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier S Jackpot Celebratory Modal Overlay */}
      {celebrationItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn select-none">
          <div className="relative max-w-md w-full p-6 rounded-3xl bg-gradient-to-b from-amber-950 via-slate-950 to-purple-950 border-2 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.7)] text-center flex flex-col items-center space-y-4">
            <div className="relative w-28 h-28 flex items-center justify-center my-2">
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/40 border-t-amber-400 animate-spin [animation-duration:2s]" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-bounce">
                {celebrationItem.avatar || '⭐'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400 text-amber-300 font-orbitron font-black text-xs tracking-wider animate-pulse">
                <Crown className="w-3.5 h-3.5" />
                <span>
                  {celebrationItem.isLimited
                    ? '🎉 TRÚNG CHIẾN CƠ GIỚI HẠN BẬC S (LIMITED 1%)!'
                    : 'XUẤT HIỆN BẬC S HUYỀN THOẠI (1%)!'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 drop-shadow-[0_2px_12px_rgba(245,158,11,0.6)]">
                {celebrationItem.vietnameseName}
              </h3>
              <p className="text-xs text-slate-300 font-rajdhani">{celebrationItem.name}</p>
            </div>

            <div className="w-full p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 text-xs text-amber-200/90 font-rajdhani">
              {celebrationItem.type === 'fighter'
                ? celebrationItem.isLimited
                  ? 'Chúc mừng Chỉ Huy đã sở hữu chiến cơ Tinh Tú Giới Hạn quý hiếm độc quyền sự kiện 10 ngày!'
                  : 'Chiến cơ tối thượng đã mở khóa sẵn sàng chỉ huy xuất kích trận chiến!'
                : 'Phi công cấp cao đã được biên chế vào quân đoàn của bạn!'}
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={() => setCelebrationItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 font-orbitron font-bold text-xs cursor-pointer transition-colors"
              >
                TIẾP TỤC
              </button>

              <button
                onClick={() => {
                  if (celebrationItem.type === 'fighter') {
                    handleEquipFighterAndClose(celebrationItem.id);
                  } else {
                    handleEquipPilotAndClose(celebrationItem.id);
                  }
                  setCelebrationItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-orbitron font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 cursor-pointer transition-all"
              >
                <span>TRANG BỊ NGAY</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
