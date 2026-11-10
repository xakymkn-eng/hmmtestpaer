import test from 'node:test';
import assert from 'node:assert/strict';
import {
UNIVERSES,
TOTAL_UNIVERSES_COUNT,
UNIVERSE_CLUSTERS,
UNIVERSE_MILESTONES,getInitialUniverseProgress,
getUniverseById,
getClusterById,
getUniversesByCluster,
updateUniverseConquestProgress,getMilestoneStatuses,
getClusterCentroid,
clampMapZoom,
calculatePanOffsetForTarget
} from './universe';

test('Universe system defines 80 distinct universes plus Central Black Hole across clusters', () => {
  assert.equal(UNIVERSES.length, 81); // 80 universes + 1 Central Black Hole (id: 0)
  assert.equal(TOTAL_UNIVERSES_COUNT, 80);
  assert.equal(UNIVERSE_CLUSTERS.length, 11);

  const ids = new Set<number>();
  UNIVERSES.forEach((u) => {
    assert.ok(u.id >= 0 && u.id <= 80);
    assert.ok(!ids.has(u.id), `Duplicate universe ID ${u.id}`);
    ids.add(u.id);

    assert.ok(u.name.length > 0);
    assert.ok(u.vietnameseTitle.length > 0);
    assert.ok(u.bossName.length > 0);
    assert.ok(u.dangerRating >= 1);
    assert.ok(u.recommendedStars >= 1 && u.recommendedStars <= 6);
    assert.ok(u.recommendedCombatPower >= 1000);
    assert.ok(u.rewardGold >= 100000);
    assert.ok(u.firstClearGems >= 150);
    assert.ok(u.firstClearShards.count >= 10);
    assert.ok(u.hazard && u.hazard.name.length > 0);
    assert.ok(u.totalWaves >= 3);
    // Spatial coordinates check: 0 <= x, y <= 100
    assert.ok(u.nodeX >= 0 && u.nodeX <= 100);
    assert.ok(u.nodeY >= 0 && u.nodeY <= 100);
  });
});

test('Central Supermassive Black Hole is positioned exactly at galaxy center (50, 50)', () => {
  const bh = getUniverseById(0);
  assert.ok(bh);
  assert.equal(bh.id, 0);
  assert.equal(bh.isBlackHole, true);
  assert.equal(bh.nodeX, 50);
  assert.equal(bh.nodeY, 50);
  assert.equal(bh.bossName, 'Chúa Tể Hố Đen · Event Horizon Singularity');
});

test('Cluster helper functions retrieve correct clusters and universes', () => {
  const c0 = getClusterById(0);
  assert.ok(c0);
  assert.equal(c0.name, 'Tâm Chấn Vũ Trụ');

  const c1 = getClusterById(1);
  assert.ok(c1);
  assert.equal(c1.name, 'Cụm 1: Khởi Nguyên');

  const uCluster1 = getUniversesByCluster(1);
  assert.equal(uCluster1.length, 8);
  assert.equal(uCluster1[0].id, 1);
  assert.equal(uCluster1[7].id, 8);

  const uCluster5 = getUniversesByCluster(5);
  assert.equal(uCluster5.length, 8);
  assert.equal(uCluster5[0].id, 33);
  assert.equal(uCluster5[7].id, 40);

  const uCluster10 = getUniversesByCluster(10);
  assert.equal(uCluster10.length, 8);
  assert.equal(uCluster10[0].id, 73);
  assert.equal(uCluster10[7].id, 80);
});

test('getInitialUniverseProgress returns 81 entries (0..80) with 0% progress', () => {
  const init = getInitialUniverseProgress();
  assert.equal(Object.keys(init).length, 81);
  for (let i = 0; i <= 80; i++) {
    assert.equal(init[i], 0);
  }
});

