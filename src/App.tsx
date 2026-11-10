/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect,useRef,useState,useCallback } from 'react';
import { SkyVanguardEngine,EngineHUDState } from './game/SkyVanguardEngine';
import {
FIGHTERS,
FighterStats,
STARTING_GEMS,
INITIAL_MISSIONS,
Mission,
executeGachaPull,
executePilotGachaPull,
updateMissionProgress,
claimMissionReward,
GachaItem,
PilotGachaItem,
DailyLoginState,
INITIAL_DAILY_LOGIN_STATE,
checkDailyBonusStatus,
claimDailyBonusReward,
toggleCosmeticSkin,
getActiveSkinForFighter,
PILOTS,
Pilot,
WEAPON_ACCESSORIES,DifficultyLevel,STARTING_GOLD,
calculateGoldReward,
upgradeFighterStar,
getAstraeaBannerStatus
} from './game/rules';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { PauseModal,GameOverModal } from './components/Modals';
import { GachaModal,GachaBannerTab } from './components/GachaModal';
import { MissionsModal } from './components/MissionsModal';
import { DailyLoginModal } from './components/DailyLoginModal';
import { PilotsModal } from './components/PilotsModal';
import { PilotDetailModal } from './components/PilotDetailModal';
import { AccessoriesModal } from './components/AccessoriesModal';
import { RechargeModal } from './components/RechargeModal';
import { MailboxModal } from './components/MailboxModal';
import { FighterUpgradeModal } from './components/FighterUpgradeModal';
import { FighterDetailModal } from './components/FighterDetailModal';
import { CommanderProfileModal } from './components/CommanderProfileModal';
import { DroneGachaModal } from './components/DroneGachaModal';
import { DronesModal } from './components/DronesModal';
import { executeDroneGachaPull,DRONES,DroneGachaItem } from './game/drones';
import { getPlayerProfile,savePlayerProfile,PlayerProfile } from './game/profile';
import {
INITIAL_MAILS,
MailItem,
getUnclaimedMailCount,
markMailAsRead,
claimMailReward,
claimAllMails,
deleteClaimedMails,
checkAndDispatchHourlyMails,
} from './game/mail';
import { ModeSelectModal } from './components/ModeSelectModal';
import { UniverseSelectModal } from './components/UniverseSelectModal';
import { BossRushLeaderboardModal } from './components/BossRushLeaderboardModal';
import { addBossRushRecord } from './game/bossRushLeaderboard';
import {
GameSettings,
loadGameSettings,
saveGameSettings,
} from './game/lobbySettings';
import { AdventureMapModal } from './components/AdventureMapModal';
import {
AdventureProgress,
getInitialAdventureProgress,
completeAdventureStage,
calculateStageStars,
getAdventureStageById,
} from './game/adventure';
import {
getInitialUniverseProgress,
updateUniverseConquestProgress,
getUniverseById,
UNIVERSE_MILESTONES,
getConquestSummary,
} from './game/universe';
import {
RechargeSystemState,
INITIAL_RECHARGE_STATE,
executeRechargePurchase,
executeGoldRechargePurchase,
executePassPurchase,
claimPassDailyGems,
claimFirstRechargeReward,
claimVipLevelReward,
redeemGiftCode,
RechargeTab,
getVipStatus,
} from './game/recharge';

