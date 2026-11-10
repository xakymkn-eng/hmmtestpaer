import test from 'node:test';
import assert from 'node:assert/strict';
import {
initFreeFlightState,
updateFreeFlightPhysics,
getClosestLandmark,
CELESTIAL_LANDMARKS,
GALAXY_WORLD_WIDTH,
GALAXY_WORLD_HEIGHT,
GALAXY_THEMES,
} from './freeFlight';

test('initFreeFlightState initializes player near galactic center with full energy', () => {
  const state = initFreeFlightState();
  assert.equal(state.x, 3000);
  assert.equal(state.y, 3350);
  assert.equal(state.boostEnergy, 100);
  assert.equal(state.isBoosting, false);
  assert.equal(state.isPhotoMode, false);
});

test('CELESTIAL_LANDMARKS defines 6 distinct cosmic wonders in the galaxy', () => {
  assert.equal(CELESTIAL_LANDMARKS.length, 6);
  CELESTIAL_LANDMARKS.forEach((lm) => {
    assert.ok(lm.name.length > 0);
    assert.ok(lm.x >= 0 && lm.x <= GALAXY_WORLD_WIDTH);
    assert.ok(lm.y >= 0 && lm.y <= GALAXY_WORLD_HEIGHT);
    assert.ok(lm.radius > 100);
  });
});

test('updateFreeFlightPhysics moves player, turns towards input, and consumes boost', () => {
  const init = initFreeFlightState();

  // Test cruise movement to the right
  const moved = updateFreeFlightPhysics(init, { moveX: 1, moveY: 0, isBoosting: false }, 0.1, 300);
  assert.ok(moved.x > init.x || moved.vx > 0);
  assert.equal(moved.isBoosting, false);

  // Test boost acceleration
  const boosted = updateFreeFlightPhysics(init, { moveX: 0, moveY: -1, isBoosting: true }, 0.1, 300);
  assert.equal(boosted.isBoosting, true);
  assert.ok(boosted.boostEnergy < 100);
  assert.ok(boosted.boostMultiplier > 2.0);
});

test('getClosestLandmark accurately detects proximity to galactic core at (3000, 3000)', () => {
  const nearCore = getClosestLandmark(3020, 3010);
  assert.equal(nearCore.landmark.id, 'galactic_core');
  assert.ok(nearCore.distance < 50);

  const nearSaturn = getClosestLandmark(4590, 1510);
  assert.equal(nearSaturn.landmark.id, 'saturn_prime');
  assert.ok(nearSaturn.distance < 30);
});

test('GALAXY_THEMES provides 5 distinctive atmospheric nebula themes', () => {
  assert.equal(GALAXY_THEMES.length, 5);
  GALAXY_THEMES.forEach((t) => {
    assert.ok(t.name.length > 0);
    assert.ok(t.starColors.length >= 3);
  });
});
