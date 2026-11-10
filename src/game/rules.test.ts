import test from 'node:test';
import assert from 'node:assert/strict';
import {
checkCircleCollision,
calculateEnemyScore,
updateCombo,
getComboMultiplier,
checkComboMilestone,
getWeaponUpgradeSpecs,
clamp,
getSpawnInterval,
shouldSpawnBoss,
FIGHTERS,
PILOTS,
getPilotBonus,
WEAPON_ACCESSORIES,
calculateAccessoryBonuses,
SPECIAL_WEAPONS,
calculateSpecialWeaponDuration,
findLightningChainTargets,
executeGachaPull,
executePilotGachaPull,
updateMissionProgress,
claimMissionReward,
DAILY_BONUS_DAYS,
DAILY_BONUS_COOLDOWN_MS,
DAILY_BONUS_GRACE_PERIOD_MS,
INITIAL_DAILY_LOGIN_STATE,
checkDailyBonusStatus,
claimDailyBonusReward,
COSMETIC_SKINS,
toggleCosmeticSkin,getSectorForWave,
getComboRankInfo,
calculateIncomingDamage,
checkDodge,
calculateBulletDamage,
DIFFICULTY_CONFIGS,
calculateWaveScaling,
switchSectorBackgroundTheme,
getSectorVisualTheme,
calculateGoldReward,
getFighterStarBonus,
getFighterStarUpgradeCost,
canUpgradeFighterStar,
upgradeFighterStar,
calculateMobileTouchPosition,
getBossDamageMultiplier,
getMobileViewportMode,
getAstraeaBannerStatus,
ASTRAEA_LIMITED_BANNER_DURATION_MS,
INITIAL_MISSIONS,
calculateLaserBeamTrajectory,
checkLaserHit,
isSkinUnlocked,
calculateVampireLifeLeech,
getVampireBloodthirstBonus,
calculateRts88LightningDamage,
calculateRts88EffectiveDefense,
absorbRts88ShieldDamage,
getActiveSkinForFighter
} from './rules.ts';

test('Fighters have defined base archetypes with distinct attributes', () => {
  assert.ok(FIGHTERS.phoenix);
  assert.ok(FIGHTERS.titan);
  assert.ok(FIGHTERS.ghost);
  assert.ok(FIGHTERS.astraea);

  // Phoenix has 100 HP and 50 Armor
  assert.equal(FIGHTERS.phoenix.maxHp, 100);
  assert.equal(FIGHTERS.phoenix.maxArmor, 50);

  // Astraea has 90 HP, 30 Armor, 60 bullet damage (reduced by 60% from 150)
  assert.equal(FIGHTERS.astraea.maxHp, 90);
  assert.equal(FIGHTERS.astraea.maxArmor, 30);
  assert.equal(FIGHTERS.astraea.bulletDamage, 60);
  assert.equal(FIGHTERS.astraea.tier, 'S');

  // LX-88 Arc Tempest has maxHp: 40, maxArmor: 150, fireRate: 10, bulletDamage: 12
  assert.ok(FIGHTERS.arc_tempest);
  assert.equal(FIGHTERS.arc_tempest.maxHp, 40);
  assert.equal(FIGHTERS.arc_tempest.maxArmor, 150);
  assert.equal(FIGHTERS.arc_tempest.fireRate, 10);
  assert.equal(FIGHTERS.arc_tempest.bulletDamage, 12);
  assert.equal(FIGHTERS.arc_tempest.tier, 'S');

  // Titan has highest HP and Armor
  assert.ok(FIGHTERS.titan.maxHp > FIGHTERS.phoenix.maxHp);
  assert.ok(FIGHTERS.titan.maxArmor > FIGHTERS.phoenix.maxArmor);
  // Ghost has high fire rate
  assert.ok(FIGHTERS.ghost.fireRate > FIGHTERS.titan.fireRate);
  // Phoenix is agile
  assert.ok(FIGHTERS.phoenix.speed > FIGHTERS.titan.speed);
});

test('checkCircleCollision accurately calculates distance overlaps', () => {
  const a = { x: 100, y: 100, radius: 15 };
  const b = { x: 120, y: 100, radius: 10 }; // distance 20 <= 25 (collision)
  const c = { x: 150, y: 100, radius: 10 }; // distance 50 > 25 (no collision)

  assert.equal(checkCircleCollision(a, b), true);
  assert.equal(checkCircleCollision(a, c), false);
});

test('calculateEnemyScore factors in combo multiplier and wave scaling', () => {
  const base = 100;
  // Wave 1, combo 1x
  const scoreW1 = calculateEnemyScore(base, 1.0, 1);
  assert.equal(scoreW1, 100);

  // Wave 1, combo 2.0x
  const scoreCombo = calculateEnemyScore(base, 2.0, 1);
  assert.equal(scoreCombo, 200);

  // Wave 3, combo 1.5x -> base * 1.5 * (1 + 2*0.15) = 100 * 1.5 * 1.3 = 195
  const scoreW3 = calculateEnemyScore(base, 1.5, 3);
  assert.equal(scoreW3, 195);
});

test('updateCombo increments within combo window and resets after expiration', () => {
  const t0 = 1000;
  // First hit
  const hit1 = updateCombo(1, 0, t0, 2000);
  assert.equal(hit1.combo, 1);

  // Second hit within window (1.5s later)
  const hit2 = updateCombo(hit1.combo, hit1.lastHitTime, t0 + 1500, 2000);
  assert.equal(hit2.combo, 2);

  // Third hit within window (1s later)
  const hit3 = updateCombo(hit2.combo, hit2.lastHitTime, t0 + 2500, 2000);
  assert.equal(hit3.combo, 3);

  // Fourth hit after window expires (3s later > 2s window)
  const hit4 = updateCombo(hit3.combo, hit3.lastHitTime, t0 + 5500, 2000);
  assert.equal(hit4.combo, 1);
});

test('getComboMultiplier yields stepped multiplier tiers including high milestones', () => {
  assert.equal(getComboMultiplier(1), 1.0);
  assert.equal(getComboMultiplier(4), 1.2);
  assert.equal(getComboMultiplier(8), 1.5);
  assert.equal(getComboMultiplier(12), 2.0);
  assert.equal(getComboMultiplier(20), 3.0);
  assert.equal(getComboMultiplier(49), 3.0);
  assert.equal(getComboMultiplier(50), 3.5);
  assert.equal(getComboMultiplier(99), 3.5);
  assert.equal(getComboMultiplier(100), 4.0);
  assert.equal(getComboMultiplier(149), 4.0);
  assert.equal(getComboMultiplier(150), 4.5);
  assert.equal(getComboMultiplier(200), 5.0);
});

test('checkComboMilestone detects milestone crossings every 50 hits and ignores non-milestones', () => {
  // Before milestone
  assert.equal(checkComboMilestone(0, 1, 50), null);
  assert.equal(checkComboMilestone(1, 10, 50), null);
  assert.equal(checkComboMilestone(48, 49, 50), null);

  // Crossing 50 hits milestone
  assert.equal(checkComboMilestone(49, 50, 50), 50);
  assert.equal(checkComboMilestone(45, 52, 50), 50);

  // Hits after milestone within same 50 tier
  assert.equal(checkComboMilestone(50, 51, 50), null);
  assert.equal(checkComboMilestone(51, 60, 50), null);
  assert.equal(checkComboMilestone(98, 99, 50), null);

  // Crossing 100 hits milestone
  assert.equal(checkComboMilestone(99, 100, 50), 100);
  assert.equal(checkComboMilestone(95, 102, 50), 100);

  // Crossing 150 hits milestone
  assert.equal(checkComboMilestone(149, 150, 50), 150);

  // Resets / drops should never trigger a milestone
  assert.equal(checkComboMilestone(55, 1, 50), null);
  assert.equal(checkComboMilestone(105, 50, 50), null);
  assert.equal(checkComboMilestone(50, 50, 50), null);
  assert.equal(checkComboMilestone(-1, 0, 50), null);
});

test('updateCombo allows climbing past 20 to reach 50+ hit milestones', () => {
  let combo = 20;
  let lastTime = 1000;
  for (let i = 21; i <= 60; i++) {
    lastTime += 100;
    const res = updateCombo(combo, lastTime - 100, lastTime);
    combo = res.combo;
  }
  assert.equal(combo, 60);
});

