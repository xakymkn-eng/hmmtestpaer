import test from 'node:test';
import assert from 'node:assert/strict';
import {
SUPER_HARD_TOTAL_WAVES,
SUPER_HARD_BOSSES,
isMidTierEnemy,calculateSuperHardEnemyStats,
getSuperHardBoss,
applyDamageWithArmor,
calculateHomingVelocity,
checkMegaBeamHit,
calculate9ConeSpreadAngles,
calculateConeSweepAngle,
calculateDroneFormationOffsets,
calculateBossRushVector,
calculateGammaBeamTrackingX,
calculateOscillatingConeSweepAngle,
SUPER_HARD_2S_BARRAGE
} from './superHard';

test('Super Hard mode has exactly 10 distinct cosmic bosses', () => {
  assert.equal(SUPER_HARD_TOTAL_WAVES, 10);
  for (let w = 1; w <= 10; w++) {
    const boss = SUPER_HARD_BOSSES[w];
    assert.ok(boss, `Boss for wave ${w} must exist`);
    assert.equal(boss.wave, w);
    assert.ok(boss.name.length > 0);
    assert.ok(boss.vietnameseTitle.length > 0);
    assert.ok(boss.baseHp > 0);
    assert.ok(boss.defense > 0);
    assert.ok(boss.skills.length > 0);
  }

  // Wave 10 is the Ultimate Boss Omni-Zero
  const finalBoss = getSuperHardBoss(10);
  assert.equal(finalBoss.id, 'sh_boss_10_omni_zero');
  assert.ok(finalBoss.baseHp >= 20000);
});

test('isMidTierEnemy correctly classifies mid-tier and above enemies', () => {
  // Small enemies are NOT mid-tier
  assert.equal(isMidTierEnemy('scout'), false);
  assert.equal(isMidTierEnemy('kamikaze'), false);
  assert.equal(isMidTierEnemy('shield_drone'), false);

  // Mid-tier and above enemies
  assert.equal(isMidTierEnemy('viper'), true);
  assert.equal(isMidTierEnemy('cruiser'), true);
  assert.equal(isMidTierEnemy('destroyer'), true);
  assert.equal(isMidTierEnemy('plasma_mortar'), true);
  assert.equal(isMidTierEnemy('vanguard_missile_frigate'), true);
  assert.equal(isMidTierEnemy('boss'), true);
});

test('calculateSuperHardEnemyStats boosts mid-tier enemies: +80% HP, +50% DMG, +60% Def, and gives Armor Bar', () => {
  const baseHp = 100;
  const baseDmg = 20;
  const baseDef = 10;

  // For mid-tier enemy (e.g. cruiser)
  const boosted = calculateSuperHardEnemyStats('cruiser', baseHp, baseDmg, baseDef);
  assert.equal(boosted.hasArmor, true);
  // +80% HP = 180
  assert.equal(boosted.hp, 180);
  assert.equal(boosted.maxHp, 180);
  // +50% Damage = 30
  assert.equal(boosted.damage, 30);
  // +60% Defense = 16
  assert.equal(boosted.defense, 16);
  // Armor is 50% of HP = 90
  assert.equal(boosted.armor, 90);
  assert.equal(boosted.maxArmor, 90);

  // For small enemy (scout) - remains normal
  const normal = calculateSuperHardEnemyStats('scout', baseHp, baseDmg, baseDef);
  assert.equal(normal.hasArmor, false);
  assert.equal(normal.hp, baseHp);
  assert.equal(normal.damage, baseDmg);
  assert.equal(normal.defense, baseDef);
  assert.equal(normal.armor, 0);
});

