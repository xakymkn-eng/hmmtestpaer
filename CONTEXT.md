# BẢN ĐỒ CODE (đọc file này TRƯỚC, chỉ mở file thật sự cần sửa)

Stack: React 19 + Vite + Tailwind 4, game canvas tự viết. Entry: src/main.tsx -> App.tsx -> game/SkyVanguardEngine.ts.
Lệnh: `npm run dev` | `npm run lint` | `npm test` | `npm run build`.
Quy tắc tiết kiệm token: dùng grep/đọc theo dòng cho file >1000 dòng, không đọc cả file.

## File lớn (nên đọc theo vùng)

- `src/App.tsx` (2785 dòng)
- `src/components/DronesModal.tsx` (936 dòng)
- `src/components/FighterDetailModal.tsx` (971 dòng)
- `src/components/GachaModal.tsx` (1198 dòng)
- `src/components/HUD.tsx` (908 dòng)
- `src/components/RechargeModal.tsx` (1043 dòng)
- `src/components/StarfieldBackground.tsx` (1184 dòng)
- `src/components/TitleScreen.tsx` (1667 dòng)
- `src/components/UniverseSelectModal.tsx` (1089 dòng)
- `src/game/SkyVanguardEngine.ts` (11074 dòng)
- `src/game/audio.ts` (1638 dòng)
- `src/game/fighterSpriteRenderer.ts` (1790 dòng)
- `src/game/recharge.ts` (1039 dòng)
- `src/game/rules.ts` (4557 dòng)
- `src/game/universe.ts` (2702 dòng)

## SkyVanguardEngine.ts — chỉ mục hàm/lớp (dòng: tên)

100:Particle 113:DamageText 127:BossEscortDrone 145:Bullet 224:LightningArc 231:EnemyType 245:Enemy 284:PickupType 286:Pickup 301:CloudLayer 309:Star 320:SpaceFilament 330:EngineHUDState 409:EngineCallbacks 417:SkyVanguardEngine 477:setGameMode 490:cycleFreeFlightTheme 496:togglePhotoMode 502:triggerFreeFlightBoost 510:stopRun 669:toggleAutoFire 675:updateCallbacks 679:constructor 710:initParticlePool 728:emitParticle 752:emitBurst 771:initBackground 859:resizeCanvas 877:bindInputs 1061:setDifficulty 1066:setPilot 1071:setAccessories 1076:setDrones 1107:setCosmeticSkin 1111:recalculatePlayerStats 1140:setFighter 1150:addDamageText 1197:startRun 1298:revivePlayer 1326:switchSectorTheme 1342:resetToTitle 1437:togglePause 1450:triggerBomb 1486:triggerSkill 2189:addTrauma 2193:dispatchHUD 2326:start 2350:stop 2358:destroy 2376:update 2691:updatePlayer 2860:updateDrones 3096:fireDroneWeapon 3214:createLightningSegments 3238:firePlayerWeapons 4570:fireHomingMissiles 4591:spawnBoss 4721:updateEnemies 4991:updateBoss 5472:spawnEnemy 5814:fireEnemyBullet 5846:updateBullets 6029:updatePickups 6049:checkCollisions 6497:destroyEnemy 6679:spawnPickup 6709:collectPickup 6800:damagePlayer 6896:gameOver 6914:victory 6933:render 7827:renderFreeFlightGalaxy 8099:drawRts88LightningBolts 8284:drawPlayerFighter 10044:drawDrones 10186:drawEnemy 10345:drawStar 10384:drawBullet

## Module (dòng | export chính)

