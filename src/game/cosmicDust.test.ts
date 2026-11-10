import test from 'node:test';
import assert from 'node:assert/strict';
import { initCosmicDust,updateCosmicDust,CosmicDustMote } from './cosmicDust';

test('initCosmicDust generates required number of dust particles within bounds', () => {
  const count = 30;
  const width = 800;
  const height = 600;
  const dust = initCosmicDust(count, width, height);

  assert.equal(dust.length, count);
  for (const mote of dust) {
    assert.ok(mote.x >= 0 && mote.x <= width, `x ${mote.x} within bounds`);
    assert.ok(mote.y >= 0 && mote.y <= height, `y ${mote.y} within bounds`);
    assert.ok(mote.depth >= 0.1 && mote.depth <= 1.0, 'depth is valid');
    assert.ok(mote.size > 0, 'size is positive');
    assert.ok(mote.alpha > 0 && mote.alpha <= 1, 'alpha is valid');
    assert.ok(mote.color.length > 0, 'color is defined');
  }
});

test('updateCosmicDust moves particles downwards and updates alpha shimmer', () => {
  const dust: CosmicDustMote[] = [
    {
      x: 100,
      y: 100,
      vx: 0,
      vy: 20,
      size: 2,
      depth: 0.5,
      baseAlpha: 0.4,
      alpha: 0.4,
      pulseSpeed: 2.0,
      pulsePhase: 0,
      color: '#ffffff',
      haloColor: 'rgba(255,255,255,0.2)',
    },
  ];

  const initialY = dust[0].y;
  updateCosmicDust(dust, 0.1, 800, 600, 1.0, 0, false);

  assert.ok(dust[0].y > initialY, 'particle drifted down');
  assert.notEqual(dust[0].pulsePhase, 0, 'pulse phase updated');
});

test('updateCosmicDust wraps particles when moving off screen bottom', () => {
  const dust: CosmicDustMote[] = [
    {
      x: 100,
      y: 650, // Beyond height 600 + 15
      vx: 0,
      vy: 20,
      size: 2,
      depth: 0.5,
      baseAlpha: 0.4,
      alpha: 0.4,
      pulseSpeed: 2.0,
      pulsePhase: 0,
      color: '#ffffff',
      haloColor: 'rgba(255,255,255,0.2)',
    },
  ];

  updateCosmicDust(dust, 0.1, 800, 600, 1.0, 0, false);
  assert.ok(dust[0].y <= 0, 'wrapped back to top of screen');
});