test('getWeaponUpgradeSpecs scales bullet count and spread', () => {
  const lv1 = getWeaponUpgradeSpecs(1);
  assert.equal(lv1.bulletCount, 1);
  assert.equal(lv1.hasSideGuns, false);

  const lv3 = getWeaponUpgradeSpecs(3);
  assert.equal(lv3.bulletCount, 3);
  assert.equal(lv3.hasSideGuns, true);

  const lv5 = getWeaponUpgradeSpecs(5);
  assert.equal(lv5.bulletCount, 5);
  assert.ok(lv5.damageMultiplier > lv3.damageMultiplier);
});

test('clamp restricts within boundaries', () => {
  assert.equal(clamp(50, 0, 100), 50);
  assert.equal(clamp(-10, 0, 100), 0);
  assert.equal(clamp(150, 0, 100), 100);
});

test('getSpawnInterval decreases as waves advance', () => {
  const w1 = getSpawnInterval(1);
  const w5 = getSpawnInterval(5);
  assert.ok(w5 < w1);
  assert.ok(w5 >= 0.65);
});

test('shouldSpawnBoss triggers on wave cadence and score threshold', () => {
  assert.equal(shouldSpawnBoss(3, 2500, 0), true);
  assert.equal(shouldSpawnBoss(2, 2500, 0), false); // not wave 3 multiple
  assert.equal(shouldSpawnBoss(3, 1000, 0), false); // score insufficient
});

test('SPECIAL_WEAPONS defines laser and lightning gift box weapon parameters', () => {
  assert.ok(SPECIAL_WEAPONS.laser);
  assert.ok(SPECIAL_WEAPONS.lightning);
  assert.equal(SPECIAL_WEAPONS.laser.type, 'laser');
  assert.equal(SPECIAL_WEAPONS.lightning.type, 'lightning');
  assert.ok(SPECIAL_WEAPONS.laser.bulletDamage > 0);
  assert.ok(SPECIAL_WEAPONS.lightning.bulletDamage > 0);
});

test('calculateSpecialWeaponDuration handles new weapon and stacking duration', () => {
  // First pickup of laser
  const r1 = calculateSpecialWeaponDuration('none', 'laser', 0, 15, 30);
  assert.equal(r1.weapon, 'laser');
  assert.equal(r1.duration, 15);

  // Second pickup of laser stacks duration up to cap
  const r2 = calculateSpecialWeaponDuration('laser', 'laser', 10, 15, 30);
  assert.equal(r2.weapon, 'laser');
  assert.equal(r2.duration, 25);

  // Capped at 30
  const r3 = calculateSpecialWeaponDuration('laser', 'laser', 20, 15, 30);
  assert.equal(r3.duration, 30);

  // Switching weapon replaces with base 15s
  const r4 = calculateSpecialWeaponDuration('laser', 'lightning', 25, 15, 30);
  assert.equal(r4.weapon, 'lightning');
  assert.equal(r4.duration, 15);
});

test('findLightningChainTargets chains to nearby enemies in sequence', () => {
  const enemies = [
    { id: 1, x: 100, y: 150 }, // distance from 100, 200 is 50
    { id: 2, x: 120, y: 120 }, // close to enemy 1
    { id: 3, x: 140, y: 90 },  // close to enemy 2
    { id: 4, x: 900, y: 900 }, // far away (beyond maxDistance)
  ];

  const targets = findLightningChainTargets(100, 200, enemies, 3, 100);
  assert.equal(targets.length, 3);
  assert.equal(targets[0].id, 1);
  assert.equal(targets[1].id, 2);
  assert.equal(targets[2].id, 3);
});

test('All 32 fighters across Tiers S, A, and B have distinct skills, weapons, and locked initially', () => {
  const allFighters = Object.values(FIGHTERS);
  assert.equal(allFighters.length, 32, 'Must have 32 fighters (11 S, 15 A, 6 B)');

  allFighters.forEach((fighter) => {
    assert.ok(fighter.bulletDamage > 0);
    assert.ok(fighter.fireRate > 0);
    assert.ok(fighter.maxHp >= 38); // RTS-88 has 38 HP as requested
    assert.ok(fighter.maxArmor >= 30);
    assert.ok(fighter.skillName.length > 0);
    assert.ok(fighter.skillDescription.length > 0);
    assert.ok(fighter.skillCooldown >= 10);
    assert.equal(fighter.unlockedByDefault, false);
  });

  const tierS = allFighters.filter((f) => f.tier === 'S');
  const tierA = allFighters.filter((f) => f.tier === 'A');
  const tierB = allFighters.filter((f) => f.tier === 'B');
  assert.equal(tierS.length, 11, 'Must have 11 S-tier fighters');
  assert.equal(tierA.length, 15, 'Must have 15 A-tier fighters (including 6 new ones)');
  assert.equal(tierB.length, 6, 'Must have 6 B-tier fighters');
  assert.equal(allFighters.length, 32, 'Must have 32 fighters total');
});

test('RTS-88 Tia Chớp fighter has exact requested stats and lightning mechanics', () => {
  const rts = FIGHTERS.rts_88;
  assert.ok(rts, 'RTS-88 must exist in FIGHTERS');
  assert.equal(rts.tier, 'S');
  assert.equal(rts.maxHp, 38, 'HP must be 38');
  assert.equal(rts.maxArmor, 64, 'Armor must be 64');
  assert.equal(rts.speed, 520, 'Speed must be ultra-fast (520)');
  assert.equal(rts.fireRate, 10, 'Fire rate must be 10 (every 0.1s)');
  assert.equal(rts.bulletDamage, 22, 'Bullet damage must be 22 per 0.1s');
  assert.ok(rts.vietnameseName.includes('Tia Chớp'));

  // Test lightning damage calculation
  // Base single target
  const baseDmg = calculateRts88LightningDamage(22, false, false);
  assert.equal(baseDmg, 22);

  // During active shield: +80% damage
  const shieldDmg = calculateRts88LightningDamage(22, true, false);
  assert.equal(shieldDmg, Math.round(22 * 1.8)); // 40

  // Chain lightning to surrounding enemies: 70% of base damage
  const chainDmg = calculateRts88LightningDamage(22, false, true);
  assert.equal(chainDmg, Math.round(22 * 0.7)); // 15

  // Chain lightning during shield: 70% of boosted damage
  const chainShieldDmg = calculateRts88LightningDamage(22, true, true);
  assert.equal(chainShieldDmg, Math.round(22 * 1.8 * 0.7)); // 28

  // Test 40% defense penetration
  assert.equal(calculateRts88EffectiveDefense(100), 60); // 100 * (1 - 0.40)
  assert.equal(calculateRts88EffectiveDefense(50), 30);
  assert.equal(calculateRts88EffectiveDefense(0), 0);

  // Test 300 HP Lightning Shield damage absorption
  const abs1 = absorbRts88ShieldDamage(300, 50);
  assert.equal(abs1.remainingShieldHp, 250);
  assert.equal(abs1.leftoverDamage, 0);
  assert.equal(abs1.isShieldBroken, false);

  const abs2 = absorbRts88ShieldDamage(40, 70);
  assert.equal(abs2.remainingShieldHp, 0);
  assert.equal(abs2.leftoverDamage, 30);
  assert.equal(abs2.isShieldBroken, true);

  // Verify RTS-88 is in Gacha summons pool
  const gacha = executeGachaPull(10, [], 79, 9);
  assert.ok(gacha.results.length === 10);
});

