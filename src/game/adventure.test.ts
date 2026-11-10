import test from 'node:test';
import assert from 'node:assert/strict';
import {
ADVENTURE_STAGES,
getInitialAdventureProgress,
getAdventureStageById,
completeAdventureStage,
calculateStageStars,
} from './adventure';

test('ADVENTURE_STAGES contains exactly 20 progressive destinations', () => {
  assert.equal(ADVENTURE_STAGES.length, 20);
  for (let i = 0; i < 20; i++) {
    const stage = ADVENTURE_STAGES[i];
    assert.equal(stage.id, i + 1, `Stage ID matches sequence ${i + 1}`);
    assert.ok(stage.name.length > 0, `Stage ${stage.id} has valid name`);
    assert.ok(stage.galaxyName.length > 0, `Stage ${stage.id} has galaxyName`);
    assert.ok(stage.boss.id.length > 0, `Stage ${stage.id} has boss ID`);
    assert.ok(stage.boss.hp > 0, `Stage ${stage.id} boss has positive HP`);
    assert.ok(stage.rewardGold > 0, `Stage ${stage.id} rewards Gold`);
    assert.ok(stage.rewardGems > 0, `Stage ${stage.id} rewards Gems`);
  }
});

test('Stage 1 is unlocked initially and completing it unlocks stage 2', () => {
  const init = getInitialAdventureProgress();
  assert.deepEqual(init.unlockedStages, [1]);
  assert.deepEqual(init.completedStages, []);
  assert.equal(init.totalStars, 0);

  // Complete stage 1 with 100% HP and 0 revives -> 3 stars
  const res = completeAdventureStage(init, 1, 50000, 1.0, 0);
  assert.equal(res.starsEarned, 3);
  assert.equal(res.firstClear, true);
  assert.ok(res.nextProgress.unlockedStages.includes(2), 'Stage 2 unlocked');
  assert.ok(res.nextProgress.completedStages.includes(1), 'Stage 1 marked completed');
  assert.equal(res.nextProgress.stageStars[1], 3);
  assert.equal(res.nextProgress.totalStars, 3);
});

test('calculateStageStars awards 1, 2, or 3 stars based on HP and revives', () => {
  assert.equal(calculateStageStars(0.9, 0), 3, 'Flawless run earns 3 stars');
  assert.equal(calculateStageStars(0.9, 1), 2, 'Run with revive caps at 2 stars');
  assert.equal(calculateStageStars(0.6, 0), 2, 'Medium HP earns 2 stars');
  assert.equal(calculateStageStars(0.3, 0), 1, 'Low HP earns 1 star');
});

test('getAdventureStageById returns correct stage or fallback to stage 1', () => {
  const s1 = getAdventureStageById(1);
  assert.equal(s1.id, 1);
  const s20 = getAdventureStageById(20);
  assert.equal(s20.id, 20);
  assert.equal(s20.boss.shapeType, 'supreme_emperor');

  const fallback = getAdventureStageById(999);
  assert.equal(fallback.id, 1);
});