test('getUniverseById retrieves universe by ID or returns undefined', () => {
  const u1 = getUniverseById(1);
  assert.ok(u1);
  assert.equal(u1.name, 'Vũ Trụ 01: Tinh Vân Orion');
  assert.equal(u1.hazard.name, 'Bão Bụi Lượng Tử');

  const u40 = getUniverseById(40);
  assert.ok(u40);
  assert.equal(u40.name, 'Vũ Trụ 40: Ranh Giới Hư Vô Tột Cùng');

  const u80 = getUniverseById(80);
  assert.ok(u80);
  assert.equal(u80.name, 'Vũ Trụ 80: Tuyệt Đối Vĩnh Hằng Genesis-Omega');

  assert.equal(getUniverseById(999), undefined);
});

test('updateUniverseConquestProgress properly scales progress and detects 100% conquest', () => {
  const init = getInitialUniverseProgress();

  // Wave 1 reached (1 / 5 waves) -> 20%
  const step1 = updateUniverseConquestProgress(init, 1, 1, false);
  assert.equal(step1.oldPercent, 0);
  assert.equal(step1.newPercent, 20);
  assert.equal(step1.newlyConquered, false);

  // Wave 3 reached (3 / 5 waves) -> 60%
  const step2 = updateUniverseConquestProgress(step1.updatedMap, 1, 3, false);
  assert.equal(step2.oldPercent, 20);
  assert.equal(step2.newPercent, 60);
  assert.equal(step2.newlyConquered, false);

  // Partial lower wave does not regress progress
  const stepRegress = updateUniverseConquestProgress(step2.updatedMap, 1, 2, false);
  assert.equal(stepRegress.newPercent, 60);

  // Wave 5 or isVictory -> 100% conquest
  const stepFinal = updateUniverseConquestProgress(step2.updatedMap, 1, 5, true);
  assert.equal(stepFinal.newPercent, 100);
  assert.equal(stepFinal.newlyConquered, true);
  assert.equal(stepFinal.conqueredCount, 1);
});

test('Milestone logic validates milestones at 5, 10, 20, 30, 40, 50, 60, 70, and 80 conquests', () => {
  assert.equal(UNIVERSE_MILESTONES.length, 9);
  assert.deepEqual(
    UNIVERSE_MILESTONES.map((m) => m.requiredConquered),
    [5, 10, 20, 30, 40, 50, 60, 70, 80]
  );

  const statuses = getMilestoneStatuses(15, [1]);
  assert.equal(statuses[0].isUnlocked, true);
  assert.equal(statuses[0].isClaimed, true);
  assert.equal(statuses[1].isUnlocked, true);
  assert.equal(statuses[1].isClaimed, false);
  assert.equal(statuses[2].isUnlocked, false);
});

test('getClusterCentroid computes valid center coordinates for all clusters and Central Black Hole', () => {
  const bhCentroid = getClusterCentroid(0);
  assert.deepEqual(bhCentroid, { x: 50, y: 50 });

  for (let c = 1; c <= 10; c++) {
    const centroid = getClusterCentroid(c);
    assert.ok(centroid.x > 0 && centroid.x < 100);
    assert.ok(centroid.y > 0 && centroid.y < 100);
  }
});

test('clampMapZoom ensures zoom levels stay between minimum 0.45x and maximum 3.2x', () => {
  assert.equal(clampMapZoom(0.1), 0.45);
  assert.equal(clampMapZoom(0.45), 0.45);
  assert.equal(clampMapZoom(1.0), 1.0);
  assert.equal(clampMapZoom(2.5), 2.5);
  assert.equal(clampMapZoom(5.0), 3.2);
});

test('calculatePanOffsetForTarget centers canvas coordinates accurately', () => {
  // Center of canvas (50%, 50%) with zoom 1 produces 0 offset
  const centerOffset = calculatePanOffsetForTarget(50, 50, 1400, 900, 1);
  assert.equal(centerOffset.x, 0);
  assert.equal(centerOffset.y, 0);

  // Target to the right (75%, 50%) requires negative panX to pull it to center
  const rightOffset = calculatePanOffsetForTarget(75, 50, 1400, 900, 1);
  assert.ok(rightOffset.x < 0);
  assert.equal(rightOffset.y, 0);
});