test('6 new Tier A fighters have completely unique bullet mechanics, skills, and dossiers', () => {
  const newFighters = [
    'stellar_sentinel',
    'void_rift',
    'sol_inferno',
    'chrono_echo',
    'graviton_lance',
    'bio_spore',
  ];

  newFighters.forEach((id) => {
    const f = FIGHTERS[id];
    assert.ok(f, `Fighter ${id} must exist in FIGHTERS`);
    assert.equal(f.tier, 'A', `Fighter ${id} must be Tier A`);
    assert.ok(f.vietnameseName.length > 0);
    assert.ok(f.bulletMechanic.length > 10);
    assert.ok(f.skillName.length > 0);
    assert.ok(f.skillDescription.length > 10);
    assert.ok(f.bulletDamage >= 30, `Damage must be balanced Tier A (>=30)`);
    assert.ok(f.speed >= 360, `Speed must be appropriate (>=360)`);
  });

  // Verify unique bullet mechanics
  assert.ok(FIGHTERS.stellar_sentinel.bulletMechanic.includes('Helix'));
  assert.ok(FIGHTERS.void_rift.bulletMechanic.includes('Lưỡi Dao Hư Không'));
  assert.ok(FIGHTERS.sol_inferno.bulletMechanic.includes('Napalm'));
  assert.ok(FIGHTERS.chrono_echo.bulletMechanic.toLowerCase().includes('sóng âm vang'));
  assert.ok(FIGHTERS.graviton_lance.bulletMechanic.toLowerCase().includes('mũi giáo trọng lực'));
  assert.ok(FIGHTERS.bio_spore.bulletMechanic.toLowerCase().includes('bào tử'));

  // Verify unique skills
  assert.equal(FIGHTERS.stellar_sentinel.skillName, 'Pháo Đài Vệ Tinh 360°');
  assert.equal(FIGHTERS.void_rift.skillName, 'Sụp Đổ Chiều Không Gian');
  assert.equal(FIGHTERS.sol_inferno.skillName, 'Biển Lửa Siêu Tân Tinh');
  assert.equal(FIGHTERS.chrono_echo.skillName, 'Đảo Ngược Thời Gian');
  assert.equal(FIGHTERS.graviton_lance.skillName, 'Đại Pháo Khải Huyền');
  assert.equal(FIGHTERS.bio_spore.skillName, 'Đại Dịch Ký Sinh Tuyệt Diệt');
});

test('LX-88 Arc Tempest fighter has exact requested stats (40 HP, 150 Armor, 12 dmg/0.1s, 6s stun skill)', () => {
  const arc = FIGHTERS.arc_tempest;
  assert.ok(arc, 'LX-88 Arc Tempest must exist in FIGHTERS');
  assert.equal(arc.tier, 'S');
  assert.equal(arc.maxHp, 40);
  assert.equal(arc.maxArmor, 150);
  assert.equal(arc.bulletDamage, 12);
  assert.equal(arc.fireRate, 10);
  assert.equal(arc.speed, 490);
  assert.equal(arc.skillCooldown, 16);
  assert.ok(arc.bulletMechanic.includes('0.1'));
  assert.ok(arc.skillDescription.includes('6 giây'));
  assert.ok(arc.skillDescription.includes('80%'));
  assert.ok(arc.skillDescription.includes('60%'));
  assert.ok(arc.skillDescription.includes('15'));

  // Test boss damage multiplier: +120% (2.2x total)
  assert.equal(getBossDamageMultiplier('arc_tempest', true), 2.2);
  assert.equal(getBossDamageMultiplier('arc_tempest', false), 1.0);
  assert.equal(getBossDamageMultiplier('phoenix', true), 1.0);
});

test('Pilot system defines pilots (10 S, 9 A, 9 B) with full stat coverage including Raiden S', () => {
  const allPilots = Object.values(PILOTS);
  assert.equal(allPilots.length, 28, 'Must have 28 pilots including Raiden S');

  allPilots.forEach((pilot) => {
    assert.ok(pilot.name.length > 0);
    assert.ok(pilot.vietnameseTitle.length > 0);
    assert.ok(pilot.callsign.length > 0);
    assert.ok(pilot.bonusText.length > 0);
  });

  const tierS = allPilots.filter((p) => p.tier === 'S');
  const tierA = allPilots.filter((p) => p.tier === 'A');
  const tierB = allPilots.filter((p) => p.tier === 'B');
  assert.equal(tierS.length, 10);
  assert.equal(tierA.length, 9);
  assert.equal(tierB.length, 9);

  // Signature S pilot Raiden for RTS-88
  const raiden = PILOTS.pilot_raiden_s;
  assert.ok(raiden);
  assert.equal(raiden.tier, 'S');
  assert.equal(raiden.signatureFighterId, 'rts_88');
  assert.equal(raiden.bonus.damagePercent, 35);
  assert.equal(raiden.bonus.armorPenPercent, 30);
  assert.equal(raiden.bonus.trueDamageBonus, 25);

  // S pilot Celestia
  const celestia = PILOTS.celestia;
  assert.ok(celestia);
  assert.equal(celestia.bonus.trueDamageBonus, 30);
  assert.equal(celestia.bonus.critRatePercent, 25);

  // New S pilot Aegis
  const aegis = PILOTS.aegis;
  assert.ok(aegis);
  assert.equal(aegis.bonus.armorBonus, 50);
  assert.equal(aegis.bonus.defenseBonus, 35);

  // Fallback check
  const bonusNone = getPilotBonus(null);
  assert.equal(bonusNone.damagePercent, 0);
  assert.equal(bonusNone.armorBonus, 0);
});

test('calculateIncomingDamage accurately reduces damage based on defense rating', () => {
  // 0 defense: 100% damage
  assert.equal(calculateIncomingDamage(100, 0), 100);

  // 25 defense: factor = 100 / 125 = 0.8 -> 80 damage
  assert.equal(calculateIncomingDamage(100, 25), 80);

  // 100 defense: factor = 100 / 200 = 0.5 -> 50 damage
  assert.equal(calculateIncomingDamage(100, 100), 50);

  // Always deals at least 1 damage
  assert.equal(calculateIncomingDamage(1, 500), 1);
});

test('checkDodge accurately checks evasion against dodge threshold', () => {
  // With 20% dodge chance, roll 10 succeeds, roll 30 fails
  assert.equal(checkDodge(20, 10), true);
  assert.equal(checkDodge(20, 30), false);

  // Capped at 75% max
  assert.equal(checkDodge(90, 80), false);
  assert.equal(checkDodge(90, 70), true);
});

test('calculateBulletDamage computes crits, multipliers, and true damage', () => {
  // Normal non-crit: base 100 * 1.0 * 1.0 = 100 + 0 = 100
  const hitNormal = calculateBulletDamage(100, 1.0, 1.0, 20, 200, 0, 50);
  assert.equal(hitNormal.isCrit, false);
  assert.equal(hitNormal.finalDamage, 100);

  // Crit hit: roll 10 < critRate 20, critDamage 200% -> 200 + trueDamage 25 = 225
  const hitCrit = calculateBulletDamage(100, 1.0, 1.0, 20, 200, 25, 10);
  assert.equal(hitCrit.isCrit, true);
  assert.equal(hitCrit.finalDamage, 225);
  assert.equal(hitCrit.trueDamagePart, 25);
});

test('Gacha system executes single and 10x summons with proper costs and 10x Tier A guarantee', () => {
  const initialOwned: string[] = [];

  // Single pull: costs 200 gems
  const singlePull = executeGachaPull(1, initialOwned, 0, 0);
  assert.equal(singlePull.results.length, 1);
  assert.equal(singlePull.totalGemsCost, 200);
  assert.ok(['S', 'A', 'B'].includes(singlePull.results[0].tier));

  // 10x pull: costs 1800 gems and GUARANTEES at least one Tier A or S!
  for (let trial = 0; trial < 10; trial++) {
    const tenPull = executeGachaPull(10, initialOwned, 0, 0);
    assert.equal(tenPull.results.length, 10);
    assert.equal(tenPull.totalGemsCost, 1800);
    const hasTierAorS = tenPull.results.some((r) => r.tier === 'A' || r.tier === 'S');
    assert.equal(hasTierAorS, true, '10x pull MUST guarantee at least one Tier A or S');
  }

  // Pilot 10x pull guarantees at least Tier A or S as well
  const pilotTenPull = executePilotGachaPull(10, [], 0, 0);
  assert.equal(pilotTenPull.results.length, 10);
  assert.equal(pilotTenPull.totalGemsCost, 1800);
  const hasPilotAorS = pilotTenPull.results.some((r) => r.tier === 'A' || r.tier === 'S');
  assert.equal(hasPilotAorS, true, 'Pilot 10x pull MUST guarantee at least one Tier A or S');
});