test('applyDamageWithArmor correctly absorbs damage in armor first then overflows to HP', () => {
  // 1. Partial armor damage
  const res1 = applyDamageWithArmor(50, 100, 30, false);
  assert.equal(res1.newArmor, 20);
  assert.equal(res1.newHp, 100);
  assert.equal(res1.absorbedByArmor, 30);
  assert.equal(res1.damageToHp, 0);
  assert.equal(res1.armorBroken, false);

  // 2. Armor breaks with overflow to HP
  const res2 = applyDamageWithArmor(50, 100, 70, false);
  assert.equal(res2.newArmor, 0);
  assert.equal(res2.newHp, 80); // 100 - (70 - 50)
  assert.equal(res2.absorbedByArmor, 50);
  assert.equal(res2.damageToHp, 20);
  assert.equal(res2.armorBroken, true);

  // 3. True damage directly bypasses armor
  const res3 = applyDamageWithArmor(50, 100, 35, true);
  assert.equal(res3.newArmor, 50); // armor untouched
  assert.equal(res3.newHp, 65); // 100 - 35
  assert.equal(res3.damageToHp, 35);
});

test('calculateHomingVelocity steers missile toward player position', () => {
  // Missile at (100, 100) moving right (vx: 200, vy: 0), player is below at (100, 300)
  const steered = calculateHomingVelocity(100, 100, 100, 300, 200, 0, 200, 3.0, 0.1);
  // Velocity Y should become positive (turning downwards towards player)
  assert.ok(steered.vy > 0);
  assert.ok(steered.vx < 200);
});

test('checkMegaBeamHit detects player collision inside the colossal energy beam column', () => {
  const beamCenterX = 400;
  const beamStartY = 120;
  const beamWidth = 100; // x range [350, 450]

  // Player at x=400, y=500 is directly inside
  assert.equal(checkMegaBeamHit(400, 500, 18, beamCenterX, beamStartY, beamWidth), true);

  // Player at edge x=340 with radius 18 reaches 358 >= 350 -> Hit
  assert.equal(checkMegaBeamHit(340, 500, 18, beamCenterX, beamStartY, beamWidth), true);

  // Player far to the left x=200 -> Miss
  assert.equal(checkMegaBeamHit(200, 500, 18, beamCenterX, beamStartY, beamWidth), false);

  // Player above the beam source -> Miss
  assert.equal(checkMegaBeamHit(400, 50, 18, beamCenterX, beamStartY, beamWidth), false);
});

test('calculate9ConeSpreadAngles returns 9 symmetrically spread angles', () => {
  const angles = calculate9ConeSpreadAngles(Math.PI / 2, (80 * Math.PI) / 180);
  assert.equal(angles.length, 9);
  // Middle angle (index 4) should be straight down (PI/2)
  assert.ok(Math.abs(angles[4] - Math.PI / 2) < 0.001);
  // First angle is leftmost in spread, last is rightmost in spread
  assert.ok(angles[0] < angles[4]);
  assert.ok(angles[8] > angles[4]);
});

test('calculateConeSweepAngle sweeps smoothly from Right to Left', () => {
  const angleStart = calculateConeSweepAngle(0.0); // rightmost
  const angleMid = calculateConeSweepAngle(0.5);   // center
  const angleEnd = calculateConeSweepAngle(1.0);   // leftmost

  assert.ok(angleStart > angleMid);
  assert.ok(angleMid > angleEnd);
  assert.ok(Math.abs(angleMid - Math.PI / 2) < 0.001);
});

test('calculateDroneFormationOffsets returns left and right drone offsets', () => {
  const offsets = calculateDroneFormationOffsets();
  assert.ok(offsets.left.offsetX < 0);
  assert.ok(offsets.right.offsetX > 0);
  assert.equal(offsets.left.offsetY, offsets.right.offsetY);
});

test('calculateBossRushVector correctly points toward player with target speed', () => {
  // Boss at (200, 100), player at (200, 500) -> straight down
  const rush = calculateBossRushVector(200, 100, 200, 500, 800);
  assert.equal(rush.vx, 0);
  assert.equal(rush.vy, 800);
  assert.equal(rush.dist, 400);

  // Boss at (100, 100), player at (400, 100) -> straight right
  const rushRight = calculateBossRushVector(100, 100, 400, 100, 800);
  assert.equal(rushRight.vx, 800);
  assert.equal(rushRight.vy, 0);
});

