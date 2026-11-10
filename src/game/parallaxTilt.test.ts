import test from 'node:test';
import assert from 'node:assert/strict';
import {
normalizeOrientationAngles,
calculateShakeMagnitude,
lerpTilt,
parallaxTiltManager,
} from './parallaxTilt';

test('normalizeOrientationAngles maps gamma and beta to [-1, 1] range', () => {
  const center = normalizeOrientationAngles(0, 45);
  assert.equal(center.x, 0);
  assert.equal(center.y, 0);

  const tiltedRight = normalizeOrientationAngles(45, 45);
  assert.equal(tiltedRight.x, 1);
  assert.equal(tiltedRight.y, 0);

  const tiltedLeft = normalizeOrientationAngles(-45, 45);
  assert.equal(tiltedLeft.x, -1);
  assert.equal(tiltedLeft.y, 0);

  // Clamping test
  const extreme = normalizeOrientationAngles(90, 180);
  assert.equal(extreme.x, 1);
  assert.equal(extreme.y, 1);
});

test('calculateShakeMagnitude correctly detects accelerations over threshold', () => {
  // Low ambient motion (gravity ~9.8 m/s²)
  const normalGravity = calculateShakeMagnitude(0, 9.8, 0, 18.0);
  assert.equal(normalGravity, 0);

  // Strong phone shake
  const strongShake = calculateShakeMagnitude(15, 20, 10, 18.0);
  assert.ok(strongShake > 0.3);
  assert.ok(strongShake <= 1.0);
});

test('lerpTilt smoothly interpolates values towards target', () => {
  const result = lerpTilt(0, 10, 0.2);
  assert.equal(result, 2);

  const close = lerpTilt(9.8, 10, 0.5);
  assert.equal(close, 9.9);
});

test('parallaxTiltManager provides initial tilt state and supports manual kick', () => {
  const state = parallaxTiltManager.getState();
  assert.ok(typeof state.tiltX === 'number');
  assert.ok(typeof state.tiltY === 'number');
  assert.ok(typeof state.centrifugalX === 'number');
  assert.ok(typeof state.centrifugalY === 'number');
  assert.ok(typeof state.shakeStrength === 'number');

  parallaxTiltManager.triggerCentrifugalKick(0.5, 1, 0.5);
  const afterKick = parallaxTiltManager.getState();
  assert.ok(afterKick.shakeStrength > 0);
});