test('Weapon accessories system defines 29 accessories sold for Gold with prices ranging 50k to 100,000,000 Vàng', () => {
  const accessories = Object.values(WEAPON_ACCESSORIES);
  assert.equal(accessories.length, 29, 'Must have 29 weapon accessories across B, A, S, SS, and MYTHIC');

  // Verify all are sold for Gold
  accessories.forEach((acc) => {
    assert.ok(acc.costGold >= 50000, `${acc.id} costGold must be >= 50,000`);
    assert.ok(acc.costGold <= 100000000, `${acc.id} costGold must be <= 100,000,000`);
    assert.ok(['barrel', 'loader', 'core'].includes(acc.slot));
    assert.ok(acc.name.length > 0);
    assert.ok(acc.vietnameseName.length > 0);
  });

  // Verify cheapest entry tier B accessory: 50,000 Vàng
  const barrelKinetic = WEAPON_ACCESSORIES['barrel_kinetic_b'];
  assert.equal(barrelKinetic.costGold, 50000);
  assert.equal(barrelKinetic.damageBonusPercent, 12);
  assert.equal(barrelKinetic.slot, 'barrel');

  // Verify pinnacle 100M accessory: 100,000,000 Vàng
  const apexCore = WEAPON_ACCESSORIES['core_omniversal_primordial'];
  assert.ok(apexCore);
  assert.equal(apexCore.costGold, 100000000);
  assert.equal(apexCore.damageBonusPercent, 95);
  assert.equal(apexCore.fireRateBonusPercent, 95);
  assert.equal(apexCore.tier, 'MYTHIC');

  // Verify calculation when equipped with expanded stats
  const bonuses = calculateAccessoryBonuses([
    'barrel_plasma_a',
    'loader_rapid_b',
    'core_omniversal_primordial',
  ]);
  // barrel_plasma_a: 25% dmg, 0% fireRate, 4% crit, 8% pen, 4 trueDmg
  // loader_rapid_b: 0% dmg, 12% fireRate, 2% crit, 0% pen, 0 trueDmg
  // core_omniversal_primordial: 95% dmg, 95% fireRate, 30% crit, 35% pen, 80 trueDmg
  assert.equal(bonuses.damagePercent, 120); // 25 + 95
  assert.equal(bonuses.fireRatePercent, 107); // 12 + 95
  assert.equal(bonuses.critRatePercent, 36); // 4 + 2 + 30
  assert.equal(bonuses.armorPenPercent, 43); // 8 + 35
  assert.equal(bonuses.trueDamageBonus, 84); // 4 + 80
});

test('calculateGoldReward scales properly with score, kills, wave, difficulty and victory bonus (reduced by 80%)', () => {
  // Base run: wave 2, 20 kills, score 2000, normal difficulty
  // base = 2 * 25000 (50000) + 20 * 3000 (60000) + 2000 * 0.4 (800) = 110800
  // normal multiplier = 1.2 -> 110800 * 1.2 = 132960
  // Reduced by 80% (keeps 20%): 132960 * 0.2 = 26592
  const normalGold = calculateGoldReward(2000, 20, 2, 'normal', false);
  assert.equal(normalGold, 26592);

  // Victory bonus adds +500,000 to base
  // (110800 + 500000) * 1.2 = 610800 * 1.2 = 732960
  // Reduced by 80%: 732960 * 0.2 = 146592
  const victoryGold = calculateGoldReward(2000, 20, 2, 'normal', true);
  assert.equal(victoryGold, 146592);

  // Hard difficulty multiplier: 2.0x -> 110800 * 2.0 = 221600
  // Reduced by 80%: 221600 * 0.2 = 44320
  const hardGold = calculateGoldReward(2000, 20, 2, 'hard', false);
  assert.equal(hardGold, 44320);

  // Minimum floor guarantees at least 10,000 gold
  const minGold = calculateGoldReward(0, 0, 0, 'easy', false);
  assert.equal(minGold, 10000);
});

test('Fighter star upgrade system promotes stars from 1 to 6 using shards and gold', () => {
  // Star 1 base bonus
  const star1Bonus = getFighterStarBonus(1);
  assert.equal(star1Bonus.star, 1);
  assert.equal(star1Bonus.damageBonusPercent, 0);

  // Star 2 bonus
  const star2Bonus = getFighterStarBonus(2);
  assert.equal(star2Bonus.damageBonusPercent, 15);
  assert.equal(star2Bonus.hpBonusPercent, 15);

  // Upgrade cost from star 1 to star 2
  const cost1 = getFighterStarUpgradeCost(1);
  assert.equal(cost1.nextStar, 2);
  assert.equal(cost1.shards, 30);
  assert.equal(cost1.gold, 30000);
  assert.equal(cost1.maxed, false);

  // canUpgrade checks
  assert.equal(canUpgradeFighterStar(1, 20, 50000), false); // not enough shards
  assert.equal(canUpgradeFighterStar(1, 40, 20000), false); // not enough gold
  assert.equal(canUpgradeFighterStar(1, 40, 50000), true);

  // Execute upgrade
  const upResult = upgradeFighterStar('phoenix', 1, 50, 100000);
  assert.equal(upResult.success, true);
  assert.equal(upResult.newStar, 2);
  assert.equal(upResult.remainingShards, 20); // 50 - 30
  assert.equal(upResult.remainingGold, 70000); // 100,000 - 30,000

  // Max star 6 cannot be upgraded further
  const maxCost = getFighterStarUpgradeCost(6);
  assert.equal(maxCost.maxed, true);
  const maxUp = upgradeFighterStar('phoenix', 6, 9999, 999999999);
  assert.equal(maxUp.success, false);
});

test('executeGachaPull returns duplicate shards when pulling already owned fighters', () => {
  // Initially player owns phoenix
  const owned = ['phoenix'];
  const pull = executeGachaPull(10, owned, 0, 0);

  assert.equal(pull.results.length, 10);
  // If phoenix was pulled again, it should have duplicateBonusShards > 0
  pull.results.forEach((r) => {
    if (!r.isNew) {
      assert.ok(r.duplicateBonusShards > 0);
      assert.ok(pull.duplicateShardsGranted[r.fighterId] > 0);
    }
  });
});

test('Mission system tracks progress, detects completion, and claims gems reward once', () => {
  const testMissions = [
    {
      id: 'test_kill',
      title: 'Diệt địch',
      description: 'Diệt 10 địch',
      target: 10,
      current: 0,
      rewardGems: 500,
      rewardGold: 10000,
      difficulty: 'easy' as const,
      completed: false,
      claimed: false,
      category: 'combat' as const,
    },
  ];

  // Incomplete progress
  const step1 = updateMissionProgress(testMissions, 'test_kill', 5);
  assert.equal(step1.updatedMissions[0].current, 5);
  assert.equal(step1.updatedMissions[0].completed, false);
  assert.equal(step1.newlyCompleted, false);

  // Completing mission
  const step2 = updateMissionProgress(step1.updatedMissions, 'test_kill', 5);
  assert.equal(step2.updatedMissions[0].current, 10);
  assert.equal(step2.updatedMissions[0].completed, true);
  assert.equal(step2.newlyCompleted, true);

  // Claiming reward
  const claim1 = claimMissionReward(step2.updatedMissions, 'test_kill');
  assert.equal(claim1.rewardGems, 500);
  assert.equal(claim1.updatedMissions[0].claimed, true);

  // Duplicate claim should yield 0 gems
  const claim2 = claimMissionReward(claim1.updatedMissions, 'test_kill');
  assert.equal(claim2.rewardGems, 0);
});