- `src/App.tsx` 2785d: App
- `src/components/AccessoriesModal.tsx` 430d: AccessoriesModal
- `src/components/AdventureMapModal.tsx` 558d: AdventureMapModal
- `src/components/BossRushLeaderboardModal.tsx` 365d: BossRushLeaderboardModal
- `src/components/CommanderProfileModal.tsx` 343d: CommanderProfileModal
- `src/components/DailyLoginModal.tsx` 430d: DailyLoginModal
- `src/components/DroneGachaModal.tsx` 691d: DroneGachaModal
- `src/components/DroneGraphic.tsx` 461d: DroneGraphic
- `src/components/DronesModal.tsx` 936d: DronesModal
- `src/components/FighterDetailModal.tsx` 971d: FighterDetailModal
- `src/components/FighterShowcaseCanvas.tsx` 315d: FighterShowcaseCanvas
- `src/components/FighterUpgradeModal.tsx` 530d: FighterUpgradeModal
- `src/components/GachaModal.tsx` 1198d: GachaBannerTab, GachaModal
- `src/components/HUD.tsx` 908d: HUD
- `src/components/MailboxModal.tsx` 375d: MailboxModal
- `src/components/MissionsModal.tsx` 276d: MissionsModal
- `src/components/Modals.tsx` 355d: PauseModal, GameOverModal, ResetConfirmModal
- `src/components/ModeSelectModal.tsx` 454d: ModeSelectModal
- `src/components/NewsCarouselWidget.tsx` 267d: NewsSlide, NewsCarouselWidget
- `src/components/PilotDetailModal.tsx` 251d: PilotDetailModal
- `src/components/PilotsModal.tsx` 235d: PilotsModal
- `src/components/RechargeModal.tsx` 1043d: RechargeModal
- `src/components/SavedLoadoutsModal.tsx` 472d: SavedLoadoutsModal
- `src/components/ScenerySelectModal.tsx` 288d: ScenerySelectModal
- `src/components/SettingsModal.tsx` 341d: SettingsModal
- `src/components/StarfieldBackground.tsx` 1184d: StarfieldBackgroundProps, StarfieldBackground
- `src/components/TitleScreen.tsx` 1667d: TitleScreen
- `src/components/UniverseSelectModal.tsx` 1089d: UniverseSelectModal
- `src/game/adventure.ts` 845d: ChickenBossShape, AdventureBossInfo, AdventureStage, AdventureProgress, ADVENTURE_STAGES, getInitialAdventureProgress, calculateStageStars, getAdventureStageById, completeAdventureStage
- `src/game/alienAndVillainRenderer.ts` 637d: RenderEnemyContext, drawVillainFlagshipBoss, drawVillainRazorScout, drawAlienMantisHunter, drawVillainObsidianCruiser, drawAlienBioRavager, drawVillainNightWraith, drawAlienHiveBroodmother, drawVillainSiegeFortress, drawAlienVoidJellyfish…
- `src/game/audio.ts` 1638d: sound
- `src/game/bossRushLeaderboard.ts` 201d: BossRushLeaderboardEntry, BOSS_RUSH_LEADERBOARD_KEY, INITIAL_BOSS_RUSH_LEADERBOARD, compareBossRushEntries, getBossRushLeaderboard, addBossRushRecord, formatBossClearTime
- `src/game/chickenRenderer.ts` 857d: drawChickenInvader, drawChickenBoss, drawEggBullet, drawDrumstickPickup
- `src/game/combatTitles.ts` 239d: TitleTier, CombatTitle, CombatStatsInput, TITLE_TIER_ORDER, calculateCombatTitles
- `src/game/comboBurst.ts` 243d: ComboBurstTier, COMBO_BURST_TIERS, SCORE_BURST_THRESHOLDS, ComboBurstEvent, getComboBurstTier, checkComboBurstCrossing, checkScoreThresholdCrossing, createComboBurstEvent
- `src/game/cosmicDust.ts` 149d: CosmicDustMote, COSMIC_DUST_PALETTES, initCosmicDust, updateCosmicDust, renderCosmicDust
- `src/game/drones.ts` 869d: DroneTier, DronePassiveType, DronePassive, DroneStatBuffs, DroneData, DRONES, calculateDroneBonuses, DroneGachaItem, DRONE_GACHA_SINGLE_COST, DRONE_GACHA_TEN_COST…
- `src/game/fighterDetails.ts` 691d: FighterDossier, FIGHTER_DOSSIERS, getFighterDossier
- `src/game/fighterSpriteRenderer.ts` 1790d: DrawFighterSpriteOptions, drawFighterSprite
- `src/game/freeFlight.ts` 305d: CelestialLandmark, GALAXY_WORLD_WIDTH, GALAXY_WORLD_HEIGHT, CELESTIAL_LANDMARKS, GalaxyTheme, GALAXY_THEMES, FreeFlightState, initFreeFlightState, FreeFlightInput, updateFreeFlightPhysics…
- `src/game/hangarParticles.ts` 249d: HangarParticleType, HangarParticle, HangarParticleTheme, DEFAULT_HANGAR_THEME, createHangarParticlePool, respawnHangarParticle, updateHangarParticles, renderHangarParticles
- `src/game/loadouts.ts` 267d: SavedLoadout, LOADOUT_ICONS, DEFAULT_LOADOUT_TEMPLATES, getInitialSavedLoadouts, saveLoadoutsToStorage, saveOrUpdateLoadoutSlot, deleteLoadoutSlot, applySavedLoadout, getLoadoutStatsSummary
- `src/game/lobbySettings.ts` 415d: GraphicsQuality, FpsTarget, BlackHoleColor, SceneryType, SceneryConfig, SCENERY_CONFIGS, ALL_SCENERIES, BLACK_HOLE_VARIANTS, HANGAR_BAY_VARIANTS, GameSettings…
- `src/game/mail.ts` 329d: MailReward, MailItem, INITIAL_MAILS, HOURLY_MAIL_INTERVAL_MS, HourlyMailTemplate, HOURLY_MAIL_TEMPLATES, formatMailDate, generateRandomHourlyMail, checkAndDispatchHourlyMails, getUnclaimedMailCount…
- `src/game/parallaxTilt.ts` 241d: TiltState, normalizeOrientationAngles, calculateShakeMagnitude, lerpTilt, parallaxTiltManager
- `src/game/pilotDetails.ts` 98d: PilotDossier, PILOT_DOSSIERS, getPilotDossier
- `src/game/profile.ts` 208d: PLAYER_NAME_STORAGE_KEY, PLAYER_CALLSIGN_STORAGE_KEY, PLAYER_AVATAR_STORAGE_KEY, RENAME_COUNT_STORAGE_KEY, DEFAULT_PLAYER_NAME, DEFAULT_PLAYER_CALLSIGN, DEFAULT_PLAYER_AVATAR, COMMANDER_AVATARS, RANDOM_NAME_SUGGESTIONS, RANDOM_CALLSIGN_SUGGESTIONS…
- `src/game/recharge.ts` 1039d: RechargeTab, TopUpPackage, TOPUP_PACKAGES, TopUpGoldPackage, TOPUP_GOLD_PACKAGES, VipTier, VIP_TIERS, PassSubscription, DEFAULT_WEEKLY_PASS, DEFAULT_MONTHLY_PASS…
- `src/game/rules.ts` 4557d: FighterTier, FighterStats, FIGHTERS, PilotTier, PilotBonus, Pilot, PILOTS, getPilotBonus, calculateIncomingDamage, checkDodge…
- `src/game/starfield.ts` 585d: StarParticle, CelestialPlanet, StardustParticle, ShootingStar, FastPassingStar, CosmicWindStream, MicroDustParticle, normalizeMouseCoordinates, calculateParallaxOffset, lerp…
- `src/game/superHard.ts` 524d: BossSkillType, SuperHardBossConfig, SUPER_HARD_TOTAL_WAVES, SUPER_HARD_BOSSES, isMidTierEnemy, SUPER_HARD_STATS, SuperHardCalculatedStats, calculateSuperHardEnemyStats, getSuperHardBoss, DamageWithArmorResult…
- `src/game/universe.ts` 2702d: UniverseCluster, UNIVERSE_CLUSTERS, EnvironmentalHazard, UniverseSector, CENTRAL_BLACK_HOLE, UNIVERSES, TOTAL_UNIVERSES_COUNT, UniverseConquestMilestone, UNIVERSE_MILESTONES, getInitialUniverseProgress…
- `src/main.tsx` 5d: 