test('applyDamageWithArmor provides remainingHp, remainingArmor, armorDamageDealt and hpDamageDealt aliases', () => {
  const res = applyDamageWithArmor(50, 100, 60, false);
  assert.equal(res.remainingArmor, 0);
  assert.equal(res.remainingHp, 90);
  assert.equal(res.armorDamageDealt, 50);
  assert.equal(res.hpDamageDealt, 10);
  assert.equal(res.armorBroken, true);
});

test('calculateGammaBeamTrackingX smoothly tracks player position with clamped speed', () => {
  // Current beam at x=200, player at x=500, speed=400 px/s, dt=0.5 -> max step=200 -> new x=400
  const tracked1 = calculateGammaBeamTrackingX(200, 500, 400, 0.5);
  assert.equal(tracked1, 400);

  // Close to target: current beam at x=480, player at x=500, speed=400, dt=0.1 -> max step=40 -> snaps to 500
  const tracked2 = calculateGammaBeamTrackingX(480, 500, 400, 0.1);
  assert.equal(tracked2, 500);

  // Moving left: current beam at x=500, player at x=300, speed=400, dt=0.25 -> max step=100 -> new x=400
  const tracked3 = calculateGammaBeamTrackingX(500, 300, 400, 0.25);
  assert.equal(tracked3, 400);
});

test('calculateOscillatingConeSweepAngle sweeps Left to Right then Right to Left over 2.0 seconds', () => {
  const span = (110 * Math.PI) / 180;
  const halfSpan = span / 2;
  const center = Math.PI / 2;
  const expectedLeft = center - halfSpan;
  const expectedRight = center + halfSpan;

  // t=0.0: Starts at Left
  const angleAtStart = calculateOscillatingConeSweepAngle(0.0, span, center);
  assert.ok(Math.abs(angleAtStart - expectedLeft) < 0.0001, 'Should start at Left');

  // t=0.25 (0.5s into 2s): Sweeping right, passes through center
  const angleAtQuarter = calculateOscillatingConeSweepAngle(0.25, span, center);
  assert.ok(Math.abs(angleAtQuarter - center) < 0.0001, 'Midway to right should be center');

  // t=0.5 (1.0s into 2s): Reaches Right
  const angleAtHalf = calculateOscillatingConeSweepAngle(0.5, span, center);
  assert.ok(Math.abs(angleAtHalf - expectedRight) < 0.0001, 'Should reach Right at midpoint');

  // t=0.75 (1.5s into 2s): Sweeping back left, passes through center again
  const angleAtThreeQuarter = calculateOscillatingConeSweepAngle(0.75, span, center);
  assert.ok(Math.abs(angleAtThreeQuarter - center) < 0.0001, 'Midway back left should be center');

  // t=1.0 (2.0s end): Returns to Left
  const angleAtEnd = calculateOscillatingConeSweepAngle(1.0, span, center);
  assert.ok(Math.abs(angleAtEnd - expectedLeft) < 0.0001, 'Should finish at Left');
});

test('SUPER_HARD_2S_BARRAGE has exactly 2.0 seconds duration for both 9-cone and sweeping skills', () => {
  assert.equal(SUPER_HARD_2S_BARRAGE.NINE_CONE.duration, 2.0);
  assert.ok(SUPER_HARD_2S_BARRAGE.NINE_CONE.interval > 0 && SUPER_HARD_2S_BARRAGE.NINE_CONE.interval <= 0.2);

  assert.equal(SUPER_HARD_2S_BARRAGE.CONE_SWEEP_OSCILLATING.duration, 2.0);
  assert.ok(SUPER_HARD_2S_BARRAGE.CONE_SWEEP_OSCILLATING.interval > 0 && SUPER_HARD_2S_BARRAGE.CONE_SWEEP_OSCILLATING.interval <= 0.06);
});