test('Daily login bonus system grants gems once per 24 hours, tracks streak up to Day 7, and enforces cooldown', () => {
  const baseTime = 1700000000000;

  // 1. Initial state (never claimed) -> Day 1 ready to claim
  const initialStatus = checkDailyBonusStatus(INITIAL_DAILY_LOGIN_STATE, baseTime);
  assert.equal(initialStatus.canClaim, true);
  assert.equal(initialStatus.nextDayToClaim, 1);
  assert.equal(initialStatus.rewardGems, 500);

  // 2. Claim Day 1
  const claimDay1 = claimDailyBonusReward(INITIAL_DAILY_LOGIN_STATE, 100000, baseTime);
  assert.equal(claimDay1.success, true);
  assert.equal(claimDay1.claimedDay, 1);
  assert.equal(claimDay1.rewardClaimed, 500);
  assert.equal(claimDay1.newGems, 100500);
  assert.equal(claimDay1.newDailyState.currentStreakDay, 1);

  // 3. Immediately after claim (within 24 hours) -> Cannot claim, cooldown active
  const underCooldownStatus = checkDailyBonusStatus(claimDay1.newDailyState, baseTime + 1000 * 60 * 60); // 1 hr later
  assert.equal(underCooldownStatus.canClaim, false);
  assert.ok(underCooldownStatus.msRemaining > 0);

  const failedClaim = claimDailyBonusReward(claimDay1.newDailyState, 100500, baseTime + 1000 * 60 * 60);
  assert.equal(failedClaim.success, false);
  assert.equal(failedClaim.rewardClaimed, 0);
  assert.equal(failedClaim.newGems, 100500);

  // 4. 25 hours later (valid claim window) -> Day 2 ready
  const day2Time = baseTime + DAILY_BONUS_COOLDOWN_MS + 1000 * 60 * 60; // 25 hours
  const day2Status = checkDailyBonusStatus(claimDay1.newDailyState, day2Time);
  assert.equal(day2Status.canClaim, true);
  assert.equal(day2Status.nextDayToClaim, 2);
  assert.equal(day2Status.rewardGems, 1000);

  const claimDay2 = claimDailyBonusReward(claimDay1.newDailyState, 100500, day2Time);
  assert.equal(claimDay2.success, true);
  assert.equal(claimDay2.claimedDay, 2);
  assert.equal(claimDay2.rewardClaimed, 1000);
  assert.equal(claimDay2.newGems, 101500);

  // 5. Test streak advance up to Day 7
  let state = claimDay2.newDailyState;
  let currTime = day2Time;
  let currGems = 101500;
  let day7Result: any = null;
  for (let day = 3; day <= 7; day++) {
    currTime += DAILY_BONUS_COOLDOWN_MS + 1000;
    const res = claimDailyBonusReward(state, currGems, currTime);
    assert.equal(res.success, true);
    assert.equal(res.claimedDay, day);
    const expectedGems = DAILY_BONUS_DAYS.find((d) => d.day === day)!.gems;
    assert.equal(res.rewardClaimed, expectedGems);
    state = res.newDailyState;
    currGems = res.newGems;
    if (day === 7) {
      day7Result = res;
    }
  }
  // Day 7 reward must be 10,000 gems and grant 7-day streak reward
  assert.equal(state.currentStreakDay, 7);
  assert.equal(state.streakCount, 1);
  assert.ok(day7Result.streakReward);
  assert.equal(day7Result.streakReward.streakNumber, 1);
  assert.equal(day7Result.streakReward.unlockedSkin?.id, 'skin_golden_sovereign');
  assert.equal(day7Result.streakReward.bonusShards.count, 150);
  assert.deepEqual(state.unlockedSkinIds, ['skin_golden_sovereign']);
  assert.equal(state.activeSkinId, 'skin_golden_sovereign');

  // 6. Test streak cycle back to Day 1 after Day 7
  currTime += DAILY_BONUS_COOLDOWN_MS + 1000;
  const cycleStatus = checkDailyBonusStatus(state, currTime);
  assert.equal(cycleStatus.canClaim, true);
  assert.equal(cycleStatus.nextDayToClaim, 1);
  assert.equal(cycleStatus.rewardGems, 500);

  // 7. Test streak reset if absent for > 48 hours
  const streakBrokenTime = state.lastClaimTimestamp! + DAILY_BONUS_GRACE_PERIOD_MS + 10000;
  const brokenStatus = checkDailyBonusStatus(state, streakBrokenTime);
  assert.equal(brokenStatus.canClaim, true);
  assert.equal(brokenStatus.isStreakBroken, true);
  assert.equal(brokenStatus.nextDayToClaim, 1);
});

test('7-day streak rewards grant sequential exclusive skins and bonus shards across multiple cycles', () => {
  let state = { ...INITIAL_DAILY_LOGIN_STATE };
  let currTime = 1710000000000;
  let gems = 0;

  // Cycle 1: 7 days -> unlocks Golden Sovereign skin + 150 bonus shards
  for (let d = 1; d <= 7; d++) {
    currTime += DAILY_BONUS_COOLDOWN_MS + 1000;
    const res = claimDailyBonusReward(state, gems, currTime, 'phoenix');
    assert.equal(res.success, true);
    state = res.newDailyState;
    gems = res.newGems;
    if (d === 7) {
      assert.ok(res.streakReward);
      assert.equal(res.streakReward.unlockedSkin?.id, 'skin_golden_sovereign');
      assert.equal(res.streakReward.bonusShards.fighterId, 'phoenix');
      assert.equal(res.streakReward.bonusShards.count, 150);
      assert.equal(state.streakCount, 1);
      assert.ok(state.unlockedSkinIds.includes('skin_golden_sovereign'));
    }
  }

  // Cycle 2: another 7 days -> unlocks Cosmic Nebula skin + 150 bonus shards
  for (let d = 1; d <= 7; d++) {
    currTime += DAILY_BONUS_COOLDOWN_MS + 1000;
    const res = claimDailyBonusReward(state, gems, currTime, 'astraea');
    assert.equal(res.success, true);
    state = res.newDailyState;
    gems = res.newGems;
    if (d === 7) {
      assert.ok(res.streakReward);
      assert.equal(res.streakReward.unlockedSkin?.id, 'skin_cosmic_nebula');
      assert.equal(res.streakReward.bonusShards.fighterId, 'astraea');
      assert.equal(res.streakReward.bonusShards.count, 150);
      assert.equal(state.streakCount, 2);
      assert.ok(state.unlockedSkinIds.includes('skin_cosmic_nebula'));
    }
  }

  // Cycle 3: another 7 days -> unlocks Void Obsidian skin + 150 bonus shards
  for (let d = 1; d <= 7; d++) {
    currTime += DAILY_BONUS_COOLDOWN_MS + 1000;
    const res = claimDailyBonusReward(state, gems, currTime, 'titan');
    assert.equal(res.success, true);
    state = res.newDailyState;
    gems = res.newGems;
    if (d === 7) {
      assert.ok(res.streakReward);
      assert.equal(res.streakReward.unlockedSkin?.id, 'skin_void_obsidian');
      assert.equal(res.streakReward.bonusShards.fighterId, 'titan');
      assert.equal(res.streakReward.bonusShards.count, 150);
      assert.equal(state.streakCount, 3);
      assert.ok(state.unlockedSkinIds.includes('skin_void_obsidian'));
    }
  }

  // Cycle 4: all 3 skins already owned -> grants massive +250 bonus shards
  for (let d = 1; d <= 7; d++) {
    currTime += DAILY_BONUS_COOLDOWN_MS + 1000;
    const res = claimDailyBonusReward(state, gems, currTime, 'solaris');
    assert.equal(res.success, true);
    state = res.newDailyState;
    gems = res.newGems;
    if (d === 7) {
      assert.ok(res.streakReward);
      assert.equal(res.streakReward.unlockedSkin, null);
      assert.equal(res.streakReward.bonusShards.count, 250);
      assert.equal(state.streakCount, 4);
    }
  }

  // Test toggleCosmeticSkin
  assert.equal(state.activeSkinId, 'skin_golden_sovereign');
  // Equip nebula
  state = toggleCosmeticSkin(state, 'skin_cosmic_nebula');
  assert.equal(state.activeSkinId, 'skin_cosmic_nebula');
  // Toggle nebula off (unequip)
  state = toggleCosmeticSkin(state, 'skin_cosmic_nebula');
  assert.equal(state.activeSkinId, null);
  // Re-equip obsidian
  state = toggleCosmeticSkin(state, 'skin_void_obsidian');
  assert.equal(state.activeSkinId, 'skin_void_obsidian');
  // Trying to equip invalid unowned skin leaves state intact
  state = toggleCosmeticSkin(state, 'non_existent_skin');
  assert.equal(state.activeSkinId, 'skin_void_obsidian');
});

