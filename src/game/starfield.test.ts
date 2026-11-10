import test from 'node:test';
import assert from 'node:assert/strict';
import {
normalizeMouseCoordinates,
calculateParallaxOffset,
lerp,
calculateTiltTransform,
initStarfield,
updateStar,
getCelestialPlanetForSector,
calculateLogarithmicSpiralPoint,
initMicroDust,
updateMicroDust,
initFastPassingStars,
updateFastPassingStar,
} from './starfield';

test('normalizeMouseCoordinates maps viewport correctly to [-1, 1]', () => {
  const center = normalizeMouseCoordinates(500, 300, 1000, 600);
  assert.equal(Math.abs(center.x) < 0.001, true);
  assert.equal(Math.abs(center.y) < 0.001, true);

  const topLeft = normalizeMouseCoordinates(0, 0, 1000, 600);
  assert.equal(topLeft.x, -1);
  assert.equal(topLeft.y, -1);

  const bottomRight = normalizeMouseCoordinates(1000, 600, 1000, 600);
  assert.equal(bottomRight.x, 1);
  assert.equal(bottomRight.y, 1);

  // Clamps out-of-bound coordinates
  const outOfBounds = normalizeMouseCoordinates(2000, -500, 1000, 600);
  assert.equal(outOfBounds.x, 1);
  assert.equal(outOfBounds.y, -1);
});

test('calculateParallaxOffset scales with depth layer', () => {
  const far = calculateParallaxOffset(1.0, 0.5, 0.2, 50);
  assert.equal(far.offsetX, 1.0 * 0.2 * 50); // 10
  assert.equal(far.offsetY, 0.5 * 0.2 * 50); // 5

  const near = calculateParallaxOffset(1.0, 0.5, 1.0, 50);
  assert.equal(near.offsetX, 50);
  assert.equal(near.offsetY, 25);
  assert.ok(near.offsetX > far.offsetX);
});

test('lerp accurately computes weighted interpolations', () => {
  assert.equal(lerp(0, 100, 0.5), 50);
  assert.equal(lerp(10, 20, 0), 10);
  assert.equal(lerp(10, 20, 1), 20);
});

test('calculateTiltTransform produces smooth perspective angles', () => {
  const tilt = calculateTiltTransform(0.5, -0.5, 6);
  assert.equal(tilt.rotateY, 3);
  assert.equal(tilt.rotateX, 3);
});

test('initStarfield generates requested particle count and layers', () => {
  const stars = initStarfield(60, 800, 600);
  assert.equal(stars.length, 60);
  assert.ok(stars[0].depth >= 0.15 && stars[0].depth <= 1.0);
  assert.ok(stars[0].x >= 0 && stars[0].x <= 800);
  assert.ok(stars[0].y >= 0 && stars[0].y <= 600);
});

test('updateStar advances vertical motion and wraps at bounds', () => {
  const stars = initStarfield(5, 500, 500);
  const s = stars[0];
  const initialY = s.y;
  updateStar(s, 0.1, 500, 500);
  assert.notEqual(s.y, initialY);

  // Wrap test
  s.y = 600;
  updateStar(s, 0.1, 500, 500);
  assert.equal(s.y, -20);
});

test('getCelestialPlanetForSector returns valid planets across all 5 sectors', () => {
  const p1 = getCelestialPlanetForSector(1);
  assert.ok(p1 && p1.name && p1.radius > 50);
  assert.equal(p1.hasRings, true);

  const p2 = getCelestialPlanetForSector(2);
  assert.ok(p2 && p2.baseColor.includes('#0891b2'));

  const p3 = getCelestialPlanetForSector(3);
  assert.ok(p3 && p3.radius > 90);

  const p4 = getCelestialPlanetForSector(4);
  assert.ok(p4 && p4.atmosphereColor.includes('192, 132, 252'));

  const p5 = getCelestialPlanetForSector(5);
  assert.ok(p5 && p5.hasRings && p5.hasMoon);
});

test('calculateLogarithmicSpiralPoint computes accurate spiral arm coordinates', () => {
  const pt0 = calculateLogarithmicSpiralPoint(0, 0, 3.0, 10, 200);
  assert.ok(pt0.dist >= 10);
  const pt1 = calculateLogarithmicSpiralPoint(0, 1.0, 3.0, 10, 200);
  assert.ok(pt1.dist >= 200);
  assert.ok(pt1.angle > pt0.angle);
});

test('initMicroDust and updateMicroDust work deterministically', () => {
  const palette = ['#ffffff', '#38bdf8'];
  const dust = initMicroDust(20, 800, 600, palette);
  assert.equal(dust.length, 20);
  assert.ok(dust[0].x >= 0 && dust[0].x <= 800);

  const d0 = dust[0];
  const oldX = d0.x;
  updateMicroDust(d0, 0.1, 800, 600, 1.0);
  assert.notEqual(d0.x, oldX);

  // Wrap around
  d0.x = 850;
  updateMicroDust(d0, 0.1, 800, 600, 1.0);
  assert.equal(d0.x, -20);
});

test('initFastPassingStars and updateFastPassingStar advance stars downwards', () => {
  const stars = initFastPassingStars(15, 800, 600);
  assert.equal(stars.length, 15);
  const s0 = stars[0];
  const oldY = s0.y;
  updateFastPassingStar(s0, 0.1, 800, 600);
  assert.ok(s0.y > oldY);

  s0.y = 700;
  updateFastPassingStar(s0, 0.1, 800, 600);
  assert.equal(s0.y, -50);
});


