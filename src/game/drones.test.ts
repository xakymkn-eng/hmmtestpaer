import test from 'node:test';
import assert from 'node:assert/strict';
import {
DRONES,
calculateDroneBonuses,
executeDroneGachaPull,
calculateDroneEscortPosition,
DRONE_GACHA_SINGLE_COST,
DRONE_GACHA_TEN_COST,
} from './drones';

test('Drone database defines all Tier S, A, B drones with correct stats and types', () => {
  const drones = Object.values(DRONES);
  assert.ok(drones.length >= 19, `Expected at least 19 drones, got ${drones.length}`);

  const tierSDrones = drones.filter((d) => d.tier === 'S');
  const tierADrones = drones.filter((d) => d.tier === 'A');
  const tierBDrones = drones.filter((d) => d.tier === 'B');

  assert.ok(tierSDrones.length >= 8, 'Should have at least 8 Tier S Drones');
  assert.ok(tierADrones.length >= 7, 'Should have at least 7 Tier A Drones');
  assert.ok(tierBDrones.length >= 4, 'Should have at least 4 Tier B Drones');

  // Verify all 5 new S and A drones exist
  assert.ok(DRONES.drone_void_s, 'DR-90 Void Singularity Tier S must exist');
  assert.ok(DRONES.drone_solar_s, 'DR-95 Solar Prominence Tier S must exist');
  assert.ok(DRONES.drone_nanite_s, 'DR-98 Nanite Reconstructor Tier S must exist');
  assert.ok(DRONES.drone_thunder_a, 'DR-28 Thunder Lance Tier A must exist');
  assert.ok(DRONES.drone_shield_a, 'DR-30 Aegis Protector Tier A must exist');

  // Verify all Tier S drones have unique passives defined
  for (const sDrone of tierSDrones) {
    assert.ok(sDrone.passiveSkill, `Tier S drone ${sDrone.id} must have a passive skill`);
    assert.ok(sDrone.passiveSkill.name, `Passive skill must have a name`);
    assert.ok(sDrone.passiveSkill.description, `Passive skill must have a description`);
    assert.ok(sDrone.statBuffs.damagePercent > 0, `Drone ${sDrone.id} must buff damage`);
    assert.ok(sDrone.statBuffs.hpBonus > 0, `Drone ${sDrone.id} must buff HP`);
    assert.ok(sDrone.statBuffs.armorBonus > 0, `Drone ${sDrone.id} must buff armor`);
    assert.ok(sDrone.statBuffs.trueDamageBonus > 0, `Drone ${sDrone.id} must buff true damage`);
  }

  // Tier B and A drones should have proper stats without required passives
  for (const aDrone of tierADrones) {
    assert.ok(aDrone.statBuffs.damagePercent > 0);
    assert.ok(aDrone.bulletDamage > 0);
  }
});

test('calculateDroneBonuses aggregates stats and passives from equipped drones', () => {
  // Empty equipped
  const emptyBonus = calculateDroneBonuses([]);
  assert.equal(emptyBonus.damagePercent, 0);
  assert.equal(emptyBonus.hpBonus, 0);
  assert.equal(emptyBonus.passives.length, 0);

  // Single equipped Tier S (Bloodseeker)
  const singleBonus = calculateDroneBonuses(['drone_vampiric_s']);
  const vampDrone = DRONES.drone_vampiric_s;
  assert.equal(singleBonus.damagePercent, vampDrone.statBuffs.damagePercent);
  assert.equal(singleBonus.hpBonus, vampDrone.statBuffs.hpBonus);
  assert.equal(singleBonus.trueDamageBonus, vampDrone.statBuffs.trueDamageBonus);
  assert.equal(singleBonus.passives.length, 1);
  assert.equal(singleBonus.passives[0].type, 'vampiric');

  // Dual equipped (Tier S + Tier A)
  const dualBonus = calculateDroneBonuses(['drone_vampiric_s', 'drone_laser_a']);
  const laserDrone = DRONES.drone_laser_a;
  assert.equal(dualBonus.damagePercent, vampDrone.statBuffs.damagePercent + laserDrone.statBuffs.damagePercent);
  assert.equal(dualBonus.hpBonus, vampDrone.statBuffs.hpBonus + laserDrone.statBuffs.hpBonus);
  assert.equal(dualBonus.armorPenPercent, vampDrone.statBuffs.armorPenPercent + laserDrone.statBuffs.armorPenPercent);
  assert.equal(dualBonus.passives.length, 1); // Only Tier S has a passive
});