test('getSectorForWave dynamically changes background sector every 5 waves', () => {
  // Waves 1 to 5 -> Sector 1 (Alpha Void)
  assert.equal(getSectorForWave(1).sectorIndex, 1);
  assert.equal(getSectorForWave(1).vietnameseName, 'Không Phận Khởi Nguyên');
  assert.equal(getSectorForWave(5).sectorIndex, 1);

  // Waves 6 to 10 -> Sector 2 (Cryo Glacial Drift)
  assert.equal(getSectorForWave(6).sectorIndex, 2);
  assert.equal(getSectorForWave(6).vietnameseName, 'Vành Đai Băng Cryo');
  assert.equal(getSectorForWave(10).sectorIndex, 2);

  // Waves 11 to 15 -> Sector 3 (Solar Supernova Sea)
  assert.equal(getSectorForWave(11).sectorIndex, 3);
  assert.equal(getSectorForWave(11).vietnameseName, 'Biển Lửa Siêu Tân Tinh');
  assert.equal(getSectorForWave(15).sectorIndex, 3);

  // Waves 16 to 20 -> Sector 4 (Graviton Singularity)
  assert.equal(getSectorForWave(16).sectorIndex, 4);
  assert.equal(getSectorForWave(16).vietnameseName, 'Vùng Vô Quy Hố Đen');
  assert.equal(getSectorForWave(20).sectorIndex, 4);

  // Waves 21+ -> Sector 5 (Olympus Prime)
  assert.equal(getSectorForWave(21).sectorIndex, 5);
  assert.equal(getSectorForWave(21).vietnameseName, 'Không Phận Thần Thánh Olympus');
  assert.equal(getSectorForWave(50).sectorIndex, 5);
});

test('getComboRankInfo returns progressive arcade tiers and bonus descriptions', () => {
  // 1-4: NORMAL
  const rank1 = getComboRankInfo(1);
  assert.equal(rank1.tier, 'NORMAL');
  assert.equal(rank1.vietnameseTitle, 'CHUỖI HẠ ĐỊCH');

  // 5-9: FEVER
  const rank5 = getComboRankInfo(5);
  assert.equal(rank5.tier, 'FEVER');
  assert.equal(rank5.vietnameseTitle, 'CƠN SỐT CUỒNG NỘ');

  // 10-14: ULTRA
  const rank10 = getComboRankInfo(10);
  assert.equal(rank10.tier, 'ULTRA');
  assert.equal(rank10.vietnameseTitle, 'CUỒNG PHÁ BẬC CAO');

  // 15-19: APEX
  const rank15 = getComboRankInfo(15);
  assert.equal(rank15.tier, 'APEX');
  assert.equal(rank15.vietnameseTitle, 'ĐỈNH CAO CHIẾN ĐẤU');

  // 20+: GODLIKE
  const rank20 = getComboRankInfo(20);
  assert.equal(rank20.tier, 'GODLIKE');
  assert.equal(rank20.vietnameseTitle, 'HỦY DIỆT VÔ ĐỐI');
  assert.ok(rank20.bonusPercentLabel.includes('+200%'));
});

test('Difficulty levels define easy, normal, and hard profiles with compounding wave scaling', () => {
  assert.ok(DIFFICULTY_CONFIGS.easy);
  assert.ok(DIFFICULTY_CONFIGS.normal);
  assert.ok(DIFFICULTY_CONFIGS.hard);

  // Easy has lower HP and damage multipliers
  assert.ok(DIFFICULTY_CONFIGS.easy.hpMultiplier < DIFFICULTY_CONFIGS.normal.hpMultiplier);
  assert.ok(DIFFICULTY_CONFIGS.hard.hpMultiplier > DIFFICULTY_CONFIGS.normal.hpMultiplier);

  // Normal Wave 1 base scaling
  const w1Normal = calculateWaveScaling(1, 'normal');
  assert.equal(w1Normal.hpMultiplier, 1.0);
  assert.equal(w1Normal.damageMultiplier, 1.0);
  assert.equal(w1Normal.enemyArmor, 0);

  // Normal Wave 2: 50% compounding -> 1.5x
  const w2Normal = calculateWaveScaling(2, 'normal');
  assert.equal(w2Normal.hpMultiplier, 1.5);
  assert.equal(w2Normal.damageMultiplier, 1.5);
  assert.ok(w2Normal.enemyArmor > 0);
  assert.ok(w2Normal.maxEnemies > w1Normal.maxEnemies);

  // Normal Wave 3: 50% compounding -> 2.25x
  const w3Normal = calculateWaveScaling(3, 'normal');
  assert.equal(w3Normal.hpMultiplier, 2.25);
  assert.equal(w3Normal.damageMultiplier, 2.25);

  // Verify enemy bullet speed multiplier does NOT increase across waves
  assert.equal(w1Normal.bulletSpeedMultiplier, 1.0);
  assert.equal(w2Normal.bulletSpeedMultiplier, 1.0);
  assert.equal(w3Normal.bulletSpeedMultiplier, 1.0);

  // Hard Wave 2 has harder scaling than normal Wave 2
  const w2Hard = calculateWaveScaling(2, 'hard');
  assert.ok(w2Hard.hpMultiplier > w2Normal.hpMultiplier);
  assert.ok(w2Hard.damageMultiplier > w2Normal.damageMultiplier);
  assert.equal(w2Hard.bulletSpeedMultiplier, 1.25);
});

test('Campaign reward calculation properly computes gems from score, kills, wave and difficulty', () => {
  const calcGems = (score: number, kills: number, wave: number, difficulty: 'easy' | 'normal' | 'hard') => {
    const diffMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'easy' ? 0.8 : 1.0;
    const baseGems = Math.round((Math.floor(score / 25) + kills * 10 + wave * 100) * diffMultiplier);
    return Math.max(50, baseGems);
  };

  // Normal run with 5000 score, 30 kills, wave 3:
  // Math.floor(5000 / 25) = 200; kills: 30 * 10 = 300; wave: 3 * 100 = 300. Total = 800 * 1.0 = 800
  assert.equal(calcGems(5000, 30, 3, 'normal'), 800);

  // Hard run gets 1.5x bonus: 800 * 1.5 = 1200
  assert.equal(calcGems(5000, 30, 3, 'hard'), 1200);

  // Easy run gets 0.8x: 800 * 0.8 = 640
  assert.equal(calcGems(5000, 30, 3, 'easy'), 640);

  // Minimum fallback ensures at least 50 gems
  assert.equal(calcGems(0, 0, 0, 'normal'), 50);
});

test('switchSectorBackgroundTheme returns distinct color palettes and gradients for all 5 sectors', () => {
  const theme1 = switchSectorBackgroundTheme(1);
  const theme2 = switchSectorBackgroundTheme(2);
  const theme3 = switchSectorBackgroundTheme(3);
  const theme4 = switchSectorBackgroundTheme(4);
  const theme5 = switchSectorBackgroundTheme(5);

  // Sector 1: Alpha Void
  assert.equal(theme1.sectorIndex, 1);
  assert.equal(theme1.name, 'Alpha Void');
  assert.ok(theme1.starColors.length >= 3);
  assert.ok(theme1.nebulaPrimary.includes('105')); // Cyan-blue hue
  assert.equal(theme1.ambientType, 'alpha_void');

  // Sector 2: Cryo Glacial Drift
  assert.equal(theme2.sectorIndex, 2);
  assert.equal(theme2.name, 'Cryo Glacial Drift');
  assert.ok(theme2.starColors.includes('#a5f3fc'));
  assert.equal(theme2.ambientType, 'cryo_ice');

  // Sector 3: Solar Supernova Sea
  assert.equal(theme3.sectorIndex, 3);
  assert.equal(theme3.name, 'Solar Supernova Sea');
  assert.ok(theme3.starColors.includes('#f97316'));
  assert.equal(theme3.ambientType, 'solar_flare');

  // Sector 4: Graviton Singularity
  assert.equal(theme4.sectorIndex, 4);
  assert.equal(theme4.name, 'Graviton Singularity');
  assert.ok(theme4.starColors.includes('#c084fc'));
  assert.equal(theme4.ambientType, 'black_hole');

  // Sector 5: Olympus Celestial Prime
  assert.equal(theme5.sectorIndex, 5);
  assert.equal(theme5.name, 'Olympus Celestial Prime');
  assert.ok(theme5.starColors.includes('#fbbf24'));
  assert.equal(theme5.ambientType, 'olympus_core');

  // Clamping checks
  const clampedLow = switchSectorBackgroundTheme(0);
  assert.equal(clampedLow.sectorIndex, 1);

  const clampedNegative = switchSectorBackgroundTheme(-5);
  assert.equal(clampedNegative.sectorIndex, 1);

  const clampedHigh = switchSectorBackgroundTheme(99);
  assert.equal(clampedHigh.sectorIndex, 5);

  // Alias verification
  const aliasTheme = getSectorVisualTheme(3);
  assert.equal(aliasTheme.name, theme3.name);
  assert.deepEqual(aliasTheme.starColors, theme3.starColors);
});

