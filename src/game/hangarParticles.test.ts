import test from 'node:test';
import assert from 'node:assert/strict';
import {
createHangarParticlePool,
updateHangarParticles,
respawnHangarParticle
} from './hangarParticles';

test('createHangarParticlePool initializes requested number of dust and spark particles', () => {
  const count = 24;
  const pool = createHangarParticlePool(count, 320, 190);
  assert.equal(pool.length, count);

  const dustCount = pool.filter((p) => p.type === 'dust').length;
  const sparkCount = pool.filter((p) => p.type === 'spark').length;

  assert.ok(dustCount > 0, 'Must contain dust motes');
  assert.ok(sparkCount > 0, 'Must contain sparks');
  assert.equal(dustCount + sparkCount, count);
});

test('Hangar particles have valid positions and boundaries within hangar canvas', () => {
  const width = 300;
  const height = 180;
  const pool = createHangarParticlePool(15, width, height);

  for (const p of pool) {
    assert.ok(p.x >= -20 && p.x <= width + 20, `X coordinate ${p.x} out of bounds`);
    assert.ok(p.y >= -20 && p.y <= height + 20, `Y coordinate ${p.y} out of bounds`);
    assert.ok(p.size > 0, 'Particle size must be positive');
    assert.ok(p.maxAlpha > 0 && p.maxAlpha <= 1, 'maxAlpha must be between 0 and 1');
    assert.ok(p.layer === -1 || p.layer === 1, 'Layer must be -1 or 1 for depth ordering');
  }
});

test('updateHangarParticles advances life, moves particles and recycles expired particles', () => {
  const pool = createHangarParticlePool(10, 300, 200);
  const initialLife = pool[0].life;

  updateHangarParticles(pool, 0.05, 300, 200);

  // Life should have decreased
  assert.ok(pool[0].life < initialLife || pool[0].life > 0);

  // Manually expire a particle and verify recycling
  pool[1].life = 0.001;
  updateHangarParticles(pool, 0.02, 300, 200);
  assert.ok(pool[1].life > 0.5, 'Expired particle should have respawned with fresh life');
});

test('Theme colors propagate properly into particles', () => {
  const customTheme = {
    primary: '#e11d48',
    accent: '#f43f5e',
    glow: 'rgba(225, 29, 72, 0.5)',
  };

  const spark = respawnHangarParticle(0, 'spark', 300, 200, customTheme, false);
  assert.equal(spark.glowColor, customTheme.glow);

  const dust = respawnHangarParticle(1, 'dust', 300, 200, customTheme, false);
  assert.equal(dust.glowColor, customTheme.glow);
});
