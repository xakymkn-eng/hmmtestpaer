/**
 * Atmospheric Sci-Fi Title Screen and Fighter Hangar (Cleaned & Mobile-Optimized)
 * 1. Streamlined Top Command Bar with Gold, Gems, Audio, and Quick Menu Hub button
 * 2. Dedicated Update Bulletin Bar on the Outside (Bản thông báo cập nhật)
 * 3. Spacious Cosmic Scenery & Majestic Floating Fighter Jet in the Center (Phong cảnh & Máy bay ở chính giữa)
 * 4. Repositioned Tactical Information Deck Downwards towards Bottom (Bản thông tin chiến cơ dời xuống dưới)
 * 5. Compact Sortie Mode & "XUẤT CHIẾN" Combat Launch Bar
 * 6. Quick Hub Modal for secondary features (Missions, Mailbox, Daily Bonus, VIP, Leaderboard, News)
 * 7. Full Fleet Hangar Modal for browsing all 31 fighters on demand
 */

import React,{ useState,useMemo,useEffect } from 'react';
import {
FIGHTERS,
FighterStats,
FighterTier,
PILOTS,
Pilot,
calculateAccessoryBonuses,
DifficultyLevel,
COSMETIC_SKINS,
} from '../game/rules';
import { StarfieldBackground } from './StarfieldBackground';
import { FighterShowcaseCanvas } from './FighterShowcaseCanvas';
import { ResetConfirmModal } from './Modals';
import { NewsCarouselWidget } from './NewsCarouselWidget';
import { DRONES } from '../game/drones';
import { SettingsModal } from './SettingsModal';
import { ScenerySelectModal } from './ScenerySelectModal';
import {
GameSettings,
loadGameSettings,
saveGameSettings,SCENERY_CONFIGS
} from '../game/lobbySettings';
import {
Volume2,
VolumeX,
Sparkles,
Target,
Lock,
Check,
Gift,Wrench,
RotateCcw,
Flame,
Plus,
Crown,
Mail,
Star,
Globe2,
ChevronRight,
ChevronLeft,
Trophy,
Zap,
Layers,
X,
Grid,
Edit3,
Radio,
Sliders,
Compass,
Info
} from 'lucide-react';
import { SavedLoadout } from '../game/loadouts';
import { RechargeSystemState,RechargeTab,getVipStatus } from '../game/recharge';
import { UNIVERSES,getUniverseById } from '../game/universe';
import { sound } from '../game/audio';