const ALL_FIGHTER_KEYS = Object.keys(FIGHTERS);
const ALL_PILOT_KEYS = Object.keys(PILOTS);
const ALL_ACCESSORY_KEYS = Object.keys(WEAPON_ACCESSORIES);
const ALL_DRONE_KEYS = Object.keys(DRONES);

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SkyVanguardEngine | null>(null);

  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover'>('title');
  const [selectedFighter, setSelectedFighter] = useState<FighterStats>(FIGHTERS.rts_88 || FIGHTERS.phoenix);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted);

  // Difficulty selection state ('easy' | 'normal' | 'hard')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_difficulty');
      if (saved === 'easy' || saved === 'normal' || saved === 'hard') return saved as DifficultyLevel;
    } catch {}
    return 'normal';
  });

  // Persistent Currency & Collection State
  const [gems, setGems] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_gems');
      return saved !== null ? parseInt(saved, 10) : STARTING_GEMS; // 5,000 gems starting bonus
    } catch {
      return STARTING_GEMS;
    }
  });

  // Persistent Gold Currency (Vàng để mua phụ kiện và nâng sao máy bay)
  const [gold, setGold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_gold');
      return saved !== null ? parseInt(saved, 10) : STARTING_GOLD;
    } catch {
      return STARTING_GOLD;
    }
  });

  // Persistent Fighter Shards (Mảnh chiến cơ để nâng cấp Sao)
  const [fighterShards, setFighterShards] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_fighter_shards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Persistent Fighter Star Levels (Cấp Sao từ ★1 đến ★6)
  const [fighterStars, setFighterStars] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_fighter_stars');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // User Graphics Quality, FPS Target & Lobby Scenery Settings
  const [gameSettings, setGameSettings] = useState<GameSettings>(() => loadGameSettings());

  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    const updated = saveGameSettings(newSettings);
    setGameSettings(updated);
    if (newSettings.isMuted !== undefined) {
      setIsMuted(newSettings.isMuted);
    }
  }, []);

  // Mở khoá toàn bộ máy bay (bao gồm RTS-88 Tia Chớp)
  const [ownedFighterIds, setOwnedFighterIds] = useState<string[]>(() => {
    return ALL_FIGHTER_KEYS;
  });

  // Mở khoá toàn bộ phi công (tay lái)
  const [ownedPilotIds, setOwnedPilotIds] = useState<string[]>(() => {
    return ALL_PILOT_KEYS;
  });

  const [equippedPilotId, setEquippedPilotId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_equipped_pilot');
      if (saved && PILOTS[saved]) return saved;
    } catch {}
    return 'pilot_valkyrie_s'; // S-tier pilot equipped
  });

  // Mở khoá toàn bộ phụ kiện vũ khí
  const [ownedAccessoryIds, setOwnedAccessoryIds] = useState<string[]>(() => {
    return ALL_ACCESSORY_KEYS;
  });

  const [fighterAccessories, setFighterAccessories] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_fighter_accessories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Pity counters
  const [pityS, setPityS] = useState<number>(() => {
    try {
      const s = localStorage.getItem('sky_vanguard_pity_s');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [pityA, setPityA] = useState<number>(() => {
    try {
      const s = localStorage.getItem('sky_vanguard_pity_a');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [pilotPityS, setPilotPityS] = useState<number>(() => {
    try {
      const s = localStorage.getItem('sky_vanguard_pilot_pity_s');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [pilotPityA, setPilotPityA] = useState<number>(() => {
    try {
      const s = localStorage.getItem('sky_vanguard_pilot_pity_a');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Mở khoá toàn bộ drone (Máy bay không người lái)
  const [ownedDroneIds, setOwnedDroneIds] = useState<string[]>(() => {
    return ALL_DRONE_KEYS;
  });

  const [equippedDroneIds, setEquippedDroneIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_equipped_drones');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['drone_overclock_s', 'drone_aegis_s']; // Equipped S-tier drones
  });

  const [dronePityS, setDronePityS] = useState<number>(() => {
    try {
      const s = localStorage.getItem('sky_vanguard_drone_pity_s');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [dronePityA, setDronePityA] = useState<number>(() => {
    try {
      const s = localStorage.getItem('sky_vanguard_drone_pity_a');
      return s ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const s = localStorage.getItem('sky_vanguard_missions');
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_MISSIONS;
  });

  // Daily Login Bonus State
  const [dailyLoginState, setDailyLoginState] = useState<DailyLoginState>(() => {
    try {
      const s = localStorage.getItem('sky_vanguard_daily_login');
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_DAILY_LOGIN_STATE;
  });
  const [isDailyBonusOpen, setIsDailyBonusOpen] = useState<boolean>(false);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Real-time clock for 24h cooldown timer
  useEffect(() => {
    const interval = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Đảm bảo lưu toàn bộ máy bay, phi công, phụ kiện, drone đã mở khoá vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sky_vanguard_fighters', JSON.stringify(ALL_FIGHTER_KEYS));
      localStorage.setItem('sky_vanguard_pilots', JSON.stringify(ALL_PILOT_KEYS));
      localStorage.setItem('sky_vanguard_owned_accessories', JSON.stringify(ALL_ACCESSORY_KEYS));
      localStorage.setItem('sky_vanguard_owned_drones', JSON.stringify(ALL_DRONE_KEYS));
    } catch {}
  }, []);

  const dailyBonusStatus = checkDailyBonusStatus(dailyLoginState, nowTime);

  // Modals Visibility
  const [isGachaOpen, setIsGachaOpen] = useState<boolean>(false);
  const [gachaInitialTab, setGachaInitialTab] = useState<GachaBannerTab>('fighters');
  const [isPilotsOpen, setIsPilotsOpen] = useState<boolean>(false);
  const [isAccessoriesOpen, setIsAccessoriesOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState<boolean>(false);
  const [rechargeInitialTab, setRechargeInitialTab] = useState<RechargeTab>('packs');
  const [isMailboxOpen, setIsMailboxOpen] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeModalFighterId, setUpgradeModalFighterId] = useState<string>('phoenix');
  // Fighter Detail Dossier State
  const [detailFighter, setDetailFighter] = useState<FighterStats | null>(null);
  // Pilot Detail Dossier State
  const [detailPilot, setDetailPilot] = useState<Pilot | null>(null);

  // Drone Modals Visibility
  const [isDroneGachaOpen, setIsDroneGachaOpen] = useState<boolean>(false);
  const [isDronesModalOpen, setIsDronesModalOpen] = useState<boolean>(false);

  // In-Game & Lobby Toast Notifications
  const [missionToast, setMissionToast] = useState<string | null>(null);

  // Commander Profile & Renaming State
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => getPlayerProfile());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const handleSaveProfile = useCallback((newProfile: { playerName: string; callsign: string; avatar: string }) => {
    const res = savePlayerProfile(newProfile);
    if (res.success) {
      setPlayerProfile(res.profile);
      setMissionToast(`🧑‍✈️ Đã đổi tên thành công: ${res.profile.playerName}`);
      setTimeout(() => setMissionToast(null), 3000);
    }
  }, []);

  // Mailbox State
  const [mails, setMails] = useState<MailItem[]>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_mailbox');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MAILS;
  });

  // Hourly Mail Dispatch Timestamp (records last dispatch time)
  const [lastMailDispatch, setLastMailDispatch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_last_mail_dispatch');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return Date.now();
  });

  // Astraea Limited Banner 10-day Start Timestamp
  const [astraeaBannerStartTime, setAstraeaBannerStartTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_astraea_banner_start');
      if (saved) return parseInt(saved, 10);
    } catch {}
    const now = Date.now();
    try {
      localStorage.setItem('sky_vanguard_astraea_banner_start', String(now));
    } catch {}
    return now;
  });

  // Periodically check for hourly random military dispatches in mailbox (every 30 seconds)
  useEffect(() => {
    const checkMailbox = () => {
      const now = Date.now();
      const res = checkAndDispatchHourlyMails(mails, lastMailDispatch, now);
      if (res.hasNewMail) {
        setMails(res.updatedMails);
        setLastMailDispatch(res.newLastDispatchMs);
        try {
          localStorage.setItem('sky_vanguard_mailbox', JSON.stringify(res.updatedMails));
          localStorage.setItem('sky_vanguard_last_mail_dispatch', String(res.newLastDispatchMs));
        } catch {}
        sound.playReward();
        setMissionToast('📬 Nhận được Công Văn Quân Sự mới trong Hộp Thư!');
        setTimeout(() => setMissionToast(null), 4000);
      }
    };

    checkMailbox();
    const interval = setInterval(checkMailbox, 30000);
    return () => clearInterval(interval);
  }, [mails, lastMailDispatch]);

  // Persistent Recharge & VIP State
  const [rechargeState, setRechargeState] = useState<RechargeSystemState>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_recharge_state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RECHARGE_STATE;
  });

  const [isModeSelectOpen, setIsModeSelectOpen] = useState<boolean>(false);
  const [isUniverseSelectOpen, setIsUniverseSelectOpen] = useState<boolean>(false);
  const [isBossRushLeaderboardOpen, setIsBossRushLeaderboardOpen] = useState<boolean>(false);
  const [isAdventureMapOpen, setIsAdventureMapOpen] = useState<boolean>(false);
  const [activeAdventureStageId, setActiveAdventureStageId] = useState<number | null>(1);
  const [adventureProgress, setAdventureProgress] = useState<AdventureProgress>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_adventure_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getInitialAdventureProgress();
  });
  const [highlightBossRushId, setHighlightBossRushId] = useState<string | null>(null);
  const [activeGameMode, setActiveGameMode] = useState<'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard'>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_active_game_mode');
      if (saved === 'endless' || saved === 'universe' || saved === 'boss_rush' || saved === 'adventure' || saved === 'free_flight' || saved === 'super_hard') return saved;
    } catch {}
    return 'super_hard';
  });
  const [activeUniverseId, setActiveUniverseId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_active_universe');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 0 && parsed <= 80) return parsed;
      }
    } catch {}
    return 1;
  });

  const handleSelectUniverseId = useCallback((id: number) => {
    setActiveUniverseId(id);
    setActiveGameMode('universe');
    try {
      localStorage.setItem('sky_vanguard_active_universe', String(id));
      localStorage.setItem('sky_vanguard_active_game_mode', 'universe');
    } catch {}
  }, []);

  const handleSelectGameMode = useCallback((mode: 'endless' | 'universe' | 'boss_rush' | 'free_flight' | 'adventure' | 'super_hard') => {
    setActiveGameMode(mode);
    try {
      localStorage.setItem('sky_vanguard_active_game_mode', mode);
    } catch {}
  }, []);

  // Persistent Universe Conquest Progress (UniverseId 1..20 -> 0..100%)
  const [universeProgress, setUniverseProgress] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_universe_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getInitialUniverseProgress();
  });

  // Persistent Universe Milestones Claimed (Milestone IDs 1..4)
  const [claimedUniverseMilestones, setClaimedUniverseMilestones] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_universe_milestones');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Persistent First-Cleared Universe IDs (1..20)
  const [firstClearedUniverseIds, setFirstClearedUniverseIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sky_vanguard_universe_first_clears');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // HUD State (throttled updates from game loop)
  const [hudState, setHudState] = useState<EngineHUDState>({
    hp: 100,
    maxHp: 100,
    armor: 50,
    maxArmor: 50,
    defense: 10,
    armorPen: 0,
    trueDamage: 0,
    critRate: 15,
    critDamage: 150,
    dodgeChance: 10,
    speed: 420,
    fireRate: 9,
    playTimeSeconds: 0,
    shieldActive: false,
    bombs: 2,
    score: 0,
    highScore: 0,
    combo: 1,
    comboMultiplier: 1.0,
    comboTimerProgress: 0,
    weaponLevel: 1,
    dronesCount: 0,
    wave: 1,
    bossActive: false,
    bossHp: 0,
    bossMaxHp: 1000,
    bossName: 'THIẾT HẠM HƯ KHÔNG · LEVIATHAN',
    bossPhase: 1,
    bossCurrentSkill: 'SẴN SÀNG TẤN CÔNG',
    bossSkillProgress: 0,
    bossIsEnraged: false,
    specialWeapon: 'none',
    specialWeaponTimeRemaining: 0,
    specialWeaponMaxTime: 15,
    skillName: 'Tăng Tốc Siêu Thanh',
    skillDescription: 'Tăng 60% tốc độ và 2x tốc độ bắn',
    skillCooldownRemaining: 0,
    skillCooldownMax: 12,
    skillActive: false,
    skillActiveRemaining: 0,
    sectorIndex: 1,
    sectorName: 'Alpha Void',
    sectorVietnameseName: 'Không Phận Khởi Nguyên',
    sectorSubtitle: 'Vùng Không Gian Sơ Khai · Bão Bụi Lượng Tử',
    sectorAccentColor: '#38bdf8',
    isWarpJumping: false,
    warpJumpProgress: 0,
    difficulty: 'normal',
    difficultyName: 'Bình Thường',
    gameMode: 'endless',
    universeId: null,
    universeName: '',
    universeConquestPercent: 0,
    universeTargetWaves: 0,
    autoFire: true,
    revivesUsed: 0,
  });

  // End of run stats for game over modal
  const [gameOverStats, setGameOverStats] = useState({
    score: 0,
    wave: 1,
    enemiesKilled: 0,
    playTime: 0,
    revivesUsed: 0,
    remainingHp: 0,
    maxHp: 100,
  });
  const [lastEarnedGems, setLastEarnedGems] = useState<number>(0);
  const [lastEarnedGold, setLastEarnedGold] = useState<number>(0);
  const [selectedDroneIdInHangar, setSelectedDroneIdInHangar] = useState<string | null>(null);

  // Save to localStorage
  const saveStateToStorage = useCallback(
    (
      nextGems: number,
      nextFighters: string[],
      nextPityS: number,
      nextPityA: number,
      nextMissions: Mission[]
    ) => {
      try {
        localStorage.setItem('sky_vanguard_gems', String(nextGems));
        localStorage.setItem('sky_vanguard_fighters', JSON.stringify(nextFighters));
        localStorage.setItem('sky_vanguard_pity_s', String(nextPityS));
        localStorage.setItem('sky_vanguard_pity_a', String(nextPityA));
        localStorage.setItem('sky_vanguard_missions', JSON.stringify(nextMissions));
      } catch {}
    },
    []
  );

  // Handle Audio toggle
  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Cosmic Ambient Music Lifecycle: Lobby Ambience in Title, Driving Cosmic Music in Combat
  useEffect(() => {
    if (gameState === 'title') {
      sound.playLobbyMusic();
    } else if (gameState === 'playing') {
      sound.playCombatMusic();
    } else if (gameState === 'gameover') {
      sound.stopMusic();
    }
  }, [gameState]);

  // First user interaction gesture listener to ensure Web Audio plays smoothly with browser autoplay policies
  useEffect(() => {
    const handleFirstGesture = () => {
      if (gameState === 'title') {
        sound.playLobbyMusic();
      }
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [gameState]);

  // Handle Difficulty Selection
  const handleSelectDifficulty = useCallback((diff: DifficultyLevel) => {
    setDifficulty(diff);
    try {
      localStorage.setItem('sky_vanguard_difficulty', diff);
    } catch {}
    if (engineRef.current) {
      engineRef.current.setDifficulty(diff);
    }
  }, []);

  // Sync engine stats with pilot, accessories, fighter stars, and drones
  const syncEngineLoadout = useCallback(
    (
      fighterId: string,
      pilotId: string | null,
      accessoriesMap: Record<string, string[]>,
      currentDifficulty: DifficultyLevel = 'normal',
      starsMap: Record<string, number> = fighterStars,
      dronesList: string[] = equippedDroneIds
    ) => {
      if (engineRef.current) {
        const starLevel = starsMap[fighterId] || 1;
        engineRef.current.setFighter(fighterId, starLevel);
        engineRef.current.setPilot(pilotId);
        engineRef.current.setAccessories(accessoriesMap[fighterId] || []);
        engineRef.current.setDrones(dronesList);
        engineRef.current.setDifficulty(currentDifficulty);
        const skinForFighter = getActiveSkinForFighter(dailyLoginState, fighterId);
        engineRef.current.setCosmeticSkin(skinForFighter);
      }
    },
    [fighterStars, equippedDroneIds, dailyLoginState]
  );

  // Handle Fighter Selection
  const handleSelectFighter = useCallback(
    (fighterId: string) => {
      if (FIGHTERS[fighterId]) {
        setSelectedFighter(FIGHTERS[fighterId]);
        syncEngineLoadout(fighterId, equippedPilotId, fighterAccessories, difficulty, fighterStars);
      }
    },
    [equippedPilotId, fighterAccessories, difficulty, fighterStars, syncEngineLoadout]
  );

  // Handle Start Endless
  const handleStartEndless = useCallback(() => {
    setIsModeSelectOpen(false);
    setActiveGameMode('endless');
    setActiveUniverseId(null);
    if (ownedFighterIds.length === 0) {
      setGachaInitialTab('fighters');
      setIsGachaOpen(true);
      return;
    }
    setGameState('playing');
    if (engineRef.current) {
      syncEngineLoadout(selectedFighter.id, equippedPilotId, fighterAccessories, difficulty);
      engineRef.current.setDifficulty(difficulty);
      engineRef.current.setGameMode('endless', null);
      engineRef.current.startRun();
    }
  }, [ownedFighterIds, selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, syncEngineLoadout]);

  // Handle Deploy Universe
  const handleDeployUniverse = useCallback(
    (universeId: number) => {
      setIsUniverseSelectOpen(false);
      setIsModeSelectOpen(false);
      setActiveGameMode('universe');
      setActiveUniverseId(universeId);
      try {
        localStorage.setItem('sky_vanguard_active_universe', String(universeId));
        localStorage.setItem('sky_vanguard_active_game_mode', 'universe');
      } catch {}
      if (ownedFighterIds.length === 0) {
        setGachaInitialTab('fighters');
        setIsGachaOpen(true);
        return;
      }
      setGameState('playing');
      if (engineRef.current) {
        syncEngineLoadout(selectedFighter.id, equippedPilotId, fighterAccessories, difficulty);
        engineRef.current.setDifficulty(difficulty);
        engineRef.current.setGameMode('universe', universeId);
        engineRef.current.startRun();
      }
    },
    [ownedFighterIds, selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, syncEngineLoadout]
  );

  // Handle Start Boss Rush Mode (Đại Chiến 20 Boss Vũ Trụ Liên Hoàn)
  const handleStartBossRush = useCallback(() => {
    setIsUniverseSelectOpen(false);
    setIsModeSelectOpen(false);
    setActiveGameMode('boss_rush');
    try {
      localStorage.setItem('sky_vanguard_active_game_mode', 'boss_rush');
    } catch {}
    if (ownedFighterIds.length === 0) {
      setGachaInitialTab('fighters');
      setIsGachaOpen(true);
      return;
    }
    setGameState('playing');
    if (engineRef.current) {
      syncEngineLoadout(selectedFighter.id, equippedPilotId, fighterAccessories, difficulty);
      engineRef.current.setDifficulty(difficulty);
      engineRef.current.setGameMode('boss_rush', null);
      engineRef.current.startRun();
    }
  }, [ownedFighterIds, selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, syncEngineLoadout]);

  // Handle Launch Chicken Invaders 4 Adventure Stage
  const handleLaunchAdventureStage = useCallback(
    (stageId: number) => {
      setIsAdventureMapOpen(false);
      setIsModeSelectOpen(false);
      setActiveGameMode('adventure');
      setActiveAdventureStageId(stageId);
      try {
        localStorage.setItem('sky_vanguard_active_game_mode', 'adventure');
      } catch {}
      if (ownedFighterIds.length === 0) {
        setGachaInitialTab('fighters');
        setIsGachaOpen(true);
        return;
      }
      setGameState('playing');
      if (engineRef.current) {
        syncEngineLoadout(selectedFighter.id, equippedPilotId, fighterAccessories, difficulty);
        engineRef.current.setDifficulty(difficulty);
        engineRef.current.setGameMode('adventure', null, stageId);
        engineRef.current.startRun();
      }
    },
    [ownedFighterIds, selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, syncEngineLoadout]
  );

  // Handle Start Super Hard Mode (10 Đợt - 10 Boss Siêu Cấp)
  const handleStartSuperHard = useCallback(() => {
    setIsUniverseSelectOpen(false);
    setIsModeSelectOpen(false);
    setActiveGameMode('super_hard');
    try {
      localStorage.setItem('sky_vanguard_active_game_mode', 'super_hard');
    } catch {}
    if (ownedFighterIds.length === 0) {
      setGachaInitialTab('fighters');
      setIsGachaOpen(true);
      return;
    }
    setGameState('playing');
    if (engineRef.current) {
      syncEngineLoadout(selectedFighter.id, equippedPilotId, fighterAccessories, difficulty);
      engineRef.current.setDifficulty(difficulty);
      engineRef.current.setGameMode('super_hard', null);
      engineRef.current.startRun();
    }
  }, [ownedFighterIds, selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, syncEngineLoadout]);

  // Handle Claim Universe Conquest Milestone
  const handleClaimUniverseMilestone = useCallback(
    (milestoneId: number) => {
      const milestone = UNIVERSE_MILESTONES.find((m) => m.id === milestoneId);
      if (!milestone) return;
      if (claimedUniverseMilestones.includes(milestoneId)) return;

      const summary = getConquestSummary(universeProgress);
      if (summary.conqueredCount < milestone.requiredConquered) return;

      const nextClaimed = [...claimedUniverseMilestones, milestoneId];
      setClaimedUniverseMilestones(nextClaimed);
      const nextGems = gems + milestone.rewardGems;
      const nextGold = gold + milestone.rewardGold;
      setGems(nextGems);
      setGold(nextGold);

      try {
        localStorage.setItem('sky_vanguard_universe_milestones', JSON.stringify(nextClaimed));
        localStorage.setItem('sky_vanguard_gems', String(nextGems));
        localStorage.setItem('sky_vanguard_gold', String(nextGold));
      } catch {}

      sound.playReward();
      setMissionToast(
        `🏆 Nhận Cột Mốc ${milestone.requiredConquered} Vũ Trụ: +${milestone.rewardGems.toLocaleString()} 💎 & +${milestone.rewardGold.toLocaleString()} 🪙!`
      );
      setTimeout(() => setMissionToast(null), 4500);
    },
    [claimedUniverseMilestones, universeProgress, gems, gold]
  );

  const handleStartFreeFlight = useCallback(() => {
    setIsUniverseSelectOpen(false);
    setIsModeSelectOpen(false);
    setActiveGameMode('free_flight');
    if (ownedFighterIds.length === 0) {
      setGachaInitialTab('fighters');
      setIsGachaOpen(true);
      return;
    }
    setGameState('playing');
    if (engineRef.current) {
      syncEngineLoadout(selectedFighter.id, equippedPilotId, fighterAccessories, difficulty);
      engineRef.current.setDifficulty(difficulty);
      engineRef.current.setGameMode('free_flight', null);
      engineRef.current.startRun();
    }
  }, [ownedFighterIds, selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, syncEngineLoadout]);

  const handleExitFreeFlight = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setGameMode('universe', activeUniverseId || 1);
      engineRef.current.stopRun();
    }
    setActiveGameMode('universe');
    try {
      localStorage.setItem('sky_vanguard_active_game_mode', 'universe');
    } catch {}
    setGameState('title');
  }, [activeUniverseId]);

  const handleCycleFreeFlightTheme = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.cycleFreeFlightTheme();
    }
  }, []);

  const handleTogglePhotoMode = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.togglePhotoMode();
    }
  }, []);

  const handleBoostFreeFlight = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerFreeFlightBoost();
    }
  }, []);

  // Handle Start / Retry
  const handleStartGame = useCallback(() => {
    if (ownedFighterIds.length === 0) {
      setGachaInitialTab('fighters');
      setIsGachaOpen(true);
      return;
    }
    setGameState('playing');
    if (engineRef.current) {
      syncEngineLoadout(selectedFighter.id, equippedPilotId, fighterAccessories, difficulty);
      engineRef.current.setDifficulty(difficulty);
      if (activeGameMode === 'super_hard') {
        engineRef.current.setGameMode('super_hard', null);
      } else if (activeGameMode === 'adventure') {
        engineRef.current.setGameMode('adventure', null, activeAdventureStageId || 1);
      } else if (activeGameMode === 'free_flight') {
        engineRef.current.setGameMode('free_flight', null);
      } else if (activeGameMode === 'boss_rush') {
        engineRef.current.setGameMode('boss_rush', null);
      } else if (activeGameMode === 'universe' && activeUniverseId) {
        engineRef.current.setGameMode('universe', activeUniverseId);
      } else {
        engineRef.current.setGameMode('endless', null);
      }
      engineRef.current.startRun();
    }
  }, [ownedFighterIds, selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, syncEngineLoadout, activeGameMode, activeUniverseId, activeAdventureStageId]);

  // Handle Pause / Resume
  const handleTogglePause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  }, []);

  // Handle Trigger Bomb
  const handleTriggerBomb = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerBomb();
    }
  }, []);

  // Handle Trigger Skill
  const handleTriggerSkill = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerSkill();
    }
  }, []);

  // Handle Toggle Auto-Fire (optimized for mobile touch)
  const handleToggleAutoFire = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.toggleAutoFire();
    }
  }, []);

  // Handle Exit to Title Screen
  const handleExitToTitle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setGameMode('endless', null);
      engineRef.current.resetToTitle();
    }
    if (activeGameMode === 'free_flight') {
      setActiveGameMode('endless');
      try {
        localStorage.setItem('sky_vanguard_active_game_mode', 'endless');
      } catch {}
    }
    setGameState('title');
  }, [activeGameMode]);

  // Reset entire game progress to factory state
  const handleResetAllProgress = useCallback(() => {
    try {
      const keys = [
        'sky_vanguard_gems',
        'sky_vanguard_gold',
        'sky_vanguard_fighter_shards',
        'sky_vanguard_fighter_stars',
        'sky_vanguard_fighters',
        'sky_vanguard_pilots',
        'sky_vanguard_equipped_pilot',
        'sky_vanguard_owned_accessories',
        'sky_vanguard_fighter_accessories',
        'sky_vanguard_pity_s',
        'sky_vanguard_pity_a',
        'sky_vanguard_pilot_pity_s',
        'sky_vanguard_pilot_pity_a',
        'sky_vanguard_missions',
        'sky_vanguard_daily_login',
        'sky_vanguard_highscore',
        'sky_vanguard_recharge_state',
        'sky_vanguard_mailbox',
        'sky_vanguard_difficulty',
        'sky_vanguard_universe_progress',
        'sky_vanguard_universe_milestones',
        'sky_vanguard_universe_first_clears',
        'sky_vanguard_last_mail_dispatch',
        'sky_vanguard_astraea_banner_start',
      ];
      keys.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('sky_vanguard_reset_ver', 'v7_unlock_all_rts88_tia_chop');
    } catch {}

    const resetNow = Date.now();
    setLastMailDispatch(resetNow);
    setAstraeaBannerStartTime(resetNow);
    try {
      localStorage.setItem('sky_vanguard_astraea_banner_start', String(resetNow));
      localStorage.setItem('sky_vanguard_last_mail_dispatch', String(resetNow));
    } catch {}

    setGems(STARTING_GEMS);
    setGold(STARTING_GOLD);
    setUniverseProgress(getInitialUniverseProgress());
    setAdventureProgress(getInitialAdventureProgress());
    try {
      localStorage.removeItem('sky_vanguard_adventure_progress');
    } catch {}
    setClaimedUniverseMilestones([]);
    setFirstClearedUniverseIds([]);
    setFighterShards({});
    setFighterStars({});
    setOwnedFighterIds(ALL_FIGHTER_KEYS);
    setOwnedPilotIds(ALL_PILOT_KEYS);
    setEquippedPilotId('pilot_valkyrie_s');
    setOwnedAccessoryIds(ALL_ACCESSORY_KEYS);
    setFighterAccessories({});
    setPityS(0);
    setPityA(0);
    setPilotPityS(0);
    setPilotPityA(0);
    setMissions(INITIAL_MISSIONS);
    setDailyLoginState(INITIAL_DAILY_LOGIN_STATE);
    setRechargeState(INITIAL_RECHARGE_STATE);
    setMails(INITIAL_MAILS);
    setDifficulty('normal');
    setOwnedDroneIds(ALL_DRONE_KEYS);
    setEquippedDroneIds(['drone_overclock_s', 'drone_aegis_s']);
    setDronePityS(0);
    setDronePityA(0);
    setSelectedFighter(FIGHTERS.rts_88 || FIGHTERS.phoenix);

    try {
      localStorage.setItem('sky_vanguard_fighters', JSON.stringify(ALL_FIGHTER_KEYS));
      localStorage.setItem('sky_vanguard_pilots', JSON.stringify(ALL_PILOT_KEYS));
      localStorage.setItem('sky_vanguard_owned_accessories', JSON.stringify(ALL_ACCESSORY_KEYS));
      localStorage.setItem('sky_vanguard_owned_drones', JSON.stringify(ALL_DRONE_KEYS));
      localStorage.setItem('sky_vanguard_equipped_pilot', 'pilot_valkyrie_s');
      localStorage.setItem('sky_vanguard_equipped_drones', JSON.stringify(['drone_overclock_s', 'drone_aegis_s']));
    } catch {}

    if (engineRef.current) {
      engineRef.current.resetToTitle();
      engineRef.current.highScore = 0;
      engineRef.current.score = 0;
      engineRef.current.setFighter('rts_88', 1);
      engineRef.current.setPilot('pilot_valkyrie_s');
      engineRef.current.setAccessories([]);
      engineRef.current.setDrones(['drone_overclock_s', 'drone_aegis_s']);
      engineRef.current.setDifficulty('normal');
    }

    setHudState((prev) => ({
      ...prev,
      score: 0,
      highScore: 0,
      wave: 1,
      combo: 1,
      comboMultiplier: 1.0,
      sectorIndex: 1,
      sectorName: 'Alpha Void',
      sectorVietnameseName: 'Không Phận Khởi Nguyên',
    }));

    setMissionToast('⚡ Đã mở khoá toàn bộ Máy Bay, Phi Công, Phụ Kiện và Drone!');
    setTimeout(() => setMissionToast(null), 4000);
  }, []);

  // Automatic reset execution on version flag change (syncs base 5,000 gems &starter mail & unlock all)
  useEffect(() => {
    try {
      const resetFlag = localStorage.getItem('sky_vanguard_reset_ver');
      if (resetFlag !== 'v7_unlock_all_rts88_tia_chop') {
        localStorage.setItem('sky_vanguard_reset_ver', 'v7_unlock_all_rts88_tia_chop');
        handleResetAllProgress();
      }
    } catch {}
  }, [handleResetAllProgress]);

  // Helper to persist mailbox state
  const saveMailsToStorage = useCallback((updatedMails: MailItem[]) => {
    try {
      localStorage.setItem('sky_vanguard_mailbox', JSON.stringify(updatedMails));
    } catch {}
  }, []);

  // Mailbox Handlers
  const handleOpenMailbox = useCallback(() => {
    sound.playClick();
    setIsMailboxOpen(true);
  }, []);

  const handleReadMail = useCallback(
    (mailId: string) => {
      setMails((prev) => {
        const updated = markMailAsRead(prev, mailId);
        saveMailsToStorage(updated);
        return updated;
      });
    },
    [saveMailsToStorage]
  );

  const handleClaimMailReward = useCallback(
    (mailId: string) => {
      setMails((prev) => {
        const res = claimMailReward(prev, mailId);
        if (res.success && (res.claimedGems > 0 || res.claimedGold > 0)) {
          sound.playReward();
          if (res.claimedGems > 0) {
            setGems((g) => {
              const next = g + res.claimedGems;
              try {
                localStorage.setItem('sky_vanguard_gems', next.toString());
              } catch {}
              return next;
            });
          }
          if (res.claimedGold > 0) {
            setGold((prevGold) => {
              const next = prevGold + res.claimedGold;
              try {
                localStorage.setItem('sky_vanguard_gold', next.toString());
              } catch {}
              return next;
            });
          }
          const rewardsDesc = [
            res.claimedGems > 0 ? `+${res.claimedGems.toLocaleString()} 💎` : '',
            res.claimedGold > 0 ? `+${res.claimedGold.toLocaleString()} 🪙` : '',
          ]
            .filter(Boolean)
            .join(' & ');
          setMissionToast(`Đã nhận ${rewardsDesc} từ Hộp Thư!`);
          setTimeout(() => setMissionToast(null), 3500);
        }
        saveMailsToStorage(res.updatedMails);
        return res.updatedMails;
      });
    },
    [saveMailsToStorage]
  );

  const handleClaimAllMails = useCallback(() => {
    setMails((prev) => {
      const res = claimAllMails(prev);
      if (res.claimedCount > 0 && (res.totalClaimedGems > 0 || res.totalClaimedGold > 0)) {
        sound.playReward();
        if (res.totalClaimedGems > 0) {
          setGems((g) => {
            const next = g + res.totalClaimedGems;
            try {
              localStorage.setItem('sky_vanguard_gems', next.toString());
            } catch {}
            return next;
          });
        }
        if (res.totalClaimedGold > 0) {
          setGold((prevGold) => {
            const next = prevGold + res.totalClaimedGold;
            try {
              localStorage.setItem('sky_vanguard_gold', next.toString());
            } catch {}
            return next;
          });
        }
        const rewardsDesc = [
          res.totalClaimedGems > 0 ? `+${res.totalClaimedGems.toLocaleString()} 💎` : '',
          res.totalClaimedGold > 0 ? `+${res.totalClaimedGold.toLocaleString()} 🪙` : '',
        ]
          .filter(Boolean)
          .join(' & ');
        setMissionToast(`Đã nhận toàn bộ quà thư: ${rewardsDesc}!`);
        setTimeout(() => setMissionToast(null), 3500);
      }
      saveMailsToStorage(res.updatedMails);
      return res.updatedMails;
    });
  }, [saveMailsToStorage]);

  const handleDeleteClaimedMails = useCallback(() => {
    sound.playClick();
    setMails((prev) => {
      const updated = deleteClaimedMails(prev);
      saveMailsToStorage(updated);
      return updated;
    });
    setMissionToast('Đã dọn dẹp các thư đã đọc và nhận thưởng!');
    setTimeout(() => setMissionToast(null), 2500);
  }, [saveMailsToStorage]);

  // Handle Fighter Gacha Pull (enforces 10-day limited banner for Astraea)
  const handleExecutePullFighters = useCallback(
    (count: 1 | 10, isAstraeaActive?: boolean): GachaItem[] => {
      const bannerStatus = getAstraeaBannerStatus(astraeaBannerStartTime, Date.now());
      const effectiveAstraeaActive = isAstraeaActive !== undefined ? isAstraeaActive : bannerStatus.isActive;
      const pullData = executeGachaPull(count, ownedFighterIds, pityS, pityA, effectiveAstraeaActive);
      const nextGems = Math.max(0, gems - pullData.totalGemsCost);
      const nextFighters = pullData.newOwnedFighterIds;
      const nextPityS = pullData.newPityS;
      const nextPityA = pullData.newPityA;

      // Handle Duplicate Shards
      let nextShards = { ...fighterShards };
      let totalDuplicateShards = 0;
      if (pullData.duplicateShardsGranted) {
        for (const [fId, shardCount] of Object.entries(pullData.duplicateShardsGranted)) {
          nextShards[fId] = (nextShards[fId] || 0) + shardCount;
          totalDuplicateShards += shardCount;
        }
      }
      setFighterShards(nextShards);

      const missionRes = updateMissionProgress(missions, 'do_gacha', count);

      setGems(nextGems);
      setOwnedFighterIds(nextFighters);
      setPityS(nextPityS);
      setPityA(nextPityA);
      setMissions(missionRes.updatedMissions);

      saveStateToStorage(nextGems, nextFighters, nextPityS, nextPityA, missionRes.updatedMissions);
      try {
        localStorage.setItem('sky_vanguard_fighter_shards', JSON.stringify(nextShards));
      } catch {}

      if (totalDuplicateShards > 0) {
        setMissionToast(`Nhận được +${totalDuplicateShards} Mảnh chiến cơ từ bản trùng lặp!`);
        setTimeout(() => setMissionToast(null), 3500);
      }

      // If player previously had no fighter, auto select the first pulled fighter
      if (ownedFighterIds.length === 0 && pullData.results.length > 0) {
        const firstPulled = pullData.results[0].fighterId;
        if (FIGHTERS[firstPulled]) {
          setSelectedFighter(FIGHTERS[firstPulled]);
          syncEngineLoadout(firstPulled, equippedPilotId, fighterAccessories, difficulty, fighterStars);
        }
      }

      return pullData.results;
    },
    [gems, ownedFighterIds, pityS, pityA, missions, fighterShards, fighterStars, difficulty, saveStateToStorage, equippedPilotId, fighterAccessories, syncEngineLoadout]
  );

  // Handle Pilot Gacha Pull
  const handleExecutePullPilots = useCallback(
    (count: 1 | 10): PilotGachaItem[] => {
      const pullData = executePilotGachaPull(count, ownedPilotIds, pilotPityS, pilotPityA);
      const nextGems = Math.max(0, gems - pullData.totalGemsCost);
      const nextPilots = pullData.newOwnedPilotIds;
      const nextPityS = pullData.newPityS;
      const nextPityA = pullData.newPityA;

      const missionRes = updateMissionProgress(missions, 'do_gacha', count);

      setGems(nextGems);
      setOwnedPilotIds(nextPilots);
      setPilotPityS(nextPityS);
      setPilotPityA(nextPityA);
      setMissions(missionRes.updatedMissions);

      try {
        localStorage.setItem('sky_vanguard_gems', String(nextGems));
        localStorage.setItem('sky_vanguard_pilots', JSON.stringify(nextPilots));
        localStorage.setItem('sky_vanguard_pilot_pity_s', String(nextPityS));
        localStorage.setItem('sky_vanguard_pilot_pity_a', String(nextPityA));
        localStorage.setItem('sky_vanguard_missions', JSON.stringify(missionRes.updatedMissions));
      } catch {}

      // If player had no equipped pilot, equip first pulled
      if (!equippedPilotId && pullData.results.length > 0) {
        const firstPilot = pullData.results[0].pilotId;
        setEquippedPilotId(firstPilot);
        try {
          localStorage.setItem('sky_vanguard_equipped_pilot', firstPilot);
        } catch {}
        if (engineRef.current) {
          engineRef.current.setPilot(firstPilot);
        }
      }

      return pullData.results;
    },
    [gems, ownedPilotIds, pilotPityS, pilotPityA, missions, equippedPilotId]
  );

  // Handle Equip Pilot
  const handleEquipPilot = useCallback(
    (pilotId: string) => {
      setEquippedPilotId(pilotId);
      try {
        localStorage.setItem('sky_vanguard_equipped_pilot', pilotId);
      } catch {}
      if (engineRef.current) {
        engineRef.current.setPilot(pilotId);
      }
      setMissionToast(`Đã bổ nhiệm phi công: ${PILOTS[pilotId]?.vietnameseTitle || pilotId}`);
      setTimeout(() => setMissionToast(null), 3000);
    },
    []
  );

  // Handle Drone Gacha Pull
  const handleExecutePullDrones = useCallback(
    (count: 1 | 10): DroneGachaItem[] => {
      const pullData = executeDroneGachaPull(count, ownedDroneIds, dronePityS, dronePityA);
      const nextGems = Math.max(0, gems - pullData.totalGemsCost);
      const nextDrones = pullData.newOwnedDroneIds;
      const nextPityS = pullData.newPityS;
      const nextPityA = pullData.newPityA;

      const missionRes = updateMissionProgress(missions, 'do_gacha', count);

      setGems(nextGems);
      setOwnedDroneIds(nextDrones);
      setDronePityS(nextPityS);
      setDronePityA(nextPityA);
      setMissions(missionRes.updatedMissions);

      try {
        localStorage.setItem('sky_vanguard_gems', String(nextGems));
        localStorage.setItem('sky_vanguard_owned_drones', JSON.stringify(nextDrones));
        localStorage.setItem('sky_vanguard_drone_pity_s', String(nextPityS));
        localStorage.setItem('sky_vanguard_drone_pity_a', String(nextPityA));
        localStorage.setItem('sky_vanguard_missions', JSON.stringify(missionRes.updatedMissions));
      } catch {}

      // If player has fewer than 2 equipped drones and pulled a new drone, auto equip it into an empty slot
      let updatedEquipped = [...equippedDroneIds];
      if (updatedEquipped.length < 2 && pullData.results.length > 0) {
        for (const res of pullData.results) {
          if (!updatedEquipped.includes(res.droneId) && updatedEquipped.length < 2) {
            updatedEquipped.push(res.droneId);
          }
        }
        if (updatedEquipped.length !== equippedDroneIds.length) {
          setEquippedDroneIds(updatedEquipped);
          try {
            localStorage.setItem('sky_vanguard_equipped_drones', JSON.stringify(updatedEquipped));
          } catch {}
          if (engineRef.current) {
            engineRef.current.setDrones(updatedEquipped);
          }
        }
      }

      return pullData.results;
    },
    [gems, ownedDroneIds, dronePityS, dronePityA, missions, equippedDroneIds]
  );

  // Handle Equip Drone into Slot 1 (0) or Slot 2 (1)
  const handleEquipDrone = useCallback(
    (droneId: string, slotIndex: number) => {
      setEquippedDroneIds((prev) => {
        const next = [...prev];
        const existingIdx = next.indexOf(droneId);
        if (existingIdx !== -1 && existingIdx !== slotIndex) {
          next.splice(existingIdx, 1);
        }
        next[slotIndex] = droneId;
        const filtered = next.filter(Boolean).slice(0, 2);
        try {
          localStorage.setItem('sky_vanguard_equipped_drones', JSON.stringify(filtered));
        } catch {}
        if (engineRef.current) {
          engineRef.current.setDrones(filtered);
        }
        const drone = DRONES[droneId];
        setMissionToast(`🛸 Đã trang bị Drone: ${drone?.name || droneId} vào Vị trí ${slotIndex + 1}!`);
        setTimeout(() => setMissionToast(null), 3000);
        return filtered;
      });
    },
    []
  );

  // Handle Unequip Drone from Slot
  const handleUnequipDrone = useCallback(
    (slotIndex: number) => {
      setEquippedDroneIds((prev) => {
        const next = [...prev];
        if (slotIndex >= 0 && slotIndex < next.length) {
          next.splice(slotIndex, 1);
        }
        try {
          localStorage.setItem('sky_vanguard_equipped_drones', JSON.stringify(next));
        } catch {}
        if (engineRef.current) {
          engineRef.current.setDrones(next);
        }
        setMissionToast(`Đã tháo Drone ở Vị trí ${slotIndex + 1}!`);
        setTimeout(() => setMissionToast(null), 2500);
        return next;
      });
    },
    []
  );

  // Handle Buy Weapon Accessory using Gold (50,000 to 100,000,000 Gold)
  const handleBuyAccessory = useCallback(
    (accId: string, costGold: number) => {
      if (gold < costGold) {
        setMissionToast('Không đủ Vàng để mua phụ kiện này!');
        setTimeout(() => setMissionToast(null), 2500);
        return;
      }
      const nextGold = gold - costGold;
      const nextOwnedAccs = [...ownedAccessoryIds, accId];
      setGold(nextGold);
      setOwnedAccessoryIds(nextOwnedAccs);

      try {
        localStorage.setItem('sky_vanguard_gold', String(nextGold));
        localStorage.setItem('sky_vanguard_owned_accessories', JSON.stringify(nextOwnedAccs));
      } catch {}

      const acc = WEAPON_ACCESSORIES[accId];
      sound.playReward();
      setMissionToast(`Mua thành công: ${acc?.vietnameseName || accId}! -${costGold.toLocaleString()} Vàng`);
      setTimeout(() => setMissionToast(null), 3500);
    },
    [gold, ownedAccessoryIds]
  );

  // Handle Fighter Star Upgrade
  const handleUpgradeFighterStar = useCallback(
    (fighterId: string) => {
      const currentStar = fighterStars[fighterId] || 1;
      const currentShards = fighterShards[fighterId] || 0;
      const res = upgradeFighterStar(fighterId, currentStar, currentShards, gold);
      if (!res.success) {
        setMissionToast(res.message);
        setTimeout(() => setMissionToast(null), 3000);
        return;
      }

      const nextStars = { ...fighterStars, [fighterId]: res.newStar };
      const nextShards = { ...fighterShards, [fighterId]: res.remainingShards };
      const nextGold = res.remainingGold;

      setFighterStars(nextStars);
      setFighterShards(nextShards);
      setGold(nextGold);

      try {
        localStorage.setItem('sky_vanguard_fighter_stars', JSON.stringify(nextStars));
        localStorage.setItem('sky_vanguard_fighter_shards', JSON.stringify(nextShards));
        localStorage.setItem('sky_vanguard_gold', String(nextGold));
      } catch {}

      sound.playReward();
      setMissionToast(res.message);
      setTimeout(() => setMissionToast(null), 4000);

      if (selectedFighter.id === fighterId && engineRef.current) {
        engineRef.current.setFighter(fighterId, res.newStar);
      }
    },
    [fighterStars, fighterShards, gold, selectedFighter.id]
  );

  // Handle Open Fighter Upgrade Modal
  const handleOpenUpgrade = useCallback(
    (fighterId?: string) => {
      const targetId = fighterId || selectedFighter.id;
      setUpgradeModalFighterId(targetId);
      setIsUpgradeModalOpen(true);
    },
    [selectedFighter.id]
  );

  // Handle Grant Test Shards & Gold for Instant Star Upgrade Testing
  const handleGrantTestShards = useCallback((fighterId: string) => {
    setFighterShards((prev) => {
      const updated = {
        ...prev,
        [fighterId]: (prev[fighterId] || 0) + 120,
      };
      try {
        localStorage.setItem('sky_vanguard_fighter_shards', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setGold((prev) => {
      const nextGold = prev + 500000;
      try {
        localStorage.setItem('sky_vanguard_gold', String(nextGold));
      } catch {}
      return nextGold;
    });
    sound.playReward();
    setMissionToast(`🎁 Đã cấp 120 Mảnh ${FIGHTERS[fighterId]?.vietnameseName || fighterId} & 500k Vàng thử nghiệm!`);
    setTimeout(() => setMissionToast(null), 3500);
  }, []);

  // Handle Toggle Equip Accessory on Fighter
  const handleToggleEquipAccessory = useCallback(
    (fighterId: string, accId: string) => {
      const currentList = fighterAccessories[fighterId] || [];
      const isAlready = currentList.includes(accId);

      let nextList: string[];
      if (isAlready) {
        nextList = currentList.filter((id) => id !== accId);
      } else {
        // Enforce max 3 accessories per fighter
        if (currentList.length >= 3) {
          alert('Chiến cơ này đã lắp tối đa 3 phụ kiện! Hãy tháo bớt phụ kiện trước khi lắp thêm.');
          return;
        }
        nextList = [...currentList, accId];
      }

      const nextMap = {
        ...fighterAccessories,
        [fighterId]: nextList,
      };

      setFighterAccessories(nextMap);
      try {
        localStorage.setItem('sky_vanguard_fighter_accessories', JSON.stringify(nextMap));
      } catch {}

      if (engineRef.current && selectedFighter.id === fighterId) {
        engineRef.current.setAccessories(nextList);
      }
    },
    [fighterAccessories, selectedFighter.id]
  );

  // Handle Claiming Mission Reward (Gems & Gold)
  const handleClaimMission = useCallback(
    (missionId: string) => {
      const res = claimMissionReward(missions, missionId);
      if (res.rewardGems > 0 || res.rewardGold > 0) {
        sound.playReward();
        const nextGems = gems + res.rewardGems;
        const nextGold = gold + res.rewardGold;
        setGems(nextGems);
        setGold(nextGold);
        setMissions(res.updatedMissions);
        saveStateToStorage(nextGems, ownedFighterIds, pityS, pityA, res.updatedMissions);
        try {
          localStorage.setItem('sky_vanguard_gold', String(nextGold));
        } catch {}
        const rewardsDesc = [
          res.rewardGems > 0 ? `+${res.rewardGems.toLocaleString()} 💎` : '',
          res.rewardGold > 0 ? `+${res.rewardGold.toLocaleString()} 🪙` : '',
        ]
          .filter(Boolean)
          .join(' & ');
        setMissionToast(`Hoàn thành nhiệm vụ: Nhận ${rewardsDesc}!`);
        setTimeout(() => setMissionToast(null), 3500);
      }
    },
    [gems, gold, missions, ownedFighterIds, pityS, pityA, saveStateToStorage]
  );

  // Handle Claim All Missions
  const handleClaimAllMissions = useCallback(() => {
    let totalClaimedGems = 0;
    let totalClaimedGold = 0;
    let currMissions = [...missions];

    currMissions = currMissions.map((m) => {
      if (m.completed && !m.claimed) {
        totalClaimedGems += m.rewardGems;
        totalClaimedGold += m.rewardGold || 0;
        return { ...m, claimed: true };
      }
      return m;
    });

    if (totalClaimedGems > 0 || totalClaimedGold > 0) {
      sound.playReward();
      const nextGems = gems + totalClaimedGems;
      const nextGold = gold + totalClaimedGold;
      setGems(nextGems);
      setGold(nextGold);
      setMissions(currMissions);
      saveStateToStorage(nextGems, ownedFighterIds, pityS, pityA, currMissions);
      try {
        localStorage.setItem('sky_vanguard_gold', String(nextGold));
      } catch {}
      const rewardsDesc = [
        totalClaimedGems > 0 ? `+${totalClaimedGems.toLocaleString()} 💎` : '',
        totalClaimedGold > 0 ? `+${totalClaimedGold.toLocaleString()} 🪙` : '',
      ]
        .filter(Boolean)
        .join(' & ');
      setMissionToast(`Đã nhận toàn bộ phần thưởng: ${rewardsDesc}!`);
      setTimeout(() => setMissionToast(null), 3500);
    }
  }, [gems, gold, missions, ownedFighterIds, pityS, pityA, saveStateToStorage]);

  // Handle Daily Login Bonus Claim
  const handleClaimDailyBonus = useCallback(() => {
    const result = claimDailyBonusReward(dailyLoginState, gems, Date.now(), selectedFighter.id);
    if (result.success) {
      const nextGems = result.newGems;
      setGems(nextGems);
      setDailyLoginState(result.newDailyState);

      // Handle 7-Day Streak Rewards (Exclusive Cosmetic Skin & Bonus Shards)
      if (result.streakReward) {
        const streakInfo = result.streakReward;
        const targetFighterId = streakInfo.bonusShards.fighterId;
        const bonusCount = streakInfo.bonusShards.count;

        setFighterShards((prev) => {
          const updated = {
            ...prev,
            [targetFighterId]: (prev[targetFighterId] || 0) + bonusCount,
          };
          try {
            localStorage.setItem('sky_vanguard_fighter_shards', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        if (engineRef.current) {
          engineRef.current.setCosmeticSkin(result.newDailyState.activeSkinId || null);
        }
      }

      try {
        localStorage.setItem('sky_vanguard_gems', String(nextGems));
        localStorage.setItem('sky_vanguard_daily_login', JSON.stringify(result.newDailyState));
      } catch {}

      if (result.streakReward) {
        setMissionToast(result.streakReward.message);
      } else {
        setMissionToast(`🎁 Nhận thành công +${result.rewardClaimed.toLocaleString()} Gems điểm danh Ngày ${result.claimedDay}!`);
      }
      setTimeout(() => setMissionToast(null), 5000);
    }
  }, [dailyLoginState, gems, selectedFighter.id]);

  // Handle Cosmetic Skin Toggle/Equip
  const handleToggleSkin = useCallback((skinId: string, fighterId?: string) => {
    setDailyLoginState((prev) => {
      const targetFid = fighterId || selectedFighter.id;
      const nextState = toggleCosmeticSkin(prev, skinId, targetFid);
      try {
        localStorage.setItem('sky_vanguard_daily_login', JSON.stringify(nextState));
      } catch {}
      if (engineRef.current) {
        const activeSkin = getActiveSkinForFighter(nextState, selectedFighter.id);
        engineRef.current.setCosmeticSkin(activeSkin);
      }
      return nextState;
    });
  }, [selectedFighter.id]);

  // Recharge System Handlers
  const handlePurchasePackage = useCallback(
    (packageId: string) => {
      const result = executeRechargePurchase(rechargeState, gems, packageId);
      if (result.success) {
        setGems(result.newGems);
        setRechargeState(result.newState);
        try {
          localStorage.setItem('sky_vanguard_gems', String(result.newGems));
          localStorage.setItem('sky_vanguard_recharge_state', JSON.stringify(result.newState));
        } catch {}
        setMissionToast(result.message);
        setTimeout(() => setMissionToast(null), 4000);
      }
    },
    [gems, rechargeState]
  );

  const handlePurchaseGoldPackage = useCallback(
    (packageId: string) => {
      const result = executeGoldRechargePurchase(rechargeState, gold, packageId);
      if (result.success) {
        setGold(result.newGold);
        setRechargeState(result.newState);
        try {
          localStorage.setItem('sky_vanguard_gold', String(result.newGold));
          localStorage.setItem('sky_vanguard_recharge_state', JSON.stringify(result.newState));
        } catch {}
        setMissionToast(result.message);
        setTimeout(() => setMissionToast(null), 4000);
      }
    },
    [gold, rechargeState]
  );

  const handlePurchasePass = useCallback(
    (passType: 'weekly' | 'monthly') => {
      const result = executePassPurchase(rechargeState, gems, passType);
      if (result.success) {
        setGems(result.newGems);
        setRechargeState(result.newState);
        try {
          localStorage.setItem('sky_vanguard_gems', String(result.newGems));
          localStorage.setItem('sky_vanguard_recharge_state', JSON.stringify(result.newState));
        } catch {}
        setMissionToast(result.message);
        setTimeout(() => setMissionToast(null), 4000);
      }
    },
    [gems, rechargeState]
  );

  const handleClaimPassDaily = useCallback(
    (passType: 'weekly' | 'monthly') => {
      const result = claimPassDailyGems(rechargeState, gems, passType);
      if (result.success) {
        setGems(result.newGems);
        setRechargeState(result.newState);
        try {
          localStorage.setItem('sky_vanguard_gems', String(result.newGems));
          localStorage.setItem('sky_vanguard_recharge_state', JSON.stringify(result.newState));
        } catch {}
        setMissionToast(result.message);
        setTimeout(() => setMissionToast(null), 4000);
      } else {
        setMissionToast(result.message);
        setTimeout(() => setMissionToast(null), 3000);
      }
    },
    [gems, rechargeState]
  );

  const handleClaimFirstRecharge = useCallback(() => {
    const result = claimFirstRechargeReward(rechargeState, gems, ownedFighterIds);
    if (result.success) {
      const nextGems = result.newGems;
      const nextFighters = ownedFighterIds.includes(result.rewardFighterId)
        ? ownedFighterIds
        : [...ownedFighterIds, result.rewardFighterId];

      setGems(nextGems);
      setOwnedFighterIds(nextFighters);
      setRechargeState(result.newState);
      if (FIGHTERS[result.rewardFighterId]) {
        setSelectedFighter(FIGHTERS[result.rewardFighterId]);
        syncEngineLoadout(result.rewardFighterId, equippedPilotId, fighterAccessories);
      }
      try {
        localStorage.setItem('sky_vanguard_gems', String(nextGems));
        localStorage.setItem('sky_vanguard_fighters', JSON.stringify(nextFighters));
        localStorage.setItem('sky_vanguard_recharge_state', JSON.stringify(result.newState));
      } catch {}
      setMissionToast(result.message);
      setTimeout(() => setMissionToast(null), 4500);
    } else {
      setMissionToast(result.message);
      setTimeout(() => setMissionToast(null), 3000);
    }
  }, [gems, ownedFighterIds, rechargeState, equippedPilotId, fighterAccessories, syncEngineLoadout]);

  const handleClaimVipReward = useCallback(
    (vipLevel: number) => {
      const result = claimVipLevelReward(rechargeState, gems, vipLevel);
      if (result.success) {
        setGems(result.newGems);
        setRechargeState(result.newState);

        let nextPilots = ownedPilotIds;
        if (result.unlockedPilotId && !ownedPilotIds.includes(result.unlockedPilotId)) {
          nextPilots = [...ownedPilotIds, result.unlockedPilotId];
          setOwnedPilotIds(nextPilots);
          try {
            localStorage.setItem('sky_vanguard_pilots', JSON.stringify(nextPilots));
          } catch {}
        }

        try {
          localStorage.setItem('sky_vanguard_gems', String(result.newGems));
          localStorage.setItem('sky_vanguard_recharge_state', JSON.stringify(result.newState));
        } catch {}
        setMissionToast(result.message);
        setTimeout(() => setMissionToast(null), 4000);
      } else {
        setMissionToast(result.message);
        setTimeout(() => setMissionToast(null), 3000);
      }
    },
    [gems, ownedPilotIds, rechargeState]
  );

  const handleRedeemGiftCode = useCallback(
    (code: string) => {
      const result = redeemGiftCode(rechargeState, gems, code);
      if (result.success) {
        setGems(result.newGems);
        setRechargeState(result.newState);
        try {
          localStorage.setItem('sky_vanguard_gems', String(result.newGems));
          localStorage.setItem('sky_vanguard_recharge_state', JSON.stringify(result.newState));
        } catch {}
        setMissionToast(result.message);
      } else {
        setMissionToast(result.message);
      }
      setTimeout(() => setMissionToast(null), 4000);
    },
    [gems, rechargeState]
  );

  const handleOpenRecharge = useCallback((tab?: RechargeTab) => {
    setRechargeInitialTab(tab || 'packs');
    setIsRechargeOpen(true);
  }, []);

  // Handle Engine Mission Triggers
  const handleMissionAction = useCallback(
    (actionId: string, amount: number, isAbsolute: boolean = false) => {
      setMissions((prevMissions) => {
        const res = updateMissionProgress(prevMissions, actionId, amount, isAbsolute);
        if (res.newlyCompleted) {
          const completedMission = res.updatedMissions.find((m) => m.id === actionId);
          if (completedMission) {
            setMissionToast(`Nhiệm vụ xong: ${completedMission.title}! +${completedMission.rewardGems.toLocaleString()} 💎`);
            setTimeout(() => setMissionToast(null), 3500);
          }
        }
        try {
          localStorage.setItem('sky_vanguard_missions', JSON.stringify(res.updatedMissions));
        } catch {}
        return res.updatedMissions;
      });
    },
    []
  );

  // Store latest callbacks in ref for leak-free, tear-down-free engine communication
  const callbacksRef = useRef({
    onHUDUpdate: (newHud: EngineHUDState) => {
      setHudState(newHud);
    },
    onStateChange: (newState: 'title' | 'playing' | 'paused' | 'gameover') => {
      setGameState(newState);
    },
    onGameOver: (finalStats: { score: number; wave: number; enemiesKilled: number; playTime: number; revivesUsed: number }) => {
      // User request: No gems awarded on run completion
      const earnedGems = 0;

      // 80% reduced gold reward formula
      const earnedGold = calculateGoldReward(
        finalStats.score,
        finalStats.enemiesKilled,
        finalStats.wave,
        difficulty,
        false
      );

      setGold((prev) => {
        const next = prev + earnedGold;
        try {
          localStorage.setItem('sky_vanguard_gold', String(next));
        } catch {}
        return next;
      });

      // Universe conquest progress update on game over
      if (activeGameMode === 'universe' && activeUniverseId) {
        setUniverseProgress((prev) => {
          const res = updateUniverseConquestProgress(prev, activeUniverseId, finalStats.wave, false);
          try {
            localStorage.setItem('sky_vanguard_universe_progress', JSON.stringify(res.updatedMap));
          } catch {}
          return res.updatedMap;
        });
      }

      // Boss Rush Leaderboard record on game over
      if (activeGameMode === 'boss_rush') {
        const bossesKilled = finalStats.wave > 1 ? finalStats.wave - 1 : 0;
        const newEntry = addBossRushRecord({
          fighterId: selectedFighter.id,
          fighterName: selectedFighter.vietnameseName || selectedFighter.name,
          fighterTier: selectedFighter.tier,
          fighterStars: fighterStars[selectedFighter.id] || 1,
          bossesDefeated: bossesKilled,
          totalBosses: 20,
          clearTimeSeconds: finalStats.playTime,
          revivesUsed: finalStats.revivesUsed || 0,
          score: finalStats.score,
          difficulty,
          isVictory: false,
          playerName: playerProfile.playerName,
          callsign: playerProfile.callsign,
        });
        setHighlightBossRushId(newEntry.id);
      }

      handleMissionAction('kill_enemies', finalStats.enemiesKilled);
      handleMissionAction('reach_wave', finalStats.wave, true);
      handleMissionAction('reach_score', finalStats.score, true);

      setLastEarnedGems(earnedGems);
      setLastEarnedGold(earnedGold);
      setGameOverStats({
        score: finalStats.score,
        wave: finalStats.wave,
        enemiesKilled: finalStats.enemiesKilled,
        playTime: finalStats.playTime,
        revivesUsed: finalStats.revivesUsed,
        remainingHp: (finalStats as any).remainingHp ?? 0,
        maxHp: (finalStats as any).maxHp ?? 100,
      });
      setGameState('gameover');
    },
    onVictory: (finalStats: { score: number; wave: number; enemiesKilled: number; playTime: number; revivesUsed: number }) => {
      // User request: No gems awarded on run completion
      const earnedGems = 0;

      // 80% reduced gold reward formula
      const earnedGold = calculateGoldReward(
        finalStats.score,
        finalStats.enemiesKilled,
        finalStats.wave,
        difficulty,
        true
      );

      setGold((prev) => {
        const next = prev + earnedGold;
        try {
          localStorage.setItem('sky_vanguard_gold', String(next));
        } catch {}
        return next;
      });

      // Universe conquest progress update on victory (100% conquest achievement)
      if (activeGameMode === 'universe' && activeUniverseId) {
        setUniverseProgress((prev) => {
          const res = updateUniverseConquestProgress(prev, activeUniverseId, finalStats.wave, true);
          try {
            localStorage.setItem('sky_vanguard_universe_progress', JSON.stringify(res.updatedMap));
          } catch {}
          return res.updatedMap;
        });

        const u = getUniverseById(activeUniverseId);
        if (u) {
          const isFirst = !firstClearedUniverseIds.includes(activeUniverseId);
          let firstGems = 0;
          let firstShardsCount = 0;
          let shardName = '';

          if (isFirst) {
            firstGems = u.firstClearGems || 200;
            const nextFirstClears = [...firstClearedUniverseIds, activeUniverseId];
            setFirstClearedUniverseIds(nextFirstClears);
            try {
              localStorage.setItem('sky_vanguard_universe_first_clears', JSON.stringify(nextFirstClears));
            } catch {}

            setGems((g) => {
              const nextG = g + firstGems;
              try {
                localStorage.setItem('sky_vanguard_gems', String(nextG));
              } catch {}
              return nextG;
            });

            if (u.firstClearShards) {
              firstShardsCount = u.firstClearShards.count;
              const fId = u.firstClearShards.fighterId;
              shardName = FIGHTERS[fId]?.name || fId;
              setFighterShards((prevShards) => {
                const updated = {
                  ...prevShards,
                  [fId]: (prevShards[fId] || 0) + firstShardsCount,
                };
                try {
                  localStorage.setItem('sky_vanguard_fighter_shards', JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          }

          setGold((prev) => {
            const nextGold = prev + u.rewardGold;
            try {
              localStorage.setItem('sky_vanguard_gold', String(nextGold));
            } catch {}
            return nextGold;
          });

          if (isFirst) {
            setMissionToast(`🌌 CHINH PHỤC LẦN ĐẦU 100% ${u.name}! +${u.rewardGold.toLocaleString()} 🪙, +${firstGems} 💎, +${firstShardsCount} Mảnh ${shardName}!`);
          } else {
            setMissionToast(`🌌 CHIẾM ĐÓNG 100% ${u.name}! Thưởng: +${u.rewardGold.toLocaleString()} Vàng`);
          }
          setTimeout(() => setMissionToast(null), 5000);
        }
      }

      // Boss Rush Leaderboard record on victory
      if (activeGameMode === 'boss_rush') {
        const newEntry = addBossRushRecord({
          fighterId: selectedFighter.id,
          fighterName: selectedFighter.vietnameseName || selectedFighter.name,
          fighterTier: selectedFighter.tier,
          fighterStars: fighterStars[selectedFighter.id] || 1,
          bossesDefeated: 20,
          totalBosses: 20,
          clearTimeSeconds: finalStats.playTime,
          revivesUsed: finalStats.revivesUsed || 0,
          score: finalStats.score,
          difficulty,
          isVictory: true,
          playerName: playerProfile.playerName,
          callsign: playerProfile.callsign,
        });
        setHighlightBossRushId(newEntry.id);
        setMissionToast(`👑 CHIẾN THẮNG ĐẠI CHIẾN BOSS! Thời gian: ${Math.floor(finalStats.playTime)}s · Hồi sinh: ${finalStats.revivesUsed || 0}`);
      }

      handleMissionAction('kill_enemies', finalStats.enemiesKilled);
      handleMissionAction('reach_wave', finalStats.wave, true);
      handleMissionAction('reach_score', finalStats.score, true);

      setLastEarnedGems(earnedGems);
      setLastEarnedGold(earnedGold);
      setGameOverStats({
        score: finalStats.score,
        wave: finalStats.wave,
        enemiesKilled: finalStats.enemiesKilled,
        playTime: finalStats.playTime,
        revivesUsed: finalStats.revivesUsed,
        remainingHp: (finalStats as any).remainingHp ?? 0,
        maxHp: (finalStats as any).maxHp ?? 100,
      });
      setGameState('gameover');
    },
    onMissionAction: handleMissionAction,
  });

  // Keep callbacksRef fresh
  useEffect(() => {
    callbacksRef.current = {
      onHUDUpdate: (newHud) => setHudState(newHud),
      onStateChange: (newState) => setGameState(newState),
      onGameOver: (finalStats) => {
        // User request: No gems awarded on run completion
        const earnedGems = 0;

        const earnedGold = calculateGoldReward(
          finalStats.score,
          finalStats.enemiesKilled,
          finalStats.wave,
          difficulty,
          false
        );

        setGold((prev) => {
          const next = prev + earnedGold;
          try {
            localStorage.setItem('sky_vanguard_gold', String(next));
          } catch {}
          return next;
        });

        if (activeGameMode === 'universe' && activeUniverseId) {
          setUniverseProgress((prev) => {
            const res = updateUniverseConquestProgress(prev, activeUniverseId, finalStats.wave, false);
            try {
              localStorage.setItem('sky_vanguard_universe_progress', JSON.stringify(res.updatedMap));
            } catch {}
            return res.updatedMap;
          });
        }

        // Boss Rush Leaderboard record on game over
        if (activeGameMode === 'boss_rush') {
          const bossesKilled = finalStats.wave > 1 ? finalStats.wave - 1 : 0;
          const newEntry = addBossRushRecord({
            fighterId: selectedFighter.id,
            fighterName: selectedFighter.vietnameseName || selectedFighter.name,
            fighterTier: selectedFighter.tier,
            fighterStars: fighterStars[selectedFighter.id] || 1,
            bossesDefeated: bossesKilled,
            totalBosses: 20,
            clearTimeSeconds: finalStats.playTime,
            revivesUsed: finalStats.revivesUsed || 0,
            score: finalStats.score,
            difficulty,
            isVictory: false,
            playerName: playerProfile.playerName,
            callsign: playerProfile.callsign,
          });
          setHighlightBossRushId(newEntry.id);
        }

        handleMissionAction('kill_enemies', finalStats.enemiesKilled);
        handleMissionAction('reach_wave', finalStats.wave, true);
        handleMissionAction('reach_score', finalStats.score, true);

        setLastEarnedGems(earnedGems);
        setLastEarnedGold(earnedGold);
        setGameOverStats({
          score: finalStats.score,
          wave: finalStats.wave,
          enemiesKilled: finalStats.enemiesKilled,
          playTime: finalStats.playTime,
          revivesUsed: finalStats.revivesUsed,
          remainingHp: (finalStats as any).remainingHp ?? 0,
          maxHp: (finalStats as any).maxHp ?? 100,
        });
        setGameState('gameover');
      },
      onVictory: (finalStats) => {
        // User request: No gems awarded on run completion
        const earnedGems = 0;

        const earnedGold = calculateGoldReward(
          finalStats.score,
          finalStats.enemiesKilled,
          finalStats.wave,
          difficulty,
          true
        );

        setGold((prev) => {
          const next = prev + earnedGold;
          try {
            localStorage.setItem('sky_vanguard_gold', String(next));
          } catch {}
          return next;
        });

        if (activeGameMode === 'universe' && activeUniverseId) {
          setUniverseProgress((prev) => {
            const res = updateUniverseConquestProgress(prev, activeUniverseId, finalStats.wave, true);
            try {
              localStorage.setItem('sky_vanguard_universe_progress', JSON.stringify(res.updatedMap));
            } catch {}
            return res.updatedMap;
          });

          const u = getUniverseById(activeUniverseId);
          if (u) {
            const isFirst = !firstClearedUniverseIds.includes(activeUniverseId);
            let firstGems = 0;
            let firstShardsCount = 0;
            let shardName = '';

            if (isFirst) {
              firstGems = u.firstClearGems || 200;
              const nextFirstClears = [...firstClearedUniverseIds, activeUniverseId];
              setFirstClearedUniverseIds(nextFirstClears);
              try {
                localStorage.setItem('sky_vanguard_universe_first_clears', JSON.stringify(nextFirstClears));
              } catch {}

              setGems((g) => {
                const nextG = g + firstGems;
                try {
                  localStorage.setItem('sky_vanguard_gems', String(nextG));
                } catch {}
                return nextG;
              });

              if (u.firstClearShards) {
                firstShardsCount = u.firstClearShards.count;
                const fId = u.firstClearShards.fighterId;
                shardName = FIGHTERS[fId]?.name || fId;
                setFighterShards((prevShards) => {
                  const updated = {
                    ...prevShards,
                    [fId]: (prevShards[fId] || 0) + firstShardsCount,
                  };
                  try {
                    localStorage.setItem('sky_vanguard_fighter_shards', JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            }

            setGold((prev) => {
              const nextGold = prev + u.rewardGold;
              try {
                localStorage.setItem('sky_vanguard_gold', String(nextGold));
              } catch {}
              return nextGold;
            });

            if (isFirst) {
              setMissionToast(`🌌 CHINH PHỤC LẦN ĐẦU 100% ${u.name}! +${u.rewardGold.toLocaleString()} 🪙, +${firstGems} 💎, +${firstShardsCount} Mảnh ${shardName}!`);
            } else {
              setMissionToast(`🌌 CHIẾM ĐÓNG 100% ${u.name}! Thưởng: +${u.rewardGold.toLocaleString()} Vàng`);
            }
            setTimeout(() => setMissionToast(null), 5000);
          }
        }

        // CI4 Adventure Mode stage clearance
        if (activeGameMode === 'adventure' && activeAdventureStageId) {
          const stage = getAdventureStageById(activeAdventureStageId);
          const finalHpRatio = (engineRef.current?.player.hp || 1) / (engineRef.current?.player.maxHp || 1);
          const revives = finalStats.revivesUsed || 0;
          const starsEarned = calculateStageStars(finalHpRatio, revives);
          const {
            nextProgress,
            firstClear,
            rewardGold: stageGold,
            rewardGems: stageGems,
            rewardShards: stageShards,
          } = completeAdventureStage(
            adventureProgress,
            activeAdventureStageId,
            finalStats.score,
            finalHpRatio,
            revives
          );
          setAdventureProgress(nextProgress);
          try {
            localStorage.setItem('sky_vanguard_adventure_progress', JSON.stringify(nextProgress));
          } catch {}

          if (stageGold > 0) {
            setGold((g) => {
              const nextG = g + stageGold;
              try { localStorage.setItem('sky_vanguard_gold', String(nextG)); } catch {}
              return nextG;
            });
          }
          if (stageGems > 0) {
            setGems((g) => {
              const nextG = g + stageGems;
              try { localStorage.setItem('sky_vanguard_gems', String(nextG)); } catch {}
              return nextG;
            });
          }
          if (stageShards > 0) {
            setFighterShards((prevShards) => {
              const fighterKey = selectedFighter.id;
              const updated = {
                ...prevShards,
                [fighterKey]: (prevShards[fighterKey] || 0) + stageShards,
              };
              try { localStorage.setItem('sky_vanguard_fighter_shards', JSON.stringify(updated)); } catch {}
              return updated;
            });
          }

          const stageTitle = stage ? `${stage.name} (${stage.galaxyName})` : `Màn ${activeAdventureStageId}`;
          const starStr = '⭐'.repeat(starsEarned);
          if (firstClear) {
            setMissionToast(`🍗 CHIẾN THẮNG ${stageTitle}! ${starStr} +${stageGold.toLocaleString()}🪙 +${stageGems}💎 +${stageShards}🧩!`);
          } else {
            setMissionToast(`🍗 VƯỢT MÀN ${stageTitle}! ${starStr} +${stageGold.toLocaleString()}🪙`);
          }
          setTimeout(() => setMissionToast(null), 5000);
        }

        // Boss Rush Leaderboard record on victory
        if (activeGameMode === 'boss_rush') {
          const newEntry = addBossRushRecord({
            fighterId: selectedFighter.id,
            fighterName: selectedFighter.vietnameseName || selectedFighter.name,
            fighterTier: selectedFighter.tier,
            fighterStars: fighterStars[selectedFighter.id] || 1,
            bossesDefeated: 20,
            totalBosses: 20,
            clearTimeSeconds: finalStats.playTime,
            revivesUsed: finalStats.revivesUsed || 0,
            score: finalStats.score,
            difficulty,
            isVictory: true,
            playerName: playerProfile.playerName,
            callsign: playerProfile.callsign,
          });
          setHighlightBossRushId(newEntry.id);
          setMissionToast(`👑 CHIẾN THẮNG ĐẠI CHIẾN BOSS! Thời gian: ${Math.floor(finalStats.playTime)}s · Hồi sinh: ${finalStats.revivesUsed || 0}`);
        }

        handleMissionAction('kill_enemies', finalStats.enemiesKilled);
        handleMissionAction('reach_wave', finalStats.wave, true);
        handleMissionAction('reach_score', finalStats.score, true);

        setLastEarnedGems(earnedGems);
        setLastEarnedGold(earnedGold);
        setGameOverStats({
          score: finalStats.score,
          wave: finalStats.wave,
          enemiesKilled: finalStats.enemiesKilled,
          playTime: finalStats.playTime,
          revivesUsed: finalStats.revivesUsed,
          remainingHp: (finalStats as any).remainingHp ?? 0,
          maxHp: (finalStats as any).maxHp ?? 100,
        });
        setGameState('gameover');
      },
      onMissionAction: handleMissionAction,
    };
    if (engineRef.current) {
      engineRef.current.updateCallbacks(callbacksRef.current);
    }
  }, [difficulty, handleMissionAction, activeGameMode, activeUniverseId, firstClearedUniverseIds, selectedFighter, fighterStars, activeAdventureStageId, adventureProgress]);

  // Initialize Canvas 2D Engine once
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new SkyVanguardEngine(canvasRef.current, callbacksRef.current);
    engineRef.current = engine;
    (window as unknown as { __skyEngine?: SkyVanguardEngine | null }).__skyEngine = engine;
    engine.start();

    // Initial loadout sync
    syncEngineLoadout(selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, fighterStars);

    return () => {
      engine.destroy();
      engineRef.current = null;
      (window as unknown as { __skyEngine?: SkyVanguardEngine | null }).__skyEngine = null;
    };
  }, []);

  // Sync engine stats whenever fighter/pilot/accessories/difficulty/stars/drones change WITHOUT canvas re-mount
  useEffect(() => {
    if (engineRef.current) {
      const starLevel = fighterStars[selectedFighter.id] || 1;
      engineRef.current.setFighter(selectedFighter.id, starLevel);
      engineRef.current.setPilot(equippedPilotId);
      engineRef.current.setAccessories(fighterAccessories[selectedFighter.id] || []);
      engineRef.current.setDrones(equippedDroneIds);
      engineRef.current.setDifficulty(difficulty);
    }
  }, [selectedFighter.id, equippedPilotId, fighterAccessories, difficulty, fighterStars, equippedDroneIds]);

  // Support ?autostart=1 query parameter for automated testing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      let fighters = ownedFighterIds;
      if (fighters.length === 0) {
        fighters = ['phoenix'];
        setOwnedFighterIds(['phoenix']);
        try {
          localStorage.setItem('sky_vanguard_fighters', JSON.stringify(['phoenix']));
        } catch {}
      }
      setTimeout(() => {
        if (engineRef.current) {
          const starLevel = fighterStars['phoenix'] || 1;
          engineRef.current.setFighter('phoenix', starLevel);
          engineRef.current.startRun();
        }
      }, 150);
    }
  }, [fighterStars]);

  // Cadet Relief fail-safe: If player has 0 fighters and less than 200 gems, grant Phoenix cadet fighter so they cannot get stuck
  useEffect(() => {
    if (ownedFighterIds.length === 0 && gems < 200) {
      setOwnedFighterIds(['phoenix']);
      setSelectedFighter(FIGHTERS.phoenix);
      try {
        localStorage.setItem('sky_vanguard_fighters', JSON.stringify(['phoenix']));
      } catch {}
      setMissionToast('Bộ Tư Lệnh đã viện trợ khẩn cấp Chiến cơ PX-01 Phoenix cho tân binh!');
      setTimeout(() => setMissionToast(null), 5000);
    }
  }, [ownedFighterIds.length, gems]);

  const claimableMissionsCount = missions.filter((m) => m.completed && !m.claimed).length;

  return (
    <main
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#050b14] select-none text-slate-100 font-rajdhani"
      data-testid="game-container"
    >
      {/* 60 FPS Isolated Canvas Surface */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block touch-none cursor-crosshair ${
          gameState === 'title' ? 'invisible pointer-events-none' : ''
        }`}
        data-testid="game-canvas"
      />

      {/* Atmospheric Arcade Vignette & Contrast Overlay */}
      {gameState !== 'title' && (
        <div className="absolute inset-0 pointer-events-none z-[2] game-viewport-atmosphere" />
      )}

      {/* Screen 1: Title Screen & Fighter Hangar */}
      {gameState === 'title' && (
        <TitleScreen
          selectedFighter={selectedFighter}
          onSelectFighter={handleSelectFighter}
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          highScore={hudState.highScore}
          gems={gems}
          gold={gold}
          fighterShards={fighterShards}
          fighterStars={fighterStars}
          onOpenUpgrade={handleOpenUpgrade}
          ownedFighterIds={ownedFighterIds}
          ownedPilotIds={ownedPilotIds}
          equippedPilotId={equippedPilotId}
          fighterAccessories={fighterAccessories}
          claimableMissionsCount={claimableMissionsCount}
          onOpenGacha={(tab) => {
            setGachaInitialTab(tab || 'fighters');
            setIsGachaOpen(true);
          }}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenDailyBonus={() => setIsDailyBonusOpen(true)}
          onOpenPilots={() => setIsPilotsOpen(true)}
          onOpenAccessories={() => setIsAccessoriesOpen(true)}
          isDailyBonusReady={dailyBonusStatus.canClaim}
          dailyBonusCountdown={dailyBonusStatus.formattedCountdown}
          dailyBonusDay={dailyBonusStatus.nextDayToClaim}
          dailyBonusRewardGems={dailyBonusStatus.rewardGems}
          onResetProgress={handleResetAllProgress}
          rechargeState={rechargeState}
          onOpenRecharge={handleOpenRecharge}
          unclaimedMailCount={getUnclaimedMailCount(mails)}
          onOpenMailbox={handleOpenMailbox}
          difficulty={difficulty}
          onSelectDifficulty={handleSelectDifficulty}
          onOpenModeSelect={() => setIsModeSelectOpen(true)}
          onOpenUniverseSelect={() => setIsUniverseSelectOpen(true)}
          universeConqueredCount={getConquestSummary(universeProgress).conqueredCount}
          activeGameMode={activeGameMode}
          activeUniverseId={activeUniverseId}
          onSelectUniverseId={handleSelectUniverseId}
          onSelectGameMode={handleSelectGameMode}
          universeProgress={universeProgress}
          activeUniverseName={activeUniverseId ? getUniverseById(activeUniverseId)?.name : 'Vũ Trụ 01: Tinh Vân Orion'}
          onOpenFighterDetail={(fighter) => setDetailFighter(fighter)}
          onOpenPilotDetail={(pilot) => setDetailPilot(pilot)}
          onOpenBossRushLeaderboard={() => setIsBossRushLeaderboardOpen(true)}
          onOpenAdventureMap={() => {
            setActiveGameMode('adventure');
            try {
              localStorage.setItem('sky_vanguard_active_game_mode', 'adventure');
            } catch {}
            setIsAdventureMapOpen(true);
          }}
          onLaunchAdventureStage={handleLaunchAdventureStage}
          activeAdventureStageId={activeAdventureStageId}
          unlockedAdventureStages={adventureProgress.unlockedStages}
          adventureStars={adventureProgress.totalStars}
          playerName={playerProfile.playerName}
          playerCallsign={playerProfile.callsign}
          playerAvatar={playerProfile.avatar}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          ownedDroneIds={ownedDroneIds}
          equippedDroneIds={equippedDroneIds}
          onOpenDrones={(droneId) => {
            setSelectedDroneIdInHangar(droneId || null);
            setIsDronesModalOpen(true);
          }}
          onOpenDroneGacha={() => setIsDroneGachaOpen(true)}
          gameSettings={gameSettings}
          onUpdateSettings={handleUpdateSettings}
          activeSkinId={getActiveSkinForFighter(dailyLoginState, selectedFighter.id)}
        />
      )}

      {/* Lobby Floating Notification Toast */}
      {gameState === 'title' && missionToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 rounded-full bg-slate-900/95 border border-cyan-400 text-cyan-200 font-orbitron font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-bounce backdrop-blur-md">
          <span>{missionToast}</span>
        </div>
      )}

      {/* Screen 2: In-Game Low Occlusion HUD */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <HUD
          state={hudState}
          onPause={handleTogglePause}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onTriggerBomb={handleTriggerBomb}
          onTriggerSkill={handleTriggerSkill}
          onToggleAutoFire={handleToggleAutoFire}
          missionToast={missionToast}
          onExitFreeFlight={handleExitFreeFlight}
          onCycleFreeFlightTheme={handleCycleFreeFlightTheme}
          onTogglePhotoMode={handleTogglePhotoMode}
          onBoostFreeFlight={handleBoostFreeFlight}
        />
      )}

      {/* Status Modal: Pause */}
      {gameState === 'paused' && (
        <PauseModal
          score={hudState.score}
          wave={hudState.wave}
          gameMode={hudState.gameMode}
          onResume={handleTogglePause}
          onRestart={handleStartGame}
          onExitToTitle={handleExitToTitle}
          onOpenUniverseSelect={() => {
            handleExitToTitle();
            setIsUniverseSelectOpen(true);
          }}
          onOpenAdventureMap={() => {
            handleExitToTitle();
            setIsAdventureMapOpen(true);
          }}
        />
      )}

      {/* Status Modal: Game Over / Defeat / Victory */}
      {gameState === 'gameover' && (
        <GameOverModal
          score={gameOverStats.score}
          highScore={hudState.highScore}
          wave={gameOverStats.wave}
          enemiesKilled={gameOverStats.enemiesKilled}
          playTime={gameOverStats.playTime}
          isVictory={gameOverStats.score >= 10000}
          remainingHp={gameOverStats.remainingHp}
          maxHp={gameOverStats.maxHp}
          earnedGems={lastEarnedGems}
          earnedGold={lastEarnedGold}
          gameMode={hudState.gameMode}
          revivesUsed={gameOverStats.revivesUsed}
          playerName={playerProfile.playerName}
          onOpenBossRushLeaderboard={() => setIsBossRushLeaderboardOpen(true)}
          onRestart={handleStartGame}
          onExitToTitle={handleExitToTitle}
          onOpenUniverseSelect={() => {
            handleExitToTitle();
            setIsUniverseSelectOpen(true);
          }}
          onOpenAdventureMap={() => {
            handleExitToTitle();
            setIsAdventureMapOpen(true);
          }}
        />
      )}

      {/* Daily Login Bonus Modal */}
      <DailyLoginModal
        isOpen={isDailyBonusOpen}
        onClose={() => setIsDailyBonusOpen(false)}
        dailyState={dailyLoginState}
        onClaim={handleClaimDailyBonus}
        gems={gems}
        onToggleSkin={handleToggleSkin}
      />

      {/* Gacha Summoning Modal (Fighters & Pilots) */}
      <GachaModal
        isOpen={isGachaOpen}
        onClose={() => setIsGachaOpen(false)}
        gems={gems}
        pityS={pityS}
        pityA={pityA}
        pilotPityS={pilotPityS}
        pilotPityA={pilotPityA}
        ownedFighterIds={ownedFighterIds}
        ownedPilotIds={ownedPilotIds}
        initialTab={gachaInitialTab}
        onPullFighters={handleExecutePullFighters}
        onPullPilots={handleExecutePullPilots}
        onSelectFighter={handleSelectFighter}
        onEquipPilot={handleEquipPilot}
        equippedPilotId={equippedPilotId}
        onOpenRecharge={() => handleOpenRecharge('packs')}
        onInspectFighter={(fighter) => setDetailFighter(fighter)}
        astraeaBannerStartTime={astraeaBannerStartTime}
        onOpenDroneGacha={() => setIsDroneGachaOpen(true)}
      />

      {/* Pilots Barracks Modal */}
      <PilotsModal
        isOpen={isPilotsOpen}
        onClose={() => setIsPilotsOpen(false)}
        ownedPilotIds={ownedPilotIds}
        equippedPilotId={equippedPilotId}
        onEquipPilot={handleEquipPilot}
        onOpenPilotGacha={() => {
          setGachaInitialTab('pilots');
          setIsGachaOpen(true);
        }}
      />

      {/* Pilot Detail Dossier Modal (Lobby Quick Info) */}
      <PilotDetailModal
        isOpen={detailPilot !== null}
        onClose={() => setDetailPilot(null)}
        pilot={detailPilot}
        isOwned={detailPilot ? ownedPilotIds.includes(detailPilot.id) : false}
        isEquipped={detailPilot ? equippedPilotId === detailPilot.id : false}
        onEquipPilot={(id) => {
          handleEquipPilot(id);
          setDetailPilot(null);
        }}
        onOpenPilotGacha={() => {
          setDetailPilot(null);
          setGachaInitialTab('pilots');
          setIsGachaOpen(true);
        }}
      />

      {/* Weapon Accessories Armory Modal (Gold Shop) */}
      <AccessoriesModal
        isOpen={isAccessoriesOpen}
        onClose={() => setIsAccessoriesOpen(false)}
        selectedFighter={selectedFighter}
        gold={gold}
        gems={gems}
        ownedAccessoryIds={ownedAccessoryIds}
        fighterAccessories={fighterAccessories}
        onBuyAccessory={handleBuyAccessory}
        onToggleEquipAccessory={handleToggleEquipAccessory}
        onOpenRecharge={() => handleOpenRecharge('packs')}
      />

      {/* Fighter Star Upgrade Modal */}
      <FighterUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        fighter={FIGHTERS[upgradeModalFighterId] || selectedFighter}
        allFighters={Object.values(FIGHTERS)}
        ownedFighterIds={ownedFighterIds}
        gold={gold}
        fighterShards={fighterShards}
        fighterStars={fighterStars}
        onSelectFighter={(fid) => {
          setUpgradeModalFighterId(fid);
          handleSelectFighter(fid);
        }}
        onUpgradeStar={handleUpgradeFighterStar}
        onGrantTestShards={handleGrantTestShards}
        onOpenGacha={() => {
          setIsUpgradeModalOpen(false);
          setGachaInitialTab('fighters');
          setIsGachaOpen(true);
        }}
        onOpenFighterDetail={(fighter) => setDetailFighter(fighter)}
      />

      {/* Fighter Technical Dossier & Tactical Advice Modal */}
      <FighterDetailModal
        isOpen={!!detailFighter}
        onClose={() => setDetailFighter(null)}
        fighter={detailFighter}
        fighterStars={fighterStars}
        fighterShards={fighterShards}
        isOwned={detailFighter ? ownedFighterIds.includes(detailFighter.id) : false}
        onSelectFighter={(fid) => {
          handleSelectFighter(fid);
          setDetailFighter(null);
        }}
        onOpenUpgrade={(fid) => {
          setUpgradeModalFighterId(fid);
          setIsUpgradeModalOpen(true);
          setDetailFighter(null);
        }}
        unlockedSkinIds={dailyLoginState.unlockedSkinIds || []}
        activeSkinId={detailFighter ? getActiveSkinForFighter(dailyLoginState, detailFighter.id) : null}
        onToggleSkin={(skinId) => handleToggleSkin(skinId, detailFighter?.id)}
      />

      {/* Missions Modal */}
      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        missions={missions}
        onClaim={handleClaimMission}
        onClaimAll={handleClaimAllMissions}
      />

      {/* Top-up & VIP Center Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        gems={gems}
        gold={gold}
        rechargeState={rechargeState}
        ownedFighterIds={ownedFighterIds}
        initialTab={rechargeInitialTab}
        onPurchasePackage={handlePurchasePackage}
        onPurchaseGoldPackage={handlePurchaseGoldPackage}
        onPurchasePass={handlePurchasePass}
        onClaimPassDaily={handleClaimPassDaily}
        onClaimFirstRecharge={handleClaimFirstRecharge}
        onClaimVipReward={handleClaimVipReward}
        onRedeemCode={handleRedeemGiftCode}
      />

      {/* Military Dispatch & Starter Gift Mailbox Modal */}
      <MailboxModal
        isOpen={isMailboxOpen}
        onClose={() => setIsMailboxOpen(false)}
        mails={mails}
        onReadMail={handleReadMail}
        onClaimReward={handleClaimMailReward}
        onClaimAll={handleClaimAllMails}
        onDeleteClaimed={handleDeleteClaimedMails}
        lastMailDispatch={lastMailDispatch}
      />

      {/* Mode Select Modal (Xuất Chiến: Phiêu Lưu CI4 vs Chọn Vũ Trụ vs Đại Chiến Boss vs Đấu Vô Hạn vs Du Ngoạn Thiên Hà) */}
      <ModeSelectModal
        isOpen={isModeSelectOpen}
        onClose={() => setIsModeSelectOpen(false)}
        onSelectSuperHardMode={handleStartSuperHard}
        onSelectAdventureMode={() => {
          setIsModeSelectOpen(false);
          setActiveGameMode('adventure');
          try {
            localStorage.setItem('sky_vanguard_active_game_mode', 'adventure');
          } catch {}
          setIsAdventureMapOpen(true);
        }}
        onSelectUniverseMode={() => {
          setIsModeSelectOpen(false);
          setIsUniverseSelectOpen(true);
        }}
        onSelectEndlessMode={handleStartEndless}
        onSelectBossRushMode={handleStartBossRush}
        onSelectFreeFlightMode={handleStartFreeFlight}
        onOpenBossRushLeaderboard={() => setIsBossRushLeaderboardOpen(true)}
        universeProgress={universeProgress}
        highScore={hudState.highScore}
        adventureStars={adventureProgress.totalStars}
      />

      {/* Chicken Invaders 4 Style 20-Stage Galactic Odyssey Map Modal */}
      <AdventureMapModal
        isOpen={isAdventureMapOpen}
        onClose={() => setIsAdventureMapOpen(false)}
        progress={adventureProgress}
        onLaunchStage={handleLaunchAdventureStage}
      />

      {/* Universe Selection Modal (40 Universes + Central Black Hole scattered starmap) */}
      <UniverseSelectModal
        isOpen={isUniverseSelectOpen}
        onClose={() => setIsUniverseSelectOpen(false)}
        universeProgress={universeProgress}
        claimedMilestoneIds={claimedUniverseMilestones}
        firstClearedUniverseIds={firstClearedUniverseIds}
        onDeployUniverse={handleDeployUniverse}
        onClaimMilestone={handleClaimUniverseMilestone}
        onBackToModeSelect={() => {
          setIsUniverseSelectOpen(false);
          setIsModeSelectOpen(true);
        }}
      />

      {/* Dedicated Boss Rush Local Leaderboard Modal */}
      <BossRushLeaderboardModal
        isOpen={isBossRushLeaderboardOpen}
        onClose={() => setIsBossRushLeaderboardOpen(false)}
        onStartBossRush={() => {
          setIsBossRushLeaderboardOpen(false);
          handleStartBossRush();
        }}
        highlightEntryId={highlightBossRushId}
        playerName={playerProfile.playerName}
        onOpenRename={() => setIsProfileModalOpen(true)}
      />

      {/* Commander Profile & Rename Modal (Cơ chế đổi tên Chỉ Huy & Mật Danh) */}
      <CommanderProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={playerProfile}
        onSaveProfile={handleSaveProfile}
        highScore={hudState.highScore}
        ownedFighterCount={ownedFighterIds.length}
        universeConqueredCount={getConquestSummary(universeProgress).conqueredCount}
        vipLevel={getVipStatus(rechargeState.vipExp).currentTier.level}
      />

      {/* Dedicated Drone Gacha Summoning Chamber Modal */}
      <DroneGachaModal
        isOpen={isDroneGachaOpen}
        onClose={() => setIsDroneGachaOpen(false)}
        gems={gems}
        dronePityS={dronePityS}
        dronePityA={dronePityA}
        ownedDroneIds={ownedDroneIds}
        equippedDroneIds={equippedDroneIds}
        onPullDrones={handleExecutePullDrones}
        onEquipDrone={(id, slot) => handleEquipDrone(id, slot)}
        onOpenRecharge={() => handleOpenRecharge('packs')}
        onOpenDronesHangar={() => {
          setIsDroneGachaOpen(false);
          setIsDronesModalOpen(true);
        }}
      />

      {/* Drone Escort Hangar & Loadout Modal */}
      <DronesModal
        isOpen={isDronesModalOpen}
        onClose={() => {
          setIsDronesModalOpen(false);
          setSelectedDroneIdInHangar(null);
        }}
        initialSelectedDroneId={selectedDroneIdInHangar}
        ownedDroneIds={ownedDroneIds}
        equippedDroneIds={equippedDroneIds}
        onEquipDrone={(id, slot) => handleEquipDrone(id, slot)}
        onUnequipDrone={(slot) => handleUnequipDrone(slot)}
        onOpenDroneGacha={() => {
          setIsDronesModalOpen(false);
          setIsDroneGachaOpen(true);
        }}
      />
    </main>
  );
}