test('executeDroneGachaPull executes single and 10x summons with pity and duplicate compensations', () => {
  // Single pull
  const single = executeDroneGachaPull(1, [], 0, 0);
  assert.equal(single.results.length, 1);
  assert.equal(single.totalGemsCost, DRONE_GACHA_SINGLE_COST);
  assert.ok(single.newOwnedDroneIds.length >= 1);

  // 10x pull
  const tenPull = executeDroneGachaPull(10, [], 0, 0);
  assert.equal(tenPull.results.length, 10);
  assert.equal(tenPull.totalGemsCost, DRONE_GACHA_TEN_COST);
  // Guarantee check: at least 1 Tier A or Tier S in 10x pull
  const hasAorS = tenPull.results.some((r) => r.tier === 'A' || r.tier === 'S');
  assert.equal(hasAorS, true, '10x summon must guarantee at least one Tier A or S drone');

  // Pity S guarantee trigger
  const pitySPull = executeDroneGachaPull(1, [], 79, 0);
  assert.equal(pitySPull.results[0].tier, 'S', 'Pity S at 80 summons must force Tier S');
  assert.equal(pitySPull.newPityS, 0, 'Pity S must reset to 0 after pulling Tier S');

  // Duplicate pull compensation check
  const allDroneIds = Object.keys(DRONES);
  const duplicatePull = executeDroneGachaPull(1, allDroneIds, 79, 0);
  assert.equal(duplicatePull.results[0].isNew, false);
  assert.ok(duplicatePull.duplicateGemsGranted >= 50, 'Duplicate summon grants bonus gems');
});

test('calculateDroneEscortPosition places drones in smooth left and right rear wingman positions', () => {
  const pX = 400;
  const pY = 700;
  const leftDrone = calculateDroneEscortPosition(pX, pY, 0, 2, 0);
  const rightDrone = calculateDroneEscortPosition(pX, pY, 1, 2, 0);

  // Left drone should be to the left of the player (x < pX)
  assert.ok(leftDrone.x < pX, 'Left drone is to the left of player');
  // Right drone should be to the right of the player (x > pX)
  assert.ok(rightDrone.x > pX, 'Right drone is to the right of player');
  // Both drones should be slightly behind the player (y > pY in top-down screen coordinates)
  assert.ok(leftDrone.y > pY, 'Left drone is behind player');
  assert.ok(rightDrone.y > pY, 'Right drone is behind player');
});

test('calculateDroneEscortPosition maintains stable escort coordinates in title screen lobby coordinates', () => {
  // Title screen coordinates (center top showcase: x=width/2, y=250)
  const titleX = 300;
  const titleY = 250;
  const leftWingman = calculateDroneEscortPosition(titleX, titleY, 0, 2, 1000);
  const rightWingman = calculateDroneEscortPosition(titleX, titleY, 1, 2, 1000);

  // Escorts must remain closely tethered to the showcase fighter coordinates (not down at combat 600+)
  assert.ok(Math.abs(leftWingman.x - titleX) < 50, 'Left wingman is within 50px of fighter center');
  assert.ok(Math.abs(leftWingman.y - titleY) < 40, 'Left wingman Y stays near showcase Y');
  assert.ok(Math.abs(rightWingman.y - titleY) < 40, 'Right wingman Y stays near showcase Y');
});

test('DR-88 Thunder Spark drone has exact requested stats and RTS-88 synergy buffs', () => {
  const drone = DRONES.drone_thunder_storm_s;
  assert.ok(drone, 'drone_thunder_storm_s must exist in DRONES');
  assert.equal(drone.tier, 'S');
  assert.equal(drone.passiveSkill?.type, 'thunder_strike');
  assert.ok(drone.tagline.includes('RTS-88'));

  // Without RTS-88 (e.g. Phoenix)
  const phoenixBuffs = calculateDroneBonuses(['drone_thunder_storm_s'], 'phoenix');
  assert.equal(phoenixBuffs.armorPenPercent, drone.statBuffs.armorPenPercent);
  assert.equal(phoenixBuffs.trueDamageBonus, drone.statBuffs.trueDamageBonus);

  // With RTS-88: +80% Armor Pen and +50 True Damage synergy
  const rtsBuffs = calculateDroneBonuses(['drone_thunder_storm_s'], 'rts_88');
  assert.equal(
    rtsBuffs.armorPenPercent,
    drone.statBuffs.armorPenPercent + 80,
    'Must gain +80% Armor Penetration on RTS-88'
  );
  assert.equal(
    rtsBuffs.trueDamageBonus,
    drone.statBuffs.trueDamageBonus + 50,
    'Must gain +50 True Damage on RTS-88'
  );
});

