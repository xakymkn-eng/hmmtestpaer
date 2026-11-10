import test from 'node:test';
import assert from 'node:assert/strict';
import {
getComboBurstTier,
checkComboBurstCrossing,
checkScoreThresholdCrossing,
createComboBurstEvent
} from './comboBurst';

test('getComboBurstTier returns correct tiers across milestones', () => {
  assert.equal(getComboBurstTier(50).threshold, 50);
  assert.equal(getComboBurstTier(75).threshold, 50);
  assert.equal(getComboBurstTier(100).threshold, 100);
  assert.equal(getComboBurstTier(150).threshold, 150);
  assert.equal(getComboBurstTier(200).threshold, 200);
  assert.equal(getComboBurstTier(250).threshold, 250);
  assert.equal(getComboBurstTier(300).threshold, 300);
  assert.equal(getComboBurstTier(500).threshold, 300);
});

test('checkComboBurstCrossing correctly detects crossing 50, 100, 150 boundaries', () => {
  // Not crossed yet
  assert.equal(checkComboBurstCrossing(40, 49, 50), null);
  // Exactly hit 50
  assert.equal(checkComboBurstCrossing(49, 50, 50), 50);
  // Jumped from 48 to 52
  assert.equal(checkComboBurstCrossing(48, 52, 50), 50);
  // Incrementing while already in tier (52 to 55) -> no new crossing
  assert.equal(checkComboBurstCrossing(52, 55, 50), null);
  // Crossing from 99 to 101 -> crosses 100
  assert.equal(checkComboBurstCrossing(99, 101, 50), 100);
  // Combo reset -> no crossing
  assert.equal(checkComboBurstCrossing(100, 1, 50), null);
});

test('checkScoreThresholdCrossing detects crossings for major score milestones', () => {
  assert.equal(checkScoreThresholdCrossing(45_000, 49_999), null);
  assert.equal(checkScoreThresholdCrossing(45_000, 50_000), 50_000);
  assert.equal(checkScoreThresholdCrossing(50_000, 75_000), null);
  assert.equal(checkScoreThresholdCrossing(99_500, 100_200), 100_000);
  assert.equal(checkScoreThresholdCrossing(950_000, 1_000_500), 1_000_000);
});

test('createComboBurstEvent populates full cosmetic data for UI rendering', () => {
  const comboEvent = createComboBurstEvent(100, 'combo', 3.5);
  assert.equal(comboEvent.type, 'combo');
  assert.equal(comboEvent.threshold, 100);
  assert.ok(comboEvent.vietnameseTitle.includes('100x'));
  assert.ok(comboEvent.multiplierText.includes('3.5x'));
  assert.ok(comboEvent.borderClass.length > 0);

  const scoreEvent = createComboBurstEvent(100_000, 'score', 2.0);
  assert.equal(scoreEvent.type, 'score');
  assert.equal(scoreEvent.threshold, 100_000);
  assert.ok(scoreEvent.vietnameseTitle.includes('100,000'));
});