interface TitleScreenProps {
  selectedFighter: FighterStats;
  onSelectFighter: (fighterId: string) => void;
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highScore: number;
  gems?: number;
  gold?: number;
  fighterShards?: Record<string, number>;
  fighterStars?: Record<string, number>;
  onOpenUpgrade?: (fighterId?: string) => void;
  ownedFighterIds: string[];
  ownedPilotIds: string[];
  equippedPilotId: string | null;
  fighterAccessories: Record<string, string[]>;
  claimableMissionsCount: number;
  onOpenGacha: (tab?: 'fighters' | 'pilots') => void;
  onOpenMissions: () => void;
  onOpenDailyBonus: () => void;
  onOpenPilots: () => void;
  onOpenAccessories: () => void;
  isDailyBonusReady: boolean;
  dailyBonusCountdown: string;
  dailyBonusDay: number;
  dailyBonusRewardGems: number;
  onResetProgress: () => void;
  rechargeState?: RechargeSystemState;
  onOpenRecharge: (tab?: RechargeTab) => void;
  unclaimedMailCount?: number;
  onOpenMailbox: () => void;
  difficulty: DifficultyLevel;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  onOpenModeSelect?: () => void;
  onOpenUniverseSelect?: () => void;
  onOpenBossRushLeaderboard?: () => void;
  universeConqueredCount?: number;
  activeGameMode?: 'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard';
  activeUniverseId?: number | null;
  onSelectUniverseId?: (universeId: number) => void;
  onSelectGameMode?: (mode: 'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard') => void;
  universeProgress?: Record<number, number>;
  activeUniverseName?: string;
  onOpenFighterDetail?: (fighter: FighterStats) => void;
  onOpenAdventureMap?: () => void;
  onLaunchAdventureStage?: (stageId: number) => void;
  activeAdventureStageId?: number | null;
  unlockedAdventureStages?: number[];
  adventureStars?: number;
  savedLoadouts?: SavedLoadout[];
  activeLoadoutId?: string | null;
  onApplyLoadout?: (loadout: SavedLoadout) => void;
  onQuickSaveLoadout?: (slotId?: string, name?: string) => void;
  onOpenSavedLoadouts?: () => void;
  playerName?: string;
  playerCallsign?: string;
  playerAvatar?: string;
  onOpenProfile?: () => void;
  ownedDroneIds?: string[];
  equippedDroneIds?: string[];
  onOpenDrones?: (droneId?: string) => void;
  onOpenDroneGacha?: () => void;
  gameSettings?: GameSettings;
  onUpdateSettings?: (settings: Partial<GameSettings>) => void;
  activeSkinId?: string | null;
  onOpenPilotDetail?: (pilot: Pilot) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedFighter,
  onSelectFighter,
  onStartGame,
  isMuted,
  onToggleMute,
  highScore,
  gems = 0,
  gold = 0,
  fighterShards = {},
  fighterStars = {},
  onOpenUpgrade,
  ownedFighterIds = [],
  ownedPilotIds = [],
  equippedPilotId = null,
  fighterAccessories = {},
  claimableMissionsCount = 0,
  onOpenGacha,
  onOpenMissions,
  onOpenDailyBonus,
  onOpenPilots,
  onOpenAccessories,
  isDailyBonusReady = false,
  dailyBonusCountdown = '00:00:00',
  dailyBonusDay = 1,
  dailyBonusRewardGems = 500,
  onResetProgress,
  rechargeState,
  onOpenRecharge,
  unclaimedMailCount = 0,
  onOpenMailbox,
  difficulty = 'normal',
  onSelectDifficulty,
  onOpenModeSelect,
  onOpenUniverseSelect,
  onOpenBossRushLeaderboard,
  universeConqueredCount = 0,
  activeGameMode = 'universe',
  activeUniverseId = 1,
  onSelectUniverseId,
  onSelectGameMode,
  universeProgress = {},
  activeUniverseName = 'Vũ Trụ 01: Tinh Vân Orion',
  onOpenFighterDetail,
  onOpenAdventureMap,
  onLaunchAdventureStage,
  activeAdventureStageId = 1,
  unlockedAdventureStages = [1],
  adventureStars = 0,
  savedLoadouts = [],
  activeLoadoutId = null,
  onApplyLoadout,
  onQuickSaveLoadout,
  onOpenSavedLoadouts,
  playerName = 'Chỉ Huy Tiên Phong',
  playerCallsign = 'VANGUARD-01',
  playerAvatar = '🧑‍✈️',
  onOpenProfile,
  ownedDroneIds = [],
  equippedDroneIds = [],
  onOpenDrones,
  onOpenDroneGacha,
  gameSettings,
  onUpdateSettings,
  activeSkinId = null,
  onOpenPilotDetail,
}) => {
  // Modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isQuickHubOpen, setIsQuickHubOpen] = useState(false);
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSceneryModalOpen, setIsSceneryModalOpen] = useState(false);
  const [fleetTierFilter, setFleetTierFilter] = useState<'ALL' | 'OWNED' | FighterTier>('ALL');

  // Fallback to locally loaded settings
  const [localSettings, setLocalSettings] = useState<GameSettings>(() => loadGameSettings());
  const currentSettings = gameSettings || localSettings;

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    const updated = saveGameSettings(newSettings);
    setLocalSettings(updated);
    if (onUpdateSettings) onUpdateSettings(newSettings);
  };

  const safeOwnedFighterIds = (ownedFighterIds && ownedFighterIds.length > 0) ? ownedFighterIds : ['phoenix'];
  const ownedSet = useMemo(() => new Set(safeOwnedFighterIds), [safeOwnedFighterIds]);
  const allFighters = useMemo(() => Object.values(FIGHTERS), []);

  const currentFighter = selectedFighter || FIGHTERS.phoenix;
  const equippedPilot = equippedPilotId && PILOTS[equippedPilotId] ? PILOTS[equippedPilotId] : null;
  const currentInstalledAccs = (fighterAccessories && currentFighter) ? (fighterAccessories[currentFighter.id] || []) : [];
  const currentAccBonuses = calculateAccessoryBonuses(currentInstalledAccs);
  const hasNoFighters = safeOwnedFighterIds.length === 0;

  const vipStatus = getVipStatus(rechargeState ? rechargeState.vipExp : 0);
  const activeUniverse = getUniverseById(activeUniverseId || 1) || UNIVERSES[0];

  const slot1Drone = (equippedDroneIds && equippedDroneIds[0]) ? DRONES[equippedDroneIds[0]] : null;
  const slot2Drone = (equippedDroneIds && equippedDroneIds[1]) ? DRONES[equippedDroneIds[1]] : null;

  // Total unread notifications count for the compact Menu button
  const totalAlerts = claimableMissionsCount + (isDailyBonusReady ? 1 : 0) + (unclaimedMailCount || 0);

  // Filtered fighters for the Fleet modal
  const filteredFighters = useMemo(() => {
    if (fleetTierFilter === 'ALL') return allFighters;
    if (fleetTierFilter === 'OWNED') return allFighters.filter((f) => ownedSet.has(f.id));
    return allFighters.filter((f) => f.tier === fleetTierFilter);
  }, [fleetTierFilter, allFighters, ownedSet]);

  // Update bulletin slides (Bản thông báo cập nhật đặt ở bên ngoài sảnh theo yêu cầu)
  const [activeBulletinIdx, setActiveBulletinIdx] = useState(0);
  const bulletinSlides = useMemo(() => [
    {
      id: 'super_hard',
      badge: '🔥 CHẾ ĐỘ MỚI',
      title: 'CHẾ ĐỘ SIÊU KHÓ',
      highlightText: '10 đợt 10 Boss dị biệt · Quái tầm trung có Giáp, máu +80%, thủ +60%!',
      ctaText: 'CHIẾN NGAY',
      onAction: () => {
        if (onSelectGameMode) onSelectGameMode('super_hard');
        else if (onOpenModeSelect) onOpenModeSelect();
      },
    },
    {
      id: 'drones',
      badge: '🛸 DRONE MỚI',
      title: 'MÁY BAY KHÔNG NGƯỜI LÁI',
      highlightText: 'Hộ tống tác chiến, Hút Máu 10% & Tăng Sát Thương cực mạnh!',
      ctaText: 'GACHA DRONE',
      onAction: () => {
        if (onOpenDroneGacha) onOpenDroneGacha();
        else if (onOpenDrones) onOpenDrones();
      },
    },
    {
      id: 'astraea',
      badge: '🌟 GACHA MỚI',
      title: 'SX-77 ASTRAEA',
      highlightText: 'Bão Tinh Tú Cực Hạn · Triệu hồi Bậc S tối thượng!',
      ctaText: 'QUAY GACHA',
      onAction: () => onOpenGacha('fighters'),
    },
    {
      id: 'universe_80',
      badge: '🗺️ BẢN ĐỒ MỚI',
      title: '80 MAP VŨ TRỤ',
      highlightText: 'Khám phá 8 cụm thiên hà & Hố Đen Sagittarius A*',
      ctaText: 'MỞ MAP',
      onAction: () => {
        if (onOpenUniverseSelect) onOpenUniverseSelect();
        else if (onOpenModeSelect) onOpenModeSelect();
      },
    },
    {
      id: 'adventure',
      badge: '👹 HẠM ĐỘI MA',
      title: 'CHIẾN DỊCH 20 MÀN',
      highlightText: 'Đại chiến Soái Hạm Khổng Lồ phong cách CI4!',
      ctaText: 'XEM MÀN',
      onAction: () => {
        if (onOpenAdventureMap) onOpenAdventureMap();
        else if (onOpenModeSelect) onOpenModeSelect();
      },
    },
    {
      id: 'boss_rush',
      badge: '⚔️ ĐẠI CHIẾN',
      title: 'ĐẠI CHIẾN BOSS',
      highlightText: 'Thách thức 20 Siêu Trùm Không Gian liên hoàn & Đua TOP!',
      ctaText: 'XEM BXH',
      onAction: () => {
        if (onOpenBossRushLeaderboard) onOpenBossRushLeaderboard();
        else if (onOpenModeSelect) onOpenModeSelect();
      },
    },
    {
      id: 'accessories',
      badge: '🛡️ TRANG BỊ VÀNG',
      title: '29 PHỤ KIỆN VŨ KHÍ',
      highlightText: 'Xuyên Giáp, Bạo Kích & Sát Thương Chuẩn tối đa!',
      ctaText: 'VÀO KHO',
      onAction: onOpenAccessories,
    },
    {
      id: 'daily',
      badge: '🎁 QUÀ TẶNG',
      title: 'ĐIỂM DANH 7 NGÀY',
      highlightText: 'Nhận hàng ngàn Kim Cương miễn phí mỗi ngày!',
      ctaText: 'NHẬN QUÀ',
      onAction: onOpenDailyBonus,
    },
  ], [onOpenGacha, onOpenUniverseSelect, onOpenModeSelect, onOpenAdventureMap, onOpenBossRushLeaderboard, onOpenAccessories, onOpenDailyBonus, onOpenDroneGacha, onOpenDrones]);

  // Auto-cycle bulletin slides every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBulletinIdx((prev) => (prev + 1) % bulletinSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [bulletinSlides.length]);

  // Quick switch previous/next fighter in owned list
  const handleCycleFighter = (dir: 'prev' | 'next') => {
    sound.playClick();
    const list = safeOwnedFighterIds;
    if (list.length === 0) return;
    const currentIndex = list.indexOf(currentFighter.id);
    let nextIndex = dir === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= list.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = list.length - 1;
    onSelectFighter(list[nextIndex]);
  };

  const currentStarCount = fighterStars[currentFighter.id] || 1;
  const currentShardCount = fighterShards[currentFighter.id] || 0;

  return (
    <>
      {/* Background Cosmic Starfield & Glowing Nebulae */}
      <StarfieldBackground
        activeUniverseId={activeGameMode === 'universe' ? activeUniverseId : null}
        activeScenery={currentSettings.activeScenery}
        graphicsQuality={currentSettings.graphicsQuality}
        fpsTarget={currentSettings.fpsTarget}
      />

      {/* Main Viewport-Locked Inset Container (No Overflow) */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-2 sm:p-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-[max(8px,env(safe-area-inset-top))] px-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] pointer-events-none select-none max-w-full overflow-hidden">

        {/* 1. TOP COMMAND BAR (Logo, Record, Currencies & Features Hub Menu) */}
        <header className="flex items-center justify-between gap-1 w-full shrink-0 z-30">
          {/* Top Left: Commander Profile & Rename Trigger */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (onOpenProfile) onOpenProfile();
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/50 hover:border-cyan-300 text-left transition-all cursor-pointer pointer-events-auto active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.2)] group shrink-0"
            title="Nhấn để xem Hồ Sơ & Đổi Tên Chỉ Huy"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-xs sm:text-sm shadow font-orbitron">
              {playerAvatar}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-[9px] sm:text-xs font-orbitron font-black text-cyan-300 group-hover:text-cyan-200 uppercase truncate max-w-[65px] xs:max-w-[85px] sm:max-w-[125px]">
                  {playerName}
                </span>
                <Edit3 className="w-2.5 h-2.5 text-cyan-400/80 group-hover:text-cyan-200 shrink-0" />
              </div>
              <div className="text-[7.5px] sm:text-[9px] text-slate-400 font-rajdhani leading-none">
                <span className="hidden xs:inline">Kỷ lục: </span><span className="text-amber-400 font-bold tabular-nums font-orbitron">{highScore.toLocaleString()}</span>
              </div>
            </div>
          </button>

          {/* Top Right: Currencies & Clean Feature Hub Button */}
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
            {/* Gold Pill */}
            <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl bg-slate-950/90 border border-yellow-500/60 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              <span className="text-[11px] sm:text-xs">🪙</span>
              <span className="font-orbitron font-bold text-yellow-300 text-[9px] sm:text-xs tabular-nums">
                {gold >= 100000 ? `${Math.floor(gold / 1000)}k` : gold.toLocaleString()}
              </span>
            </div>

            {/* Gems Pill with Plus */}
            <div className="flex items-center gap-0.5 sm:gap-1 pl-1.5 sm:pl-2 pr-0.5 py-1 rounded-lg sm:rounded-xl bg-slate-950/90 border border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="text-[11px] sm:text-xs">💎</span>
              <span className="font-orbitron font-bold text-amber-300 text-[9px] sm:text-xs tabular-nums">
                {gems.toLocaleString()}
              </span>
              <button
                onClick={() => onOpenRecharge('packs')}
                aria-label="Nạp thêm Kim Cương"
                className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[10px] shadow hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center touch-manipulation ml-0.5"
                title="Nạp Kim Cương"
              >
                <Plus className="w-2.5 h-2.5 stroke-[3]" />
              </button>
            </div>

            {/* Change Scenery Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsSceneryModalOpen(true);
              }}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-lg sm:rounded-xl bg-slate-950/90 border border-cyan-500/60 hover:border-cyan-300 text-cyan-300 transition-all cursor-pointer touch-manipulation active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
              title={`Đổi Phong Cảnh Sảnh (Hiện tại: ${SCENERY_CONFIGS[currentSettings.activeScenery]?.name || 'Dải Ngân Hà'})`}
              aria-label="Đổi Phong Cảnh Sảnh"
            >
              <span className="text-[11px] sm:text-xs">{SCENERY_CONFIGS[currentSettings.activeScenery]?.icon || '🌌'}</span>
              <span className="font-orbitron font-bold text-[9px] sm:text-xs hidden xs:inline">VỊNH / CẢNH</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsSettingsModalOpen(true);
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center justify-center touch-manipulation active:scale-95 shadow"
              title="Cài Đặt Đồ Họa & FPS"
              aria-label="Cài Đặt Đồ Họa & FPS"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={onToggleMute}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex items-center justify-center touch-manipulation active:scale-95"
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>

            {/* THE MENU / TÍNH NĂNG BUTTON (Tập hợp gọn gàng tất cả tính năng phụ) */}
            <button
              onClick={() => {
                sound.playClick();
                setIsQuickHubOpen(true);
              }}
              aria-label="Mở Menu Tính Năng"
              className={`relative flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl border transition-all cursor-pointer touch-manipulation active:scale-95 shadow-lg shrink-0 ${
                totalAlerts > 0
                  ? 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900/90 border-cyan-500/60 text-cyan-200 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
              }`}
              title="Trung Tâm Tính Năng: Nhiệm vụ, Điểm danh, Thư từ, VIP, BXH, Sự kiện"
            >
              <Grid className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
              <span className="font-orbitron font-bold text-[9px] sm:text-xs">MENU</span>
              {totalAlerts > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black font-orbitron flex items-center justify-center shadow animate-bounce -mr-0.5">
                  {totalAlerts}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* 2. BẢN THÔNG BÁO CẬP NHẬT (ĐẶT Ở BÊN NGOÀI SẢNH CHÍNH) */}
        <div className="w-full max-w-3xl mx-auto shrink-0 z-30 pointer-events-auto my-0.5">
          <div className="flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-950/90 via-slate-900/95 to-slate-950/90 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] backdrop-blur-md">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[8px] sm:text-[9px] font-orbitron font-bold shrink-0">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 animate-spin" />
                <span>{bulletinSlides[activeBulletinIdx].badge}</span>
              </span>
              <div className="flex items-center gap-1.5 min-w-0 text-left">
                <span className="font-orbitron font-black text-[10px] sm:text-xs text-white truncate">
                  {bulletinSlides[activeBulletinIdx].title}:
                </span>
                <span className="text-[9px] sm:text-[11px] text-slate-300 font-rajdhani truncate hidden xs:inline">
                  {bulletinSlides[activeBulletinIdx].highlightText}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveBulletinIdx((prev) => (prev - 1 + bulletinSlides.length) % bulletinSlides.length);
                }}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                title="Thông báo trước"
                aria-label="Thông báo trước"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveBulletinIdx((prev) => (prev + 1) % bulletinSlides.length);
                }}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                title="Thông báo tiếp theo"
                aria-label="Thông báo tiếp theo"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={bulletinSlides[activeBulletinIdx].onAction}
                className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[9px] font-orbitron font-black shadow hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 ml-0.5"
              >
                {bulletinSlides[activeBulletinIdx].ctaText}
              </button>
            </div>
          </div>
        </div>

        {/* 3. CENTER SECTION: LỘ RA PHONG CẢNH VÀ MÁY BAY Ở CHÍNH GIỮA */}
        <main className="flex-1 flex flex-col items-center justify-between w-full max-w-3xl mx-auto my-auto px-1 py-1 z-20">
          {/* Subtle Wing Emblem & Slogan */}
          <div className="flex items-center justify-center gap-2 mb-0.5 shrink-0">
            <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-r from-transparent to-cyan-400" />
            <span className="text-[9px] sm:text-[11px] font-orbitron font-bold tracking-[0.25em] text-cyan-400 uppercase">
              HẠM ĐỘI KHÔNG GIAN
            </span>
            <span className="w-6 sm:w-10 h-[1px] bg-gradient-to-l from-transparent to-cyan-400" />
          </div>

          <h1 className="text-lg sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_2px_10px_rgba(6,182,212,0.5)] mb-0.5 shrink-0">
            PHI ĐỘI TIÊN PHONG
          </h1>

          {/* CHÍNH GIỮA: MÁY BAY BAY LƠ LỬNG + 2 DRONE HỘ TỐNG PHÍA SAU HAI CÁNH + PHONG CẢNH VŨ TRỤ RỰC RỠ */}
          <div className="relative flex items-center justify-center w-full my-auto flex-1 max-h-[220px]">
            {/* Left Cycle Button */}
            <button
              onClick={() => handleCycleFighter('prev')}
              aria-label="Chiến cơ trước"
              className="absolute left-1.5 sm:left-4 z-30 pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/60 hover:border-cyan-300 text-cyan-300 flex items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-90 shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md"
              title="Đổi sang chiến cơ trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              className={`flex flex-col items-center justify-center relative transition-all duration-300 ${
                currentSettings.graphicsQuality === 'ultra'
                  ? 'drop-shadow-[0_30px_45px_rgba(0,0,0,0.95)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]'
                  : currentSettings.graphicsQuality === 'high'
                  ? 'drop-shadow-[0_20px_28px_rgba(0,0,0,0.85)]'
                  : currentSettings.graphicsQuality === 'medium'
                  ? 'drop-shadow-[0_12px_16px_rgba(0,0,0,0.5)]'
                  : ''
              }`}
            >
              {/* Radial Backdrop Aura Glow matching the Fighter Color (Hidden on low; Super powerful on ultra) */}
              {currentSettings.graphicsQuality !== 'low' && (
                <div
                  className={`absolute rounded-full pointer-events-none transition-all duration-500 ${
                    currentSettings.graphicsQuality === 'ultra'
                      ? 'w-64 h-64 blur-[60px] opacity-75'
                      : currentSettings.graphicsQuality === 'high'
                      ? 'w-52 h-52 blur-[48px] opacity-40'
                      : 'w-40 h-40 blur-[32px] opacity-20'
                  }`}
                  style={{ backgroundColor: currentFighter.color }}
                />
              )}

              <FighterShowcaseCanvas
                fighter={currentFighter}
                starCount={currentStarCount}
                width={320}
                height={170}
                slot1Drone={slot1Drone}
                slot2Drone={slot2Drone}
                graphicsQuality={currentSettings.graphicsQuality}
                activeSkinId={activeSkinId}
              />

              {/* Floating Fighter Name & Star Rating Badge (Clickable to open FighterDetailModal & Skins) */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (onOpenFighterDetail) onOpenFighterDetail(currentFighter);
                }}
                className="pointer-events-auto -mt-2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)] backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95 group"
                title="Nhấn để xem Chi Tiết Chiến Cơ, Trang Phục Skin & Vũ Khí"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentFighter.color }}
                />
                <span className="font-orbitron font-black text-xs sm:text-sm text-white drop-shadow group-hover:text-cyan-200">
                  {currentFighter.vietnameseName}
                </span>
                <span
                  className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-orbitron font-black uppercase ${
                    currentFighter.tier === 'S'
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-400/60'
                      : currentFighter.tier === 'A'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-400/60'
                      : 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60'
                  }`}
                >
                  BẬC {currentFighter.tier}
                </span>
                <div className="flex items-center gap-0.5 text-amber-400 ml-0.5">
                  {Array.from({ length: currentStarCount }).map((_, si) => (
                    <Star key={si} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {activeSkinId && COSMETIC_SKINS[activeSkinId] ? (
                  <span
                    className="text-[9px] font-orbitron font-bold ml-1 px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-sm"
                    style={{
                      backgroundColor: `${COSMETIC_SKINS[activeSkinId].primaryColor}25`,
                      borderColor: COSMETIC_SKINS[activeSkinId].primaryColor,
                      color: COSMETIC_SKINS[activeSkinId].secondaryColor,
                    }}
                  >
                    <span>{COSMETIC_SKINS[activeSkinId].icon}</span>
                    <span className="hidden sm:inline">{COSMETIC_SKINS[activeSkinId].vietnameseName}</span>
                    <span className="sm:hidden">SKIN</span>
                  </span>
                ) : (
                  <span className="text-[9px] text-cyan-400 font-rajdhani font-bold ml-1 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/40">
                    ℹ️ Chi Tiết & Skin
                  </span>
                )}
              </button>

              {/* Interactive Wingman Drone Escort Badges (Aligned directly behind/alongside the main fighter wings) */}
              <div className="flex items-center gap-2 mt-1.5 z-20 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    if (onOpenDrones) onOpenDrones(slot1Drone ? slot1Drone.id : undefined);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-orbitron font-bold transition-all active:scale-95 shadow cursor-pointer ${
                    slot1Drone
                      ? 'bg-slate-950/90 hover:bg-slate-900 border border-cyan-400/70 text-cyan-200 hover:border-cyan-300'
                      : 'bg-slate-950/60 hover:bg-slate-900 border border-dashed border-cyan-500/40 text-slate-400 hover:text-cyan-300'
                  }`}
                  title="Nhấn để đổi hoặc nâng cấp Drone Cánh Trái (Slot 1)"
                >
                  <Radio className="w-2.5 h-2.5 text-cyan-400" />
                  <span>{slot1Drone ? `Cánh Trái: ${slot1Drone.vietnameseName.replace('DR-', '')}` : '+ Lắp Drone 1'}</span>
                  {slot1Drone && <span className="text-amber-400 font-bold ml-0.5">★{slot1Drone.tier}</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    if (onOpenDrones) onOpenDrones(slot2Drone ? slot2Drone.id : undefined);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-orbitron font-bold transition-all active:scale-95 shadow cursor-pointer ${
                    slot2Drone
                      ? 'bg-slate-950/90 hover:bg-slate-900 border border-amber-400/70 text-amber-200 hover:border-amber-300'
                      : 'bg-slate-950/60 hover:bg-slate-900 border border-dashed border-amber-500/40 text-slate-400 hover:text-amber-300'
                  }`}
                  title="Nhấn để đổi hoặc nâng cấp Drone Cánh Phải (Slot 2)"
                >
                  <Radio className="w-2.5 h-2.5 text-amber-400" />
                  <span>{slot2Drone ? `Cánh Phải: ${slot2Drone.vietnameseName.replace('DR-', '')}` : '+ Lắp Drone 2'}</span>
                  {slot2Drone && <span className="text-amber-400 font-bold ml-0.5">★{slot2Drone.tier}</span>}
                </button>
              </div>
            </div>

            {/* Right Cycle Button */}
            <button
              onClick={() => handleCycleFighter('next')}
              aria-label="Chiến cơ tiếp theo"
              className="absolute right-1.5 sm:right-4 z-30 pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/60 hover:border-cyan-300 text-cyan-300 flex items-center justify-center transition-all cursor-pointer touch-manipulation active:scale-90 shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md"
              title="Đổi sang chiến cơ tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* =========================================================================
              PRIMARY COMBAT SORTIE LAUNCH STATION (VỊ TRÍ NỔI BẬT CHÍNH GIỮA MÀN HÌNH - KHÔNG BAO GIỜ BỊ MẤT)
              ========================================================================= */}
          <div className="w-full max-w-xl mx-auto my-1.5 z-30 pointer-events-auto flex items-center justify-center gap-2 px-1">
            {/* Mode Switcher Button */}
            <button
              type="button"
              onClick={onOpenModeSelect}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all active:scale-95 cursor-pointer touch-manipulation shrink-0 ${
                activeGameMode === 'super_hard'
                  ? 'bg-red-950/85 hover:bg-red-900/85 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : activeGameMode === 'adventure'
                  ? 'bg-indigo-950/85 hover:bg-indigo-900/85 border-indigo-400 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : activeGameMode === 'boss_rush'
                  ? 'bg-amber-950/85 hover:bg-amber-900/85 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-purple-950/75 hover:bg-purple-900/75 border-purple-400/80 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              }`}
              title="Đổi chế độ chơi: Siêu Khó / Bản Đồ Vũ Trụ / Hạm Đội Ma / Boss Rush / Vô Tận / Du Ngoạn"
            >
              <span className="text-base sm:text-lg">
                {activeGameMode === 'super_hard'
                  ? '🔥'
                  : activeGameMode === 'adventure'
                  ? '🛸'
                  : activeGameMode === 'boss_rush'
                  ? '👑'
                  : activeGameMode === 'free_flight'
                  ? '🌌'
                  : activeGameMode === 'universe'
                  ? '🗺️'
                  : '♾️'}
              </span>
              <div className="text-left">
                <div className={`text-[7px] sm:text-[8px] font-orbitron font-bold uppercase tracking-wider ${activeGameMode === 'super_hard' ? 'text-red-400' : 'text-purple-400'}`}>
                  CHẾ ĐỘ CHƠI
                </div>
                <div className="text-[10px] sm:text-xs font-orbitron font-black text-white flex items-center gap-0.5">
                  <span className="truncate max-w-[100px] sm:max-w-[170px]">
                    {activeGameMode === 'super_hard'
                      ? 'Chế Độ Siêu Khó'
                      : activeGameMode === 'adventure'
                      ? 'Hạm Đội Ma'
                      : activeGameMode === 'boss_rush'
                      ? 'Đại Chiến Boss'
                      : activeGameMode === 'free_flight'
                      ? 'Du Ngoạn'
                      : activeGameMode === 'universe' && activeUniverse
                      ? `Map ${activeUniverse.id}: ${activeUniverse.name.split(':')[0]}`
                      : 'Vô Tận'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-purple-300 shrink-0" />
                </div>
              </div>
            </button>

            {/* Giant Prominent XUẤT CHIẾN Button */}
            {hasNoFighters ? (
              <button
                type="button"
                onClick={() => onOpenGacha('fighters')}
                className="flex-1 min-h-[46px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
                <span>QUAY GACHA</span>
              </button>
            ) : (
              <button
                type="button"
                data-start="true"
                onClick={onStartGame}
                className="flex-1 min-h-[46px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-cyan-300 hover:via-white hover:to-cyan-300 text-slate-950 font-orbitron font-black text-sm sm:text-base tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.85)] hover:shadow-[0_0_45px_rgba(6,182,212,1)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 touch-manipulation border-2 border-white/80"
              >
                <Flame className="w-5 h-5 text-slate-950 animate-pulse" />
                <span>🔥 XUẤT CHIẾN NGAY 🚀</span>
              </button>
            )}
          </div>

          {/* 4. DI CHUYỂN BẢN THÔNG TIN Ở NGOÀI SẢNH XUỐNG PHÍA DƯỚI (THEO YÊU CẦU) */}
          <div className="w-full pointer-events-auto rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/90 to-slate-950/90 border border-cyan-500/40 p-2 sm:p-2.5 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col gap-1.5 backdrop-blur-md mt-1 min-h-0 max-h-[175px] sm:max-h-[220px] overflow-y-auto scrollbar-thin">
            {/* Specs Row */}
            <div className="grid grid-cols-4 gap-1 text-[9px] sm:text-[10px] font-orbitron">
              <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">🩸 MÁU:</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {currentFighter.maxHp}
                  {currentAccBonuses.maxHpBonus > 0 && <span className="text-[8px] text-emerald-300">+{currentAccBonuses.maxHpBonus}</span>}
                </span>
              </div>
              <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">🛡️ GIÁP:</span>
                <span className="text-cyan-400 font-bold tabular-nums">
                  {currentFighter.maxArmor}
                  {currentAccBonuses.maxArmorBonus > 0 && <span className="text-[8px] text-cyan-300">+{currentAccBonuses.maxArmorBonus}</span>}
                </span>
              </div>
              <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">⚡ BẮN:</span>
                <span className="text-yellow-400 font-bold tabular-nums">
                  {currentFighter.id === 'arc_tempest' ? '12/0.1s' : currentFighter.id === 'rts_88' ? '22/0.1s' : `${currentFighter.fireRate}/s`}
                </span>
              </div>
              <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">🚀 TỐC:</span>
                <span className="text-sky-300 font-bold tabular-nums">
                  {currentFighter.speed}
                </span>
              </div>
            </div>

            {/* Skill Description */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[9px] sm:text-[10px] font-rajdhani text-left">
              <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="truncate">
                <strong className="text-cyan-300 font-orbitron">{currentFighter.skillName}:</strong>{' '}
                <span className="text-slate-300">{currentFighter.skillDescription}</span>
              </div>
            </div>

            {/* DEDICATED PILOT & COCKPIT CONTROL BOX (Ô TAY LÁI / BUỒNG LÁI PHI CÔNG) */}
            <div
              onClick={() => {
                sound.playClick();
                onOpenPilots();
              }}
              className={`w-full p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 backdrop-blur-md active:scale-[0.99] group ${
                equippedPilot
                  ? 'bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-950/80 border-purple-500/50 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-950/80 border-dashed border-amber-500/50 hover:border-amber-400'
              }`}
              title="Nhấn để mở Kho Phi Công & Bổ nhiệm tay lái cho phi đội"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Avatar with Tier Frame */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 border shadow ${
                    equippedPilot
                      ? equippedPilot.tier === 'S'
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : equippedPilot.tier === 'A'
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-slate-900 border-dashed border-amber-500/60'
                  }`}
                >
                  {equippedPilot ? equippedPilot.avatarEmoji : '🧑‍✈️'}
                </div>

                {/* Pilot Details */}
                <div className="min-w-0 flex-1">
                  {equippedPilot ? (
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-orbitron font-bold text-slate-300">
                          TAY LÁI:
                        </span>
                        <span className="text-[11px] font-orbitron font-black text-white group-hover:text-purple-200 truncate">
                          {equippedPilot.callsign}
                        </span>
                        <span
                          className={`text-[8px] font-orbitron font-black px-1.5 py-0.2 rounded uppercase ${
                            equippedPilot.tier === 'S'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-400'
                              : equippedPilot.tier === 'A'
                              ? 'bg-purple-500/25 text-purple-300 border border-purple-400'
                              : 'bg-cyan-500/25 text-cyan-300 border border-cyan-400'
                          }`}
                        >
                          BẬC {equippedPilot.tier}
                        </span>
                        <span className="text-[9px] text-slate-400 font-rajdhani hidden sm:inline">
                          ({equippedPilot.name})
                        </span>
                      </div>

                      {/* Highlighted Combat Buffs */}
                      <div className="flex items-center gap-1 flex-wrap mt-0.5 text-[8.5px] font-orbitron font-bold">
                        {equippedPilot.bonus.damagePercent > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            ST +{equippedPilot.bonus.damagePercent}%
                          </span>
                        )}
                        {equippedPilot.bonus.critRatePercent > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Bạo +{equippedPilot.bonus.critRatePercent}%
                          </span>
                        )}
                        {equippedPilot.bonus.cooldownReductionPercent > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Hồi Chiêu -{equippedPilot.bonus.cooldownReductionPercent}%
                          </span>
                        )}
                        {equippedPilot.bonus.armorBonus > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            Giáp +{equippedPilot.bonus.armorBonus}
                          </span>
                        )}
                        {equippedPilot.bonus.speedPercent > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            Tốc +{equippedPilot.bonus.speedPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] font-orbitron font-bold text-amber-300 flex items-center gap-1">
                        <span>⚠️ CHƯA BỔ NHIỆM TAY LÁI</span>
                        <span className="text-[8px] bg-amber-500/20 text-amber-200 px-1 py-0.2 rounded font-mono">
                          TRỐNG
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-rajdhani truncate">
                        Bổ nhiệm phi công để kích hoạt thêm 3-5 chỉ số chiến đấu và tuyệt kỹ hỗ trợ!
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex items-center gap-1.5">
                {equippedPilot && onOpenPilotDetail && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onOpenPilotDetail(equippedPilot);
                    }}
                    className="px-2 py-1 rounded-lg text-[9px] font-orbitron font-bold flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 hover:border-cyan-300 transition-all cursor-pointer shadow-sm active:scale-95"
                    title={`Xem thông tin chi tiết và tiểu sử của ${equippedPilot.callsign}`}
                  >
                    <Info className="w-3 h-3 text-cyan-400" />
                    <span>THÔNG TIN</span>
                  </button>
                )}
                <span
                  className={`px-2 py-1 rounded-lg text-[9px] font-orbitron font-bold flex items-center gap-1 transition-all ${
                    equippedPilot
                      ? 'bg-purple-950/80 border border-purple-400/60 text-purple-200 group-hover:bg-purple-900 group-hover:border-purple-300'
                      : 'bg-amber-500/25 border border-amber-400 text-amber-300 group-hover:bg-amber-500/35 animate-pulse'
                  }`}
                >
                  {equippedPilot ? 'ĐỔI TAY LÁI' : '+ CHỌN TAY LÁI'}
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Tactical Action Chips */}
            <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
              {onOpenUpgrade && (
                <button
                  onClick={() => onOpenUpgrade(currentFighter.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/80 text-amber-300 text-[9px] font-orbitron font-bold transition-all active:scale-95 cursor-pointer touch-manipulation"
                  title="Nâng Cấp Sao cho chiến cơ này"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>NÂNG SAO</span>
                  <span className="text-[8px] text-yellow-200 bg-amber-950/80 px-1 py-0.2 rounded">
                    🧩 {currentShardCount}
                  </span>
                </button>
              )}

              <button
                onClick={onOpenPilots}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/60 text-purple-200 text-[9px] font-orbitron font-semibold transition-all active:scale-95 cursor-pointer touch-manipulation"
                title="Bổ nhiệm phi công"
              >
                <span>{equippedPilot ? equippedPilot.avatarEmoji : '🧑‍✈️'}</span>
                <span className="truncate max-w-[70px] sm:max-w-[95px]">{equippedPilot ? equippedPilot.callsign : 'Kho Tay Lái'}</span>
              </button>

              <button
                onClick={onOpenAccessories}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/60 text-cyan-200 text-[9px] font-orbitron font-semibold transition-all active:scale-95 cursor-pointer touch-manipulation"
                title="Lắp ráp phụ kiện vũ khí"
              >
                <Wrench className="w-3 h-3 text-cyan-400" />
                <span>Phụ kiện ({currentInstalledAccs.length}/3)</span>
              </button>

              {onOpenDrones && (
                <button
                  onClick={() => onOpenDrones()}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 text-[9px] font-orbitron font-semibold transition-all active:scale-95 cursor-pointer touch-manipulation"
                  title="Kho Máy Bay Không Người Lái (Drone)"
                >
                  <Radio className="w-3 h-3 text-emerald-400" />
                  <span>Drone ({(equippedDroneIds || []).length}/2)</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playClick();
                  setIsFleetModalOpen(true);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-[9px] font-orbitron font-bold transition-all active:scale-95 cursor-pointer touch-manipulation"
                title="Mở toàn bộ Kho Phi Đội"
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>KHO TÀU ({safeOwnedFighterIds.length}/{allFighters.length})</span>
              </button>

              <button
                onClick={() => onOpenGacha('fighters')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/35 border border-amber-400 text-amber-300 text-[9px] font-orbitron font-black transition-all active:scale-95 cursor-pointer touch-manipulation shadow"
                title="Quay Gacha triệu hồi Chiến Cơ & Phi Công"
              >
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                <span>GACHA</span>
              </button>
            </div>
          </div>
        </main>

        {/* 5. BOTTOM SORTIE & COMBAT LAUNCH BAR */}
        <footer className="w-full max-w-3xl mx-auto shrink-0 z-30 pb-0.5">
          <div className="w-full pointer-events-auto p-1.5 sm:p-2 rounded-2xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border-2 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md flex items-center justify-between gap-1.5 sm:gap-2">

            {/* Left: Mode Switcher Button */}
            <button
              type="button"
              onClick={onOpenModeSelect}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer touch-manipulation shrink-0 ${
                activeGameMode === 'super_hard'
                  ? 'bg-red-950/70 hover:bg-red-900/70 border-red-500/80 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-purple-950/60 hover:bg-purple-900/60 border-purple-400/70 text-purple-200'
              }`}
              title="Đổi chế độ chơi: Siêu Khó / Bản Đồ Vũ Trụ / Hạm Đội Ma / Boss Rush / Vô Tận / Du Ngoạn"
            >
              <span className="text-base sm:text-lg">
                {activeGameMode === 'super_hard'
                  ? '🔥'
                  : activeGameMode === 'adventure'
                  ? '🛸'
                  : activeGameMode === 'boss_rush'
                  ? '👑'
                  : activeGameMode === 'free_flight'
                  ? '🌌'
                  : activeGameMode === 'universe'
                  ? '🗺️'
                  : '♾️'}
              </span>
              <div className="text-left">
                <div className={`text-[7px] sm:text-[8px] font-orbitron font-bold uppercase tracking-wider ${activeGameMode === 'super_hard' ? 'text-red-400' : 'text-purple-400'}`}>
                  CHẾ ĐỘ CHƠI
                </div>
                <div className="text-[10px] sm:text-xs font-orbitron font-black text-white flex items-center gap-0.5">
                  <span className="truncate max-w-[130px] sm:max-w-[220px]">
                    {activeGameMode === 'super_hard'
                      ? 'Chế Độ Siêu Khó'
                      : activeGameMode === 'adventure'
                      ? 'Hạm Đội Ma'
                      : activeGameMode === 'boss_rush'
                      ? 'Đại Chiến Boss'
                      : activeGameMode === 'free_flight'
                      ? 'Du Ngoạn'
                      : activeGameMode === 'universe' && activeUniverse
                      ? `Map ${activeUniverse.id}: ${activeUniverse.name.split(':')[0]}`
                      : 'Vô Tận'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-purple-300 shrink-0" />
                </div>
              </div>
            </button>

            {/* Right: Main Launch CTA Button */}
            {hasNoFighters ? (
              <button
                type="button"
                onClick={() => onOpenGacha('fighters')}
                className="flex-1 sm:flex-initial min-h-[42px] px-4 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
                <span>QUAY GACHA</span>
              </button>
            ) : (
              <button
                type="button"
                data-start="true"
                onClick={onStartGame}
                className="flex-1 sm:flex-initial min-h-[42px] px-5 sm:px-8 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 text-slate-950 font-orbitron font-black text-xs sm:text-sm tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.7)] hover:shadow-[0_0_35px_rgba(6,182,212,0.9)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation"
              >
                <Flame className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>XUẤT CHIẾN</span>
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* =========================================================================
          6. THE QUICK FEATURES HUB MODAL (TẬP HỢP TÍNH NĂNG TRONG MENU)
          ========================================================================= */}
      {isQuickHubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/70 p-3.5 sm:p-5 shadow-[0_0_35px_rgba(6,182,212,0.3)] flex flex-col gap-3 text-left max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-orbitron font-black text-base text-white tracking-wide">
                    TRUNG TÂM TÍNH NĂNG
                  </h2>
                  <p className="text-[10px] text-slate-400 font-rajdhani">
                    Quản lý nhiệm vụ, thư từ, điểm danh, nạp thẻ & sự kiện
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsQuickHubOpen(false)}
                aria-label="Đóng Menu"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-400 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Commander Profile & Rename Card */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-purple-950/60 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-xl shadow shrink-0">
                  {playerAvatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-orbitron font-black text-xs sm:text-sm text-white truncate max-w-[150px]">
                      {playerName}
                    </span>
                    <span className="text-[8px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-orbitron">
                      {playerCallsign}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-rajdhani">
                    Chỉ Huy Trưởng · VIP {vipStatus.currentTier.level}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQuickHubOpen(false);
                  if (onOpenProfile) onOpenProfile();
                }}
                className="px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-orbitron font-bold text-[9px] transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow shrink-0"
              >
                <Edit3 className="w-3 h-3" />
                <span>ĐỔI TÊN</span>
              </button>
            </div>

            {/* Feature Action Grid (Clean 2-column layout) */}
            <div className="grid grid-cols-2 gap-2">
              {/* Daily Bonus */}
              <button
                onClick={() => {
                  setIsQuickHubOpen(false);
                  onOpenDailyBonus();
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all active:scale-95 cursor-pointer ${
                  isDailyBonusReady
                    ? 'bg-amber-950/60 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
                  <Gift className={`w-4 h-4 ${isDailyBonusReady ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-orbitron font-bold text-xs truncate flex items-center justify-between">
                    <span>ĐIỂM DANH</span>
                    {isDailyBonusReady && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 font-rajdhani truncate">
                    {isDailyBonusReady ? 'Nhận thưởng ngay!' : `Chờ: ${dailyBonusCountdown}`}
                  </div>
                </div>
              </button>

              {/* Missions */}
              <button
                onClick={() => {
                  setIsQuickHubOpen(false);
                  onOpenMissions();
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-cyan-400/70 text-slate-300 text-left transition-all active:scale-95 cursor-pointer relative"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-orbitron font-bold text-xs truncate">NHIỆM VỤ</div>
                  <div className="text-[9px] text-slate-400 font-rajdhani truncate">
                    {claimableMissionsCount > 0 ? `${claimableMissionsCount} nhiệm vụ chờ nhận` : 'Tác chiến hằng ngày'}
                  </div>
                </div>
                {claimableMissionsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black font-orbitron flex items-center justify-center shadow">
                    {claimableMissionsCount}
                  </span>
                )}
              </button>

              {/* Mailbox */}
              <button
                onClick={() => {
                  setIsQuickHubOpen(false);
                  onOpenMailbox();
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-slate-600 text-slate-300 text-left transition-all active:scale-95 cursor-pointer relative"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Mail className={`w-4 h-4 ${unclaimedMailCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-orbitron font-bold text-xs truncate">HỘP THƯ</div>
                  <div className="text-[9px] text-slate-400 font-rajdhani truncate">
                    {unclaimedMailCount > 0 ? `${unclaimedMailCount} thư chưa đọc` : 'Công văn & quà tặng'}
                  </div>
                </div>
                {unclaimedMailCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black font-orbitron flex items-center justify-center shadow">
                    {unclaimedMailCount}
                  </span>
                )}
              </button>

              {/* VIP / Recharge */}
              <button
                onClick={() => {
                  setIsQuickHubOpen(false);
                  onOpenRecharge('packs');
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-gradient-to-r from-amber-950/40 to-slate-900 border-amber-500/50 hover:border-amber-400 text-amber-200 text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-orbitron font-bold text-xs truncate">NẠP THẺ & VIP</div>
                  <div className="text-[9px] text-amber-300 font-orbitron">
                    VIP {vipStatus.currentTier.level}
                  </div>
                </div>
              </button>

              {/* Boss Rush Leaderboard */}
              {onOpenBossRushLeaderboard && (
                <button
                  onClick={() => {
                    setIsQuickHubOpen(false);
                    onOpenBossRushLeaderboard();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-rose-400 text-slate-300 text-left transition-all active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-500/60 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-orbitron font-bold text-xs truncate">BXH BOSS</div>
                    <div className="text-[9px] text-slate-400 font-rajdhani truncate">Kỷ lục hạ gục</div>
                  </div>
                </button>
              )}

              {/* Saved Loadouts */}
              {onOpenSavedLoadouts && (
                <button
                  onClick={() => {
                    setIsQuickHubOpen(false);
                    onOpenSavedLoadouts();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-blue-400 text-slate-300 text-left transition-all active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-400/60 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-orbitron font-bold text-xs truncate">ĐỘI HÌNH LƯU</div>
                    <div className="text-[9px] text-slate-400 font-rajdhani truncate">
                      {savedLoadouts?.length || 3} tổ hợp trang bị
                    </div>
                  </div>
                </button>
              )}

              {/* Drone Hangar */}
              {onOpenDrones && (
                <button
                  onClick={() => {
                    setIsQuickHubOpen(false);
                    onOpenDrones();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-emerald-400 text-slate-300 text-left transition-all active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-orbitron font-bold text-xs truncate">KHO DRONE CHIẾN ĐẤU</div>
                    <div className="text-[9px] text-emerald-400 font-rajdhani truncate">
                      Đã trang bị {(equippedDroneIds || []).length}/2 Drone
                    </div>
                  </div>
                </button>
              )}

              {/* Drone Gacha */}
              {onOpenDroneGacha && (
                <button
                  onClick={() => {
                    setIsQuickHubOpen(false);
                    onOpenDroneGacha();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/50 hover:border-emerald-400 text-emerald-200 text-left transition-all active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-orbitron font-bold text-xs truncate">GACHA DRONE BẬC S</div>
                    <div className="text-[9px] text-emerald-300 font-rajdhani truncate">
                      Triệu hồi Drone hộ tống & Hút máu
                    </div>
                  </div>
                </button>
              )}

              {/* 80 Universes Starmap */}
              {onOpenUniverseSelect && (
                <button
                  onClick={() => {
                    setIsQuickHubOpen(false);
                    onOpenUniverseSelect();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-purple-400 text-slate-300 text-left transition-all active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-400/60 flex items-center justify-center shrink-0">
                    <Globe2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-orbitron font-bold text-xs truncate">BẢN ĐỒ 80 VŨ TRỤ</div>
                    <div className="text-[9px] text-purple-300 font-orbitron">
                      {universeConqueredCount}/80 Chinh phục
                    </div>
                  </div>
                </button>
              )}

              {/* Adventure Mode CI4 */}
              {onOpenAdventureMap && (
                <button
                  onClick={() => {
                    setIsQuickHubOpen(false);
                    onOpenAdventureMap();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-rose-400 text-slate-300 text-left transition-all active:scale-95 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-950/60 border border-rose-500/60 flex items-center justify-center shrink-0 text-base">
                    👹
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-orbitron font-bold text-xs truncate">HẠM ĐỘI MA</div>
                    <div className="text-[9px] text-amber-300 font-orbitron">
                      ⭐ {adventureStars}/60 Sao
                    </div>
                  </div>
                </button>
              )}

              {/* Scenery Selector */}
              <button
                onClick={() => {
                  setIsQuickHubOpen(false);
                  setIsSceneryModalOpen(true);
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-cyan-400 text-slate-300 text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-400/60 flex items-center justify-center shrink-0 text-base">
                  <Compass className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-orbitron font-bold text-xs truncate">PHONG CẢNH & VỊNH MÁY</div>
                  <div className="text-[9px] text-cyan-300 font-orbitron truncate">
                    {SCENERY_CONFIGS[currentSettings.activeScenery]?.name || 'Dải Ngân Hà'}
                  </div>
                </div>
              </button>

              {/* System Settings (Graphics & FPS) */}
              <button
                onClick={() => {
                  setIsQuickHubOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-cyan-400 text-slate-300 text-left transition-all active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-orbitron font-bold text-xs truncate">CÀI ĐẶT ĐỒ HỌA & FPS</div>
                  <div className="text-[9px] text-slate-400 font-rajdhani truncate">
                    {currentSettings.graphicsQuality === 'high' ? 'Đồ họa Cao' : currentSettings.graphicsQuality === 'medium' ? 'Đồ họa Trung' : 'Đồ họa Thấp'} · {currentSettings.fpsTarget} FPS
                  </div>
                </div>
              </button>
            </div>

            {/* Embedded Fleet News & Carousel in Menu */}
            <div className="mt-1">
              <div className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>CHI TIẾT BẢN TIN CHIẾN SỰ</span>
              </div>
              <NewsCarouselWidget
                onOpenGacha={(tab) => {
                  setIsQuickHubOpen(false);
                  onOpenGacha(tab);
                }}
                onOpenUniverseSelect={() => {
                  setIsQuickHubOpen(false);
                  onOpenUniverseSelect?.();
                }}
                onOpenBossRushLeaderboard={() => {
                  setIsQuickHubOpen(false);
                  onOpenBossRushLeaderboard?.();
                }}
                onOpenAccessories={() => {
                  setIsQuickHubOpen(false);
                  onOpenAccessories();
                }}
                onOpenDailyBonus={() => {
                  setIsQuickHubOpen(false);
                  onOpenDailyBonus();
                }}
                onOpenModeSelect={() => {
                  setIsQuickHubOpen(false);
                  onOpenModeSelect?.();
                }}
              />
            </div>

            {/* Bottom Actions: Reset Game Progress Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 font-rajdhani">Phiên bản: 6.2 · Arcade 60 FPS</span>
              <button
                onClick={() => {
                  setIsQuickHubOpen(false);
                  setIsResetModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-[9px] font-orbitron transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại tiến trình</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. THE FULL FLEET HANGAR MODAL (DUYỆT TOÀN BỘ 31 TÀU KHI NGƯỜI DÙNG CẦN)
          ========================================================================= */}
      {isFleetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/70 p-3.5 sm:p-5 shadow-[0_0_35px_rgba(6,182,212,0.3)] flex flex-col gap-3 text-left max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-orbitron font-black text-base text-white tracking-wide">
                    KHO PHI ĐỘI TIÊN PHONG
                  </h2>
                  <p className="text-[10px] text-slate-400 font-rajdhani">
                    {safeOwnedFighterIds.length}/{allFighters.length} Chiến cơ đã sẵn sàng xuất trận
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFleetModalOpen(false)}
                aria-label="Đóng Kho Tàu"
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-400 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-orbitron font-bold text-slate-400">BỘ LỌC TÀU:</span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[9px] font-orbitron font-bold">
                <button
                  onClick={() => setFleetTierFilter('ALL')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    fleetTierFilter === 'ALL'
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  TẤT CẢ
                </button>
                <button
                  onClick={() => setFleetTierFilter('OWNED')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    fleetTierFilter === 'OWNED'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ĐÃ CÓ ({safeOwnedFighterIds.length})
                </button>
                {(['S', 'A', 'B'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setFleetTierFilter(tier)}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      fleetTierFilter === tier
                        ? tier === 'S'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-400'
                          : tier === 'A'
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-400'
                          : 'bg-cyan-500/30 text-cyan-300 border border-cyan-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    BẬC {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of 31 Fighters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto pr-1 max-h-[55vh]">
              {filteredFighters.map((f) => {
                const isSelected = f.id === currentFighter.id;
                const isOwned = ownedSet.has(f.id);
                const star = fighterStars[f.id] || 1;

                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      if (isOwned) {
                        onSelectFighter(f.id);
                        setIsFleetModalOpen(false);
                      } else {
                        setIsFleetModalOpen(false);
                        onOpenGacha('fighters');
                      }
                    }}
                    className={`relative flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer touch-manipulation active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/90 via-slate-900 to-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : isOwned
                        ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                        : 'bg-slate-950/40 border-slate-800/50 opacity-60 hover:opacity-80'
                    }`}
                    style={{
                      borderLeftWidth: '3px',
                      borderLeftColor: f.color || (f.tier === 'S' ? '#f59e0b' : f.tier === 'A' ? '#a855f7' : '#06b6d4'),
                    }}
                  >
                    <div className="min-w-0 flex-1 pr-1">
                      <div className="flex items-center gap-1">
                        <span className="font-orbitron font-bold text-[11px] truncate" style={{ color: f.color }}>
                          {f.vietnameseName}
                        </span>
                        <span
                          className={`text-[8px] px-1 py-0.2 rounded font-orbitron font-black shrink-0 ${
                            f.tier === 'S'
                              ? 'bg-amber-500/20 text-amber-300'
                              : f.tier === 'A'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {f.tier}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[9px] font-orbitron">
                        {isOwned ? (
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: star }).map((_, si) => (
                              <Star key={si} className="w-2 h-2 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-0.5 text-[8px]">
                            <Lock className="w-2.5 h-2.5" /> GACHA
                          </span>
                        )}

                        <span className="text-[8px] text-slate-400 font-rajdhani">
                          {f.maxHp}HP / {f.maxArmor}G
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                          <Check className="w-3 h-3 text-cyan-300" />
                        </span>
                      ) : isOwned ? (
                        <span className="text-[8px] font-orbitron text-slate-500">
                          CHỌN
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onConfirm={() => {
          setIsResetModalOpen(false);
          onResetProgress();
        }}
        onCancel={() => setIsResetModalOpen(false)}
      />

      {/* Graphics Quality & FPS Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={currentSettings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSceneryModal={() => {
          setIsSettingsModalOpen(false);
          setIsSceneryModalOpen(true);
        }}
      />

      {/* Scenery Selector Modal */}
      <ScenerySelectModal
        isOpen={isSceneryModalOpen}
        onClose={() => setIsSceneryModalOpen(false)}
        activeScenery={currentSettings.activeScenery}
        onSelectScenery={(scenery) => handleUpdateSettings({ activeScenery: scenery })}
      />
    </>
  );
};