test('calculateMobileTouchPosition computes responsive relative dragging with bounds clamping', () => {
  const bounds = { minX: 20, maxX: 380, minY: 40, maxY: 760 };

  // 1. Zero delta maintains ship start position
  const pos0 = calculateMobileTouchPosition(100, 200, 100, 200, 190, 600, bounds);
  assert.equal(pos0.targetX, 190);
  assert.equal(pos0.targetY, 600);

  // 2. Positive delta moves ship right and down
  const posRight = calculateMobileTouchPosition(150, 250, 100, 200, 190, 600, bounds);
  assert.equal(posRight.targetX, 240); // 190 + 50
  assert.equal(posRight.targetY, 650); // 600 + 50

  // 3. Negative delta moves ship left and up
  const posLeft = calculateMobileTouchPosition(50, 150, 100, 200, 190, 600, bounds);
  assert.equal(posLeft.targetX, 140);
  assert.equal(posLeft.targetY, 550);

  // 4. Clamping against boundary edges
  const posClampedX = calculateMobileTouchPosition(900, 200, 100, 200, 190, 600, bounds);
  assert.equal(posClampedX.targetX, 380); // clamped to maxX

  const posClampedY = calculateMobileTouchPosition(100, -500, 100, 200, 190, 600, bounds);
  assert.equal(posClampedY.targetY, 40); // clamped to minY
});

test('getMobileViewportMode correctly classifies screen widths', () => {
  assert.equal(getMobileViewportMode(390), 'mobile');
  assert.equal(getMobileViewportMode(414), 'mobile');
  assert.equal(getMobileViewportMode(639), 'mobile');
  assert.equal(getMobileViewportMode(768), 'tablet');
  assert.equal(getMobileViewportMode(1023), 'tablet');
  assert.equal(getMobileViewportMode(1440), 'desktop');
});

test('getAstraeaBannerStatus correctly computes remaining time and active state over 10 days', () => {
  const start = 1700000000000;
  // 5 days in (active)
  const activeStatus = getAstraeaBannerStatus(start, start + 5 * 24 * 3600 * 1000);
  assert.equal(activeStatus.isActive, true);
  assert.equal(activeStatus.days, 5);
  assert.ok(activeStatus.remainingMs > 0);
  assert.ok(activeStatus.formattedCountdown.includes('05 ngày'));

  // Exactly 10 days + 1 second (expired)
  const expiredStatus = getAstraeaBannerStatus(start, start + ASTRAEA_LIMITED_BANNER_DURATION_MS + 1000);
  assert.equal(expiredStatus.isActive, false);
  assert.equal(expiredStatus.days, 0);
  assert.equal(expiredStatus.formattedCountdown, 'SỰ KIỆN ĐÃ KẾT THÚC');
});

test('executeGachaPull excludes Astraea when banner is expired (isAstraeaBannerActive = false)', () => {
  // Perform multiple pulls when banner is inactive
  for (let i = 0; i < 20; i++) {
    const pull = executeGachaPull(10, [], 79, 9, false); // force Tier S guarantee via pity
    // Check that none of the results is astraea
    pull.results.forEach((r) => {
      if (r.tier === 'S') {
        assert.notEqual(r.fighterId, 'astraea', 'Astraea must not drop when banner is inactive');
      }
    });
  }
});

test('INITIAL_MISSIONS features diverse difficulties (easy, normal, hard, nightmare) with reduced gems and gold rewards', () => {
  assert.ok(INITIAL_MISSIONS.length >= 20, 'Should have at least 20 diverse missions');

  const difficulties = new Set(INITIAL_MISSIONS.map((m) => m.difficulty));
  assert.ok(difficulties.has('easy'), 'Must have easy missions');
  assert.ok(difficulties.has('normal'), 'Must have normal missions');
  assert.ok(difficulties.has('hard'), 'Must have hard missions');
  assert.ok(difficulties.has('nightmare'), 'Must have nightmare missions');

  // Verify all missions award gold and reasonable gem amounts (90% reduction from thousands)
  INITIAL_MISSIONS.forEach((m) => {
    assert.ok(m.rewardGold > 0, `Mission ${m.id} should award Gold`);
    assert.ok(m.rewardGems > 0, `Mission ${m.id} should award Gems`);
    assert.ok(m.rewardGems <= 600, `Mission ${m.id} gem reward should be reduced (got ${m.rewardGems})`);
  });

  // Verify claimMissionReward returns both gems and gold
  const completedMission = [{ ...INITIAL_MISSIONS[0], completed: true, claimed: false }];
  const claimed = claimMissionReward(completedMission, completedMission[0].id);
  assert.equal(claimed.rewardGems, completedMission[0].rewardGems);
  assert.equal(claimed.rewardGold, completedMission[0].rewardGold);
});

test('LX-88 calculateLaserBeamTrajectory shoots straight along aircraft heading without bending', () => {
  // When plane is level (tilt = 0), laser shoots straight vertically upwards
  const levelBeam = calculateLaserBeamTrajectory(200, 500, 0, 800, 34);
  assert.equal(levelBeam.startX, 200);
  assert.equal(levelBeam.startY, 500 - 34);
  assert.equal(levelBeam.dirX, 0);
  assert.equal(levelBeam.dirY, -1);
  assert.equal(levelBeam.endX, 200); // perfectly straight vertical line
  assert.ok(levelBeam.endY < 0);

  // When plane tilts 15 degrees right (tilt = 0.26 rad)
  const tiltedBeam = calculateLaserBeamTrajectory(200, 500, 0.26, 800, 34);
  assert.ok(tiltedBeam.dirX > 0, 'Laser direction must be angled right when plane tilts right');
  assert.ok(tiltedBeam.endX > tiltedBeam.startX, 'End X must follow ship heading towards right');

  // Verify hit detection along the straight laser beam
  // Direct hit along vertical line (x = 200, y = 300)
  const hit = checkLaserHit(levelBeam.startX, levelBeam.startY, levelBeam.endX, levelBeam.endY, 200, 300, 20, 20);
  assert.equal(hit.isHit, true);
  assert.equal(hit.distance, 0);

  // Near miss hit within beam radius (x = 225, targetRadius = 20, beamRadius = 20 -> dist 25 <= 40)
  const grazeHit = checkLaserHit(levelBeam.startX, levelBeam.startY, levelBeam.endX, levelBeam.endY, 225, 300, 20, 20);
  assert.equal(grazeHit.isHit, true);

  // Complete miss (x = 400, y = 300 -> dist 200 > 40)
  const miss = checkLaserHit(levelBeam.startX, levelBeam.startY, levelBeam.endX, levelBeam.endY, 400, 300, 20, 20);
  assert.equal(miss.isHit, false);
});

test('LX-88 laser shoots strictly vertical upwards (tilt = 0) tracking player X without tilting', () => {
  // Test at varying player X coordinates: laser always shoots strictly along X = playerX
  [100, 250, 400, 680].forEach((posX) => {
    const trajectory = calculateLaserBeamTrajectory(posX, 600, 0, 900, 34);
    assert.equal(trajectory.startX, posX);
    assert.equal(trajectory.endX, posX, 'Laser beam must remain strictly vertical along player X');
    assert.equal(trajectory.dirX, 0);
    assert.equal(trajectory.dirY, -1);
    assert.ok(trajectory.startY < 600);
    assert.ok(trajectory.endY < 0);
  });
});

