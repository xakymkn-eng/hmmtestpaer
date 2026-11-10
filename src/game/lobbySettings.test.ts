/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
SCENERY_CONFIGS,
ALL_SCENERIES,
BLACK_HOLE_VARIANTS,
validateGraphicsQuality,
validateFpsTarget,
validateSceneryType,
getNextScenery,
getGraphicsSpecs
} from './lobbySettings';

test('SCENERY_CONFIGS includes galaxy, deep_space, nebula, aeon_bay, and multiple black holes', () => {
  assert.ok(SCENERY_CONFIGS.galaxy);
  assert.ok(SCENERY_CONFIGS.deep_space);
  assert.ok(SCENERY_CONFIGS.nebula);
  assert.ok(SCENERY_CONFIGS.aeon_bay);
  assert.ok(SCENERY_CONFIGS.black_hole_gold);
  assert.ok(SCENERY_CONFIGS.black_hole_crimson);
  assert.ok(SCENERY_CONFIGS.black_hole_violet);
  assert.ok(SCENERY_CONFIGS.black_hole_cyan);
  assert.ok(SCENERY_CONFIGS.black_hole_emerald);
  assert.ok(SCENERY_CONFIGS.black_hole_prismatic);
  assert.equal(ALL_SCENERIES.length >= 10, true);
});

test('Black hole variants has at least 6 distinct colors', () => {
  assert.equal(BLACK_HOLE_VARIANTS.length, 6);
  const colors = BLACK_HOLE_VARIANTS.map((b) => b.blackHoleColor);
  assert.deepEqual(colors, ['gold', 'crimson', 'violet', 'cyan', 'emerald', 'prismatic']);
});

test('validateGraphicsQuality handles invalid inputs safely and supports ultra', () => {
  assert.equal(validateGraphicsQuality('low'), 'low');
  assert.equal(validateGraphicsQuality('medium'), 'medium');
  assert.equal(validateGraphicsQuality('high'), 'high');
  assert.equal(validateGraphicsQuality('ultra'), 'ultra');
  assert.equal(validateGraphicsQuality('super_fake'), 'high');
  assert.equal(validateGraphicsQuality(null), 'high');
});

test('validateFpsTarget handles 30, 60, 120 and defaults to 60', () => {
  assert.equal(validateFpsTarget(30), 30);
  assert.equal(validateFpsTarget(60), 60);
  assert.equal(validateFpsTarget(120), 120);
  assert.equal(validateFpsTarget(999), 60);
  assert.equal(validateFpsTarget(undefined), 60);
});

test('validateSceneryType handles valid and unknown sceneries', () => {
  assert.equal(validateSceneryType('aeon_bay'), 'aeon_bay');
  assert.equal(validateSceneryType('black_hole_emerald'), 'black_hole_emerald');
  assert.equal(validateSceneryType('random_fake'), 'galaxy');
});

test('getNextScenery cycles cleanly through all sceneries', () => {
  const nextFromGalaxy = getNextScenery('galaxy');
  assert.equal(nextFromGalaxy, 'deep_space');
  const nextFromPrismatic = getNextScenery('black_hole_prismatic');
  assert.equal(nextFromPrismatic, 'galaxy'); // Loops back to start
});

test('getGraphicsSpecs returns correct parameters for low, medium, high, and ultra', () => {
  const low = getGraphicsSpecs('low');
  assert.equal(low.starCount, 65);
  assert.equal(low.enableHighDpr, false);
  assert.equal(low.enableShootingStars, false);
  assert.equal(low.enableCentrifugal, false);
  assert.equal(low.enableBloom, false);
  assert.equal(low.shadowQuality, 'none');

  const med = getGraphicsSpecs('medium');
  assert.equal(med.enableCentrifugal, true);
  assert.equal(med.shadowQuality, 'soft');

  const high = getGraphicsSpecs('high');
  assert.equal(high.starCount, 230);
  assert.equal(high.enableHighDpr, true);
  assert.equal(high.enableShootingStars, true);
  assert.equal(high.enableBloom, true);
  assert.equal(high.enableGodRays, true);
  assert.equal(high.shadowQuality, 'strong');

  const ultra = getGraphicsSpecs('ultra');
  assert.equal(ultra.starCount, 380);
  assert.equal(ultra.enableHighDpr, true);
  assert.equal(ultra.enableBloom, true);
  assert.equal(ultra.bloomIntensity, 'ultra');
  assert.equal(ultra.enableGodRays, true);
  assert.equal(ultra.godRayIntensity, 'ultra');
  assert.equal(ultra.enableCosmicWind, true);
  assert.equal(ultra.enablePassingFastStars, true);
  assert.equal(ultra.shadowQuality, 'ultra');
});
