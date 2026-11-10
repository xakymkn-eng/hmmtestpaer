import { describe,it } from 'node:test';
import assert from 'node:assert/strict';
import {
drawChickenInvader,
drawChickenBoss,
drawEggBullet,
drawDrumstickPickup,
} from './chickenRenderer';

describe('Chicken Invaders 4 Renderer Module', () => {
  it('exports all drawing functions', () => {
    assert.equal(typeof drawChickenInvader, 'function');
    assert.equal(typeof drawChickenBoss, 'function');
    assert.equal(typeof drawEggBullet, 'function');
    assert.equal(typeof drawDrumstickPickup, 'function');
  });

  it('runs safely on a mock 2D canvas context for invader, bosses and pickups', () => {
    const operations: string[] = [];
    const mockCtx = new Proxy({} as CanvasRenderingContext2D, {
      get(_target, prop) {
        if (prop === 'canvas') return { width: 800, height: 600 };
        return (...args: unknown[]) => {
          operations.push(String(prop));
          return null;
        };
      },
      set(_target, prop, value) {
        operations.push(`set_${String(prop)}`);
        return true;
      },
    });

    // Test invader drawing
    drawChickenInvader(mockCtx, {
      id: 1,
      type: 'scout',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      width: 32,
      height: 32,
      radius: 16,
      hp: 100,
      maxHp: 100,
      color: '#fffbeb',
      shootTimer: 0,
      shootCooldown: 2,
      timeAlive: 1.5,
      phase: 1,
      telegraphTimer: 0,
      telegraphAimX: 0,
      telegraphAimY: 0,
      hitFlashTimer: 0,
      isChickenInvader: true,
      chickenVariant: 1,
    });

    assert.ok(operations.includes('save'));
    assert.ok(operations.includes('ellipse'));
    assert.ok(operations.includes('restore'));

    // Test drumstick pickup
    drawDrumstickPickup(mockCtx, {
      id: 99,
      type: 'drumstick',
      x: 50,
      y: 50,
      vy: 100,
      radius: 14,
      value: 500,
      color: '#fbbf24',
      icon: '🍗',
      label: 'ĐÙI GÀ',
      angle: 0,
      bobOffset: 0,
    });

    // Test egg bullet
    drawEggBullet(mockCtx, {
      id: 5,
      x: 100,
      y: 100,
      vx: 0,
      vy: 200,
      radius: 8,
      damage: 15,
      isPlayer: false,
      color: '#fffbeb',
      isEggBullet: true,
      eggRotation: 0.5,
    });

    // Test all 20 bosses shapes without throwing
    const shapes = [
      'robo_chicken',
      'blizzard_hen',
      'vampire_rooster',
      'tesla_mother',
      'bio_venom_gallus',
      'atomic_egg',
      'golden_sultan',
      'void_phantom',
      'kraken_calamari',
      'gatling_eggomatic',
      'magma_inferno',
      'prismatic_crystal',
      'toxic_methane',
      'chronos_multi',
      'dreadnought_hen',
      'cyborg_scrappy',
      'strobe_beacon',
      'binary_twin',
      'imperial_general',
      'supreme_emperor',
    ] as const;

    for (const s of shapes) {
      drawChickenBoss(mockCtx, {
        id: 100,
        type: 'boss',
        x: 200,
        y: 200,
        vx: 0,
        vy: 0,
        width: 100,
        height: 100,
        radius: 55,
        hp: 3000,
        maxHp: 3000,
        color: '#f8fafc',
        shootTimer: 0,
        shootCooldown: 1,
        timeAlive: 2,
        phase: 1,
        telegraphTimer: 0,
        telegraphAimX: 0,
        telegraphAimY: 0,
        hitFlashTimer: 0,
        adventureBossShape: s,
      });
    }

    assert.ok(operations.length > 200);
  });
});