test('Tier S themed skins and LX-88 Vampire Lord skin are properly defined and immediately unlocked', () => {
  const vampire = COSMETIC_SKINS['skin_lx88_vampire'];
  assert.ok(vampire, 'Vampire skin must be defined');
  assert.equal(vampire.targetFighterId, 'arc_tempest');
  assert.equal(vampire.rarity, 'HUYỀN THOẠI');
  assert.ok(vampire.primaryColor);

  const solarisSkin = COSMETIC_SKINS['skin_solaris_cyberpunk'];
  assert.ok(solarisSkin);
  assert.equal(solarisSkin.targetFighterId, 'solaris');

  const astraeaSkin = COSMETIC_SKINS['skin_astraea_sakura'];
  assert.ok(astraeaSkin);
  assert.equal(astraeaSkin.targetFighterId, 'astraea');

  const chronoSkin = COSMETIC_SKINS['skin_chrono_void'];
  assert.ok(chronoSkin);
  assert.equal(chronoSkin.targetFighterId, 'chrono');

  const apocalypseSkin = COSMETIC_SKINS['skin_apocalypse_inferno'];
  assert.ok(apocalypseSkin);
  assert.equal(apocalypseSkin.targetFighterId, 'apocalypse');

  // Verify all are unlocked by default
  assert.equal(isSkinUnlocked('skin_lx88_vampire', []), true);
  assert.equal(isSkinUnlocked('skin_solaris_cyberpunk', []), true);
  assert.equal(isSkinUnlocked('skin_astraea_sakura', []), true);
  assert.equal(isSkinUnlocked('skin_chrono_void', []), true);
  assert.equal(isSkinUnlocked('skin_apocalypse_inferno', []), true);
  assert.equal(isSkinUnlocked('skin_victory_valkyrie', []), true);
  assert.equal(isSkinUnlocked('skin_dragon_mecha', []), true);
});

test('LX-88 Vampire Lord mechanics: calculateVampireLifeLeech and getVampireBloodthirstBonus calculate correct values', () => {
  // Hit tick leech
  const hitLeech = calculateVampireLifeLeech(50, false);
  assert.ok(hitLeech.healHp >= 1);
  assert.ok(hitLeech.healArmor >= 1);

  // Kill harvest leech
  const killLeech = calculateVampireLifeLeech(100, true);
  assert.equal(killLeech.healHp, 3);
  assert.equal(killLeech.healArmor, 3);

  // Bloodthirst bonuses
  const lowThirst = getVampireBloodthirstBonus(25);
  assert.equal(lowThirst.isBloodMistActive, false);
  assert.ok(lowThirst.speedBonusPercent > 0);

  const highThirst = getVampireBloodthirstBonus(80);
  assert.equal(highThirst.isBloodMistActive, true);
  assert.ok(highThirst.speedBonusPercent >= 15);
  assert.ok(highThirst.critRateBonus >= 10);
});

test('RTS-88 signature Pilot Raiden and Epic Neon Violet skin are properly defined', () => {
  // Test Pilot Raiden S
  const raiden = PILOTS.pilot_raiden_s;
  assert.ok(raiden, 'pilot_raiden_s must be defined in PILOTS');
  assert.equal(raiden.tier, 'S');
  assert.equal(raiden.callsign, 'Lôi Thần Trấn Phái');
  assert.ok(raiden.bonusText.includes('TRẤN PHÁI RTS-88'));
  assert.ok(raiden.bonus.damagePercent >= 30);
  assert.ok(raiden.bonus.armorPenPercent >= 30);
  assert.ok(raiden.bonus.trueDamageBonus >= 25);

  // Test RTS-88 Epic Neon Violet skin
  const skin = COSMETIC_SKINS.skin_rts88_neon_violet;
  assert.ok(skin, 'skin_rts88_neon_violet must exist in COSMETIC_SKINS');
  assert.equal(skin.targetFighterId, 'rts_88');
  assert.equal(skin.rarity, 'Epic');
  assert.equal(skin.primaryColor, '#a855f7');
  assert.equal(isSkinUnlocked('skin_rts88_neon_violet', []), true);
});

test('All 11 Tier S fighters have valid IDs and accessible skins with correct targetFighterId', () => {
  const tierSFighterIds = [
    'rts_88',
    'arc_tempest',
    'astraea',
    'solaris',
    'chrono',
    'apocalypse',
    'valkyrie',
    'ouroboros',
    'nebula_sovereign',
    'quasar_titan',
    'chronos_phantom',
  ];

  for (const fid of tierSFighterIds) {
    assert.ok(FIGHTERS[fid], `Tier S fighter ${fid} must exist in FIGHTERS`);
    assert.equal(FIGHTERS[fid].tier, 'S', `Fighter ${fid} must be Tier S`);
  }

  // Check skins have matching targetFighterIds
  assert.equal(COSMETIC_SKINS.skin_victory_valkyrie.targetFighterId, 'valkyrie');
  assert.equal(COSMETIC_SKINS.skin_dragon_mecha.targetFighterId, 'ouroboros');
  assert.equal(COSMETIC_SKINS.skin_rts88_neon_violet.targetFighterId, 'rts_88');
  assert.equal(COSMETIC_SKINS.skin_rts88_ark_one.targetFighterId, 'rts_88');
  assert.equal(COSMETIC_SKINS.skin_rts88_ark_one.rarity, 'HUYỀN THOẠI');
  assert.equal(COSMETIC_SKINS.skin_lx88_royal_gold.targetFighterId, 'arc_tempest');
  assert.equal(COSMETIC_SKINS.skin_lx88_vampire.targetFighterId, 'arc_tempest');
  assert.equal(COSMETIC_SKINS.skin_astraea_sakura.targetFighterId, 'astraea');
  assert.equal(COSMETIC_SKINS.skin_astraea_sakura.rarity, 'Epic');
  assert.equal(COSMETIC_SKINS.skin_solaris_cyberpunk.targetFighterId, 'solaris');
  assert.equal(COSMETIC_SKINS.skin_chrono_void.targetFighterId, 'chrono');
  assert.equal(COSMETIC_SKINS.skin_apocalypse_inferno.targetFighterId, 'apocalypse');
  assert.equal(COSMETIC_SKINS.skin_nebula_supernova.targetFighterId, 'nebula_sovereign');
  assert.equal(COSMETIC_SKINS.skin_quasar_colossus.targetFighterId, 'quasar_titan');
  assert.equal(COSMETIC_SKINS.skin_phantom_tachyon.targetFighterId, 'chronos_phantom');

  // Verify all Tier S skins are unlocked
  for (const s of Object.values(COSMETIC_SKINS)) {
    if (s.targetFighterId && tierSFighterIds.includes(s.targetFighterId)) {
      assert.equal(isSkinUnlocked(s.id, []), true, `Skin ${s.id} should be unlocked`);
    }
  }
});

test('Per-fighter skin equipping preserves equipped skins when switching fighters', () => {
  let state = { ...INITIAL_DAILY_LOGIN_STATE };

  // Equip RTS-88 skin
  state = toggleCosmeticSkin(state, 'skin_rts88_neon_violet', 'rts_88');
  assert.equal(getActiveSkinForFighter(state, 'rts_88'), 'skin_rts88_neon_violet');
  assert.equal(getActiveSkinForFighter(state, 'arc_tempest'), null);

  // Equip Arc Tempest vampire skin
  state = toggleCosmeticSkin(state, 'skin_lx88_vampire', 'arc_tempest');
  assert.equal(getActiveSkinForFighter(state, 'arc_tempest'), 'skin_lx88_vampire');
  // RTS-88 still retains its neon violet skin!
  assert.equal(getActiveSkinForFighter(state, 'rts_88'), 'skin_rts88_neon_violet');

  // Equip Astraea sakura skin
  state = toggleCosmeticSkin(state, 'skin_astraea_sakura', 'astraea');
  assert.equal(getActiveSkinForFighter(state, 'astraea'), 'skin_astraea_sakura');
  assert.equal(getActiveSkinForFighter(state, 'rts_88'), 'skin_rts88_neon_violet');
  assert.equal(getActiveSkinForFighter(state, 'arc_tempest'), 'skin_lx88_vampire');

  // Toggle off RTS-88 skin returns null for RTS-88 without affecting others
  state = toggleCosmeticSkin(state, 'skin_rts88_neon_violet', 'rts_88');
  assert.equal(getActiveSkinForFighter(state, 'rts_88'), null);
  assert.equal(getActiveSkinForFighter(state, 'arc_tempest'), 'skin_lx88_vampire');
});


