import test from 'node:test';
import assert from 'node:assert/strict';
import {
drawVillainFlagshipBoss,
drawVillainRazorScout,
drawAlienMantisHunter,
drawVillainObsidianCruiser,
drawAlienBioRavager,
drawVillainNightWraith,
drawAlienHiveBroodmother,
drawVillainSiegeFortress,
drawAlienVoidJellyfish,
drawVillainAegisDrone,
drawVillainMissileFrigate,
drawAlienBioMine,
} from './alienAndVillainRenderer';

function createMockCtx(): CanvasRenderingContext2D {
  const operations: string[] = [];
  const mockGradient = {
    addColorStop: () => {},
  };

  return {
    save: () => operations.push('save'),
    restore: () => operations.push('restore'),
    beginPath: () => operations.push('beginPath'),
    closePath: () => operations.push('closePath'),
    moveTo: () => operations.push('moveTo'),
    lineTo: () => operations.push('lineTo'),
    quadraticCurveTo: () => operations.push('quadraticCurveTo'),
    arc: () => operations.push('arc'),
    ellipse: () => operations.push('ellipse'),
    fill: () => operations.push('fill'),
    stroke: () => operations.push('stroke'),
    fillRect: () => operations.push('fillRect'),
    strokeRect: () => operations.push('strokeRect'),
    rotate: () => operations.push('rotate'),
    translate: () => operations.push('translate'),
    createLinearGradient: () => mockGradient as unknown as CanvasGradient,
    createRadialGradient: () => mockGradient as unknown as CanvasGradient,
    setLineDash: () => {},
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
  } as unknown as CanvasRenderingContext2D;
}

test('drawVillainFlagshipBoss renders without throwing and draws fuselage and reactor', () => {
  const ctx = createMockCtx();
  assert.doesNotThrow(() => {
    drawVillainFlagshipBoss(ctx, 1.5, false, true, 2);
  });
});

test('drawVillainRazorScout renders aggressive delta wing geometry', () => {
  const ctx = createMockCtx();
  assert.doesNotThrow(() => {
    drawVillainRazorScout(ctx, false, '#ef4444');
  });
});

test('drawAlienMantisHunter renders bio-wings, scythes, and multi-eyes', () => {
  const ctx = createMockCtx();
  assert.doesNotThrow(() => {
    drawAlienMantisHunter(ctx, 2.0, false);
  });
});

test('All villain aircraft and alien monster renderers execute successfully', () => {
  const ctx = createMockCtx();
  assert.doesNotThrow(() => {
    drawVillainObsidianCruiser(ctx, false);
    drawAlienBioRavager(ctx, 1.2, false);
    drawVillainNightWraith(ctx, false);
    drawAlienHiveBroodmother(ctx, 3.4, false);
    drawVillainSiegeFortress(ctx, false);
    drawAlienVoidJellyfish(ctx, 0.8, false);
    drawVillainAegisDrone(ctx, 1.0, false);
    drawVillainMissileFrigate(ctx, false);
    drawAlienBioMine(ctx, 2.5, false);
  });
});
